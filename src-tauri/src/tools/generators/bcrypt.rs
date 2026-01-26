use bcrypt::{hash, verify, DEFAULT_COST};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct BcryptHashOutput {
    pub hash: String,
    pub cost: u32,
}

pub fn bcrypt_hash(password: &str, cost: Option<u32>) -> Result<BcryptHashOutput, String> {
    let cost_value = cost.unwrap_or(DEFAULT_COST as u32);
    let result = hash(password, cost_value)
        .map_err(|e| e.to_string())?;
    
    Ok(BcryptHashOutput {
        hash: result,
        cost: cost_value,
    })
}

pub fn bcrypt_verify(password: &str, hash: &str) -> Result<bool, String> {
    verify(password, hash).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bcrypt_hash_default_cost() {
        let result = bcrypt_hash("password123", None).unwrap();
        assert_eq!(result.cost, 10);
        assert!(result.hash.starts_with("$2b$10$"));
        assert!(result.hash.len() == 60);
    }

    #[test]
    fn test_bcrypt_hash_custom_cost() {
        let result = bcrypt_hash("password123", Some(12)).unwrap();
        assert_eq!(result.cost, 12);
        assert!(result.hash.starts_with("$2b$12$"));
    }

    #[test]
    fn test_bcrypt_verify_correct() {
        let hash_result = bcrypt_hash("password123", None).unwrap();
        let result = bcrypt_verify("password123", &hash_result.hash).unwrap();
        assert!(result);
    }

    #[test]
    fn test_bcrypt_verify_incorrect() {
        let hash_result = bcrypt_hash("password123", None).unwrap();
        let result = bcrypt_verify("wrongpassword", &hash_result.hash).unwrap();
        assert!(!result);
    }

    #[test]
    fn test_bcrypt_different_passwords_different_hashes() {
        let hash1 = bcrypt_hash("password1", None).unwrap();
        let hash2 = bcrypt_hash("password2", None).unwrap();
        assert_ne!(hash1.hash, hash2.hash);
    }

    #[test]
    fn test_bcrypt_same_password_different_hashes() {
        let hash1 = bcrypt_hash("password", None).unwrap();
        let hash2 = bcrypt_hash("password", None).unwrap();
        assert_ne!(hash1.hash, hash2.hash);
    }
}
