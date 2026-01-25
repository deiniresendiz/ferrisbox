mod commands;
mod storage;
mod tools;
mod utils;

use commands::{clipboard, encoders, formatters, generators, storage as storage_commands};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
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
            // Encoder commands
            encoders::encode_base64_command,
            encoders::decode_base64_command,
            // Clipboard commands
            clipboard::detect_clipboard_content,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
