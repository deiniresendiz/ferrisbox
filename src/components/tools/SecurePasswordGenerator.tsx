import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Copy, Check, Star, Eye, EyeOff, RotateCw } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

export const SecurePasswordGenerator: React.FC = () => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [output, setOutput] = useState<{
    password: string;
    entropy_bits: number;
    strength: string;
    strength_score: number;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const toolId = 'secure-password-generator';
  const favorite = isFavorite(toolId);

  const generatePassword = async () => {
    const result = await invoke<{
      password: string;
      entropy_bits: number;
      strength: string;
      strength_score: number;
    }>('generate_password_command', {
      length,
      uppercase,
      lowercase,
      numbers,
      symbols,
    });
    setOutput(result);

    // Agregar al historial
    setHistory((prev) => [result.password, ...prev.slice(0, 4)]);
  };

  useEffect(() => {
    generatePassword();
  }, [length, uppercase, lowercase, numbers, symbols]);

  const copyToClipboard = async () => {
    if (output) {
      await navigator.clipboard.writeText(output.password);
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

  const getStrengthColor = (score: number) => {
    if (score <= 25) return 'bg-red-500';
    if (score <= 50) return 'bg-orange-500';
    if (score <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = (strength: string) => {
    const labels: Record<string, string> = {
      weak: 'Weak',
      moderate: 'Moderate',
      strong: 'Strong',
      very_strong: 'Very Strong',
    };
    return labels[strength] || 'Unknown';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Secure Password Generator
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Generate strong passwords with entropy calculation
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

      <div className="space-y-6">
        {/* Password Output */}
        {output && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Generated Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={output.password}
                readOnly
                className="w-full px-4 py-3 pr-24 bg-white dark:bg-space-700 border border-gray-300 dark:border-space-500 rounded-lg font-mono text-lg text-gray-900 dark:text-gray-100 focus:outline-none"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-space-600 rounded-lg transition-colors"
                  title={showPassword ? 'Hide' : 'Show'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
                <button
                  onClick={generatePassword}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-space-600 rounded-lg transition-colors"
                  title="Regenerate"
                >
                  <RotateCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-space-600 rounded-lg transition-colors"
                  title="Copy"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Strength Meter */}
        {output && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Strength
              </label>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {output.entropy_bits.toFixed(1)} bits
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-space-700 rounded-full overflow-hidden">
                  <div
                    className={clsx(
                      'h-full transition-all',
                      getStrengthColor(output.strength_score)
                    )}
                    style={{ width: `${output.strength_score}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={clsx(
                    'px-3 py-1 rounded-full text-xs font-semibold',
                    output.strength_score <= 25
                      ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                      : output.strength_score <= 50
                        ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                        : output.strength_score <= 75
                          ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                          : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  )}
                >
                  {getStrengthLabel(output.strength)}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Score: {output.strength_score}/100
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Length: {length}
            </label>
            <input
              type="range"
              min="8"
              max="128"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Character Types */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-rust-600 focus:ring-rust-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Uppercase (A-Z)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={lowercase}
                onChange={(e) => setLowercase(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-rust-600 focus:ring-rust-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Lowercase (a-z)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={numbers}
                onChange={(e) => setNumbers(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-rust-600 focus:ring-rust-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Numbers (0-9)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={symbols}
                onChange={(e) => setSymbols(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-rust-600 focus:ring-rust-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Symbols (!@#$%...)</span>
            </label>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Recent Passwords
            </h3>
            <div className="space-y-2">
              {history.map((pwd, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-100 dark:bg-space-800 rounded-lg border border-gray-200 dark:border-space-600"
                >
                  <span className="flex-1 font-mono text-sm text-gray-900 dark:text-gray-100">
                    {pwd}
                  </span>
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(pwd);
                    }}
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
    </div>
  );
};
