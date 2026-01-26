import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Copy, Check, Star, Download, Lock, AlertTriangle } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

type RsaKeySize = '2048' | '4096';

export const RsaKeyPairGenerator: React.FC = () => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [keySize, setKeySize] = useState<RsaKeySize>('2048');
  const [keyPair, setKeyPair] = useState<{
    public_key_pem: string;
    private_key_pem: string;
    key_size: number;
  } | null>(null);
  const [copied, setCopied] = useState<'public' | 'private' | null>(null);

  const toolId = 'rsa-key-pair-generator';
  const favorite = isFavorite(toolId);

  const generateKeyPair = async () => {
    try {
      const result = await invoke<{
        public_key_pem: string;
        private_key_pem: string;
        key_size: number;
      }>('generate_rsa_key_pair_command', { key_size: keySize });
      setKeyPair(result);
    } catch (err) {
      console.error('RSA key generation failed:', err);
    }
  };

  const copyToClipboard = async (text: string, keyType: 'public' | 'private') => {
    await navigator.clipboard.writeText(text);
    setCopied(keyType);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadKey = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleFavorite = () => {
    if (favorite) {
      removeFavorite(toolId);
    } else {
      addFavorite(toolId);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            RSA Key Pair Generator
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Generate RSA public and private keys locally
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

      {/* Options */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Key Size
        </label>
        <div className="flex gap-4">
          <button
            onClick={() => setKeySize('2048')}
            className={clsx(
              'flex-1 px-4 py-3 rounded-lg border transition-colors',
              keySize === '2048'
                ? 'bg-rust-50 dark:bg-rust-900/20 border-rust-500 text-rust-700 dark:text-rust-300'
                : 'bg-white dark:bg-space-700 border-gray-300 dark:border-space-600 hover:border-gray-400'
            )}
          >
            2048 bits
          </button>
          <button
            onClick={() => setKeySize('4096')}
            className={clsx(
              'flex-1 px-4 py-3 rounded-lg border transition-colors',
              keySize === '4096'
                ? 'bg-rust-50 dark:bg-rust-900/20 border-rust-500 text-rust-700 dark:text-rust-300'
                : 'bg-white dark:bg-space-700 border-gray-300 dark:border-space-600 hover:border-gray-400'
            )}
          >
            4096 bits
          </button>
        </div>
      </div>

      {/* Generate Button */}
      <div className="mb-6">
        <button
          onClick={generateKeyPair}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          <Lock className="w-5 h-5" />
          Generate RSA Key Pair
        </button>
      </div>

      {/* Key Pair Output */}
      {keyPair && (
        <>
          {/* Warning */}
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                  ⚠️ SECURITY WARNING
                </h3>
                <p className="text-sm text-red-800 dark:text-red-200">
                  Keep the <strong>private key</strong> secret at all times. Never share it with
                  anyone. The private key should be stored securely and never committed to version
                  control.
                </p>
              </div>
            </div>
          </div>

          {/* Keys Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Public Key */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Public Key (ID: {keyPair.key_size} bits)
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(keyPair.public_key_pem, 'public')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-space-700 rounded-lg transition-colors"
                    title="Copy"
                  >
                    {copied === 'public' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => downloadKey(keyPair.public_key_pem, 'public_key.pem')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-space-700 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
              <textarea
                value={keyPair.public_key_pem}
                readOnly
                rows={20}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-space-900 border border-gray-300 dark:border-space-600 rounded-lg font-mono text-xs text-gray-900 dark:text-gray-100 resize-none"
              />
            </div>

            {/* Private Key */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-red-700 dark:text-red-300">
                  Private Key (KEEP SECRET!)
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(keyPair.private_key_pem, 'private')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-space-700 rounded-lg transition-colors"
                    title="Copy"
                  >
                    {copied === 'private' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => downloadKey(keyPair.private_key_pem, 'private_key.pem')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-space-700 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
              <textarea
                value={keyPair.private_key_pem}
                readOnly
                rows={20}
                className="w-full px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg font-mono text-xs text-gray-900 dark:text-gray-100 resize-none"
              />
            </div>
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Generated:</strong> {keyPair.key_size}-bit RSA key pair
            </p>
          </div>
        </>
      )}
    </div>
  );
};
