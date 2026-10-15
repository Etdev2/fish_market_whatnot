import { describe, expect, it } from "vitest";
import { calculate, DEFAULTS, marginFromPrices, ROUTES, type Inputs } from "./breakeven";

const defaults: Inputs = {
  marginPerLb: DEFAULTS.marginPerLb.value,
  sellingWeeks: DEFAULTS.sellingWeeks.value,
  lbPerWeek: DEFAULTS.lbPerWeek.value,
  shrink: DEFAULTS.shrink.value,
  fixedCosts: DEFAULTS.fixedCosts.value,
};

describe("calculate", () => {
  it("uses the audited Receiver-route fixed cost", () => {
    expect(defaults.fixedCosts).toBe(14563.47);
    expect(ROUTES.wholesaler.fixedCosts).toBe(13877.47);
  });

  it("reproduces the audited base-case loss of $4,822.47", () => {
    expect(calculate(defaults).profit).toBeCloseTo(-4822.47, 2);
  });

  // The audit also states break-even of about 217 lb/week (3,693 lb). With the
  // shrink that matches the loss, break-even is 224.3 lb/week (3,812 lb).
  // These tests pin what the code actually computes; the mismatch is flagged in the PR.
  it("computes break-even of 224.3 lb/week with the loss-matching shrink", () => {
    const r = calculate(defaults);
    expect(r.breakEvenLbPerWeek!).toBeCloseTo(224.26, 2);
    expect(r.breakEvenLbTotal!).toBeCloseTo(3812.43, 2);
  });

  it("applies shrink to the margin", () => {
    const r = calculate({ ...defaults, shrink: 0.1 });
    expect(r.effectiveMarginPerLb).toBeCloseTo(4.22 * 0.9, 10);
  });

  it("matches the no-shrink formula when shrink is zero", () => {
    const r = calculate({ ...defaults, shrink: 0 });
    expect(r.profit).toBeCloseTo(150 * 17 * 4.22 - 14563.47, 6);
  });

  it("returns zero profit at the break-even volume", () => {
    const lbPerWeek = calculate(defaults).breakEvenLbPerWeek!;
    expect(calculate({ ...defaults, lbPerWeek }).profit).toBeCloseTo(0, 6);
  });

  it("returns no break-even when the margin is zero or negative", () => {
    expect(calculate({ ...defaults, marginPerLb: 0 }).breakEvenLbPerWeek).toBeNull();
    expect(calculate({ ...defaults, marginPerLb: -1 }).breakEvenLbPerWeek).toBeNull();
  });

  it("returns no break-even when shrink is 100%", () => {
    expect(calculate({ ...defaults, shrink: 1 }).breakEvenLbPerWeek).toBeNull();
  });

  it("returns no break-even when there are no selling weeks", () => {
    const r = calculate({ ...defaults, sellingWeeks: 0 });
    expect(r.breakEvenLbPerWeek).toBeNull();
    expect(r.breakEvenLbTotal).toBeNull();
  });
});

describe("marginFromPrices", () => {
  it("is sell minus buy", () => {
    expect(marginFromPrices(14.22, 10)).toBeCloseTo(4.22, 10);
  });

  it("is null until both prices are entered", () => {
    expect(marginFromPrices(null, 10)).toBeNull();
    expect(marginFromPrices(14, null)).toBeNull();
    expect(marginFromPrices(Number.NaN, 10)).toBeNull();
  });
});

describe("labels", () => {
  it("labels every default with an allowed status", () => {
    for (const d of Object.values(DEFAULTS)) {
      expect(["SOURCED", "ESTIMATE", "UNVERIFIED"]).toContain(d.source.status);
    }
  });

  it("marks margin and selling weeks as ESTIMATE", () => {
    expect(DEFAULTS.marginPerLb.source.status).toBe("ESTIMATE");
    expect(DEFAULTS.sellingWeeks.source.status).toBe("ESTIMATE");
  });
});
