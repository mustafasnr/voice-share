use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use crate::models::{AudioDevice, AudioPacket};
use anyhow::{anyhow, Result};
use std::sync::{Arc, Mutex, mpsc};
use std::time::{SystemTime, UNIX_EPOCH};
use opus::{Application, Channels, Encoder, Decoder};

// Opus target sample rate
const OPUS_SAMPLE_RATE: u32 = 48000;
const FRAME_SIZE_MS: u32 = 20;

pub struct CaptureEngine {
    stop_tx: Option<mpsc::Sender<()>>,
}

impl CaptureEngine {
    pub fn new() -> Result<Self> {
        Ok(Self {
            stop_tx: None,
        })
    }

    pub fn start_capture<F>(&mut self, device_name: String, mut on_packet: F) -> Result<(u32, u8)> 
    where F: FnMut(AudioPacket) + Send + 'static 
    {
        let (stop_tx, stop_rx) = mpsc::channel();
        let (res_tx, res_rx) = mpsc::channel();
        
        std::thread::spawn(move || {
            let host = cpal::default_host();
            let init_result = (|| -> Result<(cpal::Stream, u32, u8)> {
                let mut devices = host.input_devices()?.into_iter().chain(host.output_devices()?);
                let device = devices
                    .find(|d| d.name().map(|n| n == device_name).unwrap_or(false))
                    .ok_or_else(|| anyhow!("Device not found"))?;

                let supported_config = device.default_input_config().or_else(|_| device.default_output_config())?;
                let config: cpal::StreamConfig = supported_config.into();
                
                let source_sample_rate = config.sample_rate.0 as f64;
                let source_channels = config.channels as u8;
                let opus_channels = if source_channels >= 2 { Channels::Stereo } else { Channels::Mono };
                let channel_count = if source_channels >= 2 { 2 } else { 1 };

                let mut encoder = Encoder::new(OPUS_SAMPLE_RATE, opus_channels, Application::Voip)?;
                let mut sequence: u16 = 0;
                
                let samples_per_frame = (OPUS_SAMPLE_RATE * FRAME_SIZE_MS / 1000) as usize * channel_count;
                let mut opus_buffer: Vec<f32> = Vec::with_capacity(samples_per_frame);
                
                let mut pos_fraction = 0.0;
                let step = source_sample_rate / OPUS_SAMPLE_RATE as f64;
                // Last samples for each channel to do linear interpolation
                let mut last_samples = vec![0.0f32; source_channels as usize];

                let stream = device.build_input_stream(
                    &config,
                    move |data: &[f32], _: &cpal::InputCallbackInfo| {
                        for chunk in data.chunks_exact(source_channels as usize) {
                            while pos_fraction < 1.0 {
                                // For each output channel (1 or 2)
                                for c in 0..channel_count {
                                    let src_c = c % (source_channels as usize);
                                    let current_sample = chunk[src_c];
                                    let last_sample = last_samples[src_c];
                                    let interpolated = last_sample + (current_sample - last_sample) * (pos_fraction as f32);
                                    opus_buffer.push(interpolated);
                                }
                                
                                if opus_buffer.len() >= samples_per_frame {
                                    let mut encoded = vec![0u8; 4000]; // Larger buffer for stereo
                                    match encoder.encode_float(&opus_buffer[..samples_per_frame], &mut encoded) {
                                        Ok(size) => {
                                            encoded.truncate(size);
                                            let timestamp = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_micros() as u64;
                                            let peak_level = opus_buffer.iter().fold(0.0f32, |max, &s| max.max(s.abs()));

                                            on_packet(AudioPacket {
                                                sequence,
                                                timestamp,
                                                peak_level,
                                                data: encoded,
                                            });
                                            sequence = sequence.wrapping_add(1);
                                        }
                                        Err(e) => eprintln!("Opus encode error: {}", e),
                                    }
                                    opus_buffer.clear();
                                }
                                pos_fraction += step;
                            }
                            pos_fraction -= 1.0;
                            for (c, &s) in chunk.iter().enumerate() {
                                last_samples[c] = s;
                            }
                        }
                    },
                    |err| eprintln!("Capture error: {}", err),
                    None
                )?;

                stream.play()?;
                Ok((stream, OPUS_SAMPLE_RATE, channel_count as u8))
            })();

            match init_result {
                Ok((stream, rate, ch)) => {
                    let _ = res_tx.send(Ok((rate, ch)));
                    let _ = stop_rx.recv();
                    drop(stream);
                }
                Err(e) => {
                    let _ = res_tx.send(Err(e));
                }
            }
        });

        let (rate, ch) = res_rx.recv().map_err(|e| anyhow!("Failed to receive init result: {}", e))??;
        self.stop_tx = Some(stop_tx);
        Ok((rate, ch))
    }

