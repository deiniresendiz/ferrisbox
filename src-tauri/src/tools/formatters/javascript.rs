use thiserror::Error;

#[derive(Error, Debug)]
pub enum JsError {
    #[error("JavaScript format error: {0}")]
    FormatError(String),
}

/// Format JavaScript/TypeScript code (basic formatting)
pub fn format_js(code: &str, indent_size: usize) -> Result<String, JsError> {
    let indent = " ".repeat(indent_size);
    let mut result = String::new();
    let mut level: i32 = 0;
    let mut in_string = false;
    let mut string_char = ' ';
    
    for line in code.lines() {
        let trimmed = line.trim();
        
        if trimmed.is_empty() {
            result.push('\n');
            continue;
        }
        
        // Track string state
        for ch in trimmed.chars() {
            if (ch == '"' || ch == '\'') && !in_string {
                in_string = true;
                string_char = ch;
            } else if ch == string_char && in_string {
                in_string = false;
            }
        }
        
        // Don't process indentation if we're in a string
        if !in_string {
            // Decrease indent before closing braces
            if trimmed.starts_with('}') || trimmed.starts_with(']') {
                level = (level - 1).max(0);
            }
        }
        
        // Add indentation
        if level > 0 {
            result.push_str(&indent.repeat(level as usize));
        }
        
        result.push_str(trimmed);
        result.push('\n');
        
        if !in_string {
            // Increase indent after opening braces
            if trimmed.ends_with('{') || trimmed.ends_with('[') {
                level += 1;
            }
            
            // Decrease indent for immediate closing
            if trimmed.contains("{}") || trimmed.contains("[]") {
                // Don't change level for inline objects/arrays
            }
        }
    }
    
    Ok(result)
}

/// Minify JavaScript (remove whitespace and comments)
pub fn minify_js(code: &str) -> Result<String, JsError> {
    let mut result = String::new();
    let mut in_string = false;
    let mut string_char = ' ';
    let mut in_comment = false;
    let mut in_multiline_comment = false;
    let mut prev_char = ' ';
    
    let chars: Vec<char> = code.chars().collect();
    let mut i = 0;
    
    while i < chars.len() {
        let ch = chars[i];
        
        // Handle multi-line comments
        if !in_string && !in_comment && i + 1 < chars.len() && ch == '/' && chars[i + 1] == '*' {
            in_multiline_comment = true;
            i += 2;
            continue;
        }
        
        if in_multiline_comment && i + 1 < chars.len() && ch == '*' && chars[i + 1] == '/' {
            in_multiline_comment = false;
            i += 2;
            prev_char = ' ';
            continue;
        }
        
        if in_multiline_comment {
            i += 1;
            continue;
        }
        
        // Handle single-line comments
        if !in_string && !in_comment && i + 1 < chars.len() && ch == '/' && chars[i + 1] == '/' {
            in_comment = true;
            i += 2;
            continue;
        }
        
        if in_comment && ch == '\n' {
            in_comment = false;
            i += 1;
            continue;
        }
        
        if in_comment {
            i += 1;
            continue;
        }
        
        // Handle strings
        if (ch == '"' || ch == '\'' || ch == '`') && !in_string {
            in_string = true;
            string_char = ch;
            result.push(ch);
        } else if ch == string_char && in_string && prev_char != '\\' {
            in_string = false;
            result.push(ch);
        } else if in_string {
            result.push(ch);
        } else if !ch.is_whitespace() {
            result.push(ch);
        } else if ch == '\n' || ch == ' ' {
            // Add space only between alphanumeric characters
            if !result.is_empty() && prev_char.is_alphanumeric() && i + 1 < chars.len() && chars[i + 1].is_alphanumeric() {
                result.push(' ');
            }
        }
        
        prev_char = ch;
        i += 1;
    }
    
    Ok(result)
}

/// Validate basic JavaScript syntax (simple check)
pub fn validate_js(code: &str) -> bool {
    // Basic validation: check for balanced braces
    let mut brace_count = 0;
    let mut bracket_count = 0;
    let mut paren_count = 0;
    let mut in_string = false;
    let mut string_char = ' ';
    
    for ch in code.chars() {
        if (ch == '"' || ch == '\'') && !in_string {
            in_string = true;
            string_char = ch;
        } else if ch == string_char && in_string {
            in_string = false;
        } else if !in_string {
            match ch {
                '{' => brace_count += 1,
                '}' => brace_count -= 1,
                '[' => bracket_count += 1,
                ']' => bracket_count -= 1,
                '(' => paren_count += 1,
                ')' => paren_count -= 1,
                _ => {}
            }
        }
    }
    
    brace_count == 0 && bracket_count == 0 && paren_count == 0
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE_JS: &str = r#"
function hello(name) {
const greeting = `Hello, ${name}!`;
console.log(greeting);
return greeting;
}

const arr = [1, 2, 3];
const obj = { a: 1, b: 2 };
"#;

    #[test]
    fn test_format_js() {
        let result = format_js(SAMPLE_JS, 2).unwrap();
        assert!(result.contains("function"));
        assert!(result.contains("console.log"));
    }

    #[test]
    fn test_minify_js() {
        let result = minify_js(SAMPLE_JS).unwrap();
        assert!(result.len() < SAMPLE_JS.len());
        assert!(!result.contains('\n'));
    }

    #[test]
    fn test_minify_with_comments() {
        let js = "// Comment\nfunction test() { /* inline */ return 42; }";
        let result = minify_js(js).unwrap();
        assert!(!result.contains("//"));
        assert!(!result.contains("/*"));
        assert!(result.contains("function"));
    }

    #[test]
    fn test_validate_js_valid() {
        assert!(validate_js("function test() { return 42; }"));
        assert!(validate_js("const arr = [1, 2, 3];"));
    }

    #[test]
    fn test_validate_js_invalid() {
        assert!(!validate_js("function test() { return 42;"));
        assert!(!validate_js("const arr = [1, 2, 3;"));
    }

    #[test]
    fn test_format_arrow_function() {
        let js = "const add = (a, b) => a + b;";
        let result = format_js(js, 2).unwrap();
        assert!(result.contains("=>"));
    }

    #[test]
    fn test_minify_preserves_strings() {
        let js = r#"const msg = "Hello World";"#;
        let result = minify_js(js).unwrap();
        assert!(result.contains("Hello World"));
    }
}
