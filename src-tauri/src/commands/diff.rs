// Import diff command
pub use crate::tools::diff::diff_text;

#[tauri::command]
pub fn diff_text_command(
    original: String,
    modified: String,
) -> Result<crate::tools::diff::DiffResult, String> {
    crate::tools::diff::diff_text(&original, &modified).map_err(|e| e.to_string())
}
