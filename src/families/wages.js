'use strict';
const M = require('../math');
const H = require('../html');
const G = require('./grids');
const { money, moneyWhole, pct, slugNum } = M;

// ---------------------------------------------------------------- hourly → salary
const fmtRate = r => ' (r % 1 ? r.toFixed(2).replace('.', '-') : String(r)); // 18.5 -> 18-50, 7.25 -> 7-25
const hourlyPath = r => `/hourly-to-salary/${hourlySlug(r)}-an-hour-is-how-much-a-year/`;
const salaryPath = s => `/salary-to-hourly/${s}-a-year-is-how-much-an-hour/`;
const raisePath = (p, s) => `/raise-calculator/${slugNum(p)}-percent-raise-on-${s}/`;

function hourlyPage(rate) {
  const a = M.hourlyToAll(rate);
  const title = `${fmtRate(rate)} an Hour Is How Much a Year?`;
  const description = `${fmtRate(rate)} an hour is ${moneyWhole(a.yearly)} a year before taxes (40 hours a week): ${money(a.monthly)} a month, ${money(a.biweekly)} biweekly, ${money(a.weekly)} a week. Part-time and overtime figures too.`;
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Hourly to Salary', path: '/hourly-to-salary/' }, { name: `${fmtRate(rate)}/hour`, path: hourlyPath(rate) }]);
  const hoursRows = [20, 25, 30, 32, 35, 40, 45, 50].map(h => { const x = M.hourlyToAll(rate, h); return [`${h} hours`, money(x.weekly), money(x.monthly), moneyWhole(x.yearly)]; });
  const weeksRows = [48, 50, 52].map(w => [`${w} weeks (${52 - w === 0 ? 'no unpaid time off' : `${52 - w} unpaid weeks`})`, moneyWhole(rate * 40 * w), money(rate * 40 * w / 12)]);
  const ot = rate * 1.5;
  const minMultiple = (rate / 7.25).toFixed(1);
  const faq = H.faq([
    { q: `How much is ${fmtRate(rate)} an hour per month?`, a: `About <b>${money(a.monthly)}</b> a month before taxes, based on ${moneyWhole(a.yearly)} a year divided by 12. Months have different numbers of workdays, so individual paychecks vary.` },
    { q: `How much is ${fmtRate(rate)} an hour biweekly?`, a: `<b>${money(a.biweekly)}</b> every two weeks for 80 hours of work. Semi-monthly pay (24 paychecks a year) would be ${money(a.semimonthly)}.` },
    { q: `How much is ${fmtRate(rate)} an hour part-time?`, a: `At 20 hours a week you would earn ${money(rate * 20)} a week, or about ${moneyWhole(rate * 20 * 52)} a year. At 30 hours a week it is ${moneyWhole(rate * 30 * 52)} a year.` },
    { q: `What is ${fmtRate(rate)} an hour after taxes?`, a: `It depends on your state, filing status and benefits, but most hourly workers take home roughly 75–85% of gross pay after federal income tax and Social Security and Medicare. For ${moneyWhole(a.yearly)} a year that is very roughly ${moneyWhole(a.yearly * 0.75)}–${moneyWhole(a.yearly * 0.85)}. Use an official withholding calculator for an exact figure.` },
    { q: `What is overtime pay at ${fmtRate(rate)} an hour?`, a: `Time-and-a-half is <b>${money(ot)}</b> an hour. Five overtime hours a week adds ${money(ot * 5)} a week, or about ${moneyWhole(ot * 5 * 52)} a year.` },
  ]);
  const nearSalary = G.nearest(G.SALARY, a.yearly);
  const nearRaiseSalary = G.nearest(G.RAISE_SALARY, a.yearly);
  const related = G.neighbours(G.HOURLY, rate, 10).map(r => ({ path: hourlyPath(r), text: `${fmtRate(r)} an hour is how much a year?` }))
    .concat([
      { path: salaryPath(nearSalary), text: `$${nearSalary.toLocaleString()} a year is how much an hour?` },
      { path: raisePath(5, nearRaiseSalary), text: `5% raise on $${nearRaiseSalary.toLocaleString()}` },
      { path: '/savings-goal/', text: 'How much to save each month for a goal' },
    ]);
  const body = `${crumbs.html}
<h1>${title}</h1>
<p class="lead">Working full time at ${fmtRate(rate)} an hour comes to <b>${moneyWhole(a.yearly)} a year</b> before taxes. Here is how that breaks down by month, week and day, and what changes if you work fewer hours or take unpaid time off.</p>
<div class="answer"><div class="big">${moneyWhole(a.yearly)} per year</div><div class="sub">${fmtRate(rate)} × 40 hours × 52 weeks = ${money(a.yearly)} gross annual income</div></div>
${H.stats([{ label: 'Monthly', value: money(a.monthly) }, { label: 'Biweekly', value: money(a.biweekly) }, { label: 'Weekly', value: money(a.weekly) }, { label: 'Daily (8 h)', value: money(a.daily) }])}
${H.adUnit('inContent')}
<h2>${fmtRate(rate)} an hour by hours worked per week</h2>
<p>Not everyone works 40 hours. This table shows yearly and monthly pay at ${fmtRate(rate)} an hour for common schedules, assuming 52 paid weeks.</p>
${H.table(['Hours per week', 'Weekly', 'Monthly', 'Yearly'], hoursRows)}
<h2>If you take unpaid time off</h2>
<p>Hourly workers are usually not paid for weeks they do not work. Two unpaid weeks a year lowers the total to ${moneyWhole(rate * 40 * 50)}.</p>
${H.table(['Weeks worked', 'Yearly', 'Monthly average'], weeksRows)}
${H.calcForm('hourly', [
    { name: 'rate', label: 'Hourly wage ($)', value: rate, step: 0.01 },
    { name: 'hours', label: 'Hours per week', value: 40, step: 0.5, max: 168 },
    { name: 'weeks', label: 'Paid weeks per year', value: 52, step: 1, max: 52 },
  ])}
<h2>How ${fmtRate(rate)} an hour compares</h2>
<p>${fmtRate(rate)} is ${minMultiple}× the federal minimum wage of $7.25 an hour. Many states and cities set higher minimums, so the local comparison can differ. Overtime at time-and-a-half is ${money(ot)} an hour, and double time is ${money(rate * 2)}.</p>
<h2>How this is calculated</h2>
<div class="formula">yearly = hourly wage × hours per week × weeks per year<br>${money(rate)} × 40 × 52 = ${money(a.yearly)}<br>monthly = yearly ÷ 12 = ${money(a.monthly)}<br>biweekly = hourly × 80 = ${money(a.biweekly)}</div>
<p class="note">All figures are gross (before taxes and deductions). The standard full-time year used by most employers is 2,080 hours.</p>
${H.ctaBox('salary')}
${faq.html}
${H.relatedList(related)}`;
  return { path: hourlyPath(rate), title, description, body, jsonld: [crumbs.ld, faq.ld] };
}

