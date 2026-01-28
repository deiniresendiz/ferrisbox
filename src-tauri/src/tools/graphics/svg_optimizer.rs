use thiserror::Error;
use serde::{Deserialize, Serialize};

#[derive(Error, Debug)]
pub enum SvgOptimizerError {
    #[error("Invalid SVG: {0}")]
    InvalidSvg(String),
    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
    #[error("XML parse error: {0}")]
    XmlError(String),
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum OptimizationLevel {
    Low,
    Medium,
    High,
}

#[derive(Debug, Serialize)]
pub struct OptimizationStats {
    pub original_size: usize,
    pub optimized_size: usize,
    pub savings_bytes: usize,
    pub savings_percent: f64,
}

fn remove_xml_comments(svg_content: &str) -> String {
    let regex = regex::Regex::new(r"<!--.*?-->").unwrap();
    regex.replace_all(svg_content, "").to_string()
}

fn remove_whitespace(svg_content: &str) -> String {
    let regex = regex::Regex::new(r">\s+<").unwrap();
    regex.replace_all(svg_content, "><").to_string()
}

fn remove_redundant_attributes(svg_content: &str) -> String {
    let mut result = svg_content.to_string();
    
    result = regex::Regex::new(r#"\s+xmlns=""[^"]*"""#).unwrap()
        .replace_all(&result, "").to_string();
    
    result = regex::Regex::new(r#"\s+version=""1.1"""#).unwrap()
        .replace_all(&result, "").to_string();
    
    result = regex::Regex::new(r#"\s+enable-background=""[^"]*"""#).unwrap()
        .replace_all(&result, "").to_string();
    
    result
}

fn compact_numbers(svg_content: &str) -> String {
    let result = regex::Regex::new(r"(\d+)\.0+(\D)").unwrap()
        .replace_all(svg_content, "$1$2").to_string();
    
    let result = regex::Regex::new(r"(\d+)\.00+(\D)").unwrap()
        .replace_all(&result, "$1$2").to_string();
    
    result
}

fn simplify_path_data(svg_content: &str) -> String {
    let mut result = svg_content.to_string();
    
    result = regex::Regex::new(r"\s+([A-Za-z])\s+").unwrap()
        .replace_all(&result, " $1").to_string();
    
    result = regex::Regex::new(r"(\d),(\d)").unwrap()
        .replace_all(&result, "$1 $2").to_string();
    
    result = regex::Regex::new(r"-\s+").unwrap()
        .replace_all(&result, "-").to_string();
    
    result
}

pub fn optimize_svg(svg_content: &str, level: OptimizationLevel) -> Result<String, SvgOptimizerError> {
    if !svg_content.contains("<svg") || !svg_content.contains("</svg>") {
        return Err(SvgOptimizerError::InvalidSvg("Invalid SVG format".to_string()));
    }

    let mut optimized = svg_content.to_string();

    match level {
        OptimizationLevel::Low => {
            optimized = remove_xml_comments(&optimized);
            optimized = remove_whitespace(&optimized);
        }
        OptimizationLevel::Medium => {
            optimized = remove_xml_comments(&optimized);
            optimized = remove_whitespace(&optimized);
            optimized = remove_redundant_attributes(&optimized);
        }
        OptimizationLevel::High => {
            optimized = remove_xml_comments(&optimized);
            optimized = remove_whitespace(&optimized);
            optimized = remove_redundant_attributes(&optimized);
            optimized = compact_numbers(&optimized);
            optimized = simplify_path_data(&optimized);
        }
    }

    optimized = regex::Regex::new(r"\s+").unwrap()
        .replace_all(&optimized, " ").to_string();

    Ok(optimized.trim().to_string())
}

pub fn get_optimization_stats(original: &str, optimized: &str) -> OptimizationStats {
    let original_size = original.len();
    let optimized_size = optimized.len();
    let savings_bytes = original_size.saturating_sub(optimized_size);
    let savings_percent = if original_size > 0 {
        (savings_bytes as f64 / original_size as f64) * 100.0
    } else {
        0.0
    };

    OptimizationStats {
        original_size,
        optimized_size,
        savings_bytes,
        savings_percent,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_svg() -> &'static str {
        r#"<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="100" height="100">
  <!-- This is a comment -->
  <rect x="10" y="10" width="80" height="80" fill="red"/>
</svg>"#
    }

    #[test]
    fn test_remove_xml_comments() {
        let svg = "<svg><!-- comment --><rect/></svg>";
        let result = remove_xml_comments(svg);
        assert!(!result.contains("<!--"));
        assert_eq!(result, "<svg><rect/></svg>");
    }

    #[test]
    fn test_remove_whitespace() {
        let svg = "<svg>  <rect x=\"10\"/>  </svg>";
        let result = remove_whitespace(svg);
        assert_eq!(result, "<svg><rect x=\"10\"/></svg>");
    }

    #[test]
    fn test_optimize_svg_low() {
        let svg = test_svg();
        let result = optimize_svg(svg, OptimizationLevel::Low).unwrap();
        assert!(!result.contains("<!--"));
        assert!(result.len() < svg.len());
    }

    #[test]
    fn test_optimize_svg_medium() {
        let svg = test_svg();
        let result = optimize_svg(svg, OptimizationLevel::Medium).unwrap();
        assert!(!result.contains("version=\"1.1\""));
        assert!(result.len() < svg.len());
    }

    #[test]
    fn test_optimize_svg_high() {
        let svg = test_svg();
        let result = optimize_svg(svg, OptimizationLevel::High).unwrap();
        assert!(!result.contains("version=\"1.1\""));
        assert!(result.len() < svg.len());
    }

    #[test]
    fn test_optimization_stats() {
        let stats = get_optimization_stats("12345", "123");
        assert_eq!(stats.original_size, 5);
        assert_eq!(stats.optimized_size, 3);
        assert_eq!(stats.savings_bytes, 2);
        assert!((stats.savings_percent - 40.0).abs() < 0.1);
    }

    #[test]
    fn test_invalid_svg() {
        let svg = "not an svg";
        let result = optimize_svg(svg, OptimizationLevel::Low);
        assert!(result.is_err());
    }

    #[test]
    fn test_compact_numbers() {
        let input = "10.0 20.00 30.123";
        let result = compact_numbers(input);
        assert!(result.contains("10 "));
        assert!(result.contains("20 "));
        assert!(result.contains("30.123"));
    }

    #[test]
    fn test_simplify_path_data() {
        let input = "M 10,10 L 20,10 L 20,20";
        let result = simplify_path_data(input);
        assert_eq!(result, "M10 10 L20 10 L20 20");
    }
}
