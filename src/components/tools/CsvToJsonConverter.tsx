import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Star } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

type Delimiter = 'auto' | 'comma' | 'semicolon' | 'tab' | 'pipe';

export const CsvToJsonConverter: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [delimiter, setDelimiter] = useState<Delimiter>('auto');
  const [hasHeader, setHasHeader] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const toolId = 'csv-to-json-converter';
  const favorite = isFavorite(toolId);

  const handleConvert = async () => {
    if (!input.trim()) {
      setError(t('tools.csvToJsonConverter.emptyInput'));
      setOutput('');
      return;
    }

    try {
      let delimiterArg: string | undefined;
      switch (delimiter) {
        case 'auto':
          delimiterArg = undefined;
          break;
        case 'comma':
          delimiterArg = ',';
          break;
        case 'semicolon':
          delimiterArg = ';';
          break;
        case 'tab':
          delimiterArg = '\t';
          break;
        case 'pipe':
          delimiterArg = '|';
          break;
      }

      const result = await invoke<string>('csv_to_json_command', {
        csv: input,
        delimiter: delimiterArg,
        hasHeader,
      });
      setOutput(result);
      setError('');
    } catch (err) {
      setError(String(err));
      setOutput('');
    }
  };

  const handleCopy = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const toggleFavorite = () => {
    if (favorite) {
      removeFavorite(toolId);
    } else {
      addFavorite(toolId);
    }
  };

  const loadExample = (type: 'simple' | 'withHeader' | 'excel') => {
    const examples = {
      simple: `name,age
John,30
Jane,25`,
      withHeader: `name,age
John,30
Jane,25`,
      excel: `id,name,age,salary
1,John Doe,30,50000
2,Jane Smith,25,45000`,
    };
    setInput(examples[type]);
    setOutput('');
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-space-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('tools.csvToJsonConverter.name')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.csvToJsonConverter.description')}
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
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tools.csvToJsonConverter.delimiter')}:
              </label>
              <select
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value as Delimiter)}
                className="px-3 py-1 border border-gray-300 dark:border-space-600 rounded-md bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100"
              >
                <option value="auto">{t('tools.csvToJsonConverter.autoDetect')}</option>
                <option value="comma">{t('tools.csvToJsonConverter.comma')}</option>
                <option value="semicolon">{t('tools.csvToJsonConverter.semicolon')}</option>
                <option value="tab">{t('tools.csvToJsonConverter.tab')}</option>
                <option value="pipe">{t('tools.csvToJsonConverter.pipe')}</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasHeader"
                checked={hasHeader}
                onChange={(e) => setHasHeader(e.target.checked)}
                className="w-4 h-4 text-rust-500 dark:text-rust-400 rounded"
              />
              <label
                htmlFor="hasHeader"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('tools.csvToJsonConverter.firstRowHeader')}
              </label>
            </div>

            <button onClick={handleConvert} className="btn btn-primary ml-auto">
              {t('tools.csvToJsonConverter.convert')}
            </button>

            <button onClick={clearAll} className="btn btn-secondary">
              {t('common.clear')}
            </button>

            {output && (
              <button onClick={handleCopy} className="btn btn-secondary flex items-center gap-2">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('common.copied') : t('common.copy')}
              </button>
            )}
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('tools.csvToJsonConverter.examples')}:
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => loadExample('simple')}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-space-700 rounded hover:bg-gray-200 dark:hover:bg-space-600 transition-colors"
              >
                {t('tools.csvToJsonConverter.examplesList.simple')}
              </button>
              <button
                onClick={() => loadExample('withHeader')}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-space-700 rounded hover:bg-gray-200 dark:hover:bg-space-600 transition-colors"
              >
                {t('tools.csvToJsonConverter.examplesList.withHeader')}
              </button>
              <button
                onClick={() => loadExample('excel')}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-space-700 rounded hover:bg-gray-200 dark:hover:bg-space-600 transition-colors"
              >
                {t('tools.csvToJsonConverter.examplesList.excel')}
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tools.csvToJsonConverter.input')}
                </label>
              </div>
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setOutput('');
                  setError('');
                }}
                placeholder={t('tools.csvToJsonConverter.placeholder')}
                className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md font-mono text-sm bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-rust-500 focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tools.csvToJsonConverter.output')}
                </label>
              </div>
              {error ? (
                <div className="w-full h-96 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 font-mono text-sm">{error}</p>
                </div>
              ) : (
                <textarea
                  value={output}
                  readOnly
                  placeholder={t('tools.csvToJsonConverter.outputPlaceholder')}
                  className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md font-mono text-sm bg-gray-50 dark:bg-space-900 text-gray-900 dark:text-gray-100"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
