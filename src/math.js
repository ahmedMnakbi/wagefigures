// Core finance formulas and number formatting shared by the generator and the
// in-page calculators (static/calc.js mirrors these for client-side use).

'use strict';

/** Monthly payment for an amortizing loan. */
function monthlyPayment(principal, annualRatePct, months) {
  const r = annualRatePct / 100 / 12;
  if (months <= 0) return 0;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

/** Year-by-year amortization summary. */
function amortizationByYear(principal, annualRatePct, months) {
  const r = annualRatePct / 100 / 12;
  const pmt = monthlyPayment(principal, annualRatePct, months);
  let balance = principal;
  const years = [];
  let yInterest = 0, yPrincipal = 0;
  for (let m = 1; m <= months; m++) {
    const interest = balance * r;
    let princ = pmt - interest;
    if (princ > balance) princ = balance;
    balance -= princ;
    yInterest += interest;
    yPrincipal += princ;
    if (m % 12 === 0 || m === months) {
      years.push({
        year: Math.ceil(m / 12),
        interest: yInterest,
        principal: yPrincipal,
        balance: Math.max(0, balance),
      });
      yInterest = 0; yPrincipal = 0;
    }
  }
  return { payment: pmt, totalPaid: pmt * months, totalInterest: pmt * months - principal, years };
}

/** Future value of a lump sum with monthly compounding. */
function futureValueLump(principal, annualRatePct, years) {
  const i = annualRatePct / 100 / 12;
  return principal * Math.pow(1 + i, years * 12);
}

/** Future value of regular monthly contributions (end of month) plus optional initial amount. */
function futureValueMonthly(monthly, annualRatePct, years, initial = 0) {
  const i = annualRatePct / 100 / 12;
  const n = years * 12;
  const fvInitial = initial * Math.pow(1 + i, n);
  const fvSeries = i === 0 ? monthly * n : monthly * ((Math.pow(1 + i, n) - 1) / i);
  return fvInitial + fvSeries;
}

/** Growth table (yearly) for monthly contributions. */
function growthByYear(monthly, annualRatePct, years, initial = 0) {
  const rows = [];
  for (let y = 1; y <= years; y++) {
    const contributed = initial + monthly * 12 * y;
    const value = futureValueMonthly(monthly, annualRatePct, y, initial);
    rows.push({ year: y, contributed, value, growth: value - contributed });
  }
  return rows;
}

/** Simulate paying down a revolving balance with a fixed monthly payment. */
function debtPayoff(balance, aprPct, payment, maxMonths = 1200) {
  const r = aprPct / 100 / 12;
  if (payment <= balance * r) return { neverPays: true, months: Infinity, totalInterest: Infinity, totalPaid: Infinity };
  let b = balance, months = 0, interestTotal = 0, paidTotal = 0;
  const absorb = Math.max(1, payment * 0.01); // a leftover under this is folded into the last payment
  while (b > 0.005 && months < maxMonths) {
    const interest = b * r;
    interestTotal += interest;
    let pay = Math.min(payment, b + interest);
    if (b + interest - pay < absorb) pay = b + interest;
    paidTotal += pay;
    b = b + interest - pay;
    months++;
  }
  return { neverPays: false, months, totalInterest: interestTotal, totalPaid: paidTotal };
}

/** Monthly deposit required to reach a goal in n months at a given APY. */
function monthlyForGoal(goal, annualRatePct, months, initial = 0) {
  const i = annualRatePct / 100 / 12;
  const fvInitial = initial * Math.pow(1 + i, months);
  const remaining = Math.max(0, goal - fvInitial);
  if (i === 0) return remaining / months;
  return remaining * i / (Math.pow(1 + i, months) - 1);
}

/** Hourly wage conversions (default 40 h/week, 52 weeks). */
function hourlyToAll(rate, hoursPerWeek = 40, weeksPerYear = 52) {
  const yearly = rate * hoursPerWeek * weeksPerYear;
  return {
    hourly: rate,
    daily: rate * (hoursPerWeek / 5),
    weekly: rate * hoursPerWeek,
    biweekly: rate * hoursPerWeek * 2,
    semimonthly: yearly / 24,
    monthly: yearly / 12,
    yearly,
  };
}

function salaryToHourly(salary, hoursPerWeek = 40, weeksPerYear = 52) {
  return salary / (hoursPerWeek * weeksPerYear);
}

// ---------- formatting ----------
const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

function money(n, cents = true) {
  if (!isFinite(n)) return '—';
  return cents ? usd2.format(n) : usd0.format(n);
}
function moneyWhole(n) { return money(n, false); }
function pct(n, digits = 2) {
  const s = Number(n).toFixed(digits).replace(/\.?0+$/, '');
  return `${s}%`;
}
function plural(n, word) { return `${n} ${word}${n === 1 ? '' : 's'}`; }
function slugNum(n) {
  // 7.25 -> "7-25", 55000 -> "55000", 6.5 -> "6-5"
  return String(n).replace('.', '-');
}
function yearsMonths(months) {
  const y = Math.floor(months / 12), m = months % 12;
  if (y === 0) return plural(m, 'month');
  if (m === 0) return plural(y, 'year');
  return `${plural(y, 'year')} and ${plural(m, 'month')}`;
}
function compactMoney(n) {
  // 25000 -> "$25k", 1500000 -> "$1.5M"
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1) + 'M';
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(n % 1e3 === 0 ? 0 : 1) + 'k';
  return '$' + n;
}

module.exports = {
  monthlyPayment, amortizationByYear, futureValueLump, futureValueMonthly, growthByYear,
  debtPayoff, monthlyForGoal, hourlyToAll, salaryToHourly,
  money, moneyWhole, pct, plural, slugNum, yearsMonths, compactMoney, num0,
};
