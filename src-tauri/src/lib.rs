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
            // Utility commands
            utilities::test_regex_command,
            utilities::validate_regex_command,
            // Clipboard commands
            clipboard::detect_clipboard_content,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
