/**
 * Patterns that would make the built app depend on the network. The app must
 * run from a single file with no internet access, so every stylesheet, script,
 * font and image has to be inline.
 *
 * @type {Array<{name: string, pattern: RegExp}>}
 */
const RULES = [
  { name: 'absolute URL', pattern: /\b(?:https?|wss?|ftp):\/\/[^\s"'<>)]*/gi },
  { name: 'protocol-relative URL', pattern: /["'(=]\s*\/\/[a-z0-9][^\s"'<>)]*/gi },
  { name: '<link> element', pattern: /<link\b[^>]*>/gi },
  { name: 'external <script src>', pattern: /<script\b[^>]*\bsrc\s*=[^>]*>/gi },
  {
    name: 'embedded resource element',
    pattern: /<(?:img|iframe|object|embed|video|audio|source|track|base)\b[^>]*>/gi,
  },
  { name: 'CSS @import', pattern: /@import\b[^;\n]*/gi },
  { name: 'CSS url() that is not a data: URI', pattern: /\burl\(\s*["']?(?!data:)[^)]*\)/gi },
  {
    name: 'network API',
    pattern:
      /\b(?:fetch\s*\(|XMLHttpRequest\b|WebSocket\b|EventSource\b|sendBeacon\b|importScripts\b|serviceWorker\b|import\s*\()/g,
  },
];

/**
 * Find everything in `text` that would load from, or talk to, the network.
 *
 * @param {string} text  HTML, CSS or JavaScript source to scan.
 * @returns {Array<{rule: string, match: string, line: number}>} One entry per
 *   offending match; empty when the text is fully self-contained.
 */
function findExternalReferences(text) {
  const source = String(text);
  const found = [];
  for (const { name, pattern } of RULES) {
    for (const hit of source.matchAll(pattern)) {
      found.push({
        rule: name,
        match: hit[0].slice(0, 120),
        line: source.slice(0, hit.index).split('\n').length,
      });
    }
  }
  return found.sort((a, b) => a.line - b.line);
}

module.exports = { findExternalReferences };
