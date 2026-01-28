import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Star, ArrowDownAZ, ArrowUpAZ, Shuffle } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

export const ListSorter: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const toolId = 'list-sorter';
  const favorite = isFavorite(toolId);

  const getLines = () => input.split(/\r?\n/);

  const handleSort = (
    type: 'asc' | 'desc' | 'natural' | 'length' | 'shuffle' | 'reverse' | 'unique'
  ) => {
    let lines = getLines();

    switch (type) {
      case 'asc':
        lines.sort();
        break;
      case 'desc':
        lines.sort().reverse();
        break;
      case 'natural':
        lines.sort(new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare);
        break;
      case 'length':
        lines.sort((a, b) => a.length - b.length);
        break;
      case 'reverse':
        lines.reverse();
        break;
      case 'shuffle':
        lines = lines.sort(() => Math.random() - 0.5);
        break;
      case 'unique':
        lines = [...new Set(lines)];
        break;
    }

    setOutput(lines.join('\n'));
  };

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
              {t('tools.listSorter.name')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.listSorter.description')}
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
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleSort('asc')} className="btn btn-secondary">
              <ArrowDownAZ className="w-4 h-4 mr-2" /> {t('tools.listSorter.sortAz')}
            </button>
            <button onClick={() => handleSort('desc')} className="btn btn-secondary">
              <ArrowUpAZ className="w-4 h-4 mr-2" /> {t('tools.listSorter.sortZa')}
            </button>
            <button onClick={() => handleSort('natural')} className="btn btn-secondary">
              {t('tools.listSorter.sortNatural')}
            </button>
            <button onClick={() => handleSort('length')} className="btn btn-secondary">
              {t('tools.listSorter.sortLength')}
            </button>
            <button onClick={() => handleSort('reverse')} className="btn btn-secondary">
              {t('tools.listSorter.reverse')}
            </button>
            <button onClick={() => handleSort('shuffle')} className="btn btn-secondary">
              <Shuffle className="w-4 h-4 mr-2" /> {t('tools.listSorter.shuffle')}
            </button>
            <button onClick={() => handleSort('unique')} className="btn btn-primary">
              {t('tools.listSorter.removeDuplicates')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('tools.listSorter.input')}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
                placeholder={t('tools.listSorter.placeholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('tools.listSorter.output')}
              </label>
              <textarea
                readOnly
                value={output}
                className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md bg-gray-50 dark:bg-space-900 text-gray-900 dark:text-gray-100 font-mono text-sm"
              />
            </div>
          </div>

          {output && (
            <div className="flex justify-end">
              <button onClick={handleCopy} className="btn btn-secondary flex items-center gap-2">
                <Copy className="w-4 h-4" />
                {copied ? t('common.copied') : t('common.copy')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