function hourlyHub() {
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Hourly to Salary', path: '/hourly-to-salary/' }]);
  const popular = [10, 12, 15, 16, 17, 18, 20, 22, 25, 28, 30, 35, 40, 45, 50, 60, 75, 100];
  const rows = popular.map(r => { const a = M.hourlyToAll(r); return [`${fmtRate(r)}`, money(a.weekly), money(a.biweekly), money(a.monthly), moneyWhole(a.yearly)]; });
  const faq = H.faq([
    { q: 'How do you convert an hourly wage to a yearly salary?', a: 'Multiply the hourly wage by the hours you work per week, then by the weeks you work per year. For a standard full-time job that is wage × 40 × 52, or wage × 2,080.' },
    { q: 'What is 2,080 hours?', a: '2,080 is 40 hours a week times 52 weeks. It is the standard number of paid hours in a full-time year used by employers and the U.S. Office of Personnel Management.' },
    { q: 'Does the yearly figure include taxes?', a: 'No. The conversion gives gross pay. Federal and state income tax, Social Security and Medicare come out of that.' },
  ]);
  const body = `${crumbs.html}
<h1>Hourly to Salary Calculator</h1>
<p class="lead">Convert any hourly wage to yearly, monthly, biweekly and weekly pay. Pick a wage below for a full breakdown, or enter your own.</p>
${H.calcForm('hourly', [
    { name: 'rate', label: 'Hourly wage ($)', value: 20, step: 0.01 },
    { name: 'hours', label: 'Hours per week', value: 40, step: 0.5, max: 168 },
    { name: 'weeks', label: 'Paid weeks per year', value: 52, step: 1, max: 52 },
  ], 'Hourly wage to salary')}
${H.adUnit('inContent')}
<h2>Common hourly wages as a yearly salary</h2>
${H.table(['Hourly', 'Weekly', 'Biweekly', 'Monthly', 'Yearly'], rows)}
<h2>All hourly wages</h2>
<p class="note">Every wage from $7.25 to $200 an hour, each with part-time, overtime and unpaid-leave tables.</p>
<div class="chips">${G.HOURLY.map(r => `<a href="${H.url(hourlyPath(r))}">${fmtRate(r)}</a>`).join('')}</div>
${faq.html}
<h2>Related tools</h2>
<ul class="related"><li><a href="${H.url('/salary-to-hourly/')}">Salary to hourly calculator</a></li><li><a href="${H.url('/raise-calculator/')}">Pay raise calculator</a></li><li><a href="${H.url('/savings-goal/')}">Savings goal calculator</a></li></ul>`;
  return { path: '/hourly-to-salary/', title: 'Hourly to Salary Calculator: What an Hourly Wage Pays per Year', fullTitle: 'Hourly to Salary Calculator | WageFigures', description: 'Convert an hourly wage to annual, monthly, biweekly and weekly pay. Full breakdown for every wage from $7.25 to $200 an hour, with part-time and overtime figures.', body, jsonld: [crumbs.ld, faq.ld] };
}

// ---------------------------------------------------------------- salary → hourly
function salaryPage(salary) {
  const hourly = M.salaryToHourly(salary);
  const sStr = `$${salary.toLocaleString()}`;
  const title = `${sStr} a Year Is How Much an Hour?`;
  const description = `A ${sStr} salary is ${money(hourly)} an hour (40 hours a week, 2,080 hours a year): ${money(salary / 12)} a month, ${money(salary / 26)} biweekly, ${money(salary / 52)} a week before taxes.`;
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Salary to Hourly', path: '/salary-to-hourly/' }, { name: `${sStr}/year`, path: salaryPath(salary) }]);
  const hoursRows = [30, 35, 37.5, 40, 45, 50, 55, 60].map(h => [`${h} hours`, money(salary / (h * 52)), money(salary / 52)]);
  const weeksRows = [[`52 weeks (paid vacation)`, money(salary / 2080)], [`50 weeks (2 unpaid)`, money(salary / 2000)], [`48 weeks (4 unpaid)`, money(salary / 1920)]];
  const faq = H.faq([
    { q: `How much is ${sStr} a year per month?`, a: `<b>${money(salary / 12)}</b> a month before taxes. If you are paid twice a month, each paycheck is ${money(salary / 24)}.` },
    { q: `How much is ${sStr} a year biweekly?`, a: `<b>${money(salary / 26)}</b> every two weeks, gross. There are 26 biweekly pay periods in a year; two months each year contain three paychecks.` },
    { q: `How much is ${sStr} a year per day?`, a: `About <b>${money(salary / 260)}</b> per working day, based on 260 weekdays a year, or ${money(salary / 365)} per calendar day.` },
    { q: `What is ${sStr} a year after taxes?`, a: `Take-home pay depends on state, filing status and benefits. A common range is 70–80% of gross for a salary at this level, so roughly ${moneyWhole(salary * 0.7)}–${moneyWhole(salary * 0.8)} a year, or ${money(salary * 0.7 / 12)}–${money(salary * 0.8 / 12)} a month. Check an official withholding estimator for your situation.` },
    { q: `Is ${sStr} a year a good salary?`, a: `It depends heavily on where you live and your household. ${sStr} is ${money(hourly)} an hour, which is ${(hourly / 7.25).toFixed(1)} times the federal minimum wage. Compare it with typical rents and costs in your area rather than a national figure.` },
  ]);
  const nearHourly = G.nearest(G.HOURLY, hourly);
  const nearRaise = G.nearest(G.RAISE_SALARY, salary);
  const related = G.neighbours(G.SALARY, salary, 10).map(s => ({ path: salaryPath(s), text: `$${s.toLocaleString()} a year is how much an hour?` }))
    .concat([
      { path: hourlyPath(nearHourly), text: `${fmtRate(nearHourly)} an hour is how much a year?` },
      { path: raisePath(3, nearRaise), text: `3% raise on $${nearRaise.toLocaleString()}` },
      { path: raisePath(10, nearRaise), text: `10% raise on $${nearRaise.toLocaleString()}` },
    ]);
  const body = `${crumbs.html}
<h1>${title}</h1>
<p class="lead">A salary of <b>${sStr} a year</b> equals <b>${money(hourly)} an hour</b> for a standard 40-hour week with paid time off. Below are the monthly, biweekly, weekly and daily equivalents, plus what the hourly rate becomes if you work longer weeks.</p>
<div class="answer"><div class="big">${money(hourly)} per hour</div><div class="sub">${sStr} ÷ 2,080 hours (40 × 52)</div></div>
${H.stats([{ label: 'Monthly', value: money(salary / 12) }, { label: 'Biweekly', value: money(salary / 26) }, { label: 'Weekly', value: money(salary / 52) }, { label: 'Per workday', value: money(salary / 260) }])}
${H.adUnit('inContent')}
<h2>Hourly rate by hours actually worked</h2>
<p>Salaried employees are paid the same regardless of hours. The more hours you put in, the lower your effective hourly rate. Here is ${sStr} spread over different weekly schedules.</p>
${H.table(['Hours per week', 'Effective hourly', 'Weekly pay'], hoursRows)}
<h2>If some weeks are unpaid</h2>
${H.table(['Weeks paid', 'Effective hourly'], weeksRows)}
${H.calcForm('salary', [
    { name: 'salary', label: 'Annual salary ($)', value: salary, step: 100 },
    { name: 'hours', label: 'Hours per week', value: 40, step: 0.5, max: 168 },
    { name: 'weeks', label: 'Weeks per year', value: 52, step: 1, max: 52 },
  ])}
<h2>How this is calculated</h2>
<div class="formula">hourly = salary ÷ (hours per week × weeks per year)<br>${money(salary)} ÷ (40 × 52) = ${money(salary)} ÷ 2,080 = ${money(hourly)}</div>
<p class="note">Figures are before taxes and deductions. If your employer uses a 37.5-hour week, the rate is ${money(salary / 1950)} an hour.</p>
${H.ctaBox('salary')}
${faq.html}
${H.relatedList(related)}`;
  return { path: salaryPath(salary), title, description, body, jsonld: [crumbs.ld, faq.ld] };
}

