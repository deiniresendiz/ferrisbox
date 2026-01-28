use local_ip_address::local_ip;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct IpInfo {
    local_ip: String,
}

pub fn get_local_ip_command() -> Result<IpInfo, String> {
    match local_ip() {
        Ok(ip) => Ok(IpInfo {
            local_ip: ip.to_string(),
        }),
        Err(e) => Err(format!("Failed to get local IP: {}", e)),
    }
}
