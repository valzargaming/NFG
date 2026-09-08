// Jest setup: provide TextEncoder/TextDecoder for jsdom/whatwg-url
const util = require('util');
if (typeof global.TextEncoder === 'undefined') global.TextEncoder = util.TextEncoder;
if (typeof global.TextDecoder === 'undefined') global.TextDecoder = util.TextDecoder;

// minimal CSS.escape polyfill if missing
if (!global.CSS) global.CSS = {};
if (typeof global.CSS.escape !== 'function') {
global.CSS.escape = function (str) {
return String(str).replace(/(["'\\])/g, '\\$1');
};
}

// Load the standalone utilities so coverage can instrument them. They are
// DOM-safe and will attach helpers to `window` when a DOM exists.
// No additional modules required here; keep setup minimal so the
// original `form-generator.html` remains the single runtime source.
