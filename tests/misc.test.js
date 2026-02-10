const { setup } = require('./_helpers');

describe('misc utility functions', () => {
  test('autosizeTextarea sets a pixel height', async () => {
    const dom = await setup();
    const win = dom.window;
    const ta = win.document.createElement('textarea');
    ta.value = 'line1\nline2\nline3';
    win.document.body.appendChild(ta);
    // Should not throw
    win.autosizeTextarea(ta);
    expect(typeof ta.style.height).toBe('string');
    expect(ta.style.height).toMatch(/\d+px$/);
  });

  test('highlightJsonError selects the reported position', async () => {
    const dom = await setup();
    const win = dom.window;
    const ta = win.document.createElement('textarea');
    ta.value = 'abcdef';
    win.document.body.appendChild(ta);
    const err = new Error('Unexpected token in JSON at position 2');
    // Should not throw
    win.highlightJsonError(ta, err);
    // selectionStart/End should be set around the offending char
    expect(typeof ta.selectionStart).toBe('number');
    expect(typeof ta.selectionEnd).toBe('number');
    expect(ta.selectionEnd - ta.selectionStart).toBe(1);
  });

  test('captureAllFormValues and restoreAllFormValues round-trip values', async () => {
    const dom = await setup();
    const win = dom.window;
    const doc = win.document;
    const pane0 = doc.querySelector('.tab-pane[data-index="0"]');
    const form0 = pane0.querySelector('form.generated-form');
    const first = form0.elements['firstName'];
    expect(first).toBeDefined();
    first.value = 'OriginalName';

    const allPrev = win.captureAllFormValues();
    // mutate value and then restore
    first.value = 'Changed';
    win.restoreAllFormValues(allPrev);
    expect(form0.elements['firstName'].value).toBe('OriginalName');
  });

  test('persistFormMap writes mapping to localStorage', async () => {
    const dom = await setup();
    const win = dom.window;
    // assign a known template id from defaults
    if (win.formConfig && win.formConfig[0]) {
      win.formConfig[0]._templateId = 'tpl-0';
    }
    // call and ensure key exists
    win.persistFormMap();
    const saved = JSON.parse(win.localStorage.getItem('nfg-form-map') || '{}');
    expect(saved['0']).toBe('tpl-0');
  });

  test('createStepRow appends inputs and returns the input element', async () => {
    const dom = await setup();
    const win = dom.window;
    const doc = win.document;
    const container = doc.createElement('div');
    const list = doc.createElement('div');
    container.appendChild(list);
    const inp = win.createStepRow('steps', 'myval', container, list);
    expect(inp).toBeDefined();
    expect(inp.name).toBe('steps');
    expect(list.querySelector('[name="steps"]')).toBeDefined();
  });

  test('activateTab toggles tab active state and pane visibility', async () => {
    const dom = await setup();
    const win = dom.window;
    // ensure there are at least two tabs
    const tabs = Array.from(win.document.querySelectorAll('.tab'));
    expect(tabs.length).toBeGreaterThan(1);
    win.activateTab(1);
    const t = win.document.querySelector('.tab[data-index="1"]');
    const p = win.document.querySelector('.tab-pane[data-index="1"]');
    expect(t.classList.contains('active')).toBe(true);
    expect(p.style.display).not.toBe('none');
  });
});
