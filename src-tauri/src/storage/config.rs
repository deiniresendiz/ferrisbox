use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ConfigError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Preferences {
    pub theme: String,
    pub language: String,
    pub auto_detect_clipboard: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RecentTool {
    pub id: String,
    pub last_used: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Config {
    pub version: String,
    pub preferences: Preferences,
    pub favorites: Vec<String>,
    pub recent_tools: Vec<RecentTool>,
}

impl Default for Config {
    fn default() -> Self {
        Config {
            version: "1.0.0".to_string(),
            preferences: Preferences {
                theme: "dark".to_string(),
                language: "en".to_string(),
                auto_detect_clipboard: true,
            },
            favorites: Vec::new(),
            recent_tools: Vec::new(),
        }
    }
}

pub fn get_config_path() -> Result<PathBuf, ConfigError> {
    let config_dir = dirs::config_dir().ok_or_else(|| {
        ConfigError::Io(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "Could not find config directory",
        ))
    })?;

    let ferrisbox_dir = config_dir.join("ferrisbox");
    if !ferrisbox_dir.exists() {
        fs::create_dir_all(&ferrisbox_dir)?;
    }

    Ok(ferrisbox_dir.join("config.json"))
}

pub fn load_config() -> Result<Config, ConfigError> {
    let config_path = get_config_path()?;

    if !config_path.exists() {
        let default_config = Config::default();
        save_config(&default_config)?;
        return Ok(default_config);
    }

    let content = fs::read_to_string(config_path)?;
    let config: Config = serde_json::from_str(&content)?;
    Ok(config)
}

pub fn save_config(config: &Config) -> Result<(), ConfigError> {
    let config_path = get_config_path()?;
    let json = serde_json::to_string_pretty(config)?;
    fs::write(config_path, json)?;
    Ok(())
}
