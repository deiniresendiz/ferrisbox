use flate2::Compression;
use flate2::write::{GzEncoder, ZlibEncoder};
use flate2::read::{GzDecoder, ZlibDecoder};
use std::io::{Write, Read};
use base64::engine::general_purpose::STANDARD as BASE64;
use base64::Engine;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum CompressionError {
    #[error("Compression failed: {0}")]
    CompressFailed(String),
    #[error("Decompression failed: {0}")]
    DecompressFailed(String),
    #[error("Invalid compression level: {0} (must be 1-9)")]
    InvalidLevel(u32),
}

#[derive(Debug, serde::Serialize)]
pub struct CompressionResult {
    pub compressed_base64: String,
    pub original_size: usize,
    pub compressed_size: usize,
    pub ratio_percent: f64,
    pub savings_bytes: i64,
}

/// Compress string using GZip with specified level (1-9)
pub fn compress_gzip(data: &str, level: u32) -> Result<CompressionResult, CompressionError> {
    if !(1..=9).contains(&level) {
        return Err(CompressionError::InvalidLevel(level));
    }
    
    let compression = Compression::new(level);
    let mut encoder = GzEncoder::new(Vec::new(), compression);
    
    encoder.write_all(data.as_bytes())
        .map_err(|e| CompressionError::CompressFailed(e.to_string()))?;
    
    let compressed_bytes = encoder.finish()
        .map_err(|e| CompressionError::CompressFailed(e.to_string()))?;
    
    let original_size = data.len();
    let compressed_size = compressed_bytes.len();
    let ratio = if original_size > 0 {
        (1.0 - (compressed_size as f64 / original_size as f64)) * 100.0
    } else {
        0.0
    };
    
    Ok(CompressionResult {
        compressed_base64: BASE64.encode(&compressed_bytes),
        original_size,
        compressed_size,
        ratio_percent: ratio.max(0.0),
        savings_bytes: original_size as i64 - compressed_size as i64,
    })
}

/// Decompress GZip data from Base64
pub fn decompress_gzip(base64_data: &str) -> Result<String, CompressionError> {
    let compressed_bytes = BASE64.decode(base64_data)
        .map_err(|e| CompressionError::DecompressFailed(format!("Base64 decode: {}", e)))?;
    
    let mut decoder = GzDecoder::new(&compressed_bytes[..]);
    let mut decompressed = String::new();
    decoder.read_to_string(&mut decompressed)
        .map_err(|e| CompressionError::DecompressFailed(e.to_string()))?;
    
    Ok(decompressed)
}

/// Compress string using Zlib with specified level (1-9)
pub fn compress_zlib(data: &str, level: u32) -> Result<CompressionResult, CompressionError> {
    if !(1..=9).contains(&level) {
        return Err(CompressionError::InvalidLevel(level));
    }
    
    let compression = Compression::new(level);
    let mut encoder = ZlibEncoder::new(Vec::new(), compression);
    
    encoder.write_all(data.as_bytes())
        .map_err(|e| CompressionError::CompressFailed(e.to_string()))?;
    
    let compressed_bytes = encoder.finish()
        .map_err(|e| CompressionError::CompressFailed(e.to_string()))?;
    
    let original_size = data.len();
    let compressed_size = compressed_bytes.len();
    let ratio = if original_size > 0 {
        (1.0 - (compressed_size as f64 / original_size as f64)) * 100.0
    } else {
        0.0
    };
    
    Ok(CompressionResult {
        compressed_base64: BASE64.encode(&compressed_bytes),
        original_size,
        compressed_size,
        ratio_percent: ratio.max(0.0),
        savings_bytes: original_size as i64 - compressed_size as i64,
    })
}

/// Decompress Zlib data from Base64
pub fn decompress_zlib(base64_data: &str) -> Result<String, CompressionError> {
    let compressed_bytes = BASE64.decode(base64_data)
        .map_err(|e| CompressionError::DecompressFailed(format!("Base64 decode: {}", e)))?;
    
    let mut decoder = ZlibDecoder::new(&compressed_bytes[..]);
    let mut decompressed = String::new();
    decoder.read_to_string(&mut decompressed)
        .map_err(|e| CompressionError::DecompressFailed(e.to_string()))?;
    
    Ok(decompressed)
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_compress_gzip_levels() {
        let text = "Hello World! ".repeat(100);
        
        let level1 = compress_gzip(&text, 1).unwrap();
        let level9 = compress_gzip(&text, 9).unwrap();
        
        // Level 9 should compress better or equal
        assert!(level9.compressed_size <= level1.compressed_size);
        assert!(level9.ratio_percent >= level1.ratio_percent);
    }
    
    #[test]
    fn test_gzip_roundtrip() {
        let original = "Test data for compression with multiple words and repeating patterns";
        let compressed = compress_gzip(original, 6).unwrap();
        // Short strings may not compress well
        assert!(compressed.compressed_size > 0);
        
        let decompressed = decompress_gzip(&compressed.compressed_base64).unwrap();
        assert_eq!(original, decompressed);
    }
    
    #[test]
    fn test_invalid_level() {
        assert!(compress_gzip("test", 0).is_err());
        assert!(compress_gzip("test", 10).is_err());
    }
    
    #[test]
    fn test_zlib_roundtrip() {
        let original = "Zlib test data with some repeating patterns";
        let compressed = compress_zlib(original, 5).unwrap();
        let decompressed = decompress_zlib(&compressed.compressed_base64).unwrap();
        assert_eq!(original, decompressed);
    }
    
    #[test]
    fn test_large_data_gzip() {
        let large = "A".repeat(100_000);
        let result = compress_gzip(&large, 6).unwrap();
        // Repeated data should compress very well
        assert!(result.ratio_percent > 90.0);
    }
    
    #[test]
    fn test_empty_string() {
        let result = compress_gzip("", 5).unwrap();
        assert_eq!(result.original_size, 0);
        assert_eq!(result.ratio_percent, 0.0);
    }
}
