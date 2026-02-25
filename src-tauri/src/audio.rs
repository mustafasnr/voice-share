use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use crate::models::{AudioDevice, AudioPacket};
use anyhow::{anyhow, Result};
use std::sync::{Arc, Mutex, mpsc};
use std::time::{SystemTime, UNIX_EPOCH};

pub struct CaptureEngine {
    stop_tx: Option<mpsc::Sender<()>>,
}

impl CaptureEngine {
    pub fn new() -> Result<Self> {
        Ok(Self {
            stop_tx: None,
        })
    }

    pub fn start_capture<F>(&mut self, device_name: String, mut on_packet: F) -> Result<()> 
    where F: FnMut(AudioPacket) + Send + 'static 
    {
        let (stop_tx, stop_rx) = mpsc::channel();
        let (res_tx, res_rx) = mpsc::channel();
        
        std::thread::spawn(move || {
            let host = cpal::default_host();
            let init_result = (|| -> Result<cpal::Stream> {
                let mut devices = host.input_devices()?.into_iter().chain(host.output_devices()?);
                let device = devices
                    .find(|d| d.name().map(|n| n == device_name).unwrap_or(false))
                    .ok_or_else(|| anyhow!("Device not found"))?;

                let config = device.default_input_config().or_else(|_| device.default_output_config())?;
                let mut sequence: u16 = 0;

                let stream = device.build_input_stream(
                    &config.into(),
                    move |data: &[f32], _: &cpal::InputCallbackInfo| {
                        let timestamp = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_micros() as u64;
                        
                        let bytes: Vec<u8> = data.iter()
                            .map(|&f| {
                                let sample = (f.clamp(-1.0, 1.0) * 32767.0) as i16;
                                sample.to_le_bytes()
                            })
                            .flatten()
                            .collect();

                        on_packet(AudioPacket {
                            sequence,
                            timestamp,
                            data: bytes,
                        });
                        sequence = sequence.wrapping_add(1);
                    },
                    |err| eprintln!("Capture error: {}", err),
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

        // Wait for initialization
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

pub struct PlaybackEngine {
    producer: Arc<Mutex<ringbuf::Producer<f32, Arc<ringbuf::HeapRb<f32>>>>>,
    stop_tx: Option<mpsc::Sender<()>>,
}

impl PlaybackEngine {
    pub fn new(sample_rate: u32, channels: u8) -> Result<Self> {
        let rb = ringbuf::HeapRb::<f32>::new(sample_rate as usize * channels as usize * 4);
        let (prod, _cons) = rb.split();
        
        // We'll actually recreate the rb in start_playback or manage it via Arc
        // But for simplicity in this handle-based design:
        Ok(Self {
            producer: Arc::new(Mutex::new(prod)), // Dummy initial producer
            stop_tx: None,
        })
    }

    pub fn push_packet(&self, packet: AudioPacket) -> Result<()> {
        let mut producer = self.producer.lock().unwrap();
        let pcm: Vec<f32> = packet.data.chunks_exact(2)
            .map(|chunk| {
                let sample = i16::from_le_bytes([chunk[0], chunk[1]]);
                sample as f32 / 32767.0
            })
            .collect();
            
        let _ = producer.push_slice(&pcm);
        Ok(())
    }

    pub fn start_playback(&mut self, device_name: String, sample_rate: u32, channels: u8) -> Result<()> {
        let (stop_tx, stop_rx) = mpsc::channel();
        let (res_tx, res_rx) = mpsc::channel();
        
        let rb = ringbuf::HeapRb::<f32>::new(sample_rate as usize * channels as usize * 4);
        let (prod, cons) = rb.split();
        self.producer = Arc::new(Mutex::new(prod));
        let consumer = Arc::new(Mutex::new(cons));

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

                let stream = device.build_output_stream(
                    &config,
                    move |data: &mut [f32], _: &cpal::OutputCallbackInfo| {
                        let mut consumer = consumer.lock().unwrap();
                        for sample in data.iter_mut() {
                            *sample = consumer.pop().unwrap_or(0.0);
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

    // Check input devices (microphones, etc.)
    if let Ok(input_devices) = host.input_devices() {
        for device in input_devices {
            if let Ok(name) = device.name() {
                let is_loopback = name.to_lowercase().contains("loopback") || 
                                  name.to_lowercase().contains("stereo mix");
                
                result.push(AudioDevice {
                    name,
                    is_loopback,
                });
            }
        }
    }

    // Check output devices for loopback (monitors, speakers)
    if let Ok(output_devices) = host.output_devices() {
        for device in output_devices {
            if let Ok(name) = device.name() {
                // If it's already in the list, skip it
                if result.iter().any(|d| d.name == name) { continue; }

                result.push(AudioDevice {
                    name,
                    is_loopback: true, // Output devices are loopback sources for capture
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
                is_loopback: false,
            });
        }
    }
    Ok(result)
}
