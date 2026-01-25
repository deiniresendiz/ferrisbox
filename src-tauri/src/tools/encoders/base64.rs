use base64::engine::general_purpose;
use base64::Engine;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum Base64Error {
    #[error("Decode error: {0}")]
    DecodeError(#[from] base64::DecodeError),
    #[error("UTF-8 error: {0}")]
    Utf8Error(#[from] std::string::FromUtf8Error),
}

pub fn encode_base64(data: &[u8]) -> String {
    general_purpose::STANDARD.encode(data)
}

pub fn encode_base64_text(text: &str) -> String {
    encode_base64(text.as_bytes())
}

pub fn decode_base64(encoded: &str) -> Result<Vec<u8>, Base64Error> {
    Ok(general_purpose::STANDARD.decode(encoded)?)
}

pub fn decode_base64_text(encoded: &str) -> Result<String, Base64Error> {
    let decoded = decode_base64(encoded)?;
    Ok(String::from_utf8(decoded)?)
}
