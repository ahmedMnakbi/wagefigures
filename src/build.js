'use strict';
// Static site builder: node src/build.js  ->  dist/
const fs = require('fs');
const path = require('path');
const t0 = Date.now();

const H = require('./html');
const families = require('./families');
const P = require('./pages');
const Gd = require('./guides');
const { cfg, abs } = H;

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const STATIC = path.join(ROOT, 'static');

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
for (const f of fs.readdirSync(STATIC)) fs.copyFileSync(path.join(STATIC, f), path.join(DIST, f));

const urls = [];
let bytes = 0, pages = 0;
const today = new Date().toISOString().slice(0, 10);

function write(page, priority) {
  const html = H.layout(page);
  const rel = page.path.endsWith('/') ? page.path + 'index.html' : page.path;
  const file = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  bytes += Buffer.byteLength(html);
  pages++;
  if (!page.noindex) urls.push({ loc: abs(page.path), priority, lastmod: today });
}

// Families
const counts = {};
for (const f of families) {
  write(f.hub(), 0.8);
  let n = 0;
  for (const pg of f.pages()) { write(pg, 0.5); n++; }
  counts[f.id] = n;
}

// Guides
const guides = Gd.loadGuides();
for (const g of guides) write(Gd.guidePage(g, families), 0.6);
write(Gd.guidesIndex(guides), 0.7);

// Static pages
write(P.home(families, guides, counts), 1.0);
write(P.allCalculators(families, counts), 0.6);
write(P.about(), 0.3);
write(P.contact(), 0.3);
write(P.privacy(), 0.2);
write(P.terms(), 0.2);
write(P.notFound(families), 0);

// Sitemaps (max 10,000 URLs each, well under the 50k/50MB limits)
const CHUNK = 10000;
const smFiles = [];
for (let i = 0; i < urls.length; i += CHUNK) {
  const name = `sitemap-${smFiles.length + 1}.xml`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.slice(i, i + CHUNK).map(u => `<url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.priority.toFixed(1)}</priority></url>`).join('\n')}\n</urlset>\n`;
  fs.writeFileSync(path.join(DIST, name), xml);
  smFiles.push(name);
}
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${smFiles.map(n => `<sitemap><loc>${abs('/' + n)}</loc><lastmod>${today}</lastmod></sitemap>`).join('\n')}\n</sitemapindex>\n`);

fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`);
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');
if (cfg.domain) fs.writeFileSync(path.join(DIST, 'CNAME'), cfg.domain + '\n');
if (cfg.adsense && cfg.adsense.publisherId) {
  const pub = cfg.adsense.publisherId.replace(/^ca-/, '');
  fs.writeFileSync(path.join(DIST, 'ads.txt'), `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`);
}

const secs = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`Built ${pages.toLocaleString()} pages (${(bytes / 1048576).toFixed(1)} MB) in ${secs}s -> ${DIST}`);
console.log(`Base URL: ${H.baseUrl()}${cfg.domain ? '' : '  (no domain set yet)'}`);
console.log('Per family:', counts);
console.log(`Guides: ${guides.length}; AdSense: ${cfg.adsense.publisherId ? 'ON' : 'off (publisherId empty)'}; GA4: ${cfg.analytics.ga4MeasurementId ? 'ON' : 'off'}`);
