use md5::Md5;
use serde::{Deserialize, Serialize};
use sha1::Sha1;
use sha2::{Digest, Sha256, Sha512};

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
        HashAlgorithm::SHA256 => calculate_hash::<Sha256>(input),
        HashAlgorithm::MD5 => calculate_hash::<Md5>(input),
        HashAlgorithm::SHA1 => calculate_hash::<Sha1>(input),
        HashAlgorithm::SHA512 => calculate_hash::<Sha512>(input),
    }
}

pub fn generate_all_hashes(input: &str) -> MultiHash {
    MultiHash {
        md5: calculate_hash::<Md5>(input),
        sha1: calculate_hash::<Sha1>(input),
        sha256: calculate_hash::<Sha256>(input),
        sha512: calculate_hash::<Sha512>(input),
    }
}

fn calculate_hash<D: Digest>(input: &str) -> String {
    let mut hasher = D::new();
    hasher.update(input.as_bytes());
    format!("{:x}", hasher.finalize())
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
        HashAlgorithm::SHA1 => {
            let mut hasher = Sha1::new();
            hasher.update(data);
            format!("{:x}", hasher.finalize())
        }
        HashAlgorithm::SHA512 => {
            let mut hasher = Sha512::new();
            hasher.update(data);
            format!("{:x}", hasher.finalize())
        }
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
            "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043"
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
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        );
    }
}
