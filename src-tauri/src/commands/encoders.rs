use crate::tools::encoders::base64::{decode_base64_text, encode_base64_text};
use crate::tools::encoders::url::{decode_url, encode_url};
use crate::tools::encoders::hex::{hex_to_string, string_to_hex};
use crate::tools::encoders::html::{decode_html, encode_html_named, encode_html_numeric, encode_html_hex};
use crate::tools::encoders::punycode::{encode_punycode, decode_punycode};
use crate::tools::encoders::morse::{encode_morse, decode_morse};
use crate::tools::encoders::image::{encode_image_to_base64, decode_image_from_base64, get_extension_from_mime};

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

// Hex converter commands
#[tauri::command]
pub async fn string_to_hex_command(text: String) -> String {
    string_to_hex(&text)
}

#[tauri::command]
pub async fn hex_to_string_command(hex: String) -> Result<String, String> {
    hex_to_string(&hex).map_err(|e| e.to_string())
}

// HTML entities commands
#[tauri::command]
pub async fn encode_html_command(text: String, format: String) -> String {
    match format.as_str() {
        "numeric" => encode_html_numeric(&text),
        "hex" => encode_html_hex(&text),
        _ => encode_html_named(&text), // Default to named
    }
}

#[tauri::command]
pub async fn decode_html_command(encoded: String) -> Result<String, String> {
    decode_html(&encoded).map_err(|e| e.to_string())
}

// Punycode commands
#[tauri::command]
pub async fn encode_punycode_command(domain: String) -> Result<String, String> {
    encode_punycode(&domain).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn decode_punycode_command(encoded: String) -> Result<String, String> {
    decode_punycode(&encoded).map_err(|e| e.to_string())
}

// Morse code commands
#[tauri::command]
pub async fn encode_morse_command(text: String) -> Result<String, String> {
    encode_morse(&text).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn decode_morse_command(morse: String) -> Result<String, String> {
    decode_morse(&morse).map_err(|e| e.to_string())
}

// Image to Base64 commands
#[tauri::command]
pub async fn encode_image_to_base64_command(file_path: String) -> Result<String, String> {
    encode_image_to_base64(&file_path).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn decode_image_from_base64_command(data_url: String) -> Result<(Vec<u8>, String, String), String> {
    let (bytes, mime_type) = decode_image_from_base64(&data_url).map_err(|e| e.to_string())?;
    let extension = get_extension_from_mime(&mime_type).to_string();
    Ok((bytes, mime_type, extension))
}
