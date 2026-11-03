/**
 * Vastu check of a drawn plan. The drawing has the road at the bottom; the plot facing tells
 * which compass direction each part of the drawing points to. Each room is placed in one of the
 * nine zones (NE, N, NW, E, centre, W, SE, S, SW) by its centre, and compared with the zones
 * that common Vastu practice recommends for it.
 */
import type { SketchRect } from "./plot";

export type Facing = "N" | "E" | "S" | "W";
export type Zone = "NE" | "N" | "NW" | "E" | "C" | "W" | "SE" | "S" | "SW";

type Vec = [number, number];
const DIR: Record<Facing, Vec> = {
  E: [1, 0],
  N: [0, 1],
  W: [-1, 0],
  S: [0, -1],
};

/** Zone of a point given as fractions across the drawing (u: 0 left → 1 right, v: 0 back → 1 front). */
export function zoneAt(u: number, v: number, facing: Facing): Zone {
  const F = DIR[facing];
  const Lv: Vec = [F[1], -F[0]]; // left of a viewer standing on the road looking in
  const front = v - 0.5,
    left = 0.5 - u;
  const east = F[0] * front + Lv[0] * left;
  const north = F[1] * front + Lv[1] * left;
  const t = 1 / 6;
  const ns = north > t ? "N" : north < -t ? "S" : "";
  const ew = east > t ? "E" : east < -t ? "W" : "";
  return (ns + ew || "C") as Zone;
}

export const zoneOf = (r: SketchRect, W: number, D: number, facing: Facing) =>
  zoneAt((r.x + r.w / 2) / W, (r.y + r.h / 2) / D, facing);

/** Recommended (good), acceptable (ok) and avoided (bad) zones. */
interface Rule {
  good: Zone[];
  ok: Zone[];
  bad: Zone[];
}
const RULES: Record<string, Rule> = {
  kitchen: { good: ["SE"], ok: ["NW", "E", "S"], bad: ["NE", "SW", "N", "C"] },
  master: { good: ["SW"], ok: ["S", "W"], bad: ["NE", "SE", "C"] },
  bedroom: { good: ["SW", "S", "W", "NW"], ok: ["N", "E"], bad: ["NE", "C"] },
  pooja: { good: ["NE"], ok: ["N", "E"], bad: ["S", "SW", "SE", "C"] },
  toilet: {
    good: ["NW", "W"],
    ok: ["S", "SE", "N", "E"],
    bad: ["NE", "SW", "C"],
  },
  stair: { good: ["S", "W", "SW"], ok: ["SE", "NW"], bad: ["NE", "C"] },
  hall: { good: ["N", "E", "NE", "NW"], ok: ["C", "W"], bad: ["SW"] },
  dining: { good: ["W", "E", "C"], ok: ["N", "S", "NW", "SE"], bad: [] },
  parking: { good: ["NW", "SE"], ok: ["N", "E", "W", "S", "NE"], bad: ["SW"] }, // an open car porch keeps the NE light — acceptable
  balcony: { good: ["N", "E", "NE"], ok: ["NW", "SE", "W"], bad: ["SW"] },
};

export type VastuStatus = "good" | "ok" | "bad";

export interface VastuRow {
  floor: number;
  key: string;
  /** Rule used: kitchen, master, bedroom, pooja, toilet, stair, hall, dining, parking, balcony, entrance. */
  role: string;
  zone: Zone;
  status: VastuStatus;
  ideal: Zone[];
}

export interface VastuReport {
  score: number;
  /** Share of checked rooms in a good or acceptable zone, 0–100. */
  pct: number;
  rows: VastuRow[];
}

type Floor = { floor: number; L: number; B: number; rects: SketchRect[] };

/** Main entrance: the main door's position on the front wall. North- and east-side entrances are preferred. */
const ENTRANCE: Record<Facing, { good: Zone[]; ok: Zone[]; bad: Zone[] }> = {
  E: { good: ["NE"], ok: ["E"], bad: ["SE"] },
  N: { good: ["NE"], ok: ["N"], bad: ["NW"] },
  W: { good: ["NW"], ok: ["W"], bad: ["SW"] },
  S: { good: ["SE"], ok: ["S"], bad: ["SW"] },
};

export function vastuReport(floors: Floor[], facing: Facing): VastuReport {
  const rows: VastuRow[] = [];
  const allBeds = floors.flatMap((f) =>
    f.rects.filter((r) => r.type === "bedroom").map((r) => ({ f, r })),
  );
  const master = allBeds.sort((a, b) => b.r.w * b.r.h - a.r.w * a.r.h)[0];
  for (const f of floors) {
    for (const r of f.rects) {
      let role: string | null = null;
      if (r.type === "bedroom")
        role = master && master.r === r ? "master" : "bedroom";
      else if (r.type === "hall") role = f.floor === 0 ? "hall" : null;
      else if (r.type === "stair") role = f.floor === 0 ? "stair" : null;
      else if (r.type in RULES) role = r.type;
      if (!role) continue;
      const rule = RULES[role];
      const zone = zoneOf(r, f.L, f.B, facing);
      const status: VastuStatus = rule.good.includes(zone)
        ? "good"
        : rule.bad.includes(zone)
          ? "bad"
          : "ok";
      rows.push({
        floor: f.floor,
        key: r.key,
        role,
        zone,
        status,
        ideal: rule.good,
      });
    }
    // main door on the ground floor
    if (f.floor === 0)
      for (const r of f.rects)
        for (const d of r.doors ?? [])
          if (d.main) {
            const u =
              d.side === "bottom" || d.side === "top"
                ? (r.x + d.at + d.width / 2) / f.L
                : (r.x + (d.side === "right" ? r.w : 0)) / f.L;
            const zone = zoneAt(u, 1, facing);
            const rule = ENTRANCE[facing];
            rows.push({
              floor: 0,
              key: "ENTRY",
              role: "entrance",
              zone,
              status: rule.good.includes(zone)
                ? "good"
                : rule.bad.includes(zone)
                  ? "bad"
                  : "ok",
              ideal: rule.good,
            });
          }
  }
  const W: Record<string, number> = {
    master: 3,
    kitchen: 3,
    pooja: 2,
    entrance: 2,
    toilet: 2,
    stair: 2,
  };
  let score = 0;
  for (const x of rows) {
    const w = W[x.role] ?? 1;
    score += x.status === "good" ? 2 * w : x.status === "bad" ? -2 * w : 0;
  }
  const pct = rows.length
    ? Math.round(
        (100 * rows.filter((x) => x.status !== "bad").length) / rows.length,
      )
    : 100;
  return { score, pct, rows };
}

/** The same plan seen in a mirror (left and right swapped) — same rooms, same structure. */
export function mirrorRects(rects: SketchRect[], W: number): SketchRect[] {
  const flip = (s: "left" | "right" | "top" | "bottom") =>
    s === "left" ? "right" : s === "right" ? "left" : s;
  return rects.map((r) => ({
    ...r,
    x: W - r.x - r.w,
    doors: r.doors?.map((d) => ({
      ...d,
      side: flip(d.side),
      at: d.side === "top" || d.side === "bottom" ? r.w - d.at - d.width : d.at,
    })),
    windows: r.windows?.map((w) => ({ ...w, side: flip(w.side) })),
  }));
}