    pub fn stop(&mut self) {
        if let Some(tx) = self.stop_tx.take() {
            let _ = tx.send(());
        }
    }
}

pub struct PlaybackEngine {
    producer: Arc<Mutex<ringbuf::Producer<f32, Arc<ringbuf::HeapRb<f32>>>>>,
    volume: Arc<Mutex<f32>>,
    decoder: Arc<Mutex<Decoder>>,
    channels: u8,
    sample_rate: u32,
    stop_tx: Option<mpsc::Sender<()>>,
    last_sequence: Arc<Mutex<Option<u16>>>,
}

impl PlaybackEngine {
    pub fn new(sample_rate: u32, channels: u8) -> Result<Self> {
        let rb = ringbuf::HeapRb::<f32>::new(sample_rate as usize * channels as usize * 4);
        let (prod, _cons) = rb.split();
        
        let opus_channels = if channels >= 2 { Channels::Stereo } else { Channels::Mono };
        let decoder = Decoder::new(sample_rate, opus_channels)?;

        Ok(Self {
            producer: Arc::new(Mutex::new(prod)),
            volume: Arc::new(Mutex::new(1.0)),
            decoder: Arc::new(Mutex::new(decoder)),
            channels,
            sample_rate,
            stop_tx: None,
            last_sequence: Arc::new(Mutex::new(None)),
        })
    }

    fn decode_and_push(&self, data: Option<&[u8]>) -> Result<()> {
        let mut decoder = self.decoder.lock().unwrap();
        let samples_per_frame = (self.sample_rate * FRAME_SIZE_MS / 1000) as usize * self.channels as usize;
        let mut decoded = vec![0f32; samples_per_frame];
        
        let result = match data {
            Some(d) => decoder.decode_float(d, &mut decoded, false),
            None => decoder.decode_float(&[], &mut decoded, false), // PLC (Packet Loss Concealment)
        };

        match result {
            Ok(samples_per_channel) => {
                let total_samples = samples_per_channel * self.channels as usize;
                let mut producer = self.producer.lock().unwrap();
                let _ = producer.push_slice(&decoded[..total_samples]);
            }
            Err(e) => eprintln!("Opus decode error: {}", e),
        }
        Ok(())
    }

    pub fn push_packet(&self, packet: AudioPacket) -> Result<()> {
        let mut last_seq_lock = self.last_sequence.lock().unwrap();
        
        if let Some(last_seq) = *last_seq_lock {
            let diff = packet.sequence.wrapping_sub(last_seq);
            if diff > 1 && diff < 50 {
                // Kayıp paketleri (PLC) doldur
                for _ in 1..diff {
                    let _ = self.decode_and_push(None);
                }
            } else if diff == 0 || diff > 60000 {
                // Eski veya mükerrer paket, çöpe at
                return Ok(());
            }
        }
        
        *last_seq_lock = Some(packet.sequence);
        self.decode_and_push(Some(&packet.data))
    }

    pub fn set_volume(&self, volume: f32) {
        if let Ok(mut vol) = self.volume.lock() {
            *vol = volume;
        }
    }

