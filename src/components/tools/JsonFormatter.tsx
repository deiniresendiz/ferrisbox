import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Sparkles, Minimize2, Star } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

export const JsonFormatter: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const toolId = 'json-formatter';
  const favorite = isFavorite(toolId);

  const formatJson = async () => {
    try {
      const result = await invoke<string>('format_json_command', {
        input,
        indent: 2,
      });
      setOutput(result);
      setError('');
    } catch (err) {
      setError(String(err));
      setOutput('');
    }
  };

  const minifyJson = async () => {
    try {
      const result = await invoke<string>('minify_json_command', { input });
      setOutput(result);
      setError('');
    } catch (err) {
      setError(String(err));
      setOutput('');
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
  };

  const toggleFavorite = () => {
    if (favorite) {
      removeFavorite(toolId);
    } else {
      addFavorite(toolId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('tools.jsonFormatter.name')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{t('tools.jsonFormatter.description')}</p>
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

      <div className="mb-4 flex gap-2">
        <button onClick={formatJson} className="btn btn-primary flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          {t('tools.jsonFormatter.actions.format')}
        </button>
        <button onClick={minifyJson} className="btn btn-secondary flex items-center gap-2">
          <Minimize2 className="w-4 h-4" />
          {t('tools.jsonFormatter.actions.minify')}
        </button>
        <button onClick={clearAll} className="btn btn-secondary">
          {t('tools.jsonFormatter.actions.clear')}
        </button>
        {output && (
          <button onClick={copyToClipboard} className="btn btn-secondary flex items-center gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? t('common.copied') : t('tools.jsonFormatter.actions.copy')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tools.jsonFormatter.input')}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"name": "FerrisBox", "type": "tool"}'
            className="w-full h-96 font-mono text-sm input resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tools.jsonFormatter.output')}
          </label>
          {error ? (
            <div className="w-full h-96 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 font-mono text-sm">{error}</p>
            </div>
          ) : (
            <textarea
              value={output}
              readOnly
              className="w-full h-96 font-mono text-sm input resize-none bg-gray-50 dark:bg-space-800"
            />
          )}
        </div>
      </div>
    </div>
  );
};
