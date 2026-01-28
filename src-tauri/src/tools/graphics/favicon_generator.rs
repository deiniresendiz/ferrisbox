use thiserror::Error;
use serde::Serialize;
use image::{DynamicImage, imageops::FilterType};
use base64::{engine::general_purpose::STANDARD, Engine as _};
use ico::{IconDir, IconDirEntry, IconImage};

#[derive(Error, Debug)]
pub enum FaviconGeneratorError {
    #[error("Invalid data URL format: {0}")]
    InvalidDataUrl(String),
    #[error("Image resize error: {0}")]
    ResizeError(String),
    #[error("Image encoding error: {0}")]
    EncodingError(String),
    #[error("ICO encoding error: {0}")]
    IcoError(String),
}

#[derive(Debug, Serialize)]
pub struct FaviconStats {
    pub source_size: usize,
    pub total_pngs: usize,
    pub total_sizes_kb: f64,
}

fn parse_data_url(data_url: &str) -> Result<(Vec<u8>, String), FaviconGeneratorError> {
    if !data_url.starts_with("data:") {
        return Err(FaviconGeneratorError::InvalidDataUrl("Must start with data:".to_string()));
    }

    let parts: Vec<&str> = data_url.splitn(2, ',').collect();
    if parts.len() != 2 {
        return Err(FaviconGeneratorError::InvalidDataUrl("Invalid format".to_string()));
    }

    let header = parts[0];
    let base64_data = parts[1];

    let mime_type = header
        .split(';')
        .next()
        .and_then(|s| s.strip_prefix("data:"))
        .ok_or_else(|| FaviconGeneratorError::InvalidDataUrl("No MIME type".to_string()))?;

    let bytes = STANDARD
        .decode(base64_data)
        .map_err(|e| FaviconGeneratorError::InvalidDataUrl(e.to_string()))?;

    Ok((bytes, mime_type.to_string()))
}

fn resize_image(img: &DynamicImage, size: usize) -> Result<Vec<u8>, FaviconGeneratorError> {
    let size = size as u32;
    let resized = img.resize(size, size, FilterType::Lanczos3);

    let mut buffer = Vec::new();
    let encoder = image::codecs::png::PngEncoder::new_with_quality(
        &mut buffer,
        image::codecs::png::CompressionType::Fast,
        image::codecs::png::FilterType::default(),
    );

    resized
        .write_with_encoder(encoder)
        .map_err(|e: image::ImageError| FaviconGeneratorError::EncodingError(e.to_string()))?;

    Ok(buffer)
}

pub fn generate_favicon_ico(
    data_url: &str,
    sizes: &[usize],
) -> Result<(String, FaviconStats), FaviconGeneratorError> {
    let (source_bytes, _mime) = parse_data_url(data_url)?;
    let source_size = source_bytes.len();
    
    let img = image::load_from_memory(&source_bytes)
        .map_err(|e| FaviconGeneratorError::EncodingError(e.to_string()))?;
    
    let mut icon_dir = IconDir::new(ico::ResourceType::Icon);

    for &size in sizes {
        let png_data = resize_image(&img, size)?;
        let dynamic_img = image::ImageReader::new(std::io::Cursor::new(&png_data))
            .with_guessed_format()
            .map_err(|e| FaviconGeneratorError::EncodingError(e.to_string()))?
            .decode()
            .map_err(|e| FaviconGeneratorError::EncodingError(e.to_string()))?;

        let rgba_data = dynamic_img.to_rgba8().as_raw().to_vec();
        let icon_image = IconImage::from_rgba_data(size as u32, size as u32, rgba_data);

        let entry = IconDirEntry::encode(&icon_image)
            .map_err(|e: std::io::Error| FaviconGeneratorError::IcoError(e.to_string()))?;

        icon_dir.add_entry(entry);
    }
    
    let mut ico_buffer = Vec::new();
    icon_dir
        .write(&mut ico_buffer)
        .map_err(|e| FaviconGeneratorError::IcoError(e.to_string()))?;
    
    let ico_base64 = STANDARD.encode(&ico_buffer);
    let ico_data_url = format!("data:image/x-icon;base64,{}", ico_base64);
    
    let total_sizes_kb = sizes.iter()
        .map(|&s| (s * s * 4) as f64 / 1024.0)
        .sum::<f64>();
    
    let stats = FaviconStats {
        source_size,
        total_pngs: sizes.len(),
        total_sizes_kb,
    };
    
    Ok((ico_data_url, stats))
}

pub fn generate_favicon_pngs(
    data_url: &str,
    sizes: &[usize],
) -> Result<(Vec<(String, usize)>, FaviconStats), FaviconGeneratorError> {
    let (source_bytes, _mime) = parse_data_url(data_url)?;
    let source_size = source_bytes.len();
    
    let img = image::ImageReader::new(std::io::Cursor::new(&source_bytes))
        .with_guessed_format()
        .map_err(|e| FaviconGeneratorError::EncodingError(e.to_string()))?
        .decode()
        .map_err(|e| FaviconGeneratorError::EncodingError(e.to_string()))?;

    let mut pngs = Vec::new();

    for &size in sizes {
        let png_data = resize_image(&img, size)?;

        let png_base64 = STANDARD.encode(&png_data);
        let png_data_url = format!("data:image/png;base64,{}", png_base64);

        pngs.push((png_data_url, size));
    }
    
    let total_sizes_kb = sizes.iter()
        .map(|&s| (s * s * 4) as f64 / 1024.0)
        .sum::<f64>();
    
    let stats = FaviconStats {
        source_size,
        total_pngs: sizes.len(),
        total_sizes_kb,
    };
    
    Ok((pngs, stats))
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

    #[test]
    fn test_parse_data_url() {
        let data_url = create_test_png_data_url();
        let result = parse_data_url(&data_url);
        assert!(result.is_ok());
    }

    #[test]
    fn test_resize_image() {
        let data_url = create_test_png_data_url();
        let (bytes, _) = parse_data_url(&data_url).unwrap();
        let img = image::load_from_memory(&bytes).unwrap();
        
        let result = resize_image(&img, 16);
        assert!(result.is_ok());
        let resized = result.unwrap();
        assert!(resized.len() > 0);
    }

    #[test]
    fn test_generate_favicon_ico() {
        let data_url = create_test_png_data_url();
        let sizes = vec![16, 32, 48];
        let result = generate_favicon_ico(&data_url, &sizes);
        assert!(result.is_ok());
        let (ico_data_url, stats) = result.unwrap();
        assert!(ico_data_url.starts_with("data:image/x-icon;base64,"));
        assert_eq!(stats.total_pngs, 3);
    }

    #[test]
    fn test_generate_favicon_pngs() {
        let data_url = create_test_png_data_url();
        let sizes = vec![16, 32, 48];
        let result = generate_favicon_pngs(&data_url, &sizes);
        assert!(result.is_ok());
        let (pngs, stats) = result.unwrap();
        assert_eq!(pngs.len(), 3);
        assert_eq!(stats.total_pngs, 3);
        
        for (png_data_url, size) in pngs {
            assert!(png_data_url.starts_with("data:image/png;base64,"));
            assert!(size > 0);
        }
    }

    #[test]
    fn test_favicon_stats() {
        let data_url = create_test_png_data_url();
        let sizes = vec![16, 32];
        let result = generate_favicon_pngs(&data_url, &sizes).unwrap();
        let stats = result.1;
        
        assert!(stats.source_size > 0);
        assert_eq!(stats.total_pngs, 2);
        assert!(stats.total_sizes_kb > 0.0);
    }
}
