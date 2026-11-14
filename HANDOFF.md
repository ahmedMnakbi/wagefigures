# HANDOFF: what was built, what it earns, and the few things only you can do

**Status (14 Nov 2026):** site built and tested locally (4,238 pages, all links valid). Deployment
status is at the bottom of this file. Weekly content job is registered in the Claude desktop app.

## What this is

WageFigures is a personal-finance calculator website. Twelve calculator families expand into about
4,200 pre-computed pages, each answering one specific search query ("$22 an hour is how much a
year", "$300,000 mortgage at 6.5% for 30 years", "pay off $5,000 at 24% paying $200 a month") with the
number, the working, tables, an interactive calculator and FAQ schema. Six long-form guides support
the calculators. The site is static, costs nothing to host, and needs no server or database.

It earns money two ways, both switched on from `site.config.json`:

1. **Display ads (Google AdSense).** Finance is one of the highest-paying ad niches. Realistic
   planning figures for a US-heavy finance site are $8–25 per 1,000 pageviews.
2. **Affiliate links.** Labelled call-to-action boxes per family (loan rates, mortgage lenders,
   high-yield savings, balance-transfer cards, brokerages). These pay far more per visitor than
   ads, but programs only accept sites with some traffic, so they come second.

## Honest expectations

- **$100 a month** at a $10 RPM is about 10,000 pageviews a month, or roughly 330 visits a day across
  4,200 pages. That is 1 visit per page every 13 days. Established sites of this type do far more;
  new ones start at zero.
- **New sites take time.** Typical pattern: Google indexes most pages within 4–8 weeks, long-tail
  rankings appear from month 2–3, and traffic compounds from month 4–9 as pages age and the guides
  accumulate. AdSense approval itself usually takes 1–3 weeks after the domain is live.
- **It is not guaranteed.** Programmatic sites that are thin get filtered out. This one is built to
  avoid that (every page has unique computed content, tables, FAQ and a working calculator; the
  guides add depth), but Google decides. Treat $100/month at month 6–12 as the realistic target,
  with the upside that the same asset can grow well beyond it with more families and guides.
- **Zero running cost** except the domain (about $10 a year). No hosting fees ever.

## The one-time tasks only you can do (about 30 minutes, about $10)

Accounts, payments and identity verification cannot be done for you. Everything else is automated.

### 1. Put the site online (5 minutes, free)

If the status at the bottom says "deployed", skip this. Otherwise, in a terminal:

```bash
gh auth login
```

Choose GitHub.com → HTTPS → Login with a web browser, and finish in the browser. Then:

```bash
cd C:\Users\ahmed\Desktop\Side_job
npm run deploy
```

This creates the public repo `wagefigures` under your GitHub account, enables GitHub Pages, pushes,
and prints the live URL (`https://<your-user>.github.io/wagefigures/`). Every later push redeploys
automatically through GitHub Actions.

### 2. Buy the domain (5 minutes, about $10 a year)

AdSense rejects free `github.io` addresses, so a domain is required. **wagefigures.com** was
unregistered on 14 Nov 2026. Alternatives that were also free: salarysums.com, wagenumbers.com,
quickmoneymath.com, paymathhub.com, sumsalary.com. Porkbun, Cloudflare Registrar or Namecheap are
all fine.

Then set DNS at the registrar:

| Type | Name | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | `<your-github-user>.github.io` |

Edit `site.config.json`: set `"domain": "wagefigures.com"` and `"contactEmail"` to an address
you check. Run `npm run deploy` again. It writes the CNAME file, points GitHub Pages at the domain
and turns on HTTPS (certificate issuance can take up to an hour).

### 3. Google Search Console (5 minutes, free)

Go to search.google.com/search-console, add a **Domain** property for your domain, verify with the
DNS TXT record it gives you, then under Sitemaps submit `sitemap.xml`. This is how Google finds the
4,200 pages quickly and how you will see what ranks. Also submit the sitemap at
bing.com/webmasters (Bing powers DuckDuckGo and others).

### 4. Google AdSense (10 minutes, then wait 1–3 weeks)

Apply at adsense.google.com with the domain. You must be 18+ and give a payment address. When the
dashboard shows your publisher ID (`ca-pub-XXXXXXXXXXXXXXXX`), paste it into `site.config.json`
under `adsense.publisherId` and run `npm run deploy`. The build then adds the AdSense script to
every page and writes the `ads.txt` file Google requires. Leave `slots` empty: Auto Ads places
units for you. Payouts begin once earnings reach $100; payment methods depend on your country.

If AdSense asks for changes (it sometimes cites "low value content" for new sites), the usual fix
is to wait until more pages are indexed and the guide count is higher, then reapply. The weekly job
keeps adding guides.

### 5. Affiliate programs (optional, later)

Once the site has a few thousand monthly visits, apply to networks that carry finance offers:
FlexOffers, CJ (Commission Junction), Impact and Awin. Products that match the page families:
personal and auto loan marketplaces (loan, car pages), mortgage lenders (mortgage, down-payment
pages), high-yield savings accounts (savings-goal pages), balance-transfer cards (debt pages),
brokerages (investing pages), budgeting apps (salary pages). Paste each tracking link into the
matching entry in `site.config.json` → `affiliate`, set `"enabled": true`, deploy. The boxes are
already written and labelled as sponsored.

### 6. Analytics (optional)

Create a GA4 property at analytics.google.com, paste the `G-XXXXXXXXXX` ID into
`analytics.ga4MeasurementId`, deploy.

## What runs without you

- **GitHub Actions** rebuilds and publishes the site on every push.
- **Weekly guide job** (Claude desktop app → Scheduled → "WageFigures: weekly guide article", Mondays
  09:01, saved in Bypass permissions mode). It writes one new 800–1,200 word guide, builds, runs the
  tests, commits and pushes. It runs only while the Claude app is open; a missed run fires at the next
  launch. You can edit its schedule or prompt in the app.
- **Nothing else needs attention.** Check Search Console once a month to watch impressions grow.

## If traffic is slow after 3 months

Levers, in order of effort:

1. Add more values to the grids in `src/families/grids.js` (more hourly rates, more loan amounts).
   Pages appear on the next build and the test catches any broken links.
2. Add a new family in `src/families/` (ideas: biweekly mortgage, rent-to-income, tip/take-home by
   state, CD and savings APY growth, inflation-adjusted salary).
3. Change the weekly job to run twice a week.
4. Get a few links: answer relevant questions on forums with a link to the exact page that answers
   them, list the site in free calculator/tool directories.

## Files you may touch

- `site.config.json`: every identifier and monetization switch. Rebuild/deploy after editing.
- `content/guides/*.md`: articles. Frontmatter format is in README.md.
- Everything else is generator code; README.md explains the layout.

## Deployment status

_Updated by Claude at the end of the build session. See the final line below._
