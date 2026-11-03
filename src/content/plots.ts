/**
 * Plot-size pages ("30x50 house plan") and built-up-area pages ("1000 sq ft house cost").
 * Every number on these pages is worked out by the same engine as the tools, at build time.
 */
import { calcBoq, fitPlot } from "../engine";
import type { BoqQuality } from "../engine/specs";

export type Facing = "N" | "E" | "S" | "W";

export interface PlotCfg {
  /** Road-side width (frontage) and depth, feet. */
  w: number;
  d: number;
  bhk: number;
  /** Setbacks, feet. */
  front: number;
  back: number;
  side: number;
}

const cfg = (w: number, d: number, bhk: number): PlotCfg => ({
  w,
  d,
  bhk,
  // small and narrow plots in Indian towns usually keep 3 ft in front; short plots build to the back wall
  front: w <= 25 && d <= 50 ? 3 : d >= 60 ? 10 : d > 40 ? 5 : 3,
  back: d > 40 ? 3 : 0,
  side: w >= 30 ? 3 : 0,
});

/** The plot sizes people search for most, frontage × depth. */
export const PLOTS: PlotCfg[] = [
  cfg(20, 40, 2),
  cfg(20, 45, 3),
  cfg(20, 50, 3),
  cfg(20, 60, 3),
  cfg(25, 40, 3),
  cfg(25, 50, 3),
  cfg(25, 60, 3),
  cfg(30, 30, 2),
  cfg(30, 40, 3),
  cfg(30, 45, 3),
  cfg(30, 50, 3),
  cfg(30, 60, 4),
  cfg(35, 50, 3),
  cfg(40, 50, 4),
  cfg(40, 60, 4),
  cfg(40, 80, 4),
  cfg(50, 50, 4),
  cfg(50, 80, 4),
];

export const plotSlug = (p: PlotCfg) => `${p.w}x${p.d}`;
export const getPlot = (slug: string) =>
  PLOTS.find((p) => plotSlug(p) === slug);

const FT = 0.3048;
const SQM_TO_SQFT = 10.7639;

/** Plan and estimate for one plot (family house, parking on), one result per floor count. */
export interface PlanOpts {
  facing?: Facing;
  /** Shop at the front of the ground floor instead of the car parking. */
  shop?: boolean;
}

export function plotEstimate(
  p: PlotCfg,
  floors: number,
  quality: BoqQuality = "standard",
  opts: PlanOpts = {},
) {
  const fit = fitPlot({
    plotL: p.d * FT,
    plotB: p.w * FT,
    front: p.front * FT,
    back: p.back * FT,
    side: p.side * FT,
    bhk: p.bhk,
    floors,
    parking: !opts.shop,
    shop: !!opts.shop,
    layout: "family",
  });
  const res = calcBoq({
    floorRooms: fit.floorRooms,
    spec: {
      aspect: fit.buildL / fit.buildB,
      buildableM2: fit.buildArea,
      widthM: fit.buildB,
      depthM: fit.buildL,
      facing: opts.facing ?? "E",
      quality,
      // same defaults as the estimate tool (10 ft floors, 5 × 4 ft windows, 1.5 ft plinth)
      floorH: 10 * FT,
      winW: 5 * FT,
      winH: 4 * FT,
      plinth: 1.5 * FT,
    },
  });
  return { fit, res };
}

export interface PlotSummary {
  floors: number;
  builtUp: number;
  total: number;
  perSqft: number;
  basic: number;
  premium: number;
  months: number;
  materials: { key: string; unit: string; qty: number }[];
}

export function plotSummary(p: PlotCfg, floors: number): PlotSummary {
  const { res } = plotEstimate(p, floors);
  const basic = plotEstimate(p, floors, "basic").res.grandTotal;
  const premium = plotEstimate(p, floors, "premium").res.grandTotal;
  const builtUp = res.geometry.builtUpSqft;
  return {
    floors,
    builtUp,
    total: res.grandTotal,
    perSqft: res.perSqft,
    basic,
    premium,
    months: Math.round(4 + 2.5 * floors + builtUp / 1500),
    materials: res.materials.map((m) => ({
      key: m.key,
      unit: m.unit,
      qty: m.qty,
    })),
  };
}

/** Rooms drawn on each floor of the G+1 plan, with sizes in feet. */
export function plotRooms(p: PlotCfg, floors = 2) {
  const { res } = plotEstimate(p, floors);
  return res.sketch.map((s) => ({
    floor: s.floor,
    rooms: s.rects
      .filter((x) => !["column", "corridor", "stair"].includes(x.type))
      .map((x) => ({
        type: x.type as string,
        label: x.label,
        a: x.w / FT,
        b: x.h / FT,
      })),
  }));
}

export const plotArea = (p: PlotCfg) => p.w * p.d;
export const buildableSqft = (p: PlotCfg) =>
  Math.round((p.w - 2 * p.side) * (p.d - p.front - p.back));
export const sqmToSqft = (m2: number) => m2 * SQM_TO_SQFT;

/** Built-up areas people search for ("1000 sq ft house construction cost"). */
export const SQFT_SIZES = [
  500, 600, 800, 1000, 1200, 1500, 1800, 2000, 2500, 3000,
];
export const sqftSlug = (n: number) => `${n}-sq-ft`;
export const getSqft = (slug: string) =>
  SQFT_SIZES.find((n) => sqftSlug(n) === slug);

/** Feet-inch text, e.g. 12'-6". */
export function ftIn(ft: number) {
  let f = Math.floor(ft + 1e-6),
    i = Math.round((ft - f) * 12);
  if (i === 12) {
    f += 1;
    i = 0;
  }
  return `${f}'-${i}"`;
}

/** Indian rupee text in lakh, e.g. ₹28.3 lakh. */
export function lakh(n: number, lang: "en" | "hi") {
  const v = n / 1e5;
  const s = v >= 100 ? (v / 100).toFixed(2) : v.toFixed(1);
  if (v >= 100) return lang === "hi" ? `₹${s} करोड़` : `₹${s} crore`;
  return lang === "hi" ? `₹${s} लाख` : `₹${s} lakh`;
}

export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
