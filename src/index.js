export const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Inline JSON Form Generator</title>
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
      h1 {
        font-size: 18px;
        margin: 0;
      }
      .tabs {
        display: flex;
        gap: 6px;
        margin-top: 14px;
        border-bottom: 1px solid var(--border);
      }
      .tab {
        padding: 10px 14px;
        cursor: pointer;
        border-radius: 6px 6px 0 0;
        color: var(--muted);
      }
      .tab.active {
        background: linear-gradient(180deg, #fff, #f4f8ff);
        color: var(--accent);
        box-shadow: 0 -4px 12px rgba(43, 140, 255, 0.06);
        border-bottom: 2px solid #fff;
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
      .btn.ghost {
        background: #f2f6ff;
        color: var(--accent);
        border: 1px solid #d7e7ff;
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
      .small {
        font-size: 13px;
        color: #333;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="top">
        <h1>Inline JSON Form Generator</h1>
        <div style="display: flex; align-items: center; gap: 10px">
          <div class="meta">
            Copyright ©️ 2026 Valithor Obsidion &lt;valithor@discordphp.org&gt;
          </div>
          <button id="themeToggle" class="btn ghost" type="button" aria-label="Toggle dark mode">
            Dark
          </button>
        </div>
      </div>

      <div id="tabbar" class="tabs"></div>
      <div id="contents"></div>
    </div>

    <script>
      // The full runtime script is embedded in the HTML file in the repo.
      // For consumers who wish to mount the full UI, use \`mount(container)\`.
    </script>
  </body>
</html>`;

export function mount(container) {
  if (typeof container === 'string') container = document.querySelector(container);
  if (!container || !container.innerHTML !== undefined) {
    throw new Error('Invalid container element');
  }
  container.innerHTML = html;
  return container;
}

export default { html, mount };
