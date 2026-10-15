"use client";

import { useState } from "react";
import {
  calculate,
  DEFAULTS,
  FIXED_COST_NOTES,
  marginFromPrices,
  ROUTES,
  type Inputs,
  type Route,
  type Source,
} from "@/lib/breakeven";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

function Tag({ source }: { source: Source }) {
  return <span className={`tag ${source.status.toLowerCase()}`}>{source.status}</span>;
}

function parse(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function Home() {
  const [route, setRoute] = useState<Route>("receiver");
  const [sellPrice, setSellPrice] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [inputs, setInputs] = useState<Inputs>({
    marginPerLb: DEFAULTS.marginPerLb.value,
    sellingWeeks: DEFAULTS.sellingWeeks.value,
    lbPerWeek: DEFAULTS.lbPerWeek.value,
    shrink: DEFAULTS.shrink.value,
    fixedCosts: DEFAULTS.fixedCosts.value,
  });

  const priceMargin = marginFromPrices(parse(sellPrice), parse(buyPrice));
  const effective: Inputs = priceMargin === null ? inputs : { ...inputs, marginPerLb: priceMargin };
  const r = calculate(effective);

  const set = (key: keyof Inputs, value: number) => setInputs({ ...inputs, [key]: value });

  return (
    <main>
      <h1>Lobster break-even</h1>
      <p className="note">
        Year-one profit = lb/week × selling weeks × margin × (1 − shrink) − fixed costs. Each default is tagged
        SOURCED (audited Grok Bot model), ESTIMATE (planning assumption) or UNVERIFIED (not confirmed).
      </p>

      <section className="inputs">
        <fieldset>
          <legend>Price per pound (optional)</legend>
          <div className="pair">
            <label>
              <span>
                Sell price <small>($/lb)</small>
              </span>
              <input type="number" step="0.01" min="0" value={sellPrice} placeholder="e.g. 20.00"
                onChange={(e) => setSellPrice(e.target.value)} />
            </label>
            <label>
              <span>
                Buy price <small>($/lb)</small>
              </span>
              <input type="number" step="0.01" min="0" value={buyPrice} placeholder="e.g. 15.78"
                onChange={(e) => setBuyPrice(e.target.value)} />
            </label>
          </div>
          <small>
            {priceMargin === null
              ? "Enter both prices to set the margin from them. Until then the margin below is used."
              : `Margin from prices: ${usd.format(priceMargin)}/lb (overrides the margin field).`}
          </small>
        </fieldset>

        <label>
          <span>
            Margin per pound <small>($/lb, before shrink)</small>
          </span>
          <input type="number" step="0.01" value={effective.marginPerLb} disabled={priceMargin !== null}
            onChange={(e) => set("marginPerLb", Number(e.target.value))} />
          <small>
            <Tag source={DEFAULTS.marginPerLb.source} /> Default $4.22: {DEFAULTS.marginPerLb.source.label}
          </small>
        </label>

        <label>
          <span>
            Selling weeks in year one <small>(weeks)</small>
          </span>
          <input type="number" step="1" min="0" value={inputs.sellingWeeks}
            onChange={(e) => set("sellingWeeks", Number(e.target.value))} />
          <small>
            <Tag source={DEFAULTS.sellingWeeks.source} /> Default 17: {DEFAULTS.sellingWeeks.source.label}
          </small>
        </label>

        <label>
          <span>
            Pounds sold per week <small>(lb/week)</small>
          </span>
          <input type="number" step="1" min="0" value={inputs.lbPerWeek}
            onChange={(e) => set("lbPerWeek", Number(e.target.value))} />
          <small>
            <Tag source={DEFAULTS.lbPerWeek.source} /> Default 150: {DEFAULTS.lbPerWeek.source.label}
          </small>
        </label>

        <label>
          <span>
            Shrink <small>(% dead or lost)</small>
          </span>
          <input type="number" step="0.01" min="0" max="100" value={Number((inputs.shrink * 100).toFixed(4))}
            onChange={(e) => set("shrink", Number(e.target.value) / 100)} />
          <small>
            <Tag source={DEFAULTS.shrink.source} /> Default {(DEFAULTS.shrink.value * 100).toFixed(2)}%:{" "}
            {DEFAULTS.shrink.source.label}
          </small>
        </label>

        <label>
          <span>
            Route <small>(sets fixed costs)</small>
          </span>
          <select value={route}
            onChange={(e) => {
              const next = e.target.value as Route;
              setRoute(next);
              set("fixedCosts", ROUTES[next].fixedCosts);
            }}>
            {(Object.keys(ROUTES) as Route[]).map((k) => (
              <option key={k} value={k}>
                {ROUTES[k].label}: {usd.format(ROUTES[k].fixedCosts)}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>
            Year-one fixed costs <small>($)</small>
          </span>
          <input type="number" step="0.01" min="0" value={inputs.fixedCosts}
            onChange={(e) => set("fixedCosts", Number(e.target.value))} />
          <small>
            <Tag source={DEFAULTS.fixedCosts.source} /> Default $14,563.47: {DEFAULTS.fixedCosts.source.label}
          </small>
          {FIXED_COST_NOTES.map((n) => (
            <small key={n.label}>
              <Tag source={n.source} /> {n.label}: {n.source.label}
            </small>
          ))}
        </label>
      </section>

      <section className="results">
        <div>
          <span>Break-even volume</span>
          <strong>
            {r.breakEvenLbPerWeek === null ? "None at this margin" : `${r.breakEvenLbPerWeek.toFixed(1)} lb/week`}
          </strong>
          {r.breakEvenLbTotal !== null && <small>{Math.round(r.breakEvenLbTotal).toLocaleString()} lb total</small>}
        </div>
        <div>
          <span>Year-one margin earned</span>
          <strong>{usd.format(r.revenueMargin)}</strong>
          <small>{usd.format(r.effectiveMarginPerLb)}/lb after shrink</small>
        </div>
        <div>
          <span>Year-one profit</span>
          <strong className={r.profit < 0 ? "loss" : "gain"}>{usd.format(r.profit)}</strong>
        </div>
      </section>
    </main>
  );
}
