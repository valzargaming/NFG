const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

async function setup() {
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
  await new Promise((resolve) => {
    if (dom.window.document.readyState === 'complete' || dom.window.document.readyState === 'interactive') return resolve();
    dom.window.addEventListener('load', () => resolve());
    setTimeout(resolve, 200);
  });
  if (!dom.window.CSS || typeof dom.window.CSS.escape !== 'function') {
    dom.window.CSS = dom.window.CSS || {};
    dom.window.CSS.escape = function (s) { return String(s).replace(/(["'\\])/g, '\\$1'); };
  }
  return dom;
}

async function openTemplatesPane(dom) {
  const tplTab = dom.window.document.querySelector('.tab.right') || Array.from(dom.window.document.querySelectorAll('.tab')).find((t) => t.textContent && t.textContent.trim() === 'Templates');
  if (!tplTab) throw new Error('Templates tab not found');
  tplTab.click();
  await new Promise((r) => setTimeout(r, 20));
  const tplIndex = tplTab.dataset.index;
  const pane = dom.window.document.querySelector(`.tab-pane[data-index="${tplIndex}"]`);
  return pane;
}

async function createAndSaveTemplate(pane, dom, labelText) {
  const addBtn = Array.from(pane.querySelectorAll('button')).find((b) => b.textContent.trim() === '+ New');
  addBtn.click();
  await new Promise((r) => setTimeout(r, 20));
  const tplSelect = pane.querySelector('select');
  const newId = tplSelect.value;
  const lblInput = pane.querySelector('input[type="text"]');
  const textareas = Array.from(pane.querySelectorAll('textarea'));
  const cfgTa = textareas[0];
  const fieldsTa = textareas[1];
  dom.window.alert = jest.fn();
  lblInput.value = labelText;
  cfgTa.value = JSON.stringify({ type: 'template', template: 'Hello {firstName}' });
  fieldsTa.value = JSON.stringify([]);
  const saveBtn = Array.from(pane.querySelectorAll('button')).find((b) => b.textContent.trim() === 'Save');
  saveBtn.click();
  await new Promise((r) => setTimeout(r, 40));
  return { newId, tplSelect };
}

describe('templates delete and reset', () => {
  test('delete preserves templates tab and removes template', async () => {
    const dom = await setup();
    const pane = await openTemplatesPane(dom);
    const { newId } = await createAndSaveTemplate(pane, dom, 'ToDelete');

    // ensure saved
    const savedBefore = JSON.parse(dom.window.localStorage.getItem('nfg-templates')) || [];
    expect(savedBefore.some((s) => s.id === newId)).toBe(true);

    // delete
    const delBtn = Array.from(pane.querySelectorAll('button')).find((b) => b.textContent.trim() === 'Delete');
    delBtn.click();
    await new Promise((r) => setTimeout(r, 40));

    const savedAfter = JSON.parse(dom.window.localStorage.getItem('nfg-templates')) || [];
    expect(savedAfter.some((s) => s.id === newId)).toBe(false);

    // templates tab should still be active and show 'Deleted' status
    const tplTab = dom.window.document.querySelector('.tab.right');
    expect(tplTab.classList.contains('active')).toBe(true);
    const tplIndex = tplTab.dataset.index;
    const newPane = dom.window.document.querySelector(`.tab-pane[data-index="${tplIndex}"]`);
    const status = Array.from(newPane.querySelectorAll('.meta')).find((n) => /Deleted/.test(n.textContent));
    expect(status).toBeDefined();
  });

  test('reset restores defaults and stays on templates tab', async () => {
    const dom = await setup();
    const pane = await openTemplatesPane(dom);
    const { newId } = await createAndSaveTemplate(pane, dom, 'ToReset');
    const savedBefore = JSON.parse(dom.window.localStorage.getItem('nfg-templates')) || [];
    expect(savedBefore.some((s) => s.id === newId)).toBe(true);

    const resetBtn = Array.from(pane.querySelectorAll('button')).find((b) => b.textContent.trim() === 'Reset to defaults');
    resetBtn.click();
    await new Promise((r) => setTimeout(r, 40));

    const savedAfter = JSON.parse(dom.window.localStorage.getItem('nfg-templates')) || [];
    // custom template should be gone
    expect(savedAfter.some((s) => s.id === newId)).toBe(false);

    const tplTab = dom.window.document.querySelector('.tab.right');
    expect(tplTab.classList.contains('active')).toBe(true);
    const tplIndex = tplTab.dataset.index;
    const newPane = dom.window.document.querySelector(`.tab-pane[data-index="${tplIndex}"]`);
    const status = Array.from(newPane.querySelectorAll('.meta')).find((n) => /Reset to defaults/.test(n.textContent));
    expect(status).toBeDefined();
  });
});
