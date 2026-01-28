pub mod svg_optimizer;
pub mod image_compressor;
pub mod favicon_generator;
pub mod base64_previewer;
pub mod contrast_checker;

pub use svg_optimizer::{optimize_svg, get_optimization_stats, OptimizationLevel, OptimizationStats};
pub use image_compressor::{compress_image, ImageFormat, CompressionStats};
pub use favicon_generator::{generate_favicon_ico, generate_favicon_pngs, FaviconStats};
pub use base64_previewer::{validate_base64_image, ImageInfo};
pub use contrast_checker::{check_contrast, ContrastResult};
