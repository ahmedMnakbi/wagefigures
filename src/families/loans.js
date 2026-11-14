'use strict';
const M = require('../math');
const H = require('../html');
const G = require('./grids');
const { money, moneyWhole, pct, slugNum, compactMoney } = M;

const loanPath = (a, r, y) => `/loan-payment/${a}-loan-at-${slugNum(r)}-percent-for-${y}-years/`;
const carPath = (a, r, m) => `/car-payment/${a}-car-loan-at-${slugNum(r)}-percent-for-${m}-months/`;
const mortPath = (a, r, y) => `/mortgage-payment/${a}-mortgage-at-${slugNum(r)}-percent-for-${y}-years/`;
const downPath = (p, price) => `/down-payment/${slugNum(p)}-percent-down-on-${price}/`;
const fmtAmt = a => `$${a.toLocaleString()}`;

function amortTable(am, maxRows = 40) {
  return H.table(['Year', 'Principal paid', 'Interest paid', 'Remaining balance'], am.years.slice(0, maxRows).map(y => [`Year ${y.year}`, money(y.principal), money(y.interest), money(y.balance)]));
}

// ---------------------------------------------------------------- personal loan
function loanPage(amount, rate, years) {
  const n = years * 12;
  const am = M.amortizationByYear(amount, rate, n);
  const p = am.payment;
  const title = `${fmtAmt(amount)} Loan at ${pct(rate)} for ${years} Years: Monthly Payment`;
  const description = `Monthly payment on a ${fmtAmt(amount)} loan at ${pct(rate)} APR for ${years} years: ${money(p)}. Total interest ${money(am.totalInterest)}, total repaid ${money(am.totalPaid)}. Amortization schedule and term comparison.`;
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Loan Payment', path: '/loan-payment/' }, { name: `${compactMoney(amount)} at ${pct(rate)}, ${years} yr`, path: loanPath(amount, rate, years) }]);
  const termRows = [1, 2, 3, 4, 5, 6, 7, 10].map(y => { const a = M.amortizationByYear(amount, rate, y * 12); return [`${y} year${y > 1 ? 's' : ''}`, money(a.payment), money(a.totalInterest), money(a.totalPaid)]; });
  const rateRows = [rate - 2, rate - 1, rate, rate + 1, rate + 2, rate + 4].filter(r => r > 0).map(r => { const a = M.amortizationByYear(amount, r, n); return [pct(r), money(a.payment), money(a.totalInterest)]; });
  const extra = [25, 50, 100].map(e => { const res = M.debtPayoff(amount, rate, p + e); return [`+${money(e)} (${money(p + e)}/mo)`, M.yearsMonths(res.months), money(res.totalInterest), money(am.totalInterest - res.totalInterest)]; });
  const faq = H.faq([
    { q: `How much interest will I pay on a ${fmtAmt(amount)} loan at ${pct(rate)} over ${years} years?`, a: `<b>${money(am.totalInterest)}</b> in total, which is ${(am.totalInterest / amount * 100).toFixed(1)}% of the amount borrowed. You repay ${money(am.totalPaid)} altogether.` },
    { q: `What is the monthly payment on ${fmtAmt(amount)} at ${pct(rate)} for ${years} years?`, a: `<b>${money(p)}</b> per month for ${n} months, assuming a fixed rate and no fees rolled into the loan.` },
    { q: `What if I pay $100 extra each month?`, a: `Paying ${money(p + 100)} a month clears the loan in ${M.yearsMonths(M.debtPayoff(amount, rate, p + 100).months)} and saves about ${money(am.totalInterest - M.debtPayoff(amount, rate, p + 100).totalInterest)} in interest.` },
    { q: `How much does a 1% lower rate save?`, a: `At ${pct(rate - 1)} the payment would be ${money(M.monthlyPayment(amount, rate - 1, n))} and total interest ${money(M.amortizationByYear(amount, rate - 1, n).totalInterest)}, saving ${money(am.totalInterest - M.amortizationByYear(amount, rate - 1, n).totalInterest)} over the life of the loan.` },
  ]);
  const related = G.neighbours(G.LOAN_AMT, amount, 4).map(a => ({ path: loanPath(a, rate, years), text: `${fmtAmt(a)} loan at ${pct(rate)} for ${years} years` }))
    .concat(G.neighbours(G.LOAN_RATE, rate, 4).map(r => ({ path: loanPath(amount, r, years), text: `${fmtAmt(amount)} loan at ${pct(r)} for ${years} years` })))
    .concat(G.neighbours(G.LOAN_YEARS, years, 4).map(y => ({ path: loanPath(amount, rate, y), text: `${fmtAmt(amount)} loan at ${pct(rate)} for ${y} years` })))
    .concat(G.CAR_AMT.includes(amount) && G.CAR_RATE.includes(rate) && G.CAR_MONTHS.includes(n) ? [{ path: carPath(amount, rate, n), text: `${fmtAmt(amount)} car loan at ${pct(rate)} for ${n} months` }] : []);
  const body = `${crumbs.html}
<h1>${title}</h1>
<p class="lead">Borrowing <b>${fmtAmt(amount)}</b> at <b>${pct(rate)} APR</b> for <b>${years} years</b> costs <b>${money(p)} a month</b>. Over the full term you pay ${money(am.totalInterest)} in interest on top of the principal.</p>
<div class="answer"><div class="big">${money(p)} per month</div><div class="sub">${n} payments · ${money(am.totalInterest)} total interest · ${money(am.totalPaid)} total repaid</div></div>
${H.stats([{ label: 'Loan amount', value: fmtAmt(amount) }, { label: 'APR', value: pct(rate) }, { label: 'Term', value: `${years} years` }, { label: 'Interest as % of loan', value: `${(am.totalInterest / amount * 100).toFixed(1)}%` }])}
${H.adUnit('inContent')}
<h2>Amortization schedule by year</h2>
<p>Early payments are mostly interest; later ones are mostly principal. Here is how the ${fmtAmt(amount)} balance falls each year.</p>
${amortTable(am)}
<h2>Same loan, different terms</h2>
<p>A longer term lowers the monthly payment but raises the total interest. At ${pct(rate)}:</p>
${H.table(['Term', 'Monthly payment', 'Total interest', 'Total repaid'], termRows)}
<h2>How the rate changes the payment</h2>
${H.table(['APR', 'Monthly payment', 'Total interest'], rateRows)}
<h2>Paying a little extra</h2>
<p>Rounding the payment up shortens the loan without a refinance. Starting from ${money(p)} a month:</p>
${H.table(['Extra per month', 'Paid off in', 'Total interest', 'Interest saved'], extra)}
${H.calcForm('loan', [
    { name: 'amount', label: 'Loan amount ($)', value: amount, step: 100 },
    { name: 'rate', label: 'APR (%)', value: rate, step: 0.01, max: 100 },
    { name: 'years', label: 'Term (years)', value: years, step: 1, max: 40 },
  ])}
<h2>How this is calculated</h2>
<div class="formula">payment = P × r ÷ (1 − (1 + r)^−n)<br>P = ${money(amount)}, r = ${pct(rate)} ÷ 12 = ${(rate / 12).toFixed(4)}% per month, n = ${n} months<br>payment = ${money(p)}</div>
<p class="note">Assumes a fixed rate and equal monthly payments. Origination fees, insurance or late charges would increase the real cost.</p>
${H.ctaBox('loan')}
${faq.html}
${H.relatedList(related)}`;
  return { path: loanPath(amount, rate, years), title, description, body, jsonld: [crumbs.ld, faq.ld] };
}

