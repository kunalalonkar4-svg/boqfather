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
  const scaleList = (list: RoomSpec[], k: number) =>
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
    });
  const depthFor = (list: RoomSpec[], ground: boolean) =>
    requiredDepth(
      buildB,
      list.map((r, i) => ({
        key: `${r.type}${i}`,
        type: r.type,
        area: r.L * r.B,
        L: r.L,
        B: r.B,
        windows: r.windows ?? ROOM_DEFS[r.type].windows,
        vents: ROOM_DEFS[r.type].vents,
        wc: r.wc,
      })),
      STAIR_FP,
      ground,
    );
  for (let f = 0; f < Math.max(1, p.floors); f++) {
    const list = template(p.bhk, f === 0, p.parking);
    // largest room scale (0.8–1.3) whose planned layout still fits the buildable depth
    let k = 1.3;
    while (k > 0.8 && depthFor(scaleList(list, k), f === 0) > buildL + 0.05) k = round(k - 0.025, 3);
    const fitsAtMin = depthFor(scaleList(list, k), f === 0) <= buildL + 0.05;
    if (!fitsAtMin && f === 0)
      warnings.push(
        `The plot is small for ${p.bhk}BHK${p.parking ? " with parking" : ""}: even with rooms at the minimum size the plan needs more depth than the plot allows. Try fewer bedrooms or no parking.`,
      );
    if (f === 0) scale = k;
    floorRooms.push(scaleList(list, k));
  }
  return { buildL, buildB, buildArea, floorRooms, scale, warnings };
}

export type Side = "top" | "bottom" | "left" | "right";
export type SketchKind = RoomType | "stair" | "corridor" | "porch" | "open" | "column" | "dress";

/** A door or a plain opening on one edge; `at` = distance from the edge start (left / top end), metres. */
export interface SketchDoor {
  side: Side;
  at: number;
  width: number;
  main?: boolean;
  /** Opening without a shutter (arch / passage). */
  open?: boolean;
  /** Rolling shutter. */
  shutter?: boolean;
}

export interface SketchRect {
  key: string;
  label: string;
  type: SketchKind;
  /** Clear (inside) extent of the space, metres; y = 0 at the back wall, grows towards the road. */
  x: number;
  y: number;
  w: number;
  h: number;
  doors?: SketchDoor[];
  windows?: { side: Side; vent?: boolean }[];
}

export interface LayoutRoom {
  key: string;
  type: RoomType;
  area: number;
  L: number;
  B: number;
  windows: number;
  vents: number;
  wc?: "ewc" | "iwc";
}

const IW = 0.115; // internal wall
const STAIR_W = 2.3; // dog-legged stair: 2 flights of 1.0 m + 0.1 gap + wall play
const STAIR_D = 3.35; // flights + landing
const FLEX: RoomType[] = ["hall", "bedroom", "kitchen", "dining", "study", "shop"];

interface Slot {
  room?: LayoutRoom;
  kind: SketchKind;
  key: string;
  depth: number;
  /** Area to hold (m²), minimum depth and an optional fixed depth (stair, parking, balcony). */
  area: number;
  minD: number;
  fixedD?: number;
  /** Hall / balcony also cover the passage strip. */
  spans?: boolean;
  /** Bedroom this toilet belongs to (door from the bedroom). */
  attachedTo?: string;
  /** A second space in the same row: attached toilet beside its bedroom, store / lobby beside the stair. */
  side?: Slot;
  sideW?: number;
}

interface Lanes {
  two: boolean;
  a: number;
  b: number;
  c: number;
  left: Slot[];
  right: Slot[];
}

function laneTotal(l: Slot[]) {
  return l.reduce((t, x) => t + x.depth, 0) + IW * Math.max(0, l.length - 1);
}

const MIN_D: Partial<Record<RoomType, number>> = { bedroom: 2.7, hall: 3.0, kitchen: 2.1, dining: 2.1, toilet: 1.2, study: 2.4, pooja: 1.0, store: 1.0, utility: 1.0, shop: 3.0 };

