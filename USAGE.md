# Using NFG as a Dependency

This guide explains how third-party projects can consume the NFG (note form
generator) code. It covers installing from npm (published package), from the
Git repository, using a local path or tarball, and including the runtime
assets directly in a browser.

## Key points

- The runtime HTML/JS produced by this project has no external runtime
  dependencies — it runs standalone in a browser.
- The Node.js packages listed in `devDependencies` are only for development
  tasks (testing, linting, formatting). Consumers who only need the runtime
  HTML/JS do not need to install those devDependencies.

## 1) Publish & install from npm (recommended for distribution)

Steps for the package author:

1. Ensure `package.json` contains metadata: `name`, `version`, `license`,
   `repository`, and an entry point such as `main` or `module`. Use `files` or
   `exports` to restrict what is published.

Example package.json fragment:

```json
{
  "name": "@yourorg/nfg",
  "version": "0.1.0",
  "license": "MIT",
  "repository": "https://github.com/youruser/your-repo",
  "main": "dist/index.cjs.js",
  "module": "dist/index.esm.js",
  "files": ["dist/", "src/form-generator.html"]
}
```

2. (Optional) Build a distributable bundle for consumers. Example using
   `esbuild`:

```bash
npx esbuild src/index.js --bundle --format=esm --outfile=dist/index.esm.js
npx esbuild src/index.js --bundle --format=cjs --outfile=dist/index.cjs.js
```

This repository also provides convenience scripts to produce browser-ready
artifacts:

- `npm run build` — creates `dist/index.esm.js` and `dist/index.cjs.js`.
- `npm run build:browser` — creates `dist/form-generator.js` (IIFE global `NFG`).
  -- `npm run build:html` — copies `src/form-generator.html` into `dist/` and
  regenerates `src/embedded-html.js` (the runtime string `mount()` renders).

The `files` field in `package.json` includes `dist/` and `src/form-generator.html`, so these
artifacts will be included when publishing.

3. Publish to npm. If you use a scoped package name (starts with `@scope/`) and
   want it to be public, include `--access public`:

```bash
npm login
npm publish --access public  # for scoped public packages
# or for unscoped packages, just: npm publish
```

Notes for authors:

- Use semantic versioning (`MAJOR.MINOR.PATCH`) and create a Git tag for
  releases.
- Include a license file and repository field so consumers can find the
  source.

Consumer installation:

```bash
npm install @yourorg/nfg
```

Import examples (the package exports `html` and `mount`):

ESM:

```js
import { mount } from '@yourorg/nfg';
mount(document.getElementById('root'));
```

CommonJS:

```js
const { mount } = require('@yourorg/nfg');
mount('#root', {
  formConfig: [
    /* your tabs */
  ],
});
```

## 2) Install directly from a Git repository

No publishing required. In the consumer project:

```bash
npm install github:youruser/your-repo
# or a specific tag/commit
npm install github:youruser/your-repo#v0.1.0
```

Notes: Consumers get the repository files as-is. If your repo needs a build
step, include built assets in the repository or configure a `prepare` script
so npm runs the build on install.

## 3) Local path or tarball (good for local development)

Local path (from consumer project):

```bash
npm install ../path/to/NFG
```

Tarball (author side):

```bash
# in NFG
npm pack
# installs note-form-generator-0.1.0.tgz in consumer project
npm install ../note-form-generator-0.1.0.tgz
```

## 4) Include runtime assets directly in a browser (no npm required)

If the consumer only needs the runtime HTML/JS, they can copy `src/form-generator.html`
or the generated JS into their site and include it with a script tag.

Example:

```html
<!-- copy/paste the minimal runtime bundle or src/form-generator.html contents -->
<script src="/path/to/form-generator.js"></script>
```

## 5) Making NFG easy to consume (recommended developer tasks)

- The entry `src/index.js` exports `html` (the full single-file app) and
  `mount(container, { formConfig })`, which renders it as a live iframe.
- Add `main`/`module` and `files` in `package.json` so npm packages include
  only the required files.