function loanHub() {
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Loan Payment', path: '/loan-payment/' }]);
  const rows = [5000, 10000, 20000, 30000, 50000].map(a => [fmtAmt(a), money(M.monthlyPayment(a, 7, 36)), money(M.monthlyPayment(a, 7, 60)), money(M.monthlyPayment(a, 10, 36)), money(M.monthlyPayment(a, 10, 60))]);
  const faq = H.faq([
    { q: 'How is a loan payment calculated?', a: 'With the amortization formula: payment = P × r ÷ (1 − (1 + r)^−n), where P is the amount borrowed, r the monthly interest rate (APR ÷ 12) and n the number of monthly payments.' },
    { q: 'What is the difference between APR and interest rate?', a: 'The interest rate is the cost of borrowing the principal. APR also includes most lender fees spread over the term, so it is the better number for comparing offers.' },
  ]);
  const body = `${crumbs.html}
<h1>Loan Payment Calculator</h1>
<p class="lead">Monthly payment, total interest and a year-by-year schedule for any personal loan. Pick an amount below or enter your own numbers.</p>
${H.calcForm('loan', [{ name: 'amount', label: 'Loan amount ($)', value: 10000, step: 100 }, { name: 'rate', label: 'APR (%)', value: 8, step: 0.01, max: 100 }, { name: 'years', label: 'Term (years)', value: 3, step: 1, max: 40 }], 'Loan payment calculator')}
${H.adUnit('inContent')}
<h2>Quick reference</h2>
${H.table(['Amount', '7% · 3 yr', '7% · 5 yr', '10% · 3 yr', '10% · 5 yr'], rows)}
<h2>All loan pages</h2>
${G.LOAN_AMT.map(a => `<h3>${fmtAmt(a)} loan</h3><div class="chips">${G.LOAN_RATE.map(r => G.LOAN_YEARS.map(y => `<a href="${H.url(loanPath(a, r, y))}">${pct(r)} · ${y} yr</a>`).join('')).join('')}</div>`).join('')}
${faq.html}`;
  return { path: '/loan-payment/', title: 'Loan Payment Calculator: Monthly Payment and Total Interest', fullTitle: 'Loan Payment Calculator | WageFigures', description: 'Calculate the monthly payment, total interest and amortization schedule for a personal loan. Ready-made pages for loans from $1,000 to $100,000 at 5% to 15% APR.', body, jsonld: [crumbs.ld, faq.ld] };
}

