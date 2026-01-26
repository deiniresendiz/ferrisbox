use rsa::{RsaPrivateKey, RsaPublicKey};
use rsa::pkcs8::{EncodePrivateKey, EncodePublicKey, LineEnding};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct RsaKeyPair {
    pub public_key_pem: String,
    pub private_key_pem: String,
    pub key_size: usize,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum RsaKeySize {
    Bits2048,
    Bits4096,
}

pub fn generate_rsa_key_pair(key_size: &RsaKeySize) -> RsaKeyPair {
    let bits = match key_size {
        RsaKeySize::Bits2048 => 2048,
        RsaKeySize::Bits4096 => 4096,
    };
    
    let mut rng = rand::rngs::OsRng;
    let private_key = RsaPrivateKey::new(&mut rng, bits).unwrap();
    let public_key = RsaPublicKey::from(&private_key);
    
    let private_pem = private_key
        .to_pkcs8_pem(LineEnding::LF)
        .unwrap()
        .to_string();
    let public_pem = public_key
        .to_public_key_pem(LineEnding::LF)
        .unwrap()
        .to_string();
    
    RsaKeyPair {
        public_key_pem: public_pem,
        private_key_pem: private_pem,
        key_size: bits,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_rsa_key_pair_2048() {
        let result = generate_rsa_key_pair(&RsaKeySize::Bits2048);
        assert_eq!(result.key_size, 2048);
        assert!(result.public_key_pem.contains("BEGIN PUBLIC KEY"));
        assert!(result.private_key_pem.contains("BEGIN PRIVATE KEY"));
    }

    #[test]
    fn test_generate_rsa_key_pair_4096() {
        let result = generate_rsa_key_pair(&RsaKeySize::Bits4096);
        assert_eq!(result.key_size, 4096);
        assert!(result.public_key_pem.contains("BEGIN PUBLIC KEY"));
        assert!(result.private_key_pem.contains("BEGIN PRIVATE KEY"));
    }

    #[test]
    fn test_rsa_key_format() {
        let result = generate_rsa_key_pair(&RsaKeySize::Bits2048);
        assert!(result.public_key_pem.lines().count() > 10);
        assert!(result.private_key_pem.lines().count() > 10);
    }
}
