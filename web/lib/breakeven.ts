// Year-one break-even for the lobster middleman business.
//
// year-one profit = lb/week * selling weeks * margin * (1 - shrink) - fixed costs
//
// Every default carries a status:
//   SOURCED    - taken from the audited Grok Bot model
//   ESTIMATE   - a planning assumption, not checked against an official source
//   UNVERIFIED - a figure we could not confirm, or one back-solved to match the audit

export type Inputs = {
  marginPerLb: number; // dollars of contribution per pound sold (before shrink)
  sellingWeeks: number; // weeks of legal selling in year one
  lbPerWeek: number; // pounds sold per week
  shrink: number; // fraction of pounds lost (dead or lost lobster), 0 to 1
  fixedCosts: number; // year-one fixed costs in dollars
};

export type Result = {
  effectiveMarginPerLb: number; // marginPerLb * (1 - shrink)
  revenueMargin: number; // lbPerWeek * sellingWeeks * effectiveMarginPerLb
  profit: number; // revenueMargin - fixedCosts
  breakEvenLbPerWeek: number | null; // null when no volume can break even
  breakEvenLbTotal: number | null; // breakEvenLbPerWeek * sellingWeeks
};

export function calculate(i: Inputs): Result {
  const effectiveMarginPerLb = i.marginPerLb * (1 - i.shrink);
  const revenueMargin = i.lbPerWeek * i.sellingWeeks * effectiveMarginPerLb;
  const perLbPerWeek = effectiveMarginPerLb * i.sellingWeeks;
  const breakEvenLbPerWeek = perLbPerWeek > 0 ? i.fixedCosts / perLbPerWeek : null;
  return {
    effectiveMarginPerLb,
    revenueMargin,
    profit: revenueMargin - i.fixedCosts,
    breakEvenLbPerWeek,
    breakEvenLbTotal: breakEvenLbPerWeek === null ? null : breakEvenLbPerWeek * i.sellingWeeks,
  };
}

// Margin from entered prices. Returns null unless both prices are numbers.
export function marginFromPrices(sellPerLb: number | null, buyPerLb: number | null): number | null {
  if (sellPerLb === null || buyPerLb === null) return null;
  if (!Number.isFinite(sellPerLb) || !Number.isFinite(buyPerLb)) return null;
  return sellPerLb - buyPerLb;
}

export type Status = "SOURCED" | "ESTIMATE" | "UNVERIFIED";
export type Source = { label: string; status: Status };

const AUDIT = "Audited Grok Bot model";

export const ROUTES = {
  receiver: { label: "Receiver license", fixedCosts: 14563.47 },
  wholesaler: { label: "Wholesaler", fixedCosts: 13877.47 },
} as const;
export type Route = keyof typeof ROUTES;

// Shrink is not stated by the audit. It is back-solved so the base case
// (150 lb/week, 17 weeks, $4.22/lb, $14,563.47 fixed) loses exactly $4,822.47:
// 150 * 17 * 4.22 * (1 - s) = 14,563.47 - 4,822.47 = 9,741.00, so s = 1 - 3.82/4.22.
// The same value gives a break-even of 224.3 lb/week, not the audit's 217.
// See the PR description: the two audited targets cannot both be met.
const SHRINK_DEFAULT = 1 - 3.82 / 4.22; // 9.4787%

export const DEFAULTS: Record<keyof Inputs, { value: number; source: Source }> = {
  marginPerLb: { value: 4.22, source: { label: `${AUDIT}, margin per lb`, status: "ESTIMATE" } },
  sellingWeeks: { value: 17, source: { label: `${AUDIT}, selling weeks`, status: "ESTIMATE" } },
  lbPerWeek: { value: 150, source: { label: `${AUDIT}, base-case volume`, status: "ESTIMATE" } },
  shrink: {
    value: SHRINK_DEFAULT,
    source: {
      label: "Back-solved from the audited $4,822.47 base-case loss; the audit does not state a shrink %",
      status: "UNVERIFIED",
    },
  },
  fixedCosts: {
    value: ROUTES.receiver.fixedCosts,
    source: {
      label: `${AUDIT}, Receiver license route, includes $5,000 equipment and the 2027 CDFW license fee (fee UNVERIFIED)`,
      status: "SOURCED",
    },
  },
};

// Components inside the fixed-cost total, labelled separately.
export const FIXED_COST_NOTES: { label: string; source: Source }[] = [
  { label: "Equipment, $5,000", source: { label: AUDIT, status: "SOURCED" } },
  { label: "2027 CDFW license fee", source: { label: "Not confirmed with CDFW", status: "UNVERIFIED" } },
];
