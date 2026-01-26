import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { Copy, Star } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

export const TimestampConverter: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [timestamp, setTimestamp] = useState('');
  const [unit, setUnit] = useState<'seconds' | 'milliseconds'>('seconds');
  const [timezone, setTimezone] = useState('UTC');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const toolId = 'timestamp-converter';
  const favorite = isFavorite(toolId);

  const handleConvert = async () => {
    if (!timestamp.trim()) {
      setError(t('tools.timestampConverter.invalidTimestamp'));
      setOutput('');
      return;
    }

    try {
      const result = await invoke<string>('convert_timestamp_command', {
        timestamp: parseInt(timestamp),
        unit,
        timezone: timezone === 'UTC' ? undefined : timezone,
      });
      setOutput(result);
      setError('');
    } catch (err) {
      setError(String(err));
      setOutput('');
    }
  };

  const handleNow = () => {
    const now = Math.floor(Date.now() / 1000);
    setTimestamp(now.toString());
    setOutput('');
    setError('');
  };

  const handleCopy = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearAll = () => {
    setTimestamp('');
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

  const loadExample = (type: 'epoch' | 'billion' | 'recent') => {
    const examples = {
      epoch: '0',
      billion: '1000000000',
      recent: Math.floor(Date.now() / 1000).toString(),
    };
    setTimestamp(examples[type]);
    setOutput('');
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-space-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('tools.timestampConverter.name')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.timestampConverter.description')}
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

        <div className="space-y-4">
          <div className="mb-4 flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tools.timestampConverter.unit')}:
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as 'seconds' | 'milliseconds')}
                className="px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100"
              >
                <option value="seconds">{t('tools.timestampConverter.seconds')}</option>
                <option value="milliseconds">{t('tools.timestampConverter.milliseconds')}</option>
              </select>
            </div>

            <button onClick={handleNow} className="btn btn-secondary">
              {t('tools.timestampConverter.now')}
            </button>

            <button onClick={handleConvert} className="btn btn-primary">
              {t('tools.timestampConverter.convert')}
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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tools.timestampConverter.timezone')}:
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100"
            >
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="Local">Local (System Time)</option>
              <option value="America/New_York">New York (EST/EDT)</option>
              <option value="America/Los_Angeles">Los Angeles (PST/PDT)</option>
              <option value="America/Chicago">Chicago (CST/CDT)</option>
              <option value="America/Denver">Denver (MST/MDT)</option>
              <option value="Europe/London">London (GMT/BST)</option>
              <option value="Europe/Paris">Paris (CET/CEST)</option>
              <option value="Europe/Berlin">Berlin (CET/CEST)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Asia/Shanghai">Shanghai (CST)</option>
              <option value="Australia/Sydney">Sydney (AEST/AEDT)</option>
            </select>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('tools.timestampConverter.examples')}:
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => loadExample('epoch')}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-space-700 rounded hover:bg-gray-200 dark:hover:bg-space-600 transition-colors"
              >
                {t('tools.timestampConverter.examples.epoch')}
              </button>
              <button
                onClick={() => loadExample('billion')}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-space-700 rounded hover:bg-gray-200 dark:hover:bg-space-600 transition-colors"
              >
                {t('tools.timestampConverter.examples.billion')}
              </button>
              <button
                onClick={() => loadExample('recent')}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-space-700 rounded hover:bg-gray-200 dark:hover:bg-space-600 transition-colors"
              >
                {t('tools.timestampConverter.examples.recent')}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('tools.timestampConverter.timestamp')}
              </label>
              <textarea
                value={timestamp}
                onChange={(e) => {
                  setTimestamp(e.target.value);
                  setOutput('');
                  setError('');
                }}
                placeholder={t('tools.timestampConverter.placeholder')}
                className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md font-mono text-sm bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-rust-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('tools.timestampConverter.result')}
              </label>
              {error ? (
                <div className="w-full h-24 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 font-mono text-sm">{error}</p>
                </div>
              ) : (
                <textarea
                  value={output}
                  readOnly
                  placeholder={t('tools.timestampConverter.outputPlaceholder')}
                  className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md font-mono text-sm bg-gray-50 dark:bg-space-900 text-gray-900 dark:text-gray-100"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
