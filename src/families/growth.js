'use strict';
const M = require('../math');
const H = require('../html');
const G = require('./grids');
const { money, moneyWhole, pct, slugNum, compactMoney } = M;

const lumpPath = (a, r, y) => `/compound-interest/${a}-at-${slugNum(r)}-percent-for-${y}-years/`;
const monthlyPath = (m, r, y) => `/monthly-investing/${m}-a-month-at-${slugNum(r)}-percent-for-${y}-years/`;
const debtPath = (b, apr, pay) => `/debt-payoff/${b}-at-${apr}-percent-paying-${pay}-a-month/`;
const goalPath = (g, y) => `/savings-goal/save-${g}-in-${y}-years/`;
const retirePath = m => `/retirement-income/${m}-a-month-in-retirement/`;
const fmtAmt = a => `$${a.toLocaleString()}`;

// ---------------------------------------------------------------- compound interest (lump sum)
function lumpPage(amount, rate, years) {
  const fv = M.futureValueLump(amount, rate, years);
  const fvAnnual = amount * Math.pow(1 + rate / 100, years);
  const earned = fv - amount;
  const title = `${fmtAmt(amount)} at ${pct(rate)} for ${years} Years: Compound Interest Growth`;
  const description = `${fmtAmt(amount)} at ${pct(rate)} for ${years} years grows to ${moneyWhole(fv)} with monthly compounding: ${moneyWhole(earned)} of interest, a ${(fv / amount).toFixed(2)}× increase. Year-by-year table and rate comparison.`;
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Compound Interest', path: '/compound-interest/' }, { name: `${compactMoney(amount)} at ${pct(rate)}, ${years} yr`, path: lumpPath(amount, rate, years) }]);
  const yearRows = []; for (let y = 1; y <= years; y++) { const v = M.futureValueLump(amount, rate, y); yearRows.push([`Year ${y}`, moneyWhole(v), moneyWhole(v - amount)]); }
  const rateRows = G.LUMP_RATE.map(r => [pct(r), moneyWhole(M.futureValueLump(amount, r, years)), moneyWhole(M.futureValueLump(amount, r, years) - amount)]);
  const compRows = [['Yearly', moneyWhole(amount * Math.pow(1 + rate / 100, years))], ['Quarterly', moneyWhole(amount * Math.pow(1 + rate / 400, years * 4))], ['Monthly', moneyWhole(fv)], ['Daily', moneyWhole(amount * Math.pow(1 + rate / 36500, years * 365))]];
  const doubling = 72 / rate;
  const real = fv / Math.pow(1.03, years);
  const faq = H.faq([
    { q: `How much is ${fmtAmt(amount)} worth after ${years} years at ${pct(rate)}?`, a: `About <b>${moneyWhole(fv)}</b> with monthly compounding, or ${moneyWhole(fvAnnual)} if interest compounds once a year. Either way the original ${fmtAmt(amount)} roughly ${fv / amount >= 2 ? `${(fv / amount).toFixed(1)}×` : `grows ${((fv / amount - 1) * 100).toFixed(0)}%`}.` },
    { q: `How long does it take ${fmtAmt(amount)} to double at ${pct(rate)}?`, a: `Around <b>${doubling.toFixed(1)} years</b> by the rule of 72 (72 ÷ ${rate}). The exact figure with monthly compounding is ${(Math.log(2) / (12 * Math.log(1 + rate / 1200))).toFixed(1)} years.` },
    { q: `What is ${moneyWhole(fv)} worth in today's money?`, a: `If inflation averages 3% a year, ${moneyWhole(fv)} in ${years} years buys about what <b>${moneyWhole(real)}</b> buys today. Real growth is what matters for spending power.` },
    { q: `What if I add money every month too?`, a: `Adding just $100 a month to the ${fmtAmt(amount)} brings the total to ${moneyWhole(M.futureValueMonthly(100, rate, years, amount))} after ${years} years. See the <a href="${H.url('/monthly-investing/')}">monthly investing calculator</a>.` },
  ]);
  const related = G.neighbours(G.LUMP_AMT, amount, 4).map(a => ({ path: lumpPath(a, rate, years), text: `${fmtAmt(a)} at ${pct(rate)} for ${years} years` }))
    .concat(G.neighbours(G.LUMP_RATE, rate, 4).map(r => ({ path: lumpPath(amount, r, years), text: `${fmtAmt(amount)} at ${pct(r)} for ${years} years` })))
    .concat(G.neighbours(G.LUMP_YEARS, years, 4).map(y => ({ path: lumpPath(amount, rate, y), text: `${fmtAmt(amount)} at ${pct(rate)} for ${y} years` })));
  if (G.MONTHLY_RATE.includes(rate) && G.MONTHLY_YEARS.includes(years)) related.push({ path: monthlyPath(200, rate, years), text: `$200 a month at ${pct(rate)} for ${years} years` });
  const body = `${crumbs.html}
<h1>${title}</h1>
<p class="lead">Leave <b>${fmtAmt(amount)}</b> invested at <b>${pct(rate)}</b> for <b>${years} years</b> and it becomes <b>${moneyWhole(fv)}</b>, assuming interest compounds monthly and is reinvested. Nothing is added along the way; the growth of ${moneyWhole(earned)} comes entirely from compounding.</p>
<div class="answer"><div class="big">${moneyWhole(fv)} after ${years} years</div><div class="sub">${moneyWhole(earned)} earned on ${fmtAmt(amount)} · ${(fv / amount).toFixed(2)}× growth · compounded monthly</div></div>
${H.stats([{ label: 'Starting amount', value: fmtAmt(amount) }, { label: 'Interest earned', value: moneyWhole(earned) }, { label: 'Doubling time (rule of 72)', value: `${doubling.toFixed(1)} yrs` }, { label: 'In today\'s dollars (3% inflation)', value: moneyWhole(real) }])}
${H.adUnit('inContent')}
<h2>Growth year by year</h2>
${H.table(['Year', 'Balance', 'Interest to date'], yearRows)}
<h2>How compounding frequency changes the result</h2>
${H.table(['Compounds', `Value after ${years} years`], compRows)}
<h2>${fmtAmt(amount)} for ${years} years at other rates</h2>
${H.table(['Rate', 'Final value', 'Interest earned'], rateRows)}
${H.calcForm('lump', [
    { name: 'amount', label: 'Starting amount ($)', value: amount, step: 100 },
    { name: 'rate', label: 'Annual return (%)', value: rate, step: 0.1, max: 100 },
    { name: 'years', label: 'Years', value: years, step: 1, max: 100 },
  ])}
<h2>How this is calculated</h2>
<div class="formula">FV = P × (1 + r ÷ 12)^(12 × t)<br>${money(amount)} × (1 + ${rate / 100} ÷ 12)^(12 × ${years}) = ${money(fv)}</div>
<p class="note">Returns are not guaranteed; stock market returns in particular vary widely year to year. Taxes on interest or dividends would reduce the result unless the money is in a tax-advantaged account.</p>
${H.ctaBox('investing')}
${faq.html}
${H.relatedList(related)}`;
  return { path: lumpPath(amount, rate, years), title, description, body, jsonld: [crumbs.ld, faq.ld] };
}

