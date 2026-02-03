# NFG

A note form generator without dependencies made in JavaScript and HTML

## Installation

Prerequisites: Node.js (16+) and npm.

Install dependencies:

```bash
cd D:\GitHub\NFG
npm install
```

If you encounter peer dependency errors on older npm versions, you can run:

```bash
npm install --legacy-peer-deps
```

## Running Tests

Run the test suite once:

```bash
npm test
```

Run Jest in watch mode (re-runs on file changes):

```bash
npm run test:watch
```

## Code Style / CS-Fixer

This project uses Prettier and ESLint. A convenience fixer script is provided:

```bash
npm run cs-fixer
```

Run only Prettier formatting:

```bash
npm run cs-fixer:prettier
```

Run only ESLint auto-fixes:

```bash
npm run cs-fixer:eslint
```

## Contributing

- Fork the repo and open a branch for your changes.
- Run `npm install` and make sure tests pass: `npm test`.
- Run the fixer before opening a PR: `npm run cs-fixer`.
- Keep changes focused and add tests for bug fixes or new features.
- Prefer small, well-described commits and include a clear PR description.

## Notes

- ESLint uses a flat config (`eslint.config.js`) compatible with ESLint v9+.
- If you have permission issues installing dependencies on Windows, run an elevated PowerShell and re-run `npm install`.

- Runtime: This project does not require any external services or runtime dependencies to function — the packaged HTML/JS runs standalone in a browser or embedded environment. The Node.js packages in `devDependencies` are provided only to assist development (testing, linting, formatting).

## Build / Distribution

- `npm run build` produces distributable bundles for Node consumers:
  - `dist/index.esm.js` (ES module)
  - `dist/index.cjs.js` (CommonJS)
- `npm run build:browser` produces a browser-friendly IIFE bundle at `dist/form-generator.js`.
- `npm run build:html` copies the repository's `src/form-generator.html` into `dist/form-generator.html` and will auto-mount the IIFE bundle when present.
- `npm run build:all` runs all build steps. The `prepare` script runs `build` so `npm publish` / `npm pack` will include `dist/` artifacts.

Usage with the dist files:

```bash
# Open a standalone demo in your browser:
open dist/form-generator.html

# Or import the package in ESM consumers:
import { mount } from 'note-form-generator';
mount(document.getElementById('root'));
```
