'use strict';
// Home, legal and utility pages.
const H = require('./html');
const M = require('./math');
const { cfg, url, esc } = H;

function home(families, guides, counts) {
  const popular = [
    ['/hourly-to-salary/20-an-hour-is-how-much-a-year/', '$20 an hour is how much a year?'],
    ['/hourly-to-salary/25-an-hour-is-how-much-a-year/', '$25 an hour is how much a year?'],
    ['/salary-to-hourly/60000-a-year-is-how-much-an-hour/', '$60,000 a year is how much an hour?'],
    ['/salary-to-hourly/75000-a-year-is-how-much-an-hour/', '$75,000 a year is how much an hour?'],
    ['/mortgage-payment/300000-mortgage-at-6-5-percent-for-30-years/', '$300,000 mortgage at 6.5% for 30 years'],
    ['/car-payment/30000-car-loan-at-7-percent-for-60-months/', '$30,000 car loan at 7% for 60 months'],
    ['/loan-payment/10000-loan-at-8-percent-for-3-years/', '$10,000 loan at 8% for 3 years'],
    ['/monthly-investing/500-a-month-at-7-percent-for-30-years/', '$500 a month at 7% for 30 years'],
    ['/compound-interest/10000-at-7-percent-for-20-years/', '$10,000 at 7% for 20 years'],
    ['/debt-payoff/5000-at-24-percent-paying-200-a-month/', 'Pay off $5,000 at 24% paying $200 a month'],
    ['/savings-goal/save-10000-in-2-years/', 'Save $10,000 in 2 years'],
    ['/raise-calculator/5-percent-raise-on-60000/', '5% raise on $60,000'],
  ];
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const body = `<section class="hero"><h1>${esc(cfg.tagline)}</h1>
<p>Clear, worked-out answers for wages, loans, mortgages, saving and investing. ${total.toLocaleString()} ready-made calculations plus interactive calculators you can adjust.</p>
<div class="search"><input id="site-search" type="search" placeholder="Search, e.g. 22 an hour, 250000 mortgage, save 5000" aria-label="Search the site"></div></section>
<h2>Calculators</h2>
<div class="cards">${families.map(f => `<div class="card"><h3><a href="${url(f.basePath)}">${esc(f.name)}</a></h3><p>${esc(f.blurb)}</p><a class="more" href="${url(f.basePath)}">${counts[f.id].toLocaleString()} calculations →</a></div>`).join('')}</div>
${H.adUnit('inContent')}
<h2>Popular right now</h2>
<ul class="related">${popular.map(p => `<li><a href="${url(p[0])}">${esc(p[1])}</a></li>`).join('')}</ul>
${guides.length ? `<h2>Guides</h2><div class="cards">${guides.slice(0, 6).map(g => `<div class="card"><h3><a href="${url(g.path)}">${esc(g.title)}</a></h3><p>${esc(g.description)}</p></div>`).join('')}</div><p><a href="${url('/guides/')}">All guides →</a></p>` : ''}
<h2>How ${esc(cfg.siteName)} works</h2>
<p>Every page shows the answer first, then the full working: the formula, the numbers plugged in, year-by-year tables and the common follow-up questions. All figures are computed, not estimated, from standard finance formulas. Results are gross (before taxes) unless stated, and nothing here is personal financial advice.</p>`;
  return { path: '/', title: `${cfg.siteName}: ${cfg.tagline}`, fullTitle: `${cfg.siteName} – Hourly to Salary, Loan, Mortgage and Savings Calculators`, description: `Free calculators with worked answers: hourly to salary, loan and mortgage payments, compound interest, debt payoff, savings goals and retirement income. ${total.toLocaleString()} ready-made pages.`, body, jsonld: [], noDisclaimer: true };
}