function lumpHub() {
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Compound Interest', path: '/compound-interest/' }]);
  const rows = [1000, 5000, 10000, 25000, 50000].map(a => [fmtAmt(a), moneyWhole(M.futureValueLump(a, 5, 10)), moneyWhole(M.futureValueLump(a, 7, 10)), moneyWhole(M.futureValueLump(a, 7, 20)), moneyWhole(M.futureValueLump(a, 10, 20))]);
  const faq = H.faq([
    { q: 'What is compound interest?', a: 'Interest earned on both the original amount and the interest already added. Because each period starts from a larger balance, growth accelerates over time.' },
    { q: 'What is the rule of 72?', a: 'A quick estimate of doubling time: divide 72 by the annual rate. At 6% money doubles in about 12 years; at 9% in about 8.' },
  ]);
  const body = `${crumbs.html}
<h1>Compound Interest Calculator</h1>
<p class="lead">See what a lump sum grows to at any rate over any number of years, with a year-by-year table.</p>
${H.calcForm('lump', [{ name: 'amount', label: 'Starting amount ($)', value: 10000, step: 100 }, { name: 'rate', label: 'Annual return (%)', value: 7, step: 0.1, max: 100 }, { name: 'years', label: 'Years', value: 20, step: 1, max: 100 }], 'Compound interest calculator')}
${H.adUnit('inContent')}
<h2>Quick reference (monthly compounding)</h2>
${H.table(['Amount', '5% · 10 yr', '7% · 10 yr', '7% · 20 yr', '10% · 20 yr'], rows)}
<h2>All compound interest pages</h2>
${G.LUMP_AMT.map(a => `<h3>${fmtAmt(a)}</h3><div class="chips">${G.LUMP_RATE.map(r => G.LUMP_YEARS.map(y => `<a href="${H.url(lumpPath(a, r, y))}">${pct(r)} · ${y} yr</a>`).join('')).join('')}</div>`).join('')}
${faq.html}
<h2>Related tools</h2><ul class="related"><li><a href="${H.url('/monthly-investing/')}">Monthly investing calculator</a></li><li><a href="${H.url('/savings-goal/')}">Savings goal calculator</a></li><li><a href="${H.url('/retirement-income/')}">Retirement income calculator</a></li></ul>`;
  return { path: '/compound-interest/', title: 'Compound Interest Calculator: Growth of a Lump Sum Over Time', fullTitle: 'Compound Interest Calculator | WageFigures', description: 'Calculate how a lump sum grows with compound interest. Pages for $1,000 to $100,000 at 3% to 12% over 5 to 40 years, with yearly tables and doubling times.', body, jsonld: [crumbs.ld, faq.ld] };
}

