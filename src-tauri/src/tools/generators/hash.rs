use digest::Digest;
use md5::Md5;
use serde::{Deserialize, Serialize};
use sha1::Sha1;
use sha2::Sha256;
use sha2::Sha512;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "UPPERCASE")]
pub enum HashAlgorithm {
    MD5,
    SHA1,
    SHA256,
    SHA512,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MultiHash {
    pub md5: String,
    pub sha1: String,
    pub sha256: String,
    pub sha512: String,
}

pub fn generate_hash(input: &str, algorithm: &HashAlgorithm) -> String {
    match algorithm {
        HashAlgorithm::MD5 => {
            let mut hasher = Md5::new();
            hasher.update(input.as_bytes());
            format!("{:x}", hasher.finalize())
        }
        HashAlgorithm::SHA1 => {
            let mut hasher = Sha1::new();
            hasher.update(input.as_bytes());
            format!("{:x}", hasher.finalize())
        }
        HashAlgorithm::SHA256 => {
            let mut hasher = Sha256::new();
            hasher.update(input.as_bytes());
            format!("{:x}", hasher.finalize())
        }
        HashAlgorithm::SHA512 => {
            let mut hasher = Sha512::new();
            hasher.update(input.as_bytes());
            format!("{:x}", hasher.finalize())
        }
    }
}

pub fn generate_all_hashes(input: &str) -> MultiHash {
    MultiHash {
        md5: generate_hash(input, &HashAlgorithm::MD5),
        sha1: generate_hash(input, &HashAlgorithm::SHA1),
        sha256: generate_hash(input, &HashAlgorithm::SHA256),
        sha512: generate_hash(input, &HashAlgorithm::SHA512),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_hash_md5() {
        let result = generate_hash("hello", &HashAlgorithm::MD5);
        assert_eq!(result, "5d41402abc4b2a76b9719d911017c592");
    }

    #[test]
    fn test_generate_hash_sha1() {
        let result = generate_hash("hello", &HashAlgorithm::SHA1);
        assert_eq!(result, "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434");
    }

    #[test]
    fn test_generate_hash_sha256() {
        let result = generate_hash("hello", &HashAlgorithm::SHA256);
        assert_eq!(
            result,
            "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
        );
    }

    #[test]
    fn test_generate_hash_sha512() {
        let result = generate_hash("hello", &HashAlgorithm::SHA512);
        assert_eq!(
            result,
            "9b71d224bd62f3785d96d4ad9b925d436da339462d3411fa265185a84c8"
        );
    }

    #[test]
    fn test_generate_all_hashes() {
        let result = generate_all_hashes("test");
        assert!(!result.md5.is_empty());
        assert!(!result.sha1.is_empty());
        assert!(!result.sha256.is_empty());
        assert!(!result.sha512.is_empty());
    }

    #[test]
    fn test_generate_hash_empty_input() {
        let result = generate_hash("", &HashAlgorithm::SHA256);
        assert_eq!(
            result,
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b9342a6"
        );
    }
}
