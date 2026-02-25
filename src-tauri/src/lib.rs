use tauri::Emitter;
mod models;
mod audio;
mod network;

use std::sync::atomic::{AtomicBool, Ordering};

use models::{AudioDevice, StreamInfo};
use std::sync::{Arc, Mutex};
use std::collections::HashMap;
use network::{DiscoveryService, AudioSender, AudioReceiver, generate_multicast_addr};
use audio::{CaptureEngine, PlaybackEngine};

pub struct AppState {
    pub discovery: Mutex<Option<DiscoveryService>>,
    pub capture: Mutex<Option<CaptureEngine>>,
    pub playbacks: Mutex<HashMap<String, Arc<Mutex<PlaybackEngine>>>>,
    pub is_streaming: Arc<AtomicBool>,
}

#[tauri::command]
fn get_input_devices() -> Result<Vec<AudioDevice>, String> {
    audio::get_all_capture_devices().map_err(|e| e.to_string())
}

#[tauri::command]
fn get_output_devices() -> Result<Vec<AudioDevice>, String> {
    audio::get_output_devices().map_err(|e| e.to_string())
}

#[tauri::command]
fn get_peers(state: tauri::State<AppState>) -> Result<Vec<StreamInfo>, String> {
    let disc = state.discovery.lock().unwrap();
    if let Some(d) = &*disc {
        d.update().map_err(|e| e.to_string())?;
        Ok(d.get_peers())
    } else {
        Ok(vec![])
    }
}

#[tauri::command]
fn init_discovery(state: tauri::State<AppState>, user_id: String) -> Result<(), String> {
    let mut disc = state.discovery.lock().unwrap();
    *disc = Some(DiscoveryService::new(user_id).map_err(|e| e.to_string())?);
    Ok(())
}

#[tauri::command]
fn start_broadcast(
    window: tauri::Window,
    state: tauri::State<AppState>,
    device_name: String,
    user_id: String,
    user_name: String,
) -> Result<(), String> {
    let (ip, port) = generate_multicast_addr(&user_id);
    let sender = AudioSender::new(&ip, port).map_err(|e| e.to_string())?;
    let sender = Arc::new(sender);

    let mut capture = CaptureEngine::new().map_err(|e| e.to_string())?;
    
    // We'll use this to throttle events to the frontend (e.g. every 5th packet)
    let mut packet_count = 0;
    
    capture.start_capture(device_name.clone(), move |packet| {
        let _ = sender.send(&packet);
        
        // Calculate peak amplitude for visualization
        packet_count += 1;
        if packet_count % 4 == 0 { // Send update every ~40-60ms
            let mut max_val: f32 = 0.0;
            for chunk in packet.data.chunks_exact(2) {
                let sample = i16::from_le_bytes([chunk[0], chunk[1]]) as f32 / 32768.0;
                let abs_sample = sample.abs();
                if abs_sample > max_val {
                    max_val = abs_sample;
                }
            }
            // Emit peak level to UI (0.0 to 1.0)
            let _ = window.emit("audio-level", max_val);
        }
    }).map_err(|e| e.to_string())?;

    let mut lock = state.capture.lock().unwrap();
    *lock = Some(capture);

    // Determine if the source is an output (monitor) or input (mic)
    let devices = audio::get_all_capture_devices().unwrap_or_default();
    let is_output = devices.iter()
        .find(|d| d.name == device_name)
        .map(|d| d.is_output)
        .unwrap_or(false);

    // Announce to discovery and start heartbeat
    let disc_opt = state.discovery.lock().unwrap().clone();
    if let Some(d) = disc_opt {
        let _ = d.broadcast_announce(StreamInfo {
            user_id: user_id.clone(),
            user_name,
            device_name,
            is_output,
            multicast_ip: ip,
            port,
            is_streaming: true,
            sample_rate: 44100,
            channels: 2,
            bitrate: 0,
        });

        // Heartbeat thread
        state.is_streaming.store(true, Ordering::SeqCst);
        let is_streaming = state.is_streaming.clone();
        std::thread::spawn(move || {
            while is_streaming.load(Ordering::SeqCst) {
                let _ = d.broadcast_heartbeat();
                std::thread::sleep(std::time::Duration::from_secs(2));
            }
        });
    }

    Ok(())
}

#[tauri::command]
fn stop_broadcast(state: tauri::State<AppState>) -> Result<(), String> {
    let mut lock = state.capture.lock().unwrap();
    if let Some(mut capture) = lock.take() {
        capture.stop();
    }

    state.is_streaming.store(false, Ordering::SeqCst);

    // Notify discovery
    let disc = state.discovery.lock().unwrap();
    if let Some(d) = &*disc {
        let _ = d.broadcast_goodbye();
    }
    Ok(())
}

#[tauri::command]
fn start_listen(
    state: tauri::State<AppState>,
    user_id: String,
    multicast_ip: String,
    port: u16,
    device_name: String,
) -> Result<(), String> {
    let mut playback = PlaybackEngine::new(44100, 2).map_err(|e| e.to_string())?;
    playback.start_playback(device_name, 44100, 2).map_err(|e| e.to_string())?;

    let receiver = AudioReceiver::new(&multicast_ip, port).map_err(|e| e.to_string())?;
    let playback_arc = Arc::new(Mutex::new(playback));
    let playback_clone = playback_arc.clone();

    // Background thread for receiving audio
    std::thread::spawn(move || {
        while let Ok(packets) = receiver.receive() {
            if let Ok(p_lock) = playback_clone.lock() {
                for p in packets {
                    let _ = p_lock.push_packet(p);
                }
            } else {
                break;
            }
            std::thread::sleep(std::time::Duration::from_millis(5));
        }
    });

    let mut playbacks = state.playbacks.lock().unwrap();
    playbacks.insert(user_id, playback_arc);

    Ok(())
}

#[tauri::command]
fn stop_listen(state: tauri::State<AppState>, user_id: String) -> Result<(), String> {
    let mut playbacks = state.playbacks.lock().unwrap();
    if let Some(playback_arc) = playbacks.remove(&user_id) {
        if let Ok(mut playback) = playback_arc.lock() {
            playback.stop();
        }
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState { 
            discovery: Mutex::new(None),
            capture: Mutex::new(None),
            playbacks: Mutex::new(HashMap::new()),
            is_streaming: Arc::new(AtomicBool::new(false)),
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_input_devices,
            get_output_devices,
            get_peers,
            init_discovery,
            start_broadcast,
            stop_broadcast,
            start_listen,
            stop_listen
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
