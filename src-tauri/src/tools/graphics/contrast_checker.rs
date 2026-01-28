use thiserror::Error;
use serde::Serialize;
use regex::Regex;

#[derive(Error, Debug)]
pub enum ContrastCheckerError {
    #[error("Invalid color format: {0}")]
    InvalidColor(String),
}

#[derive(Debug, Serialize)]
pub struct ContrastResult {
    pub ratio: f64,
    pub foreground_hex: String,
    pub background_hex: String,
    pub foreground_luminance: f64,
    pub background_luminance: f64,
    pub normal_aa: bool,
    pub large_aa: bool,
    pub normal_aaa: bool,
    pub large_aaa: bool,
}

fn hex_to_rgb(hex: &str) -> Result<(u8, u8, u8), ContrastCheckerError> {
    let hex = hex.trim_start_matches('#');
    
    if hex.len() == 3 {
        let r = u8::from_str_radix(&format!("{}{}", &hex[0..1], &hex[0..1]), 16)
            .map_err(|e| ContrastCheckerError::InvalidColor(e.to_string()))?;
        let g = u8::from_str_radix(&format!("{}{}", &hex[1..2], &hex[1..2]), 16)
            .map_err(|e| ContrastCheckerError::InvalidColor(e.to_string()))?;
        let b = u8::from_str_radix(&format!("{}{}", &hex[2..3], &hex[2..3]), 16)
            .map_err(|e| ContrastCheckerError::InvalidColor(e.to_string()))?;
        return Ok((r, g, b));
    }
    
    if hex.len() == 6 {
        let r = u8::from_str_radix(&hex[0..2], 16)
            .map_err(|e| ContrastCheckerError::InvalidColor(e.to_string()))?;
        let g = u8::from_str_radix(&hex[2..4], 16)
            .map_err(|e| ContrastCheckerError::InvalidColor(e.to_string()))?;
        let b = u8::from_str_radix(&hex[4..6], 16)
            .map_err(|e| ContrastCheckerError::InvalidColor(e.to_string()))?;
        return Ok((r, g, b));
    }
    
    Err(ContrastCheckerError::InvalidColor(
        "Invalid HEX format".to_string(),
    ))
}

fn rgb_to_hsl(r: u8, g: u8, b: u8) -> (f64, f64, f64) {
    let r_norm = r as f64 / 255.0;
    let g_norm = g as f64 / 255.0;
    let b_norm = b as f64 / 255.0;

    let max = r_norm.max(g_norm).max(b_norm);
    let min = r_norm.min(g_norm).min(b_norm);
    let delta = max - min;

    let l = (max + min) / 2.0;

    let (h, s) = if delta == 0.0 {
        (0.0, 0.0)
    } else {
        let s = if l < 0.5 {
            delta / (max + min)
        } else {
            delta / (2.0 - max - min)
        };

        let h = if max == r_norm {
            60.0 * (((g_norm - b_norm) / delta) % 6.0)
        } else if max == g_norm {
            60.0 * (((b_norm - r_norm) / delta) + 2.0)
        } else {
            60.0 * (((r_norm - g_norm) / delta) + 4.0)
        };

        (h, s)
    };

    (h, s, l)
}

fn hsl_to_rgb(h: f64, s: f64, l: f64) -> (u8, u8, u8) {
    let r: f64;
    let g: f64;
    let b: f64;

    if s == 0.0 {
        r = l;
        g = l;
        b = l;
    } else {
        let q = if l < 0.5 {
            l * (1.0 + s)
        } else {
            l + s - (l * s)
        };
        let p = 2.0 * l - q;

        let hue_to_rgb = |p: f64, q: f64, t: f64| -> f64 {
            let mut t = t;
            if t < 0.0 {
                t += 1.0;
            }
            if t > 1.0 {
                t -= 1.0;
            }
            if t < 1.0 / 6.0 {
                p + (q - p) * 6.0 * t
            } else if t < 1.0 / 2.0 {
                q
            } else if t < 2.0 / 3.0 {
                p + (q - p) * (2.0 / 3.0 - t) * 6.0
            } else {
                p
            }
        };

        let h_degrees = h / 360.0;
        r = hue_to_rgb(p, q, h_degrees + 1.0 / 3.0);
        g = hue_to_rgb(p, q, h_degrees);
        b = hue_to_rgb(p, q, h_degrees - 1.0 / 3.0);
    }

    (
        (r * 255.0).round() as u8,
        (g * 255.0).round() as u8,
        (b * 255.0).round() as u8,
    )
}

