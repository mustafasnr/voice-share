use crate::models::{MessageType, StreamInfo, AudioPacket};
use socket2::{Socket, Domain, Type, Protocol};
use std::net::{SocketAddr, UdpSocket};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use anyhow::Result;
use std::hash::{Hash, Hasher};
use std::collections::hash_map::DefaultHasher;

pub fn generate_multicast_addr(user_id: &str) -> (String, u16) {
    let mut s = DefaultHasher::new();
    user_id.hash(&mut s);
    let h = s.finish();
    
    let b3 = ((h >> 16) & 0xFF) as u8;
    let b4 = (h & 0xFF) as u8;
    // 239.255.x.y
    let ip = format!("239.255.{}.{}", b3, b4);
    
    // Port 8000 + (h % 4096)
    let port = 8000 + (h % 4096) as u16;
    
    (ip, port)
}

pub struct AudioSender {
    socket: UdpSocket,
    addr: SocketAddr,
}

impl AudioSender {
    pub fn new(multicast_ip: &str, port: u16) -> Result<Self> {
        let socket = Socket::new(Domain::IPV4, Type::DGRAM, Some(Protocol::UDP))?;
        socket.set_reuse_address(true)?;
        #[cfg(not(windows))]
        socket.set_reuse_port(true)?;
        
        // Paketin ağda daha uzağa gidebilmesi için TTL'i artırıyoruz
        socket.set_multicast_ttl_v4(2)?;
        
        let addr: SocketAddr = format!("{}:{}", multicast_ip, port).parse()?;
        let socket: UdpSocket = socket.into();
        
        Ok(Self { socket, addr })
    }

    pub fn send(&self, packet: &AudioPacket) -> Result<()> {
        let config = bincode::config::standard();
        let data = bincode::serde::encode_to_vec(packet, config)?;
        match self.socket.send_to(&data, self.addr) {
            Ok(_) => {
                // Her 100 pakette bir log basalım ki console dolmasın
                if packet.sequence % 100 == 0 {
                    println!("Ağ Paket Gönderildi: seq={}, size={}", packet.sequence, data.len());
                }
            }
            Err(e) => eprintln!("Ağ Gönderim Hatası: {}", e),
        }
        Ok(())
    }
}

pub struct AudioReceiver {
    socket: UdpSocket,
}

impl AudioReceiver {
    pub fn new(multicast_ip: &str, port: u16) -> Result<Self> {
        let socket = Socket::new(Domain::IPV4, Type::DGRAM, Some(Protocol::UDP))?;
        socket.set_reuse_address(true)?;
        #[cfg(not(windows))]
        socket.set_reuse_port(true)?;
        
        // Portu bind et
        let addr: SocketAddr = format!("0.0.0.0:{}", port).parse()?;
        socket.bind(&addr.into())?;
        
        let multi_addr: std::net::Ipv4Addr = multicast_ip.parse()?;
        let interface: std::net::Ipv4Addr = "0.0.0.0".parse()?;
        
        println!("Multicast grubuna katılım deneniyor: {} port: {}", multicast_ip, port);
        
        // Multicast katılımı
        if let Err(e) = socket.join_multicast_v4(&multi_addr, &interface) {
            eprintln!("Multicast katılım hatası (0.0.0.0): {}", e);
        } else {
            println!("Multicast grubuna başarıyla katıldık: {}", multicast_ip);
        }
        
        let _ = socket.set_recv_buffer_size(1024 * 1024);
        socket.set_nonblocking(true)?;

        Ok(Self { socket: socket.into() })
    }

    pub fn receive(&self) -> Result<Vec<AudioPacket>> {
        let mut packets = Vec::new();
        let mut buf = [0u8; 65507];
        let mut received_any = false;
        
        while let Ok((n, src)) = self.socket.recv_from(&mut buf) {
            if !received_any {
                received_any = true;
                // println!("Veri alınıyor... Kaynak: {}, Boyut: {}", src, n);
            }
            let config = bincode::config::standard();
            if let Ok((packet, _)) = bincode::serde::decode_from_slice::<AudioPacket, _>(&buf[..n], config) {
                if packet.sequence % 100 == 0 {
                    println!("Ağ Paket Alındı: seq={}, from={}", packet.sequence, src);
                }
                packets.push(packet);
            }
        }
        Ok(packets)
    }
}

