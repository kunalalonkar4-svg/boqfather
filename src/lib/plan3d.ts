/**
 * Turns a drawn floor (the same rooms the 2D plan uses) into simple 3D blocks:
 * full-height walls, lintels over doors, sill + lintel at windows, columns, room floors and stair steps.
 * Units: metres. Plan x → 3D x, plan y (0 at the back, grows to the road) → 3D z.
 */
import type { Side, SketchRect } from "@/engine";

export type BlockKind =
  | "wall"
  | "column"
  | "lintel"
  | "sill"
  | "glass"
  | "step"
  | "slab";
export interface Block {
  kind: BlockKind;
  /** min corner and size, metres (x, height, z) */
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  d: number;
}
export interface FloorTile {
  type: string;
  x: number;
  z: number;
  w: number;
  d: number;
  cx: number;
  cz: number;
}

export const STOREY = 3.05; // floor to floor, m
const WALL_H = 2.9;
const DOOR_H = 2.1;
const SILL_H = 0.9;
const CELL = 0.05;

interface Rect2 {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Door / window openings as wall-strip rectangles (same placement as the 2D drawing). */
function openings(W: number, D: number, rects: SketchRect[], wall = 0.23) {
  const inner = 0.115;
  const eps = 0.03;
  const isExt = (r: SketchRect, side: Side) =>
    side === "top"
      ? r.y <= wall + eps
      : side === "bottom"
        ? r.y + r.h >= D - wall - eps
        : side === "left"
          ? r.x <= wall + eps
          : r.x + r.w >= W - wall - eps;
  const strip = (r: SketchRect, side: Side, from: number, len: number): Rect2 => {
    const t = (isExt(r, side) ? wall : inner) + 0.02;
    if (side === "top") return { x: r.x + from, y: r.y - t, w: len, h: t };
    if (side === "bottom") return { x: r.x + from, y: r.y + r.h, w: len, h: t };
    if (side === "left") return { x: r.x - t, y: r.y + from, w: t, h: len };
    return { x: r.x + r.w, y: r.y + from, w: t, h: len };
  };
  const doors: (Rect2 & { open: boolean })[] = [];
  const windows: Rect2[] = [];
  for (const r of rects) {
    if (r.type === "column") continue;
    const edgeLen = (s: Side) => (s === "top" || s === "bottom" ? r.w : r.h);
    const busy: Record<Side, [number, number][]> = {
      top: [],
      bottom: [],
      left: [],
      right: [],
    };
    for (const d of r.doors ?? []) {
      busy[d.side].push([d.at, d.at + d.width]);
      doors.push({ ...strip(r, d.side, d.at, d.width), open: !!d.open });
    }
    const bySide = new Map<Side, { vent?: boolean }[]>();
    for (const w of r.windows ?? [])
      bySide.set(w.side, [...(bySide.get(w.side) ?? []), w]);
    for (const [side, list] of bySide) {
      const L = edgeLen(side);
      const free: [number, number][] = [];
      let cur = 0.2;
      for (const [s0, s1] of [...busy[side]].sort((p, q) => p[0] - q[0])) {
        if (s0 - 0.15 > cur) free.push([cur, s0 - 0.15]);
        cur = Math.max(cur, s1 + 0.15);
      }
      if (L - 0.2 > cur) free.push([cur, L - 0.2]);
      const span = free.sort((p, q) => q[1] - q[0] - (p[1] - p[0]))[0];
      if (!span) continue;
      const SL = span[1] - span[0];
      list.forEach((w, i) => {
        const len = Math.min(w.vent ? 0.6 : 1.5, (SL / list.length) * 0.8);
        if (len < 0.4) return;
        const from = span[0] + (SL * (i + 0.5)) / list.length - len / 2;
        windows.push(strip(r, side, from, len));
      });
    }
  }
  return { doors, windows };
}

/** Merges equal cells of a grid into as few boxes as possible (row runs, then stacked rows). */
function mergeGrid(
  grid: Uint8Array,
  nx: number,
  nz: number,
  value: number,
): Rect2[] {
  const out: Rect2[] = [];
  let open = new Map<string, Rect2>();
  for (let j = 0; j < nz; j++) {
    const next = new Map<string, Rect2>();
    let i = 0;
    while (i < nx) {
      if (grid[j * nx + i] !== value) {
        i++;
        continue;
      }
      const s = i;
      while (i < nx && grid[j * nx + i] === value) i++;
      const key = `${s}:${i}`;
      const prev = open.get(key);
      if (prev) {
        prev.h += 1;
        next.set(key, prev);
        open.delete(key);
      } else next.set(key, { x: s, y: j, w: i - s, h: 1 });
    }
    for (const r of open.values()) out.push(r);
    open = next;
  }
  for (const r of open.values()) out.push(r);
  return out;
}

const WALL = 1,
  COL = 2,
  DOOR = 3,
  ARCH = 4,
  WIN = 5;

export function floorBlocks(
  W: number,
  D: number,
  rects: SketchRect[],
  level: number,
  opts: {
    /** Wall height, m (default 2.9, full storey). */
    wallH?: number;
    /** Lintel strip over doors and arches (off for the cut-away look). */
    doorLintel?: boolean;
    /** Stair steps (off when the floor is shown on its own). */
    stair?: boolean;
  } = {},
): { blocks: Block[]; tiles: FloorTile[] } {
  const WALL_H = opts.wallH ?? 2.9;
  const nx = Math.ceil(W / CELL),
    nz = Math.ceil(D / CELL);
  const g = new Uint8Array(nx * nz).fill(WALL);
  const paint = (r: Rect2, v: number, only?: number) => {
    const i0 = Math.max(0, Math.round(r.x / CELL)),
      i1 = Math.min(nx, Math.round((r.x + r.w) / CELL));
    const j0 = Math.max(0, Math.round(r.y / CELL)),
      j1 = Math.min(nz, Math.round((r.y + r.h) / CELL));
    for (let j = j0; j < j1; j++)
      for (let i = i0; i < i1; i++)
        if (only === undefined || g[j * nx + i] === only) g[j * nx + i] = v;
  };
  const spaces = rects.filter((r) => r.type !== "column");
  for (const r of spaces) paint(r, 0);
  const { doors, windows } = openings(W, D, rects);
  for (const d of doors) paint(d, d.open ? ARCH : DOOR, WALL);
  for (const w of windows) paint(w, WIN, WALL);
  for (const c of rects.filter((r) => r.type === "column")) paint(c, COL);

  const base = level * STOREY;
  const blocks: Block[] = [];
  const add = (r: Rect2, kind: BlockKind, y0: number, y1: number) =>
    blocks.push({
      kind,
      x: r.x * CELL,
      z: r.y * CELL,
      w: r.w * CELL,
      d: r.h * CELL,
      y: base + y0,
      h: y1 - y0,
    });
  for (const r of mergeGrid(g, nx, nz, WALL)) add(r, "wall", 0, WALL_H);
  for (const r of mergeGrid(g, nx, nz, COL)) add(r, "column", 0, WALL_H + 0.02);
  if (opts.doorLintel !== false && WALL_H > DOOR_H) {
    for (const r of mergeGrid(g, nx, nz, DOOR)) add(r, "lintel", DOOR_H, WALL_H);
    for (const r of mergeGrid(g, nx, nz, ARCH)) add(r, "lintel", DOOR_H, WALL_H);
  }
  const top = Math.min(DOOR_H, WALL_H);
  for (const r of mergeGrid(g, nx, nz, WIN)) {
    add(r, "sill", 0, SILL_H);
    if (WALL_H > DOOR_H) add(r, "lintel", DOOR_H, WALL_H);
    add(r, "glass", SILL_H, top);
  }
  // slab under this floor
  blocks.push({ kind: "slab", x: 0, z: 0, w: W, d: D, y: base - 0.14, h: 0.14 });

  // stair: two flights side by side, up from the front, landing at the back
  for (const s of spaces.filter((r) => r.type === "stair" && opts.stair !== false)) {
    const along = s.h >= s.w; // flights run along the longer side
    const len = along ? s.h : s.w;
    const wide = along ? s.w : s.h;
    const landing = Math.min(1.1, len * 0.3);
    const run = len - landing;
    const n = 10;
    const rise = STOREY / (2 * n);
    const fw = wide / 2 - 0.05;
    for (let k = 0; k < n; k++) {
      // first flight: front → back on one half
      const t = run - ((k + 1) * run) / n;
      const h1 = (k + 1) * rise;
      const h2 = STOREY / 2 + (k + 1) * rise;
      if (along) {
        blocks.push({ kind: "step", x: s.x, z: s.y + landing + t, w: fw, d: run / n, y: base, h: h1 });
        blocks.push({ kind: "step", x: s.x + wide - fw, z: s.y + landing + (k * run) / n, w: fw, d: run / n, y: base, h: Math.min(h2, STOREY - 0.14) });
      } else {
        blocks.push({ kind: "step", x: s.x + landing + t, z: s.y, w: run / n, d: fw, y: base, h: h1 });
        blocks.push({ kind: "step", x: s.x + landing + (k * run) / n, z: s.y + wide - fw, w: run / n, d: fw, y: base, h: Math.min(h2, STOREY - 0.14) });
      }
    }
    blocks.push(
      along
        ? { kind: "step", x: s.x, z: s.y, w: wide, d: landing, y: base, h: STOREY / 2 }
        : { kind: "step", x: s.x, z: s.y, w: landing, d: wide, y: base, h: STOREY / 2 },
    );
  }

  // a cut-away floor: the stair stops at the cut
  for (const b of blocks)
    if (b.kind === "step" && b.y + b.h > base + WALL_H) b.h = Math.max(0.02, base + WALL_H - b.y);

  const tiles: FloorTile[] = spaces.map((r) => ({
    type: r.type,
    x: r.x,
    z: r.y,
    w: r.w,
    d: r.h,
    cx: r.x + r.w / 2,
    cz: r.y + r.h / 2,
  }));
  return { blocks, tiles };
}
