import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { getToolById } from '../../lib/tools-registry';

export const MainLayout: React.FC = () => {
  const [currentToolId, setCurrentToolId] = useState<string | null>('json-formatter');

  const currentTool = currentToolId ? getToolById(currentToolId) : null;
  const ToolComponent = currentTool?.component;

  return (
    <div className="h-screen flex flex-col">
      <Header currentTool={currentTool?.name} />
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
    </div>
  );
};
