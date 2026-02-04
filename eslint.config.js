const htmlParser = require('@html-eslint/parser');
const htmlPlugin = require('@html-eslint/eslint-plugin');

module.exports = [
{
  ignores: [
    'node_modules/**',
    'coverage/**',
    'dist/**',
    'build/**',
    'tests/**',
    '**/*.test.js',
    'eslint.config.js',
    '.eslintrc.json',
    'tmp_lint/**',
  ],
},
// Disable a couple of HTML structural rules that produce false-positives
// for JSDoc and embedded snippets inside JS test files.
{
rules: {
'@html-eslint/require-closing-tags': 'off',
'@html-eslint/require-lang': 'off'
}
},
// Include the plugin's flat recommended configuration for HTML files so
// embedded <script> blocks are parsed and linted.
  (htmlPlugin.configs && htmlPlugin.configs['flat/recommended'])
    ? htmlPlugin.configs['flat/recommended']
    : {
        files: ['**/*.html'],
        languageOptions: { parser: htmlParser },
        rules: {},
      },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {},
  },
  {
    files: ['**/*.test.js'],
    rules: {},
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
  },
  // Override: disable a couple of HTML structural rules that create false-positives
  // inside JS test files and extracted scripts.
  {
    rules: {
      '@html-eslint/require-closing-tags': 'off',
      '@html-eslint/require-lang': 'off'
    }
  },
];
