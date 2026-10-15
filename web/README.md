# Lobster break-even calculator

A Next.js page that computes year-one break-even for the lobster middleman business.

```sh
npm install
npm run dev    # http://localhost:3000
npm test       # checks the math in lib/breakeven.ts
```

## The math

`lib/breakeven.ts` holds all of it:

- Effective margin per lb = margin per lb × (1 − shrink).
- Year-one margin earned = lb per week × selling weeks × effective margin.
- Year-one profit = margin earned − fixed costs.
- Break-even lb per week = fixed costs ÷ (effective margin × selling weeks). It is empty when that is zero or less.

If you enter both a sell price and a buy price per lb, margin = sell − buy and overrides the margin field.

## Where the defaults come from

Labels: **SOURCED** = audited Grok Bot model. **ESTIMATE** = planning assumption, not checked against an official source. **UNVERIFIED** = not confirmed, or back-solved.

| Input | Default | Label | Notes |
| --- | --- | --- | --- |
| Margin per lb | $4.22 | ESTIMATE | Audited model |
| Selling weeks | 17 | ESTIMATE | Audited model |
| Lb per week | 150 | ESTIMATE | Audited base case |
| Shrink | 9.48% | UNVERIFIED | Not stated by the audit. Back-solved so the base case loses exactly $4,822.47 (effective margin $3.82/lb) |
| Fixed costs, Receiver route | $14,563.47 | SOURCED | Audited. Includes $5,000 equipment (SOURCED) and the 2027 CDFW license fee (UNVERIFIED) |
| Fixed costs, Wholesaler route | $13,877.47 | SOURCED | Audited. Pick it with the Route selector |

With these defaults the page shows a year-one loss of $4,822.47 and a break-even of **224.3 lb/week (3,812 lb)**.

**Known mismatch:** the audit also states a break-even of about 217 lb/week (3,693 lb). No single shrink value produces both that and the $4,822.47 loss. 3,693 lb equals the old derived $15,583 ÷ $4.22, so the 217 figure may be from before the audit. This needs an answer from whoever owns the audited model.