function salaryHub() {
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Salary to Hourly', path: '/salary-to-hourly/' }]);
  const popular = [30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000, 70000, 75000, 80000, 90000, 100000, 120000, 150000, 200000];
  const rows = popular.map(s => [`$${s.toLocaleString()}`, money(s / 2080), money(s / 52), money(s / 26), money(s / 12)]);
  const faq = H.faq([
    { q: 'How do you convert salary to an hourly rate?', a: 'Divide the annual salary by the number of paid hours in a year. For a 40-hour week with paid vacation that is 2,080 hours, so $52,000 ÷ 2,080 = $25 an hour.' },
    { q: 'Why 2,080 hours?', a: '40 hours × 52 weeks = 2,080. Salaried staff are typically paid for holidays and vacation, so all 52 weeks count.' },
  ]);
  const body = `${crumbs.html}
<h1>Salary to Hourly Calculator</h1>
<p class="lead">See what an annual salary works out to per hour, week, two weeks and month. Choose a salary below for a full page, or type your own.</p>
${H.calcForm('salary', [
    { name: 'salary', label: 'Annual salary ($)', value: 60000, step: 100 },
    { name: 'hours', label: 'Hours per week', value: 40, step: 0.5, max: 168 },
    { name: 'weeks', label: 'Weeks per year', value: 52, step: 1, max: 52 },
  ], 'Salary to hourly wage')}
${H.adUnit('inContent')}
<h2>Common salaries as an hourly wage</h2>
${H.table(['Salary', 'Hourly', 'Weekly', 'Biweekly', 'Monthly'], rows)}
<h2>All salaries</h2>
<div class="chips">${G.SALARY.map(s => `<a href="${H.url(salaryPath(s))}">$${s >= 1000 ? (s / 1000) + 'k' : s}</a>`).join('')}</div>
${faq.html}
<h2>Related tools</h2>
<ul class="related"><li><a href="${H.url('/hourly-to-salary/')}">Hourly to salary calculator</a></li><li><a href="${H.url('/raise-calculator/')}">Pay raise calculator</a></li><li><a href="${H.url('/mortgage-payment/')}">Mortgage payment calculator</a></li></ul>`;
  return { path: '/salary-to-hourly/', title: 'Salary to Hourly Calculator: What a Yearly Salary Pays per Hour', fullTitle: 'Salary to Hourly Calculator | WageFigures', description: 'Convert any annual salary to an hourly wage, plus weekly, biweekly and monthly pay. Detailed pages for salaries from $15,000 to $500,000.', body, jsonld: [crumbs.ld, faq.ld] };
}

