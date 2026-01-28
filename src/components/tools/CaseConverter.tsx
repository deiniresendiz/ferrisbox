import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { Copy, Star } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

export const CaseConverter: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [input, setInput] = useState('');
  const [targetCase, setTargetCase] = useState('camel');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const toolId = 'case-converter';
  const favorite = isFavorite(toolId);

  const handleConvert = async () => {
    if (!input.trim()) {
      setOutput('');
      return;
    }

    try {
      const result = await invoke<string>('convert_case_command', {
        text: input,
        targetCase,
      });
      setOutput(result);
      setError('');
    } catch (err) {
      setError(String(err));
      setOutput('');
    }
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
              {t('tools.caseConverter.name')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.caseConverter.description')}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('tools.caseConverter.input')}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100"
                placeholder={t('tools.caseConverter.placeholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('tools.caseConverter.output')}
              </label>
              <textarea
                readOnly
                value={output}
                className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md bg-gray-50 dark:bg-space-900 text-gray-900 dark:text-gray-100"
                placeholder={t('tools.caseConverter.outputPlaceholder')}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={targetCase}
              onChange={(e) => setTargetCase(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100"
            >
              <option value="camel">{t('tools.caseConverter.camel')}</option>
              <option value="snake">{t('tools.caseConverter.snake')}</option>
              <option value="pascal">{t('tools.caseConverter.pascal')}</option>
              <option value="constant">{t('tools.caseConverter.constant')}</option>
              <option value="kebab">{t('tools.caseConverter.kebab')}</option>
              <option value="title">{t('tools.caseConverter.title')}</option>
              <option value="train">{t('tools.caseConverter.train')}</option>
              <option value="lower">{t('tools.caseConverter.lower')}</option>
              <option value="upper">{t('tools.caseConverter.upper')}</option>
            </select>

            <button onClick={handleConvert} className="btn btn-primary">
              {t('tools.caseConverter.convert')}
            </button>

            {output && (
              <button onClick={handleCopy} className="btn btn-secondary flex items-center gap-2">
                <Copy className="w-4 h-4" />
                {copied ? t('common.copied') : t('common.copy')}
              </button>
            )}
          </div>

          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </div>
      </div>
    </div>
  );
};
