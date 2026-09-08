const js = require('@eslint/js');
const htmlPlugin = require('@html-eslint/eslint-plugin');
const htmlParser = require('@html-eslint/parser');

const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  localStorage: 'readonly',
  location: 'readonly',
  URL: 'readonly',
  Blob: 'readonly',
  FileReader: 'readonly',
  CSS: 'readonly',
  alert: 'readonly',
  confirm: 'readonly',
  prompt: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  console: 'readonly',
};

const nodeGlobals = {
  require: 'readonly',
  module: 'writable',
  exports: 'writable',
  process: 'readonly',
  __dirname: 'readonly',
  __filename: 'readonly',
  Buffer: 'readonly',
  console: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
};

const jestGlobals = {
  jest: 'readonly',
  describe: 'readonly',
  it: 'readonly',
  test: 'readonly',
  expect: 'readonly',
  beforeEach: 'readonly',
  afterEach: 'readonly',
  beforeAll: 'readonly',
  afterAll: 'readonly',
};

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'dist/**',
      'build/**',
      'tmp_lint/**',
      '.tmp_lint/**',
      'src/embedded-html.js',
    ],
  },

  // All hand-written JavaScript: Node/CommonJS.
  {
    files: ['**/*.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'commonjs', globals: nodeGlobals },
    rules: {
      ...js.configs.recommended.rules,
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },

  // The package entry also runs in the browser (mount()).
  {
    files: ['src/index.js'],
    languageOptions: { globals: { ...nodeGlobals, ...browserGlobals } },
  },

  // Test files also see Jest globals.
  {
    files: ['tests/**/*.js', '**/*.test.js'],
    languageOptions: { globals: { ...nodeGlobals, ...jestGlobals } },
  },

  // The single-file browser app — HTML parser, only structural rules.
  {
    files: ['src/**/*.html'],
    plugins: { '@html-eslint': htmlPlugin },
    languageOptions: { parser: htmlParser },
    rules: {
      '@html-eslint/no-duplicate-attrs': 'error',
      '@html-eslint/no-duplicate-id': 'error',
      '@html-eslint/require-doctype': 'error',
      '@html-eslint/no-obsolete-tags': 'error',
    },
  },
];
