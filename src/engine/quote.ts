/** Contractor quote checker: compares a quote with Guniyo's benchmark. */
import { Location, LOCATION_FACTORS, Quality, QUALITY_RATES } from "./house";

/** Labour-only rate per sqft (₹) by quality — indicative, editable. */
export const LABOUR_RATES: Record<Quality, number> = {
  basic: 350,
  standard: 420,
  premium: 520,
};

/** Indicative market ranges for common items (₹), before location factor. */
export const ITEM_BENCHMARKS = {
  cement: { unit: "bag", min: 350, max: 420 },
  steel: { unit: "kg", min: 58, max: 72 },
  rcc: { unit: "m³", min: 6000, max: 8000 },
  brickwork: { unit: "m³", min: 5500, max: 7500 },
  plaster: { unit: "m²", min: 300, max: 420 },
  tiles: { unit: "sqft", min: 120, max: 175 },
  labour: { unit: "sqft", min: 330, max: 520 },
} as const;
export type QuoteItem = keyof typeof ITEM_BENCHMARKS;

export type Verdict = "too_low" | "good" | "fair" | "slightly_high" | "high";

export interface QuoteInput {
  builtUpSqft: number;
  quality: Quality;
  location: Location;
  scope: "turnkey" | "labour";
  /** Quote as ₹ per sqft, or as a total amount. */
  mode: "sqft" | "lump";
  quote: number;
  items?: Partial<Record<QuoteItem, number>>;
}

export interface QuoteResult {
  quotePerSqft: number;
  quoteTotal: number;
  benchPerSqft: number;
  benchTotal: number;
  diffPct: number;
  diffAmount: number;
  verdict: Verdict;
  items: {
    key: QuoteItem;
    unit: string;
    rate: number;
    min: number;
    max: number;
    status: "low" | "ok" | "high";
  }[];
}

export function verdictFor(diffPct: number): Verdict {
  if (diffPct < -15) return "too_low";
  if (diffPct < -5) return "good";
  if (diffPct <= 8) return "fair";
  if (diffPct <= 20) return "slightly_high";
  return "high";
}

export function checkQuote(input: QuoteInput): QuoteResult {
  const f = LOCATION_FACTORS[input.location];
  const benchPerSqft = Math.round(
    (input.scope === "turnkey"
      ? QUALITY_RATES[input.quality]
      : LABOUR_RATES[input.quality]) * f,
  );
  const quoteTotal =
    input.mode === "sqft" ? input.quote * input.builtUpSqft : input.quote;
  const quotePerSqft = quoteTotal / input.builtUpSqft;
  const benchTotal = benchPerSqft * input.builtUpSqft;
  const diffPct = ((quotePerSqft - benchPerSqft) / benchPerSqft) * 100;
  const items = (Object.keys(input.items ?? {}) as QuoteItem[])
    .filter((k) => (input.items![k] ?? 0) > 0)
    .map((key) => {
      const b = ITEM_BENCHMARKS[key];
      const min = Math.round(b.min * f),
        max = Math.round(b.max * f);
      const rate = input.items![key]!;
      return {
        key,
        unit: b.unit,
        rate,
        min,
        max,
        status:
          rate < min
            ? ("low" as const)
            : rate > max
              ? ("high" as const)
              : ("ok" as const),
      };
    });
  return {
    quotePerSqft,
    quoteTotal,
    benchPerSqft,
    benchTotal,
    diffPct,
    diffAmount: quoteTotal - benchTotal,
    verdict: verdictFor(diffPct),
    items,
  };
}

/** Points to clarify with the contractor before signing. */
export const QUOTE_CHECKLIST = [
  {
    en: "Cement and steel brand and grade (e.g. OPC 53 / PPC, Fe500D)",
    hi: "सीमेंट और सरिया का ब्रांड और ग्रेड (जैसे OPC 53 / PPC, Fe500D)",
  },
  {
    en: "Tile allowance in ₹/sqft and who pays the difference",
    hi: "टाइल्स का अलाउंस ₹/sqft और ज़्यादा महंगी टाइल का फ़र्क कौन देगा",
  },
  {
    en: "Doors and windows material (flush / teak, aluminium / UPVC)",
    hi: "दरवाज़े-खिड़की का मटीरियल (फ़्लश / सागौन, एल्युमिनियम / UPVC)",
  },
  {
    en: "Number of electrical points and wire / switch brand",
    hi: "बिजली के पॉइंट्स की संख्या और वायर / स्विच का ब्रांड",
  },
  {
    en: "Plumbing pipe and sanitary fitting brands",
    hi: "प्लंबिंग पाइप और सैनिटरी फिटिंग का ब्रांड",
  },
  {
    en: "Waterproofing for terrace, toilets and sunken areas",
    hi: "छत, टॉयलेट और संकेन एरिया की वॉटरप्रूफिंग",
  },
  {
    en: "Excavation depth included and rate for extra depth / rock",
    hi: "कितनी गहराई की खुदाई शामिल है, ज़्यादा गहराई / चट्टान का रेट",
  },
  {
    en: "Water and electricity during construction — who pays",
    hi: "निर्माण के दौरान पानी और बिजली का खर्च कौन देगा",
  },
  {
    en: "Curing, scaffolding and debris removal included",
    hi: "तराई (curing), पाड़ और मलबा हटाना शामिल है या नहीं",
  },
  { en: "GST included or extra", hi: "GST शामिल है या अलग" },
  {
    en: "Payment linked to stages, not dates",
    hi: "भुगतान तारीख़ से नहीं, काम के चरण से जुड़ा हो",
  },
  {
    en: "Completion time and penalty for delay",
    hi: "पूरा होने का समय और देरी पर पेनल्टी",
  },
  {
    en: "Price escalation clause for steel / cement",
    hi: "सरिया / सीमेंट महंगा होने पर रेट बढ़ने की शर्त",
  },
  {
    en: "Structural drawings by a qualified engineer",
    hi: "योग्य इंजीनियर की स्ट्रक्चरल ड्रॉइंग",
  },
];
