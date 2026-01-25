use crate::tools::encoders::base64::{decode_base64_text, encode_base64_text};

#[tauri::command]
pub async fn encode_base64_command(text: String) -> String {
    encode_base64_text(&text)
}

#[tauri::command]
pub async fn decode_base64_command(encoded: String) -> Result<String, String> {
    decode_base64_text(&encoded).map_err(|e| e.to_string())
}
