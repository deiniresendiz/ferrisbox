import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { Copy, Star } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

export const ColorPicker: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [color, setColor] = useState('');
  const [format, setFormat] = useState<'hex' | 'rgb' | 'hsl'>('hex');
  const [output, setOutput] = useState<any>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  void copied;
  const [previewColor, setPreviewColor] = useState('#000000');

  const toolId = 'color-picker';
  const favorite = isFavorite(toolId);

  const handleConvert = async () => {
    if (!color.trim()) {
      setError(t('tools.colorPicker.invalidColor'));
      setOutput(null);
      return;
    }

    try {
      const result = await invoke('convert_color_command', {
        color: color.trim(),
        fromFormat: format,
        toFormat: 'all',
      });
      setOutput(result);
      setError('');
      if (format === 'hex') {
        setPreviewColor(color);
      }
    } catch (err) {
      setError(String(err));
      setOutput(null);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setColor('');
    setOutput(null);
    setError('');
    setPreviewColor('#000000');
  };

  const toggleFavorite = () => {
    if (favorite) {
      removeFavorite(toolId);
    } else {
      addFavorite(toolId);
    }
  };

  const loadExample = (format: 'hex' | 'rgb' | 'hsl') => {
    const examples = {
      hex: '#ff5733',
      rgb: 'rgb(255, 87, 51)',
      hsl: 'hsl(11, 100%, 60%)',
    };
    setColor(examples[format]);
    setFormat(format);
    setOutput(null);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-space-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('tools.colorPicker.name')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.colorPicker.description')}
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
                {t('tools.colorPicker.inputFormat')}:
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as 'hex' | 'rgb' | 'hsl')}
                className="px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100"
              >
                <option value="hex">{t('tools.colorPicker.hex')}</option>
                <option value="rgb">{t('tools.colorPicker.rgb')}</option>
                <option value="hsl">{t('tools.colorPicker.hsl')}</option>
              </select>
            </div>

            <button onClick={handleConvert} className="btn btn-primary">
              {t('tools.colorPicker.convert')}
            </button>

            <button onClick={clearAll} className="btn btn-secondary">
              {t('common.clear')}
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('tools.colorPicker.examples')}:
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => loadExample('hex')}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-space-700 rounded hover:bg-gray-200 dark:hover:bg-space-600 transition-colors"
              >
                {t('tools.colorPicker.hexExample')}
              </button>
              <button
                onClick={() => loadExample('rgb')}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-space-700 rounded hover:bg-gray-200 dark:hover:bg-space-600 transition-colors"
              >
                {t('tools.colorPicker.rgbExample')}
              </button>
              <button
                onClick={() => loadExample('hsl')}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-space-700 rounded hover:bg-gray-200 dark:hover:bg-space-600 transition-colors"
              >
                {t('tools.colorPicker.hslExample')}
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
                {t('tools.colorPicker.color')}
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={previewColor}
                  onChange={(e) => setPreviewColor(e.target.value)}
                  className="w-16 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    setOutput(null);
                    setError('');
                  }}
                  placeholder={t('tools.colorPicker.placeholder')}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100 font-mono"
                />
              </div>
            </div>

            {output && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('tools.colorPicker.convertedFormats')}
                </label>
                <div className="space-y-2">
                  {output.hex && (
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-space-900 p-2 rounded">
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        HEX:
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: output.hex }} />
                        <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                          {output.hex}
                        </span>
                        <button
                          onClick={() => handleCopy(output.hex)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-space-700 rounded"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  {output.rgb && (
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-space-900 p-2 rounded">
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        RGB:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                          {output.rgb}
                        </span>
                        <button
                          onClick={() => handleCopy(output.rgb)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-space-700 rounded"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  {output.hsl && (
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-space-900 p-2 rounded">
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        HSL:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                          {output.hsl}
                        </span>
                        <button
                          onClick={() => handleCopy(output.hsl)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-space-700 rounded"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  {output.cmyk && (
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-space-900 p-2 rounded">
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        CMYK:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                          {output.cmyk}
                        </span>
                        <button
                          onClick={() => handleCopy(output.cmyk)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-space-700 rounded"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
