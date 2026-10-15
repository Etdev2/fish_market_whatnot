# Lobster break-even calculator

A Next.js page that computes year-one break-even for the lobster middleman business.

```sh
npm install
npm run dev    # http://localhost:3000
npm test       # checks the math in lib/breakeven.ts
```

## The math

`lib/breakeven.ts` holds all of it:

- Year-one margin earned = margin per lb × lb per week × selling weeks.
- Year-one profit = margin earned − fixed costs.
- Break-even lb per week = fixed costs ÷ (margin per lb × selling weeks). It is empty when the margin or the week count is zero or less.

## Where the defaults come from

Every default comes from the Grok Bot briefing received on 2026-10-15. None has been checked against an official source.

| Input | Default | Source |
| --- | --- | --- |
| Margin per lb | $4.22 | Briefing, unverified |
| Selling weeks | 17 | Briefing, unverified |
| Lb per week | 150 | Briefing base case, unverified |
| Fixed costs | $15,583 | Derived. The briefing gives no fixed-cost figure, so this is 150 × 17 × $4.22 + the briefing's $4,822 base-case loss |

With these defaults the page shows a break-even of 217.2 lb per week and a year-one loss of $4,822, which matches the briefing. The tests check both figures.
