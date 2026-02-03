const { setup, openTemplatesPane, createAndSaveTemplate } = require('./_helpers');

describe('export HTML contains seeded forms and mapping', () => {
  test('exported HTML seeds nfg-forms and nfg-form-map so loaded form stays loaded', async () => {
    const dom = await setup();
    const win = dom.window;

    // Create and save a new form (template) via the Forms pane
    const { newId } = await createAndSaveTemplate(dom, 'ExportedLabel');

    // Load the saved template into a form tab so formMap is updated
    let pane = await openTemplatesPane(dom);
    const loadBtn = Array.from(pane.querySelectorAll('button')).find((b) => b.textContent && b.textContent.trim() === 'Load');
    expect(loadBtn).toBeTruthy();
    loadBtn.click();

    // Ensure formMap was persisted in the runtime
    const savedMap = JSON.parse(win.localStorage.getItem('nfg-form-map') || '{}');
    const hasMapping = Object.values(savedMap).some((v) => v === newId);
    expect(hasMapping).toBe(true);

    // Mock Blob to capture exported HTML content and URL.createObjectURL
    win._lastExport = null;
    win.Blob = function (parts) {
      try { win._lastExport = parts.join(''); } catch (e) { win._lastExport = String(parts); }
      return { size: win._lastExport.length };
    };
    win.URL.createObjectURL = () => 'blob://fake';

    // Click the export button
    const exportBtn = win.document.querySelector('button[data-export-button="true"]');
    expect(exportBtn).toBeTruthy();
    exportBtn.click();

    // Ensure we captured exported HTML
    expect(win._lastExport).toBeTruthy();
    const html = win._lastExport;

    // The exported HTML should include seeding of nfg-forms and nfg-form-map
    expect(html).toMatch(/localStorage.setItem\('nfg-forms',/);
    expect(html).toMatch(/localStorage.setItem\('nfg-form-map',/);

    // The exported nfg-forms seed should include the saved template id
    expect(html).toContain(newId);

    // And the exported mapping should include the mapping to that id
    // (form-map JSON appears in the exported HTML)
    const mapMatch = html.match(/localStorage.setItem\('nfg-form-map',\s*([^\)]+)\);/);
    expect(mapMatch).toBeTruthy();
    const mapJson = mapMatch ? mapMatch[1] : null;
    if (mapJson) {
      // evaluate the JSON-text (it may not be strictly JSON in the string, so try to parse)
      const parsed = eval('(' + mapJson + ')'); // safe in test sandbox
      const includes = Object.values(parsed || {}).some((v) => v === newId);
      expect(includes).toBe(true);
    }
  });
});