fn parse_rgb(input: &str) -> Result<(u8, u8, u8), ContrastCheckerError> {
    let re = Regex::new(r"rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)")
        .map_err(|_| ContrastCheckerError::InvalidColor("Invalid RGB format".to_string()))?;
    
    let caps = re
        .captures(input)
        .ok_or_else(|| ContrastCheckerError::InvalidColor("Invalid RGB format".to_string()))?;
    
    let r = caps.get(1).and_then(|c| c.as_str().parse::<u8>().ok())
        .ok_or_else(|| ContrastCheckerError::InvalidColor("Invalid R value".to_string()))?;
    let g = caps.get(2).and_then(|c| c.as_str().parse::<u8>().ok())
        .ok_or_else(|| ContrastCheckerError::InvalidColor("Invalid G value".to_string()))?;
    let b = caps.get(3).and_then(|c| c.as_str().parse::<u8>().ok())
        .ok_or_else(|| ContrastCheckerError::InvalidColor("Invalid B value".to_string()))?;
    
    Ok((r, g, b))
}

fn parse_hsl(input: &str) -> Result<(u8, u8, u8), ContrastCheckerError> {
    let re = Regex::new(r"hsl\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%\s*\)")
        .map_err(|_| ContrastCheckerError::InvalidColor("Invalid HSL format".to_string()))?;
    
    let caps = re
        .captures(input)
        .ok_or_else(|| ContrastCheckerError::InvalidColor("Invalid HSL format".to_string()))?;
    
    let h = caps.get(1).and_then(|c| c.as_str().parse::<f64>().ok())
        .ok_or_else(|| ContrastCheckerError::InvalidColor("Invalid H value".to_string()))?;
    let s = caps.get(2).and_then(|c| c.as_str().parse::<f64>().ok())
        .ok_or_else(|| ContrastCheckerError::InvalidColor("Invalid S value".to_string()))?;
    let l = caps.get(3).and_then(|c| c.as_str().parse::<f64>().ok())
        .ok_or_else(|| ContrastCheckerError::InvalidColor("Invalid L value".to_string()))?;
    
    Ok(hsl_to_rgb(h, s / 100.0, l / 100.0))
}

fn normalize_hex(rgb: (u8, u8, u8)) -> String {
    format!("#{:02X}{:02X}{:02X}", rgb.0, rgb.1, rgb.2)
}

fn rgb_to_luminance(r: u8, g: u8, b: u8) -> f64 {
    let r_norm = r as f64 / 255.0;
    let g_norm = g as f64 / 255.0;
    let b_norm = b as f64 / 255.0;

    let r_linear = if r_norm <= 0.03928 {
        r_norm / 12.92
    } else {
        ((r_norm + 0.055) / 1.055).powf(2.4)
    };

    let g_linear = if g_norm <= 0.03928 {
        g_norm / 12.92
    } else {
        ((g_norm + 0.055) / 1.055).powf(2.4)
    };

    let b_linear = if b_norm <= 0.03928 {
        b_norm / 12.92
    } else {
        ((b_norm + 0.055) / 1.055).powf(2.4)
    };

    0.2126 * r_linear + 0.7152 * g_linear + 0.0722 * b_linear
}

