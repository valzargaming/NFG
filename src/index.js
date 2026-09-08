// Public entry point for the `note-form-generator` package.
//
// The real application is the single-file `src/form-generator.html`. This module
// ships that exact document (embedded at build time by scripts/generate-html.js,
// with a filesystem fallback for a fresh checkout) and mounts it as a live,
// script-running iframe — not an inert innerHTML dump.

function loadHtml() {
  try {
    const embedded = require('./embedded-html.js');
    if (typeof embedded === 'string' && embedded.indexOf('<script') !== -1) return embedded;
  } catch (e) {
    /* not generated yet — fall through */
  }
  // Fresh checkout, running under Node (e.g. Jest) before `build:html`.
  // Indirect require so browser bundlers never try to resolve `fs`/`path`.
  try {
    const nodeRequire = eval('typeof require === "function" ? require : null');
    if (nodeRequire) {
      const fs = nodeRequire('fs');
      const path = nodeRequire('path');
      return fs.readFileSync(path.join(__dirname, 'form-generator.html'), 'utf8');
    }
  } catch (e) {
    /* not in Node — give up */
  }
  return '';
}

const html = loadHtml();

/**
 * Mount the form generator into `container` as an isolated, fully functional
 * iframe.
 *
 * @param {Element|string} container  A DOM element or a CSS selector.
 * @param {object} [options]
 * @param {Array}  [options.formConfig]  Seed `window.formConfig` for the app.
 * @param {string} [options.height]      CSS height for the iframe (default '100%').
 * @returns {HTMLIFrameElement} The created iframe.
 */
function mount(container, options) {
  const opts = options || {};
  if (typeof container === 'string') {
    container = document.querySelector(container);
  }
  if (!container || typeof container.appendChild !== 'function') {
    throw new Error('mount(): first argument must be a DOM element or a selector that resolves to one');
  }
  if (!html) {
    throw new Error('mount(): runtime HTML is unavailable — run `npm run build:html`');
  }

  let doc = html;
  if (Array.isArray(opts.formConfig)) {
    const seed =
      '<script>window.formConfig = ' +
      JSON.stringify(opts.formConfig).replace(/</g, '\\u003c') +
      ';<' +
      '/script>';
    doc = doc.replace(/<head(\s[^>]*)?>/i, (m) => m + seed);
  }

  const ownerDoc = container.ownerDocument || (typeof document !== 'undefined' ? document : null);
  if (!ownerDoc) {
    throw new Error('mount(): no document available to create the iframe');
  }
  const iframe = ownerDoc.createElement('iframe');
  iframe.setAttribute('title', 'Note Form Generator');
  iframe.style.border = '0';
  iframe.style.width = '100%';
  iframe.style.height = opts.height || '100%';
  iframe.srcdoc = doc;

  container.innerHTML = '';
  container.appendChild(iframe);
  return iframe;
}

module.exports = { html, mount };
module.exports.default = module.exports;
