# QuickKit — Full QA Audit & Fix Report (13 Oct 2026)

Method: inspected all source files, ran the production build in headless Chromium (Playwright),
tested 11 pages × 8 viewport widths (320/375/390/430/768/1024/1280/1440), exercised 35 functional
user flows, screenshotted both themes, and unit-tested the calculation logic. Every issue below was
fixed in code and re-tested. Branding, routes and features were preserved — no rebuild.

## 1. Files changed

| File | Change |
|---|---|
| `src/hooks.ts` | Router now parses pathname and query separately (category deep-links no longer 404); SEO meta helper rewritten cleanly |
| `src/lib/logic.ts` *(new)* | All calculation logic extracted from components into pure, unit-testable functions |
| `src/tools.tsx` | Tools now call `logic.ts`; Unicode-aware casing; Unit Converter shows an invalid-input message |
| `src/index.css` | Header breakpoints fixed, mobile spacing/touch targets, responsive stat & unit grids, FAQ chevron state |
| `src/pages.tsx` | Removed hero search auto-focus (its dropdown opened on load and covered hero content) |
| `src/App.tsx` | Category filter reads the tracked query string |
| `vite.config.ts` | Now actually reads `VITE_BASE` (README previously contradicted the config) |
| `tests/run.mjs` *(new)* | 43 automated unit tests for the pure logic — `npm test` |
| `audit.mjs` *(new)* | Browser QA suite (overflow, console, 35 functional flows, screenshots) — `npm run test:qa` |
| `package.json` | Added `test` / `test:qa` scripts; `playwright-core` as devDependency (test tooling only) |

## 2. Design & responsive improvements

- **Header overflowed at 320px (all pages) and at 768px** — the logo + nav + search + buttons were
  wider than the screen, pushing the hamburger partly off-canvas. Fixed: nav/header-search collapse
  to the hamburger menu at ≤900px, the header "Explore tools" button hides on phones, gutters go
  20px → 16px, and header gaps tighten. Verified 0 overflowing elements at every width afterwards.
- **Stat grids were locked to 3 columns by inline styles**, crushing discount/word-count stats on
  phones. They now wrap 2-per-row on mobile.
- **Unit Converter row stayed 3-across on small screens** — now stacks vertically with a rotated swap button.
- **Hero search auto-opened its suggestion dropdown on page load** (auto-focus), covering the hero
  text in both themes. Removed; dropdown now opens when the user actually focuses/types.
- Favourite (★) button can no longer overlap card text; FAQ chevrons rotate when open; buttons and
  tabs now have ≥42px touch targets on mobile.

## 3. Functionality tested & fixed

Fixed during the audit:
- Category cards (`/tools?cat=…`) previously landed on the 404 page — router bug, fixed and verified.
- Word Counter showed "1 sec" reading time for empty text — now "0 sec".
- Percentage Calculator silently ignored invalid input in 5 of 6 fields — all now validate visibly.
- Yen prices rendered as ¥90.00 — currency formatting now uses `Intl.NumberFormat` (correct decimals per currency).
- Title/Sentence case corrupted non-English words (`élan` → `éLan`) because JS `\b\w` is ASCII-only —
  rewritten with Unicode letter classes (`\p{L}`); verified `élan, über` → `Élan, Über` in the browser.
- "Remove extra spaces" left a space after line breaks — fixed in the logic (caught by a unit test).
- Unit Converter gave no feedback for non-numeric input — now shows "Please enter a valid number."

Verified working (35/35 browser checks): theme toggle + persistence across reload, search (results,
keyboard Enter, empty state, Back button), percentage (incl. division-by-zero message, −25% decrease),
discount (0%, 100%, >100% rejected, stacked discounts), word counter (counts, clear), text formatter
(all transforms), date calculator (leap-year 60-day span, age), unit converter (100cm = 1m, −40°C = −40°F,
category switching, swap, invalid input), favourites add/persist, recents empty state, mobile menu
open + navigation. Math additionally covered by 43 unit tests (percentages, leap-day age, exact
conversion factors, Unicode casing, stacked-discount sequencing).

## 4. Tests & build — actual results

```
npm test            → ✓ All 43 logic tests passed
npm run typecheck   → clean (no TypeScript errors)
npm run build       → ✓ built (dist/index.html 1.6 kB, JS 211.7 kB / 66 kB gzip, CSS 12.4 kB)
npm run test:qa     → overflow issues: 0, console errors: 0, functional: 35/35 passed
                      (11 pages × 8 viewport widths, headless Chromium, production preview)
Route checks        → /, /tools, /tools?cat=…, every tool page, /about, /privacy, /contact → HTTP 200
Screenshots         → audit-screenshots/ (390px & 1440px home, 320px tool page, 768px directory — light + dark)
```

## 5. Remaining / not verified (honest list)

- **Not deployed** — build is verified locally and free-hosting configs (`_redirects`, `vercel.json`)
  are in place, but no public deployment was performed or claimed.
- Copy-to-clipboard buttons use the Clipboard API with a fallback; headless Chromium denies clipboard
  permission, so the *feedback label* was verified by code path, not by an automated click assertion.
- The Contact form intentionally opens the visitor's email app (`mailto:`) — there is no backend by
  design; the placeholder address `hello@example.com` must be replaced before launch (see README).
- Tested in Chromium (headless). Safari-specific quirks (e.g. date-input rendering) were not testable
  in this environment; inputs use native controls and UTC-normalised math to minimise that risk.
- Canonical domain defaults to `https://quickkit.pages.dev`; set `VITE_SITE_URL` / update
  `sitemap.xml` when a real domain is chosen.
