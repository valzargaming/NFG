const helpers = require('./_helpers');

let current = null;

/**
 * Load the app with a fresh copy of `config`, remembering the window so its
 * storage can be cleared after the test.
 *
 * @param {Object[]} config Tabs to seed.
 * @returns {Promise<JSDOM>} The loaded page.
 */
const setup = async (config) => {
  current = await helpers.setup(JSON.parse(JSON.stringify(config)));
  return current;
};

afterEach(() => {
  if (current) current.window.localStorage.clear();
  current = null;
});

const WORKSPACE = [
  {
    title: 'Workspace',
    fields: [{ label: 'Mine', name: 'mine', type: 'text' }],
    format: { type: 'template', template: 'Mine: {mine}' },
  },
];

const OLD_TABS = [
  {
    title: 'Callback',
    fields: [
      { label: 'Caller', name: 'caller', type: 'text' },
      { label: 'Notes [internal]', name: 'notes', type: 'textarea', optional: true },
    ],
    format: { type: 'template', template: 'Caller: {caller}\nNotes: {notes}' },
  },
  {
    title: 'Escalation',
    fields: [{ label: 'Reason', name: 'reason', type: 'text' }],
    format: { type: 'sprintf', template: 'Escalated: %(reason)s </b>' },
  },
];
const OLD_FORMS = [
  {
    id: 'custom-1',
    label: 'Spare form',
    cfg: 'Spare {x}',
    fields: [{ label: 'X', name: 'x', type: 'text' }],
    outputId: 'out-7',
  },
];
const OLD_OUTPUTS = [
  {
    id: 'out-7',
    label: 'Old output',
    cfg: null,
    fields: [{ label: 'X', name: 'x', type: 'text' }],
  },
];

/**
 * JSON-encode for embedding in a script, the way Export HTML does.
 *
 * @param {*} v Value to encode.
 * @returns {string} Escaped JSON.
 */
const embed = (v) => JSON.stringify(v).replace(/</g, '\\u003c');

/**
 * A synthetic export made by an older version: different CSS, the seed script
 * Export HTML writes, and app code that mentions the same keys in strings.
 *
 * @returns {string} Export HTML.
 */
const oldExport = () =>
  '<!doctype html>\n<html><head><style>.legacy-rule { color: red; }</style></head><body>' +
  `<script data-nfg-seed>try{window.formConfig = ${embed(OLD_TABS)};}catch(e){}` +
  'try{if(localStorage.getItem(\'nfg-seed\')!=="nfg-1"){' +
  `localStorage.setItem('nfg-forms', ${embed(OLD_FORMS)});` +
  `localStorage.setItem('nfg-outputs', ${embed(OLD_OUTPUTS)});` +
  "localStorage.setItem('nfg-form-map', {});localStorage.setItem('nfg-dev-mode', 'false');}}catch(e){}</script>" +
  '<script>const formConfig = window.formConfig && Array.isArray(window.formConfig) ? window.formConfig : [];' +
  "const a = \"localStorage.setItem('nfg-forms', \" + x; const b = 'window.formConfig = ' + y;</script>" +
  '</body></html>';

/**
 * The Designer root as currently rendered.
 *
 * @param {Window} win JSDOM window.
 * @returns {HTMLElement} The Designer root.
 */
const root = (win) => win.document.querySelector('.tab-pane[data-designer="true"] .designer');

/**
 * Open the Designer, paste `text` into the import panel and read it.
 *
 * @param {Window} win JSDOM window.
 * @param {string} text Export text.
 * @returns {void}
 */
const readImport = (win, text) => {
  win.document.querySelector('.tab[data-designer="true"]').click();
  root(win).querySelector('[data-designer="import"]').click();
  root(win).querySelector('[data-designer="import-text"]').value = text;
  root(win).querySelector('[data-designer="import-read"]').click();
};

/**
 * Capture what the next export writes, and the file name it would download as.
 *
 * @param {Window} win JSDOM window.
 * @returns {{html: ?string, name: ?string}} Filled in when the export runs.
 */
const captureExport = (win) => {
  const got = { html: null, name: null };
  win.Blob = function (parts) {
    got.html = parts.join('');
  };
  win.URL.createObjectURL = () => 'blob:fake';
  win.URL.revokeObjectURL = () => {};
  win.HTMLAnchorElement.prototype.click = function () {
    got.name = this.download;
  };
  win.confirm = () => false;
  return got;
};

describe('reading exports', () => {
  test('finds tabs, saved forms and outputs in an export without running it', async () => {
    const dom = await setup(WORKSPACE);
    const found = dom.window.parseNfgExport(oldExport());
    expect(found.map((f) => [f.kind, f.label, !!f.fromTab])).toEqual([
      ['outputs', 'Old output', false],
      ['forms', 'Callback', true],
      ['forms', 'Escalation', true],
      ['forms', 'Spare form', false],
    ]);
    expect(found[2].cfg.template).toBe('Escalated: %(reason)s </b>');
    expect(found[1].fields[1].label).toBe('Notes [internal]');
    expect(dom.window.document.title).toBe('Note Form Generator');
  });

  test('accepts JSON tab arrays and objects, and rejects anything else', async () => {
    const dom = await setup(WORKSPACE);
    const win = dom.window;
    expect(win.parseNfgExport(JSON.stringify(OLD_TABS))).toHaveLength(2);
    expect(
      win.parseNfgExport(JSON.stringify({ forms: OLD_FORMS, outputs: OLD_OUTPUTS }))
    ).toHaveLength(2);
    expect(win.parseNfgExport('<html><body>hello</body></html>')).toEqual([]);
    expect(win.parseNfgExport('not json {')).toEqual([]);
  });
});

