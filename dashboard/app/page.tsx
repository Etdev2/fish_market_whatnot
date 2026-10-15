"use client";
import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, ReferenceDot } from "recharts";
import { BASE, FIXED_COMMON, ROUTES, URL, calc, fixedCosts, usd, type Fig, type Route } from "../lib/data";

const TABS = ["Overview", "Calculator", "Startup costs", "Licensing", "How it works", "Risks", "Sources"] as const;
type Tab = (typeof TABS)[number];

function Badge({ fig }: { fig: Fig }) {
  const style = fig.status === "SOURCED" ? "bg-navy text-white" : fig.status === "ESTIMATE" ? "bg-sand text-navy border border-navy/20" : "bg-coral-50 text-coral-600 border border-coral/40";
  const label = fig.status === "SOURCED" ? "SOURCED ↗" : fig.status;
  const cls = `inline-block whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${style}`;
  return fig.url ? (
    <a href={fig.url} target="_blank" rel="noreferrer" title={fig.note ?? fig.url} className={cls + " hover:opacity-80"}>{fig.status === "SOURCED" ? label : label + " ↗"}</a>
  ) : <span title={fig.note} className={cls}>{label}</span>;
}

const S = (url: string, note?: string): Fig => ({ status: "SOURCED", url, note });
const E = (note?: string): Fig => ({ status: "ESTIMATE", note });
const U = (url?: string, note?: string): Fig => ({ status: "UNVERIFIED", url, note });

