use crate::tools::utilities::regex::{test_regex, validate_regex, RegexTestResult};

#[tauri::command]
pub async fn test_regex_command(
    pattern: String,
    text: String,
    case_insensitive: bool,
) -> Result<RegexTestResult, String> {
    test_regex(&pattern, &text, case_insensitive).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn validate_regex_command(pattern: String) -> bool {
    validate_regex(&pattern)
}