// ---------------------------------------------------------------- car loan
function carPage(amount, rate, months) {
  const am = M.amortizationByYear(amount, rate, months);
  const p = am.payment;
  const title = `${fmtAmt(amount)} Car Loan at ${pct(rate)} for ${months} Months: Payment`;
  const description = `A ${fmtAmt(amount)} car loan at ${pct(rate)} APR for ${months} months costs ${money(p)} a month, with ${money(am.totalInterest)} in total interest. Compare 36 to 84 month terms and rates.`;
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Car Payment', path: '/car-payment/' }, { name: `${compactMoney(amount)} at ${pct(rate)}, ${months} mo`, path: carPath(amount, rate, months) }]);
  const termRows = G.CAR_MONTHS.map(m => { const a = M.amortizationByYear(amount, rate, m); return [`${m} months (${m / 12} yr)`, money(a.payment), money(a.totalInterest), money(a.totalPaid)]; });
  const rateRows = G.CAR_RATE.map(r => [pct(r), money(M.monthlyPayment(amount, r, months)), money(M.amortizationByYear(amount, r, months).totalInterest)]);
  const faq = H.faq([
    { q: `What is the monthly payment on a ${fmtAmt(amount)} car at ${pct(rate)} for ${months} months?`, a: `<b>${money(p)}</b> a month, assuming the ${fmtAmt(amount)} is the amount financed after any down payment and trade-in.` },
    { q: `How much interest is paid on a ${fmtAmt(amount)} car loan over ${months} months at ${pct(rate)}?`, a: `<b>${money(am.totalInterest)}</b>. The car ends up costing ${money(am.totalPaid)} in payments.` },
    { q: `Is ${months} months a long car loan?`, a: months >= 72 ? `Yes. Loans of 72 months or more mean you may owe more than the car is worth for several years, because cars lose value faster than a long loan pays down. Gap insurance is worth considering.` : months === 60 ? `Sixty months is the most common car loan term in the U.S. It balances a manageable payment against total interest; shorter terms save money if the payment fits.` : `No. ${months} months is on the shorter side, which keeps total interest low (${money(am.totalInterest)} here) and builds equity quickly.` },
    { q: `How much would a $2,000 larger down payment save?`, a: `Financing ${fmtAmt(amount - 2000)} instead drops the payment to ${money(M.monthlyPayment(amount - 2000, rate, months))} and saves ${money(am.totalInterest - M.amortizationByYear(amount - 2000, rate, months).totalInterest)} in interest.` },
  ]);
  const related = G.neighbours(G.CAR_AMT, amount, 4).map(a => ({ path: carPath(a, rate, months), text: `${fmtAmt(a)} car loan at ${pct(rate)} for ${months} months` }))
    .concat(G.neighbours(G.CAR_RATE, rate, 4).map(r => ({ path: carPath(amount, r, months), text: `${fmtAmt(amount)} car loan at ${pct(r)} for ${months} months` })))
    .concat(G.CAR_MONTHS.filter(m => m !== months).map(m => ({ path: carPath(amount, rate, m), text: `${fmtAmt(amount)} car loan at ${pct(rate)} for ${m} months` })));
  const body = `${crumbs.html}
<h1>${title}</h1>
<p class="lead">Financing <b>${fmtAmt(amount)}</b> at <b>${pct(rate)}</b> over <b>${months} months</b> means a car payment of <b>${money(p)}</b>. Interest adds ${money(am.totalInterest)} to the price of the car.</p>
<div class="answer"><div class="big">${money(p)} per month</div><div class="sub">${months} payments · ${money(am.totalInterest)} interest · ${money(p * 12 / 365)} per day</div></div>
${H.stats([{ label: 'Amount financed', value: fmtAmt(amount) }, { label: 'APR', value: pct(rate) }, { label: 'Term', value: `${months} months` }, { label: 'Total cost', value: money(am.totalPaid) }])}
${H.adUnit('inContent')}
<h2>Compare loan terms for ${fmtAmt(amount)} at ${pct(rate)}</h2>
${H.table(['Term', 'Monthly payment', 'Total interest', 'Total paid'], termRows)}
<h2>Compare rates for ${months} months</h2>
<p>Your credit score drives the rate. Here is the same ${fmtAmt(amount)} over ${months} months at each APR.</p>
${H.table(['APR', 'Monthly payment', 'Total interest'], rateRows)}
<h2>Balance by year</h2>
${amortTable(am)}
${H.calcForm('loan', [
    { name: 'amount', label: 'Amount financed ($)', value: amount, step: 100 },
    { name: 'rate', label: 'APR (%)', value: rate, step: 0.01, max: 100 },
    { name: 'months', label: 'Term (months)', value: months, step: 1, max: 120 },
  ])}
<h2>How this is calculated</h2>
<div class="formula">payment = P × r ÷ (1 − (1 + r)^−n), with P = ${money(amount)}, r = ${(rate / 12).toFixed(4)}% monthly, n = ${months}<br>= ${money(p)}</div>
<p class="note">Sales tax, registration, dealer fees and add-ons increase the amount financed unless paid up front. Rates above assume a simple-interest, fixed-rate loan.</p>
${H.ctaBox('car')}
${faq.html}
${H.relatedList(related)}`;
  return { path: carPath(amount, rate, months), title, description, body, jsonld: [crumbs.ld, faq.ld] };
}

