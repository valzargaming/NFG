/**
 * Inserting a step mid-list: every step row has a "+" beside its "-" that adds
 * a new step directly below it. "+ Add" only ever appended at the end, so a
 * missed step meant retyping everything after it.
 *
 * Numbered mode renumbers on insert AND remove. Keys were set once, from the
 * count at creation, and Generate writes them verbatim — so removing step 2 of
 * 3 put "1. …" "3. …" into the note.
 */
const { setup } = require('./_helpers');

/** The Survey tab (index 2) has a `steps` field. Parse `combined` into it. */
async function survey(combined, mode = 'none') {
  const dom = await setup();
  const win = dom.window;
  const pane = win.document.querySelector('.tab-pane[data-index="2"]');
  const form = pane.querySelector('form.generated-form');
  const modeSelect = Array.from(form.querySelectorAll('select')).find((s) =>
    Array.from(s.options).some((o) => o.value === 'numbered')
  );
  modeSelect.value = mode;
  modeSelect.dispatchEvent(new win.Event('change'));
  const input = form.querySelector('[name="steps_combined"]');
  input.value = combined;
  input.nextElementSibling.click(); // Parse
  return { win, pane, form };
}
const steps = (form) => Array.from(form.querySelectorAll('[name="steps"]')).map((e) => e.value);
const keys = (form) => Array.from(form.querySelectorAll('[name="steps_key"]')).map((e) => e.value);
const rowButton = (form, idx, which) =>
  form.querySelectorAll('.steps-list .step-row')[idx].querySelector(`[data-step="${which}"]`);

describe('inserting a step', () => {
  test('every step has a "+" beside its "-"', async () => {
    const { form } = await survey('A > B > C');
    const rows = Array.from(form.querySelectorAll('.steps-list .step-row'));
    expect(rows).toHaveLength(3);
    rows.forEach((row) => {
      const labels = Array.from(row.querySelectorAll('button')).map((b) => b.textContent);
      expect(labels).toEqual(['-', '+']);
    });
  });

  test('"+" inserts a new step directly below its row, not at the end', async () => {
    const { form } = await survey('A > B > C');
    rowButton(form, 0, 'insert').click();

    expect(steps(form)).toEqual(['A', '', 'B', 'C']);
  });

  test('"+" on the last step adds one at the end', async () => {
    const { form } = await survey('A > B > C');
    rowButton(form, 2, 'insert').click();

    expect(steps(form)).toEqual(['A', 'B', 'C', '']);
  });

  test('focus moves to the new step, ready to type', async () => {
    const { win, form } = await survey('A > B > C');
    rowButton(form, 1, 'insert').click();

    expect(win.document.activeElement).toBe(form.querySelectorAll('[name="steps"]')[2]);
  });

  test('in Numbered mode an insert renumbers the steps after it', async () => {
    const { form } = await survey('A > B > C', 'numbered');
    expect(keys(form)).toEqual(['1.', '2.', '3.']);

    rowButton(form, 0, 'insert').click();

    expect(keys(form)).toEqual(['1.', '2.', '3.', '4.']);
    expect(steps(form)).toEqual(['A', '', 'B', 'C']);
  });

  test('in Numbered mode a remove renumbers too', async () => {
    const { form } = await survey('A > B > C', 'numbered');
    rowButton(form, 1, 'remove').click();

    expect(steps(form)).toEqual(['A', 'C']);
    expect(keys(form)).toEqual(['1.', '2.']); // was "1." "3."
  });

  test('a key the user typed is left alone by the renumbering', async () => {
    const { form } = await survey('A > B > C', 'numbered');
    form.querySelectorAll('[name="steps_key"]')[1].value = 'b)';

    rowButton(form, 0, 'insert').click();

    expect(keys(form)).toEqual(['1.', '2.', 'b)', '4.']);
  });

  test('outside Numbered mode nothing is renumbered', async () => {
    const { form } = await survey('A > B > C', 'bullet');
    rowButton(form, 0, 'insert').click();

    expect(keys(form)).toEqual(['-', '-', '-', '-']);
  });

  test('Generate writes the inserted step in place, numbered correctly', async () => {
    const { pane, form } = await survey('A > B > C', 'numbered');
    rowButton(form, 0, 'insert').click();
    form.querySelectorAll('[name="steps"]')[1].value = 'A2';

    const generate = Array.from(pane.querySelectorAll('button')).find(
      (b) => b.textContent.trim() === 'Generate'
    );
    generate.click();
    const out = Array.from(pane.querySelectorAll('textarea')).find((t) =>
      String(t.value).trim().startsWith('{')
    );

    expect(JSON.parse(out.value).steps).toEqual(['1. A', '2. A2', '3. B', '4. C']);
  });
});

describe('step defaults become rows', () => {
  const PROCEDURE = [
    {
      title: 'Procedure',
      fields: [
        {
          label: 'Steps',
          name: 'steps',
          type: 'steps',
          keyMode: 'numbered',
          default: 'Open the case > Check the ticket > Close it',
        },
      ],
      format: null,
    },
  ];

  test("a steps field's default is split into rows on load", async () => {
    // Parse used to be clicked before it had a click handler: the default sat
    // in the combined box above a single blank row.
    const dom = await setup(PROCEDURE);
    const form = dom.window.document.querySelector('.tab-pane[data-index="0"] form.generated-form');

    expect(steps(form)).toEqual(['Open the case', 'Check the ticket', 'Close it']);
    expect(keys(form)).toEqual(['1.', '2.', '3.']);
  });

  test('Duplicate copies the steps as rows, not just into the combined box', async () => {
    const { win, pane, form } = await survey('A > B > C');
    Array.from(pane.querySelectorAll('button'))
      .find((b) => b.textContent.trim() === 'Duplicate')
      .click();

    const copy = win.document.querySelector('.tab-pane[data-index="3"] form.generated-form');
    expect(steps(copy)).toEqual(['A', 'B', 'C']);
    expect(steps(form)).toEqual(['A', 'B', 'C']); // the original is untouched
  });
});
