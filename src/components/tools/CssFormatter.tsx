import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Star } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

export const CssFormatter: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indentSize, setIndentSize] = useState(2);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const toolId = 'css-formatter';
  const favorite = isFavorite(toolId);

  const handleFormat = async () => {
    try {
      const result = await invoke<string>('format_css_command', {
        input,
        indent: indentSize,
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
      const result = await invoke<string>('minify_css_command', { input });
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
      const result = await invoke<boolean>('validate_css_command', { input });
      setIsValid(result);
      if (!result) {
        setError('Invalid CSS syntax');
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

  const exampleCss = `.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  background-color: #333;
  color: #fff;
  padding: 1rem 2rem;
}

.button {
  background: linear-gradient(to right, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 4px;
  color: white;
  padding: 10px 20px;
  cursor: pointer;
  transition: transform 0.2s;
}

.button:hover {
  transform: translateY(-2px);
}`;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('tools.cssFormatter.name')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{t('tools.cssFormatter.description')}</p>
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
            {t('tools.cssFormatter.indentSize', 'Indent')}:
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

        <button onClick={handleFormat} className="btn btn-primary">
          {t('tools.cssFormatter.format', 'Format')}
        </button>
        <button onClick={handleMinify} className="btn btn-secondary">
          {t('tools.cssFormatter.minify', 'Minify')}
        </button>
        <button onClick={handleValidate} className="btn btn-secondary">
          {t('tools.cssFormatter.validate', 'Validate')}
        </button>
        <button onClick={clearAll} className="btn btn-secondary">
          {t('common.clear')}
        </button>
        <button onClick={() => setInput(exampleCss)} className="btn btn-secondary">
          {t('tools.cssFormatter.example', 'Example')}
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
            {isValid ? '✓ Valid CSS' : '✗ Invalid CSS'}
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
            {t('tools.cssFormatter.input', 'Input CSS')}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('tools.cssFormatter.placeholder', 'Paste your CSS here...')}
            className="w-full h-96 font-mono text-sm input resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tools.cssFormatter.output', 'Output')}
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