function carHub() {
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Car Payment', path: '/car-payment/' }]);
  const rows = [15000, 25000, 35000, 45000].map(a => [fmtAmt(a), money(M.monthlyPayment(a, 6, 48)), money(M.monthlyPayment(a, 6, 60)), money(M.monthlyPayment(a, 6, 72)), money(M.monthlyPayment(a, 9, 60))]);
  const faq = H.faq([
    { q: 'What car payment can I afford?', a: 'A common guideline is to keep all car costs (payment, insurance, fuel) under 15–20% of take-home pay, and the payment alone under 10%.' },
    { q: 'Is a 72 or 84 month car loan a bad idea?', a: 'Longer terms lower the payment but add a lot of interest and keep you underwater longer. If you need 84 months to afford a car, a cheaper car is usually the better choice.' },
  ]);
  const body = `${crumbs.html}
<h1>Car Payment Calculator</h1>
<p class="lead">Monthly payment and total interest for an auto loan, with 36 to 84 month comparisons.</p>
${H.calcForm('loan', [{ name: 'amount', label: 'Amount financed ($)', value: 25000, step: 100 }, { name: 'rate', label: 'APR (%)', value: 7, step: 0.01, max: 100 }, { name: 'months', label: 'Term (months)', value: 60, step: 1, max: 120 }], 'Car payment calculator')}
${H.adUnit('inContent')}
<h2>Quick reference</h2>
${H.table(['Financed', '6% · 48 mo', '6% · 60 mo', '6% · 72 mo', '9% · 60 mo'], rows)}
<h2>All car loan pages</h2>
${G.CAR_AMT.map(a => `<h3>${fmtAmt(a)} car loan</h3><div class="chips">${G.CAR_RATE.map(r => G.CAR_MONTHS.map(m => `<a href="${H.url(carPath(a, r, m))}">${pct(r)} · ${m} mo</a>`).join('')).join('')}</div>`).join('')}
${faq.html}`;
  return { path: '/car-payment/', title: 'Car Payment Calculator: Monthly Auto Loan Payment', fullTitle: 'Car Payment Calculator | WageFigures', description: 'Calculate a car payment for any amount, rate and term from 36 to 84 months, with total interest and year-by-year balance.', body, jsonld: [crumbs.ld, faq.ld] };
}