// ---------------------------------------------------------------- monthly investing
function monthlyPage(m, rate, years) {
  const fv = M.futureValueMonthly(m, rate, years);
  const contributed = m * 12 * years;
  const growth = fv - contributed;
  const title = `${fmtAmt(m)} a Month at ${pct(rate)} for ${years} Years: Investment Growth`;
  const description = `Investing ${fmtAmt(m)} a month at ${pct(rate)} for ${years} years grows to ${moneyWhole(fv)}: ${moneyWhole(contributed)} contributed plus ${moneyWhole(growth)} growth. Year-by-year table and start-date comparison.`;
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Monthly Investing', path: '/monthly-investing/' }, { name: `${fmtAmt(m)}/mo at ${pct(rate)}, ${years} yr`, path: monthlyPath(m, rate, years) }]);
  const yearRows = M.growthByYear(m, rate, years).map(r => [`Year ${r.year}`, moneyWhole(r.contributed), moneyWhole(r.growth), moneyWhole(r.value)]);
  const rateRows = G.MONTHLY_RATE.map(r => [pct(r), moneyWhole(M.futureValueMonthly(m, r, years)), moneyWhole(M.futureValueMonthly(m, r, years) - contributed)]);
  const timeRows = [years - 10, years - 5, years, years + 5, years + 10].filter(y => y >= 1).map(y => [`${y} years`, moneyWhole(M.futureValueMonthly(m, rate, y)), moneyWhole(m * 12 * y)]);
  const amtRows = G.neighbours(G.MONTHLY_AMT, m, 6).concat([m]).sort((a, b) => a - b).map(x => [`${fmtAmt(x)}/month`, moneyWhole(M.futureValueMonthly(x, rate, years)), moneyWhole(x * 12 * years)]);
  const faq = H.faq([
    { q: `How much will ${fmtAmt(m)} a month be worth in ${years} years at ${pct(rate)}?`, a: `About <b>${moneyWhole(fv)}</b>. Of that, ${moneyWhole(contributed)} is money you put in and ${moneyWhole(growth)} is investment growth (${(growth / fv * 100).toFixed(0)}% of the total).` },
    { q: `What if I start 5 years later?`, a: `Investing for ${years - 5 > 0 ? years - 5 : 1} years instead gives ${moneyWhole(M.futureValueMonthly(m, rate, Math.max(1, years - 5)))}. The last five years of a ${years}-year plan are worth ${moneyWhole(fv - M.futureValueMonthly(m, rate, Math.max(1, years - 5)))} because that is when the balance is largest.` },
    { q: `What does ${fmtAmt(m)} a month at ${pct(rate)} earn per year at the end?`, a: `In the final year the balance grows by roughly ${moneyWhole(fv - M.futureValueMonthly(m, rate, years - 1) - m * 12)} from returns alone, compared with the ${moneyWhole(m * 12)} you contribute.` },
    { q: `Is ${pct(rate)} a realistic return?`, a: rate <= 5 ? `Yes; it is conservative. High-yield savings and bonds have paid in this range in recent years, and it is below the long-run average of a diversified stock portfolio.` : rate <= 8 ? `It is in line with long-run averages for a diversified stock index fund after inflation is roughly accounted for, though any single decade can be well above or below it.` : `It is optimistic. The U.S. stock market has averaged roughly 10% a year before inflation over long periods, with large swings. Plan with a lower number and treat anything above as a bonus.` },
  ]);
  const related = G.neighbours(G.MONTHLY_AMT, m, 4).map(x => ({ path: monthlyPath(x, rate, years), text: `${fmtAmt(x)} a month at ${pct(rate)} for ${years} years` }))
    .concat(G.neighbours(G.MONTHLY_RATE, rate, 4).map(r => ({ path: monthlyPath(m, r, years), text: `${fmtAmt(m)} a month at ${pct(r)} for ${years} years` })))
    .concat(G.neighbours(G.MONTHLY_YEARS, years, 4).map(y => ({ path: monthlyPath(m, rate, y), text: `${fmtAmt(m)} a month at ${pct(rate)} for ${y} years` })));
  if (G.LUMP_RATE.includes(rate) && G.LUMP_YEARS.includes(years)) related.push({ path: lumpPath(10000, rate, years), text: `$10,000 lump sum at ${pct(rate)} for ${years} years` });
  const body = `${crumbs.html}
<h1>${title}</h1>
<p class="lead">Putting <b>${fmtAmt(m)} a month</b> into an investment returning <b>${pct(rate)}</b> a year builds <b>${moneyWhole(fv)}</b> over <b>${years} years</b>. You contribute ${moneyWhole(contributed)}; compounding adds the other ${moneyWhole(growth)}.</p>
<div class="answer"><div class="big">${moneyWhole(fv)} after ${years} years</div><div class="sub">${moneyWhole(contributed)} contributed + ${moneyWhole(growth)} growth</div></div>
${H.stats([{ label: 'Monthly contribution', value: fmtAmt(m) }, { label: 'Total contributed', value: moneyWhole(contributed) }, { label: 'Investment growth', value: moneyWhole(growth) }, { label: 'Growth share', value: `${(growth / fv * 100).toFixed(0)}%` }])}
${H.adUnit('inContent')}
<h2>Balance year by year</h2>
${H.table(['Year', 'Contributed', 'Growth', 'Balance'], yearRows)}
<h2>Starting earlier or later</h2>
${H.table(['Investing period', 'Final value', 'Contributed'], timeRows)}
<h2>Other monthly amounts at ${pct(rate)} for ${years} years</h2>
${H.table(['Contribution', 'Final value', 'Contributed'], amtRows)}
<h2>${fmtAmt(m)} a month for ${years} years at other returns</h2>
${H.table(['Return', 'Final value', 'Growth'], rateRows)}
${H.calcForm('monthly', [
    { name: 'monthly', label: 'Monthly contribution ($)', value: m, step: 10 },
    { name: 'rate', label: 'Annual return (%)', value: rate, step: 0.1, max: 100 },
    { name: 'years', label: 'Years', value: years, step: 1, max: 100 },
    { name: 'initial', label: 'Starting amount ($)', value: 0, step: 100 },
  ])}
<h2>How this is calculated</h2>
<div class="formula">FV = M × ((1 + i)^n − 1) ÷ i, where i = ${rate}% ÷ 12 and n = ${years * 12} months<br>= ${money(fv)}</div>
<p class="note">Contributions are assumed at the end of each month with returns compounding monthly. Real investment returns vary from year to year; this is a smooth average.</p>
${H.ctaBox('investing')}
${faq.html}
${H.relatedList(related)}`;
  return { path: monthlyPath(m, rate, years), title, description, body, jsonld: [crumbs.ld, faq.ld] };
}

