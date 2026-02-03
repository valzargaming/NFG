const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('forms tab editing', () => {
  test('editing forms and saving updates selector and localStorage', async () => {
    const { setup, openTemplatesPane } = require('./_helpers');
    const dom = await setup();
    // ensure no leftover forms in storage
    dom.window.localStorage.removeItem('nfg-forms');

    const pane = await openTemplatesPane(dom);
    const tplTab = dom.window.document.querySelector('.tab.right');
    const tplIndex = tplTab.dataset.index;
    expect(pane).toBeDefined();

    const { createAndSaveTemplate, pollForSelector } = require('./_helpers');
    const { newId } = await createAndSaveTemplate(dom, 'T1');
    const option = await pollForSelector(dom.window, `.tab-pane[data-index=\"0\"] select option[value=\"${newId}\"]`);
    expect(option.textContent || option.text).toBe('T1');

    // verify localStorage saved
    const saved = JSON.parse(dom.window.localStorage.getItem('nfg-forms'));
    expect(Array.isArray(saved)).toBe(true);
    expect(saved.some((s) => s.label === 'T1')).toBe(true);
    expect(dom.window.alert).not.toHaveBeenCalled();

    // cleanup
    dom.window.localStorage.removeItem('nfg-forms');
  });
});
