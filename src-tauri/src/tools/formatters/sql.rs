use sqlformat::{format, FormatOptions, Indent, QueryParams};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum SqlError {
    #[error("SQL format error: {0}")]
    FormatError(String),
}

/// SQL Dialect
#[derive(Debug, Clone, Copy)]
pub enum SqlDialect {
    PostgreSQL,
    MySQL,
    SQLite,
    Generic,
}

/// Format SQL with specified dialect and options
pub fn format_sql(
    sql: &str,
    _dialect: SqlDialect,
    indent_size: usize,
    uppercase: bool,
) -> Result<String, SqlError> {
    let indent = match indent_size {
        2 => Indent::Spaces(2),
        4 => Indent::Spaces(4),
        _ => Indent::Spaces(2),
    };
    
    let options = FormatOptions {
        indent,
        uppercase,
        lines_between_queries: 1,
    };
    
    // Apply dialect-specific formatting if needed
    let formatted = format(sql, &QueryParams::default(), options);
    
    Ok(formatted)
}

/// Minify SQL (remove unnecessary whitespace and comments)
pub fn minify_sql(sql: &str) -> Result<String, SqlError> {
    // Remove comments
    let mut result = sql.to_string();
    
    // Remove single-line comments
    result = result
        .lines()
        .map(|line| {
            if let Some(pos) = line.find("--") {
                &line[..pos]
            } else {
                line
            }
        })
        .collect::<Vec<_>>()
        .join("\n");
    
    // Remove multi-line comments
    while let Some(start) = result.find("/*") {
        if let Some(end) = result[start..].find("*/") {
            result.replace_range(start..start + end + 2, " ");
        } else {
            break;
        }
    }
    
    // Collapse whitespace
    result = result
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ");
    
    Ok(result)
}

/// Validate basic SQL syntax (simple check)
pub fn validate_sql(sql: &str) -> bool {
    let sql_lower = sql.trim().to_lowercase();
    
    // Check if it starts with a SQL keyword
    let valid_starts = [
        "select", "insert", "update", "delete", "create", "drop", "alter",
        "with", "begin", "commit", "rollback", "grant", "revoke",
    ];
    
    valid_starts.iter().any(|&keyword| sql_lower.starts_with(keyword))
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE_SQL: &str = "SELECT id, name, email FROM users WHERE active = true AND created_at > '2024-01-01' ORDER BY name";

    #[test]
    fn test_format_sql_postgresql() {
        let result = format_sql(SAMPLE_SQL, SqlDialect::PostgreSQL, 2, false).unwrap();
        assert!(result.contains("SELECT"));
        assert!(result.contains("FROM"));
        assert!(result.contains("WHERE"));
    }

    #[test]
    fn test_format_sql_uppercase() {
        let result = format_sql(SAMPLE_SQL, SqlDialect::Generic, 2, true).unwrap();
        assert!(result.contains("SELECT"));
        assert!(result.contains("FROM"));
    }

    #[test]
    fn test_format_sql_with_join() {
        let sql = "SELECT u.name, o.total FROM users u JOIN orders o ON u.id = o.user_id";
        let result = format_sql(sql, SqlDialect::Generic, 2, false).unwrap();
        assert!(result.contains("JOIN"));
    }

    #[test]
    fn test_minify_sql() {
        let formatted = "SELECT\n  id,\n  name\nFROM\n  users\nWHERE\n  active = true";
        let result = minify_sql(formatted).unwrap();
        assert!(!result.contains('\n'));
        assert!(result.contains("SELECT"));
    }

    #[test]
    fn test_minify_sql_with_comments() {
        let sql = "SELECT id -- user id\nFROM users /* table name */";
        let result = minify_sql(sql).unwrap();
        assert!(!result.contains("--"));
        assert!(!result.contains("/*"));
        assert!(result.contains("SELECT"));
    }

    #[test]
    fn test_validate_sql_valid() {
        assert!(validate_sql("SELECT * FROM users"));
        assert!(validate_sql("INSERT INTO users VALUES (1, 'John')"));
        assert!(validate_sql("UPDATE users SET name = 'Jane'"));
        assert!(validate_sql("DELETE FROM users WHERE id = 1"));
    }

    #[test]
    fn test_validate_sql_invalid() {
        assert!(!validate_sql("INVALID QUERY"));
        assert!(!validate_sql("Hello World"));
        assert!(!validate_sql(""));
    }

    #[test]
    fn test_format_create_table() {
        let sql = "CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100))";
        let result = format_sql(sql, SqlDialect::PostgreSQL, 2, false).unwrap();
        assert!(result.contains("CREATE"));
        assert!(result.contains("TABLE"));
    }

    #[test]
    fn test_format_complex_query() {
        let sql = "WITH recent_users AS (SELECT * FROM users WHERE created_at > NOW() - INTERVAL '7 days') SELECT * FROM recent_users";
        let result = format_sql(sql, SqlDialect::PostgreSQL, 2, false).unwrap();
        assert!(result.contains("WITH"));
        assert!(result.len() > sql.len()); // Should be formatted with newlines
    }
}
