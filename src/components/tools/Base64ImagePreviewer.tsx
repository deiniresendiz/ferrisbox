import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Star, Download, Eye } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import { invoke } from '@tauri-apps/api/core';
import clsx from 'clsx';

interface ImageInfo {
  is_valid: boolean;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  size_bytes: number;
  extension: string;
}

export const Base64ImagePreviewer: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [base64Input, setBase64Input] = useState('');
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const toolId = 'base64-image-previewer';
  const favorite = isFavorite(toolId);

  const handlePreview = async () => {
    if (!base64Input.trim()) {
      setError(t('tools.base64ImagePreviewer.enterBase64Code'));
      return;
    }

    try {
      setError('');
      const info = await invoke<ImageInfo>('validate_base64_image_command', {
        dataUrl: base64Input,
      });

      setImageInfo(info);

      if (info.is_valid) {
        setPreview(base64Input);
      } else {
        setPreview('');
      }
    } catch (err) {
      setError(String(err));
      setImageInfo(null);
      setPreview('');
    }
  };

  const downloadImage = () => {
    if (!preview || !imageInfo) return;

    const link = document.createElement('a');
    link.href = preview;
    link.download = `image.${imageInfo.extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(base64Input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setBase64Input('');
    setImageInfo(null);
    setPreview('');
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
            {t('tools.base64ImagePreviewer.name')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('tools.base64ImagePreviewer.description')}
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
          {t('tools.base64ImagePreviewer.input')}
        </label>
        <textarea
          value={base64Input}
          onChange={(e) => setBase64Input(e.target.value)}
          placeholder={t('tools.base64ImagePreviewer.placeholder')}
          className="w-full h-40 font-mono text-xs input resize-none"
        />
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        <button onClick={handlePreview} className="btn btn-primary">
          <Eye className="w-4 h-4 inline mr-2" />
          {t('tools.base64ImagePreviewer.preview')}
        </button>

        {base64Input && (
          <button onClick={copyToClipboard} className="btn btn-secondary flex items-center gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? t('common.copied') : t('common.copy')}
          </button>
        )}

        {preview && (
          <button onClick={downloadImage} className="btn btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            {t('tools.base64ImagePreviewer.download')}
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

      {imageInfo && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">
            {t('tools.base64ImagePreviewer.imageInformation')}
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">{t('tools.base64ImagePreviewer.info.type')}: </span>
              <span className="text-blue-800 dark:text-blue-300">
                {imageInfo.mime_type || 'Unknown'}
              </span>
            </div>
            <div>
              <span className="font-medium">{t('tools.base64ImagePreviewer.info.size')}: </span>
              <span className="text-blue-800 dark:text-blue-300">
                {formatBytes(imageInfo.size_bytes)}
              </span>
            </div>
            {imageInfo.width && imageInfo.height && (
              <div>
                <span className="font-medium">
                  {t('tools.base64ImagePreviewer.info.dimensions')}:{' '}
                </span>
                <span className="text-blue-800 dark:text-blue-300">
                  {imageInfo.width} x {imageInfo.height}
                </span>
              </div>
            )}
            <div>
              <span className="font-medium">Extension: </span>
              <span className="text-blue-800 dark:text-blue-300">{imageInfo.extension}</span>
            </div>
            <div>
              <span className="font-medium">{t('tools.base64ImagePreviewer.info.valid')}: </span>
              <span
                className={clsx(
                  imageInfo.is_valid
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                )}
              >
                {imageInfo.is_valid ? '✓ Valid' : '✗ Invalid'}
              </span>
            </div>
          </div>
        </div>
      )}

      {preview && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tools.base64ImagePreviewer.preview')}
          </label>
          <div className="w-full border-2 border-gray-300 dark:border-space-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-space-800 p-4">
            <img src={preview} alt="Preview" className="max-w-full max-h-96 object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
