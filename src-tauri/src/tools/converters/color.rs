use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct ColorOutput {
    hex: String,
    hex_alpha: String,
    rgb: String,
    rgba: String,
    hsl: String,
    hsla: String,
    hsv: String,
    hsva: String,
    cmyk: String,
    cmyk_alpha: String,
}

#[derive(Serialize, Deserialize)]
pub struct ColorInput {
    color: String,
    format: String,
}

#[tauri::command]
pub fn convert_color_command(
    color: String,
    format: String,
) -> Result<ColorOutput, String> {
    let (r, g, b, a) = match format.as_str() {
        "hex" => parse_hex_color(&color)?,
        "rgb" => parse_rgb_color(&color)?,
        "hsl" => {
            let (h, s, l, alpha) = parse_hsl_color(&color)?;
            hsl_to_rgb(h, s, l, alpha)
        }
        "hsv" => {
            let (h, s, v, alpha) = parse_hsv_color(&color)?;
            hsv_to_rgb(h, s, v, alpha)
        }
        "cmyk" => {
            let (c, m, y, k, alpha) = parse_cmyk_color(&color)?;
            cmyk_to_rgb(c, m, y, k, alpha)
        }
        _ => return Err("Unsupported color format".to_string()),
    };

    let hex = rgb_to_hex(r, g, b);
    let hex_alpha = format!("#{:02x}{:02x}{:02x}{:02x}",
        (r * 255.0) as u8, (g * 255.0) as u8, (b * 255.0) as u8, (a * 255.0) as u8);
    let rgb_str = format!("rgb({}, {}, {})", (r * 255.0) as u8, (g * 255.0) as u8, (b * 255.0) as u8);
    let rgba_str = format!("rgba({}, {}, {}, {})", (r * 255.0) as u8, (g * 255.0) as u8, (b * 255.0) as u8, a);
    let (h, s, l) = rgb_to_hsl(r, g, b);
    let (hv, sv, v) = rgb_to_hsv(r, g, b);
    let (c, m, y, k) = rgb_to_cmyk(r, g, b);

    Ok(ColorOutput {
        hex,
        hex_alpha,
        rgb: rgb_str,
        rgba: rgba_str,
        hsl: format!("hsl({}, {}%, {}%)", h, s * 100.0, l * 100.0),
        hsla: format!("hsla({}, {}%, {}%, {})", h, s * 100.0, l * 100.0, a),
        hsv: format!("hsv({}, {}%, {}%)", hv, sv * 100.0, v * 100.0),
        hsva: format!("hsva({}, {}%, {}%, {})", hv, sv * 100.0, v * 100.0, a),
        cmyk: format!("cmyk({}, {}%, {}%, {}%)", c * 100.0, m * 100.0, y * 100.0, k * 100.0),
        cmyk_alpha: format!("cmyka({}, {}%, {}%, {}%, {})", c * 100.0, m * 100.0, y * 100.0, k * 100.0, a),
    })
}

fn rgb_to_hex(r: f32, g: f32, b: f32) -> String {
    format!("#{:02x}{:02x}{:02x}",
        (r * 255.0) as u8, (g * 255.0) as u8, (b * 255.0) as u8)
}

fn parse_hex_color(hex: &str) -> Result<(f32, f32, f32, f32), String> {
    let cleaned = hex.trim().trim_start_matches('#');
    let len = cleaned.len();

    match len {
        6 => {
            let r = u8::from_str_radix(&cleaned[0..2], 16).map_err(|_| "Invalid hex color")?;
            let g = u8::from_str_radix(&cleaned[2..4], 16).map_err(|_| "Invalid hex color")?;
            let b = u8::from_str_radix(&cleaned[4..6], 16).map_err(|_| "Invalid hex color")?;
            Ok((r as f32 / 255.0, g as f32 / 255.0, b as f32 / 255.0, 1.0))
        }
        8 => {
            let r = u8::from_str_radix(&cleaned[0..2], 16).map_err(|_| "Invalid hex color")?;
            let g = u8::from_str_radix(&cleaned[2..4], 16).map_err(|_| "Invalid hex color")?;
            let b = u8::from_str_radix(&cleaned[4..6], 16).map_err(|_| "Invalid hex color")?;
            let a = u8::from_str_radix(&cleaned[6..8], 16).map_err(|_| "Invalid hex color")?;
            Ok((r as f32 / 255.0, g as f32 / 255.0, b as f32 / 255.0, a as f32 / 255.0))
        }
        _ => Err("Invalid hex color format. Use 6 or 8 characters.".to_string()),
    }
}

