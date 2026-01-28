use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct DiffOutput {
    original_text: String,
    modified_text: String,
    diff_output: String,
}

pub fn diff_text(
    original: &str,
    modified: &str,
) -> Result<DiffOutput, String> {
    let mut diff_output = String::new();
    
    let orig_lines: Vec<&str> = original.lines().collect();
    let mod_lines: Vec<&str> = modified.lines().collect();
    let max_lines = orig_lines.len().max(mod_lines.len());
    
    for i in 0..max_lines {
        let orig = orig_lines.get(i).unwrap_or(&"");
        let modi = mod_lines.get(i).unwrap_or(&"");
        
        if orig == modi {
            diff_output.push_str(orig);
            diff_output.push('\n');
        } else {
            if !orig.is_empty() {
                diff_output.push_str(&format!("- {}\n", orig));
            }
            if !modi.is_empty() {
                diff_output.push_str(&format!("+ {}\n", modi));
            }
        }
    }
    
    Ok(DiffOutput {
        original_text: original.to_string(),
        modified_text: modified.to_string(),
        diff_output,
    })
}
