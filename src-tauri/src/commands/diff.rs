pub use crate::tools::diff::diff_text;

#[tauri::command]
pub fn diff_text_command(
    original: String,
    modified: String,
) -> Result<crate::tools::diff::DiffOutput, String> {
    crate::tools::diff::diff_text(&original, &modified)
}