pub fn check_contrast(
    foreground: &str,
    background: &str,
) -> Result<ContrastResult, ContrastCheckerError> {
    let fg_rgb = if foreground.starts_with('#') {
        hex_to_rgb(foreground)?
    } else if foreground.to_lowercase().starts_with("rgb") {
        parse_rgb(foreground)?
    } else if foreground.to_lowercase().starts_with("hsl") {
        parse_hsl(foreground)?
    } else {
        hex_to_rgb(foreground)?
    };

    let bg_rgb = if background.starts_with('#') {
        hex_to_rgb(background)?
    } else if background.to_lowercase().starts_with("rgb") {
        parse_rgb(background)?
    } else if background.to_lowercase().starts_with("hsl") {
        parse_hsl(background)?
    } else {
        hex_to_rgb(background)?
    };

    let fg_luminance = rgb_to_luminance(fg_rgb.0, fg_rgb.1, fg_rgb.2);
    let bg_luminance = rgb_to_luminance(bg_rgb.0, bg_rgb.1, bg_rgb.2);

    let (lighter, darker) = if fg_luminance > bg_luminance {
        (fg_luminance, bg_luminance)
    } else {
        (bg_luminance, fg_luminance)
    };

    let ratio = (lighter + 0.05) / (darker + 0.05);

    Ok(ContrastResult {
        ratio,
        foreground_hex: normalize_hex(fg_rgb),
        background_hex: normalize_hex(bg_rgb),
        foreground_luminance: fg_luminance,
        background_luminance: bg_luminance,
        normal_aa: ratio >= 4.5,
        large_aa: ratio >= 3.0,
        normal_aaa: ratio >= 7.0,
        large_aaa: ratio >= 4.5,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hex_to_rgb() {
        let result = hex_to_rgb("#FFFFFF").unwrap();
        assert_eq!(result, (255, 255, 255));
        
        let result = hex_to_rgb("#000000").unwrap();
        assert_eq!(result, (0, 0, 0));
        
        let result = hex_to_rgb("#FFF").unwrap();
        assert_eq!(result, (255, 255, 255));
    }

    #[test]
    fn test_parse_rgb() {
        let result = parse_rgb("rgb(255, 0, 0)").unwrap();
        assert_eq!(result, (255, 0, 0));
        
        let result = parse_rgb("rgb(255,255,255)").unwrap();
        assert_eq!(result, (255, 255, 255));
    }

    #[test]
    fn test_rgb_to_hsl_and_back() {
        let rgb = (255, 0, 0);
        let (h, s, l) = rgb_to_hsl(rgb.0, rgb.1, rgb.2);
        let back = hsl_to_rgb(h, s, l);
        assert!((back.0 as i32 - rgb.0 as i32).abs() <= 1);
        assert!((back.1 as i32 - rgb.1 as i32).abs() <= 1);
        assert!((back.2 as i32 - rgb.2 as i32).abs() <= 1);
    }

    #[test]
    fn test_rgb_to_luminance() {
        let lum = rgb_to_luminance(255, 255, 255);
        assert!((lum - 1.0).abs() < 0.01);
        
        let lum = rgb_to_luminance(0, 0, 0);
        assert!((lum - 0.0).abs() < 0.01);
    }

    #[test]
    fn test_check_contrast_white_black() {
        let result = check_contrast("#FFFFFF", "#000000").unwrap();
        assert!((result.ratio - 21.0).abs() < 0.1);
        assert!(result.normal_aa);
        assert!(result.large_aa);
        assert!(result.normal_aaa);
        assert!(result.large_aaa);
    }

    #[test]
    fn test_check_contrast_red_green() {
        let result = check_contrast("#FF0000", "#00FF00").unwrap();
        assert!(result.ratio > 1.0);
        assert_eq!(result.foreground_hex, "#FF0000");
        assert_eq!(result.background_hex, "#00FF00");
    }

    #[test]
    fn test_check_contrast_with_rgb() {
        let result = check_contrast("rgb(255, 255, 255)", "rgb(0, 0, 0)").unwrap();
        assert!((result.ratio - 21.0).abs() < 0.1);
    }

    #[test]
    fn test_check_contrast_with_hsl() {
        let result = check_contrast("hsl(0, 100%, 50%)", "hsl(120, 100%, 50%)").unwrap();
        assert!(result.ratio > 1.0);
    }

    #[test]
    fn test_invalid_hex() {
        let result = check_contrast("#GGGGGG", "#000000");
        assert!(result.is_err());
    }

    #[test]
    fn test_normalize_hex() {
        assert_eq!(normalize_hex((255, 255, 255)), "#FFFFFF");
        assert_eq!(normalize_hex((0, 0, 0)), "#000000");
        assert_eq!(normalize_hex((255, 0, 128)), "#FF0080");
    }

    #[test]
    fn test_contrast_levels() {
        let result = check_contrast("#FFFFFF", "#767676").unwrap();
        let ratio = result.ratio;
        
        let normal_aa = ratio >= 4.5;
        let large_aa = ratio >= 3.0;
        let normal_aaa = ratio >= 7.0;
        let large_aaa = ratio >= 4.5;
        
        assert_eq!(result.normal_aa, normal_aa);
        assert_eq!(result.large_aa, large_aa);
        assert_eq!(result.normal_aaa, normal_aaa);
        assert_eq!(result.large_aaa, large_aaa);
    }
}
