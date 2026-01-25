use crate::tools::formatters::json::{format_json, minify_json, validate_json};

#[tauri::command]
pub async fn format_json_command(input: String, indent: usize) -> Result<String, String> {
    format_json(&input, indent).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn minify_json_command(input: String) -> Result<String, String> {
    minify_json(&input).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn validate_json_command(input: String) -> bool {
    validate_json(&input)
}
