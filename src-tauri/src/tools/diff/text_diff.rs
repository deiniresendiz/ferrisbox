use serde::{Deserialize, Serialize};
use diff::{Diff, Result};

#[derive(Serialize, Deserialize)]
pub struct DiffResult {
    original_text: String,
    modified_text: String,
    diff_output: String,
    line_changes: Vec<LineChange>,
}

#[derive(Serialize, Deserialize)]
pub struct LineChange {
    line_number: usize,
    change_type: String,
    content: String,
}

pub fn diff_text(
    original: &str,
    modified: &str,
) -> Result<DiffResult, String> {
    let diff = Diff::chars(original, modified);
    
    let mut diff_output = String::new();
    let mut line_changes = Vec::new();
    let original_lines: Vec<&str> = original.lines().collect();
    let modified_lines: Vec<&str> = modified.lines().collect();
    
    for (i, result) in diff.resultiter().enumerate() {
        match result {
            diff::Result::Left(val) => {
                diff_output.push_str(&format!("\x1b[31m{}\x1b[0m", val));
                if i < original_lines.len() {
                    line_changes.push(LineChange {
                        line_number: i,
                        change_type: "removed".to_string(),
                        content: val.to_string(),
                    });
                }
            }
            diff::Result::Right(val) => {
                diff_output.push_str(&format!("\x1b[32m{}\x1b[0m", val));
                if i < modified_lines.len() {
                    line_changes.push(LineChange {
                        line_number: i,
                        change_type: "added".to_string(),
                        content: val.to_string(),
                    });
                }
            }
            diff::Result::Both(val) => {
                diff_output.push_str(val);
                if i < original_lines.len() {
                    line_changes.push(LineChange {
                        line_number: i,
                        change_type: "unchanged".to_string(),
                        content: val.to_string(),
                    });
                }
            }
        }
    }
    
    Ok(DiffResult {
        original_text: original.to_string(),
        modified_text: modified.to_string(),
        diff_output,
        line_changes,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_simple_diff() {
        let original = "Hello World";
        let modified = "Hello Rust";
        let result = diff_text(original, modified);
        assert!(result.is_ok());
        let diff = result.unwrap();
        assert!(diff.diff_output.contains("World") || diff.diff_output.contains("Rust"));
    }

    #[test]
    fn test_no_diff() {
        let original = "Same text";
        let modified = "Same text";
        let result = diff_text(original, modified);
        assert!(result.is_ok());
        let diff = result.unwrap();
        assert!(!diff.diff_output.contains("\x1b[31m") && !diff.diff_output.contains("\x1b[32m"));
    }
}
