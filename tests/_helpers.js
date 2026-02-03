const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

/**
 * Ensure `CSS.escape` exists on the JSDOM `window` object.
 * Some JS environments used by Jest/jsdom do not provide `CSS.escape`.
 * This function installs a minimal, safe polyfill when missing.
 *
 * @param {Window} window - The JSDOM window object to patch.
 * @example
 * const { ensureCssEscape } = require('./_helpers');
 * ensureCssEscape(dom.window);
 */
function ensureCssEscape(window) {
  if (!window.CSS || typeof window.CSS.escape !== 'function') {
    window.CSS = window.CSS || {};
    window.CSS.escape = function (s) {
      return String(s).replace(/(["'\\])/g, '\\$1');
    };
  }
}

/**
 * Wait for the DOM in the provided `window` to become interactive/complete.
 * Resolves immediately if the document is already loaded, otherwise waits
 * for the `load` event or a short timeout fallback.
 *
 * @param {Window} window - The JSDOM window to watch.
 * @param {number} [timeout=500] - Milliseconds to wait before resolving anyway.
 * @returns {Promise<void>} Resolves when the window is ready or timeout expires.
 */
function waitForLoad(window, timeout = 500) {
  return new Promise((resolve, reject) => {
    if (window.document.readyState === 'complete' || window.document.readyState === 'interactive') return resolve();
    let done = false;
    const onload = () => { if (!done) { done = true; resolve(); } };
    window.addEventListener('load', onload);
    setTimeout(() => {
      if (!done) { done = true; resolve(); }
    }, timeout);
  });
}

/**
 * Poll the document for a selector and resolve with the matching element.
 * Rejects if the selector is not found within the timeout window.
 *
 * @param {Window} window - The JSDOM window whose document to query.
 * @param {string} selector - CSS selector to poll for.
 * @param {number} [timeout=2000] - Milliseconds before giving up.
 * @param {number} [interval=20] - Poll interval in milliseconds.
 * @returns {Promise<Element>} Resolves with the first matching Element.
 * @throws {Error} If the selector isn't found within the timeout.
 * @example
 * await pollForSelector(dom.window, '.tab-pane[data-index="0"]');
 */
function pollForSelector(window, selector, timeout = 2000, interval = 20) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    (function check() {
      const el = window.document.querySelector(selector);
      if (el) return resolve(el);
      if (Date.now() - start > timeout) return reject(new Error('timeout waiting for selector: ' + selector));
      setTimeout(check, interval);
    })();
  });
}

/**
 * Poll an arbitrary synchronous condition function until it returns truthy.
 * Resolves `true` when the condition becomes true, or `false` on timeout.
 *
 * @param {Window} window - The JSDOM window (unused but kept for symmetry).
 * @param {function(): boolean} fn - Synchronous function that returns truthy when condition met.
 * @param {number} [timeout=2000] - Milliseconds to wait before giving up.
 * @param {number} [interval=20] - Poll interval in milliseconds.
 * @returns {Promise<boolean>} Resolves `true` when condition met, else `false`.
 * @example
 * await pollForCondition(dom.window, () => !!dom.window.localStorage.getItem('nfg-forms'));
 */
function pollForCondition(window, fn, timeout = 2000, interval = 20) {
  return new Promise((resolve) => {
    const start = Date.now();
    (function check() {
      try {
        if (fn()) return resolve(true);
      } catch (e) {}
      if (Date.now() - start > timeout) return resolve(false);
      setTimeout(check, interval);
    })();
  });
}

/**
 * Create a JSDOM instance loaded with `form-generator.html` and a provided
 * `formConfig` value. Returns the created JSDOM instance after the inline
 * script has run and minimal polyfills are installed.
 *
 * @param {object[]} [providedFormConfig] - Optional `formConfig` to inject.
 * @returns {Promise<JSDOM>} A ready JSDOM instance with `window` and `document`.
 */
async function setup(providedFormConfig) {
  const html = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'form-generator.html'), 'utf8');
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    resources: 'usable',
    url: 'http://localhost',
    beforeParse(window) {
      window.formConfig = providedFormConfig || [
        { title: 'Profile', fields: [{ label: 'First name', name: 'firstName', type: 'text' }, { label: 'Email', name: 'email', type: 'text' }], format: null },
        { title: 'Contact', fields: [{ label: 'First name', name: 'firstName', type: 'text' }, { label: 'Email', name: 'email', type: 'text' }], format: null },
        { title: 'Survey', fields: [{ label: 'Steps', name: 'steps', type: 'steps' }, { label: 'First name', name: 'firstName', type: 'text' }, { label: 'Email', name: 'email', type: 'text' }], format: null },
      ];
      try {
        window.localStorage.setItem('nfg-dev-mode', 'true');
      } catch (e) {}
    },
  });
  await waitForLoad(dom.window);
  ensureCssEscape(dom.window);
  return dom;
}

