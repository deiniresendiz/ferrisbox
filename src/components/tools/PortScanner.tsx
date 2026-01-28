import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { Play, Star, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

interface PortResult {
  port: number;
  status: string;
}

export const PortScanner: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [host, setHost] = useState('127.0.0.1');
  const [startPort, setStartPort] = useState(80);
  const [endPort, setEndPort] = useState(100);
  const [results, setResults] = useState<PortResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toolId = 'port-scanner';
  const favorite = isFavorite(toolId);

  const handleScan = async () => {
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const scanResults = await invoke<PortResult[]>('scan_ports_command', {
        host,
        startPort: Number(startPort),
        endPort: Number(endPort),
      });
      setResults(scanResults);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('tools.portScanner.name')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.portScanner.description')}
            </p>
          </div>
          <button
            onClick={toggleFavorite}
            className={clsx('p-2 rounded-lg', favorite ? 'text-yellow-500' : 'text-gray-400')}
          >
            <Star className={clsx('w-6 h-6', favorite && 'fill-current')} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Host
            </label>
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Port
            </label>
            <input
              type="number"
              value={startPort}
              onChange={(e) => setStartPort(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Port
            </label>
            <input
              type="number"
              value={endPort}
              onChange={(e) => setEndPort(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <button
          onClick={handleScan}
          disabled={loading}
          className="btn btn-primary w-full md:w-auto flex items-center justify-center gap-2 mb-6"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {t('tools.portScanner.scan')}
        </button>

        {error && (
          <div className="text-red-500 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {results.length === 0 && !loading && !error && (
            <div className="text-center text-gray-500 py-8">{t('tools.portScanner.noResults')}</div>
          )}
          {results.map((res) => (
            <div
              key={res.port}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-space-900 rounded-lg border border-gray-100 dark:border-space-700"
            >
              <span className="font-mono text-gray-700 dark:text-gray-300">Port {res.port}</span>
              <div className="flex items-center gap-2">
                {res.status === 'open' ? (
                  <span className="text-green-600 flex items-center gap-1 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Open
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center gap-1 text-sm">
                    <XCircle className="w-4 h-4" /> Closed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
