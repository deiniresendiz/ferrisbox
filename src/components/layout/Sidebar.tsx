import React, { useState } from 'react';
import { Star, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFavorites } from '../../contexts/FavoritesContext';
import { TOOLS } from '../../lib/tools-registry';
import clsx from 'clsx';

interface SidebarProps {
  currentToolId: string | null;
  onSelectTool: (toolId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentToolId, onSelectTool }) => {
  const { t } = useTranslation();
  const { favorites } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');

  const favoriteTools = TOOLS.filter((tool) => favorites.includes(tool.id));
  const filteredTools = TOOLS.filter((tool) =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(TOOLS.map((tool) => tool.category)));

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-space-500 bg-white dark:bg-space-700 flex flex-col">
      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-space-500">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('sidebar.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-gray-100 dark:bg-space-600 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rust-500"
          />
        </div>
      </div>

      {/* Tools List */}
      <div className="flex-1 overflow-y-auto">
        {searchQuery === '' && favoriteTools.length > 0 && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('sidebar.favorites')}
              </h2>
            </div>
            {favoriteTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                className={clsx(
                  'w-full text-left px-3 py-2 rounded-lg mb-1 flex items-center gap-2 transition-colors',
                  currentToolId === tool.id
                    ? 'bg-rust-500 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-space-600 text-gray-700 dark:text-gray-300'
                )}
              >
                <tool.icon className="w-4 h-4" />
                <span className="text-sm">{tool.name}</span>
              </button>
            ))}
          </div>
        )}

        {searchQuery === '' ? (
          <>
            {categories.map((category) => {
              const toolsInCategory = TOOLS.filter((tool) => tool.category === category);
              const categoryName = category === 'utility' ? 'utilities' : `${category}s`;
              return (
                <div key={category} className="p-4">
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t(`sidebar.categories.${categoryName}`)}
                  </h2>
                  {toolsInCategory.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => onSelectTool(tool.id)}
                      className={clsx(
                        'w-full text-left px-3 py-2 rounded-lg mb-1 flex items-center gap-2 transition-colors',
                        currentToolId === tool.id
                          ? 'bg-rust-500 text-white'
                          : 'hover:bg-gray-100 dark:hover:bg-space-600 text-gray-700 dark:text-gray-300'
                      )}
                    >
                      <tool.icon className="w-4 h-4" />
                      <span className="text-sm">{tool.name}</span>
                    </button>
                  ))}
                </div>
              );
            })}
          </>
        ) : (
          <div className="p-4">
            {filteredTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                className={clsx(
                  'w-full text-left px-3 py-2 rounded-lg mb-1 flex items-center gap-2 transition-colors',
                  currentToolId === tool.id
                    ? 'bg-rust-500 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-space-600 text-gray-700 dark:text-gray-300'
                )}
              >
                <tool.icon className="w-4 h-4" />
                <span className="text-sm">{tool.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
