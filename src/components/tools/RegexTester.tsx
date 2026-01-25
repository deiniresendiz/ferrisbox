import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Star, TestTube2, AlertCircle } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

interface RegexMatch {
  full_match: string;
  start: number;
  end: number;
  groups: string[];
}

interface RegexTestResult {
  matches: RegexMatch[];
  total_matches: number;
  error: string | null;
}

const COMMON_PATTERNS = [
  { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
  { name: 'URL', pattern: 'https?://[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(/[^\\s]*)?' },
  { name: 'IPv4', pattern: '\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b' },
  { name: 'Phone (US)', pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}' },
  { name: 'Hex Color', pattern: '#[0-9A-Fa-f]{6}\\b' },
  { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}' },
  { name: 'Time (HH:MM)', pattern: '([01]?[0-9]|2[0-3]):[0-5][0-9]' },
  { name: 'UUID', pattern: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' },
];

export const RegexTester: React.FC = () => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [pattern, setPattern] = useState('');
  const [testText, setTestText] = useState('');
  const [caseInsensitive, setCaseInsensitive] = useState(false);
  const [result, setResult] = useState<RegexTestResult | null>(null);
  const [isValid, setIsValid] = useState(true);

  const toolId = 'regex-tester';
  const favorite = isFavorite(toolId);

  const testRegex = async () => {
    if (!pattern) {
      setResult(null);
      setIsValid(true);
      return;
    }

    try {
      const testResult = await invoke<RegexTestResult>('test_regex_command', {
        pattern,
        testText,
        caseInsensitive,
      });

      setResult(testResult);
      setIsValid(testResult.error === null);
    } catch (error) {
      console.error('Regex test error:', error);
      setResult({
        matches: [],
        total_matches: 0,
        error: String(error),
      });
      setIsValid(false);
    }
  };

  // Auto-test when inputs change (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pattern) {
        testRegex();
      } else {
        setResult(null);
        setIsValid(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [pattern, testText, caseInsensitive]);

  const toggleFavorite = () => {
    if (favorite) {
      removeFavorite(toolId);
    } else {
      addFavorite(toolId);
    }
  };

  const loadExample = (examplePattern: string) => {
    setPattern(examplePattern);
  };

  const highlightMatches = (): { text: string; isMatch: boolean }[] => {
    if (!result || result.matches.length === 0 || !testText) {
      return [{ text: testText, isMatch: false }];
    }

    const parts: { text: string; isMatch: boolean }[] = [];
    let lastIndex = 0;

    result.matches.forEach((match) => {
      // Add text before match
      if (match.start > lastIndex) {
        parts.push({
          text: testText.slice(lastIndex, match.start),
          isMatch: false,
        });
      }
      // Add matched text
      parts.push({
        text: testText.slice(match.start, match.end),
        isMatch: true,
      });
      lastIndex = match.end;
    });

    // Add remaining text
    if (lastIndex < testText.length) {
      parts.push({
        text: testText.slice(lastIndex),
        isMatch: false,
      });
    }

    return parts;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Regex Tester
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Test and validate regular expressions with live results
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Input */}
        <div className="space-y-4">
          {/* Pattern Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Regular Expression Pattern
            </label>
            <div className="relative">
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern..."
                className={clsx(
                  'w-full px-3 py-2 font-mono text-sm bg-white dark:bg-space-700 border rounded-lg focus:outline-none focus:ring-2',
                  isValid
                    ? 'border-gray-300 dark:border-space-500 focus:ring-rust-500'
                    : 'border-red-500 dark:border-red-600 focus:ring-red-500'
                )}
              />
              {!isValid && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                </div>
              )}
            </div>
            {result?.error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {result.error}
              </p>
            )}
          </div>

          {/* Flags */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={caseInsensitive}
                onChange={(e) => setCaseInsensitive(e.target.checked)}
                className="w-4 h-4 text-rust-500 rounded focus:ring-rust-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Case insensitive (i)
              </span>
            </label>
          </div>

          {/* Common Patterns */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Common Patterns
            </label>
            <div className="grid grid-cols-2 gap-2">
              {COMMON_PATTERNS.map((example) => (
                <button
                  key={example.name}
                  onClick={() => loadExample(example.pattern)}
                  className="px-3 py-2 text-xs bg-gray-100 dark:bg-space-800 hover:bg-gray-200 dark:hover:bg-space-700 border border-gray-300 dark:border-space-600 rounded-lg transition-colors text-left"
                >
                  {example.name}
                </button>
              ))}
            </div>
          </div>

          {/* Test Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Test Text
            </label>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Enter text to test against the pattern..."
              rows={8}
              className="w-full px-3 py-2 font-mono text-sm bg-white dark:bg-space-700 border border-gray-300 dark:border-space-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-rust-500 resize-y"
            />
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-4">
          {/* Match Summary */}
          {result && isValid && (
            <div className={clsx(
              'p-4 rounded-lg border',
              result.total_matches > 0
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-gray-50 dark:bg-space-800 border-gray-200 dark:border-space-600'
            )}>
              <div className="flex items-center gap-2 mb-2">
                <TestTube2 className={clsx(
                  'w-5 h-5',
                  result.total_matches > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'
                )} />
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {result.total_matches} {result.total_matches === 1 ? 'Match' : 'Matches'} Found
                </span>
              </div>
            </div>
          )}

          {/* Highlighted Text */}
          {testText && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Text with Matches Highlighted
              </label>
              <div className="p-3 bg-white dark:bg-space-700 border border-gray-300 dark:border-space-500 rounded-lg min-h-[200px] max-h-[400px] overflow-y-auto">
                <pre className="font-mono text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
                  {result && result.matches.length > 0 ? (
                    highlightMatches().map((part, idx) => (
                      <span
                        key={idx}
                        className={clsx(
                          part.isMatch && 'bg-yellow-200 dark:bg-yellow-600/40 font-semibold'
                        )}
                      >
                        {part.text}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">{testText}</span>
                  )}
                </pre>
              </div>
            </div>
          )}

          {/* Match Details */}
          {result && result.matches.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Match Details
              </label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {result.matches.map((match, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 dark:bg-space-800 border border-gray-200 dark:border-space-600 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Match #{idx + 1}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Position: {match.start}-{match.end}
                      </span>
                    </div>
                    <div className="font-mono text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-space-700 p-2 rounded border border-gray-200 dark:border-space-600">
                      {match.full_match}
                    </div>
                    {match.groups.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Capture Groups:
                        </span>
                        {match.groups.map((group, groupIdx) => (
                          <div
                            key={groupIdx}
                            className="font-mono text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-space-700 p-2 rounded border border-gray-200 dark:border-space-600"
                          >
                            <span className="text-gray-500">Group {groupIdx + 1}:</span> {group}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!pattern && !testText && (
            <div className="flex items-center justify-center h-[300px] border-2 border-dashed border-gray-300 dark:border-space-600 rounded-lg">
              <div className="text-center">
                <TestTube2 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">
                  Enter a regex pattern and test text to see results
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
