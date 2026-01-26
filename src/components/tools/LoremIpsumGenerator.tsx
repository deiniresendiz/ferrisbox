import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Copy, Check, Star, FileText } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

type LoremType = 'paragraphs' | 'words';

export const LoremIpsumGenerator: React.FC = () => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [loremType, setLoremType] = useState<LoremType>('paragraphs');
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState<{
    text: string;
    word_count: number;
    paragraph_count: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const toolId = 'lorem-ipsum-generator';
  const favorite = isFavorite(toolId);

  const generateLorem = async () => {
    const result = await invoke<{
      text: string;
      word_count: number;
      paragraph_count: number;
    }>('generate_lorem_command', {
      lorem_type: loremType,
      count,
    });
    setOutput(result);
  };

  const copyToClipboard = async () => {
    if (output) {
      await navigator.clipboard.writeText(output.text);
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
            Lorem Ipsum Generator
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Generate placeholder text for designs and mockups
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

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <select
              value={loremType}
              onChange={(e) => setLoremType(e.target.value as LoremType)}
              className="w-full px-3 py-2 bg-white dark:bg-space-700 border border-gray-300 dark:border-space-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-rust-500"
            >
              <option value="paragraphs">Paragraphs</option>
              <option value="words">Words</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Count
            </label>
            <input
              type="number"
              min="1"
              max={loremType === 'paragraphs' ? 10 : 500}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-white dark:bg-space-700 border border-gray-300 dark:border-space-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-rust-500"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={generateLorem} className="btn btn-primary flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Generate
          </button>

          {output && (
            <button onClick={copyToClipboard} className="btn btn-secondary flex items-center gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>

        {output && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Generated Text
            </label>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div className="p-3 bg-gray-100 dark:bg-space-800 rounded-lg border border-gray-200 dark:border-space-600">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">{output.word_count}</span> words
                </p>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-space-800 rounded-lg border border-gray-200 dark:border-space-600">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">{output.paragraph_count}</span> paragraphs
                </p>
              </div>
            </div>
            <textarea
              value={output.text}
              readOnly
              rows={12}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-space-900 border border-gray-300 dark:border-space-600 rounded-lg font-mono text-sm text-gray-900 dark:text-gray-100 resize-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};
