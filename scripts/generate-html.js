const fs = require('fs');
const path = require('path');

const outDir = path.resolve(__dirname, '..', 'dist');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Copy the existing root `form-generator.html` into `dist/` so the original
// inline script runs when opened in the browser.
const srcHtmlPath = path.resolve(__dirname, '..', 'form-generator.html');
if (!fs.existsSync(srcHtmlPath)) {
  console.error('Source form-generator.html not found at', srcHtmlPath);
  process.exit(1);
}
const srcHtml = fs.readFileSync(srcHtmlPath, 'utf8');
fs.writeFileSync(path.join(outDir, 'form-generator.html'), srcHtml, 'utf8');
console.log('Copied', srcHtmlPath, 'to', path.join(outDir, 'form-generator.html'));