function monthlyHub() {
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Monthly Investing', path: '/monthly-investing/' }]);
  const rows = [100, 250, 500, 1000].map(m => [`${fmtAmt(m)}/mo`, moneyWhole(M.futureValueMonthly(m, 7, 10)), moneyWhole(M.futureValueMonthly(m, 7, 20)), moneyWhole(M.futureValueMonthly(m, 7, 30)), moneyWhole(M.futureValueMonthly(m, 10, 30))]);
  const faq = H.faq([
    { q: 'How much should I invest each month?', a: 'A common target is 15% of gross income for retirement, including any employer match. Start with what you can and raise it with each pay rise.' },
    { q: 'What return should I assume?', a: 'Many planners use 6–7% for a diversified stock portfolio, which is below the historical average and leaves a margin for bad decades.' },
  ]);
  const body = `${crumbs.html}
<h1>Monthly Investing Calculator</h1>
<p class="lead">What regular monthly contributions grow into over time, with yearly tables and comparisons of start dates and returns.</p>
${H.calcForm('monthly', [{ name: 'monthly', label: 'Monthly contribution ($)', value: 500, step: 10 }, { name: 'rate', label: 'Annual return (%)', value: 7, step: 0.1, max: 100 }, { name: 'years', label: 'Years', value: 25, step: 1, max: 100 }, { name: 'initial', label: 'Starting amount ($)', value: 0, step: 100 }], 'Monthly investing calculator')}
${H.adUnit('inContent')}
<h2>Quick reference</h2>
${H.table(['Monthly', '7% · 10 yr', '7% · 20 yr', '7% · 30 yr', '10% · 30 yr'], rows)}
<h2>All monthly investing pages</h2>
${G.MONTHLY_AMT.map(m => `<h3>${fmtAmt(m)} a month</h3><div class="chips">${G.MONTHLY_RATE.map(r => G.MONTHLY_YEARS.map(y => `<a href="${H.url(monthlyPath(m, r, y))}">${pct(r)} · ${y} yr</a>`).join('')).join('')}</div>`).join('')}
${faq.html}`;
  return { path: '/monthly-investing/', title: 'Monthly Investing Calculator: What Regular Contributions Grow Into', fullTitle: 'Monthly Investing Calculator | WageFigures', description: 'Calculate what investing $50 to $2,000 a month grows to at 4% to 12% over 5 to 40 years, with yearly tables showing contributions versus growth.', body, jsonld: [crumbs.ld, faq.ld] };
}

