use rand::Rng;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct PasswordOptions {
    pub length: usize,
    pub uppercase: bool,
    pub lowercase: bool,
    pub numbers: bool,
    pub symbols: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PasswordOutput {
    pub password: String,
    pub entropy_bits: f64,
    pub strength: String,
    pub strength_score: u8,
}

const LOWERCASE: &[char] = &[
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
];

const UPPERCASE: &[char] = &[
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
];

const NUMBERS: &[char] = &[
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
];

const SYMBOLS: &[char] = &[
    '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '+', '=', 
    '[', ']', '{', '}', '|', '\\', ':', ';', '"', '\'', '<', '>', ',', '.', '?', '/', '~',
];

pub fn generate_password(options: &PasswordOptions) -> PasswordOutput {
    let mut pool = String::new();
    
    if options.lowercase {
        pool.extend(LOWERCASE);
    }
    if options.uppercase {
        pool.extend(UPPERCASE);
    }
    if options.numbers {
        pool.extend(NUMBERS);
    }
    if options.symbols {
        pool.extend(SYMBOLS);
    }
    
    if pool.is_empty() {
        pool.extend(LOWERCASE);
    }
    
    let pool_chars: Vec<char> = pool.chars().collect();
    let pool_size = pool_chars.len() as f64;
    
    let mut rng = rand::thread_rng();
    let password: String = (0..options.length)
        .map(|_| pool_chars[rng.gen_range(0..pool_chars.len())])
        .collect();
    
    let entropy = options.length as f64 * pool_size.log2();
    let (strength, score) = calculate_strength(entropy);
    
    PasswordOutput {
        password,
        entropy_bits: entropy,
        strength,
        strength_score: score,
    }
}

fn calculate_strength(entropy: f64) -> (String, u8) {
    let (strength, score) = if entropy < 28.0 {
        ("weak".to_string(), (entropy / 28.0 * 25.0) as u8)
    } else if entropy < 36.0 {
        ("moderate".to_string(), ((entropy - 28.0) / 8.0 * 25.0 + 25.0) as u8)
    } else if entropy < 60.0 {
        ("strong".to_string(), ((entropy - 36.0) / 24.0 * 25.0 + 50.0) as u8)
    } else {
        ("very_strong".to_string(), ((entropy - 60.0).min(20.0) / 20.0 * 25.0 + 75.0) as u8)
    };
    
    (strength, score)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_password_default() {
        let options = PasswordOptions {
            length: 16,
            uppercase: true,
            lowercase: true,
            numbers: true,
            symbols: true,
        };
        let result = generate_password(&options);
        assert_eq!(result.password.len(), 16);
        assert!(result.entropy_bits > 0.0);
        assert!(result.strength_score > 0);
    }

    #[test]
    fn test_generate_password_lowercase_only() {
        let options = PasswordOptions {
            length: 12,
            uppercase: false,
            lowercase: true,
            numbers: false,
            symbols: false,
        };
        let result = generate_password(&options);
        assert_eq!(result.password.len(), 12);
        assert!(result.password.chars().all(|c| c.is_lowercase() || c.is_whitespace()));
    }

    #[test]
    fn test_generate_password_numbers_only() {
        let options = PasswordOptions {
            length: 10,
            uppercase: false,
            lowercase: false,
            numbers: true,
            symbols: false,
        };
        let result = generate_password(&options);
        assert_eq!(result.password.len(), 10);
        assert!(result.password.chars().all(|c| c.is_ascii_digit()));
    }

    #[test]
    fn test_entropy_calculation() {
        let options = PasswordOptions {
            length: 8,
            uppercase: true,
            lowercase: true,
            numbers: true,
            symbols: true,
        };
        let result = generate_password(&options);
        let expected_pool_size = 26 + 26 + 10 + 30;
        let expected_entropy = 8.0 * (expected_pool_size as f64).log2();
        assert!((result.entropy_bits - expected_entropy).abs() < 0.1);
    }

    #[test]
    fn test_strength_calculation() {
        assert_eq!(calculate_strength(20.0).0, "weak");
        assert_eq!(calculate_strength(30.0).0, "moderate");
        assert_eq!(calculate_strength(45.0).0, "strong");
        assert_eq!(calculate_strength(70.0).0, "very_strong");
    }

    #[test]
    fn test_empty_options() {
        let options = PasswordOptions {
            length: 10,
            uppercase: false,
            lowercase: false,
            numbers: false,
            symbols: false,
        };
        let result = generate_password(&options);
        assert_eq!(result.password.len(), 10);
        assert!(!result.password.is_empty());
    }
}
