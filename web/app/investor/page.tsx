"use client";

import Link from "next/link";
import { useState } from "react";
import type { Source } from "@/lib/breakeven";
import {
  BOX_DEFAULTS,
  CDFW_STEPS,
  boxEconomics,
  COMMISSARY,
  LEGAL,
  STARTUP_COSTS,
  TIMELINE,
  totalLean,
  totalStartup,
  type BoxInputs,
} from "@/lib/startup";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
const usd0 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function Tag({ source }: { source: Source }) {
  return <span className={`tag ${source.status.toLowerCase()}`}>{source.status}</span>;
}

function SourceNote({ source, url }: { source: Source; url?: string }) {
  return (
    <small>
      <Tag source={source} />
      {url ? (
        <a href={url} target="_blank" rel="noreferrer">
          {source.label}
        </a>
      ) : (
        source.label
      )}
    </small>
  );
}

const defaults = Object.fromEntries(
  Object.entries(BOX_DEFAULTS).map(([k, v]) => [k, v.value]),
) as BoxInputs;

export default function Investor() {
  const [b, setB] = useState<BoxInputs>(defaults);
  const total = totalStartup();
  const lean = totalLean();
  const r = boxEconomics(b, lean);
  const set = (key: keyof BoxInputs, value: number) => setB({ ...b, [key]: value });

  return (
    <main>
      <p>
        <Link href="/">← Break-even calculator</Link>
      </p>
      <h1>Investor summary: lobster on Whatnot</h1>
      <p className="note">
        Startup costs, per-box economics and the legal checklist for selling lobster on Whatnot from Newport Beach
        and Long Beach. Figures checked 2026-10-15. Nothing here is legal advice.
      </p>

      <p className="warn">
        This page uses the founder’s $60/lb sell price. The audited model on the break-even page uses a $4.22/lb
        margin and shows a year-one loss. Resolve which price is real before relying on either.
      </p>

      <section className="results">
        <div>
          <span>Startup cost, lean</span>
          <strong>{usd0.format(lean)}</strong>
          <small>Full plan {usd0.format(total)}</small>
        </div>
        <div>
          <span>Profit per box</span>
          <strong className={r.profit < 0 ? "loss" : "gain"}>{usd.format(r.profit)}</strong>
          <small>{(r.margin * 100).toFixed(1)}% of sale price</small>
        </div>
        <div>
          <span>Boxes to pay back lean plan</span>
          <strong>{r.boxesToPayBack === null ? "Never at this price" : Math.ceil(r.boxesToPayBack).toLocaleString()}</strong>
        </div>
      </section>

      <h2>Startup costs</h2>
      <p className="note">
        Lean = the cheapest workable launch: no holding tank (pre-sell on stream, buy from a licensed dealer and ship the
        same day), phone streaming, 25 shipping kits to start, and a rented commissary kitchen to pack.
      </p>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th className="num">Lean</th>
            <th className="num">Full</th>
          </tr>
        </thead>
        <tbody>
          {STARTUP_COSTS.map((l) => (
            <tr key={l.item}>
              <td>
                {l.item}
                <br />
                <SourceNote source={l.source} url={l.url} />
                <br />
                <small>Lean: {l.leanNote}</small>
              </td>
              <td className="num">{usd0.format(l.lean)}</td>
              <td className="num">{usd0.format(l.amount)}</td>
            </tr>
          ))}
          <tr>
            <td>
              {COMMISSARY.item}
              <br />
              <SourceNote source={COMMISSARY.source} />
            </td>
            <td className="num">{usd0.format(COMMISSARY.lean)}</td>
            <td className="num">{usd0.format(0)}</td>
          </tr>
          <tr className="total">
            <td>Total</td>
            <td className="num">{usd0.format(lean)}</td>
            <td className="num">{usd0.format(total)}</td>
          </tr>
        </tbody>
      </table>

      <h2>Per 5-lb box</h2>
      <section className="inputs">
        <div className="pair">
          <label>
            <span>
              Sell price <small>($/lb)</small>
            </span>
            <input type="number" step="0.01" min="0" value={b.sellPerLb}
              onChange={(e) => set("sellPerLb", Number(e.target.value))} />
            <SourceNote source={BOX_DEFAULTS.sellPerLb.source} />
          </label>
          <label>
            <span>
              Buy price <small>($/lb)</small>
            </span>
            <input type="number" step="0.01" min="0" value={b.buyPerLb}
              onChange={(e) => set("buyPerLb", Number(e.target.value))} />
            <SourceNote source={BOX_DEFAULTS.buyPerLb.source} />
          </label>
        </div>
      </section>
      <table>
        <tbody>
          <tr><td>Sale price</td><td className="num">{usd.format(r.sale)}</td></tr>
          <tr><td>Shipping paid by buyer</td><td className="num">{usd.format(b.shippingCharged)}</td></tr>
          <tr><td>Lobster, incl. {(b.shrink * 100).toFixed(0)}% loss</td><td className="num">−{usd.format(r.lobsterCost)}</td></tr>
          <tr><td>Cooler, gel packs, seaweed</td><td className="num">−{usd.format(b.packingPerBox)}</td></tr>
          <tr><td>FedEx overnight</td><td className="num">−{usd.format(b.shippingCost)}</td></tr>
          <tr><td>Whatnot 8% + processing 2.9% + $0.30</td><td className="num">−{usd.format(r.fees)}</td></tr>
          <tr className="total"><td>Profit per box</td><td className="num">{usd.format(r.profit)}</td></tr>
        </tbody>
      </table>

      <h2>Time to launch: about 4 to 6 weeks</h2>
      <ol className="legal">
        {TIMELINE.map((t) => (
          <li key={t.step}>
            <small>{t.when}</small>
            <strong>{t.step}</strong>
            <span>{t.detail}</span>
            <SourceNote source={t.source} url={t.url} />
          </li>
        ))}
      </ol>

      <h2>CDFW fish business license, step by step</h2>
      <ol className="legal steps">
        {CDFW_STEPS.map((st, i) => (
          <li key={st.step}>
            <strong>
              {i + 1}. {st.step}
            </strong>
            <span>{st.detail}</span>
            {st.url && (
              <small>
                <a href={st.url} target="_blank" rel="noreferrer">
                  Open the form or page
                </a>
              </small>
            )}
          </li>
        ))}
      </ol>

      <h2>Legal checklist</h2>
      <ul className="legal">
        {LEGAL.map((l) => (
          <li key={l.item}>
            <strong>{l.item}</strong>
            <span>{l.detail}</span>
            <SourceNote source={l.source} url={l.url} />
          </li>
        ))}
      </ul>
    </main>
  );
}
