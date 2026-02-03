const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

function waitForLoad(window) {
  return new Promise((resolve) => {
    if (
      window.document.readyState === 'complete' ||
      window.document.readyState === 'interactive'
    )
      return resolve();
    window.addEventListener('load', () => resolve());
    setTimeout(resolve, 300);
  });
}

// polyfill helper used across tests
function ensureCssEscape(window) {
  if (!window.CSS || typeof window.CSS.escape !== 'function') {
    window.CSS = window.CSS || {};
    window.CSS.escape = function (s) {
      return String(s).replace(/(["'\\])/g, '\\$1');
    };
  }
}

describe('templates integration (save, update, delete, reset)', () => {
  test('saving a new template makes it available in each form select', async () => {
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
    await waitForLoad(dom.window);
    ensureCssEscape(dom.window);

    const tplTabEl = dom.window.document.querySelector('.tab.right');
    const tplIndex = Number(tplTabEl.dataset.index);
    const tplTab = dom.window.document.querySelector(`.tab[data-index='${tplIndex}']`);
    expect(tplTab).toBeTruthy();
    tplTab.click();

    const tplPane = dom.window.document.querySelector(`.tab-pane[data-index='${tplIndex}']`);
    expect(tplPane).toBeTruthy();

    // find controls
    const buttons = Array.from(tplPane.querySelectorAll('button'));
    const addBtn = buttons.find((b) => b.textContent && b.textContent.includes('+ New'));
    const saveBtn = buttons.find((b) => b.textContent && b.textContent.trim() === 'Save');
    expect(addBtn).toBeTruthy();
    expect(saveBtn).toBeTruthy();

    const tplSelect = tplPane.querySelector('select');
    const beforeCount = dom.window.document.querySelectorAll('.tab:not(.right)').length;
    addBtn.click();

    // new id should be selected
    const newId = tplSelect.value;
    expect(newId).toBeTruthy();
    // left-side should have one additional tab for the new template
    const afterCount = dom.window.document.querySelectorAll('.tab:not(.right)').length;
    expect(afterCount).toBe(beforeCount + 1);

    const lblInput = tplPane.querySelector('input[type="text"]');
    const textareas = tplPane.querySelectorAll('textarea');
    const fieldsTa = textareas[1];

    lblInput.value = 'CustomX';
    fieldsTa.value = JSON.stringify([{ label: 'X', name: 'xfield', type: 'text', placeholder: '' }], null, 2);

    saveBtn.click();

    // after save, each form pane's template select should include the new option
    function getTplSelectForPane(pane) {
      const sels = Array.from(pane.querySelectorAll('select'));
      return (
        sels.find((s) => s.querySelector('option[value="__json__"]')) ||
        sels.find((s) => s.querySelector(`option[value="${newId}"]`)) ||
        sels[0]
      );
    }

    for (let i = 0; i < tplIndex; i++) {
      const pane = dom.window.document.querySelector(`.tab-pane[data-index='${i}']`);
      const sel = getTplSelectForPane(pane);
      expect(sel.querySelector(`option[value="${newId}"]`)).toBeTruthy();
    }
  });

  test('updating tpl-<index> updates that form fields', async () => {
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
    await waitForLoad(dom.window);
    ensureCssEscape(dom.window);

    const tplTabEl = dom.window.document.querySelector('.tab.right');
    const tplIndex = Number(tplTabEl.dataset.index); // templates pane index
    const tplPane = dom.window.document.querySelector(`.tab-pane[data-index='${tplIndex}']`);
    const tplSelect = tplPane.querySelector('select');
    const buttons = Array.from(tplPane.querySelectorAll('button'));
    const saveBtn = buttons.find((b) => b.textContent && b.textContent.trim() === 'Save');
    expect(saveBtn).toBeTruthy();

    // pick the Survey default template (tpl-2)
    const surveyTplId = 'tpl-2';
    tplSelect.value = surveyTplId;
    tplSelect.dispatchEvent(new dom.window.Event('change'));

    // set fields for tpl-2 to a single new field
    const textareas = tplPane.querySelectorAll('textarea');
    const fieldsTa = textareas[1];
    fieldsTa.value = JSON.stringify([{ label: 'New', name: 'newfield', type: 'text' }], null, 2);

    saveBtn.click();

    // Survey tab index is 2 -- ensure new input present
    const surveyPane = dom.window.document.querySelector(`.tab-pane[data-index='2']`);
    const input = surveyPane.querySelector('input[name="newfield"]');
    expect(input).toBeTruthy();
  });

  test('deleting a template removes it from form selects', async () => {
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
    await waitForLoad(dom.window);
    ensureCssEscape(dom.window);

    const tplTabEl = dom.window.document.querySelector('.tab.right');
    const tplIndex = Number(tplTabEl.dataset.index);
    const tplPane = dom.window.document.querySelector(`.tab-pane[data-index='${tplIndex}']`);
    const tplSelect = tplPane.querySelector('select');
    const buttons = Array.from(tplPane.querySelectorAll('button'));
    const addBtn = buttons.find((b) => b.textContent && b.textContent.includes('+ New'));
    const delBtn = buttons.find((b) => b.textContent && b.textContent.trim() === 'Delete');
    expect(addBtn).toBeTruthy();
    expect(delBtn).toBeTruthy();

    addBtn.click();
    const newId = tplSelect.value;
    // ensure it's added
    expect(newId).toBeTruthy();

    // now delete it
    delBtn.click();

    // ensure it's removed from form panes
    function getTplSelectForPane(pane) {
      const sels = Array.from(pane.querySelectorAll('select'));
      return (
        sels.find((s) => s.querySelector('option[value="__json__"]')) ||
        sels.find((s) => s.querySelector(`option[value="${newId}"]`)) ||
        sels[0]
      );
    }

    for (let i = 0; i < tplIndex; i++) {
      const pane = dom.window.document.querySelector(`.tab-pane[data-index='${i}']`);
      const sel = getTplSelectForPane(pane);
      expect(sel.querySelector(`option[value="${newId}"]`)).toBeFalsy();
    }
  });

  test('reset restores default tpl-<index> fields', async () => {
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
    await waitForLoad(dom.window);
    ensureCssEscape(dom.window);

    const tplTabEl = dom.window.document.querySelector('.tab.right');
    const tplIndex = Number(tplTabEl.dataset.index);
    const tplPane = dom.window.document.querySelector(`.tab-pane[data-index='${tplIndex}']`);
    const tplSelect = tplPane.querySelector('select');
    const buttons = Array.from(tplPane.querySelectorAll('button'));
    const saveBtn = buttons.find((b) => b.textContent && b.textContent.trim() === 'Save');
    const resetBtn = buttons.find((b) => b.textContent && b.textContent.trim() === 'Reset to defaults');
    expect(saveBtn).toBeTruthy();
    expect(resetBtn).toBeTruthy();

    // modify tpl-2 (Survey)
    tplSelect.value = 'tpl-2';
    tplSelect.dispatchEvent(new dom.window.Event('change'));
    const textareas = tplPane.querySelectorAll('textarea');
    const fieldsTa = textareas[1];
    fieldsTa.value = JSON.stringify([{ label: 'Temp', name: 'tempfield', type: 'text' }], null, 2);
    saveBtn.click();

    // ensure tempfield present
    const surveyPane = dom.window.document.querySelector(`.tab-pane[data-index='2']`);
    expect(surveyPane.querySelector('input[name="tempfield"]')).toBeTruthy();

    // now reset
    resetBtn.click();

    // after reset, survey should have original field 'firstName'
    const surveyAfter = dom.window.document.querySelector(`.tab-pane[data-index='2']`);
    expect(surveyAfter.querySelector('input[name="firstName"]')).toBeTruthy();
    expect(surveyAfter.querySelector('input[name="tempfield"]')).toBeFalsy();
  });
});
