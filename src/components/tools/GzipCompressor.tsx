import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Star } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

type Mode = 'compress' | 'decompress';
type Format = 'gzip' | 'zlib';

interface CompressionResult {
  compressed_base64: string;
  original_size: number;
  compressed_size: number;
  ratio_percent: number;
  savings_bytes: number;
}

export const GzipCompressor: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [mode, setMode] = useState<Mode>('compress');
  const [format, setFormat] = useState<Format>('gzip');
  const [level, setLevel] = useState(6);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState<CompressionResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const toolId = 'gzip-compressor';
  const favorite = isFavorite(toolId);

  const handleProcess = async () => {
    try {
      if (mode === 'compress') {
        const command = format === 'gzip' ? 'compress_gzip_command' : 'compress_zlib_command';
        const result = await invoke<CompressionResult>(command, {
          data: input,
          level,
        });
        setOutput(result.compressed_base64);
        setStats(result);
      } else {
        const command = format === 'gzip' ? 'decompress_gzip_command' : 'decompress_zlib_command';
        const result = await invoke<string>(command, {
          base64Data: input,
        });
        setOutput(result);
        setStats(null);
      }
      setError('');
    } catch (err) {
      setError(String(err));
      setOutput('');
      setStats(null);
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
    setStats(null);
    setError('');
  };

  const toggleFavorite = () => {
    if (favorite) {
      removeFavorite(toolId);
    } else {
      addFavorite(toolId);
    }
  };

  const getRatioColor = (ratio: number) => {
    if (ratio >= 50) return 'text-green-600 dark:text-green-400';
    if (ratio >= 25) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getProgressColor = (ratio: number) => {
    if (ratio >= 50) return 'bg-green-500';
    if (ratio >= 25) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('tools.gzipCompressor.name')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('tools.gzipCompressor.description')}
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

      <div className="mb-4 flex gap-2 flex-wrap items-center">
        <div className="flex bg-gray-100 dark:bg-space-700 rounded-lg p-1">
          <button
            onClick={() => setMode('compress')}
            className={clsx(
              'px-4 py-2 rounded-md transition-colors',
              mode === 'compress'
                ? 'bg-white dark:bg-space-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            {t('tools.gzipCompressor.tabs.compress', 'Compress')}
          </button>
          <button
            onClick={() => setMode('decompress')}
            className={clsx(
              'px-4 py-2 rounded-md transition-colors',
              mode === 'decompress'
                ? 'bg-white dark:bg-space-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            {t('tools.gzipCompressor.tabs.decompress', 'Decompress')}
          </button>
        </div>

        <div className="flex bg-gray-100 dark:bg-space-700 rounded-lg p-1">
          <button
            onClick={() => setFormat('gzip')}
            className={clsx(
              'px-3 py-2 rounded-md transition-colors text-sm',
              format === 'gzip'
                ? 'bg-white dark:bg-space-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            GZip
          </button>
          <button
            onClick={() => setFormat('zlib')}
            className={clsx(
              'px-3 py-2 rounded-md transition-colors text-sm',
              format === 'zlib'
                ? 'bg-white dark:bg-space-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            Zlib
          </button>
        </div>

        <button onClick={handleProcess} className="btn btn-primary ml-auto">
          {mode === 'compress'
            ? t('common.compress', 'Compress')
            : t('common.decompress', 'Decompress')}
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

      {/* Compression Level Slider */}
      {mode === 'compress' && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-space-800 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tools.gzipCompressor.compressionLevel')}: {level}
            <span className="text-xs text-gray-500 ml-2">
              ({level <= 3 ? 'Fast' : level <= 6 ? 'Balanced' : 'Best'})
            </span>
          </label>
          <input
            type="range"
            min="1"
            max="9"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>1 (Fastest)</span>
            <span>9 (Best Compression)</span>
          </div>
        </div>
      )}

      {/* Stats Display */}
      {stats && mode === 'compress' && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('tools.gzipCompressor.stats.originalSize')}
              </p>
              <p className="text-lg font-semibold">{stats.original_size.toLocaleString()} B</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('tools.gzipCompressor.stats.compressedSize')}
              </p>
              <p className="text-lg font-semibold">{stats.compressed_size.toLocaleString()} B</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('tools.gzipCompressor.stats.ratio')}
              </p>
              <p className={clsx('text-lg font-semibold', getRatioColor(stats.ratio_percent))}>
                {stats.ratio_percent.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('tools.gzipCompressor.stats.savings')}
              </p>
              <p className="text-lg font-semibold">
                {stats.savings_bytes > 0 ? '+' : ''}
                {stats.savings_bytes.toLocaleString()} B
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full h-4 bg-gray-200 dark:bg-space-700 rounded-full overflow-hidden">
            <div
              className={clsx('h-full transition-all', getProgressColor(stats.ratio_percent))}
              style={{ width: `${Math.min(stats.ratio_percent, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 font-mono text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('common.input', 'Input')}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'compress' ? 'Enter text to compress...' : 'Enter Base64 compressed data...'
            }
            className="w-full h-96 font-mono text-sm input resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('common.output', 'Output')}
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
