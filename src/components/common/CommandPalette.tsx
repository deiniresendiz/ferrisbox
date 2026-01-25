import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { useTranslation } from 'react-i18next';
import { TOOLS, searchTools } from '../../lib/tools-registry';
import { useFavorites } from '../../contexts/FavoritesContext';
import { Star } from 'lucide-react';
import './CommandPalette.css';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTool: (toolId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
  onSelectTool,
}) => {
  const { t } = useTranslation();
  const { favorites } = useFavorites();
  const [search, setSearch] = useState('');

  const favoriteTools = TOOLS.filter((tool) => favorites.includes(tool.id));
  const filteredTools = search ? searchTools(search) : TOOLS;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const handleSelect = (toolId: string) => {
    onSelectTool(toolId);
    onOpenChange(false);
    setSearch('');
  };

  if (!open) return null;

  return (
    <div className="command-palette-overlay" onClick={() => onOpenChange(false)}>
      <Command.Dialog
        open={open}
        onOpenChange={onOpenChange}
        label="Command Menu"
        className="command-palette"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="command-input-wrapper">
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder={t('commandPalette.placeholder')}
            className="command-input"
          />
        </div>

        <Command.List className="command-list">
          <Command.Empty className="command-empty">
            {t('commandPalette.noResults')}
          </Command.Empty>

          {!search && favoriteTools.length > 0 && (
            <Command.Group heading={t('commandPalette.recentlyUsed')} className="command-group">
              {favoriteTools.map((tool) => (
                <Command.Item
                  key={tool.id}
                  value={tool.id}
                  onSelect={() => handleSelect(tool.id)}
                  className="command-item"
                >
                  <tool.icon className="command-item-icon" />
                  <div className="command-item-content">
                    <span className="command-item-title">{tool.name}</span>
                    <span className="command-item-description">{tool.description}</span>
                  </div>
                  <Star className="command-item-badge" />
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {TOOLS.filter((t) => t.category).map((cat) => cat.category)
            .filter((v, i, a) => a.indexOf(v) === i)
            .map((category) => {
              const toolsInCategory = filteredTools.filter((t) => t.category === category);
              if (toolsInCategory.length === 0) return null;

              return (
                <Command.Group
                  key={category}
                  heading={t(`sidebar.categories.${category}s`)}
                  className="command-group"
                >
                  {toolsInCategory.map((tool) => (
                    <Command.Item
                      key={tool.id}
                      value={`${tool.name} ${tool.description} ${tool.keywords.join(' ')}`}
                      onSelect={() => handleSelect(tool.id)}
                      className="command-item"
                    >
                      <tool.icon className="command-item-icon" />
                      <div className="command-item-content">
                        <span className="command-item-title">{tool.name}</span>
                        <span className="command-item-description">{tool.description}</span>
                      </div>
                      {favorites.includes(tool.id) && (
                        <Star className="command-item-badge fill-current" />
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              );
            })}
        </Command.List>
      </Command.Dialog>
    </div>
  );
};