    pub fn start_playback(&mut self, device_name: String) -> Result<()> {
        let (stop_tx, stop_rx) = mpsc::channel();
        let (res_tx, res_rx) = mpsc::channel();
        
        let rb = ringbuf::HeapRb::<f32>::new(self.sample_rate as usize * self.channels as usize * 4);
        let (prod, cons) = rb.split();
        self.producer = Arc::new(Mutex::new(prod));
        let consumer = Arc::new(Mutex::new(cons));
        let volume = self.volume.clone();
        let channels = self.channels;
        let sample_rate = self.sample_rate;

        std::thread::spawn(move || {
            let host = cpal::default_host();
            let init_result = (|| -> Result<cpal::Stream> {
                let devices = host.output_devices()?;
                let device = devices.into_iter()
                    .find(|d| d.name().map(|n| n == device_name).unwrap_or(false))
                    .ok_or_else(|| anyhow!("Device not found"))?;

                let config = cpal::StreamConfig {
                    channels: channels as u16,
                    sample_rate: cpal::SampleRate(sample_rate),
                    buffer_size: cpal::BufferSize::Default,
                };

                let mut is_prebuffering = true;
                let prebuffer_threshold = (sample_rate / 1000 * FRAME_SIZE_MS * 3 * channels as u32) as usize;

                let stream = device.build_output_stream(
                    &config,
                    move |data: &mut [f32], _: &cpal::OutputCallbackInfo| {
                        let vol = *volume.lock().unwrap();
                        let mut consumer = consumer.lock().unwrap();
                        
                        if is_prebuffering {
                            if consumer.len() >= prebuffer_threshold {
                                is_prebuffering = false;
                            } else {
                                // Tampon dolana kadar sessizlik bas
                                data.fill(0.0);
                                return;
                            }
                        }

                        if consumer.is_empty() {
                            is_prebuffering = true;
                        }

                        for sample in data.iter_mut() {
                            *sample = consumer.pop().unwrap_or(0.0) * vol;
                        }
                    },
                    |err| eprintln!("Playback error: {}", err),
                    None
                )?;

                stream.play()?;
                Ok(stream)
            })();

            match init_result {
                Ok(stream) => {
                    let _ = res_tx.send(Ok(()));
                    let _ = stop_rx.recv();
                    drop(stream);
                }
                Err(e) => {
                    let _ = res_tx.send(Err(e));
                }
            }
        });

        res_rx.recv().map_err(|e| anyhow!("Failed to receive init result: {}", e))??;
        
        self.stop_tx = Some(stop_tx);
        Ok(())
    }

    pub fn stop(&mut self) {
        if let Some(tx) = self.stop_tx.take() {
            let _ = tx.send(());
        }
    }
}

pub fn get_all_capture_devices() -> Result<Vec<AudioDevice>> {
    let host = cpal::default_host();
    let mut result = Vec::new();

    if let Ok(input_devices) = host.input_devices() {
        for device in input_devices {
            if let Ok(name) = device.name() {
                let is_output = name.to_lowercase().contains("loopback") || 
                                  name.to_lowercase().contains("stereo mix");
                
                result.push(AudioDevice {
                    name,
                    is_output,
                });
            }
        }
    }

    if let Ok(output_devices) = host.output_devices() {
        for device in output_devices {
            if let Ok(name) = device.name() {
                if result.iter().any(|d| d.name == name) { continue; }

                result.push(AudioDevice {
                    name,
                    is_output: true,
                });
            }
        }
    }

    Ok(result)
}

pub fn get_output_devices() -> Result<Vec<AudioDevice>> {
    let host = cpal::default_host();
    let devices = host.output_devices()?;
    let mut result = Vec::new();

    for device in devices {
        if let Ok(name) = device.name() {
            result.push(AudioDevice {
                name,
                is_output: true,
            });
        }
    }
    Ok(result)
}
