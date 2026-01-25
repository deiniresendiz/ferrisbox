use crate::tools::encoders::base64::{decode_base64_text, encode_base64_text};
use crate::tools::encoders::url::{decode_url, encode_url};

#[tauri::command]
pub async fn encode_base64_command(text: String) -> String {
    encode_base64_text(&text)
}

#[tauri::command]
pub async fn decode_base64_command(encoded: String) -> Result<String, String> {
    decode_base64_text(&encoded).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn encode_url_command(text: String) -> String {
    encode_url(&text)
}

#[tauri::command]
pub async fn decode_url_command(encoded: String) -> Result<String, String> {
    decode_url(&encoded).map_err(|e| e.to_string())
}
