use crate::tools::network::{ip_info, port_scanner, dns_lookup};

#[tauri::command]
pub fn get_local_ip_command() -> Result<ip_info::IpInfo, String> {
    ip_info::get_local_ip_command()
}

#[tauri::command]
pub async fn scan_ports_command(host: String, start_port: u16, end_port: u16) -> Result<Vec<port_scanner::PortResult>, String> {
    port_scanner::scan_ports_command(host, start_port, end_port).await
}

#[tauri::command]
pub fn dns_lookup_command(domain: String, record_type: String) -> Result<Vec<dns_lookup::DnsRecord>, String> {
    dns_lookup::dns_lookup_command(domain, record_type)
}
