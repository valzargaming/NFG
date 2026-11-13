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

const NOTE = [
  {
    title: 'Note',
    fields: [
      { label: 'Name', name: 'name', type: 'text' },
      { label: 'Comments', name: 'comments', type: 'textarea', optional: true },
    ],
    format: { type: 'template', template: 'Name: {name}\nComments: {comments}\n[[?]]\nEnd' },
  },
];

/**
 * The Designer root as currently rendered.
 *
 * @param {Window} win JSDOM window.
 * @returns {HTMLElement} The Designer root.
 */
const root = (win) => win.document.querySelector('.tab-pane[data-designer="true"] .designer');

/**
 * Fill the canvas sample input of the field with the given label.
 *
 * @param {Window} win JSDOM window.
 * @param {string} label Field label.
 * @param {string} value Sample value.
 * @returns {void}
 */
const sample = (win, label, value) => {
  const card = Array.from(root(win).querySelectorAll('.dz-card')).find(
    (c) => c.querySelector('label') && c.querySelector('label').firstChild.textContent === label
  );
  const input = card.querySelector('[data-sample]');
  input.value = value;
  input.dispatchEvent(new win.Event('input', { bubbles: true }));
};

/**
 * Tick or untick a checkbox and fire its change event.
 *
 * @param {Window} win JSDOM window.
 * @param {HTMLInputElement} box Checkbox.
 * @param {boolean} on New state.
 * @returns {void}
 */
const tick = (win, box, on) => {
  box.checked = on;
  box.dispatchEvent(new win.Event('change', { bubbles: true }));
};

describe('conditional blank lines', () => {
  let win;
  beforeAll(async () => {
    win = (await helpers.setup()).window;
  });

  const tpl = { type: 'template', template: 'Name: {name}\nComments: {comments}\n[[?]]\nEnd' };

  test('a [[?]] line is a blank line while the optional field above is filled', () => {
    expect(win.generateOutput(tpl, { name: 'Al', comments: 'Hi' }, ['comments'])).toBe(
      'Name: Al\nComments: Hi\n\nEnd'
    );
  });

  test('a [[?]] line goes with the blank optional field above it', () => {
    expect(win.generateOutput(tpl, { name: 'Al', comments: '' }, ['comments'])).toBe(
      'Name: Al\nEnd'
    );
  });

  test('a field that is not optional always keeps the blank line', () => {
    expect(win.generateOutput(tpl, { name: 'Al', comments: '' })).toBe(
      'Name: Al\nComments: \n\nEnd'
    );
  });

  test('the nearest field above decides, past text-only lines', () => {
    const t = 'Notes:\n{notes}\nSee above\n[[?]]\n[[?]]\nB: {b}\n[[?]]\nEnd';
    expect(win.generateOutput(t, { notes: '', b: 'x' }, ['notes'])).toBe(
      'Notes:\nSee above\nB: x\n\nEnd'
    );
    expect(win.generateOutput(t, { notes: 'n', b: '' }, ['notes', 'b'])).toBe(
      'Notes:\nn\nSee above\n\n\nEnd'
    );
  });

  test('a [[?]] line with no field above, at the end, or in sprintf works', () => {
    expect(win.generateOutput('[[?]]\nA', {}, [])).toBe('\nA');
    expect(win.generateOutput('A: {a}\n[[?]]', { a: 'x' }, ['a'])).toBe('A: x\n');
    expect(win.generateOutput('A: {a}\n[[?]]', { a: '' }, ['a'])).toBe('');
    const sprintf = { type: 'sprintf', template: 'C: %(c)s\n  [[?]]  \nB' };
    expect(win.generateOutput(sprintf, { c: '' }, ['c'])).toBe('B');
    expect(win.generateOutput(sprintf, { c: 'y' }, ['c'])).toBe('C: y\n\nB');
  });

  test('[[?]] inside other text is ordinary template text', () => {
    expect(win.generateOutput('A [[?]] B', {}, [])).toBe('A ? B');
  });
});

describe('conditional blank lines in the Designer', () => {
  test('a [[?]] line loads as a ticked blank line and saves back unchanged', async () => {
    const dom = await setup(NOTE);
    const win = dom.window;
    const lines = win.parseOutputTemplate(NOTE[0].format.template);
    expect(lines[2]).toHaveLength(0);
    expect(lines[2].ifAbove).toBe(true);
    expect(win.compileOutputTemplate(lines, (p) => p.name)).toBe(NOTE[0].format.template);

    win.document.querySelector('.tab[data-designer="true"]').click();
    const box = root(win).querySelector('.dz-line [data-prop="ifAbove"]');
    expect(box.checked).toBe(true);
    sample(win, 'Name', 'Al');
    expect(root(win).querySelector('[data-designer="result"]').value).toBe('Name: Al\nEnd');
    sample(win, 'Comments', 'Hi');
    expect(root(win).querySelector('[data-designer="result"]').value).toBe(
      'Name: Al\nComments: Hi\n\nEnd'
    );
  });

  test('a blank line can be added and made conditional', async () => {
    const dom = await setup(NOTE);
    const win = dom.window;
    win.document.querySelector('.tab[data-designer="true"]').click();
    tick(win, root(win).querySelector('.dz-line [data-prop="ifAbove"]'), false);
    const tpl = () => root(win).querySelector('[data-designer="template"]').textContent;
    expect(tpl()).toBe('Name: {name}\nComments: {comments}\n\nEnd');
    expect(root(win).querySelectorAll('.dz-line [data-prop="ifAbove"]')).toHaveLength(1);

    root(win).querySelector('[data-designer="blank-line"]').click();
    const boxes = root(win).querySelectorAll('.dz-line [data-prop="ifAbove"]');
    expect(boxes).toHaveLength(2);
    tick(win, boxes[1], true);
    expect(tpl()).toBe('Name: {name}\nComments: {comments}\n\nEnd\n[[?]]');
    root(win).querySelector('[data-designer="save"]').click();
    const saved = JSON.parse(win.localStorage.getItem('nfg-forms')).find((f) => f.id === 'tpl-0');
    expect(saved.cfg.template).toBe('Name: {name}\nComments: {comments}\n\nEnd\n[[?]]');
  });
});
