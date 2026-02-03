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
      beforeParse(window) {
        window.formConfig = [
          { title: 'Profile', fields: [{ label: 'First name', name: 'firstName', type: 'text' }, { label: 'Email', name: 'email', type: 'text' }], format: null },
          { title: 'Contact', fields: [{ label: 'First name', name: 'firstName', type: 'text' }, { label: 'Email', name: 'email', type: 'text' }], format: null },
          { title: 'Survey', fields: [{ label: 'Steps', name: 'steps', type: 'steps' }, { label: 'First name', name: 'firstName', type: 'text' }, { label: 'Email', name: 'email', type: 'text' }], format: null },
        ];
      },
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

    // create a new template via the + New button
    const addBtn = Array.from(pane.querySelectorAll('button')).find((b) => b.textContent.trim() === '+ New');
    expect(addBtn).toBeDefined();
    addBtn.click();
    await new Promise((r) => setTimeout(r, 20));

    const tplSelect = pane.querySelector('select');
    expect(tplSelect).toBeDefined();
    const newId = tplSelect.value;

    const lblInput = pane.querySelector('input[type="text"]');
    const textareas = Array.from(pane.querySelectorAll('textarea'));
    const cfgTa = textareas[0];
    const fieldsTa = textareas[1];
    expect(lblInput).toBeDefined();
    expect(cfgTa).toBeDefined();
    expect(fieldsTa).toBeDefined();

    // prevent alerts from failing the test
    dom.window.alert = jest.fn();

    lblInput.value = 'T1';
    cfgTa.value = JSON.stringify({ type: 'template', template: 'Hello {firstName}' });
    fieldsTa.value = JSON.stringify([]);

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
            const opt = Array.from(select.options).find((o) => o.value === newId);
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
    expect(saved.some((s) => s.label === 'T1')).toBe(true);
    expect(dom.window.alert).not.toHaveBeenCalled();

    // cleanup
    dom.window.localStorage.removeItem('nfg-templates');
  });
});
