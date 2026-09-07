# Nodexeus Brand Kit — Design Spec

## Summary

A static, dependency-free brand kit for Nodexeus Technologies: a small
reference site (logo, color, type, voice, social guidance) plus a
machine-readable `brand.json` that a future social-media bot (built on
the Blotato MCP server) can read to generate on-brand text posts and
visual cards. All values are sourced from the live site
(https://www.nodexeus.com) as of 2026-08-26, not invented.

## Why

The user is building a social media bot (via Blotato MCP) that posts on
Nodexeus's behalf. For that content to feel on-brand, both a human
reference and a structured spec are needed. There is no existing brand
documentation anywhere else — the live site is the sole source of
truth.

## Non-goals

- No new brand strategy, positioning, or messaging invention — this
  documents what already exists on nodexeus.com, not a rebrand.
- No build tooling (no Next.js/Astro/bundler). Content changes rarely
  and doesn't warrant a pipeline.
- No actual bot/Blotato integration code — out of scope for this repo.
  `brand.json` is shaped so a future bot project can consume it, but
  wiring that up is separate work.
- No deployment/hosting setup — user deploys this themselves.

## Source material (extracted from nodexeus.com)

**Copy / positioning**
- Name: Nodexeus Technologies
- Tagline: "Infrastructure and intelligence. Built around your business."
- One-line description: "Nodexeus builds and operates blockchain
  nodes, AI agent platforms and the web3 software around them."
- Stats: 99.99% uptime target, 20+ networks run, <1 hr deploy time
- Four service lines: Blockchain infrastructure, AI agent development
  and hosting, Web3 and dApp engineering, Managed infrastructure
  hosting
- Networks run: Ethereum, Base, Arbitrum, Optimism, Solana, Polygon,
  Avalanche, Cosmos (+ more on request)

**Voice signal (direct quotes to calibrate tone)**
- "Infrastructure and intelligence. Built around your business."
- "Anyone can rent you a server. The work is everything after: watching
  sync state, catching a peer set going bad at 3am, upgrading a client
  the week a fork lands, and knowing which of those needs you woken
  up."
- "If we keep it, we are on call for it. If you take it, you get the
  runbooks, the monitoring and the access — not a tarball and good
  luck."
- "We do not publish a blanket uptime guarantee, because one that
  covers every network and every hardware configuration would be
  worth nothing."
- "Ask us what we actually achieved on a network you care about. That
  is a more useful question than any figure we could print here."

Reads as: engineer-to-engineer, plain-spoken, specific over vague,
openly skeptical of marketing puffery, comfortable stating limits.

**Colors** (converted from the site's computed LAB values to sRGB hex)
| Token | Hex | Role |
|---|---|---|
| `ink` | `#111114` | primary dark background |
| `ink-foreground` | `#fafafa` | text/icons on dark |
| `ink-muted` | `#a4a4ac` | secondary text on dark |
| `white` / `card` | `#ffffff` | light surface |
| `muted` | `#f4f4f5` | light secondary surface |
| `muted-foreground` | `#71717b` | secondary text on light |
| `border` | `#e4e4e7` | hairlines on light |
| `primary` (amber) | `#fdc700` | primary CTA / accent |
| `amber-deep` | `#dfa800` | large accent fills (e.g. CTA band) |
| chart scale | `#ffd230` `#fe9a00` `#e17100` `#bb4d00` `#973c00` | data viz / illustration accents |
| `destructive` | `#e7000b` | error/destructive states |

Site is dark-mode-first (default) with a light mode toggle; both
pairings are documented.

**Type**
- `--font-sans`: "GeistSans" (headings + body)
- `--font-mono`: "GeistMono" (technical/data displays, e.g. the fleet
  status panel)
- Both are Vercel's open-source Geist font family.

**Logo**
- Current mark: an amber rounded-square badge containing a black
  arch/"n" glyph, paired with the "Nodexeus" wordmark in the nav.
- The only exported asset (`/assets/n.svg`) is a raster PNG wrapped in
  an SVG shell — not a usable vector. This kit recreates it.

## Approach

Plain static HTML/CSS, no build step, plus one hand-authored
`brand.json`. Rejected alternative: Astro/Next.js — nicer templating,
but unnecessary weight for a handful of rarely-changing reference
pages. The HTML pages and `brand.json` are maintained by hand in
parallel (not templated from one another) since the content set is
small and duplication risk is low; if either changes, both are updated
in the same commit.

## Site structure

```
/
├── index.html          overview, logo, tagline, nav into other pages
├── logo.html           logomark, wordmark lockups, clearspace,
│                       minimum size, color variants, misuse, favicon
├── color.html          full palette with hex/usage roles, light+dark
├── type.html           Geist Sans/Mono specimens and usage rules
├── voice.html          tone principles, do/don't vocabulary, real
│                       example copy
├── social.html         content pillars, post conventions (length,
│                       hashtags, emoji), on-brand vs off-brand
│                       example posts, visual-card rules for bot-
│                       generated graphics
├── brand.json          machine-readable spec (see schema below)
├── assets/
│   ├── logo/
│   │   ├── mark-amber-on-dark.svg
│   │   ├── mark-black-on-light.svg
│   │   ├── mark-mono.svg
│   │   ├── wordmark-lockup-dark.svg
│   │   ├── wordmark-lockup-light.svg
│   │   └── favicon.svg (+ favicon.ico / png sizes as needed)
│   └── fonts/ (optional: Geist Sans/Mono if self-hosting is desired)
└── style.css           shared stylesheet (design tokens as CSS vars,
                         matching the hex values above)
```

Shared nav/footer via a tiny bit of hand-copied HTML per page (no
templating engine) — acceptable duplication for ~6 pages.

## `brand.json` schema

```json
{
  "name": "Nodexeus Technologies",
  "tagline": "Infrastructure and intelligence. Built around your business.",
  "description": "Nodexeus builds and operates blockchain nodes, AI agent platforms and the web3 software around them.",
  "website": "https://www.nodexeus.com",
  "colors": {
    "ink": "#111114",
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
    "avoid": ["synergy", "seamless", "cutting-edge", "revolutionize", "unlock", "empower", "excessive exclamation points", "emoji stacking"],
    "sampleQuotes": [
      "Infrastructure and intelligence. Built around your business.",
      "Anyone can rent you a server. The work is everything after.",
      "Not a tarball and good luck."
    ]
  },
  "socialContentPillars": [
    "network/client upgrades and fork readiness",
    "uptime and incident transparency (what broke, what we did)",
    "new network support / infra launches",
    "AI agent + web3 engineering work in production",
    "plain-spoken infra/industry commentary"
  ],
  "socialConventions": {
    "hashtags": "sparingly, only when naming a network or event",
    "emoji": "none, or a single one at most",
    "cta": "specific and low-pressure (e.g. 'ask us what that costs'), never hype-driven"
  },
  "examplePosts": {
    "onBrand": [
      "Example on-brand post text..."
    ],
    "offBrand": [
      "Example off-brand post text (with a one-line reason it's off-brand)..."
    ]
  },
  "visualCardRules": {
    "background": "ink (#111114) or white, no gradients beyond the existing chart scale",
    "logoPlacement": "top-left or centered, minimum clearspace = 1x icon height",
    "typography": "GeistSans for headline text on cards",
    "accentUsage": "amber (#fdc700) for at most one focal element per card"
  }
}
```

Exact wording for `sampleQuotes`, `examplePosts`, and the full
`socialConventions` prose will be finalized during implementation,
grounded in the real copy pulled above — not invented wholesale.

## Logo recreation

Use the `logo-designer` skill to redraw the arch/"n" mark as a clean
SVG, matching the existing icon's proportions and silhouette (rounded
arch/staple shape). Produce:
- Amber mark on dark background (primary)
- Black mark on light/white background
- Monochrome (single color, for contexts needing one ink color)
- A wordmark lockup (mark + "Nodexeus" in Geist Sans, matching nav
  spacing) in dark and light variants
- A simplified favicon

## Verification

- Render every HTML page via the `browse` skill in both light and
  dark mode; visually compare against the live nodexeus.com styling
  for consistency (not pixel-identical — this is a reference kit, not
  a clone).
- Validate `brand.json` parses (`python3 -m json.tool` or equivalent).
- Spot-check every hex value and font name in `brand.json` and
  `color.html`/`type.html` against the computed values pulled from
  nodexeus.com in this conversation, to catch transcription errors.
- Confirm internal links between pages resolve (no 404s when opened
  via `file://` or a local static server).
