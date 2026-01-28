import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Star, Download, Copy } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import { invoke } from '@tauri-apps/api/core';
import clsx from 'clsx';

type ImageFormat = 'png' | 'jpeg' | 'webp';

interface CompressionStats {
  original_size: number;
  compressed_size: number;
  savings_bytes: number;
  savings_percent: number;
  dimensions: [number, number];
}

export const ImageCompressor: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [originalDataUrl, setOriginalDataUrl] = useState('');
  const [compressedDataUrl, setCompressedDataUrl] = useState('');
  const [format, setFormat] = useState<ImageFormat>('jpeg');
  const [quality, setQuality] = useState(80);
  const [stats, setStats] = useState<CompressionStats | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toolId = 'image-compressor';
  const favorite = isFavorite(toolId);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setOriginalDataUrl(reader.result as string);
      setCompressedDataUrl('');
      setStats(null);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleCompress = async () => {
    if (!originalDataUrl) {
      setError(t('tools.imageCompressor.selectImageFirst'));
      return;
    }

    try {
      setError('');
      const result = await invoke<[string, CompressionStats]>('compress_image_command', {
        dataUrl: originalDataUrl,
        format,
        quality,
      });

      setCompressedDataUrl(result[0]);
      setStats(result[1]);
    } catch (err) {
      setError(String(err));
      setCompressedDataUrl('');
      setStats(null);
    }
  };

  const downloadCompressed = () => {
    if (!compressedDataUrl) return;

    const link = document.createElement('a');
    link.href = compressedDataUrl;
    link.download = `compressed.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(compressedDataUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setOriginalDataUrl('');
    setCompressedDataUrl('');
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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalDataUrl(reader.result as string);
        setCompressedDataUrl('');
        setStats(null);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('tools.imageCompressor.name')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('tools.imageCompressor.description')}
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
            {t('tools.imageCompressor.format')}
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as ImageFormat)}
            className="input"
          >
            <option value="png">{t('tools.imageCompressor.formats.png')}</option>
            <option value="jpeg">{t('tools.imageCompressor.formats.jpeg')}</option>
            <option value="webp">{t('tools.imageCompressor.formats.webp')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tools.imageCompressor.quality')}: {quality}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tools.imageCompressor.original')}
          </label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={clsx(
              'w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors',
              originalDataUrl
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-space-600 hover:border-gray-400'
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            {originalDataUrl ? (
              <img src={originalDataUrl} alt="Original" className="max-h-full object-contain" />
            ) : (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {t('tools.imageCompressor.input')}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {t('tools.imageCompressor.dragDropOrClick')}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tools.imageCompressor.compressed')}
          </label>
          <div className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-space-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-space-800">
            {compressedDataUrl ? (
              <img src={compressedDataUrl} alt="Compressed" className="max-h-full object-contain" />
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {t('tools.imageCompressor.compressedWillAppear')}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        <button onClick={handleCompress} className="btn btn-primary" disabled={!originalDataUrl}>
          {t('tools.imageCompressor.compress')}
        </button>

        {compressedDataUrl && (
          <button
            onClick={downloadCompressed}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {t('tools.imageCompressor.download')}
          </button>
        )}

        {compressedDataUrl && (
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
            <Download className="w-4 h-4 inline mr-2" />
            {t('tools.imageCompressor.stats', {
              original: formatBytes(stats.original_size),
              compressed: formatBytes(stats.compressed_size),
              savings: stats.savings_percent.toFixed(1),
            })}
            <br />
            <span className="text-xs">
              Dimensions: {stats.dimensions[0]} x {stats.dimensions[1]} px
            </span>
          </p>
        </div>
      )}
    </div>
  );
};
