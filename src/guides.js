'use strict';
// Markdown guides in content/guides/*.md -> /guides/<slug>/ pages + index.
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const H = require('./html');
const { cfg, url, esc } = H;

const DIR = path.join(__dirname, '..', 'content', 'guides');

function parseFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { meta: {}, body: src };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    else v = v.replace(/^["']|["']$/g, '');
    meta[k] = v;
  }
  return { meta, body: m[2] };
}

function loadGuides() {
  if (!fs.existsSync(DIR)) return [];
  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.md'));
  const guides = files.map(f => {
    const src = fs.readFileSync(path.join(DIR, f), 'utf8');
    const { meta, body } = parseFrontmatter(src);
    const slug = (meta.slug || f.replace(/\.md$/, '')).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const html = marked.parse(body.replace(/\]\(\/(?!\/)/g, `](${url('/')}`)); // rewrite root-relative links for project pages
    const words = body.split(/\s+/).length;
    return {
      slug, path: `/guides/${slug}/`,
      title: meta.title || slug,
      description: meta.description || '',
      date: meta.date || '',
      updated: meta.updated || meta.date || '',
      calculators: Array.isArray(meta.calculators) ? meta.calculators : [],
      html, words,
    };
  }).filter(g => g.title && g.description);
  guides.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return guides;
}

function guidePage(g, families) {
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides/' }, { name: g.title, path: g.path }]);
  const related = g.calculators.map(p => families.find(f => f.basePath === p)).filter(Boolean);
  const ld = {
    '@context': 'https://schema.org', '@type': 'Article', headline: g.title, description: g.description,
    datePublished: g.date, dateModified: g.updated, author: { '@type': 'Organization', name: cfg.siteName }, publisher: { '@type': 'Organization', name: cfg.siteName }, mainEntityOfPage: H.abs(g.path),
  };
  const body = `${crumbs.html}<article class="guide"><h1>${esc(g.title)}</h1><p class="meta">${g.updated ? `Updated ${esc(g.updated)} · ` : ''}${Math.max(1, Math.round(g.words / 200))} min read</p>
${g.html}
${H.adUnit('inContent')}
${related.length ? `<h2>Related calculators</h2><ul class="related">${related.map(f => `<li><a href="${url(f.basePath)}">${esc(f.name)} calculator</a></li>`).join('')}</ul>` : ''}
</article>`;
  return { path: g.path, title: g.title, description: g.description, body, jsonld: [crumbs.ld, ld], article: true };
}

function guidesIndex(guides) {
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides/' }]);
  const body = `${crumbs.html}<h1>Guides</h1><p class="lead">Plain-English explainers on the money questions behind the calculators.</p>
<div class="cards">${guides.map(g => `<div class="card"><h3><a href="${url(g.path)}">${esc(g.title)}</a></h3><p>${esc(g.description)}</p>${g.updated ? `<p class="meta">${esc(g.updated)}</p>` : ''}</div>`).join('')}</div>`;
  return { path: '/guides/', title: 'Money Guides and Explainers', fullTitle: `Guides | ${cfg.siteName}`, description: `Plain-English guides on wages, loans, mortgages, saving and investing from ${cfg.siteName}.`, body, jsonld: [crumbs.ld], noDisclaimer: true };
}

module.exports = { loadGuides, guidePage, guidesIndex };
