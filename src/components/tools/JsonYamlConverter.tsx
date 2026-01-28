import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { Copy, Check, ArrowLeft, Star } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

type ConversionMode = 'jsonToYaml' | 'yamlToJson';

export const JsonYamlConverter: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<ConversionMode>('jsonToYaml');
  const [indent, setIndent] = useState(2);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const toolId = 'json-yaml-converter';
  const favorite = isFavorite(toolId);

  const handleConvert = async () => {
    if (!input.trim()) {
      setError(t('tools.jsonYamlConverter.invalidInput'));
      setOutput('');
      return;
    }

    try {
      let result: string;
      if (mode === 'jsonToYaml') {
        result = await invoke<string>('json_to_yaml_command', {
          json: input,
          indent,
        });
      } else {
        result = await invoke<string>('yaml_to_json_command', {
          yaml: input,
          indent,
        });
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

  const loadExample = (type: 'simple' | 'nested' | 'docker') => {
    const examples = {
      simple: `{
  "name": "John Doe",
  "age": 30,
  "city": "New York",
  "skills": ["JavaScript", "Python", "Rust"]
}`,
      nested: `{
  "users": [
    {
      "id": 1,
      "name": "Alice",
      "roles": ["admin"]
    },
    {
      "id": 2,
      "name": "Bob",
      "roles": ["user"]
    }
  ]
}`,
      docker: `apiVersion: v1
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
    - metrics`,
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
              {t('tools.jsonYamlConverter.name')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.jsonYamlConverter.description')}
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

        {/* Mode Toggle */}
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          <div className="flex bg-gray-100 dark:bg-space-700 rounded-lg p-1">
            <button
              onClick={() => setMode('jsonToYaml')}
              className={clsx(
                'px-4 py-2 rounded-md transition-colors whitespace-nowrap flex items-center gap-2',
                mode === 'jsonToYaml'
                  ? 'bg-white dark:bg-space-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              )}
            >
              <span>JSON</span>
              <ArrowLeft className="w-4 h-4" />
              <span>YAML</span>
            </button>
            <button
              onClick={() => setMode('yamlToJson')}
              className={clsx(
                'px-4 py-2 rounded-md transition-colors whitespace-nowrap flex items-center gap-2',
                mode === 'yamlToJson'
                  ? 'bg-white dark:bg-space-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              )}
            >
              <span>YAML</span>
              <ArrowLeft className="w-4 h-4 transform rotate-180" />
              <span>JSON</span>
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <select
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100"
            >
              <option value={2}>{t('tools.jsonYamlConverter.twoSpaces')}</option>
              <option value={4}>{t('tools.jsonYamlConverter.fourSpaces')}</option>
            </select>

            <button onClick={handleConvert} className="btn btn-primary">
              {t('tools.jsonYamlConverter.convert')}
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
        </div>

        {/* Examples */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {t('tools.jsonYamlConverter.examples')}:
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => loadExample('simple')}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-space-700 rounded hover:bg-gray-200 dark:hover:bg-space-600 transition-colors"
            >
              {t('tools.jsonYamlConverter.examplesList.simple')}
            </button>
            <button
              onClick={() => loadExample('nested')}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-space-700 rounded hover:bg-gray-200 dark:hover:bg-space-600 transition-colors"
            >
              {t('tools.jsonYamlConverter.examplesList.nested')}
            </button>
            <button
              onClick={() => loadExample('docker')}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-space-700 rounded hover:bg-gray-200 dark:hover:bg-space-600 transition-colors"
            >
              {t('tools.jsonYamlConverter.examplesList.docker')}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Input/Output Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {mode === 'jsonToYaml'
                ? t('tools.jsonYamlConverter.jsonInput')
                : t('tools.jsonYamlConverter.yamlInput')}
            </label>
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setOutput('');
                setError('');
              }}
              placeholder={
                mode === 'jsonToYaml'
                  ? t('tools.jsonYamlConverter.jsonPlaceholder')
                  : t('tools.jsonYamlConverter.yamlPlaceholder')
              }
              className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md font-mono text-sm bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-rust-500 focus:border-transparent"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {mode === 'jsonToYaml'
                  ? t('tools.jsonYamlConverter.yamlOutput')
                  : t('tools.jsonYamlConverter.jsonOutput')}
              </label>
              {output && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-sm text-rust-600 dark:text-rust-400 hover:text-rust-700 dark:hover:text-rust-300"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      {t('tools.jsonYamlConverter.copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      {t('tools.jsonYamlConverter.copy')}
                    </>
                  )}
                </button>
              )}
            </div>
            {error ? (
              <div className="w-full h-96 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 font-mono text-sm">{error}</p>
              </div>
            ) : (
              <textarea
                value={output}
                readOnly
                placeholder={
                  mode === 'jsonToYaml'
                    ? t('tools.jsonYamlConverter.yamlOutputPlaceholder')
                    : t('tools.jsonYamlConverter.jsonOutputPlaceholder')
                }
                className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md font-mono text-sm bg-gray-50 dark:bg-space-900 text-gray-900 dark:text-gray-100"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
