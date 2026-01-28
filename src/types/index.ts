export interface Config {
  version: string;
  preferences: Preferences;
  favorites: string[];
  recent_tools: RecentTool[];
}

export interface Preferences {
  theme: 'light' | 'dark';
  language: Language;
  auto_detect_clipboard: boolean;
}

export interface RecentTool {
  id: string;
  last_used: string;
}

export type ToolCategory =
  | 'encoder'
  | 'formatter'
  | 'generator'
  | 'converter'
  | 'utility'
  | 'network';

export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  keywords: string[];
  component: React.ComponentType;
  icon: React.ComponentType<{ className?: string }>;
}

export type HashAlgorithm = 'SHA256' | 'MD5';

export type Language = 'en' | 'es' | 'pt' | 'zh';

export type ContentType = 'json' | 'base64' | 'uuid' | 'url' | 'hash' | 'unknown';
