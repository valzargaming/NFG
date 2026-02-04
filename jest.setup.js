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
