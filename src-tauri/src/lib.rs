mod commands;
mod storage;
mod tools;
mod utils;

use commands::{clipboard, encoders, formatters, generators, storage as storage_commands, utilities};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![
            // Storage commands
            storage_commands::get_config,
            storage_commands::update_config,
            storage_commands::add_favorite,
            storage_commands::remove_favorite,
            // Formatter commands
            formatters::format_json_command,
            formatters::minify_json_command,
            formatters::validate_json_command,
            // Generator commands
            generators::generate_hash_command,
            generators::generate_uuid_command,
            generators::generate_multiple_uuids_command,
            generators::validate_uuid_command,
            // Encoder commands
            encoders::encode_base64_command,
            encoders::decode_base64_command,
            encoders::encode_url_command,
            encoders::decode_url_command,
            encoders::string_to_hex_command,
            encoders::hex_to_string_command,
            encoders::encode_html_command,
            encoders::decode_html_command,
            encoders::encode_punycode_command,
            encoders::decode_punycode_command,
            encoders::encode_morse_command,
            encoders::decode_morse_command,
            encoders::encode_image_to_base64_command,
            encoders::decode_image_from_base64_command,
            // Utility commands
            utilities::test_regex_command,
            utilities::validate_regex_command,
            utilities::decode_jwt_unsafe_command,
            utilities::validate_jwt_hmac_command,
            utilities::validate_jwt_rsa_command,
            utilities::compress_gzip_command,
            utilities::decompress_gzip_command,
            utilities::compress_zlib_command,
            utilities::decompress_zlib_command,
            utilities::parse_url_command,
            utilities::update_query_params_command,
            // Clipboard commands
            clipboard::detect_clipboard_content,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
