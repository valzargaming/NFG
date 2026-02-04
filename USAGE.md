# Using NFG as a Dependency

This guide explains how third-party projects can consume the NFG (note form
generator) code. It covers installing from npm (published package), from the
Git repository, using a local path or tarball, and including the runtime
assets directly in a browser.

## Key points

- The runtime HTML/JS produced by this project has no external runtime
  dependencies — it runs standalone in a browser.
- The Node.js packages listed in `devDependencies` are only for development
  tasks (testing, linting, formatting). Consumers who only need the runtime
  HTML/JS do not need to install those devDependencies.

## 1) Publish & install from npm (recommended for distribution)

Steps for the package author:

1. Ensure `package.json` contains metadata: `name`, `version`, `license`,
   `repository`, and an entry point such as `main` or `module`. Use `files` or
   `exports` to restrict what is published.

Example package.json fragment:

```json
{
  "name": "@yourorg/nfg",
  "version": "0.1.0",
  "license": "MIT",
  "repository": "https://github.com/youruser/your-repo",
  "main": "dist/index.cjs.js",
  "module": "dist/index.esm.js",
  "files": ["dist/", "src/form-generator.html"]
}
```

2. (Optional) Build a distributable bundle for consumers. Example using
   `esbuild`:

```bash
npx esbuild src/index.js --bundle --format=esm --outfile=dist/index.esm.js
npx esbuild src/index.js --bundle --format=cjs --outfile=dist/index.cjs.js
```

This repository also provides convenience scripts to produce browser-ready
artifacts:

- `npm run build` — creates `dist/index.esm.js` and `dist/index.cjs.js`.
- `npm run build:browser` — creates `dist/form-generator.js` (IIFE global `NFG`).
  -- `npm run build:html` — copies `src/form-generator.html` into `dist/` (the
  generated HTML will auto-mount the IIFE bundle if present).

The `files` field in `package.json` includes `dist/` and `src/form-generator.html`, so these
artifacts will be included when publishing.

3. Publish to npm. If you use a scoped package name (starts with `@scope/`) and
   want it to be public, include `--access public`:

```bash
npm login
npm publish --access public  # for scoped public packages
# or for unscoped packages, just: npm publish
```

Notes for authors:

- Use semantic versioning (`MAJOR.MINOR.PATCH`) and create a Git tag for
  releases.
- Include a license file and repository field so consumers can find the
  source.

Consumer installation:

```bash
npm install @yourorg/nfg
```

Import examples:

ESM:

```js
import { scanPopulate } from '@yourorg/nfg';
```

CommonJS:

```js
const { scanPopulate } = require('@yourorg/nfg');
```

## 2) Install directly from a Git repository

No publishing required. In the consumer project:

```bash
npm install github:youruser/your-repo
# or a specific tag/commit
npm install github:youruser/your-repo#v0.1.0
```

Notes: Consumers get the repository files as-is. If your repo needs a build
step, include built assets in the repository or configure a `prepare` script
so npm runs the build on install.

## 3) Local path or tarball (good for local development)

Local path (from consumer project):

```bash
npm install ../path/to/NFG
```

Tarball (author side):

```bash
# in NFG
npm pack
# installs note-form-generator-0.1.0.tgz in consumer project
npm install ../note-form-generator-0.1.0.tgz
```

## 4) Include runtime assets directly in a browser (no npm required)

If the consumer only needs the runtime HTML/JS, they can copy `src/form-generator.html`
or the generated JS into their site and include it with a script tag.

Example:

```html
<!-- copy/paste the minimal runtime bundle or src/form-generator.html contents -->
<script src="/path/to/form-generator.js"></script>
```

## 5) Making NFG easy to consume (recommended developer tasks)

- Provide a small entry `src/index.js` that exports the public functions (e.g.
  `scanPopulate`, initialization helpers).
- Add `main`/`module` and `files` in `package.json` so npm packages include
  only the required files.
- Optionally add a tiny build step that bundles a browser-friendly UMD/ESM file
  if you plan to support script-tag usage.

## 6) Troubleshooting & notes

- If consumers install from Git and the repo requires a build, add a `prepare`
  script in `package.json` so npm runs it on install:

```json
"scripts": {
  "prepare": "npm run build"
}
```

- For local testing, `npm link` can also be useful:

```bash
# in NFG
npm link
# in consumer
npm link note-form-generator
```

---
