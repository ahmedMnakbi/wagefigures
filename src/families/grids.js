'use strict';
// Value grids shared by all families so pages can link only to pages that exist.

function range(start, end, step) {
  const out = [];
  for (let v = start; v <= end + 1e-9; v += step) out.push(Math.round(v * 100) / 100);
  return out;
}
function uniq(a) { return [...new Set(a)].sort((x, y) => x - y); }

const HOURLY = uniq([7.25, ...range(8, 30, 0.25), ...range(30.5, 50, 0.5), ...range(51, 100, 1), 105, 110, 115, 120, 125, 130, 140, 150, 175, 200]);
const SALARY = uniq([...range(15000, 100000, 1000), ...range(105000, 200000, 5000), ...range(225000, 500000, 25000)]);
const RAISE_PCT = [1, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 10, 12, 15, 20, 25];
const RAISE_SALARY = uniq([...range(30000, 100000, 5000), ...range(110000, 150000, 10000), 175000, 200000]);

const LOAN_AMT = [1000, 2000, 3000, 5000, 7500, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 50000, 60000, 75000, 100000];
const LOAN_RATE = [5, 6, 7, 8, 9, 10, 12, 15];
const LOAN_YEARS = [2, 3, 4, 5, 7];

const CAR_AMT = [10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000, 60000];
const CAR_RATE = [3, 4, 5, 6, 7, 8, 9, 10, 12];
const CAR_MONTHS = [36, 48, 60, 72, 84];

const MORT_AMT = uniq([...range(100000, 600000, 25000), 650000, 700000, 750000, 800000, 900000, 1000000]);
const MORT_RATE = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8];
const MORT_YEARS = [15, 30];

const DOWN_PCT = [3, 3.5, 5, 10, 15, 20, 25];
const DOWN_PRICE = uniq([...range(150000, 500000, 25000), ...range(550000, 1000000, 50000)]);

const LUMP_AMT = [1000, 2000, 5000, 10000, 15000, 20000, 25000, 50000, 100000];
const LUMP_RATE = [3, 4, 5, 6, 7, 8, 10, 12];
const LUMP_YEARS = [5, 10, 15, 20, 25, 30, 40];

const MONTHLY_AMT = [50, 100, 150, 200, 250, 300, 400, 500, 600, 750, 1000, 1500, 2000];
const MONTHLY_RATE = [4, 5, 6, 7, 8, 10, 12];
const MONTHLY_YEARS = [5, 10, 15, 20, 25, 30, 40];

const DEBT_BAL = [1000, 2000, 3000, 4000, 5000, 7500, 10000, 15000, 20000];
const DEBT_APR = [15, 18, 20, 22, 24, 26, 28, 30];
const DEBT_PAY = [50, 75, 100, 150, 200, 250, 300, 400, 500, 750, 1000];

const GOAL_AMT = [1000, 2000, 3000, 5000, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000];
const GOAL_YEARS = [1, 2, 3, 4, 5, 10];

const RETIRE_MONTHLY = [1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000, 7000, 8000, 10000];

/** Closest grid value to v. */
function nearest(arr, v) {
  let best = arr[0];
  for (const x of arr) if (Math.abs(x - v) < Math.abs(best - v)) best = x;
  return best;
}
/** Up to n neighbours of v in arr (excluding v), balanced on both sides. */
function neighbours(arr, v, n = 8) {
  const i = arr.indexOf(v);
  const out = [];
  for (let d = 1; out.length < n && (i - d >= 0 || i + d < arr.length); d++) {
    if (i - d >= 0) out.push(arr[i - d]);
    if (i + d < arr.length && out.length < n) out.push(arr[i + d]);
  }
  return out;
}

module.exports = {
  HOURLY, SALARY, RAISE_PCT, RAISE_SALARY,
  LOAN_AMT, LOAN_RATE, LOAN_YEARS, CAR_AMT, CAR_RATE, CAR_MONTHS,
  MORT_AMT, MORT_RATE, MORT_YEARS, DOWN_PCT, DOWN_PRICE,
  LUMP_AMT, LUMP_RATE, LUMP_YEARS, MONTHLY_AMT, MONTHLY_RATE, MONTHLY_YEARS,
  DEBT_BAL, DEBT_APR, DEBT_PAY, GOAL_AMT, GOAL_YEARS, RETIRE_MONTHLY,
  nearest, neighbours, range,
};
