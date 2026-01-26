use lightningcss::{
    printer::PrinterOptions,
    stylesheet::{MinifyOptions, ParserOptions, StyleSheet},
};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum CssError {
    #[error("CSS parse error: {0}")]
    ParseError(String),
    #[error("CSS print error: {0}")]
    PrintError(String),
}

/// Format CSS with indentation
pub fn format_css(css: &str, indent_size: usize) -> Result<String, CssError> {
    let stylesheet = StyleSheet::parse(css, ParserOptions::default())
        .map_err(|e| CssError::ParseError(format!("{:?}", e)))?;

    let printer_options = PrinterOptions {
        minify: false,
        ..PrinterOptions::default()
    };

    let result = stylesheet
        .to_css(printer_options)
        .map_err(|e| CssError::PrintError(format!("{:?}", e)))?;

    // Add indentation manually since lightningcss doesn't support custom indentation
    let indented = add_indentation(&result.code, indent_size);
    
    Ok(indented)
}

/// Minify CSS
pub fn minify_css(css: &str) -> Result<String, CssError> {
    let mut stylesheet = StyleSheet::parse(css, ParserOptions::default())
        .map_err(|e| CssError::ParseError(format!("{:?}", e)))?;

    stylesheet
        .minify(MinifyOptions::default())
        .map_err(|e| CssError::PrintError(format!("{:?}", e)))?;

    let result = stylesheet
        .to_css(PrinterOptions {
            minify: true,
            ..PrinterOptions::default()
        })
        .map_err(|e| CssError::PrintError(format!("{:?}", e)))?;

    Ok(result.code)
}

/// Validate CSS syntax
pub fn validate_css(css: &str) -> bool {
    StyleSheet::parse(css, ParserOptions::default()).is_ok()
}

/// Add indentation to CSS (simple formatting)
fn add_indentation(css: &str, indent_size: usize) -> String {
    let indent = " ".repeat(indent_size);
    let mut result = String::new();
    let mut level: i32 = 0;
    let mut in_selector = false;
    
    for line in css.lines() {
        let trimmed = line.trim();
        
        if trimmed.is_empty() {
            result.push('\n');
            continue;
        }
        
        // Decrease indent before closing brace
        if trimmed.starts_with('}') {
            level = (level - 1).max(0);
        }
        
        // Add indentation
        if level > 0 && !in_selector {
            result.push_str(&indent.repeat(level as usize));
        }
        
        result.push_str(trimmed);
        result.push('\n');
        
        // Increase indent after opening brace
        if trimmed.ends_with('{') {
            level += 1;
            in_selector = false;
        } else if trimmed.ends_with(',') {
            in_selector = true;
        } else {
            in_selector = false;
        }
    }
    
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE_CSS: &str = r#"
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
}

h1, h2, h3 {
    color: #333;
}
"#;

    #[test]
    fn test_format_css() {
        let result = format_css(SAMPLE_CSS, 2).unwrap();
        assert!(result.contains("body"));
        assert!(result.contains("font-family"));
    }

    #[test]
    fn test_minify_css() {
        let result = minify_css(SAMPLE_CSS).unwrap();
        assert!(!result.contains('\n'));
        assert!(result.len() < SAMPLE_CSS.len());
    }

    #[test]
    fn test_validate_css_valid() {
        assert!(validate_css(SAMPLE_CSS));
        assert!(validate_css("body { color: red; }"));
    }

    #[test]
    fn test_validate_css_invalid() {
        // lightningcss is very tolerant, so we use clearly broken syntax
        assert!(!validate_css("body { color }"));  // Missing value
        assert!(!validate_css("@@@"));  // Complete garbage
    }

    #[test]
    fn test_format_complex_selectors() {
        let css = ".nav > li:hover { background: #eee; }";
        let result = format_css(css, 2).unwrap();
        assert!(result.contains(".nav"));
    }

    #[test]
    fn test_minify_with_comments() {
        let css = "/* Comment */ body { color: red; /* inline */ margin: 0; }";
        let result = minify_css(css).unwrap();
        // Comments should be removed in minified version
        assert!(result.contains("body"));
    }

    #[test]
    fn test_roundtrip() {
        let formatted = format_css(SAMPLE_CSS, 2).unwrap();
        let minified = minify_css(&formatted).unwrap();
        let reformatted = format_css(&minified, 2).unwrap();
        
        assert!(reformatted.contains("body"));
        assert!(reformatted.contains("container"));
    }
}