- Optionally add a tiny build step that bundles a browser-friendly UMD/ESM file
  if you plan to support script-tag usage.

## 6) Troubleshooting & notes

- If consumers install from Git and the repo requires a build, add a `prepare`
  script in `package.json` so npm runs it on install:

```json
"scripts": {
  "prepare": "npm run build"
}
```

- For local testing, `npm link` can also be useful:

```bash
# in NFG
npm link
# in consumer
npm link note-form-generator
```

---

## Optional per-step Click checkbox

A `steps` field can opt into an inline Click checkbox on every row:

```json
{
  "label": "Procedure",
  "name": "steps",
  "type": "steps",
  "keyMode": "numbered",
  "controls": { "click": true },
  "default": "Settings > Save"
}
```

`controls.click` controls visibility, not the checked state. Only the boolean
`true` enables it; omit the section or use `false` to retain the original UI and
output. Each checkbox starts unchecked and applies independently. Checking the
first row above generates `1. Click " Settings "`; leaving the second unchecked
generates `2. Save`. The key remains outside the wrapper. Spaces inside the double
quotes are intentional. Values remain plain text; JSON output escapes them normally.

Inserted rows start unchecked. Duplicate and in-session form rebuilds preserve
row values, keys and checked states. Clear unchecks them. Parse replaces rows and
resets their checked state. Checkbox state is temporary form input, not configuration
or an extra output field; exporting form definitions does not persist it.

## Optional template sections

Wrap part of an output template in `[[` and `]]` to keep it only when every
placeholder inside it has a value:

```json
{ "type": "template", "template": "{title}[[ - {subtitle}]]" }
```

With `subtitle` filled this generates `Report - Q3`; with it blank (or only
spaces) it generates `Report`, with no dangling `-`. The same works for a
prefix: `[[{label}: ]]{value}` drops `: ` when `label` is blank.
Sections can nest, and an inner section is checked on its own:
`{a}[[ - {b}[[ / {c}]]]]` drops ` / {c}` when `c` is blank but keeps ` - {b}`.
Optional sections work in `template`, `sprintf` (`%(name)s`) and bare-string
formats. Unmatched brackets are output as typed, and values entered in the form
are never treated as template syntax.

## Optional fields

Mark a field with `"optional": true` to leave it out of the output entirely when
it is blank:

```json
{ "label": "Additional Comments", "name": "comments", "type": "textarea", "optional": true }
```

With the template `Name: {name}\nAdditional Comments: {comments}`, a blank
comment removes the whole `Additional Comments:` line instead of printing an
empty label. Every template line holding the field's placeholder is removed,
so put the label on the same line as the placeholder. Blank required fields on
other lines are unaffected. A steps field counts as blank when every step row
is empty, even if the rows still show `1.` or `-` markers or a ticked Click box.
Empty rows between filled ones are kept as they are. An optional dropdown starts
on a blank choice (`—`) so it can be left out.
The JSON fallback omits a blank optional field, and
the form shows _(optional)_ beside its label. To drop only part of a line, use
an optional section (`[[ ]]`) instead.

### Conditional blank lines

A blank line that separates an optional field from what follows can go with
that field. Write `[[?]]` alone on the line:

```json
{ "type": "template", "template": "Name: {name}\nComments: {comments}\n[[?]]\nEnd" }
```

With `comments` filled this outputs `Name: …`, `Comments: …`, a blank line and
`End`; with it blank, both the `Comments:` line and the blank line are left
out. The nearest line above that holds a placeholder decides: when that line
is dropped for a blank optional field the blank line goes too, otherwise it is
output as an ordinary empty line (as it is when there is no field above it).
`[[?]]` only has this meaning when it is the whole line.

## Visual Designer

Turn on **Dev** and open the **Designer** tab to build a form and its output
without writing JSON. Everything runs inside the single HTML file, offline.

- **Form fields:** drag a field type (Short text, Paragraph, Dropdown, Number,
  Date, Email, Time, Date & time, Phone, Web address, Checkbox, Steps, Heading)
  onto the form, or click it to add it at the end.
  Drag a card's header, or use its arrows, to reorder. Select a card to change
  its label, field name (it follows the label until you edit it), placeholder,
  starting value, dropdown options, step markers, the Click checkbox, side by
  side layout, and whether it is optional.
