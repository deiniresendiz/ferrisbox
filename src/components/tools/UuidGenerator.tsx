import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Copy, Check, Star, RefreshCw } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

type UuidVersion = 'v1' | 'v4' | 'v7';

export const UuidGenerator: React.FC = () => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [version, setVersion] = useState<UuidVersion>('v4');
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const toolId = 'uuid-generator';
  const favorite = isFavorite(toolId);

  const generateUuids = async () => {
    if (count === 1) {
      const uuid = await invoke<string>('generate_uuid_command', { version });
      setUuids([uuid]);
    } else {
      const generatedUuids = await invoke<string[]>('generate_multiple_uuids_command', {
        version,
        count,
      });
      setUuids(generatedUuids);
    }
  };

  const copyToClipboard = async () => {
    const text = uuids.join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyIndividual = async (uuid: string) => {
    await navigator.clipboard.writeText(uuid);
  };

  const toggleFavorite = () => {
    if (favorite) {
      removeFavorite(toolId);
    } else {
      addFavorite(toolId);
    }
  };

  const getVersionDescription = () => {
    switch (version) {
      case 'v1':
        return 'Time-based + MAC address. Oldest format, not cryptographically unique.';
      case 'v4':
        return 'Random UUID. Most common, cryptographically unique.';
      case 'v7':
        return 'Time-based + random. Sortable by creation time, recommended for new projects.';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            UUID Generator
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Generate universally unique identifiers (v1, v4, or v7)
          </p>
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

      <div className="mb-4 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Version
          </label>
          <select
            value={version}
            onChange={(e) => setVersion(e.target.value as UuidVersion)}
            className="w-full px-3 py-2 bg-white dark:bg-space-700 border border-gray-300 dark:border-space-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-rust-500"
          >
            <option value="v1">v1 (Time-based + MAC)</option>
            <option value="v4">v4 (Random)</option>
            <option value="v7">v7 (Timestamp-based)</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Count
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 bg-white dark:bg-space-700 border border-gray-300 dark:border-space-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-rust-500"
          />
        </div>

        <button onClick={generateUuids} className="btn btn-primary flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Generate
        </button>

        {uuids.length > 0 && (
          <button onClick={copyToClipboard} className="btn btn-secondary flex items-center gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy All'}
          </button>
        )}
      </div>

      {version === 'v1' && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>⚠️ UUID v1:</strong> Contains MAC address which can be used to identify the
            generating machine. Not recommended for privacy-sensitive applications.
          </p>
        </div>
      )}

      {version === 'v7' && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>UUID v7:</strong> {getVersionDescription()}
          </p>
        </div>
      )}

      {version === 'v4' && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            <strong>UUID v4:</strong> {getVersionDescription()}
          </p>
        </div>
      )}

      {uuids.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Generated UUIDs ({uuids.length})
          </label>
          <div className="space-y-2">
            {uuids.map((uuid, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-space-800 rounded-lg border border-gray-200 dark:border-space-600"
              >
                <span className="flex-1 font-mono text-sm text-gray-900 dark:text-gray-100">
                  {uuid}
                </span>
                <button
                  onClick={() => copyIndividual(uuid)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-space-700 rounded-lg transition-colors"
                  title="Copy"
                >
                  <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
