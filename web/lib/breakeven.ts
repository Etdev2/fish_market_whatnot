// Year-one break-even for the lobster middleman business.
// Every default is an unverified figure until Codex checks it against an
// official source. See `source` on each input.

export type Inputs = {
  marginPerLb: number; // dollars of contribution per pound sold
  sellingWeeks: number; // weeks of legal selling in year one
  lbPerWeek: number; // pounds sold per week
  fixedCosts: number; // year-one fixed costs in dollars
};

export type Result = {
  revenueMargin: number; // marginPerLb * lbPerWeek * sellingWeeks
  profit: number; // revenueMargin - fixedCosts
  breakEvenLbPerWeek: number | null; // null when no volume can break even
};

export function calculate(i: Inputs): Result {
  const revenueMargin = i.marginPerLb * i.lbPerWeek * i.sellingWeeks;
  const perLbPerWeek = i.marginPerLb * i.sellingWeeks;
  return {
    revenueMargin,
    profit: revenueMargin - i.fixedCosts,
    breakEvenLbPerWeek: perLbPerWeek > 0 ? i.fixedCosts / perLbPerWeek : null,
  };
}

export type Source = { label: string; status: "unverified" | "derived" };

const BRIEFING = "Grok Bot project briefing, received 2026-10-15";

// The briefing gives margin, weeks, base-case volume and base-case loss.
// It does not state fixed costs, so they are derived from the loss:
// 150 lb * 17 weeks * $4.22 + $4,822 = $15,583.
export const DEFAULTS: Record<keyof Inputs, { value: number; source: Source }> = {
  marginPerLb: { value: 4.22, source: { label: BRIEFING, status: "unverified" } },
  sellingWeeks: { value: 17, source: { label: BRIEFING, status: "unverified" } },
  lbPerWeek: { value: 150, source: { label: `${BRIEFING}, base case`, status: "unverified" } },
  fixedCosts: {
    value: 15583,
    source: { label: "Derived from the briefing's $4,822 base-case loss", status: "derived" },
  },
};
