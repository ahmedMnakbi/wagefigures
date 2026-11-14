/* Client-side calculators. Mirrors src/math.js. No dependencies. */
(function () {
  'use strict';
  var usd2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  function m2(n) { return isFinite(n) ? usd2.format(n) : '—'; }
  function m0(n) { return isFinite(n) ? usd0.format(n) : '—'; }
  function pl(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
  function ym(months) { var y = Math.floor(months / 12), m = months % 12; if (!y) return pl(m, 'month'); if (!m) return pl(y, 'year'); return pl(y, 'year') + ' and ' + pl(m, 'month'); }
  function pmt(P, apr, n) { var r = apr / 100 / 12; if (n <= 0) return 0; if (r === 0) return P / n; return P * r / (1 - Math.pow(1 + r, -n)); }
  function fvLump(P, apr, years) { return P * Math.pow(1 + apr / 100 / 12, years * 12); }
  function fvMonthly(M, apr, years, init) { var i = apr / 100 / 12, n = years * 12; var a = (init || 0) * Math.pow(1 + i, n); var b = i === 0 ? M * n : M * ((Math.pow(1 + i, n) - 1) / i); return a + b; }
  function payoff(B, apr, pay) { var r = apr / 100 / 12; if (pay <= B * r) return null; var b = B, m = 0, it = 0, pt = 0, ab = Math.max(1, pay * 0.01); while (b > 0.005 && m < 1200) { var i = b * r; it += i; var p = Math.min(pay, b + i); if (b + i - p < ab) p = b + i; pt += p; b = b + i - p; m++; } return { months: m, interest: it, paid: pt }; }
  function goalMonthly(G, apr, months, init) { var i = apr / 100 / 12; var fi = (init || 0) * Math.pow(1 + i, months); var rem = Math.max(0, G - fi); if (i === 0) return rem / months; return rem * i / (Math.pow(1 + i, months) - 1); }
  function big(label, v, sub) { return '<div class="big">' + v + '</div><div class="sub">' + label + (sub ? ' · ' + sub : '') + '</div>'; }
  function rows(list) { return '<table><tbody>' + list.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join('') + '</tbody></table>'; }

  var calcs = {
    hourly: function (v) {
      var y = v.rate * v.hours * v.weeks;
      return big('per year', m2(y), 'at ' + v.hours + ' h/week, ' + v.weeks + ' weeks') + rows([
        ['Per week', m2(v.rate * v.hours)], ['Every two weeks', m2(v.rate * v.hours * 2)], ['Per month', m2(y / 12)], ['Per day (' + (v.hours / 5).toFixed(1) + ' h)', m2(v.rate * v.hours / 5)]]);
    },
    salary: function (v) {
      var h = v.salary / (v.hours * v.weeks);
      return big('per hour', m2(h), 'at ' + v.hours + ' h/week, ' + v.weeks + ' weeks') + rows([
        ['Per month', m2(v.salary / 12)], ['Every two weeks', m2(v.salary / 26)], ['Per week', m2(v.salary / 52)], ['Per day', m2(h * v.hours / 5)]]);
    },
    loan: function (v) {
      var n = v.months != null ? v.months : v.years * 12; var p = pmt(v.amount, v.rate, n);
      return big('per month', m2(p), ym(n) + ' at ' + v.rate + '%') + rows([['Total paid', m2(p * n)], ['Total interest', m2(p * n - v.amount)], ['Interest as % of loan', ((p * n - v.amount) / v.amount * 100).toFixed(1) + '%']]);
    },
    mortgage: function (v) {
      var n = v.years * 12; var p = pmt(v.amount, v.rate, n); var extra = (v.tax || 0) / 12 + (v.insurance || 0) / 12;
      return big('principal & interest', m2(p), v.years + ' years at ' + v.rate + '%') + rows([['With tax & insurance', m2(p + extra)], ['Total interest', m2(p * n - v.amount)], ['Total of payments', m2(p * n)]]);
    },
    lump: function (v) {
      var f = fvLump(v.amount, v.rate, v.years);
      return big('after ' + pl(v.years, 'year'), m0(f), v.rate + '% compounded monthly') + rows([['Starting amount', m0(v.amount)], ['Interest earned', m0(f - v.amount)], ['Growth multiple', (f / v.amount).toFixed(2) + '×']]);
    },
    monthly: function (v) {
      var f = fvMonthly(v.monthly, v.rate, v.years, v.initial); var c = (v.initial || 0) + v.monthly * 12 * v.years;
      return big('after ' + pl(v.years, 'year'), m0(f), m2(v.monthly) + '/month at ' + v.rate + '%') + rows([['Total contributed', m0(c)], ['Investment growth', m0(f - c)], ['Growth share of final value', (100 * (f - c) / f).toFixed(0) + '%']]);
    },
    debt: function (v) {
      var r = payoff(v.balance, v.apr, v.payment); if (!r) return '<p class="warn">A payment of ' + m2(v.payment) + ' does not cover the monthly interest (' + m2(v.balance * v.apr / 1200) + '). The balance would grow. Increase the payment.</p>';
      return big('to pay off', ym(r.months), m2(v.payment) + '/month at ' + v.apr + '% APR') + rows([['Total interest', m2(r.interest)], ['Total paid', m2(r.paid)], ['Payments', r.months]]);
    },
    goal: function (v) {
      var n = v.years * 12; var m = goalMonthly(v.goal, v.rate, n, v.initial);
      return big('per month', m2(m), 'to reach ' + m0(v.goal) + ' in ' + pl(v.years, 'year')) + rows([['Per week', m2(m * 12 / 52)], ['Per day', m2(m * 12 / 365)], ['Total deposits', m0(m * n)], ['Interest earned', m0(v.goal - (v.initial || 0) - m * n)]]);
    },
    raise: function (v) {
      var nw = v.salary * (1 + v.percent / 100), d = nw - v.salary;
      return big('new salary', m0(nw), v.percent + '% raise on ' + m0(v.salary)) + rows([['Extra per year', m2(d)], ['Extra per month', m2(d / 12)], ['Extra per paycheck (biweekly)', m2(d / 26)], ['New hourly (40 h)', m2(nw / 2080)]]);
    },
    down: function (v) {
      var dp = v.price * v.percent / 100, loan = v.price - dp, p = pmt(loan, v.rate, 360);
      return big('down payment', m0(dp), v.percent + '% of ' + m0(v.price)) + rows([['Loan amount', m0(loan)], ['Monthly P&I, 30 yr at ' + v.rate + '%', m2(p)], ['PMI likely?', v.percent < 20 ? 'Yes (under 20% down)' : 'No']]);
    },
    retire: function (v) {
      var annual = v.monthly * 12; return big('nest egg needed', m0(annual / (v.rate / 100)), 'for ' + m0(v.monthly) + '/month at a ' + v.rate + '% withdrawal rate') + rows([['Annual spending', m0(annual)], ['At 3% withdrawal', m0(annual / 0.03)], ['At 4% withdrawal', m0(annual / 0.04)], ['At 5% withdrawal', m0(annual / 0.05)]]);
    }
  };

  function run(form) {
    var kind = form.getAttribute('data-calc'); var fn = calcs[kind]; if (!fn) return;
    var v = {}; Array.prototype.forEach.call(form.querySelectorAll('input,select'), function (el) { v[el.name] = parseFloat(el.value); });
    var out = form.querySelector('.out');
    try { out.innerHTML = fn(v); } catch (e) { out.innerHTML = '<p class="warn">Please check the numbers.</p>'; }
  }
  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('form[data-calc]'), function (form) {
      form.addEventListener('submit', function (e) { e.preventDefault(); run(form); });
      form.addEventListener('input', function () { run(form); });
      run(form);
    });
    var s = document.getElementById('site-search');
    if (s) {
      s.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { var q = s.value.trim(); if (q) location.href = 'https://www.google.com/search?q=' + encodeURIComponent('site:' + location.host + ' ' + q); }
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
