use base64::Engine;
use qrcode::QrCode;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum QrType {
    Text,
    Wifi,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct QrOutput {
    pub svg: String,
    pub png_data_url: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WifiCredentials {
    pub ssid: String,
    pub password: Option<String>,
    pub encryption: String,
}

pub fn generate_qr_code(text: &str) -> QrOutput {
    let code = QrCode::new(text).unwrap();
    let svg = generate_svg(&code);
    let png = generate_png(&code);
    let png_data_url = format!("data:image/png;base64,{}", png);
    
    QrOutput {
        svg,
        png_data_url,
    }
}

pub fn generate_wifi_qr(creds: &WifiCredentials) -> QrOutput {
    let wifi_string = format!(
        "WIFI:S:{};T:{};{};;",
        creds.ssid,
        creds.encryption,
        creds.password.as_ref().map_or(String::new(), |p| format!("P:{}", p))
    );
    generate_qr_code(&wifi_string)
}

fn generate_svg(code: &QrCode) -> String {
    let image = code.render::<qrcode::render::svg::Color>();
    image.build()
}

fn generate_png(code: &QrCode) -> String {
    let size = 256;
    let mut image = image::GrayImage::new(size as u32, size as u32);
    let scale = size / code.width();
    
    for (x, y) in code.to_colors().into_iter().enumerate() {
        let pixel_x = (x % code.width()) * scale;
        let pixel_y = (x / code.width()) * scale;
        let color = match y {
            qrcode::Color::Light => 255u8,
            qrcode::Color::Dark => 0u8,
        };
        
        for i in 0..scale {
            for j in 0..scale {
                image.put_pixel(
                    (pixel_x + i) as u32,
                    (pixel_y + j) as u32,
                    image::Luma([color]),
                );
            }
        }
    }
    
    let mut buffer = Vec::new();
    let encoder = image::codecs::png::PngEncoder::new(&mut buffer);
    encoder.write_image(
        image.as_raw(),
        size as u32,
        size as u32,
        image::ExtendedColorType::L8,
    ).unwrap();
    
    base64::engine::general_purpose::STANDARD.encode(buffer)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_qr_code_svg() {
        let result = generate_qr_code("test");
        assert!(!result.svg.is_empty());
        assert!(result.svg.contains("<svg"));
    }

    #[test]
    fn test_generate_qr_code_png() {
        let result = generate_qr_code("test");
        assert!(!result.png_data_url.is_empty());
        assert!(result.png_data_url.starts_with("data:image/png;base64,"));
    }

    #[test]
    fn test_generate_wifi_qr() {
        let creds = WifiCredentials {
            ssid: "MyWiFi".to_string(),
            password: Some("password123".to_string()),
            encryption: "WPA".to_string(),
        };
        let result = generate_wifi_qr(&creds);
        assert!(!result.svg.is_empty());
        assert!(!result.png_data_url.is_empty());
    }

    #[test]
    fn test_generate_wifi_qr_no_password() {
        let creds = WifiCredentials {
            ssid: "OpenWiFi".to_string(),
            password: None,
            encryption: "nopass".to_string(),
        };
        let result = generate_wifi_qr(&creds);
        assert!(!result.svg.is_empty());
    }
}
