const { setup } = require('./_helpers');

async function example(controls) {
  const dom = await setup([
    {
      title: 'Procedure',
      fields: [
        {
          label: 'Steps',
          name: 'steps',
          type: 'steps',
          keyMode: 'numbered',
          controls,
          default: 'Open settings > Save changes',
        },
      ],
      format: null,
    },
  ]);
  const pane = dom.window.document.querySelector('.tab-pane[data-index="0"]');
  return { dom, pane, form: pane.querySelector('form') };
}
const checks = (form) => Array.from(form.querySelectorAll('[data-step="click"]'));
const values = (form) => Array.from(form.querySelectorAll('[name="steps"]'));
const button = (pane, text) =>
  Array.from(pane.querySelectorAll('button')).find((b) => b.textContent.trim() === text);
const output = (pane) => {
  button(pane, 'Generate').click();
  return JSON.parse(Array.from(pane.querySelectorAll('textarea')).find((e) => e.readOnly).value);
};

describe('opt-in per-step Click controls', () => {
  test.each([undefined, {}, { click: false }, { click: 'true' }])(
    'hidden unless explicitly true: %p',
    async (controls) => {
      const { pane, form } = await example(controls);
      expect(checks(form)).toHaveLength(0);
      expect(output(pane).steps).toEqual(['1. Open settings', '2. Save changes']);
    }
  );
  test('checked state wraps only that value, after its key, without leaking controls', async () => {
    const { pane, form } = await example({ click: true });
    expect(checks(form)).toHaveLength(2);
    expect(checks(form).every((c) => !c.checked)).toBe(true);
    checks(form)[1].click();
    const result = output(pane);
    expect(result.steps).toEqual(['1. Open settings', '2. Click " Save changes "']);
    expect(result).not.toHaveProperty('steps_click');
    checks(form)[1].click();
    expect(output(pane).steps[1]).toBe('2. Save changes');
  });
  test('quotes, markup and backslashes stay literal', async () => {
    const { pane, form, dom } = await example({ click: true });
    values(form)[0].value = '<img src=x onerror=alert(1)> "name" \\ path';
    checks(form)[0].click();
    expect(output(pane).steps[0]).toBe('1. Click " <img src=x onerror=alert(1)> "name" \\ path "');
    expect(dom.window.document.querySelector('img')).toBeNull();
  });
  test('inserting and removing rows keeps independent state', async () => {
    const { pane, form } = await example({ click: true });
    checks(form)[1].click();
    form.querySelector('[data-step="insert"]').click();
    expect(checks(form).map((c) => c.checked)).toEqual([false, false, true]);
    form.querySelector('[data-step="remove"]').click();
    expect(checks(form).map((c) => c.checked)).toEqual([false, true]);
    expect(output(pane).steps[1]).toBe('2. Click " Save changes "');
  });
  test('duplicate preserves edited row values, keys and mixed checkbox state', async () => {
    const { pane, form, dom } = await example({ click: true });
    checks(form)[0].click();
    values(form)[0].value = 'Updated settings';
    form.querySelector('[data-step="insert"]').click();
    values(form)[1].value = 'Review';
    button(pane, 'Duplicate').click();
    const copyPane = dom.window.document.querySelector('.tab-pane[data-index="1"]');
    const copy = copyPane.querySelector('form');
    expect(checks(copy).map((c) => c.checked)).toEqual([true, false, false]);
    expect(output(copyPane).steps).toEqual([
      '1. Click " Updated settings "',
      '2. Review',
      '3. Save changes',
    ]);
    const original = dom.window.document.querySelector('.tab-pane[data-index="0"] form');
    expect(checks(original).map((c) => c.checked)).toEqual([true, false, false]);
  });
  test('all removed rows remain absent after a rebuild', async () => {
    const { pane, form, dom } = await example({ click: true });
    Array.from(form.querySelectorAll('[data-step="remove"]')).forEach((b) => b.click());
    button(pane, 'New').click();
    const original = dom.window.document.querySelector('.tab-pane[data-index="0"] form');
    expect(values(original)).toHaveLength(0);
    expect(checks(original)).toHaveLength(0);
  });
  test('single checked row restores as scalar and Parse resets it', async () => {
    const { pane, form, dom } = await example({ click: true });
    form.querySelector('[data-step="remove"]').click();
    checks(form)[0].click();
    button(pane, 'New').click();
    const originalPane = dom.window.document.querySelector('.tab-pane[data-index="0"]');
    const original = originalPane.querySelector('form');
    expect(checks(original)[0].checked).toBe(true);
    expect(output(originalPane).steps).toBe('1. Click " Save changes "');
    original.querySelector('[name="steps_combined"]').nextElementSibling.click();
    expect(checks(original).map((c) => c.checked)).toEqual([false, false]);
  });
  test('opt-in configuration persists in saved tabs and exported HTML', async () => {
    const { pane, form, dom } = await example({ click: true });
    checks(form)[0].click();
    button(pane, 'Duplicate').click();
    const saved = JSON.parse(dom.window.localStorage.getItem('nfg-tabs'));
    expect(saved.tabs[0].fields[0].controls).toEqual({ click: true });
    expect(saved.tabs[1].fields[0].controls).toEqual({ click: true });
    let exported;
    dom.window.confirm = () => false;
    dom.window.Blob = function (parts) {
      exported = parts.join('');
    };
    dom.window.URL.createObjectURL = () => 'blob:test';
    dom.window.HTMLAnchorElement.prototype.click = () => {};
    dom.window.document.querySelector('[data-export-button]').click();
    expect(exported).toContain('"controls":{"click":true}');
    const { JSDOM } = require('jsdom');
    const { ensureCssEscape, waitForLoad } = require('./_helpers');
    const reopened = new JSDOM(exported, {
      runScripts: 'dangerously',
      url: 'http://localhost',
      beforeParse: ensureCssEscape,
    });
    await waitForLoad(reopened.window);
    const reopenedForm = reopened.window.document.querySelector('form.generated-form');
    expect(checks(reopenedForm)).toHaveLength(2);
    expect(checks(reopenedForm).map((c) => c.checked)).toEqual([false, false]);
    reopened.window.close();
  });
  test('Clear resets checked state', async () => {
    const { pane, form } = await example({ click: true });
    checks(form)[0].click();
    button(pane, 'Clear').click();
    expect(checks(form).every((c) => !c.checked)).toBe(true);
  });
});
