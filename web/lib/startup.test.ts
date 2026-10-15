import { describe, expect, it } from "vitest";
import { BOX_DEFAULTS, boxEconomics, STARTUP_COSTS, totalLean, totalStartup, type BoxInputs } from "./startup";

const defaults = Object.fromEntries(
  Object.entries(BOX_DEFAULTS).map(([k, v]) => [k, v.value]),
) as BoxInputs;

describe("startup costs", () => {
  it("totals every line", () => {
    expect(totalStartup()).toBe(23935);
    expect(STARTUP_COSTS.length).toBe(12);
  });

  it("totals the lean plan with the commissary line", () => {
    expect(totalLean()).toBe(7590);
  });
});

describe("box economics", () => {
  it("matches the hand calculation at $60/lb sell, $10/lb buy", () => {
    const r = boxEconomics(defaults);
    // 300 + 45 - 55 - 46 - 55 - (24 + 10.005 + 0.30)
    expect(r.sale).toBe(300);
    expect(r.lobsterCost).toBeCloseTo(55, 6);
    expect(r.fees).toBeCloseTo(34.305, 6);
    expect(r.profit).toBeCloseTo(154.695, 6);
    expect(r.boxesToPayBack).toBeCloseTo(23935 / 154.695, 6);
  });

  it("returns no payback when a box loses money", () => {
    const r = boxEconomics({ ...defaults, sellPerLb: 15 });
    expect(r.profit).toBeLessThan(0);
    expect(r.boxesToPayBack).toBeNull();
  });

  it("guards a zero sale price", () => {
    expect(boxEconomics({ ...defaults, sellPerLb: 0 }).margin).toBe(0);
  });
});
