import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Star } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';
import figlet from 'figlet';
// Import standard font synchronously to ensure it's available
import standard from 'figlet/importable-fonts/Standard.js';

export const AsciiArtGenerator: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [input, setInput] = useState('FerrisBox');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const toolId = 'ascii-art';
  const favorite = isFavorite(toolId);

  useEffect(() => {
    try {
      if (standard) {
        figlet.parseFont('Standard', standard);
      }
    } catch (err) {
      console.error('Failed to parse figlet font:', err);
    }
  }, []);

  useEffect(() => {
    if (!input) {
      setOutput('');
      return;
    }

    const hasGenerated = { value: false };

    figlet.text(input, { font: 'Standard' }, (err, result) => {
      if (hasGenerated.value) return;
      hasGenerated.value = true;

      if (err) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        setError(err.message);
        setOutput('');
        return;
      }
      // eslint-disable-next-line react-hooks/rules-of-hooks
      setOutput(result || '');
    });

    return () => {
      hasGenerated.value = true;
    };
  }, [input]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      <div className="bg-white dark:bg-space-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('tools.asciiArt.name')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.asciiArt.description')}
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
          >
            <Star className={clsx('w-6 h-6', favorite && 'fill-current')} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('tools.asciiArt.input')}
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100"
              placeholder={t('tools.asciiArt.placeholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('tools.asciiArt.output')}
            </label>
            <pre className="w-full overflow-x-auto p-4 border border-gray-300 dark:border-space-600 rounded-md bg-gray-900 text-green-400 font-mono text-sm leading-none">
              {output}
            </pre>
          </div>

          {output && (
            <div className="flex justify-end">
              <button onClick={handleCopy} className="btn btn-secondary flex items-center gap-2">
                <Copy className="w-4 h-4" />
                {copied ? t('common.copied') : t('common.copy')}
              </button>
            </div>
          )}

          {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
      </div>
    </div>
  );
};
