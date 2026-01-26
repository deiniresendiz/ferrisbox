import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Star, CheckCircle, XCircle } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

export const YamlFormatter: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indentSize, setIndentSize] = useState(2);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const toolId = 'yaml-formatter';
  const favorite = isFavorite(toolId);

  const handleFormat = async () => {
    if (!input.trim()) {
      setError(t('tools.yamlFormatter.emptyInput'));
      setOutput('');
      setIsValid(null);
      return;
    }

    try {
      const result = await invoke<string>('format_yaml_command', {
        input,
        indent: indentSize,
      });
      setOutput(result);
      setError('');
      setIsValid(true);
    } catch (err) {
      setError(String(err));
      setOutput('');
      setIsValid(false);
    }
  };

  const handleMinify = async () => {
    if (!input.trim()) {
      setError(t('tools.yamlFormatter.emptyInput'));
      setOutput('');
      setIsValid(null);
      return;
    }

    try {
      const result = await invoke<string>('minify_yaml_command', { input });
      setOutput(result);
      setError('');
      setIsValid(true);
    } catch (err) {
      setError(String(err));
      setOutput('');
      setIsValid(false);
    }
  };

  const handleValidate = async () => {
    if (!input.trim()) {
      setError(t('tools.yamlFormatter.emptyInput'));
      setIsValid(null);
      return;
    }

    try {
      await invoke<string>('validate_yaml_command', { input });
      setIsValid(true);
      setError('');
    } catch (err) {
      setError(String(err));
      setIsValid(false);
    }
  };

  const handleCopy = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExample = () => {
    const example = `apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: production
data:
  database:
    host: localhost
    port: 5432
    name: mydb
  cache:
    type: redis
    host: 127.0.0.1
    port: 6379
  features:
    - auth
    - logging
    - metrics
  rateLimits:
    requestsPerMinute: 60
    burstSize: 10
logging:
  level: info
  format: json
  output: stdout`;
    setInput(example);
    setOutput('');
    setError('');
    setIsValid(null);
  };

  const handleFavoriteToggle = () => {
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
              {t('tools.yamlFormatter.name')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.yamlFormatter.description')}
            </p>
          </div>
          <button
            onClick={handleFavoriteToggle}
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
          {/* Controls Row */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tools.yamlFormatter.indentSize')}:
              </label>
              <select
                value={indentSize}
                onChange={(e) => setIndentSize(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 dark:border-space-600 rounded-md bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100"
              >
                <option value={2}>2</option>
                <option value={4}>4</option>
              </select>
            </div>

            <button onClick={handleFormat} className="btn btn-primary">
              {t('tools.yamlFormatter.format')}
            </button>

            <button onClick={handleMinify} className="btn btn-secondary">
              {t('tools.yamlFormatter.minify')}
            </button>

            <button onClick={handleValidate} className="btn btn-secondary">
              {t('tools.yamlFormatter.validate')}
            </button>

            <button onClick={handleExample} className="btn btn-secondary">
              {t('tools.yamlFormatter.example')}
            </button>
          </div>

          {/* Validation Status */}
          {isValid !== null && (
            <div
              className={clsx(
                'flex items-center gap-2 p-3 rounded-md',
                isValid
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              )}
            >
              {isValid ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">{t('tools.yamlFormatter.validYaml')}</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">{t('tools.yamlFormatter.invalidYaml')}</span>
                </>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Input/Output Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('tools.yamlFormatter.input')}
              </label>
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setOutput('');
                  setError('');
                  setIsValid(null);
                }}
                placeholder={t('tools.yamlFormatter.placeholder')}
                className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md font-mono text-sm bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-rust-500 focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tools.yamlFormatter.output')}
                </label>
                {output && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-sm text-rust-600 dark:text-rust-400 hover:text-rust-700 dark:hover:text-rust-300"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        {t('tools.yamlFormatter.copied')}
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        {t('tools.yamlFormatter.copy')}
                      </>
                    )}
                  </button>
                )}
              </div>
              <textarea
                value={output}
                readOnly
                placeholder={t('tools.yamlFormatter.outputPlaceholder')}
                className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md font-mono text-sm bg-gray-50 dark:bg-space-900 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
