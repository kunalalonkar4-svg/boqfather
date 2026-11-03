/**
 * City cost levels. Relative levels between cities come from published 2026 city rate studies
 * (InfraLens 55-city study, SpeakArch June 2026); they are anchored to our own tier-2 item-wise BOQ
 * (Jaipur / Lucknow / Nagpur = 1.00 ≈ ₹1,700 per sq ft standard).
 */
import { calcBoq, calcHouse, QUALITY_RATES } from "../engine";
import { getPlot, plotEstimate } from "./plots";

export interface City {
  slug: string;
  en: string;
  hi: string;
  state: [string, string];
  /** Standard rate in the study, ₹/sq ft (used only for the relative level). */
  ref: number;
}

const c = (
  en: string,
  hi: string,
  state: [string, string],
  ref: number,
): City => ({
  slug: en.toLowerCase().replace(/[^a-z]+/g, "-"),
  en,
  hi,
  state,
  ref,
});
const AP: [string, string] = ["Andhra Pradesh", "आंध्र प्रदेश"];
const BR: [string, string] = ["Bihar", "बिहार"];
const NCR: [string, string] = ["Delhi NCR", "दिल्ली NCR"];
const GJ: [string, string] = ["Gujarat", "गुजरात"];
const HR: [string, string] = ["Haryana", "हरियाणा"];
const KA: [string, string] = ["Karnataka", "कर्नाटक"];
const KL: [string, string] = ["Kerala", "केरल"];
const MP: [string, string] = ["Madhya Pradesh", "मध्य प्रदेश"];
const MH: [string, string] = ["Maharashtra", "महाराष्ट्र"];
const PB: [string, string] = ["Punjab", "पंजाब"];
const RJ: [string, string] = ["Rajasthan", "राजस्थान"];
const TN: [string, string] = ["Tamil Nadu", "तमिलनाडु"];
const TS: [string, string] = ["Telangana", "तेलंगाना"];
const UP: [string, string] = ["Uttar Pradesh", "उत्तर प्रदेश"];
const WB: [string, string] = ["West Bengal", "पश्चिम बंगाल"];

export const CITIES: City[] = [
  // Madhya Pradesh, Rajasthan, UP first: where most searches in Hindi come from
  c("Indore", "इंदौर", MP, 2048),
  c("Bhopal", "भोपाल", MP, 1995),
  c("Jaipur", "जयपुर", RJ, 2100),
  c("Jodhpur", "जोधपुर", RJ, 1995),
  c("Udaipur", "उदयपुर", RJ, 2048),
  c("Lucknow", "लखनऊ", UP, 2048),
  c("Kanpur", "कानपुर", UP, 1943),
  c("Agra", "आगरा", UP, 1995),
  c("Varanasi", "वाराणसी", UP, 1943),
  c("Prayagraj", "प्रयागराज", UP, 1943),
  c("Noida", "नोएडा", NCR, 2625),
  c("Ghaziabad", "गाज़ियाबाद", NCR, 2310),
  c("Gurgaon", "गुरुग्राम", NCR, 2730),
  c("Faridabad", "फ़रीदाबाद", NCR, 2258),
  c("Delhi", "दिल्ली", NCR, 2835),
  c("Patna", "पटना", BR, 1890),
  c("Muzaffarpur", "मुज़फ़्फ़रपुर", BR, 1785),
  c("Raipur", "रायपुर", ["Chhattisgarh", "छत्तीसगढ़"], 1943),
  c("Ranchi", "रांची", ["Jharkhand", "झारखंड"], 1943),
  c("Dehradun", "देहरादून", ["Uttarakhand", "उत्तराखंड"], 2153),
  c("Chandigarh", "चंडीगढ़", PB, 2258),
  c("Ludhiana", "लुधियाना", PB, 2100),
  c("Amritsar", "अमृतसर", PB, 2048),
  c("Karnal", "करनाल", HR, 2153),
  c("Panipat", "पानीपत", HR, 2100),
  c("Ahmedabad", "अहमदाबाद", GJ, 2153),
  c("Surat", "सूरत", GJ, 2153),
  c("Vadodara", "वडोदरा", GJ, 2100),
  c("Rajkot", "राजकोट", GJ, 2048),
  c("Mumbai", "मुंबई", MH, 3150),
  c("Pune", "पुणे", MH, 2573),
  c("Nagpur", "नागपुर", MH, 2100),
  c("Nashik", "नासिक", MH, 2048),
  c("Aurangabad", "औरंगाबाद", MH, 1995),
  c("Bangalore", "बेंगलुरु", KA, 2520),
  c("Mysore", "मैसूर", KA, 2153),
  c("Hyderabad", "हैदराबाद", TS, 2205),
  c("Chennai", "चेन्नई", TN, 2363),
  c("Coimbatore", "कोयंबटूर", TN, 2153),
  c("Kochi", "कोच्चि", KL, 2415),
  c("Kolkata", "कोलकाता", WB, 2205),
  c("Bhubaneswar", "भुवनेश्वर", ["Odisha", "ओडिशा"], 1995),
  c("Guwahati", "गुवाहाटी", ["Assam", "असम"], 2048),
  c("Visakhapatnam", "विशाखापत्तनम", AP, 2100),
  c("Vijayawada", "विजयवाड़ा", AP, 2048),
];

/** Our tier-2 level in the same study (mean of Jaipur, Lucknow, Nagpur). */
const ANCHOR = (2100 + 2048 + 2100) / 3;
export const cityFactor = (city: City) =>
  Math.round((city.ref / ANCHOR) * 100) / 100;
export const getCity = (slug: string) => CITIES.find((x) => x.slug === slug);
const r10 = (n: number) => Math.round(n / 10) * 10;

export function cityRates(city: City) {
  const f = cityFactor(city);
  return {
    factor: f,
    basic: r10(QUALITY_RATES.basic * f),
    standard: r10(QUALITY_RATES.standard * f),
    premium: r10(QUALITY_RATES.premium * f),
  };
}

/** Cost of a few common built-up areas at standard finish in this city. */
export function cityAreaCosts(city: City) {
  const rate = cityRates(city);
  return [1000, 1500, 2000, 2500].map((sqft) => ({
    sqft,
    basic: calcHouse({
      areaPerFloorSqft: sqft,
      floors: 1,
      quality: "basic",
      location: "tier2",
      baseRate: rate.basic,
    }).values.total,
    standard: calcHouse({
      areaPerFloorSqft: sqft,
      floors: 1,
      quality: "standard",
      location: "tier2",
      baseRate: rate.standard,
    }).values.total,
    premium: calcHouse({
      areaPerFloorSqft: sqft,
      floors: 1,
      quality: "premium",
      location: "tier2",
      baseRate: rate.premium,
    }).values.total,
  }));
}

/** Item-wise BOQ of the 30×50 G+1 family plan, priced for this city. */
export function cityBoq30x50(city: City) {
  const p = getPlot("30x50")!;
  const { fit } = plotEstimate(p, 2);
  const res = calcBoq({
    floorRooms: fit.floorRooms,
    spec: {
      aspect: fit.buildL / fit.buildB,
      buildableM2: fit.buildArea,
      widthM: fit.buildB,
      depthM: fit.buildL,
      facing: "E",
      floorH: 3.048,
      winW: 1.524,
      winH: 1.2192,
      plinth: 0.4572,
    },
    locationFactor: cityFactor(city),
  });
  return {
    total: res.grandTotal,
    builtUp: res.geometry.builtUpSqft,
    perSqft: res.perSqft,
  };
}