/** Distribute the rooms of one floor into lanes (front to back) and size the lanes so both come out about equally deep. */
function makeLanes(W: number, idTarget: number, rooms: LayoutRoom[], stairArea: number, ground: boolean, wall: number): Lanes {
  const iw = W - 2 * wall;
  const hasStair = stairArea > 0;
  const two = iw >= 2.7 + IW + 1.0 + IW + STAIR_W;
  const c = two ? (iw > 10 ? 1.2 : 1.05) : Math.min(1.05, Math.max(0.9, iw * 0.2));
  const avail = two ? iw - c - 2 * IW : iw - c - IW;
  const by = (t: RoomType) => rooms.filter((r) => r.type === t);
  const slot = (r: LayoutRoom, extra: Partial<Slot> = {}): Slot => ({ room: r, kind: r.type, key: r.key, depth: 0, area: r.area, minD: MIN_D[r.type] ?? 1.0, ...extra });
  const toilets = by("toilet");
  const bedrooms = by("bedroom");
  const attN = toilets.length >= 2 ? Math.min(toilets.length - 1, bedrooms.length) : 0;
  const attached = toilets.slice(0, attN);
  const common = toilets.slice(attN);
  const left: Slot[] = [];
  const right: Slot[] = [];
  for (const r of by("parking")) left.push(slot(r, { fixedD: Math.max(5.0, r.L > r.B ? r.L : r.B) }));
  for (const r of by("shop")) left.push(slot(r));
  for (const r of by("balcony")) left.push(slot(r, { spans: true, fixedD: Math.min(1.5, Math.max(1.0, Math.min(r.L, r.B))) }));
  for (const h of by("hall")) left.push(slot(h, { spans: true }));
  const R = two ? right : left;
  if (hasStair) R.push({ kind: "stair", key: "STAIR", depth: 0, area: STAIR_W * STAIR_D, minD: STAIR_D, fixedD: STAIR_D });
  const kitchen = by("kitchen"),
    dining = by("dining");
  kitchen.forEach((k, i) => {
    R.push(slot(k));
    if (dining[i]) R.push(slot(dining[i]));
  });
  for (const d of dining.slice(kitchen.length)) R.push(slot(d));
  for (const t of ["utility", "store", "pooja", "study"] as RoomType[]) for (const r of by(t)) R.push(slot(r));
  for (const t of common) R.push(slot(t));
  const areaOf = (l: Slot[]) => l.reduce((t, x) => t + x.area, 0);
  const beds = [...bedrooms].sort((x, y) => x.area - y.area);
  const att = [...attached];
  beds.forEach((bd, i) => {
    const lane = !two || areaOf(left) <= areaOf(right) ? left : right;
    lane.push(slot(bd));
    if (att.length > 0 && beds.length - i <= att.length) {
      const t = att.shift()!;
      lane.push(slot(t, { attachedTo: bd.key }));
    }
  });

  let a = avail,
    b = 0;
  const applyWidths = () => {
    const rowDepth = (x: Slot, w: number) => {
      if (x.side) {
        if (x.kind === "stair") {
          x.sideW = w - STAIR_W - IW;
          x.depth = STAIR_D;
        } else if (x.side.kind === "kitchen") {
          // kitchen beside the dining: kitchen on the outer wall, 2.1 m wide or more
          let kw = 2.4;
          for (let k = 0; k < 4; k++) {
            const d = Math.max(2.4, (x.area + x.side.area) / (w - IW));
            kw = Math.max(2.1, Math.min(w - 2.4 - IW, x.side.area / d));
            x.depth = d;
          }
          x.sideW = kw;
        } else {
          // toilet beside its bedroom: about 1.2–1.7 m wide, as deep as the bedroom
          let tw = 1.5;
          for (let k = 0; k < 3; k++) {
            const d = Math.max(x.minD, x.area / (w - tw - IW));
            tw = Math.max(1.2, Math.min(1.7, x.side.area / d));
            x.depth = d;
          }
          x.sideW = tw;
        }
        x.side.depth = x.depth;
        return;
      }
      if (x.kind === "toilet" && w > 2.6) {
        // a toilet on its own row in a wide lane: about 2.1 m wide (rest becomes dress / wash area), 1.5–2.1 m deep
        x.depth = Math.max(1.5, Math.min(2.1, x.area / 2.1));
        return;
      }
      x.depth = x.fixedD ?? Math.max(x.minD, x.area / (x.spans ? w + IW + c : w));
    };
    for (const x of left) rowDepth(x, a);
    for (const x of right) rowDepth(x, b);
  };
  const size = () => {
    if (!two) {
      applyWidths();
      return;
    }
    // choose the lane split so both lanes come out equally deep (stair lane ≥ 2.3 m, parking lane ≥ 3 m)
    const minA = by("parking").length ? 3.0 : 2.7;
    let lo = right.some((x) => x.kind === "bedroom" || x.kind === "study") ? 2.5 : STAIR_W,
      hi = Math.max(STAIR_W, avail - minA);
    for (let it = 0; it < 24; it++) {
      b = (lo + hi) / 2;
      a = avail - b;
      applyWidths();
      if (laneTotal(right) > laneTotal(left)) lo = b;
      else hi = b;
    }
    b = (lo + hi) / 2;
    a = avail - b;
    applyWidths();
  };
  size();

  // balance: move movable rooms from the deeper lane to the other one
  if (two) {
    const movable = (x: Slot) => x.room && ["toilet", "utility", "store", "pooja", "study", "bedroom"].includes(x.room.type) && !x.attachedTo;
    for (let guard = 0; guard < 6; guard++) {
      const [big, small] = laneTotal(right) > laneTotal(left) ? [right, left] : [left, right];
      const diff = laneTotal(big) - laneTotal(small);
      if (diff < 1.2) break;
      let best: { i: number; gain: number } | undefined;
      big.forEach((x, i) => {
        if (!movable(x)) return;
        const pairD = big[i + 1]?.attachedTo === x.key ? big[i + 1].depth + IW : 0;
        const moved = x.depth + pairD + IW;
        const gain = Math.abs(diff) - Math.abs(diff - 2 * moved);
        if (gain > 0.2 && (!best || gain > best.gain)) best = { i, gain };
      });
      if (!best) break;
      const { i } = best;
      const x = big[i];
      const pair = big[i + 1]?.attachedTo === x.key ? big.splice(i + 1, 1)[0] : undefined;
      big.splice(i, 1);
      if (x.room?.type === "bedroom") {
        small.push(x);
        if (pair) small.push(pair);
      } else {
        let idx = small.findIndex((y) => ["hall", "stair", "kitchen", "dining"].includes(y.kind));
        while (idx + 1 < small.length && ["hall", "stair", "kitchen", "dining"].includes(small[idx + 1].kind)) idx++;
        small.splice(idx + 1, 0, x);
      }
      size();
    }
  }
  // ---- second space in a row: attached toilet beside its bedroom (wide lanes), store / lobby beside the stair
  const lanesW: [Slot[], number][] = two
    ? [
        [left, a],
        [right, b],
      ]
    : [[left, a]];
  for (const [lane, w] of lanesW) {
    if (w >= 4.6)
      for (let i = 0; i < lane.length - 1; i++) {
        const k = lane[i],
          d = lane[i + 1];
        if (k.kind === "kitchen" && d.kind === "dining" && !k.side && !d.side) {
          d.side = k;
          lane.splice(i, 1);
        }
      }
    if (w >= 4.0)
      for (let i = 0; i < lane.length - 1; i++) {
        const x = lane[i],
          t = lane[i + 1];
        if (x.kind === "bedroom" && t.attachedTo === x.key) {
          x.side = t;
          lane.splice(i + 1, 1);
        }
      }
    const st = lane.find((x) => x.kind === "stair");
    if (st && w - STAIR_W - IW >= 1.5) {
      const pool = two ? [...right, ...left] : left;
      const pick =
        pool.find((x) => x.room && ["utility", "store", "pooja"].includes(x.room.type) && !x.side) ??
        (ground && by("parking").length ? undefined : pool.find((x) => x.room?.type === "toilet" && !x.attachedTo && !x.side));
      if (pick) {
        for (const l of [left, right]) {
          const k = l.indexOf(pick);
          if (k >= 0) l.splice(k, 1);
        }
        st.side = pick;
      } else st.side = { kind: "corridor", key: "LOBBY", depth: 0, area: 0, minD: 0 };
    }
  }
  size();
  void idTarget;
  return { two, a, b, c, left, right };
}

