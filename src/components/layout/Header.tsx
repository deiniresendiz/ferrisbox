import React from 'react';
import { Moon, Sun, Languages } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { SmartPasteButton } from '../common/SmartPasteButton';

interface HeaderProps {
  currentTool?: string;
  onToolChange?: (toolId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTool, onToolChange }) => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const languages = ['en', 'es', 'pt', 'zh'] as const;
  const languageNames: Record<string, string> = {
    en: 'English',
    es: 'Español',
    pt: 'Português',
    zh: '中文',
  };

  const handleSmartPasteDetection = (toolId: string) => {
    if (onToolChange) {
      onToolChange(toolId);
    }
  };

  const handleLanguageChange = () => {
    const currentIndex = languages.indexOf(language as any);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex]);
  };

  return (
    <header className="h-16 border-b border-gray-200 dark:border-space-500 bg-white dark:bg-space-700 flex items-center justify-between px-6">
      <div>
        {currentTool ? (
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{currentTool}</h1>
        ) : (
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="FerrisBox" className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('app.name')}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('app.tagline')}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <SmartPasteButton onToolDetected={handleSmartPasteDetection} />
        
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-space-600 transition-colors"
          title={theme === 'dark' ? t('common.theme.light') : t('common.theme.dark')}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        <div className="relative">
          <button
            onClick={handleLanguageChange}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-space-600 transition-colors flex items-center gap-2"
            title={`Current: ${languageNames[language]}`}
          >
            <Languages className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {languageNames[language]}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