#[derive(Clone)]
pub struct DiscoveryService {
    socket: Arc<UdpSocket>,
    peers: Arc<Mutex<Vec<(StreamInfo, Instant)>>>,
}

impl DiscoveryService {
    pub fn new() -> Result<Self> {
        let socket = Socket::new(Domain::IPV4, Type::DGRAM, Some(Protocol::UDP))?;
        socket.set_reuse_address(true)?;
        #[cfg(not(windows))]
        socket.set_reuse_port(true)?;
        
        let addr: SocketAddr = "0.0.0.0:11111".parse()?;
        socket.bind(&addr.into())?;
        socket.set_broadcast(true)?;
        
        // Multicast grubuna katıl (Keşif için ek güvence)
        let multi_addr: std::net::Ipv4Addr = "239.1.1.1".parse()?;
        let interface: std::net::Ipv4Addr = "0.0.0.0".parse()?;
        let _ = socket.join_multicast_v4(&multi_addr, &interface);

        socket.set_nonblocking(true)?;

        Ok(Self {
            socket: Arc::new(socket.into()),
            peers: Arc::new(Mutex::new(Vec::new())),
        })
    }

    pub fn broadcast_announce(&self, info: StreamInfo) -> Result<()> {
        let msg = MessageType::Announce(info);
        let config = bincode::config::standard();
        let data = bincode::serde::encode_to_vec(&msg, config)?;
        
        // Hem broadcast hem multicast gönderiyoruz ki her türlü ağ yapısında ulaşsın
        let broadcast_addr: SocketAddr = "255.255.255.255:11111".parse()?;
        let multicast_addr: SocketAddr = "239.1.1.1:11111".parse()?;
        
        let _ = self.socket.send_to(&data, broadcast_addr);
        let _ = self.socket.send_to(&data, multicast_addr);
        Ok(())
    }

    pub fn broadcast_heartbeat(&self, info: StreamInfo) -> Result<()> {
        let msg = MessageType::Heartbeat(info);
        let config = bincode::config::standard();
        let data = bincode::serde::encode_to_vec(&msg, config)?;
        
        let broadcast_addr: SocketAddr = "255.255.255.255:11111".parse()?;
        let multicast_addr: SocketAddr = "239.1.1.1:11111".parse()?;
        
        let _ = self.socket.send_to(&data, broadcast_addr);
        let _ = self.socket.send_to(&data, multicast_addr);
        Ok(())
    }

    pub fn broadcast_goodbye(&self, user_id: String) -> Result<()> {
        let msg = MessageType::Goodbye(user_id);
        let config = bincode::config::standard();
        let data = bincode::serde::encode_to_vec(&msg, config)?;
        
        let broadcast_addr: SocketAddr = "255.255.255.255:11111".parse()?;
        let multicast_addr: SocketAddr = "239.1.1.1:11111".parse()?;
        
        let _ = self.socket.send_to(&data, broadcast_addr);
        let _ = self.socket.send_to(&data, multicast_addr);
        Ok(())
    }

    pub fn update(&self) -> Result<()> {
        let mut buf = [0u8; 1024];
        while let Ok((n, _)) = self.socket.recv_from(&mut buf) {
            let config = bincode::config::standard();
            if let Ok((msg, _)) = bincode::serde::decode_from_slice::<MessageType, _>(&buf[..n], config) {
                let mut peers = self.peers.lock().unwrap();
                match msg {
                    MessageType::Announce(info) | MessageType::Heartbeat(info) => {
                        if let Some(p) = peers.iter_mut().find(|(i, _)| i.user_id == info.user_id) {
                            *p = (info, Instant::now());
                        } else {
                            peers.push((info, Instant::now()));
                        }
                    }
                    MessageType::Goodbye(uid) => {
                        peers.retain(|(i, _)| i.user_id != uid);
                    }
                }
            }
        }

        // Timeout check (10 seconds)
        let mut peers = self.peers.lock().unwrap();
        peers.retain(|(_, last_seen)| last_seen.elapsed() < Duration::from_secs(10));
        
        Ok(())
    }

    pub fn get_peers(&self) -> Vec<StreamInfo> {
        let peers = self.peers.lock().unwrap();
        peers.iter().map(|(info, _)| info.clone()).collect()
    }
}
