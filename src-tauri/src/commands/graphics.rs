use crate::tools::graphics::{
    optimize_svg, get_optimization_stats, OptimizationLevel, OptimizationStats,
    compress_image, ImageFormat, CompressionStats,
    generate_favicon_ico, generate_favicon_pngs, FaviconStats,
    validate_base64_image, ImageInfo,
    check_contrast, ContrastResult,
};

#[tauri::command]
pub async fn optimize_svg_command(
    svg_content: String, 
    level: String
) -> Result<(String, OptimizationStats), String> {
    let opt_level = match level.as_str() {
        "low" => OptimizationLevel::Low,
        "medium" => OptimizationLevel::Medium,
        "high" => OptimizationLevel::High,
        _ => OptimizationLevel::Medium,
    };
    
    let optimized = optimize_svg(&svg_content, opt_level)
        .map_err(|e| e.to_string())?;
    
    let stats = get_optimization_stats(&svg_content, &optimized);
    
    Ok((optimized, stats))
}

#[tauri::command]
pub async fn compress_image_command(
    data_url: String, 
    format: String, 
    quality: u8
) -> Result<(String, CompressionStats), String> {
    let img_format = match format.as_str() {
        "png" => ImageFormat::Png,
        "jpeg" | "jpg" => ImageFormat::Jpeg,
        "webp" => ImageFormat::WebP,
        _ => return Err("Invalid format".to_string()),
    };
    
    compress_image(&data_url, img_format, quality)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn generate_favicon_ico_command(
    data_url: String, 
    sizes: Vec<usize>
) -> Result<(String, FaviconStats), String> {
    generate_favicon_ico(&data_url, &sizes)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn generate_favicon_pngs_command(
    data_url: String, 
    sizes: Vec<usize>
) -> Result<Vec<(String, usize)>, String> {
    let (pngs, _stats) = generate_favicon_pngs(&data_url, &sizes)
        .map_err(|e| e.to_string())?;
    
    Ok(pngs)
}

#[tauri::command]
pub async fn validate_base64_image_command(
    data_url: String
) -> Result<ImageInfo, String> {
    validate_base64_image(&data_url)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn check_contrast_command(
    foreground: String, 
    background: String
) -> Result<ContrastResult, String> {
    check_contrast(&foreground, &background)
        .map_err(|e| e.to_string())
}
