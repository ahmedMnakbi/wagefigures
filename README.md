# WageFigures

A static personal-finance calculator website generated from code. Twelve calculator
families (hourly ↔ salary, raises, personal/car/mortgage loans, down payments,
compound interest, monthly investing, debt payoff, savings goals, retirement income)
expand into ~4,200 pre-computed, interlinked pages, each with an interactive
calculator, worked formula, FAQ schema and tables. Hosted free on GitHub Pages.

**For the money side (domain, AdSense, affiliate, what to expect) read [HANDOFF.md](HANDOFF.md).**

## Commands

```bash
npm install          # once
npm run build        # generates dist/ (≈20 s, ≈43 MB)
npm test             # formula checks + broken-link scan over dist/
npm run serve        # preview dist/ at http://localhost:8787/
npm run deploy       # create GitHub repo (if needed), enable Pages, push
```

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and publishes
to GitHub Pages. You never commit `dist/`.

## Layout

```
site.config.json      name, domain, GitHub user/repo, AdSense, GA4, affiliate CTAs
src/build.js          orchestrator: writes pages, sitemaps, robots.txt, ads.txt, CNAME
src/html.js           layout, nav, ads, CTA, FAQ/breadcrumb JSON-LD, calculator form
src/math.js           finance formulas + formatting (mirrored in static/calc.js)
src/pages.js          home, all-calculators, about, contact, privacy, terms, 404
src/guides.js         content/guides/*.md -> /guides/<slug>/
src/families/         one module per group of calculators
  grids.js            the value grids (which pages exist); families cross-link from these
  wages.js            hourly→salary, salary→hourly, raise
  loans.js            loan, car, mortgage, down payment
  growth.js           compound interest, monthly investing, debt payoff, savings goal, retirement
static/               style.css, calc.js (client-side calculators), favicon.svg
content/guides/       Markdown articles with frontmatter (title, description, date, calculators)
scripts/              deploy.js, serve.js, test.js
```

## Adding content

**A guide:** drop a Markdown file in `content/guides/` with frontmatter:

```
---
title: Should You Choose a 15-Year or 30-Year Mortgage?
description: One-sentence summary used in meta tags and cards.
date: 2026-11-21
calculators: [/mortgage-payment/, /down-payment/]
---
Body in Markdown. Root-relative links like /loan-payment/ are rewritten automatically.
```

**More calculator pages:** extend the arrays in `src/families/grids.js`. Every page
that links to a value must find it in a grid, so `npm test` will catch broken links.

**A new family:** copy the pattern in `src/families/growth.js` (a `page(...)` function,
a `hub()` function, and an export with `id`, `name`, `basePath`, `hub`, `pages()`),
register it in `src/families/index.js`, add a client calculator in `static/calc.js`.

## Monetization switches

All in `site.config.json`; nothing renders until a value is set:

- `adsense.publisherId` → loads Auto Ads on every page and writes `ads.txt`.
- `adsense.slots.inContent` → an explicit in-article ad unit under the answer box.
- `analytics.ga4MeasurementId` → Google Analytics 4.
- `affiliate.<family>.url` + `enabled: true` → a labelled sponsored call-to-action
  on that family's pages (`loan`, `car`, `mortgage`, `investing`, `savings`, `debt`, `salary`).

## Design notes

- Pages are intentionally self-contained (answer first, then the working) so they
  remain useful even when a search engine shows an AI summary above the result.
- No external JS or CSS dependencies; a page is ~10 KB and renders instantly.
- Dark mode follows the OS setting. Layout is mobile-first.
- Every programmatic page carries BreadcrumbList and FAQPage JSON-LD; guides carry Article.
- Figures are gross/pre-tax and each page states its assumptions and a disclaimer.
