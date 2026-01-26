import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Copy, Check, Star, Download, Search } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

const CATEGORIES = {
  languages: {
    label: '🖥️ Languages',
    templates: [
      { id: 'rust', name: 'Rust' },
      { id: 'python', name: 'Python' },
      { id: 'javascript', name: 'JavaScript' },
      { id: 'typescript', name: 'TypeScript' },
      { id: 'java', name: 'Java' },
      { id: 'go', name: 'Go' },
      { id: 'php', name: 'PHP' },
      { id: 'ruby', name: 'Ruby' },
      { id: 'cpp', name: 'C++' },
      { id: 'csharp', name: 'C#' },
      { id: 'swift', name: 'Swift' },
      { id: 'kotlin', name: 'Kotlin' },
    ],
  },
  frameworks: {
    label: '🚀 Frameworks',
    templates: [
      { id: 'node', name: 'Node.js' },
      { id: 'django', name: 'Django' },
      { id: 'rails', name: 'Rails' },
      { id: 'laravel', name: 'Laravel' },
      { id: 'spring', name: 'Spring' },
    ],
  },
  build: {
    label: '🔧 Build Tools',
    templates: [
      { id: 'maven', name: 'Maven' },
      { id: 'gradle', name: 'Gradle' },
      { id: 'npm', name: 'npm' },
      { id: 'yarn', name: 'Yarn' },
      { id: 'pnpm', name: 'pnpm' },
      { id: 'cargo', name: 'Cargo' },
      { id: 'pip', name: 'pip' },
      { id: 'pipenv', name: 'Pipenv' },
      { id: 'poetry', name: 'Poetry' },
    ],
  },
  devops: {
    label: '🐳 DevOps / Infra',
    templates: [
      { id: 'docker', name: 'Docker' },
      { id: 'kubernetes', name: 'Kubernetes' },
      { id: 'terraform', name: 'Terraform' },
      { id: 'ansible', name: 'Ansible' },
      { id: 'helm', name: 'Helm' },
      { id: 'vagrant', name: 'Vagrant' },
    ],
  },
  cloud: {
    label: '☁️ Cloud',
    templates: [
      { id: 'aws', name: 'AWS' },
      { id: 'googlecloud', name: 'Google Cloud' },
      { id: 'azure', name: 'Azure' },
    ],
  },
  ide: {
    label: '💻 IDEs',
    templates: [
      { id: 'vscode', name: 'VS Code' },
      { id: 'intellij', name: 'IntelliJ' },
      { id: 'eclipse', name: 'Eclipse' },
    ],
  },
  systems: {
    label: '🪟 Operating Systems',
    templates: [
      { id: 'macos', name: 'macOS' },
      { id: 'windows', name: 'Windows' },
      { id: 'linux', name: 'Linux' },
    ],
  },
  other: {
    label: '🔧 Other',
    templates: [
      { id: 'git', name: 'Git' },
      { id: 'env', name: 'Environment (.env)' },
    ],
  },
};

export const GitignoreGenerator: React.FC = () => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<keyof typeof CATEGORIES>>(
    new Set()
  );

  const toolId = 'gitignore-generator';
  const favorite = isFavorite(toolId);

  const toggleTemplate = (templateId: string) => {
    setSelectedTemplates((prev) => {
      const next = new Set(prev);
      if (next.has(templateId)) {
        next.delete(templateId);
      } else {
        next.add(templateId);
      }
      return next;
    });
  };

  const toggleCategory = (category: keyof typeof CATEGORIES) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const generateGitignore = async () => {
    const templates = Array.from(selectedTemplates);
    const result = await invoke<string>('generate_gitignore_command', { templates });
    setOutput(result);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadGitignore = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '.gitignore';
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleFavorite = () => {
    if (favorite) {
      removeFavorite(toolId);
    } else {
      addFavorite(toolId);
    }
  };

  const filteredCategories = Object.entries(CATEGORIES).filter(([_, category]) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return category.templates.some(
      (t) => t.name.toLowerCase().includes(query) || t.id.includes(query)
    );
  }) as Array<[keyof typeof CATEGORIES, (typeof CATEGORIES)[keyof typeof CATEGORIES]]>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            .gitignore Generator
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Generate .gitignore files for any project
          </p>
        </div>
        <button
          onClick={toggleFavorite}
          className={clsx(
            'p-2 rounded-lg transition-colors',
            favorite
              ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-space-500'
          )}
        >
          <Star className={clsx('w-5 h-5', favorite && 'fill-current')} />
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search templates..."
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-space-700 border border-gray-300 dark:border-space-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-rust-500"
        />
      </div>

      {/* Categories */}
      <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCategories.map(([categoryId, category]) => {
          const isExpanded = expandedCategories.has(categoryId);
          const categoryTemplates = category.templates.filter((t) => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return t.name.toLowerCase().includes(query) || t.id.includes(query);
          });

          if (categoryTemplates.length === 0) return null;

          return (
            <div
              key={categoryId}
              className="border border-gray-200 dark:border-space-600 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleCategory(categoryId)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-space-800 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-space-700 transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {category.label}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedTemplates.size > 0 &&
                  categoryTemplates.filter((t) => selectedTemplates.has(t.id)).length > 0
                    ? `${categoryTemplates.filter((t) => selectedTemplates.has(t.id)).length}/${categoryTemplates.length} selected`
                    : `${categoryTemplates.length} templates`}
                </span>
              </button>

              {isExpanded && (
                <div className="px-4 py-3 space-y-2 border-t border-gray-200 dark:border-space-600">
                  {categoryTemplates.map((template) => {
                    const isSelected = selectedTemplates.has(template.id);
                    return (
                      <label
                        key={template.id}
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-space-700 p-2 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleTemplate(template.id)}
                          className="w-4 h-4 rounded border-gray-300 text-rust-600 focus:ring-rust-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                          {template.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={generateGitignore}
          disabled={selectedTemplates.size === 0}
          className="btn btn-primary flex items-center gap-2"
        >
          Generate .gitignore
        </button>

        {output && (
          <>
            <button onClick={copyToClipboard} className="btn btn-secondary flex items-center gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={downloadGitignore}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download .gitignore
            </button>
          </>
        )}
      </div>

      {/* Output */}
      {output && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Generated .gitignore
          </label>
          <textarea
            value={output}
            readOnly
            rows={15}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-space-900 border border-gray-300 dark:border-space-600 rounded-lg font-mono text-sm text-gray-900 dark:text-gray-100 resize-none"
          />
        </div>
      )}
    </div>
  );
};