// ---------------------------------------------------------------- mortgage
function mortPage(amount, rate, years) {
  const n = years * 12;
  const am = M.amortizationByYear(amount, rate, n);
  const p = am.payment;
  const other = years === 30 ? 15 : 30;
  const amOther = M.amortizationByYear(amount, rate, other * 12);
  const title = `${fmtAmt(amount)} Mortgage at ${pct(rate)} for ${years} Years: Monthly Payment`;
  const description = `A ${fmtAmt(amount)} mortgage at ${pct(rate)} for ${years} years costs ${money(p)} a month in principal and interest. Total interest ${money(am.totalInterest)}. Schedule, income needed, ${other}-year comparison.`;
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Mortgage Payment', path: '/mortgage-payment/' }, { name: `${compactMoney(amount)} at ${pct(rate)}, ${years} yr`, path: mortPath(amount, rate, years) }]);
  const rateRows = G.MORT_RATE.map(r => [pct(r), money(M.monthlyPayment(amount, r, n)), money(M.amortizationByYear(amount, r, n).totalInterest)]);
  const incomeNeeded = p * 12 / 0.28;
  const withEscrow = p + amount * 0.011 / 12 + 150; // rough: 1.1% property tax, $150/mo insurance
  const extra = [100, 200, 500].map(e => { const res = M.debtPayoff(amount, rate, p + e); return [`+${money(e)}`, M.yearsMonths(res.months), money(am.totalInterest - res.totalInterest)]; });
  const faq = H.faq([
    { q: `How much income do I need for a ${fmtAmt(amount)} mortgage at ${pct(rate)}?`, a: `Using the common 28% rule (housing payment no more than 28% of gross income), a ${money(p)} payment calls for roughly <b>${moneyWhole(incomeNeeded)}</b> a year before taxes. Lenders also look at total debt, credit score and down payment.` },
    { q: `What is the total interest on a ${fmtAmt(amount)} mortgage at ${pct(rate)} over ${years} years?`, a: `<b>${money(am.totalInterest)}</b>, which is ${(am.totalInterest / amount * 100).toFixed(0)}% of the amount borrowed. Total payments come to ${money(am.totalPaid)}.` },
    { q: `What would the payment be on a ${other}-year term?`, a: `${money(amOther.payment)} a month, with ${money(amOther.totalInterest)} in total interest. ${other < years ? `That is ${money(amOther.payment - p)} more per month but saves ${money(am.totalInterest - amOther.totalInterest)} in interest.` : `That is ${money(p - amOther.payment)} less per month but costs ${money(amOther.totalInterest - am.totalInterest)} more in interest.`}` },
    { q: `Does ${money(p)} include taxes and insurance?`, a: `No. It is principal and interest only. With a typical property tax bill and homeowners insurance the full monthly payment might be around ${money(withEscrow)}, and private mortgage insurance adds more if you put down less than 20%.` },
    { q: `What home price does a ${fmtAmt(amount)} mortgage buy?`, a: `With 20% down, a ${fmtAmt(amount)} loan buys a ${moneyWhole(amount / 0.8)} home. With 10% down it is ${moneyWhole(amount / 0.9)}, and with 5% down ${moneyWhole(amount / 0.95)}.` },
  ]);
  const related = G.neighbours(G.MORT_AMT, amount, 6).map(a => ({ path: mortPath(a, rate, years), text: `${fmtAmt(a)} mortgage at ${pct(rate)} for ${years} years` }))
    .concat(G.neighbours(G.MORT_RATE, rate, 4).map(r => ({ path: mortPath(amount, r, years), text: `${fmtAmt(amount)} mortgage at ${pct(r)} for ${years} years` })))
    .concat([{ path: mortPath(amount, rate, other), text: `${fmtAmt(amount)} mortgage at ${pct(rate)} for ${other} years` }]);
  const price20 = G.nearest(G.DOWN_PRICE, amount / 0.8);
  related.push({ path: downPath(20, price20), text: `20% down on a $${price20.toLocaleString()} home` });
  const body = `${crumbs.html}
<h1>${title}</h1>
<p class="lead">A <b>${fmtAmt(amount)}</b> home loan at <b>${pct(rate)}</b> for <b>${years} years</b> costs <b>${money(p)} a month</b> in principal and interest. Over the life of the loan you pay ${money(am.totalInterest)} in interest.</p>
<div class="answer"><div class="big">${money(p)} per month</div><div class="sub">Principal & interest · ${n} payments · ${money(am.totalInterest)} total interest</div></div>
${H.stats([{ label: 'Loan amount', value: fmtAmt(amount) }, { label: 'Rate', value: pct(rate) }, { label: 'Total repaid', value: money(am.totalPaid) }, { label: 'Income suggested (28% rule)', value: moneyWhole(incomeNeeded) }])}
${H.adUnit('inContent')}
<h2>${years}-year vs ${other}-year</h2>
${H.table(['Term', 'Monthly P&I', 'Total interest', 'Total paid'], [[`${years} years`, money(p), money(am.totalInterest), money(am.totalPaid)], [`${other} years`, money(amOther.payment), money(amOther.totalInterest), money(amOther.totalPaid)]])}
<h2>Payment at other rates</h2>
<p>Rates move daily. The same ${fmtAmt(amount)} over ${years} years:</p>
${H.table(['Rate', 'Monthly P&I', 'Total interest'], rateRows)}
<h2>Paying extra each month</h2>
${H.table(['Extra per month', 'Paid off in', 'Interest saved'], extra)}
<h2>Amortization schedule</h2>
${amortTable(am)}
${H.calcForm('mortgage', [
    { name: 'amount', label: 'Loan amount ($)', value: amount, step: 1000 },
    { name: 'rate', label: 'Rate (%)', value: rate, step: 0.01, max: 30 },
    { name: 'years', label: 'Term (years)', value: years, step: 1, max: 40 },
    { name: 'tax', label: 'Property tax per year ($)', value: Math.round(amount * 0.011 / 100) * 100, step: 100 },
    { name: 'insurance', label: 'Home insurance per year ($)', value: 1800, step: 100 },
  ])}
<h2>How this is calculated</h2>
<div class="formula">payment = P × r ÷ (1 − (1 + r)^−n), with P = ${money(amount)}, r = ${(rate / 12).toFixed(4)}% per month, n = ${n}<br>= ${money(p)}</div>
<p class="note">Fixed-rate loan, principal and interest only. Property taxes, homeowners insurance, HOA dues and mortgage insurance are usually collected on top of this figure.</p>
${H.ctaBox('mortgage')}
${faq.html}
${H.relatedList(related)}`;
  return { path: mortPath(amount, rate, years), title, description, body, jsonld: [crumbs.ld, faq.ld] };
}