// ---------------------------------------------------------------- raise
function raisePage(p, salary) {
  const nw = salary * (1 + p / 100), d = nw - salary;
  const sStr = `$${salary.toLocaleString()}`;
  const title = `${pct(p)} Raise on ${sStr}: New Salary and Extra Pay`;
  const description = `A ${pct(p)} raise on a ${sStr} salary is ${moneyWhole(nw)} a year, an increase of ${money(d)}. That is ${money(d / 12)} more per month and ${money(d / 26)} more per biweekly paycheck before taxes.`;
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Raise Calculator', path: '/raise-calculator/' }, { name: `${pct(p)} on ${sStr}`, path: raisePath(p, salary) }]);
  const otherPct = G.RAISE_PCT.filter(x => x !== p).map(x => [pct(x), moneyWhole(salary * (1 + x / 100)), money(salary * x / 100), money(salary * x / 100 / 12)]);
  const compound = [1, 2, 3, 5].map(y => [`After ${y} year${y > 1 ? 's' : ''}`, moneyWhole(salary * Math.pow(1 + p / 100, y))]);
  const faq = H.faq([
    { q: `How much is a ${pct(p)} raise on ${sStr} per paycheck?`, a: `If you are paid every two weeks, each paycheck grows by about <b>${money(d / 26)}</b> before taxes. Paid monthly, it is ${money(d / 12)}; weekly, ${money(d / 52)}.` },
    { q: `What is the new hourly rate after a ${pct(p)} raise on ${sStr}?`, a: `Based on 2,080 hours a year, the hourly rate goes from ${money(salary / 2080)} to <b>${money(nw / 2080)}</b>.` },
    { q: `Does a ${pct(p)} raise keep up with inflation?`, a: p < 3 ? `Not always. Inflation in the U.S. has averaged around 2–3% a year over the long run, so a ${pct(p)} raise roughly maintains or slightly trails purchasing power depending on the year.` : `Usually. Long-run U.S. inflation has averaged about 2–3% a year, so a ${pct(p)} raise typically increases real purchasing power, though high-inflation years can erase part of that.` },
    { q: `How much is ${pct(p)} of ${sStr}?`, a: `${pct(p)} of ${sStr} is <b>${money(d)}</b>. Multiply ${salary.toLocaleString()} by ${(p / 100).toFixed(3).replace(/0+$/, '')} to get it.` },
  ]);
  const related = G.RAISE_PCT.filter(x => x !== p).slice(0, 6).map(x => ({ path: raisePath(x, salary), text: `${pct(x)} raise on ${sStr}` }))
    .concat(G.neighbours(G.RAISE_SALARY, salary, 4).map(s => ({ path: raisePath(p, s), text: `${pct(p)} raise on $${s.toLocaleString()}` })))
    .concat([{ path: salaryPath(G.nearest(G.SALARY, nw)), text: `$${G.nearest(G.SALARY, nw).toLocaleString()} a year is how much an hour?` }]);
  const body = `${crumbs.html}
<h1>${title}</h1>
<p class="lead">A <b>${pct(p)} raise</b> takes a <b>${sStr}</b> salary to <b>${moneyWhole(nw)}</b>. Here is what the extra ${money(d)} a year looks like per month, per paycheck and per hour, and how the same percentage compounds over several years.</p>
<div class="answer"><div class="big">${moneyWhole(nw)} new salary</div><div class="sub">+${money(d)} a year · +${money(d / 12)} a month · +${money(d / 26)} per biweekly paycheck</div></div>
${H.stats([{ label: 'Raise amount', value: money(d) }, { label: 'Per month', value: money(d / 12) }, { label: 'Per week', value: money(d / 52) }, { label: 'New hourly (40 h)', value: money(nw / 2080) }])}
${H.adUnit('inContent')}
<h2>Other raise percentages on ${sStr}</h2>
<p>Negotiating? This table shows what each percentage is worth on a ${sStr} salary.</p>
${H.table(['Raise', 'New salary', 'Extra per year', 'Extra per month'], otherPct)}
<h2>If you get ${pct(p)} every year</h2>
<p>Raises compound. Getting ${pct(p)} annually on ${sStr} grows the salary like this:</p>
${H.table(['Timeline', 'Salary'], compound)}
${H.calcForm('raise', [
    { name: 'salary', label: 'Current salary ($)', value: salary, step: 100 },
    { name: 'percent', label: 'Raise (%)', value: p, step: 0.1, max: 1000 },
  ])}
<h2>How this is calculated</h2>
<div class="formula">new salary = current salary × (1 + raise ÷ 100)<br>${money(salary)} × ${(1 + p / 100).toFixed(4).replace(/0+$/, '')} = ${money(nw)}</div>
<p class="note">Figures are before taxes. Part of a raise can push income into a higher marginal bracket, but only the dollars above the threshold are taxed at the higher rate.</p>
${H.ctaBox('salary')}
${faq.html}
${H.relatedList(related)}`;
  return { path: raisePath(p, salary), title, description, body, jsonld: [crumbs.ld, faq.ld] };
}

function raiseHub() {
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Raise Calculator', path: '/raise-calculator/' }]);
  const rows = [40000, 50000, 60000, 75000, 100000].map(s => [`$${s.toLocaleString()}`, moneyWhole(s * 1.03), moneyWhole(s * 1.05), moneyWhole(s * 1.10), moneyWhole(s * 1.15)]);
  const faq = H.faq([
    { q: 'How do I calculate a raise percentage?', a: 'Divide the increase by your old salary and multiply by 100. A $3,000 raise on $60,000 is 3,000 ÷ 60,000 × 100 = 5%.' },
    { q: 'What is a typical annual raise?', a: 'Merit increases at most U.S. employers have clustered around 3–4% a year in recent years, with promotions and job changes paying considerably more.' },
  ]);
  const body = `${crumbs.html}
<h1>Pay Raise Calculator</h1>
<p class="lead">Find your new salary after a percentage raise, and what it adds per month, per paycheck and per hour.</p>
${H.calcForm('raise', [{ name: 'salary', label: 'Current salary ($)', value: 60000, step: 100 }, { name: 'percent', label: 'Raise (%)', value: 5, step: 0.1, max: 1000 }], 'Raise calculator')}
${H.adUnit('inContent')}
<h2>Quick reference</h2>
${H.table(['Salary', '3% raise', '5% raise', '10% raise', '15% raise'], rows)}
<h2>All raise pages</h2>
${G.RAISE_SALARY.map(s => `<h3>$${s.toLocaleString()}</h3><div class="chips">${G.RAISE_PCT.map(p => `<a href="${H.url(raisePath(p, s))}">${pct(p)}</a>`).join('')}</div>`).join('')}
${faq.html}`;
  return { path: '/raise-calculator/', title: 'Pay Raise Calculator: New Salary After a Percentage Increase', fullTitle: 'Pay Raise Calculator | WageFigures', description: 'Calculate your new salary after a raise and see the increase per month, per paycheck and per hour. Pages for every common raise percentage on salaries from $30,000 to $200,000.', body, jsonld: [crumbs.ld, faq.ld] };
}

module.exports = [
  { id: 'hourly', name: 'Hourly to Salary', basePath: '/hourly-to-salary/', hub: hourlyHub, *pages() { for (const r of G.HOURLY) yield hourlyPage(r); } },
  { id: 'salary', name: 'Salary to Hourly', basePath: '/salary-to-hourly/', hub: salaryHub, *pages() { for (const s of G.SALARY) yield salaryPage(s); } },
  { id: 'raise', name: 'Pay Raise', basePath: '/raise-calculator/', hub: raiseHub, *pages() { for (const s of G.RAISE_SALARY) for (const p of G.RAISE_PCT) yield raisePage(p, s); } },
];
module.exports.paths = { hourlyPath, salaryPath, raisePath };
 + (r % 1 ? r.toFixed(2) : String(r)); // 18.5 -> $18.50
