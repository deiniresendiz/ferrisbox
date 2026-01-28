import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { Search, Star } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

interface DnsRecord {
  record_type: string;
  value: string;
}

export const DnsLookup: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [domain, setDomain] = useState('');
  const [recordType, setRecordType] = useState('A');
  const [results, setResults] = useState<DnsRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toolId = 'dns-lookup';
  const favorite = isFavorite(toolId);

  const handleLookup = async () => {
    if (!domain) return;
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const data = await invoke<DnsRecord[]>('dns_lookup_command', {
        domain,
        recordType,
      });
      setResults(data);
      if (data.length === 0) setError(t('tools.dnsLookup.noRecords'));
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
              {t('tools.dnsLookup.name')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.dnsLookup.description')}
            </p>
          </div>
          <button
            onClick={toggleFavorite}
            className={clsx('p-2 rounded-lg', favorite ? 'text-yellow-500' : 'text-gray-400')}
          >
            <Star className={clsx('w-6 h-6', favorite && 'fill-current')} />
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100"
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            />
          </div>
          <select
            value={recordType}
            onChange={(e) => setRecordType(e.target.value)}
            className="w-32 px-3 py-2 border border-gray-300 dark:border-space-600 rounded-md bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100"
          >
            {['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS'].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button
            onClick={handleLookup}
            disabled={loading || !domain}
            className="btn btn-primary flex items-center gap-2"
          >
            {loading ? (
              <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {t('tools.dnsLookup.lookup')}
          </button>
        </div>

        {error && (
          <div className="text-red-500 mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded">{error}</div>
        )}

        <div className="space-y-2">
          {results.map((record, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-space-900 rounded-lg border border-gray-100 dark:border-space-700"
            >
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-bold w-16 text-center">
                  {record.record_type}
                </span>
                <span className="font-mono text-gray-800 dark:text-gray-200 break-all">
                  {record.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
