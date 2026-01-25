use crate::tools::generators::hash::{generate_hash, HashAlgorithm};

#[tauri::command]
pub async fn generate_hash_command(input: String, algorithm: HashAlgorithm) -> String {
    generate_hash(&input, &algorithm)
}
