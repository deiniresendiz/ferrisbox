use crate::tools::converters::{
    json_yaml, csv_json, markdown_html, number_base, timestamp, color, units, cron, case,
};

#[tauri::command]
pub fn json_to_yaml_command(json: String, indent: usize) -> Result<String, String> {
    json_yaml::json_to_yaml_command(json, indent)
}

#[tauri::command]
pub fn yaml_to_json_command(yaml: String, indent: usize) -> Result<String, String> {
    json_yaml::yaml_to_json_command(yaml, indent)
}

#[tauri::command]
pub fn csv_to_json_command(
    csv: String,
    delimiter: Option<String>,
    has_header: bool,
) -> Result<String, String> {
    csv_json::csv_to_json_command(csv, delimiter, has_header)
}

#[tauri::command]
pub fn markdown_to_html_command(
    md: String,
    options: Option<markdown_html::MarkdownOptions>,
) -> Result<String, String> {
    markdown_html::markdown_to_html_command(md, options)
}

#[tauri::command]
pub fn convert_number_base_command(
    input: String,
    from_base: u8,
) -> Result<number_base::NumberBaseOutput, String> {
    number_base::convert_number_base_command(input, from_base)
}

#[tauri::command]
pub fn convert_timestamp_command(
    timestamp: i64,
    unit: String,
    timezone: Option<String>,
) -> Result<timestamp::TimestampOutput, String> {
    timestamp::convert_timestamp_command(timestamp, unit, timezone)
}

#[tauri::command]
pub fn date_to_timestamp_command(
    date_string: String,
    format: Option<String>,
) -> Result<i64, String> {
    timestamp::date_to_timestamp_command(date_string, format)
}

#[tauri::command]
pub fn convert_color_command(
    color: String,
    format: String,
) -> Result<color::ColorOutput, String> {
    color::convert_color_command(color, format)
}

#[tauri::command]
pub fn convert_data_units_command(
    value: f64,
    from_unit: units::DataUnit,
    to_unit: units::DataUnit,
) -> Result<units::ConversionResult, String> {
    units::convert_data_units_command(value, from_unit, to_unit)
}

#[tauri::command]
pub fn convert_time_units_command(
    value: f64,
    from_unit: units::TimeUnit,
    to_unit: units::TimeUnit,
) -> Result<units::ConversionResult, String> {
    units::convert_time_units_command(value, from_unit, to_unit)
}

#[tauri::command]
pub fn convert_frequency_units_command(
    value: f64,
    from_unit: units::FrequencyUnit,
    to_unit: units::FrequencyUnit,
) -> Result<units::ConversionResult, String> {
    units::convert_frequency_units_command(value, from_unit, to_unit)
}

#[tauri::command]
pub fn parse_cron_command(
    expression: String,
    limit: Option<usize>,
    timezone: Option<String>,
) -> Result<cron::CronOutput, String> {
    cron::parse_cron_command(expression, limit, timezone)
}

#[tauri::command]
pub fn convert_case_command(text: String, target_case: String) -> Result<String, String> {
    case::convert_case_command(text, target_case)
}
