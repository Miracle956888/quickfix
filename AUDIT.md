# QuickKit — Design & Functionality Audit (13 Oct 2026)

Build after fixes: `npm run build` ✅ (TypeScript + Vite, no errors). All routes return HTTP 200 in preview.

## 🔴 Functionality errors found & fixed

1. **Category cards led to the 404 page.** `navigate('/tools?cat=Text Tools')` stored the whole string (query included) as the route path, so it matched no route. Fixed: the router now parses pathname and query separately (`usePath` returns `path` + `search`), and the category filter reads from the tracked search string. Verified: `/tools?cat=Text%20Tools` → 200 and filters correctly.
2. **Word Counter showed "1 sec" reading time for empty text.** The `Math.max(1, …)` clamp applied even at 0 words. Fixed: empty text now shows `0 sec`.
3. **Percentage Calculator only validated the first field.** Invalid input in the other five fields silently produced no result with no explanation. Fixed: every field now shows "Please enter a valid number."
4. **JPY (and other zero-decimal currencies) displayed with 2 decimals** (e.g. ¥90.00). Fixed: prices now use `Intl.NumberFormat` with the selected currency, so fraction digits are correct per currency.
5. **SEO meta helper was fragile** — meta elements created at runtime got malformed attributes. Rewrote `useSEO` to set/create `description`, `og:title`, `og:description`, `og:url` and canonical cleanly.
6. **README contradicted the build config** (it told users to set `VITE_BASE`, but `vite.config.ts` hard-coded `/`). Fixed: the config now actually reads `VITE_BASE` via `loadEnv`.

## 🟠 Design / responsive errors found & fixed

7. **Stat grids were locked to 3 columns by inline styles**, overriding the mobile media query — on phones, discount and word-count stats were squeezed into three cramped columns. Fixed: inline column locks removed; stats now go 2-per-row on ≤640px screens (odd last stat spans full width).
8. **Unit Converter row was locked to `1fr auto 1fr` by inline style** — value/swap/result stayed side-by-side on small phones. Fixed: dedicated `.unit-grid` class that stacks vertically on mobile, with the swap button rotated 90°.
9. **Favourite (★) button could overlap tool-card descriptions** on cards with longer text. Fixed: card text now reserves right-hand padding.
10. **Hero search in the mobile menu showed a redundant "Search" button** eating input width. Hidden in the mobile menu only (dropdown results still work).
11. **FAQ chevrons didn't indicate open state.** They now rotate 90° when a question is expanded.

## ✅ Checked — no errors found

- **Math (12/12 sanity checks pass):** 20% of 250 = 50; 50/200 = 25%; 80→100 = +25%; $120 @ 25% = save $30 / pay $90; stacked 20%+10% on $100 = $72; 1 mi = 1.609344 km; 100 °C = 212 °F; −40 °C = −40 °F; 70 kg ≈ 154.32 lb; leap-year Jan→Mar 2028 = 60 days vs 59 in 2027.
- **Routing/deep links:** `/`, `/tools`, query-string tools URL, `/tools/word-counter`, `/about`, `/privacy`, `/contact` all return 200 from the production preview; SPA fallback files (`_redirects`, `vercel.json`) present for static hosts.
- **Theme:** toggle persists to `localStorage`, pre-paint script prevents flash, CSS variables cover cards/inputs/menus in both themes.
- **Search:** live results, empty state, ↑/↓/Enter/Escape keyboard handling present in hero/header search.
- **localStorage features:** favourites + recents are device-only; recents empty state renders for first-time visitors.

## ⚠️ Known non-code items (intentional placeholders — see README)

- Contact email `hello@example.com` and canonical domain `quickkit.pages.dev` are placeholders to replace with real values before launch. These are documented, not bugs.
