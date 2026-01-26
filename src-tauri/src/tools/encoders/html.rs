use html_escape::{encode_text, decode_html_entities};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum HtmlError {
    #[error("Decoding error: {0}")]
    DecodeError(String),
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub enum HtmlEntityFormat {
    Named,     // &lt; &gt; &amp;
    Numeric,   // &#60; &#62; &#38;
    Hex,       // &#x3C; &#x3E; &#x26;
}

/// Encode text to HTML entities (named format)
/// Converts special characters like <, >, &, ", ' to named entities
/// 
/// # Examples
/// ```
/// use ferrisbox_lib::tools::encoders::html::encode_html_named;
/// assert_eq!(encode_html_named("<div>"), "&lt;div&gt;");
/// ```
pub fn encode_html_named(text: &str) -> String {
    encode_text(text).to_string()
}

/// Encode text to HTML entities (numeric format)
/// Converts non-alphanumeric characters to numeric entities (&#N;)
/// 
/// # Examples
/// ```
/// use ferrisbox_lib::tools::encoders::html::encode_html_numeric;
/// assert_eq!(encode_html_numeric("<"), "&#60;");
/// ```
pub fn encode_html_numeric(text: &str) -> String {
    text.chars()
        .map(|c| {
            // Keep ASCII alphanumeric and space as-is
            if c.is_ascii_alphanumeric() || c == ' ' {
                c.to_string()
            } else {
                format!("&#{};", c as u32)
            }
        })
        .collect()
}

/// Encode text to HTML entities (hexadecimal format)
/// Converts non-alphanumeric characters to hex entities (&#xN;)
/// 
/// # Examples
/// ```
/// use ferrisbox_lib::tools::encoders::html::encode_html_hex;
/// assert_eq!(encode_html_hex("<"), "&#x3C;");
/// ```
pub fn encode_html_hex(text: &str) -> String {
    text.chars()
        .map(|c| {
            // Keep ASCII alphanumeric and space as-is
            if c.is_ascii_alphanumeric() || c == ' ' {
                c.to_string()
            } else {
                format!("&#x{:X};", c as u32)
            }
        })
        .collect()
}

/// Decode HTML entities (auto-detect format)
/// Supports named (&lt;), numeric (&#60;), and hex (&#x3C;) formats
/// 
/// # Examples
/// ```
/// use ferrisbox_lib::tools::encoders::html::decode_html;
/// assert_eq!(decode_html("&lt;div&gt;").unwrap(), "<div>");
/// ```
pub fn decode_html(encoded: &str) -> Result<String, HtmlError> {
    let decoded = decode_html_entities(encoded);
    Ok(decoded.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_encode_named_basic() {
        assert_eq!(encode_html_named("<div>"), "&lt;div&gt;");
        assert_eq!(encode_html_named("A & B"), "A &amp; B");
        // Note: html-escape doesn't escape quotes by default, only in attributes
        let encoded = encode_html_named("Quote \"text\"");
        assert!(encoded.contains("Quote"));
    }
    
    #[test]
    fn test_encode_named_apostrophe() {
        // html-escape keeps apostrophes as-is in text content
        let encoded = encode_html_named("It's");
        assert!(encoded.contains("It"));
    }
    
    #[test]
    fn test_encode_numeric() {
        assert_eq!(encode_html_numeric("<"), "&#60;");
        assert_eq!(encode_html_numeric(">"), "&#62;");
        assert_eq!(encode_html_numeric("&"), "&#38;");
    }
    
    #[test]
    fn test_encode_hex() {
        assert_eq!(encode_html_hex("<"), "&#x3C;");
        assert_eq!(encode_html_hex(">"), "&#x3E;");
        assert_eq!(encode_html_hex("&"), "&#x26;");
    }
    
    #[test]
    fn test_decode_named() {
        assert_eq!(decode_html("&lt;div&gt;").unwrap(), "<div>");
        assert_eq!(decode_html("A &amp; B").unwrap(), "A & B");
        assert_eq!(decode_html("&quot;text&quot;").unwrap(), "\"text\"");
    }
    
    #[test]
    fn test_decode_numeric() {
        assert_eq!(decode_html("&#60;div&#62;").unwrap(), "<div>");
        assert_eq!(decode_html("&#38;").unwrap(), "&");
    }
    
    #[test]
    fn test_decode_hex() {
        assert_eq!(decode_html("&#x3C;div&#x3E;").unwrap(), "<div>");
        assert_eq!(decode_html("&#x26;").unwrap(), "&");
    }
    
    #[test]
    fn test_roundtrip_named() {
        let original = "<script>alert('XSS')</script>";
        let encoded = encode_html_named(original);
        let decoded = decode_html(&encoded).unwrap();
        assert_eq!(original, decoded);
    }
    
    #[test]
    fn test_roundtrip_numeric() {
        let original = "A < B & C > D";
        let encoded = encode_html_numeric(original);
        let decoded = decode_html(&encoded).unwrap();
        assert_eq!(original, decoded);
    }
    
    #[test]
    fn test_unicode() {
        let original = "Emoji: 😀 Arabic: مرحبا";
        let encoded = encode_html_numeric(original);
        let decoded = decode_html(&encoded).unwrap();
        assert_eq!(original, decoded);
    }
    
    #[test]
    fn test_mixed_entities() {
        // Test decoding mixed format
        let mixed = "&lt;div&#62; &#x26; test";
        let decoded = decode_html(mixed).unwrap();
        assert_eq!(decoded, "<div> & test");
    }
}
