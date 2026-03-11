# 🎙️ Voice Share

A high-performance, low-latency audio broadcasting tool built with **Tauri**, **Rust**, and **React**. Share your system audio or microphone across your local network with ease.

## ✨ Features

- **Local Network Discovery**: Automatically find active broadcasters on your network.
- **Low Latency**: Optimized audio streaming using Rust and Opus encoding.
- **Multiple Sources**: Stream from your microphone or directly from system output (Loopback).
- **Auto-Update**: Seamless updates delivered directly via GitHub Releases.
- **Cross-Platform**: Designed for Windows (with future support for other platforms).

## 🚀 Getting Started

### Installation
1. Go to the [Latest Release](https://github.com/mustafasnr/voice-share/releases/latest).
2. Download and run the `.msi` or `.setup.exe` for Windows.
3. Open the app and start broadcasting or listening!

### Usage
- **Broadcast**: Select your audio device and hit "Start Broadcast". People on your network can now tune in.
- **Listen**: Look for active peers in the "Listen" tab and click "Listen" to hear their stream.

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Lucide Icons, Shadcn UI
- **Backend**: Rust, Tauri
- **Audio Core**: cpal, opus, ringbuf
- **Networking**: Multicast UDP for discovery, TCP/UDP for audio streaming.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---
Developed by [Mustafa](https://github.com/mustafasnr)
