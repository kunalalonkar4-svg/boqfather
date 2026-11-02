import { CalcResult } from "./types";
import { round, rupees } from "./units";

/** Construction rate per sqft of built-up area (₹, 2026, composite material + labour). Editable by the user. */
export const QUALITY_RATES = { basic: 1600, standard: 1900, premium: 2600 } as const;
export type Quality = keyof typeof QUALITY_RATES;

/** Location multiplier on the base rate. */
export const LOCATION_FACTORS = { metro: 1.15, tier1: 1.05, tier2: 1.0, town: 0.92, rural: 0.85 } as const;
export type Location = keyof typeof LOCATION_FACTORS;

/** Material thumb rules per sqft of built-up area. */
export const THUMB_RULES = {
  cement: { perSqft: 0.4, unit: "bags", rate: 380 },
  steel: { perSqft: 4.0, unit: "kg", rate: 65 },
  sand: { perSqft: 1.816, unit: "cft", rate: 60 },
  aggregate: { perSqft: 1.35, unit: "cft", rate: 50 },
  bricks: { perSqft: 8, unit: "nos", rate: 8 },
  tiles: { perSqft: 1.3, unit: "sqft", rate: 55 },
  paint: { perSqft: 0.18, unit: "litre", rate: 250 },
} as const;
export type Material = keyof typeof THUMB_RULES;

/** Share of total cost by stage (sums to 100). */
export const PHASES: { key: string; pct: number }[] = [
  { key: "site_excavation", pct: 3 },
  { key: "foundation_plinth", pct: 12 },
  { key: "rcc_structure", pct: 25 },
  { key: "brickwork", pct: 10 },
  { key: "plaster", pct: 6 },
  { key: "flooring", pct: 8 },
  { key: "doors_windows", pct: 8 },
  { key: "electrical", pct: 6 },
  { key: "plumbing", pct: 7 },
  { key: "painting", pct: 5 },
  { key: "waterproofing", pct: 2 },
  { key: "staircase_misc", pct: 3 },
  { key: "contingency", pct: 5 },
];

export const COST_SPLIT: { key: string; pct: number }[] = [
  { key: "materials", pct: 60 },
  { key: "labour", pct: 30 },
  { key: "equipment", pct: 5 },
  { key: "contingency", pct: 5 },
];

export interface HouseInput {
  areaPerFloorSqft: number;
  floors: number;
  quality: Quality;
  location: Location;
  /** Override the base ₹/sqft for the chosen quality. */
  baseRate?: number;
  /** Override material rates. */
  materialRates?: Partial<Record<Material, number>>;
}

export interface HouseValues {
  totalSqft: number;
  ratePerSqft: number;
  total: number;
  low: number;
  high: number;
  materials: { key: Material; qty: number; unit: string; rate: number; amount: number; perSqft: number }[];
  phases: { key: string; pct: number; amount: number }[];
  split: { key: string; pct: number; amount: number }[];
  payments: { key: string; floor?: number; pct: number; amount: number; cumulative: number }[];
  months: number;
}

export function calcHouse(input: HouseInput): CalcResult<HouseValues> {
  const totalSqft = input.areaPerFloorSqft * input.floors;
  const base = input.baseRate ?? QUALITY_RATES[input.quality];
  const factor = LOCATION_FACTORS[input.location];
  const rate = Math.round(base * factor);
  const total = totalSqft * rate;

  const materials = (Object.keys(THUMB_RULES) as Material[]).map((key) => {
    const r = THUMB_RULES[key];
    const qty = totalSqft * r.perSqft;
    const mRate = input.materialRates?.[key] ?? r.rate;
    return { key, qty, unit: r.unit, rate: mRate, amount: qty * mRate, perSqft: r.perSqft };
  });

  const phases = PHASES.map((p) => ({ ...p, amount: (total * p.pct) / 100 }));
  const split = COST_SPLIT.map((p) => ({ ...p, amount: (total * p.pct) / 100 }));

  // Payment milestones: slab share (30%) is spread over the floors.
  const slabPct = 30 / input.floors;
  const plan: { key: string; floor?: number; pct: number }[] = [
    { key: "booking", pct: 10 },
    { key: "foundation", pct: 15 },
    { key: "plinth", pct: 10 },
    ...Array.from({ length: input.floors }, (_, i) => ({ key: "slab", floor: i, pct: slabPct })),
    { key: "brickwork", pct: 10 },
    { key: "plaster_flooring", pct: 15 },
    { key: "handover", pct: 10 },
  ];
  let cum = 0;
  const payments = plan.map((p) => {
    const amount = (total * p.pct) / 100;
    cum += amount;
    return { ...p, amount, cumulative: cum };
  });

  const months = Math.round(4 + 2.5 * input.floors + totalSqft / 1500);

  return {
    values: { totalSqft, ratePerSqft: rate, total, low: total * 0.9, high: total * 1.1, materials, phases, split, payments, months },
    steps: [
      { label: "Built-up area", formula: `${round(input.areaPerFloorSqft)} sqft × ${input.floors} floor(s)`, value: `${round(totalSqft)} sqft` },
      { label: "Rate per sqft", formula: `${rupees(base)} (${input.quality}) × ${factor} (location)`, value: `${rupees(rate)}/sqft` },
      { label: "Total cost", formula: `${round(totalSqft)} × ${rupees(rate)}`, value: rupees(total) },
      ...materials.slice(0, 5).map((m) => ({
        label: m.key[0].toUpperCase() + m.key.slice(1),
        formula: `${round(totalSqft)} × ${m.perSqft} ${m.unit}/sqft`,
        value: `${round(m.qty)} ${m.unit}`,
      })),
    ],
    assumptions: [
      "Thumb-rule (area based) estimate for an RCC framed house; ±10% accuracy.",
      `Base rate ${rupees(base)}/sqft for ${input.quality} quality, location factor ${factor}.`,
      "Includes structure, masonry, plaster, flooring, doors/windows, electrical, plumbing, painting, waterproofing.",
      "Excludes land, approvals, interiors, furniture, compound wall, borewell, water tank.",
      "For a detailed BOQ with measurement book, use the plan-based Detailed Estimate.",
    ],
  };
}
