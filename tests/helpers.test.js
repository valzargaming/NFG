const { setup } = require('./_helpers');

// The refactor introduced a set of shared pure helpers on the runtime scope
// (they leak onto `window` because the inline script runs non-strict). These
// tests pin their semantics so future edits can't silently change how steps
// parse, how lists get numbered, or how form values round-trip.
describe('shared runtime helpers', () => {
  let win;
  beforeAll(async () => {
    const dom = await setup();
    win = dom.window;
  });

  describe('splitSteps', () => {
    test('splits on ">" and trims, dropping blank segments', () => {
      expect(win.splitSteps('A > B > C')).toEqual(['A', 'B', 'C']);
      expect(win.splitSteps('  A >>  B  > ')).toEqual(['A', 'B']);
    });
    test('handles empty / nullish input', () => {
      expect(win.splitSteps('')).toEqual([]);
      expect(win.splitSteps(null)).toEqual([]);
      expect(win.splitSteps(undefined)).toEqual([]);
    });
  });

  describe('parseStepPart', () => {
    test('splits "key => value" into {key, val}', () => {
      expect(win.parseStepPart('name => Alice')).toEqual({ key: 'name', val: 'Alice' });
    });
    test('keeps later "=>" occurrences inside the value', () => {
      expect(win.parseStepPart('k => a => b')).toEqual({ key: 'k', val: 'a => b' });
    });
    test('a plain part has an empty key', () => {
      expect(win.parseStepPart('  just text ')).toEqual({ key: '', val: 'just text' });
    });
  });

  describe('stripListPrefix', () => {
    test('removes leading numbering and bullets', () => {
      expect(win.stripListPrefix('1. Alpha')).toBe('Alpha');
      expect(win.stripListPrefix('2) Beta')).toBe('Beta');
      expect(win.stripListPrefix('- Gamma')).toBe('Gamma');
      expect(win.stripListPrefix('* Delta')).toBe('Delta');
      expect(win.stripListPrefix('• Epsilon')).toBe('Epsilon');
    });
    test('leaves an unprefixed string alone', () => {
      expect(win.stripListPrefix('plain')).toBe('plain');
    });
  });

  describe('toNumberedList', () => {
    test('renumbers, stripping any existing prefix, with a leading newline', () => {
      expect(win.toNumberedList(['A', '1. B', '- C'])).toBe('\n 1. A\n 2. B\n 3. C');
    });
    test('empty input yields an empty string', () => {
      expect(win.toNumberedList([])).toBe('');
    });
  });

  describe('rebuildMap', () => {
    test('indexes a list by id', () => {
      const a = { id: 'x', n: 1 };
      const b = { id: 'y', n: 2 };
      expect(win.rebuildMap([a, b])).toEqual({ x: a, y: b });
    });
    test('tolerates an empty / missing list', () => {
      expect(win.rebuildMap()).toEqual({});
      expect(win.rebuildMap([])).toEqual({});
    });
  });

  describe('el', () => {
    test('sets props, style, dataset, text and children', () => {
      const child = win.el('span', { text: 'hi' });
      const node = win.el(
        'div',
        { className: 'box', dataset: { role: 'x' }, style: { display: 'flex' } },
        child,
        'tail'
      );
      expect(node.tagName).toBe('DIV');
      expect(node.className).toBe('box');
      expect(node.dataset.role).toBe('x');
      expect(node.style.display).toBe('flex');
      expect(node.firstChild).toBe(child);
      expect(node.textContent).toBe('hitail');
    });
    test('wires on* handlers as listeners', () => {
      let clicked = 0;
      const btn = win.el('button', { onclick: () => (clicked += 1) });
      btn.dispatchEvent(new win.Event('click'));
      expect(clicked).toBe(1);
    });
    test('skips null/false children and null props', () => {
      const node = win.el('div', { title: null }, null, false, 'kept');
      expect(node.hasAttribute('title')).toBe(false);
      expect(node.textContent).toBe('kept');
    });
  });

  describe('formValues', () => {
    test('reads named controls, bucketing duplicates into arrays', () => {
      const form = win.el(
        'form',
        null,
        win.el('input', { name: 'a', value: '1' }),
        win.el('input', { name: 'b', value: 'x' }),
        win.el('input', { name: 'b', value: 'y' })
      );
      expect(win.formValues(form)).toEqual({ a: '1', b: ['x', 'y'] });
    });
    test('checkbox contributes its value only when checked', () => {
      const on = win.el('input', { type: 'checkbox', name: 'c', value: 'yes', checked: true });
      const off = win.el('input', { type: 'checkbox', name: 'd', value: 'no' });
      const form = win.el('form', null, on, off);
      expect(win.formValues(form)).toEqual({ c: 'yes', d: '' });
    });
    test('unnamed controls are ignored; no form yields {}', () => {
      const form = win.el('form', null, win.el('input', { value: 'anon' }));
      expect(win.formValues(form)).toEqual({});
      expect(win.formValues(null)).toEqual({});
    });
  });

  describe('applyValues', () => {
    test('writes text, radio and checkbox groups back', () => {
      const form = win.el(
        'form',
        null,
        win.el('input', { name: 'name', value: 'old' }),
        win.el('input', { type: 'radio', name: 'pick', value: 'a' }),
        win.el('input', { type: 'radio', name: 'pick', value: 'b' }),
        win.el('input', { type: 'checkbox', name: 'flags', value: 'x' }),
        win.el('input', { type: 'checkbox', name: 'flags', value: 'y' })
      );
      win.applyValues(form, { name: 'new', pick: 'b', flags: ['y'] });
      expect(form.elements['name'].value).toBe('new');
      const radios = Array.from(form.querySelectorAll('[name="pick"]'));
      expect(radios.map((r) => r.checked)).toEqual([false, true]);
      const checks = Array.from(form.querySelectorAll('[name="flags"]'));
      expect(checks.map((c) => c.checked)).toEqual([false, true]);
    });
    test('formValues -> applyValues round-trips', () => {
      const src = win.el(
        'form',
        null,
        win.el('input', { name: 'a', value: 'hello' }),
        win.el('input', { name: 'b', value: 'world' })
      );
      const snapshot = win.formValues(src);
      const dst = win.el(
        'form',
        null,
        win.el('input', { name: 'a', value: '' }),
        win.el('input', { name: 'b', value: '' })
      );
      win.applyValues(dst, snapshot);
      expect(win.formValues(dst)).toEqual(snapshot);
    });
  });

  describe('generateOutput', () => {
    test('null cfg returns pretty JSON of the values', () => {
      expect(win.generateOutput(null, { a: 1 })).toBe(JSON.stringify({ a: 1 }, null, 2));
    });
    test('template type substitutes {name}, using _combined as a numbered fallback', () => {
      const cfg = { type: 'template', template: 'Hi {who}. Steps:{steps}' };
      expect(win.generateOutput(cfg, { who: 'Al', steps_combined: 'One > Two' })).toBe(
        'Hi Al. Steps:\n 1. One\n 2. Two'
      );
    });
    test('an explicit array value is joined by newlines, not renumbered', () => {
      const cfg = { type: 'template', template: '{items}' };
      expect(win.generateOutput(cfg, { items: ['a', 'b'] })).toBe('a\nb');
    });
    test('sprintf type substitutes %(name)s', () => {
      const cfg = { type: 'sprintf', template: 'Hello %(who)s' };
      expect(win.generateOutput(cfg, { who: 'Bee' })).toBe('Hello Bee');
    });
    test('a bare string cfg is treated as a {name} template', () => {
      expect(win.generateOutput('X={x}', { x: '7' })).toBe('X=7');
    });
  });
});
