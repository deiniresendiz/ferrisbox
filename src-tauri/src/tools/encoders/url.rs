use percent_encoding::{percent_decode_str, utf8_percent_encode, NON_ALPHANUMERIC};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum UrlError {
    #[error("Invalid UTF-8 in decoded URL")]
    InvalidUtf8,
}

pub fn encode_url(input: &str) -> String {
    utf8_percent_encode(input, NON_ALPHANUMERIC).to_string()
}

pub fn decode_url(input: &str) -> Result<String, UrlError> {
    percent_decode_str(input)
        .decode_utf8()
        .map(|s| s.to_string())
        .map_err(|_| UrlError::InvalidUtf8)
}

pub fn encode_url_component(input: &str) -> String {
    // Solo encode caracteres especiales, preserva / y :
    let mut result = String::new();
    for ch in input.chars() {
        match ch {
            'A'..='Z' | 'a'..='z' | '0'..='9' | '-' | '_' | '.' | '~' | '/' | ':' => {
                result.push(ch);
            }
            _ => {
                result.push_str(&format!("%{:02X}", ch as u8));
            }
        }
    }
    result
}
