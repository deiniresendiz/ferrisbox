use once_cell::sync::Lazy;
use regex::Regex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, PartialEq, Clone)]
#[serde(rename_all = "camelCase")]
pub enum ContentType {
    Json,
    Base64,
    Uuid,
    Url,
    Hash,
    Unknown,
}

static JSON_REGEX: Lazy<Regex> = Lazy::new(|| Regex::new(r"^\s*[\{\[]").unwrap());
static BASE64_REGEX: Lazy<Regex> = Lazy::new(|| Regex::new(r"^[A-Za-z0-9+/]+=*$").unwrap());
static UUID_REGEX: Lazy<Regex> =
    Lazy::new(|| Regex::new(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$").unwrap());
static URL_REGEX: Lazy<Regex> = Lazy::new(|| Regex::new(r"^https?://").unwrap());
static HASH_REGEX: Lazy<Regex> = Lazy::new(|| Regex::new(r"^[a-f0-9]{32}$|^[a-f0-9]{64}$").unwrap());

pub fn detect_content_type(content: &str) -> ContentType {
    let trimmed = content.trim();

    // JSON (alta prioridad)
    if JSON_REGEX.is_match(trimmed) {
        if serde_json::from_str::<serde_json::Value>(trimmed).is_ok() {
            return ContentType::Json;
        }
    }

    // UUID
    if UUID_REGEX.is_match(trimmed) {
        return ContentType::Uuid;
    }

    // URL
    if URL_REGEX.is_match(trimmed) {
        return ContentType::Url;
    }

    // Hash (MD5 o SHA-256)
    if HASH_REGEX.is_match(trimmed) {
        return ContentType::Hash;
    }

    // Base64 (baja prioridad, puede dar falsos positivos)
    if trimmed.len() > 20 && trimmed.len() % 4 == 0 && BASE64_REGEX.is_match(trimmed) {
        return ContentType::Base64;
    }

    ContentType::Unknown
}
