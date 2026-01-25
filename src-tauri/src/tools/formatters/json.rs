use serde_json::Value;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum FormatError {
    #[error("Invalid JSON: {0}")]
    InvalidJson(#[from] serde_json::Error),
}

pub fn format_json(input: &str, indent: usize) -> Result<String, FormatError> {
    let parsed: Value = serde_json::from_str(input)?;
    
    // Replace default 2-space indent with custom indent
    if indent != 2 {
        let formatted = serde_json::to_string_pretty(&parsed)?;
        let lines: Vec<String> = formatted
            .lines()
            .map(|line| {
                let trimmed = line.trim_start();
                let leading_spaces = line.len() - trimmed.len();
                let new_indent = (leading_spaces / 2) * indent;
                format!("{}{}", " ".repeat(new_indent), trimmed)
            })
            .collect();
        Ok(lines.join("\n"))
    } else {
        Ok(serde_json::to_string_pretty(&parsed)?)
    }
}

pub fn minify_json(input: &str) -> Result<String, FormatError> {
    let parsed: Value = serde_json::from_str(input)?;
    Ok(serde_json::to_string(&parsed)?)
}

pub fn validate_json(input: &str) -> bool {
    serde_json::from_str::<Value>(input).is_ok()
}