function mortHub() {
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Mortgage Payment', path: '/mortgage-payment/' }]);
  const rows = [200000, 300000, 400000, 500000, 600000].map(a => [fmtAmt(a), money(M.monthlyPayment(a, 6, 360)), money(M.monthlyPayment(a, 6.5, 360)), money(M.monthlyPayment(a, 7, 360)), money(M.monthlyPayment(a, 6.5, 180))]);
  const faq = H.faq([
    { q: 'What does a mortgage payment include?', a: 'Principal and interest always; most lenders also collect property tax and homeowners insurance into an escrow account, and PMI if the down payment is under 20%. Together these are often called PITI.' },
    { q: 'How much house can I afford?', a: 'A long-standing guideline is a total housing payment under 28% of gross monthly income and total debt payments under 36%. Lenders may allow more, but less leaves room for everything else.' },
  ]);
  const body = `${crumbs.html}
<h1>Mortgage Payment Calculator</h1>
<p class="lead">Principal and interest for any loan amount and rate, with 15 and 30 year schedules, income guidelines and extra-payment savings.</p>
${H.calcForm('mortgage', [{ name: 'amount', label: 'Loan amount ($)', value: 350000, step: 1000 }, { name: 'rate', label: 'Rate (%)', value: 6.5, step: 0.01, max: 30 }, { name: 'years', label: 'Term (years)', value: 30, step: 1, max: 40 }, { name: 'tax', label: 'Property tax per year ($)', value: 3800, step: 100 }, { name: 'insurance', label: 'Home insurance per year ($)', value: 1800, step: 100 }], 'Mortgage calculator')}
${H.adUnit('inContent')}
<h2>Quick reference (principal & interest)</h2>
${H.table(['Loan', '6% · 30 yr', '6.5% · 30 yr', '7% · 30 yr', '6.5% · 15 yr'], rows)}
<h2>All mortgage pages</h2>
${G.MORT_AMT.map(a => `<h3>${fmtAmt(a)} mortgage</h3><div class="chips">${G.MORT_RATE.map(r => G.MORT_YEARS.map(y => `<a href="${H.url(mortPath(a, r, y))}">${pct(r)} · ${y} yr</a>`).join('')).join('')}</div>`).join('')}
${faq.html}
<h2>Related tools</h2><ul class="related"><li><a href="${H.url('/down-payment/')}">Down payment calculator</a></li><li><a href="${H.url('/salary-to-hourly/')}">Salary to hourly</a></li></ul>`;
  return { path: '/mortgage-payment/', title: 'Mortgage Payment Calculator: Monthly Payment by Rate and Term', fullTitle: 'Mortgage Payment Calculator | WageFigures', description: 'Calculate the monthly mortgage payment for loans from $100,000 to $1,000,000 at 4% to 8%, with amortization schedules, total interest and the income needed.', body, jsonld: [crumbs.ld, faq.ld] };
}