const hourlySlug = r => (r % 1 ? r.toFixed(2).replace('.', '-') : String(r)); // 18.5 -> 18-50, 7.25 -> 7-25
const hourlyPath = r => `/hourly-to-salary/${hourlySlug(r)}-an-hour-is-how-much-a-year/`;
const salaryPath = s => `/salary-to-hourly/${s}-a-year-is-how-much-an-hour/`;
const raisePath = (p, s) => `/raise-calculator/${slugNum(p)}-percent-raise-on-${s}/`;

function hourlyPage(rate) {
  const a = M.hourlyToAll(rate);
  const title = `${fmtRate(rate)} an Hour Is How Much a Year?`;
  const description = `${fmtRate(rate)} an hour is ${moneyWhole(a.yearly)} a year before taxes (40 hours a week): ${money(a.monthly)} a month, ${money(a.biweekly)} biweekly, ${money(a.weekly)} a week. Part-time and overtime figures too.`;
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Hourly to Salary', path: '/hourly-to-salary/' }, { name: `${fmtRate(rate)}/hour`, path: hourlyPath(rate) }]);
  const hoursRows = [20, 25, 30, 32, 35, 40, 45, 50].map(h => { const x = M.hourlyToAll(rate, h); return [`${h} hours`, money(x.weekly), money(x.monthly), moneyWhole(x.yearly)]; });
  const weeksRows = [48, 50, 52].map(w => [`${w} weeks (${52 - w === 0 ? 'no unpaid time off' : `${52 - w} unpaid weeks`})`, moneyWhole(rate * 40 * w), money(rate * 40 * w / 12)]);
  const ot = rate * 1.5;
  const minMultiple = (rate / 7.25).toFixed(1);
  const faq = H.faq([
    { q: `How much is ${fmtRate(rate)} an hour per month?`, a: `About <b>${money(a.monthly)}</b> a month before taxes, based on ${moneyWhole(a.yearly)} a year divided by 12. Months have different numbers of workdays, so individual paychecks vary.` },
    { q: `How much is ${fmtRate(rate)} an hour biweekly?`, a: `<b>${money(a.biweekly)}</b> every two weeks for 80 hours of work. Semi-monthly pay (24 paychecks a year) would be ${money(a.semimonthly)}.` },
    { q: `How much is ${fmtRate(rate)} an hour part-time?`, a: `At 20 hours a week you would earn ${money(rate * 20)} a week, or about ${moneyWhole(rate * 20 * 52)} a year. At 30 hours a week it is ${moneyWhole(rate * 30 * 52)} a year.` },
    { q: `What is ${fmtRate(rate)} an hour after taxes?`, a: `It depends on your state, filing status and benefits, but most hourly workers take home roughly 75–85% of gross pay after federal income tax and Social Security and Medicare. For ${moneyWhole(a.yearly)} a year that is very roughly ${moneyWhole(a.yearly * 0.75)}–${moneyWhole(a.yearly * 0.85)}. Use an official withholding calculator for an exact figure.` },
    { q: `What is overtime pay at ${fmtRate(rate)} an hour?`, a: `Time-and-a-half is <b>${money(ot)}</b> an hour. Five overtime hours a week adds ${money(ot * 5)} a week, or about ${moneyWhole(ot * 5 * 52)} a year.` },
  ]);
  const nearSalary = G.nearest(G.SALARY, a.yearly);
  const nearRaiseSalary = G.nearest(G.RAISE_SALARY, a.yearly);
  const related = G.neighbours(G.HOURLY, rate, 10).map(r => ({ path: hourlyPath(r), text: `${fmtRate(r)} an hour is how much a year?` }))
    .concat([
      { path: salaryPath(nearSalary), text: `$${nearSalary.toLocaleString()} a year is how much an hour?` },
      { path: raisePath(5, nearRaiseSalary), text: `5% raise on $${nearRaiseSalary.toLocaleString()}` },
      { path: '/savings-goal/', text: 'How much to save each month for a goal' },
    ]);
  const body = `${crumbs.html}
<h1>${title}</h1>
<p class="lead">Working full time at ${fmtRate(rate)} an hour comes to <b>${moneyWhole(a.yearly)} a year</b> before taxes. Here is how that breaks down by month, week and day, and what changes if you work fewer hours or take unpaid time off.</p>
<div class="answer"><div class="big">${moneyWhole(a.yearly)} per year</div><div class="sub">${fmtRate(rate)} × 40 hours × 52 weeks = ${money(a.yearly)} gross annual income</div></div>
${H.stats([{ label: 'Monthly', value: money(a.monthly) }, { label: 'Biweekly', value: money(a.biweekly) }, { label: 'Weekly', value: money(a.weekly) }, { label: 'Daily (8 h)', value: money(a.daily) }])}
${H.adUnit('inContent')}
<h2>${fmtRate(rate)} an hour by hours worked per week</h2>
<p>Not everyone works 40 hours. This table shows yearly and monthly pay at ${fmtRate(rate)} an hour for common schedules, assuming 52 paid weeks.</p>
${H.table(['Hours per week', 'Weekly', 'Monthly', 'Yearly'], hoursRows)}
<h2>If you take unpaid time off</h2>
<p>Hourly workers are usually not paid for weeks they do not work. Two unpaid weeks a year lowers the total to ${moneyWhole(rate * 40 * 50)}.</p>
${H.table(['Weeks worked', 'Yearly', 'Monthly average'], weeksRows)}
${H.calcForm('hourly', [
    { name: 'rate', label: 'Hourly wage ($)', value: rate, step: 0.01 },
    { name: 'hours', label: 'Hours per week', value: 40, step: 0.5, max: 168 },
    { name: 'weeks', label: 'Paid weeks per year', value: 52, step: 1, max: 52 },
  ])}
<h2>How ${fmtRate(rate)} an hour compares</h2>
<p>${fmtRate(rate)} is ${minMultiple}× the federal minimum wage of $7.25 an hour. Many states and cities set higher minimums, so the local comparison can differ. Overtime at time-and-a-half is ${money(ot)} an hour, and double time is ${money(rate * 2)}.</p>
<h2>How this is calculated</h2>
<div class="formula">yearly = hourly wage × hours per week × weeks per year<br>${money(rate)} × 40 × 52 = ${money(a.yearly)}<br>monthly = yearly ÷ 12 = ${money(a.monthly)}<br>biweekly = hourly × 80 = ${money(a.biweekly)}</div>
<p class="note">All figures are gross (before taxes and deductions). The standard full-time year used by most employers is 2,080 hours.</p>
${H.ctaBox('salary')}
${faq.html}
${H.relatedList(related)}`;
  return { path: hourlyPath(rate), title, description, body, jsonld: [crumbs.ld, faq.ld] };
}

