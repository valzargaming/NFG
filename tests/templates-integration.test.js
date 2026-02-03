const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const { setup, openTemplatesPane, createAndSaveTemplate, pollForSelector } = require('./_helpers');

describe('templates integration (save, update, delete, reset)', () => {
  test('saving a new template makes it available in each form select', async () => {
    const dom = await setup();
    const tplPane = await openTemplatesPane(dom);
    const tplTabEl = dom.window.document.querySelector('.tab.right');
    const tplIndex = Number(tplTabEl.dataset.index);

    // find controls
    const buttons = Array.from(tplPane.querySelectorAll('button'));
    const addBtn = buttons.find((b) => b.textContent && b.textContent.includes('+ New'));
    const saveBtn = buttons.find((b) => b.textContent && b.textContent.trim() === 'Save');
    expect(addBtn).toBeTruthy();
    expect(saveBtn).toBeTruthy();

    const { newId } = await createAndSaveTemplate(dom, 'CustomX');

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
    const dom = await setup();
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
    const dom = await setup();
    const tplTabEl = dom.window.document.querySelector('.tab.right');
    const tplIndex = Number(tplTabEl.dataset.index);
    const tplPane = dom.window.document.querySelector(`.tab-pane[data-index='${tplIndex}']`);
    const tplSelect = tplPane.querySelector('select');
    const buttons = Array.from(tplPane.querySelectorAll('button'));
    const addBtn = buttons.find((b) => b.textContent && b.textContent.includes('+ New'));
    const delBtn = buttons.find((b) => b.textContent && b.textContent.trim() === 'Delete');
    expect(addBtn).toBeTruthy();
    expect(delBtn).toBeTruthy();

    // create and save a new custom template
    const { newId } = await createAndSaveTemplate(dom, 'ToRemove');

    // now delete it
    const paneNow = await openTemplatesPane(dom);
    const del = Array.from(paneNow.querySelectorAll('button')).find((b) => b.textContent && b.textContent.trim() === 'Delete');
    del.click();

    const tplTab = dom.window.document.querySelector('.tab.right');
    const currentTplIndex = tplTab.dataset.index;
    await pollForSelector(dom.window, `.tab-pane[data-index="${currentTplIndex}"] .meta`);
    const savedAfter = JSON.parse(dom.window.localStorage.getItem('nfg-templates')) || [];
    expect(savedAfter.some((s) => s.id === newId)).toBe(false);
  });

  test('reset restores default tpl-<index> fields', async () => {
    const dom2 = await setup();
    const tplTabEl2 = dom2.window.document.querySelector('.tab.right');
    const tplIndex2 = Number(tplTabEl2.dataset.index);
    const tplPane2 = dom2.window.document.querySelector(`.tab-pane[data-index='${tplIndex2}']`);
    const tplSelect2 = tplPane2.querySelector('select');
    const buttons2 = Array.from(tplPane2.querySelectorAll('button'));
    const saveBtn2 = buttons2.find((b) => b.textContent && b.textContent.trim() === 'Save');
    const resetBtn2 = buttons2.find((b) => b.textContent && b.textContent.trim() === 'Reset to defaults');
    expect(saveBtn2).toBeTruthy();
    expect(resetBtn2).toBeTruthy();

    // modify tpl-2 (Survey)
    tplSelect2.value = 'tpl-2';
    tplSelect2.dispatchEvent(new dom2.window.Event('change'));
    const textareas2 = tplPane2.querySelectorAll('textarea');
    const fieldsTa2 = textareas2[1];
    fieldsTa2.value = JSON.stringify([{ label: 'Temp', name: 'tempfield', type: 'text' }], null, 2);
    saveBtn2.click();

    // ensure tempfield present
    const surveyPane = dom2.window.document.querySelector(`.tab-pane[data-index='2']`);
    expect(surveyPane.querySelector('input[name="tempfield"]')).toBeTruthy();

    // now reset
    resetBtn2.click();

    // wait for reset status and then verify restored defaults
    const tplTabAfter = dom2.window.document.querySelector('.tab.right');
    const idxAfter = tplTabAfter.dataset.index;
    await pollForSelector(dom2.window, `.tab-pane[data-index="${idxAfter}"] .meta`);

    const surveyAfter = dom2.window.document.querySelector(`.tab-pane[data-index='2']`);
    expect(surveyAfter.querySelector('input[name="firstName"]')).toBeTruthy();
    expect(surveyAfter.querySelector('input[name="tempfield"]')).toBeFalsy();
  });
});
