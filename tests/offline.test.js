const fs = require('fs');
const path = require('path');
const { findExternalReferences } = require('../scripts/offline-check');

const root = path.resolve(__dirname, '..');

describe('offline, self-contained build', () => {
  test('the app source references nothing outside itself', () => {
    const html = fs.readFileSync(path.join(root, 'src', 'form-generator.html'), 'utf8');
    expect(findExternalReferences(html)).toEqual([]);
  });

  test('the package entry point references nothing outside itself', () => {
    const js = fs.readFileSync(path.join(root, 'src', 'index.js'), 'utf8');
    expect(findExternalReferences(js)).toEqual([]);
  });

  test('every built file references nothing outside itself', () => {
    const dist = path.join(root, 'dist');
    const files = fs.readdirSync(dist).filter((f) => /\.(html|js|css)$/.test(f));
    expect(files).toEqual(expect.arrayContaining(['index.html', 'form-generator.html']));
    for (const file of files) {
      const found = findExternalReferences(fs.readFileSync(path.join(dist, file), 'utf8'));
      expect({ file, found }).toEqual({ file, found: [] });
    }
  });

  test.each([
    ['external stylesheet', '<link rel="stylesheet" href="style.css" />'],
    ['CDN stylesheet', '<link href="https://cdn.example.com/a.css" rel="stylesheet">'],
    ['external script', '<script src="app.js"></script>'],
    ['protocol-relative script', '<script src="//cdn.example.com/a.js"></script>'],
    ['web font import', "@import url('https://fonts.example.com/css?family=Inter');"],
    ['font file', "@font-face { font-family: X; src: url('x.woff2'); }"],
    ['background image', 'body { background: url(bg.png); }'],
    ['image element', '<img src="logo.png" alt="" />'],
    ['iframe', '<iframe src="about.html"></iframe>'],
    ['fetch call', "fetch('/api/forms')"],
    ['XMLHttpRequest', 'new XMLHttpRequest()'],
    ['WebSocket', "new WebSocket('wss://example.com')"],
    ['dynamic import', "import('./chunk.js')"],
    ['beacon', "navigator.sendBeacon('/log')"],
  ])('flags %s', (_label, snippet) => {
    expect(findExternalReferences(snippet).length).toBeGreaterThan(0);
  });

  test.each([
    ['inline style', '<style>body { color: red; }</style>'],
    ['inline script', '<script>const a = 1 / 2;</script>'],
    ['data URI image in CSS', 'a { background: url(data:image/png;base64,AAAA); }'],
    ['system font stack', 'body { font-family: Segoe UI, Roboto, sans-serif; }'],
    ['blob download', 'const url = URL.createObjectURL(blob); a.href = url;'],
  ])('allows %s', (_label, snippet) => {
    expect(findExternalReferences(snippet)).toEqual([]);
  });

  test('reports the rule and line of each offending reference', () => {
    const found = findExternalReferences('<p>ok</p>\n<script src="app.js"></script>');
    expect(found).toEqual([
      { rule: 'external <script src>', match: '<script src="app.js">', line: 2 },
    ]);
  });
});
