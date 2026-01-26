import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Star } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

type SqlDialect = 'generic' | 'postgresql' | 'mysql' | 'sqlite';

export const SqlFormatter: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [dialect, setDialect] = useState<SqlDialect>('generic');
  const [indentSize, setIndentSize] = useState(2);
  const [uppercase, setUppercase] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const toolId = 'sql-formatter';
  const favorite = isFavorite(toolId);

  const handleFormat = async () => {
    try {
      const result = await invoke<string>('format_sql_command', {
        input,
        dialect,
        indent: indentSize,
        uppercase,
      });
      setOutput(result);
      setError('');
      setIsValid(true);
    } catch (err) {
      setError(String(err));
      setOutput('');
      setIsValid(false);
    }
  };

  const handleMinify = async () => {
    try {
      const result = await invoke<string>('minify_sql_command', { input });
      setOutput(result);
      setError('');
      setIsValid(true);
    } catch (err) {
      setError(String(err));
      setOutput('');
      setIsValid(false);
    }
  };

  const handleValidate = async () => {
    try {
      const result = await invoke<boolean>('validate_sql_command', { input });
      setIsValid(result);
      if (!result) {
        setError('SQL does not start with a valid keyword');
      } else {
        setError('');
      }
    } catch (err) {
      setError(String(err));
      setIsValid(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
    setIsValid(null);
  };

  const toggleFavorite = () => {
    if (favorite) {
      removeFavorite(toolId);
    } else {
      addFavorite(toolId);
    }
  };

  const exampleSql = `SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.active = true AND u.created_at > '2024-01-01' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 0 ORDER BY total_spent DESC LIMIT 10;`;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('tools.sqlFormatter.name')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{t('tools.sqlFormatter.description')}</p>
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

      {/* Controls */}
      <div className="mb-4 flex gap-2 flex-wrap items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">
            {t('tools.sqlFormatter.dialect', 'Dialect')}:
          </label>
          <select
            value={dialect}
            onChange={(e) => setDialect(e.target.value as SqlDialect)}
            className="input input-sm"
          >
            <option value="generic">Generic</option>
            <option value="postgresql">PostgreSQL</option>
            <option value="mysql">MySQL</option>
            <option value="sqlite">SQLite</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">
            {t('tools.sqlFormatter.indentSize', 'Indent')}:
          </label>
          <select
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value))}
            className="input input-sm w-20"
          >
            <option value={2}>2</option>
            <option value={4}>4</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
            className="rounded"
          />
          {t('tools.sqlFormatter.uppercase', 'Uppercase Keywords')}
        </label>

        <button onClick={handleFormat} className="btn btn-primary">
          {t('tools.sqlFormatter.format', 'Format')}
        </button>
        <button onClick={handleMinify} className="btn btn-secondary">
          {t('tools.sqlFormatter.minify', 'Minify')}
        </button>
        <button onClick={handleValidate} className="btn btn-secondary">
          {t('tools.sqlFormatter.validate', 'Validate')}
        </button>
        <button onClick={clearAll} className="btn btn-secondary">
          {t('common.clear')}
        </button>
        <button onClick={() => setInput(exampleSql)} className="btn btn-secondary">
          {t('tools.sqlFormatter.example', 'Example')}
        </button>
        {output && (
          <button
            onClick={copyToClipboard}
            className="btn btn-secondary flex items-center gap-2 ml-auto"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? t('common.copied') : t('common.copy')}
          </button>
        )}
      </div>

      {/* Validation Status */}
      {isValid !== null && (
        <div
          className={clsx(
            'mb-4 p-3 rounded-lg border',
            isValid
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          )}
        >
          <p
            className={clsx(
              'text-sm font-medium',
              isValid ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
            )}
          >
            {isValid ? '✓ Valid SQL' : '✗ Invalid SQL'}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Input/Output */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tools.sqlFormatter.input', 'Input SQL')}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('tools.sqlFormatter.placeholder', 'Paste your SQL here...')}
            className="w-full h-96 font-mono text-sm input resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tools.sqlFormatter.output', 'Output')}
          </label>
          <textarea
            value={output}
            readOnly
            className="w-full h-96 font-mono text-sm input resize-none bg-gray-50 dark:bg-space-800"
          />
        </div>
      </div>
    </div>
  );
};
