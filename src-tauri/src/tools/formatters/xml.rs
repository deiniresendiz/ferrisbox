use quick_xml::events::{BytesText, Event};
use quick_xml::{Reader, Writer};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum XmlError {
    #[error("XML parse error: {0}")]
    ParseError(String),
    #[error("Invalid XML: {0}")]
    InvalidXml(String),
    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
}

/// Format XML with indentation
pub fn format_xml(xml: &str, indent_size: usize) -> Result<String, XmlError> {
    let mut reader = Reader::from_str(xml);
    reader.config_mut().trim_text(true);
    
    let mut writer = Writer::new_with_indent(Vec::new(), b' ', indent_size);
    let mut buf = Vec::new();
    
    loop {
        match reader.read_event_into(&mut buf) {
            Ok(Event::Eof) => break,
            Ok(event) => {
                writer
                    .write_event(event)
                    .map_err(|e| XmlError::ParseError(e.to_string()))?;
            }
            Err(e) => return Err(XmlError::ParseError(e.to_string())),
        }
        buf.clear();
    }
    
    let result = String::from_utf8(writer.into_inner())
        .map_err(|e| XmlError::InvalidXml(e.to_string()))?;
    
    Ok(result)
}

/// Minify XML (remove unnecessary whitespace)
pub fn minify_xml(xml: &str) -> Result<String, XmlError> {
    let mut reader = Reader::from_str(xml);
    reader.config_mut().trim_text(true);
    
    let mut writer = Writer::new(Vec::new());
    let mut buf = Vec::new();
    
    loop {
        match reader.read_event_into(&mut buf) {
            Ok(Event::Eof) => break,
            Ok(Event::Text(e)) => {
                let text = e.unescape().map_err(|e| XmlError::ParseError(e.to_string()))?;
                let trimmed = text.trim();
                if !trimmed.is_empty() {
                    writer
                        .write_event(Event::Text(BytesText::new(trimmed)))
                        .map_err(|e| XmlError::ParseError(e.to_string()))?;
                }
            }
            Ok(event) => {
                writer
                    .write_event(event)
                    .map_err(|e| XmlError::ParseError(e.to_string()))?;
            }
            Err(e) => return Err(XmlError::ParseError(e.to_string())),
        }
        buf.clear();
    }
    
    let result = String::from_utf8(writer.into_inner())
        .map_err(|e| XmlError::InvalidXml(e.to_string()))?;
    
    Ok(result)
}

/// Validate XML syntax
pub fn validate_xml(xml: &str) -> Result<bool, XmlError> {
    let mut reader = Reader::from_str(xml);
    let mut buf = Vec::new();
    
    loop {
        match reader.read_event_into(&mut buf) {
            Ok(Event::Eof) => break,
            Ok(_) => {}
            Err(e) => return Err(XmlError::ParseError(e.to_string())),
        }
        buf.clear();
    }
    
    Ok(true)
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE_XML: &str = r#"<?xml version="1.0"?><root><item id="1">Hello</item><item id="2">World</item></root>"#;
    
    const FORMATTED_XML: &str = r#"<?xml version="1.0"?>
<root>
  <item id="1">Hello</item>
  <item id="2">World</item>
</root>"#;

    #[test]
    fn test_format_xml() {
        let result = format_xml(SAMPLE_XML, 2).unwrap();
        assert!(result.contains("  <item"));
        assert!(result.contains("<root>"));
    }

    #[test]
    fn test_format_xml_custom_indent() {
        let result = format_xml(SAMPLE_XML, 4).unwrap();
        assert!(result.contains("    <item"));
    }

    #[test]
    fn test_minify_xml() {
        let result = minify_xml(FORMATTED_XML).unwrap();
        assert!(!result.contains('\n'));
        assert!(result.contains("<root><item"));
    }

    #[test]
    fn test_validate_xml_valid() {
        let result = validate_xml(SAMPLE_XML);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), true);
    }

    #[test]
    fn test_validate_xml_invalid() {
        let invalid = "<root><item>Unclosed</root>"; // Mismatched tags
        let result = validate_xml(invalid);
        assert!(result.is_err());
    }

    #[test]
    fn test_format_with_attributes() {
        let xml = r#"<root attr1="value1" attr2="value2"><child/></root>"#;
        let result = format_xml(xml, 2).unwrap();
        assert!(result.contains("attr1"));
        assert!(result.contains("attr2"));
    }

    #[test]
    fn test_format_with_cdata() {
        let xml = r#"<root><![CDATA[Some <data> here]]></root>"#;
        let result = format_xml(xml, 2).unwrap();
        assert!(result.contains("CDATA"));
    }

    #[test]
    fn test_roundtrip() {
        let formatted = format_xml(SAMPLE_XML, 2).unwrap();
        let minified = minify_xml(&formatted).unwrap();
        let reformatted = format_xml(&minified, 2).unwrap();
        
        assert!(reformatted.contains("  <item"));
    }
}
