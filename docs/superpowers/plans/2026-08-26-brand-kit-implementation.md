# Nodexeus Brand Kit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a static, dependency-free Nodexeus brand kit — a small
reference site plus a machine-readable `brand.json` — so a future
social-media bot can generate on-brand text posts and visual cards.

**Architecture:** Plain HTML/CSS pages (no build step, no framework)
sharing one `style.css`, one hand-authored `brand.json` as the
machine-readable source, recreated vector logo assets under
`assets/logo/`, and a small Node-based consistency checker under
`scripts/` using only Node's built-in test runner (no dependencies).

**Tech Stack:** HTML5, CSS3, Node.js >= 18 (`node:test`, `node:assert/strict`,
`node:fs`, `node:path` — no npm packages), SVG.

**Spec:** `docs/superpowers/specs/2026-08-26-brand-kit-design.md`

**Tracking:** Parent epic https://github.com/nodexeus/brand-kit/issues/1.
Each task below has a corresponding child issue (linked per task).

## Global Constraints

- All colors, fonts, copy, and positioning must match the values
  extracted from https://www.nodexeus.com in the spec — no invented
  brand elements.
- No build tooling and no npm dependencies anywhere in this repo.
  Node.js >= 18 is required only to run the validation scripts via
  the built-in `node --test` runner.
- The kit site itself uses one fixed dark theme (`--ink` background,
  amber accent) for simplicity. `color.html` documents both the dark
  and light token sets as reference swatches; the kit does not
  implement a live light/dark toggle.
- Geist Sans/Mono font files are not vendored in this repo. Pages
  reference `"GeistSans"` / `"GeistMono"` by name with system-font
  fallbacks; `type.html` notes where to obtain the real fonts.
- Logo assets are freshly recreated clean vector SVGs — never reuse
  or reference the raster-in-SVG file from the live site.
- Every hex color value present in `brand.json.colors` must also
  appear verbatim (case-insensitive) in `color.html`, enforced by
  `scripts/check-brand.mjs`.
- Commit messages reference their tracking issue, e.g.
  `feat: add brand.json (#2)`.

---

## Task 1: Brand data core — brand.json + validation module foundation

Issue: https://github.com/nodexeus/brand-kit/issues/2

**Files:**
- Create: `.gitignore`
- Create: `brand.json`
- Create: `scripts/brand-consistency.mjs`
- Test: `scripts/brand-consistency.test.mjs`

**Interfaces:**
- Produces: `loadBrandJson(filePath: string): object` — reads and
  `JSON.parse`s the file at `filePath`; throws if the file is missing
  or invalid JSON.
- Produces: `REQUIRED_BRAND_KEYS: string[]` — exported constant listing
  every top-level key `brand.json` must have:
  `['name', 'tagline', 'description', 'website', 'colors', 'fonts', 'logo', 'voice', 'socialContentPillars', 'socialConventions', 'examplePosts', 'visualCardRules']`
- Produces: `missingRequiredKeys(brand: object): string[]` — returns
  the subset of `REQUIRED_BRAND_KEYS` not present as a key on `brand`.

- [ ] **Step 1: Add a .gitignore**

```
.gstack/
.DS_Store
```

- [ ] **Step 2: Write the failing test file**

Create `scripts/brand-consistency.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  loadBrandJson,
  missingRequiredKeys,
  REQUIRED_BRAND_KEYS,
} from './brand-consistency.mjs';

test('loadBrandJson parses valid JSON from disk', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'brand-'));
  const file = path.join(dir, 'brand.json');
  writeFileSync(file, JSON.stringify({ name: 'Test' }));
  const result = loadBrandJson(file);
  assert.deepEqual(result, { name: 'Test' });
  rmSync(dir, { recursive: true, force: true });
});

test('loadBrandJson throws on invalid JSON', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'brand-'));
  const file = path.join(dir, 'brand.json');
  writeFileSync(file, '{ not valid json');
  assert.throws(() => loadBrandJson(file));
  rmSync(dir, { recursive: true, force: true });
});

test('missingRequiredKeys returns all keys when object is empty', () => {
  assert.deepEqual(missingRequiredKeys({}), REQUIRED_BRAND_KEYS);
});

test('missingRequiredKeys returns empty array when all keys present', () => {
  const full = Object.fromEntries(REQUIRED_BRAND_KEYS.map((k) => [k, {}]));
  assert.deepEqual(missingRequiredKeys(full), []);
});

test('missingRequiredKeys returns only the keys that are absent', () => {
  const partial = { name: 'x', tagline: 'y' };
  const missing = missingRequiredKeys(partial);
  assert.ok(missing.includes('colors'));
  assert.ok(!missing.includes('name'));
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `node --test scripts/brand-consistency.test.mjs`
Expected: FAIL — `Cannot find module './brand-consistency.mjs'`

- [ ] **Step 4: Implement the validation module**

Create `scripts/brand-consistency.mjs`:

```js
import { readFileSync } from 'node:fs';

export const REQUIRED_BRAND_KEYS = [
  'name',
  'tagline',
  'description',
  'website',
  'colors',
  'fonts',
  'logo',
  'voice',
  'socialContentPillars',
  'socialConventions',
  'examplePosts',
  'visualCardRules',
];