function allCalculators(families, counts) {
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'All calculators', path: '/all-calculators/' }]);
  const body = `${crumbs.html}<h1>All calculators</h1><p class="lead">Every tool on ${esc(cfg.siteName)}. Each hub links to its full set of ready-made pages.</p>
<div class="cards">${families.map(f => `<div class="card"><h3><a href="${url(f.basePath)}">${esc(f.name)}</a></h3><p>${esc(f.blurb)}</p><a class="more" href="${url(f.basePath)}">${counts[f.id].toLocaleString()} pages →</a></div>`).join('')}</div>
<p><a href="${url('/guides/')}">Guides and explainers →</a></p>`;
  return { path: '/all-calculators/', title: 'All Calculators', description: `Index of every calculator on ${cfg.siteName}: wages, loans, mortgages, investing, debt, savings and retirement.`, body, jsonld: [crumbs.ld], noDisclaimer: true };
}

function about() {
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'About', path: '/about/' }]);
  const body = `${crumbs.html}<article class="guide"><h1>About ${esc(cfg.siteName)}</h1>
<p>${esc(cfg.siteName)} answers the money questions people actually type into a search box: what does $22 an hour come to in a year, what is the payment on a $300,000 mortgage at 6.5%, how long does it take to pay off $5,000 at 24% APR. Each page gives the number first, then shows exactly how it was calculated.</p>
<h2>How the figures are produced</h2>
<p>Every result is computed from standard, published finance formulas: the amortization formula for loans and mortgages, compound-interest and annuity formulas for savings and investing, and a month-by-month simulation for revolving debt. The same code powers both the static answers and the interactive calculators, so the two always agree. Assumptions (hours per week, compounding frequency, no fees) are stated on each page.</p>
<h2>What this site is not</h2>
<p>It is not financial, tax or legal advice, and it does not know your situation. Interest rates, tax rules and lender terms differ by person and change over time. Use these pages to understand the shape of a decision, then confirm the specifics with your lender, employer or a licensed professional.</p>
<h2>Independence and advertising</h2>
<p>The site is free to use and is supported by advertising and, where marked, affiliate links. Advertisers never influence which calculations appear or how results are presented. Sponsored links are labelled.</p>
<h2>Corrections</h2>
<p>If a figure looks wrong, please <a href="${url('/contact/')}">get in touch</a> with the page address and the numbers you expected. Verified errors are fixed site-wide, since every page is generated from the same formulas.</p></article>`;
  return { path: '/about/', title: `About ${cfg.siteName}`, description: `Who makes ${cfg.siteName}, how the calculators work and what they are for.`, body, jsonld: [crumbs.ld], noDisclaimer: true };
}

function contact() {
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact/' }]);
  const email = cfg.contactEmail;
  const body = `${crumbs.html}<article class="guide"><h1>Contact</h1>
<p>Questions, corrections and partnership enquiries are welcome.</p>
${email ? `<p>Email: <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : `<p>Email: contact at this site's domain.</p>`}
<p>For a correction, include the page address and the figure you believe is wrong. Most messages get a reply within a few days.</p>
<h2>Advertising and affiliates</h2>
<p>Display advertising is served by Google AdSense. Some pages contain clearly labelled sponsored links; see the <a href="${url('/privacy/')}">privacy policy</a> for details on cookies and data.</p></article>`;
  return { path: '/contact/', title: 'Contact', description: `How to reach ${cfg.siteName} with questions, corrections or partnership enquiries.`, body, jsonld: [crumbs.ld], noDisclaimer: true };
}

function privacy() {
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Privacy Policy', path: '/privacy/' }]);
  const body = `${crumbs.html}<article class="guide"><h1>Privacy Policy</h1>
