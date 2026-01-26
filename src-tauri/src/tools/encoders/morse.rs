use std::collections::HashMap;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum MorseError {
    #[error("Unknown character: {0}")]
    UnknownCharacter(char),
    #[error("Invalid morse code sequence: {0}")]
    InvalidMorse(String),
}

/// Get the morse code mapping (character -> morse)
fn get_morse_map() -> HashMap<char, &'static str> {
    let mut map = HashMap::new();
    
    // Letters
    map.insert('A', ".-");
    map.insert('B', "-...");
    map.insert('C', "-.-.");
    map.insert('D', "-..");
    map.insert('E', ".");
    map.insert('F', "..-.");
    map.insert('G', "--.");
    map.insert('H', "....");
    map.insert('I', "..");
    map.insert('J', ".---");
    map.insert('K', "-.-");
    map.insert('L', ".-..");
    map.insert('M', "--");
    map.insert('N', "-.");
    map.insert('O', "---");
    map.insert('P', ".--.");
    map.insert('Q', "--.-");
    map.insert('R', ".-.");
    map.insert('S', "...");
    map.insert('T', "-");
    map.insert('U', "..-");
    map.insert('V', "...-");
    map.insert('W', ".--");
    map.insert('X', "-..-");
    map.insert('Y', "-.--");
    map.insert('Z', "--..");
    
    // Numbers
    map.insert('0', "-----");
    map.insert('1', ".----");
    map.insert('2', "..---");
    map.insert('3', "...--");
    map.insert('4', "....-");
    map.insert('5', ".....");
    map.insert('6', "-....");
    map.insert('7', "--...");
    map.insert('8', "---..");
    map.insert('9', "----.");
    
    // Punctuation (as requested by user)
    map.insert('.', ".-.-.-");  // Period
    map.insert(',', "--..--");  // Comma
    map.insert('?', "..--..");  // Question mark
    map.insert('!', "-.-.--");  // Exclamation mark
    map.insert('\'', ".----.");  // Apostrophe
    map.insert('"', ".-..-.");  // Quotation mark
    map.insert('/', "-..-.");   // Slash
    map.insert('(', "-.--.");   // Left parenthesis
    map.insert(')', "-.--.-");  // Right parenthesis
    map.insert('&', ".-...");   // Ampersand
    map.insert(':', "---...");  // Colon
    map.insert(';', "-.-.-.");  // Semicolon
    map.insert('=', "-...-");   // Equals sign
    map.insert('+', ".-.-.");   // Plus sign
    map.insert('-', "-....-");  // Hyphen/Minus
    map.insert('_', "..--.-");  // Underscore
    map.insert('@', ".--.-.");  // At sign
    
    map
}

/// Get the reverse morse code mapping (morse -> character)
fn get_reverse_morse_map() -> HashMap<&'static str, char> {
    get_morse_map()
        .into_iter()
        .map(|(k, v)| (v, k))
        .collect()
}

/// Encode text to morse code
/// Words are separated by " / " (slash with spaces)
/// Letters/numbers are separated by single space
pub fn encode_morse(text: &str) -> Result<String, MorseError> {
    let morse_map = get_morse_map();
    let mut result = Vec::new();
    
    for word in text.split_whitespace() {
        let mut morse_word = Vec::new();
        
        for ch in word.chars() {
            let upper = ch.to_ascii_uppercase();
            
            if let Some(morse) = morse_map.get(&upper) {
                morse_word.push(*morse);
            } else {
                return Err(MorseError::UnknownCharacter(ch));
            }
        }
        
        result.push(morse_word.join(" "));
    }
    
    Ok(result.join(" / "))
}

/// Decode morse code to text
/// Expects words separated by " / " and letters by space
pub fn decode_morse(morse: &str) -> Result<String, MorseError> {
    let reverse_map = get_reverse_morse_map();
    let mut result = Vec::new();
    
    // Split by word separator " / "
    for morse_word in morse.split(" / ") {
        let mut decoded_word = String::new();
        
        // Split by letter separator (single space)
        for morse_char in morse_word.split_whitespace() {
            if let Some(ch) = reverse_map.get(morse_char) {
                decoded_word.push(*ch);
            } else {
                return Err(MorseError::InvalidMorse(morse_char.to_string()));
            }
        }
        
        result.push(decoded_word);
    }
    
    Ok(result.join(" "))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encode_simple() {
        let result = encode_morse("HELLO").unwrap();
        assert_eq!(result, ".... . .-.. .-.. ---");
    }

    #[test]
    fn test_encode_lowercase() {
        let result = encode_morse("hello").unwrap();
        assert_eq!(result, ".... . .-.. .-.. ---");
    }

    #[test]
    fn test_encode_with_spaces() {
        let result = encode_morse("HELLO WORLD").unwrap();
        assert_eq!(result, ".... . .-.. .-.. --- / .-- --- .-. .-.. -..");
    }

    #[test]
    fn test_encode_numbers() {
        let result = encode_morse("SOS 123").unwrap();
        assert_eq!(result, "... --- ... / .---- ..--- ...--");
    }

    #[test]
    fn test_encode_punctuation() {
        let result = encode_morse("HELLO!").unwrap();
        assert_eq!(result, ".... . .-.. .-.. --- -.-.--");
    }

    #[test]
    fn test_encode_with_period_comma() {
        let result = encode_morse("A.B,C").unwrap();
        assert_eq!(result, ".- .-.-.- -... --..-- -.-.");
    }

    #[test]
    fn test_encode_parentheses() {
        let result = encode_morse("(HI)").unwrap();
        assert_eq!(result, "-.--. .... .. -.--.-");
    }

    #[test]
    fn test_encode_semicolon_colon_equals() {
        let result = encode_morse("A;B:C=D").unwrap();
        assert_eq!(result, ".- -.-.-. -... ---... -.-. -...- -..");
    }

    #[test]
    fn test_decode_simple() {
        let result = decode_morse(".... . .-.. .-.. ---").unwrap();
        assert_eq!(result, "HELLO");
    }

    #[test]
    fn test_decode_with_spaces() {
        let result = decode_morse(".... . .-.. .-.. --- / .-- --- .-. .-.. -..").unwrap();
        assert_eq!(result, "HELLO WORLD");
    }

    #[test]
    fn test_decode_numbers() {
        let result = decode_morse("... --- ... / .---- ..--- ...--").unwrap();
        assert_eq!(result, "SOS 123");
    }

    #[test]
    fn test_roundtrip() {
        let original = "HELLO WORLD";
        let encoded = encode_morse(original).unwrap();
        let decoded = decode_morse(&encoded).unwrap();
        assert_eq!(decoded, original);
    }

    #[test]
    fn test_roundtrip_with_punctuation() {
        let original = "HELLO, WORLD!";
        let encoded = encode_morse(original).unwrap();
        let decoded = decode_morse(&encoded).unwrap();
        assert_eq!(decoded, original);
    }

    #[test]
    fn test_invalid_character() {
        let result = encode_morse("Hello 🙂");
        assert!(result.is_err());
    }

    #[test]
    fn test_invalid_morse() {
        let result = decode_morse(".... .... ....... ...."); // Invalid morse sequence
        assert!(result.is_err());
    }
}
