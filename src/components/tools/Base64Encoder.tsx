import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Star } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

type Mode = 'encode' | 'decode';

export const Base64Encoder: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const toolId = 'base64-encoder';
  const favorite = isFavorite(toolId);

  const handleEncode = async () => {
    try {
      const result = await invoke<string>('encode_base64_command', { text: input });
      setOutput(result);
      setError('');
    } catch (err) {
      setError(String(err));
      setOutput('');
    }
  };

  const handleDecode = async () => {
    try {
      const result = await invoke<string>('decode_base64_command', { encoded: input });
      setOutput(result);
      setError('');
    } catch (err) {
      setError(String(err));
      setOutput('');
    }
  };

  const handleProcess = () => {
    if (mode === 'encode') {
      handleEncode();
    } else {
      handleDecode();
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('tools.base64Encoder.name')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('tools.base64Encoder.description')}
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

      <div className="mb-4 flex gap-2">
        <div className="flex bg-gray-100 dark:bg-space-700 rounded-lg p-1">
          <button
            onClick={() => setMode('encode')}
            className={clsx(
              'px-4 py-2 rounded-md transition-colors',
              mode === 'encode'
                ? 'bg-white dark:bg-space-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            {t('tools.base64Encoder.tabs.encode')}
          </button>
          <button
            onClick={() => setMode('decode')}
            className={clsx(
              'px-4 py-2 rounded-md transition-colors',
              mode === 'decode'
                ? 'bg-white dark:bg-space-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            {t('tools.base64Encoder.tabs.decode')}
          </button>
        </div>

        <button onClick={handleProcess} className="btn btn-primary ml-auto">
          {mode === 'encode'
            ? t('tools.base64Encoder.actions.encode')
            : t('tools.base64Encoder.actions.decode')}
        </button>
        <button onClick={clearAll} className="btn btn-secondary">
          {t('common.clear')}
        </button>
        {output && (
          <button onClick={copyToClipboard} className="btn btn-secondary flex items-center gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? t('common.copied') : t('common.copy')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tools.base64Encoder.input')}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'
            }
            className="w-full h-96 font-mono text-sm input resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tools.base64Encoder.output')}
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