// ---------------------------------------------------------------- debt payoff
function debtPage(balance, apr, pay) {
  const res = M.debtPayoff(balance, apr, pay);
  const minInterest = balance * apr / 1200;
  const title = `Pay Off ${fmtAmt(balance)} at ${pct(apr)} APR Paying ${fmtAmt(pay)} a Month`;
  const description = `Paying ${fmtAmt(pay)} a month on a ${fmtAmt(balance)} balance at ${pct(apr)} APR takes ${M.yearsMonths(res.months)} and costs ${money(res.totalInterest)} in interest. See how extra payments shorten it.`;
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Debt Payoff', path: '/debt-payoff/' }, { name: `${compactMoney(balance)} at ${pct(apr)}, ${fmtAmt(pay)}/mo`, path: debtPath(balance, apr, pay) }]);
  const extraRows = [0, 25, 50, 100, 200].map(e => { const r = M.debtPayoff(balance, apr, pay + e); return [e === 0 ? `${fmtAmt(pay)} (current)` : `${fmtAmt(pay + e)} (+${fmtAmt(e)})`, M.yearsMonths(r.months), money(r.totalInterest), e === 0 ? '—' : money(res.totalInterest - r.totalInterest)]; });
  const aprRows = [0, 10, 15, 20, 25, 30].filter(a => pay > balance * a / 1200).map(a => { const r = M.debtPayoff(balance, a, pay); return [pct(a), M.yearsMonths(r.months), money(r.totalInterest)]; });
  const transferFee = balance * 0.03;
  const afterPromo = Math.max(0, balance + transferFee - pay * 15);
  const faq = H.faq([
    { q: `How long to pay off ${fmtAmt(balance)} at ${pct(apr)} paying ${fmtAmt(pay)} a month?`, a: `<b>${M.yearsMonths(res.months)}</b> (${res.months} payments). Total interest comes to ${money(res.totalInterest)}, so you repay ${money(res.totalPaid)} in all.` },
    { q: `How much of the first ${fmtAmt(pay)} payment is interest?`, a: `About <b>${money(minInterest)}</b> goes to interest in month one and ${money(pay - minInterest)} reduces the balance. As the balance falls, more of each payment goes to principal.` },
    { q: `Would a 0% balance transfer help?`, a: `Moving the ${fmtAmt(balance)} to a card with a 15-month 0% offer and a 3% fee (${money(transferFee)}) and paying ${fmtAmt(pay)} a month would ${afterPromo === 0 ? `clear it within the promo period for a total cost of ${money(transferFee)} instead of ${money(res.totalInterest)}.` : `leave about ${money(afterPromo)} when the promo ends, but you would have avoided roughly ${money(Math.max(0, res.totalInterest - transferFee))} of interest by then if the rest is paid at a low rate.`}` },
    { q: `What if I only pay the minimum?`, a: `Minimum payments are often 1–2% of the balance plus interest. On ${fmtAmt(balance)} that starts around ${money(balance * 0.01 + minInterest)} and shrinks over time, stretching the payoff over many years and multiplying the interest. A fixed ${fmtAmt(pay)} payment avoids that trap.` },
  ]);
  const related = G.DEBT_PAY.filter(p => p !== pay && validDebt(balance, apr, p)).slice(0, 5).map(p => ({ path: debtPath(balance, apr, p), text: `${fmtAmt(balance)} at ${pct(apr)} paying ${fmtAmt(p)} a month` }))
    .concat(G.neighbours(G.DEBT_BAL, balance, 4).filter(b => validDebt(b, apr, pay)).map(b => ({ path: debtPath(b, apr, pay), text: `${fmtAmt(b)} at ${pct(apr)} paying ${fmtAmt(pay)} a month` })))
    .concat(G.neighbours(G.DEBT_APR, apr, 4).filter(a => validDebt(balance, a, pay)).map(a => ({ path: debtPath(balance, a, pay), text: `${fmtAmt(balance)} at ${pct(a)} paying ${fmtAmt(pay)} a month` })));
  const body = `${crumbs.html}
<h1>${title}</h1>
<p class="lead">A <b>${fmtAmt(balance)}</b> credit card balance at <b>${pct(apr)} APR</b> takes <b>${M.yearsMonths(res.months)}</b> to clear at <b>${fmtAmt(pay)} a month</b>. Interest adds ${money(res.totalInterest)} along the way, ${(res.totalInterest / balance * 100).toFixed(0)}% of the original balance.</p>
<div class="answer"><div class="big">${M.yearsMonths(res.months)}</div><div class="sub">${res.months} payments of ${fmtAmt(pay)} · ${money(res.totalInterest)} interest · ${money(res.totalPaid)} total</div></div>
${H.stats([{ label: 'Balance', value: fmtAmt(balance) }, { label: 'APR', value: pct(apr) }, { label: 'First month\'s interest', value: money(minInterest) }, { label: 'Debt-free date', value: `${res.months} months from now` }])}
${H.adUnit('inContent')}
<h2>Pay a little more, finish much sooner</h2>
<p>Because interest accrues on the remaining balance, every extra dollar early on saves more than a dollar later.</p>
${H.table(['Monthly payment', 'Paid off in', 'Total interest', 'Interest saved'], extraRows)}
<h2>Same payment, different APR</h2>
<p>This is why a balance transfer or a lower-rate consolidation loan matters. Paying ${fmtAmt(pay)} a month on ${fmtAmt(balance)}:</p>
${H.table(['APR', 'Paid off in', 'Total interest'], aprRows)}
${H.calcForm('debt', [
    { name: 'balance', label: 'Balance ($)', value: balance, step: 50 },
    { name: 'apr', label: 'APR (%)', value: apr, step: 0.01, max: 100 },
    { name: 'payment', label: 'Monthly payment ($)', value: pay, step: 5 },
  ])}
<h2>How this is calculated</h2>
<div class="formula">Each month: interest = balance × ${pct(apr)} ÷ 12; balance = balance + interest − payment<br>Month 1 interest on ${money(balance)} = ${money(minInterest)}; payments continue until the balance reaches zero after ${res.months} months.</div>
<p class="note">Assumes no new charges, a fixed APR and payments made on time. Card issuers compute interest daily, so real figures differ slightly.</p>
${H.ctaBox('debt')}
${faq.html}
${H.relatedList(related)}`;
  return { path: debtPath(balance, apr, pay), title, description, body, jsonld: [crumbs.ld, faq.ld] };
}

function debtHub() {
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Debt Payoff', path: '/debt-payoff/' }]);
  const rows = [2000, 5000, 10000].map(b => [fmtAmt(b)].concat([100, 200, 300, 500].map(p => { const r = M.debtPayoff(b, 22, p); return r.neverPays ? 'never' : `${M.yearsMonths(r.months)} · ${money(r.totalInterest)} interest`; })));
  const faq = H.faq([
    { q: 'Should I pay off the highest interest or smallest balance first?', a: 'Highest APR first (the avalanche method) saves the most money. Smallest balance first (the snowball) gives quicker wins. Either beats paying minimums.' },
    { q: 'Why does my balance barely move?', a: 'Because most of a small payment is interest. On $5,000 at 24% APR the first month\'s interest is $100, so a $125 payment reduces the balance by only $25.' },
  ]);
  const body = `${crumbs.html}
<h1>Debt Payoff Calculator</h1>
<p class="lead">How long a credit card or loan balance takes to pay off at a fixed monthly payment, and how much interest you pay.</p>
${H.calcForm('debt', [{ name: 'balance', label: 'Balance ($)', value: 5000, step: 50 }, { name: 'apr', label: 'APR (%)', value: 22, step: 0.01, max: 100 }, { name: 'payment', label: 'Monthly payment ($)', value: 200, step: 5 }], 'Debt payoff calculator')}
${H.adUnit('inContent')}
<h2>Quick reference at 22% APR</h2>
${H.table(['Balance', '$100/mo', '$200/mo', '$300/mo', '$500/mo'], rows)}
<h2>All debt payoff pages</h2>
${G.DEBT_BAL.map(b => `<h3>${fmtAmt(b)} balance</h3><div class="chips">${G.DEBT_APR.map(a => G.DEBT_PAY.filter(p => validDebt(b, a, p)).map(p => `<a href="${H.url(debtPath(b, a, p))}">${pct(a)} · ${fmtAmt(p)}/mo</a>`).join('')).join('')}</div>`).join('')}
${faq.html}`;
  return { path: '/debt-payoff/', title: 'Debt Payoff Calculator: How Long to Pay Off a Balance', fullTitle: 'Debt Payoff Calculator | WageFigures', description: 'Find out how long it takes to pay off a credit card balance from $1,000 to $20,000 at 15% to 30% APR with a fixed monthly payment, and how much interest you pay.', body, jsonld: [crumbs.ld, faq.ld] };
}
function validDebt(b, apr, pay) {
  const r = M.debtPayoff(b, apr, pay);
  return !r.neverPays && r.months >= 3 && pay <= b / 2;
}

