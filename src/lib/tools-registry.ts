import { FileJson, Hash, Binary, Key, Link, type LucideIcon } from 'lucide-react';
import type { Tool } from '../types';

// Import components
import { JsonFormatter } from '../components/tools/JsonFormatter';
import { HashGenerator } from '../components/tools/HashGenerator';
import { Base64Encoder } from '../components/tools/Base64Encoder';
import { UuidGenerator } from '../components/tools/UuidGenerator';
import { UrlEncoder } from '../components/tools/UrlEncoder';

export const TOOLS: Tool[] = [
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    category: 'formatter',
    description: 'Format, validate and beautify JSON',
    keywords: ['json', 'format', 'validate', 'prettify', 'minify'],
    component: JsonFormatter,
    icon: FileJson as LucideIcon,
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    category: 'generator',
    description: 'Generate cryptographic hashes (SHA-256, MD5)',
    keywords: ['hash', 'sha256', 'md5', 'checksum', 'crypto'],
    component: HashGenerator,
    icon: Hash as LucideIcon,
  },
  {
    id: 'base64-encoder',
    name: 'Base64 Encoder/Decoder',
    category: 'encoder',
    description: 'Encode or decode Base64',
    keywords: ['base64', 'encode', 'decode', 'binary'],
    component: Base64Encoder,
    icon: Binary as LucideIcon,
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    category: 'generator',
    description: 'Generate UUIDs (v4 random or v7 timestamp)',
    keywords: ['uuid', 'guid', 'identifier', 'unique', 'v4', 'v7'],
    component: UuidGenerator,
    icon: Key as LucideIcon,
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder/Decoder',
    category: 'encoder',
    description: 'Encode or decode URL strings',
    keywords: ['url', 'encode', 'decode', 'percent', 'uri'],
    component: UrlEncoder,
    icon: Link as LucideIcon,
  },
];

export const getToolById = (id: string): Tool | undefined => {
  return TOOLS.find((tool) => tool.id === id);
};

export const getToolsByCategory = (category: string): Tool[] => {
  return TOOLS.filter((tool) => tool.category === category);
};

export const searchTools = (query: string): Tool[] => {
  const lowerQuery = query.toLowerCase();
  return TOOLS.filter(
    (tool) =>
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery) ||
      tool.keywords.some((keyword) => keyword.toLowerCase().includes(lowerQuery))
  );
};
