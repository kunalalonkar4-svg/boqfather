/**
 * Turns a floor layout into drawing primitives (walls, columns, door swings, openings, windows, stair, labels,
 * dimensions, scale bar) shared by the on-screen SVG and the PDF, so both look the same.
 * Units: metres, true to scale; y grows towards the front (road) at the bottom.
 */
import type { Side, SketchRect } from "@/engine";
import { formatFtIn } from "@/engine";

export type RGB = [number, number, number];
export interface PRect {
  x: number;
  y: number;
  w: number;
  h: number;
  fill?: RGB;
  stroke?: RGB;
  sw?: number;
  /** Floor material drawn on screen over the fill (the PDF keeps the flat fill). */
  tex?: "wood" | "marble" | "tile" | "tileBlue" | "paver" | "grass" | "stone";
}
export interface PLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  sw: number;
  color: RGB;
  dash?: boolean;
}
/** Quarter arc as a cubic Bézier. */
export interface PCurve {
  p0: [number, number];
  c1: [number, number];
  c2: [number, number];
  p1: [number, number];
  sw: number;
  color: RGB;
}
export interface PText {
  x: number;
  y: number;
  text: string;
  size: number;
  bold?: boolean;
  color: RGB;
  anchor: "start" | "middle" | "end";
  rotate?: number;
}
/** A piece of furniture as placed on the plan (for the 3D view); `sd` = the wall it stands against. */
export interface Furniture {
  t:
    | "bed"
    | "sidetable"
    | "wardrobe"
    | "sofa"
    | "ctable"
    | "tv"
    | "dtable"
    | "chair"
    | "counter"
    | "sink"
    | "hob"
    | "wc"
    | "basin"
    | "car"
    | "pooja"
    | "shopcounter";
  x: number;
  y: number;
  w: number;
  h: number;
  sd?: Side;
}
export interface Primitives {
  bounds: { x: number; y: number; w: number; h: number };
  furniture: Furniture[];
  rects: PRect[];
  lines: PLine[];
  curves: PCurve[];
  texts: PText[];
}

const INK: RGB = [22, 24, 26];
const WALL: RGB = [38, 38, 38];
const THIN: RGB = [120, 115, 106];
const WHITE: RGB = [255, 255, 255];
export const PLAN_FILL: Record<string, RGB> = {
  hall: [253, 246, 228],
  dining: [252, 241, 220],
  kitchen: [253, 233, 222],
  bedroom: [234, 240, 247],
  toilet: [226, 242, 234],
  utility: [226, 242, 234],
  passage: [246, 244, 240],
  corridor: [246, 244, 240],
  balcony: [240, 247, 228],
  pooja: [251, 236, 243],
  store: [238, 236, 230],
  study: [237, 234, 247],
  parking: [238, 238, 238],
  porch: [244, 244, 244],
  open: [236, 245, 236],
  shop: [255, 244, 204],
  stair: [232, 228, 220],
  dress: [240, 236, 248],
};

/** Floor material and the flat colour that stands for it in the PDF. */
export const PLAN_TEX: Record<string, { tex: NonNullable<PRect["tex"]>; fill: RGB }> = {
  bedroom: { tex: "wood", fill: [196, 150, 100] },
  dress: { tex: "wood", fill: [196, 150, 100] },
  study: { tex: "wood", fill: [196, 150, 100] },
  stair: { tex: "wood", fill: [190, 140, 92] },
  hall: { tex: "marble", fill: [238, 236, 232] },
  dining: { tex: "marble", fill: [238, 236, 232] },
  passage: { tex: "marble", fill: [240, 238, 234] },
  corridor: { tex: "marble", fill: [240, 238, 234] },
  kitchen: { tex: "tile", fill: [238, 238, 234] },
  pooja: { tex: "marble", fill: [244, 238, 228] },
  toilet: { tex: "tileBlue", fill: [183, 205, 226] },
  utility: { tex: "tileBlue", fill: [183, 205, 226] },
  store: { tex: "tile", fill: [248, 232, 160] },
  parking: { tex: "paver", fill: [196, 196, 196] },
  porch: { tex: "paver", fill: [200, 200, 200] },
  balcony: { tex: "stone", fill: [226, 214, 200] },
  open: { tex: "grass", fill: [128, 178, 100] },
  shop: { tex: "tile", fill: [238, 238, 234] },
};