function hourlyHub() {
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Hourly to Salary', path: '/hourly-to-salary/' }]);
  const popular = [10, 12, 15, 16, 17, 18, 20, 22, 25, 28, 30, 35, 40, 45, 50, 60, 75, 100];
  const rows = popular.map(r => { const a = M.hourlyToAll(r); return [`${fmtRate(r)}`, money(a.weekly), money(a.biweekly), money(a.monthly), moneyWhole(a.yearly)]; });
  const faq = H.faq([
    { q: 'How do you convert an hourly wage to a yearly salary?', a: 'Multiply the hourly wage by the hours you work per week, then by the weeks you work per year. For a standard full-time job that is wage × 40 × 52, or wage × 2,080.' },
    { q: 'What is 2,080 hours?', a: '2,080 is 40 hours a week times 52 weeks. It is the standard number of paid hours in a full-time year used by employers and the U.S. Office of Personnel Management.' },
    { q: 'Does the yearly figure include taxes?', a: 'No. The conversion gives gross pay. Federal and state income tax, Social Security and Medicare come out of that.' },
  ]);
  const body = `${crumbs.html}
<h1>Hourly to Salary Calculator</h1>
<p class="lead">Convert any hourly wage to yearly, monthly, biweekly and weekly pay. Pick a wage below for a full breakdown, or enter your own.</p>
${H.calcForm('hourly', [
    { name: 'rate', label: 'Hourly wage ($)', value: 20, step: 0.01 },
    { name: 'hours', label: 'Hours per week', value: 40, step: 0.5, max: 168 },
    { name: 'weeks', label: 'Paid weeks per year', value: 52, step: 1, max: 52 },
  ], 'Hourly wage to salary')}
${H.adUnit('inContent')}
<h2>Common hourly wages as a yearly salary</h2>
${H.table(['Hourly', 'Weekly', 'Biweekly', 'Monthly', 'Yearly'], rows)}
<h2>All hourly wages</h2>
<p class="note">Every wage from $7.25 to $200 an hour, each with part-time, overtime and unpaid-leave tables.</p>
<div class="chips">${G.HOURLY.map(r => `<a href="${H.url(hourlyPath(r))}">${fmtRate(r)}</a>`).join('')}</div>
${faq.html}
<h2>Related tools</h2>
<ul class="related"><li><a href="${H.url('/salary-to-hourly/')}">Salary to hourly calculator</a></li><li><a href="${H.url('/raise-calculator/')}">Pay raise calculator</a></li><li><a href="${H.url('/savings-goal/')}">Savings goal calculator</a></li></ul>`;
  return { path: '/hourly-to-salary/', title: 'Hourly to Salary Calculator: What an Hourly Wage Pays per Year', fullTitle: 'Hourly to Salary Calculator | WageFigures', description: 'Convert an hourly wage to annual, monthly, biweekly and weekly pay. Full breakdown for every wage from $7.25 to $200 an hour, with part-time and overtime figures.', body, jsonld: [crumbs.ld, faq.ld] };
}

// ---------------------------------------------------------------- salary → hourly
function salaryPage(salary) {
  const hourly = M.salaryToHourly(salary);
  const sStr = `$${salary.toLocaleString()}`;
  const title = `${sStr} a Year Is How Much an Hour?`;
  const description = `A ${sStr} salary is ${money(hourly)} an hour (40 hours a week, 2,080 hours a year): ${money(salary / 12)} a month, ${money(salary / 26)} biweekly, ${money(salary / 52)} a week before taxes.`;
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Salary to Hourly', path: '/salary-to-hourly/' }, { name: `${sStr}/year`, path: salaryPath(salary) }]);
  const hoursRows = [30, 35, 37.5, 40, 45, 50, 55, 60].map(h => [`${h} hours`, money(salary / (h * 52)), money(salary / 52)]);
  const weeksRows = [[`52 weeks (paid vacation)`, money(salary / 2080)], [`50 weeks (2 unpaid)`, money(salary / 2000)], [`48 weeks (4 unpaid)`, money(salary / 1920)]];
  const faq = H.faq([
    { q: `How much is ${sStr} a year per month?`, a: `<b>${money(salary / 12)}</b> a month before taxes. If you are paid twice a month, each paycheck is ${money(salary / 24)}.` },
    { q: `How much is ${sStr} a year biweekly?`, a: `<b>${money(salary / 26)}</b> every two weeks, gross. There are 26 biweekly pay periods in a year; two months each year contain three paychecks.` },
    { q: `How much is ${sStr} a year per day?`, a: `About <b>${money(salary / 260)}</b> per working day, based on 260 weekdays a year, or ${money(salary / 365)} per calendar day.` },
    { q: `What is ${sStr} a year after taxes?`, a: `Take-home pay depends on state, filing status and benefits. A common range is 70–80% of gross for a salary at this level, so roughly ${moneyWhole(salary * 0.7)}–${moneyWhole(salary * 0.8)} a year, or ${money(salary * 0.7 / 12)}–${money(salary * 0.8 / 12)} a month. Check an official withholding estimator for your situation.` },
    { q: `Is ${sStr} a year a good salary?`, a: `It depends heavily on where you live and your household. ${sStr} is ${money(hourly)} an hour, which is ${(hourly / 7.25).toFixed(1)} times the federal minimum wage. Compare it with typical rents and costs in your area rather than a national figure.` },
  ]);
  const nearHourly = G.nearest(G.HOURLY, hourly);
  const nearRaise = G.nearest(G.RAISE_SALARY, salary);
  const related = G.neighbours(G.SALARY, salary, 10).map(s => ({ path: salaryPath(s), text: `$${s.toLocaleString()} a year is how much an hour?` }))
    .concat([
      { path: hourlyPath(nearHourly), text: `${fmtRate(nearHourly)} an hour is how much a year?` },
      { path: raisePath(3, nearRaise), text: `3% raise on $${nearRaise.toLocaleString()}` },
      { path: raisePath(10, nearRaise), text: `10% raise on $${nearRaise.toLocaleString()}` },
    ]);
  const body = `${crumbs.html}
<h1>${title}</h1>
<p class="lead">A salary of <b>${sStr} a year</b> equals <b>${money(hourly)} an hour</b> for a standard 40-hour week with paid time off. Below are the monthly, biweekly, weekly and daily equivalents, plus what the hourly rate becomes if you work longer weeks.</p>
<div class="answer"><div class="big">${money(hourly)} per hour</div><div class="sub">${sStr} ÷ 2,080 hours (40 × 52)</div></div>
${H.stats([{ label: 'Monthly', value: money(salary / 12) }, { label: 'Biweekly', value: money(salary / 26) }, { label: 'Weekly', value: money(salary / 52) }, { label: 'Per workday', value: money(salary / 260) }])}
${H.adUnit('inContent')}
<h2>Hourly rate by hours actually worked</h2>
<p>Salaried employees are paid the same regardless of hours. The more hours you put in, the lower your effective hourly rate. Here is ${sStr} spread over different weekly schedules.</p>
${H.table(['Hours per week', 'Effective hourly', 'Weekly pay'], hoursRows)}
<h2>If some weeks are unpaid</h2>
${H.table(['Weeks paid', 'Effective hourly'], weeksRows)}
${H.calcForm('salary', [
    { name: 'salary', label: 'Annual salary ($)', value: salary, step: 100 },
    { name: 'hours', label: 'Hours per week', value: 40, step: 0.5, max: 168 },
    { name: 'weeks', label: 'Weeks per year', value: 52, step: 1, max: 52 },
  ])}
<h2>How this is calculated</h2>
<div class="formula">hourly = salary ÷ (hours per week × weeks per year)<br>${money(salary)} ÷ (40 × 52) = ${money(salary)} ÷ 2,080 = ${money(hourly)}</div>
<p class="note">Figures are before taxes and deductions. If your employer uses a 37.5-hour week, the rate is ${money(salary / 1950)} an hour.</p>
${H.ctaBox('salary')}
${faq.html}
${H.relatedList(related)}`;
  return { path: salaryPath(salary), title, description, body, jsonld: [crumbs.ld, faq.ld] };
}