describe('importing into the Designer', () => {
  test('lists what was found and says when nothing was', async () => {
    const dom = await setup(WORKSPACE);
    const win = dom.window;
    readImport(win, 'nothing here');
    expect(root(win).querySelector('.dz-import-error').textContent).toMatch(/No forms or outputs/);
    root(win).querySelector('[data-designer="import-text"]').value = oldExport();
    root(win).querySelector('[data-designer="import-read"]').click();
    const items = Array.from(root(win).querySelectorAll('[data-designer="import-list"] li'));
    expect(items.map((li) => li.textContent)).toEqual([
      'Output: Old output (1 field)',
      'Form: Callback (2 fields)',
      'Form: Escalation (1 field)',
      'Form: Spare form (1 field)',
    ]);
  });

  test('adds the definitions with new ids, keeps links and opens the first form', async () => {
    const dom = await setup(WORKSPACE);
    const win = dom.window;
    readImport(win, oldExport());
    root(win).querySelector('[data-designer="import-open"]').checked = true;
    root(win).querySelector('[data-designer="import-go"]').click();
    const stored = JSON.parse(win.localStorage.getItem('nfg-forms'));
    const callback = stored.find((f) => f.label === 'Callback');
    const spare = stored.find((f) => f.label === 'Spare form');
    const out = JSON.parse(win.localStorage.getItem('nfg-outputs')).find(
      (o) => o.label === 'Old output'
    );
    expect(callback.id).toMatch(/^custom-/);
    expect(out.id).not.toBe('out-7');
    expect(spare.outputId).toBe(out.id);
    expect(root(win).querySelector('[data-designer="label"]').value).toBe('Callback');
    expect(root(win).querySelector('[data-designer="style"]')).not.toBeNull();
    const tabs = Array.from(win.document.querySelectorAll('.tab:not(.right)')).map(
      (t) => t.textContent
    );
    expect(tabs).toEqual(['Workspace', 'Callback', 'Escalation', 'Spare form']);
    expect(root(win).querySelector('[data-designer="imported"]').textContent).toMatch(
      /3 forms, 1 output/
    );
  });

  test('a clashing name is kept apart', async () => {
    const dom = await setup([{ ...WORKSPACE[0], title: 'Callback' }]);
    const win = dom.window;
    readImport(win, JSON.stringify([OLD_TABS[0]]));
    root(win).querySelector('[data-designer="import-go"]').click();
    expect(root(win).querySelector('[data-designer="label"]').value).toBe('Callback (imported)');
  });

  test('the updated export holds the edits and the current styles and code', async () => {
    const dom = await setup(WORKSPACE);
    const win = dom.window;
    readImport(win, oldExport());
    root(win).querySelector('[data-designer="import-go"]').click();
    root(win).querySelector('[data-designer-add="email"]').click();
    const got = captureExport(win);
    root(win).querySelector('[data-designer="export-import"]').click();
    await new Promise((r) => setTimeout(r, 0));
    expect(got.html).toBeTruthy();
    expect(got.name).toBe('nfg-export.html');
    expect(got.html).not.toContain('legacy-rule');
    expect(got.html).toContain('.dz-card {');
    expect(got.html).toContain('function parseNfgExport');
    expect(got.html).not.toContain('data-designer="import-list"');
    const again = win.parseNfgExport(got.html);
    expect(again.filter((f) => f.fromTab).map((f) => f.label)).toEqual(['Callback', 'Escalation']);
    const callback = again.find((f) => f.label === 'Callback');
    expect(callback.fields.map((f) => f.name)).toEqual(['caller', 'notes', 'email']);
    expect(again.find((f) => f.label === 'Escalation').cfg).toEqual(OLD_TABS[1].format);
    const spare = again.find((f) => f.label === 'Spare form');
    expect(spare.cfg).toBe('Spare {x}');
    const out = again.find((f) => f.kind === 'outputs');
    expect(spare.outputId).toBe(out.oldId);
    expect(again.some((f) => f.label === 'Workspace')).toBe(false);
    expect(
      JSON.parse(win.localStorage.getItem('nfg-forms')).some((f) => f.label === 'Callback')
    ).toBe(true);
  });

  test('saving again reuses the imported file name', async () => {
    const dom = await setup(WORKSPACE);
    const win = dom.window;
    win.document.querySelector('.tab[data-designer="true"]').click();
    root(win).querySelector('[data-designer="import"]').click();
    win.designerReadImport(oldExport(), 'callbacks.html');
    root(win).querySelector('[data-designer="import-go"]').click();
    const got = captureExport(win);
    root(win).querySelector('[data-designer="export-import"]').click();
    await new Promise((r) => setTimeout(r, 0));
    expect(got.name).toBe('callbacks.html');
  });

  test('the import is remembered after a reload and can be forgotten', async () => {
    const dom = await setup(WORKSPACE);
    const win = dom.window;
    readImport(win, oldExport());
    root(win).querySelector('[data-designer="import-go"]').click();
    const saved = win.localStorage.getItem('nfg-import');
    expect(JSON.parse(saved).tabs).toHaveLength(2);
    const stop = Array.from(root(win).querySelectorAll('button')).find(
      (b) => b.textContent === 'Stop tracking'
    );
    stop.click();
    expect(win.localStorage.getItem('nfg-import')).toBeNull();
    expect(root(win).querySelector('[data-designer="imported"]')).toBeNull();
  });
});
