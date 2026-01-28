use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct NumberBaseOutput {
    binary: String,
    octal: String,
    decimal: String,
    hexadecimal: String,
}

pub fn convert_number_base_command(
    input: String,
    from_base: u8,
) -> Result<NumberBaseOutput, String> {
    let cleaned = input.trim().trim_start_matches("0x")
        .trim_start_matches("0b")
        .trim_start_matches("0o");
    
    let is_negative = cleaned.starts_with('-');
    let num_str = if is_negative {
        &cleaned[1..]
    } else {
        cleaned
    };
    
    let value = i128::from_str_radix(num_str, from_base as u32)
        .map_err(|e| format!("Invalid number for base {}: {}", from_base, e))?;
    
    if is_negative {
        let abs_value = value.abs();
        Ok(NumberBaseOutput {
            binary: format!("-{:b}", abs_value),
            octal: format!("-{:o}", abs_value),
            decimal: format!("{}", value),
            hexadecimal: format!("-{:x}", abs_value),
        })
    } else {
        Ok(NumberBaseOutput {
            binary: format!("{:b}", value),
            octal: format!("{:o}", value),
            decimal: format!("{}", value),
            hexadecimal: format!("{:x}", value),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_decimal_to_binary() {
        let result = convert_number_base_command("255".to_string(), 10).unwrap();
        assert_eq!(result.binary, "11111111");
        assert_eq!(result.octal, "377");
        assert_eq!(result.decimal, "255");
        assert_eq!(result.hexadecimal, "ff");
    }

    #[test]
    fn test_negative_number() {
        let result = convert_number_base_command("-255".to_string(), 10).unwrap();
        assert_eq!(result.binary, "-11111111");
        assert_eq!(result.decimal, "-255");
    }

    #[test]
    fn test_hexadecimal_input() {
        let result = convert_number_base_command("FF".to_string(), 16).unwrap();
        assert_eq!(result.binary, "11111111");
        assert_eq!(result.decimal, "255");
        assert_eq!(result.hexadecimal, "ff");
    }

    #[test]
    fn test_invalid_input() {
        let result = convert_number_base_command("abc".to_string(), 10);
        assert!(result.is_err());
    }

    #[test]
    fn test_zero() {
        let result = convert_number_base_command("0".to_string(), 10).unwrap();
        assert_eq!(result.binary, "0");
        assert_eq!(result.decimal, "0");
        assert_eq!(result.hexadecimal, "0");
    }
}
