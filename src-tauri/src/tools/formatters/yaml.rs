use serde_yaml::{self, Value};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum YamlError {
    #[error("YAML parse error: {0}")]
    ParseError(#[from] serde_yaml::Error),
    #[error("YAML format error: {0}")]
    FormatError(String),
}

/// Format YAML with proper indentation
pub fn format_yaml(yaml: &str, indent_size: usize) -> Result<String, YamlError> {
    // Parse YAML
    let value: Value = serde_yaml::from_str(yaml)?;
    
    // Serialize back with formatting
    let formatted = serde_yaml::to_string(&value)?;
    
    // Adjust indentation if needed (serde_yaml uses 2-space indent by default)
    if indent_size != 2 {
        Ok(adjust_indentation(&formatted, indent_size))
    } else {
        Ok(formatted)
    }
}

/// Minify YAML (compact representation)
pub fn minify_yaml(yaml: &str) -> Result<String, YamlError> {
    let value: Value = serde_yaml::from_str(yaml)?;
    
    // Serialize in compact form (though YAML is inherently verbose)
    let mut result = serde_yaml::to_string(&value)?;
    
    // Remove unnecessary blank lines
    result = result
        .lines()
        .filter(|line| !line.trim().is_empty())
        .collect::<Vec<_>>()
        .join("\n");
    
    Ok(result)
}

/// Validate YAML syntax
pub fn validate_yaml(yaml: &str) -> bool {
    serde_yaml::from_str::<Value>(yaml).is_ok()
}

/// Adjust indentation level
fn adjust_indentation(yaml: &str, target_indent: usize) -> String {
    yaml.lines()
        .map(|line| {
            let trimmed = line.trim_start();
            let current_indent = line.len() - trimmed.len();
            let level = current_indent / 2; // assuming current is 2-space
            let new_indent = " ".repeat(level * target_indent);
            format!("{}{}", new_indent, trimmed)
        })
        .collect::<Vec<_>>()
        .join("\n")
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE_YAML: &str = r#"
apiVersion: v1
kind: Service
metadata:
  name: my-service
  labels:
    app: myapp
spec:
  selector:
    app: myapp
  ports:
    - protocol: TCP
      port: 80
      targetPort: 9376
"#;

    #[test]
    fn test_format_yaml() {
        let result = format_yaml(SAMPLE_YAML, 2).unwrap();
        assert!(result.contains("apiVersion"));
        assert!(result.contains("kind"));
    }

    #[test]
    fn test_format_yaml_custom_indent() {
        let result = format_yaml(SAMPLE_YAML, 4).unwrap();
        assert!(result.contains("apiVersion"));
    }

    #[test]
    fn test_minify_yaml() {
        let result = minify_yaml(SAMPLE_YAML).unwrap();
        assert!(result.contains("apiVersion"));
        // Should have fewer lines than original
        assert!(result.lines().count() < SAMPLE_YAML.lines().count());
    }

    #[test]
    fn test_validate_yaml_valid() {
        assert!(validate_yaml(SAMPLE_YAML));
        assert!(validate_yaml("key: value\nlist:\n  - item1\n  - item2"));
    }

    #[test]
    fn test_validate_yaml_invalid() {
        // YAML parser is very tolerant, use clearly broken syntax
        assert!(!validate_yaml("{{{{"));  // Invalid syntax
        assert!(!validate_yaml("[[["));   // Unclosed brackets
    }

    #[test]
    fn test_format_list() {
        let yaml = "items:\n  - one\n  - two\n  - three";
        let result = format_yaml(yaml, 2).unwrap();
        assert!(result.contains("items"));
        assert!(result.contains("- one"));
    }

    #[test]
    fn test_format_nested_objects() {
        let yaml = "parent:\n  child:\n    grandchild: value";
        let result = format_yaml(yaml, 2).unwrap();
        assert!(result.contains("parent"));
        assert!(result.contains("child"));
        assert!(result.contains("grandchild"));
    }

    #[test]
    fn test_roundtrip() {
        let formatted = format_yaml(SAMPLE_YAML, 2).unwrap();
        let minified = minify_yaml(&formatted).unwrap();
        let reformatted = format_yaml(&minified, 2).unwrap();
        
        assert!(reformatted.contains("apiVersion"));
        assert!(reformatted.contains("kind"));
    }
}
