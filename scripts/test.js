'use strict';
// Sanity tests: formulas vs known values, no broken internal links, no NaN/undefined in output.
const fs = require('fs');
const path = require('path');
const M = require('../src/math');
const H = require('../src/html');

let failures = 0;
function check(name, cond, detail = '') { if (cond) console.log(`ok   ${name}`); else { failures++; console.log(`FAIL ${name} ${detail}`); } }
const near = (a, b, tol = 0.01) => Math.abs(a - b) <= tol;

// ---- formulas (reference values from standard financial calculators)
check('mortgage $200k 6% 30y = $1,199.10', near(M.monthlyPayment(200000, 6, 360), 1199.10));
check('loan $10k 8% 3y = $313.36', near(M.monthlyPayment(10000, 8, 36), 313.36));
check('zero-rate loan = principal/n', near(M.monthlyPayment(1200, 0, 12), 100));
check('amortization total interest $200k 6% 30y ≈ $231,676', near(M.amortizationByYear(200000, 6, 360).totalInterest, 231676.38, 1));
check('FV lump $10k 7% 10y monthly ≈ $20,096.61', near(M.futureValueLump(10000, 7, 10), 20096.61, 0.05));
check('FV $500/mo 7% 30y ≈ $609,985', near(M.futureValueMonthly(500, 7, 30), 609985, 5));
check('FV $0/mo with initial = lump', near(M.futureValueMonthly(0, 5, 10, 1000), M.futureValueLump(1000, 5, 10)));
const dp = M.debtPayoff(5000, 24, 200);
check('debt $5k 24% $200/mo = 35 months', dp.months === 35, `got ${dp.months}`);
check('debt never pays when payment <= interest', M.debtPayoff(5000, 24, 100).neverPays === true);
check('goal $12k in 12 months at 0% = $1,000/mo', near(M.monthlyForGoal(12000, 0, 12), 1000));
check('goal with interest < without', M.monthlyForGoal(10000, 4, 24) < 10000 / 24);
check('hourly $20 -> $41,600', M.hourlyToAll(20).yearly === 41600);
check('salary $52,000 -> $25/h', near(M.salaryToHourly(52000), 25));
check('money format', M.money(1234.5) === '$1,234.50' && M.moneyWhole(1234.5) === '$1,235');
check('pct format', M.pct(6.5) === '6.5%' && M.pct(7) === '7%' && M.pct(3.25) === '3.25%');
check('slugNum', M.slugNum(6.5) === '6-5' && M.slugNum(7) === '7');
check('yearsMonths', M.yearsMonths(35) === '2 years and 11 months' && M.yearsMonths(12) === '1 year');

// ---- built output
const DIST = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(DIST)) { console.log('dist/ missing; run npm run build first'); process.exit(1); }
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (p.endsWith('.html')) files.push(p); } })(DIST);
check(`built ${files.length} html files (> 4000)`, files.length > 4000);

const base = H.basePath();
const exists = new Set(files.map(f => '/' + path.relative(DIST, f).split(path.sep).join('/')));
const bad = new Map(); let badCount = 0, links = 0, nanPages = 0, longTitles = 0, longDesc = 0;
const hrefRe = /href="([^"#?]+)/g;
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  if (/\bNaN\b|undefined|Infinity|\$—/.test(html.replace(/<script[\s\S]*?<\/script>/g, ''))) { nanPages++; if (nanPages <= 5) console.log('   suspicious content in', path.relative(DIST, f)); }
  const t = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  if (t.length > 70) longTitles++;
  const d = (html.match(/name="description" content="([^"]*)"/) || [])[1] || '';
  if (d.length > 170) longDesc++;
  let m;
  while ((m = hrefRe.exec(html))) {
    let href = m[1];
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    links++;
    if (base && href.startsWith(base + '/')) href = href.slice(base.length);
    const target = href.endsWith('/') ? href + 'index.html' : href;
    if (!exists.has(target) && !fs.existsSync(path.join(DIST, target))) { badCount++; if (!bad.has(href)) bad.set(href, path.relative(DIST, f)); }
  }
}
check(`no suspicious NaN/undefined content (${nanPages} pages)`, nanPages === 0);
check(`no broken internal links (${links.toLocaleString()} checked, ${badCount} broken, ${bad.size} unique)`, badCount === 0);
for (const [href, from] of [...bad.entries()].slice(0, 15)) console.log(`   broken: ${href}  (from ${from})`);
console.log(`info titles > 70 chars: ${longTitles}; descriptions > 170 chars: ${longDesc}`);

// sitemap
const sm = fs.readFileSync(path.join(DIST, 'sitemap-1.xml'), 'utf8');
const locs = sm.match(/<loc>[^<]+<\/loc>/g) || [];
check(`sitemap-1 has urls (${locs.length})`, locs.length > 1000);
check('robots.txt references sitemap', fs.readFileSync(path.join(DIST, 'robots.txt'), 'utf8').includes('Sitemap:'));

console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed');
process.exit(failures ? 1 : 0);
