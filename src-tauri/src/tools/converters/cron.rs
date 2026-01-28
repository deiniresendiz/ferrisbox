use cron::Schedule;
use chrono::Utc;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct CronOutput {
    expression: String,
    description: String,
    next_runs: Vec<String>,
    timezone: String,
    valid: bool,
}

#[derive(Serialize, Deserialize)]
pub struct CronInput {
    expression: String,
    limit: Option<usize>,
    timezone: Option<String>,
}

pub fn parse_cron_command(
    expression: String,
    limit: Option<usize>,
    timezone: Option<String>,
) -> Result<CronOutput, String> {
    let limit = limit.unwrap_or(5);
    
    let schedule = expression.parse::<Schedule>()
        .map_err(|e| format!("Invalid cron expression: {}", e))?;
    
    let description = describe_cron_expression(&expression)?;
    
    let tz_name = timezone.as_deref().unwrap_or("UTC");
    let next_runs: Vec<String> = schedule
        .upcoming(Utc)
        .take(limit)
        .map(|dt| dt.to_rfc3339_opts(chrono::SecondsFormat::Secs, true))
        .collect();

    Ok(CronOutput {
        expression,
        description,
        next_runs,
        timezone: tz_name.to_string(),
        valid: true,
    })
}

fn describe_cron_expression(expression: &str) -> Result<String, String> {
    let normalized = expression.trim().to_lowercase();
    
    match normalized.as_str() {
        "@yearly" | "@annually" => {
            Ok("Run once a year, at midnight of January 1st".to_string())
        }
        "@monthly" => {
            Ok("Run once a month, at midnight of the first day of the month".to_string())
        }
        "@weekly" => {
            Ok("Run once a week at midnight on Sunday".to_string())
        }
        "@daily" | "@midnight" => {
            Ok("Run every day at midnight".to_string())
        }
        "@hourly" => {
            Ok("Run every hour at the start of the hour".to_string())
        }
        "@reboot" => {
            Ok("Run at system reboot".to_string())
        }
        _ => parse_standard_cron(expression),
    }
}

fn parse_standard_cron(expression: &str) -> Result<String, String> {
    let parts: Vec<&str> = expression.split_whitespace().collect();
    
    if parts.len() != 5 {
        return Err("Invalid cron expression. Expected 5 parts (minute hour day month weekday).".to_string());
    }
    
    let (minute, hour, day, month, weekday) = (
        parts.get(0).unwrap_or(&"*"),
        parts.get(1).unwrap_or(&"*"),
        parts.get(2).unwrap_or(&"*"),
        parts.get(3).unwrap_or(&"*"),
        parts.get(4).unwrap_or(&"*"),
    );
    
    let mut description = String::new();
    
    if minute != &"*" {
        let min_desc = if minute.contains('/') {
            format!("At minute {}", parse_cron_list(minute))
        } else if minute.contains('-') {
            let parts: Vec<&str> = minute.split('-').collect();
            let first = parts.get(0).unwrap_or(&"*");
            let last = parts.get(1).unwrap_or(&"*");
            format!("From {} to {}", first, last)
        } else {
            format!("At minute {}", minute)
        };
        description.push_str(&min_desc);
    }

    if hour != &"*" {
        let hour_desc = if hour.contains('/') {
            format!("At hour {}", parse_cron_list(hour))
        } else if hour.contains('-') {
            let parts: Vec<&str> = hour.split('-').collect();
            let first = parts.get(0).unwrap_or(&"*");
            let last = parts.get(1).unwrap_or(&"*");
            format!("From {} to {}", first, last)
        } else {
            format!("At hour {}", hour)
        };
        description.push_str(&hour_desc);
    }
    
    if day != &"*" {
        description.push_str(&format!("on day of month {}", day));
    }
    
    if month != &"*" {
        description.push_str(&format!("in {}", month));
    }
    
    if weekday != &"*" {
        description.push_str(&format!("on {}", weekday));
    }
    
    Ok(description)
}

fn parse_cron_list(cron_part: &str) -> String {
    if cron_part.contains(',') {
        let parts: Vec<&str> = cron_part.split(',').collect();
        parts.join(" and ")
    } else {
        cron_part.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_cron() {
        let result = parse_cron_command("0 0 * * *".to_string(), Some(5), Some("UTC".to_string())).unwrap();
        assert!(result.valid);
        assert!(result.next_runs.len() <= 5);
    }

    #[test]
    fn test_parse_cron_invalid() {
        let result = parse_cron_command("invalid".to_string(), Some(5), Some("UTC".to_string()));
        assert!(result.is_err());
    }

    #[test]
    fn test_invalid_cron() {
        let result = parse_cron_command("invalid expression".to_string(), Some(5), Some("UTC".to_string()));
        assert!(result.is_err());
    }

    #[test]
    fn test_at_keyword() {
        let result = parse_cron_command("@hourly".to_string(), Some(5), Some("UTC".to_string())).unwrap();
        assert!(result.valid);
        assert!(result.description.contains("every hour"));
    }

    #[test]
    fn test_weekly_cron() {
        let result = parse_cron_command("0 0 * * 0".to_string(), Some(5), Some("UTC".to_string())).unwrap();
        assert!(result.valid);
        assert!(result.next_runs.len() >= 5);
        assert!(result.description.contains("on Sunday"));
    }

    #[test]
    fn test_yearly_cron() {
        let result = parse_cron_command("@yearly".to_string(), Some(5), Some("UTC".to_string())).unwrap();
        assert!(result.valid);
        assert!(result.description.contains("once a year"));
    }
}
