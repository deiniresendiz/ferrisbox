import {
  FileJson,
  Hash,
  Binary,
  Key,
  Link,
  TestTube2,
  Code2,
  Shield,
  Archive,
  Globe,
  Radio,
  Image,
  SplitSquareHorizontal,
  FileCode,
  Database,
  FileType,
  FileJson2,
  FileCode2,
  Wrench,
  FileText,
  KeySquare,
  ScanLine,
  Lock,
  GitBranch,
  type LucideIcon,
} from 'lucide-react';
import type { Tool } from '../types';

// Import components
import { JsonFormatter } from '../components/tools/JsonFormatter';
import { HashGenerator } from '../components/tools/HashGenerator';
import { Base64Encoder } from '../components/tools/Base64Encoder';
import { UuidGenerator } from '../components/tools/UuidGenerator';
import { UrlEncoder } from '../components/tools/UrlEncoder';
import { RegexTester } from '../components/tools/RegexTester';
import { HexConverter } from '../components/tools/HexConverter';
import { HtmlEntities } from '../components/tools/HtmlEntities';
import { JwtDebugger } from '../components/tools/JwtDebugger';
import { GzipCompressor } from '../components/tools/GzipCompressor';
import { PunycodeEncoder } from '../components/tools/PunycodeEncoder';
import { MorseCode } from '../components/tools/MorseCode';
import { Base64Image } from '../components/tools/Base64Image';
import { UrlParser } from '../components/tools/UrlParser';
import { XmlFormatter } from '../components/tools/XmlFormatter';
import { SqlFormatter } from '../components/tools/SqlFormatter';
import { CssFormatter } from '../components/tools/CssFormatter';
import { JsFormatter } from '../components/tools/JsFormatter';
import { YamlFormatter } from '../components/tools/YamlFormatter';
import { RustFormatter } from '../components/tools/RustFormatter';
import { LoremIpsumGenerator } from '../components/tools/LoremIpsumGenerator';
import { SecurePasswordGenerator } from '../components/tools/SecurePasswordGenerator';
import { HmacGenerator } from '../components/tools/HmacGenerator';
import { QrCodeGenerator } from '../components/tools/QrCodeGenerator';
import { GitignoreGenerator } from '../components/tools/GitignoreGenerator';
import { RsaKeyPairGenerator } from '../components/tools/RsaKeyPairGenerator';
import { BcryptTester } from '../components/tools/BcryptTester';
import { GitBranchNameGenerator } from '../components/tools/GitBranchNameGenerator';

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
    id: 'xml-formatter',
    name: 'XML Formatter',
    category: 'formatter',
    description: 'Format, validate and beautify XML',
    keywords: ['xml', 'format', 'validate', 'prettify', 'minify'],
    component: XmlFormatter,
    icon: FileCode as LucideIcon,
  },
  {
    id: 'sql-formatter',
    name: 'SQL Formatter',
    category: 'formatter',
    description: 'Format SQL with multiple dialect support',
    keywords: ['sql', 'format', 'postgresql', 'mysql', 'sqlite', 'query'],
    component: SqlFormatter,
    icon: Database as LucideIcon,
  },
  {
    id: 'css-formatter',
    name: 'CSS Formatter',
    category: 'formatter',
    description: 'Format, validate and beautify CSS/SCSS',
    keywords: ['css', 'scss', 'format', 'validate', 'prettify', 'minify', 'style'],
    component: CssFormatter,
    icon: FileType as LucideIcon,
  },
  {
    id: 'js-formatter',
    name: 'JavaScript Formatter',
    category: 'formatter',
    description: 'Format, validate and beautify JavaScript/TypeScript',
    keywords: ['javascript', 'typescript', 'format', 'validate', 'prettify', 'minify', 'js', 'ts'],
    component: JsFormatter,
    icon: FileJson2 as LucideIcon,
  },
  {
    id: 'yaml-formatter',
    name: 'YAML Formatter',
    category: 'formatter',
    description: 'Format, validate and beautify YAML',
    keywords: ['yaml', 'yml', 'format', 'validate', 'prettify', 'minify', 'config'],
    component: YamlFormatter,
    icon: FileCode2 as LucideIcon,
  },
  {
    id: 'rust-formatter',
    name: 'Rust Formatter',
    category: 'formatter',
    description: 'Format and validate Rust code using rustfmt',
    keywords: ['rust', 'format', 'validate', 'rustfmt', 'rs'],
    component: RustFormatter,
    icon: Wrench as LucideIcon,
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
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    category: 'utility',
    description: 'Test and validate regular expressions',
    keywords: ['regex', 'regexp', 'pattern', 'match', 'test', 'validate'],
    component: RegexTester,
    icon: TestTube2 as LucideIcon,
  },
  {
    id: 'hex-converter',
    name: 'Hex Converter',
    category: 'encoder',
    description: 'Convert between text and hexadecimal',
    keywords: ['hex', 'hexadecimal', 'binary', 'convert', 'encoding'],
    component: HexConverter,
    icon: Binary as LucideIcon,
  },
  {
    id: 'html-entities',
    name: 'HTML Entities Encoder',
    category: 'encoder',
    description: 'Encode/decode HTML special characters',
    keywords: ['html', 'entities', 'escape', 'unescape', 'xss', 'xml', 'encode'],
    component: HtmlEntities,
    icon: Code2 as LucideIcon,
  },
  {
    id: 'jwt-debugger',
    name: 'JWT Debugger',
    category: 'utility',
    description: 'Decode and validate JWT tokens offline',
    keywords: [
      'jwt',
      'json web token',
      'decode',
      'auth',
      'bearer',
      'security',
      'token',
      'validate',
    ],
    component: JwtDebugger,
    icon: Shield as LucideIcon,
  },
  {
    id: 'gzip-compressor',
    name: 'GZip Compressor',
    category: 'utility',
    description: 'Compress and decompress with GZip/Zlib',
    keywords: ['gzip', 'zlib', 'compress', 'decompress', 'deflate', 'archive', 'compression'],
    component: GzipCompressor,
    icon: Archive as LucideIcon,
  },
  {
    id: 'punycode-encoder',
    name: 'Punycode Encoder',
    category: 'encoder',
    description: 'Encode internationalized domain names',
    keywords: ['punycode', 'idn', 'internationalized', 'domain', 'unicode', 'ascii', 'encode'],
    component: PunycodeEncoder,
    icon: Globe as LucideIcon,
  },
  {
    id: 'morse-code',
    name: 'Morse Code',
    category: 'encoder',
    description: 'Encode/decode text to Morse code',
    keywords: ['morse', 'code', 'telegraph', 'signal', 'sos', 'dots', 'dashes', 'encode', 'decode'],
    component: MorseCode,
    icon: Radio as LucideIcon,
  },
  {
    id: 'base64-image',
    name: 'Base64 Image Encoder',
    category: 'encoder',
    description: 'Convert images to Base64 data URLs',
    keywords: ['base64', 'image', 'data url', 'png', 'jpg', 'encode', 'decode', 'convert'],
    component: Base64Image,
    icon: Image as LucideIcon,
  },
  {
    id: 'url-parser',
    name: 'URL Parser',
    category: 'utility',
    description: 'Parse URLs and edit query parameters',
    keywords: ['url', 'parse', 'query', 'parameters', 'params', 'uri', 'decode', 'analyze'],
    component: UrlParser,
    icon: SplitSquareHorizontal as LucideIcon,
  },
  {
    id: 'lorem-ipsum-generator',
    name: 'Lorem Ipsum Generator',
    category: 'generator',
    description: 'Generate placeholder text for designs',
    keywords: ['lorem', 'ipsum', 'placeholder', 'text', 'filler'],
    component: LoremIpsumGenerator,
    icon: FileText as LucideIcon,
  },
  {
    id: 'secure-password-generator',
    name: 'Secure Password Generator',
    category: 'generator',
    description: 'Generate strong passwords with entropy',
    keywords: ['password', 'secure', 'generator', 'entropy', 'strength'],
    component: SecurePasswordGenerator,
    icon: Shield as LucideIcon,
  },
  {
    id: 'hmac-generator',
    name: 'HMAC Generator',
    category: 'generator',
    description: 'Generate HMAC signatures for API testing',
    keywords: ['hmac', 'signature', 'api', 'auth', 'sha'],
    component: HmacGenerator,
    icon: KeySquare as LucideIcon,
  },
  {
    id: 'qr-code-generator',
    name: 'QR Code Generator',
    category: 'generator',
    description: 'Generate QR codes for URLs and WiFi',
    keywords: ['qr', 'code', 'wifi', 'url', 'barcode'],
    component: QrCodeGenerator,
    icon: ScanLine as LucideIcon,
  },
  {
    id: 'gitignore-generator',
    name: '.gitignore Generator',
    category: 'generator',
    description: 'Generate .gitignore files for any project',
    keywords: ['git', 'gitignore', 'template', 'version control'],
    component: GitignoreGenerator,
    icon: FileCode2 as LucideIcon,
  },
  {
    id: 'rsa-key-pair-generator',
    name: 'RSA Key Pair Generator',
    category: 'generator',
    description: 'Generate RSA public and private keys',
    keywords: ['rsa', 'key', 'pair', 'crypto', 'public', 'private', 'pem'],
    component: RsaKeyPairGenerator,
    icon: Lock as LucideIcon,
  },
  {
    id: 'bcrypt-tester',
    name: 'Bcrypt Tester',
    category: 'generator',
    description: 'Hash and verify passwords with Bcrypt',
    keywords: ['bcrypt', 'password', 'hash', 'verify', 'security'],
    component: BcryptTester,
    icon: Shield as LucideIcon,
  },
  {
    id: 'git-branch-name-generator',
    name: 'Git Branch Name Generator',
    category: 'generator',
    description: 'Convert task titles to branch names',
    keywords: ['git', 'branch', 'kebab-case', 'name', 'naming'],
    component: GitBranchNameGenerator,
    icon: GitBranch as LucideIcon,
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
