import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { readText } from '@tauri-apps/plugin-clipboard-manager';
import { Sparkles, Check } from 'lucide-react';
import type { ContentType } from '../../types';

const TOOL_MAP: Record<string, string> = {
  json: 'json-formatter',
  base64: 'base64-encoder',
  hash: 'hash-generator',
  uuid: 'uuid-generator',
  url: 'url-encoder',
};

interface SmartPasteButtonProps {
  onToolDetected: (toolId: string, content: string) => void;
}

export const SmartPasteButton: React.FC<SmartPasteButtonProps> = ({ onToolDetected }) => {
  const [detecting, setDetecting] = useState(false);
  const [detected, setDetected] = useState(false);

  const handleSmartPaste = async () => {
    try {
      setDetecting(true);
      const clipboardText = await readText();
      
      if (!clipboardText) {
        return;
      }

      const contentType = await invoke<ContentType>('detect_clipboard_content', {
        content: clipboardText,
      });

      const toolId = TOOL_MAP[contentType];
      
      if (toolId) {
        onToolDetected(toolId, clipboardText);
        setDetected(true);
        setTimeout(() => setDetected(false), 2000);
      }
    } catch (error) {
      console.error('Smart paste error:', error);
    } finally {
      setDetecting(false);
    }
  };

  return (
    <button
      onClick={handleSmartPaste}
      disabled={detecting}
      className="btn btn-secondary flex items-center gap-2"
      title="Detect clipboard content and suggest tool"
    >
      {detected ? (
        <>
          <Check className="w-4 h-4" />
          Detected!
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          Smart Paste
        </>
      )}
    </button>
  );
};