const twoLanes = (W: number, wall: number) => W - 2 * wall >= 2.7 + IW + 1.0 + IW + STAIR_W;

interface Cell {
  key: string;
  kind: SketchKind;
  room?: LayoutRoom;
  w: number;
}
interface Row {
  cells: Cell[];
  depth: number;
  flex?: boolean;
}
type CellIn = { key: string; kind: SketchKind; room?: LayoutRoom; area: number; fixedW?: number };

/**
 * Narrow plots (about 20–25 ft frontage): full-width rows with the dining as the circulation hub —
 * front: parking + porch / balcony; hall + stair; kitchen + dining; toilets either side of a small lobby; bedrooms side by side.
 */
function hubFloor(W: number, D: number | null, rooms: LayoutRoom[], stairArea: number, ground: boolean, wall: number): { rects: SketchRect[]; need: number } {
  const iw = W - 2 * wall;
  const by = (t: RoomType) => rooms.filter((r) => r.type === t);
  const rows: Row[] = [];
  const split = (cells: CellIn[], minD: number) => {
    const fixedW = cells.reduce((t, c) => t + (c.fixedW ?? 0), 0);
    const free = iw - fixedW - IW * (cells.length - 1);
    const flexA = cells.filter((c) => c.fixedW === undefined).reduce((t, c) => t + c.area, 0) || 1;
    const depth = Math.max(minD, flexA / Math.max(0.5, free));
    return { depth, cells: cells.map((c) => ({ key: c.key, kind: c.kind, room: c.room, w: c.fixedW ?? (free * c.area) / flexA })) };
  };
  const cellOf = (r: LayoutRoom, fixedW?: number): CellIn => ({ key: r.key, kind: r.type, room: r, area: r.area, fixedW });
  // front: parking / shop with a porch beside it, or the balcony upstairs
  const park = [...by("parking"), ...by("shop")];
  if (park.length) {
    const p0 = park[0];
    const pw = Math.min(iw, Math.max(2.7, p0.type === "parking" ? 3.0 : p0.area / 3.5));
    const withPorch = iw - pw - IW >= 0.9;
    const cells: Cell[] = [{ key: p0.key, kind: p0.type, room: p0, w: withPorch ? pw : iw }];
    if (withPorch) cells.push({ key: "PORCH", kind: "porch", w: iw - pw - IW });
    rows.push({ cells, depth: p0.type === "parking" ? 5.0 : Math.max(3.0, p0.area / pw) });
  }
  for (const b of by("balcony")) rows.push({ cells: [{ key: b.key, kind: "balcony", room: b, w: iw }], depth: Math.min(1.5, Math.max(1.0, b.area / iw)) });
  // hall + stair
  const hall = by("hall")[0];
  const stairBeside = stairArea > 0 && iw - STAIR_W - IW >= 3.0;
  if (hall)
    rows.push({
      ...split([cellOf(hall), ...(stairBeside ? [{ key: "STAIR", kind: "stair" as SketchKind, area: 0, fixedW: STAIR_W }] : [])], stairBeside ? STAIR_D : 3.0),
      flex: true,
    });
  // kitchen + dining (+ stair when it did not fit beside the hall)
  const mid: CellIn[] = [];
  for (const k of by("kitchen")) mid.push(cellOf(k, Math.max(2.1, Math.min(iw * 0.45, k.area / 2.7))));
  for (const d of by("dining")) mid.push(cellOf(d));
  if (stairArea > 0 && !stairBeside) mid.push({ key: "STAIR", kind: "stair", area: 0, fixedW: Math.min(STAIR_W, iw * 0.45) });
  if (!by("dining").length && mid.length) mid.push({ key: "HUB", kind: "corridor", area: 3 });
  if (mid.length) rows.push({ ...split(mid, stairBeside ? 2.4 : STAIR_D), flex: true });
  // toilets / pooja / store / wash either side of a 1 m lobby
  const smalls = [...by("toilet"), ...by("pooja"), ...by("store"), ...by("utility"), ...by("study")];
  const bedrooms = [...by("bedroom")].sort((x, y) => y.area - x.area);
  if (smalls.length || bedrooms.length) {
    const lobbyW = 1.7;
    const half = (iw - lobbyW - 2 * IW) / 2;
    const L: LayoutRoom[] = [],
      Rr: LayoutRoom[] = [];
    smalls.forEach((x, i) => (i % 2 === 0 ? L : Rr).push(x));
    const sideCells = (list: LayoutRoom[]): Cell[] => list.map((x) => ({ key: x.key, kind: x.type, room: x, w: (half - IW * (list.length - 1)) / list.length }));
    const cells: Cell[] = [
      ...(L.length ? sideCells(L) : [{ key: "OPEN-L", kind: "open" as SketchKind, w: half }]),
      { key: "LOBBY", kind: "corridor", w: lobbyW },
      ...(Rr.length ? sideCells(Rr) : [{ key: "OPEN-R", kind: "open" as SketchKind, w: half }]),
    ];
    const depth = Math.max(1.5, Math.min(2.4, ...cells.filter((c) => c.room).map((c) => c.room!.area / c.w)));
    rows.push({ cells, depth });
  }
  // bedrooms in pairs; a lobby continues between them when more rows follow
  for (let i = 0; i < bedrooms.length; i += 2) {
    const pair = bedrooms.slice(i, i + 2);
    const more = i + 2 < bedrooms.length;
    const cells = pair.map((b) => cellOf(b));
    const withLobby: CellIn[] = more ? [cells[0], { key: `LOBBY${i}`, kind: "corridor", area: 0, fixedW: 1.0 }, ...cells.slice(1)] : cells;
    rows.push({ ...split(withLobby, 2.7), flex: true });
  }

  const total = () => rows.reduce((t, r) => t + r.depth, 0) + IW * Math.max(0, rows.length - 1);
  const need = total();
  if (D === null) return { rects: [], need: need + 2 * wall };
  const id = D - 2 * wall;
  // fit: flexible rows take the slack up to +25%, the rest is an open sit-out at the back
  const flexD = rows.filter((r) => r.flex).reduce((t, r) => t + r.depth, 0);
  let k = flexD > 0 ? (id - (need - flexD)) / flexD : 1;
  k = Math.max(0.7, Math.min(1.25, k));
  for (const r of rows) if (r.flex) r.depth *= k;
  if (id - total() > 0.6) rows.push({ cells: [{ key: "OTS", kind: "open", w: iw }], depth: id - total() - IW });
  else if (rows.length) rows[rows.length - 1].depth += id - total();

  // place: front row at the bottom
  const out: SketchRect[] = [];
  let yf = 0;
  for (const r of rows) {
    let x = wall;
    const y = wall + id - yf - r.depth;
    for (const c of r.cells) {
      out.push({ key: c.key, label: c.key, type: c.kind, x, y, w: c.w, h: r.depth, doors: [], windows: [] });
      x += c.w + IW;
    }
    yf += r.depth + IW;
  }
  const find = (t: SketchKind) => out.find((q) => q.type === t);
  const overlapX = (p: SketchRect, q: SketchRect) => Math.max(0, Math.min(p.x + p.w, q.x + q.w) - Math.max(p.x, q.x));
  const vNeighbour = (p: SketchRect, q: SketchRect) => Math.abs(p.y - (q.y + q.h + IW)) < 0.02 || Math.abs(q.y - (p.y + p.h + IW)) < 0.02;
  const hNeighbour = (p: SketchRect, q: SketchRect) => Math.abs(p.y - q.y) < 0.02 && (Math.abs(p.x + p.w + IW - q.x) < 0.02 || Math.abs(q.x + q.w + IW - p.x) < 0.02);
  const doorBetween = (p: SketchRect, q: SketchRect | undefined, width: number, extra: Partial<SketchDoor> = {}) => {
    if (!q) return false;
    if (vNeighbour(p, q) && overlapX(p, q) >= 0.7) {
      const lo = Math.max(p.x, q.x),
        hi = Math.min(p.x + p.w, q.x + q.w);
      const wd = Math.min(width, hi - lo - 0.1);
      p.doors!.push({ side: q.y < p.y ? "top" : "bottom", at: lo - p.x + (hi - lo - wd) / 2, width: wd, ...extra });
      return true;
    }
    if (hNeighbour(p, q)) {
      const wd = Math.min(width, Math.min(p.h, q.h) - 0.3);
      if (wd < 0.6) return false;
      p.doors!.push({ side: q.x > p.x ? "right" : "left", at: Math.max(0.1, p.h - wd - 0.2), width: wd, ...extra });
      return true;
    }
    return false;
  };
  const hallR = find("hall"),
    porch = find("porch"),
    lobby = out.find((q) => q.key === "LOBBY");
  const hub = out.find((q) => q.type === "dining") ?? out.find((q) => q.key === "HUB");
  for (const r of out) {
    switch (r.type) {
      case "parking":
        r.doors!.push({ side: "bottom", at: 0.1, width: r.w - 0.2, open: true });
        break;
      case "porch":
        r.doors!.push({ side: "bottom", at: 0.05, width: r.w - 0.1, open: true });
        break;
      case "shop":
        r.doors!.push({ side: "bottom", at: Math.max(0.1, (r.w - Math.min(2.4, r.w - 0.3)) / 2), width: Math.min(2.4, r.w - 0.3), shutter: true });
        break;
      case "hall":
        if (ground) {
          if (porch) doorBetween(r, porch, 1.0, { main: true });
          else if (!out.some((q) => q.type === "parking" || q.type === "shop")) r.doors!.push({ side: "bottom", at: Math.max(0.2, r.w / 2 - 0.5), width: 1.0, main: true });
          else r.doors!.push({ side: "bottom", at: 0.2, width: 1.0, main: true });
        }
        doorBetween(r, hub, 1.5, { open: true }) ||
          doorBetween(
            r,
            out.find((q) => q.type === "kitchen"),
            0.9,
          );
        doorBetween(r, find("balcony"), 1.0);
        break;
      case "stair":
        doorBetween(r, hallR && Math.abs(hallR.y - r.y) < 0.02 ? hallR : hub, 1.0, { open: true });
        break;
      case "kitchen":
        doorBetween(r, hub, 1.0, { open: true }) || doorBetween(r, hallR, 0.9);
        break;
      case "dining":
        doorBetween(r, lobby, 1.0, { open: true });
        break;
      case "corridor":
        if (r.key === "HUB") doorBetween(r, lobby, 1.0, { open: true });
        break;
      case "bedroom": {
        const lobbies = out.filter((q) => q.type === "corridor" && q.key.startsWith("LOBBY"));
        let ok = false;
        for (const l of lobbies) if (!ok) ok = doorBetween(r, l, 0.9);
        if (!ok) doorBetween(r, hub, 0.9);
        break;
      }
      case "open":
        break;
      default:
        doorBetween(r, lobby, r.type === "study" ? 0.9 : 0.75) || doorBetween(r, hub, 0.75);
    }
    // windows on outer walls
    const ext: Side[] = [];
    if (r.y + r.h >= wall + id - 0.01) ext.push("bottom");
    if (r.y <= wall + 0.01) ext.push("top");
    if (r.x <= wall + 0.01) ext.push("left");
    if (r.x + r.w >= wall + iw - 0.01) ext.push("right");
    const room = rooms.find((q) => q.key === r.key);
    if (room) {
      const nW = room.type === "toilet" || room.type === "store" || room.type === "utility" ? 0 : room.windows;
      const pref = (["left", "right", "top", "bottom"] as Side[]).filter((sd) => ext.includes(sd));
      for (let i = 0; i < nW && pref.length; i++) r.windows!.push({ side: pref[i % pref.length] });
      for (let i = 0; i < room.vents && pref.length; i++) r.windows!.push({ side: pref[(nW + i) % pref.length], vent: true });
    }
  }
  // columns on the side walls every ≤ 4.2 m
  const nY = Math.max(1, Math.ceil(D / 4.2));
  for (let i = 0; i <= nY; i++) {
    const cy = Math.min(D - 0.3, Math.max(0, (D * i) / nY - 0.15));
    for (const cx of [0, W - 0.3]) out.push({ key: `C${i}-${cx.toFixed(2)}`, label: "", type: "column", x: cx, y: cy, w: 0.3, h: 0.3 });
  }
  return { rects: out, need: need + 2 * wall };
}

