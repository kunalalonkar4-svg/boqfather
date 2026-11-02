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
  /** Door on one edge of the room (main = house entrance), drawn with its swing. */
  door?: { side: Side; main?: boolean; open?: boolean };
  /** Windows / ventilators on outer-wall edges. */
  windows?: { side: Side; vent?: boolean }[];
}

export type Side = "top" | "bottom" | "left" | "right";

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

export interface LayoutRoom {
  key: string;
  type: RoomType;
  area: number;
  L: number;
  B: number;
  windows: number;
  vents: number;
}

const SMALL: RoomType[] = ["toilet", "store", "pooja", "utility"];

/**
 * Architect-style zoned layout of one floor, front (road) at the bottom of the drawing.
 * Back band: bedrooms with attached toilets back-to-back between them.
 * Corridor: passage across the house.
 * Middle band: kitchen, dining, study, common toilet, pooja, store, wash.
 * Front band: parking / shop, hall (balcony in front of it on upper floors) and the staircase at the front right.
 * Areas are kept in proportion; the drawing is a planning sketch, not a working drawing.
 */
export function layoutFloor(W: number, D: number, rooms: LayoutRoom[], stairArea: number, ground: boolean, wall = 0.23): SketchRect[] {
  const iw = W - 2 * wall,
    id = D - 2 * wall;
  const bedrooms = rooms.filter((r) => r.type === "bedroom");
  const toilets = rooms.filter((r) => r.type === "toilet");
  const attachedN = toilets.length >= 2 ? Math.min(toilets.length - 1, bedrooms.length) : 0;
  const attached = toilets.slice(0, attachedN);
  const common = toilets.slice(attachedN);
  const passages = rooms.filter((r) => r.type === "passage");
  const front = rooms.filter((r) => ["parking", "shop", "hall"].includes(r.type));
  const balconies = rooms.filter((r) => r.type === "balcony");
  const used = new Set([...bedrooms, ...toilets, ...passages, ...front, ...balconies]);
  const middle = [...rooms.filter((r) => !used.has(r)), ...common];

  type Col = { items: LayoutRoom[]; stair?: boolean };
  // back band: BR | T/T | BR | BR | T/T | BR …
  const back: Col[] = [];
  {
    const att = [...attached];
    bedrooms.forEach((b, i) => {
      back.push({ items: [b] });
      if (i % 2 === 0 && att.length) back.push({ items: att.splice(0, Math.min(2, att.length)) });
    });
    if (att.length) back.push({ items: att });
  }
  // middle band: big rooms as columns, small rooms stacked in pairs
  const mid: Col[] = [];
  {
    const big = middle.filter((r) => !SMALL.includes(r.type)).sort((a, b) => (a.type === "kitchen" ? -1 : b.type === "kitchen" ? 1 : 0));
    const small = middle.filter((r) => SMALL.includes(r.type));
    for (const r of big) mid.push({ items: [r] });
    for (let i = 0; i < small.length; i += 2) mid.push({ items: small.slice(i, i + 2) });
  }
  // front band: parking / shop, hall (+ balcony in front), stair at the right
  const fr: Col[] = [];
  {
    for (const r of front.filter((x) => x.type !== "hall")) fr.push({ items: [r] });
    const halls = front.filter((x) => x.type === "hall");
    const balc = [...balconies];
    if (halls.length) halls.forEach((h, i) => fr.push({ items: i === 0 && balc.length ? [h, balc.shift()!] : [h] }));
    for (const b of balc) fr.push({ items: [b] });
    if (!halls.length && !front.length && !balconies.length && middle.length > 2) {
      // nothing for the front band: move the biggest middle column forward
      const c = mid.shift();
      if (c) fr.push(c);
    }
  }
  const stairCol = stairArea > 0;
  const bands: { cols: Col[]; kind: "back" | "corr" | "mid" | "front" }[] = [];
  if (back.length) bands.push({ cols: back, kind: "back" });
  if (passages.length) bands.push({ cols: passages.map((p) => ({ items: [p] })), kind: "corr" });
  if (mid.length) bands.push({ cols: mid, kind: "mid" });
  if (fr.length || stairCol) bands.push({ cols: fr, kind: "front" });

  const area = (c: Col) => c.items.reduce((a, r) => a + r.area, 0);
  const bandArea = (b: (typeof bands)[number]) => b.cols.reduce((a, c) => a + area(c), 0) + (b.kind === "front" && stairCol ? stairArea : 0);
  const total = bands.reduce((a, b) => a + bandArea(b), 0) || 1;
  const out: SketchRect[] = [];
  let y = wall;
  bands.forEach((b, bi) => {
    const h = (bandArea(b) / total) * id;
    const sum = bandArea(b) || 1;
    let x = wall;
    const cols: (Col & { w: number })[] = b.cols.map((c) => ({ ...c, w: (area(c) / sum) * iw }));
    if (b.kind === "front" && stairCol) cols.push({ items: [], stair: true, w: (stairArea / sum) * iw });
    const isTop = bi === 0,
      isBottom = bi === bands.length - 1;
    cols.forEach((c, ci) => {
      const isLeft = ci === 0,
        isRight = ci === cols.length - 1;
      if (c.stair) {
        out.push({ key: "STAIR", label: "Stair", type: "stair", x, y, w: c.w, h, door: { side: "left", open: true } });
        x += c.w;
        return;
      }
      const ca = area(c) || 1;
      let yy = y;
      // balcony sits in front of the hall; otherwise keep given order
      c.items.forEach((r, k) => {
        const rh = (r.area / ca) * h;
        const rect: SketchRect = { key: r.key, label: r.key, type: r.type, x, y: yy, w: c.w, h: rh, L: r.L, B: r.B, windows: [] };
        const top = isTop && k === 0,
          bottom = isBottom && k === c.items.length - 1;
        // outer-wall edges for windows / ventilators
        const ext: Side[] = [];
        if (top) ext.push("top");
        if (bottom) ext.push("bottom");
        if (isLeft) ext.push("left");
        if (isRight) ext.push("right");
        const nWin = r.type === "toilet" || r.type === "store" || r.type === "utility" ? 0 : r.windows;
        const nVent = r.vents;
        const pref = (b.kind === "back" ? ["top", "left", "right"] : b.kind === "front" ? ["bottom", "left", "right"] : ["left", "right", "top", "bottom"]) as Side[];
        const sides = pref.filter((sd) => ext.includes(sd));
        for (let i = 0; i < nWin && sides.length; i++) rect.windows!.push({ side: sides[i % sides.length] });
        for (let i = 0; i < nVent && sides.length; i++) rect.windows!.push({ side: sides[(nWin + i) % sides.length], vent: true });
        // doors
        if (r.type === "parking") rect.door = { side: "bottom", open: true };
        else if (r.type === "shop") rect.door = { side: "bottom", main: true };
        else if (r.type === "hall") rect.door = ground && b.kind === "front" ? { side: "bottom", main: true } : { side: "right" };
        else if (r.type === "balcony") rect.door = { side: "top" };
        else if (r.type === "passage" || r.type === "dining") rect.door = undefined;
        else if (b.kind === "back") {
          if (r.type === "toilet") rect.door = { side: k === 0 ? "left" : c.items.length > 1 ? "right" : "bottom" };
          else rect.door = { side: "bottom" };
        } else if (b.kind === "mid") rect.door = { side: k === 0 ? (bands[bi - 1]?.kind === "corr" ? "top" : "left") : "left" };
        else rect.door = { side: "top" };
        out.push(rect);
        yy += rh;
      });
      x += c.w;
    });
    y += h;
  });
  return out;
}
