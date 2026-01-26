import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Copy, Check, Star, Shield, AlertCircle } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

type TabType = 'hash' | 'verify';

export const BcryptTester: React.FC = () => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [activeTab, setActiveTab] = useState<TabType>('hash');
  const [password, setPassword] = useState('');
  const [cost, setCost] = useState(10);
  const [hash, setHash] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [verifyHash, setVerifyHash] = useState('');
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  const toolId = 'bcrypt-tester';
  const favorite = isFavorite(toolId);

  const generateBcrypt = async () => {
    if (!password) return;

    try {
      const result = await invoke<{
        hash: string;
        cost: number;
      }>('bcrypt_hash_command', {
        password,
        cost,
      });
      setHash(result.hash);
    } catch (err) {
      console.error('Bcrypt hash failed:', err);
    }
  };

  const verifyBcrypt = async () => {
    if (!verifyPassword || !verifyHash) return;

    try {
      const result = await invoke<boolean>('bcrypt_verify_command', {
        password: verifyPassword,
        hash: verifyHash,
      });
      setVerifyResult(result);
    } catch (err) {
      console.error('Bcrypt verify failed:', err);
      setVerifyResult(false);
    }
  };

  const copyToClipboard = async () => {
    if (activeTab === 'hash' && hash) {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Bcrypt Tester
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Hash and verify passwords with Bcrypt</p>
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

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-space-600">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('hash')}
            className={clsx(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'hash'
                ? 'border-rust-500 text-rust-600 dark:text-rust-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            )}
          >
            Generate Hash
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={clsx(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'verify'
                ? 'border-rust-500 text-rust-600 dark:text-rust-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            )}
          >
            Verify Hash
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'hash' ? (
        <div className="space-y-6">
          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password to hash..."
              className="w-full px-3 py-2 bg-white dark:bg-space-700 border border-gray-300 dark:border-space-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-rust-500"
            />
          </div>

          {/* Cost Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cost Factor: {cost}
              </label>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Higher = more secure but slower
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="12"
              value={cost}
              onChange={(e) => setCost(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>4 (fast)</span>
              <span>12 (slow)</span>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateBcrypt}
            disabled={!password}
            className="btn btn-primary w-full flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5" />
            Generate Bcrypt Hash
          </button>

          {/* Hash Output */}
          {hash && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bcrypt Hash (Cost: {cost})
                </label>
                <button
                  onClick={copyToClipboard}
                  className="btn btn-secondary btn-sm flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-space-800 rounded-lg border border-gray-200 dark:border-space-600">
                <p className="font-mono text-sm break-all text-gray-900 dark:text-gray-100">
                  {hash}
                </p>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Info:</strong> Bcrypt is ideal for storing passwords securely. The default
              cost of 10 provides a good balance between security and performance.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Verify Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={verifyPassword}
              onChange={(e) => setVerifyPassword(e.target.value)}
              placeholder="Enter password to verify..."
              className="w-full px-3 py-2 bg-white dark:bg-space-700 border border-gray-300 dark:border-space-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-rust-500"
            />
          </div>

          {/* Verify Hash */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bcrypt Hash
            </label>
            <textarea
              value={verifyHash}
              onChange={(e) => setVerifyHash(e.target.value)}
              placeholder="Paste Bcrypt hash to verify..."
              rows={4}
              className="w-full px-3 py-2 bg-white dark:bg-space-700 border border-gray-300 dark:border-space-500 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rust-500"
            />
          </div>

          {/* Verify Button */}
          <button
            onClick={verifyBcrypt}
            disabled={!verifyPassword || !verifyHash}
            className="btn btn-primary w-full flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5" />
            Verify Password
          </button>

          {/* Verification Result */}
          {verifyResult !== null && (
            <div
              className={clsx(
                'flex items-center gap-2 p-4 rounded-lg',
                verifyResult
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
              )}
            >
              {verifyResult ? (
                <>
                  <Check className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Valid Password</h3>
                    <p className="text-sm">The password matches the hash</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Invalid Password</h3>
                    <p className="text-sm">The password does not match the hash</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Info */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Info:</strong> Bcrypt is designed to be slow and computationally expensive,
              making it resistant to brute-force attacks.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
