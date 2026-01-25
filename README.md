# FerrisBox 🦀📦

**The Developer's Swiss Army Knife** - A blazing-fast, privacy-first developer toolkit built with Rust and Tauri.

![FerrisBox Logo](public/logo.svg)

## Features

FerrisBox is a desktop application that provides essential developer tools with maximum performance and privacy. All processing happens locally on your machine.

### Current Tools (Phase 1)

- **JSON Formatter** - Format, validate, and beautify JSON with syntax highlighting
- **Hash Generator** - Generate SHA-256 and MD5 hashes
- **Base64 Encoder/Decoder** - Encode and decode Base64 strings

### Key Features

- ⚡ **Blazing Fast** - Built with Rust for maximum performance
- 🔒 **Privacy First** - All processing happens locally, no data leaves your machine
- 🌍 **Multi-language** - Supports English and Spanish
- 🎨 **Dark/Light Mode** - Beautiful UI with theme switching
- ⭐ **Favorites** - Mark your most-used tools
- 🔍 **Quick Search** - Find tools instantly
- 📦 **Lightweight** - Small binary size thanks to Tauri

## Tech Stack

- **Backend**: Rust (for blazing-fast tool implementations)
- **Desktop Framework**: Tauri 2.x (lightweight alternative to Electron)
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **i18n**: react-i18next

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Rust](https://www.rust-lang.org/) (latest stable)
- [Tauri Prerequisites](https://tauri.app/v2/guides/prerequisites/)

### Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

### Project Structure

```
ferrisbox/
├── src/                    # React frontend
│   ├── components/         # React components
│   │   ├── layout/        # Layout components
│   │   ├── common/        # Shared components
│   │   └── tools/         # Tool implementations
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities
│   ├── locales/           # Translations
│   └── types/             # TypeScript types
├── src-tauri/             # Rust backend
│   └── src/
│       ├── commands/      # Tauri commands
│       ├── tools/         # Tool implementations
│       ├── storage/       # Config persistence
│       └── utils/         # Utilities
└── public/                # Static assets
```

## Configuration

FerrisBox stores your preferences locally at:

- **macOS/Linux**: `~/.config/ferrisbox/config.json`
- **Windows**: `%APPDATA%\ferrisbox\config.json`

The configuration includes:
- Theme preference (light/dark)
- Language selection
- Favorite tools
- Recent tools

## Keyboard Shortcuts

- `Ctrl+K` (Cmd+K on Mac) - Open command palette *(coming soon)*
- `Ctrl+,` - Open settings *(coming soon)*

## Roadmap

### Phase 2 (Planned)
- [ ] UUID Generator
- [ ] URL Encoder/Decoder
- [ ] Text Diff Tool
- [ ] Regex Tester
- [ ] Image Compressor
- [ ] Command Palette (Ctrl+K)
- [ ] Smart Paste Detection

### Phase 3 (Future)
- [ ] QR Code Generator
- [ ] Password Generator
- [ ] Lorem Ipsum Generator
- [ ] Color Picker & Converter
- [ ] Cron Expression Builder
- [ ] More encoding formats
- [ ] Plugin system

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Credits

Built with ❤️ using:
- [Rust](https://www.rust-lang.org/)
- [Tauri](https://tauri.app/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**FerrisBox** - Rust-powered tools for developers
