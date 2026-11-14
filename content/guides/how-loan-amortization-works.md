---
title: How Loan Amortization Works (Why Early Payments Are Mostly Interest)
description: A plain explanation of the amortization formula, why the balance falls slowly at first, and how extra payments shorten a loan.
date: 2026-11-14
calculators: [/loan-payment/, /mortgage-payment/, /car-payment/]
---

Make the first payment on a 30-year mortgage and only a sliver of it reduces what you owe. Make a payment in year 28 and almost all of it does. That shift is amortization, and understanding it explains most of the surprising things about loans: why total interest can rival the amount borrowed, why refinancing resets the clock, and why small extra payments early on are so powerful.

## The fixed payment

An amortizing loan has one payment amount that never changes. It is set so that, after the agreed number of payments, the balance is exactly zero. The formula is:

> payment = P × r ÷ (1 − (1 + r)^−n)

where P is the amount borrowed, r is the monthly interest rate (annual rate ÷ 12) and n is the number of payments.

For a $300,000 mortgage at 6.5% over 30 years: r = 0.065 ÷ 12 = 0.005417, n = 360, and the payment is $1,896.20. Nobody computes this by hand; a calculator or spreadsheet function (PMT) does it. What matters is seeing why the payment behaves as it does.

## How each payment is split

Every month the lender first charges interest on the current balance, then applies the rest of the payment to principal.

Month one on the loan above:

- Interest: $300,000 × 0.005417 = $1,625.00
- Principal: $1,896.20 − $1,625.00 = $271.20
- New balance: $299,728.80

Month two charges interest on $299,728.80, which is $1,623.53. The principal share rises to $272.67. The split tilts a little further toward principal every month because the balance is a little smaller.

By year 10 the monthly interest has fallen to about $1,370 and the principal share has risen to about $525. By year 25 the numbers have crossed: around $570 interest and $1,325 principal. The final payment is almost entirely principal.

## Why total interest is so large

On this loan, 360 payments of $1,896.20 total $682,632. Subtract the $300,000 borrowed and total interest is $382,632, more than the house cost. That is not a trick; it is the cost of using someone else's money for three decades. The same loan over 15 years has a payment of $2,613.32 and total interest of $170,398. The payment is 38% higher but the interest cost is less than half.

Three things drive total interest:

1. **Rate.** At 5.5% instead of 6.5%, the 30-year payment drops to $1,703.37 and total interest to $313,212. One percentage point saves about $69,000.
2. **Term.** Longer terms lower the payment but stretch the time the balance is outstanding, which is what interest is charged on.
3. **Balance.** Interest is proportional to what you owe, so anything that reduces the balance early compounds in your favour.

## Extra payments

Because interest is charged on the balance, an extra dollar paid today saves interest on that dollar every month until the loan ends. Paying $200 extra each month on the 30-year loan above clears it in about 23 years and 8 months and saves roughly $96,000 in interest. The earlier the extra payment, the bigger the effect; the same $200 added only in the final five years saves very little.

Common ways to do it:

- Round the payment up to the next hundred.
- Make one extra payment a year, perhaps from a tax refund or bonus.
- Pay biweekly: 26 half-payments equal 13 full payments a year.

Check that your lender applies extra money to principal rather than holding it against the next payment, and that there is no prepayment penalty.

## Refinancing resets the clock

Refinancing replaces your loan with a new one, usually with a new 30-year term. The lower rate can be well worth it, but five years into the old loan you were already past the steepest part of the interest curve. Starting a fresh 30-year schedule puts you back at the beginning, where payments are mostly interest again. To keep the benefit, refinance into a shorter term or keep paying the old, higher amount on the new loan.

## Cars and personal loans

The same mechanics apply to a 60-month car loan or a 3-year personal loan, just faster. A $25,000 car loan at 7% over 60 months costs $495.03 a month and $4,702 in total interest. Stretching it to 84 months lowers the payment to $377.32 but raises interest to $6,695, and the car is worth less than the balance for years. Short terms are expensive per month but cheap overall.

## Reading an amortization schedule

Most lenders provide a table of every payment with its interest, principal and remaining balance. Three columns tell the story: watch the interest column shrink, the principal column grow and the balance column fall slowly at first and quickly at the end. If you ever wonder whether to pay down a loan or invest the money instead, the interest rate on that schedule is the return you earn, guaranteed, by paying early.
