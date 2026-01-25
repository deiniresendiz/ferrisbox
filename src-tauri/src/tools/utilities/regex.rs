use regex::Regex;
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum RegexError {
    #[error("Invalid regex pattern: {0}")]
    InvalidPattern(#[from] regex::Error),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RegexMatch {
    pub full_match: String,
    pub start: usize,
    pub end: usize,
    pub groups: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RegexTestResult {
    pub matches: Vec<RegexMatch>,
    pub total_matches: usize,
}

pub fn test_regex(pattern: &str, text: &str, case_insensitive: bool) -> Result<RegexTestResult, RegexError> {
    let pattern_str = if case_insensitive {
        format!("(?i){}", pattern)
    } else {
        pattern.to_string()
    };

    let re = Regex::new(&pattern_str)?;
    
    let matches: Vec<RegexMatch> = re
        .captures_iter(text)
        .map(|cap| {
            let full_match = cap.get(0).unwrap();
            let groups: Vec<String> = cap
                .iter()
                .skip(1)
                .filter_map(|m| m.map(|m| m.as_str().to_string()))
                .collect();

            RegexMatch {
                full_match: full_match.as_str().to_string(),
                start: full_match.start(),
                end: full_match.end(),
                groups,
            }
        })
        .collect();

    let total_matches = matches.len();

    Ok(RegexTestResult {
        matches,
        total_matches,
    })
}

pub fn validate_regex(pattern: &str) -> bool {
    Regex::new(pattern).is_ok()
}
