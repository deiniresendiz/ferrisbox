# FerrisBox - Agent Development Guide

This document provides guidelines for agentic coding assistants working on the FerrisBox codebase.

## Build & Test Commands

### Frontend (React + TypeScript)
```bash
# Development server (Vite only)
npm run dev

# Full development (Tauri + React)
npm run tauri dev

# Build for production
npm run build

# Type checking only
tsc --noEmit

# Run all tests
npm run test

# Run tests in watch mode
npm test

# Run a single test (pattern match)
npm test -- --run <test-name-or-file>
```

### Backend (Rust)
```bash
# Build Rust backend (debug)
cd src-tauri && cargo build

# Build Rust backend (release)
cd src-tauri && cargo build --release

# Run Rust tests
cd src-tauri && cargo test

# Run a single test
cd src-tauri && cargo test <test_name>

# Run tests with output
cd src-tauri && cargo test -- --nocapture

# Check without building
cd src-tauri && cargo check

# Format Rust code
cd src-tauri && cargo fmt

# Lint Rust code
cd src-tauri && cargo clippy
```

### Linting & Formatting
```bash
# Lint TypeScript
npm run lint

# Format TypeScript/React
npm run format

# Format Rust
cd src-tauri && cargo fmt
```

## Code Style Guidelines

### TypeScript/React

**File Naming:**
- Components: PascalCase (e.g., `JsonFormatter.tsx`)
- Utilities/libraries: camelCase (e.g., `tools-registry.ts`)
- Test files: `<ComponentName>.test.tsx` or `<ComponentName>.spec.tsx`

**Component Structure:**
```typescript
import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { Star, Copy } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

type CustomType = 'option1' | 'option2';

export const ComponentName: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [state, setState] = useState<string>('');

  const toolId = 'tool-identifier';
  const favorite = isFavorite(toolId);

  const handleAction = async () => {
    try {
      const result = await invoke<Type>('command_name', { param: value });
      setState(result);
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* JSX content */}
    </div>
  );
};
```

**Import Order:**
1. React imports
2. Third-party library imports (tauri, react-i18next, lucide-react)
3. Local imports (contexts, components, types, utils)

**Type Definitions:**
- Use `type` for unions and type aliases
- Use `interface` for object shapes
- Define tool-specific types at component top if only used locally
- Share types in `src/types/index.ts` if used across multiple files

**Styling:**
- Use Tailwind CSS classes
- Use `clsx` for conditional classes
- Dark mode: `dark:space-XXX` pattern for deep space theme
- Use `max-w-4xl mx-auto` for container centering
- Buttons: `btn btn-primary` or `btn btn-secondary` utility classes

**Error Handling:**
- Always use try/catch around async Tauri invocations
- Set error state and display to user
- Log errors with console.error
- Clear error state on successful operations

**i18n:**
- Use `useTranslation()` hook for all user-facing text
- Translation keys follow pattern: `category.toolName.property`
- Add translations to both `src/locales/en.json` and `src/locales/es.json`
- Tool names: `t('tools.toolId.name')`

**State Management:**
- Use React hooks (useState, useEffect) for local state
- Use Context providers for app-wide state (Theme, Language, Favorites)
- Custom hooks: useFavorites, useTheme, useLanguage

### Rust

**File Organization:**
```
src-tauri/src/
├── commands/       # Tauri command wrappers
├── tools/          # Core business logic
│   ├── encoders/
│   ├── formatters/
│   ├── generators/
│   └── utilities/
├── storage/        # Config persistence
└── utils/          # Helper functions
```

**Naming Conventions:**
- Modules/files: snake_case (e.g., `formatters.rs`, `base64_encoder.rs`)
- Functions: snake_case (e.g., `format_json`, `generate_hash`)
- Types: PascalCase (e.g., `FormatError`, `HashAlgorithm`)
- Constants: SCREAMING_SNAKE_CASE
- Tauri commands: append `_command` suffix (e.g., `format_json_command`)

**Tauri Command Pattern:**
```rust
use crate::tools::module::function_name;

#[tauri::command]
pub async fn command_name(param: String, optional_param: Option<usize>) -> Result<String, String> {
    function_name(&param, optional_param.unwrap_or_default())
        .map_err(|e| e.to_string())
}
```

**Error Handling:**
- Define custom error enums with `thiserror`
- Use `Result<T, String>` for Tauri commands
- Use `map_err(|e| e.to_string())` for error conversion
- Error messages should be user-friendly

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ToolError {
    #[error("Invalid input: {0}")]
    InvalidInput(String),
    #[error("Serialization failed: {0}")]
    SerializationError(#[from] serde_json::Error),
}
```

**Module Structure:**
- Each tool category has its own directory
- Each directory has `mod.rs` exporting public functions
- Use `pub mod` declarations in parent modules
- Re-export at `src/lib.rs` or appropriate module level

**Registration in lib.rs:**
```rust
// Import command modules
use commands::{formatters, generators, encoders, utilities};

// Register in invoke_handler
.invoke_handler(tauri::generate_handler![
    formatters::format_json_command,
    generators::generate_uuid_command,
    // ... other commands
])
```

### Adding a New Tool

**Step 1 - Backend (Rust):**
1. Create tool logic in `src-tauri/src/tools/category/tool_name.rs`
2. Export functions in `src-tauri/src/tools/category/mod.rs`
3. Create Tauri command wrapper in `src-tauri/src/commands/category.rs`
4. Export command module in `src-tauri/src/commands/mod.rs`
5. Register command in `src-tauri/src/lib.rs`
6. Add dependencies to `src-tauri/Cargo.toml` if needed

**Step 2 - Frontend (React):**
1. Create component in `src/components/tools/ToolName.tsx`
2. Add icon import and component import to `src/lib/tools-registry.ts`
3. Add tool to `TOOLS` array with: id, name, category, description, keywords, component, icon
4. Add translations to `src/locales/en.json` and `src/locales/es.json`
5. Run `npm run build` and `cd src-tauri && cargo build` to verify

**Tool Requirements:**
- Favorite button (star icon)
- Tool ID: kebab-case (e.g., `tool-name`)
- Consistent layout with header, input/output areas
- Error handling and user feedback
- Copy to clipboard functionality
- Dark/light theme support
- Descriptive keywords for search

## Key Patterns

### Tool Component Structure
- Header with title, description, and favorite button
- Input area with clear labels
- Action buttons (primary/secondary)
- Output display with copy functionality
- Error message display

### Color Theme
- Primary: Rust Orange (#F74C00)
- Dark: Deep Space (#0F172A, #1E293B, #334155)
- Light: White/Gray scale
- Use Tailwind: `text-gray-900 dark:text-gray-100` pattern

### TypeScript Config
- Strict mode enabled
- No implicit any (warns)
- No unused locals/parameters
- React JSX transform

## Important Notes

- Never commit API keys or secrets
- All processing happens locally (privacy-first)
- Tauri dev server runs on port 1420
- Config stored in `~/.config/ferrisbox/config.json`
- Always test both light and dark themes
- Check English AND Spanish translations
- Run `npm run lint` and `cd src-tauri && cargo clippy` before committing
