import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { Copy, HardDrive, Star } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

type UnitType = 'data' | 'time' | 'frequency';

export const UnitsConverter: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [unitType, setUnitType] = useState<UnitType>('data');
  const [value, setValue] = useState('0');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const toolId = 'units-converter';
  const favorite = isFavorite(toolId);

  const getUnits = (type: UnitType) => {
    switch (type) {
      case 'data':
        return [
          { value: 'B', label: 'B' },
          { value: 'KiB', label: 'KiB' },
          { value: 'MiB', label: 'MiB' },
          { value: 'GiB', label: 'GiB' },
          { value: 'TiB', label: 'TiB' },
          { value: 'KB', label: 'KB' },
          { value: 'MB', label: 'MB' },
          { value: 'GB', label: 'GB' },
          { value: 'TB', label: 'TB' },
        ];
      case 'time':
        return [
          { value: 'ms', label: 'ms' },
          { value: 's', label: 's' },
          { value: 'min', label: 'min' },
          { value: 'h', label: 'h' },
          { value: 'day', label: 'day' },
        ];
      case 'frequency':
        return [
          { value: 'Hz', label: 'Hz' },
          { value: 'kHz', label: 'kHz' },
          { value: 'MHz', label: 'MHz' },
          { value: 'GHz', label: 'GHz' },
        ];
      default:
        return [];
    }
  };

  const units = getUnits(unitType);

  const handleConvert = async () => {
    if (!value || value === '0') {
      setError(t('tools.unitsConverter.invalidInput'));
      setOutput('');
      return;
    }

    try {
      let result: string;
      switch (unitType) {
        case 'data':
          result = await invoke<string>('convert_data_units_command', {
            value: parseFloat(value),
            fromUnit,
            toUnit,
          });
          break;
        case 'time':
          result = await invoke<string>('convert_time_units_command', {
            value: parseFloat(value),
            fromUnit,
            toUnit,
          });
          break;
        case 'frequency':
          result = await invoke<string>('convert_frequency_units_command', {
            value: parseFloat(value),
            fromUnit,
            toUnit,
          });
          break;
        default:
          result = '';
          break;
      }
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
    setValue('0');
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

  const loadExample = (type: 'data' | 'time' | 'frequency', value: string) => {
    setValue(value);
    setOutput('');
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-space-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('tools.unitsConverter.name')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.unitsConverter.description')}
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

        <div className="mb-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <button
                onClick={() => setUnitType('data')}
                className={clsx(
                  'px-4 py-2 rounded-md transition-colors',
                  unitType === 'data'
                    ? 'bg-white dark:bg-space-600 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                )}
              >
                {t('tools.unitsConverter.data')}
              </button>
              <button
                onClick={() => setUnitType('time')}
                className={clsx(
                  'px-4 py-2 rounded-md transition-colors',
                  unitType === 'time'
                    ? 'bg-white dark:bg-space-600 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                )}
              >
                {t('tools.unitsConverter.time')}
              </button>
              <button
                onClick={() => setUnitType('frequency')}
                className={clsx(
                  'px-4 py-2 rounded-md transition-colors',
                  unitType === 'frequency'
                    ? 'bg-white dark:bg-space-600 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                )}
              >
                {t('tools.unitsConverter.frequency')}
              </button>
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tools.unitsConverter.value')}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-rust-500 focus:border-transparent"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tools.unitsConverter.from')}
              </label>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100"
              >
                {units.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tools.unitsConverter.to')}
              </label>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100"
              >
                {units.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button onClick={handleConvert} className="btn btn-primary">
          {t('tools.unitsConverter.convert')}
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
          {t('tools.unitsConverter.binaryNote')}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('tools.unitsConverter.decimalNote')}
        </p>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {t('tools.unitsConverter.examples')}:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => loadExample('data', '1')}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-space-700 rounded hover:bg-gray-200 dark:hover:bg-space-600 transition-colors"
          >
            {t('tools.unitsConverter.examples.oneKb')}
          </button>
          <button
            onClick={() => loadExample('data', '1024')}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-space-700 rounded hover:bg-gray-200 dark:hover:bg-space-600 transition-colors"
          >
            {t('tools.unitsConverter.examples.oneGb')}
          </button>
          <button
            onClick={() => loadExample('data', '1073741824')}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-space-700 rounded hover:bg-gray-200 dark:hover:bg-space-600 transition-colors"
          >
            {t('tools.unitsConverter.examples.oneTb')}
          </button>
          <button
            onClick={() => loadExample('time', '3600000')}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-space-700 rounded hover:bg-gray-200 dark:hover:bg-space-600 transition-colors"
          >
            {t('tools.unitsConverter.examples.oneHour')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tools.unitsConverter.input')}
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-rust-500 focus:border-transparent"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tools.unitsConverter.result')}
            </label>
            {error ? (
              <div className="w-full h-24 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 font-mono text-sm">{error}</p>
              </div>
            ) : (
              <textarea
                value={output}
                readOnly
                placeholder={t('tools.unitsConverter.outputPlaceholder')}
                className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md font-mono text-sm bg-gray-50 dark:bg-space-900 text-gray-900 dark:text-gray-100"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
