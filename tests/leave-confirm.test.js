const { setup } = require('./_helpers');

const pane = (win, idx) => win.document.querySelector(`.tab-pane[data-index='${idx}']`);
const input = (win, idx, name) => pane(win, idx).querySelector(`form [name="${name}"]`);
const button = (root, text) =>
  Array.from(root.querySelectorAll('button')).find((b) => b.textContent.trim() === text);
const tabTitles = (win) =>
  Array.from(win.document.querySelectorAll('.tab:not(.right)'))
    .map((t) => t.textContent)
    .filter((t) => t !== 'Outputs');

/**
 * Fire a cancelable `beforeunload` on the window, as a tab close or navigation would.
 *
 * @param {Window} win JSDOM window.
 * @returns {boolean} True when the page asked the browser to confirm leaving.
 */
const leaving = (win) => {
  const ev = new win.Event('beforeunload', { cancelable: true });
  win.dispatchEvent(ev);
  return ev.defaultPrevented;
};

describe('confirm before losing entered values', () => {
  test('leaving an untouched page does not prompt', async () => {
    const dom = await setup();
    expect(leaving(dom.window)).toBe(false);
  });

  test('leaving after typing into any tab prompts', async () => {
    const dom = await setup();
    input(dom.window, 2, 'email').value = 'a@b.c';
    expect(leaving(dom.window)).toBe(true);
  });

  test('template defaults alone do not count as entries', async () => {
    const dom = await setup([
      {
        title: 'Defaults',
        fields: [
          { label: 'Name', name: 'name', type: 'text', default: 'Preset' },
          { label: 'Steps', name: 'steps', type: 'steps', default: 'One > Two' },
          { label: 'Pick', name: 'pick', type: 'select', options: ['x', 'y'] },
        ],
        format: null,
      },
    ]);
    expect(leaving(dom.window)).toBe(false);
    input(dom.window, 0, 'pick').value = 'y';
    expect(leaving(dom.window)).toBe(true);
  });

  test('clearing the form after the prompt stops the leave prompt', async () => {
    const dom = await setup();
    const win = dom.window;
    win.confirm = jest.fn(() => true);
    input(win, 0, 'firstName').value = 'Ada';
    button(pane(win, 0), 'Clear').click();
    expect(win.confirm).toHaveBeenCalledTimes(1);
    expect(input(win, 0, 'firstName').value).toBe('');
    expect(leaving(win)).toBe(false);
  });

  test('cancelling Clear keeps the entered values', async () => {
    const dom = await setup();
    const win = dom.window;
    win.confirm = jest.fn(() => false);
    input(win, 0, 'firstName').value = 'Ada';
    button(pane(win, 0), 'Clear').click();
    expect(input(win, 0, 'firstName').value).toBe('Ada');
  });

  test('Clear on an empty form does not prompt', async () => {
    const dom = await setup();
    const win = dom.window;
    win.confirm = jest.fn(() => false);
    button(pane(win, 0), 'Clear').click();
    expect(win.confirm).not.toHaveBeenCalled();
  });

  test('cancelling Unload keeps the tab and its values', async () => {
    const dom = await setup();
    const win = dom.window;
    win.confirm = jest.fn(() => false);
    input(win, 0, 'firstName').value = 'Ada';
    button(pane(win, 0), 'Unload').click();
    expect(win.confirm).toHaveBeenCalledTimes(1);
    expect(tabTitles(win)).toEqual(['Profile', 'Contact', 'Survey']);
    expect(input(win, 0, 'firstName').value).toBe('Ada');
  });

  test('Unload of an untouched tab does not prompt', async () => {
    const dom = await setup();
    const win = dom.window;
    win.confirm = jest.fn(() => false);
    button(pane(win, 0), 'Unload').click();
    expect(win.confirm).not.toHaveBeenCalled();
    expect(tabTitles(win)).toEqual(['Contact', 'Survey']);
  });

  test('values carried over by a rebuild still count as entries', async () => {
    const dom = await setup();
    const win = dom.window;
    input(win, 1, 'firstName').value = 'Grace';
    button(pane(win, 0), 'New').click();
    expect(input(win, 1, 'firstName').value).toBe('Grace');
    expect(leaving(win)).toBe(true);
  });
});
