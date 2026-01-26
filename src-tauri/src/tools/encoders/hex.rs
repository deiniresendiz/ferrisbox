use thiserror::Error;

#[derive(Error, Debug)]
pub enum HexError {
    #[error("Invalid hex string: {0}")]
    InvalidHex(String),
    #[error("UTF-8 conversion error: {0}")]
    Utf8Error(#[from] std::string::FromUtf8Error),
}

/// Convert string to hexadecimal
/// 
/// # Examples
/// ```
/// use ferrisbox_lib::tools::encoders::hex::string_to_hex;
/// assert_eq!(string_to_hex("Hello"), "48656c6c6f");
/// ```
pub fn string_to_hex(text: &str) -> String {
    hex::encode(text.as_bytes())
}

/// Convert hexadecimal to string
/// Supports formats: "48656c6c6f", "48 65 6c 6c 6f", "0x48656c6c6f"
/// 
/// # Examples
/// ```
/// use ferrisbox_lib::tools::encoders::hex::hex_to_string;
/// assert_eq!(hex_to_string("48656c6c6f").unwrap(), "Hello");
/// ```
pub fn hex_to_string(hex_str: &str) -> Result<String, HexError> {
    // Clean input: remove spaces and 0x prefix
    let cleaned = hex_str
        .replace(" ", "")
        .replace("0x", "")
        .replace("0X", "");
    
    let decoded = hex::decode(&cleaned)
        .map_err(|e| HexError::InvalidHex(e.to_string()))?;
    
    Ok(String::from_utf8(decoded)?)
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_string_to_hex() {
        assert_eq!(string_to_hex("Hello"), "48656c6c6f");
    }
    
    #[test]
    fn test_hex_to_string() {
        assert_eq!(hex_to_string("48656c6c6f").unwrap(), "Hello");
    }
    
    #[test]
    fn test_hex_with_spaces() {
        assert_eq!(hex_to_string("48 65 6c 6c 6f").unwrap(), "Hello");
    }
    
    #[test]
    fn test_hex_with_prefix() {
        assert_eq!(hex_to_string("0x48656c6c6f").unwrap(), "Hello");
        assert_eq!(hex_to_string("0X48656c6c6f").unwrap(), "Hello");
    }
    
    #[test]
    fn test_invalid_hex() {
        assert!(hex_to_string("ZZZ").is_err());
        assert!(hex_to_string("GHIJ").is_err());
    }
    
    #[test]
    fn test_unicode() {
        let original = "Hola 你好 مرحبا";
        let hex = string_to_hex(original);
        let decoded = hex_to_string(&hex).unwrap();
        assert_eq!(original, decoded);
    }
    
    #[test]
    fn test_empty_string() {
        assert_eq!(string_to_hex(""), "");
        assert_eq!(hex_to_string("").unwrap(), "");
    }
    
    #[test]
    fn test_special_characters() {
        let original = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
        let hex = string_to_hex(original);
        let decoded = hex_to_string(&hex).unwrap();
        assert_eq!(original, decoded);
    }
}
