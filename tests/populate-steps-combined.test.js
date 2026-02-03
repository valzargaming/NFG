const { setup, pollForSelector } = require('./_helpers');

describe('populate applies combined steps to top input', () => {
  test('Apply from source combined sets target _combined input', async () => {
    // build a config with a source tab (0) and a target tab (1), both have steps
    const provided = [
      { title: 'Source', fields: [{ label: 'Steps', name: 'steps', type: 'steps' }], format: null },
      { title: 'Target', fields: [{ label: 'Steps', name: 'steps', type: 'steps' }], format: null },
    ];
    const dom = await setup(provided);
    const doc = dom.window.document;

    // set source combined value
    const sourcePane = doc.querySelector('.tab-pane[data-index="0"]');
    expect(sourcePane).toBeDefined();
    const sourceForm = sourcePane.querySelector('form.generated-form');
    const sourceCombined = sourceForm.querySelector('[name="steps_combined"]');
    expect(sourceCombined).toBeDefined();
    sourceCombined.value = 'A > B';

    // activate target tab and open Populate
    const targetTab = doc.querySelector('.tab[data-index="1"]');
    expect(targetTab).toBeDefined();
    targetTab.click();
    const targetPane = doc.querySelector('.tab-pane[data-index="1"]');
    const popSubtab = targetPane.querySelectorAll('.subtab')[1];
    popSubtab.click();

    // wait for preview list to render
    const preview = await pollForSelector(dom.window, `.tab-pane[data-index="1"] .preview-list`);

    // select the first candidate (skip keep-current which is value __keep__), candidates are value '0' etc
    const choice = preview.querySelector('input[name="choose-1-steps"][value="0"]');
    expect(choice).toBeDefined();
    choice.checked = true;

    // click Apply Selected
    const applyBtn = Array.from(preview.querySelectorAll('button')).find((b) => b.textContent.trim() === 'Apply Selected');
    expect(applyBtn).toBeDefined();
    applyBtn.click();

    // after applying, the target form's combined input should be set
    const targetForm = targetPane.querySelector('form.generated-form');
    const targetCombined = targetForm.querySelector('[name="steps_combined"]');
    expect(targetCombined).toBeDefined();
    expect(targetCombined.value).toBe('A > B');
  });
});
