use crate::tools::utilities::regex::{test_regex, validate_regex, RegexTestResult};
use crate::tools::utilities::jwt::{decode_jwt_unsafe, decode_jwt_hmac, decode_jwt_rsa, JwtParts};
use crate::tools::utilities::compression::{
    compress_gzip, compress_zlib, decompress_gzip, decompress_zlib, CompressionResult
};
use jsonwebtoken::Algorithm;

#[tauri::command]
pub async fn test_regex_command(
    pattern: String,
    text: String,
    case_insensitive: bool,
) -> Result<RegexTestResult, String> {
    test_regex(&pattern, &text, case_insensitive).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn validate_regex_command(pattern: String) -> bool {
    validate_regex(&pattern)
}

// JWT commands
#[tauri::command]
pub async fn decode_jwt_unsafe_command(token: String) -> Result<JwtParts, String> {
    decode_jwt_unsafe(&token).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn validate_jwt_hmac_command(
    token: String,
    secret: String,
    algorithm: String,
) -> Result<JwtParts, String> {
    let alg = match algorithm.as_str() {
        "HS256" => Algorithm::HS256,
        "HS384" => Algorithm::HS384,
        "HS512" => Algorithm::HS512,
        _ => return Err("Unsupported HMAC algorithm".to_string()),
    };
    decode_jwt_hmac(&token, &secret, alg).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn validate_jwt_rsa_command(
    token: String,
    public_key: String,
    algorithm: String,
) -> Result<JwtParts, String> {
    let alg = match algorithm.as_str() {
        "RS256" => Algorithm::RS256,
        "RS384" => Algorithm::RS384,
        "RS512" => Algorithm::RS512,
        _ => return Err("Unsupported RSA algorithm".to_string()),
    };
    decode_jwt_rsa(&token, &public_key, alg).map_err(|e| e.to_string())
}

// Compression commands
#[tauri::command]
pub async fn compress_gzip_command(
    data: String,
    level: u32,
) -> Result<CompressionResult, String> {
    compress_gzip(&data, level).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn decompress_gzip_command(base64_data: String) -> Result<String, String> {
    decompress_gzip(&base64_data).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn compress_zlib_command(
    data: String,
    level: u32,
) -> Result<CompressionResult, String> {
    compress_zlib(&data, level).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn decompress_zlib_command(base64_data: String) -> Result<String, String> {
    decompress_zlib(&base64_data).map_err(|e| e.to_string())
}
