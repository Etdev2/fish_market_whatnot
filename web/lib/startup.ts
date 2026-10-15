// Startup costs, per-box economics and legal checklist for selling lobster
// on Whatnot, as shown on the /investor page.
//
// Status labels follow lib/breakeven.ts:
//   SOURCED    - checked against a named source (date checked: 2026-10-15)
//   ESTIMATE   - a planning assumption, not checked against an official source
//   UNVERIFIED - a figure from the founder or elsewhere we could not confirm

import type { Source } from "./breakeven";

// amount = full plan; lean = cheapest workable launch, with leanNote saying what changes.
export type CostLine = { item: string; amount: number; lean: number; leanNote: string; source: Source; url?: string };

export const STARTUP_COSTS: CostLine[] = [
  {
    item: "California LLC: $70 filing + $20 Statement of Information + $800 franchise tax",
    amount: 890,
    lean: 890,
    leanNote: "Required. A sole proprietorship skips the $800 tax but gives no liability protection.",
    source: { label: "Zenind, California LLC filing fees in 2026", status: "SOURCED" },
    url: "https://www.zenind.com/help/post/california-llc-filing-fees-in-2026-what-it-really-costs-to-form-and-maintain-an-llc",
  },
  {
    item: "CDFW Fish Wholesaler's License (2026)",
    amount: 720,
    lean: 0,
    leanNote: "Selling only to consumers and buying only from licensed dealers is exempt under FGC 8030(c); confirm with CDFW. Buying straight from fishermen needs the $1,063 Receiver's License instead.",
    source: { label: "CDFW commercial fish business license descriptions", status: "SOURCED" },
    url: "https://wildlife.ca.gov/Licensing/Commercial-Fish-Business/Descriptions",
  },
  {
    item: "General liability insurance, one year",
    amount: 525,
    lean: 525,
    leanNote: "Required.",
    source: { label: "TechInsurance median for food and beverage businesses", status: "SOURCED" },
    url: "https://www.techinsurance.com/food-beverage-business-insurance/cost",
  },
  {
    item: "Seafood HACCP training and county health permit",
    amount: 1100,
    lean: 800,
    leanNote: "Online HACCP course instead of in-person; health permit still needed.",
    source: { label: "Planning assumption; course and permit fees not confirmed", status: "ESTIMATE" },
  },
  {
    item: "Streaming gear: camera, lights, mic",
    amount: 1500,
    lean: 150,
    leanNote: "Stream from your phone; add a ring light and clip-on mic.",
    source: { label: "Planning assumption", status: "ESTIMATE" },
  },
  {
    item: "100 insulated foam shipping kits at $41 each",
    amount: 4100,
    lean: 1025,
    leanNote: "Start with 25 kits; reorder from sales.",
    source: { label: "Uline S-12685, 17 x 17 x 9 in, 1.5 in foam, 5+ price", status: "SOURCED" },
    url: "https://www.uline.com/Product/Detail/S-12685/Insulated-Shippers-and-Supplies/Insulated-Foam-Shipping-Kit-17-x-17-x-9",
  },
  {
    item: "Gel packs, seaweed, scale, label printer",
    amount: 1100,
    lean: 300,
    leanNote: "Gel packs and a basic shipping-label printer only.",
    source: { label: "Planning assumption", status: "ESTIMATE" },
  },
  {
    item: "Holding tank and cold storage",
    amount: 3000,
    lean: 0,
    leanNote: "No tank: pre-sell on stream, buy from a licensed dealer and ship the same day.",
    source: { label: "Planning assumption; no tank quote yet", status: "ESTIMATE" },
  },
  {
    item: "Opening inventory, about 500 lb",
    amount: 5000,
    lean: 1000,
    leanNote: "About 100 lb, bought to order.",
    source: { label: "Assumes about $10/lb; needs a dealer quote", status: "UNVERIFIED" },
  },
  {
    item: "Shipping reserve",
    amount: 2500,
    lean: 1100,
    leanNote: "Covers about 20 overnight boxes before Whatnot payouts arrive.",
    source: { label: "Overnight live lobster runs $45 to $63 a box (LobsterAnywhere rate table)", status: "SOURCED" },
    url: "https://lobsteranywhere.com/lobster-shipping/",
  },
  {
    item: "Launch giveaways and promotion",
    amount: 1500,
    lean: 300,
    leanNote: "Small giveaways only.",
    source: { label: "Founder's choice", status: "ESTIMATE" },
  },
  {
    item: "Working capital cushion",
    amount: 2000,
    lean: 1000,
    leanNote: "Half the cushion.",
    source: { label: "Founder's choice", status: "ESTIMATE" },
  },
];

