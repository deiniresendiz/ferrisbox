import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Star, Image as ImageIcon } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

export const Base64Image: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [dataUrl, setDataUrl] = useState('');
  const [preview, setPreview] = useState('');
  const [fileInfo, setFileInfo] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const toolId = 'base64-image';
  const favorite = isFavorite(toolId);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setDataUrl(result);
      setPreview(result);
      setFileInfo(`${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
      setError('');
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  const handlePreview = () => {
    if (dataUrl) {
      try {
        // Validate it's a data URL
        if (dataUrl.startsWith('data:image/')) {
          setPreview(dataUrl);
          setError('');

          // Calculate size
          const size = new Blob([dataUrl]).size;
          setFileInfo(`Data URL (${(size / 1024).toFixed(2)} KB)`);
        } else {
          setError('Invalid data URL format. Must start with "data:image/"');
          setPreview('');
        }
      } catch (err) {
        setError(String(err));
        setPreview('');
      }
    }
  };

  const handleDownload = () => {
    if (!dataUrl) {
      setError('No image data to download');
      return;
    }

    try {
      // Extract MIME type and extension
      const mimeMatch = dataUrl.match(/data:(image\/\w+);base64,/);
      if (!mimeMatch) {
        setError('Invalid data URL format');
        return;
      }

      const mimeType = mimeMatch[1];
      const extension = mimeType.split('/')[1];

      // Create download link
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `image.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setFileInfo(`Downloaded as image.${extension}`);
      setError('');
    } catch (err) {
      setError(String(err));
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(dataUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setDataUrl('');
    setPreview('');
    setFileInfo('');
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
            {t('tools.base64Image.name')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{t('tools.base64Image.description')}</p>
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
        <label className="btn btn-primary cursor-pointer">
          <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          {t('tools.base64Image.selectFile', 'Select Image')}
        </label>

        <button onClick={handlePreview} className="btn btn-secondary">
          {t('tools.base64Image.preview', 'Preview from Data URL')}
        </button>

        <button onClick={handleDownload} className="btn btn-secondary" disabled={!dataUrl}>
          {t('tools.base64Image.download', 'Download Image')}
        </button>

        <button onClick={clearAll} className="btn btn-secondary">
          {t('common.clear')}
        </button>

        {dataUrl && (
          <button onClick={copyToClipboard} className="btn btn-secondary flex items-center gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? t('common.copied') : t('common.copy')}
          </button>
        )}
      </div>

      {/* File Info */}
      {fileInfo && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-300">✓ {fileInfo}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-300">✗ {error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tools.base64Image.preview', 'Preview')}
          </label>
          <div className="w-full h-96 border-2 border-dashed border-gray-300 dark:border-space-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-space-800 overflow-hidden">
            {preview ? (
              <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="text-center text-gray-400 dark:text-gray-500">
                <ImageIcon className="w-16 h-16 mx-auto mb-2" />
                <p className="text-sm">{t('tools.base64Image.noImage', 'No image selected')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Data URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tools.base64Image.dataUrl', 'Data URL (Base64)')}
          </label>
          <textarea
            value={dataUrl}
            onChange={(e) => setDataUrl(e.target.value)}
            placeholder={t(
              'tools.base64Image.placeholder',
              'data:image/png;base64,iVBORw0KGgo... or select an image file'
            )}
            className="w-full h-96 font-mono text-xs input resize-none"
          />
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          ℹ️{' '}
          {t(
            'tools.base64Image.info',
            'Select an image file to encode to Base64, or paste a Base64 data URL to preview and download'
          )}
        </p>
      </div>
    </div>
  );
};
