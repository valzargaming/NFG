const { setup } = require('./_helpers');

describe('optional fields', () => {
  let win;
  beforeAll(async () => {
    win = (await setup()).window;
  });

  const tpl = { type: 'template', template: 'Name: {name}\nAdditional Comments: {comments}\nEnd' };

  test('a blank optional field drops its whole template line', () => {
    expect(win.generateOutput(tpl, { name: 'Al', comments: '' }, ['comments'])).toBe(
      'Name: Al\nEnd'
    );
    expect(win.generateOutput(tpl, { name: 'Al', comments: '  ' }, ['comments'])).toBe(
      'Name: Al\nEnd'
    );
    expect(win.generateOutput(tpl, { name: 'Al' }, ['comments'])).toBe('Name: Al\nEnd');
  });

  test('a filled optional field and blank required fields are kept', () => {
    expect(win.generateOutput(tpl, { name: '', comments: 'Hi' }, ['comments'])).toBe(
      'Name: \nAdditional Comments: Hi\nEnd'
    );
    expect(win.generateOutput(tpl, { name: 'Al', comments: '' })).toBe(
      'Name: Al\nAdditional Comments: \nEnd'
    );
  });

  test('the last line, steps, sprintf and bare strings honour optional fields', () => {
    const last = { type: 'template', template: 'A\nNotes: {notes}' };
    expect(win.generateOutput(last, { notes: '' }, ['notes'])).toBe('A');
    const steps = { type: 'template', template: 'Steps:{steps_combined}\nTasks:{steps}\nZ' };
    expect(win.generateOutput(steps, { steps_combined: '' }, ['steps'])).toBe('Z');
    const sprintf = { type: 'sprintf', template: 'A\nC: %(c)s\nB' };
    expect(win.generateOutput(sprintf, { c: '' }, ['c'])).toBe('A\nB');
    expect(win.generateOutput('A\nC: {c}', { c: 'x' }, ['c'])).toBe('A\nC: x');
    expect(win.generateOutput('A\nC: {c}\n', { c: '' }, ['c'])).toBe('A\n');
  });

  test('the JSON fallback omits blank optional fields only', () => {
    const out = JSON.parse(
      win.generateOutput(null, { a: '', b: '', s_combined: '', s: [], t_combined: 'x' }, [
        'b',
        's',
        't',
      ])
    );
    expect(out).toEqual({ a: '', t_combined: 'x' });
  });

  test('the form marks optional fields and Generate leaves blank ones out', async () => {
    const dom = await setup([
      {
        title: 'Note',
        fields: [
          { label: 'Name', name: 'name', type: 'text' },
          { label: 'Additional Comments:', name: 'comments', type: 'textarea', optional: true },
        ],
        format: null,
      },
    ]);
    const pane = dom.window.document.querySelector('.tab-pane[data-index="0"]');
    const labels = Array.from(pane.querySelectorAll('form label')).map((l) => l.textContent);
    expect(labels).toEqual(['Name', 'Additional Comments: (optional)']);
    const generate = () => {
      Array.from(pane.querySelectorAll('button'))
        .find((b) => b.textContent.trim() === 'Generate')
        .click();
      return JSON.parse(
        Array.from(pane.querySelectorAll('textarea')).find((e) => e.readOnly).value
      );
    };
    expect(generate()).toEqual({ name: '' });
    pane.querySelector('[name="comments"]').value = 'Thanks';
    expect(generate()).toEqual({ name: '', comments: 'Thanks' });
  });

  test.each(['numbered', 'bullet'])(
    'an optional %s steps field drops its label line only when every row is empty',
    async (keyMode) => {
      const dom = await setup([
        {
          title: 'Note',
          fields: [
            { label: 'Name', name: 'name', type: 'text' },
            {
              label: 'Next Steps',
              name: 'nextSteps',
              type: 'steps',
              keyMode,
              optional: true,
              controls: { click: true },
            },
          ],
          format: { type: 'template', template: 'Name: {name}\nNext Steps: {nextSteps}\nEnd' },
        },
      ]);
      const pane = dom.window.document.querySelector('.tab-pane[data-index="0"]');
      const generate = () => {
        Array.from(pane.querySelectorAll('button'))
          .find((b) => b.textContent.trim() === 'Generate')
          .click();
        return Array.from(pane.querySelectorAll('textarea')).find((e) => e.readOnly).value;
      };
      pane.querySelector('[name="name"]').value = 'Al';
      expect(pane.querySelectorAll('.step-row')).toHaveLength(1);
      expect(generate()).toBe('Name: Al\nEnd');
      pane.querySelector('[data-step="click"]').click();
      expect(generate()).toBe('Name: Al\nEnd');
      pane.querySelector('[data-step="insert"]').click();
      expect(generate()).toBe('Name: Al\nEnd');
      pane.querySelectorAll('[name="nextSteps"]')[1].value = 'Call back';
      const [k1, k2, k3] = keyMode === 'numbered' ? ['1.', '2.', '3.'] : ['-', '-', '-'];
      expect(generate()).toBe(`Name: Al\nNext Steps: ${k1} \n${k2} Call back\nEnd`);
      pane.querySelector('[data-step="insert"]').click();
      pane.querySelectorAll('[name="nextSteps"]')[0].value = 'Email';
      expect(generate()).toBe(
        `Name: Al\nNext Steps: ${k1} Click " Email "\n${k2} \n${k3} Call back\nEnd`
      );
    }
  );

  test('an optional dropdown starts blank and drops its line until an option is picked', async () => {
    const dom = await setup([
      {
        title: 'Note',
        fields: [
          { label: 'Name', name: 'name', type: 'text' },
          {
            label: 'Priority',
            name: 'priority',
            type: 'select',
            options: ['Low', 'High'],
            optional: true,
          },
          { label: 'Size', name: 'size', type: 'select', options: ['S', 'L'] },
        ],
        format: { type: 'template', template: 'Name: {name}\nPriority: {priority}\nSize: {size}' },
      },
    ]);
    const pane = dom.window.document.querySelector('.tab-pane[data-index="0"]');
    const generate = () => {
      Array.from(pane.querySelectorAll('button'))
        .find((b) => b.textContent.trim() === 'Generate')
        .click();
      return Array.from(pane.querySelectorAll('textarea')).find((e) => e.readOnly).value;
    };
    const priority = pane.querySelector('[name="priority"]');
    expect(Array.from(priority.options).map((o) => o.value)).toEqual(['', 'Low', 'High']);
    expect(pane.querySelector('[name="size"]').options).toHaveLength(2);
    expect(generate()).toBe('Name: \nSize: S');
    priority.value = 'High';
    expect(generate()).toBe('Name: \nPriority: High\nSize: S');
  });
});