// ---------------------------------------------------------------- savings goal
function goalPage(goal, years) {
  const n = years * 12;
  const flat = goal / n;
  const hy = M.monthlyForGoal(goal, 4, n);
  const title = `How to Save ${fmtAmt(goal)} in ${years} Year${years > 1 ? 's' : ''}: Monthly Amount Needed`;
  const description = `To save ${fmtAmt(goal)} in ${years} year${years > 1 ? 's' : ''} you need ${money(flat)} a month, or ${money(hy)} a month at 4% APY. Weekly, daily and per-paycheck figures included.`;
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Savings Goal', path: '/savings-goal/' }, { name: `${compactMoney(goal)} in ${years} yr`, path: goalPath(goal, years) }]);
  const apyRows = [0, 1, 2, 3, 4, 4.5, 5].map(a => { const m = M.monthlyForGoal(goal, a, n); return [pct(a), money(m), money(goal - m * n)]; });
  const timeRows = [6, 12, 18, 24, 36, 48, 60, 120].map(mo => [M.yearsMonths(mo), money(goal / mo), money(M.monthlyForGoal(goal, 4, mo))]);
  const faq = H.faq([
    { q: `How much do I need to save per month to reach ${fmtAmt(goal)} in ${years} year${years > 1 ? 's' : ''}?`, a: `<b>${money(flat)}</b> a month if the money earns nothing, or about <b>${money(hy)}</b> a month at a 4% APY, where interest covers the remaining ${money(goal - hy * n)}.` },
    { q: `How much is that per week and per paycheck?`, a: `${money(flat * 12 / 52)} a week, ${money(flat * 12 / 26)} per biweekly paycheck, or ${money(flat * 12 / 365)} a day.` },
    { q: `What if I already have some saved?`, a: `Every $1,000 you start with cuts the monthly amount by about ${money(1000 / n)} (ignoring interest). Starting with ${fmtAmt(Math.round(goal / 4))} drops it to ${money((goal - goal / 4) / n)} a month.` },
    { q: `Where should I keep money for a ${years}-year goal?`, a: years <= 2 ? `In a high-yield savings account or short-term CDs. Over a short horizon the stock market can fall just when you need the money.` : years <= 5 ? `Mostly in high-yield savings or CDs, possibly with a small share in conservative funds. Stock market swings over ${years} years are still large enough to derail a fixed goal.` : `A mix is reasonable: a diversified fund for the longer-dated part and savings for the final few years. The longer the horizon, the more volatility you can absorb.` },
  ]);
  const related = G.neighbours(G.GOAL_AMT, goal, 6).map(g => ({ path: goalPath(g, years), text: `Save ${fmtAmt(g)} in ${years} year${years > 1 ? 's' : ''}` }))
    .concat(G.GOAL_YEARS.filter(y => y !== years).map(y => ({ path: goalPath(goal, y), text: `Save ${fmtAmt(goal)} in ${y} year${y > 1 ? 's' : ''}` })));
  if (G.MONTHLY_AMT.includes(Math.round(flat / 50) * 50) && G.MONTHLY_YEARS.includes(years)) related.push({ path: monthlyPath(Math.round(flat / 50) * 50, 7, years), text: `${fmtAmt(Math.round(flat / 50) * 50)} a month at 7% for ${years} years` });
  const body = `${crumbs.html}
<h1>${title}</h1>
<p class="lead">Reaching <b>${fmtAmt(goal)}</b> in <b>${years} year${years > 1 ? 's' : ''}</b> takes <b>${money(flat)} a month</b> if the money sits in a non-interest account. Earning 4% in a high-yield savings account lowers that to <b>${money(hy)}</b>, because interest contributes ${money(goal - hy * n)} of the total.</p>
<div class="answer"><div class="big">${money(flat)} per month</div><div class="sub">${n} deposits · ${money(flat * 12 / 52)} a week · ${money(hy)} a month at 4% APY</div></div>
${H.stats([{ label: 'Goal', value: fmtAmt(goal) }, { label: 'Timeline', value: `${n} months` }, { label: 'Per paycheck (biweekly)', value: money(flat * 12 / 26) }, { label: 'Per day', value: money(flat * 12 / 365) }])}
${H.adUnit('inContent')}
<h2>Monthly amount by interest rate</h2>
<p>Interest does more work the longer the timeline. Here is the monthly deposit needed to hit ${fmtAmt(goal)} in ${years} year${years > 1 ? 's' : ''} at each APY.</p>
${H.table(['APY', 'Monthly deposit', 'Interest earned'], apyRows)}
<h2>${fmtAmt(goal)} on other timelines</h2>
${H.table(['Timeline', 'Monthly (0%)', 'Monthly (4% APY)'], timeRows)}
${H.calcForm('goal', [
    { name: 'goal', label: 'Goal ($)', value: goal, step: 100 },
    { name: 'years', label: 'Years', value: years, step: 0.5, max: 60 },
    { name: 'rate', label: 'APY (%)', value: 4, step: 0.1, max: 30 },
    { name: 'initial', label: 'Already saved ($)', value: 0, step: 100 },
  ])}
<h2>How this is calculated</h2>
<div class="formula">no interest: monthly = goal ÷ months = ${money(goal)} ÷ ${n} = ${money(flat)}<br>with interest: monthly = goal × i ÷ ((1 + i)^n − 1), i = APY ÷ 12</div>
<p class="note">Interest on savings is taxable in a regular account. Rates on high-yield accounts change with the market; 4% is an illustration, not a promise.</p>
${H.ctaBox('savings')}
${faq.html}
${H.relatedList(related)}`;
  return { path: goalPath(goal, years), title, description, body, jsonld: [crumbs.ld, faq.ld] };
}

