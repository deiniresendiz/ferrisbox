use jsonwebtoken::{
    decode, decode_header, DecodingKey, Validation, Algorithm,
    errors::Error as JwtLibError,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum JwtError {
    #[error("Invalid JWT format: {0}")]
    InvalidFormat(String),
    #[error("Decoding error: {0}")]
    DecodingError(#[from] JwtLibError),
    #[error("JSON error: {0}")]
    JsonError(#[from] serde_json::Error),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JwtParts {
    pub header: String,            // JSON formatted
    pub payload: String,           // JSON formatted
    pub signature: String,         // Base64
    pub is_valid: bool,
    pub algorithm: String,
    pub validation_error: Option<String>,
}

/// Decode JWT without signature validation (unsafe mode)
pub fn decode_jwt_unsafe(token: &str) -> Result<JwtParts, JwtError> {
    let parts: Vec<&str> = token.split('.').collect();
    if parts.len() != 3 {
        return Err(JwtError::InvalidFormat("JWT must have 3 parts".into()));
    }
    
    let header = decode_header(token)?;
    
    let mut validation = Validation::new(header.alg);
    validation.insecure_disable_signature_validation();
    validation.validate_exp = false; // Don't require exp claim
    validation.required_spec_claims.clear(); // Don't require any specific claims
    
    let token_data = decode::<Value>(
        token,
        &DecodingKey::from_secret(&[]),
        &validation,
    )?;
    
    Ok(JwtParts {
        header: serde_json::to_string_pretty(&header)?,
        payload: serde_json::to_string_pretty(&token_data.claims)?,
        signature: parts[2].to_string(),
        is_valid: false,
        algorithm: format!("{:?}", header.alg),
        validation_error: Some("Signature not validated - unsafe mode".to_string()),
    })
}

/// Decode and validate JWT with HMAC secret (HS256/384/512)
pub fn decode_jwt_hmac(
    token: &str,
    secret: &str,
    algorithm: Algorithm,
) -> Result<JwtParts, JwtError> {
    validate_jwt_internal(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        algorithm,
    )
}

/// Decode and validate JWT with RSA public key (RS256/384/512)
pub fn decode_jwt_rsa(
    token: &str,
    public_key_pem: &str,
    algorithm: Algorithm,
) -> Result<JwtParts, JwtError> {
    let key = DecodingKey::from_rsa_pem(public_key_pem.as_bytes())?;
    validate_jwt_internal(token, &key, algorithm)
}

fn validate_jwt_internal(
    token: &str,
    key: &DecodingKey,
    algorithm: Algorithm,
) -> Result<JwtParts, JwtError> {
    let parts: Vec<&str> = token.split('.').collect();
    if parts.len() != 3 {
        return Err(JwtError::InvalidFormat("JWT must have 3 parts".into()));
    }
    
    let header = decode_header(token)?;
    let mut validation = Validation::new(algorithm);
    validation.validate_exp = false; // Don't require exp claim
    validation.required_spec_claims.clear(); // Don't require any specific claims
    
    let token_data = decode::<Value>(token, key, &validation);
    
    let (is_valid, claims, error) = match token_data {
        Ok(data) => (true, data.claims, None),
        Err(e) => {
            // If validation fails, decode without validating to show content
            let mut no_val = Validation::new(algorithm);
            no_val.insecure_disable_signature_validation();
            no_val.validate_exp = false;
            no_val.required_spec_claims.clear();
            let fallback = decode::<Value>(token, &DecodingKey::from_secret(&[]), &no_val)?;
            (false, fallback.claims, Some(e.to_string()))
        }
    };
    
    Ok(JwtParts {
        header: serde_json::to_string_pretty(&header)?,
        payload: serde_json::to_string_pretty(&claims)?,
        signature: parts[2].to_string(),
        is_valid,
        algorithm: format!("{:?}", header.alg),
        validation_error: error,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    
    // Test JWT: {"sub":"1234567890","name":"John Doe","iat":1516239022}
    // Secret: "your-256-bit-secret"
    const TEST_JWT_HS256: &str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    
    #[test]
    fn test_decode_unsafe() {
        let result = decode_jwt_unsafe(TEST_JWT_HS256);
        assert!(result.is_ok());
        let parts = result.unwrap();
        assert!(parts.payload.contains("John Doe"));
        assert!(!parts.is_valid);
        assert!(parts.validation_error.is_some());
    }
    
    #[test]
    fn test_decode_hmac_valid_secret() {
        let secret = "your-256-bit-secret";
        let result = decode_jwt_hmac(TEST_JWT_HS256, secret, Algorithm::HS256);
        assert!(result.is_ok());
        let parts = result.unwrap();
        assert!(parts.is_valid);
        assert!(parts.payload.contains("John Doe"));
        assert_eq!(parts.algorithm, "HS256");
    }
    
    #[test]
    fn test_decode_hmac_invalid_secret() {
        let wrong_secret = "wrong-secret";
        let result = decode_jwt_hmac(TEST_JWT_HS256, wrong_secret, Algorithm::HS256);
        assert!(result.is_ok());
        let parts = result.unwrap();
        assert!(!parts.is_valid);
        assert!(parts.validation_error.is_some());
        assert!(parts.payload.contains("John Doe")); // Still decoded
    }
    
    #[test]
    fn test_invalid_format() {
        assert!(decode_jwt_unsafe("not.a.valid.jwt").is_err());
        assert!(decode_jwt_unsafe("only.two").is_err());
        assert!(decode_jwt_unsafe("single").is_err());
    }
    
    #[test]
    fn test_header_extraction() {
        let result = decode_jwt_unsafe(TEST_JWT_HS256).unwrap();
        assert!(result.header.contains("HS256"));
        assert!(result.header.contains("JWT"));
    }
    
    #[test]
    fn test_signature_extraction() {
        let result = decode_jwt_unsafe(TEST_JWT_HS256).unwrap();
        assert_eq!(result.signature, "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");
    }
}