/**
 * Open the Forms pane in the UI and return the pane element. This helper
 * clicks the right-aligned Forms tab and waits until the corresponding
 * `.tab-pane` is present in the DOM.
 *
 * @param {JSDOM} dom - The JSDOM instance returned by `setup()`.
 * @returns {Promise<Element>} The `.tab-pane` element for the Forms pane.
 */
async function openTemplatesPane(dom) {
  const win = dom.window;
  const tabs = Array.from(win.document.querySelectorAll('.tab'));
  // debug removed
  const tplTab = tabs.find((t) => t.textContent && t.textContent.trim() === 'Forms') || win.document.querySelector('.tab.right');
  if (!tplTab) throw new Error('Forms tab not found');
  tplTab.click();
  const tplIndex = tplTab.dataset.index;
  await pollForSelector(win, `.tab-pane[data-index="${tplIndex}"]`);
  return win.document.querySelector(`.tab-pane[data-index="${tplIndex}"]`);
}

/**
 * Create a new custom form via the Forms pane UI and save it.
 * Returns the created template id and the pane's select element.
 *
 * @param {JSDOM} dom - The JSDOM instance returned by `setup()`.
 * @param {string} labelText - Label to assign to the new template.
 * @returns {Promise<{newId:string, tplSelect:Element, pane:Element}>}
 */
async function createAndSaveTemplate(dom, labelText) {
  const win = dom.window;
  // open (or re-open) the Forms pane and click + New
  let pane = await openTemplatesPane(dom);
  // ensure an Output is selected (Forms now require choosing an Output)
  const outSelect = pane.querySelector('select');
  if (outSelect && outSelect.options && outSelect.options.length) {
    outSelect.selectedIndex = 0;
    try { outSelect.dispatchEvent(new win.Event('change')); } catch (e) {}
  }
  const addBtn = Array.from(pane.querySelectorAll('button')).find((b) => b.textContent.trim() === '+ New');
  addBtn.click();
  // after clicking +New the DOM may be rebuilt; re-query the Forms pane
  // debug removed
  pane = await openTemplatesPane(dom);
    // find the forms select reliably: the + New button sits next to it
    const addBtnNow = Array.from(pane.querySelectorAll('button')).find((b) => b.textContent.trim() === '+ New');
    let tplSelect;
    if (addBtnNow && addBtnNow.parentElement) {
      tplSelect = addBtnNow.parentElement.querySelector('select');
    }
    // fallback: choose any select that looks like forms list
    if (!tplSelect) {
      const selects = Array.from(pane.querySelectorAll('select'));
      tplSelect = selects.find((s) => s.querySelector('option[value="__json__"]') || Array.from(s.options).some((o) => {
        const v = String(o.value || '');
        return v.startsWith('tpl-') || v.startsWith('custom-');
      }));
      if (!tplSelect) tplSelect = selects[selects.length - 1];
    }
    // capture the newly created template id from the forms select
    const newId = tplSelect.value;
    const lblInput = pane.querySelector('input[type="text"]');
  const textareas = Array.from(pane.querySelectorAll('textarea'));
  const cfgTa = textareas[0];
  const fieldsTa = textareas[1];
  win.alert = jest.fn();
  lblInput.value = labelText;
  cfgTa.value = JSON.stringify({ type: 'template', template: 'Hello {firstName}' });
  fieldsTa.value = JSON.stringify([]);
  const saveBtn = Array.from(pane.querySelectorAll('button')).find((b) => b.textContent.trim() === 'Save');
  // capture existing template ids so we can detect the newly created one
  const beforeTemplates = JSON.parse(win.localStorage.getItem('nfg-forms') || '[]').map((t) => t.id);
  saveBtn.click();
  // wait until localStorage contains a new template id
  await pollForCondition(win, () => {
    try {
      const current = JSON.parse(win.localStorage.getItem('nfg-forms') || '[]');
      return current.some((t) => !beforeTemplates.includes(t.id));
    } catch (e) { return false; }
  }, 3000, 25);
  const saved = JSON.parse(win.localStorage.getItem('nfg-forms') || '[]');
  const newTpl = saved.find((s) => !beforeTemplates.includes(s.id));
  const newIdFinal = newTpl ? newTpl.id : tplSelect.value;
  // saved forms logged by tests when necessary
  // wait until any tab-pane select includes the new template option
  await pollForSelector(win, `.tab-pane select option[value="${newIdFinal}"]`, 3000, 25);
  // ensure Forms pane is current and return values
  pane = await openTemplatesPane(dom);
  // find the forms select again (may have been rebuilt)
  const selectsNow = Array.from(pane.querySelectorAll('select'));
  let tplSelectNow = selectsNow.find((s) => s.querySelector('option[value="__json__"]') || Array.from(s.options).some((o) => String(o.value || '').startsWith('tpl-')));
  if (!tplSelectNow) tplSelectNow = selectsNow[selectsNow.length - 1];
  return { newId: newIdFinal, tplSelect: tplSelectNow, pane };
}

module.exports = { ensureCssEscape, waitForLoad, pollForSelector, pollForCondition, setup, openTemplatesPane, createAndSaveTemplate };