export const COMMISSARY = {
  item: "Commissary kitchen rental to pack (lean plan only, replaces the tank space)",
  lean: 500,
  source: { label: "Planning assumption; get a quote from a local commissary", status: "ESTIMATE" } as Source,
};

export function totalStartup(lines: CostLine[] = STARTUP_COSTS): number {
  return lines.reduce((sum, l) => sum + l.amount, 0);
}

export function totalLean(lines: CostLine[] = STARTUP_COSTS): number {
  return lines.reduce((sum, l) => sum + l.lean, 0) + COMMISSARY.lean;
}

export type BoxInputs = {
  sellPerLb: number;
  buyPerLb: number;
  lbPerBox: number;
  shrink: number; // 0 to 1
  packingPerBox: number;
  shippingCharged: number;
  shippingCost: number;
  commission: number; // Whatnot, fraction of sale price
  processingPct: number; // fraction of sale + shipping
  processingFixed: number;
};

export const BOX_DEFAULTS: { [K in keyof BoxInputs]: { value: number; source: Source } } = {
  sellPerLb: { value: 60, source: { label: "Founder's stated going rate; not confirmed", status: "UNVERIFIED" } },
  buyPerLb: { value: 10, source: { label: "Planning assumption; needs a dealer quote", status: "UNVERIFIED" } },
  lbPerBox: { value: 5, source: { label: "Standard 5-lb box", status: "ESTIMATE" } },
  shrink: { value: 0.1, source: { label: "Planning assumption", status: "ESTIMATE" } },
  packingPerBox: { value: 46, source: { label: "$41 Uline kit + about $5 gel and seaweed", status: "ESTIMATE" } },
  shippingCharged: { value: 45, source: { label: "Seller sets shipping on Whatnot", status: "ESTIMATE" } },
  shippingCost: { value: 55, source: { label: "LobsterAnywhere overnight table, $45 to $63", status: "ESTIMATE" } },
  commission: { value: 0.08, source: { label: "OneCart Whatnot fee calculator", status: "SOURCED" } },
  processingPct: { value: 0.029, source: { label: "OneCart Whatnot fee calculator", status: "SOURCED" } },
  processingFixed: { value: 0.3, source: { label: "OneCart Whatnot fee calculator", status: "SOURCED" } },
};

export type BoxResult = {
  sale: number;
  lobsterCost: number;
  fees: number;
  profit: number;
  margin: number; // profit / sale, 0 when sale is 0
  boxesToPayBack: number | null; // null when profit per box is 0 or less
};

export function boxEconomics(b: BoxInputs, startup = totalStartup()): BoxResult {
  const sale = b.sellPerLb * b.lbPerBox;
  const lobsterCost = b.buyPerLb * b.lbPerBox * (1 + b.shrink);
  const fees = b.commission * sale + b.processingPct * (sale + b.shippingCharged) + b.processingFixed;
  const profit = sale + b.shippingCharged - lobsterCost - b.packingPerBox - b.shippingCost - fees;
  return {
    sale,
    lobsterCost,
    fees,
    profit,
    margin: sale === 0 ? 0 : profit / sale,
    boxesToPayBack: profit > 0 ? startup / profit : null,
  };
}

