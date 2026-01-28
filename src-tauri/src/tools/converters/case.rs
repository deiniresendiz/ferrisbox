use convert_case::{Case, Casing};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct CaseResult {
    original: String,
    converted: String,
    case_type: String,
}

#[tauri::command]
pub fn convert_case_command(text: String, target_case: String) -> Result<String, String> {
    let case = match target_case.as_str() {
        "camel" => Case::Camel,
        "snake" => Case::Snake,
        "pascal" => Case::Pascal,
        "kebab" => Case::Kebab,
        "constant" => Case::UpperSnake, // Constant case is usually UPPER_SNAKE
        "upper" => Case::Upper,
        "lower" => Case::Lower,
        "title" => Case::Title,
        "train" => Case::Train,
        "alternating" => Case::Alternating,
        "flat" => Case::Flat,
        "cobol" => Case::Cobol,
        "toggle" => Case::Toggle,
        _ => return Err(format!("Unsupported case: {}", target_case)),
    };

    Ok(text.to_case(case))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_snake_case() {
        assert_eq!(
            convert_case_command("Hello World".to_string(), "snake".to_string()).unwrap(),
            "hello_world"
        );
    }

    #[test]
    fn test_camel_case() {
        assert_eq!(
            convert_case_command("hello_world".to_string(), "camel".to_string()).unwrap(),
            "helloWorld"
        );
    }

    #[test]
    fn test_constant_case() {
        assert_eq!(
            convert_case_command("helloWorld".to_string(), "constant".to_string()).unwrap(),
            "HELLO_WORLD"
        );
    }
}
