import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Download } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import { invoke } from '@tauri-apps/api/core';
import clsx from 'clsx';

interface FaviconStats {
  source_size: number;
  total_pngs: number;
  total_sizes_kb: number;
}

export const FaviconGenerator: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [sourceDataUrl, setSourceDataUrl] = useState('');
  const [icoDataUrl, setIcoDataUrl] = useState('');
  const [pngs, setPngs] = useState<Array<{ url: string; size: number }>>([]);
  const [sizes, setSizes] = useState<number[]>([16, 32, 48]);
  const [stats, setStats] = useState<FaviconStats | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toolId = 'favicon-generator';
  const favorite = isFavorite(toolId);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSourceDataUrl(reader.result as string);
      setIcoDataUrl('');
      setPngs([]);
      setStats(null);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateIco = async () => {
    if (!sourceDataUrl) {
      setError(t('tools.faviconGenerator.selectImageFirst'));
      return;
    }

    try {
      setError('');
      const result = await invoke<[string, FaviconStats]>('generate_favicon_ico_command', {
        dataUrl: sourceDataUrl,
        sizes,
      });

      setIcoDataUrl(result[0]);
      setStats(result[1]);
    } catch (err) {
      setError(String(err));
      setIcoDataUrl('');
      setStats(null);
    }
  };

  const handleGeneratePngs = async () => {
    if (!sourceDataUrl) {
      setError('Please select an image first');
      return;
    }

    try {
      setError('');
      const result = await invoke<Array<[string, number]>>('generate_favicon_pngs_command', {
        dataUrl: sourceDataUrl,
        sizes,
      });

      const pngArray = result.map(([url, size]) => ({ url, size }));
      setPngs(pngArray);
    } catch (err) {
      setError(String(err));
      setPngs([]);
    }
  };

  const downloadIco = () => {
    if (!icoDataUrl) return;

    const link = document.createElement('a');
    link.href = icoDataUrl;
    link.download = 'favicon.ico';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPng = (url: string, size: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `favicon-${size}x${size}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    setSourceDataUrl('');
    setIcoDataUrl('');
    setPngs([]);
    setStats(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleFavorite = () => {
    if (favorite) {
      removeFavorite(toolId);
    } else {
      addFavorite(toolId);
    }
  };

  const toggleSize = (size: number) => {
    if (sizes.includes(size)) {
      setSizes(sizes.filter((s) => s !== size));
    } else {
      setSizes([...sizes, size]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSourceDataUrl(reader.result as string);
        setIcoDataUrl('');
        setPngs([]);
        setStats(null);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const allSizes = [16, 32, 48, 64, 128, 256];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('tools.faviconGenerator.name')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('tools.faviconGenerator.description')}
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

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('tools.faviconGenerator.sizes')}
        </label>
        <div className="flex gap-2 flex-wrap">
          {allSizes.map((size) => (
            <label key={size} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sizes.includes(size)}
                onChange={() => toggleSize(size)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">
                {size}x{size}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('tools.faviconGenerator.input')}
        </label>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={clsx(
            'w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors',
            sourceDataUrl
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-300 dark:border-space-600 hover:border-gray-400'
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          {sourceDataUrl ? (
            <img src={sourceDataUrl} alt="Source" className="max-h-full object-contain" />
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {t('tools.faviconGenerator.input')}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {t('tools.faviconGenerator.dragDropOrClick')}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {t('tools.faviconGenerator.recommended')}
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          onClick={handleGenerateIco}
          className="btn btn-primary"
          disabled={!sourceDataUrl || sizes.length === 0}
        >
          {t('tools.faviconGenerator.generateIco')}
        </button>

        <button
          onClick={handleGeneratePngs}
          className="btn btn-primary"
          disabled={!sourceDataUrl || sizes.length === 0}
        >
          {t('tools.faviconGenerator.generatePngs')}
        </button>

        {icoDataUrl && (
          <button onClick={downloadIco} className="btn btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            {t('tools.faviconGenerator.download')} .ICO
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
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <Download className="w-4 h-4 inline mr-2" />
            {t('tools.faviconGenerator.totalPngs', {
              total: stats.total_pngs,
              size: stats.total_sizes_kb.toFixed(2),
            })}
          </p>
        </div>
      )}

      {icoDataUrl && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {t('tools.faviconGenerator.generatedFavicons')}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {sizes.map((size) => (
              <div
                key={size}
                className="border border-gray-200 dark:border-space-600 rounded-lg p-3 flex flex-col items-center"
              >
                <div className="w-16 h-16 mb-2 border border-gray-300 dark:border-space-600 rounded flex items-center justify-center bg-white dark:bg-space-900">
                  <img
                    src={icoDataUrl}
                    alt={`Favicon ${size}x${size}`}
                    className="w-full h-full object-contain"
                    style={{ width: `${size}px`, height: `${size}px` }}
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {size}x{size}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {pngs.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {t('tools.faviconGenerator.generatedPngs')}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {pngs.map((png, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-space-600 rounded-lg p-3 flex flex-col items-center"
              >
                <div className="w-16 h-16 mb-2 border border-gray-300 dark:border-space-600 rounded flex items-center justify-center bg-white dark:bg-space-900">
                  <img
                    src={png.url}
                    alt={`Favicon ${png.size}x${png.size}`}
                    className="w-full h-full object-contain"
                    style={{ width: `${png.size}px`, height: `${png.size}px` }}
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {png.size}x{png.size}
                </p>
                <button
                  onClick={() => downloadPng(png.url, png.size)}
                  className="btn btn-secondary text-xs"
                >
                  <Download className="w-3 h-3 inline mr-1" />
                  {t('tools.faviconGenerator.download')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
