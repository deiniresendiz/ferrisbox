import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Star } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

export const StringEscaper: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'json' | 'java' | 'html' | 'url'>('json');

  const toolId = 'string-escaper';
  const favorite = isFavorite(toolId);

  const handleEscape = () => {
    let result = '';
    switch (mode) {
      case 'json':
      case 'java':
        result = JSON.stringify(input);
        // Remove surrounding quotes for raw string content if desired, but typically escaped string includes them or logic needs adjustment.
        // Let's keep it simple: stringify escapes it.
        // For Java string literals, usually we want the content inside " ".
        result = result.substring(1, result.length - 1);
        break;
      case 'html':
        result = input
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
        break;
      case 'url':
        result = encodeURIComponent(input);
        break;
    }
    setOutput(result);
  };

  const handleUnescape = () => {
    let result = '';
    try {
      switch (mode) {
        case 'json':
        case 'java':
          // Add quotes to parse valid JSON string
          result = JSON.parse(`"${input}"`);
          break;
        case 'html':
          // Simple HTML entity unescape (works on all platforms)
          result = input
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&#39;/g, "'");
          break;
        case 'url':
          result = decodeURIComponent(input);
          break;
      }
      setOutput(result);
    } catch {
      setOutput('Error: Invalid format');
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFavorite = () => {
    if (favorite) {
      removeFavorite(toolId);
    } else {
      addFavorite(toolId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-space-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('tools.stringEscaper.name')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.stringEscaper.description')}
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
          >
            <Star className={clsx('w-6 h-6', favorite && 'fill-current')} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4 items-center flex-wrap">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100"
            >
              <option value="json">JSON / JavaScript</option>
              <option value="java">Java / C#</option>
              <option value="html">HTML Entities</option>
              <option value="url">URL Encoded</option>
            </select>

            <button onClick={handleEscape} className="btn btn-primary">
              {t('tools.stringEscaper.escape')}
            </button>
            <button onClick={handleUnescape} className="btn btn-secondary">
              {t('tools.stringEscaper.unescape')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('tools.stringEscaper.input')}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-48 px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
                placeholder={t('tools.stringEscaper.placeholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('tools.stringEscaper.output')}
              </label>
              <textarea
                readOnly
                value={output}
                className="w-full h-48 px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md bg-gray-50 dark:bg-space-900 text-gray-900 dark:text-gray-100 font-mono text-sm"
              />
            </div>
          </div>

          {output && (
            <div className="flex justify-end">
              <button onClick={handleCopy} className="btn btn-secondary flex items-center gap-2">
                <Copy className="w-4 h-4" />
                {copied ? t('common.copied') : t('common.copy')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
