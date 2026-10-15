// All figures from the audited files (Audit Oct 15 2026):
// startup-checklist.md, lobster-middleman-plan.md, lobster-calculator.csv/.xlsx
export type Status = "SOURCED" | "ESTIMATE" | "UNVERIFIED";
export type Fig = { status: Status; url?: string; note?: string };

export const URL = {
  cdfw: "https://wildlife.ca.gov/Licensing/Commercial-Fish-Business/Descriptions",
  cdfwGuide: "https://nrm.dfg.ca.gov/FileHandler.ashx?DocumentID=40729",
  catalina: "https://catalinaop.com/why-california-spiny-lobster-prices-are-set-the-way-they-are-what-most-consumers-dont-know/",
  aquatic: "https://aquaticguide.com/san-diego-spiny-lobster-fishermen-struggle-as-prices-collapse/",
  ccr121: "https://www.law.cornell.edu/regulations/california/14-CCR-121",
  ccr1215: "https://www.law.cornell.edu/regulations/california/14-CCR-121.5",
  cdph8610: "https://www.cdph.ca.gov/CDPH%20Document%20Library/ControlledForms/cdph8610.pdf",
  cdphPfr: "https://www.cdph.ca.gov/Programs/CEH/DFDCS/Pages/FDBPrograms/FoodSafetyProgram/ProcedureObtainingProcessedFoodRegistration.aspx",
  ftb: "https://www.ftb.ca.gov/file/business/types/limited-liability-company/index.html",
  lb: "https://www.longbeach.gov/globalassets/finance/media-library/documents/business-info/business-licenses/rate-table-display-07-1-25",
  sosFees: "https://www.sos.ca.gov/business-programs/business-entities/service-options",
  sosDates: "https://www.sos.ca.gov/business-programs/business-entities/processing-dates",
  llc1: "https://bpd.cdn.sos.ca.gov/llc/forms/llc-1.pdf",
  llc12: "https://www.sos.ca.gov/business-programs/business-entities/forms/limited-liability-companies-statement-information",
  irs: "https://www.irs.gov/businesses/small-businesses-self-employed/get-an-employer-identification-number",
  cdtfa: "https://www.cdtfa.ca.gov/services/permits-licenses.htm",
  whatnotAnimal: "https://help.whatnot.com/hc/en-us/articles/30332489173261-Animal-Related-Policy",
  whatnotFood: "https://help.whatnot.com/hc/en-us/articles/27681555378701-Whatnot-Food-Drink-Policy",
  whatnotFresh: "https://help.whatnot.com/hc/en-us/articles/42924449850509-Fresh-Food-on-Whatnot-Best-Practices",
  ups: "https://www.ups.com/us/en/support/shipping-support/shipping-special-care-regulated-items/prohibited-items/plants-and-animals",
  fedex: "https://www.fedex.com/en-us/shipping/how-to-ship-live-animals.html",
  usps: "https://pe.usps.com/PUB52_Archive/NHTML/PUB52_Archive_20260201/pub52c5_009.htm",
  etix: "https://etix.psmfc.org/Account/RequestNew",
  cdfwRegs: "https://wildlife.ca.gov/conservation/marine/invertebrates/commercial-regulations",
  digest: "https://nrm.dfg.ca.gov/FileHandler.ashx?DocumentID=191712&inline=",
  dory: "https://doryfleet.com/market/?portfolio=lobster",
  seaGrant: "https://caseagrant.ucsd.edu/market-your-catch/getting-started-or-expanding/permits-and-more/california",
  alemann: "https://alemannrealty.com/blog/who-buys-santa-barbaras-lobster-when-china-doesnt",
  incauth: "https://www.incauthority.com/blog/how-to-start-a-california-llc/",
};

export const BASE = {
  buy: 10, sell: 16, lbsPerWeek: 150, shrink: 0.08, sellingWeeks: 17, seasonWeeks: 23,
  supplies: 0.5, fuel: 60,
};

export const FIXED_COMMON = [
  { item: "CDPH Processed Food Registration ($524 base + $250 Seafood HACCP + $100 food safety)", amount: 874, fig: { status: "SOURCED", url: URL.cdph8610 } as Fig },
  { item: "Long Beach wholesale business license (FY25-26 table; FY26-27 unverified)", amount: 473.47, fig: { status: "UNVERIFIED", url: URL.lb, note: "Sourced for FY25-26 only" } as Fig },
  { item: "LLC-1 ($70) + LLC-12 ($20), CA Secretary of State", amount: 90, fig: { status: "SOURCED", url: URL.sosFees } as Fig },
  { item: "FTB $800 annual tax x2 (due Jan 15 2027 and Apr 15 2027)", amount: 1600, fig: { status: "SOURCED", url: URL.ftb } as Fig },
  { item: "Insurance: general/product liability + commercial auto", amount: 4000, fig: { status: "ESTIMATE", note: "range $3-5k/yr" } as Fig },
  { item: "HACCP training course", amount: 400, fig: { status: "ESTIMATE" } as Fig },
  { item: "Equipment: live tanks / chiller / coolers", amount: 5000, fig: { status: "ESTIMATE", note: "range $3-8k" } as Fig },
];

export const ROUTES = {
  receiver: { label: "Fish Receiver (buy at dock)", fee2026: 1063, fee2027: 1063 },
  wholesaler: { label: "Fish Wholesaler (buy from licensed wholesaler)", fee2026: 720, fee2027: 720 },
} as const;
export type Route = keyof typeof ROUTES;

export type Inputs = { buy: number; sell: number; lbsPerWeek: number; shrink: number; sellingWeeks: number; route: Route };

export function fixedCosts(route: Route) {
  const r = ROUTES[route];
  return r.fee2026 + r.fee2027 + FIXED_COMMON.reduce((s, c) => s + c.amount, 0);
}

// Mirrors lobster-calculator.xlsx formulas exactly
export function calc(i: Inputs) {
  const margin = i.sell * (1 - i.shrink) - i.buy - BASE.supplies; // B20
  const weekly = margin * i.lbsPerWeek - BASE.fuel; // B21
  const monthly = weekly * 4.33; // B22
  const fixed = fixedCosts(i.route); // B23
  const season = weekly * i.sellingWeeks - fixed; // B24
  const beLbs = margin > 0 ? (fixed + BASE.fuel * i.sellingWeeks) / margin : Infinity; // B25
  const beWeek = beLbs / i.sellingWeeks; // B26
  const beFull = margin > 0 ? (fixed + BASE.fuel * BASE.seasonWeeks) / margin / BASE.seasonWeeks : Infinity; // B27
  return { margin, weekly, monthly, fixed, season, beLbs, beWeek, beFull };
}

export const usd = (n: number, d = 0) =>
  (n < 0 ? "-" : "") + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
