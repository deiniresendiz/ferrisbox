import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Star } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

type Mode = 'encode' | 'decode';
type Format = 'named' | 'numeric' | 'hex';

export const HtmlEntities: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [mode, setMode] = useState<Mode>('encode');
  const [format, setFormat] = useState<Format>('named');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const toolId = 'html-entities';
  const favorite = isFavorite(toolId);

  const handleProcess = async () => {
    try {
      if (mode === 'encode') {
        const result = await invoke<string>('encode_html_command', {
          text: input,
          format: format,
        });
        setOutput(result);
      } else {
        const result = await invoke<string>('decode_html_command', { encoded: input });
        setOutput(result);
      }
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

  // Examples
  const examples =
    mode === 'encode'
      ? [
          { label: '<div>Hello</div>', value: '<div>Hello</div>' },
          { label: 'A & B', value: 'A & B' },
          { label: '<script>alert("XSS")</script>', value: '<script>alert("XSS")</script>' },
        ]
      : [
          { label: '&lt;div&gt;', value: '&lt;div&gt;Hello&lt;/div&gt;' },
          { label: '&amp;', value: 'A &amp; B' },
          { label: '&#60;', value: '&#60;div&#62;' },
        ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('tools.htmlEntities.name')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{t('tools.htmlEntities.description')}</p>
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

      <div className="mb-4 flex gap-2 flex-wrap">
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
            {t('tools.htmlEntities.tabs.encode', 'Encode')}
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
            {t('tools.htmlEntities.tabs.decode', 'Decode')}
          </button>
        </div>

        {mode === 'encode' && (
          <div className="flex bg-gray-100 dark:bg-space-700 rounded-lg p-1">
            <button
              onClick={() => setFormat('named')}
              className={clsx(
                'px-3 py-2 rounded-md transition-colors text-sm',
                format === 'named'
                  ? 'bg-white dark:bg-space-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              )}
            >
              {t('tools.htmlEntities.formats.named', 'Named')}
            </button>
            <button
              onClick={() => setFormat('numeric')}
              className={clsx(
                'px-3 py-2 rounded-md transition-colors text-sm',
                format === 'numeric'
                  ? 'bg-white dark:bg-space-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              )}
            >
              {t('tools.htmlEntities.formats.numeric', 'Numeric')}
            </button>
            <button
              onClick={() => setFormat('hex')}
              className={clsx(
                'px-3 py-2 rounded-md transition-colors text-sm',
                format === 'hex'
                  ? 'bg-white dark:bg-space-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              )}
            >
              {t('tools.htmlEntities.formats.hex', 'Hex')}
            </button>
          </div>
        )}

        <button onClick={handleProcess} className="btn btn-primary ml-auto">
          {mode === 'encode' ? t('common.encode', 'Encode') : t('common.decode', 'Decode')}
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

      {/* Examples */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {t('tools.htmlEntities.examples', 'Examples')}:
        </p>
        <div className="flex gap-2 flex-wrap">
          {examples.map((example, idx) => (
            <button
              key={idx}
              onClick={() => setInput(example.value)}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-space-700 rounded hover:bg-gray-200 dark:hover:bg-space-600 transition-colors font-mono"
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tools.htmlEntities.input', 'Input')}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'encode'
                ? t('tools.htmlEntities.placeholder.text', 'Enter text to encode...')
                : t('tools.htmlEntities.placeholder.encoded', 'Enter HTML entities to decode...')
            }
            className="w-full h-96 font-mono text-sm input resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tools.htmlEntities.output', 'Output')}
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