<p class="meta">Last updated: ${new Date().toISOString().slice(0, 10)}</p>
<p>This policy explains what information ${esc(cfg.siteName)} ("we", "the site") collects when you visit, how it is used and the choices you have.</p>
<h2>Information we collect</h2>
<p>The site does not ask you to create an account or submit personal details. Numbers you type into a calculator are processed in your browser and are not sent to our servers. Like most websites, our hosting provider records standard server logs (IP address, browser type, pages requested, timestamps) for security and to keep the site running.</p>
<h2>Cookies and advertising</h2>
<p>We use Google AdSense to display advertising. Google and its partners use cookies and similar technologies to serve ads based on your prior visits to this and other websites, and to measure ad performance. Google's use of advertising cookies enables it and its partners to serve ads based on your visit to this site and/or other sites on the internet. You may opt out of personalised advertising by visiting <a href="https://www.google.com/settings/ads" rel="noopener" target="_blank">Google Ads Settings</a> or <a href="https://www.aboutads.info/choices/" rel="noopener" target="_blank">www.aboutads.info</a>. Third-party vendors, including Google, may use cookies to serve ads; their use of data is governed by their own privacy policies.</p>
<p>Visitors in the European Economic Area, the United Kingdom and Switzerland are shown a consent message before personalised ads are served, as required by law.</p>
<h2>Analytics</h2>
<p>We may use Google Analytics to understand which pages are useful. Analytics data is aggregated and does not identify you personally. You can block analytics with a browser extension or by disabling cookies.</p>
<h2>Affiliate links</h2>
<p>Some pages contain links marked as sponsored. If you click one and sign up for or buy a product, we may receive a commission at no extra cost to you. The partner may set a cookie to attribute the referral.</p>
<h2>Children</h2>
<p>The site is not directed at children under 13 and does not knowingly collect information from them.</p>
<h2>Your rights</h2>
<p>Depending on where you live you may have rights to access, correct or delete personal data held about you. Because we hold no account data, such requests normally concern our advertising or analytics providers, whose policies are linked above. You can also <a href="${url('/contact/')}">contact us</a>.</p>
<h2>Changes</h2>
<p>We may update this policy; the date above shows the latest revision. Continued use of the site after a change means you accept the updated policy.</p></article>`;
  return { path: '/privacy/', title: 'Privacy Policy', description: `How ${cfg.siteName} handles cookies, advertising, analytics and personal data.`, body, jsonld: [crumbs.ld], noDisclaimer: true };
}

function terms() {
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Terms of Use', path: '/terms/' }]);
  const body = `${crumbs.html}<article class="guide"><h1>Terms of Use</h1>
<p class="meta">Last updated: ${new Date().toISOString().slice(0, 10)}</p>
<h2>Information, not advice</h2>
<p>${esc(cfg.siteName)} provides general financial calculations for educational purposes. Nothing on the site is financial, investment, tax, legal or accounting advice, and no professional relationship is created by using it. Figures are estimates based on stated assumptions and simplified models; actual loan terms, returns, taxes and fees will differ. Always verify important numbers with the relevant institution or a licensed professional before acting.</p>
<h2>Accuracy</h2>
<p>We work hard to keep formulas correct and welcome corrections, but we make no warranty that the content is complete, current or error-free. Use of the site is at your own risk.</p>
<h2>Limitation of liability</h2>
<p>To the fullest extent permitted by law, ${esc(cfg.siteName)} and its operators are not liable for any loss or damage arising from reliance on information found on the site.</p>
<h2>Intellectual property</h2>
<p>The site's text, design and code are protected by copyright. You may link to any page and quote short excerpts with attribution. Automated bulk copying of pages is not permitted.</p>
<h2>Third-party links</h2>
<p>Links to other websites, including advertisers and affiliate partners, are provided for convenience. We do not control and are not responsible for their content or practices.</p>
<h2>Changes</h2>
<p>These terms may be updated from time to time. The date above reflects the latest version.</p></article>`;
  return { path: '/terms/', title: 'Terms of Use', description: `Terms governing use of ${cfg.siteName} and its calculators.`, body, jsonld: [crumbs.ld], noDisclaimer: true };
}

function notFound(families) {
  const body = `<h1>Page not found</h1><p class="lead">That address does not exist. Try one of the calculators below or search the site.</p>
<div class="search"><input id="site-search" type="search" placeholder="Search, e.g. 22 an hour" aria-label="Search the site"></div>
<ul class="related">${families.map(f => `<li><a href="${url(f.basePath)}">${esc(f.name)}</a></li>`).join('')}</ul>`;
  return { path: '/404.html', title: 'Page not found', description: 'The page you requested could not be found.', body, jsonld: [], noindex: true, noDisclaimer: true };
}

module.exports = { home, allCalculators, about, contact, privacy, terms, notFound };
