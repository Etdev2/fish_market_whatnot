"use client";

import { useState } from "react";
import { calculate, DEFAULTS, type Inputs } from "@/lib/breakeven";

const FIELDS: { key: keyof Inputs; label: string; unit: string; step: string }[] = [
  { key: "marginPerLb", label: "Margin per pound", unit: "$/lb", step: "0.01" },
  { key: "sellingWeeks", label: "Selling weeks in year one", unit: "weeks", step: "1" },
  { key: "lbPerWeek", label: "Pounds sold per week", unit: "lb/week", step: "1" },
  { key: "fixedCosts", label: "Year-one fixed costs", unit: "$", step: "1" },
];

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function Home() {
  const [inputs, setInputs] = useState<Inputs>({
    marginPerLb: DEFAULTS.marginPerLb.value,
    sellingWeeks: DEFAULTS.sellingWeeks.value,
    lbPerWeek: DEFAULTS.lbPerWeek.value,
    fixedCosts: DEFAULTS.fixedCosts.value,
  });
  const r = calculate(inputs);

  return (
    <main>
      <h1>Lobster break-even</h1>
      <p className="note">
        Every default comes from the 2026-10-15 briefing and none has been checked against an
        official source yet. Treat them all as estimates.
      </p>

      <section className="inputs">
        {FIELDS.map((f) => (
          <label key={f.key}>
            <span>
              {f.label} <small>({f.unit})</small>
            </span>
            <input
              type="number"
              step={f.step}
              min="0"
              value={inputs[f.key]}
              onChange={(e) => setInputs({ ...inputs, [f.key]: Number(e.target.value) })}
            />
            <small className={`source ${DEFAULTS[f.key].source.status}`}>
              Default {DEFAULTS[f.key].value}: {DEFAULTS[f.key].source.label} ({DEFAULTS[f.key].source.status})
            </small>
          </label>
        ))}
      </section>

      <section className="results">
        <div>
          <span>Break-even volume</span>
          <strong>
            {r.breakEvenLbPerWeek === null ? "None at this margin" : `${r.breakEvenLbPerWeek.toFixed(1)} lb/week`}
          </strong>
        </div>
        <div>
          <span>Year-one margin earned</span>
          <strong>{usd.format(r.revenueMargin)}</strong>
        </div>
        <div>
          <span>Year-one profit</span>
          <strong className={r.profit < 0 ? "loss" : "gain"}>{usd.format(r.profit)}</strong>
        </div>
      </section>
    </main>
  );
}
