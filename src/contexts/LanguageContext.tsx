import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { invoke } from '@tauri-apps/api/core';
import type { Config } from '../types';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState('en');
  const { i18n } = useTranslation();

  useEffect(() => {
    // Load language from config
    invoke<Config>('get_config')
      .then((config) => {
        const lang = config.preferences.language;
        setLanguageState(lang);
        i18n.changeLanguage(lang);
      })
      .catch((err) => console.error('Failed to load language:', err));
  }, [i18n]);

  const setLanguage = async (lang: string) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);

    // Save to config
    try {
      const config = await invoke<Config>('get_config');
      await invoke('update_config', {
        config: {
          ...config,
          preferences: {
            ...config.preferences,
            language: lang,
          },
        },
      });
    } catch (err) {
      console.error('Failed to save language:', err);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
