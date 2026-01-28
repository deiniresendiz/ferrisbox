use std::net::{TcpStream, ToSocketAddrs};
use std::time::Duration;
use serde::{Deserialize, Serialize};
use std::sync::mpsc;
use std::thread;

#[derive(Serialize, Deserialize)]
pub struct PortResult {
    port: u16,
    status: String, // "open" or "closed" (closed usually means timeout or refused)
}

pub async fn scan_ports_command(host: String, start_port: u16, end_port: u16) -> Result<Vec<PortResult>, String> {
    let mut results = Vec::new();
    let timeout = Duration::from_millis(100); // Fast timeout for localhost
    
    // Limit range to avoid excessive threads/time
    if end_port < start_port {
        return Err("End port must be greater than or equal to start port".to_string());
    }
    if end_port - start_port > 1000 {
        return Err("Range too large. Max 1000 ports at a time.".to_string());
    }

    let (tx, rx) = mpsc::channel();
    
    for port in start_port..=end_port {
        let tx = tx.clone();
        let host = host.clone();
        
        thread::spawn(move || {
            let addr = format!("{}:{}", host, port);
            let is_open = if let Ok(addrs) = addr.to_socket_addrs() {
                if let Some(socket_addr) = addrs.into_iter().next() {
                    TcpStream::connect_timeout(&socket_addr, timeout).is_ok()
                } else {
                    false
                }
            } else {
                false
            };
            
            if is_open {
                tx.send(Some(PortResult {
                    port,
                    status: "open".to_string(),
                })).unwrap();
            } else {
                tx.send(None).unwrap(); // Signal done but closed
            }
        });
    }
    
    // Drop initial sender so rx doesn't block forever
    drop(tx);

    for received in rx {
        if let Some(result) = received {
            results.push(result);
        }
    }
    
    results.sort_by_key(|r| r.port);
    Ok(results)
}
