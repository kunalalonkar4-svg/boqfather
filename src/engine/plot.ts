/**
 * Plot-first start: plot size + setbacks + BHK → rooms that fit the buildable area,
 * and a schematic floor sketch (rooms as blocks inside the floor outline).
 */
import { ROOM_DEFS, RoomSpec, RoomType } from "./boq";
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
    floorRooms.push(list.map((r) => (FIXED.includes(r.type) ? r : { ...r, L: round(r.L * k, 2), B: round(r.B * k, 2) })));
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
  const total = items.reduce((a, i) => a + i.area, 0) || 1;
  const out: SketchRect[] = [];
  const sorted = [...items].sort((a, b) => b.area - a.area);
  const place = (list: typeof sorted, x: number, y: number, w: number, h: number) => {
    if (!list.length) return;
    if (list.length === 1) {
      const i = list[0];
      out.push({ key: i.key, label: i.label, type: i.type, x, y, w, h, L: i.L, B: i.B });
      return;
    }
    const sum = list.reduce((a, i) => a + i.area, 0);
    // split into two groups of near-equal area
    let acc = 0,
      cut = 1;
    for (let k = 0; k < list.length - 1; k++) {
      acc += list[k].area;
      cut = k + 1;
      if (acc >= sum / 2) break;
    }
    const a = list.slice(0, cut),
      b = list.slice(cut);
    const fa = a.reduce((s, i) => s + i.area, 0) / sum;
    if (w >= h) {
      place(a, x, y, w * fa, h);
      place(b, x + w * fa, y, w * (1 - fa), h);
    } else {
      place(a, x, y, w, h * fa);
      place(b, x, y + h * fa, w, h * (1 - fa));
    }
  };
  place(sorted, 0, 0, L, B * Math.min(1, total / total));
  return out;
}
