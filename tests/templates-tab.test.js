const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('templates tab editing', () => {
  test('editing templates and saving updates selector and localStorage', async () => {
    const html = fs.readFileSync(path.resolve(__dirname, '..', 'form-generator.html'), 'utf8');

    const dom = new JSDOM(html, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost',
    });

    // Wait for the inline script to run and build the DOM
    await new Promise((resolve) => {
      if (
        dom.window.document.readyState === 'complete' ||
        dom.window.document.readyState === 'interactive'
      )
        return resolve();
      dom.window.addEventListener('load', () => resolve());
      setTimeout(resolve, 200);
    });

    // polyfill CSS.escape if missing
    if (!dom.window.CSS || typeof dom.window.CSS.escape !== 'function') {
      dom.window.CSS = dom.window.CSS || {};
      dom.window.CSS.escape = function (s) {
        return String(s).replace(/(["'\\])/g, '\\$1');
      };
    }

    // ensure no leftover templates in storage
    dom.window.localStorage.removeItem('nfg-templates');

    // find Templates tab (right-aligned) and click it
    const tplTab =
      dom.window.document.querySelector('.tab.right') ||
      Array.from(dom.window.document.querySelectorAll('.tab')).find((t) =>
        t.textContent && t.textContent.trim() === 'Templates'
      );
    if (!tplTab) throw new Error('Templates tab not found');
    tplTab.click();

    // allow UI to update
    await new Promise((r) => setTimeout(r, 20));

    const tplIndex = tplTab.dataset.index;
    const pane = dom.window.document.querySelector(`.tab-pane[data-index="${tplIndex}"]`);
    expect(pane).toBeDefined();

    const ta = pane.querySelector('textarea');
    expect(ta).toBeDefined();

    const newTemplates = [
      { id: 't1', label: 'T1', cfg: { type: 'template', template: 'Hello {firstName}' } },
    ];
    ta.value = JSON.stringify(newTemplates, null, 2);

    const saveBtn = Array.from(pane.querySelectorAll('button')).find((b) => b.textContent.trim() === 'Save');
    expect(saveBtn).toBeDefined();
    saveBtn.click();

    // wait until rebuild completes and selector contains new option
    const option = await new Promise((resolve, reject) => {
      const start = Date.now();
      (function check() {
        const pane0 = dom.window.document.querySelector('.tab-pane[data-index="0"]');
        if (pane0) {
          const select = pane0.querySelector('select');
          if (select) {
            const opt = Array.from(select.options).find((o) => o.value === 't1');
            if (opt) return resolve(opt);
          }
        }
        if (Date.now() - start > 2000) return reject(new Error('timeout waiting for option')); 
        setTimeout(check, 20);
      })();
    });

    expect(option.text).toBe('T1');

    // verify localStorage saved
    const saved = JSON.parse(dom.window.localStorage.getItem('nfg-templates'));
    expect(Array.isArray(saved)).toBe(true);
    expect(saved[0].id).toBe('t1');

    // cleanup
    dom.window.localStorage.removeItem('nfg-templates');
  });
});
