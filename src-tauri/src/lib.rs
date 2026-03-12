use tauri::{Emitter, Manager};
use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use serde::Serialize;
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
    pub tray: Mutex<Option<tauri::tray::TrayIcon>>,
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
fn init_discovery(state: tauri::State<AppState>) -> Result<(), String> {
    let mut disc = state.discovery.lock().unwrap();
    *disc = Some(DiscoveryService::new().map_err(|e| e.to_string())?);
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
    println!("Yayın başladı: http://{}:{}", ip, port);
    let sender = AudioSender::new(&ip, port).map_err(|e| e.to_string())?;
    let sender = Arc::new(sender);

    let mut capture = CaptureEngine::new().map_err(|e| e.to_string())?;
    
    // Start capture and send encoded packets
    let (actual_rate, actual_channels) = capture.start_capture(device_name.clone(), move |packet| {
        let _ = sender.send(&packet);
        
        // Emit peak level to UI (already calculated in audio.rs)
        let _ = window.emit("audio-level", packet.peak_level);
    }).map_err(|e| e.to_string())?;

    let mut lock = state.capture.lock().unwrap();
    *lock = Some(capture);

    // Determine if the source is an output (monitor) or input (mic) and get friendly name
    let devices = audio::get_all_capture_devices().unwrap_or_default();
    let device_info = devices.iter().find(|d| d.id == device_name);
    
    let is_output = device_info.map(|d| d.is_output).unwrap_or(false);
    let friendly_name = device_info.map(|d| d.name.clone()).unwrap_or_else(|| device_name.clone());

    println!("Yayın bilgileri hazırlanıyor: Kullanıcı: {}, Cihaz: {}, Multicast: {}:{}", user_name, friendly_name, ip, port);

    let info = StreamInfo {
        user_id: user_id.clone(),
        user_name,
        device_name: friendly_name,
        is_output,
        multicast_ip: ip,
        port,
        is_streaming: true,
        sample_rate: actual_rate,
        channels: actual_channels,
        bitrate: 128000, // Higher bitrate for potential stereo
    };

    // Announce to discovery and start heartbeat
    let disc_opt = state.discovery.lock().unwrap().clone();
    if let Some(d) = disc_opt {
        let _ = d.broadcast_announce(info.clone());

        // Heartbeat thread
        state.is_streaming.store(true, Ordering::SeqCst);
        let is_streaming = state.is_streaming.clone();
        std::thread::spawn(move || {
            while is_streaming.load(Ordering::SeqCst) {
                let _ = d.broadcast_heartbeat(info.clone());
                std::thread::sleep(std::time::Duration::from_secs(3));
            }
        });
    }

    Ok(())
}

#[tauri::command]
fn stop_broadcast(state: tauri::State<AppState>, user_id: String) -> Result<(), String> {
    let mut lock = state.capture.lock().unwrap();
    if let Some(mut capture) = lock.take() {
        capture.stop();
    }

    state.is_streaming.store(false, Ordering::SeqCst);

    // Notify discovery
    let disc = state.discovery.lock().unwrap();
    if let Some(d) = &*disc {
        let _ = d.broadcast_goodbye(user_id);
    }
    Ok(())
}

#[derive(Serialize, Clone)]
struct PeerAudioLevel {
    user_id: String,
    level: f32,
}

#[tauri::command]
fn start_listen(
    window: tauri::Window,
    state: tauri::State<AppState>,
    user_id: String,
    multicast_ip: String,
    port: u16,
    device_name: String,
    sample_rate: u32,
    channels: u8,
    volume: f32,
) -> Result<(), String> {
    let mut playback = PlaybackEngine::new(sample_rate, channels).map_err(|e| e.to_string())?;
    playback.set_volume(volume);
    playback.start_playback(device_name).map_err(|e| e.to_string())?;

    let receiver = AudioReceiver::new(&multicast_ip, port).map_err(|e| e.to_string())?;
    let playback_arc = Arc::new(Mutex::new(playback));
    let playback_clone = playback_arc.clone();
    let user_id_clone = user_id.clone();

    // Background thread for receiving audio
    std::thread::spawn(move || {
        while let Ok(packets) = receiver.receive() {
            if let Ok(p_lock) = playback_clone.lock() {
                for p in packets {
                    let _ = window.emit("peer-audio-level", PeerAudioLevel {
                        user_id: user_id_clone.clone(),
                        level: p.peak_level,
                    });
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

#[tauri::command]
fn set_peer_volume(state: tauri::State<AppState>, user_id: String, volume: f32) -> Result<(), String> {
    let playbacks = state.playbacks.lock().unwrap();
    if let Some(playback_arc) = playbacks.get(&user_id) {
        if let Ok(playback) = playback_arc.lock() {
            playback.set_volume(volume);
        }
    }
    Ok(())
}

#[tauri::command]
fn update_tray_menu(app: tauri::AppHandle, quit_text: String) -> Result<(), String> {
    let tray = app.tray_by_id("main_tray");
    if let Some(tray) = tray {
        let quit_i = MenuItem::with_id(&app, "quit", quit_text, true, None::<&str>).map_err(|e| e.to_string())?;
        let menu = Menu::with_items(&app, &[&quit_i]).map_err(|e| e.to_string())?;
        let _ = tray.set_menu(Some(menu));
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
            tray: Mutex::new(None),
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = app.get_webview_window("main").map(|w| {
                let _ = w.show();
                let _ = w.set_focus();
            });
        }))
        .plugin(tauri_plugin_autostart::init(tauri_plugin_autostart::MacosLauncher::LaunchAgent, None))
        .invoke_handler(tauri::generate_handler![
            get_input_devices,
            get_output_devices,
            get_peers,
            init_discovery,
            start_broadcast,
            stop_broadcast,
            start_listen,
            stop_listen,
            set_peer_volume,
            update_tray_menu
        ])
        .setup(|app| {
            let quit_i = MenuItem::with_id(app, "quit", "Kapat", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&quit_i])?;

            let tray = TrayIconBuilder::with_id("main_tray")
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(move |app_handle, event| {
                    if event.id == "quit" {
                        app_handle.exit(0);
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    if let tauri::tray::TrayIconEvent::Click {
                        button: tauri::tray::MouseButton::Left,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            let state = app.state::<AppState>();
            *state.tray.lock().unwrap() = Some(tray);
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
