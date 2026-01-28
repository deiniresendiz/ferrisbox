# FerrisBox 🦀📦

**The Developer's Swiss Army Knife** - A blazing-fast, privacy-first desktop toolkit built with Rust and Tauri.

[![Rust](https://img.shields.io/badge/rust-1.80+-orange.svg)](https://www.rust-lang.org/)
[![Tauri](https://img.shields.io/badge/tauri-2.0-blue.svg)](https://tauri.app/)
[![React](https://img.shields.io/badge/react-18-cyan.svg)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🎯 Overview

FerrisBox is a powerful desktop application that provides essential developer tools with maximum performance and complete privacy. All processing happens locally on your machine - no data ever leaves your device.

## ✨ Features

- ⚡ **Blazing Fast** - Built with Rust for maximum performance
- 🔒 **Privacy First** - All processing happens locally, no data leaves your machine
- 🌍 **Multi-language** - Supports English, Spanish, Portuguese and Chinese
- 🎨 **Dark/Light Mode** - Beautiful UI with theme switching
- ⭐ **Favorites** - Mark your most-used tools for quick access
- 🔍 **Quick Search** - Find tools instantly with Command Palette (Ctrl+K)
- 🧠 **Smart Paste** - Auto-detect clipboard content and suggest the right tool
- 📦 **Lightweight** - Small binary size thanks to Tauri

## 🛠️ Available Tools

### Formatters 📝

| Tool                     | Description                               | Features                                      |
| ------------------------ | ----------------------------------------- | --------------------------------------------- |
| **JSON Formatter**       | Format, validate and beautify JSON        | Syntax highlighting, minification, validation |
| **XML Formatter**        | Format, validate and beautify XML         | Proper indentation, validation                |
| **SQL Formatter**        | Format SQL with multiple dialect support  | PostgreSQL, MySQL, SQLite compatible          |
| **CSS Formatter**        | Format, validate and beautify CSS/SCSS    | Minification, style validation                |
| **JavaScript Formatter** | Format and validate JavaScript/TypeScript | Pretty print, syntax checking                 |
| **YAML Formatter**       | Format, validate and beautify YAML        | Config file formatting                        |
| **Rust Formatter**       | Format and validate Rust code             | Uses rustfmt, syntax validation               |

### Encoders & Decoders 🔐

| Tool                       | Description                           | Features                    |
| -------------------------- | ------------------------------------- | --------------------------- |
| **Base64 Encoder/Decoder** | Encode or decode Base64 strings       | Text and binary support     |
| **URL Encoder/Decoder**    | Encode or decode URL strings          | Percent-encoding support    |
| **Hex Converter**          | Convert between text and hexadecimal  | Binary representation       |
| **HTML Entities Encoder**  | Encode/decode HTML special characters | XSS prevention              |
| **Punycode Encoder**       | Encode internationalized domain names | IDN to ASCII conversion     |
| **Morse Code**             | Encode/decode text to Morse code      | Signal representation       |
| **Base64 Image Encoder**   | Convert images to Base64 data URLs    | PNG, JPG support            |
| **String Escaper**         | Escape/unescape code strings          | JS, Java, HTML, URL support |

### Generators 🎲

| Tool                          | Description                                | Features                |
| ----------------------------- | ------------------------------------------ | ----------------------- |
| **UUID Generator**            | Generate UUIDs (v4 random or v7 timestamp) | Multiple formats        |
| **Lorem Ipsum Generator**     | Generate placeholder text for designs      | Configurable length     |
| **Secure Password Generator** | Generate strong passwords with entropy     | Customizable complexity |
| **HMAC Generator**            | Generate HMAC signatures for API testing   | SHA-256, SHA-1 support  |
| **QR Code Generator**         | Generate QR codes for URLs and WiFi        | PNG export              |
| **.gitignore Generator**      | Generate .gitignore files for any project  | Multiple templates      |
| **RSA Key Pair Generator**    | Generate RSA public and private keys       | PEM format              |
| **Bcrypt Tester**             | Hash and verify passwords with Bcrypt      | Security testing        |
| **Git Branch Name Generator** | Convert task titles to branch names        | Kebab-case conversion   |
| **ASCII Art Generator**       | Generate ASCII banners from text           | Multiple fonts (figlet) |

### Utilities 🧰

| Tool                | Description                                  | Features                   |
| ------------------- | -------------------------------------------- | -------------------------- |
| **Hash Generator**  | Generate cryptographic hashes (SHA-256, MD5) | Checksum generation        |
| **Regex Tester**    | Test and validate regular expressions        | Match highlighting         |
| **JWT Debugger**    | Decode and validate JWT tokens offline       | Header, payload, signature |
| **GZip Compressor** | Compress and decompress with GZip/Zlib       | Archive support            |
| **URL Parser**      | Parse URLs and edit query parameters         | Parameter editing          |
| **Word Counter**    | Detailed text statistics                     | Words, chars, reading time |
| **List Sorter**     | Sort and organize text lists                 | Unique, shuffle, length    |

### Converters 🔄

| Tool                      | Description                                     | Features                     |
| ------------------------- | ----------------------------------------------- | ---------------------------- |
| **Timestamp Converter**   | Convert Unix timestamps to human-readable dates | Timezone support             |
| **Units Converter**       | Convert between different units of measurement  | Data, Time, Frequency        |
| **Number Base Converter** | Convert numbers between different bases         | Binary, Octal, Decimal, Hex  |
| **Markdown to HTML**      | Convert Markdown to HTML                        | Code formatting              |
| **CSV to JSON**           | Convert CSV data to JSON format                 | Configurable delimiter       |
| **JSON/YAML Converter**   | Convert between JSON and YAML formats           | Bidirectional conversion     |
| **Color Picker**          | Convert colors between different formats        | HEX, RGB, HSL, CMYK          |
| **Text Diff**             | Compare two texts and see differences           | Side-by-side & Unified views |
| **Case Converter**        | Change text naming conventions                  | camelCase, snake_case, etc.  |

### Network 🌐

| Tool                  | Description                         | Features                    |
| --------------------- | ----------------------------------- | --------------------------- |
| **IP Info**           | Get local and public IP information | Real-time detection         |
| **Port Scanner**      | Scan common ports on localhost      | Fast TCP scanning           |
| **DNS Lookup**        | Query DNS records for any domain    | A, AAAA, MX, TXT, CNAME, NS |
| **HTTP Status Codes** | Reference for HTTP response codes   | Full list with descriptions |

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Rust](https://www.rust-lang.org/) (latest stable)
- [Tauri Prerequisites](https://tauri.app/v2/guides/prerequisites/)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/ferrisbox.git
cd ferrisbox

# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

## 📁 Project Structure

```
ferrisbox/
├── src/                    # React frontend
│   ├── components/         # React components
│   │   ├── layout/        # Layout components (Header, Sidebar, etc.)
│   │   ├── common/        # Shared components (Button, Input, etc.)
│   │   └── tools/         # Tool implementations
│   ├── contexts/          # React contexts (Theme, Favorites, etc.)
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities and helpers
│   ├── locales/           # Translations (en, es, pt, zh)
│   └── types/             # TypeScript type definitions
├── src-tauri/             # Rust backend
│   └── src/
│       ├── commands/      # Tauri command wrappers
│       ├── tools/         # Core tool implementations
│       │   ├── encoders/  # Encoding tools
│       │   ├── formatters/ # Formatting tools
│       │   ├── generators/ # Generation tools
│       │   ├── utilities/  # Utility tools
│       │   ├── converters/ # Conversion tools
│       │   └── network/    # Network tools
│       ├── storage/       # Configuration persistence
│       └── utils/         # Helper functions
└── public/                # Static assets (logo, icons, etc.)
```

## ⚙️ Configuration

FerrisBox stores your preferences locally at:

- **macOS/Linux**: `~/.config/ferrisbox/config.json`
- **Windows**: `%APPDATA%\ferrisbox\config.json`

The configuration includes:

- Theme preference (light/dark)
- Language selection
- Favorite tools
- Recent tools

## ⌨️ Keyboard Shortcuts

| Shortcut                | Action                                       |
| ----------------------- | -------------------------------------------- |
| `Ctrl+K` (Cmd+K on Mac) | Open Command Palette for instant tool search |
| `Ctrl+,`                | Open settings _(coming soon)_                |

## 🛠️ Tech Stack

### Backend

- **Rust** - High-performance tool implementations
- **Tauri 2.x** - Lightweight desktop framework
- **Serde** - Serialization/deserialization

### Frontend

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icons
- **react-i18next** - Internationalization

## 🗺️ Roadmap

### Phase 1 (✅ Completed)

- [x] JSON Formatter
- [x] Hash Generator
- [x] Base64 Encoder/Decoder
- [x] Basic UI with dark mode
- [x] Multi-language support (EN, ES)

### Phase 2 (✅ Completed)

- [x] UUID Generator (v4/v7)
- [x] URL Encoder/Decoder
- [x] Command Palette (Ctrl+K)
- [x] Smart Paste Detection

### Phase 3 (✅ Completed)

- [x] Regex Tester
- [x] Additional encoders (Hex, HTML Entities, Punycode, Morse)
- [x] JWT Debugger
- [x] GZip Compressor

### Phase 4 (✅ Completed)

- [x] XML, SQL, CSS, JavaScript, YAML, Rust Formatters
- [x] QR Code Generator
- [x] Password Generator
- [x] Lorem Ipsum Generator
- [x] HMAC Generator
- [x] .gitignore Generator
- [x] RSA Key Pair Generator
- [x] Bcrypt Tester
- [x] Git Branch Name Generator
- [x] URL Parser
- [x] Base64 Image Encoder

### Phase 5 (✅ Completed)

- [x] Text Diff Tool
- [x] Color Picker & Converter
- [x] Timestamp Converter
- [x] Cron Expression Parser
- [x] Number Base Converter
- [x] Unit Converter (Data, Time, Frequency)
- [x] Markdown to HTML Converter
- [x] JSON/YAML Converter
- [x] CSV to JSON Converter

### Phase 6 (✅ Completed)

- [x] IP Information Tool
- [x] Port Scanner
- [x] DNS Lookup Utility
- [x] HTTP Status Codes Reference
- [x] Word Counter & Text Statistics
- [x] Case Converter (camel, snake, etc.)
- [x] String Escaper/Unescaper
- [x] ASCII Art Generator
- [x] List Sorter & Organizer

### Phase 7 (Future)

- [ ] Image Compressor
- [ ] CURL to Code Converter
- [ ] More encoding formats
- [ ] Plugin system
- [ ] Custom tool builder

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Development

### Running Tests

```bash
# Frontend tests
npm test

# Backend tests
cd src-tauri && cargo test

# Run tests with output
cd src-tauri && cargo test -- --nocapture
```

### Code Quality

```bash
# Lint TypeScript
npm run lint

# Format TypeScript/React
npm run format

# Format Rust
cd src-tauri && cargo fmt

# Lint Rust
cd src-tauri && cargo clippy
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Credits

Built with ❤️ using:

- [Rust](https://www.rust-lang.org/) - Systems programming language
- [Tauri](https://tauri.app/) - Build smaller, faster, and more secure desktop applications
- [React](https://react.dev/) - The library for web and native user interfaces
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Lucide](https://lucide.dev/) - Beautiful & consistent icon toolkit

## 📊 Stats

- **Total Tools**: 45
- **Categories**: 6 (Formatters, Encoders, Generators, Converters, Utilities, Network)
- **Languages**: 4 (English, Spanish, Portuguese, Chinese)
- **Themes**: 2 (Light, Dark)

---

**FerrisBox** - 🦀 Rust-powered tools for developers

Made with ❤️ by [FerrisBox Team](https://github.com/yourusername/ferrisbox)