export function planPrimitives(
  W: number,
  D: number,
  rects: SketchRect[],
  names: (t: string) => string,
  opts: {
    wall?: number;
    road?: string;
    up?: string;
    metres?: string;
    facing?: "N" | "E" | "S" | "W";
    north?: string;
    title?: string;
    upper?: boolean;
    /** Draw furniture (default true). */
    furniture?: boolean;
  } = {},
): Primitives {
  const wall = opts.wall ?? 0.23;
  const inner = 0.115;
  const top = opts.facing || opts.title ? -1.6 : -0.6;
  const P: Primitives = {
    bounds: { x: -1.2, y: top, w: W + 1.8, h: D + 2.75 - top - 0.6 + 0.6 },
    rects: [],
    lines: [],
    curves: [],
    texts: [],
    furniture: [],
  };
  if (opts.title)
    P.texts.push({
      x: -0.5,
      y: -0.75,
      text: opts.title,
      size: 0.46,
      bold: true,
      color: INK,
      anchor: "start",
    });
  const spaces = rects.filter((r) => r.type !== "column");
  const cols = rects.filter((r) => r.type === "column");
  const eps = 0.03;
  const isExt = (r: SketchRect, side: Side) =>
    side === "top"
      ? r.y <= wall + eps
      : side === "bottom"
        ? r.y + r.h >= D - wall - eps
        : side === "left"
          ? r.x <= wall + eps
          : r.x + r.w >= W - wall - eps;
  const thick = (r: SketchRect, side: Side) => (isExt(r, side) ? wall : inner);

  // walls: the whole floor in wall colour, spaces cut out of it — exact wall thickness everywhere
  P.rects.push({ x: 0, y: 0, w: W, h: D, fill: WALL });
  for (const r of spaces) {
    const mat = PLAN_TEX[r.type];
    P.rects.push({
      x: r.x,
      y: r.y,
      w: r.w,
      h: r.h,
      fill: mat?.fill ?? PLAN_FILL[r.type] ?? [240, 240, 240],
      tex: mat?.tex,
    });
  }
  for (const c of cols)
    P.rects.push({ x: c.x, y: c.y, w: c.w, h: c.h, fill: [0, 0, 0] });

  const gap = (
    r: SketchRect,
    side: Side,
    from: number,
    len: number,
    fill: RGB,
  ) => {
    const t = thick(r, side) + 0.01;
    if (side === "top")
      P.rects.push({ x: r.x + from, y: r.y - t, w: len, h: t + 0.005, fill });
    if (side === "bottom")
      P.rects.push({
        x: r.x + from,
        y: r.y + r.h - 0.005,
        w: len,
        h: t + 0.005,
        fill,
      });
    if (side === "left")
      P.rects.push({ x: r.x - t, y: r.y + from, w: t + 0.005, h: len, fill });
    if (side === "right")
      P.rects.push({
        x: r.x + r.w - 0.005,
        y: r.y + from,
        w: t + 0.005,
        h: len,
        fill,
      });
  };

  // ---------------- furniture: drawn true to size against walls, clear of door swings
  const FUR: RGB = [150, 144, 134];
  const FW = 0.016;
  type Box = { x: number; y: number; w: number; h: number };
  const hit = (a: Box, b: Box) =>
    a.x < b.x + b.w - 1e-3 &&
    b.x < a.x + a.w - 1e-3 &&
    a.y < b.y + b.h - 1e-3 &&
    b.y < a.y + a.h - 1e-3;
  const furnish = (r: SketchRect) => {
    const swings: Box[] = (r.doors ?? [])
      .filter((d) => !d.shutter && !d.open)
      .map((d) => {
        const dw = Math.max(d.width, 0.6) + 0.1;
        if (d.side === "top")
          return { x: r.x + d.at - 0.05, y: r.y, w: d.width + 0.1, h: dw };
        if (d.side === "bottom")
          return {
            x: r.x + d.at - 0.05,
            y: r.y + r.h - dw,
            w: d.width + 0.1,
            h: dw,
          };
        if (d.side === "left")
          return { x: r.x, y: r.y + d.at - 0.05, w: dw, h: d.width + 0.1 };
        return {
          x: r.x + r.w - dw,
          y: r.y + d.at - 0.05,
          w: dw,
          h: d.width + 0.1,
        };
      });
    const doorSides = new Set((r.doors ?? []).map((d) => d.side));
    const placed: Box[] = [];
    const fits = (b: Box) =>
      b.x >= r.x + 0.02 &&
      b.y >= r.y + 0.02 &&
      b.x + b.w <= r.x + r.w - 0.02 &&
      b.y + b.h <= r.y + r.h - 0.02 &&
      !swings.some((s) => hit(s, b)) &&
      !placed.some((s) => hit(s, b));
    const wallLen = (sd: Side) => (sd === "top" || sd === "bottom" ? r.w : r.h);
    const deep = (sd: Side) => (sd === "top" || sd === "bottom" ? r.h : r.w);
    // local frame: along the wall (u) and into the room (v)
    const pt = (sd: Side, u: number, v: number): [number, number] =>
      sd === "top"
        ? [r.x + u, r.y + v]
        : sd === "bottom"
          ? [r.x + u, r.y + r.h - v]
          : sd === "left"
            ? [r.x + v, r.y + u]
            : [r.x + r.w - v, r.y + u];
    const box = (
      sd: Side,
      u: number,
      v: number,
      lu: number,
      lv: number,
    ): Box => {
      const [x1, y1] = pt(sd, u, v);
      const [x2, y2] = pt(sd, u + lu, v + lv);
      return {
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        w: Math.abs(x2 - x1),
        h: Math.abs(y2 - y1),
      };
    };
    const rect = (b: Box, fill?: RGB) =>
      P.rects.push({ ...b, fill: fill ?? WHITE, stroke: FUR, sw: FW });
    const fur = (t: Furniture["t"], b: Box, sd?: Side) => P.furniture.push({ t, ...b, sd });
    const line = (sd: Side, u1: number, v1: number, u2: number, v2: number) => {
      const [x1, y1] = pt(sd, u1, v1);
      const [x2, y2] = pt(sd, u2, v2);
      P.lines.push({ x1, y1, x2, y2, sw: FW, color: FUR });
    };
    const circle = (cx: number, cy: number, rad: number) => {
      const k = 0.5523 * rad;
      const q: [
        [number, number],
        [number, number],
        [number, number],
        [number, number],
      ][] = [
        [
          [cx + rad, cy],
          [cx + rad, cy + k],
          [cx + k, cy + rad],
          [cx, cy + rad],
        ],
        [
          [cx, cy + rad],
          [cx - k, cy + rad],
          [cx - rad, cy + k],
          [cx - rad, cy],
        ],
        [
          [cx - rad, cy],
          [cx - rad, cy - k],
          [cx - k, cy - rad],
          [cx, cy - rad],
        ],
        [
          [cx, cy - rad],
          [cx + k, cy - rad],
          [cx + rad, cy - k],
          [cx + rad, cy],
        ],
      ];
      for (const [p0, c1, c2, p1] of q)
        P.curves.push({ p0, c1, c2, p1, sw: FW, color: FUR });
    };
    /** First spot along a wall (sides in order, positions centre → ends) where a footprint lu × lv fits. */
    const spot = (
      sides: Side[],
      lu: number,
      lv: number,
      pos: ("c" | "s" | "e")[] = ["c", "s", "e"],
    ) => {
      for (const sd of sides)
        for (const p of pos) {
          const L = wallLen(sd);
          if (lu > L - 0.04 || lv > deep(sd) - 0.04) continue;
          const u = p === "c" ? (L - lu) / 2 : p === "s" ? 0.05 : L - lu - 0.05;
          const b = box(sd, u, 0.03, lu, lv);
          if (fits(b)) return { sd, u, b };
        }
      return null;
    };
    const sidesBy = (pref: (sd: Side) => number) =>
      (["top", "bottom", "left", "right"] as Side[]).sort(
        (a, b) => pref(b) - pref(a),
      );
    const noDoorFirst = (sd: Side) =>
      (doorSides.has(sd) ? 0 : 10) + wallLen(sd);
    const mn = Math.min(r.w, r.h);

    if (r.type === "bedroom" && mn >= 2.4) {
      const bw = mn >= 3.0 ? 1.8 : 1.5,
        bl = 2.0;
      const sides = sidesBy(noDoorFirst);
      // bed with side tables, then without
      let s = spot(sides, bw + 1.0, bl);
      let tables = true;
      if (!s) {
        s = spot(sides, bw, bl);
        tables = false;
      }
      if (s) {
        const u0 = s.u + (tables ? 0.5 : 0);
        placed.push(s.b);
        rect(box(s.sd, u0, 0.03, bw, bl), [190, 186, 184]);
        fur("bed", box(s.sd, u0, 0.03, bw, bl), s.sd);
        rect(box(s.sd, u0 + 0.1, 0.1, bw / 2 - 0.15, 0.3), [232, 230, 228]);
        rect(box(s.sd, u0 + bw / 2 + 0.05, 0.1, bw / 2 - 0.15, 0.3), [232, 230, 228]);
        line(s.sd, u0, 0.75, u0 + bw, 0.75);
        if (tables) {
          rect(box(s.sd, s.u, 0.03, 0.42, 0.4), [120, 84, 56]);
          rect(box(s.sd, s.u + bw + 0.58, 0.03, 0.42, 0.4), [120, 84, 56]);
          fur("sidetable", box(s.sd, s.u, 0.03, 0.42, 0.4), s.sd);
          fur("sidetable", box(s.sd, s.u + bw + 0.58, 0.03, 0.42, 0.4), s.sd);
        }
        // wardrobe on another wall
        const others = sides.filter((x) => x !== s!.sd);
        const wl = Math.min(1.8, Math.max(...others.map(wallLen)) - 0.3);
        const w = wl >= 1.0 ? spot(others, wl, 0.6, ["s", "e", "c"]) : null;
        if (w) {
          placed.push(w.b);
          rect(w.b, [128, 90, 60]);
          fur("wardrobe", w.b, w.sd);
          for (let k = 0.6; k < wl - 0.1; k += 0.6)
            line(w.sd, w.u + k, 0.03, w.u + k, 0.63);
        }
      }
    } else if (r.type === "hall" && mn >= 2.4) {
      const sides = sidesBy(noDoorFirst);
      const sl = Math.min(2.2, Math.max(1.6, Math.max(r.w, r.h) * 0.45));
      const s = spot(sides, sl, 0.85);
      if (s) {
        placed.push(s.b);
        rect(s.b, [214, 178, 112]);
        fur("sofa", s.b, s.sd);
        rect(box(s.sd, s.u, 0.03, sl, 0.2), [196, 160, 98]);
        rect(box(s.sd, s.u, 0.03, 0.2, 0.85), [196, 160, 98]);
        rect(box(s.sd, s.u + sl - 0.2, 0.03, 0.2, 0.85), [196, 160, 98]);
        const tb = box(s.sd, s.u + sl / 2 - 0.5, 1.25, 1.0, 0.5);
        if (deep(s.sd) > 2.2 && fits(tb)) {
          placed.push(tb);
          rect(tb, [150, 108, 72]);
          fur("ctable", tb, s.sd);
        }
        const opp: Side =
          s.sd === "top"
            ? "bottom"
            : s.sd === "bottom"
              ? "top"
              : s.sd === "left"
                ? "right"
                : "left";
        const tv = spot([opp], 1.5, 0.4);
        if (tv && deep(s.sd) > 3.0) {
          placed.push(tv.b);
          rect(tv.b, [90, 86, 82]);
          fur("tv", tv.b, opp);
        }
      }
    } else if (r.type === "dining" && mn >= 1.9) {
      const big = mn >= 2.7 && Math.max(r.w, r.h) >= 3.0;
      const tl = big ? 1.5 : 1.1,
        tw = big ? 0.9 : 0.8;
      const along = r.w >= r.h;
      const w = along ? tl : tw,
        h = along ? tw : tl;
      const t: Box = { x: r.x + (r.w - w) / 2, y: r.y + (r.h - h) / 2, w, h };
      const zone = { x: t.x - 0.5, y: t.y - 0.5, w: t.w + 1.0, h: t.h + 1.0 };
      if (fits(zone) || fits(t)) {
        rect(t, [150, 122, 98]);
        fur("dtable", t);
        const n = big ? 3 : 2;
        for (let i = 0; i < n; i++) {
          const f = (i + 0.5) / n;
          const chairs: [Box, Side][] = along
            ? [
                [{ x: t.x + f * w - 0.2, y: t.y - 0.45, w: 0.4, h: 0.4 }, "top"],
                [{ x: t.x + f * w - 0.2, y: t.y + h + 0.05, w: 0.4, h: 0.4 }, "bottom"],
              ]
            : [
                [{ x: t.x - 0.45, y: t.y + f * h - 0.2, w: 0.4, h: 0.4 }, "left"],
                [{ x: t.x + w + 0.05, y: t.y + f * h - 0.2, w: 0.4, h: 0.4 }, "right"],
              ];
          for (const [c, sd] of chairs) {
            rect(c, [128, 98, 72]);
            fur("chair", c, sd);
          }
        }
      }
    } else if (r.type === "kitchen" && mn >= 1.8) {
      const sides = sidesBy(noDoorFirst);
      for (const sd of sides) {
        const L = wallLen(sd);
        // longest stretch of this wall without a door swing
        const b = box(sd, 0.03, 0.03, L - 0.06, 0.6);
        if (!fits(b)) continue;
        placed.push(b);
        rect(b, [96, 96, 98]);
        fur("counter", b, sd);
        // sink and two-burner hob
        rect(box(sd, L * 0.2, 0.1, 0.55, 0.42), [214, 216, 220]);
        fur("sink", box(sd, L * 0.2, 0.1, 0.55, 0.42), sd);
        fur("hob", box(sd, L * 0.72 - 0.15, 0.15, 0.6, 0.36), sd);
        const [hx, hy] = pt(sd, L * 0.72, 0.33);
        const [hx2, hy2] = pt(sd, L * 0.72 + 0.3, 0.33);
        circle(hx, hy, 0.1);
        circle(hx2, hy2, 0.1);
        // L-leg on a neighbouring wall
        const adj = sides.filter(
          (x) =>
            (sd === "top" || sd === "bottom") !==
            (x === "top" || x === "bottom"),
        );
        for (const a of adj) {
          const ll = Math.min(1.8, deep(sd) - 0.7);
          if (ll < 0.8) break;
          for (const u of [0.66, wallLen(a) - ll - 0.66 + 0.6]) {
            const lb = box(
              a,
              Math.max(0.03, Math.min(u, wallLen(a) - ll - 0.03)),
              0.03,
              ll,
              0.6,
            );
            if (fits(lb)) {
              placed.push(lb);
              rect(lb, [96, 96, 98]);
              fur("counter", lb, a);
              break;
            }
          }
          break;
        }
        break;
      }
    } else if (r.type === "toilet" && mn >= 1.0) {
      const sides = sidesBy((sd) => (doorSides.has(sd) ? 0 : 10) + deep(sd));
      const wc = spot(sides, 0.45, 0.7, ["e", "s", "c"]);
      if (wc) {
        placed.push(wc.b);
        rect(box(wc.sd, wc.u, 0.03, 0.45, 0.18));
        fur("wc", wc.b, wc.sd);
        const [cx, cy] = pt(wc.sd, wc.u + 0.225, 0.45);
        circle(cx, cy, 0.19);
      }
      const bs = spot(sides, 0.5, 0.4, ["s", "e", "c"]);
      if (bs) {
        placed.push(bs.b);
        rect(bs.b);
        fur("basin", bs.b, bs.sd);
        const [cx, cy] = pt(bs.sd, bs.u + 0.25, 0.22);
        circle(cx, cy, 0.12);
      }
    } else if (r.type === "parking" && mn >= 2.4 && Math.max(r.w, r.h) >= 4.6) {
      const along = r.h >= r.w;
      const cw = 1.75,
        cl = 4.2;
      const w = along ? cw : cl,
        h = along ? cl : cw;
      const c: Box = { x: r.x + (r.w - w) / 2, y: r.y + (r.h - h) / 2, w, h };
      rect(c, [150, 156, 166]);
      // front of the car faces the road (bottom of the plan)
      fur("car", c, along ? "bottom" : "right");
      if (along) {
        rect(
          { x: c.x + 0.18, y: c.y + 1.1, w: cw - 0.36, h: 1.9 },
          [96, 104, 116],
        );
        P.lines.push({
          x1: c.x + 0.18,
          y1: c.y + 1.1,
          x2: c.x + cw - 0.18,
          y2: c.y + 1.1,
          sw: 0.03,
          color: FUR,
        });
      } else {
        rect(
          { x: c.x + 1.1, y: c.y + 0.18, w: 1.9, h: cw - 0.36 },
          [96, 104, 116],
        );
      }
    } else if (r.type === "pooja" && mn >= 0.9) {
      const s = spot(
        sidesBy(noDoorFirst),
        Math.min(0.9, Math.max(r.w, r.h) - 0.2),
        0.4,
      );
      if (s) {
        rect(s.b, [246, 230, 238]);
        fur("pooja", s.b, s.sd);
      }
    } else if (r.type === "shop" && mn >= 2.2) {
      const s = spot(
        sidesBy((sd) => (sd === "top" ? 20 : 0) + (doorSides.has(sd) ? 0 : 10)),
        Math.min(2.4, Math.max(r.w, r.h) - 0.6),
        0.5,
      );
      if (s) {
        rect(s.b, [246, 243, 238]);
        fur("shopcounter", s.b, s.sd);
      }
    }
  };

  for (const r of spaces) {
    const fill = PLAN_TEX[r.type]?.fill ?? PLAN_FILL[r.type] ?? WHITE;
    const edgeLen = (s: Side) => (s === "top" || s === "bottom" ? r.w : r.h);
    // doors and openings
    const busy: Record<Side, [number, number][]> = {
      top: [],
      bottom: [],
      left: [],
      right: [],
    };
    for (const d of r.doors ?? []) {
      busy[d.side].push([d.at, d.at + d.width]);
      gap(r, d.side, d.at, d.width, isExt(r, d.side) ? WHITE : fill);
      if (d.open) continue;
      if (d.shutter) {
        const yy = r.y + r.h + wall / 2;
        P.lines.push({
          x1: r.x + d.at,
          y1: yy,
          x2: r.x + d.at + d.width,
          y2: yy,
          sw: 0.04,
          color: INK,
          dash: true,
        });
        continue;
      }
      const dw = d.width;
      let hinge: [number, number], tip: [number, number], end: [number, number];
      if (d.side === "bottom") {
        hinge = [r.x + d.at, r.y + r.h];
        tip = [hinge[0], hinge[1] - dw];
        end = [hinge[0] + dw, hinge[1]];
      } else if (d.side === "top") {
        hinge = [r.x + d.at, r.y];
        tip = [hinge[0], hinge[1] + dw];
        end = [hinge[0] + dw, hinge[1]];
      } else if (d.side === "left") {
        hinge = [r.x, r.y + d.at + dw];
        tip = [hinge[0] + dw, hinge[1]];
        end = [hinge[0], hinge[1] - dw];
      } else {
        hinge = [r.x + r.w, r.y + d.at + dw];
        tip = [hinge[0] - dw, hinge[1]];
        end = [hinge[0], hinge[1] - dw];
      }
      const k = 0.5523;
      const c1: [number, number] = [
        tip[0] + k * (end[0] - hinge[0]),
        tip[1] + k * (end[1] - hinge[1]),
      ];
      const c2: [number, number] = [
        end[0] + k * (tip[0] - hinge[0]),
        end[1] + k * (tip[1] - hinge[1]),
      ];
      P.lines.push({
        x1: hinge[0],
        y1: hinge[1],
        x2: tip[0],
        y2: tip[1],
        sw: d.main ? 0.06 : 0.035,
        color: INK,
      });
      P.curves.push({ p0: tip, c1, c2, p1: end, sw: 0.018, color: THIN });
    }
    // windows and ventilators on outer walls, clear of doors
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
        gap(r, side, from, len, WHITE);
        const t = thick(r, side);
        for (const kk of [0.2, 0.5, 0.8]) {
          if (side === "top")
            P.lines.push({
              x1: r.x + from,
              y1: r.y - t * kk,
              x2: r.x + from + len,
              y2: r.y - t * kk,
              sw: 0.02,
              color: INK,
            });
          if (side === "bottom")
            P.lines.push({
              x1: r.x + from,
              y1: r.y + r.h + t * kk,
              x2: r.x + from + len,
              y2: r.y + r.h + t * kk,
              sw: 0.02,
              color: INK,
            });
          if (side === "left")
            P.lines.push({
              x1: r.x - t * kk,
              y1: r.y + from,
              x2: r.x - t * kk,
              y2: r.y + from + len,
              sw: 0.02,
              color: INK,
            });
          if (side === "right")
            P.lines.push({
              x1: r.x + r.w + t * kk,
              y1: r.y + from,
              x2: r.x + r.w + t * kk,
              y2: r.y + from + len,
              sw: 0.02,
              color: INK,
            });
        }
      });
    }

    // staircase: two flights side by side, landing at the back, arrow up from the front
    if (r.type === "stair") {
      const landing = Math.min(1.05, r.h * 0.32);
      const fy = r.y + landing;
      const mid = r.x + r.w / 2;
      P.lines.push({
        x1: mid,
        y1: fy,
        x2: mid,
        y2: r.y + r.h,
        sw: 0.05,
        color: INK,
      });
      P.lines.push({
        x1: r.x,
        y1: fy,
        x2: r.x + r.w,
        y2: fy,
        sw: 0.025,
        color: THIN,
      });
      for (let ty = fy + 0.25; ty < r.y + r.h - 0.05; ty += 0.25) {
        P.lines.push({
          x1: r.x,
          y1: ty,
          x2: mid - 0.03,
          y2: ty,
          sw: 0.012,
          color: THIN,
        });
        P.lines.push({
          x1: mid + 0.03,
          y1: ty,
          x2: r.x + r.w,
          y2: ty,
          sw: 0.012,
          color: THIN,
        });
      }
      const ax = r.x + r.w * 0.75;
      P.lines.push({
        x1: ax,
        y1: r.y + r.h - 0.25,
        x2: ax,
        y2: fy + 0.15,
        sw: 0.025,
        color: INK,
      });
      P.lines.push({
        x1: ax,
        y1: fy + 0.15,
        x2: ax - 0.1,
        y2: fy + 0.3,
        sw: 0.025,
        color: INK,
      });
      P.lines.push({
        x1: ax,
        y1: fy + 0.15,
        x2: ax + 0.1,
        y2: fy + 0.3,
        sw: 0.025,
        color: INK,
      });
      P.texts.push({
        x: ax,
        y: r.y + r.h - 0.08,
        text: opts.up ?? "UP",
        size: 0.17,
        bold: true,
        color: INK,
        anchor: "middle",
      });
      P.texts.push({
        x: r.x + r.w / 2,
        y: r.y + landing / 2 + 0.07,
        text: names("stair").toUpperCase(),
        size: 0.2,
        bold: true,
        color: INK,
        anchor: "middle",
      });
      continue;
    }

    if (opts.furniture !== false) furnish(r);

    // labels: name + clear size, true to the drawing; long narrow spaces get a rotated label
    const nameText = names(
      r.key.startsWith("LOBBY")
        ? "lobby"
        : r.key.startsWith("WASH")
          ? "wash"
          : r.type === "open" && !opts.upper && Math.min(r.w, r.h) < 1.6
            ? "yard" // a strip at the back on the ground floor
            : r.type === "open" && opts.upper
              ? Math.min(r.w, r.h) < 1.6
                ? "dry" // a strip at the back upstairs: drying balcony
                : "terrace"
              : r.type === "porch" &&
                  Math.min(r.w, r.h) < 1.5 &&
                  Math.max(r.w, r.h) > 3
                ? "entry" // narrow walkway beside the parking to the main door
                : r.type,
    ).toUpperCase();
    const size = `${formatFtIn(r.w)} × ${formatFtIn(r.h)}`;
    const vertical = r.h > r.w * 1.8 && r.w < 1.6;
    const span = vertical ? r.h : r.w;
    const cross = vertical ? r.w : r.h;
    const fs = Math.max(
      0.15,
      Math.min(
        0.32,
        (span * 0.85) / Math.max(4, nameText.length * 0.62),
        cross / 3,
      ),
    );
    const cx = r.x + r.w / 2,
      cy = r.y + r.h / 2;
    const showSize =
      r.type !== "corridor" &&
      r.type !== "porch" &&
      cross > fs * 2.8 &&
      span > size.length * fs * 0.5;
    if (vertical) {
      P.texts.push({
        x: cx + (showSize ? -fs * 0.25 : fs * 0.35),
        y: cy,
        text: nameText,
        size: fs,
        bold: true,
        color: INK,
        anchor: "middle",
        rotate: -90,
      });
      if (showSize)
        P.texts.push({
          x: cx + fs * 0.9,
          y: cy,
          text: size,
          size: fs * 0.78,
          color: [74, 71, 64],
          anchor: "middle",
          rotate: -90,
        });
    } else {
      P.texts.push({
        x: cx,
        y: cy + (showSize ? -fs * 0.25 : fs * 0.35),
        text: nameText,
        size: fs,
        bold: true,
        color: INK,
        anchor: "middle",
      });
      if (showSize)
        P.texts.push({
          x: cx,
          y: cy + fs * 0.9,
          text: size,
          size: fs * 0.78,
          color: [74, 71, 64],
          anchor: "middle",
        });
    }
  }

  // overall dimensions
  const dy = D + 0.5;
  P.lines.push({ x1: 0, y1: dy, x2: W, y2: dy, sw: 0.018, color: INK });
  for (const x of [0, W])
    P.lines.push({
      x1: x - 0.1,
      y1: dy + 0.1,
      x2: x + 0.1,
      y2: dy - 0.1,
      sw: 0.03,
      color: INK,
    });
  P.texts.push({
    x: W / 2,
    y: dy - 0.1,
    text: formatFtIn(W),
    size: 0.26,
    bold: true,
    color: INK,
    anchor: "middle",
  });
  const dx = -0.5;
  P.lines.push({ x1: dx, y1: 0, x2: dx, y2: D, sw: 0.018, color: INK });
  for (const y of [0, D])
    P.lines.push({
      x1: dx - 0.1,
      y1: y + 0.1,
      x2: dx + 0.1,
      y2: y - 0.1,
      sw: 0.03,
      color: INK,
    });
  P.texts.push({
    x: dx - 0.12,
    y: D / 2,
    text: formatFtIn(D),
    size: 0.26,
    bold: true,
    color: INK,
    anchor: "middle",
    rotate: -90,
  });
  // road
  P.lines.push({
    x1: -0.4,
    y1: D + 1.05,
    x2: W + 0.4,
    y2: D + 1.05,
    sw: 0.02,
    color: THIN,
    dash: true,
  });
  P.texts.push({
    x: W / 2,
    y: D + 1.42,
    text: opts.road ?? "ROAD / FRONT",
    size: 0.26,
    bold: true,
    color: THIN,
    anchor: "middle",
  });
  // north arrow: the road side (bottom of the drawing) faces `facing`
  if (opts.facing) {
    const ang =
      ({ S: 0, E: 90, N: 180, W: 270 } as const)[opts.facing] * (Math.PI / 180); // clockwise from up
    const cx = W - 0.45,
      cy = -0.85,
      r = 0.42;
    const ux = Math.sin(ang),
      uy = -Math.cos(ang);
    const px = -uy,
      py = ux;
    P.curves.push(
      ...[0, 1, 2, 3].map((q) => {
        const a0 = (q * Math.PI) / 2,
          a1 = a0 + Math.PI / 2,
          k = 0.5523;
        const p0: [number, number] = [
          cx + r * Math.cos(a0),
          cy + r * Math.sin(a0),
        ];
        const p1: [number, number] = [
          cx + r * Math.cos(a1),
          cy + r * Math.sin(a1),
        ];
        const c1: [number, number] = [
          p0[0] - k * r * Math.sin(a0),
          p0[1] + k * r * Math.cos(a0),
        ];
        const c2: [number, number] = [
          p1[0] + k * r * Math.sin(a1),
          p1[1] - k * r * Math.cos(a1),
        ];
        return { p0, c1, c2, p1, sw: 0.02, color: INK };
      }),
    );
    P.lines.push({
      x1: cx - ux * r * 0.8,
      y1: cy - uy * r * 0.8,
      x2: cx + ux * r * 0.95,
      y2: cy + uy * r * 0.95,
      sw: 0.035,
      color: INK,
    });
    P.lines.push({
      x1: cx + ux * r * 0.95,
      y1: cy + uy * r * 0.95,
      x2: cx + ux * r * 0.45 + px * 0.13,
      y2: cy + uy * r * 0.45 + py * 0.13,
      sw: 0.035,
      color: INK,
    });
    P.lines.push({
      x1: cx + ux * r * 0.95,
      y1: cy + uy * r * 0.95,
      x2: cx + ux * r * 0.45 - px * 0.13,
      y2: cy + uy * r * 0.45 - py * 0.13,
      sw: 0.035,
      color: INK,
    });
    P.texts.push({
      x: cx + ux * (r + 0.22),
      y: cy + uy * (r + 0.22) + 0.08,
      text: opts.north ?? "N",
      size: 0.22,
      bold: true,
      color: INK,
      anchor: "middle",
    });
  }
  // scale bar 0–5 m
  const sx = 0,
    sy = D + 1.8;
  for (let i = 0; i < 5; i++)
    P.rects.push({
      x: sx + i,
      y: sy,
      w: 1,
      h: 0.12,
      fill: i % 2 ? WHITE : INK,
      stroke: INK,
      sw: 0.015,
    });
  for (const i of [0, 1, 2, 5])
    P.texts.push({
      x: sx + i,
      y: sy + 0.4,
      text: String(i),
      size: 0.18,
      color: INK,
      anchor: "middle",
    });
  P.texts.push({
    x: sx + 5.25,
    y: sy + 0.13,
    text: opts.metres ?? "m",
    size: 0.18,
    color: INK,
    anchor: "start",
  });
  return P;
}
