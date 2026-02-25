Audio Streaming LAN - Proje Planı
🎯 Proje Özeti
Yerel ağda düşük gecikmeli, çoklu kullanıcılı ses yayını uygulaması. Her kullanıcı hem yayın yapabilir hem de birden fazla yayını aynı anda dinleyebilir.

🛠 Teknoloji Stack'i
Backend (Rust)

Tauri 2.x: Desktop app framework, React ↔ Rust bridge
CPAL: Cross-platform audio I/O (loopback capture, speaker output)
Opus: Ses codec'i (128kbps stereo @ 48kHz, low latency mode)
Socket2: UDP multicast socket yönetimi (reuse_address/reuse_port)
Bincode: Binary serialization (paket encoding)
Ringbuf: Lock-free ring buffer (audio thread'leri arası veri transferi)
Tokio (opsiyonel): Async runtime (discovery service için)

Frontend (React + Javascript + ShadcnUI)

React 18: UI framework
Javascript: Type safety
ShadcnUI: Styling
Zustand: State management
Lucide React: Icon library


📡 Network Mimarisi
Discovery Protocol (UDP Broadcast)

Port: 11111 (tüm cihazlarda aynı, reuse enabled)
Protokol: UDP broadcast (255.255.255.255:11111)
Mesaj Tipleri:

Announce: Yayın başlatıldığında (kullanıcı bilgisi + multicast IP/port + codec bilgisi)
Heartbeat: Her 2 saniyede bir (alive check)
Goodbye: Yayın durdurulduğunda (clean shutdown)


Timeout: 6 saniye heartbeat yoksa offline say

Audio Streaming (UDP Multicast)

Multicast IP Havuzu: 239.255.0.0 - 239.255.255.255
Port Aralığı: 8000-12095 (dinamik)
IP/Port Ataması: User ID'den hash ile deterministik (collision-free)
Paket Formatı:

  [2 byte] Sequence number (u16, big-endian)
  [6 byte] Timestamp (mikrosaniye, truncated 48-bit)
  [N byte] Opus encoded audio data

🎵 Audio Pipeline
Broadcaster (Yayın Yapan)
Loopback Device (CPAL)
    ↓ (Raw PCM: 48kHz stereo float32)
Dynamic Resampling (eğer device farklı sample rate'te)
    ↓
Opus Encoder (Application::Audio, 128kbps, FEC enabled)
    ↓ (20ms frames = 960 samples)
Paketleme (sequence + timestamp + opus_data)
    ↓
UDP Multicast Socket (239.255.x.x:xxxx)
Önemli Detaylar:

Buffer size: 960 samples (20ms @ 48kHz) → düşük latency
Opus settings:

complexity: 10 (best quality)
vbr: true (variable bitrate)
inband_fec: true (paket kaybı koruması)
bitrate: auto (sample rate'e göre: 16kHz→24kbps, 48kHz→128kbps)



Receiver (Dinleyen)
UDP Multicast Socket (belirli IP:port'u dinle)
    ↓
Paket Parse (sequence check, timestamp extract)
    ↓
Opus Decoder
    ↓ (PCM: native sample rate)
Resampling (eğer output 48kHz değilse → 48kHz'e çevir)
    ↓
Channel Conversion (mono → stereo)
    ↓
Volume Uygulama (0.0 - 1.0)
    ↓
Ring Buffer (lock-free, 2 saniye capacity)
    ↓
Mixer (tüm ring buffer'ları topla)
    ↓
Clipping Prevention ([-1.0, 1.0] range)
    ↓
Output Device (CPAL, 48kHz stereo)

📊 Veri Modelleri
StreamInfo (Discovery'de paylaşılan)
rust{
  user_id: String,         // "ahmet-desktop-1234567890"
  user_name: String,       // "Ahmet"
  device_name: String,     // "Realtek Speakers (Loopback)"
  multicast_ip: String,    // "239.255.142.73"
  port: u16,               // 8421
  is_streaming: bool,      // true/false
  
  // Codec info (dynamic negotiation)
  sample_rate: u32,        // 16000, 48000, etc.
  channels: u8,            // 1=mono, 2=stereo
  bitrate: u32             // 24000, 128000, etc.
}
StreamStats (Latency tracking)
rust{
  user_id: String,
  latency_ms: f32,         // EMA smoothed latency
  packet_loss: u32,        // Toplam kayıp paket
  status: Enum {           // UI renk kodlaması için
    Excellent,  // < 50ms
    Good,       // 50-100ms
    Fair,       // 100-200ms
    Poor        // > 200ms
  }
}
```

---

## 🖥 UI Sayfaları & Akışlar

### 1. Ana Sayfa (Dashboard)
**Bileşenler**:
- Kullanıcı adı ayarlama input
- "Yayınla" ve "Dinle" butonları
- Aktif kullanıcı listesi (online/offline durumu)

**Akış**:
- Uygulama açılır → Discovery service başlar (port 11111 bind)
- User ID oluştur: `{username}-{hostname}-{random}`
- Multicast IP/port'u hash'le ve StreamInfo'ya yaz
- 2 saniyede bir heartbeat broadcast et

---

### 2. Yayınla Sayfası (Broadcast)
**Bileşenler**:
- Audio input device listesi (dropdown)
  - Filtre: Sadece loopback cihazları göster
  - Format: "🔊 Realtek Speakers (Loopback)"
- Başlat/Durdur toggle button
- Yayın durumu indicator (yeşil dot + "Yayında")
- İstatistikler: Kaç kişi dinliyor (opsiyonel, ekstra discovery mesajı gerekir)

**Akış**:
1. Kullanıcı cihaz seçer
2. "Başlat" tıklanır
3. Backend:
   - CPAL ile loopback stream aç
   - Cihazın native sample rate/channel'ı oku
   - Opus encoder oluştur (native ayarlarla)
   - Multicast socket aç
   - Discovery'ye `Announce` gönder (`is_streaming: true`)
4. Audio loop başlar (loopback → encode → multicast)
5. "Durdur" tıklanır:
   - Stream'i kapat
   - Discovery'ye `Goodbye` gönder
   - Socket'i kapat

---

### 3. Dinle Sayfası (Listen)
**Bileşenler**:
- **Sol Panel**: Aktif yayınlar listesi
  - Her yayın için card:
    - Avatar/Icon
    - Kullanıcı adı
    - Cihaz adı
    - Ping indicator (yeşil/turuncu/kırmızı yuvarlak + ms değeri)
    - "Dinle" toggle button
- **Sağ Panel**: Mixer kontrolleri
  - Her dinlenen yayın için:
    - Kullanıcı adı
    - Volume slider (0-1 aralığında, yüzde göster)
    - Mute button
    - Stats expand button (paket kaybı, detaylı latency)
- **Alt Bar**: Output cihaz seçimi
  - Dropdown: Hoparlörler listesi
  - Format: "🔊 Realtek Speakers"

**Akış**:
1. Discovery'den `StreamInfo` listesi sürekli güncellenir (1 saniye interval)
2. Kullanıcı bir yayının "Dinle" butonuna tıklar:
   - Backend: StreamReceiver oluştur
     - Multicast gruba katıl (IP:port)
     - Opus decoder başlat
     - Ring buffer oluştur
     - UDP receive thread başlat
   - Frontend: Mixer paneline ekle (volume: 0.8 default)
3. Mixer output başlatılır (ilk yayın dinlendiğinde):
   - CPAL output stream aç (48kHz stereo)
   - Callback'te tüm ring buffer'ları mix et
4. Stats güncellenir (500ms interval):
   - Her StreamReceiver'dan latency + packet loss al
   - UI'da ping bubble rengini güncelle
5. Kullanıcı volume slider'ı hareket ettirir:
   - Backend'e `set_stream_volume(user_id, volume)` gönder
   - Receiver thread'de volume değişkeni güncellenir
6. "Dinle" butonu tekrar tıklanır (toggle off):
   - StreamReceiver durdur
   - Multicast gruptan ayrıl
   - Ring buffer'ı temizle
   - Mixer'dan kaldır

---

### 4. Ayarlar Sayfası (Settings)
**Bileşenler**:
- Kullanıcı adı input
- Discovery port (read-only: 11111)
- Buffer size seçimi (latency vs stability trade-off):
  - Düşük (10ms) - Minimum latency, WiFi'de risk
  - Normal (20ms) - Önerilen ✓
  - Yüksek (40ms) - Stability öncelikli
- Audio quality preset:
  - Düşük (64kbps) - Bandwidth tasarrufu
  - Normal (128kbps) - Önerilen ✓
  - Yüksek (192kbps) - Müzik kalitesi

---

## 🔧 Kritik Implementation Detayları

### 1. Discovery Service Thread
```
Main Thread:
  - Discovery state (Arc<Mutex<DiscoveryService>>)
  - Tauri command'lar

Background Thread (tokio::spawn):
  - Loop her 100ms:
    - Socket'ten mesaj oku (non-blocking)
    - Timeout kontrolü yap (6 saniye)
    - Heartbeat gönder (2 saniye interval)
    - Peer listesini güncelle
2. Audio Thread Safety

CPAL callback'ler real-time thread → Lock kullanma!
Veri transferi: Lock-free ring buffer (ringbuf crate)
Volume değişikliği: Arc<Mutex<f32>> (küçük data, nadiren lock)
Encoder/Decoder: Thread başına ayrı instance (paylaşma!)

3. Socket Reuse Pattern
rust// Discovery socket
socket.set_reuse_address(true);
#[cfg(not(windows))]
socket.set_reuse_port(true);

// Aynı makinede birden fazla instance çalışabilir
// Hepsi aynı portu dinler, broadcast mesajları alır
4. Multicast IP Collision Handling
rust// Hash collision çok nadir ama mümkün
// Eğer iki user aynı IP alırsa:
// - İlk başlatan socket açar (bind success)
// - İkinci başlatan bind fail alır → sequence++ → yeni IP dene
// - Max 3 retry sonra hata göster
5. Latency Measurement (EMA)
rust// Exponential Moving Average
const ALPHA: f32 = 0.1; // Smoothing factor

if latency_ema == 0.0 {
    latency_ema = current_latency;
} else {
    latency_ema = ALPHA * current_latency + (1.0 - ALPHA) * latency_ema;
}

// UI'da göster (integer ms)
display_latency = latency_ema.round() as u32;

🎨 UI/UX Gereksinimleri
Renk Kodlaması

Yeşil (#10b981): Excellent (<50ms), Online
Açık Yeşil (#84cc16): Good (50-100ms)
Turuncu (#f59e0b): Fair (100-200ms), Warning
Kırmızı (#ef4444): Poor (>200ms), Offline, Error

Animasyonlar

Ping bubble: Yavaş pulse animasyonu (>100ms latency)
Yayın durumu: Pulsating green dot
Volume slider: Smooth transition (200ms)

Accessibility

Volume slider: Klavye ok tuşları ile ayarlanabilir
Tüm butonlar: Tab navigation + Enter/Space
Screen reader: "Ahmet, latency 45 milisaniye, excellent connection"


🚀 Geliştirme Aşamaları
Phase 1: Core Audio (1 hafta)

 CPAL device enumeration
 Loopback capture + basic playback
 Opus encode/decode test
 Single user test (localhost multicast)

Phase 2: Networking (1 hafta)

 Discovery service implementation
 Multicast IP hash generator
 Paket format (sequence + timestamp)
 2 cihaz arası test

Phase 3: UI (1 hafta)

 Yayınla sayfası (device selection)
 Dinle sayfası (stream list + mixer)
 Stats display (ping bubble)
 Tauri commands integration

Phase 4: Polish (1 hafta)

 Dynamic codec negotiation
 Error handling (network fail, device unplug)
 Settings sayfası
 Paket kaybı stats + FEC test
 WiFi stability test


🐛 Test Senaryoları
Functional Tests

Single broadcaster, single listener: Temel işlevsellik
Multiple broadcasters: IP collision yok, tüm yayınlar görünüyor
One listener, multiple streams: Mixer doğru çalışıyor, volume bağımsız
Network disconnect: Timeout sonra offline oluyor
Device unplug: Graceful error handling

Performance Tests

WiFi 2.4GHz: Paket kaybı %5'te FEC çalışıyor mu?
10 aktif yayın: CPU/RAM kullanımı kabul edilebilir mi?
Latency stress: Buffer underrun olmuyor mu?

Edge Cases

Aynı user ID: Collision detection
Port 11111 meşgul: Hata mesajı göster
Multicast desteklemeyen router: Fallback yok, hata göster
Mono cihaz + stereo output: Conversion doğru mu?


📦 Dependencies (Cargo.toml)
toml[dependencies]
tauri = "latest"
cpal = "latest"
opus = "latest"
socket2 = "latest"
bincode = "latest"
ringbuf = "latest"
serde = { version = "latest", features = ["derive"] }

# Opsiyonel
rubato = "latest"  # Resampling
tokio = { version = "latest", features = ["rt-multi-thread"] }

🔒 Güvenlik Notları

Yerel ağ only: Internet'e açık değil
Multicast TTL=1: Sadece lokal subnet
Encryption yok: Güvenilir ağ varsayımı
Authentication yok: User ID collision'a güven


💡 Gelecek Özellikler (v2)

 Kayıt özelliği (stream'i WAV/FLAC'a kaydet)
 Push-to-talk modu
 Chat entegrasyonu
 Mobile support (iOS/Android)
 Efektler (equalizer, compressor)
 Virtual audio cable (sistem sesi + mic mix)


Target Latency: 40-80ms (encoding 20ms + network 10-30ms + decoding 20ms + buffering 10-20ms)
Target Bandwidth: 128 kbps per stream (stereo @ 48kHz)
Supported OS: Windows, macOS, Linux (CPAL + Tauri cross-platform)