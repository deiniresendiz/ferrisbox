import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Star, Minimize2 } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import { invoke } from '@tauri-apps/api/core';
import clsx from 'clsx';

type OptimizationLevel = 'low' | 'medium' | 'high';

interface OptimizationStats {
  original_size: number;
  optimized_size: number;
  savings_bytes: number;
  savings_percent: number;
}

export const SvgOptimizer: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [svgInput, setSvgInput] = useState('');
  const [optimizedSvg, setOptimizedSvg] = useState('');
  const [level, setLevel] = useState<OptimizationLevel>('medium');
  const [stats, setStats] = useState<OptimizationStats | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const toolId = 'svg-optimizer';
  const favorite = isFavorite(toolId);

  const handleOptimize = async () => {
    if (!svgInput.trim()) {
      setError(t('tools.svgOptimizer.enterSvg'));
      return;
    }

    try {
      setError('');
      const result = await invoke<[string, OptimizationStats]>('optimize_svg_command', {
        svgContent: svgInput,
        level,
      });

      setOptimizedSvg(result[0]);
      setStats(result[1]);
    } catch (err) {
      setError(String(err));
      setOptimizedSvg('');
      setStats(null);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(optimizedSvg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setSvgInput('');
    setOptimizedSvg('');
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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('tools.svgOptimizer.name')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{t('tools.svgOptimizer.description')}</p>
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

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('tools.svgOptimizer.level')}
        </label>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as OptimizationLevel)}
          className="input"
        >
          <option value="low">{t('tools.svgOptimizer.levels.low')}</option>
          <option value="medium">{t('tools.svgOptimizer.levels.medium')}</option>
          <option value="high">{t('tools.svgOptimizer.levels.high')}</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tools.svgOptimizer.input')}
          </label>
          <textarea
            value={svgInput}
            onChange={(e) => setSvgInput(e.target.value)}
            placeholder={t('tools.svgOptimizer.inputPlaceholder')}
            className="w-full h-64 font-mono text-xs input resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tools.svgOptimizer.output')}
          </label>
          <textarea
            value={optimizedSvg}
            readOnly
            placeholder={t('tools.svgOptimizer.outputPlaceholder')}
            className="w-full h-64 font-mono text-xs input resize-none bg-gray-50 dark:bg-space-800"
          />
        </div>
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        <button onClick={handleOptimize} className="btn btn-primary">
          {t('tools.svgOptimizer.optimize')}
        </button>

        {optimizedSvg && (
          <button onClick={copyToClipboard} className="btn btn-secondary flex items-center gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? t('common.copied') : t('common.copy')}
          </button>
        )}

        <button onClick={clearAll} className="btn btn-secondary">
          {t('common.clear')}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-300">✗ {error}</p>
        </div>
      )}

      {stats && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-300">
            <Minimize2 className="w-4 h-4 inline mr-2" />
            {t('tools.svgOptimizer.stats', {
              original: formatBytes(stats.original_size),
              optimized: formatBytes(stats.optimized_size),
              savings: stats.savings_percent.toFixed(1),
            })}
          </p>
        </div>
      )}

      {optimizedSvg && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tools.svgOptimizer.preview')}
          </label>
          <div
            className="w-full border border-gray-300 dark:border-space-600 rounded-lg p-4 bg-white dark:bg-space-900 overflow-auto"
            dangerouslySetInnerHTML={{ __html: optimizedSvg }}
          />
        </div>
      )}
    </div>
  );
};
