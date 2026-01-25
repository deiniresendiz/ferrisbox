use md5::Md5;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "UPPERCASE")]
pub enum HashAlgorithm {
    SHA256,
    MD5,
}

pub fn generate_hash(input: &str, algorithm: &HashAlgorithm) -> String {
    match algorithm {
        HashAlgorithm::SHA256 => {
            let mut hasher = Sha256::new();
            hasher.update(input.as_bytes());
            format!("{:x}", hasher.finalize())
        }
        HashAlgorithm::MD5 => {
            let mut hasher = Md5::new();
            hasher.update(input.as_bytes());
            format!("{:x}", hasher.finalize())
        }
    }
}

pub fn generate_hash_from_bytes(data: &[u8], algorithm: &HashAlgorithm) -> String {
    match algorithm {
        HashAlgorithm::SHA256 => {
            let mut hasher = Sha256::new();
            hasher.update(data);
            format!("{:x}", hasher.finalize())
        }
        HashAlgorithm::MD5 => {
            let mut hasher = Md5::new();
            hasher.update(data);
            format!("{:x}", hasher.finalize())
        }
    }
}
