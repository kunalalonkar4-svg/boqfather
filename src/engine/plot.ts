/**
 * Plot-first start: plot size + setbacks + BHK → rooms that fit the buildable area,
 * and a schematic floor sketch (rooms as blocks inside the floor outline).
 */
import { NBC_MIN, ROOM_DEFS, RoomSpec, RoomType } from "./boq";
import { round } from "./units";

export interface PlotInput {
  /** Plot length (front to back) and width, metres. */
  plotL: number;
  plotB: number;
  /** Setbacks, metres. */
  front: number;
  back: number;
  side: number;
  bhk: number;
  floors: number;
  /** Keep a car parking on the ground floor. */
  parking: boolean;
}

export interface PlotFit {
  buildL: number;
  buildB: number;
  buildArea: number;
  /** Rooms of each floor, ground first. */
  floorRooms: RoomSpec[][];
  /** Room scale applied to default sizes (1 = default). */
  scale: number;
  warnings: string[];
}

const STAIR_FP = 6.83;

function template(bhk: number, ground: boolean, parking: boolean): RoomSpec[] {
  const t = (type: RoomType, L?: number, B?: number, extra: Partial<RoomSpec> = {}): RoomSpec => ({ type, L: L ?? ROOM_DEFS[type].L, B: B ?? ROOM_DEFS[type].B, ...extra });
  const n = Math.max(1, Math.min(4, Math.round(bhk)));
  const list: RoomSpec[] = [];
  if (ground && parking) list.push(t("parking"));
  list.push(t("hall"));
  list.push(t("kitchen"));
  if (n >= 2) list.push(t("dining"));
  for (let i = 0; i < n; i++) list.push(t("bedroom", i === 0 ? 3.9 : 3.6, 3.3));
  list.push(t("passage", Math.max(3, 1.2 * (n + Math.min(n, 3))), 1.0));
  const toilets = Math.min(n, 3);
  for (let i = 0; i < toilets; i++) list.push(t("toilet", undefined, undefined, { wc: ground && toilets > 1 && i === toilets - 1 ? "iwc" : "ewc" }));
  if (n >= 3) list.push(t("pooja"));
  if (!ground) list.push(t("balcony"));
  return list;
}

const FIXED: RoomType[] = ["toilet", "parking", "pooja", "store", "utility"];

/** Fit a BHK layout into the buildable part of a plot. */
export function fitPlot(p: PlotInput): PlotFit {
  const buildL = Math.max(3, p.plotL - p.front - p.back);
  const buildB = Math.max(3, p.plotB - 2 * p.side);
  const buildArea = buildL * buildB;
  const warnings: string[] = [];
  const floorRooms: RoomSpec[][] = [];
  let scale = 1;
  for (let f = 0; f < Math.max(1, p.floors); f++) {
    const list = template(p.bhk, f === 0, p.parking);
    const target = buildArea * 0.83 - STAIR_FP;
    const fixed = list.filter((r) => FIXED.includes(r.type)).reduce((a, r) => a + r.L * r.B, 0);
    const flex = list.filter((r) => !FIXED.includes(r.type)).reduce((a, r) => a + r.L * r.B, 0);
    let k = Math.sqrt(Math.max(0.1, target - fixed) / flex);
    if (k > 1.3) k = 1.3;
    if (k < 0.8) {
      if (f === 0)
        warnings.push(
          `The plot is small for ${p.bhk}BHK${p.parking ? " with parking" : ""}: rooms were shrunk to the minimum and may still exceed the buildable area. Try fewer bedrooms or no parking.`,
        );
      k = 0.8;
    }
    if (f === 0) scale = k;
    floorRooms.push(
      list.map((r) => {
        if (FIXED.includes(r.type)) return r;
        // passages keep their width; everything else scales, then is held at the NBC minimum
        let L = round(r.L * k, 2),
          B = r.type === "passage" ? r.B : round(r.B * k, 2);
        const m = NBC_MIN[r.type];
        if (m?.width !== undefined && Math.min(L, B) < m.width) {
          if (L < B) L = m.width;
          else B = m.width;
        }
        if (m?.area !== undefined && L * B < m.area) L = round(m.area / B + 0.005, 2);
        return { ...r, L, B };
      }),
    );
  }
  return { buildL, buildB, buildArea, floorRooms, scale, warnings };
}

export interface SketchRect {
  key: string;
  label: string;
  type: RoomType | "stair";
  x: number;
  y: number;
  w: number;
  h: number;
  /** Real room size (m), for the label. */
  L?: number;
  B?: number;
}

/**
 * Schematic sketch: rooms packed as blocks into the floor outline (L × B), by area.
 * It shows proportions only — it is not an architectural plan.
 */
export function sketchFloor(L: number, B: number, items: { key: string; label: string; type: RoomType | "stair"; area: number; L?: number; B?: number }[]): SketchRect[] {
  const out: SketchRect[] = [];
  const place = (list: typeof items, x: number, y: number, w: number, h: number) => {
    if (!list.length || w <= 0 || h <= 0) return;
    if (list.length === 1) {
      const i = list[0];
      out.push({ key: i.key, label: i.label, type: i.type, x, y, w, h, L: i.L, B: i.B });
      return;
    }
    const sorted = [...list].sort((a, b) => b.area - a.area);
    const sum = sorted.reduce((a, i) => a + i.area, 0);
    // split into two groups of near-equal area
    let acc = 0,
      cut = 1;
    for (let k = 0; k < sorted.length - 1; k++) {
      acc += sorted[k].area;
      cut = k + 1;
      if (acc >= sum / 2) break;
    }
    const a = sorted.slice(0, cut),
      b = sorted.slice(cut);
    const fa = a.reduce((s, i) => s + i.area, 0) / sum;
    if (w >= h) {
      place(a, x, y, w * fa, h);
      place(b, x + w * fa, y, w * (1 - fa), h);
    } else {
      place(a, x, y, w, h * fa);
      place(b, x, y + h * fa, w, h * (1 - fa));
    }
  };
  const stair = items.find((i) => i.type === "stair");
  const rest = items.filter((i) => i !== stair);
  if (!stair) {
    place(rest, 0, 0, L, B);
    return out;
  }
  // staircase always in the same corner (top right) on every floor
  const sw = Math.min(2.4, L * 0.35);
  const sh = Math.min(B * 0.6, stair.area / sw);
  out.push({ key: stair.key, label: stair.label, type: "stair", x: L - sw, y: 0, w: sw, h: sh });
  const colArea = sw * (B - sh);
  const totalRest = rest.reduce((a, i) => a + i.area, 0) || 1;
  const leftArea = (L - sw) * B;
  // small rooms fill the strip below the stair, in proportion to the space it offers
  const target = (colArea / (colArea + leftArea)) * totalRest;
  const col: typeof rest = [];
  let got = 0;
  for (const it of [...rest].sort((a, b) => a.area - b.area)) {
    if (got + it.area > target * 1.15 && col.length) break;
    col.push(it);
    got += it.area;
    if (got >= target) break;
  }
  place(col, L - sw, sh, sw, B - sh);
  place(
    rest.filter((i) => !col.includes(i)),
    0,
    0,
    L - sw,
    B,
  );
  return out;
}