function salaryHub() {
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Salary to Hourly', path: '/salary-to-hourly/' }]);
  const popular = [30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000, 70000, 75000, 80000, 90000, 100000, 120000, 150000, 200000];
  const rows = popular.map(s => [`$${s.toLocaleString()}`, money(s / 2080), money(s / 52), money(s / 26), money(s / 12)]);
  const faq = H.faq([
    { q: 'How do you convert salary to an hourly rate?', a: 'Divide the annual salary by the number of paid hours in a year. For a 40-hour week with paid vacation that is 2,080 hours, so $52,000 ÷ 2,080 = $25 an hour.' },
    { q: 'Why 2,080 hours?', a: '40 hours × 52 weeks = 2,080. Salaried staff are typically paid for holidays and vacation, so all 52 weeks count.' },
  ]);
  const body = `${crumbs.html}
<h1>Salary to Hourly Calculator</h1>
<p class="lead">See what an annual salary works out to per hour, week, two weeks and month. Choose a salary below for a full page, or type your own.</p>
${H.calcForm('salary', [
    { name: 'salary', label: 'Annual salary ($)', value: 60000, step: 100 },
    { name: 'hours', label: 'Hours per week', value: 40, step: 0.5, max: 168 },
    { name: 'weeks', label: 'Weeks per year', value: 52, step: 1, max: 52 },
  ], 'Salary to hourly wage')}
${H.adUnit('inContent')}
<h2>Common salaries as an hourly wage</h2>
${H.table(['Salary', 'Hourly', 'Weekly', 'Biweekly', 'Monthly'], rows)}
<h2>All salaries</h2>
<div class="chips">${G.SALARY.map(s => `<a href="${H.url(salaryPath(s))}">$${s >= 1000 ? (s / 1000) + 'k' : s}</a>`).join('')}</div>
${faq.html}
<h2>Related tools</h2>
<ul class="related"><li><a href="${H.url('/hourly-to-salary/')}">Hourly to salary calculator</a></li><li><a href="${H.url('/raise-calculator/')}">Pay raise calculator</a></li><li><a href="${H.url('/mortgage-payment/')}">Mortgage payment calculator</a></li></ul>`;
  return { path: '/salary-to-hourly/', title: 'Salary to Hourly Calculator: What a Yearly Salary Pays per Hour', fullTitle: 'Salary to Hourly Calculator | WageFigures', description: 'Convert any annual salary to an hourly wage, plus weekly, biweekly and monthly pay. Detailed pages for salaries from $15,000 to $500,000.', body, jsonld: [crumbs.ld, faq.ld] };
}

