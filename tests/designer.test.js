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

const TICKET = [
  {
    title: 'Ticket',
    fields: [
      { label: 'Title', name: 'title', type: 'text' },
      { label: 'Subtitle', name: 'subtitle', type: 'text' },
      { label: 'Additional Comments', name: 'comments', type: 'textarea', optional: true },
    ],
    format: {
      type: 'template',
      template: '{title}[[ - {subtitle}]]\nAdditional Comments: {comments}',
    },
  },
];

/**
 * Open the Designer tab and return its root element.
 *
 * @param {Window} win JSDOM window.
 * @returns {HTMLElement} The Designer root.
 */
const openDesigner = (win) => {
  win.document.querySelector('.tab[data-designer="true"]').click();
  return win.document.querySelector('.tab-pane[data-designer="true"] .designer');
};

/**
 * The Designer root as currently rendered.
 *
 * @param {Window} win JSDOM window.
 * @returns {HTMLElement} The Designer root.
 */
const root = (win) => win.document.querySelector('.tab-pane[data-designer="true"] .designer');

/**
 * Set a control's value and fire its input event.
 *
 * @param {Window} win JSDOM window.
 * @param {HTMLInputElement} node Control to change.
 * @param {string} value New value.
 * @returns {void}
 */
const type = (win, node, value) => {
  node.value = value;
  node.dispatchEvent(new win.Event('input', { bubbles: true }));
};

/**
 * The Designer's generated output preview.
 *
 * @param {Window} win JSDOM window.
 * @returns {string} Preview text.
 */
const preview = (win) => root(win).querySelector('[data-designer="result"]').value;

/**
 * The template text the design compiles to.
 *
 * @param {Window} win JSDOM window.
 * @returns {string} Template text.
 */
const template = (win) => root(win).querySelector('[data-designer="template"]').textContent;

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
  type(win, card.querySelector('[data-sample]'), value);
};

/**
 * Fire a cancelable `beforeunload` on the window.
 *
 * @param {Window} win JSDOM window.
 * @returns {boolean} True when the page asked to confirm leaving.
 */
const leaving = (win) => {
  const ev = new win.Event('beforeunload', { cancelable: true });
  win.dispatchEvent(ev);
  return ev.defaultPrevented;
};

/**
 * Drag `from` onto `to` with HTML5 drag events.
 *
 * @param {Window} win JSDOM window.
 * @param {Element} from Drag source.
 * @param {Element} to Drop target.
 * @returns {void}
 */
const drag = (win, from, to) => {
  const fire = (node, name) => {
    const ev = new win.Event(name, { bubbles: true, cancelable: true });
    ev.clientX = 99999;
    ev.clientY = 99999;
    node.dispatchEvent(ev);
  };
  fire(from, 'dragstart');
  fire(to, 'dragover');
  fire(to, 'drop');
  fire(from, 'dragend');
};

describe('designer template round trip', () => {
  test.each([
    '',
    'Hello {firstName}',
    '{title}[[ - {subtitle}]]',
    '[[{label}: ]]{value}',
    '{a}[[ - {b}[[ / {c}]]]]',
    'Name: {name}\n\nNotes: {notes}\n',
    '[[{a} and {b}]] tail',
    '[[\nExtra: {x}]]',
    'unmatched [[ bracket {x} and ]] here',
    '[[{a}]]',
  ])('compiling the parsed %j gives the same text', async (tpl) => {
    const dom = await setup(TICKET);
    const win = dom.window;
    const lines = win.parseOutputTemplate(tpl);
    expect(win.compileOutputTemplate(lines, (p) => p.name)).toBe(tpl);
  });

  test('a field with a separator becomes one piece', async () => {
    const dom = await setup(TICKET);
    const [line] = dom.window.parseOutputTemplate('{title}[[ - {subtitle}]]');
    expect(line).toHaveLength(2);
    expect(line[1]).toMatchObject({ kind: 'field', name: 'subtitle', before: ' - ', after: '' });
  });
});

