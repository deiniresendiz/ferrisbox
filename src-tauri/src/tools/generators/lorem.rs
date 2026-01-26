use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum LoremType {
    Paragraphs,
    Words,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoremOutput {
    pub text: String,
    pub word_count: usize,
    pub paragraph_count: usize,
}

const LOREM_WORDS: &[&str] = &[
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
    "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
    "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
    "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea",
    "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit",
    "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla",
    "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident",
    "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id",
    "est", "laborum", "suscipit", "lobortis", "nisl", "aliquip", "ex", "ea",
    "commodo", "consequat", "duis", "aute", "irure", "dolor", "reprehenderit",
    "voluptate", "velit", "cillum", "fugiat", "nulla", "pariatur", "excepteur",
    "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "culpa",
    "qui", "officia", "deserunt", "mollit", "anim", "laborum",
];

pub fn generate_lorem(lorem_type: &LoremType, count: usize) -> LoremOutput {
    let rng = &mut rand::thread_rng();
    let mut word_list: Vec<String> = LOREM_WORDS.iter().map(|s| s.to_string()).collect();
    
    let (text, word_count, paragraph_count) = match lorem_type {
        LoremType::Paragraphs => {
            let paragraphs_count = count.max(1);
            let words_per_paragraph = 40;
            let total_words = words_per_paragraph * paragraphs_count;
            let mut result = String::new();
            
            for i in 0..paragraphs_count {
                if i > 0 {
                    result.push_str("\n\n");
                }
                let paragraph_words: Vec<String> = word_list
                    .iter()
                    .cycle()
                    .take(words_per_paragraph)
                    .cloned()
                    .collect();
                for (j, word) in paragraph_words.iter().enumerate() {
                    if j > 0 {
                        result.push(' ');
                    }
                    result.push_str(word);
                }
                result.push('.');
            }
            
            (result, total_words, paragraphs_count)
        }
        LoremType::Words => {
            let word_count = count.max(10);
            let words: Vec<String> = word_list
                .iter()
                .cycle()
                .take(word_count)
                .cloned()
                .collect();
            let text = words.join(" ");
            (text, word_count, 1)
        }
    };
    
    LoremOutput {
        text,
        word_count,
        paragraph_count,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_lorem_paragraphs() {
        let result = generate_lorem(&LoremType::Paragraphs, 3);
        assert_eq!(result.paragraph_count, 3);
        assert_eq!(result.word_count, 120);
        assert!(result.text.contains('.'));
    }

    #[test]
    fn test_generate_lorem_words() {
        let result = generate_lorem(&LoremType::Words, 50);
        assert_eq!(result.word_count, 50);
        assert_eq!(result.paragraph_count, 1);
    }

    #[test]
    fn test_generate_lorem_min_count() {
        let result = generate_lorem(&LoremType::Words, 0);
        assert_eq!(result.word_count, 10);
    }

    #[test]
    fn test_generate_lorem_single_paragraph() {
        let result = generate_lorem(&LoremType::Paragraphs, 1);
        assert_eq!(result.paragraph_count, 1);
        assert!(!result.text.contains('\n'));
    }
}
