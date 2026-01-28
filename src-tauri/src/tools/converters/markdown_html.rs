use pulldown_cmark::{Parser, Options, html};
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct MarkdownOptions {
    #[serde(default)]
    enable_tables: bool,
    #[serde(default)]
    enable_strikethrough: bool,
    #[serde(default)]
    enable_tasklists: bool,
}

pub fn markdown_to_html_command(
    md: String,
    options: Option<MarkdownOptions>,
) -> Result<String, String> {
    let mut opts = Options::empty();
    
    if let Some(opt) = options {
        if opt.enable_tables {
            opts.insert(Options::ENABLE_TABLES);
        }
        if opt.enable_strikethrough {
            opts.insert(Options::ENABLE_STRIKETHROUGH);
        }
        if opt.enable_tasklists {
            opts.insert(Options::ENABLE_TASKLISTS);
        }
    }
    
    let parser = Parser::new_ext(&md, opts);
    let mut html_output = String::new();
    html::push_html(&mut html_output, parser);
    
    Ok(html_output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_markdown_to_html() {
        let md = "# Hello World\n\nThis is a **test**.";
        let result = markdown_to_html_command(md.to_string(), None);
        assert!(result.is_ok());
        let html = result.unwrap();
        assert!(html.contains("<h1>"));
        assert!(html.contains("<strong>"));
    }

    #[test]
    fn test_markdown_with_options() {
        let md = "| Task 1 | Task 2 |";
        let options = MarkdownOptions {
            enable_tables: false,
            enable_strikethrough: false,
            enable_tasklists: true,
        };
        let result = markdown_to_html_command(md.to_string(), Some(options));
        assert!(result.is_ok());
        let html = result.unwrap();
        assert!(html.contains("<li>"));
    }
}
