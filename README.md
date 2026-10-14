# QuickKit — Everyday tools. Instant answers.

A fast, lightweight, **free** collection of everyday online tools: percentage calculator, discount calculator, word counter, text formatter, date calculator and unit converter.

Built with **React + TypeScript + Vite**, compiled to a fully static site. All calculations run locally in the browser — no backend, no database, no API keys, no sign-ups.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build for production

```bash
npm run build      # outputs dist/
npm run preview    # preview the production build
```

## Configure your domain (optional but recommended)

The default canonical domain is `https://quickkit.pages.dev`. To use your own:

1. Set the environment variable `VITE_SITE_URL=https://your-domain.example` at build time (in your host's dashboard), **or** edit `SITE_URL` in `src/data/tools.ts`.
2. Update the URLs in `public/sitemap.xml` and `public/robots.txt`, and the canonical link in `index.html`.
3. Replace the placeholder contact email `hello@example.com` in `src/pages.tsx` with your real address.

A custom domain is **not** free from a registrar, but every host below gives you a free subdomain (e.g. `quickkit.pages.dev`) — start there.

## Deploy for free

### Option A — Cloudflare Pages (recommended)
1. Push this folder to a GitHub/GitLab repo.
2. Cloudflare Dashboard → Pages → Create → connect the repo.
3. Build command: `npm run build` · Output directory: `dist`.
4. Deploy. `public/_redirects` is included so deep links like `/tools/word-counter` survive refreshes.

### Option B — Vercel
1. Import the repo at vercel.com/new. Framework preset: **Vite**.
2. Build `npm run build`, output `dist`. `vercel.json` (included) rewrites all routes to `index.html`.

### Option C — GitHub Pages
1. Build with a project base path: `VITE_BASE=/your-repo-name/ npm run build`
2. Publish the `dist/` folder (e.g. with the `gh-pages` branch or GitHub Actions `actions/deploy-pages`).
3. Note: GitHub Pages has no server rewrites; add a `404.html` copy of `index.html` if you need refresh-safe deep links (`cp dist/index.html dist/404.html` after build).

### Option D — Netlify
Drag the `dist/` folder into Netlify Drop, or connect the repo (build `npm run build`, publish `dist`). `public/_redirects` handles SPA routing.

## Project structure

```
src/
  data/tools.ts     Tool catalogue: names, descriptions, categories, keywords, FAQs, copy
  hooks.ts          Theme, localStorage lists, router, per-page SEO
  components.tsx    Header, footer, search, tool cards, FAQ
  tools.tsx         The six tool implementations (pure client-side logic)
  pages.tsx         Home, directory, tool page shell, About, Privacy, Contact, 404
  App.tsx           Routing + page metadata
  index.css         Design system (light + dark via CSS variables)
public/             favicon, robots.txt, sitemap.xml, _redirects (SPA fallback)
```

## Features

- Light/dark theme, persisted, respects OS preference, no flash on load
- Live tool search (name, category, keywords) with keyboard navigation
- Favourites & recently-used tools in `localStorage` only
- Per-page titles, meta descriptions, canonical & Open Graph tags, JSON-LD, sitemap, robots.txt
- Fully keyboard-accessible, responsive, reduced-motion friendly

## Licence

MIT — use it, fork it, ship it.