export function loadBrandJson(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

export function missingRequiredKeys(brand) {
  return REQUIRED_BRAND_KEYS.filter((key) => !(key in brand));
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `node --test scripts/brand-consistency.test.mjs`
Expected: PASS, all 5 tests green.

- [ ] **Step 6: Author brand.json**

Create `brand.json` at the repo root:

```json
{
  "name": "Nodexeus Technologies",
  "tagline": "Infrastructure and intelligence. Built around your business.",
  "description": "Nodexeus builds and operates blockchain nodes, AI agent platforms and the web3 software around them.",
  "website": "https://www.nodexeus.com",
  "colors": {
    "ink": "#050506",
    "inkForeground": "#fafafa",
    "inkMuted": "#a4a4ac",
    "white": "#ffffff",
    "muted": "#f4f4f5",
    "mutedForeground": "#71717b",
    "border": "#e4e4e7",
    "primary": "#fdc700",
    "amberDeep": "#dfa800",
    "chartScale": ["#ffd230", "#fe9a00", "#e17100", "#bb4d00", "#973c00"],
    "destructive": "#e7000b"
  },
  "fonts": {
    "sans": "GeistSans",
    "mono": "GeistMono"
  },
  "logo": {
    "markAmberOnDark": "assets/logo/mark-amber-on-dark.svg",
    "markBlackOnLight": "assets/logo/mark-black-on-light.svg",
    "markMono": "assets/logo/mark-mono.svg",
    "wordmarkLockupDark": "assets/logo/wordmark-lockup-dark.svg",
    "wordmarkLockupLight": "assets/logo/wordmark-lockup-light.svg",
    "favicon": "assets/logo/favicon.svg",
    "clearspace": "1x icon height on all sides",
    "minSizePx": 24
  },
  "voice": {
    "principles": [
      "engineer-to-engineer, not marketing-to-buyer",
      "specific beats vague — name the failure mode, not the fear",
      "state limits honestly instead of overselling",
      "short, declarative sentences over hedged ones"
    ],
    "avoid": [
      "synergy",
      "seamless",
      "cutting-edge",
      "revolutionize",
      "unlock",
      "empower",
      "excessive exclamation points",
      "emoji stacking"
    ],
    "sampleQuotes": [
      "Infrastructure and intelligence. Built around your business.",
      "Anyone can rent you a server. The work is everything after.",
      "Not a tarball and good luck.",
      "We do not publish a blanket uptime guarantee, because one that covers every network and every hardware configuration would be worth nothing."
    ]
  },
  "socialContentPillars": [
    "network/client upgrades and fork readiness",
    "uptime and incident transparency (what broke, what we did)",
    "new network support / infra launches",
    "AI agent and web3 engineering work in production",
    "plain-spoken infra/industry commentary"
  ],
  "socialConventions": {
    "hashtags": "sparingly, only when naming a network or event",
    "emoji": "none, or a single one at most",
    "postLength": "1-3 short sentences; threads only when reporting a real incident or upgrade in steps",
    "cta": "specific and low-pressure (e.g. 'ask us what that costs'), never hype-driven"
  },
  "examplePosts": {
    "onBrand": [
      "Base client update landed this week. We're on it across every base-mainnet node we run — no action needed if that's us.",
      "Uptime numbers only mean something next to the incident that tested them. Ask us about the fork we caught at 3am last month.",
      "New: private RPC endpoints for Solana, same operating model as our Ethereum fleet. Talk to an engineer if you're evaluating providers."
    ],
    "offBrand": [
      {
        "post": "🚀🚀 Revolutionizing Web3 infrastructure with our CUTTING-EDGE platform!! #blockchain #AI #web3 #innovation #disrupt",
        "reason": "hype language, emoji stacking, and hashtag stuffing — the voice guide explicitly avoids all three"
      },
      {
        "post": "We guarantee 99.999% uptime on every network, no exceptions!",
        "reason": "the brand explicitly refuses blanket uptime guarantees — this contradicts stated positioning"
      }
    ]
  },
  "visualCardRules": {
    "background": "ink (#050506) or white, no gradients beyond the existing chart scale",
    "logoPlacement": "top-left or centered, minimum clearspace = 1x icon height",
    "typography": "GeistSans for headline text on cards",
    "accentUsage": "amber (#fdc700) for at most one focal element per card"
  }
}
```

- [ ] **Step 7: Verify brand.json satisfies the schema**

Run:
```bash
node -e "
import('./scripts/brand-consistency.mjs').then(({ loadBrandJson, missingRequiredKeys }) => {
  const brand = loadBrandJson('./brand.json');
  const missing = missingRequiredKeys(brand);
  console.log('missing keys:', missing);
  process.exit(missing.length ? 1 : 0);
});
"
```
Expected: `missing keys: []`, exit code 0.

- [ ] **Step 8: Commit**

```bash
git add .gitignore brand.json scripts/brand-consistency.mjs scripts/brand-consistency.test.mjs
git commit -m "feat: add brand.json and validation core (#2)"
```

---

## Task 2: Validation script extended + CLI (check-brand.mjs)

Issue: https://github.com/nodexeus/brand-kit/issues/3

**Files:**
- Modify: `scripts/brand-consistency.mjs`
- Modify: `scripts/brand-consistency.test.mjs`
- Create: `scripts/check-brand.mjs`

**Interfaces:**
- Consumes: `loadBrandJson`, `REQUIRED_BRAND_KEYS`, `missingRequiredKeys`
  (from Task 1, same file).
- Produces: `missingAssetPaths(brand: object, baseDir: string): string[]`
  — returns the subset of string values under `brand.logo` that look
  like relative paths (contain `/`) and do not exist under `baseDir`.
- Produces: `missingHexInHtml(hexList: string[], htmlText: string): string[]`
  — returns the subset of `hexList` not present (case-insensitive) in
  `htmlText`.

- [ ] **Step 1: Write the failing tests**

Append to `scripts/brand-consistency.test.mjs` (add `mkdirSync` to the
existing `node:fs` import, and add these two tests, and add
`missingAssetPaths, missingHexInHtml` to the existing import from
`./brand-consistency.mjs`):

```js
test('missingAssetPaths returns paths that do not exist on disk', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'brand-assets-'));
  mkdirSync(path.join(dir, 'assets', 'logo'), { recursive: true });
  writeFileSync(path.join(dir, 'assets', 'logo', 'present.svg'), '<svg></svg>');
  const brand = {
    logo: {
      present: 'assets/logo/present.svg',
      missing: 'assets/logo/missing.svg',
      clearspace: '1x icon height on all sides',
    },
  };
  const missing = missingAssetPaths(brand, dir);
  assert.deepEqual(missing, ['assets/logo/missing.svg']);
  rmSync(dir, { recursive: true, force: true });
});

test('missingHexInHtml finds hex values absent from the given HTML text', () => {
  const html = '<div style="color:#FDC700">amber</div>';
  const missing = missingHexInHtml(['#fdc700', '#050506'], html);
  assert.deepEqual(missing, ['#050506']);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test scripts/brand-consistency.test.mjs`
Expected: FAIL — `missingAssetPaths is not a function` (and similarly
for `missingHexInHtml`).

- [ ] **Step 3: Implement the two new functions**

Rewrite `scripts/brand-consistency.mjs` in full:

```js
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

export const REQUIRED_BRAND_KEYS = [
  'name',
  'tagline',
  'description',
  'website',
  'colors',
  'fonts',
  'logo',
  'voice',
  'socialContentPillars',
  'socialConventions',
  'examplePosts',
  'visualCardRules',
];

export function loadBrandJson(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

export function missingRequiredKeys(brand) {
  return REQUIRED_BRAND_KEYS.filter((key) => !(key in brand));
}

export function missingAssetPaths(brand, baseDir) {
  const paths = Object.values(brand.logo).filter(
    (value) => typeof value === 'string' && value.includes('/')
  );
  return paths.filter((relativePath) => !existsSync(path.join(baseDir, relativePath)));
}

export function missingHexInHtml(hexList, htmlText) {
  const lowerHtml = htmlText.toLowerCase();
  return hexList.filter((hex) => !lowerHtml.includes(hex.toLowerCase()));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test scripts/brand-consistency.test.mjs`
Expected: PASS, all 7 tests green.

- [ ] **Step 5: Write the CLI**

Create `scripts/check-brand.mjs`:

```js
#!/usr/bin/env node
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  loadBrandJson,
  missingRequiredKeys,
  missingAssetPaths,
  missingHexInHtml,
} from './brand-consistency.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');

let failed = false;

const brand = loadBrandJson(path.join(repoRoot, 'brand.json'));

const missingKeys = missingRequiredKeys(brand);
if (missingKeys.length > 0) {
  console.error('Missing required brand.json keys:', missingKeys.join(', '));
  failed = true;
}

const missingAssets = missingAssetPaths(brand, repoRoot);
if (missingAssets.length > 0) {
  console.error('brand.json references missing asset files:', missingAssets.join(', '));
  failed = true;
}

const colorHtml = readFileSync(path.join(repoRoot, 'color.html'), 'utf8');
const hexValues = Object.values(brand.colors).flatMap((value) =>
  Array.isArray(value) ? value : [value]
);
const missingHex = missingHexInHtml(hexValues, colorHtml);
if (missingHex.length > 0) {
  console.error('color.html is missing hex values present in brand.json:', missingHex.join(', '));
  failed = true;
}

if (failed) {
  process.exit(1);
}

console.log('Brand consistency checks passed.');
```

Note: this CLI will fail if run now — `assets/logo/*.svg` and
`color.html` don't exist yet. That's expected; it isn't run for real
until Task 10. This step only requires the file to exist with correct
code; do not attempt to run it against the real repo yet.

- [ ] **Step 6: Commit**

```bash
git add scripts/brand-consistency.mjs scripts/brand-consistency.test.mjs scripts/check-brand.mjs
git commit -m "feat: add asset/hex consistency checks and check-brand CLI (#3)"
```

---

## Task 3: Logo recreation (vector SVG assets)

Issue: https://github.com/nodexeus/brand-kit/issues/4

**Files:**
- Create: `assets/logo/mark-amber-on-dark.svg`
- Create: `assets/logo/mark-black-on-light.svg`
- Create: `assets/logo/mark-mono.svg`
- Create: `assets/logo/wordmark-lockup-dark.svg`
- Create: `assets/logo/wordmark-lockup-light.svg`
- Create: `assets/logo/favicon.svg`

**Interfaces:**
- Produces: the six SVG files at the exact paths above. These are the
  same paths referenced by `brand.json.logo` (Task 1) and consumed by
  `index.html` (Task 4) and `logo.html` (Task 5).

Definitions to use consistently:
- `mark-amber-on-dark.svg`: the primary full-color mark — amber
  (`#fdc700`) rounded-square badge containing a solid black glyph.
  Intended placement: dark backgrounds (matches the live nav usage).
- `mark-black-on-light.svg`: single solid black (`#050506`) version of
  just the glyph (no colored badge), for light backgrounds needing one
  ink color.
- `mark-mono.svg`: the glyph using `fill="currentColor"` so it can be
  tinted to any single color by the embedding context.
- `wordmark-lockup-dark.svg`: `mark-amber-on-dark.svg` + "Nodexeus" set
  in GeistSans (fallback: system sans-serif), text color `#fafafa`,
  for dark backgrounds.
- `wordmark-lockup-light.svg`: same lockup, text color `#050506`, for
  light backgrounds.
- `favicon.svg`: simplified square icon version of the amber mark,
  legible at 16-32px.

- [ ] **Step 1: Re-capture the reference shape**

```bash
B="/Users/caleb/.claude/skills/gstack/browse/dist/browse"
$B goto https://www.nodexeus.com
$B screenshot /tmp/nodexeus-logo-ref.png --selector "header img"
```
Read `/tmp/nodexeus-logo-ref.png` with the Read tool to confirm the
shape: an amber rounded-square badge containing a black rounded-arch
(archway/tunnel-entrance-like) glyph, centered, with generous internal
padding.

- [ ] **Step 2: Invoke the logo-designer skill**

Invoke `Skill(logo-designer)` with this brief:

> Recreate a company mark as clean, hand-authored SVG (real `<path>`
> geometry, not embedded raster). Reference shape: a rounded-square
> badge in amber `#fdc700` containing a solid black `#050506`
> rounded-arch glyph — like a stone archway or tunnel entrance viewed
> head-on — centered with roughly 20% padding on all sides, badge
> corner radius approximately 20% of the badge width. Deliver these
> exact variants: (1) full-color mark — amber badge + black arch glyph;
> (2) monochrome black version of just the glyph, transparent
> background, for light backgrounds; (3) a `currentColor`-fill mono
> version of just the glyph; (4) two wordmark lockups pairing the mark
> with "Nodexeus" set in a bold geometric sans (GeistSans if available,
> otherwise a close system equivalent), one with white/light text for
> dark backgrounds, one with black/dark text for light backgrounds,
> spacing matching a typical nav-bar lockup; (5) a simplified favicon
> variant of the full-color mark, legible at 16-32px. All at social
> 1:1 viewBox for the icon variants (e.g. `0 0 256 256`).

- [ ] **Step 3: Save the outputs to the exact file paths**

Ensure the skill's outputs end up saved at exactly:
`assets/logo/mark-amber-on-dark.svg`,
`assets/logo/mark-black-on-light.svg`,
`assets/logo/mark-mono.svg`,
`assets/logo/wordmark-lockup-dark.svg`,
`assets/logo/wordmark-lockup-light.svg`,
`assets/logo/favicon.svg`.
If the skill writes elsewhere, move/copy the files into place with `mv`/`cp`.

- [ ] **Step 4: Verify each file is well-formed SVG**

```bash
for f in assets/logo/*.svg; do
  head -c 200 "$f" | grep -q '<svg' && echo "OK: $f" || echo "BAD: $f"
done
```
Expected: `OK:` printed for all six files.

- [ ] **Step 5: Visually verify each asset**

```bash
B="/Users/caleb/.claude/skills/gstack/browse/dist/browse"
for f in assets/logo/*.svg; do
  $B goto "file://$(pwd)/$f"
  $B screenshot "/tmp/$(basename "$f" .svg)-render.png"
done
```
Read each `/tmp/*-render.png` with the Read tool and confirm it
renders the intended glyph/lockup/favicon correctly (no broken paths,
correct colors, mark recognizable as the arch/"n" shape).

- [ ] **Step 6: Commit**

```bash
git add assets/logo/
git commit -m "feat: recreate logo mark and lockups as vector SVG (#4)"
```

---

## Task 4: Shared stylesheet + homepage (style.css + index.html)

Issue: https://github.com/nodexeus/brand-kit/issues/5

**Files:**
- Create: `style.css`
- Create: `index.html`

**Interfaces:**
- Produces (consumed by every later page task): CSS custom properties
  `--ink`, `--ink-foreground`, `--ink-muted`, `--white`, `--muted`,
  `--muted-foreground`, `--border`, `--primary`, `--amber-deep`,
  `--chart-1`..`--chart-5`, `--destructive`, `--font-sans`,
  `--font-mono`; and component classes `.container`, `.site-header`,
  `.badge`, `.link-grid`/`.link-card`, `.swatch-grid`/`.swatch`/`.swatch-color`/
  `.swatch-label`, `.type-sample`, `.do-dont-grid`, `.quote`,
  `.post-card`, `.logo-display`, `.site-footer`, `.prose`, `.mono`.
- Produces: the shared header/footer HTML block (below), copied
  verbatim into every subsequent page.

Shared header block (used in every page, with the current page's nav
link **not** wrapped in `<a>` — see individual page tasks):

```html
<header class="site-header">
  <div class="container">
    <a class="brand" href="index.html">
      <img src="assets/logo/mark-amber-on-dark.svg" width="24" height="24" alt="" aria-hidden="true">
      <span>Nodexeus Brand Kit</span>
    </a>
    <nav>
      <a href="index.html">Overview</a>
      <a href="logo.html">Logo</a>
      <a href="color.html">Color</a>
      <a href="type.html">Type</a>
      <a href="voice.html">Voice</a>
      <a href="social.html">Social</a>
    </nav>
  </div>
</header>
```

Shared footer block:

```html
<footer class="site-footer">
  <div class="container">
    <span>© 2026 Nodexeus Technologies</span>
    <span><a href="brand.json">brand.json</a> · <a href="https://www.nodexeus.com" target="_blank" rel="noopener noreferrer">nodexeus.com</a></span>
  </div>
</footer>
```

- [ ] **Step 1: Write style.css**

Create `style.css`:

```css
:root {
  --ink: #050506;
  --ink-foreground: #fafafa;
  --ink-muted: #a4a4ac;
  --white: #ffffff;
  --muted: #f4f4f5;
  --muted-foreground: #71717b;
  --border: #e4e4e7;
  --primary: #fdc700;
  --amber-deep: #dfa800;
  --chart-1: #ffd230;
  --chart-2: #fe9a00;
  --chart-3: #e17100;
  --chart-4: #bb4d00;
  --chart-5: #973c00;
  --destructive: #e7000b;
  --font-sans: "GeistSans", ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-mono: "GeistMono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--ink);
  color: var(--ink-foreground);
  font-family: var(--font-sans);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

.container {
  max-width: 64rem;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.site-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.site-header .container {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  height: 4rem;
}

.site-header .brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--ink-foreground);
  font-weight: 700;
  text-decoration: none;
}

.site-header nav {
  display: flex;
  gap: 1.5rem;
  margin-left: auto;
}

.site-header nav a {
  color: var(--ink-muted);
  text-decoration: none;
  font-size: 0.875rem;
}

.site-header nav a:hover,
.site-header nav a[aria-current="page"] {
  color: var(--ink-foreground);
}

main {
  padding: 3rem 0 4rem;
}

.badge {
  display: inline-block;
  background: var(--primary);
  color: var(--ink);
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
}

h1 {
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 1rem;
}

h2 {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin: 3rem 0 1rem;
}

h3 {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
}

.tagline {
  font-size: 1.25rem;
  color: var(--ink-foreground);
  margin: 0 0 1rem;
}

.prose { color: var(--ink-muted); max-width: 42rem; }
.prose p { margin: 0 0 1rem; }
.prose a { color: var(--primary); }
.prose ul { padding-left: 1.25rem; }
.prose li { margin-bottom: 0.5rem; }

.link-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.link-card {
  display: block;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 1.25rem;
  text-decoration: none;
  color: inherit;
}

.link-card:hover { border-color: var(--primary); }
.link-card p { color: var(--ink-muted); font-size: 0.875rem; margin: 0; }

.swatch-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
  gap: 1rem;
}

.swatch {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  overflow: hidden;
}

.swatch-color { height: 5rem; }
.swatch-label { padding: 0.75rem 1rem; font-size: 0.8125rem; }
.swatch-label .hex {
  display: block;
  font-family: var(--font-mono);
  color: var(--ink-muted);
  margin-top: 0.25rem;
}

.type-sample {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.type-sample .label {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--ink-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
  display: block;
}

.do-dont-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
@media (max-width: 40rem) {
  .do-dont-grid { grid-template-columns: 1fr; }
}
.do-dont-grid h3 {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.do-dont-grid.do h3 { color: var(--primary); }
.do-dont-grid.dont h3 { color: var(--destructive); }

.quote {
  border-left: 3px solid var(--primary);
  padding-left: 1rem;
  margin: 0 0 1rem;
  color: var(--ink-foreground);
  font-style: italic;
}

.post-card {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 1.25rem;
  margin-bottom: 1rem;
  font-family: var(--font-mono);
  font-size: 0.875rem;
}
.post-card.off-brand { border-color: var(--destructive); }
.post-card .reason {
  font-family: var(--font-sans);
  color: var(--ink-muted);
  font-size: 0.8125rem;
  margin-top: 0.75rem;
  font-style: normal;
}

.logo-display {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}
.logo-display.on-dark { background: var(--ink); border: 1px solid rgba(255, 255, 255, 0.1); }
.logo-display.on-light { background: var(--white); }

.site-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem 0;
  color: var(--ink-muted);
  font-size: 0.875rem;
}
.site-footer .container { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
.site-footer a { color: var(--ink-muted); }

code, .mono { font-family: var(--font-mono); }
```

- [ ] **Step 2: Write index.html**

Create `index.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Nodexeus Brand Kit</title>
<link rel="icon" href="assets/logo/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="site-header">
  <div class="container">
    <a class="brand" href="index.html">
      <img src="assets/logo/mark-amber-on-dark.svg" width="24" height="24" alt="" aria-hidden="true">
      <span>Nodexeus Brand Kit</span>
    </a>
    <nav>
      <a href="index.html" aria-current="page">Overview</a>
      <a href="logo.html">Logo</a>
      <a href="color.html">Color</a>
      <a href="type.html">Type</a>
      <a href="voice.html">Voice</a>
      <a href="social.html">Social</a>
    </nav>
  </div>
</header>
<main>
  <div class="container">
    <section>
      <span class="badge">Brand Kit</span>
      <h1>Nodexeus Brand Kit</h1>
      <p class="tagline">Infrastructure and intelligence. Built around your business.</p>
      <div class="prose">
        <p>Nodexeus builds and operates blockchain nodes, AI agent platforms and the web3 software around them. This kit documents the logo, color, type, voice, and social conventions drawn from nodexeus.com, plus a machine-readable <a href="brand.json"><code class="mono">brand.json</code></a> for anything that needs to generate on-brand content.</p>
      </div>
    </section>
    <section class="link-grid">
      <a class="link-card" href="logo.html">
        <h3>Logo</h3>
        <p>Mark, wordmark, clearspace, and misuse.</p>
      </a>
      <a class="link-card" href="color.html">
        <h3>Color</h3>
        <p>The full palette, with hex values and usage roles.</p>
      </a>
      <a class="link-card" href="type.html">
        <h3>Type</h3>
        <p>Geist Sans and Geist Mono specimens.</p>
      </a>
      <a class="link-card" href="voice.html">
        <h3>Voice</h3>
        <p>Tone principles and real example copy.</p>
      </a>
      <a class="link-card" href="social.html">
        <h3>Social</h3>
        <p>Content pillars, conventions, and example posts for on-brand generation.</p>
      </a>
    </section>
  </div>
</main>
<footer class="site-footer">
  <div class="container">
    <span>© 2026 Nodexeus Technologies</span>
    <span><a href="brand.json">brand.json</a> · <a href="https://www.nodexeus.com" target="_blank" rel="noopener noreferrer">nodexeus.com</a></span>
  </div>
</footer>
</body>
</html>
```

- [ ] **Step 3: Verify by rendering in the browser**

```bash
B="/Users/caleb/.claude/skills/gstack/browse/dist/browse"
$B goto "file://$(pwd)/index.html"
$B console
$B screenshot /tmp/index-render.png
```
Read `/tmp/index-render.png` with the Read tool. Expected: dark page,
amber badge, header nav, five link cards, footer. `console` should
show no errors.

- [ ] **Step 4: Commit**

```bash
git add style.css index.html
git commit -m "feat: add shared stylesheet and homepage (#5)"
```

---

## Task 5: logo.html

Issue: https://github.com/nodexeus/brand-kit/issues/6

**Files:**
- Create: `logo.html`

**Interfaces:**
- Consumes: classes from Task 4 (`.logo-display`, `.prose`,
  `.swatch-grid`/`.swatch`, shared header/footer block); asset files
  from Task 3.

- [ ] **Step 1: Write logo.html**

Create `logo.html` (header/footer identical to Task 4's blocks, with
`aria-current="page"` moved onto the "Logo" nav link):

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Logo — Nodexeus Brand Kit</title>
<link rel="icon" href="assets/logo/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="site-header">
  <div class="container">
    <a class="brand" href="index.html">
      <img src="assets/logo/mark-amber-on-dark.svg" width="24" height="24" alt="" aria-hidden="true">
      <span>Nodexeus Brand Kit</span>
    </a>
    <nav>
      <a href="index.html">Overview</a>
      <a href="logo.html" aria-current="page">Logo</a>
      <a href="color.html">Color</a>
      <a href="type.html">Type</a>
      <a href="voice.html">Voice</a>
      <a href="social.html">Social</a>
    </nav>
  </div>
</header>
<main>
  <div class="container">
    <span class="badge">Logo</span>
    <h1>The mark</h1>
    <div class="prose">
      <p>The Nodexeus mark is an amber badge holding a black arch glyph. Use the full-color version by default — reach for a monochrome variant only when the context forces a single ink color.</p>
    </div>

    <h2>Full-color mark</h2>
    <div class="logo-display on-dark">
      <img src="assets/logo/mark-amber-on-dark.svg" width="96" height="96" alt="Nodexeus mark, full color">
    </div>
    <div class="logo-display on-light">
      <img src="assets/logo/mark-amber-on-dark.svg" width="96" height="96" alt="Nodexeus mark, full color">
    </div>

    <h2>Wordmark lockup</h2>
    <div class="logo-display on-dark">
      <img src="assets/logo/wordmark-lockup-dark.svg" height="48" alt="Nodexeus wordmark, dark background lockup">
    </div>
    <div class="logo-display on-light">
      <img src="assets/logo/wordmark-lockup-light.svg" height="48" alt="Nodexeus wordmark, light background lockup">
    </div>

    <h2>Color variants</h2>
    <div class="swatch-grid">
      <div class="swatch">
        <div class="logo-display on-dark" style="padding:1.5rem;">
          <img src="assets/logo/mark-amber-on-dark.svg" width="48" height="48" alt="Full color mark">
        </div>
        <div class="swatch-label">Full color<span class="hex">mark-amber-on-dark.svg</span></div>
      </div>
      <div class="swatch">
        <div class="logo-display on-light" style="padding:1.5rem;">
          <img src="assets/logo/mark-black-on-light.svg" width="48" height="48" alt="Black monochrome mark">
        </div>
        <div class="swatch-label">Black<span class="hex">mark-black-on-light.svg</span></div>
      </div>
      <div class="swatch">
        <div class="logo-display on-dark" style="padding:1.5rem;">
          <img src="assets/logo/mark-mono.svg" width="48" height="48" alt="Monochrome currentColor mark">
        </div>
        <div class="swatch-label">Mono (tintable)<span class="hex">mark-mono.svg</span></div>
      </div>
    </div>

    <h2>Clearspace and minimum size</h2>
    <div class="prose">
      <p>Keep clearspace equal to at least 1x the icon's height on every side. Never render the mark smaller than 24px — below that, use the favicon variant instead, which is simplified for legibility at small sizes.</p>
    </div>

    <h2>Misuse</h2>
    <div class="prose">
      <ul>
        <li>Don't recolor the amber badge — it's brand-specific, not a placeholder.</li>
        <li>Don't add drop shadows, outlines, or bevels.</li>
        <li>Don't stretch or distort the mark's proportions.</li>
        <li>Don't place the full-color mark on busy or low-contrast backgrounds — use a monochrome variant instead.</li>
        <li>Don't redraw or trace the glyph by hand — always use the source SVG files.</li>
      </ul>
    </div>

    <h2>Favicon</h2>
    <div class="logo-display on-dark" style="padding:1.5rem;">
      <img src="assets/logo/favicon.svg" width="32" height="32" alt="Nodexeus favicon">
    </div>
  </div>
</main>
<footer class="site-footer">
  <div class="container">
    <span>© 2026 Nodexeus Technologies</span>
    <span><a href="brand.json">brand.json</a> · <a href="https://www.nodexeus.com" target="_blank" rel="noopener noreferrer">nodexeus.com</a></span>
  </div>
</footer>
</body>
</html>
```

- [ ] **Step 2: Verify by rendering in the browser**

```bash
B="/Users/caleb/.claude/skills/gstack/browse/dist/browse"
$B goto "file://$(pwd)/logo.html"
$B console
$B screenshot /tmp/logo-render.png
```
Read `/tmp/logo-render.png`. Expected: all logo variants visible and
correctly rendered on their intended backgrounds, no broken images.

- [ ] **Step 3: Commit**

```bash
git add logo.html
git commit -m "feat: add logo.html brand page (#6)"
```

---

## Task 6: color.html

Issue: https://github.com/nodexeus/brand-kit/issues/7

**Files:**
- Create: `color.html`

**Interfaces:**
- Consumes: `.swatch-grid`/`.swatch`/`.swatch-color`/`.swatch-label`
  classes from Task 4.
- Must contain every hex value listed in `brand.json.colors` verbatim
  (checked by `scripts/check-brand.mjs` in Task 10).

- [ ] **Step 1: Write color.html**

Create `color.html` (header/footer as in Task 4/5, "Color" nav link
gets `aria-current="page"`):

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Color — Nodexeus Brand Kit</title>
<link rel="icon" href="assets/logo/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="site-header">
  <div class="container">
    <a class="brand" href="index.html">
      <img src="assets/logo/mark-amber-on-dark.svg" width="24" height="24" alt="" aria-hidden="true">
      <span>Nodexeus Brand Kit</span>
    </a>
    <nav>
      <a href="index.html">Overview</a>
      <a href="logo.html">Logo</a>
      <a href="color.html" aria-current="page">Color</a>
      <a href="type.html">Type</a>
      <a href="voice.html">Voice</a>
      <a href="social.html">Social</a>
    </nav>
  </div>
</header>
<main>
  <div class="container">
    <span class="badge">Color</span>
    <h1>Palette</h1>
    <div class="prose">
      <p>The site is dark-mode-first. Amber is the one accent color — use it for a single focal action or highlight, not as a general fill.</p>
    </div>

    <h2>Dark surface</h2>
    <div class="swatch-grid">
      <div class="swatch"><div class="swatch-color" style="background:#050506;"></div><div class="swatch-label">Ink<span class="hex">#050506</span></div></div>
      <div class="swatch"><div class="swatch-color" style="background:#fafafa;"></div><div class="swatch-label">Ink Foreground<span class="hex">#fafafa</span></div></div>
      <div class="swatch"><div class="swatch-color" style="background:#a4a4ac;"></div><div class="swatch-label">Ink Muted<span class="hex">#a4a4ac</span></div></div>
    </div>

    <h2>Light surface</h2>
    <div class="swatch-grid">
      <div class="swatch"><div class="swatch-color" style="background:#ffffff;"></div><div class="swatch-label">White<span class="hex">#ffffff</span></div></div>
      <div class="swatch"><div class="swatch-color" style="background:#f4f4f5;"></div><div class="swatch-label">Muted<span class="hex">#f4f4f5</span></div></div>
      <div class="swatch"><div class="swatch-color" style="background:#71717b;"></div><div class="swatch-label">Muted Foreground<span class="hex">#71717b</span></div></div>
      <div class="swatch"><div class="swatch-color" style="background:#e4e4e7;"></div><div class="swatch-label">Border<span class="hex">#e4e4e7</span></div></div>
    </div>

    <h2>Accent</h2>
    <div class="swatch-grid">
      <div class="swatch"><div class="swatch-color" style="background:#fdc700;"></div><div class="swatch-label">Primary<span class="hex">#fdc700</span></div></div>
      <div class="swatch"><div class="swatch-color" style="background:#dfa800;"></div><div class="swatch-label">Amber Deep<span class="hex">#dfa800</span></div></div>
      <div class="swatch"><div class="swatch-color" style="background:#ffd230;"></div><div class="swatch-label">Chart 1<span class="hex">#ffd230</span></div></div>
      <div class="swatch"><div class="swatch-color" style="background:#fe9a00;"></div><div class="swatch-label">Chart 2<span class="hex">#fe9a00</span></div></div>
      <div class="swatch"><div class="swatch-color" style="background:#e17100;"></div><div class="swatch-label">Chart 3<span class="hex">#e17100</span></div></div>
      <div class="swatch"><div class="swatch-color" style="background:#bb4d00;"></div><div class="swatch-label">Chart 4<span class="hex">#bb4d00</span></div></div>
      <div class="swatch"><div class="swatch-color" style="background:#973c00;"></div><div class="swatch-label">Chart 5<span class="hex">#973c00</span></div></div>
    </div>

    <h2>Semantic</h2>
    <div class="swatch-grid">
      <div class="swatch"><div class="swatch-color" style="background:#e7000b;"></div><div class="swatch-label">Destructive<span class="hex">#e7000b</span></div></div>
    </div>
  </div>
</main>
<footer class="site-footer">
  <div class="container">
    <span>© 2026 Nodexeus Technologies</span>
    <span><a href="brand.json">brand.json</a> · <a href="https://www.nodexeus.com" target="_blank" rel="noopener noreferrer">nodexeus.com</a></span>
  </div>
</footer>
</body>
</html>
```

- [ ] **Step 2: Verify every brand.json hex value appears in this file**

```bash
for hex in "#050506" "#fafafa" "#a4a4ac" "#ffffff" "#f4f4f5" "#71717b" "#e4e4e7" "#fdc700" "#dfa800" "#ffd230" "#fe9a00" "#e17100" "#bb4d00" "#973c00" "#e7000b"; do
  grep -qi "$hex" color.html && echo "found: $hex" || echo "MISSING: $hex"
done
```
Expected: `found:` for all 15 values, no `MISSING:` lines.

- [ ] **Step 3: Verify by rendering in the browser**

```bash
B="/Users/caleb/.claude/skills/gstack/browse/dist/browse"
$B goto "file://$(pwd)/color.html"
$B console
$B screenshot /tmp/color-render.png
```
Read `/tmp/color-render.png`. Expected: four labeled swatch groups,
correct colors, hex labels legible.

- [ ] **Step 4: Commit**

```bash
git add color.html
git commit -m "feat: add color.html brand page (#7)"
```

---

## Task 7: type.html

Issue: https://github.com/nodexeus/brand-kit/issues/8

**Files:**
- Create: `type.html`

**Interfaces:**
- Consumes: `.type-sample` class from Task 4.

- [ ] **Step 1: Write type.html**

Create `type.html` (header/footer as before, "Type" nav link gets
`aria-current="page"`):

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Type — Nodexeus Brand Kit</title>
<link rel="icon" href="assets/logo/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="site-header">
  <div class="container">
    <a class="brand" href="index.html">
      <img src="assets/logo/mark-amber-on-dark.svg" width="24" height="24" alt="" aria-hidden="true">
      <span>Nodexeus Brand Kit</span>
    </a>
    <nav>
      <a href="index.html">Overview</a>
      <a href="logo.html">Logo</a>
      <a href="color.html">Color</a>
      <a href="type.html" aria-current="page">Type</a>
      <a href="voice.html">Voice</a>
      <a href="social.html">Social</a>
    </nav>
  </div>
</header>
<main>
  <div class="container">
    <span class="badge">Type</span>
    <h1>Typeface</h1>
    <div class="prose">
      <p>Two families: GeistSans for UI, headings, and body copy; GeistMono for anything technical or data-shaped — status displays, code, hex values. This kit doesn't vendor the actual font files (no build step, no font licensing to manage here); pages fall back to the system sans/mono stack. Get the real fonts from <a href="https://github.com/vercel/geist-font" target="_blank" rel="noopener noreferrer">vercel/geist-font</a> if you need pixel-accurate rendering.</p>
    </div>

    <h2>GeistSans</h2>
    <div class="type-sample">
      <span class="label">Heading / 800</span>
      <div style="font-family: var(--font-sans); font-weight: 800; font-size: 2rem; letter-spacing: -0.02em;">Infrastructure and intelligence. Built around your business.</div>
    </div>
    <div class="type-sample">
      <span class="label">Body / 400</span>
      <div style="font-family: var(--font-sans); font-weight: 400; font-size: 1rem;">Nodexeus builds and operates blockchain nodes, AI agent platforms and the web3 software around them.</div>
    </div>
    <div class="type-sample">
      <span class="label">Label / 600, uppercase</span>
      <div style="font-family: var(--font-sans); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em;">Blockchain · AI · Web3</div>
    </div>

    <h2>GeistMono</h2>
    <div class="type-sample">
      <span class="label">Status display</span>
      <div class="mono" style="font-size: 0.875rem;">eth-mainnet-01&nbsp;&nbsp;&nbsp;synced<br>base-mainnet-01&nbsp;&nbsp;syncing 98%</div>
    </div>
    <div class="type-sample">
      <span class="label">Hex / code</span>
      <div class="mono" style="font-size: 0.875rem;">--primary: #fdc700;</div>
    </div>

    <h2>Usage</h2>
    <div class="prose">
      <ul>
        <li>GeistSans for all UI copy: headings, body, buttons, nav.</li>
        <li>GeistMono for anything technical: status/data displays, code, config, hex or numeric values called out for precision.</li>
        <li>Default weight 400 for body text; 600-800 for headings and emphasis, never for full paragraphs.</li>
      </ul>
    </div>
  </div>
</main>
<footer class="site-footer">
  <div class="container">
    <span>© 2026 Nodexeus Technologies</span>
    <span><a href="brand.json">brand.json</a> · <a href="https://www.nodexeus.com" target="_blank" rel="noopener noreferrer">nodexeus.com</a></span>
  </div>
</footer>
</body>
</html>
```

- [ ] **Step 2: Verify by rendering in the browser**

```bash
B="/Users/caleb/.claude/skills/gstack/browse/dist/browse"
$B goto "file://$(pwd)/type.html"
$B console
$B screenshot /tmp/type-render.png
```
Read `/tmp/type-render.png`. Expected: heading/body/label samples and
mono samples rendered, legible, no layout overflow.

- [ ] **Step 3: Commit**

```bash
git add type.html
git commit -m "feat: add type.html brand page (#8)"
```

---

## Task 8: voice.html

Issue: https://github.com/nodexeus/brand-kit/issues/9

**Files:**
- Create: `voice.html`

**Interfaces:**
- Consumes: `.do-dont-grid`, `.quote` classes from Task 4.

- [ ] **Step 1: Write voice.html**

Create `voice.html` (header/footer as before, "Voice" nav link gets
`aria-current="page"`):

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Voice — Nodexeus Brand Kit</title>
<link rel="icon" href="assets/logo/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="site-header">
  <div class="container">
    <a class="brand" href="index.html">
      <img src="assets/logo/mark-amber-on-dark.svg" width="24" height="24" alt="" aria-hidden="true">
      <span>Nodexeus Brand Kit</span>
    </a>
    <nav>
      <a href="index.html">Overview</a>
      <a href="logo.html">Logo</a>
      <a href="color.html">Color</a>
      <a href="type.html">Type</a>
      <a href="voice.html" aria-current="page">Voice</a>
      <a href="social.html">Social</a>
    </nav>
  </div>
</header>
<main>
  <div class="container">
    <span class="badge">Voice</span>
    <h1>How Nodexeus sounds</h1>
    <div class="prose">
      <p>Engineer-to-engineer, not marketing-to-buyer. Specific beats vague. State limits honestly instead of overselling. Short, declarative sentences over hedged ones.</p>
    </div>

    <h2>In their own words</h2>
    <blockquote class="quote">"Infrastructure and intelligence. Built around your business."</blockquote>
    <blockquote class="quote">"Anyone can rent you a server. The work is everything after: watching sync state, catching a peer set going bad at 3am, upgrading a client the week a fork lands, and knowing which of those needs you woken up."</blockquote>
    <blockquote class="quote">"If we keep it, we are on call for it. If you take it, you get the runbooks, the monitoring and the access — not a tarball and good luck."</blockquote>
    <blockquote class="quote">"We do not publish a blanket uptime guarantee, because one that covers every network and every hardware configuration would be worth nothing."</blockquote>

    <h2>Vocabulary</h2>
    <div class="do-dont-grid">
      <div class="do">
        <h3>Do</h3>
        <div class="prose">
          <ul>
            <li>run, operate, ship, watch, catch, respond</li>
            <li>specific numbers and specific failure modes</li>
            <li>plain admissions of what something doesn't cover</li>
          </ul>
        </div>
      </div>
      <div class="dont">
        <h3>Don't</h3>
        <div class="prose">
          <ul>
            <li>synergy, seamless, cutting-edge, revolutionize, unlock, empower</li>
            <li>exclamation points doing the work a specific claim should do</li>
            <li>emoji stacking</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</main>
<footer class="site-footer">
  <div class="container">
    <span>© 2026 Nodexeus Technologies</span>
    <span><a href="brand.json">brand.json</a> · <a href="https://www.nodexeus.com" target="_blank" rel="noopener noreferrer">nodexeus.com</a></span>
  </div>
</footer>
</body>
</html>
```

- [ ] **Step 2: Verify by rendering in the browser**

```bash
B="/Users/caleb/.claude/skills/gstack/browse/dist/browse"
$B goto "file://$(pwd)/voice.html"
$B console
$B screenshot /tmp/voice-render.png
```
Read `/tmp/voice-render.png`. Expected: quotes rendered with amber
left border, do/dont two-column grid legible.

- [ ] **Step 3: Commit**

```bash
git add voice.html
git commit -m "feat: add voice.html brand page (#9)"
```

---

## Task 9: social.html

Issue: https://github.com/nodexeus/brand-kit/issues/10

**Files:**
- Create: `social.html`

**Interfaces:**
- Consumes: `.post-card`, `.prose` classes from Task 4. Content must
  match `brand.json.socialContentPillars`, `.socialConventions`,
  `.examplePosts`, and `.visualCardRules` (same source values, hand
  copied — no runtime fetch, per the spec's chosen approach).

- [ ] **Step 1: Write social.html**

Create `social.html` (header/footer as before, "Social" nav link gets
`aria-current="page"`):

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Social — Nodexeus Brand Kit</title>
<link rel="icon" href="assets/logo/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="site-header">
  <div class="container">
    <a class="brand" href="index.html">
      <img src="assets/logo/mark-amber-on-dark.svg" width="24" height="24" alt="" aria-hidden="true">
      <span>Nodexeus Brand Kit</span>
    </a>
    <nav>
      <a href="index.html">Overview</a>
      <a href="logo.html">Logo</a>
      <a href="color.html">Color</a>
      <a href="type.html">Type</a>
      <a href="voice.html">Voice</a>
      <a href="social.html" aria-current="page">Social</a>
    </nav>
  </div>
</header>
<main>
  <div class="container">
    <span class="badge">Social</span>
    <h1>Guidance for on-brand posts</h1>
    <div class="prose">
      <p>This page mirrors <a href="brand.json"><code class="mono">brand.json</code></a> — anything generating posts on Nodexeus's behalf should read that file directly rather than scraping this page.</p>
    </div>

    <h2>Content pillars</h2>
    <div class="prose">
      <ul>
        <li>Network/client upgrades and fork readiness</li>
        <li>Uptime and incident transparency (what broke, what we did)</li>
        <li>New network support / infra launches</li>
        <li>AI agent and web3 engineering work in production</li>
        <li>Plain-spoken infra/industry commentary</li>
      </ul>
    </div>

    <h2>Conventions</h2>
    <div class="prose">
      <ul>
        <li><strong>Hashtags:</strong> sparingly, only when naming a network or event.</li>
        <li><strong>Emoji:</strong> none, or a single one at most.</li>
        <li><strong>Length:</strong> 1-3 short sentences; threads only when reporting a real incident or upgrade in steps.</li>
        <li><strong>Call to action:</strong> specific and low-pressure (e.g. "ask us what that costs"), never hype-driven.</li>
      </ul>
    </div>

    <h2>On-brand examples</h2>
    <div class="post-card">Base client update landed this week. We're on it across every base-mainnet node we run — no action needed if that's us.</div>
    <div class="post-card">Uptime numbers only mean something next to the incident that tested them. Ask us about the fork we caught at 3am last month.</div>
    <div class="post-card">New: private RPC endpoints for Solana, same operating model as our Ethereum fleet. Talk to an engineer if you're evaluating providers.</div>

    <h2>Off-brand examples</h2>
    <div class="post-card off-brand">
      🚀🚀 Revolutionizing Web3 infrastructure with our CUTTING-EDGE platform!! #blockchain #AI #web3 #innovation #disrupt
      <div class="reason">Why it's off-brand: hype language, emoji stacking, and hashtag stuffing — the voice guide explicitly avoids all three.</div>
    </div>
    <div class="post-card off-brand">
      We guarantee 99.999% uptime on every network, no exceptions!
      <div class="reason">Why it's off-brand: the brand explicitly refuses blanket uptime guarantees — this contradicts stated positioning.</div>
    </div>

    <h2>Visual card rules</h2>
    <div class="prose">
      <ul>
        <li><strong>Background:</strong> ink (#050506) or white — no gradients beyond the existing chart scale.</li>
        <li><strong>Logo placement:</strong> top-left or centered, minimum clearspace = 1x icon height.</li>
        <li><strong>Typography:</strong> GeistSans for headline text on cards.</li>
        <li><strong>Accent:</strong> amber (#fdc700) for at most one focal element per card.</li>
      </ul>
    </div>
  </div>
</main>
<footer class="site-footer">
  <div class="container">
    <span>© 2026 Nodexeus Technologies</span>
    <span><a href="brand.json">brand.json</a> · <a href="https://www.nodexeus.com" target="_blank" rel="noopener noreferrer">nodexeus.com</a></span>
  </div>
</footer>
</body>
</html>
```

- [ ] **Step 2: Verify by rendering in the browser**

```bash
B="/Users/caleb/.claude/skills/gstack/browse/dist/browse"
$B goto "file://$(pwd)/social.html"
$B console
$B screenshot /tmp/social-render.png
```
Read `/tmp/social-render.png`. Expected: pillars/conventions lists,
three amber-bordered on-brand post cards, two red-bordered off-brand
cards with reasons, visual card rules list.

- [ ] **Step 3: Commit**

```bash
git add social.html
git commit -m "feat: add social.html brand page (#10)"
```

---

## Task 10: Final verification pass

Issue: https://github.com/nodexeus/brand-kit/issues/11

**Files:**
- No new files expected. Fix any files above if issues are found.

**Interfaces:**
- Consumes: everything produced by Tasks 1-9.

- [ ] **Step 1: Run the full test suite**

Run: `node --test scripts/`
Expected: PASS, all tests from Tasks 1-2 green.

- [ ] **Step 2: Run the consistency CLI for real**

Run: `node scripts/check-brand.mjs`
Expected: `Brand consistency checks passed.`, exit code 0. If it fails,
fix the reported file (missing asset path or missing hex in
`color.html`) and re-run until it passes.

- [ ] **Step 3: Render every page and check for console errors**

```bash
B="/Users/caleb/.claude/skills/gstack/browse/dist/browse"
for page in index logo color type voice social; do
  $B goto "file://$(pwd)/$page.html"
  echo "== $page =="
  $B console --errors
done
```
Expected: no output under any `== page ==` heading (no console
errors on any page).

- [ ] **Step 4: Check every internal link resolves**

```bash
B="/Users/caleb/.claude/skills/gstack/browse/dist/browse"
for page in index logo color type voice social; do
  $B goto "file://$(pwd)/$page.html"
  $B links
done
```
Manually confirm every listed link target is one of: `index.html`,
`logo.html`, `color.html`, `type.html`, `voice.html`, `social.html`,
`brand.json`, or `https://www.nodexeus.com`. Fix any that don't match
(typo'd filename, wrong relative path) and re-run this step.

- [ ] **Step 5: Full-page visual pass**

```bash
B="/Users/caleb/.claude/skills/gstack/browse/dist/browse"
for page in index logo color type voice social; do
  $B goto "file://$(pwd)/$page.html"
  $B screenshot "/tmp/final-$page.png"
done
```
Read each `/tmp/final-*.png` with the Read tool. Confirm every page
matches its task's intended layout, no broken images, no visually
obvious overflow/clipping.

- [ ] **Step 6: Commit any fixes**

If Steps 2-5 required changes:
```bash
git add -A
git commit -m "fix: resolve brand kit consistency/link issues found in verification (#11)"
```
If no changes were needed, skip this step (nothing to commit).

- [ ] **Step 7: Close out tracking**

Comment on issue #11 confirming the verification results (test suite
output, check-brand.mjs output, pages rendered). Close issues #2-#11
individually as their work is verified complete, then check every box
in the parent issue #1 checklist and close #1.
