# FerrisBox - Getting Started

## Installation

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) v18 or higher
- [Rust](https://www.rust-lang.org/tools/install)
- Platform-specific prerequisites:
  - **macOS**: Xcode Command Line Tools
  - **Linux**: See [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/#linux)
  - **Windows**: See [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/#windows)

## Quick Start

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

## Development

### Frontend Development
```bash
# Start Vite dev server only
npm run dev

# Build frontend
npm run build

# Preview production build
npm run preview
```

### Backend Development
```bash
# Check Rust code
cd src-tauri && cargo check

# Run Rust tests
cd src-tauri && cargo test

# Build Rust backend
cd src-tauri && cargo build
```

### Code Quality
```bash
# Run linter
npm run lint

# Format code
npm run format

# Run tests
npm test
```

## Project Structure

```
ferrisbox/
├── src/                       # React frontend
│   ├── components/           # React components
│   ├── contexts/             # React contexts (theme, i18n, etc.)
│   ├── lib/                  # Tools registry and utilities
│   ├── locales/              # Translations (en, es)
│   ├── styles/               # Global styles
│   └── types/                # TypeScript types
├── src-tauri/                # Rust backend
│   └── src/
│       ├── commands/         # Tauri commands (API bridge)
│       ├── tools/            # Tool implementations
│       ├── storage/          # Config persistence
│       └── utils/            # Utilities (content detection)
└── public/                   # Static assets
```

## Features

### Current Tools
- **JSON Formatter** - Format, validate, minify JSON
- **Hash Generator** - Generate SHA-256 and MD5 hashes
- **Base64 Encoder/Decoder** - Encode and decode Base64

### Key Features
- Dark/Light theme
- Multi-language support (English/Spanish)
- Favorites system
- Search functionality
- Local configuration persistence

## Configuration

Configuration is stored at:
- **macOS/Linux**: `~/.config/ferrisbox/config.json`
- **Windows**: `%APPDATA%\ferrisbox\config.json`

## Troubleshooting

### Build fails on macOS
Make sure you have Xcode Command Line Tools installed:
```bash
xcode-select --install
```

### Build fails on Linux
Install required dependencies:
```bash
sudo apt-get update
sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

### Frontend not updating
Clear the Vite cache:
```bash
rm -rf node_modules/.vite
npm run dev
```

## Next Steps

Check the main README.md for:
- Roadmap and planned features
- Contributing guidelines
- License information

---

Built with Rust + Tauri + React
