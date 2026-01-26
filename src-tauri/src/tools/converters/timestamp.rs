use chrono::{DateTime, TimeZone, Utc, Local};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct TimestampOutput {
    unix_timestamp: i64,
    unix_timestamp_ms: i64,
    utc_iso8601: String,
    local_iso8601: String,
    utc_readable: String,
    local_readable: String,
    relative: String,
}

#[derive(Serialize, Deserialize)]
pub struct TimestampInput {
    timestamp: Option<i64>,
    date_string: Option<String>,
    timezone: Option<String>,
}

#[tauri::command]
pub fn convert_timestamp_command(
    timestamp: i64,
    unit: String,
    timezone: Option<String>,
) -> Result<TimestampOutput, String> {
    let seconds = if unit == "milliseconds" {
        timestamp / 1000
    } else {
        timestamp
    };
    
    let utc_dt = Utc.timestamp_opt(seconds, 0)
        .single()
        .ok_or("Invalid timestamp")?;
    
    let local_dt = utc_dt.with_timezone(&Local);
    
    Ok(TimestampOutput {
        unix_timestamp: seconds,
        unix_timestamp_ms: timestamp,
        utc_iso8601: utc_dt.to_rfc3339_opts(chrono::SecondsFormat::Secs, true),
        local_iso8601: local_dt.to_rfc3339_opts(chrono::SecondsFormat::Secs, true),
        utc_readable: utc_dt.format("%Y-%m-%d %H:%M:%S UTC").to_string(),
        local_readable: local_dt.format("%Y-%m-%d %H:%M:%S %Z").to_string(),
        relative: format_time_ago(&utc_dt),
    })
}

#[tauri::command]
pub fn date_to_timestamp_command(
    date_string: String,
    format: String,
) -> Result<i64, String> {
    let dt = match format.as_str() {
        "iso8601" => DateTime::parse_from_rfc3339(&date_string)
            .map_err(|e| e.to_string())?,
        "rfc2822" => DateTime::parse_from_rfc2822(&date_string)
            .map_err(|e| e.to_string())?,
        _ => return Err("Unsupported format".to_string()),
    };
    
    Ok(dt.timestamp())
}

fn format_time_ago(dt: &DateTime<Utc>) -> String {
    let now = Utc::now();
    let duration = now.signed_duration_since(*dt);
    
    let seconds = duration.num_seconds().abs();
    
    if seconds < 60 {
        format!("{} seconds ago", seconds)
    } else if seconds < 3600 {
        format!("{} minutes ago", seconds / 60)
    } else if seconds < 86400 {
        format!("{} hours ago", seconds / 3600)
    } else if seconds < 2592000 {
        format!("{} days ago", seconds / 86400)
    } else {
        format!("{} months ago", seconds / 2592000)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_timestamp_to_date() {
        let result = convert_timestamp_command(1700000000, "seconds".to_string(), None);
        assert!(result.is_ok());
        let output = result.unwrap();
        assert!(output.unix_timestamp == 1700000000);
        assert!(output.utc_iso8601.starts_with("2024"));
    }

    #[test]
    fn test_date_to_timestamp() {
        let result = date_to_timestamp_command("2024-01-01T00:00:00Z".to_string(), "iso8601".to_string());
        assert!(result.is_ok());
        assert_eq!(result, 1704067200);
    }

    #[test]
    fn test_milliseconds() {
        let result = convert_timestamp_command(1700000000000, "milliseconds".to_string(), None);
        assert!(result.is_ok());
        assert_eq!(result.unwrap().unix_timestamp, 1700000000);
    }

    #[test]
    fn test_invalid_timestamp() {
        let result = convert_timestamp_command(-9999999999999, "seconds".to_string(), None);
        assert!(result.is_err());
    }

    #[test]
    fn test_invalid_date() {
        let result = date_to_timestamp_command("invalid date".to_string(), "iso8601".to_string());
        assert!(result.is_err());
    }
}
