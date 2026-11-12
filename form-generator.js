var NFG=(()=>{var r=(e,n)=>()=>(n||e((n={exports:{}}).exports,n),n.exports);var i=r((u,s)=>{s.exports=`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Note Form Generator</title>
    <style>
      :root {
        --bg: #f7f9fc;
        --card: #ffffff;
        --text: #111216;
        --accent: #2b8cff;
        --muted: #666666;
        --border: #e9eef6;
        --panel: #fbfdff;
      }
      .dark {
        --bg: #0b1220;
        --card: #0f1724;
        --text: #e6eef8;
        --accent: #4aa3ff;
        --muted: #94a9c2;
        --border: #253244;
        --panel: #071226;
      }
      body {
        font-family: Segoe UI, Roboto, Helvetica, Arial, sans-serif;
        margin: 0;
        background: var(--bg);
        color: var(--text);
        transition: background 0.18s, color 0.18s;
      }
      .container {
        max-width: 960px;
        margin: 28px auto;
        padding: 18px;
        background: var(--card);
        border-radius: 8px;
        box-shadow: 0 6px 18px rgba(2, 6, 23, 0.06);
      }
      .top {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .top {
        position: sticky;
        top: 0;
        z-index: 3;
        padding-bottom: 8px;
      }
      .top h1 {
        flex: 0 0 auto;
      }
      .top-controls {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 0 0 auto;
        white-space: nowrap;
      }
      h1 {
        font-size: 18px;
        margin: 0;
      }
      .tabs {
        display: flex;
        gap: 6px;
        margin-top: 14px;
        border-bottom: 1px solid var(--border);
        overflow-x: auto;
        white-space: nowrap;
        -webkit-overflow-scrolling: touch;
      }
      .tab {
        padding: 10px 14px;
        cursor: pointer;
        border-radius: 6px 6px 0 0;
        color: var(--muted);
        flex: 0 0 auto;
      }
      .tab.right {
        margin-left: auto;
      }
      .tab.active {
        background: linear-gradient(180deg, #fff, #f4f8ff);
        color: var(--accent);
        box-shadow: 0 -4px 12px rgba(43, 140, 255, 0.06);
        border-bottom: 2px solid #fff;
      }
      .tab[draggable='true'] {
        cursor: grab;
      }
      .tab.dragging {
        opacity: 0.45;
      }
      .tab.drop-before {
        box-shadow: inset 3px 0 0 var(--accent);
      }
      .tab.drop-after {
        box-shadow: inset -3px 0 0 var(--accent);
      }
      .tab-content {
        padding: 18px;
      }
      .field {
        margin-bottom: 12px;
      }
      label {
        display: block;
        margin-bottom: 6px;
        font-weight: 600;
      }
      input[type='text'],
      input[type='number'],
      select,
      textarea {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid var(--border);
        border-radius: 6px;
        background: transparent;
        color: var(--text);
      }
      .subtabs {
        display: flex;
        gap: 6px;
        margin-bottom: 12px;
      }
      .subtab {
        padding: 6px 10px;
        border-radius: 6px;
        background: transparent;
        border: 1px solid var(--border);
        cursor: pointer;
        color: var(--muted);
      }
      .subtab.active {
        background: var(--accent);
        color: #fff;
      }
      .btn {
        display: inline-block;
        padding: 8px 12px;
        border-radius: 6px;
        background: var(--accent);
        color: #fff;
        border: 0;
        cursor: pointer;
      }
      .btn.warn {
        background: #e05252;
        color: #fff;
        border: 0;
      }
      .btn.ghost {
        background: #f2f6ff;
        color: var(--accent);
        border: 1px solid #d7e7ff;
      }
      .btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
      .btn-warn {
        background: #e05252;
        color: #fff;
        border: 0;
      }
      .btn-warn.ghost {
        background: #fff5f5;
        color: #e05252;
        border: 1px solid #ffd6d6;
      }
      .meta {
        color: var(--muted);
        font-size: 13px;
      }
      .preview-list {
        border: 1px solid var(--border);
        padding: 10px;
        border-radius: 6px;
        background: var(--panel);
      }
      .field-header {
        margin: 8px 0;
        font-weight: 700;
        color: var(--text);
      }
      .preview-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 0;
        border-bottom: 1px dashed #f0f4fb;
      }
      .preview-item:last-child {
        border-bottom: none;
      }
      .field-inline {
        display: inline-block;
        vertical-align: top;
        margin-right: 4%;
        box-sizing: border-box;
        max-width: 100%;
      }
      .small {
        font-size: 13px;
        color: #333;
      }
      .switch {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-left: 6px;
      }
      .switch input {
        display: none;
      }
      .switch .knob {
        width: 40px;
        height: 20px;
        background: #d7dbe0;
        border-radius: 20px;
        position: relative;
        transition: background 0.15s;
        box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.03);
      }
      .switch .knob::after {
        content: '';
        position: absolute;
        left: 3px;
        top: 3px;
        width: 14px;
        height: 14px;
        background: #fff;
        border-radius: 50%;
        transition: left 0.15s;
        box-shadow: 0 1px 2px rgba(2, 6, 23, 0.08);
      }
      .switch input:checked + .knob {
        background: var(--accent);
      }
      .switch input:checked + .knob::after {
        left: 23px;
      }
      .switch .label {
        font-size: 13px;
        color: var(--muted);
        user-select: none;
      }
      .footer {
        margin-top: 12px;
        border-top: 1px solid var(--border);
        padding-top: 10px;
        text-align: center;
        font-size: 13px;
        color: var(--muted);
      }
      .footer-inner {
        max-width: 960px;
        margin: 0 auto;
        padding: 0 18px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="top">
        <h1>Note Form Generator</h1>
        <div class="top-controls">
          <button id="themeToggle" class="btn ghost" type="button" aria-label="Toggle dark mode">
            Dark
          </button>
        </div>
      </div>

      <div id="tabbar" class="tabs"></div>
      <div id="contents"></div>
    </div>
    <footer class="footer">
      <div class="footer-inner">
        <div class="meta">Copyright \xA9\uFE0F 2026 Valithor Obsidion &lt;valithor@discordphp.org&gt;</div>
      </div>
    </footer>

    <script>
      const formConfig =
        window.formConfig && Array.isArray(window.formConfig) ? window.formConfig : [];

      const originalFormConfig = JSON.parse(JSON.stringify(formConfig));

      /**
       * Short, stable fingerprint of the tabs this page shipped with. A saved tab list
       * is only restored when its fingerprint matches, so a page whose built-in tabs
       * changed falls back to its own tabs.
       *
       * @type {string}
       */
      const seedPrint = (() => {
        const s = JSON.stringify(originalFormConfig);
        let h = 5381;
        for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
        return (h >>> 0).toString(36) + '.' + s.length.toString(36);
      })();

      /**
       * Build a unique id for a tab created on the fly (New / Duplicate).
       *
       * @param {string} prefix Id prefix, e.g. 'adhoc'.
       * @returns {string} \`<prefix>-<time><random>\`.
       */
      const uid = (prefix) =>
        prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

      const tabbar = document.getElementById('tabbar');
      const contents = document.getElementById('contents');

      const DEBUG = false;

      /**
       * Run \`fn\` and return its result, or \`fallback\` if it throws.
       *
       * @param {Function} fn Callback to run.
       * @param {*} [fallback] Value returned when \`fn\` throws.
       * @param {Function} [onError] Receives the thrown error.
       * @returns {*} The result of \`fn\`, or \`fallback\`.
       */
      const safe = (fn, fallback = undefined, onError) => {
        try {
          return fn();
        } catch (e) {
          try {
            if (onError) onError(e);
            else if (DEBUG && console && console.error) console.error(e);
          } catch (ex) {}
          return fallback;
        }
      };

      /**
       * Parse a JSON string without throwing.
       *
       * @param {?string} s JSON text.
       * @param {*} [fallback=null] Value returned for empty or invalid input.
       * @returns {*} The parsed value, or \`fallback\`.
       */
      const safeParse = (s, fallback = null) => {
        if (s === undefined || s === null) return fallback;
        return safe(() => JSON.parse(s), fallback);
      };

      /**
       * Null-safe \`querySelector\`.
       *
       * @param {?ParentNode} root Search root; defaults to \`document\`.
       * @param {string} sel CSS selector.
       * @returns {?Element} The first match, or null.
       */
      const q = (root, sel) => safe(() => (root || document).querySelector(sel), null);

      /**
       * Null-safe \`querySelectorAll\` returning an array.
       *
       * @param {?ParentNode} root Search root; defaults to \`document\`.
       * @param {string} sel CSS selector.
       * @returns {Element[]} All matches.
       */
      const qAll = (root, sel) =>
        safe(() => Array.from((root || document).querySelectorAll(sel)), []);

      /**
       * Read and JSON-decode a localStorage entry.
       *
       * @param {string} k Storage key.
       * @param {*} [fallback=null] Value returned when missing or unreadable.
       * @returns {*} The stored value, or \`fallback\`.
       */
      const storageGet = (k, fallback = null) =>
        safe(() => safeParse(localStorage.getItem(k), fallback), fallback);

      /**
       * Write a localStorage entry, JSON-encoding non-string values.
       *
       * @param {string} k Storage key.
       * @param {*} v Value to store.
       * @returns {void}
       */
      const storageSet = (k, v) =>
        safe(() => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)));

      /**
       * Wrap an event handler so sync throws and async rejections are swallowed.
       *
       * @param {Function} fn Handler, optionally async.
       * @returns {Function} Event listener.
       */
      const wrapHandler = (fn) => (ev) => {
        try {
          const res = fn(ev);
          if (res && typeof res.then === 'function') {
            res.catch((e) => {
              try {
                if (DEBUG && console && console.error) console.error(e);
              } catch (ex) {}
            });
          }
        } catch (e) {
          try {
            if (DEBUG && console && console.error) console.error(e);
          } catch (ex) {}
        }
      };

      /**
       * JSON-encode a value so it is safe to embed inside a \`<script>\` element.
       *
       * @param {*} obj Value to encode.
       * @returns {string} Escaped JSON, or 'null' on failure.
       */
      const safeJson = (obj) =>
        safe(
          () =>
            JSON.stringify(obj)
              .replace(/</g, '\\\\u003c')
              .replace(/\\u2028/g, '\\\\u2028')
              .replace(/\\u2029/g, '\\\\u2029'),
          'null'
        );

      /**
       * localStorage keys shared by the runtime and the export seed.
       *
       * @type {Object<string, string>}
       */
      const KEYS = {
        forms: 'nfg-forms',
        outputs: 'nfg-outputs',
        formMap: 'nfg-form-map',
        devMode: 'nfg-dev-mode',
        theme: 'nfg-theme',
        tabs: 'nfg-tabs',
        seed: 'nfg-seed',
      };

      /**
       * Index a list of items by their \`id\`.
       *
       * @param {Array<{id: string}>} arr Items to index.
       * @returns {Object<string, Object>} Map of id to item.
       */
      function rebuildMap(arr) {
        return Object.fromEntries((arr || []).map((x) => [x && x.id, x]));
      }

      /**
       * Create an element with properties, styles, listeners and children.
       *
       * Recognised \`props\`: \`style\` and \`dataset\` objects, \`class\`/\`className\`,
       * \`text\`/\`textContent\`, \`html\`/\`innerHTML\`, \`on<event>\` listeners, DOM
       * properties, and any other key as an attribute.
       *
       * @param {string} tag Tag name.
       * @param {?Object} props Properties to apply.
       * @param {...(Node|string|Array)} children Child nodes or text.
       * @returns {HTMLElement} The new element.
       */
      function el(tag, props, ...children) {
        const node = document.createElement(tag);
        if (props) {
          Object.keys(props).forEach((k) => {
            const v = props[k];
            if (v == null) return;
            if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
            else if (k === 'dataset' && typeof v === 'object') Object.assign(node.dataset, v);
            else if (k === 'class' || k === 'className') node.className = v;
            else if (k === 'text' || k === 'textContent') node.textContent = v;
            else if (k === 'html' || k === 'innerHTML') node.innerHTML = v;
            else if (k.slice(0, 2) === 'on' && typeof v === 'function')
              node.addEventListener(k.slice(2).toLowerCase(), v);
            else if (k in node) node[k] = v;
            else node.setAttribute(k, v);
          });
        }
        children.flat().forEach((c) => {
          if (c == null || c === false) return;
          node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
        });
        return node;
      }

      /**
       * Split a "A > B > C" steps string into its non-empty, trimmed parts.
       *
       * @param {?string} str Combined steps string.
       * @returns {string[]} Step values.
       */
      function splitSteps(str) {
        return String(str == null ? '' : str)
          .split('>')
          .map((s) => s.trim())
          .filter(Boolean);
      }

      /**
       * Split a "key => value" step into its key and value.
       *
       * @param {?string} part Step text.
       * @returns {{key: string, val: string}} Key is '' when no "=>" is present.
       */
      function parseStepPart(part) {
        const p = String(part == null ? '' : part);
        if (p.includes('=>')) {
          const [k, ...rest] = p.split('=>');
          return { key: k.trim(), val: rest.join('=>').trim() };
        }
        return { key: '', val: p.trim() };
      }

      /**
       * Remove a leading list marker ("1.", "2)", "-", "*" or a bullet).
       *
       * @param {?string} s List item text.
       * @returns {string} The trimmed item text.
       */
      function stripListPrefix(s) {
        return String(s == null ? '' : s)
          .replace(/^\\s*(?:\\d+[.)]\\s*)?(?:[-*\\u2022]\\s*)?/, '')
          .trim();
      }

      /**
       * Format items as a numbered list preceded by a newline.
       *
       * @param {string[]} items List items; existing markers are replaced.
       * @returns {string} "\\n 1. A\\n 2. B", or '' for an empty list.
       */
      function toNumberedList(items) {
        const cleaned = (items || []).map(stripListPrefix);
        if (cleaned.length === 0) return '';
        return '\\n' + cleaned.map((v, i) => \` \${i + 1}. \${v}\`).join('\\n');
      }

      /**
       * Read every named control of a form into a value map.
       *
       * @param {?HTMLFormElement} form Form to read.
       * @returns {Object<string, (string|string[])>} Values by control name;
       *   repeated names become arrays.
       */
      function formValues(form) {
        const map = {};
        if (!form) return map;
        Array.from(form.elements).forEach((e) => {
          if (!e.name) return;
          const val = e.type === 'checkbox' ? (e.checked ? e.value || 'on' : '') : e.value;
          if (Object.prototype.hasOwnProperty.call(map, e.name)) {
            if (!Array.isArray(map[e.name])) map[e.name] = [map[e.name]];
            map[e.name].push(val);
          } else {
            map[e.name] = val;
          }
        });
        qAll(form, '.steps-container').forEach((container) => {
          const base = container.dataset.name;
          if (!q(container, '.step-row')) map[base] = [];
        });
        return map;
      }

      /**
       * Rebuild a steps field's rows from a restored "<field>_combined" value.
       *
       * @param {HTMLFormElement} form Form containing the field.
       * @param {string} nm Control name.
       * @param {*} pv Restored value.
       * @returns {void}
       */
      function maybeRestoreCombinedSteps(form, nm, pv) {
        if (typeof nm !== 'string' || !nm.endsWith('_combined')) return;
        if (typeof pv !== 'string' || !pv.trim()) return;
        const base = nm.slice(0, -9);
        const first = q(form, \`[name="\${CSS.escape(nm)}"]\`);
        if (!first) return;
        const parseBtn = first.nextElementSibling;
        if (parseBtn && parseBtn.textContent && /Parse/.test(parseBtn.textContent)) {
          parseBtn.click();
          return;
        }
        const container = q(form, \`.steps-container[data-name="\${CSS.escape(base)}"]\`);
        const list = container && q(container, '.steps-list');
        if (!list) return;
        list.innerHTML = '';
        splitSteps(pv).forEach((p) => createStepRow(base, parseStepPart(p), container, list));
      }

      /**
       * Write a value map produced by \`formValues\` back into a form.
       *
       * @param {?HTMLFormElement} form Form to fill.
       * @param {?Object<string, (string|string[])>} prev Values by control name.
       * @returns {void}
       */
      function applyValues(form, prev) {
        if (!form || !prev) return;
        qAll(form, '.steps-container').forEach((container) => {
          const base = container.dataset.name;
          if (!Object.prototype.hasOwnProperty.call(prev, base)) return;
          const vals = Array.isArray(prev[base]) ? prev[base] : [prev[base]];
          const list = q(container, '.steps-list');
          list.innerHTML = '';
          vals.forEach((val) => createStepRow(base, { val }, container, list));
        });
        Object.keys(prev).forEach((nm) => {
          safe(() => {
            const els = qAll(form, \`[name="\${CSS.escape(nm)}"]\`);
            if (!els || els.length === 0) return;
            const pv = prev[nm];
            if (els[0].type === 'radio') {
              els.forEach((r) => (r.checked = r.value == pv));
              return;
            }
            if (els[0].type === 'checkbox') {
              els.forEach((c, index) => {
                if (c.dataset.step === 'click') {
                  c.checked = (Array.isArray(pv) ? pv[index] : pv) === 'on';
                  return;
                }
                c.checked = Array.isArray(pv)
                  ? pv.includes(c.value)
                  : !!pv && String(pv) !== 'false' && String(pv) !== '0';
              });
              return;
            }
            if (Array.isArray(pv)) {
              for (let k = 0; k < els.length && k < pv.length; k++) els[k].value = pv[k];
            } else {
              els[0].value = pv;
              if (
                !nm.endsWith('_combined') ||
                !Object.prototype.hasOwnProperty.call(prev, nm.slice(0, -9))
              )
                safe(() => maybeRestoreCombinedSteps(form, nm, pv));
            }
          });
        });
      }

      /**
       * Offer a string to the user as a file download.
       *
       * @param {string} content File contents.
       * @param {string} [filename='nfg-export.html'] Suggested file name.
       * @param {string} [type='text/html'] MIME type.
       * @returns {void}
       */
      function downloadFile(content, filename = 'nfg-export.html', type = 'text/html') {
        safe(() => {
          const blob = new Blob([content], { type });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 5000);
        });
      }

      /**
       * Create an \`<option>\` element.
       *
       * @param {string} value Option value.
       * @param {string} text Option label.
       * @returns {HTMLOptionElement} The new option.
       */
      function createOption(value, text) {
        return safe(() => {
          const o = document.createElement('option');
          o.value = value;
          o.textContent = text;
          return o;
        });
      }

      /**
       * Repopulate every Outputs selector from the current \`outputs\` list.
       *
       * @returns {void}
       */
      function refreshOutputsSelectors() {
        safe(() => {
          const sels = qAll(document, 'select[data-outputs-selector="true"]');
          sels.forEach((sel) => {
            sel.innerHTML = '';
            outputs.forEach((o) => sel.appendChild(createOption(o.id, o.label || o.id)));
          });
        });
      }

      /**
       * Add a template option to each form pane's Template select, if missing.
       *
       * @param {string} id Template id.
       * @param {string} [label] Option label; defaults to the id.
       * @returns {void}
       */
      function addTemplateOptionToFormPanes(id, label) {
        safe(() => {
          for (let fi = 0; fi < formConfig.length; fi++) {
            const paneEl = q(contents, \`.tab-pane[data-index='\${fi}']\`);
            if (!paneEl) continue;
            const sel = q(paneEl, 'select');
            if (!sel) continue;
            if (!q(sel, \`option[value="\${id}"]\`)) sel.appendChild(createOption(id, label || id));
          }
        });
      }

      /**
       * Remove a template option from each form pane's Template select. A select that
       * had it selected falls back to its first option and fires \`change\`.
       *
       * @param {string} id Template id.
       * @returns {void}
       */
      function removeTemplateOptionFromFormPanes(id) {
        safe(() => {
          try {
            suppressTabActivation = true;
            for (let fi = 0; fi < formConfig.length; fi++) {
              const paneEl = q(contents, \`.tab-pane[data-index='\${fi}']\`);
              if (!paneEl) continue;
              const sel = q(paneEl, 'select');
              if (!sel) continue;
              const opt = q(sel, \`option[value="\${id}"]\`);
              if (!opt) continue;
              const wasSelected = String(sel.value) === String(id);
              safe(() => opt.remove());
              if (wasSelected) {
                safe(() => {
                  if (sel.options.length) {
                    sel.selectedIndex = 0;
                    sel.dispatchEvent(new Event('change'));
                  }
                });
              }
            }
          } finally {
            suppressTabActivation = false;
          }
        });
      }

      const devKey = KEYS.devMode;

      /**
       * Whether dev mode (Templates/Outputs panes, Unload, reordering, Export) is on.
       *
       * @type {boolean}
       */
      let devMode = false;
      const s = storageGet(devKey);
      if (s !== null) devMode = s === 'true' || s === true;

      /**
       * Add the Dev toggle and the dev-only Export HTML button to the header.
       *
       * @returns {void}
       */
      (function addDevToggleBtn() {
        safe(() => {
          const header = q(document, '.top > div');
          if (!header) return;
          const wrapper = document.createElement('label');
          wrapper.className = 'switch';
          wrapper.dataset.devToggle = 'true';
          wrapper.style.marginLeft = '6px';
          wrapper.innerHTML = \`<input id="devToggle" type="checkbox" \${
            devMode ? 'checked' : ''
          }><span class="knob"></span><span class="label">\${devMode ? 'Dev On' : 'Dev Off'}</span>\`;
          const checkbox = q(wrapper, 'input');
          if (checkbox) checkbox.autocomplete = 'off';
          const textLabel = q(wrapper, '.label');
          const exportBtn = document.createElement('button');
          exportBtn.type = 'button';
          exportBtn.className = 'btn ghost';
          exportBtn.textContent = 'Export HTML';
          exportBtn.style.marginLeft = '8px';
          exportBtn.style.display = devMode ? '' : 'none';
          exportBtn.dataset.exportButton = 'true';
          exportBtn.addEventListener(
            'click',
            wrapHandler(async () => {
              try {
                const seed = [];
                const isBuiltIn = (id) => id === '__json__' || /^tpl-\\d+$/.test(String(id));
                const oldToNew = {};
                const exportedTabs = formConfig.map((tab, ei) => {
                  if (tab && tab._formId) oldToNew[tab._formId] = \`tpl-\${ei}\`;
                  const def = tab && tab._formId ? formsMap[tab._formId] : null;
                  let format = deepCopy(tab.format === undefined ? null : tab.format);
                  if (def && Object.prototype.hasOwnProperty.call(def, 'cfg')) {
                    format =
                      typeof def.cfg === 'string'
                        ? { type: 'template', template: def.cfg }
                        : deepCopy(def.cfg);
                  }
                  return { title: tab.title, fields: deepCopy(tab.fields || []), format };
                });
                const tabsLine = 'window.formConfig = ' + safeJson(exportedTabs) + ';';
                safe(() =>
                  seed.push(
                    "localStorage.setItem('nfg-forms', " +
                      safeJson(forms.filter((f) => f && !isBuiltIn(f.id))) +
                      ');'
                  )
                );
                safe(() =>
                  seed.push("localStorage.setItem('nfg-outputs', " + safeJson(outputs) + ');')
                );
                safe(() => {
                  const exportMap = {};
                  formConfig.forEach((tab, ei) => {
                    const sel = tab && tab._templateId;
                    if (!sel) return;
                    if (isBuiltIn(sel)) {
                      if (oldToNew[sel]) exportMap[ei] = oldToNew[sel];
                    } else if (formsMap && formsMap[sel]) {
                      exportMap[ei] = sel;
                    }
                  });
                  seed.push("localStorage.setItem('nfg-form-map', " + safeJson(exportMap) + ');');
                });
                safe(() => seed.push("localStorage.setItem('nfg-dev-mode', 'false');"));
                const exportId =
                  'nfg-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
                const idJson = safeJson(exportId);
                const seedScript =
                  \`<script data-nfg-seed>try{\${tabsLine}}catch(e){}\` +
                  \`try{if(localStorage.getItem('\${KEYS.seed}')!==\${idJson}){\${seed.join('')}\` +
                  \`localStorage.setItem('\${KEYS.seed}',\${idJson});}}catch(e){}<\\/script>\`;
                const docClone = document.documentElement.cloneNode(true);
                safe(() => {
                  const toRemove = qAll(docClone, '[data-dev-toggle], [data-export-button]');
                  toRemove.forEach((n) => n.remove());
                  qAll(docClone, 'body script').forEach((n) => {
                    if (
                      n.hasAttribute('data-nfg-seed') ||
                      /^\\s*try\\{\\s*window\\.formConfig\\s*=/.test(n.textContent || '')
                    )
                      n.remove();
                  });
                });
                let html = '<!doctype html>\\n' + docClone.outerHTML;
                html = html.replace(/<body([^>]*)>/i, (m, attrs) => \`<body\${attrs}>\${seedScript}\`);
                let wantCopy = false;
                safe(() => {
                  if (typeof window.confirm === 'function') {
                    wantCopy = window.confirm(
                      'Copy exported HTML to clipboard? Press OK to copy, Cancel to save to a file.'
                    );
                  }
                });

                if (wantCopy && navigator.clipboard && navigator.clipboard.writeText) {
                  try {
                    await navigator.clipboard.writeText(html);
                    alert('Exported HTML copied to clipboard');
                  } catch (e) {
                    downloadFile(html);
                  }
                } else {
                  downloadFile(html);
                }
              } catch (err) {
                alert('Export failed: ' + (err && err.message));
              }
            })
          );

          /**
           * Persist the dev mode state, update the header controls and rebuild the tabs
           * while keeping typed values.
           *
           * @returns {void}
           */
          function apply() {
            storageSet(devKey, devMode ? 'true' : 'false');
            if (checkbox) checkbox.checked = devMode;
            if (textLabel) textLabel.textContent = 'Dev';
            if (exportBtn) exportBtn.style.display = devMode ? '' : 'none';
            const allPrev = captureAllFormValues();
            safe(() => build());
            safe(() => restoreAllFormValues(allPrev));
          }
          checkbox.addEventListener(
            'change',
            wrapHandler(() => {
              devMode = !!checkbox.checked;
              apply();
            })
          );
          const themeBtnEl = q(header, '#themeToggle');
          if (themeBtnEl) header.insertBefore(exportBtn, themeBtnEl);
          else header.appendChild(exportBtn);
          header.appendChild(wrapper);
          apply();
        });
      })();

      /**
       * Deep-copy a JSON-compatible value.
       *
       * @param {*} v Value to copy.
       * @returns {*} The copy, or undefined.
       */
      const deepCopy = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));

      const defaultTemplates = [{ id: '__json__', label: '__json__', cfg: null }];
      formConfig.forEach((t, idx) => {
        const id = \`tpl-\${idx}\`;
        const label = t.format && t.format.label ? t.format.label : \`\${t.title}\`;
        const cfg = t.format ? deepCopy(t.format) : null;
        defaultTemplates.push({ id, label, cfg, fields: deepCopy(t.fields || []) });
        t._templateId = id;
        t._formId = id;
      });

      let forms;
      const parsedForms = storageGet(KEYS.forms, null);
      if (Array.isArray(parsedForms)) {
        const map = Object.fromEntries(deepCopy(defaultTemplates).map((t) => [t.id, t]));
        for (const s of parsedForms) {
          if (s && s.id) map[s.id] = s;
        }
        forms = Object.values(map);
      }
      if (!forms) forms = deepCopy(defaultTemplates);

      let formsMap = rebuildMap(forms);

      safe(() => {
        const saved = storageGet(KEYS.tabs, null);
        if (!saved || saved.seed !== seedPrint || !Array.isArray(saved.tabs)) return;
        const restored = saved.tabs
          .filter(
            (t) =>
              t &&
              Array.isArray(t.fields) &&
              typeof t._formId === 'string' &&
              (formsMap[t._formId] || t._formId.startsWith('adhoc-'))
          )
          .map((t) => {
            const tab = deepCopy(t);
            if (!tab._templateId || !formsMap[tab._templateId]) {
              tab._templateId = formsMap[tab._formId] ? tab._formId : '__json__';
            }
            return tab;
          });
        formConfig.splice(0, formConfig.length, ...restored);
      });

      if (Array.isArray(parsedForms)) {
        const saved = rebuildMap(parsedForms);
        formConfig.forEach((t) => {
          const def = t && t._formId ? saved[t._formId] : null;
          if (def && Array.isArray(def.fields)) t.fields = deepCopy(def.fields);
        });
      }
      const outputsKey = KEYS.outputs;
      let outputs;
      const parsedOut = storageGet(outputsKey, null);
      if (Array.isArray(parsedOut)) outputs = parsedOut;
      if (!outputs) {
        outputs = [];
        for (let i = 0; i < formConfig.length; i++) {
          const f = formConfig[i];
          outputs.push({
            id: \`out-\${i}\`,
            label: f.title || \`Output \${i}\`,
            cfg: f.format ? JSON.parse(JSON.stringify(f.format)) : null,
            fields: f.fields ? JSON.parse(JSON.stringify(f.fields)) : [],
          });
        }
      }
      let outputsMap = rebuildMap(outputs);
      const formMapKey = KEYS.formMap;
      let formMap = {};
      const parsedMap = storageGet(formMapKey, null);
      if (parsedMap && typeof parsedMap === 'object') {
        formMap = parsedMap;
        Object.keys(parsedMap).forEach((k) => {
          const idx = Number(k);
          const id = parsedMap[k];
          if (!Number.isNaN(idx) && formConfig[idx] && formsMap[id]) {
            formConfig[idx]._templateId = id;
          }
        });
      }

      /**
       * Save each tab's Template selection and the tab list to localStorage.
       *
       * @returns {void}
       */
      function persistFormMap() {
        const map = {};
        for (let i = 0; i < formConfig.length; i++) {
          if (formConfig[i] && formConfig[i]._templateId && formsMap[formConfig[i]._templateId]) {
            map[i] = formConfig[i]._templateId;
          }
        }
        formMap = map;
        storageSet(formMapKey, map);
        storageSet(KEYS.tabs, {
          seed: seedPrint,
          tabs: formConfig.map((t) => ({
            title: t.title,
            fields: t.fields,
            format: t.format === undefined ? null : t.format,
            _formId: t._formId,
            _templateId: t._templateId,
          })),
        });
      }

      /**
       * Capture the values of every tab's form, keyed by tab position.
       *
       * @returns {Object<string, Object>} Value maps by pane index.
       */
      function captureAllFormValues() {
        const allPrev = {};
        safe(() => {
          qAll(contents, '.tab-pane').forEach((pane) => {
            const form = q(pane, 'form.generated-form');
            if (form) allPrev[pane.dataset.index] = formValues(form);
          });
        });
        return allPrev;
      }

      /**
       * Restore values captured by \`captureAllFormValues\` into the current panes.
       *
       * @param {Object<string, Object>} allPrev Value maps by pane index.
       * @returns {void}
       */
      function restoreAllFormValues(allPrev) {
        safe(() => {
          Object.keys(allPrev || {}).forEach((nameIdx) => {
            const pane = q(contents, \`.tab-pane[data-index='\${nameIdx}']\`);
            if (!pane) return;
            applyValues(q(pane, 'form.generated-form'), allPrev[nameIdx] || {});
          });
        });
      }

      /**
       * Capture every tab's form values keyed by the tab's \`_formId\`, so they survive
       * tabs being removed, inserted or reordered.
       *
       * @returns {Object<string, Object>} Value maps by form id.
       */
      function captureValuesByForm() {
        const byIdx = captureAllFormValues();
        const out = {};
        Object.keys(byIdx).forEach((k) => {
          const t = formConfig[Number(k)];
          if (t && t._formId) out[t._formId] = byIdx[k];
        });
        return out;
      }

      /**
       * Restore values captured by \`captureValuesByForm\` into the matching tabs.
       *
       * @param {Object<string, Object>} byForm Value maps by form id.
       * @returns {void}
       */
      function restoreValuesByForm(byForm) {
        const byIdx = {};
        formConfig.forEach((t, i) => {
          if (t && t._formId && byForm && byForm[t._formId]) byIdx[i] = byForm[t._formId];
        });
        restoreAllFormValues(byIdx);
      }

      /**
       * Move a tab to a new position, keeping its values and saving the new order.
       *
       * @param {number} from Current index.
       * @param {number} to Target index.
       * @param {string} [refocus] \`data-move\` value of the button to focus afterwards.
       * @returns {void}
       */
      function moveTab(from, to, refocus) {
        if (
          from === to ||
          from < 0 ||
          to < 0 ||
          from >= formConfig.length ||
          to >= formConfig.length
        )
          return;
        const allPrev = captureValuesByForm();
        const [tab] = formConfig.splice(from, 1);
        formConfig.splice(to, 0, tab);
        safe(() => persistFormMap());
        safe(() => build());
        safe(() => restoreValuesByForm(allPrev));
        safe(() => activateTab(to));
        if (refocus) {
          safe(() => {
            const btn = q(contents, \`.tab-pane[data-index='\${to}'] [data-move='\${refocus}']\`);
            if (btn && !btn.disabled) btn.focus();
          });
        }
      }
      let dragFrom = null;
      let dynamicIdCounter = 0;
      let suppressTabActivation = false;

      /**
       * Grow or shrink a textarea to fit its content, at least one line tall.
       *
       * @param {?HTMLTextAreaElement} ta Textarea to resize.
       * @returns {void}
       */
      function autosizeTextarea(ta) {
        if (!ta) return;
        safe(() => {
          ta.style.height = 'auto';
          ta.style.overflow = 'hidden';
          var newH = ta.scrollHeight;
          safe(() => {
            var cs = window.getComputedStyle(ta);
            var lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) || 16;
            var padTop = parseFloat(cs.paddingTop) || 0;
            var padBottom = parseFloat(cs.paddingBottom) || 0;
            var minH = Math.ceil(lh + padTop + padBottom);
            if (!newH || newH < minH) newH = minH;
          });
          ta.style.height = newH + 'px';
        });
      }

      /**
       * Select and scroll to the character a JSON parse error points at.
       *
       * @param {?HTMLTextAreaElement} ta Textarea holding the JSON.
       * @param {?Error} err Error thrown by \`JSON.parse\`.
       * @returns {void}
       */
      function highlightJsonError(ta, err) {
        if (!ta || !err) return;
        safe(() => {
          const msg = String(err && err.message ? err.message : '');
          const m =
            msg.match(/at position\\s*(\\d+)/i) ||
            msg.match(/position\\s*(\\d+)/i) ||
            msg.match(/column\\s*(\\d+)/i);
          if (!m) return;
          const pos = Number(m[1]);
          if (Number.isNaN(pos)) return;
          safe(() => {
            ta.focus();
            if (typeof ta.setSelectionRange === 'function') {
              const idx = Math.max(0, Math.min(pos, (ta.value || '').length - 1));
              ta.setSelectionRange(idx, idx + 1);
            }
            safe(() => {
              const cs = window.getComputedStyle(ta);
              const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) || 16;
              const before = (ta.value || '').slice(0, pos);
              const lineNo = (before.match(/\\n/g) || []).length;
              ta.scrollTop = Math.max(0, lineNo * lh - lh * 2);
            });
          });
        });
      }

      /**
       * Renumber auto-numbered ("N.") step keys in Numbered mode. Keys the user typed
       * are left alone.
       *
       * @param {string} baseName Steps field name.
       * @param {?HTMLElement} container The field's \`.steps-container\`.
       * @param {?HTMLElement} list The field's \`.steps-list\`.
       * @returns {void}
       */
      function renumberSteps(baseName, container, list) {
        if (!container || !list || container.dataset.keyMode !== 'numbered') return;
        qAll(list, \`[name="\${baseName}_key"]\`).forEach((k, idx) => {
          if (/^\\d+\\.$/.test(String(k.value).trim())) k.value = idx + 1 + '.';
        });
      }

      /**
       * Create a step row (key, value, remove, insert and optional Click controls).
       *
       * @param {string} baseName Steps field name.
       * @param {(string|{key: string, val: string})} keyVal Initial value or key/value pair.
       * @param {HTMLElement} container The field's \`.steps-container\`.
       * @param {?HTMLElement} list List to insert the row into.
       * @param {?Node} [before] Insert ahead of this node instead of at the end.
       * @returns {HTMLInputElement} The row's value input.
       */
      function createStepRow(baseName, keyVal, container, list, before) {
        const kv = { key: '', val: '' };
        if (keyVal && typeof keyVal === 'object') {
          kv.key = keyVal.key || '';
          kv.val = keyVal.val || '';
        } else if (typeof keyVal === 'string') {
          kv.val = keyVal;
        }

        let defaultKey = kv.key || '';
        if (!defaultKey && container && container.dataset) {
          if (container.dataset.keyMode === 'numbered') {
            const existing = qAll(list, \`[name="\${baseName}"]\`);
            defaultKey = String(existing.length + 1) + '.';
          } else if (container.dataset.keyMode === 'bullet') {
            defaultKey = '-';
          }
        }

        const keyInp = el('input', {
          type: 'text',
          name: baseName + '_key',
          placeholder: 'key',
          autocomplete: 'off',
          value: defaultKey,
          style: { width: '80px' },
        });
        const inp = el('input', {
          type: 'text',
          name: baseName,
          id: baseName + '-' + ++dynamicIdCounter,
          placeholder: 'Step',
          autocomplete: 'off',
          value: kv.val || '',
        });
        const row = el(
          'div',
          { className: 'step-row', style: { display: 'flex', gap: '8px', marginTop: '6px' } },
          keyInp,
          inp,
          el('button', {
            type: 'button',
            className: 'btn ghost',
            textContent: '-',
            title: 'Remove this step',
            'aria-label': 'Remove this step',
            dataset: { step: 'remove' },
            onclick: wrapHandler(() => {
              row.remove();
              renumberSteps(baseName, container, list);
            }),
          }),
          el('button', {
            type: 'button',
            className: 'btn ghost',
            textContent: '+',
            title: 'Insert a step below this one',
            'aria-label': 'Insert a step below this one',
            dataset: { step: 'insert' },
            onclick: wrapHandler(() => {
              const added = createStepRow(baseName, '', container, list, row.nextSibling);
              renumberSteps(baseName, container, list);
              safe(() => added.focus());
            }),
          })
        );
        if (container.dataset.clickEnabled === 'true') {
          const click = el('input', {
            type: 'checkbox',
            name: baseName + '_click',
            value: 'on',
            dataset: { step: 'click' },
            style: { width: 'auto', margin: '0' },
          });
          const label = el(
            'label',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                margin: '0',
                whiteSpace: 'nowrap',
              },
            },
            click,
            document.createTextNode('Click')
          );
          row.insertBefore(label, inp.nextSibling);
        }
        if (list) list.insertBefore(row, before || null);
        return inp;
      }

      /**
       * Render the tab bar and every pane (forms, plus Outputs and Templates in dev
       * mode) from \`formConfig\`, then activate the first tab.
       *
       * @returns {void}
       */
      function build() {
        tabbar.innerHTML = '';
        contents.innerHTML = '';
        const clearDropMarks = () =>
          qAll(tabbar, '.tab').forEach((t) =>
            t.classList.remove('dragging', 'drop-before', 'drop-after')
          );
        formConfig.forEach((tab, i) => {
          const tabEl = el('div', {
            className: 'tab',
            textContent: tab.title,
            dataset: { index: i },
            onclick: wrapHandler(() => activateTab(i)),
          });
          if (devMode) {
            tabEl.draggable = true;
            tabEl.title = 'Drag to reorder';
            const afterHalf = (ev) => {
              const r = tabEl.getBoundingClientRect();
              return ev.clientX > r.left + r.width / 2;
            };
            tabEl.addEventListener(
              'dragstart',
              wrapHandler((ev) => {
                dragFrom = i;
                if (ev.dataTransfer) {
                  ev.dataTransfer.effectAllowed = 'move';
                  safe(() => ev.dataTransfer.setData('text/plain', String(i)));
                }
                tabEl.classList.add('dragging');
              })
            );
            tabEl.addEventListener(
              'dragover',
              wrapHandler((ev) => {
                if (dragFrom === null) return;
                ev.preventDefault();
                if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'move';
                const after = afterHalf(ev);
                tabEl.classList.toggle('drop-after', after);
                tabEl.classList.toggle('drop-before', !after);
              })
            );
            tabEl.addEventListener(
              'dragleave',
              wrapHandler(() => tabEl.classList.remove('drop-before', 'drop-after'))
            );
            tabEl.addEventListener(
              'drop',
              wrapHandler((ev) => {
                if (dragFrom === null) return;
                ev.preventDefault();
                const from = dragFrom;
                dragFrom = null;
                clearDropMarks();
                let to = afterHalf(ev) ? i + 1 : i;
                if (from < to) to -= 1;
                moveTab(from, to);
              })
            );
            tabEl.addEventListener(
              'dragend',
              wrapHandler(() => {
                dragFrom = null;
                clearDropMarks();
              })
            );
          }
          tabbar.appendChild(tabEl);

          const stForm = el('div', { className: 'subtab active', textContent: 'Form' });
          const stPop = el('div', { className: 'subtab', textContent: 'Populate' });
          const pane = el(
            'div',
            { className: 'tab-pane', dataset: { index: i }, style: { display: 'none' } },
            el('div', { className: 'subtabs' }, stForm, stPop)
          );

          const formArea = el('div', { className: 'tab-content form-area' });
          const populateArea = el('div', {
            className: 'tab-content populate-area',
            style: { display: 'none' },
          });

          const form = el('form', { className: 'generated-form', autocomplete: 'off' });
          tab.fields.forEach((f) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'field';
            if (f && f.inline) {
              wrapper.className += ' field-inline';
              safe(() => {
                wrapper.style.width = f.width ? String(f.width) : '45%';
              });
            }
            const label = document.createElement('label');
            if (f.type !== 'header') {
              label.textContent = f.label || f.name;
              if (f.optional === true) {
                const hint = document.createElement('span');
                hint.className = 'meta';
                hint.textContent = ' (optional)';
                label.appendChild(hint);
              }
              wrapper.appendChild(label);
            }

            if (f.type === 'header') {
              try {
                let tag = 'h2';
                if (f && f.level && !Number.isNaN(Number(f.level))) {
                  const lv = Math.max(1, Math.min(6, Number(f.level)));
                  tag = 'h' + lv;
                } else if (f && f.size && /^h[1-6]$/.test(String(f.size))) {
                  tag = String(f.size);
                }
                const h = document.createElement(tag);
                h.className = 'field-header';
                h.textContent = f.label || f.name || '';
                wrapper.appendChild(h);
                form.appendChild(wrapper);
                return;
              } catch (e) {}
            }
            let input;
            if (f.type === 'textarea') {
              input = document.createElement('textarea');
              input.rows = 4;
              input.autocomplete = 'off';
            } else if (f.type === 'select') {
              input = document.createElement('select');
              (f.options || []).forEach((opt) => {
                const o = document.createElement('option');
                o.value = opt.value ?? opt;
                o.textContent = opt.label ?? opt;
                input.appendChild(o);
              });
              input.autocomplete = 'off';
            } else {
              input = document.createElement('input');
              input.type = f.type || 'text';
              input.autocomplete = 'off';
            }
            input.name = f.name;
            input.placeholder = f.placeholder || '';
            if (f.default) input.value = f.default;
            wrapper.appendChild(input);
            if (f.type === 'steps') {
              input.name = f.name + '_combined';
              input.placeholder =
                f.placeholder && String(f.placeholder).trim()
                  ? String(f.placeholder)
                  : 'Step 1 > Step 2 > Step 3';
              input.style.width = '70%';
              input.style.display = 'inline-block';

              const parseBtnTop = document.createElement('button');
              parseBtnTop.type = 'button';
              parseBtnTop.className = 'btn ghost';
              parseBtnTop.textContent = 'Parse';
              parseBtnTop.style.marginLeft = '8px';
              const combinedRow = document.createElement('div');
              combinedRow.style.display = 'flex';
              combinedRow.style.alignItems = 'center';
              combinedRow.style.gap = '8px';
              combinedRow.appendChild(input);
              combinedRow.appendChild(parseBtnTop);
              if (f.default && typeof f.default === 'string' && f.default.trim()) {
                input.value = f.default;
              }
              wrapper.appendChild(combinedRow);
              const controlRow = document.createElement('div');
              controlRow.style.display = 'flex';
              controlRow.style.alignItems = 'center';
              controlRow.style.gap = '8px';
              controlRow.style.marginTop = '8px';
              const modeLabel = document.createElement('div');
              modeLabel.className = 'meta';
              modeLabel.textContent = 'Default key:';
              const modeSelect = document.createElement('select');
              const oNone = document.createElement('option');
              oNone.value = 'none';
              oNone.textContent = 'None (blank)';
              const oNum = document.createElement('option');
              oNum.value = 'numbered';
              oNum.textContent = 'Numbered';
              const oBullet = document.createElement('option');
              oBullet.value = 'bullet';
              oBullet.textContent = 'Bullet (-)';
              modeSelect.appendChild(oNone);
              modeSelect.appendChild(oNum);
              modeSelect.appendChild(oBullet);
              try {
                modeSelect.value = f && f.keyMode ? String(f.keyMode) : 'none';
              } catch (e) {
                modeSelect.value = 'none';
              }
              modeSelect.autocomplete = 'off';
              modeSelect.addEventListener(
                'change',
                wrapHandler(() => {
                  container.dataset.keyMode = modeSelect.value;
                })
              );
              controlRow.appendChild(modeLabel);
              controlRow.appendChild(modeSelect);
              wrapper.appendChild(controlRow);
              const container = document.createElement('div');
              container.className = 'steps-container';
              container.dataset.name = f.name;
              container.dataset.clickEnabled = String(f.controls && f.controls.click === true);
              container.dataset.keyMode = modeSelect.value;

              const list = document.createElement('div');
              list.className = 'steps-list';

              const addBtn = document.createElement('button');
              addBtn.type = 'button';
              addBtn.className = 'btn';
              addBtn.textContent = '+ Add';
              addBtn.style.marginLeft = '8px';

              /**
               * Append a step row to this field.
               *
               * @param {(string|{key: string, val: string})} val Initial value or key/value pair.
               * @returns {HTMLInputElement} The row's value input.
               */
              function addPathItem(val) {
                const keyVal = { key: '', val: '' };
                if (val && typeof val === 'object') {
                  keyVal.key = val.key || '';
                  keyVal.val = val.val || '';
                } else if (typeof val === 'string') {
                  keyVal.val = val;
                }
                return createStepRow(f.name, keyVal, container, list);
              }

              addPathItem('');

              addBtn.addEventListener(
                'click',
                wrapHandler(() => addPathItem(''))
              );
              parseBtnTop.addEventListener(
                'click',
                wrapHandler(() => {
                  const parts = splitSteps(input.value);
                  list.innerHTML = '';
                  if (parts.length === 0) {
                    addPathItem('');
                  } else {
                    parts.forEach((p) => {
                      const kv = parseStepPart(p);
                      if (kv.key && /^\\d+$/.test(kv.key)) kv.key += '.';
                      addPathItem(kv.key ? kv : kv.val);
                    });
                  }
                })
              );
              wrapper.appendChild(container);
              container.appendChild(list);
              container.appendChild(addBtn);
              if (f.default && typeof f.default === 'string' && f.default.trim()) {
                parseBtnTop.click();
              }
              form.appendChild(wrapper);
            } else {
              form.appendChild(wrapper);
            }
          });

          const newBtn = document.createElement('button');
          newBtn.className = 'btn';
          newBtn.type = 'button';
          newBtn.textContent = 'New';
          newBtn.style.marginLeft = '8px';
          newBtn.addEventListener(
            'click',
            wrapHandler(() => {
              const allPrev = captureAllFormValues();
              safe(() => {
                const newForm = {
                  title: (tab && tab.title ? tab.title : 'New') + ' (new)',
                  fields: JSON.parse(JSON.stringify(tab.fields || [])).map((f) => {
                    const nf = JSON.parse(JSON.stringify(f));
                    if (nf.hasOwnProperty('default')) delete nf.default;
                    return nf;
                  }),
                  _templateId:
                    formConfig[i] && formConfig[i]._templateId
                      ? formConfig[i]._templateId
                      : undefined,
                  _formId: uid('adhoc'),
                };
                formConfig.push(newForm);
                safe(() => persistFormMap());
                safe(() => build());
                safe(() => restoreAllFormValues(allPrev));
                safe(() => activateTab(formConfig.length - 1));
              });
            })
          );

          const dupBtn = document.createElement('button');
          dupBtn.className = 'btn';
          dupBtn.type = 'button';
          dupBtn.textContent = 'Duplicate';
          dupBtn.style.marginLeft = '8px';
          dupBtn.addEventListener(
            'click',
            wrapHandler(() => {
              const allPrev = captureAllFormValues();
              safe(() => {
                const vals = formValues(form);

                const newFields = (tab.fields || []).map((f) => {
                  const nf = JSON.parse(JSON.stringify(f));
                  if (f.type === 'steps') {
                    if (
                      Object.prototype.hasOwnProperty.call(vals, f.name + '_combined') &&
                      vals[f.name + '_combined']
                    ) {
                      nf.default = vals[f.name + '_combined'];
                    } else if (Object.prototype.hasOwnProperty.call(vals, f.name)) {
                      const v = vals[f.name];
                      nf.default = Array.isArray(v) ? v.join(' > ') : v;
                    } else {
                      if (nf.hasOwnProperty('default')) delete nf.default;
                    }
                  } else {
                    if (Object.prototype.hasOwnProperty.call(vals, f.name))
                      nf.default = vals[f.name];
                    else if (nf.hasOwnProperty('default')) delete nf.default;
                  }
                  return nf;
                });

                const newForm = {
                  title: (tab && tab.title ? tab.title : 'Copy') + ' (copy)',
                  format: tab && tab.format ? JSON.parse(JSON.stringify(tab.format)) : null,
                  fields: newFields,
                  _templateId:
                    formConfig[i] && formConfig[i]._templateId
                      ? formConfig[i]._templateId
                      : undefined,
                  _formId: uid('adhoc'),
                };
                formConfig.push(newForm);
                safe(() => persistFormMap());
                safe(() => build());
                allPrev[formConfig.length - 1] = vals;
                safe(() => restoreAllFormValues(allPrev));
                safe(() => activateTab(formConfig.length - 1));
              });
            })
          );

          const topClear = document.createElement('button');
          topClear.className = 'btn warn';
          topClear.type = 'button';
          topClear.textContent = 'Clear';
          topClear.style.marginLeft = '8px';
          topClear.addEventListener(
            'click',
            wrapHandler(() => {
              Array.from(form.elements).forEach((e) => {
                if (!e.name) return;
                if (e.type === 'checkbox' || e.type === 'radio') e.checked = false;
                else e.value = '';
              });
            })
          );

          formArea.appendChild(newBtn);
          formArea.appendChild(dupBtn);
          formArea.appendChild(topClear);

          safe(() => {
            const last = formArea.lastElementChild;
            if (last && last.style) last.style.marginBottom = '8px';
          });

          formArea.appendChild(form);

          const tplRow = document.createElement('div');
          tplRow.style.display = 'flex';
          tplRow.style.alignItems = 'center';
          tplRow.style.gap = '8px';
          tplRow.style.marginTop = '6px';
          const tplLabel = document.createElement('div');
          tplLabel.className = 'meta';
          tplLabel.textContent = 'Template:';
          const tplSelect = document.createElement('select');
          tplSelect.autocomplete = 'off';
          tplSelect.style.padding = '6px';
          tplSelect.style.borderRadius = '6px';
          tplSelect.style.border = '1px solid var(--border)';
          forms.forEach((tpl) => {
            const o = document.createElement('option');
            o.value = tpl.id;
            o.textContent = tpl.label;

            tplSelect.appendChild(o);
          });
          if (formConfig[i] && formConfig[i]._templateId)
            tplSelect.value = formConfig[i]._templateId;
          tplSelect.addEventListener(
            'change',
            wrapHandler(() => {
              const sel = tplSelect.value || '__json__';
              const tpl = formsMap[sel];
              if (!tpl) return;
              safe(() => {
                if (Object.prototype.hasOwnProperty.call(tpl, 'cfg')) {
                  formConfig[i].format = tpl.cfg ? JSON.parse(JSON.stringify(tpl.cfg)) : null;
                }
                formConfig[i]._templateId = sel;
                persistFormMap();
              });
            })
          );
          tplRow.appendChild(tplLabel);
          tplRow.appendChild(tplSelect);
          if (devMode) {
            const unloadBtn = document.createElement('button');
            unloadBtn.type = 'button';
            unloadBtn.className = 'btn warn';
            unloadBtn.textContent = 'Unload';
            unloadBtn.style.marginLeft = '8px';
            unloadBtn.title =
              'Remove this tab. Its form definition stays in the Forms pane, so Load brings it back.';
            unloadBtn.addEventListener(
              'click',
              wrapHandler(() => {
                const allPrev = captureValuesByForm();
                formConfig.splice(i, 1);
                safe(() => persistFormMap());
                safe(() => build());
                safe(() => restoreValuesByForm(allPrev));
                safe(() => activateTab(Math.max(0, i - 1)));
              })
            );
            const moveLeft = el('button', {
              type: 'button',
              className: 'btn ghost',
              text: '\u2190 Left',
              'aria-label': 'Move this tab one place to the left',
              title: 'Move this tab one place to the left',
              dataset: { move: 'left' },
              disabled: i === 0,
              style: { marginLeft: '8px', whiteSpace: 'nowrap', flexShrink: '0' },
              onclick: wrapHandler(() => moveTab(i, i - 1, 'left')),
            });
            const moveRight = el('button', {
              type: 'button',
              className: 'btn ghost',
              text: 'Right \u2192',
              'aria-label': 'Move this tab one place to the right',
              title: 'Move this tab one place to the right',
              dataset: { move: 'right' },
              disabled: i === formConfig.length - 1,
              style: { marginLeft: '4px', whiteSpace: 'nowrap', flexShrink: '0' },
              onclick: wrapHandler(() => moveTab(i, i + 1, 'right')),
            });
            tplRow.appendChild(moveLeft);
            tplRow.appendChild(moveRight);
            tplRow.appendChild(unloadBtn);
          }
          formArea.appendChild(tplRow);

          const genWrapper = document.createElement('div');
          genWrapper.style.marginTop = '12px';
          const genBtn = document.createElement('button');
          genBtn.className = 'btn';
          genBtn.type = 'button';
          genBtn.textContent = 'Generate';
          const copyBtn = document.createElement('button');
          copyBtn.className = 'btn ghost';
          copyBtn.type = 'button';
          copyBtn.textContent = 'Copy';
          copyBtn.style.marginLeft = '8px';
          const clearOutBtn = document.createElement('button');
          clearOutBtn.className = 'btn ghost';
          clearOutBtn.type = 'button';
          clearOutBtn.textContent = 'Clear';
          clearOutBtn.style.marginLeft = '8px';
          const out = document.createElement('textarea');
          out.readOnly = true;
          out.rows = 10;
          out.autocomplete = 'off';
          out.style.width = '100%';
          out.style.marginTop = '8px';
          out.style.padding = '8px';
          out.style.borderRadius = '6px';
          out.style.border = '1px solid #eee';
          genWrapper.appendChild(genBtn);
          genWrapper.appendChild(copyBtn);
          genWrapper.appendChild(clearOutBtn);
          genWrapper.appendChild(out);
          formArea.appendChild(genWrapper);

          genBtn.addEventListener(
            'click',
            wrapHandler(() => {
              const values = {};
              Array.from(form.elements).forEach((e) => {
                if (!e.name || e.dataset.step === 'click') return;
                const click =
                  e.closest('.step-row') && q(e.closest('.step-row'), '[data-step="click"]');
                const raw = e.value !== undefined ? e.value : '';
                const v =
                  click && click.checked && e.name === e.closest('.steps-container').dataset.name
                    ? 'Click " ' + raw + ' "'
                    : raw;
                if (Object.prototype.hasOwnProperty.call(values, e.name)) {
                  if (!Array.isArray(values[e.name])) values[e.name] = [values[e.name]];
                  values[e.name].push(v);
                } else {
                  values[e.name] = v;
                }
              });
              Object.keys(values).forEach((k) => {
                if (!k.endsWith('_key')) return;
                const base = k.slice(0, -4);
                if (!Object.prototype.hasOwnProperty.call(values, base)) return;
                const keys = Array.isArray(values[k]) ? values[k] : [values[k]];
                const vals = Array.isArray(values[base]) ? values[base] : [values[base]];
                const combined = vals.map((v, i) => {
                  const keyRaw = keys[i] || '';
                  let prefix = '';
                  prefix = keyRaw ? keyRaw + ' ' : '';
                  return prefix + v;
                });
                values[base] = combined.length === 1 ? combined[0] : combined;
                delete values[k];
              });
              const sel = tplSelect.value || '__json__';
              const cfg = formsMap[sel] && formsMap[sel].cfg ? formsMap[sel].cfg : null;
              const optional = ((formConfig[i] && formConfig[i].fields) || [])
                .filter((f) => f && f.optional === true && f.name)
                .map((f) => f.name);
              out.value = generateOutput(cfg, values, optional);
              safe(() => {
                out.style.height = 'auto';
                out.style.overflow = 'hidden';
                out.style.height = out.scrollHeight + 'px';
              });
            })
          );
          copyBtn.addEventListener(
            'click',
            wrapHandler(async () => {
              const text = out.value || '';
              try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  await navigator.clipboard.writeText(text);
                } else {
                  out.select();
                  document.execCommand('copy');
                }
                alert('Copied:\\n' + text);
              } catch (err) {
                try {
                  out.select();
                  document.execCommand('copy');
                  alert('Copied:\\n' + text);
                } catch (e) {
                  alert('Copy failed');
                }
              }
            })
          );
          clearOutBtn.addEventListener(
            'click',
            wrapHandler(() => {
              out.value = '';
              safe(() => autosizeTextarea(out));
            })
          );

          const info = document.createElement('div');
          info.className = 'meta';
          info.textContent = 'Scan other tabs for values with matching field names.';
          const scanBtn = document.createElement('button');
          scanBtn.className = 'btn ghost';
          scanBtn.type = 'button';
          scanBtn.textContent = 'Scan';
          const autoBtn = document.createElement('button');
          autoBtn.className = 'btn';
          autoBtn.type = 'button';
          autoBtn.style.marginLeft = '8px';
          autoBtn.textContent = 'Auto Apply All';
          const preview = document.createElement('div');
          preview.className = 'preview-list';
          preview.style.marginTop = '12px';

          populateArea.appendChild(info);
          populateArea.appendChild(scanBtn);
          populateArea.appendChild(autoBtn);
          populateArea.appendChild(preview);

          pane.appendChild(formArea);
          pane.appendChild(populateArea);
          contents.appendChild(pane);

          stForm.addEventListener(
            'click',
            wrapHandler(() => {
              stForm.classList.add('active');
              stPop.classList.remove('active');
              formArea.style.display = 'block';
              populateArea.style.display = 'none';
            })
          );
          stPop.addEventListener(
            'click',
            wrapHandler(() => {
              stPop.classList.add('active');
              stForm.classList.remove('active');
              formArea.style.display = 'none';
              populateArea.style.display = 'block';
              scanPopulate(i, preview);
            })
          );

          scanBtn.addEventListener(
            'click',
            wrapHandler(() => scanPopulate(i, preview))
          );
          autoBtn.addEventListener(
            'click',
            wrapHandler(() => {
              const items = scanPopulate(i, preview);
              const selections = [];
              items.forEach((it) => {
                if (it.candidates && it.candidates.length > 0) {
                  const c = it.candidates[0];
                  selections.push({ name: it.name, value: c.value });
                }
              });
              applyPreviewSelections(i, selections);
            })
          );
        });

        /**
         * Add the dev-mode Outputs pane for editing output formats and fields.
         *
         * @returns {void}
         */
        (function addOutputsTab() {
          if (!devMode) return;
          const outIndex = formConfig.length;
          const outTab = document.createElement('div');
          outTab.className = 'tab right';
          outTab.textContent = 'Outputs';
          outTab.dataset.index = outIndex;
          outTab.addEventListener(
            'click',
            wrapHandler(() => activateTab(outIndex))
          );
          tabbar.appendChild(outTab);

          const outPane = document.createElement('div');
          outPane.className = 'tab-pane';
          outPane.style.display = 'none';
          outPane.dataset.index = outIndex;

          const outContent = document.createElement('div');
          outContent.className = 'tab-content';
          const outLabel = document.createElement('label');
          outLabel.textContent = 'Outputs';
          outContent.appendChild(outLabel);

          const helpOut = document.createElement('div');
          helpOut.className = 'meta';
          helpOut.style.marginTop = '8px';
          helpOut.textContent =
            'Create and edit Outputs (format + fields). Outputs can be used as the basis for Forms.';
          outContent.appendChild(helpOut);

          const selectorRow = document.createElement('div');
          selectorRow.style.display = 'flex';
          selectorRow.style.alignItems = 'center';
          selectorRow.style.gap = '8px';
          selectorRow.style.marginTop = '8px';
          const outList = document.createElement('select');
          outList.autocomplete = 'off';
          outList.style.flex = '1';
          const outNewBtn = document.createElement('button');
          outNewBtn.type = 'button';
          outNewBtn.className = 'btn';
          outNewBtn.textContent = '+ New';
          selectorRow.appendChild(outList);
          selectorRow.appendChild(outNewBtn);
          outContent.appendChild(selectorRow);

          const lblRow = document.createElement('div');
          lblRow.style.marginTop = '8px';
          const lblLbl = document.createElement('label');
          lblLbl.textContent = 'Label';
          const lblIn = document.createElement('input');
          lblIn.type = 'text';
          lblIn.style.width = '100%';
          lblIn.autocomplete = 'off';
          lblRow.appendChild(lblLbl);
          lblRow.appendChild(lblIn);
          outContent.appendChild(lblRow);

          const cfgLbl = document.createElement('label');
          cfgLbl.textContent = 'Template';
          cfgLbl.style.marginTop = '8px';
          const advRowOut = document.createElement('div');
          advRowOut.style.display = 'flex';
          advRowOut.style.alignItems = 'center';
          advRowOut.style.gap = '8px';
          advRowOut.style.marginTop = '6px';
          const advChkOut = document.createElement('input');
          advChkOut.type = 'checkbox';
          advChkOut.autocomplete = 'off';
          const advLblOut = document.createElement('div');
          advLblOut.className = 'meta';
          advLblOut.textContent = 'Advanced (raw JSON)';
          advRowOut.appendChild(advChkOut);
          advRowOut.appendChild(advLblOut);
          const cfgSimpleOut = document.createElement('textarea');
          cfgSimpleOut.rows = 2;
          cfgSimpleOut.style.width = '100%';
          cfgSimpleOut.placeholder = 'Hello {firstName}';
          cfgSimpleOut.autocomplete = 'off';
          const resolveBtn = document.createElement('button');
          resolveBtn.type = 'button';
          resolveBtn.className = 'btn ghost';
          resolveBtn.textContent = 'Resolve to JSON';
          resolveBtn.style.marginTop = '6px';
          const cfgTaOut = document.createElement('textarea');
          cfgTaOut.rows = 6;
          cfgTaOut.style.width = '100%';
          cfgTaOut.placeholder = '{ "type": "template", "template": "Hello {firstName}" }';
          cfgTaOut.autocomplete = 'off';
          outContent.appendChild(cfgLbl);
          outContent.appendChild(advRowOut);
          outContent.appendChild(cfgSimpleOut);
          outContent.appendChild(resolveBtn);
          outContent.appendChild(cfgTaOut);
          cfgTaOut.style.display = 'none';
          resolveBtn.style.display = 'none';
          advChkOut.addEventListener(
            'change',
            wrapHandler(() => {
              if (advChkOut.checked) {
                cfgTaOut.style.display = '';
                resolveBtn.style.display = '';
              } else {
                cfgTaOut.style.display = 'none';
                resolveBtn.style.display = 'none';
              }
            })
          );
          resolveBtn.addEventListener(
            'click',
            wrapHandler(() => {
              const raw = String(cfgSimpleOut.value || '').trim();
              if (!raw) {
                cfgTaOut.value = '';
                autosizeTextarea(cfgTaOut);
                return;
              }
              if (raw[0] === '{' || raw[0] === '[') {
                try {
                  const parsed = JSON.parse(raw);
                  cfgTaOut.value = JSON.stringify(parsed, null, 2);
                  autosizeTextarea(cfgTaOut);
                } catch (e) {
                  cfgTaOut.value = JSON.stringify({ type: 'template', template: raw }, null, 2);
                  autosizeTextarea(cfgTaOut);
                }
              } else {
                cfgTaOut.value = JSON.stringify({ type: 'template', template: raw }, null, 2);
                autosizeTextarea(cfgTaOut);
              }
            })
          );

          const fieldsLblOut = document.createElement('label');
          fieldsLblOut.textContent = 'Fields (JSON array)';
          fieldsLblOut.style.marginTop = '8px';
          const fieldsTaOut = document.createElement('textarea');
          fieldsTaOut.rows = 8;
          fieldsTaOut.style.width = '100%';
          fieldsTaOut.placeholder = '[ { "label": "Name", "name": "firstName", "type": "text" } ]';
          fieldsTaOut.autocomplete = 'off';
          outContent.appendChild(fieldsLblOut);
          outContent.appendChild(fieldsTaOut);

          const saveOutBtn = document.createElement('button');
          saveOutBtn.className = 'btn';
          saveOutBtn.type = 'button';
          saveOutBtn.textContent = 'Save';
          const genOutBtn = document.createElement('button');
          genOutBtn.className = 'btn ghost';
          genOutBtn.type = 'button';
          genOutBtn.textContent = 'Generate Fields From Output';
          genOutBtn.style.marginLeft = '8px';
          const delOutBtn = document.createElement('button');
          delOutBtn.className = 'btn warn';
          delOutBtn.type = 'button';
          delOutBtn.textContent = 'Delete';
          delOutBtn.style.marginLeft = '8px';
          const createFormBtn = document.createElement('button');
          createFormBtn.className = 'btn ghost';
          createFormBtn.type = 'button';
          createFormBtn.textContent = 'Create Form from Output';
          createFormBtn.style.marginLeft = '8px';
          outContent.appendChild(saveOutBtn);
          outContent.appendChild(genOutBtn);
          outContent.appendChild(delOutBtn);
          outContent.appendChild(createFormBtn);

          /**
           * Repopulate the Outputs pane's output list.
           *
           * @returns {void}
           */
          function refreshOutList() {
            outList.innerHTML = '';
            outputs.forEach((o) => outList.appendChild(createOption(o.id, o.label || o.id)));
          }
          refreshOutList();

          /**
           * Load the selected output into the Outputs pane editors.
           *
           * @returns {void}
           */
          function loadOut() {
            const id = outList.value;
            const o = outputs.find((x) => x.id === id);
            if (!o) {
              lblIn.value = '';
              safe(() => {
                cfgSimpleOut.value = '';
                autosizeTextarea(cfgSimpleOut);
              });
              cfgTaOut.value = '';
              autosizeTextarea(cfgTaOut);
              advChkOut.checked = false;
              cfgTaOut.style.display = 'none';
              resolveBtn.style.display = 'none';
              fieldsTaOut.value = '';
              autosizeTextarea(fieldsTaOut);
              return;
            }
            lblIn.value = o.label || '';
            try {
              if (
                o.cfg &&
                typeof o.cfg === 'object' &&
                o.cfg.type === 'template' &&
                typeof o.cfg.template === 'string'
              ) {
                cfgSimpleOut.value = o.cfg.template;
                autosizeTextarea(cfgSimpleOut);
                cfgTaOut.value = JSON.stringify(o.cfg, null, 2);
                autosizeTextarea(cfgTaOut);
                advChkOut.checked = false;
                cfgTaOut.style.display = 'none';
                resolveBtn.style.display = 'none';
              } else {
                cfgSimpleOut.value = '';
                autosizeTextarea(cfgSimpleOut);
                cfgTaOut.value = o.cfg ? JSON.stringify(o.cfg, null, 2) : '';
                autosizeTextarea(cfgTaOut);
                advChkOut.checked = true;
                cfgTaOut.style.display = '';
                resolveBtn.style.display = '';
              }
            } catch (e) {
              cfgTaOut.value = '';
              autosizeTextarea(cfgTaOut);
            }
            try {
              fieldsTaOut.value = o.fields ? JSON.stringify(o.fields, null, 2) : '';
              autosizeTextarea(fieldsTaOut);
            } catch (e) {
              fieldsTaOut.value = '';
              autosizeTextarea(fieldsTaOut);
            }
          }
          outList.addEventListener('change', loadOut);
          loadOut();

          outNewBtn.addEventListener(
            'click',
            wrapHandler(() => {
              const id = \`out-\${Date.now()}\`;
              const no = { id, label: id, cfg: null, fields: [] };
              outputs.push(no);
              outputsMap = rebuildMap(outputs);
              storageSet(outputsKey, outputs);

              refreshOutList();
              outList.value = id;
              loadOut();
              refreshOutputsSelectors();
            })
          );

          saveOutBtn.addEventListener(
            'click',
            wrapHandler(() => {
              const id = outList.value;
              const o = outputs.find((x) => x.id === id);
              if (!o) return;
              o.label = lblIn.value || o.label || o.id;
              try {
                const jsonRaw = String(cfgTaOut.value || '').trim();
                const simpleRaw = String(cfgSimpleOut.value || '').trim();
                if (jsonRaw) {
                  try {
                    o.cfg = JSON.parse(jsonRaw);
                  } catch (e) {
                    if (jsonRaw[0] === '{' || jsonRaw[0] === '[') throw e;
                    o.cfg = { type: 'template', template: jsonRaw };
                  }
                } else if (simpleRaw) {
                  o.cfg = { type: 'template', template: simpleRaw };
                } else {
                  o.cfg = null;
                }
              } catch (e) {
                safe(() => highlightJsonError(cfgTaOut, e));
                alert('Invalid output JSON: ' + e.message);
                return;
              }
              try {
                const parsedF = fieldsTaOut.value.trim() ? JSON.parse(fieldsTaOut.value) : [];
                if (!Array.isArray(parsedF)) throw new Error('Fields must be an array');
                o.fields = parsedF;
              } catch (e) {
                safe(() => highlightJsonError(fieldsTaOut, e));
                alert('Invalid fields JSON: ' + e.message);
                return;
              }
              outputsMap = rebuildMap(outputs);
              storageSet(outputsKey, outputs);
              refreshOutList();
              loadOut();
              refreshOutputsSelectors();
            })
          );

          genOutBtn.addEventListener(
            'click',
            wrapHandler(() => {
              try {
                let parsed = null;
                const jsonRaw = String(cfgTaOut.value || '').trim();
                const simpleRaw = String(cfgSimpleOut.value || '').trim();
                if (jsonRaw) {
                  try {
                    parsed = JSON.parse(jsonRaw);
                  } catch (e) {
                    parsed = { type: 'template', template: jsonRaw };
                  }
                } else if (simpleRaw) {
                  parsed = { type: 'template', template: simpleRaw };
                }
                const gen = [];
                if (parsed && typeof parsed.template === 'string') {
                  const tpl = parsed.template;
                  const re = /\\{([a-zA-Z0-9_]+)\\}/g;
                  const seen = new Set();
                  let m;
                  while ((m = re.exec(tpl)) !== null) {
                    const name = m[1];
                    if (seen.has(name)) continue;
                    seen.add(name);
                    const label =
                      name === 'steps' ? 'Steps' : name.charAt(0).toUpperCase() + name.slice(1);
                    const type = name === 'steps' ? 'steps' : 'text';
                    const fld = { label, name, type, placeholder: '' };
                    if (type === 'steps') fld.keyMode = '';
                    gen.push(fld);
                  }
                }
                fieldsTaOut.value = JSON.stringify(gen, null, 2);
                autosizeTextarea(fieldsTaOut);
              } catch (e) {
                safe(() => highlightJsonError(cfgTaOut, e));
                alert('Invalid output JSON: ' + e.message);
              }
            })
          );

          delOutBtn.addEventListener(
            'click',
            wrapHandler(() => {
              let _proceed = true;
              safe(
                () => {
                  if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) {
                    _proceed = true;
                  } else if (typeof window.confirm === 'function') {
                    _proceed = !!window.confirm(
                      'Delete this output? This action cannot be undone.'
                    );
                  }
                },
                undefined,
                () => {
                  _proceed = true;
                }
              );
              if (!_proceed) return;
              const id = outList.value;
              outputs = outputs.filter((x) => x.id !== id);
              outputsMap = rebuildMap(outputs);
              storageSet(outputsKey, outputs);
              refreshOutList();
              loadOut();
              refreshOutputsSelectors();
            })
          );

          safe(() => {
            if (createFormBtn) createFormBtn.style.display = 'none';
          });

          outPane.appendChild(outContent);
          contents.appendChild(outPane);
        })();

        /**
         * Add the dev-mode Forms pane for editing, loading and exporting form templates.
         *
         * @returns {void}
         */
        (function addTemplatesTab() {
          if (!devMode) return;
          const tplIndex = formConfig.length + 1;
          const tplTab = document.createElement('div');
          tplTab.className = 'tab right';
          tplTab.textContent = 'Forms';
          tplTab.dataset.index = tplIndex;
          tplTab.dataset.templates = 'true';
          tplTab.addEventListener(
            'click',
            wrapHandler(() => activateTab(tplIndex))
          );
          tabbar.appendChild(tplTab);

          const tplPane = document.createElement('div');
          tplPane.className = 'tab-pane';
          tplPane.style.display = 'none';
          tplPane.dataset.index = tplIndex;
          tplPane.dataset.templates = 'true';

          const paneContent = document.createElement('div');
          paneContent.className = 'tab-content';
          const label = document.createElement('label');
          label.textContent = 'Forms';
          paneContent.appendChild(label);

          const help = document.createElement('div');
          help.className = 'meta';
          help.style.marginTop = '8px';
          help.innerHTML = \`
            <strong>How to edit forms:</strong>
            <ul style="margin:6px 0 0 18px;padding:0;">
              <li>Select an existing form-definition or click <em>+ New</em> to create one.</li>
              <li><em>Label</em>: a friendly name shown in selects.</li>
              <li>
                <em>Template</em>: a JSON object that controls output formatting. Common forms:
                <ul>
                  <li><strong>type: "template"</strong> \u2014 use placeholders like <code>{firstName}</code>. When a field exposes a combined input (see <em>Fields</em> below), you can reference the combined value as <code>{fieldName_combined}</code> or the explicit per-field value as <code>{fieldName}</code>.</li>
                  <li><strong>Optional sections</strong> \u2014 wrap text in <code>[[</code> and <code>]]</code> to keep it only when every placeholder inside is filled. <code>{title}[[ - {subtitle}]]</code> outputs <code>Report - Q3</code>, or just <code>Report</code> when <code>subtitle</code> is blank, with no dangling <code> - </code>. Sections can nest and work in every template type.</li>
                  <li><strong>type: "sprintf"</strong> \u2014 use Python-style tokens like <code>%(firstName)s</code>.</li>
                  <li><strong>Blank/JSON fallback</strong> \u2014 leave the template blank to output raw JSON.</li>
                </ul>
              </li>
              <li>
                <em>Fields</em>: a JSON array of field definitions. Example:
                <code>[ { "label": "Name", "name": "firstName", "type": "text" } ]</code>.
                For step-like fields use <code>"type":"steps"</code>. A steps field provides:
                <ul>
                  <li>a top combined input named <code>FIELD_combined</code> (e.g. <code>tasks_combined</code>) where users enter values like <code>Step 1 &gt; Step 2</code>;</li>
                  <li>and per-step inputs named <code>FIELD</code> (plus optional <code>FIELD_key</code>) created when parsing the combined string.</li>
                </ul>
                The generator prefers the combined input when present (use <code>{FIELD_combined}</code> in templates), but form-definitions can also handle arrays or combined strings \u2014 the runtime will format arrays as numbered lists when appropriate.
                <p>To include headings inside the form, add a field with <code>"type":"header"</code>. Use <code>label</code> for the heading text and optionally <code>level</code> (1-6) or <code>size</code> (<code>h1</code>.. <code>h6</code>) to control the heading element.</p>
                <p>To layout fields side-by-side, set a field's <code>inline</code> property to <code>true</code> and optionally provide <code>width</code> (e.g. <code>"45%"</code> or <code>"200px"</code>); default width is <code>45%</code>.</p>
                <p>Set <code>"optional": true</code> on a field to leave it out of the output entirely when it is blank: every template line holding its placeholder is removed, label included, so <code>Additional Comments: {comments}</code> disappears instead of printing an empty label. The form shows <em>(optional)</em> beside its label. Use <code>[[ ]]</code> instead when only part of a line should go.</p>
                <p>Fields support an optional <code>placeholder</code> property. When generating fields from a template, placeholders default to an empty string.</p>
                <p><strong>Steps fields:</strong> step-like fields (<code>"type":"steps"</code>) now support a <code>keyMode</code> property to control the default per-step key style. Supported values:
                <code>"none"</code> (no key), <code>"numbered"</code> (1., 2., ...), or <code>"bullet"</code> (-). Example field definition:
                <pre style="background:#f4f7fb;padding:8px;border-radius:6px;margin:6px 0;">{ "label": "Tasks", "name": "tasks", "type": "steps", "keyMode": "numbered" }</pre>
                When a form defines <code>keyMode</code> the steps UI will initialize the Default key selector accordingly so parsed or added step rows inherit that style.</p>
                <p>Opt in to an inline Click checkbox on each step with <code>"controls": { "click": true }</code>. Missing or false hides it. Checked rows output <code>Click " value "</code> after their key; unchecked rows stay unchanged. Each row starts unchecked.</p>
              </li>
              <li>Click <em>Save</em> to apply \u2014 left-side form tabs update immediately and form definitions are persisted to localStorage (only form definitions are saved; user-entered form values are never persisted).</li>
            </ul>\`;
          paneContent.appendChild(help);
          const exportHelp = document.createElement('div');
          exportHelp.className = 'meta';
          exportHelp.style.marginTop = '8px';
          exportHelp.textContent =
            'To export the current forms and outputs, use the Export HTML button in the header \u2014 you can save to a file or copy the exported HTML to your clipboard.';
          paneContent.appendChild(exportHelp);

          const tplSelectorRow = document.createElement('div');
          tplSelectorRow.style.display = 'flex';
          tplSelectorRow.style.alignItems = 'center';
          tplSelectorRow.style.gap = '8px';
          tplSelectorRow.style.marginTop = '8px';
          const tplSelect = document.createElement('select');
          tplSelect.autocomplete = 'off';
          tplSelect.style.flex = '1';
          const addBtn = document.createElement('button');
          addBtn.type = 'button';
          addBtn.className = 'btn';
          addBtn.textContent = '+ New';
          tplSelectorRow.appendChild(tplSelect);
          tplSelectorRow.appendChild(addBtn);
          paneContent.appendChild(tplSelectorRow);

          const outSelectorRow = document.createElement('div');
          outSelectorRow.style.display = 'flex';
          outSelectorRow.style.alignItems = 'center';
          outSelectorRow.style.gap = '8px';
          outSelectorRow.style.marginTop = '8px';
          const outSelect = document.createElement('select');
          outSelect.autocomplete = 'off';
          outSelect.style.flex = '1';
          outSelect.dataset.outputsSelector = 'true';

          /**
           * Repopulate the Forms pane's Output selector.
           *
           * @returns {void}
           */
          function refreshOutSelect() {
            outSelect.innerHTML = '';
            outputs.forEach((o) => outSelect.appendChild(createOption(o.id, o.label || o.id)));
          }
          refreshOutSelect();

          /**
           * Fill the Template and Fields editors from the selected output.
           *
           * @returns {void}
           */
          function loadSelectedOutput() {
            const id = outSelect.value;
            const o = outputsMap[id] || outputs.find((x) => x.id === id) || null;
            if (!o) {
              safe(() => {
                if (cfgTa) cfgTa.value = '';
              });
              safe(() => {
                if (fieldsTa) fieldsTa.value = '';
              });
              return;
            }
            try {
              if (
                o.cfg &&
                typeof o.cfg === 'object' &&
                o.cfg.type === 'template' &&
                typeof o.cfg.template === 'string'
              ) {
                try {
                  if (typeof cfgSimple !== 'undefined' && typeof advChk !== 'undefined') {
                    cfgSimple.value = o.cfg.template;
                    cfgTa.value = JSON.stringify(o.cfg, null, 2);
                    autosizeTextarea(cfgSimple);
                    autosizeTextarea(cfgTa);
                    advChk.checked = false;
                    cfgTa.style.display = 'none';
                    cfgSimple.style.display = '';
                  } else {
                    cfgTa.value = o.cfg.template;
                  }
                } catch (e) {
                  cfgTa.value = o.cfg.template;
                }
              } else {
                try {
                  if (typeof cfgSimple !== 'undefined' && typeof advChk !== 'undefined') {
                    cfgTa.value = o.cfg ? JSON.stringify(o.cfg, null, 2) : '';
                    cfgSimple.value = '';
                    autosizeTextarea(cfgSimple);
                    autosizeTextarea(cfgTa);
                    advChk.checked = true;
                    cfgTa.style.display = '';
                    cfgSimple.style.display = 'none';
                  } else {
                    cfgTa.value = o.cfg ? JSON.stringify(o.cfg, null, 2) : '';
                    autosizeTextarea(cfgTa);
                  }
                } catch (e) {
                  cfgTa.value = o.cfg ? JSON.stringify(o.cfg, null, 2) : '';
                  autosizeTextarea(cfgTa);
                }
              }
            } catch (e) {
              cfgTa.value = '';
              autosizeTextarea(cfgTa);
            }
            try {
              fieldsTa.value = o.fields ? JSON.stringify(o.fields, null, 2) : '';
              autosizeTextarea(fieldsTa);
            } catch (e) {
              fieldsTa.value = '';
              autosizeTextarea(fieldsTa);
            }
          }
          outSelect.addEventListener('change', wrapHandler(loadSelectedOutput));
          safe(() => loadSelectedOutput());
          const outLabel = document.createElement('div');
          outLabel.className = 'meta';
          outLabel.textContent = 'Output:';
          outSelectorRow.appendChild(outLabel);
          outSelectorRow.appendChild(outSelect);
          paneContent.appendChild(outSelectorRow);

          const labelRow = document.createElement('div');
          labelRow.style.marginTop = '8px';
          const lblLabel = document.createElement('label');
          lblLabel.textContent = 'Label';
          const lblInput = document.createElement('input');
          lblInput.type = 'text';
          lblInput.style.width = '100%';
          lblInput.autocomplete = 'off';
          labelRow.appendChild(lblLabel);
          labelRow.appendChild(lblInput);
          paneContent.appendChild(labelRow);

          const cfgLabel = document.createElement('label');
          cfgLabel.textContent = 'Template (JSON)';
          cfgLabel.style.marginTop = '8px';
          const cfgTa = document.createElement('textarea');
          cfgTa.rows = 6;
          cfgTa.style.width = '100%';
          cfgTa.placeholder = '{ "type": "template", "template": "Hello {firstName}" }';
          cfgTa.autocomplete = 'off';
          const cfgSimple = document.createElement('textarea');
          cfgSimple.rows = 2;
          cfgSimple.style.width = '100%';
          cfgSimple.placeholder = 'Hello {firstName}';
          cfgSimple.autocomplete = 'off';
          const advRow = document.createElement('div');
          advRow.style.display = 'flex';
          advRow.style.alignItems = 'center';
          advRow.style.gap = '8px';
          advRow.style.marginTop = '6px';
          const advChk = document.createElement('input');
          advChk.type = 'checkbox';
          advChk.autocomplete = 'off';
          const advLbl = document.createElement('div');
          advLbl.className = 'meta';
          advLbl.textContent = 'Advanced (raw JSON)';
          advRow.appendChild(advChk);
          advRow.appendChild(advLbl);
          paneContent.appendChild(cfgLabel);
          paneContent.appendChild(advRow);
          paneContent.appendChild(cfgTa);
          cfgTa.style.display = 'none';
          advChk.addEventListener(
            'change',
            wrapHandler(() => {
              if (advChk.checked) {
                cfgTa.style.display = '';
                cfgSimple.style.display = 'none';
              } else {
                cfgTa.style.display = 'none';
                cfgSimple.style.display = '';
              }
            })
          );

          const fieldsLabel = document.createElement('label');
          fieldsLabel.textContent = 'Fields (JSON array)';
          fieldsLabel.style.marginTop = '8px';
          const fieldsTa = document.createElement('textarea');
          fieldsTa.rows = 8;
          fieldsTa.style.width = '100%';
          fieldsTa.placeholder = '[ { "label": "Name", "name": "firstName", "type": "text" } ]';
          fieldsTa.autocomplete = 'off';
          paneContent.appendChild(fieldsLabel);
          paneContent.appendChild(fieldsTa);
          paneContent.appendChild(cfgSimple);

          const saveBtn = document.createElement('button');
          saveBtn.className = 'btn';
          saveBtn.type = 'button';
          saveBtn.textContent = 'Save';
          const loadBtn = document.createElement('button');
          loadBtn.className = 'btn';
          loadBtn.type = 'button';
          loadBtn.textContent = 'Load';
          loadBtn.style.marginLeft = '8px';
          const delBtn = document.createElement('button');
          delBtn.className = 'btn warn';
          delBtn.type = 'button';
          delBtn.textContent = 'Delete';
          delBtn.style.marginLeft = '8px';
          const resetBtn = document.createElement('button');
          resetBtn.className = 'btn warn';
          resetBtn.type = 'button';
          resetBtn.textContent = 'Reset to defaults';
          resetBtn.style.marginLeft = '8px';
          paneContent.appendChild(saveBtn);
          paneContent.appendChild(loadBtn);
          paneContent.appendChild(delBtn);
          paneContent.appendChild(resetBtn);

          /**
           * Repopulate the Forms pane's form selector.
           *
           * @returns {void}
           */
          function refreshTplSelect() {
            tplSelect.innerHTML = '';
            forms.forEach((t) => tplSelect.appendChild(createOption(t.id, t.label || t.id)));
          }
          refreshTplSelect();
          safe(() => {
            if (forms && forms.length) tplSelect.value = forms[forms.length - 1].id;
          });

          /**
           * Load the selected form into the Forms pane editors.
           *
           * @returns {void}
           */
          function loadSelected() {
            const id = tplSelect.value;
            const t = forms.find((x) => x.id === id);
            if (!t) {
              lblInput.value = '';
              cfgTa.value = '';
              fieldsTa.value = '';
              return;
            }
            lblInput.value = t.label || '';
            try {
              const json = t.cfg ? JSON.stringify(t.cfg, null, 2) : '';
              if (typeof cfgSimple !== 'undefined' && typeof advChk !== 'undefined') {
                if (
                  t.cfg &&
                  typeof t.cfg === 'object' &&
                  t.cfg.type === 'template' &&
                  typeof t.cfg.template === 'string'
                ) {
                  cfgSimple.value = t.cfg.template;
                  cfgTa.value = json;
                  advChk.checked = false;
                  cfgTa.style.display = 'none';
                  cfgSimple.style.display = '';
                } else {
                  cfgTa.value = json;
                  cfgSimple.value = '';
                  advChk.checked = true;
                  cfgTa.style.display = '';
                  cfgSimple.style.display = 'none';
                }
              } else {
                cfgTa.value = json;
              }
            } catch (e) {
              cfgTa.value = '';
            }
            try {
              fieldsTa.value = t.fields ? JSON.stringify(t.fields, null, 2) : '';
            } catch (e) {
              fieldsTa.value = '';
            }
          }
          tplSelect.addEventListener('change', wrapHandler(loadSelected));
          loadSelected();

          addBtn.addEventListener(
            'click',
            wrapHandler(() => {
              const outId = outSelect && outSelect.value ? outSelect.value : null;
              if (!outId) {
                alert('Please select an existing Output first.');
                return;
              }
              const baseOut = outputsMap[outId] || null;
              if (lblInput && (!lblInput.value || String(lblInput.value).trim() === '')) {
                let displayLabel = null;
                if (
                  outSelect &&
                  typeof outSelect.selectedIndex === 'number' &&
                  outSelect.options &&
                  outSelect.options.length
                ) {
                  displayLabel = outSelect.options[outSelect.selectedIndex].textContent || null;
                }
                if (!displayLabel && baseOut && baseOut.label) displayLabel = baseOut.label;
                if (displayLabel) lblInput.value = displayLabel;
              }
              const id = \`custom-\${Date.now()}\`;
              let baseCfg = null;
              try {
                if (baseOut && baseOut.cfg) {
                  if (typeof baseOut.cfg === 'string')
                    baseCfg = { type: 'template', template: baseOut.cfg };
                  else baseCfg = JSON.parse(JSON.stringify(baseOut.cfg));
                }
              } catch (e) {
                baseCfg = null;
              }
              const nt = {
                id,
                label: lblInput.value || (baseOut && baseOut.label) || id,
                cfg: baseCfg,
                fields: baseOut && baseOut.fields ? JSON.parse(JSON.stringify(baseOut.fields)) : [],
                outputId: outId,
              };
              forms.push(nt);
              formsMap = rebuildMap(forms);
              storageSet(KEYS.forms, forms);
              refreshTplSelect();
              tplSelect.value = id;
              loadSelected();
              addTemplateOptionToFormPanes(id, nt.label || id);
            })
          );

          loadBtn.addEventListener(
            'click',
            wrapHandler(() => {
              const id = tplSelect.value;
              if (!id) return;
              const allPrev = captureValuesByForm();

              safe(() => {
                const t = forms.find((x) => x.id === id) || formsMap[id];
                if (!t) return;
                const cfgCopy = t.cfg
                  ? typeof t.cfg === 'string'
                    ? { type: 'template', template: t.cfg }
                    : deepCopy(t.cfg)
                  : null;
                let at = formConfig.findIndex((x) => x && x._formId === id);
                if (at >= 0) {
                  formConfig[at].fields = deepCopy(t.fields || []);
                  if (formConfig[at]._templateId === id) formConfig[at].format = cfgCopy;
                } else {
                  formConfig.push({
                    title: t.label || id,
                    format: cfgCopy,
                    fields: deepCopy(t.fields || []),
                    _formId: id,
                    _templateId: id,
                  });
                  at = formConfig.length - 1;
                }
                formsMap = rebuildMap(forms);
                safe(() => persistFormMap());
                build();
                safe(() => restoreValuesByForm(allPrev));
                safe(() => activateTab(at));
              });
              try {
                const newTplTab = q(tabbar, '.tab.right[data-templates="true"]');
                if (newTplTab) activateTab(Number(newTplTab.dataset.index));
              } catch (e) {}
            })
          );

          saveBtn.addEventListener(
            'click',
            wrapHandler(() => {
              const id = tplSelect.value;
              const t = forms.find((x) => x.id === id);
              if (!t) return;
              t.label = lblInput.value || t.label || t.id;
              try {
                const raw = String(
                  typeof advChk !== 'undefined' && advChk.checked
                    ? cfgTa.value || ''
                    : typeof cfgSimple !== 'undefined'
                    ? cfgSimple.value
                    : cfgTa.value || ''
                ).trim();
                if (!raw) {
                  t.cfg = null;
                } else {
                  if (raw[0] === '{' || raw[0] === '[') {
                    t.cfg = JSON.parse(raw);
                  } else {
                    t.cfg = { type: 'template', template: raw };
                  }
                }
              } catch (e) {
                try {
                  try {
                    if (typeof advChk !== 'undefined' && advChk.checked)
                      highlightJsonError(cfgTa, e);
                    else highlightJsonError(cfgSimple, e);
                  } catch (ex) {}
                } catch (ex) {}
                alert('Invalid template config JSON: ' + e.message);
                return;
              }
              try {
                const parsedFields = fieldsTa.value.trim() ? JSON.parse(fieldsTa.value) : [];
                if (!Array.isArray(parsedFields)) throw new Error('Fields must be an array');
                t.fields = parsedFields;
              } catch (e) {
                safe(() => highlightJsonError(fieldsTa, e));
                alert('Invalid fields JSON: ' + e.message);
                return;
              }
              if (outSelect && outSelect.value) t.outputId = outSelect.value;
              safe(() => {
                const fmt = t.cfg
                  ? typeof t.cfg === 'string'
                    ? { type: 'template', template: t.cfg }
                    : deepCopy(t.cfg)
                  : null;
                formConfig.forEach((tab) => {
                  if (!tab) return;
                  if (tab._formId === t.id) {
                    tab.fields = deepCopy(t.fields || []);
                    if (!/^tpl-\\d+$/.test(t.id)) tab.title = t.label || tab.title;
                  }
                  if (tab._templateId === t.id) tab.format = fmt;
                });
              });
              formsMap = rebuildMap(forms);
              storageSet(KEYS.forms, forms);
              safe(() => persistFormMap());
              const preserveIndex = tplPane.dataset.index;
              const preserveId = t.id;
              const allPrev = captureAllFormValues();
              safe(() => build());
              safe(() => restoreAllFormValues(allPrev));
              safe(() => {
                activateTab(Number(preserveIndex));
                const newPane = q(contents, \`.tab-pane[data-index='\${preserveIndex}']\`);
                if (newPane) {
                  const newSelect = q(newPane, 'select');
                  if (newSelect) {
                    newSelect.value = preserveId;
                    newSelect.dispatchEvent(new Event('change'));
                  }
                }
              });
              try {
                suppressTabActivation = true;
                for (let fi = 0; fi < formConfig.length; fi++) {
                  const formPane = q(contents, \`.tab-pane[data-index='\${fi}']\`);
                  if (!formPane) continue;
                  const formTpl = q(formPane, 'select');
                  if (!formTpl) continue;
                  if (formTpl.value === preserveId) {
                    formTpl.dispatchEvent(new Event('change'));
                  }
                }
              } finally {
                suppressTabActivation = false;
              }
              safe(() => {
                activateTab(Number(preserveIndex));
                const tplPane = q(contents, \`.tab-pane[data-index='\${preserveIndex}']\`);
                if (tplPane) {
                  const status = document.createElement('div');
                  status.className = 'meta';
                  status.textContent = 'Saved';
                  status.style.marginTop = '8px';
                  const tplPaneContent = q(tplPane, '.tab-content');
                  if (tplPaneContent) tplPaneContent.appendChild(status);
                  setTimeout(() => status.remove(), 1800);
                }
              });
            })
          );

          delBtn.addEventListener(
            'click',
            wrapHandler(() => {
              let _proceed2 = true;
              safe(
                () => {
                  if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) {
                    _proceed2 = true;
                  } else if (typeof window.confirm === 'function') {
                    _proceed2 = !!window.confirm(
                      'Delete this form/template? This action cannot be undone.'
                    );
                  }
                },
                undefined,
                () => {
                  _proceed2 = true;
                }
              );
              if (!_proceed2) return;
              const id = tplSelect.value;
              const preserveIndex = tplPane.dataset.index;
              forms = forms.filter((x) => x.id !== id);
              formsMap = rebuildMap(forms);
              storageSet(KEYS.forms, forms);
              safe(() => persistFormMap());
              refreshTplSelect();
              loadSelected();
              const allPrev = captureValuesByForm();
              safe(() => {
                if (id && id.startsWith('custom-')) {
                  for (let j = formConfig.length - 1; j >= 0; j--) {
                    if (formConfig[j] && formConfig[j]._formId === id) formConfig.splice(j, 1);
                  }
                }
                formConfig.forEach((tab) => {
                  if (tab && tab._templateId === id) tab._templateId = tab._formId;
                });
              });
              safe(() => persistFormMap());
              safe(() => build());
              safe(() => restoreValuesByForm(allPrev));
              safe(() => {
                activateTab(Number(preserveIndex));
                const newPane = q(contents, \`.tab-pane[data-index='\${preserveIndex}']\`);
                if (newPane) {
                  const newSelect = q(newPane, 'select');
                  if (newSelect && newSelect.options.length) newSelect.selectedIndex = 0;
                }
              });

              removeTemplateOptionFromFormPanes(id);

              safe(() => {
                const newTplTab = q(tabbar, '.tab.right[data-templates="true"]');
                if (newTplTab) {
                  activateTab(Number(newTplTab.dataset.index));
                  const finalPane = q(
                    contents,
                    \`.tab-pane[data-index='\${newTplTab.dataset.index}']\`
                  );
                  if (finalPane) {
                    const status = document.createElement('div');
                    status.className = 'meta';
                    status.textContent = 'Deleted';
                    status.style.marginTop = '8px';
                    const finalPaneContent = q(finalPane, '.tab-content');
                    if (finalPaneContent) finalPaneContent.appendChild(status);
                    setTimeout(() => status.remove(), 1800);
                  }
                }
              });
            })
          );

          resetBtn.addEventListener(
            'click',
            wrapHandler(() => {
              const preserveIndex = tplPane.dataset.index;
              localStorage.removeItem(KEYS.forms);
              safe(() => {
                localStorage.removeItem(formMapKey);
                localStorage.removeItem(KEYS.tabs);
                formMap = {};
              });
              forms = deepCopy(defaultTemplates);
              formsMap = rebuildMap(forms);
              refreshTplSelect();
              loadSelected();
              const allPrev = captureValuesByForm();
              safe(() => {
                const fresh = deepCopy(originalFormConfig) || [];
                fresh.forEach((t, idx) => {
                  t._formId = \`tpl-\${idx}\`;
                  t._templateId = \`tpl-\${idx}\`;
                });
                formConfig.splice(0, formConfig.length, ...fresh);
              });
              safe(() => build());
              safe(() => restoreValuesByForm(allPrev));
              safe(() => {
                const newTplTab = q(tabbar, '.tab.right[data-templates="true"]');
                if (newTplTab) {
                  activateTab(Number(newTplTab.dataset.index));
                  const newPane = q(contents, \`.tab-pane[data-index='\${newTplTab.dataset.index}']\`);
                  if (newPane) {
                    const newSelect = q(newPane, 'select');
                    if (newSelect) {
                      if (newSelect.options.length) newSelect.selectedIndex = 0;
                      newSelect.dispatchEvent(new Event('change'));
                    }
                    const freshPane = q(
                      contents,
                      \`.tab-pane[data-index='\${newTplTab.dataset.index}']\`
                    );
                    const targetPane = freshPane || newPane;
                  }
                }
              });
              try {
                suppressTabActivation = true;
                for (let fi = 0; fi < formConfig.length; fi++) {
                  const formPane = q(contents, \`.tab-pane[data-index='\${fi}']\`);
                  if (!formPane) continue;
                  const formTpl = q(formPane, 'select');
                  if (!formTpl) continue;
                  if (!q(formTpl, \`option[value="\${formTpl.value}"]\`)) {
                    if (formTpl.options.length) {
                      formTpl.selectedIndex = 0;
                      formTpl.dispatchEvent(new Event('change'));
                    }
                  }
                }
              } finally {
                suppressTabActivation = false;
              }
              safe(() => {
                const newTplTab = q(tabbar, '.tab.right[data-templates="true"]');
                if (newTplTab) {
                  activateTab(Number(newTplTab.dataset.index));
                  safe(() => {
                    const finalPane = q(
                      contents,
                      \`.tab-pane[data-index='\${newTplTab.dataset.index}']\`
                    );
                    if (finalPane) {
                      const status = document.createElement('div');
                      status.className = 'meta';
                      status.textContent = 'Reset to defaults';
                      status.style.marginTop = '8px';
                      const container = q(finalPane, '.tab-content');
                      if (container) container.appendChild(status);
                      setTimeout(() => status.remove(), 1800);
                    }
                  });
                }
              });
            })
          );

          tplPane.appendChild(paneContent);
          contents.appendChild(tplPane);
        })();

        activateTab(0);
      }

      /**
       * Show the pane at \`index\` and mark its tab active.
       *
       * @param {number} index Pane index.
       * @returns {void}
       */
      function activateTab(index) {
        Array.from(tabbar.children).forEach((t) =>
          t.classList.toggle('active', Number(t.dataset.index) === index)
        );
        Array.from(contents.children).forEach(
          (p) => (p.style.display = Number(p.dataset.index) === index ? '' : 'none')
        );
      }

      /**
       * Find values in other tabs for the target tab's fields and render a preview
       * where the user picks which to apply.
       *
       * @param {number} targetIndex Index of the tab to populate.
       * @param {HTMLElement} previewContainer Element to render the preview into.
       * @returns {Array<{name: string, candidates: Array}>} One entry per target field.
       */
      function scanPopulate(targetIndex, previewContainer) {
        const targetPane = q(contents, \`.tab-pane[data-index='\${targetIndex}']\`);
        const targetForm = q(targetPane, 'form.generated-form');
        const targetNames = Array.from(targetForm.elements)
          .filter((e) => e.dataset.step !== 'click')
          .map((e) => e.name)
          .filter(Boolean)
          .filter((n) => !n.endsWith('_key') && !n.endsWith('_combined'));
        const items = targetNames.map((n) => ({ name: n, candidates: [] }));

        formConfig.forEach((tab, ti) => {
          if (ti === targetIndex) return;
          const pane = q(contents, \`.tab-pane[data-index='\${ti}']\`);
          if (!pane) return;
          const form = q(pane, 'form.generated-form');
          if (!form) return;
          targetNames.forEach((name, idx) => {
            const combinedName = name + '_combined';
            const els = qAll(
              form,
              \`[name="\${CSS.escape(name)}"], [name="\${CSS.escape(combinedName)}"]\`
            );
            if (!els || els.length === 0) return;
            const combinedEl = els.find((e) => e.name === combinedName);
            if (combinedEl) {
              const v = combinedEl.value !== undefined ? combinedEl.value : '';
              if (String(v).trim() !== '')
                items[idx].candidates.push({ value: v, fromTab: ti, fromTitle: tab.title });
              return;
            }
            if (els[0].type === 'radio') {
              const checked = els.find((e) => e.checked);
              if (checked)
                items[idx].candidates.push({
                  value: checked.value || '',
                  fromTab: ti,
                  fromTitle: tab.title,
                });
            } else if (els[0].type === 'checkbox') {
              const checked = els.find((e) => e.checked);
              if (checked)
                items[idx].candidates.push({
                  value: checked.value || 'on',
                  fromTab: ti,
                  fromTitle: tab.title,
                });
            } else {
              for (const e of els) {
                if (e.value !== undefined && String(e.value).trim() !== '') {
                  items[idx].candidates.push({ value: e.value, fromTab: ti, fromTitle: tab.title });
                  break;
                }
              }
            }
          });
        });

        previewContainer.innerHTML = '';
        items.forEach((it) => {
          const row = document.createElement('div');
          row.className = 'preview-item';
          const label = document.createElement('div');
          label.style.flex = '1';
          const name = document.createElement('div');
          name.className = 'small';
          name.textContent = it.name;
          label.appendChild(name);

          if (it.candidates.length === 0) {
            const none = document.createElement('div');
            none.className = 'meta';
            none.textContent = 'no value found';
            label.appendChild(none);
          } else {
            const list = document.createElement('div');
            const keepOpt = document.createElement('div');
            keepOpt.style.display = 'flex';
            keepOpt.style.alignItems = 'center';
            keepOpt.style.gap = '8px';
            keepOpt.style.padding = '2px 0';
            const keepRadio = document.createElement('input');
            keepRadio.type = 'radio';
            keepRadio.autocomplete = 'off';
            keepRadio.name = \`choose-\${targetIndex}-\${it.name}\`;
            keepRadio.value = '__keep__';
            keepRadio.checked = true;
            const currentVal = safe(() => {
              const currentEls = qAll(targetForm, \`[name="\${CSS.escape(it.name)}"]\`);
              if (currentEls && currentEls.length) {
                if (currentEls[0].type === 'radio') {
                  const c = currentEls.find((e) => e.checked);
                  if (c) return c.value || '';
                } else if (currentEls[0].type === 'checkbox') {
                  const c = currentEls.find((e) => e.checked);
                  if (c) return c.value || 'on';
                } else {
                  return currentEls[0].value || '';
                }
              }
              return '';
            }, '');
            const keepTxt = document.createElement('div');
            keepTxt.className = 'meta';
            keepTxt.textContent = \`\${currentVal || ''} (Keep current)\`;
            keepOpt.appendChild(keepRadio);
            keepOpt.appendChild(keepTxt);
            list.appendChild(keepOpt);

            it.candidates.forEach((c, ci) => {
              const opt = document.createElement('div');
              opt.style.display = 'flex';
              opt.style.alignItems = 'center';
              opt.style.gap = '8px';
              opt.style.padding = '2px 0';
              const r = document.createElement('input');
              r.type = 'radio';
              r.autocomplete = 'off';
              r.name = \`choose-\${targetIndex}-\${it.name}\`;
              r.value = String(ci);
              const txt = document.createElement('div');
              txt.className = 'meta';
              txt.textContent = \`\${c.value} (from \${c.fromTitle})\`;
              opt.appendChild(r);
              opt.appendChild(txt);
              list.appendChild(opt);
            });
            label.appendChild(list);
          }

          row.appendChild(label);
          previewContainer.appendChild(row);
          it._candidates = it.candidates;
        });

        const applyBtn = document.createElement('button');
        applyBtn.className = 'btn';
        applyBtn.type = 'button';
        applyBtn.textContent = 'Apply Selected';
        applyBtn.style.marginTop = '8px';
        applyBtn.addEventListener(
          'click',
          wrapHandler(() => {
            const selections = [];
            items.forEach((it) => {
              const radios = qAll(
                previewContainer,
                \`input[name="choose-\${targetIndex}-\${it.name}"]\`
              );
              if (!radios || radios.length === 0) return;
              const checked = Array.from(radios).find((r) => r.checked);
              if (!checked) return;
              const ci = Number(checked.value);
              const cand = it._candidates && it._candidates[ci];
              if (cand) selections.push({ name: it.name, value: cand.value });
            });
            applyPreviewSelections(targetIndex, selections);
          })
        );
        previewContainer.appendChild(applyBtn);

        return items;
      }

      /**
       * Resolve a "{name}" token for a \`type: "template"\` output. An explicit value is
       * used as-is (arrays joined by newlines); otherwise "<name>_combined" is used,
       * formatted as a numbered list when it is an array or a ">"-separated string.
       *
       * @param {string} name Token name.
       * @param {Object} values Form values.
       * @returns {string} The replacement text.
       */
      function formatTemplateToken(name, values) {
        const hasExplicit = values && Object.prototype.hasOwnProperty.call(values, name);
        if (hasExplicit) {
          const val = values[name];
          if (Array.isArray(val)) return val.join('\\n');
          return val !== undefined && val !== null ? String(val) : '';
        }
        let val;
        if (values && Object.prototype.hasOwnProperty.call(values, name + '_combined')) {
          val = values[name + '_combined'];
        }
        if (Array.isArray(val)) return toNumberedList(val);
        if (typeof val === 'string' && val.includes('>')) return toNumberedList(splitSteps(val));
        return val !== undefined && val !== null ? String(val) : '';
      }

      /**
       * Fill a template's tokens, dropping optional sections whose tokens are blank.
       *
       * Text wrapped in \`[[\` and \`]]\` is an optional section: it is kept only when
       * every token directly inside it resolves to a non-blank value, so separators
       * such as " - " never dangle next to a missing value. Sections may nest; an
       * inner section is evaluated on its own and never hides its parent.
       * Unmatched brackets are kept as literal text.
       *
       * @param {string} tpl Template text.
       * @param {RegExp} tokenRe Global token pattern whose first group is the name.
       * @param {function(string): string} resolve Returns the text for a token name.
       * @returns {string} The rendered text.
       */
      function renderTemplate(tpl, tokenRe, resolve) {
        const src = String(tpl == null ? '' : tpl);
        const ends = new Map();
        const opens = [];
        for (let i = 0; i < src.length - 1; i++) {
          if (src.startsWith('[[', i)) {
            opens.push(i);
            i++;
          } else if (src.startsWith(']]', i) && opens.length) {
            ends.set(opens.pop(), i);
            i++;
          }
        }
        const render = (start, end) => {
          let out = '';
          let text = '';
          let filled = true;
          const flush = () => {
            out += text.replace(tokenRe, (_, name) => {
              const v = String(resolve(name));
              if (!v.trim()) filled = false;
              return v;
            });
            text = '';
          };
          for (let i = start; i < end; i++) {
            if (ends.has(i)) {
              flush();
              const section = render(i + 2, ends.get(i));
              if (section.filled) out += section.out;
              i = ends.get(i) + 1;
            } else {
              text += src[i];
            }
          }
          flush();
          return { out, filled };
        };
        return render(0, src.length).out;
      }

      /**
       * Look up a form value, treating undefined and null as blank.
       *
       * @param {?Object} values Form values.
       * @param {string} name Value name.
       * @returns {*} The value, or ''.
       */
      const valueOrBlank = (values, name) =>
        values && values[name] !== undefined && values[name] !== null ? values[name] : '';

      /**
       * Remove every template line that holds a token for a blank optional field,
       * so the line's label (such as "Additional Comments:") goes with it.
       *
       * @param {string} tpl Template text.
       * @param {RegExp} tokenRe Global token pattern whose first group is the name.
       * @param {function(string): string} resolve Returns the text for a token name.
       * @param {Array<string>} optional Names of optional fields.
       * @returns {string} The template without those lines.
       */
      function dropBlankOptionalLines(tpl, tokenRe, resolve, optional) {
        const src = String(tpl == null ? '' : tpl);
        if (!optional || optional.length === 0) return src;
        const isBlankOptional = (line) =>
          Array.from(line.matchAll(tokenRe)).some(
            (m) =>
              (optional.includes(m[1]) || optional.includes(m[1].replace(/_combined$/, ''))) &&
              !String(resolve(m[1])).trim()
          );
        const kept = src
          .split(/(?<=\\n)/)
          .filter((line) => !isBlankOptional(line))
          .join('');
        return src.endsWith('\\n') ? kept : kept.replace(/\\n$/, '');
      }

      /**
       * Render form values using an output format: a template string, a
       * \`{type: 'template'|'sprintf', template}\` object, or JSON when none is given.
       * Template lines holding a blank optional field are left out, and the JSON
       * fallback omits blank optional fields.
       *
       * @param {(string|Object|null)} formatCfg Output format.
       * @param {Object} values Form values.
       * @param {Array<string>} [optional] Names of fields marked \`optional\`.
       * @returns {string} The generated note.
       */
      function generateOutput(formatCfg, values, optional = []) {
        const render = (tpl, tokenRe, resolve) =>
          renderTemplate(dropBlankOptionalLines(tpl, tokenRe, resolve, optional), tokenRe, resolve);
        const plain = (name) => valueOrBlank(values, name);
        if (typeof formatCfg === 'string') return render(formatCfg, /\\{([^}]+)\\}/g, plain);
        if (formatCfg && formatCfg.type === 'template') {
          return render(formatCfg.template || '', /\\{([^}]+)\\}/g, (name) =>
            formatTemplateToken(name, values)
          );
        }
        if (formatCfg && formatCfg.type === 'sprintf') {
          return render(formatCfg.template || '', /%\\(([^)]+)\\)s/g, plain);
        }
        const kept = Object.assign({}, values);
        optional.forEach((name) => {
          if (!String(formatTemplateToken(name, values)).trim()) {
            delete kept[name];
            delete kept[name + '_combined'];
          }
        });
        return JSON.stringify(kept, null, 2);
      }

      /**
       * Write the values chosen in the populate preview into the target tab's form.
       *
       * @param {number} targetIndex Index of the tab to fill.
       * @param {Array<{name: string, value: *}>} selections Chosen values.
       * @returns {void}
       */
      function applyPreviewSelections(targetIndex, selections) {
        const targetPane = q(contents, \`.tab-pane[data-index='\${targetIndex}']\`);
        const targetForm = q(targetPane, 'form.generated-form');
        selections.forEach((sel) => {
          const fieldCfg =
            formConfig[targetIndex] && formConfig[targetIndex].fields
              ? formConfig[targetIndex].fields.find((f) => f.name === sel.name)
              : null;
          const combinedInput = q(targetForm, \`[name="\${CSS.escape(sel.name + '_combined')}"]\`);
          if (fieldCfg && fieldCfg.type === 'steps') {
            const parts = splitSteps(sel.value);
            const existing = qAll(targetForm, \`[name="\${CSS.escape(sel.name)}"]\`);
            const container = q(targetForm, \`.steps-container[data-name="\${sel.name}"]\`);
            const list = container && q(container, '.steps-list');
            if (parts.length > 1) {
              if (list) list.innerHTML = '';
              parts.forEach((p) => {
                if (list) createStepRow(sel.name, parseStepPart(p), container, list);
              });
              safe(() => {
                if (combinedInput) combinedInput.value = sel.value;
              });
            }
          }

          const els = qAll(targetForm, \`[name="\${CSS.escape(sel.name)}"]\`);
          if (!els || els.length === 0) return;
          if (els[0].type === 'radio') {
            els.forEach((r) => {
              r.checked = r.value == sel.value;
            });
            return;
          }
          if (els[0].type === 'checkbox') {
            els.forEach((c) => {
              c.checked = !!sel.value && String(sel.value) !== 'false' && String(sel.value) !== '0';
            });
            return;
          }
          if (fieldCfg && fieldCfg.type === 'steps' && String(sel.value || '').includes('>')) {
            const parts = splitSteps(sel.value);
            const container = q(targetForm, \`.steps-container[data-name="\${sel.name}"]\`);
            const list = container && q(container, '.steps-list');
            if (parts.length > els.length) {
              for (let i = els.length; i < parts.length; i++) {
                if (list) createStepRow(sel.name, '', container, list);
              }
            }
            const newEls = qAll(targetForm, \`[name="\${CSS.escape(sel.name)}"]\`);
            const newKeys = qAll(targetForm, \`[name="\${CSS.escape(sel.name + '_key')}"]\`);
            parts.forEach((p, idx) => {
              const { key, val } = parseStepPart(p);
              if (newEls[idx]) newEls[idx].value = val;
              if (newKeys[idx]) {
                if (key) newKeys[idx].value = key;
                else if (container && container.dataset) {
                  newKeys[idx].value =
                    container.dataset.keyMode === 'numbered'
                      ? String(idx + 1)
                      : container.dataset.keyMode === 'bullet'
                      ? '-'
                      : newKeys[idx].value;
                }
              }
            });
            safe(() => {
              if (combinedInput) combinedInput.value = sel.value;
            });
            return;
          }

          const e = els[0];
          e.value = sel.value;
          if (fieldCfg && fieldCfg.type === 'steps' && combinedInput)
            combinedInput.value = sel.value;
        });
      }

      build();

      (function () {
        const key = KEYS.theme;
        const btn = document.getElementById('themeToggle');

        /**
         * Apply a colour theme and update the toggle's label.
         *
         * @param {string} t 'dark' or 'light'.
         * @returns {void}
         */
        function applyTheme(t) {
          if (t === 'dark') document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
          if (btn) btn.textContent = t === 'dark' ? 'Light' : 'Dark';
        }
        const saved =
          storageGet(key) ||
          (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light');
        applyTheme(saved);
        if (btn)
          btn.addEventListener(
            'click',
            wrapHandler(() => {
              const isDark = document.documentElement.classList.toggle('dark');
              const next = isDark ? 'dark' : 'light';
              storageSet(key, next);
              if (btn) btn.textContent = isDark ? 'Light' : 'Dark';
            })
          );
      })();
    <\/script>
  </body>
</html>
`});var c=r((exports,module)=>{function loadHtml(){try{let e=i();if(typeof e=="string"&&e.indexOf("<script")!==-1)return e}catch{}try{let nodeRequire=eval('typeof require === "function" ? require : null');if(nodeRequire){let e=nodeRequire("fs"),n=nodeRequire("path");return e.readFileSync(n.join(__dirname,"form-generator.html"),"utf8")}}catch{}return""}var html=loadHtml();function mount(e,n){let a=n||{};if(typeof e=="string"&&(e=document.querySelector(e)),!e||typeof e.appendChild!="function")throw new Error("mount(): first argument must be a DOM element or a selector that resolves to one");if(!html)throw new Error("mount(): runtime HTML is unavailable \u2014 run `npm run build:html`");let o=html;if(Array.isArray(a.formConfig)){let d="<script>window.formConfig = "+JSON.stringify(a.formConfig).replace(/</g,"\\u003c")+";<\/script>";o=o.replace(/<head(\s[^>]*)?>/i,p=>p+d)}let l=e.ownerDocument||(typeof document<"u"?document:null);if(!l)throw new Error("mount(): no document available to create the iframe");let t=l.createElement("iframe");return t.setAttribute("title","Note Form Generator"),t.style.border="0",t.style.width="100%",t.style.height=a.height||"100%",t.srcdoc=o,e.innerHTML="",e.appendChild(t),t}module.exports={html,mount};module.exports.default=module.exports});return c();})();
