/**
 * The dev-mode editing cycle: turn dev mode on, edit a tab's form, unload the
 * tab, load it back, export — and have the export carry the fixed version.
 *
 * Every step of that used to be broken for built-in tabs, which are all the
 * tabs an exported file has: the editor opened them with an empty Fields box,
 * saving that wiped the tab, Unload refused them, Load was a no-op while the tab
 * existed, a page refresh put the old fields back, and the export's positional
 * `tpl-N` ids handed a tab the definition of whatever used to sit in its slot.
 */
const { JSDOM } = require('jsdom');
const path = require('path');
const { setup, openTemplatesPane, waitForLoad, ensureCssEscape } = require('./_helpers');

const PHONE_FIELDS = [
  { label: 'First name', name: 'firstName', type: 'text' },
  { label: 'Email', name: 'email', type: 'text' },
  { label: 'Phone', name: 'phone', type: 'text' },
];

const button = (root, text) =>
  Array.from(root.querySelectorAll('button')).find((b) => b.textContent.trim() === text);
const tabTitles = (win) =>
  Array.from(win.document.querySelectorAll('.tab:not(.right)'))
    .map((t) => t.textContent)
    .filter((t) => t !== 'Outputs');
const fieldNames = (win, idx) => {
  const form = win.document.querySelector(`.tab-pane[data-index='${idx}'] form.generated-form`);
  return form
    ? Array.from(form.elements)
        .map((e) => e.name)
        .filter(Boolean)
    : null;
};

/** Open the Forms pane with form `id` selected; returns the editor controls. */
async function editForm(dom, id) {
  const win = dom.window;
  const pane = await openTemplatesPane(dom);
  const select = button(pane, '+ New').parentElement.querySelector('select');
  select.value = id;
  select.dispatchEvent(new win.Event('change'));
  const fields = Array.from(pane.querySelectorAll('label')).find(
    (l) => l.textContent.trim() === 'Fields (JSON array)'
  ).nextElementSibling;
  return { pane, select, fields, label: pane.querySelector('input[type="text"]') };
}

function exportHtml(win) {
  win._exported = null;
  win.Blob = function (parts) {
    win._exported = parts.join('');
    return { size: win._exported.length };
  };
  win.URL.createObjectURL = () => 'blob://export';
  win.confirm = () => false; // Cancel = save to file
  win.document.querySelector('button[data-export-button="true"]').click();
  return win._exported;
}

async function open(html, url, beforeParse) {
  const dom = new JSDOM(html, { runScripts: 'dangerously', url, beforeParse });
  await waitForLoad(dom.window);
  ensureCssEscape(dom.window);
  dom.window.alert = () => {};
  return dom;
}

async function fresh() {
  const dom = await setup();
  dom.window.alert = jest.fn();
  return dom;
}

