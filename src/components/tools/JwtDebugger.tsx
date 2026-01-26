import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Star, AlertTriangle } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

type ValidationMode = 'none' | 'hmac' | 'rsa';
type Algorithm = 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512';

interface JwtParts {
  header: string;
  payload: string;
  signature: string;
  is_valid: boolean;
  algorithm: string;
  validation_error?: string;
}

export const JwtDebugger: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [token, setToken] = useState('');
  const [result, setResult] = useState<JwtParts | null>(null);
  const [error, setError] = useState('');
  const [validationMode, setValidationMode] = useState<ValidationMode>('none');
  const [secret, setSecret] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [algorithm, setAlgorithm] = useState<Algorithm>('HS256');
  const [copied, setCopied] = useState<'header' | 'payload' | null>(null);

  const toolId = 'jwt-debugger';
  const favorite = isFavorite(toolId);

  const handleDecode = async () => {
    try {
      let decoded: JwtParts;

      if (validationMode === 'none') {
        decoded = await invoke<JwtParts>('decode_jwt_unsafe_command', { token });
      } else if (validationMode === 'hmac') {
        decoded = await invoke<JwtParts>('validate_jwt_hmac_command', {
          token,
          secret,
          algorithm,
        });
      } else {
        decoded = await invoke<JwtParts>('validate_jwt_rsa_command', {
          token,
          publicKey,
          algorithm,
        });
      }

      setResult(decoded);
      setError('');
    } catch (err) {
      setError(String(err));
      setResult(null);
    }
  };

  const copyToClipboard = async (content: string, type: 'header' | 'payload') => {
    await navigator.clipboard.writeText(content);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleFavorite = () => {
    if (favorite) {
      removeFavorite(toolId);
    } else {
      addFavorite(toolId);
    }
  };

  const exampleToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('tools.jwtDebugger.name')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{t('tools.jwtDebugger.description')}</p>
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

      {/* Warning Banner */}
      <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          {t('tools.jwtDebugger.warning')}
        </p>
      </div>

      {/* Token Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('tools.jwtDebugger.token')}
        </label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          className="w-full h-24 font-mono text-sm input resize-none"
        />
        <button
          onClick={() => setToken(exampleToken)}
          className="mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          {t('tools.jwtDebugger.useExample', 'Use example token')}
        </button>
      </div>

      {/* Validation Options */}
      <div className="mb-4 space-y-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={validationMode !== 'none'}
              onChange={(e) => setValidationMode(e.target.checked ? 'hmac' : 'none')}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tools.jwtDebugger.validate')}
            </span>
          </label>
        </div>

        {validationMode !== 'none' && (
          <div className="p-4 bg-gray-50 dark:bg-space-800 rounded-lg space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setValidationMode('hmac')}
                className={clsx(
                  'px-4 py-2 rounded-md text-sm transition-colors',
                  validationMode === 'hmac'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-space-700 text-gray-700 dark:text-gray-300'
                )}
              >
                HMAC (HS)
              </button>
              <button
                onClick={() => setValidationMode('rsa')}
                className={clsx(
                  'px-4 py-2 rounded-md text-sm transition-colors',
                  validationMode === 'rsa'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-space-700 text-gray-700 dark:text-gray-300'
                )}
              >
                RSA (RS)
              </button>
            </div>

            {validationMode === 'hmac' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('tools.jwtDebugger.secret')}
                  </label>
                  <input
                    type="text"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="your-256-bit-secret"
                    className="w-full input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('tools.jwtDebugger.algorithm')}
                  </label>
                  <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
                    className="input"
                  >
                    <option value="HS256">HS256</option>
                    <option value="HS384">HS384</option>
                    <option value="HS512">HS512</option>
                  </select>
                </div>
              </>
            )}

            {validationMode === 'rsa' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('tools.jwtDebugger.publicKey')}
                  </label>
                  <textarea
                    value={publicKey}
                    onChange={(e) => setPublicKey(e.target.value)}
                    placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
                    className="w-full h-32 font-mono text-sm input resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('tools.jwtDebugger.algorithm')}
                  </label>
                  <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
                    className="input"
                  >
                    <option value="RS256">RS256</option>
                    <option value="RS384">RS384</option>
                    <option value="RS512">RS512</option>
                  </select>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <button onClick={handleDecode} className="btn btn-primary mb-6">
        {t('common.decode', 'Decode')}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 font-mono text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tools.jwtDebugger.header')}
              </label>
              <button
                onClick={() => copyToClipboard(result.header, 'header')}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {copied === 'header' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <pre className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg overflow-auto max-h-96 text-xs">
              {result.header}
            </pre>
          </div>

          {/* Payload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tools.jwtDebugger.payload')}
              </label>
              <button
                onClick={() => copyToClipboard(result.payload, 'payload')}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {copied === 'payload' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <pre className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg overflow-auto max-h-96 text-xs">
              {result.payload}
            </pre>
          </div>

          {/* Signature & Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('tools.jwtDebugger.signature')}
            </label>
            <div className="p-4 bg-gray-50 dark:bg-space-800 rounded-lg space-y-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Algorithm</p>
                <p className="font-mono text-sm">{result.algorithm}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                <div
                  className={clsx(
                    'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
                    result.is_valid
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  )}
                >
                  {result.is_valid ? '✓ ' : '✗ '}
                  {result.is_valid
                    ? t('tools.jwtDebugger.status.valid')
                    : t('tools.jwtDebugger.status.invalid')}
                </div>
              </div>
              {result.validation_error && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Error</p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {result.validation_error}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Signature</p>
                <p className="font-mono text-xs break-all">{result.signature}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
