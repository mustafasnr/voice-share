use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct StreamInfo {
    pub user_id: String,
    pub user_name: String,
    pub device_name: String,
    pub is_output: bool,
    pub multicast_ip: String,
    pub port: u16,
    pub is_streaming: bool,
    pub sample_rate: u32,
    pub channels: u8,
    pub bitrate: u32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum MessageType {
    Announce(StreamInfo),
    Heartbeat(String), // user_id
    Goodbye(String),   // user_id
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AudioPacket {
    pub sequence: u16,
    pub timestamp: u64,
    pub data: Vec<u8>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AudioDevice {
    pub name: String,
    pub is_output: bool,
}
