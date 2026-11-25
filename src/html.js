'use strict';
// Layout, navigation, ads, CTA, FAQ and JSON-LD helpers used by every page.

const path = require('path');
const cfg = require(path.join(__dirname, '..', 'site.config.json'));

function basePath() {
  if (cfg.domain) return '';
  if (cfg.githubUser && cfg.githubRepo && cfg.githubRepo !== `${cfg.githubUser}.github.io`) return `/${cfg.githubRepo}`;
  return '';
}
function baseUrl() {
  if (cfg.domain) return `https://${cfg.domain}`;
  if (cfg.githubUser) return `https://${cfg.githubUser.toLowerCase()}.github.io${basePath()}`;
  return 'https://example.com';
}
/** Internal link helper: url('/loan-payment/') -> '/repo/loan-payment/' on project pages. */
function url(p) { return basePath() + p; }
function abs(p) { return baseUrl() + p; }

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const NAV = [
  ['/hourly-to-salary/', 'Hourly → Salary'],
  ['/loan-payment/', 'Loans'],
  ['/mortgage-payment/', 'Mortgage'],
  ['/monthly-investing/', 'Investing'],
  ['/debt-payoff/', 'Debt'],
  ['/guides/', 'Guides'],
];

function adsenseHead() {
  const id = cfg.adsense && cfg.adsense.publisherId;
  if (!id) return '';
  return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(id)}" crossorigin="anonymous"></script>`;
}
function adUnit(slotKey) {
  const id = cfg.adsense && cfg.adsense.publisherId;
  const slot = cfg.adsense && cfg.adsense.slots && cfg.adsense.slots[slotKey];
  if (!id || !slot) return '';
  return `<div class="ad"><ins class="adsbygoogle" style="display:block" data-ad-client="${esc(id)}" data-ad-slot="${esc(slot)}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>`;
}
function analyticsHead() {
  const id = cfg.analytics && cfg.analytics.ga4MeasurementId;
  if (!id) return '';
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(id)}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${esc(id)}');</script>`;
}

function ctaBox(family) {
  const a = cfg.affiliate || {};
  const c = (a[family] && a[family].enabled) ? a[family] : (a.default && a.default.enabled ? a.default : null);
  if (!c || !c.url) return '';
  return `<aside class="cta"><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p><a class="btn" href="${esc(c.url)}" rel="nofollow sponsored noopener" target="_blank">${esc(c.buttonText)}</a><p class="note">Sponsored link. We may earn a commission at no cost to you.</p></aside>`;
}

/** FAQ block + schema. items: [{q, a}] (a may contain simple HTML). */
function faq(items) {
  const html = `<section class="faq"><h2>Frequently asked questions</h2>${items.map(i => `<details><summary>${esc(i.q)}</summary><p>${i.a}</p></details>`).join('')}</section>`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: items.map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a.replace(/<[^>]+>/g, '') } })),
  };
  return { html, ld };
}

function breadcrumbs(items) {
  // items: [{name, path}] ; last is current page
  const html = `<nav class="crumbs" aria-label="Breadcrumb">${items.map((it, i) => i === items.length - 1 ? `<span>${esc(it.name)}</span>` : `<a href="${url(it.path)}">${esc(it.name)}</a> › `).join('')}</nav>`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
  };
  return { html, ld };
}

function relatedList(links) {
  if (!links.length) return '';
  return `<section><h2>Related calculations</h2><ul class="related">${links.map(l => `<li><a href="${url(l.path)}">${esc(l.text)}</a></li>`).join('')}</ul></section>`;
}

function stats(items) {
  return `<div class="grid">${items.map(s => `<div class="stat"><small>${esc(s.label)}</small><b>${esc(s.value)}</b></div>`).join('')}</div>`;
}

