import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Star } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

export const MarkdownToHtmlConverter: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [enableTables, setEnableTables] = useState(true);
  const [enableStrikethrough, setEnableStrikethrough] = useState(true);
  const [enableTasklists, setEnableTasklists] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const toolId = 'markdown-to-html-converter';
  const favorite = isFavorite(toolId);

  const handleConvert = async () => {
    if (!input.trim()) {
      setError(t('tools.markdownToHtmlConverter.emptyInput'));
      setOutput('');
      return;
    }

    try {
      const options = {
        enableTables,
        enableStrikethrough,
        enableTasklists,
      };
      const result = await invoke<string>('markdown_to_html_command', {
        md: input,
        options,
      });
      setOutput(result);
      setError('');
    } catch (err) {
      setError(String(err));
      setOutput('');
    }
  };

  const handleCopy = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const toggleFavorite = () => {
    if (favorite) {
      removeFavorite(toolId);
    } else {
      addFavorite(toolId);
    }
  };

  const loadExample = (type: 'simple' | 'table' | 'tasklist') => {
    const examples = {
      simple: `# Hello World

This is a **test**.`,
      table: `| Name | Age | City |
|-------|-----|------|
| John | 30 | New York |
| Jane | 25 | London |`,
      tasklist: `Task 1: [x] Task description
Task 2: [ ] Task description
Task 3: [ ] Task description`,
    };
    setInput(examples[type]);
    setOutput('');
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-space-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('tools.markdownToHtmlConverter.name')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.markdownToHtmlConverter.description')}
            </p>
          </div>
          <button
            onClick={toggleFavorite}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              favorite
                ? 'text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-500'
                : 'text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400'
            )}
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={clsx('w-6 h-6', favorite && 'fill-current')} />
          </button>
        </div>

        {/* Options */}
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enableTables"
              checked={enableTables}
              onChange={(e) => setEnableTables(e.target.checked)}
              className="w-4 h-4 text-rust-500 dark:text-rust-400 rounded"
            />
            <label
              htmlFor="enableTables"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('tools.markdownToHtmlConverter.enableTables')}
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enableStrikethrough"
              checked={enableStrikethrough}
              onChange={(e) => setEnableStrikethrough(e.target.checked)}
              className="w-4 h-4 text-rust-500 dark:text-rust-400 rounded"
            />
            <label
              htmlFor="enableStrikethrough"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('tools.markdownToHtmlConverter.enableStrikethrough')}
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enableTasklists"
              checked={enableTasklists}
              onChange={(e) => setEnableTasklists(e.target.checked)}
              className="w-4 h-4 text-rust-500 dark:text-rust-400 rounded"
            />
            <label
              htmlFor="enableTasklists"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('tools.markdownToHtmlConverter.enableTasklists')}
            </label>
          </div>

          <button onClick={handleConvert} className="btn btn-primary ml-auto">
            {t('tools.markdownToHtmlConverter.convert')}
          </button>

          <button onClick={clearAll} className="btn btn-secondary">
            {t('common.clear')}
          </button>

          {output && (
            <button onClick={handleCopy} className="btn btn-secondary flex items-center gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('common.copied') : t('common.copy')}
            </button>
          )}
        </div>

        {/* Examples */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {t('tools.markdownToHtmlConverter.examples')}:
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => loadExample('simple')}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-space-700 rounded hover:bg-gray-200 dark:hover:bg-space-600 transition-colors"
            >
              {t('tools.markdownToHtmlConverter.examplesList.simple')}
            </button>
            <button
              onClick={() => loadExample('table')}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-space-700 rounded hover:bg-gray-200 dark:hover:bg-space-600 transition-colors"
            >
              {t('tools.markdownToHtmlConverter.examplesList.table')}
            </button>
            <button
              onClick={() => loadExample('tasklist')}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-space-700 rounded hover:bg-gray-200 dark:hover:bg-space-600 transition-colors"
            >
              {t('tools.markdownToHtmlConverter.examplesList.tasklist')}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Input/Output Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('tools.markdownToHtmlConverter.input')}
            </label>
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setOutput('');
                setError('');
              }}
              placeholder={t('tools.markdownToHtmlConverter.placeholder')}
              className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md font-mono text-sm bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-rust-500 focus:border-transparent"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tools.markdownToHtmlConverter.output')}
              </label>
              {output && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-sm text-rust-600 dark:text-rust-400 hover:text-rust-700 dark:hover:text-rust-300"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      {t('tools.markdownToHtmlConverter.copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      {t('tools.markdownToHtmlConverter.copy')}
                    </>
                  )}
                </button>
              )}
            </div>
            {error ? (
              <div className="w-full h-96 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 font-mono text-sm">{error}</p>
              </div>
            ) : (
              <textarea
                value={output}
                readOnly
                placeholder={t('tools.markdownToHtmlConverter.outputPlaceholder')}
                className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md font-mono text-sm bg-gray-50 dark:bg-space-900 text-gray-900 dark:text-gray-100"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
