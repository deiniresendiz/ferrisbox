import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { Check, Copy, Star, CalendarClock } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

export const CronParser: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [expression, setExpression] = useState('');
  const [limit, setLimit] = useState(5);
  const [timezone, setTimezone] = useState('UTC');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const toolId = 'cron-parser';
  const favorite = isFavorite(toolId);

  const cronExamples = [
    { name: t('tools.cronParser.examplesList.everyMinute'), expression: '* * * *' },
    { name: t('tools.cronParser.examplesList.everyHour'), expression: '0 * * *' },
    { name: t('tools.cronParser.examplesList.dailyMidnight'), expression: '0 0 * *' },
    { name: t('tools.cronParser.examplesList.weeklySunday'), expression: '0 0 * * 0' },
    { name: t('tools.cronParser.examplesList.monthlyFirst'), expression: '0 0 1 *' },
    { name: t('tools.cronParser.examplesList.yearly'), expression: '@yearly' },
    { name: t('tools.cronParser.examplesList.monthly'), expression: '@monthly' },
    { name: t('tools.cronParser.examplesList.weekly'), expression: '@weekly' },
    { name: t('tools.cronParser.examplesList.daily'), expression: '@daily' },
    { name: t('tools.cronParser.examplesList.hourly'), expression: '@hourly' },
  ];

  const handleParse = async () => {
    if (!expression.trim()) {
      setError(t('tools.cronParser.invalidExpression'));
      setOutput('');
      return;
    }

    try {
      const result = await invoke<string>('parse_cron_command', {
        expression,
        limit,
        timezone: timezone === 'UTC' ? undefined : timezone,
      });
      setOutput(JSON.stringify(result, null, 2));
      setError('');
    } catch (err) {
      setError(String(err));
      setOutput('');
    }
  };

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setExpression('');
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

  const loadExample = (example: { name: string; expression: string }) => {
    setExpression(example.expression);
    setOutput('');
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-space-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('tools.cronParser.name')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.cronParser.description')}
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
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('tools.cronParser.expression')}
              </label>
              <input
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder={t('tools.cronParser.placeholder')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md font-mono text-sm bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-rust-500 focus:border-transparent"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('tools.cronParser.limit')}
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('tools.cronParser.timezone')}
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100"
              >
                <option value="UTC">{t('tools.cronParser.timezones.utc')}</option>
                <option value="Local">{t('tools.cronParser.timezones.local')}</option>
                <option value="America/New_York">{t('tools.cronParser.timezones.newYork')}</option>
                <option value="America/Los_Angeles">
                  {t('tools.cronParser.timezones.losAngeles')}
                </option>
                <option value="America/Chicago">{t('tools.cronParser.timezones.chicago')}</option>
                <option value="America/Denver">{t('tools.cronParser.timezones.denver')}</option>
                <option value="Europe/London">{t('tools.cronParser.timezones.london')}</option>
                <option value="Europe/Paris">{t('tools.cronParser.timezones.paris')}</option>
                <option value="Europe/Berlin">{t('tools.cronParser.timezones.berlin')}</option>
                <option value="Asia/Tokyo">{t('tools.cronParser.timezones.tokyo')}</option>
                <option value="Asia/Shanghai">{t('tools.cronParser.timezones.shanghai')}</option>
                <option value="Australia/Sydney">{t('tools.cronParser.timezones.sydney')}</option>
              </select>
            </div>

            <button onClick={handleParse} className="btn btn-primary ml-auto">
              <CalendarClock className="w-4 h-4" />
              {t('tools.cronParser.parse')}
            </button>

            <button onClick={clearAll} className="btn btn-secondary">
              {t('common.clear')}
            </button>

            {expression && (
              <button onClick={() => handleCopy(expression)} className="btn btn-secondary">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('common.copied') : t('common.copy')}
              </button>
            )}
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('tools.cronParser.examples')}:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {cronExamples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => loadExample(example)}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-space-700 rounded hover:bg-gray-200 dark:hover:bg-space-600 transition-colors"
                >
                  {example.name}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
              <p className="font-medium">{t('tools.cronParser.invalid')}:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('tools.cronParser.result')}
              </label>
              <div className="bg-white dark:bg-space-900 rounded-lg border border-gray-300 dark:border-space-600 p-4 min-h-[200px]">
                {error ? (
                  <p className="text-red-600 dark:text-red-400 font-mono text-sm">{error}</p>
                ) : (
                  <pre className="text-sm text-gray-700 dark:text-gray-100 whitespace-pre-wrap break-all">
                    {output}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
