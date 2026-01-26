use idna::{domain_to_ascii, domain_to_unicode};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum PunycodeError {
    #[error("Invalid domain name: {0}")]
    InvalidDomain(String),
}

/// Encode internationalized domain to ASCII (Punycode)
/// 
/// # Examples
/// ```
/// use ferrisbox_lib::tools::encoders::punycode::encode_punycode;
/// assert_eq!(encode_punycode("münchen.de").unwrap(), "xn--mnchen-3ya.de");
/// ```
pub fn encode_punycode(domain: &str) -> Result<String, PunycodeError> {
    domain_to_ascii(domain)
        .map_err(|e| PunycodeError::InvalidDomain(e.to_string()))
}

/// Decode Punycode to Unicode domain
/// 
/// # Examples
/// ```
/// use ferrisbox_lib::tools::encoders::punycode::decode_punycode;
/// assert_eq!(decode_punycode("xn--mnchen-3ya.de").unwrap(), "münchen.de");
/// ```
pub fn decode_punycode(encoded: &str) -> Result<String, PunycodeError> {
    let (result, _) = domain_to_unicode(encoded);
    Ok(result)
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_encode_german() {
        assert_eq!(encode_punycode("münchen.de").unwrap(), "xn--mnchen-3ya.de");
    }
    
    #[test]
    fn test_encode_spanish() {
        let result = encode_punycode("español.com").unwrap();
        assert!(result.starts_with("xn--"));
    }
    
    #[test]
    fn test_encode_chinese() {
        let result = encode_punycode("中国.cn");
        assert!(result.is_ok());
        assert!(result.unwrap().starts_with("xn--"));
    }
    
    #[test]
    fn test_encode_arabic() {
        let result = encode_punycode("مصر.eg");
        assert!(result.is_ok());
    }
    
    #[test]
    fn test_decode() {
        assert_eq!(decode_punycode("xn--mnchen-3ya.de").unwrap(), "münchen.de");
    }
    
    #[test]
    fn test_ascii_passthrough() {
        // ASCII domains should pass through unchanged
        assert_eq!(encode_punycode("example.com").unwrap(), "example.com");
    }
    
    #[test]
    fn test_subdomain() {
        let result = encode_punycode("sub.münchen.de");
        assert!(result.is_ok());
        assert!(result.unwrap().contains("xn--"));
    }
    
    #[test]
    fn test_roundtrip() {
        let original = "münchen.de";
        let encoded = encode_punycode(original).unwrap();
        let decoded = decode_punycode(&encoded).unwrap();
        assert_eq!(original, decoded);
    }
}