function Card({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-navy/10 bg-white p-5 shadow-sm ${className}`}>
      {title && <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-navy/70">{title}</h3>}
      {children}
    </section>
  );
}

function Kpi({ label, value, sub, fig }: { label: string; value: string; sub?: string; fig: Fig }) {
  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-navy/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-navy/60">{label}</span>
        <Badge fig={fig} />
      </div>
      <div className="mt-3 text-2xl font-bold sm:text-3xl">{value}</div>
      <div className="mt-1 min-h-[2.5rem] text-sm text-navy/70">{sub}</div>
    </div>
  );
}

function Overview() {
  const b = calc({ ...BASE, route: "receiver" });
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Dock price (ex-vessel)" value="$7–10/lb" sub="2025 opening range; no 2026 figure published. Model uses $10." fig={S(URL.catalina, "Catalina Offshore (industry, not official)")} />
        <Kpi label="Sell price" value="$16/lb" sub="Wholesale to restaurants/markets" fig={E()} />
        <Kpi label="Net margin" value={`${usd(b.margin, 2)}/lb`} sub="$16 × 0.92 − $10 − $0.50 supplies" fig={E("Built on estimated sell price, shrink and supplies")} />
        <Kpi label="Shrink / dead loss" value="8%" sub="Plan for 3–10%" fig={E()} />
        <Kpi label="Year-one fixed" value={usd(b.fixed, 0)} sub="Incl. $5k equipment (~$9,563 without)" fig={E("Mix of sourced fees + estimates")} />
        <Kpi label="Day-one cash" value="$1,533–$1,883" sub="LLC + Receiver license + insurance down (+ optional expedite)" fig={E()} />
        <Kpi label="Break-even" value={`~${Math.round(b.beLbs).toLocaleString()} lb`} sub={`~${Math.round(b.beWeek)} lb/wk over ${BASE.sellingWeeks} selling weeks`} fig={E()} />
        <Kpi label="Base case, year one" value={usd(b.season)} sub="150 lb/wk × 17 weeks, equipment included" fig={E()} />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card title="The business">
          <p className="text-sm leading-relaxed">Buy live California spiny lobster from licensed commercial fishermen (commercial license + Lobster Operator Permit) at Long Beach / Orange County docks, hold in chilled tanks, and sell live and whole on Whatnot and to restaurants and seafood markets.</p>
        </Card>
        <Card title="Season">
          <p className="text-sm leading-relaxed"><b>Oct 7, 2026 – Mar 17, 2027</b> (23 weeks) <Badge fig={S(URL.ccr121, "14 CCR 121")} />. Earliest realistic legal sale ≈ Nov 16 2026, leaving ~17 selling weeks <Badge fig={E()} />.</p>
        </Card>
        <Card title="Bottom line">
          <p className="text-sm leading-relaxed">At the base case of 150 lb/week the first season does <b>not</b> break even ({usd(b.season)}). It needs ~{Math.round(b.beWeek)} lb/week, or cheaper equipment, a higher sell price, or lower shrink.</p>
        </Card>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, fmt, fig }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; fmt: (v: number) => string; fig: Fig }) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium">{label} <Badge fig={fig} /></span>
        <span className="font-mono font-semibold">{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-coral" />
    </label>
  );
}

function Calculator() {
  const [buy, setBuy] = useState(BASE.buy);
  const [sell, setSell] = useState(BASE.sell);
  const [lbs, setLbs] = useState(BASE.lbsPerWeek);
  const [shrink, setShrink] = useState(BASE.shrink);
  const [weeks, setWeeks] = useState(BASE.sellingWeeks);
  const [route, setRoute] = useState<Route>("receiver");
  const inp = { buy, sell, lbsPerWeek: lbs, shrink, sellingWeeks: weeks, route };
  const r = calc(inp);
  const data = useMemo(() => Array.from({ length: 21 }, (_, k) => {
    const v = k * 25;
    return { lbs: v, profit: Math.round(calc({ ...inp, lbsPerWeek: v }).season) };
  }), [buy, sell, shrink, weeks, route]); // eslint-disable-line
  const reset = () => { setBuy(BASE.buy); setSell(BASE.sell); setLbs(BASE.lbsPerWeek); setShrink(BASE.shrink); setWeeks(BASE.sellingWeeks); setRoute("receiver"); };
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card title="Inputs">
        <div className="space-y-4">
          <Slider label="Buy price (ex-vessel)" value={buy} min={5} max={25} step={0.25} onChange={setBuy} fmt={(v) => usd(v, 2) + "/lb"} fig={S(URL.catalina, "2025: $7-10/lb")} />
          <Slider label="Sell price" value={sell} min={10} max={35} step={0.25} onChange={setSell} fmt={(v) => usd(v, 2) + "/lb"} fig={E()} />
          <Slider label="Volume" value={lbs} min={0} max={500} step={5} onChange={setLbs} fmt={(v) => v + " lb/wk"} fig={E()} />
          <Slider label="Shrink / dead loss" value={shrink} min={0} max={0.2} step={0.01} onChange={setShrink} fmt={(v) => Math.round(v * 100) + "%"} fig={E()} />
          <Slider label="Selling weeks" value={weeks} min={1} max={23} step={1} onChange={setWeeks} fmt={(v) => v + " wk"} fig={E("Max 23 = full legal season")} />
          <div>
            <div className="mb-1 text-sm font-medium">CDFW license route <Badge fig={S(URL.cdfw)} /></div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(ROUTES) as Route[]).map((k) => (
                <button key={k} onClick={() => setRoute(k)} className={`rounded-lg border px-3 py-2 text-xs font-semibold sm:text-sm ${route === k ? "border-navy bg-navy text-white" : "border-navy/20 bg-sand-50 hover:bg-sand-200"}`}>
                  {ROUTES[k].label}<br /><span className="font-normal opacity-80">${ROUTES[k].fee2026.toLocaleString()} (2026) + ${ROUTES[k].fee2027.toLocaleString()} (2027, unverified)</span>
                </button>
              ))}
            </div>
            {route === "wholesaler" && <p className="mt-2 text-xs text-coral-600">Wholesaler route buys from a licensed wholesaler, not at the dock, so your buy price will likely be above the dock price. No sourced figure exists for that price; adjust the buy slider yourself.</p>}
          </div>
          <p className="text-xs text-navy/60">Fixed in model: supplies/ice $0.50/lb and fuel $60/week <Badge fig={E()} />. Formulas match lobster-calculator.xlsx.</p>
          <button onClick={reset} className="rounded-lg border border-navy/20 px-3 py-1.5 text-sm hover:bg-sand-200">Reset to base case</button>
        </div>
      </Card>
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-2 gap-4">
          {[
            ["Net margin", usd(r.margin, 2) + "/lb"],
            ["Weekly profit (before fixed)", usd(r.weekly, 0)],
            ["Year-one fixed", usd(r.fixed, 2)],
            ["Year-one profit", usd(r.season, 2)],
            ["Break-even (season)", isFinite(r.beLbs) ? Math.round(r.beLbs).toLocaleString() + " lb" : "never"],
            ["Break-even per week", isFinite(r.beWeek) ? Math.round(r.beWeek) + " lb/wk" : "never"],
          ].map(([l, v]) => (
            <div key={l} className="rounded-xl border border-navy/10 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-navy/60">{l}</div>
              <div className={`mt-1 text-xl font-bold ${l === "Year-one profit" ? (r.season < 0 ? "text-coral-600" : "text-emerald-700") : ""}`}>{v}</div>
            </div>
          ))}
        </div>
        <Card title="Year-one profit vs weekly volume">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 16, left: 8, bottom: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#13294B22" />
                <XAxis dataKey="lbs" tick={{ fontSize: 11 }} label={{ value: "lb / week", position: "insideBottom", offset: -8, fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => "$" + Math.round(v / 1000) + "k"} />
                <Tooltip formatter={(v: number) => usd(v)} labelFormatter={(l) => l + " lb/wk"} />
                <ReferenceLine y={0} stroke="#13294B" />
                <Line type="monotone" dataKey="profit" stroke="#E5634D" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                <ReferenceDot x={Math.round(lbs / 25) * 25} y={Math.round(calc({ ...inp, lbsPerWeek: Math.round(lbs / 25) * 25 }).season)} r={5} fill="#13294B" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Costs() {
  const rows: { item: string; amount: number; fig: Fig }[] = [
    { item: "CDFW Fish Receiver License 2026 (valid to Dec 31 2026)", amount: 1063, fig: S(URL.cdfw) },
    { item: "CDFW Fish Receiver License 2027 (needed Jan 1–Mar 17 2027)", amount: 1063, fig: U(undefined, "2027 fee not published; assumes 2026 fee") },
    ...FIXED_COMMON,
  ];
  const total = fixedCosts("receiver");
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card title="Year-one fixed costs (Receiver route)" className="lg:col-span-2">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-navy/20 text-left text-xs uppercase tracking-wider text-navy/60"><th className="py-2">Item</th><th className="py-2 text-right">Amount</th><th className="py-2 text-right">Status</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.item} className="border-b border-navy/5"><td className="py-2 pr-3">{r.item}</td><td className="py-2 text-right font-mono">{usd(r.amount, 2)}</td><td className="py-2 text-right"><Badge fig={r.fig} /></td></tr>
              ))}
              <tr className="font-bold"><td className="py-2">Total (matches calculator)</td><td className="py-2 text-right font-mono">{usd(total, 2)}</td><td /></tr>
              <tr className="text-navy/70"><td className="py-1">Total without $5,000 equipment</td><td className="py-1 text-right font-mono">{usd(total - 5000, 2)}</td><td /></tr>
              <tr className="text-navy/70"><td className="py-1">Wholesaler route instead ($720 × 2)</td><td className="py-1 text-right font-mono">{usd(fixedCosts("wholesaler"), 2)}</td><td className="py-1 text-right"><Badge fig={S(URL.cdfw)} /></td></tr>
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-1 gap-4">
        <Card title="Day-one cash (Oct 16)">
          <ul className="space-y-1 text-sm">
            <li className="flex justify-between"><span>LLC-1</span><span className="font-mono">$70 <Badge fig={S(URL.sosFees)} /></span></li>
            <li className="flex justify-between"><span>EIN / seller&apos;s permit</span><span className="font-mono">$0 <Badge fig={S(URL.irs)} /></span></li>
            <li className="flex justify-between"><span>24-hr expedite (optional)</span><span className="font-mono">$350 <Badge fig={S(URL.sosFees)} /></span></li>
            <li className="flex justify-between"><span>Insurance down payment</span><span className="font-mono">~$400 <Badge fig={E()} /></span></li>
            <li className="flex justify-between"><span>CDFW Receiver 2026</span><span className="font-mono">$1,063 <Badge fig={S(URL.cdfw)} /></span></li>
            <li className="flex justify-between border-t border-navy/20 pt-1 font-bold"><span>Total</span><span className="font-mono">$1,533–$1,883</span></li>
          </ul>
        </Card>
        <Card title="Not in the model">
          <ul className="list-disc space-y-1 pl-4 text-sm">
            <li>Used cargo van ~$20,000 <Badge fig={E()} /> (model assumes own vehicle)</li>
            <li>Long Beach $12.27/employee <Badge fig={U(URL.lb)} /></li>
            <li>CDFW 3% application fee (capped $7.50) and fish landing fees <Badge fig={S(URL.cdfwGuide)} /></li>
            <li>Retail food permit if selling to the public on site <Badge fig={E()} /></li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Licensing() {
  const cols = [
    { title: "Day 1 (Oct 16)", tone: "bg-navy text-white", items: [
      ["File LLC-1 ($70), optional 24-hr expedite (+$350)", S(URL.sosFees)],
      ["EIN online, issued immediately if approved", S(URL.irs)],
      ["CDTFA seller's permit (free)", S(URL.cdtfa)],
      ["Buy CDFW Receiver License online or at San Diego sales office", S(URL.cdfwGuide)],
      ["Bind insurance (~$400 down)", E()],
      ["Apply for Whatnot Meat & Seafood approval", S(URL.whatnotFood)],
      ["Open UPS account", E()],
    ] },
    { title: "Blockers", tone: "bg-coral text-white", items: [
      ["CDFW license: illegal to buy from fishermen without it", S(URL.cdfw)],
      ["CDPH Processed Food Registration + written Seafood HACCP plan; apply 30–60 days ahead, inspection, certificate ~2 wks after passing", S(URL.cdphPfr)],
      ["Whatnot category approval: 5–7 business days", S(URL.whatnotFood)],
      ["E-Tix landing receipts account (Receiver only); setup time unknown", U(URL.etix)],
      ["Long Beach business license: ~1–2 weeks", E()],
    ] },
    { title: "Earliest legal sale", tone: "bg-sand text-navy", items: [
      ["Whatnot approval ≈ Oct 23–27", E()],
      ["CDFW license in person ≈ late Oct", E()],
      ["CDPH is the long pole; ask if you may operate after filing, before inspection", E()],
      ["Earliest realistic legal sale: late Oct – mid-Nov 2026 (model: ~Nov 16)", E()],
      ["Faster path: Wholesaler License ($720), buy from a licensed wholesaler, no E-Tix. CDPH still required", S(URL.cdfw)],
      ["Deadlines: LLC-12 within 90 days; FTB $800 Jan 15 2027 + Apr 15 2027; 2027 CDFW license by Jan 1", S(URL.ftb)],
    ] },
  ] as const;
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cols.map((c) => (
        <section key={c.title} className="flex flex-col overflow-hidden rounded-xl border border-navy/10 bg-white shadow-sm">
          <h3 className={`px-5 py-3 text-sm font-semibold uppercase tracking-wider ${c.tone}`}>{c.title}</h3>
          <ol className="flex-1 space-y-3 p-5 text-sm">
            {c.items.map(([t, f], i) => (
              <li key={i} className="flex gap-3"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-50 text-[11px] font-bold">{i + 1}</span><span>{t} <Badge fig={f as Fig} /></span></li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

function HowItWorks() {
  const steps: [string, string, Fig][] = [
    ["1 · Dock", "Buy live, whole lobster from fishermen holding a commercial license + Lobster Operator Permit. Check ≥3¼ in carapace. Write an E-Tix landing receipt within 3 business days.", S(URL.ccr1215, "14 CCR 121.5; E-Tix per CDFW guide")],
    ["2 · Tanks", "Hold in chilled seawater tanks or wet cold storage at ~45–50°F. Keep whole (no tailing). Plan for 3–10% shrink / dead loss.", E()],
    ["3 · Sell", "Live auctions on Whatnot (Meat & Seafood category, approval required) plus restaurants and seafood markets locally.", S(URL.whatnotFood)],
    ["4 · Ship", "UPS Next Day Air, Monday–Thursday only. New box ≥275-lb burst / 44 ECT, styrofoam, gel packs, damp paper/seaweed, no standing water, 'LIVE LOBSTER' on two sides. FedEx and USPS don't list lobster.", S(URL.ups)],
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map(([t, d, f]) => (
        <Card key={t} className="flex flex-col">
          <div className="mb-2 flex items-center justify-between"><h3 className="text-lg font-bold text-coral-600">{t}</h3><Badge fig={f} /></div>
          <p className="text-sm leading-relaxed">{d}</p>
        </Card>
      ))}
    </div>
  );
}

function Risks() {
  const risks: [string, string, Fig][] = [
    ["Price swing", "2025 dock price fell to $7–10/lb from $20–24/lb the year before after Australia resumed selling to China. Cheap to buy now, but it can swing back.", S(URL.catalina)],
    ["Short season", "Legal season is Oct 7 2026 – Mar 17 2027. No sale or possession outside it (except lobster frozen during the season). ~17 realistic selling weeks in year one.", S(URL.ccr121)],
    ["Dead loss", "Dead lobster spoils fast. Every point of shrink cuts margin by $0.16/lb at $16 sell.", E()],
    ["Licensing delay", "CDPH registration (with inspection) is the long pole and could eat selling weeks.", S(URL.cdphPfr)],
    ["Shipping failure", "Whatnot can bill the seller for spoilage from the wrong shipping method. No Fri–Sun shipping.", S(URL.whatnotFood)],
    ["Compliance", "Possessing shorts (<3¼ in carapace) or tails is a liability. Domoic acid closures can halt sales.", S(URL.ccr1215)],
    ["Below break-even", "Base case (150 lb/wk) loses ~$4,822 in year one; break-even is ~217 lb/wk.", E()],
    ["Unverified fees", "2027 CDFW fee and Long Beach FY26-27 rate not yet confirmed. Out-of-state buyer rules vary.", U()],
    ["Competition", "Newport Beach Dory Fleet fishermen already sell direct to consumers.", S(URL.dory)],
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {risks.map(([t, d, f]) => (
        <Card key={t}>
          <div className="mb-2 flex items-center justify-between gap-2"><h3 className="font-bold">{t}</h3><Badge fig={f} /></div>
          <p className="text-sm leading-relaxed text-navy/80">{d}</p>
        </Card>
      ))}
    </div>
  );
}

function Sources() {
  const names: Record<string, string> = {
    cdfw: "CDFW commercial fish business license fees 2026", cdfwGuide: "CDFW 2026 Commercial Fish Business License Guide", catalina: "Catalina Offshore: spiny lobster prices (2025)",
    aquatic: "Aquatic Guide: SD lobster prices collapse (secondary)", ccr121: "14 CCR 121 (season)", ccr1215: "14 CCR 121.5 (size, whole lobster)", cdph8610: "CDPH 8610 fee schedule",
    cdphPfr: "CDPH Processed Food Registration", ftb: "FTB LLC annual tax", lb: "Long Beach business license rates FY25-26", sosFees: "CA SOS service/expedite fees", sosDates: "CA SOS processing dates",
    llc1: "LLC-1 form", llc12: "SOS LLC-12", irs: "IRS EIN", cdtfa: "CDTFA permits", whatnotAnimal: "Whatnot animal policy", whatnotFood: "Whatnot food & drink policy",
    whatnotFresh: "Whatnot fresh food best practices", ups: "UPS live animals", fedex: "FedEx live animals", usps: "USPS Pub 52 §526", etix: "PSMFC E-Tix account request",
    cdfwRegs: "CDFW commercial lobster regulations", digest: "CDFW 2026 Commercial Digest", dory: "Dory Fleet lobster", seaGrant: "CA Sea Grant direct-marketing permits",
    alemann: "2026 season / tailing petition (secondary)", incauth: "LLC-12 deadline (secondary)",
  };
  return (
    <div className="space-y-4">
      <Card title="Badge legend">
        <div className="flex flex-wrap gap-4 text-sm">
          <span><Badge fig={S(URL.cdfw)} /> links to the source loaded Oct 15 2026</span>
          <span><Badge fig={E()} /> working assumption; verify</span>
          <span><Badge fig={U()} /> source exists but not confirmed for the current period</span>
        </div>
        <p className="mt-3 text-xs text-navy/60">Figures from the audited startup-checklist.md, lobster-middleman-plan.md and lobster-calculator.xlsx (Audit Oct 15 2026). No testimonials or customer data are shown because none exist yet.</p>
      </Card>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(URL).map(([k, u]) => (
          <a key={k} href={u} target="_blank" rel="noreferrer" className="block rounded-lg border border-navy/10 bg-white p-3 text-sm shadow-sm hover:border-coral">
            <div className="font-semibold">{names[k] ?? k}</div>
            <div className="truncate text-xs text-navy/50">{u}</div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  const [tab, setTab] = useState<Tab>("Overview");
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <header className="mb-6 rounded-2xl bg-navy px-6 py-6 text-white">
        <div className="text-xs font-semibold uppercase tracking-widest text-sand">Investor dashboard · figures audited Oct 15 2026</div>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">California Spiny Lobster: Dock-to-Door Middleman</h1>
        <p className="mt-1 text-sm text-white/80">Long Beach / Orange County · live, whole lobster · Whatnot + restaurants & markets · 2026–27 season</p>
      </header>
      <nav className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {TABS.map((t) => (
          <button key={t} data-tab={t} onClick={() => setTab(t)} className={`rounded-lg px-2 py-2.5 text-sm font-semibold transition ${tab === t ? "bg-coral text-white shadow" : "bg-white text-navy border border-navy/10 hover:bg-sand-200"}`}>{t}</button>
        ))}
      </nav>
      {tab === "Overview" && <Overview />}
      {tab === "Calculator" && <Calculator />}
      {tab === "Startup costs" && <Costs />}
      {tab === "Licensing" && <Licensing />}
      {tab === "How it works" && <HowItWorks />}
      {tab === "Risks" && <Risks />}
      {tab === "Sources" && <Sources />}
      <footer className="mt-8 text-center text-xs text-navy/50">Not investment advice. Estimates are assumptions, not results. No sales have occurred.</footer>
    </main>
  );
}
