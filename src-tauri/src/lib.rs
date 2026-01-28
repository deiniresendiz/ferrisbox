mod commands;
mod storage;
mod tools;
mod utils;

use commands::{clipboard, converters, diff, encoders, formatters, generators, graphics, network, storage as storage_commands, utilities};

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
            formatters::format_xml_command,
            formatters::minify_xml_command,
            formatters::validate_xml_command,
            formatters::format_sql_command,
            formatters::minify_sql_command,
            formatters::validate_sql_command,
            formatters::format_css_command,
            formatters::minify_css_command,
            formatters::validate_css_command,
            formatters::format_js_command,
            formatters::minify_js_command,
            formatters::validate_js_command,
            formatters::format_yaml_command,
            formatters::minify_yaml_command,
            formatters::validate_yaml_command,
            formatters::format_rust_command,
            formatters::validate_rust_command,
            // Generator commands
            generators::generate_hash_command,
            generators::generate_all_hashes_command,
            generators::generate_uuid_command,
            generators::generate_multiple_uuids_command,
            generators::validate_uuid_command,
            generators::generate_lorem_command,
            generators::generate_password_command,
            generators::generate_hmac_command,
            generators::generate_qr_command,
            generators::generate_wifi_qr_command,
            generators::generate_gitignore_command,
            generators::generate_rsa_key_pair_command,
            generators::bcrypt_hash_command,
            generators::bcrypt_verify_command,
            generators::generate_git_branch_name_command,
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
            // Diff commands
            diff::diff_text_command,
            // Network commands
            network::get_local_ip_command,
            network::scan_ports_command,
            network::dns_lookup_command,
            // Converter commands
            converters::json_to_yaml_command,
            converters::yaml_to_json_command,
            converters::csv_to_json_command,
            converters::markdown_to_html_command,
            converters::convert_number_base_command,
            converters::convert_timestamp_command,
            converters::date_to_timestamp_command,
            converters::convert_color_command,
            converters::convert_data_units_command,
            converters::convert_time_units_command,
            converters::convert_frequency_units_command,
            converters::parse_cron_command,
            converters::convert_case_command,
            // Graphics commands
            graphics::optimize_svg_command,
            graphics::compress_image_command,
            graphics::generate_favicon_ico_command,
            graphics::generate_favicon_pngs_command,
            graphics::validate_base64_image_command,
            graphics::check_contrast_command,
            // Clipboard commands
            clipboard::detect_clipboard_content,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
