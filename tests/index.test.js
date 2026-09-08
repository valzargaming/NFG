const path = require('path');
const { JSDOM } = require('jsdom');

describe('package entry (dist/index.cjs.js)', () => {
  function loadShim() {
    const p = path.resolve(__dirname, '..', 'dist', 'index.cjs.js');
    delete require.cache[p];
    return require(p);
  }

  test('ships the real runtime, not a stub', () => {
    const shim = loadShim();
    expect(typeof shim.html).toBe('string');
    // The stub had an empty <script> with only a comment; the real app is ~130kb
    // and defines the tab builder.
    expect(shim.html.length).toBeGreaterThan(50000);
    expect(shim.html).toMatch(/function build\(\)/);
    expect(shim.html).toMatch(/scanPopulate/);
  });

  test('mount() renders a live iframe that boots the app', async () => {
    const shim = loadShim();
    const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
      runScripts: 'dangerously',
      resources: 'usable',
    });
    global.document = dom.window.document;
    global.window = dom.window;

    const mount = shim.mount || (shim.default && shim.default.mount);
    expect(typeof mount).toBe('function');

    const root = dom.window.document.getElementById('root');
    const iframe = mount(root, {
      formConfig: [{ title: 'Demo', fields: [{ label: 'Name', name: 'name', type: 'text' }] }],
    });

    expect(iframe.tagName).toBe('IFRAME');
    expect(root.querySelector('iframe')).toBe(iframe);
    // The seed config is injected into the document the iframe will run.
    expect(iframe.getAttribute('srcdoc')).toMatch(/window\.formConfig = \[/);
    expect(iframe.getAttribute('srcdoc')).toMatch(/"title":"Demo"/);
  });

  test('mount() rejects a bad container', () => {
    const shim = loadShim();
    global.document = new JSDOM('<!doctype html>').window.document;
    expect(() => shim.mount(null)).toThrow(/DOM element or a selector/);
  });
});
