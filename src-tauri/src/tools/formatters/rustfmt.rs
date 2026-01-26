use std::process::Command;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum RustfmtError {
    #[error("Rustfmt not found. Please install rustfmt: rustup component add rustfmt")]
    NotInstalled,
    #[error("Rustfmt execution error: {0}")]
    ExecutionError(String),
    #[error("Invalid Rust code: {0}")]
    InvalidCode(String),
}

/// Format Rust code using rustfmt
pub fn format_rust(code: &str) -> Result<String, RustfmtError> {
    // Check if rustfmt is available
    let check = Command::new("rustfmt")
        .arg("--version")
        .output();

    if check.is_err() {
        return Err(RustfmtError::NotInstalled);
    }

    // Create temporary file with code
    use std::io::Write;
    let mut temp_file = tempfile::NamedTempFile::new()
        .map_err(|e: std::io::Error| RustfmtError::ExecutionError(e.to_string()))?;

    temp_file.write_all(code.as_bytes())
        .map_err(|e: std::io::Error| RustfmtError::ExecutionError(e.to_string()))?;

    let temp_path = temp_file.path();

    // Run rustfmt on file
    let output = Command::new("rustfmt")
        .arg(temp_path)
        .output()
        .map_err(|e: std::io::Error| RustfmtError::ExecutionError(e.to_string()))?;

    if !output.status.success() {
        let error_msg = String::from_utf8_lossy(&output.stderr);
        return Err(RustfmtError::InvalidCode(error_msg.to_string()));
    }

    // Read formatted code
    let formatted = std::fs::read_to_string(temp_path)
        .map_err(|e: std::io::Error| RustfmtError::ExecutionError(e.to_string()))?;

    Ok(formatted)
}

/// Validate Rust syntax (basic check)
pub fn validate_rust(code: &str) -> bool {
    // Basic validation: check for common Rust keywords and balanced braces
    let has_rust_keywords = code.contains("fn ")
        || code.contains("let ")
        || code.contains("struct ")
        || code.contains("impl ")
        || code.contains("use ")
        || code.contains("mod ");

    if !has_rust_keywords {
        return false;
    }

    // Check balanced braces
    let mut brace_count = 0;
    let mut in_string = false;

    for ch in code.chars() {
        if ch == '"' {
            in_string = !in_string;
        } else if !in_string {
            match ch {
                '{' => brace_count += 1,
                '}' => brace_count -= 1,
                _ => {}
            }
        }
    }

    brace_count == 0
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE_RUST: &str = r#"
fn main() {
let x = 42;
println!("Hello, world!");
}

struct Point {
x: i32,
y: i32,
}
"#;

    #[test]
    fn test_validate_rust_valid() {
        assert!(validate_rust(SAMPLE_RUST));
        assert!(validate_rust("fn test() { let x = 42; }"));
    }

    #[test]
    fn test_validate_rust_invalid() {
        assert!(!validate_rust("function test() { }"));  // Not Rust syntax
        assert!(!validate_rust("fn test() { let x = 42;"));  // Unbalanced braces
    }

    #[test]
    fn test_validate_rust_keywords() {
        assert!(validate_rust("struct Foo { x: i32 }"));
        assert!(validate_rust("impl Foo { }"));
        assert!(validate_rust("use std::io;"));
    }

    // Note: format_rust tests are commented out because they require rustfmt to be installed
    // Uncomment these if running in an environment with rustfmt available

    // #[test]
    // fn test_format_rust() {
    //     let result = format_rust(SAMPLE_RUST);
    //     if result.is_ok() {
    //         let formatted = result.unwrap();
    //         assert!(formatted.contains("fn main()"));
    //         assert!(formatted.contains("println!"));
    //     }
    // }
}
