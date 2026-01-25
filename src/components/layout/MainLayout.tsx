import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { CommandPalette } from '../common/CommandPalette';
import { getToolById } from '../../lib/tools-registry';

export const MainLayout: React.FC = () => {
  const [currentToolId, setCurrentToolId] = useState<string | null>('json-formatter');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const currentTool = currentToolId ? getToolById(currentToolId) : null;
  const ToolComponent = currentTool?.component;

  const handleToolChange = (toolId: string) => {
    setCurrentToolId(toolId);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header currentTool={currentTool?.name} onToolChange={handleToolChange} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar currentToolId={currentToolId} onSelectTool={setCurrentToolId} />
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-space-600">
          {ToolComponent ? (
            <div className="p-6">
              <ToolComponent />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400">Select a tool to get started</p>
            </div>
          )}
        </main>
      </div>
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onSelectTool={setCurrentToolId}
      />
    </div>
  );
};