// ---------------------------------------------------------------- raise
function raisePage(p, salary) {
  const nw = salary * (1 + p / 100), d = nw - salary;
  const sStr = `$${salary.toLocaleString()}`;
  const title = `${pct(p)} Raise on ${sStr}: New Salary and Extra Pay`;
  const description = `A ${pct(p)} raise on a ${sStr} salary is ${moneyWhole(nw)} a year, an increase of ${money(d)}. That is ${money(d / 12)} more per month and ${money(d / 26)} more per biweekly paycheck before taxes.`;
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Raise Calculator', path: '/raise-calculator/' }, { name: `${pct(p)} on ${sStr}`, path: raisePath(p, salary) }]);
  const otherPct = G.RAISE_PCT.filter(x => x !== p).map(x => [pct(x), moneyWhole(salary * (1 + x / 100)), money(salary * x / 100), money(salary * x / 100 / 12)]);
  const compound = [1, 2, 3, 5].map(y => [`After ${y} year${y > 1 ? 's' : ''}`, moneyWhole(salary * Math.pow(1 + p / 100, y))]);
  const faq = H.faq([
    { q: `How much is a ${pct(p)} raise on ${sStr} per paycheck?`, a: `If you are paid every two weeks, each paycheck grows by about <b>${money(d / 26)}</b> before taxes. Paid monthly, it is ${money(d / 12)}; weekly, ${money(d / 52)}.` },
    { q: `What is the new hourly rate after a ${pct(p)} raise on ${sStr}?`, a: `Based on 2,080 hours a year, the hourly rate goes from ${money(salary / 2080)} to <b>${money(nw / 2080)}</b>.` },
    { q: `Does a ${pct(p)} raise keep up with inflation?`, a: p < 3 ? `Not always. Inflation in the U.S. has averaged around 2–3% a year over the long run, so a ${pct(p)} raise roughly maintains or slightly trails purchasing power depending on the year.` : `Usually. Long-run U.S. inflation has averaged about 2–3% a year, so a ${pct(p)} raise typically increases real purchasing power, though high-inflation years can erase part of that.` },
    { q: `How much is ${pct(p)} of ${sStr}?`, a: `${pct(p)} of ${sStr} is <b>${money(d)}</b>. Multiply ${salary.toLocaleString()} by ${(p / 100).toFixed(3).replace(/0+$/, '')} to get it.` },
  ]);
  const related = G.RAISE_PCT.filter(x => x !== p).slice(0, 6).map(x => ({ path: raisePath(x, salary), text: `${pct(x)} raise on ${sStr}` }))
    .concat(G.neighbours(G.RAISE_SALARY, salary, 4).map(s => ({ path: raisePath(p, s), text: `${pct(p)} raise on $${s.toLocaleString()}` })))
    .concat([{ path: salaryPath(G.nearest(G.SALARY, nw)), text: `$${G.nearest(G.SALARY, nw).toLocaleString()} a year is how much an hour?` }]);
  const body = `${crumbs.html}
<h1>${title}</h1>
<p class="lead">A <b>${pct(p)} raise</b> takes a <b>${sStr}</b> salary to <b>${moneyWhole(nw)}</b>. Here is what the extra ${money(d)} a year looks like per month, per paycheck and per hour, and how the same percentage compounds over several years.</p>
<div class="answer"><div class="big">${moneyWhole(nw)} new salary</div><div class="sub">+${money(d)} a year · +${money(d / 12)} a month · +${money(d / 26)} per biweekly paycheck</div></div>
${H.stats([{ label: 'Raise amount', value: money(d) }, { label: 'Per month', value: money(d / 12) }, { label: 'Per week', value: money(d / 52) }, { label: 'New hourly (40 h)', value: money(nw / 2080) }])}
${H.adUnit('inContent')}
<h2>Other raise percentages on ${sStr}</h2>
<p>Negotiating? This table shows what each percentage is worth on a ${sStr} salary.</p>
${H.table(['Raise', 'New salary', 'Extra per year', 'Extra per month'], otherPct)}
<h2>If you get ${pct(p)} every year</h2>
<p>Raises compound. Getting ${pct(p)} annually on ${sStr} grows the salary like this:</p>
${H.table(['Timeline', 'Salary'], compound)}
${H.calcForm('raise', [
    { name: 'salary', label: 'Current salary ($)', value: salary, step: 100 },
    { name: 'percent', label: 'Raise (%)', value: p, step: 0.1, max: 1000 },
  ])}
<h2>How this is calculated</h2>
<div class="formula">new salary = current salary × (1 + raise ÷ 100)<br>${money(salary)} × ${(1 + p / 100).toFixed(4).replace(/0+$/, '')} = ${money(nw)}</div>
<p class="note">Figures are before taxes. Part of a raise can push income into a higher marginal bracket, but only the dollars above the threshold are taxed at the higher rate.</p>
${H.ctaBox('salary')}
${faq.html}
${H.relatedList(related)}`;
  return { path: raisePath(p, salary), title, description, body, jsonld: [crumbs.ld, faq.ld] };
}

function raiseHub() {
  const crumbs = H.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Raise Calculator', path: '/raise-calculator/' }]);
  const rows = [40000, 50000, 60000, 75000, 100000].map(s => [`$${s.toLocaleString()}`, moneyWhole(s * 1.03), moneyWhole(s * 1.05), moneyWhole(s * 1.10), moneyWhole(s * 1.15)]);
  const faq = H.faq([
    { q: 'How do I calculate a raise percentage?', a: 'Divide the increase by your old salary and multiply by 100. A $3,000 raise on $60,000 is 3,000 ÷ 60,000 × 100 = 5%.' },
    { q: 'What is a typical annual raise?', a: 'Merit increases at most U.S. employers have clustered around 3–4% a year in recent years, with promotions and job changes paying considerably more.' },
  ]);
  const body = `${crumbs.html}
<h1>Pay Raise Calculator</h1>
<p class="lead">Find your new salary after a percentage raise, and what it adds per month, per paycheck and per hour.</p>
${H.calcForm('raise', [{ name: 'salary', label: 'Current salary ($)', value: 60000, step: 100 }, { name: 'percent', label: 'Raise (%)', value: 5, step: 0.1, max: 1000 }], 'Raise calculator')}
${H.adUnit('inContent')}
<h2>Quick reference</h2>
${H.table(['Salary', '3% raise', '5% raise', '10% raise', '15% raise'], rows)}
<h2>All raise pages</h2>
${G.RAISE_SALARY.map(s => `<h3>$${s.toLocaleString()}</h3><div class="chips">${G.RAISE_PCT.map(p => `<a href="${H.url(raisePath(p, s))}">${pct(p)}</a>`).join('')}</div>`).join('')}
${faq.html}`;
  return { path: '/raise-calculator/', title: 'Pay Raise Calculator: New Salary After a Percentage Increase', fullTitle: 'Pay Raise Calculator | WageFigures', description: 'Calculate your new salary after a raise and see the increase per month, per paycheck and per hour. Pages for every common raise percentage on salaries from $30,000 to $200,000.', body, jsonld: [crumbs.ld, faq.ld] };
}

module.exports = [
  { id: 'hourly', name: 'Hourly to Salary', basePath: '/hourly-to-salary/', hub: hourlyHub, *pages() { for (const r of G.HOURLY) yield hourlyPage(r); } },
  { id: 'salary', name: 'Salary to Hourly', basePath: '/salary-to-hourly/', hub: salaryHub, *pages() { for (const s of G.SALARY) yield salaryPage(s); } },
  { id: 'raise', name: 'Pay Raise', basePath: '/raise-calculator/', hub: raiseHub, *pages() { for (const s of G.RAISE_SALARY) for (const p of G.RAISE_PCT) yield raisePage(p, s); } },
];
module.exports.paths = { hourlyPath, salaryPath, raisePath };