// CDFW commercial fish business license, step by step (checked 2026-10-15).
const GUIDE = "https://nrm.dfg.ca.gov/FileHandler.ashx?DocumentID=40729&inline";
export const CDFW_STEPS: { step: string; detail: string; url?: string }[] = [
  {
    step: "Pick the license that matches how you buy",
    detail:
      "Buy only from licensed dealers and sell only to consumers: exempt under FGC 8030(c). Buy straight from fishermen at the dock: Fish Receiver's License, $1,063. Buy from dealers and also sell to restaurants or stores: Fish Wholesaler's License, $720. All three together: Multifunction, $2,645.75. 2026 fees.",
    url: "https://wildlife.ca.gov/Licensing/Commercial-Fish-Business/Descriptions",
  },
  {
    step: "Read the CDFW Information Guide",
    detail: "Explains each license, ID rules and record duties.",
    url: GUIDE,
  },
  {
    step: "Set up a CDFW customer account",
    detail: "First-time commercial customers email LRBCOMM@wildlife.ca.gov or call (916) 928-5822 to get a GO ID.",
  },
  {
    step: "Fill in the License Worksheet",
    detail:
      "Use the physical street address of the main plant (a PO Box gets the worksheet returned) and the number of plants or outlets.",
    url: "https://nrm.dfg.ca.gov/FileHandler.ashx?DocumentID=40728&inline",
  },
  {
    step: "Add the Declaration of Plants",
    detail: "One for each extra location, e.g. a second site in Long Beach as well as Newport Beach.",
    url: "https://nrm.dfg.ca.gov/FileHandler.ashx?DocumentID=40724&inline",
  },
  {
    step: "Add the Declaration of Owners",
    detail: "Lists the LLC's owners. Attach the LLC's Articles of Organization and a photo ID (driver's license or state ID).",
    url: "https://nrm.dfg.ca.gov/FileHandler.ashx?DocumentID=40726&inline",
  },
  {
    step: "Submit and pay",
    detail:
      "Mail to License and Revenue Branch, PO Box 944209, Sacramento, CA 94244-2090, or file at a regional sales office. Check, money order, Visa or Mastercard; no cash. Allow 20 business days. Questions: (916) 928-5805, LRB@wildlife.ca.gov.",
  },
  {
    step: "Keep it current",
    detail:
      "Display a copy at each site. Receivers file E-Tix fish tickets within three business days, keep signed tickets four years and pay landing fees quarterly. Licenses run Jan 1 to Dec 31; renew online.",
    url: "https://nrm.dfg.ca.gov/FileHandler.ashx?DocumentID=153060&inline",
  },
];

export type LegalItem = { item: string; detail: string; source: Source; url?: string };

export const LEGAL: LegalItem[] = [
  {
    item: "LLC, EIN and seller's permit",
    detail: "Form the LLC with the Secretary of State, get an EIN, register with CDTFA.",
    source: { label: "Zenind, California LLC fees 2026", status: "SOURCED" },
  },
  {
    item: "CDFW fish business license",
    detail:
      "Depends on how you buy and who you sell to; see the CDFW step-by-step below. Retail-only sellers buying from licensed dealers are exempt; buying from fishermen needs the $1,063 Receiver's License.",
    source: { label: "CDFW Information Guide for Commercial Fish Business Licensing", status: "SOURCED" },
    url: GUIDE,
  },
  {
    item: "FDA Seafood HACCP",
    detail:
      "Holding live lobster until sold counts as processing, so HACCP and sanitation rules apply. A HACCP-trained person does the hazard analysis at least yearly.",
    source: { label: "FDA Seafood HACCP Q&A guidance", status: "SOURCED" },
    url: "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/guidance-industry-questions-and-answers-haccp-regulation-fish-and-fishery-products",
  },
  {
    item: "Local health permits and city business licenses",
    detail:
      "Newport Beach: Orange County Health Care Agency permit plus a Newport Beach business license. Long Beach: the city runs its own health department, so a Long Beach health permit and business license. One permit per site where lobster is held or packed. Fees not confirmed.",
    source: { label: "Not yet checked with OC Health Care Agency or City of Long Beach", status: "UNVERIFIED" },
  },
  {
    item: "Whatnot fresh-food seller approval",
    detail: "Fresh food sellers are onboarded by hand and must hold a license for what they sell.",
    source: { label: "Modern Retail, March 3 2026", status: "SOURCED" },
    url: "https://www.modernretail.co/operations/from-lollipops-to-lobsters-whatnot-pushes-further-into-selling-food-via-livestream-shopping/",
  },
  {
    item: "Shipping rules",
    detail: "FedEx only; UPS and USPS refuse live lobster. Gel packs, not dry ice. Label as live animals.",
    source: { label: "ParcelPath, how to ship live lobster", status: "SOURCED" },
    url: "https://parcelpath.com/resources/food-perishables/seafood/how-to-ship-live-lobster/",
  },
  {
    item: "Investor paperwork",
    detail:
      "An investment agreement (SAFE, convertible note, equity or loan) and an updated LLC operating agreement, reviewed by an attorney.",
    source: { label: "Attorney review required", status: "ESTIMATE" },
  },
];
