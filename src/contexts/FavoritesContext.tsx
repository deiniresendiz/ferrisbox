import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { Config } from '../types';

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (toolId: string) => Promise<void>;
  removeFavorite: (toolId: string) => Promise<void>;
  isFavorite: (toolId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    // Load favorites from config
    invoke<Config>('get_config')
      .then((config) => {
        setFavorites(config.favorites);
      })
      .catch((err) => console.error('Failed to load favorites:', err));
  }, []);

  const addFavorite = async (toolId: string) => {
    try {
      const config = await invoke<Config>('add_favorite', { toolId });
      setFavorites(config.favorites);
    } catch (err) {
      console.error('Failed to add favorite:', err);
    }
  };

  const removeFavorite = async (toolId: string) => {
    try {
      const config = await invoke<Config>('remove_favorite', { toolId });
      setFavorites(config.favorites);
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  const isFavorite = (toolId: string) => favorites.includes(toolId);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
};
