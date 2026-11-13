const { test, expect } = require('@playwright/test');
const { pathToFileURL } = require('url');
const path = require('path');

const app = pathToFileURL(path.resolve(__dirname, '../dist/form-generator.html')).href;
const seed = (controls) => [
  {
    title: 'Procedure',
    fields: [
      { label: 'Case notes', type: 'header' },
      { label: 'Summary', name: 'summary', type: 'text' },
      { label: 'Details', name: 'details', type: 'textarea' },
      {
        label: 'Steps',
        name: 'steps',
        type: 'steps',
        keyMode: 'numbered',
        controls,
        default: 'Settings > Notifications > Save changes',
      },
    ],
    format: null,
  },
  { title: 'Contact', fields: [{ label: 'Name', name: 'name', type: 'text' }], format: null },
];

async function open(page, testInfo, controls) {
  await page.addInitScript(
    ({ config }) => {
      window.formConfig = config;
      localStorage.clear();
      localStorage.setItem('nfg-dev-mode', 'true');
    },
    { config: seed(controls) }
  );
  await page.goto(app);
  await expect(page.locator('.tab-pane[data-index="0"] form')).toBeVisible();
  if (testInfo.project.name === 'desktop-dark') {
    await page.locator('#themeToggle').click();
    await expect(page.locator('html')).toHaveClass(/dark/);
  } else {
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  }
}
const pane = (page, index = 0) => page.locator(`.tab-pane[data-index="${index}"]`);
async function generate(target) {
  await target.getByRole('button', { name: 'Generate', exact: true }).click();
  return JSON.parse(await target.locator('textarea[readonly]').inputValue());
}
async function capture(page, testInfo, name) {
  await testInfo.attach(name, {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
}

test('existing text, textarea, header and numbered steps', async ({ page }, testInfo) => {
  await open(page, testInfo);
  await pane(page).locator('[name="summary"]').fill('Example support procedure');
  await pane(page)
    .locator('[name="details"]')
    .fill('Synthetic sample data only.\nVerify the settings before saving.');
  const result = await generate(pane(page));
  expect(result.summary).toBe('Example support procedure');
  expect(result.steps).toEqual(['1. Settings', '2. Notifications', '3. Save changes']);
  await expect(page.locator('[data-step="click"]')).toHaveCount(0);
  await capture(page, testInfo, 'existing-form-and-output');
});

test('existing insert, remove and duplicate', async ({ page }, testInfo) => {
  await open(page, testInfo);
  await pane(page).locator('[data-step="insert"]').first().click();
  await pane(page).locator('[name="steps"]').nth(1).fill('Review permissions');
  await pane(page).locator('[data-step="remove"]').nth(2).click();
  await pane(page).getByRole('button', { name: 'Duplicate', exact: true }).click();
  expect((await generate(pane(page, 2))).steps).toEqual([
    '1. Settings',
    '2. Review permissions',
    '3. Save changes',
  ]);
  await capture(page, testInfo, 'duplicate-edited-steps');
});

for (const label of ['Forms', 'Outputs']) {
  test(`existing ${label} editor`, async ({ page }, testInfo) => {
    await open(page, testInfo);
    await page
      .locator('.tab')
      .filter({ hasText: new RegExp(`^${label}$`) })
      .click();
    await expect(
      page.locator('.tab-pane:visible').getByRole('button', { name: 'Save', exact: true })
    ).toBeVisible();
    await capture(page, testInfo, `${label.toLowerCase()}-editor`);
  });
}

test('Designer builds a form and output by dragging', async ({ page }, testInfo) => {
  await open(page, testInfo);
  await page
    .locator('.tab')
    .filter({ hasText: /^Designer$/ })
    .click();
  const designer = page.locator('.tab-pane:visible .designer');
  const mobile = testInfo.project.use.isMobile;
  const emailTool = designer.locator('[data-designer-add="email"]');
  if (mobile) await emailTool.click();
  else
    await emailTool.dragTo(designer.locator('.dz-card').first(), {
      targetPosition: { x: 40, y: 4 },
    });
  await expect(designer.locator(`.dz-card .dz-type >> nth=${mobile ? -1 : 0}`)).toHaveText('Email');
  await designer.locator('[data-prop="label"]').fill('Contact email');
  await designer.locator('[data-prop="optional"]').check();
  await designer.locator('[data-designer="mode-template"]').check();
  const chip = designer.locator('[data-designer-insert]').filter({ hasText: 'Contact email' });
  if (mobile) await chip.click();
  else await chip.dragTo(designer.locator('[data-designer="new-line"]'));
  await expect(designer.locator('[data-designer="template"]')).toContainText('{contactEmail}');
  await designer.locator('.dz-field').last().click();
  await designer.locator('[data-prop="piece-before"]').fill('Email: ');
  await designer.getByLabel('Summary', { exact: true }).fill('Example summary');
  await expect(designer.locator('[data-designer="result"]')).not.toHaveValue(/Email:/);
  await designer
    .getByLabel('Contact email (optional)', { exact: true })
    .fill('someone@example.test');
  await expect(designer.locator('[data-designer="result"]')).toHaveValue(
    /Email: someone@example\.test$/
  );
  await capture(page, testInfo, 'designer');
  await designer.locator('[data-designer="open"]').click();
  await expect(page.locator('.tab.active')).toHaveText('Procedure');
  await expect(pane(page).locator('[name="contactEmail"]')).toBeVisible();
});

test('explicit false hides Click control', async ({ page }, testInfo) => {
  await open(page, testInfo, { click: false });
  await expect(page.locator('[data-step="click"]')).toHaveCount(0);
  expect((await generate(pane(page))).steps[0]).toBe('1. Settings');
  await capture(page, testInfo, 'click-disabled');
});

test('opt-in unchecked keeps original output', async ({ page }, testInfo) => {
  await open(page, testInfo, { click: true });
  await expect(page.locator('[data-step="click"]')).toHaveCount(3);
  await expect(page.locator('[data-step="click"]:checked')).toHaveCount(0);
  expect((await generate(pane(page))).steps[0]).toBe('1. Settings');
  await capture(page, testInfo, 'click-enabled-unchecked');
});

test('independent checked Click values use exact spacing', async ({ page }, testInfo) => {
  await open(page, testInfo, { click: true });
  await page.locator('[data-step="click"]').nth(0).check();
  await page.locator('[data-step="click"]').nth(2).check();
  const result = await generate(pane(page));
  expect(result.steps).toEqual([
    '1. Click " Settings "',
    '2. Notifications',
    '3. Click " Save changes "',
  ]);
  expect(result).not.toHaveProperty('steps_click');
  await capture(page, testInfo, 'click-checked-and-generated-output');
});

test('loads and works with no network access', async ({ page, context }, testInfo) => {
  const requests = [];
  const errors = [];
  page.on('request', (request) => requests.push(request.url()));
  page.on('pageerror', (error) => errors.push(error.message));
  await context.setOffline(true);
  await open(page, testInfo);
  for (const label of ['Forms', 'Outputs', 'Designer']) {
    await page
      .locator('.tab')
      .filter({ hasText: new RegExp(`^${label}$`) })
      .click();
  }
  await page.locator('.tab').first().click();
  await pane(page).locator('[name="summary"]').fill('Offline check');
  expect((await generate(pane(page))).summary).toBe('Offline check');
  expect(requests).toEqual([app]);
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.fonts.size)).toBe(0);
});
