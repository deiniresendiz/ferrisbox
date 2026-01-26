import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Copy, Check, Star, GitBranch } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

export const GitBranchNameGenerator: React.FC = () => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [title, setTitle] = useState('');
  const [output, setOutput] = useState<{
    branch_name: string;
    original: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const toolId = 'git-branch-name-generator';
  const favorite = isFavorite(toolId);

  useEffect(() => {
    if (title) {
      generateBranchName();
    } else {
      setOutput(null);
    }
  }, [title]);

  const generateBranchName = async () => {
    if (!title) return;

    try {
      const result = await invoke<{
        branch_name: string;
        original: string;
      }>('generate_git_branch_name_command', { title });
      setOutput(result);
    } catch (err) {
      console.error('Branch name generation failed:', err);
    }
  };

  const copyToClipboard = async () => {
    if (output) {
      await navigator.clipboard.writeText(output.branch_name);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleFavorite = () => {
    if (favorite) {
      removeFavorite(toolId);
    } else {
      addFavorite(toolId);
    }
  };

  const examples = [
    { original: 'Add new feature for user profiles', branch: 'add-new-feature-for-user-profiles' },
    {
      original: "BUG: Can't login with special characters",
      branch: 'bug-cant-login-with-special-characters',
    },
    { original: 'Update API endpoint /users', branch: 'update-api-endpoint-users' },
    {
      original: 'Fix: Database connection timeout in production',
      branch: 'fix-database-connection-timeout-in-production',
    },
    {
      original: 'Refactor: Extract user service to separate module',
      branch: 'refactor-extract-user-service-to-separate-module',
    },
    {
      original: 'HOTFIX: Fix critical security vulnerability',
      branch: 'hotfix-fix-critical-security-vulnerability',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Git Branch Name Generator
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Convert task titles to valid branch names (kebab-case)
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

      <div className="space-y-6">
        {/* Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Task Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Fix login bug in production"
            className="w-full px-3 py-2 bg-white dark:bg-space-700 border border-gray-300 dark:border-space-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-rust-500"
          />
        </div>

        {/* Output */}
        {output && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Branch Name
              </label>
              <div className="flex gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {output.branch_name.length}/70 chars
                </span>
                <button
                  onClick={copyToClipboard}
                  className="btn btn-secondary btn-sm flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-3">
                <GitBranch className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-mono text-lg text-green-900 dark:text-green-100">
                    {output.branch_name}
                  </p>
                  {output.branch_name.length > 50 && (
                    <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                      ⚠️ Long branch name (max 70 chars recommended)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rules */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Conversion Rules:</h3>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>✓ Convert to lowercase</li>
            <li>✓ Replace spaces with hyphens</li>
            <li>✓ Remove special characters (keep: a-z, 0-9, -, /)</li>
            <li>✓ Limit to 70 characters (Git convention)</li>
            <li>✓ Remove consecutive hyphens</li>
          </ul>
        </div>

        {/* Examples */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Examples:</h3>
          <div className="space-y-2">
            {examples.map((example, index) => (
              <div
                key={index}
                className="p-3 bg-gray-100 dark:bg-space-800 rounded-lg border border-gray-200 dark:border-space-600"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Input:</p>
                    <p className="font-mono text-sm text-gray-900 dark:text-gray-100">
                      {example.original}
                    </p>
                  </div>
                  <div className="text-gray-400">→</div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Output:</p>
                    <p className="font-mono text-sm text-green-700 dark:text-green-400">
                      {example.branch}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
