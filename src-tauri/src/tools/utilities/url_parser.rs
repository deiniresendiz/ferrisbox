use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum UrlParserError {
    #[error("Invalid URL: {0}")]
    InvalidUrl(String),
    #[error("URL parse error: {0}")]
    ParseError(#[from] url::ParseError),
}

/// Parsed URL components
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParsedUrl {
    pub original: String,
    pub scheme: String,
    pub host: String,
    pub port: Option<u16>,
    pub path: String,
    pub query: Option<String>,
    pub fragment: Option<String>,
    pub username: String,
    pub password: Option<String>,
    pub query_params: Vec<QueryParam>,
}

/// Query parameter key-value pair
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryParam {
    pub key: String,
    pub value: String,
}

/// Parse a URL into its components
pub fn parse_url(url_str: &str) -> Result<ParsedUrl, UrlParserError> {
    use url::Url;
    
    let url = Url::parse(url_str)?;
    
    // Parse query parameters
    let query_params: Vec<QueryParam> = url
        .query_pairs()
        .map(|(k, v)| QueryParam {
            key: k.to_string(),
            value: v.to_string(),
        })
        .collect();
    
    Ok(ParsedUrl {
        original: url_str.to_string(),
        scheme: url.scheme().to_string(),
        host: url.host_str().unwrap_or("").to_string(),
        port: url.port(),
        path: url.path().to_string(),
        query: url.query().map(|q| q.to_string()),
        fragment: url.fragment().map(|f| f.to_string()),
        username: url.username().to_string(),
        password: url.password().map(|p| p.to_string()),
        query_params,
    })
}

/// Build a URL from components
pub fn build_url(
    scheme: &str,
    host: &str,
    port: Option<u16>,
    path: &str,
    query_params: &[QueryParam],
    fragment: Option<&str>,
    username: Option<&str>,
    password: Option<&str>,
) -> Result<String, UrlParserError> {
    use url::Url;
    
    // Build base URL
    let base = if let Some(port) = port {
        format!("{}://{}:{}", scheme, host, port)
    } else {
        format!("{}://{}", scheme, host)
    };
    
    let mut url = Url::parse(&base)
        .map_err(|e| UrlParserError::InvalidUrl(e.to_string()))?;
    
    // Set credentials if provided
    if let Some(user) = username {
        url.set_username(user)
            .map_err(|_| UrlParserError::InvalidUrl("Cannot set username".to_string()))?;
        
        if let Some(pass) = password {
            url.set_password(Some(pass))
                .map_err(|_| UrlParserError::InvalidUrl("Cannot set password".to_string()))?;
        }
    }
    
    // Set path
    url.set_path(path);
    
    // Set query parameters
    if !query_params.is_empty() {
        let query_string = query_params
            .iter()
            .map(|qp| format!("{}={}", qp.key, qp.value))
            .collect::<Vec<_>>()
            .join("&");
        url.set_query(Some(&query_string));
    }
    
    // Set fragment
    if let Some(frag) = fragment {
        url.set_fragment(Some(frag));
    }
    
    Ok(url.to_string())
}

/// Update query parameters in a URL
pub fn update_query_params(
    url_str: &str,
    new_params: &[QueryParam],
) -> Result<String, UrlParserError> {
    use url::Url;
    
    let mut url = Url::parse(url_str)?;
    
    // Build new query string
    if !new_params.is_empty() {
        let query_string = new_params
            .iter()
            .map(|qp| {
                let encoded_key = urlencoding::encode(&qp.key);
                let encoded_value = urlencoding::encode(&qp.value);
                format!("{}={}", encoded_key, encoded_value)
            })
            .collect::<Vec<_>>()
            .join("&");
        url.set_query(Some(&query_string));
    } else {
        url.set_query(None);
    }
    
    Ok(url.to_string())
}

/// Extract query parameters as a HashMap
pub fn get_query_params(url_str: &str) -> Result<HashMap<String, String>, UrlParserError> {
    use url::Url;
    
    let url = Url::parse(url_str)?;
    let params: HashMap<String, String> = url
        .query_pairs()
        .map(|(k, v)| (k.to_string(), v.to_string()))
        .collect();
    
    Ok(params)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_simple_url() {
        let parsed = parse_url("https://example.com/path").unwrap();
        assert_eq!(parsed.scheme, "https");
        assert_eq!(parsed.host, "example.com");
        assert_eq!(parsed.path, "/path");
        assert!(parsed.port.is_none());
        assert!(parsed.query.is_none());
    }

    #[test]
    fn test_parse_url_with_port() {
        let parsed = parse_url("https://example.com:8080/path").unwrap();
        assert_eq!(parsed.port, Some(8080));
    }

    #[test]
    fn test_parse_url_with_query() {
        let parsed = parse_url("https://example.com/path?foo=bar&baz=qux").unwrap();
        assert_eq!(parsed.query, Some("foo=bar&baz=qux".to_string()));
        assert_eq!(parsed.query_params.len(), 2);
        assert_eq!(parsed.query_params[0].key, "foo");
        assert_eq!(parsed.query_params[0].value, "bar");
        assert_eq!(parsed.query_params[1].key, "baz");
        assert_eq!(parsed.query_params[1].value, "qux");
    }

    #[test]
    fn test_parse_url_with_fragment() {
        let parsed = parse_url("https://example.com/path#section").unwrap();
        assert_eq!(parsed.fragment, Some("section".to_string()));
    }

    #[test]
    fn test_parse_url_with_credentials() {
        let parsed = parse_url("https://user:pass@example.com/path").unwrap();
        assert_eq!(parsed.username, "user");
        assert_eq!(parsed.password, Some("pass".to_string()));
    }

    #[test]
    fn test_parse_complex_url() {
        let url = "https://user:pass@example.com:8080/path/to/resource?key1=value1&key2=value2#anchor";
        let parsed = parse_url(url).unwrap();
        
        assert_eq!(parsed.scheme, "https");
        assert_eq!(parsed.username, "user");
        assert_eq!(parsed.password, Some("pass".to_string()));
        assert_eq!(parsed.host, "example.com");
        assert_eq!(parsed.port, Some(8080));
        assert_eq!(parsed.path, "/path/to/resource");
        assert_eq!(parsed.query_params.len(), 2);
        assert_eq!(parsed.fragment, Some("anchor".to_string()));
    }

    #[test]
    fn test_build_simple_url() {
        let url = build_url(
            "https",
            "example.com",
            None,
            "/path",
            &[],
            None,
            None,
            None,
        ).unwrap();
        
        assert_eq!(url, "https://example.com/path");
    }

    #[test]
    fn test_build_url_with_query() {
        let params = vec![
            QueryParam { key: "foo".to_string(), value: "bar".to_string() },
            QueryParam { key: "baz".to_string(), value: "qux".to_string() },
        ];
        
        let url = build_url(
            "https",
            "example.com",
            None,
            "/path",
            &params,
            None,
            None,
            None,
        ).unwrap();
        
        assert!(url.contains("foo=bar"));
        assert!(url.contains("baz=qux"));
    }

    #[test]
    fn test_update_query_params() {
        let original = "https://example.com/path?old=param";
        let new_params = vec![
            QueryParam { key: "new".to_string(), value: "value".to_string() },
        ];
        
        let updated = update_query_params(original, &new_params).unwrap();
        assert!(updated.contains("new=value"));
        assert!(!updated.contains("old=param"));
    }

    #[test]
    fn test_update_query_params_encoding() {
        let original = "https://example.com/path";
        let new_params = vec![
            QueryParam { key: "hello world".to_string(), value: "foo&bar".to_string() },
        ];
        
        let updated = update_query_params(original, &new_params).unwrap();
        assert!(updated.contains("hello%20world"));
        assert!(updated.contains("foo%26bar"));
    }

    #[test]
    fn test_get_query_params() {
        let url = "https://example.com/path?key1=value1&key2=value2";
        let params = get_query_params(url).unwrap();
        
        assert_eq!(params.len(), 2);
        assert_eq!(params.get("key1"), Some(&"value1".to_string()));
        assert_eq!(params.get("key2"), Some(&"value2".to_string()));
    }

    #[test]
    fn test_roundtrip() {
        let original = "https://user:pass@example.com:8080/path?foo=bar#anchor";
        let parsed = parse_url(original).unwrap();
        
        let rebuilt = build_url(
            &parsed.scheme,
            &parsed.host,
            parsed.port,
            &parsed.path,
            &parsed.query_params,
            parsed.fragment.as_deref(),
            Some(&parsed.username),
            parsed.password.as_deref(),
        ).unwrap();
        
        // Parse both to compare (order of query params might differ)
        let parsed_original = parse_url(original).unwrap();
        let parsed_rebuilt = parse_url(&rebuilt).unwrap();
        
        assert_eq!(parsed_original.scheme, parsed_rebuilt.scheme);
        assert_eq!(parsed_original.host, parsed_rebuilt.host);
        assert_eq!(parsed_original.path, parsed_rebuilt.path);
        assert_eq!(parsed_original.fragment, parsed_rebuilt.fragment);
    }

    #[test]
    fn test_invalid_url() {
        let result = parse_url("not a url");
        assert!(result.is_err());
    }

    #[test]
    fn test_empty_query_params() {
        let url = "https://example.com/path";
        let params = get_query_params(url).unwrap();
        assert_eq!(params.len(), 0);
    }
}
