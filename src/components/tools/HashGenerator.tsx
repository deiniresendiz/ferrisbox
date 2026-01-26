import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Star } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

export const HashGenerator: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [input, setInput] = useState('');
  const [multiHashes, setMultiHashes] = useState<{
    md5: string;
    sha1: string;
    sha256: string;
    sha512: string;
  } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const toolId = 'hash-generator';
  const favorite = isFavorite(toolId);

  const generateHashes = async () => {
    const result = await invoke<{
      md5: string;
      sha1: string;
      sha256: string;
      sha512: string;
    }>('generate_all_hashes_command', { input });
    setMultiHashes(result);
  };

  useEffect(() => {
    if (input.length > 0) {
      generateHashes();
    } else {
      setMultiHashes(null);
    }
  }, [input]);

  const copyToClipboard = async (text: string, hashType: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(hashType);
    setTimeout(() => setCopied(null), 2000);
  };

  const clearAll = () => {
    setInput('');
    setMultiHashes(null);
  };

  const toggleFavorite = () => {
    if (favorite) {
      removeFavorite(toolId);
    } else {
      addFavorite(toolId);
    }
  };

  const hashCards = [
    { id: 'md5', name: 'MD5', color: 'purple' },
    { id: 'sha1', name: 'SHA-1', color: 'blue' },
    { id: 'sha256', name: 'SHA-256', color: 'green' },
    { id: 'sha512', name: 'SHA-512', color: 'orange' },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
      blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('tools.hashGenerator.name')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{t('tools.hashGenerator.description')}</p>
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
        <button onClick={clearAll} className="btn btn-secondary ml-auto">
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

        {multiHashes && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hashCards.map((hash) => {
              const hashValue = multiHashes[hash.id as keyof typeof multiHashes];
              const isCopied = copied === hash.id;

              return (
                <div
                  key={hash.id}
                  className={clsx(
                    'p-4 rounded-lg border transition-all',
                    getColorClasses(hash.color)
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{hash.name}</h3>
                    <button
                      onClick={() => copyToClipboard(hashValue, hash.id)}
                      className="flex items-center gap-1 text-sm px-2 py-1 rounded bg-white dark:bg-space-700 hover:bg-gray-50 dark:hover:bg-space-600 transition-colors border border-gray-200 dark:border-space-600"
                      title="Copy"
                    >
                      {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {isCopied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="p-3 bg-white dark:bg-space-900 rounded border border-gray-200 dark:border-space-600">
                    <p className="font-mono text-xs break-all text-gray-900 dark:text-gray-100 leading-relaxed">
                      {hashValue}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
