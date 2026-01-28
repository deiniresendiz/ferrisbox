use thiserror::Error;
use serde::Serialize;
use image::{DynamicImage, ImageReader};
use base64::{engine::general_purpose::STANDARD, Engine as _};

#[derive(Error, Debug)]
pub enum Base64PreviewerError {
    #[error("Invalid data URL format: {0}")]
    InvalidDataUrl(String),
    #[error("Base64 decode error: {0}")]
    DecodeError(String),
    #[error("Image decode error: {0}")]
    DecodeImageError(String),
}

#[derive(Debug, Serialize)]
pub struct ImageInfo {
    pub is_valid: bool,
    pub mime_type: Option<String>,
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub size_bytes: usize,
    pub extension: String,
}

fn parse_data_url(data_url: &str) -> Result<(Vec<u8>, String), Base64PreviewerError> {
    if !data_url.starts_with("data:") {
        return Err(Base64PreviewerError::InvalidDataUrl(
            "Must start with data:".to_string(),
        ));
    }

    let parts: Vec<&str> = data_url.splitn(2, ',').collect();
    if parts.len() != 2 {
        return Err(Base64PreviewerError::InvalidDataUrl(
            "Invalid format".to_string(),
        ));
    }

    let header = parts[0];
    let base64_data = parts[1];

    let mime_type = header
        .split(';')
        .next()
        .and_then(|s| s.strip_prefix("data:"))
        .ok_or_else(|| Base64PreviewerError::InvalidDataUrl("No MIME type".to_string()))?;

    let bytes = STANDARD
        .decode(base64_data)
        .map_err(|e| Base64PreviewerError::DecodeError(e.to_string()))?;

    Ok((bytes, mime_type.to_string()))
}

fn get_extension_from_mime(mime_type: &str) -> String {
    match mime_type {
        "image/png" => "png".to_string(),
        "image/jpeg" | "image/jpg" => "jpg".to_string(),
        "image/gif" => "gif".to_string(),
        "image/webp" => "webp".to_string(),
        "image/svg+xml" => "svg".to_string(),
        "image/bmp" => "bmp".to_string(),
        "image/x-icon" => "ico".to_string(),
        _ => "bin".to_string(),
    }
}

pub fn validate_base64_image(data_url: &str) -> Result<ImageInfo, Base64PreviewerError> {
    let (bytes, mime_type) = parse_data_url(data_url)?;
    let size_bytes = bytes.len();
    let extension = get_extension_from_mime(&mime_type);

    if !mime_type.starts_with("image/") {
        return Ok(ImageInfo {
            is_valid: false,
            mime_type: Some(mime_type),
            width: None,
            height: None,
            size_bytes,
            extension,
        });
    }

    if mime_type == "image/svg+xml" {
        return Ok(ImageInfo {
            is_valid: true,
            mime_type: Some(mime_type),
            width: None,
            height: None,
            size_bytes,
            extension,
        });
    }

    let img = ImageReader::new(std::io::Cursor::new(&bytes))
        .with_guessed_format()
        .map_err(|e| Base64PreviewerError::DecodeImageError(e.to_string()))?
        .decode()
        .map_err(|e: image::ImageError| Base64PreviewerError::DecodeImageError(e.to_string()))?;

    let (width, height) = (img.width(), img.height());

    Ok(ImageInfo {
        is_valid: true,
        mime_type: Some(mime_type),
        width: Some(width),
        height: Some(height),
        size_bytes,
        extension,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_png_data_url() -> String {
        let png_data = vec![
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x10,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xDE,
        ];
        let base64 = STANDARD.encode(&png_data);
        format!("data:image/png;base64,{}", base64)
    }

    fn create_test_svg_data_url() -> String {
        let svg = "<svg width=\"100\" height=\"100\"><rect width=\"100\" height=\"100\"/></svg>";
        let base64 = STANDARD.encode(svg.as_bytes());
        format!("data:image/svg+xml;base64,{}", base64)
    }

    #[test]
    fn test_parse_data_url_valid() {
        let data_url = create_test_png_data_url();
        let result = parse_data_url(&data_url);
        assert!(result.is_ok());
        let (_bytes, mime) = result.unwrap();
        assert_eq!(mime, "image/png");
    }

    #[test]
    fn test_parse_data_url_invalid() {
        let data_url = "not a data url";
        let result = parse_data_url(data_url);
        assert!(result.is_err());
    }

    #[test]
    fn test_get_extension_from_mime() {
        assert_eq!(get_extension_from_mime("image/png"), "png");
        assert_eq!(get_extension_from_mime("image/jpeg"), "jpg");
        assert_eq!(get_extension_from_mime("image/svg+xml"), "svg");
        assert_eq!(get_extension_from_mime("unknown"), "bin");
    }

    #[test]
    fn test_validate_base64_png() {
        let data_url = create_test_png_data_url();
        let result = validate_base64_image(&data_url);
        assert!(result.is_ok());
        let info = result.unwrap();
        assert!(info.is_valid);
        assert_eq!(info.mime_type, Some("image/png".to_string()));
        assert_eq!(info.width, Some(16));
        assert_eq!(info.height, Some(16));
        assert_eq!(info.extension, "png");
    }

    #[test]
    fn test_validate_base64_svg() {
        let data_url = create_test_svg_data_url();
        let result = validate_base64_image(&data_url);
        assert!(result.is_ok());
        let info = result.unwrap();
        assert!(info.is_valid);
        assert_eq!(info.mime_type, Some("image/svg+xml".to_string()));
        assert!(info.width, None);
        assert!(info.height, None);
        assert_eq!(info.extension, "svg");
    }

    #[test]
    fn test_validate_invalid_image() {
        let data_url = "data:text/plain;base64,aGVsbG8=";
        let result = validate_base64_image(data_url);
        assert!(result.is_ok());
        let info = result.unwrap();
        assert!(!info.is_valid);
        assert_eq!(info.mime_type, Some("text/plain".to_string()));
    }
}
