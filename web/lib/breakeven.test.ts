import { describe, expect, it } from "vitest";
import { calculate, DEFAULTS } from "./breakeven";

const defaults = {
  marginPerLb: DEFAULTS.marginPerLb.value,
  sellingWeeks: DEFAULTS.sellingWeeks.value,
  lbPerWeek: DEFAULTS.lbPerWeek.value,
  fixedCosts: DEFAULTS.fixedCosts.value,
};

describe("calculate", () => {
  it("reproduces the briefing's base-case loss of about $4,822", () => {
    expect(calculate(defaults).profit).toBeCloseTo(-4822, 0);
  });

  it("reproduces the briefing's break-even of about 217 lb per week", () => {
    expect(Math.round(calculate(defaults).breakEvenLbPerWeek!)).toBe(217);
  });

  it("returns zero profit at the break-even volume", () => {
    const lbPerWeek = calculate(defaults).breakEvenLbPerWeek!;
    expect(calculate({ ...defaults, lbPerWeek }).profit).toBeCloseTo(0, 6);
  });

  it("returns no break-even when the margin is zero or negative", () => {
    expect(calculate({ ...defaults, marginPerLb: 0 }).breakEvenLbPerWeek).toBeNull();
    expect(calculate({ ...defaults, marginPerLb: -1 }).breakEvenLbPerWeek).toBeNull();
  });

  it("returns no break-even when there are no selling weeks", () => {
    expect(calculate({ ...defaults, sellingWeeks: 0 }).breakEvenLbPerWeek).toBeNull();
  });
});