fn parse_rgb_color(rgb: &str) -> Result<(f32, f32, f32, f32), String> {
    let re = regex::Regex::new(r"rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)")
        .map_err(|_| "Failed to create regex")?;
    let caps = re.captures(rgb).ok_or("Invalid RGB format")?;

    let r = caps.get(1).unwrap().as_str().parse::<f32>().map_err(|_| "Invalid RGB value")? / 255.0;
    let g = caps.get(2).unwrap().as_str().parse::<f32>().map_err(|_| "Invalid RGB value")? / 255.0;
    let b = caps.get(3).unwrap().as_str().parse::<f32>().map_err(|_| "Invalid RGB value")? / 255.0;
    let a = caps.get(4)
        .map(|s| s.as_str().parse::<f32>().map_err(|_| "Invalid alpha value"))
        .transpose()?
        .unwrap_or(1.0);

    Ok((r, g, b, a))
}

fn parse_hsl_color(hsl: &str) -> Result<(f32, f32, f32, f32), String> {
    let re = regex::Regex::new(r"hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%(?:\s*,\s*([\d.]+))?\s*\)")
        .map_err(|_| "Failed to create regex")?;
    let caps = re.captures(hsl).ok_or("Invalid HSL format")?;

    let h = caps.get(1).unwrap().as_str().parse::<f32>().map_err(|_| "Invalid HSL hue")?;
    let s = caps.get(2).unwrap().as_str().parse::<f32>().map_err(|_| "Invalid HSL saturation")? / 100.0;
    let l = caps.get(3).unwrap().as_str().parse::<f32>().map_err(|_| "Invalid HSL lightness")? / 100.0;
    let a = caps.get(4)
        .map(|s| s.as_str().parse::<f32>().map_err(|_| "Invalid alpha value"))
        .transpose()?
        .unwrap_or(1.0);

    Ok((h, s, l, a))
}

fn hsl_to_rgb(h: f32, s: f32, l: f32, a: f32) -> (f32, f32, f32, f32) {
    let c = (1.0 - (2.0 * l - 1.0).abs()) * s;
    let x = c * (1.0 - ((h / 60.0) % 2.0 - 1.0).abs());
    let m = l - c / 2.0;

    let (r1, g1, b1) = if h < 60.0 {
        (c, x, 0.0)
    } else if h < 120.0 {
        (x, c, 0.0)
    } else if h < 180.0 {
        (0.0, c, x)
    } else if h < 240.0 {
        (0.0, x, c)
    } else if h < 300.0 {
        (x, 0.0, c)
    } else {
        (c, 0.0, x)
    };

    (r1 + m, g1 + m, b1 + m, a)
}

fn parse_hsv_color(hsv: &str) -> Result<(f32, f32, f32, f32), String> {
    let re = regex::Regex::new(r"hsva?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%(?:\s*,\s*([\d.]+))?\s*\)")
        .map_err(|_| "Failed to create regex")?;
    let caps = re.captures(hsv).ok_or("Invalid HSV format")?;

    let h = caps.get(1).unwrap().as_str().parse::<f32>().map_err(|_| "Invalid HSV hue")?;
    let s = caps.get(2).unwrap().as_str().parse::<f32>().map_err(|_| "Invalid HSV saturation")? / 100.0;
    let v = caps.get(3).unwrap().as_str().parse::<f32>().map_err(|_| "Invalid HSV value")? / 100.0;
    let a = caps.get(4)
        .map(|s| s.as_str().parse::<f32>().map_err(|_| "Invalid alpha value"))
        .transpose()?
        .unwrap_or(1.0);

    Ok((h, s, v, a))
}

fn hsv_to_rgb(h: f32, s: f32, v: f32, a: f32) -> (f32, f32, f32, f32) {
    let c = v * s;
    let x = c * (1.0 - ((h / 60.0) % 2.0 - 1.0).abs());
    let m = v - c;

    let (r1, g1, b1) = if h < 60.0 {
        (c, x, 0.0)
    } else if h < 120.0 {
        (x, c, 0.0)
    } else if h < 180.0 {
        (0.0, c, x)
    } else if h < 240.0 {
        (0.0, x, c)
    } else if h < 300.0 {
        (x, 0.0, c)
    } else {
        (c, 0.0, x)
    };

    (r1 + m, g1 + m, b1 + m, a)
}

