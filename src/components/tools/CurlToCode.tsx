import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Star } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';
import * as curlconverter from 'curlconverter';

export const CurlToCode: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<'javascript' | 'python' | 'rust' | 'go' | 'php'>(
    'javascript'
  );
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  void copied; // Fix TS6133

  const toolId = 'curl-to-code';
  const favorite = isFavorite(toolId);

  const handleConvert = () => {
    setError('');
    if (!input.trim()) {
      setOutput('');
      return;
    }

    try {
      let result = '';
      // curlconverter exports functions like toPython, toJavaScript, etc.
      // We map our language state to these functions.
      // Note: curlconverter types might need adjustment depending on version

      switch (language) {
        case 'javascript':
          result = curlconverter.toJavaScript(input);
          break;
        case 'python':
          result = curlconverter.toPython(input);
          break;
        case 'rust':
          result = curlconverter.toRust(input);
          break;
        case 'go':
          result = curlconverter.toGo(input);
          break;
        case 'php':
          result = curlconverter.toPhp(input);
          break;
        default:
          result = curlconverter.toJavaScript(input);
      }
      setOutput(result);
    } catch (err) {
      console.error(err);
      setError('Invalid CURL command or unsupported options');
      setOutput('');
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              {t('tools.curlToCode.name')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.curlToCode.description')}
            </p>
          </div>
          <button
            onClick={toggleFavorite}
            className={clsx('p-2 rounded-lg', favorite ? 'text-yellow-500' : 'text-gray-400')}
          >
            <Star className={clsx('w-6 h-6', favorite && 'fill-current')} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[600px]">
          <div className="flex flex-col h-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('tools.curlToCode.input')}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="curl -X POST https://api.example.com/data -d 'json=true'"
              className="flex-1 w-full p-4 border border-gray-300 dark:border-space-600 rounded-md bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none"
            />
          </div>

          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tools.curlToCode.output')}
              </label>
              <div className="flex gap-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="px-2 py-1 text-sm border border-gray-300 dark:border-space-600 rounded bg-white dark:bg-space-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="rust">Rust</option>
                  <option value="go">Go</option>
                  <option value="php">PHP</option>
                </select>
                <button onClick={handleConvert} className="btn btn-primary py-1 text-xs">
                  {t('common.convert')}
                </button>
              </div>
            </div>

            <div className="flex-1 relative">
              <textarea
                readOnly
                value={output}
                className="w-full h-full p-4 border border-gray-300 dark:border-space-600 rounded-md bg-gray-50 dark:bg-space-900 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none"
                placeholder={t('tools.curlToCode.outputPlaceholder')}
              />
              {output && (
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 p-2 bg-white dark:bg-space-700 rounded-md shadow-sm hover:bg-gray-100 dark:hover:bg-space-600 transition-colors"
                >
                  <Copy className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              )}
            </div>
            {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
