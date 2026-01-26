use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum GitignoreTemplate {
    // Lenguajes
    Rust,
    Python,
    JavaScript,
    TypeScript,
    Java,
    Go,
    Php,
    Ruby,
    Cpp,
    Csharp,
    Swift,
    Kotlin,
    
    // Frameworks
    Node,
    Django,
    Rails,
    Laravel,
    Spring,
    
    // Herramientas/Build
    Maven,
    Gradle,
    Npm,
    Yarn,
    Pnpm,
    Cargo,
    Pip,
    Pipenv,
    Poetry,
    
    // DevOps/Infra
    Docker,
    Kubernetes,
    Terraform,
    Ansible,
    Helm,
    
    // Cloud
    Aws,
    GoogleCloud,
    Azure,
    
    // IDEs
    VSCode,
    IntelliJ,
    Eclipse,
    
    // Sistemas
    MacOs,
    Windows,
    Linux,
    
    // Otros
    Git,
    Env,
    Vagrant,
}

pub fn generate_gitignore(templates: Vec<GitignoreTemplate>) -> String {
    let mut lines: Vec<String> = Vec::new();
    
    for template in &templates {
        let content = get_template_content(template);
        lines.push(format!("\n# {}\n", get_template_name(template)));
        lines.extend(content.lines().map(|l| l.to_string()));
    }
    
    let mut result = lines.join("\n");
    
    // Deduplicar líneas
    let unique_lines: Vec<&str> = result
        .lines()
        .collect::<std::collections::HashSet<_>>()
        .into_iter()
        .collect();
    
    result = unique_lines.join("\n");
    
    // Ordenar excepto comentarios y líneas vacías
    let mut non_comment_lines: Vec<String> = Vec::new();
    let mut comment_lines: Vec<String> = Vec::new();
    
    for line in result.lines() {
        if line.starts_with('#') || line.is_empty() {
            comment_lines.push(line.to_string());
        } else {
            non_comment_lines.push(line.to_string());
        }
    }
    
    non_comment_lines.sort();
    non_comment_lines.dedup();
    
    let mut sorted_lines = comment_lines;
    sorted_lines.extend(non_comment_lines);
    
    sorted_lines.join("\n")
}

fn get_template_name(template: &GitignoreTemplate) -> String {
    match template {
        GitignoreTemplate::Rust => "Rust",
        GitignoreTemplate::Python => "Python",
        GitignoreTemplate::JavaScript => "JavaScript",
        GitignoreTemplate::TypeScript => "TypeScript",
        GitignoreTemplate::Java => "Java",
        GitignoreTemplate::Go => "Go",
        GitignoreTemplate::Php => "PHP",
        GitignoreTemplate::Ruby => "Ruby",
        GitignoreTemplate::Cpp => "C++",
        GitignoreTemplate::Csharp => "C#",
        GitignoreTemplate::Swift => "Swift",
        GitignoreTemplate::Kotlin => "Kotlin",
        GitignoreTemplate::Node => "Node.js",
        GitignoreTemplate::Django => "Django",
        GitignoreTemplate::Rails => "Rails",
        GitignoreTemplate::Laravel => "Laravel",
        GitignoreTemplate::Spring => "Spring",
        GitignoreTemplate::Maven => "Maven",
        GitignoreTemplate::Gradle => "Gradle",
        GitignoreTemplate::Npm => "npm",
        GitignoreTemplate::Yarn => "Yarn",
        GitignoreTemplate::Pnpm => "pnpm",
        GitignoreTemplate::Cargo => "Cargo",
        GitignoreTemplate::Pip => "pip",
        GitignoreTemplate::Pipenv => "Pipenv",
        GitignoreTemplate::Poetry => "Poetry",
        GitignoreTemplate::Docker => "Docker",
        GitignoreTemplate::Kubernetes => "Kubernetes",
        GitignoreTemplate::Terraform => "Terraform",
        GitignoreTemplate::Ansible => "Ansible",
        GitignoreTemplate::Helm => "Helm",
        GitignoreTemplate::Aws => "AWS",
        GitignoreTemplate::GoogleCloud => "Google Cloud",
        GitignoreTemplate::Azure => "Azure",
        GitignoreTemplate::VSCode => "VS Code",
        GitignoreTemplate::IntelliJ => "IntelliJ",
        GitignoreTemplate::Eclipse => "Eclipse",
        GitignoreTemplate::MacOs => "macOS",
        GitignoreTemplate::Windows => "Windows",
        GitignoreTemplate::Linux => "Linux",
        GitignoreTemplate::Git => "Git",
        GitignoreTemplate::Env => "Environment",
        GitignoreTemplate::Vagrant => "Vagrant",
    }.to_string()
}