function goalHub() {
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Savings Goal', path: '/savings-goal/' }]);
  const rows = [5000, 10000, 20000, 50000].map(g => [fmtAmt(g), money(g / 12), money(g / 24), money(g / 36), money(g / 60)]);
  const faq = H.faq([
    { q: 'How much should I have in an emergency fund?', a: 'Three to six months of essential expenses is the usual guideline. Start with one month and build from there.' },
    { q: 'Is it better to save or pay off debt?', a: 'Build a small cushion first, then put extra money toward any debt charging more than your savings earn, which is almost always credit cards.' },
  ]);
  const body = `${crumbs.html}
<h1>Savings Goal Calculator</h1>
<p class="lead">How much to set aside each month, week and day to hit a savings target by a deadline, with and without interest.</p>
${H.calcForm('goal', [{ name: 'goal', label: 'Goal ($)', value: 10000, step: 100 }, { name: 'years', label: 'Years', value: 2, step: 0.5, max: 60 }, { name: 'rate', label: 'APY (%)', value: 4, step: 0.1, max: 30 }, { name: 'initial', label: 'Already saved ($)', value: 0, step: 100 }], 'Savings goal calculator')}
${H.adUnit('inContent')}
<h2>Quick reference (no interest)</h2>
${H.table(['Goal', '1 year', '2 years', '3 years', '5 years'], rows)}
<h2>All savings goal pages</h2>
${G.GOAL_AMT.map(g => `<h3>Save ${fmtAmt(g)}</h3><div class="chips">${G.GOAL_YEARS.map(y => `<a href="${H.url(goalPath(g, y))}">in ${y} yr</a>`).join('')}</div>`).join('')}
${faq.html}`;
  return { path: '/savings-goal/', title: 'Savings Goal Calculator: How Much to Save Each Month', fullTitle: 'Savings Goal Calculator | WageFigures', description: 'Work out the monthly, weekly and daily savings needed to reach $1,000 to $100,000 in 1 to 10 years, with and without interest.', body, jsonld: [crumbs.ld, faq.ld] };
}

// ---------------------------------------------------------------- retirement income
function retirePage(monthly) {
  const annual = monthly * 12;
  const need4 = annual / 0.04;
  const title = `${fmtAmt(monthly)} a Month in Retirement: How Much You Need to Save`;
  const description = `${fmtAmt(monthly)} a month in retirement (${moneyWhole(annual)} a year) needs about ${moneyWhole(need4)} under the 4% rule, or ${moneyWhole(annual / 0.035)} at 3.5%. Monthly savings targets for 10 to 35 years.`;
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Retirement Income', path: '/retirement-income/' }, { name: `${fmtAmt(monthly)}/month`, path: retirePath(monthly) }]);
  const wrRows = [3, 3.5, 4, 4.5, 5].map(w => [pct(w), moneyWhole(annual / (w / 100)), `${(100 / w).toFixed(1)}× annual spending`]);
  const saveRows = [10, 15, 20, 25, 30, 35].map(y => [`${y} years`, money(M.monthlyForGoal(need4, 7, y * 12)), money(M.monthlyForGoal(need4, 5, y * 12))]);
  const ssRows = [1000, 1500, 2000, 2500].map(ss => [fmtAmt(ss), moneyWhole(Math.max(0, (monthly - ss) * 12 / 0.04))]);
  const faq = H.faq([
    { q: `How much do I need to retire on ${fmtAmt(monthly)} a month?`, a: `About <b>${moneyWhole(need4)}</b> using the 4% rule (25 times annual spending of ${moneyWhole(annual)}). A more conservative 3.5% withdrawal rate calls for ${moneyWhole(annual / 0.035)}.` },
    { q: `What is the 4% rule?`, a: `A guideline from the 1990s Trinity study: withdrawing 4% of a balanced portfolio in the first year of retirement, then adjusting for inflation, historically lasted at least 30 years in the large majority of U.S. market scenarios.` },
    { q: `How much should I save per month to reach ${moneyWhole(need4)}?`, a: `With a 7% average return: ${money(M.monthlyForGoal(need4, 7, 360))} a month over 30 years, ${money(M.monthlyForGoal(need4, 7, 240))} over 20 years, or ${money(M.monthlyForGoal(need4, 7, 120))} over 10 years.` },
    { q: `Does Social Security reduce what I need?`, a: `Yes. If Social Security covers $1,500 of the ${fmtAmt(monthly)}, your portfolio only needs to supply ${fmtAmt(monthly - 1500 > 0 ? monthly - 1500 : 0)} a month, which is about ${moneyWhole(Math.max(0, (monthly - 1500) * 12 / 0.04))} at a 4% withdrawal rate.` },
  ]);
  const related = G.neighbours(G.RETIRE_MONTHLY, monthly, 8).map(m => ({ path: retirePath(m), text: `${fmtAmt(m)} a month in retirement` }));
  const nearM = G.nearest(G.MONTHLY_AMT, M.monthlyForGoal(need4, 7, 360));
  related.push({ path: monthlyPath(nearM, 7, 30), text: `${fmtAmt(nearM)} a month at 7% for 30 years` });
  const body = `${crumbs.html}
<h1>${title}</h1>
<p class="lead">Spending <b>${fmtAmt(monthly)} a month</b> in retirement is <b>${moneyWhole(annual)} a year</b>. Under the widely used 4% rule that requires a nest egg of about <b>${moneyWhole(need4)}</b>. Social Security, a pension or part-time income reduces the amount your savings must cover.</p>
<div class="answer"><div class="big">${moneyWhole(need4)} needed</div><div class="sub">25 × ${moneyWhole(annual)} annual spending (4% withdrawal rate)</div></div>
${H.stats([{ label: 'Annual spending', value: moneyWhole(annual) }, { label: 'At 3.5% withdrawal', value: moneyWhole(annual / 0.035) }, { label: 'At 5% withdrawal', value: moneyWhole(annual / 0.05) }, { label: 'Save/mo for 30 yrs at 7%', value: money(M.monthlyForGoal(need4, 7, 360)) }])}
${H.adUnit('inContent')}
<h2>Nest egg by withdrawal rate</h2>
<p>A lower withdrawal rate is safer but needs a bigger portfolio. For ${moneyWhole(annual)} a year:</p>
${H.table(['Withdrawal rate', 'Portfolio needed', 'Multiple'], wrRows)}
<h2>Monthly saving needed to reach ${moneyWhole(need4)}</h2>
${H.table(['Years until retirement', 'At 7% return', 'At 5% return'], saveRows)}
<h2>If Social Security covers part of it</h2>
${H.table(['Social Security per month', 'Portfolio needed (4% rule)'], ssRows)}
${H.calcForm('retire', [
    { name: 'monthly', label: 'Monthly spending in retirement ($)', value: monthly, step: 100 },
    { name: 'rate', label: 'Withdrawal rate (%)', value: 4, step: 0.1, max: 20 },
  ])}
<h2>How this is calculated</h2>
<div class="formula">portfolio needed = annual spending ÷ withdrawal rate = ${money(annual)} ÷ 0.04 = ${money(need4)}</div>
<p class="note">Figures are in today's dollars and assume spending rises with inflation while the portfolio is invested. Taxes on withdrawals from pre-tax accounts mean you may need to draw more than you spend.</p>
${H.ctaBox('investing')}
${faq.html}
${H.relatedList(related)}`;
  return { path: retirePath(monthly), title, description, body, jsonld: [crumbs.ld, faq.ld] };
}