describe('dev-mode edit → unload → reload → export', () => {
  test('the editor opens a built-in tab with its real fields', async () => {
    const dom = await fresh();
    const { fields } = await editForm(dom, 'tpl-0');

    expect(JSON.parse(fields.value).map((f) => f.name)).toEqual(['firstName', 'email']);
  });

  test('saving a built-in form after renaming it does not wipe the tab', async () => {
    const dom = await fresh();
    const win = dom.window;
    const { pane, label } = await editForm(dom, 'tpl-0');
    label.value = 'Profile (renamed)';
    button(pane, 'Save').click();

    expect(fieldNames(win, 0)).toEqual(['firstName', 'email']);
  });

  test('a built-in tab can be unloaded, and Load brings it back with the edit', async () => {
    const dom = await fresh();
    const win = dom.window;

    const ed = await editForm(dom, 'tpl-0');
    ed.fields.value = JSON.stringify(PHONE_FIELDS);
    button(ed.pane, 'Save').click();

    button(win.document.querySelector(`.tab-pane[data-index='0']`), 'Unload').click();
    expect(win.alert).not.toHaveBeenCalledWith('Cannot unload a default form tab.');
    expect(tabTitles(win)).toEqual(['Contact', 'Survey']);

    const back = await editForm(dom, 'tpl-0');
    button(back.pane, 'Load').click();
    expect(tabTitles(win)).toEqual(['Contact', 'Survey', 'Profile']);
    expect(fieldNames(win, 2)).toEqual(['firstName', 'email', 'phone']);
  });

  test('Load on a tab that still exists reloads it in place from the saved definition', async () => {
    const dom = await fresh();
    const win = dom.window;
    const ed = await editForm(dom, 'tpl-1');
    ed.fields.value = JSON.stringify(PHONE_FIELDS);
    button(ed.pane, 'Save').click();

    // Let the tab drift from its saved definition, then re-render it, so the
    // only thing that can bring the definition back is Load itself (it used to
    // do nothing while the tab existed).
    win.formConfig[1].fields = PHONE_FIELDS.slice(0, 1);
    const dev = win.document.getElementById('devToggle');
    dev.checked = false;
    dev.dispatchEvent(new win.Event('change'));
    dev.checked = true;
    dev.dispatchEvent(new win.Event('change'));
    expect(fieldNames(win, 1)).toEqual(['firstName']);

    const again = await editForm(dom, 'tpl-1');
    button(again.pane, 'Load').click();

    expect(tabTitles(win)).toEqual(['Profile', 'Contact', 'Survey']); // no duplicate
    expect(fieldNames(win, 1)).toEqual(['firstName', 'email', 'phone']);
  });

  test('the export carries the fixed tab, and no tab inherits a neighbour’s definition', async () => {
    const dom = await fresh();
    const win = dom.window;
    const ed = await editForm(dom, 'tpl-0');
    ed.fields.value = JSON.stringify(PHONE_FIELDS);
    button(ed.pane, 'Save').click();
    button(win.document.querySelector(`.tab-pane[data-index='0']`), 'Unload').click();
    const back = await editForm(dom, 'tpl-0');
    button(back.pane, 'Load').click();

    const exported = await open(exportHtml(win), 'http://localhost/exported');
    const w2 = exported.window;

    expect(tabTitles(w2)).toEqual(['Contact', 'Survey', 'Profile']);
    // Contact now sits where Profile was. With the old positional `tpl-0`
    // shipped in the export, Contact would have rendered Profile's fields.
    expect(fieldNames(w2, 0)).toEqual(['firstName', 'email']);
    expect(fieldNames(w2, 2)).toEqual(['firstName', 'email', 'phone']);
  });

  test('a page refresh keeps a saved edit on the tab', async () => {
    const dom = await fresh();
    const win = dom.window;
    const ed = await editForm(dom, 'tpl-0');
    ed.fields.value = JSON.stringify(PHONE_FIELDS);
    button(ed.pane, 'Save').click();

    const saved = {};
    for (let k = 0; k < win.localStorage.length; k++) {
      const key = win.localStorage.key(k);
      saved[key] = win.localStorage.getItem(key);
    }
    const html = require(path.resolve(__dirname, '..', 'src', 'form-generator.html'));
    const seed = JSON.parse(JSON.stringify(win.formConfig)).map(({ title, fields, format }) => ({
      title,
      fields: title === 'Profile' ? fields.slice(0, 2) : fields, // the ORIGINAL seed
      format,
    }));
    const refreshed = await open(html, 'http://localhost/refresh', (w) => {
      w.formConfig = seed;
      Object.entries(saved).forEach(([k, v]) => w.localStorage.setItem(k, v));
    });

    expect(fieldNames(refreshed.window, 0)).toEqual(['firstName', 'email', 'phone']);
  });

  test('unloading a tab leaves every other tab its own typed values', async () => {
    const dom = await fresh();
    const win = dom.window;
    const typeInto = (idx, value) => {
      const input = win.document.querySelector(
        `.tab-pane[data-index='${idx}'] form.generated-form [name="firstName"]`
      );
      input.value = value;
    };
    typeInto(0, 'profile-value');
    typeInto(1, 'contact-value');
    typeInto(2, 'survey-value');

    button(win.document.querySelector(`.tab-pane[data-index='0']`), 'Unload').click();

    const valueAt = (idx) =>
      win.document.querySelector(
        `.tab-pane[data-index='${idx}'] form.generated-form [name="firstName"]`
      ).value;
    expect(valueAt(0)).toBe('contact-value'); // was shifted onto Contact as 'profile-value'
    expect(valueAt(1)).toBe('survey-value');
  });

  test('Reset restores the original tabs and the original built-in definitions', async () => {
    const dom = await fresh();
    const win = dom.window;
    const ed = await editForm(dom, 'tpl-0');
    ed.fields.value = JSON.stringify(PHONE_FIELDS);
    button(ed.pane, 'Save').click();
    button(win.document.querySelector(`.tab-pane[data-index='0']`), 'Unload').click();

    const pane = await openTemplatesPane(dom);
    button(pane, 'Reset to defaults').click();

    expect(tabTitles(win)).toEqual(['Profile', 'Contact', 'Survey']);
    expect(fieldNames(win, 0)).toEqual(['firstName', 'email']);
    const { fields } = await editForm(dom, 'tpl-0');
    expect(JSON.parse(fields.value).map((f) => f.name)).toEqual(['firstName', 'email']);
  });

  test('saving a loaded form reaches its tab even after the user has typed into it', async () => {
    const dom = await fresh();
    const win = dom.window;
    // Build a custom form and load it as a tab.
    const pane = await openTemplatesPane(dom);
    button(pane, '+ New').click();
    const created = await editForm(
      dom,
      JSON.parse(win.localStorage.getItem('nfg-forms')).slice(-1)[0].id
    );
    created.fields.value = JSON.stringify(PHONE_FIELDS.slice(0, 1));
    button(created.pane, 'Save').click();
    const id = created.select.value;
    button((await editForm(dom, id)).pane, 'Load').click();
    const idx = tabTitles(win).length - 1;

    win.document.querySelector(
      `.tab-pane[data-index='${idx}'] form.generated-form [name="firstName"]`
    ).value = 'typed';

    const ed = await editForm(dom, id);
    ed.fields.value = JSON.stringify(PHONE_FIELDS);
    button(ed.pane, 'Save').click();

    expect(fieldNames(win, idx)).toEqual(['firstName', 'email', 'phone']);
    expect(
      win.document.querySelector(
        `.tab-pane[data-index='${idx}'] form.generated-form [name="firstName"]`
      ).value
    ).toBe('typed');
  });
});

