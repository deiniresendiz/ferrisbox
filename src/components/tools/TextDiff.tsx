import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Star, FileText } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';
import * as Diff from 'diff';

export const TextDiff: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [originalText, setOriginalText] = useState('');
  const [modifiedText, setModifiedText] = useState('');
  const [diff, setDiff] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [showSideBySide, setShowSideBySide] = useState(false);

  const toolId = 'text-diff';
  const favorite = isFavorite(toolId);

  const handleCompare = () => {
    const changes = Diff.diffLines(originalText, modifiedText);
    setDiff(changes);
  };

  const handleCopy = async () => {
    const diffText = diff
      .map((change: any) => {
        if (change.added) return `+${change.value}`;
        if (change.removed) return `-${change.value}`;
        return change.value;
      })
      .join('\n');

    await navigator.clipboard.writeText(diffText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setOriginalText('');
    setModifiedText('');
    setDiff([]);
    setCopied(false);
  };

  const toggleFavorite = () => {
    if (favorite) {
      removeFavorite(toolId);
    } else {
      addFavorite(toolId);
    }
  };

  const loadExample = () => {
    setOriginalText('Hello World\nThis is original text\nThird line of text');
    setModifiedText('Hello Rust\nThis is modified text\nThird line of text');
    setDiff([]);
  };

  const getChangeClass = (change: any) => {
    if (change.added) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
    if (change.removed) return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
    return '';
  };

  const countChanges = () => {
    const additions = diff.filter((d: any) => d.added).length;
    const deletions = diff.filter((d: any) => d.removed).length;
    const unchanged = diff.filter((d: any) => !d.added && !d.removed).length;
    return { additions, deletions, unchanged };
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-space-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('tools.textDiff.name')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.textDiff.description')}
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
            <button onClick={handleCompare} className="btn btn-primary">
              {t('tools.textDiff.compare')}
            </button>

            <button onClick={clearAll} className="btn btn-secondary">
              {t('common.clear')}
            </button>

            <button
              onClick={() => setShowSideBySide(!showSideBySide)}
              className={clsx('btn', showSideBySide ? 'btn-primary' : 'btn-secondary')}
            >
              {showSideBySide ? t('tools.textDiff.unified') : t('tools.textDiff.sideBySide')}
            </button>

            <button onClick={loadExample} className="btn btn-secondary">
              {t('tools.textDiff.example')}
            </button>

            {diff.length > 0 && (
              <button onClick={handleCopy} className="btn btn-secondary flex items-center gap-2">
                {copied ? <FileText className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('common.copied') : t('common.copy')}
              </button>
            )}
          </div>

          {diff.length > 0 && (
            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="text-green-600 dark:text-green-400">
                +{countChanges().additions} {t('tools.textDiff.additions')}
              </span>
              <span className="text-red-600 dark:text-red-400">
                -{countChanges().deletions} {t('tools.textDiff.deletions')}
              </span>
              <span>
                {countChanges().unchanged} {t('tools.textDiff.unchanged')}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('tools.textDiff.original')}
              </label>
              <textarea
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                placeholder={t('tools.textDiff.placeholder')}
                className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md font-mono text-sm bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-rust-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('tools.textDiff.modified')}
              </label>
              <textarea
                value={modifiedText}
                onChange={(e) => setModifiedText(e.target.value)}
                placeholder={t('tools.textDiff.placeholder')}
                className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md font-mono text-sm bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-rust-500 focus:border-transparent"
              />
            </div>
          </div>

          {diff.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('tools.textDiff.diff')}
              </label>
              {showSideBySide ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    {diff
                      .filter((d) => d.removed || (!d.added && !d.removed))
                      .map((change, i) => (
                        <div
                          key={`orig-${i}`}
                          className={clsx('px-2 py-1 font-mono text-sm', getChangeClass(change))}
                        >
                          {change.value}
                        </div>
                      ))}
                  </div>
                  <div className="space-y-1">
                    {diff
                      .filter((d) => d.added || (!d.added && !d.removed))
                      .map((change, i) => (
                        <div
                          key={`mod-${i}`}
                          className={clsx('px-2 py-1 font-mono text-sm', getChangeClass(change))}
                        >
                          {change.value}
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto bg-gray-50 dark:bg-space-900 rounded border border-gray-200 dark:border-space-700 p-4">
                  {diff.map((change, i) => (
                    <div
                      key={i}
                      className={clsx(
                        'px-2 py-1 font-mono text-sm whitespace-pre-wrap',
                        getChangeClass(change)
                      )}
                    >
                      {change.value}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