function retireHub() {
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Retirement Income', path: '/retirement-income/' }]);
  const rows = G.RETIRE_MONTHLY.map(m => [fmtAmt(m), moneyWhole(m * 12), moneyWhole(m * 12 / 0.04), moneyWhole(m * 12 / 0.035)]);
  const faq = H.faq([
    { q: 'How much do I need to retire?', a: 'A common starting point is 25 times your expected annual spending, which corresponds to a 4% withdrawal rate. Reduce the target by whatever Social Security or a pension will cover.' },
  ]);
  const body = `${crumbs.html}
<h1>Retirement Income Calculator</h1>
<p class="lead">How large a portfolio supports a given monthly income in retirement, and what to save to build it.</p>
${H.calcForm('retire', [{ name: 'monthly', label: 'Monthly spending in retirement ($)', value: 4000, step: 100 }, { name: 'rate', label: 'Withdrawal rate (%)', value: 4, step: 0.1, max: 20 }], 'Retirement income calculator')}
${H.adUnit('inContent')}
<h2>Portfolio needed by monthly income</h2>
${H.table(['Monthly income', 'Annual', 'At 4%', 'At 3.5%'], rows)}
<div class="chips">${G.RETIRE_MONTHLY.map(m => `<a href="${H.url(retirePath(m))}">${fmtAmt(m)}/mo</a>`).join('')}</div>
${faq.html}`;
  return { path: '/retirement-income/', title: 'Retirement Income Calculator: How Much You Need to Retire', fullTitle: 'Retirement Income Calculator | WageFigures', description: 'Find the portfolio size needed for $1,500 to $10,000 a month in retirement using the 4% rule and other withdrawal rates, plus monthly savings targets.', body, jsonld: [crumbs.ld, faq.ld] };
}

module.exports = [
  { id: 'lump', name: 'Compound Interest', basePath: '/compound-interest/', hub: lumpHub, *pages() { for (const a of G.LUMP_AMT) for (const r of G.LUMP_RATE) for (const y of G.LUMP_YEARS) yield lumpPage(a, r, y); } },
  { id: 'monthly', name: 'Monthly Investing', basePath: '/monthly-investing/', hub: monthlyHub, *pages() { for (const m of G.MONTHLY_AMT) for (const r of G.MONTHLY_RATE) for (const y of G.MONTHLY_YEARS) yield monthlyPage(m, r, y); } },
  { id: 'debt', name: 'Debt Payoff', basePath: '/debt-payoff/', hub: debtHub, *pages() { for (const b of G.DEBT_BAL) for (const a of G.DEBT_APR) for (const p of G.DEBT_PAY) if (validDebt(b, a, p)) yield debtPage(b, a, p); } },
  { id: 'goal', name: 'Savings Goal', basePath: '/savings-goal/', hub: goalHub, *pages() { for (const g of G.GOAL_AMT) for (const y of G.GOAL_YEARS) yield goalPage(g, y); } },
  { id: 'retire', name: 'Retirement Income', basePath: '/retirement-income/', hub: retireHub, *pages() { for (const m of G.RETIRE_MONTHLY) yield retirePage(m); } },
];
module.exports.paths = { lumpPath, monthlyPath, debtPath, goalPath, retirePath };
