import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Star, Plus, Trash2 } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

interface ParsedUrl {
  original: string;
  scheme: string;
  host: string;
  port: number | null;
  path: string;
  query: string | null;
  fragment: string | null;
  username: string;
  password: string | null;
  query_params: QueryParam[];
}

interface QueryParam {
  key: string;
  value: string;
}

export const UrlParser: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [url, setUrl] = useState('');
  const [parsed, setParsed] = useState<ParsedUrl | null>(null);
  const [queryParams, setQueryParams] = useState<QueryParam[]>([]);
  const [rebuiltUrl, setRebuiltUrl] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const toolId = 'url-parser';
  const favorite = isFavorite(toolId);

  const handleParse = React.useCallback(async () => {
    if (!url.trim()) {
      setParsed(null);
      setQueryParams([]);
      setRebuiltUrl('');
      setError('');
      return;
    }

    try {
      const result = await invoke<ParsedUrl>('parse_url_command', { url });
      setParsed(result);
      setQueryParams(result.query_params || []);
      setRebuiltUrl(url); // Initially same as input
      setError('');
    } catch (err) {
      setError(String(err));
      setParsed(null);
      setQueryParams([]);
      setRebuiltUrl('');
    }
  }, [url]);

  const handleRebuild = React.useCallback(async () => {
    if (!url.trim() || !parsed) return;

    try {
      const result = await invoke<string>('update_query_params_command', {
        url: parsed.original,
        params: queryParams,
      });
      setRebuiltUrl(result);
      setError('');
    } catch (err) {
      setError(String(err));
    }
  }, [url, parsed, queryParams]);

  useEffect(() => {
    handleParse();
  }, [handleParse]);

  useEffect(() => {
    if (parsed) {
      handleRebuild();
    }
  }, [parsed, handleRebuild]);

  const addParam = () => {
    setQueryParams([...queryParams, { key: '', value: '' }]);
  };

  const removeParam = (index: number) => {
    setQueryParams(queryParams.filter((_, i) => i !== index));
  };

  const updateParam = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...queryParams];
    updated[index][field] = value;
    setQueryParams(updated);
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setUrl('');
    setParsed(null);
    setQueryParams([]);
    setRebuiltUrl('');
    setError('');
  };

  const toggleFavorite = () => {
    if (favorite) {
      removeFavorite(toolId);
    } else {
      addFavorite(toolId);
    }
  };

  const examples = [
    'https://example.com/path?foo=bar&baz=qux',
    'https://user:pass@api.example.com:8080/v1/users?limit=10&offset=0#results',
    'http://localhost:3000/dashboard?tab=settings',
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('tools.urlParser.name')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{t('tools.urlParser.description')}</p>
        </div>
        <button
          onClick={toggleFavorite}
          className={clsx(
            'p-2 rounded-lg transition-colors',
            favorite
              ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-space-500'
          )}
        >
          <Star className={clsx('w-5 h-5', favorite && 'fill-current')} />
        </button>
      </div>

      {/* Input Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('tools.urlParser.input')}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t('tools.urlParser.placeholder', 'Enter URL to parse...')}
            className="flex-1 input"
          />
          <button onClick={clearAll} className="btn btn-secondary">
            {t('common.clear')}
          </button>
        </div>

        {/* Examples */}
        <div className="mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {t('tools.urlParser.examples', 'Examples')}:
          </p>
          <div className="flex gap-2 flex-wrap">
            {examples.map((example, idx) => (
              <button
                key={idx}
                onClick={() => setUrl(example)}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-space-700 rounded hover:bg-gray-200 dark:hover:bg-space-600 transition-colors truncate max-w-md"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-300">✗ {error}</p>
        </div>
      )}

      {/* Parsed Components */}
      {parsed && (
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - URL Components */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('tools.urlParser.components', 'URL Components')}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('tools.urlParser.scheme', 'Scheme')}
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-space-800 rounded border border-gray-200 dark:border-space-600 font-mono text-sm">
                  {parsed.scheme}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('tools.urlParser.host', 'Host')}
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-space-800 rounded border border-gray-200 dark:border-space-600 font-mono text-sm">
                  {parsed.host}
                </div>
              </div>

              {parsed.port && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('tools.urlParser.port', 'Port')}
                  </label>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-space-800 rounded border border-gray-200 dark:border-space-600 font-mono text-sm">
                    {parsed.port}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('tools.urlParser.path', 'Path')}
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-space-800 rounded border border-gray-200 dark:border-space-600 font-mono text-sm">
                  {parsed.path}
                </div>
              </div>

              {parsed.fragment && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('tools.urlParser.fragment', 'Fragment')}
                  </label>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-space-800 rounded border border-gray-200 dark:border-space-600 font-mono text-sm">
                    #{parsed.fragment}
                  </div>
                </div>
              )}

              {parsed.username && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('tools.urlParser.credentials', 'Credentials')}
                  </label>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-space-800 rounded border border-gray-200 dark:border-space-600 font-mono text-sm">
                    {parsed.username}
                    {parsed.password && ':***'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Query Parameters Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('tools.urlParser.queryParams', 'Query Parameters')}
              </h3>
              <button onClick={addParam} className="btn btn-primary btn-sm flex items-center gap-1">
                <Plus className="w-4 h-4" />
                {t('tools.urlParser.addParam', 'Add')}
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {queryParams.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  {t('tools.urlParser.noParams', 'No query parameters')}
                </p>
              ) : (
                queryParams.map((param, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <input
                      type="text"
                      value={param.key}
                      onChange={(e) => updateParam(idx, 'key', e.target.value)}
                      placeholder={t('tools.urlParser.key', 'key')}
                      className="flex-1 input input-sm"
                    />
                    <input
                      type="text"
                      value={param.value}
                      onChange={(e) => updateParam(idx, 'value', e.target.value)}
                      placeholder={t('tools.urlParser.value', 'value')}
                      className="flex-1 input input-sm"
                    />
                    <button
                      onClick={() => removeParam(idx)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Rebuilt URL */}
            {rebuiltUrl && (
              <div className="mt-4">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('tools.urlParser.rebuiltUrl', 'Rebuilt URL')}
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800 font-mono text-sm break-all">
                    {rebuiltUrl}
                  </div>
                  <button
                    onClick={() => copyToClipboard(rebuiltUrl)}
                    className="btn btn-secondary btn-sm flex items-center gap-1"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