- **Output:** each row is one output line made of text and field chips. Drag a
  field from _Insert_ into a line, or onto _Drop here to start a new line_.
  Select a field chip to give it text before or after that only appears when
  the field has a value, so separators such as `-` never dangle. An
  _Optional group_ keeps everything inside it only when every field in it has a
  value. These are saved as ordinary `[[ ]]` optional sections, and fields
  marked optional still drop their whole line when blank. _+ Blank line_ adds
  an empty line; tick _Only if the field above is included_ on it to save it as
  a `[[?]]` conditional blank line. _Add a line per field_
  fills in `Label: {name}` lines for fields the output does not show yet, and
  the output can instead be raw JSON of every value.
- **Preview:** type sample values into the cards to see exactly what Generate
  will produce. The compiled template text is shown underneath.
- **Save** writes to the same form (or output) definition the Forms and Outputs
  panes edit, and updates any open tab. **Save & open tab** also opens the form
  as a tab. Unsaved design changes trigger the leave-page prompt, and switching
  to another definition asks first.

- **Steps in the output:** select a steps chip to show the steps one per line
  with their markers (`{steps}`) or exactly as typed (`{steps_combined}`).
- **Checkbox:** a ticked box outputs `Yes`, or the _Text when ticked_ you set;
  an unticked box is blank, so an optional checkbox drops its line.
- **Saved as:** outputs keep their placeholder style. Pick `{name}` templates,
  `%(name)s` templates, or plain text; `%(name)s` and plain text join steps with
  commas instead of one per line.
- **Based on output:** a form can be linked to an Output, as in the Forms pane.
  Linking a blank form copies the Output's fields and output; _Copy its fields &
  output_ does it again on demand.

- **Import export…:** choose an HTML file saved with Export HTML (or paste the
  text it copied, or JSON holding tabs, forms or outputs). The file is only
  read, never run. Tick the forms and outputs to bring in; they are added next
  to your own with new ids, links between forms and outputs are kept, and the
  first form opens for editing.
- **Save updated export:** after importing, this downloads the export again
  under its original file name, holding only the imported tabs, forms and
  outputs with every edit made since. It is built from the version you are
  running, so an export made with an older version picks up the current styles
  and code; anything that older file did differently is replaced, and only its
  forms and outputs carry over.

Forms written by hand load into the Designer as they are: `{name}` and
`%(name)s` tokens, plain text formats, `[[ ]]` sections (nested ones become
nested groups), blank lines and `[[?]]` lines all survive a save unchanged. Field types and
settings the Designer has no control for are kept as they are.

## Browser render smoke checks

`npm run build:all`, `npx playwright install --with-deps chromium`, then
`npm run test:browser` exercise the real generated app in Chromium. Use
`npm run report:browser` to open the local HTML report and its attached PNGs.
The suite uses synthetic examples on desktop light/dark and mobile light, covering
text/textarea/headings, steps insertion/removal/duplication, Forms/Outputs editors,
and Click controls absent, disabled, unchecked and checked. These are behavioral
smoke assertions plus human-reviewable captures, not pixel-baseline approval or
proof that every possible visual regression is detected.

The separate Browser renders workflow uses a single standard public-repository
Ubuntu runner, no deployment, no secrets and no external visual-testing service.
Artifact storage has its own account-wide allowance. The repository owner confirmed
an Actions $0 stop-usage budget before enabling uploads; maintain that protection.
Quota/upload failures must not be bypassed with a paid upgrade. The HTML report
(including PNG attachments) has a 15 MiB cap and one-day retention.
GitHub requires signing in with repository read access to download artifacts;
download/extract the report and open it locally. Expired artifacts cannot be
retrieved. Reports contain only synthetic fixtures, never real user data.

References: [Playwright CI](https://playwright.dev/docs/ci),
[GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions),
[artifact downloads](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/download-workflow-artifacts).
