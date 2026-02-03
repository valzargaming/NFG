const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('form-generator populate behavior', () => {
  test('survey firstName and email are populated from other tabs', async () => {
    const { setup } = require('./_helpers');
    const dom = await setup();

    // fill values in other tabs (simulate user input)
    const paneA = dom.window.document.querySelector('.tab-pane[data-index="0"]');
    const formA = paneA.querySelector('form.generated-form');
    formA.elements['firstName'].value = 'AliceTest';
    formA.elements['email'] && (formA.elements['email'].value = 'alice@test.example');

    const paneB = dom.window.document.querySelector('.tab-pane[data-index="1"]');
    const formB = paneB.querySelector('form.generated-form');
    formB.elements['firstName'].value = 'BobTest';
    formB.elements['email'] && (formB.elements['email'].value = 'bob@test.example');

    // run scanPopulate on Survey (index 2)
    const previewDiv = dom.window.document.createElement('div');
    const items = dom.window.scanPopulate(2, previewDiv);

    // find entries by name
    const byName = {};
    items.forEach((it) => (byName[it.name] = it));

    expect(byName.firstName).toBeDefined();
    expect(byName.email).toBeDefined();
    // now scanPopulate returns candidates arrays — ensure candidates found and values match
    expect(Array.isArray(byName.firstName.candidates)).toBe(true);
    expect(byName.firstName.candidates.length).toBeGreaterThan(0);
    expect(byName.firstName.candidates[0].value).toBe('AliceTest');
    expect(Array.isArray(byName.email.candidates)).toBe(true);
    expect(byName.email.candidates.length).toBeGreaterThan(0);
    expect(byName.email.candidates[0].value.length).toBeGreaterThan(0);
  });
});
