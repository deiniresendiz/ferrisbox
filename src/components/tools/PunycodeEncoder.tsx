import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Star } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

type Mode = 'encode' | 'decode';

export const PunycodeEncoder: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const toolId = 'punycode-encoder';
  const favorite = isFavorite(toolId);

  const handleProcess = async () => {
    try {
      if (mode === 'encode') {
        const result = await invoke<string>('encode_punycode_command', { domain: input });
        setOutput(result);
      } else {
        const result = await invoke<string>('decode_punycode_command', { encoded: input });
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

  // Example values for internationalized domain names
  const examples =
    mode === 'encode'
      ? [
          { label: 'German', value: 'münchen.de' },
          { label: 'Spanish', value: 'español.com' },
          { label: 'Chinese', value: '中国.cn' },
          { label: 'Arabic', value: 'مصر.eg' },
          { label: 'Russian', value: 'москва.ru' },
        ]
      : [
          { label: 'xn--mnchen-3ya.de', value: 'xn--mnchen-3ya.de' },
          { label: 'xn--espaol-zwa.com', value: 'xn--espaol-zwa.com' },
          { label: 'xn--fiqs8s.cn', value: 'xn--fiqs8s.cn' },
          { label: 'xn--wgbh1c.eg', value: 'xn--wgbh1c.eg' },
          { label: 'xn--80adxhks.ru', value: 'xn--80adxhks.ru' },
        ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('tools.punycodeEncoder.name')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('tools.punycodeEncoder.description')}
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

      <div className="mb-4 flex gap-2 flex-wrap">
        <div className="flex bg-gray-100 dark:bg-space-700 rounded-lg p-1">
          <button
            onClick={() => setMode('encode')}
            className={clsx(
              'px-4 py-2 rounded-md transition-colors whitespace-nowrap',
              mode === 'encode'
                ? 'bg-white dark:bg-space-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            {t('tools.punycodeEncoder.tabs.encode')}
          </button>
          <button
            onClick={() => setMode('decode')}
            className={clsx(
              'px-4 py-2 rounded-md transition-colors whitespace-nowrap',
              mode === 'decode'
                ? 'bg-white dark:bg-space-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            {t('tools.punycodeEncoder.tabs.decode')}
          </button>
        </div>

        <button onClick={handleProcess} className="btn btn-primary ml-auto">
          {mode === 'encode' ? t('common.encode') : t('common.decode')}
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
          {t('tools.punycodeEncoder.examples', 'Examples')}:
        </p>
        <div className="flex gap-2 flex-wrap">
          {examples.map((example, idx) => (
            <button
              key={idx}
              onClick={() => setInput(example.value)}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-space-700 rounded hover:bg-gray-200 dark:hover:bg-space-600 transition-colors"
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          ℹ️{' '}
          {mode === 'encode'
            ? t(
                'tools.punycodeEncoder.info.encode',
                'Converts Unicode domain names to ASCII-compatible encoding (Punycode)'
              )
            : t(
                'tools.punycodeEncoder.info.decode',
                'Converts Punycode domain names back to Unicode'
              )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tools.punycodeEncoder.input')}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'encode'
                ? t('tools.punycodeEncoder.placeholder.unicode', 'e.g., münchen.de')
                : t('tools.punycodeEncoder.placeholder.punycode', 'e.g., xn--mnchen-3ya.de')
            }
            className="w-full h-96 font-mono text-sm input resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tools.punycodeEncoder.output')}
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
