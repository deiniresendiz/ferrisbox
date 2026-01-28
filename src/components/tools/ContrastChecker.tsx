import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Star, CheckCircle, XCircle, Circle } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import { invoke } from '@tauri-apps/api/core';
import clsx from 'clsx';

interface ContrastResult {
  ratio: number;
  foreground_hex: string;
  background_hex: string;
  foreground_luminance: number;
  background_luminance: number;
  normal_aa: boolean;
  large_aa: boolean;
  normal_aaa: boolean;
  large_aaa: boolean;
}

export const ContrastChecker: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [foreground, setForeground] = useState('#FFFFFF');
  const [background, setBackground] = useState('#000000');
  const [result, setResult] = useState<ContrastResult | null>(null);
  const [error, setError] = useState('');

  const toolId = 'contrast-checker';
  const favorite = isFavorite(toolId);

  const handleCheck = async () => {
    if (!foreground.trim() || !background.trim()) {
      setError(t('tools.contrastChecker.enterBothColors'));
      return;
    }

    try {
      setError('');
      const contrastResult = await invoke<ContrastResult>('check_contrast_command', {
        foreground,
        background,
      });

      setResult(contrastResult);
    } catch (err) {
      setError(String(err));
      setResult(null);
    }
  };

  const copyToClipboard = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(`Contrast Ratio: ${result.ratio.toFixed(2)}:1`);
  };

  const clearAll = () => {
    setForeground('#FFFFFF');
    setBackground('#000000');
    setResult(null);
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
            {t('tools.contrastChecker.name')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('tools.contrastChecker.description')}
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

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tools.contrastChecker.foreground')}
          </label>
          <input
            type="color"
            value={foreground}
            onChange={(e) => setForeground(e.target.value)}
            className="w-full h-12 border-2 border-gray-300 dark:border-space-600 rounded-lg cursor-pointer mb-2"
          />
          <input
            type="text"
            value={foreground}
            onChange={(e) => setForeground(e.target.value)}
            placeholder="#RRGGBB"
            className="input mb-2"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">HEX, RGB, or HSL format</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tools.contrastChecker.background')}
          </label>
          <input
            type="color"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            className="w-full h-12 border-2 border-gray-300 dark:border-space-600 rounded-lg cursor-pointer mb-2"
          />
          <input
            type="text"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            placeholder="#RRGGBB"
            className="input mb-2"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('tools.contrastChecker.colorFormat')}
          </p>
        </div>
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        <button onClick={handleCheck} className="btn btn-primary">
          {t('tools.contrastChecker.checkContrast')}
        </button>

        {result && (
          <button onClick={copyToClipboard} className="btn btn-secondary flex items-center gap-2">
            <Copy className="w-4 h-4" />
            {t('tools.contrastChecker.copyRatio')}
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

      {result && (
        <>
          <div className="mb-4 p-6 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-space-800 dark:to-space-900 rounded-lg">
            <div className="mb-4 p-4 rounded" style={{ backgroundColor: result.background_hex }}>
              <p className="text-lg mb-2" style={{ color: result.foreground_hex }}>
                {t('tools.contrastChecker.preview')}
              </p>
              <p className="text-sm mb-2" style={{ color: result.foreground_hex }}>
                {t('tools.contrastChecker.normalText')}
              </p>
              <p className="text-2xl font-bold" style={{ color: result.foreground_hex }}>
                {t('tools.contrastChecker.largeText')}
              </p>
            </div>
          </div>

          <div className="mb-4 p-6 bg-white dark:bg-space-900 border-2 border-gray-200 dark:border-space-600 rounded-lg text-center">
            <Circle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <h3 className="text-3xl font-bold mb-2">
              {result.ratio.toFixed(2)}
              <span className="text-xl">:1</span>
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Contrast Ratio</p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-gray-100">
              {t('tools.contrastChecker.wcag')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div
                className={clsx(
                  'p-4 rounded-lg border-2 flex items-center justify-between',
                  result.normal_aa
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                )}
              >
                <span className="text-sm font-medium">
                  {t('tools.contrastChecker.levels.normalAa')}
                </span>
                {result.normal_aa ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
              </div>

              <div
                className={clsx(
                  'p-4 rounded-lg border-2 flex items-center justify-between',
                  result.large_aa
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                )}
              >
                <span className="text-sm font-medium">
                  {t('tools.contrastChecker.levels.largeAa')}
                </span>
                {result.large_aa ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
              </div>

              <div
                className={clsx(
                  'p-4 rounded-lg border-2 flex items-center justify-between',
                  result.normal_aaa
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                )}
              >
                <span className="text-sm font-medium">
                  {t('tools.contrastChecker.levels.normalAaa')}
                </span>
                {result.normal_aaa ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
              </div>

              <div
                className={clsx(
                  'p-4 rounded-lg border-2 flex items-center justify-between',
                  result.large_aaa
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                )}
              >
                <span className="text-sm font-medium">
                  {t('tools.contrastChecker.levels.largeAaa')}
                </span>
                {result.large_aaa ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>
          </div>

          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Foreground: </span>
                <span className="text-blue-800 dark:text-blue-300">{result.foreground_hex}</span>
              </div>
              <div>
                <span className="font-medium">Background: </span>
                <span className="text-blue-800 dark:text-blue-300">{result.background_hex}</span>
              </div>
              <div>
                <span className="font-medium">FG Luminance: </span>
                <span className="text-blue-800 dark:text-blue-300">
                  {result.foreground_luminance.toFixed(4)}
                </span>
              </div>
              <div>
                <span className="font-medium">BG Luminance: </span>
                <span className="text-blue-800 dark:text-blue-300">
                  {result.background_luminance.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