function table(headers, rows, opts = {}) {
  return `<div class="tscroll"><table>${opts.caption ? `<caption>${esc(opts.caption)}</caption>` : ''}<thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => `<td>${i === 0 ? esc(c) : esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

/**
 * Interactive calculator form. fields: [{name,label,value,step,min,max,type}]
 * calc.js picks it up by data-calc and renders into .out.
 */
function calcForm(kind, fields, title = 'Try your own numbers') {
  return `<section class="calc"><h2>${esc(title)}</h2><form data-calc="${esc(kind)}" onsubmit="return false"><div class="row">${fields.map(f => `<div><label for="f-${esc(f.name)}">${esc(f.label)}</label>${f.type === 'select'
    ? `<select id="f-${esc(f.name)}" name="${esc(f.name)}">${f.options.map(o => `<option value="${esc(o[0])}"${String(o[0]) === String(f.value) ? ' selected' : ''}>${esc(o[1])}</option>`).join('')}</select>`
    : `<input id="f-${esc(f.name)}" name="${esc(f.name)}" type="number" inputmode="decimal" value="${esc(f.value)}" step="${f.step || 'any'}" min="${f.min != null ? f.min : 0}"${f.max != null ? ` max="${f.max}"` : ''}>`}</div>`).join('')}</div><button type="submit">Calculate</button><div class="out" aria-live="polite"></div></form></section>`;
}

function disclaimer() {
  return `<p class="disclaimer">Results are estimates for general information only and are not financial, tax or legal advice. Lender terms, fees, taxes and compounding rules vary. Verify figures with a qualified professional before making decisions.</p>`;
}

function layout(o) {
  const title = o.title;
  const fullTitle = o.fullTitle || (title.length > 50 ? title : `${title} | ${cfg.siteName}`);
  const ld = (o.jsonld || []).concat([{
    '@context': 'https://schema.org', '@type': 'WebSite', name: cfg.siteName, url: baseUrl() + '/',
  }]);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(o.description)}">
<link rel="canonical" href="${esc(abs(o.path))}">
${o.noindex ? '<meta name="robots" content="noindex,follow">' : ''}
<meta property="og:type" content="${o.article ? 'article' : 'website'}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(o.description)}">
<meta property="og:url" content="${esc(abs(o.path))}">
<meta property="og:site_name" content="${esc(cfg.siteName)}">
<meta name="twitter:card" content="summary">
<link rel="icon" href="${url('/favicon.svg')}" type="image/svg+xml">
<link rel="stylesheet" href="${url('/style.css')}">
${adsenseHead()}
${analyticsHead()}
${cfg.searchConsoleVerification ? `<meta name="google-site-verification" content="${esc(cfg.searchConsoleVerification)}">` : ''}
${cfg.bingVerification ? `<meta name="msvalidate.01" content="${esc(cfg.bingVerification)}">` : ''}
${ld.map(x => `<script type="application/ld+json">${JSON.stringify(x)}</script>`).join('\n')}
</head>
<body>
<header class="top"><div class="wrap"><a class="brand" href="${url('/')}">${esc((cfg.brandParts||[cfg.siteName])[0])}<span>${esc((cfg.brandParts||['',''])[1]||'')}</span></a><nav class="main">${NAV.map(n => `<a href="${url(n[0])}">${esc(n[1])}</a>`).join('')}</nav></div></header>
<main><div class="wrap">
${o.body}
${o.noDisclaimer ? '' : disclaimer()}
</div></main>
<footer><div class="wrap"><a href="${url('/about/')}">About</a><a href="${url('/privacy/')}">Privacy</a><a href="${url('/terms/')}">Terms</a><a href="${url('/contact/')}">Contact</a><a href="${url('/all-calculators/')}">All calculators</a><br><span>© ${new Date().getFullYear()} ${esc(cfg.siteName)}. Calculations are estimates, not advice.</span></div></footer>
<script src="${url('/calc.js')}" defer></script>
</body>
</html>`;
}

module.exports = { cfg, url, abs, baseUrl, basePath, esc, layout, adUnit, ctaBox, faq, breadcrumbs, relatedList, stats, table, calcForm, disclaimer };
