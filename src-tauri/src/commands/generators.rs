use crate::tools::generators::hash::{generate_hash, HashAlgorithm};
use crate::tools::generators::uuid::{generate_multiple_uuids, generate_uuid, validate_uuid, UuidVersion};

#[tauri::command]
pub async fn generate_hash_command(input: String, algorithm: HashAlgorithm) -> String {
    generate_hash(&input, &algorithm)
}

#[tauri::command]
pub async fn generate_uuid_command(version: UuidVersion) -> String {
    generate_uuid(&version)
}

#[tauri::command]
pub async fn generate_multiple_uuids_command(version: UuidVersion, count: usize) -> Vec<String> {
    generate_multiple_uuids(&version, count)
}

#[tauri::command]
pub async fn validate_uuid_command(input: String) -> bool {
    validate_uuid(&input)
}