/** Clear depth a floor needs so that every room keeps its size (lanes + walls), metres incl. outer walls. */
export function requiredDepth(W: number, rooms: LayoutRoom[], stairArea: number, ground: boolean, wall = 0.23): number {
  if (!twoLanes(W, wall)) return hubFloor(W, null, rooms, stairArea, ground, wall).need;
  let id = 6;
  for (let i = 0; i < 4; i++) {
    const l = makeLanes(W, id, rooms, stairArea, ground, wall);
    const need = Math.max(laneTotal(l.left), l.two ? laneTotal(l.right) : 0);
    if (Math.abs(need - id) < 0.05) break;
    id = need;
  }
  return id + 2 * wall;
}

export function layoutFloor(W: number, D: number, rooms: LayoutRoom[], stairArea: number, ground: boolean, wall = 0.23): SketchRect[] {
  const X0 = wall,
    Y0 = wall;
  const iw = W - 2 * wall,
    id = D - 2 * wall;
  const hasStair = stairArea > 0;
  if (!twoLanes(W, wall)) return hubFloor(W, D, rooms, stairArea, ground, wall).rects;
  const { two, a, b, c, left, right } = makeLanes(W, id, rooms, stairArea, ground, wall);
  void hasStair;

  // ---- fit each lane to the building depth: flexible rooms take up the slack (±25%), leftover = open sit-out at the back
  const fit = (lane: Slot[]) => {
    const fixed = lane.filter((x) => !(x.room && FLEX.includes(x.room.type))).reduce((s, x) => s + x.depth, 0);
    const flex = lane.filter((x) => x.room && FLEX.includes(x.room.type)).reduce((s, x) => s + x.depth, 0);
    const avail = id - IW * Math.max(0, lane.length - 1);
    let k = flex > 0 ? (avail - fixed) / flex : 1;
    k = Math.max(0.7, Math.min(1.25, k));
    for (const x of lane) if (x.room && FLEX.includes(x.room.type)) x.depth *= k;
    const used = lane.reduce((s, x) => s + x.depth, 0) + IW * Math.max(0, lane.length - 1);
    if (avail + IW * Math.max(0, lane.length - 1) - used > 0.6) lane.push({ kind: "open", key: `OTS${lane === left ? "L" : "R"}`, depth: id - used - IW, area: 0, minD: 0 });
    else if (used > id) {
      // over-full: squeeze everything evenly (the plot / NBC warnings tell the user)
      const s = (id - IW * Math.max(0, lane.length - 1)) / lane.reduce((t, x) => t + x.depth, 0);
      for (const x of lane) x.depth *= s;
    } else if (lane.length) lane[lane.length - 1].depth += id - used; // absorb rounding
  };
  fit(left);
  if (two) fit(right);

  // ---- place, front first (y measured from the front, converted at the end)
  const out: SketchRect[] = [];
  const xL = X0,
    xC = X0 + a + IW,
    xR = xC + c + IW;
  type Tagged = SketchRect & { slot?: Slot; lane?: "L" | "R"; sideOf?: string };
  const place = (lane: Slot[], x: number, w: number, isLeft: boolean) => {
    let yf = 0;
    const tag = isLeft ? "L" : "R";
    lane.forEach((s, i) => {
      const spans = isLeft && (s.kind === "hall" || s.kind === "balcony"); // hall and balcony also cover the passage strip
      const lastSingle = !two && i === lane.length - 1 && s.kind !== "stair"; // single lane: the back room takes the full width
      let ww = spans || lastSingle ? w + IW + c : w;
      const y = Y0 + id - yf - s.depth;
      let mx = x;
      if (s.side && s.sideW && s.sideW > 0.5) {
        // stair keeps the outer wall; an attached toilet takes the outer wall (ventilator), bedroom faces the passage
        const exteriorLeft = isLeft;
        const sideOnLeft = s.kind === "stair" ? !exteriorLeft : exteriorLeft;
        const sw = s.sideW;
        const sx = sideOnLeft ? x : x + ww - sw;
        mx = sideOnLeft ? x + sw + IW : x;
        ww = ww - sw - IW;
        const td = s.side.kind === "toilet" ? Math.max(1.5, Math.min(2.4, s.side.area / sw)) : s.depth;
        if (s.side.kind === "toilet" && s.depth - td - IW >= 0.9) {
          // toilet at the back of the strip, walk-in dress in front of it (opens to the bedroom)
          out.push({
            key: s.side.key,
            label: s.side.key,
            type: "toilet",
            x: sx,
            y,
            w: sw,
            h: td,
            doors: [],
            windows: [],
            slot: s.side,
            lane: tag,
            sideOf: `DR-${s.key}`,
          } as Tagged);
          out.push({
            key: `DR-${s.key}`,
            label: "Dress",
            type: "dress",
            x: sx,
            y: y + td + IW,
            w: sw,
            h: s.depth - td - IW,
            doors: [],
            windows: [],
            lane: tag,
            sideOf: s.key,
          } as Tagged);
        } else
          out.push({
            key: s.side.key,
            label: s.side.key,
            type: s.side.kind,
            x: sx,
            y,
            w: sw,
            h: s.depth,
            doors: [],
            windows: [],
            slot: s.side,
            lane: tag,
            sideOf: s.key,
          } as Tagged);
      }
      if (s.kind === "toilet" && !s.side && ww > 2.6 && s.room) {
        const tw = Math.max(1.2, Math.min(ww - 0.9 - IW, s.room.area / s.depth));
        if (ww - tw - IW >= 0.9) {
          const tx = isLeft ? x : x + ww - tw; // toilet on the outer wall (ventilator)
          const cx = isLeft ? x + tw + IW : x;
          const comp: Tagged = s.attachedTo
            ? { key: `DR-${s.attachedTo}`, label: "Dress", type: "dress", x: cx, y, w: ww - tw - IW, h: s.depth, doors: [], windows: [], lane: tag, sideOf: s.attachedTo }
            : { key: `WASH-${s.key}`, label: "Wash", type: "corridor", x: cx, y, w: ww - tw - IW, h: s.depth, doors: [], windows: [], lane: tag };
          out.push(comp);
          out.push({ key: s.key, label: s.key, type: "toilet", x: tx, y, w: tw, h: s.depth, doors: [], windows: [], slot: s, lane: tag, sideOf: comp.key } as Tagged);
          yf += s.depth + IW;
          return;
        }
      }
      const r: Tagged = { key: s.key, label: s.key, type: s.kind, x: mx, y, w: ww, h: s.depth, doors: [], windows: [], slot: s, lane: tag };
      out.push(r);
      yf += s.depth + IW;
    });
  };
  place(left, xL, a, true);
  if (two) place(right, xR, b, false);
  else {
    // single lane: stair etc. already in the left list; passage on the right
  }

  // passage strip: from behind the hall (or the front) to the back wall
  const hallR = out.find((r) => r.type === "hall");
  const frontStrip = out.filter((r) => r.type === "parking" || r.type === "shop");
  const backFull = !two ? out.find((r) => r.w > a + 0.01 && r.type !== "hall" && r.type !== "balcony" && r.y < Y0 + id / 2) : undefined;
  const passTop = backFull ? backFull.y + backFull.h + IW : Y0;
  const passBottom = hallR ? hallR.y - IW : Y0 + id;
  if (passBottom - passTop > 0.5)
    out.push({ key: "PASS", label: "Passage", type: "corridor", x: two ? xC : X0 + a + IW, y: passTop, w: c, h: passBottom - passTop, doors: [], windows: [] });
  // porch in front of the hall beside the parking (ground floor)
  if (ground && hallR && frontStrip.length) {
    const fy = hallR.y + hallR.h + IW;
    out.push({ key: "PORCH", label: "Porch", type: "porch", x: two ? xC : X0 + a + IW, y: fy, w: c, h: Y0 + id - fy, doors: [], windows: [] });
  }

  // ---- doors, openings, windows
  const at = (r: SketchRect) => out.indexOf(r);
  const overlapY = (p: SketchRect, q: SketchRect) => Math.max(0, Math.min(p.y + p.h, q.y + q.h) - Math.max(p.y, q.y));
  const pass = out.find((r) => r.key === "PASS");
  const porch = out.find((r) => r.type === "porch");
  const isFrontEdge = (r: SketchRect) => r.y + r.h >= Y0 + id - 0.01;
  const isBackEdge = (r: SketchRect) => r.y <= Y0 + 0.01;
  for (const r of out) {
    const tg = r as SketchRect & { slot?: Slot; lane?: "L" | "R"; sideOf?: string };
    const slot = tg.slot;
    const onLeftLane = tg.lane ? tg.lane === "L" : Math.abs(r.x - xL) < 1e-6;
    const partner = tg.sideOf ? out.find((q) => q.key === tg.sideOf) : undefined;
    const room = slot?.room;
    // exterior edges
    const ext: Side[] = [];
    if (isFrontEdge(r)) ext.push("bottom");
    if (isBackEdge(r)) ext.push("top");
    if (Math.abs(r.x - X0) < 1e-6) ext.push("left");
    if (Math.abs(r.x + r.w - (X0 + iw)) < 1e-6) ext.push("right");
    const doorTo = (side: Side, target: SketchRect | undefined, width: number, extra: Partial<SketchDoor> = {}) => {
      // place the door where the room touches the target, near the front end
      if (side === "left" || side === "right") {
        const lo = Math.max(r.y, target ? target.y : r.y),
          hi = Math.min(r.y + r.h, target ? target.y + target.h : r.y + r.h);
        if (hi - lo < 0.7) return false;
        const wd = Math.min(width, hi - lo - 0.1);
        r.doors!.push({ side, at: Math.max(0.05, hi - r.y - wd - 0.15), width: wd, ...extra });
      } else {
        const lo = Math.max(r.x, target ? target.x : r.x),
          hi = Math.min(r.x + r.w, target ? target.x + target.w : r.x + r.w);
        if (hi - lo < 0.7) return false;
        const wd = Math.min(width, hi - lo - 0.1);
        r.doors!.push({ side, at: lo - r.x + Math.max(0.05, (hi - lo - wd) / 2), width: wd, ...extra });
      }
      return true;
    };
    switch (r.type) {
      case "parking":
        r.doors!.push({ side: "bottom", at: 0.15, width: r.w - 0.3, open: true });
        break;
      case "shop":
        r.doors!.push({ side: "bottom", at: Math.max(0.15, (r.w - Math.min(2.4, r.w - 0.3)) / 2), width: Math.min(2.4, r.w - 0.3), shutter: true });
        break;
      case "hall": {
        if (ground) {
          if (porch) doorTo("bottom", porch, 1.0, { main: true });
          else r.doors!.push({ side: "bottom", at: Math.max(0.15, r.w - c - 0.6), width: 1.0, main: true });
        }
        if (pass) doorTo("top", pass, Math.min(1.05, c - 0.05), { open: true });
        const bal = out.find((q) => q.type === "balcony");
        if (bal) r.doors!.push({ side: "bottom", at: 0.3, width: 1.0 });
        break;
      }
      case "corridor":
        if (r.key.startsWith("WASH")) {
          doorTo(onLeftLane ? "right" : "left", pass, 1.0, { open: true }) ||
            doorTo(
              onLeftLane ? "right" : "left",
              out.find((q) => q.type === "hall"),
              1.0,
              { open: true },
            );
          break;
        }
        if (r.key === "LOBBY") {
          const side: Side = onLeftLane ? "right" : "left";
          const tgt = (ground && porch && overlapY(r, porch) > 0.8 ? porch : undefined) ?? (hallR && overlapY(r, hallR) > 0.8 ? hallR : undefined) ?? pass;
          doorTo(side, tgt, 1.0, { open: true }) || doorTo("top", pass, 1.0, { open: true });
        }
        break;
      case "porch":
        r.doors!.push({ side: "bottom", at: 0.05, width: r.w - 0.1, open: true });
        break;
      case "stair": {
        const hall = out.find((q) => q.type === "hall");
        const side: Side = onLeftLane ? "right" : "left";
        const lob = out.find((q) => (q as typeof tg).sideOf === r.key && q.key === "LOBBY");
        if (lob) {
          doorTo(lob.x < r.x ? "left" : "right", lob, 1.0, { open: true });
          break;
        }
        if (ground && porch && overlapY(r, porch) > 1.1) doorTo(side, porch, 1.0, { open: true });
        else if (hall && overlapY(r, hall) > 1.1) doorTo(side, hall, 1.0, { open: true });
        else if (pass) doorTo(side, pass, Math.min(1.0, c), { open: true });
        break;
      }
      case "toilet": {
        if (partner && (partner.type === "dress" || partner.key.startsWith("WASH")) && Math.abs(partner.y - r.y) < 0.02) {
          doorTo(partner.x > r.x ? "right" : "left", partner, 0.75);
          break;
        }
        if (slot?.attachedTo) {
          const bedR = out.find((q) => q.key === slot.attachedTo);
          if (partner?.type === "dress") doorTo("bottom", partner, 0.75);
          else if (bedR && partner === bedR) doorTo(bedR.x > r.x ? "right" : "left", bedR, 0.75);
          else if (bedR) doorTo("bottom", bedR, 0.75);
        } else
          doorTo(onLeftLane ? "right" : "left", pass, 0.75) ||
            doorTo(
              onLeftLane ? "right" : "left",
              out.find((q) => q.type === "hall"),
              0.75,
            );
        break;
      }
      case "dress":
        if (partner && (Math.abs(partner.x - (r.x + r.w + IW)) < 0.02 || Math.abs(r.x - (partner.x + partner.w + IW)) < 0.02))
          doorTo(partner.x > r.x ? "right" : "left", partner, 0.9, { open: true });
        else if (partner) doorTo("bottom", partner, 0.9, { open: true }) || doorTo("top", partner, 0.9, { open: true });
        break;
      case "open":
        if (pass) doorTo(onLeftLane ? "right" : "left", pass, 0.9);
        break;
      case "dining": {
        // dining opens wide to the passage / hall and to the kitchen
        const side: Side = onLeftLane ? "right" : "left";
        const hall = out.find((q) => q.type === "hall");
        if (!doorTo(side, pass, Math.min(1.2, r.h - 0.4), { open: true })) doorTo(side, hall, Math.min(1.2, r.h - 0.4), { open: true });
        break;
      }
      case "kitchen": {
        if (partner?.type === "dining") {
          doorTo(partner.x > r.x ? "right" : "left", partner, 1.2, { open: true });
          break;
        }
        const din = out.find((q) => q.type === "dining" && Math.abs(q.x - r.x) < 1e-6 && Math.abs(q.y + q.h + IW - r.y) < 0.02);
        const dinAbove = out.find((q) => q.type === "dining" && Math.abs(q.x - r.x) < 1e-6 && Math.abs(r.y + r.h + IW - q.y) < 0.02);
        if (dinAbove) r.doors!.push({ side: "bottom", at: 0.2, width: Math.min(1.2, r.w - 0.4), open: true });
        else if (din) r.doors!.push({ side: "top", at: 0.2, width: Math.min(1.2, r.w - 0.4), open: true });
        else {
          const side: Side = onLeftLane ? "right" : "left";
          doorTo(side, pass, 0.9) ||
            doorTo(
              side,
              out.find((q) => q.type === "hall"),
              0.9,
            );
        }
        break;
      }
      case "balcony":
        break;
      default: {
        // bedrooms, study, pooja, store, utility: door to the passage, else the hall
        const side: Side = onLeftLane ? "right" : "left";
        const w = r.type === "pooja" || r.type === "store" || r.type === "utility" ? 0.75 : 0.9;
        doorTo(side, pass, w) ||
          doorTo(
            side,
            out.find((q) => q.type === "hall"),
            w,
          ) ||
          r.doors!.push({ side: "bottom", at: 0.15, width: w });
      }
    }
    // windows / ventilators on outer walls (side walls first for lane rooms, then front / back)
    if (room) {
      const nW = room.type === "toilet" || room.type === "store" || room.type === "utility" ? 0 : room.windows;
      const pref: Side[] = ["left", "right", "top", "bottom"].filter((sd) => ext.includes(sd as Side)) as Side[];
      for (let i = 0; i < nW && pref.length; i++) r.windows!.push({ side: pref[i % pref.length] });
      for (let i = 0; i < room.vents && pref.length; i++) r.windows!.push({ side: pref[(nW + i) % pref.length], vent: true });
    }
    if (r.type === "corridor" && isBackEdge(r)) r.windows!.push({ side: "top" });
    void at;
  }
  for (const r of out) delete (r as SketchRect & { slot?: Slot }).slot;

  // ---- columns on the lane walls and outer walls, spaced ≤ 4.2 m along the depth
  const colX = two ? [X0 - wall / 2, X0 + a + IW / 2, X0 + a + IW + c + IW / 2, X0 + iw + wall / 2] : [X0 - wall / 2, X0 + a + IW / 2, X0 + iw + wall / 2];
  const nY = Math.max(1, Math.ceil((id + 2 * wall) / 4.2));
  for (let i = 0; i <= nY; i++) {
    const cy = -wall / 2 + Y0 + ((id + wall) * i) / nY;
    for (const cx of colX) {
      const inside = out.some((r) => r.type !== "column" && cx > r.x + 0.05 && cx < r.x + r.w - 0.05 && cy > r.y + 0.05 && cy < r.y + r.h - 0.05);
      if (inside) continue;
      out.push({
        key: `C${i}-${cx.toFixed(2)}`,
        label: "",
        type: "column",
        x: Math.min(W - 0.3, Math.max(0, cx - 0.15)),
        y: Math.min(D - 0.3, Math.max(0, cy - 0.15)),
        w: 0.3,
        h: 0.3,
      });
    }
  }
  return out;
}
