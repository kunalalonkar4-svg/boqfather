/**
 * Naksha catalogue: every plot size × every road direction (Vastu-checked), plus house-with-shop plans,
 * and gaj (square yard) groups. Plans, sizes, Vastu and cost all come from the engine at build time.
 */
import type { VastuReport } from "../engine/vastu";
import {
  Facing,
  getPlot,
  PlotCfg,
  plotEstimate,
  PLOTS,
  plotSlug,
} from "./plots";

export type NakshaKind = "house" | "shop";

export interface Naksha {
  slug: string;
  plot: PlotCfg;
  facing: Facing;
  kind: NakshaKind;
}

export const FACINGS: Facing[] = ["E", "N", "W", "S"];
export const FACING_NAME: Record<
  Facing,
  { en: string; hi: string; hinglish: string }
> = {
  E: { en: "East facing", hi: "पूर्व मुखी", hinglish: "purv mukhi" },
  N: { en: "North facing", hi: "उत्तर मुखी", hinglish: "uttar mukhi" },
  W: { en: "West facing", hi: "पश्चिम मुखी", hinglish: "paschim mukhi" },
  S: { en: "South facing", hi: "दक्षिण मुखी", hinglish: "dakshin mukhi" },
};
const FACING_SLUG: Record<Facing, string> = {
  E: "east-facing",
  N: "north-facing",
  W: "west-facing",
  S: "south-facing",
};

/** Plot sizes that also get a house-with-shop plan. */
const SHOP_SIZES = ["25x50", "30x50", "30x60"]; // 20 ft is too narrow for a shop plus a separate house entrance

export const NAKSHE: Naksha[] = [
  ...PLOTS.flatMap((plot) =>
    FACINGS.map((facing) => ({
      slug: `${plotSlug(plot)}-${FACING_SLUG[facing]}`,
      plot,
      facing,
      kind: "house" as const,
    })),
  ),
  ...SHOP_SIZES.flatMap((s) =>
    FACINGS.map((facing) => ({
      slug: `${s}-${FACING_SLUG[facing]}-shop`,
      plot: getPlot(s)!,
      facing,
      kind: "shop" as const,
    })),
  ),
];

export const getNaksha = (slug: string) => NAKSHE.find((n) => n.slug === slug);

/**
 * One design = one plot size and type (house or house-with-shop). Its East, North, West and South
 * nakshe use the same rooms, set for each road direction, so galleries show each design once
 * (the East-facing plan) and let the visitor switch the direction. The facing pages stay for search.
 */
export const DESIGNS: Naksha[] = NAKSHE.filter((n) => n.facing === "E");

export const gajOf = (p: PlotCfg) => (p.w * p.d) / 9;

/** Gaj (square yard) groups people search for, with the plot sizes in each. */
export const GAJ = [
  { gaj: 100, min: 0, max: 115 },
  { gaj: 150, min: 115, max: 170 },
  { gaj: 200, min: 170, max: 230 },
  { gaj: 250, min: 230, max: 300 },
  { gaj: 350, min: 300, max: 400 },
  { gaj: 450, min: 400, max: 1e9 },
].map((g) => ({
  ...g,
  slug: `${g.gaj}-gaj`,
  plots: PLOTS.filter((p) => gajOf(p) >= g.min && gajOf(p) < g.max),
}));
export const getGaj = (slug: string) => GAJ.find((g) => g.slug === slug);

/** The plan, estimate and Vastu check of one naksha (G+1). */
export function nakshaPlan(n: Naksha) {
  return plotEstimate(n.plot, 2, "standard", {
    facing: n.facing,
    shop: n.kind === "shop",
  });
}

export interface NakshaInfo {
  builtUp: number;
  total: number;
  basic: number;
  premium: number;
  perSqft: number;
  vastu: VastuReport;
  bhk: number;
  columns: number;
  notes: { en: string; hi: string }[];
}

const cache = new Map<string, NakshaInfo>();
export function nakshaInfo(n: Naksha): NakshaInfo {
  const hit = cache.get(n.slug);
  if (hit) return hit;
  const { fit, res } = nakshaPlan(n);
  const variant = (quality: "basic" | "premium") =>
    plotEstimate(n.plot, 2, quality, {
      facing: n.facing,
      shop: n.kind === "shop",
    }).res.grandTotal;
  const info: NakshaInfo = {
    builtUp: res.geometry.builtUpSqft,
    total: res.grandTotal,
    basic: variant("basic"),
    premium: variant("premium"),
    perSqft: res.perSqft,
    vastu: res.vastu!,
    bhk: fit.floorRooms.flat().filter((r) => r.type === "bedroom").length,
    columns: res.geometry.columns,
    notes: fit.notes,
  };
  cache.set(n.slug, info);
  return info;
}

const kindName = (k: NakshaKind, lang: "en" | "hi") =>
  k === "shop"
    ? lang === "hi"
      ? "दुकान के साथ घर का नक्शा"
      : "House with Shop Plan"
    : lang === "hi"
      ? "घर का नक्शा"
      : "House Plan";

export function nakshaTitle(n: Naksha, lang: "en" | "hi") {
  const s = `${n.plot.w}×${n.plot.d}`;
  const f = FACING_NAME[n.facing];
  return lang === "hi"
    ? `${s} ${f.hi} ${kindName(n.kind, "hi")} (वास्तु अनुसार)`
    : `${s} ${f.en} ${kindName(n.kind, "en")} as per Vastu`;
}

/** Hinglish line people actually type, used in the page so Roman-script searches match. */
export function nakshaHinglish(n: Naksha) {
  const f = FACING_NAME[n.facing].hinglish;
  return `${n.plot.w} by ${n.plot.d} ${f} ${n.kind === "shop" ? "dukan ke sath ghar" : "ghar"} ka naksha`;
}

export const nakshaImage = (n: Naksha) => `/naksha/img/${n.slug}.webp`;

/** 3D preview image of the naksha (made by scripts/naksha-3d-images.mjs). */
export const nakshaImage3d = (n: Naksha) => `/naksha/img3d/${n.slug}.webp`;
