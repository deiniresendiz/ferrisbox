use crate::storage::config::{load_config, save_config, Config};

#[tauri::command]
pub async fn get_config() -> Result<Config, String> {
    load_config().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_config(config: Config) -> Result<(), String> {
    save_config(&config).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_favorite(tool_id: String) -> Result<Config, String> {
    let mut config = load_config().map_err(|e| e.to_string())?;
    if !config.favorites.contains(&tool_id) {
        config.favorites.push(tool_id);
        save_config(&config).map_err(|e| e.to_string())?;
    }
    Ok(config)
}

#[tauri::command]
pub async fn remove_favorite(tool_id: String) -> Result<Config, String> {
    let mut config = load_config().map_err(|e| e.to_string())?;
    config.favorites.retain(|id| id != &tool_id);
    save_config(&config).map_err(|e| e.to_string())?;
    Ok(config)
}
