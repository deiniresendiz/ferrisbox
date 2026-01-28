import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { Copy, Star, RefreshCw, Globe, Wifi } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

interface LocalIpInfo {
  local_ip: string;
}

export const IpInfo: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [localIp, setLocalIp] = useState<string>('');
  const [publicIp, setPublicIp] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toolId = 'ip-info';
  const favorite = isFavorite(toolId);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Local IP from Backend
      const localResult = await invoke<LocalIpInfo>('get_local_ip_command');
      setLocalIp(localResult.local_ip);

      // Public IP from external API
      const response = await window.fetch('https://api.ipify.org?format=json');
      const data = (await response.json()) as { ip: string };
      setPublicIp(data.ip);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch IP information');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
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
              {t('tools.ipInfo.name')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{t('tools.ipInfo.description')}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title={t('common.refresh')}
            >
              <RefreshCw className={clsx('w-6 h-6', loading && 'animate-spin')} />
            </button>
            <button
              onClick={toggleFavorite}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                favorite
                  ? 'text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-500'
                  : 'text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400'
              )}
            >
              <Star className={clsx('w-6 h-6', favorite && 'fill-current')} />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Local IP */}
          <div className="bg-gray-50 dark:bg-space-900 p-6 rounded-xl border border-gray-200 dark:border-space-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Wifi className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('tools.ipInfo.localIp')}
              </h3>
            </div>
            <div className="flex items-center justify-between mt-4 bg-white dark:bg-space-800 p-3 rounded-lg border border-gray-200 dark:border-space-600">
              <span className="font-mono text-lg text-gray-800 dark:text-gray-200">
                {localIp || '...'}
              </span>
              <button
                onClick={() => handleCopy(localIp)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Public IP */}
          <div className="bg-gray-50 dark:bg-space-900 p-6 rounded-xl border border-gray-200 dark:border-space-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('tools.ipInfo.publicIp')}
              </h3>
            </div>
            <div className="flex items-center justify-between mt-4 bg-white dark:bg-space-800 p-3 rounded-lg border border-gray-200 dark:border-space-600">
              <span className="font-mono text-lg text-gray-800 dark:text-gray-200">
                {publicIp || '...'}
              </span>
              <button
                onClick={() => handleCopy(publicIp)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
