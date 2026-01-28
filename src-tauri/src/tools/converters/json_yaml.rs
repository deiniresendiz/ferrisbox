use serde_json::Value as JsonValue;
use serde_yaml;

#[tauri::command]
pub fn json_to_yaml_command(json: String, _indent: usize) -> Result<String, String> {
    let value: JsonValue = serde_json::from_str(&json)
        .map_err(|e| e.to_string())?;
    
    serde_yaml::to_string(&value)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn yaml_to_json_command(yaml: String, _indent: usize) -> Result<String, String> {
    let value: JsonValue = serde_yaml::from_str(&yaml)
        .map_err(|e| e.to_string())?;
    
    serde_json::to_string_pretty(&value)
        .map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_json_to_yaml() {
        let json = r#"{"name": "John", "age": 30, "city": "New York"}"#;
        let result = json_to_yaml_command(json.to_string(), 2);
        assert!(result.is_ok());
        let yaml = result.unwrap();
        assert!(yaml.contains("name: John"));
    }

    #[test]
    fn test_yaml_to_json() {
        let yaml = r#"name: John
age: 30
city: New York
"#;
        let result = yaml_to_json_command(yaml.to_string(), 2);
        assert!(result.is_ok());
        let json = result.unwrap();
        assert!(json.contains("John"));
    }
}
