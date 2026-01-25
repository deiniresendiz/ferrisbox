import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { Config } from '../types';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    // Load theme from config
    invoke<Config>('get_config')
      .then((config) => {
        const savedTheme = config.preferences.theme as Theme;
        setThemeState(savedTheme);
        updateDocumentTheme(savedTheme);
      })
      .catch((err) => {
        console.error('Failed to load theme:', err);
        // Default to system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setThemeState(prefersDark ? 'dark' : 'light');
        updateDocumentTheme(prefersDark ? 'dark' : 'light');
      });
  }, []);

  const updateDocumentTheme = (newTheme: Theme) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    updateDocumentTheme(newTheme);

    // Save to config
    try {
      const config = await invoke<Config>('get_config');
      await invoke('update_config', {
        config: {
          ...config,
          preferences: {
            ...config.preferences,
            theme: newTheme,
          },
        },
      });
    } catch (err) {
      console.error('Failed to save theme:', err);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    await setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
