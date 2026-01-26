use crate::tools::generators::{
    bcrypt_hash, bcrypt_verify, generate_all_hashes, generate_git_branch_name, generate_gitignore,
    generate_hmac, generate_lorem, generate_password, generate_qr_code, generate_wifi_qr,
    generate_rsa_key_pair, generate_uuid, generate_multiple_uuids, validate_uuid,
    BcryptHashOutput, BranchNameOutput, GitignoreTemplate, HmacAlgorithm, LoremOutput,
    MultiHash, PasswordOutput, QrOutput, RsaKeyPair, RsaKeySize, UuidVersion,
    WifiCredentials,
};

#[tauri::command]
pub async fn generate_hash_command(input: String, algorithm: String) -> String {
    let hash_algo = match algorithm.as_str() {
        "MD5" => crate::tools::generators::HashAlgorithm::MD5,
        "SHA1" => crate::tools::generators::HashAlgorithm::SHA1,
        "SHA256" => crate::tools::generators::HashAlgorithm::SHA256,
        "SHA512" => crate::tools::generators::HashAlgorithm::SHA512,
        _ => return String::new(),
    };
    crate::tools::generators::generate_hash(&input, &hash_algo)
}

#[tauri::command]
pub async fn generate_all_hashes_command(input: String) -> MultiHash {
    generate_all_hashes(&input)
}

#[tauri::command]
pub async fn generate_uuid_command(version: String) -> String {
    let uuid_version = match version.as_str() {
        "v1" => UuidVersion::V1,
        "v4" => UuidVersion::V4,
        "v7" => UuidVersion::V7,
        _ => return String::new(),
    };
    generate_uuid(&uuid_version)
}

#[tauri::command]
pub async fn generate_multiple_uuids_command(
    version: String,
    count: usize,
) -> Vec<String> {
    let uuid_version = match version.as_str() {
        "v1" => UuidVersion::V1,
        "v4" => UuidVersion::V4,
        "v7" => UuidVersion::V7,
        _ => return vec![],
    };
    generate_multiple_uuids(&uuid_version, count)
}

#[tauri::command]
pub async fn validate_uuid_command(input: String) -> bool {
    validate_uuid(&input)
}

#[tauri::command]
pub async fn generate_lorem_command(lorem_type: String, count: usize) -> LoremOutput {
    let ltype = match lorem_type.as_str() {
        "paragraphs" => crate::tools::generators::LoremType::Paragraphs,
        "words" => crate::tools::generators::LoremType::Words,
        _ => crate::tools::generators::LoremType::Paragraphs,
    };
    generate_lorem(&ltype, count)
}

#[tauri::command]
pub async fn generate_password_command(
    length: usize,
    uppercase: bool,
    lowercase: bool,
    numbers: bool,
    symbols: bool,
) -> PasswordOutput {
    let options = crate::tools::generators::PasswordOptions {
        length,
        uppercase,
        lowercase,
        numbers,
        symbols,
    };
    generate_password(&options)
}

#[tauri::command]
pub async fn generate_hmac_command(
    message: String,
    secret: String,
    algorithm: String,
) -> Result<String, String> {
    let hmac_algo = match algorithm.as_str() {
        "SHA1" => HmacAlgorithm::SHA1,
        "SHA256" => HmacAlgorithm::SHA256,
        "SHA512" => HmacAlgorithm::SHA512,
        _ => return Err("Invalid HMAC algorithm".to_string()),
    };
    generate_hmac(&message, &secret, &hmac_algo)
}

#[tauri::command]
pub async fn generate_qr_command(text: String) -> QrOutput {
    generate_qr_code(&text)
}

#[tauri::command]
pub async fn generate_wifi_qr_command(
    ssid: String,
    password: Option<String>,
    encryption: String,
) -> QrOutput {
    let creds = WifiCredentials {
        ssid,
        password,
        encryption,
    };
    generate_wifi_qr(&creds)
}