describe('designer tab', () => {
  test('only shows in dev mode', async () => {
    const dom = await setup(TICKET);
    const win = dom.window;
    expect(win.document.querySelector('.tab[data-designer="true"]')).not.toBeNull();
    win.document.getElementById('devToggle').click();
    expect(win.document.querySelector('.tab[data-designer="true"]')).toBeNull();
  });

  test('loads the first form with its fields and output lines', async () => {
    const dom = await setup(TICKET);
    const win = dom.window;
    const r = openDesigner(win);
    expect(Array.from(r.querySelectorAll('.dz-card .dz-type')).map((n) => n.textContent)).toEqual([
      'Short text',
      'Short text',
      'Paragraph',
    ]);
    expect(r.querySelectorAll('.dz-line')).toHaveLength(2);
    expect(template(win)).toBe(TICKET[0].format.template);
    expect(r.querySelector('[data-designer="save"]').disabled).toBe(true);
  });

  test('preview drops the separator and the optional line when blank', async () => {
    const dom = await setup(TICKET);
    const win = dom.window;
    openDesigner(win);
    sample(win, 'Title', 'Report');
    expect(preview(win)).toBe('Report');
    sample(win, 'Subtitle', 'Q3');
    sample(win, 'Additional Comments', 'All good');
    expect(preview(win)).toBe('Report - Q3\nAdditional Comments: All good');
  });

  test('clicking a palette field adds it and its name follows the label', async () => {
    const dom = await setup(TICKET);
    const win = dom.window;
    openDesigner(win);
    root(win).querySelector('[data-designer-add="select"]').click();
    const label = root(win).querySelector('.dz-inspector [data-prop="label"]');
    type(win, label, 'Ticket Priority');
    expect(root(win).querySelector('.dz-inspector [data-prop="name"]').value).toBe(
      'ticketPriority'
    );
    const cards = root(win).querySelectorAll('.dz-card');
    expect(cards[cards.length - 1].querySelector('select').options).toHaveLength(2);
    expect(root(win).querySelector('[data-designer="save"]').disabled).toBe(false);
  });

  test('a duplicate field name blocks saving', async () => {
    const dom = await setup(TICKET);
    const win = dom.window;
    openDesigner(win);
    root(win).querySelectorAll('.dz-card-head')[1].click();
    type(win, root(win).querySelector('.dz-inspector [data-prop="name"]'), 'title');
    root(win).querySelector('[data-designer="save"]').click();
    expect(root(win).querySelector('.dz-problems .error').textContent).toMatch(/"title" twice/);
    expect(win.localStorage.getItem('nfg-forms')).toBeNull();
  });

  test('a separator set on a field chip is kept only when the field is filled', async () => {
    const dom = await setup([
      {
        title: 'Name',
        fields: [
          { label: 'First', name: 'first', type: 'text' },
          { label: 'Last', name: 'last', type: 'text' },
        ],
        format: { type: 'template', template: '{first}{last}' },
      },
    ]);
    const win = dom.window;
    openDesigner(win);
    root(win).querySelectorAll('.dz-field')[1].click();
    type(win, root(win).querySelector('[data-prop="piece-before"]'), ', ');
    expect(template(win)).toBe('{first}[[, {last}]]');
    sample(win, 'First', 'Ada');
    expect(preview(win)).toBe('Ada');
    sample(win, 'Last', 'Lovelace');
    expect(preview(win)).toBe('Ada, Lovelace');
  });

  test('marking a field optional drops its whole line', async () => {
    const dom = await setup([
      {
        title: 'Note',
        fields: [
          { label: 'Name', name: 'name', type: 'text' },
          { label: 'Notes', name: 'notes', type: 'text' },
        ],
        format: { type: 'template', template: 'Name: {name}\nNotes: {notes}' },
      },
    ]);
    const win = dom.window;
    openDesigner(win);
    sample(win, 'Name', 'Val');
    expect(preview(win)).toBe('Name: Val\nNotes: ');
    root(win).querySelectorAll('.dz-card-head')[1].click();
    const box = root(win).querySelector('.dz-inspector [data-prop="optional"]');
    box.checked = true;
    box.dispatchEvent(new win.Event('change'));
    expect(preview(win)).toBe('Name: Val');
  });

  test('an optional dropdown previews blank until an option is picked', async () => {
    const dom = await setup([
      {
        title: 'Note',
        fields: [{ label: 'Priority', name: 'priority', type: 'select', options: ['Low', 'High'] }],
        format: { type: 'template', template: 'Top\nPriority: {priority}' },
      },
    ]);
    const win = dom.window;
    openDesigner(win);
    expect(preview(win)).toBe('Top\nPriority: Low');
    root(win).querySelectorAll('.dz-card-head')[0].click();
    const box = root(win).querySelector('.dz-inspector [data-prop="optional"]');
    box.checked = true;
    box.dispatchEvent(new win.Event('change'));
    expect(preview(win)).toBe('Top');
    const select = root(win).querySelector('select[data-sample]');
    expect(select.value).toBe('');
    select.value = 'High';
    select.dispatchEvent(new win.Event('change'));
    expect(preview(win)).toBe('Top\nPriority: High');
  });

  test('dragging a palette field and a field chip builds the form and output', async () => {
    const dom = await setup(TICKET);
    const win = dom.window;
    openDesigner(win);
    drag(
      win,
      root(win).querySelector('[data-designer-add="date"]'),
      root(win).querySelector('[data-designer="canvas"]')
    );
    const types = Array.from(root(win).querySelectorAll('.dz-card .dz-type')).map(
      (n) => n.textContent
    );
    expect(types[types.length - 1]).toBe('Date');
    const chip = Array.from(root(win).querySelectorAll('[data-designer-insert]')).find(
      (b) => b.textContent === 'Date'
    );
    drag(win, chip, root(win).querySelector('[data-designer="new-line"]'));
    expect(template(win)).toBe(TICKET[0].format.template + '\n{date}');
  });

  test('saving updates the stored form and its open tab', async () => {
    const dom = await setup(TICKET);
    const win = dom.window;
    openDesigner(win);
    root(win).querySelector('[data-designer-add="email"]').click();
    root(win).querySelector('[data-designer="fill"]').click();
    expect(leaving(win)).toBe(true);
    root(win).querySelector('[data-designer="save"]').click();
    const saved = JSON.parse(win.localStorage.getItem('nfg-forms')).find((f) => f.id === 'tpl-0');
    expect(saved.fields.map((f) => f.name)).toEqual(['title', 'subtitle', 'comments', 'email']);
    expect(saved.cfg.template).toBe(TICKET[0].format.template + '\nEmail: {email}');
    const tabForm = win.document.querySelector(".tab-pane[data-index='0'] form");
    expect(tabForm.querySelector('[name="email"]')).not.toBeNull();
    expect(leaving(win)).toBe(false);
    expect(root(win).querySelector('[data-designer="status"]').textContent).toBe('Saved');
  });

  test('save and open tab adds a new form as a tab', async () => {
    const dom = await setup(TICKET);
    const win = dom.window;
    openDesigner(win);
    root(win).querySelector('[data-designer="new"]').click();
    type(win, root(win).querySelector('[data-designer="label"]'), 'Callback');
    root(win).querySelector('[data-designer-add="text"]').click();
    root(win).querySelector('[data-designer="fill"]').click();
    root(win).querySelector('[data-designer="open"]').click();
    const tabs = Array.from(win.document.querySelectorAll('.tab:not(.right)')).map(
      (t) => t.textContent
    );
    expect(tabs).toEqual(['Ticket', 'Callback']);
    expect(win.document.querySelector('.tab.active').textContent).toBe('Callback');
    const stored = JSON.parse(win.localStorage.getItem('nfg-forms'));
    const created = stored.find((f) => f.label === 'Callback');
    expect(created.id).toMatch(/^custom-/);
    expect(created.cfg).toEqual({ type: 'template', template: 'Short text: {shortText}' });
  });

  test('unsaved design work survives a dev-mode rebuild', async () => {
    const dom = await setup(TICKET);
    const win = dom.window;
    openDesigner(win);
    root(win).querySelector('[data-designer-add="number"]').click();
    win.document.getElementById('devToggle').click();
    win.document.getElementById('devToggle').click();
    expect(root(win).querySelectorAll('.dz-card')).toHaveLength(4);
    expect(leaving(win)).toBe(true);
  });

  test('switching definitions asks before discarding changes', async () => {
    const dom = await setup(TICKET);
    const win = dom.window;
    openDesigner(win);
    root(win).querySelector('[data-designer-add="number"]').click();
    win.confirm = jest.fn(() => false);
    const kind = root(win).querySelector('[data-designer="kind"]');
    kind.value = 'outputs';
    kind.dispatchEvent(new win.Event('change'));
    expect(win.confirm).toHaveBeenCalled();
    expect(root(win).querySelector('[data-designer="kind"]').value).toBe('forms');
    expect(root(win).querySelectorAll('.dz-card')).toHaveLength(4);
  });

  test('sprintf outputs stay sprintf when saved', async () => {
    const tpl = 'Hi %(name)s[[ from %(team)s]] {literal}';
    const dom = await setup([
      {
        title: 'Old',
        fields: [
          { label: 'Name', name: 'name', type: 'text' },
          { label: 'Team', name: 'team', type: 'text' },
        ],
        format: { type: 'sprintf', template: tpl },
      },
    ]);
    const win = dom.window;
    openDesigner(win);
    expect(template(win)).toBe(tpl);
    expect(root(win).querySelector('[data-designer="style"]').value).toBe('sprintf');
    sample(win, 'Name', 'Ada');
    expect(preview(win)).toBe('Hi Ada {literal}');
    root(win).querySelector('[data-designer-add="text"]').click();
    root(win).querySelector('[data-designer="save"]').click();
    const saved = JSON.parse(win.localStorage.getItem('nfg-forms')).find((f) => f.id === 'tpl-0');
    expect(saved.cfg).toEqual({ type: 'sprintf', template: tpl });
  });

  test('plain text outputs stay plain text, and the style can be switched', async () => {
    const dom = await setup([
      {
        title: 'Plain',
        fields: [{ label: 'Name', name: 'name', type: 'text' }],
        format: 'Hello {name}',
      },
    ]);
    const win = dom.window;
    openDesigner(win);
    expect(root(win).querySelector('[data-designer="style"]').value).toBe('string');
    expect(win.designerDefinition().cfg).toBe('Hello {name}');
    const style = root(win).querySelector('[data-designer="style"]');
    style.value = 'sprintf';
    style.dispatchEvent(new win.Event('change'));
    expect(template(win)).toBe('Hello %(name)s');
    expect(win.designerDefinition().cfg).toEqual({ type: 'sprintf', template: 'Hello %(name)s' });
  });

  test('a steps chip can show the steps exactly as typed', async () => {
    const dom = await setup([
      {
        title: 'Fix',
        fields: [{ label: 'Steps', name: 'steps', type: 'steps', keyMode: 'numbered' }],
        format: { type: 'template', template: 'Steps:{steps}' },
      },
    ]);
    const win = dom.window;
    openDesigner(win);
    sample(win, 'Steps', 'Open > Save');
    expect(preview(win)).toBe('Steps:1. Open\n2. Save');
    root(win).querySelector('.dz-field').click();
    const show = root(win).querySelector('[data-prop="piece-variant"]');
    show.value = '_combined';
    show.dispatchEvent(new win.Event('change'));
    expect(template(win)).toBe('Steps:{steps_combined}');
    expect(preview(win)).toBe('Steps:Open > Save');
    expect(root(win).querySelector('.dz-field').textContent).toMatch(/as typed/);
  });

  test('every extra input type can be added from the palette', async () => {
    const dom = await setup(TICKET);
    const win = dom.window;
    openDesigner(win);
    ['time', 'datetime-local', 'tel', 'url'].forEach((t) =>
      root(win).querySelector(`[data-designer-add="${t}"]`).click()
    );
    const types = Array.from(root(win).querySelectorAll('[data-sample]'))
      .slice(-4)
      .map((n) => n.type);
    expect(types).toEqual(['time', 'datetime-local', 'tel', 'url']);
  });

  test('a checkbox outputs Yes or its own text only when ticked', async () => {
    const dom = await setup([
      {
        title: 'Check',
        fields: [{ label: 'Name', name: 'name', type: 'text' }],
        format: { type: 'template', template: 'Name: {name}' },
      },
    ]);
    const win = dom.window;
    openDesigner(win);
    root(win).querySelector('[data-designer-add="checkbox"]').click();
    type(win, root(win).querySelector('.dz-inspector [data-prop="label"]'), 'Escalated');
    const opt = root(win).querySelector('.dz-inspector [data-prop="optional"]');
    opt.checked = true;
    opt.dispatchEvent(new win.Event('change'));
    root(win).querySelector('[data-designer="fill"]').click();
    expect(template(win)).toBe('Name: {name}\nEscalated: {escalated}');
    expect(preview(win)).toBe('Name: ');
    const box = root(win).querySelector('.dz-card:last-child [data-sample]');
    box.checked = true;
    box.dispatchEvent(new win.Event('change'));
    expect(preview(win)).toBe('Name: \nEscalated: Yes');
    root(win).querySelectorAll('.dz-card-head')[1].click();
    type(win, root(win).querySelector('.dz-inspector [data-prop="default"]'), 'Tier 2');
    expect(preview(win)).toBe('Name: \nEscalated: Tier 2');

    root(win).querySelector('[data-designer="save"]').click();
    const formPane = win.document.querySelector(".tab-pane[data-index='0']");
    const gen = Array.from(formPane.querySelectorAll('button')).find(
      (b) => b.textContent === 'Generate'
    );
    const out = formPane.querySelector('textarea[readonly]');
    formPane.querySelector('[name="name"]').value = 'Val';
    gen.click();
    expect(out.value).toBe('Name: Val');
    formPane.querySelector('[name="escalated"]').checked = true;
    gen.click();
    expect(out.value).toBe('Name: Val\nEscalated: Tier 2');
  });

  test('a new form can start from an Output and stays linked to it', async () => {
    const dom = await setup(TICKET);
    const win = dom.window;
    openDesigner(win);
    root(win).querySelector('[data-designer="new"]').click();
    const link = root(win).querySelector('[data-designer="output-link"]');
    link.value = 'out-0';
    link.dispatchEvent(new win.Event('change'));
    expect(root(win).querySelectorAll('.dz-card')).toHaveLength(3);
    expect(root(win).querySelector('[data-designer="label"]').value).toBe('Ticket');
    expect(template(win)).toBe(TICKET[0].format.template);
    root(win).querySelector('[data-designer="save"]').click();
    const created = JSON.parse(win.localStorage.getItem('nfg-forms')).find((f) =>
      /^custom-/.test(f.id)
    );
    expect(created.outputId).toBe('out-0');
    expect(root(win).querySelector('[data-designer="output-link"]').value).toBe('out-0');
  });
});
