use thiserror::Error;
use serde::{Deserialize, Serialize};
use image::{DynamicImage, ImageReader, ImageFormat as ImgFormat};
use base64::{engine::general_purpose::STANDARD, Engine as _};

#[derive(Error, Debug)]
pub enum ImageCompressorError {
    #[error("Invalid data URL format: {0}")]
    InvalidDataUrl(String),
    #[error("Image encoding error: {0}")]
    EncodingError(String),
    #[error("Unsupported image format")]
    UnsupportedFormat,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum ImageFormat {
    Png,
    Jpeg,
    WebP,
}

#[derive(Debug, Serialize)]
pub struct CompressionStats {
    pub original_size: usize,
    pub compressed_size: usize,
    pub savings_bytes: usize,
    pub savings_percent: f64,
    pub dimensions: (u32, u32),
}

fn parse_data_url(data_url: &str) -> Result<(Vec<u8>, ImgFormat, String), ImageCompressorError> {
    if !data_url.starts_with("data:") {
        return Err(ImageCompressorError::InvalidDataUrl("Must start with data:".to_string()));
    }

    let parts: Vec<&str> = data_url.splitn(2, ',').collect();
    if parts.len() != 2 {
        return Err(ImageCompressorError::InvalidDataUrl("Invalid format".to_string()));
    }

    let header = parts[0];
    let base64_data = parts[1];

    let mime_type = header
        .split(';')
        .next()
        .and_then(|s| s.strip_prefix("data:"))
        .ok_or_else(|| ImageCompressorError::InvalidDataUrl("No MIME type".to_string()))?;

    let format = match mime_type {
        "image/png" => ImgFormat::Png,
        "image/jpeg" | "image/jpg" => ImgFormat::Jpeg,
        "image/webp" => ImgFormat::WebP,
        _ => return Err(ImageCompressorError::UnsupportedFormat),
    };

    let bytes = STANDARD
        .decode(base64_data)
        .map_err(|e| ImageCompressorError::InvalidDataUrl(e.to_string()))?;

    Ok((bytes, format, mime_type.to_string()))
}

pub fn compress_image(
    data_url: &str,
    output_format: ImageFormat,
    quality: u8,
) -> Result<(String, CompressionStats), ImageCompressorError> {
    let (original_bytes, _input_format, original_mime) = parse_data_url(data_url)?;
    let original_size = original_bytes.len();

    let img = ImageReader::new(std::io::Cursor::new(&original_bytes))
        .with_guessed_format()
        .map_err(|e| ImageCompressorError::EncodingError(e.to_string()))?
        .decode()
        .map_err(|e| ImageCompressorError::EncodingError(e.to_string()))?;

    let dimensions = (img.width(), img.height());

    let mut compressed_bytes: Vec<u8> = Vec::new();
    let output_mime = match output_format {
        ImageFormat::Png => {
            let encoder = image::codecs::png::PngEncoder::new_with_quality(
                &mut compressed_bytes,
                image::codecs::png::CompressionType::Fast,
                image::codecs::png::FilterType::default(),
            );
            img.write_with_encoder(encoder)
                .map_err(|e| ImageCompressorError::EncodingError(e.to_string()))?;
            "image/png"
        }
        ImageFormat::Jpeg => {
            let encoder = image::codecs::jpeg::JpegEncoder::new_with_quality(&mut compressed_bytes, quality);
            img.write_with_encoder(encoder)
                .map_err(|e| ImageCompressorError::EncodingError(e.to_string()))?;
            "image/jpeg"
        }
        ImageFormat::WebP => {
            let encoder = image::codecs::webp::WebPEncoder::new_lossless(&mut compressed_bytes);
            img.write_with_encoder(encoder)
                .map_err(|e| ImageCompressorError::EncodingError(e.to_string()))?;
            "image/webp"
        }
    };

    let compressed_size = compressed_bytes.len();
    let savings_bytes = original_size.saturating_sub(compressed_size);
    let savings_percent = if original_size > 0 {
        (savings_bytes as f64 / original_size as f64) * 100.0
    } else {
        0.0
    };

    let compressed_base64 = STANDARD.encode(&compressed_bytes);
    let compressed_data_url = format!("data:{};base64,{}", output_mime, compressed_base64);

    let stats = CompressionStats {
        original_size,
        compressed_size,
        savings_bytes,
        savings_percent,
        dimensions,
    };

    Ok((compressed_data_url, stats))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_png_data_url() -> String {
        let png_data = vec![
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xDE,
        ];
        let base64 = STANDARD.encode(&png_data);
        format!("data:image/png;base64,{}", base64)
    }

    #[test]
    fn test_parse_data_url_png() {
        let data_url = create_test_png_data_url();
        let result = parse_data_url(&data_url);
        assert!(result.is_ok());
        let (_bytes, format, mime) = result.unwrap();
        assert_eq!(format, ImageFormat::Png);
        assert_eq!(mime, "image/png");
    }

    #[test]
    fn test_parse_data_url_invalid() {
        let data_url = "not a data url";
        let result = parse_data_url(data_url);
        assert!(result.is_err());
    }

    #[test]
    fn test_compress_to_png() {
        let data_url = create_test_png_data_url();
        let result = compress_image(&data_url, ImageFormat::Png, 80);
        assert!(result.is_ok());
        let (compressed_data_url, stats) = result.unwrap();
        assert!(compressed_data_url.starts_with("data:image/png;base64,"));
        assert_eq!(stats.dimensions, (1, 1));
    }

    #[test]
    fn test_compress_to_jpeg() {
        let data_url = create_test_png_data_url();
        let result = compress_image(&data_url, ImageFormat::Jpeg, 80);
        assert!(result.is_ok());
        let (compressed_data_url, stats) = result.unwrap();
        assert!(compressed_data_url.starts_with("data:image/jpeg;base64,"));
        assert_eq!(stats.dimensions, (1, 1));
    }

    #[test]
    fn test_compress_to_webp() {
        let data_url = create_test_png_data_url();
        let result = compress_image(&data_url, ImageFormat::WebP, 80);
        assert!(result.is_ok());
        let (compressed_data_url, stats) = result.unwrap();
        assert!(compressed_data_url.starts_with("data:image/webp;base64,"));
        assert_eq!(stats.dimensions, (1, 1));
    }

    #[test]
    fn test_compression_stats() {
        let data_url = create_test_png_data_url();
        let result = compress_image(&data_url, ImageFormat::Png, 80).unwrap();
        let stats = result.1;
        assert!(stats.original_size > 0);
        assert!(stats.compressed_size > 0);
    }
}
