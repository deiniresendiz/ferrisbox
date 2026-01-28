import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Search } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

const STATUS_CODES: Record<string, { code: number; title: string; desc: string }> = {
  '100': {
    code: 100,
    title: 'Continue',
    desc: 'The initial part of a request has been received and has not yet been rejected by the server.',
  },
  '200': { code: 200, title: 'OK', desc: 'The request has succeeded.' },
  '201': {
    code: 201,
    title: 'Created',
    desc: 'The request has been fulfilled and resulted in a new resource being created.',
  },
  '204': {
    code: 204,
    title: 'No Content',
    desc: 'The server successfully processed the request and is not returning any content.',
  },
  '301': {
    code: 301,
    title: 'Moved Permanently',
    desc: 'The requested resource has been assigned a new permanent URI.',
  },
  '302': {
    code: 302,
    title: 'Found',
    desc: 'The requested resource resides temporarily under a different URI.',
  },
  '304': {
    code: 304,
    title: 'Not Modified',
    desc: 'Indicates that the resource has not been modified since the version specified by the request headers.',
  },
  '400': {
    code: 400,
    title: 'Bad Request',
    desc: 'The server cannot or will not process the request due to an apparent client error.',
  },
  '401': {
    code: 401,
    title: 'Unauthorized',
    desc: 'Authentication is required and has failed or has not been yet provided.',
  },
  '403': {
    code: 403,
    title: 'Forbidden',
    desc: 'The request was valid, but the server is refusing action.',
  },
  '404': {
    code: 404,
    title: 'Not Found',
    desc: 'The requested resource could not be found but may be available in the future.',
  },
  '405': {
    code: 405,
    title: 'Method Not Allowed',
    desc: 'A request method is not supported for the requested resource.',
  },
  '429': {
    code: 429,
    title: 'Too Many Requests',
    desc: 'The user has sent too many requests in a given amount of time.',
  },
  '500': {
    code: 500,
    title: 'Internal Server Error',
    desc: 'A generic error message, given when an unexpected condition was encountered.',
  },
  '502': {
    code: 502,
    title: 'Bad Gateway',
    desc: 'The server was acting as a gateway or proxy and received an invalid response from the upstream server.',
  },
  '503': {
    code: 503,
    title: 'Service Unavailable',
    desc: 'The server is currently unavailable (overloaded or down for maintenance).',
  },
  '504': {
    code: 504,
    title: 'Gateway Timeout',
    desc: 'The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.',
  },
};

export const HttpStatusCodes: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [search, setSearch] = useState('');

  const toolId = 'http-status';
  const favorite = isFavorite(toolId);

  const filteredCodes = Object.values(STATUS_CODES).filter(
    (s) =>
      s.code.toString().includes(search) ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.desc.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFavorite = () => {
    if (favorite) {
      removeFavorite(toolId);
    } else {
      addFavorite(toolId);
    }
  };

  const getColor = (code: number) => {
    if (code >= 500) return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
    if (code >= 400)
      return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
    if (code >= 300) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
    if (code >= 200) return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-space-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('tools.httpStatus.name')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.httpStatus.description')}
            </p>
          </div>
          <button
            onClick={toggleFavorite}
            className={clsx('p-2 rounded-lg', favorite ? 'text-yellow-500' : 'text-gray-400')}
          >
            <Star className={clsx('w-6 h-6', favorite && 'fill-current')} />
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('tools.httpStatus.searchPlaceholder')}
            className="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-space-600 rounded-lg bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="space-y-3">
          {filteredCodes.map((status) => (
            <div
              key={status.code}
              className="p-4 rounded-lg border border-gray-100 dark:border-space-700 bg-gray-50 dark:bg-space-900 flex gap-4"
            >
              <div
                className={clsx(
                  'w-16 h-12 flex items-center justify-center rounded font-bold text-xl',
                  getColor(status.code)
                )}
              >
                {status.code}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                  {status.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{status.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
