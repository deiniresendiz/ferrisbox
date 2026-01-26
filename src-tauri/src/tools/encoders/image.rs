use thiserror::Error;

#[derive(Error, Debug)]
pub enum ImageError {
    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
    #[error("Base64 decode error: {0}")]
    Base64Error(#[from] base64::DecodeError),
    #[error("Invalid data URL format")]
    InvalidDataUrl,
    #[error("Unsupported image format")]
    UnsupportedFormat,
}

/// Encode an image file to base64 data URL
/// Detects MIME type from file extension
pub fn encode_image_to_base64(file_path: &str) -> Result<String, ImageError> {
    use std::fs;
    use base64::{engine::general_purpose::STANDARD, Engine as _};
    
    // Read file bytes
    let bytes = fs::read(file_path)?;
    
    // Detect MIME type from extension
    let mime_type = detect_mime_type(file_path)?;
    
    // Encode to base64
    let base64_data = STANDARD.encode(&bytes);
    
    // Return data URL
    Ok(format!("data:{};base64,{}", mime_type, base64_data))
}

/// Decode a base64 data URL to raw bytes and MIME type
pub fn decode_image_from_base64(data_url: &str) -> Result<(Vec<u8>, String), ImageError> {
    use base64::{engine::general_purpose::STANDARD, Engine as _};
    
    // Check if it's a data URL
    if !data_url.starts_with("data:") {
        return Err(ImageError::InvalidDataUrl);
    }
    
    // Split: "data:image/png;base64,iVBORw0KGgo..."
    let parts: Vec<&str> = data_url.splitn(2, ',').collect();
    
    if parts.len() != 2 {
        return Err(ImageError::InvalidDataUrl);
    }
    
    let header = parts[0]; // "data:image/png;base64"
    let base64_data = parts[1];
    
    // Extract MIME type
    let mime_parts: Vec<&str> = header.split(';').collect();
    if mime_parts.is_empty() {
        return Err(ImageError::InvalidDataUrl);
    }
    
    let mime_type = mime_parts[0]
        .strip_prefix("data:")
        .ok_or(ImageError::InvalidDataUrl)?
        .to_string();
    
    // Decode base64
    let bytes = STANDARD.decode(base64_data)?;
    
    Ok((bytes, mime_type))
}

/// Detect MIME type from file extension
fn detect_mime_type(file_path: &str) -> Result<&'static str, ImageError> {
    let extension = std::path::Path::new(file_path)
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase())
        .unwrap_or_default();
    
    match extension.as_str() {
        "png" => Ok("image/png"),
        "jpg" | "jpeg" => Ok("image/jpeg"),
        "gif" => Ok("image/gif"),
        "webp" => Ok("image/webp"),
        "svg" => Ok("image/svg+xml"),
        "bmp" => Ok("image/bmp"),
        "ico" => Ok("image/x-icon"),
        _ => Err(ImageError::UnsupportedFormat),
    }
}

/// Get file extension from MIME type
pub fn get_extension_from_mime(mime_type: &str) -> &'static str {
    match mime_type {
        "image/png" => "png",
        "image/jpeg" => "jpg",
        "image/gif" => "gif",
        "image/webp" => "webp",
        "image/svg+xml" => "svg",
        "image/bmp" => "bmp",
        "image/x-icon" => "ico",
        _ => "bin", // fallback
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_mime_type_png() {
        assert_eq!(detect_mime_type("image.png").unwrap(), "image/png");
    }

    #[test]
    fn test_detect_mime_type_jpeg() {
        assert_eq!(detect_mime_type("photo.jpg").unwrap(), "image/jpeg");
        assert_eq!(detect_mime_type("photo.jpeg").unwrap(), "image/jpeg");
    }

    #[test]
    fn test_detect_mime_type_case_insensitive() {
        assert_eq!(detect_mime_type("IMAGE.PNG").unwrap(), "image/png");
        assert_eq!(detect_mime_type("Photo.JPG").unwrap(), "image/jpeg");
    }

    #[test]
    fn test_detect_mime_type_unsupported() {
        let result = detect_mime_type("file.txt");
        assert!(result.is_err());
    }

    #[test]
    fn test_decode_valid_data_url() {
        let data_url = "data:image/png;base64,iVBORw0KGgo=";
        let result = decode_image_from_base64(data_url);
        assert!(result.is_ok());
        
        let (bytes, mime) = result.unwrap();
        assert_eq!(mime, "image/png");
        assert!(!bytes.is_empty());
    }

    #[test]
    fn test_decode_invalid_data_url() {
        let result = decode_image_from_base64("not a data url");
        assert!(result.is_err());
    }

    #[test]
    fn test_decode_malformed_data_url() {
        let result = decode_image_from_base64("data:image/png");
        assert!(result.is_err());
    }

    #[test]
    fn test_get_extension_from_mime() {
        assert_eq!(get_extension_from_mime("image/png"), "png");
        assert_eq!(get_extension_from_mime("image/jpeg"), "jpg");
        assert_eq!(get_extension_from_mime("image/gif"), "gif");
        assert_eq!(get_extension_from_mime("unknown"), "bin");
    }

    #[test]
    fn test_roundtrip_small_image() {
        use std::fs;
        use std::io::Write;
        
        // Create a temporary PNG file (1x1 red pixel)
        let png_data = vec![
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xDE,
        ];
        
        let temp_path = "/tmp/test_image_ferrisbox.png";
        let mut file = fs::File::create(temp_path).unwrap();
        file.write_all(&png_data).unwrap();
        
        // Encode
        let data_url = encode_image_to_base64(temp_path).unwrap();
        assert!(data_url.starts_with("data:image/png;base64,"));
        
        // Decode
        let (decoded_bytes, mime) = decode_image_from_base64(&data_url).unwrap();
        assert_eq!(mime, "image/png");
        assert_eq!(decoded_bytes, png_data);
        
        // Cleanup
        fs::remove_file(temp_path).ok();
    }
}