fn parse_cmyk_color(cmyk: &str) -> Result<(f32, f32, f32, f32, f32), String> {
    let re = regex::Regex::new(r"cmyka?\s*\(\s*(\d+)%\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,\s*(\d+)%(?:\s*,\s*([\d.]+))?\s*\)")
        .map_err(|_| "Failed to create regex")?;
    let caps = re.captures(cmyk).ok_or("Invalid CMYK format")?;

    let c = caps.get(1).unwrap().as_str().parse::<f32>().map_err(|_| "Invalid CMYK cyan")? / 100.0;
    let m = caps.get(2).unwrap().as_str().parse::<f32>().map_err(|_| "Invalid CMYK magenta")? / 100.0;
    let y = caps.get(3).unwrap().as_str().parse::<f32>().map_err(|_| "Invalid CMYK yellow")? / 100.0;
    let k = caps.get(4).unwrap().as_str().parse::<f32>().map_err(|_| "Invalid CMYK key")? / 100.0;
    let a = caps.get(5)
        .map(|s| s.as_str().parse::<f32>().map_err(|_| "Invalid alpha value"))
        .transpose()?
        .unwrap_or(1.0);

    Ok((c, m, y, k, a))
}

fn cmyk_to_rgb(c: f32, m: f32, y: f32, k: f32, a: f32) -> (f32, f32, f32, f32) {
    let r = (1.0 - c) * (1.0 - k);
    let g = (1.0 - m) * (1.0 - k);
    let b = (1.0 - y) * (1.0 - k);

    (r, g, b, a)
}

fn rgb_to_hsl(r: f32, g: f32, b: f32) -> (f32, f32, f32) {
    let max = r.max(g).max(b);
    let min = r.min(g).min(b);
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

        let h = if max == r {
            60.0 * (((g - b) / delta) % 6.0)
        } else if max == g {
            60.0 * ((b - r) / delta + 2.0)
        } else {
            60.0 * ((r - g) / delta + 4.0)
        };

        (if h < 0.0 { h + 360.0 } else { h }, s)
    };

    (h, s, l)
}

fn rgb_to_hsv(r: f32, g: f32, b: f32) -> (f32, f32, f32) {
    let max = r.max(g).max(b);
    let min = r.min(g).min(b);
    let delta = max - min;

    let h = if delta == 0.0 {
        0.0
    } else if max == r {
        60.0 * (((g - b) / delta) % 6.0)
    } else if max == g {
        60.0 * ((b - r) / delta + 2.0)
    } else {
        60.0 * ((r - g) / delta + 4.0)
    };

    let h = if h < 0.0 { h + 360.0 } else { h };
    let s = if max == 0.0 { 0.0 } else { delta / max };

    (h, s, max)
}

fn rgb_to_cmyk(r: f32, g: f32, b: f32) -> (f32, f32, f32, f32) {
    let k = 1.0 - r.max(g).max(b);
    let c = if k == 1.0 { 0.0 } else { (1.0 - r - k) / (1.0 - k) };
    let m = if k == 1.0 { 0.0 } else { (1.0 - g - k) / (1.0 - k) };
    let y = if k == 1.0 { 0.0 } else { (1.0 - b - k) / (1.0 - k) };

    (c, m, y, k)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hex_to_rgb() {
        let result = convert_color_command("#FF5733".to_string(), "hex".to_string()).unwrap();
        assert_eq!(result.rgb, "rgb(255, 87, 51)");
    }

    #[test]
    fn test_rgb_to_hex() {
        let result = convert_color_command("rgb(255, 87, 51)".to_string(), "rgb".to_string()).unwrap();
        assert_eq!(result.hex, "#ff5733");
    }

    #[test]
    fn test_hsl_to_rgb() {
        let result = convert_color_command("hsl(11, 100%, 60%)".to_string(), "hsl".to_string()).unwrap();
        assert!(result.hsl.contains("11"));
    }

    #[test]
    fn test_invalid_hex() {
        let result = convert_color_command("#ZZZZZZ".to_string(), "hex".to_string());
        assert!(result.is_err());
    }
}