// ---------------------------------------------------------------- down payment
function downPage(p, price) {
  const dp = price * p / 100, loan = price - dp;
  const pStr = `$${price.toLocaleString()}`;
  const title = `${pct(p)} Down on a ${pStr} House: Down Payment and Loan Amount`;
  const description = `${pct(p)} down on a ${pStr} home is ${moneyWhole(dp)}, leaving a ${moneyWhole(loan)} loan: ${money(M.monthlyPayment(loan, 6.5, 360))} a month at 6.5% over 30 years. ${p < 20 ? 'PMI likely applies.' : 'No PMI needed.'}`;
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Down Payment', path: '/down-payment/' }, { name: `${pct(p)} on ${compactMoney(price)}`, path: downPath(p, price) }]);
  const pctRows = G.DOWN_PCT.map(x => { const d = price * x / 100; return [pct(x), moneyWhole(d), moneyWhole(price - d), money(M.monthlyPayment(price - d, 6.5, 360)), x < 20 ? 'Likely' : 'No']; });
  const rateRows = [5.5, 6, 6.5, 7, 7.5].map(r => [pct(r), money(M.monthlyPayment(loan, r, 360)), money(M.monthlyPayment(loan, r, 180))]);
  const closingLow = price * 0.02, closingHigh = price * 0.05;
  const pmi = p < 20 ? loan * 0.007 / 12 : 0;
  const faq = H.faq([
    { q: `How much is ${pct(p)} down on ${pStr}?`, a: `<b>${moneyWhole(dp)}</b>. Multiply ${price.toLocaleString()} by ${(p / 100).toFixed(3).replace(/0+$/, '')}.` },
    { q: `Will I pay PMI with ${pct(p)} down?`, a: p < 20 ? `Probably yes on a conventional loan. PMI typically costs 0.3–1.5% of the loan per year; at about 0.7% that is roughly ${money(pmi)} a month until you reach 20% equity.` : `No. Conventional lenders do not require private mortgage insurance when the down payment is 20% or more.` },
    { q: `How much cash do I need to close on a ${pStr} home with ${pct(p)} down?`, a: `The down payment of ${moneyWhole(dp)} plus closing costs, which usually run 2–5% of the price (${moneyWhole(closingLow)}–${moneyWhole(closingHigh)}). Budget roughly ${moneyWhole(dp + closingLow)}–${moneyWhole(dp + closingHigh)} in total, before any seller credits.` },
    { q: `How long does it take to save ${moneyWhole(dp)}?`, a: `Saving $500 a month takes about ${M.yearsMonths(Math.ceil(dp / 500))}; $1,000 a month takes ${M.yearsMonths(Math.ceil(dp / 1000))}; $2,000 a month takes ${M.yearsMonths(Math.ceil(dp / 2000))}, ignoring interest.` },
  ]);
  const related = G.DOWN_PCT.filter(x => x !== p).map(x => ({ path: downPath(x, price), text: `${pct(x)} down on ${pStr}` }))
    .concat(G.neighbours(G.DOWN_PRICE, price, 6).map(pr => ({ path: downPath(p, pr), text: `${pct(p)} down on $${pr.toLocaleString()}` })));
  const nearLoan = G.nearest(G.MORT_AMT, loan);
  related.push({ path: mortPath(nearLoan, 6.5, 30), text: `$${nearLoan.toLocaleString()} mortgage at 6.5% for 30 years` });
  const nearGoal = G.nearest(G.GOAL_AMT, dp);
  related.push({ path: `/savings-goal/save-${nearGoal}-in-3-years/`, text: `Save $${nearGoal.toLocaleString()} in 3 years` });
  const body = `${crumbs.html}
<h1>${title}</h1>
<p class="lead">Putting <b>${pct(p)} down</b> on a <b>${pStr}</b> home means a down payment of <b>${moneyWhole(dp)}</b> and a mortgage of <b>${moneyWhole(loan)}</b>. ${p < 20 ? 'Because this is under 20%, expect private mortgage insurance on a conventional loan.' : 'At 20% or more you avoid private mortgage insurance.'}</p>
<div class="answer"><div class="big">${moneyWhole(dp)} down payment</div><div class="sub">Loan amount ${moneyWhole(loan)} · ${money(M.monthlyPayment(loan, 6.5, 360))}/month P&I at 6.5%, 30 years</div></div>
${H.stats([{ label: 'Home price', value: pStr }, { label: 'Down payment', value: moneyWhole(dp) }, { label: 'Loan amount', value: moneyWhole(loan) }, { label: 'Closing costs (2–5%)', value: `${moneyWhole(closingLow)}–${moneyWhole(closingHigh)}` }])}
${H.adUnit('inContent')}
<h2>Other down payments on ${pStr}</h2>
${H.table(['Down', 'Down payment', 'Loan amount', 'Monthly P&I (6.5%, 30 yr)', 'PMI?'], pctRows)}
<h2>Monthly payment on the ${moneyWhole(loan)} loan</h2>
${H.table(['Rate', '30-year P&I', '15-year P&I'], rateRows)}
${H.calcForm('down', [
    { name: 'price', label: 'Home price ($)', value: price, step: 1000 },
    { name: 'percent', label: 'Down payment (%)', value: p, step: 0.5, max: 100 },
    { name: 'rate', label: 'Mortgage rate (%)', value: 6.5, step: 0.01, max: 30 },
  ])}
<h2>How this is calculated</h2>
<div class="formula">down payment = price × percent ÷ 100 = ${money(price)} × ${p / 100} = ${money(dp)}<br>loan amount = price − down payment = ${money(loan)}</div>
<p class="note">Monthly figures are principal and interest only. Taxes, insurance and PMI are extra. Minimums vary by loan type: conventional from 3%, FHA 3.5%, VA and USDA can be 0%.</p>
${H.ctaBox('mortgage')}
${faq.html}
${H.relatedList(related)}`;
  return { path: downPath(p, price), title, description, body, jsonld: [crumbs.ld, faq.ld] };
}

