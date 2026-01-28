import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

export const WordCounter: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [text, setText] = useState('');

  const toolId = 'word-counter';
  const favorite = isFavorite(toolId);

  const stats = useMemo(() => {
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const lines = text === '' ? 0 : text.split(/\r\n|\r|\n/).length;
    const paragraphs =
      text === '' ? 0 : text.split(/\n\s*\n/).filter((p) => p.trim() !== '').length;
    const readingTime = Math.ceil(words / 200); // 200 wpm

    return { chars, charsNoSpaces, words, lines, paragraphs, readingTime };
  }, [text]);

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
              {t('tools.wordCounter.name')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.wordCounter.description')}
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

        <div className="space-y-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100 font-mono"
            placeholder={t('tools.wordCounter.placeholder')}
          />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-space-900 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-rust-600 dark:text-rust-400">
                {stats.words}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('tools.wordCounter.words')}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-space-900 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-rust-600 dark:text-rust-400">
                {stats.chars}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('tools.wordCounter.chars')}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-space-900 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-rust-600 dark:text-rust-400">
                {stats.charsNoSpaces}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('tools.wordCounter.charsNoSpaces')}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-space-900 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-rust-600 dark:text-rust-400">
                {stats.lines}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('tools.wordCounter.lines')}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-space-900 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-rust-600 dark:text-rust-400">
                {stats.paragraphs}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('tools.wordCounter.paragraphs')}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-space-900 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-rust-600 dark:text-rust-400">
                ~{stats.readingTime}m
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('tools.wordCounter.readingTime')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