#[tauri::command]
pub async fn generate_gitignore_command(templates: Vec<String>) -> String {
    let gitignore_templates: Vec<GitignoreTemplate> = templates
        .into_iter()
        .filter_map(|t| match t.as_str() {
            "rust" => Some(GitignoreTemplate::Rust),
            "python" => Some(GitignoreTemplate::Python),
            "javascript" => Some(GitignoreTemplate::JavaScript),
            "typescript" => Some(GitignoreTemplate::TypeScript),
            "java" => Some(GitignoreTemplate::Java),
            "go" => Some(GitignoreTemplate::Go),
            "php" => Some(GitignoreTemplate::Php),
            "ruby" => Some(GitignoreTemplate::Ruby),
            "cpp" => Some(GitignoreTemplate::Cpp),
            "csharp" => Some(GitignoreTemplate::Csharp),
            "swift" => Some(GitignoreTemplate::Swift),
            "kotlin" => Some(GitignoreTemplate::Kotlin),
            "node" => Some(GitignoreTemplate::Node),
            "django" => Some(GitignoreTemplate::Django),
            "rails" => Some(GitignoreTemplate::Rails),
            "laravel" => Some(GitignoreTemplate::Laravel),
            "spring" => Some(GitignoreTemplate::Spring),
            "maven" => Some(GitignoreTemplate::Maven),
            "gradle" => Some(GitignoreTemplate::Gradle),
            "npm" => Some(GitignoreTemplate::Npm),
            "yarn" => Some(GitignoreTemplate::Yarn),
            "pnpm" => Some(GitignoreTemplate::Pnpm),
            "cargo" => Some(GitignoreTemplate::Cargo),
            "pip" => Some(GitignoreTemplate::Pip),
            "pipenv" => Some(GitignoreTemplate::Pipenv),
            "poetry" => Some(GitignoreTemplate::Poetry),
            "docker" => Some(GitignoreTemplate::Docker),
            "kubernetes" => Some(GitignoreTemplate::Kubernetes),
            "terraform" => Some(GitignoreTemplate::Terraform),
            "ansible" => Some(GitignoreTemplate::Ansible),
            "helm" => Some(GitignoreTemplate::Helm),
            "aws" => Some(GitignoreTemplate::Aws),
            "googlecloud" => Some(GitignoreTemplate::GoogleCloud),
            "azure" => Some(GitignoreTemplate::Azure),
            "vscode" => Some(GitignoreTemplate::VSCode),
            "intellij" => Some(GitignoreTemplate::IntelliJ),
            "eclipse" => Some(GitignoreTemplate::Eclipse),
            "macos" => Some(GitignoreTemplate::MacOs),
            "windows" => Some(GitignoreTemplate::Windows),
            "linux" => Some(GitignoreTemplate::Linux),
            "git" => Some(GitignoreTemplate::Git),
            "env" => Some(GitignoreTemplate::Env),
            "vagrant" => Some(GitignoreTemplate::Vagrant),
            _ => None,
        })
        .collect();
    generate_gitignore(gitignore_templates)
}

#[tauri::command]
pub async fn generate_rsa_key_pair_command(key_size: String) -> RsaKeyPair {
    let size = match key_size.as_str() {
        "2048" => RsaKeySize::Bits2048,
        "4096" => RsaKeySize::Bits4096,
        _ => RsaKeySize::Bits2048,
    };
    generate_rsa_key_pair(&size)
}

#[tauri::command]
pub async fn bcrypt_hash_command(
    password: String,
    cost: Option<u32>,
) -> Result<BcryptHashOutput, String> {
    bcrypt_hash(&password, cost)
}

#[tauri::command]
pub async fn bcrypt_verify_command(password: String, hash: String) -> Result<bool, String> {
    bcrypt_verify(&password, &hash)
}

#[tauri::command]
pub async fn generate_git_branch_name_command(title: String) -> BranchNameOutput {
    generate_git_branch_name(&title)
}
