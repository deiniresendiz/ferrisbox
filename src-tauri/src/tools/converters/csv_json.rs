use csv::ReaderBuilder;
use serde_json::{Value, Map};
use serde::{Serialize, Deserialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize)]
pub struct CsvRow {
    #[serde(flatten)]
    fields: HashMap<String, String>,
}

pub fn csv_to_json_command(
    csv: String,
    delimiter: Option<String>,
    has_header: bool,
) -> Result<String, String> {
    let delimiter_byte = match delimiter.as_deref() {
        Some(d) if d.len() == 1 => d.as_bytes()[0],
        _ => b',',
    };
    
    let mut rdr = ReaderBuilder::new()
        .delimiter(delimiter_byte)
        .has_headers(has_header)
        .flexible(true)
        .from_reader(csv.as_bytes());
    
    let mut headers: Vec<String> = Vec::new();
    if has_header {
        headers = rdr.headers().map_err(|e| e.to_string())?.iter().map(|s| s.to_string()).collect();
    }
    
    let mut result: Vec<Value> = Vec::new();
    
    for record_result in rdr.records() {
        let record = record_result.map_err(|e| e.to_string())?;
        let mut map: Map<String, Value> = Map::new();
        
        for (i, field) in record.iter().enumerate() {
            let key = if has_header && i < headers.len() {
                headers[i].clone()
            } else {
                format!("field_{}", i)
            };
            map.insert(key, Value::String(field.to_string()));
        }
        
        result.push(Value::Object(map));
    }
    
    serde_json::to_string_pretty(&result).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_simple_csv_to_json() {
        let csv = "name,age\nJohn,30\nJane,25";
        let result = csv_to_json_command(csv.to_string(), Some(",".to_string()), true);
        assert!(result.is_ok());
        let json = result.unwrap();
        assert!(json.contains("John"));
        assert!(json.contains("Jane"));
    }

    #[test]
    fn test_csv_with_header() {
        let csv = "name,age\nJohn,30\nJane,25";
        let result = csv_to_json_command(csv.to_string(), Some(",".to_string()), false);
        assert!(result.is_ok());
        let json = result.unwrap();
        assert!(json.contains("field_0"));
        assert!(json.contains("field_1"));
    }

    #[test]
    fn test_empty_csv() {
        let csv = "";
        let result = csv_to_json_command(csv.to_string(), Some(",".to_string()), true);
        assert!(result.is_err());
    }
}
