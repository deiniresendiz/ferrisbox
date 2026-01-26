use regex::Regex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct BranchNameOutput {
    pub branch_name: String,
    pub original: String,
}

pub fn generate_git_branch_name(title: &str) -> BranchNameOutput {
    let mut branch = title
        .to_lowercase()
        .chars()
        .map(|c| {
            match c {
                ' ' | '_' | '.' | ':' | ';' => '-',
                '/' => '-',  // Permitir / pero no en inicio/final
                c if c.is_alphanumeric() => c,
                _ => ' ',  // marcar para eliminar
            }
        })
        .collect::<String>()
        .split_whitespace()
        .collect::<Vec<_>>()
        .join("-");
    
    // Eliminar guiones consecutivos
    branch = Regex::new(r"-+").unwrap().replace_all(&branch, "-").to_string();
    
    // Trim guiones al inicio/final
    branch = branch.trim_matches('-').to_string();
    
    // Eliminar múltiples barras consecutivas
    branch = Regex::new(r"//+").unwrap().replace_all(&branch, "/").to_string();
    
    // Limitar longitud a 70 caracteres (convenión git)
    if branch.len() > 70 {
        branch.truncate(70);
        branch = branch.trim_matches('-').to_string();
        branch = branch.trim_matches('/').to_string();
    }
    
    BranchNameOutput {
        branch_name: branch,
        original: title.to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_branch_name_simple() {
        let result = generate_git_branch_name("Fix login bug");
        assert_eq!(result.branch_name, "fix-login-bug");
    }

    #[test]
    fn test_generate_branch_name_uppercase() {
        let result = generate_git_branch_name("ADD NEW FEATURE");
        assert_eq!(result.branch_name, "add-new-feature");
    }

    #[test]
    fn test_generate_branch_name_with_special_chars() {
        let result = generate_git_branch_name("Bug: Can't login!@#$");
        assert_eq!(result.branch_name, "bug-cant-login");
    }

    #[test]
    fn test_generate_branch_name_with_dots_and_colons() {
        let result = generate_git_branch_name("Update.api: /users endpoint");
        assert_eq!(result.branch_name, "update-api-users-endpoint");
    }

    #[test]
    fn test_generate_branch_name_limit_length() {
        let long_title = "this is a very very long title that should be truncated to 70 characters maximum length allowed by git convention";
        let result = generate_git_branch_name(long_title);
        assert!(result.branch_name.len() <= 70);
    }

    #[test]
    fn test_generate_branch_name_kebab_case() {
        let result = generate_git_branch_name("Convert task title to valid branch name in kebab case");
        assert_eq!(result.branch_name, "convert-task-title-to-valid-branch-name-in-kebab-case");
    }

    #[test]
    fn test_generate_branch_name_empty() {
        let result = generate_git_branch_name("");
        assert_eq!(result.branch_name, "");
    }

    #[test]
    fn test_generate_branch_name_with_numbers() {
        let result = generate_git_branch_name("Fix bug 123 for user 456");
        assert_eq!(result.branch_name, "fix-bug-123-for-user-456");
    }

    #[test]
    fn test_generate_branch_name_preserves_original() {
        let original = "Add new feature for user profiles";
        let result = generate_git_branch_name(original);
        assert_eq!(result.original, original);
    }

    #[test]
    fn test_generate_branch_name_with_slashes() {
        let result = generate_git_branch_name("Feature/auth/new/login");
        assert!(result.branch_name.contains("/"));
        assert!(!result.branch_name.starts_with('/'));
        assert!(!result.branch_name.ends_with('/'));
    }
}
