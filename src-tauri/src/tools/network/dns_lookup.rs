use hickory_resolver::{Resolver, proto::rr::record_type::RecordType};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct DnsRecord {
    record_type: String,
    value: String,
}

pub fn dns_lookup_command(domain: String, record_type: String) -> Result<Vec<DnsRecord>, String> {
    let resolver = Resolver::from_system_conf().map_err(|e| format!("Failed to create resolver: {}", e))?;
    
    let mut results = Vec::new();
    
    match record_type.as_str() {
        "A" => {
            if let Ok(response) = resolver.ipv4_lookup(&domain) {
                for ip in response.iter() {
                    results.push(DnsRecord {
                        record_type: "A".to_string(),
                        value: ip.to_string(),
                    });
                }
            }
        }
        "AAAA" => {
            if let Ok(response) = resolver.ipv6_lookup(&domain) {
                for ip in response.iter() {
                    results.push(DnsRecord {
                        record_type: "AAAA".to_string(),
                        value: ip.to_string(),
                    });
                }
            }
        }
        "MX" => {
            if let Ok(response) = resolver.mx_lookup(&domain) {
                for mx in response.iter() {
                    results.push(DnsRecord {
                        record_type: "MX".to_string(),
                        value: format!("{} (prio: {})", mx.exchange(), mx.preference()),
                    });
                }
            }
        }
        "TXT" => {
            if let Ok(response) = resolver.txt_lookup(&domain) {
                for txt in response.iter() {
                    results.push(DnsRecord {
                        record_type: "TXT".to_string(),
                        value: txt.to_string(),
                    });
                }
            }
        }
        "CNAME" => {
            use hickory_resolver::Name;
            
            let name = Name::from_str_relaxed(&domain)
                .map_err(|e| format!("Invalid domain name: {}", e))?;
            
            match resolver.lookup(name, RecordType::CNAME) {
                Ok(lookup) => {
                    for record in lookup.record_iter() {
                        if let Some(data) = record.data() {
                            if let Some(cname) = data.as_cname() {
                                results.push(DnsRecord {
                                    record_type: "CNAME".to_string(),
                                    value: cname.to_string(),
                                });
                            }
                        }
                    }
                }
                Err(_) => {}
            }
        }
        "NS" => {
            if let Ok(response) = resolver.ns_lookup(&domain) {
                for ns in response.iter() {
                    results.push(DnsRecord {
                        record_type: "NS".to_string(),
                        value: ns.to_string(),
                    });
                }
            }
        }
        _ => return Err("Unsupported record type".to_string()),
    }
    
    Ok(results)
}