function downHub() {
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Down Payment', path: '/down-payment/' }]);
  const rows = [250000, 350000, 450000, 600000].map(pr => [`$${pr.toLocaleString()}`, moneyWhole(pr * 0.035), moneyWhole(pr * 0.05), moneyWhole(pr * 0.10), moneyWhole(pr * 0.20)]);
  const faq = H.faq([
    { q: 'What is the minimum down payment on a house?', a: 'Conventional loans start at 3% for qualified first-time buyers, FHA loans need 3.5%, and VA or USDA loans can require nothing down. Twenty percent avoids mortgage insurance but is not required.' },
    { q: 'Is it better to put 20% down?', a: 'Twenty percent avoids PMI and lowers the payment, but waiting years to save it can cost more in rent and price increases than PMI would. Many buyers put down less and cancel PMI once they reach 20% equity.' },
  ]);
  const body = `${crumbs.html}
<h1>Down Payment Calculator</h1>
<p class="lead">Down payment amount, resulting loan and monthly payment for any home price and percentage.</p>
${H.calcForm('down', [{ name: 'price', label: 'Home price ($)', value: 400000, step: 1000 }, { name: 'percent', label: 'Down payment (%)', value: 10, step: 0.5, max: 100 }, { name: 'rate', label: 'Mortgage rate (%)', value: 6.5, step: 0.01, max: 30 }], 'Down payment calculator')}
${H.adUnit('inContent')}
<h2>Quick reference</h2>
${H.table(['Home price', '3.5% down', '5% down', '10% down', '20% down'], rows)}
<h2>All down payment pages</h2>
${G.DOWN_PRICE.map(pr => `<h3>$${pr.toLocaleString()} home</h3><div class="chips">${G.DOWN_PCT.map(p => `<a href="${H.url(downPath(p, pr))}">${pct(p)} down</a>`).join('')}</div>`).join('')}
${faq.html}`;
  return { path: '/down-payment/', title: 'Down Payment Calculator: How Much to Put Down on a House', fullTitle: 'Down Payment Calculator | WageFigures', description: 'Calculate the down payment, loan amount and monthly payment for any home price from $150,000 to $1,000,000 at 3% to 25% down.', body, jsonld: [crumbs.ld, faq.ld] };
}

module.exports = [
  { id: 'loan', name: 'Loan Payment', basePath: '/loan-payment/', hub: loanHub, *pages() { for (const a of G.LOAN_AMT) for (const r of G.LOAN_RATE) for (const y of G.LOAN_YEARS) yield loanPage(a, r, y); } },
  { id: 'car', name: 'Car Payment', basePath: '/car-payment/', hub: carHub, *pages() { for (const a of G.CAR_AMT) for (const r of G.CAR_RATE) for (const m of G.CAR_MONTHS) yield carPage(a, r, m); } },
  { id: 'mortgage', name: 'Mortgage Payment', basePath: '/mortgage-payment/', hub: mortHub, *pages() { for (const a of G.MORT_AMT) for (const r of G.MORT_RATE) for (const y of G.MORT_YEARS) yield mortPage(a, r, y); } },
  { id: 'down', name: 'Down Payment', basePath: '/down-payment/', hub: downHub, *pages() { for (const pr of G.DOWN_PRICE) for (const p of G.DOWN_PCT) yield downPage(p, pr); } },
];
module.exports.paths = { loanPath, carPath, mortPath, downPath };
