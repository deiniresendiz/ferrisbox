import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Star } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import type { HashAlgorithm } from '../../types';
import clsx from 'clsx';

export const HashGenerator: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [input, setInput] = useState('');
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA256');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const toolId = 'hash-generator';
  const favorite = isFavorite(toolId);

  const generateHash = async () => {
    const result = await invoke<string>('generate_hash_command', {
      input,
      algorithm,
    });
    setOutput(result);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('tools.hashGenerator.name')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('tools.hashGenerator.description')}
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

      <div className="mb-4 flex gap-2 items-center">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('tools.hashGenerator.algorithm')}:
        </label>
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value as HashAlgorithm)}
          className="px-3 py-2 bg-white dark:bg-space-700 border border-gray-300 dark:border-space-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-rust-500"
        >
          <option value="SHA256">SHA-256</option>
          <option value="MD5">MD5</option>
        </select>
        <button onClick={generateHash} className="btn btn-primary ml-auto">
          {t('tools.hashGenerator.actions.generate')}
        </button>
        <button onClick={clearAll} className="btn btn-secondary">
          {t('common.clear')}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tools.hashGenerator.input')}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to hash..."
            className="w-full h-32 font-mono text-sm input resize-none"
          />
        </div>

        {output && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tools.hashGenerator.output')}
              </label>
              <button
                onClick={copyToClipboard}
                className="btn btn-secondary btn-sm flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('common.copied') : t('common.copy')}
              </button>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-space-800 rounded-lg border border-gray-200 dark:border-space-600">
              <p className="font-mono text-sm break-all text-gray-900 dark:text-gray-100">
                {output}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
