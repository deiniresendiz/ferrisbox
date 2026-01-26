import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Star } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

type Base = 'binary' | 'octal' | 'decimal' | 'hexadecimal';

const baseValidation = {
  binary: /^[01-]+$/,
  octal: /^[0-7]+$/,
  decimal: /^-?\d+$/,
  hexadecimal: /^-?[0-9a-fA-F]+$/,
};

export const NumberBaseConverter: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [values, setValues] = useState({
    binary: '',
    octal: '',
    decimal: '',
    hexadecimal: '',
  });
  const [copied, setCopied] = useState('');

  const toolId = 'number-base-converter';
  const favorite = isFavorite(toolId);

  const handleBaseChange = (base: Base, newValue: string) => {
    setValues((prev) => ({ ...prev, [base]: newValue }));
    setCopied('');
  };

  const copyValue = async (base: Base) => {
    const value = values[base];
    if (value) {
      await navigator.clipboard.writeText(value);
      setCopied(base);
      setTimeout(() => setCopied(''), 2000);
    }
  };

  const clearAll = () => {
    setValues({
      binary: '',
      octal: '',
      decimal: '',
      hexadecimal: '',
    });
    setCopied('');
  };

  const toggleFavorite = () => {
    if (favorite) {
      removeFavorite(toolId);
    } else {
      addFavorite(toolId);
    }
  };

  const loadExample = (value: string) => {
    setValues({
      binary: '',
      octal: '',
      decimal: value,
      hexadecimal: '',
    });
  };

  const buttons = (
    <>
      <button onClick={clearAll} className="btn btn-secondary">
        {t('common.clear')}
      </button>
      <button
        onClick={() => loadExample('0')}
        className="px-3 py-1 text-sm bg-gray-100 dark:bg-space-700 rounded hover:bg-gray-200 dark:hover:bg-space-600 transition-colors"
      >
        {t('tools.numberBaseConverter.examples.zero')}
      </button>
      <button
        onClick={() => loadExample('255')}
        className="px-3 py-1 text-sm bg-gray-100 dark:bg-space-700 rounded hover:bg-gray-200 dark:hover:bg-space-600 transition-colors"
      >
        {t('tools.numberBaseConverter.examples.twoHundred')}
      </button>
      <button
        onClick={() => loadExample('1024')}
        className="px-3 py-1 text-sm bg-gray-100 dark:bg-space-700 rounded hover:bg-gray-200 dark:hover:bg-space-600 transition-colors"
      >
        {t('tools.numberBaseConverter.examples.oneThousand')}
      </button>
      <button
        onClick={() => loadExample('0xFF')}
        className="px-3 py-1 text-sm bg-gray-100 dark:bg-space-700 rounded hover:bg-gray-200 dark:hover:bg-space-600 transition-colors"
      >
        {t('tools.numberBaseConverter.examples.hex')}
      </button>
    </>
  );

  const inputRows = (['binary', 'octal', 'decimal', 'hexadecimal'] as Base[]).map((base) => (
    <div key={base} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t(`tools.numberBaseConverter.${base}`)}
        </label>
        {copied === base ? (
          <span className="text-sm text-rust-600 dark:text-rust-400">{t('common.copied')}</span>
        ) : null}
      </div>
      <button
        onClick={() => copyValue(base)}
        disabled={!values[base]}
        className="px-2 py-1 text-rust-500 dark:text-rust-400 disabled:text-gray-400 disabled:dark:text-gray-600 rounded"
      >
        <Copy className="w-4 h-4" />
      </button>
      <textarea
        value={values[base]}
        onChange={(e) => handleBaseChange(base, e.target.value)}
        placeholder={t(`tools.numberBaseConverter.placeholder.${base}`)}
        className={clsx(
          'w-full h-24 px-3 py-2 border rounded-md font-mono text-sm',
          baseValidation[base as keyof typeof baseValidation].test(values[base])
            ? 'border-gray-300 dark:border-space-600 bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-rust-500 focus:border-transparent'
            : 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-gray-100 focus:ring-red-500 focus:ring-red-200'
        )}
      />
    </div>
  ));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-space-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('tools.numberBaseConverter.name')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.numberBaseConverter.description')}
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

        {buttons}
        {inputRows}
      </div>
    </div>
  );
};
