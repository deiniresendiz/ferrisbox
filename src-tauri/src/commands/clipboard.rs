use crate::utils::detector::{detect_content_type, ContentType};

#[tauri::command]
pub async fn detect_clipboard_content(content: String) -> ContentType {
    detect_content_type(&content)
}
