use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum UuidVersion {
    V4,
    V7,
}

pub fn generate_uuid(version: &UuidVersion) -> String {
    match version {
        UuidVersion::V4 => Uuid::new_v4().to_string(),
        UuidVersion::V7 => Uuid::now_v7().to_string(),
    }
}

pub fn generate_multiple_uuids(version: &UuidVersion, count: usize) -> Vec<String> {
    (0..count).map(|_| generate_uuid(version)).collect()
}

pub fn validate_uuid(input: &str) -> bool {
    Uuid::parse_str(input).is_ok()
}
