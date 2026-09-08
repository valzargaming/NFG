const { JSDOM } = require('jsdom');
const path = require('path');

describe('package exports', () => {
  test('dist CJS exports html + mount, and mount injects a live iframe', () => {
    const p = path.resolve(__dirname, '..', 'dist', 'index.cjs.js');
    delete require.cache[p];
    const pkg = require(p);

    expect(pkg).toBeDefined();
    expect(typeof pkg.html === 'string' || typeof pkg.default?.html === 'string').toBe(true);

    const mount = pkg.mount || (pkg.default && pkg.default.mount);
    expect(typeof mount).toBe('function');

    const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
      runScripts: 'dangerously',
    });
    const container = dom.window.document.getElementById('root');

    const iframe = mount(container);
    expect(iframe.tagName).toBe('IFRAME');
    expect(container.querySelector('iframe')).toBe(iframe);
    // The iframe carries the real single-file app in its srcdoc.
    const srcdoc = iframe.getAttribute('srcdoc');
    expect(srcdoc).toMatch(/Note Form Generator/);
    expect(srcdoc).toMatch(/function build\(\)/);
  });
});