describe('working inside an exported file', () => {
  /** Export the default session and open the result as a fresh page. */
  async function openedExport() {
    const dom = await fresh();
    const html = exportHtml(dom.window);
    return { html, dom: await open(html, 'http://localhost/exported') };
  }
  /** Switch dev mode on and save PHONE_FIELDS into tab 0's form. */
  async function fixTab0(dom) {
    const win = dom.window;
    const dev = win.document.getElementById('devToggle');
    dev.checked = true;
    dev.dispatchEvent(new win.Event('change'));
    const ed = await editForm(dom, 'tpl-0');
    ed.fields.value = JSON.stringify(PHONE_FIELDS);
    button(ed.pane, 'Save').click();
  }
  const storageOf = (win) => {
    const out = {};
    for (let k = 0; k < win.localStorage.length; k++) {
      const key = win.localStorage.key(k);
      out[key] = win.localStorage.getItem(key);
    }
    return out;
  };

  test('an edit made in an exported file survives refreshing that file', async () => {
    const { html, dom } = await openedExport();
    await fixTab0(dom);

    // Same file, same browser storage: its seed script runs again on reload.
    // It used to rewrite storage every time, erasing the edit just made.
    const saved = storageOf(dom.window);
    const again = await open(html, 'http://localhost/exported-again', (w) =>
      Object.entries(saved).forEach(([k, v]) => w.localStorage.setItem(k, v))
    );

    expect(fieldNames(again.window, 0)).toEqual(['firstName', 'email', 'phone']);
    expect(again.window.localStorage.getItem('nfg-dev-mode')).toBe('true');
  });

  test('re-exporting a fixed exported file ships the fix, not the version before it', async () => {
    const { dom } = await openedExport();
    await fixTab0(dom);

    // The document being exported still carried its OWN seed; the new one went
    // in ahead of it, so the old one ran last and won.
    const reexported = exportHtml(dom.window);
    // Count real seeds by their opening statement: the app's own source also
    // contains the text `<script data-nfg-seed>` (it is what writes the tag).
    expect((reexported.match(/<script data-nfg-seed>try\{window\.formConfig/g) || []).length).toBe(
      1
    );

    const opened = await open(reexported, 'http://localhost/reexported');
    expect(fieldNames(opened.window, 0)).toEqual(['firstName', 'email', 'phone']);
  });
});

describe('the tab list survives a refresh', () => {
  const APP = require(path.resolve(__dirname, '..', 'src', 'form-generator.html'));
  /** The tabs the page was shipped with, as `setup()` seeded them. */
  const seedOf = (win) =>
    JSON.parse(JSON.stringify(win.formConfig)).map((t) =>
      Object.fromEntries(Object.entries(t).filter(([k]) => !k.startsWith('_')))
    );
  /** Reload the app: same original tabs (unless overridden), same storage. */
  async function refresh(win, seed) {
    const saved = {};
    for (let k = 0; k < win.localStorage.length; k++) {
      const key = win.localStorage.key(k);
      saved[key] = win.localStorage.getItem(key);
    }
    return open(APP, `http://localhost/r${Math.random()}`, (w) => {
      w.formConfig = seed;
      Object.entries(saved).forEach(([k, v]) => w.localStorage.setItem(k, v));
    });
  }
  const unloadTab = (win, idx) =>
    button(win.document.querySelector(`.tab-pane[data-index='${idx}']`), 'Unload').click();

  test('an unloaded tab stays unloaded', async () => {
    const dom = await fresh();
    const seed = seedOf(dom.window);
    unloadTab(dom.window, 0);

    const again = await refresh(dom.window, seed);
    expect(tabTitles(again.window)).toEqual(['Contact', 'Survey']);
  });

  test('a loaded form stays loaded, with its fields', async () => {
    const dom = await fresh();
    const win = dom.window;
    const seed = seedOf(win);
    const pane = await openTemplatesPane(dom);
    button(pane, '+ New').click();
    const id = JSON.parse(win.localStorage.getItem('nfg-forms')).slice(-1)[0].id;
    const ed = await editForm(dom, id);
    ed.label.value = 'Intake';
    ed.fields.value = JSON.stringify(PHONE_FIELDS);
    button(ed.pane, 'Save').click();
    button((await editForm(dom, id)).pane, 'Load').click();

    const again = await refresh(win, seed);
    const titles = tabTitles(again.window);
    expect(titles).toEqual(['Profile', 'Contact', 'Survey', 'Intake']);
    expect(fieldNames(again.window, 3)).toEqual(['firstName', 'email', 'phone']);
  });

  test('a New tab stays, and keeps its typed values when another tab is unloaded', async () => {
    const dom = await fresh();
    const win = dom.window;
    const seed = seedOf(win);
    button(win.document.querySelector(`.tab-pane[data-index='1']`), 'New').click();
    const idx = tabTitles(win).indexOf('Contact (new)');
    expect(idx).toBe(3);
    win.document.querySelector(
      `.tab-pane[data-index='${idx}'] form.generated-form [name="firstName"]`
    ).value = 'in the new tab';

    unloadTab(win, 0); // shifts the New tab down to index 2
    expect(
      win.document.querySelector(`.tab-pane[data-index='2'] form.generated-form [name="firstName"]`)
        .value
    ).toBe('in the new tab');

    const again = await refresh(win, seed);
    expect(tabTitles(again.window)).toEqual(['Contact', 'Survey', 'Contact (new)']);
  });

  test('when the page ships different tabs, those win over the saved list', async () => {
    const dom = await fresh();
    const seed = seedOf(dom.window);
    unloadTab(dom.window, 0);

    const updated = [
      ...seed,
      { title: 'Billing', fields: [{ label: 'Card', name: 'card', type: 'text' }], format: null },
    ];
    const again = await refresh(dom.window, updated);
    expect(tabTitles(again.window)).toEqual(['Profile', 'Contact', 'Survey', 'Billing']);
  });

  test('Reset to defaults also resets what a refresh shows', async () => {
    const dom = await fresh();
    const seed = seedOf(dom.window);
    unloadTab(dom.window, 0);
    button(await openTemplatesPane(dom), 'Reset to defaults').click();

    const again = await refresh(dom.window, seed);
    expect(tabTitles(again.window)).toEqual(['Profile', 'Contact', 'Survey']);
  });

  test('inside an exported file too: an unload survives refreshing that file', async () => {
    const dom = await fresh();
    const html = exportHtml(dom.window);
    const exported = await open(html, 'http://localhost/exp');
    const dev = exported.window.document.getElementById('devToggle');
    dev.checked = true;
    dev.dispatchEvent(new exported.window.Event('change'));
    unloadTab(exported.window, 0);

    const saved = {};
    const w = exported.window;
    for (let k = 0; k < w.localStorage.length; k++)
      saved[w.localStorage.key(k)] = w.localStorage.getItem(w.localStorage.key(k));
    const again = await open(html, 'http://localhost/exp2', (x) =>
      Object.entries(saved).forEach(([k, v]) => x.localStorage.setItem(k, v))
    );
    expect(tabTitles(again.window)).toEqual(['Contact', 'Survey']);
  });
});

describe('reordering tabs', () => {
  const APP = require(path.resolve(__dirname, '..', 'src', 'form-generator.html'));
  const pane = (win, idx) => win.document.querySelector(`.tab-pane[data-index='${idx}']`);
  const moveBtn = (win, idx, dir) => pane(win, idx).querySelector(`[data-move='${dir}']`);
  const tabEl = (win, idx) =>
    win.document.querySelector(`#tabbar .tab[data-index='${idx}']:not(.right)`);
  /** Drag tab `from` and drop it on tab `onto`, left or right half. */
  function drag(win, from, onto, half) {
    // jsdom lays nothing out, so every tab's box is 0 wide at x 0: a drop at
    // x 1 is on the right half, at x 0 on the left.
    const clientX = half === 'right' ? 1 : 0;
    tabEl(win, from).dispatchEvent(new win.MouseEvent('dragstart', { bubbles: true }));
    const target = tabEl(win, onto);
    target.dispatchEvent(
      new win.MouseEvent('dragover', { bubbles: true, cancelable: true, clientX })
    );
    target.dispatchEvent(new win.MouseEvent('drop', { bubbles: true, cancelable: true, clientX }));
  }

  test('Move right / Move left reorder the tab, and are disabled at the ends', async () => {
    const dom = await fresh();
    const win = dom.window;
    expect(moveBtn(win, 0, 'left').disabled).toBe(true);
    expect(moveBtn(win, 2, 'right').disabled).toBe(true);

    moveBtn(win, 0, 'right').click();
    expect(tabTitles(win)).toEqual(['Contact', 'Profile', 'Survey']);
    moveBtn(win, 2, 'left').click();
    expect(tabTitles(win)).toEqual(['Contact', 'Survey', 'Profile']);
  });

  test('typed values travel with the tab', async () => {
    const dom = await fresh();
    const win = dom.window;
    pane(win, 0).querySelector('[name="firstName"]').value = 'profile-value';
    pane(win, 1).querySelector('[name="firstName"]').value = 'contact-value';

    moveBtn(win, 0, 'right').click();

    expect(pane(win, 0).querySelector('[name="firstName"]').value).toBe('contact-value');
    expect(pane(win, 1).querySelector('[name="firstName"]').value).toBe('profile-value');
  });

  test('focus stays on the Move button, so a key held down keeps moving the tab', async () => {
    const dom = await fresh();
    const win = dom.window;
    moveBtn(win, 0, 'right').click();

    expect(win.document.activeElement).toBe(moveBtn(win, 1, 'right'));
  });

  test('dragging a tab onto the right half of another lands it after that tab', async () => {
    const dom = await fresh();
    const win = dom.window;
    drag(win, 0, 2, 'right');
    expect(tabTitles(win)).toEqual(['Contact', 'Survey', 'Profile']);
  });

  test('dragging a tab onto the left half of another lands it before that tab', async () => {
    const dom = await fresh();
    const win = dom.window;
    drag(win, 2, 0, 'left');
    expect(tabTitles(win)).toEqual(['Survey', 'Profile', 'Contact']);
  });

  test('dropping a tab on itself changes nothing', async () => {
    const dom = await fresh();
    const win = dom.window;
    drag(win, 1, 1, 'right');
    expect(tabTitles(win)).toEqual(['Profile', 'Contact', 'Survey']);
  });

  test('the new order survives a refresh and ships in the export', async () => {
    const dom = await fresh();
    const win = dom.window;
    const seed = JSON.parse(JSON.stringify(win.formConfig)).map((t) =>
      Object.fromEntries(Object.entries(t).filter(([k]) => !k.startsWith('_')))
    );
    drag(win, 2, 0, 'left');

    const saved = {};
    for (let k = 0; k < win.localStorage.length; k++) {
      saved[win.localStorage.key(k)] = win.localStorage.getItem(win.localStorage.key(k));
    }
    const again = await open(APP, 'http://localhost/reordered', (w) => {
      w.formConfig = seed;
      Object.entries(saved).forEach(([k, v]) => w.localStorage.setItem(k, v));
    });
    expect(tabTitles(again.window)).toEqual(['Survey', 'Profile', 'Contact']);

    const exported = await open(exportHtml(win), 'http://localhost/reordered-export');
    expect(tabTitles(exported.window)).toEqual(['Survey', 'Profile', 'Contact']);
    expect(fieldNames(exported.window, 1)).toEqual(['firstName', 'email']);
  });

  test('saving a form after a reorder still updates the tab that IS that form', async () => {
    const dom = await fresh();
    const win = dom.window;
    drag(win, 0, 2, 'right'); // Profile (tpl-0) now last

    const ed = await editForm(dom, 'tpl-0');
    ed.fields.value = JSON.stringify(PHONE_FIELDS);
    button(ed.pane, 'Save').click();

    expect(fieldNames(win, 2)).toEqual(['firstName', 'email', 'phone']); // Profile
    expect(fieldNames(win, 0)).toEqual(['firstName', 'email']); // Contact untouched
  });

  test('reordering is a dev-mode tool: off, there are no Move buttons and nothing drags', async () => {
    const dom = await fresh();
    const win = dom.window;
    const dev = win.document.getElementById('devToggle');
    dev.checked = false;
    dev.dispatchEvent(new win.Event('change'));

    expect(pane(win, 0).querySelector('[data-move]')).toBeNull();
    expect(tabEl(win, 0).draggable).toBe(false);
  });
});
