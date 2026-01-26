use crate::tools::formatters::json::{format_json, minify_json, validate_json};
use crate::tools::formatters::xml::{format_xml, minify_xml, validate_xml};
use crate::tools::formatters::sql::{format_sql, minify_sql, validate_sql, SqlDialect};
use crate::tools::formatters::css::{format_css, minify_css, validate_css};
use crate::tools::formatters::javascript::{format_js, minify_js, validate_js};
use crate::tools::formatters::yaml::{format_yaml, minify_yaml, validate_yaml};
use crate::tools::formatters::rustfmt::{format_rust, validate_rust};

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

// XML commands
#[tauri::command]
pub async fn format_xml_command(input: String, indent: usize) -> Result<String, String> {
    format_xml(&input, indent).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn minify_xml_command(input: String) -> Result<String, String> {
    minify_xml(&input).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn validate_xml_command(input: String) -> Result<bool, String> {
    validate_xml(&input).map_err(|e| e.to_string())
}

// SQL commands
#[tauri::command]
pub async fn format_sql_command(
    input: String,
    dialect: String,
    indent: usize,
    uppercase: bool,
) -> Result<String, String> {
    let sql_dialect = match dialect.as_str() {
        "postgresql" => SqlDialect::PostgreSQL,
        "mysql" => SqlDialect::MySQL,
        "sqlite" => SqlDialect::SQLite,
        _ => SqlDialect::Generic,
    };
    
    format_sql(&input, sql_dialect, indent, uppercase).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn minify_sql_command(input: String) -> Result<String, String> {
    minify_sql(&input).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn validate_sql_command(input: String) -> bool {
    validate_sql(&input)
}

// CSS commands
#[tauri::command]
pub async fn format_css_command(input: String, indent: usize) -> Result<String, String> {
    format_css(&input, indent).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn minify_css_command(input: String) -> Result<String, String> {
    minify_css(&input).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn validate_css_command(input: String) -> bool {
    validate_css(&input)
}

// JavaScript commands
#[tauri::command]
pub async fn format_js_command(input: String, indent: usize) -> Result<String, String> {
    format_js(&input, indent).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn minify_js_command(input: String) -> Result<String, String> {
    minify_js(&input).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn validate_js_command(input: String) -> bool {
    validate_js(&input)
}

// YAML commands
#[tauri::command]
pub async fn format_yaml_command(input: String, indent: usize) -> Result<String, String> {
    format_yaml(&input, indent).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn minify_yaml_command(input: String) -> Result<String, String> {
    minify_yaml(&input).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn validate_yaml_command(input: String) -> bool {
    validate_yaml(&input)
}

// Rust formatter commands
#[tauri::command]
pub async fn format_rust_command(input: String) -> Result<String, String> {
    format_rust(&input).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn validate_rust_command(input: String) -> bool {
    validate_rust(&input)
}
