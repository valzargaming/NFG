const { JSDOM } = require('jsdom');
const path = require('path');

describe('package exports', () => {
  test('dist CJS exports provide html and mount and mount injects UI', () => {
    const pkg = require(path.resolve(__dirname, '..', 'dist', 'index.cjs.js'));

    expect(pkg).toBeDefined();
    // html string should exist
    expect(typeof pkg.html === 'string' || typeof pkg.default?.html === 'string').toBe(true);

    // mount should be a function (support both named and default exports)
    const mount = pkg.mount || (pkg.default && pkg.default.mount);
    expect(typeof mount).toBe('function');

    // Create a JSDOM document and mount into a container
    const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
      runScripts: 'dangerously',
    });
    const win = dom.window;
    const container = win.document.getElementById('root');

    // Call mount with the actual container element (avoid relying on global document)
    mount(container);
    expect(container.innerHTML.length).toBeGreaterThan(0);
    // Should contain the page title text
    expect(container.innerHTML).toMatch(/Inline JSON Form Generator/);
  });
});
