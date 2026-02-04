const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const { setup, openTemplatesPane, createAndSaveTemplate, pollForSelector } = require('./_helpers');

describe('forms delete and reset', () => {
  test('delete preserves forms tab and removes template', async () => {
    const dom = await setup();
    let pane = await openTemplatesPane(dom);
    const { newId } = await createAndSaveTemplate(dom, 'ToDelete');
    // re-query forms pane because DOM may have been rebuilt
    pane = await openTemplatesPane(dom);

    // ensure saved
    const savedBefore = JSON.parse(dom.window.localStorage.getItem('nfg-forms')) || [];
    expect(savedBefore.some((s) => s.id === newId)).toBe(true);

    // delete
    const delBtn = Array.from(pane.querySelectorAll('button')).find(
      (b) => b.textContent.trim() === 'Delete'
    );
    delBtn.click();
    // wait for forms pane to show Deleted status
    const tplTab = dom.window.document.querySelector('.tab.right');
    const tplIndex = tplTab.dataset.index;
    await pollForSelector(dom.window, `.tab-pane[data-index="${tplIndex}"] .meta`);
    // wait until localStorage no longer contains the deleted template id
    const { pollForCondition } = require('./_helpers');
    const removed = await pollForCondition(
      dom.window,
      () => {
        const saved = JSON.parse(dom.window.localStorage.getItem('nfg-forms')) || [];
        return !saved.some((s) => s.id === newId);
      },
      2000,
      20
    );
    expect(removed).toBe(true);
    const newPane = dom.window.document.querySelector(`.tab-pane[data-index="${tplIndex}"]`);
    const status = Array.from(newPane.querySelectorAll('.meta')).find((n) =>
      /Deleted/.test(n.textContent)
    );
    expect(status).toBeDefined();
  });

  test('reset restores defaults and stays on forms tab', async () => {
    const dom = await setup();
    let pane = await openTemplatesPane(dom);
    const { newId } = await createAndSaveTemplate(dom, 'ToReset');
    pane = await openTemplatesPane(dom);
    const savedBefore = JSON.parse(dom.window.localStorage.getItem('nfg-forms')) || [];
    expect(savedBefore.some((s) => s.id === newId)).toBe(true);

    const resetBtn = Array.from(pane.querySelectorAll('button')).find(
      (b) => b.textContent.trim() === 'Reset to defaults'
    );
    resetBtn.click();
    const tplTabAfter = dom.window.document.querySelector('.tab.right');
    const tplIndexAfter = tplTabAfter.dataset.index;
    await pollForSelector(dom.window, `.tab-pane[data-index="${tplIndexAfter}"] .meta`);
    const savedAfter = JSON.parse(dom.window.localStorage.getItem('nfg-forms')) || [];
    // custom template should be gone
    expect(savedAfter.some((s) => s.id === newId)).toBe(false);
    const newPane = dom.window.document.querySelector(`.tab-pane[data-index="${tplIndexAfter}"]`);
    const status = Array.from(newPane.querySelectorAll('.meta')).find((n) =>
      /Reset to defaults/.test(n.textContent)
    );
    expect(status).toBeDefined();
  });
});