fn get_template_content(template: &GitignoreTemplate) -> String {
    match template {
        GitignoreTemplate::Rust => {
            "# Rust
/target/
**/*.rs.bk
Cargo.lock
"
        }
        GitignoreTemplate::Python => {
            "# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
venv/
ENV/
env/
.venv
pip-log.txt
pip-delete-this-directory.txt
"
        }
        GitignoreTemplate::JavaScript => {
            "# JavaScript
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
"
        }
        GitignoreTemplate::TypeScript => {
            "# TypeScript
node_modules/
*.tsbuildinfo
dist/
"
        }
        GitignoreTemplate::Java => {
            "# Java
*.class
*.jar
*.war
*.ear
target/
"
        }
        GitignoreTemplate::Go => {
            "# Go
bin/
*.exe
*.exe~
*.dll
*.so
*.test
*.out
vendor/
"
        }
        GitignoreTemplate::Php => {
            "# PHP
vendor/
composer.lock
"
        }
        GitignoreTemplate::Ruby => {
            "# Ruby
*.gem
*.rbc
/.config
/coverage/
/InstalledFiles
/pkg/
/spec/reports/
/spec/examples.txt
/test/tmp/
/test/version_tmp/
/tmp/
"
        }
        GitignoreTemplate::Cpp => {
            "# C++
*.o
*.a
*.so
lib/
"
        }
        GitignoreTemplate::Csharp => {
            "# C#
bin/
obj/
*.user
*.suo
*.cache
*.lock.json
"
        }
        GitignoreTemplate::Swift => {
            "# Swift
*.swiftpm
*.xcuserstate
"
        }
        GitignoreTemplate::Kotlin => {
            "# Kotlin
build/
.idea/
"
        }
        GitignoreTemplate::Node => {
            "# Node.js
node_modules/
npm-debug.log
yarn-error.log
"
        }
        GitignoreTemplate::Django => {
            "# Django
*.log
/local_settings.py
/db.sqlite3
"
        }
        GitignoreTemplate::Rails => {
            "# Rails
/tmp
/tmp/*
/log/*
"
        }
        GitignoreTemplate::Laravel => {
            "# Laravel
/vendor
/storage/logs
"
        }
        GitignoreTemplate::Spring => {
            "# Spring
.mvn/
mvnw
mvnw.cmd
"
        }
        GitignoreTemplate::Maven => {
            "# Maven
/target/
pom.xml.tag
pom.xml.releaseBackup
"
        }
        GitignoreTemplate::Gradle => {
            "# Gradle
.gradle/
build/
!gradle/wrapper/gradle-wrapper.jar
"
        }
        GitignoreTemplate::Npm => {
            "# npm
node_modules/
npm-debug.log
"
        }
        GitignoreTemplate::Yarn => {
            "# Yarn
node_modules/
yarn-error.log
yarn-debug.log
.yarn-integrity
"
        }
        GitignoreTemplate::Pnpm => {
            "# pnpm
node_modules/
.pnpm-debug.log
"
        }
        GitignoreTemplate::Cargo => {
            "# Cargo
/target/
Cargo.lock
"
        }
        GitignoreTemplate::Pip => {
            "# pip
__pycache__/
*.pyc
"
        }
        GitignoreTemplate::Pipenv => {
            "# Pipenv
.env
.env.local
"
        }
        GitignoreTemplate::Poetry => {
            "# Poetry
.poetry/
"
        }
        GitignoreTemplate::Docker => {
            "# Docker
*.log
docker-compose.override.yml
.env
docker/
"
        }
        GitignoreTemplate::Kubernetes => {
            "# Kubernetes
*.kubeconfig
.helm/
charts/
terraform/
"
        }
        GitignoreTemplate::Terraform => {
            "# Terraform
*.tfstate
*.tfstate.*
.terraform/
"
        }
        GitignoreTemplate::Ansible => {
            "# Ansible
*.retry
"
        }
        GitignoreTemplate::Helm => {
            "# Helm
.helm/
charts/
"
        }
        GitignoreTemplate::Aws => {
            "# AWS
.aws/
terraform.tfstate
*.pem
"
        }
        GitignoreTemplate::GoogleCloud => {
            "# Google Cloud
.gcloudignore
app.yaml
.gcloud/
"
        }
        GitignoreTemplate::Azure => {
            "# Azure
.azure/
azure-pipelines.yml
"
        }
        GitignoreTemplate::VSCode => {
            "# VS Code
.vscode/
*.code-workspace
"
        }
        GitignoreTemplate::IntelliJ => {
            "# IntelliJ
.idea/
*.iml
"
        }
        GitignoreTemplate::Eclipse => {
            "# Eclipse
.project
.classpath
.settings/
"
        }
        GitignoreTemplate::MacOs => {
            "# macOS
.DS_Store
.AppleDouble
.LSOverride
Icon
._*
.DocumentRevisions-V100
.fseventsd
.Spotlight-V100
.TemporaryItems
.Trashes
.VolumeIcon.icns
.com.apple.timemachine.donotpresent
.AppleDB
.AppleDesktop
Network Trash Folder
Temporary Items
.apdisk
"
        }
        GitignoreTemplate::Windows => {
            "# Windows
Thumbs.db
ehthumbs.db
Desktop.ini
$RECYCLE.BIN/
*.lnk
"
        }
        GitignoreTemplate::Linux => {
            "# Linux
*~
.directory
"
        }
        GitignoreTemplate::Git => {
            "# Git
.git
"
        }
        GitignoreTemplate::Env => {
            "# Environment
.env
.env.local
.env.*.local
"
        }
        GitignoreTemplate::Vagrant => {
            "# Vagrant
.vagrant/
"
        }
    }.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_gitignore_single() {
        let result = generate_gitignore(vec![GitignoreTemplate::Rust]);
        assert!(result.contains("/target/"));
        assert!(result.contains("# Rust"));
    }

    #[test]
    fn test_generate_gitignore_multiple() {
        let result = generate_gitignore(vec![
            GitignoreTemplate::Rust,
            GitignoreTemplate::Docker,
        ]);
        assert!(result.contains("/target/"));
        assert!(result.contains("*.log"));
    }

    #[test]
    fn test_generate_gitignore_dedup() {
        let result = generate_gitignore(vec![
            GitignoreTemplate::Node,
            GitignoreTemplate::Npm,
        ]);
        let node_modules_count = result.matches("node_modules/").count();
        assert_eq!(node_modules_count, 1);
    }

    #[test]
    fn test_generate_gitignore_docker() {
        let result = generate_gitignore(vec![GitignoreTemplate::Docker]);
        assert!(result.contains("*.log"));
        assert!(result.contains("docker/"));
    }

    #[test]
    fn test_generate_gitignore_aws() {
        let result = generate_gitignore(vec![GitignoreTemplate::Aws]);
        assert!(result.contains(".aws/"));
        assert!(result.contains("*.pem"));
    }

    #[test]
    fn test_generate_gitignore_kubernetes() {
        let result = generate_gitignore(vec![GitignoreTemplate::Kubernetes]);
        assert!(result.contains("*.kubeconfig"));
        assert!(result.contains("charts/"));
    }
}
