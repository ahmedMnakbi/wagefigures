'use strict';
const wages = require('./wages');
const loans = require('./loans');
const growth = require('./growth');

const families = [...wages, ...loans, ...growth];

// Short blurbs for the home page and the all-calculators index.
const blurbs = {
  hourly: 'What an hourly wage pays per year, month, week and day, with part-time and overtime tables.',
  salary: 'What a yearly salary works out to per hour, plus biweekly and monthly pay.',
  raise: 'Your new salary after a percentage raise and what it adds per paycheck.',
  loan: 'Monthly payment, total interest and amortization for a personal loan.',
  car: 'Auto loan payments from 36 to 84 months with total interest.',
  mortgage: 'Principal and interest on a home loan, with 15 vs 30 year comparisons.',
  down: 'Down payment amount, resulting loan and monthly payment for any home price.',
  lump: 'How a lump sum grows with compound interest over 5 to 40 years.',
  monthly: 'What regular monthly investing grows into, year by year.',
  debt: 'How long a credit card balance takes to pay off and what it costs.',
  goal: 'How much to save each month to hit a target by a deadline.',
  retire: 'The portfolio needed for a given monthly retirement income.',
};
for (const f of families) f.blurb = blurbs[f.id] || '';

module.exports = families;
