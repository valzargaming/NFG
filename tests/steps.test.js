const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('steps parse and generate', () => {
  test('Parse creates inputs with unique ids and Generate outputs steps array', async () => {
    const html = fs.readFileSync(path.resolve(__dirname, '..', 'form-generator.html'), 'utf8');

    const dom = new JSDOM(html, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost',
    });

    // wait for inline script to run
    await new Promise((resolve) => {
      if (
        dom.window.document.readyState === 'complete' ||
        dom.window.document.readyState === 'interactive'
      )
        return resolve();
      dom.window.addEventListener('load', () => resolve());
      setTimeout(resolve, 300);
    });

    // polyfill CSS.escape if missing
    if (!dom.window.CSS || typeof dom.window.CSS.escape !== 'function') {
      dom.window.CSS = dom.window.CSS || {};
      dom.window.CSS.escape = function (s) {
        return String(s).replace(/(["'\\])/g, '\\$1');
      };
    }

    const pane = dom.window.document.querySelector('.tab-pane[data-index="2"]');
    const form = pane.querySelector('form.generated-form');
    const combined = form.querySelector('[name="steps_combined"]');
    expect(combined).toBeDefined();

    combined.value = 'Step A > Step B > Step C';
    const parseBtn = combined.nextElementSibling;
    expect(parseBtn && /Parse/.test(parseBtn.textContent)).toBe(true);
    parseBtn.click();

    const stepEls = Array.from(form.querySelectorAll('[name="steps"]'));
    expect(stepEls.length).toBe(3);
    const ids = stepEls.map((e) => e.id).filter(Boolean);
    expect(ids.length).toBe(3);
    const uniq = new Set(ids);
    expect(uniq.size).toBe(3);

    // build values the same way the Generate handler does and invoke generateOutput
    const values = {};
    Array.from(form.elements).forEach((e) => {
      if (!e.name) return;
      const v = e.value !== undefined ? e.value : '';
      if (Object.prototype.hasOwnProperty.call(values, e.name)) {
        if (!Array.isArray(values[e.name])) values[e.name] = [values[e.name]];
        values[e.name].push(v);
      } else {
        values[e.name] = v;
      }
    });

    const outText = dom.window.generateOutput(null, values);
    const parsed = JSON.parse(outText);
    expect(Array.isArray(parsed.steps)).toBe(true);
    expect(parsed.steps).toEqual(['Step A', 'Step B', 'Step C']);
  });
});
