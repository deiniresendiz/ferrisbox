use hmac::{Hmac, Mac};
use serde::{Deserialize, Serialize};
use sha1::Sha1;
use sha2::{Digest, Sha256, Sha512};

type HmacSha1 = Hmac<Sha1>;
type HmacSha256 = Hmac<Sha256>;
type HmacSha512 = Hmac<Sha512>;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum HmacAlgorithm {
    SHA1,
    SHA256,
    SHA512,
}

pub fn generate_hmac(
    message: &str,
    secret: &str,
    algorithm: &HmacAlgorithm,
) -> Result<String, String> {
    match algorithm {
        HmacAlgorithm::SHA1 => generate_hmac_impl::<HmacSha1>(message, secret),
        HmacAlgorithm::SHA256 => generate_hmac_impl::<HmacSha256>(message, secret),
        HmacAlgorithm::SHA512 => generate_hmac_impl::<HmacSha512>(message, secret),
    }
}

fn generate_hmac_impl<D: Mac + Digest>(
    message: &str,
    secret: &str,
) -> Result<String, String> {
    let mut mac = D::new_from_slice(secret.as_bytes())
        .map_err(|e| e.to_string())?;
    mac.update(message.as_bytes());
    let result = mac.finalize();
    let code_bytes = result.into_bytes();
    Ok(format!("{:x}", Digest::finalize(&code_bytes)))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hmac_sha1() {
        let result = generate_hmac("test message", "secret", &HmacAlgorithm::SHA1).unwrap();
        assert_eq!(result.len(), 40);
    }

    #[test]
    fn test_hmac_sha256() {
        let result = generate_hmac("test message", "secret", &HmacAlgorithm::SHA256).unwrap();
        assert_eq!(result.len(), 64);
    }

    #[test]
    fn test_hmac_sha512() {
        let result = generate_hmac("test message", "secret", &HmacAlgorithm::SHA512).unwrap();
        assert_eq!(result.len(), 128);
    }

    #[test]
    fn test_hmac_empty_message() {
        let result = generate_hmac("", "secret", &HmacAlgorithm::SHA256).unwrap();
        assert!(!result.is_empty());
    }

    #[test]
    fn test_hmac_deterministic() {
        let result1 = generate_hmac("test", "key", &HmacAlgorithm::SHA256).unwrap();
        let result2 = generate_hmac("test", "key", &HmacAlgorithm::SHA256).unwrap();
        assert_eq!(result1, result2);
    }

    #[test]
    fn test_hmac_different_messages() {
        let result1 = generate_hmac("message1", "key", &HmacAlgorithm::SHA256).unwrap();
        let result2 = generate_hmac("message2", "key", &HmacAlgorithm::SHA256).unwrap();
        assert_ne!(result1, result2);
    }

    #[test]
    fn test_hmac_different_secrets() {
        let result1 = generate_hmac("message", "key1", &HmacAlgorithm::SHA256).unwrap();
        let result2 = generate_hmac("message", "key2", &HmacAlgorithm::SHA256).unwrap();
        assert_ne!(result1, result2);
    }
}
