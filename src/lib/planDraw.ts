/**
 * Turns a floor sketch into drawing primitives (walls, door swings, windows, stair, labels, dimensions)
 * shared by the on-screen SVG and the PDF, so both look the same.
 * Units: metres; y grows towards the front (road) at the bottom.
 */
import type { SketchRect, Side } from "@/engine";
import { formatFtIn, round } from "@/engine";

export type RGB = [number, number, number];
export interface PRect {
  x: number;
  y: number;
  w: number;
  h: number;
  fill?: RGB;
  stroke?: RGB;
  sw?: number;
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
export interface Primitives {
  bounds: { x: number; y: number; w: number; h: number };
  rects: PRect[];
  lines: PLine[];
  curves: PCurve[];
  texts: PText[];
}

const INK: RGB = [22, 24, 26];
const WALL: RGB = [40, 40, 40];
const THIN: RGB = [110, 106, 98];
const WHITE: RGB = [255, 255, 255];
export const PLAN_FILL: Record<string, RGB> = {
  hall: [253, 246, 228],
  dining: [252, 241, 220],
  kitchen: [253, 233, 222],
  bedroom: [234, 240, 247],
  toilet: [226, 242, 234],
  utility: [226, 242, 234],
  passage: [244, 242, 237],
  balcony: [240, 247, 228],
  pooja: [251, 236, 243],
  store: [238, 236, 230],
  study: [237, 234, 247],
  parking: [235, 235, 235],
  shop: [255, 244, 204],
  stair: [230, 226, 218],
};

const ft = (m: number) => round(m * 3.28084, 1);

export function planPrimitives(W: number, D: number, rects: SketchRect[], names: (t: string) => string, opts: { wall?: number; road?: string; up?: string } = {}): Primitives {
  const wall = opts.wall ?? 0.23;
  const inner = 0.115;
  const P: Primitives = { bounds: { x: -1.1, y: -0.5, w: W + 1.6, h: D + 2.1 }, rects: [], lines: [], curves: [], texts: [] };
  const eps = 0.02;
  const isExt = (r: SketchRect, side: Side) =>
    side === "top" ? r.y <= wall + eps : side === "bottom" ? r.y + r.h >= D - wall - eps : side === "left" ? r.x <= wall + eps : r.x + r.w >= W - wall - eps;
  const thick = (r: SketchRect, side: Side) => (isExt(r, side) ? wall : inner);

  // room fills
  for (const r of rects) P.rects.push({ x: r.x, y: r.y, w: r.w, h: r.h, fill: PLAN_FILL[r.type] ?? [240, 240, 240] });
  // internal walls (115) as room outlines
  for (const r of rects) {
    const t = inner / 2;
    P.rects.push({ x: r.x - t / 2, y: r.y - t / 2, w: r.w + t, h: r.h + t, stroke: WALL, sw: inner });
  }
  // outer wall
  P.rects.push({ x: wall / 2, y: wall / 2, w: W - wall, h: D - wall, stroke: WALL, sw: wall });

  // openings along an edge: a white gap across the wall
  const gap = (r: SketchRect, side: Side, from: number, len: number) => {
    const t = thick(r, side) + 0.04;
    if (side === "top") P.rects.push({ x: r.x + from, y: r.y - t, w: len, h: t + 0.02, fill: WHITE });
    if (side === "bottom") P.rects.push({ x: r.x + from, y: r.y + r.h - 0.02, w: len, h: t + 0.02, fill: WHITE });
    if (side === "left") P.rects.push({ x: r.x - t, y: r.y + from, w: t + 0.02, h: len, fill: WHITE });
    if (side === "right") P.rects.push({ x: r.x + r.w - 0.02, y: r.y + from, w: t + 0.02, h: len, fill: WHITE });
  };

  for (const r of rects) {
    const edgeLen = (s: Side) => (s === "top" || s === "bottom" ? r.w : r.h);
    // windows and ventilators: three thin lines in the wall gap
    const bySide = new Map<Side, { side: Side; vent?: boolean }[]>();
    for (const w of r.windows ?? []) bySide.set(w.side, [...(bySide.get(w.side) ?? []), w]);
    for (const [side, list] of bySide) {
      const Lfull = edgeLen(side);
      // keep clear of a door on the same edge (doors sit 0.15 m from the start of the edge)
      const doorEnd = r.door && !r.door.open && r.door.side === side && r.type !== "shop" ? 0.15 + (r.door.main ? 1.0 : r.type === "toilet" ? 0.75 : 0.9) + 0.15 : 0;
      const L = Math.max(0.5, Lfull - doorEnd);
      list.forEach((w, i) => {
        const len = Math.min(w.vent ? 0.6 : 1.5, (L / list.length) * 0.7);
        const c = doorEnd + (L * (i + 1)) / (list.length + 1);
        const from = c - len / 2;
        gap(r, side, from, len);
        const t = thick(r, side);
        for (const k of [0.15, 0.5, 0.85]) {
          if (side === "top") P.lines.push({ x1: r.x + from, y1: r.y - t * k, x2: r.x + from + len, y2: r.y - t * k, sw: 0.025, color: INK });
          if (side === "bottom") P.lines.push({ x1: r.x + from, y1: r.y + r.h + t * k, x2: r.x + from + len, y2: r.y + r.h + t * k, sw: 0.025, color: INK });
          if (side === "left") P.lines.push({ x1: r.x - t * k, y1: r.y + from, x2: r.x - t * k, y2: r.y + from + len, sw: 0.025, color: INK });
          if (side === "right") P.lines.push({ x1: r.x + r.w + t * k, y1: r.y + from, x2: r.x + r.w + t * k, y2: r.y + from + len, sw: 0.025, color: INK });
        }
      });
    }

    // doors with swing
    if (r.door) {
      const side = r.door.side;
      const L = edgeLen(side);
      if (r.door.open) {
        if (r.type === "parking") {
          const len = Math.min(L - 0.3, 3.0);
          gap(r, side, (L - len) / 2, len);
        }
      } else {
        const dw = Math.min(r.door.main ? 1.0 : r.type === "toilet" ? 0.75 : r.type === "shop" ? Math.min(2.4, L - 0.3) : 0.9, L - 0.3);
        if (dw > 0.4) {
          const off = r.type === "shop" ? (L - dw) / 2 : 0.15;
          gap(r, side, off, dw);
          if (r.type === "shop") {
            // rolling shutter: dashed line across the opening
            P.lines.push({ x1: r.x + off, y1: r.y + r.h, x2: r.x + off + dw, y2: r.y + r.h, sw: 0.04, color: INK, dash: true });
          } else {
            let hinge: [number, number], tip: [number, number], end: [number, number];
            if (side === "bottom") {
              hinge = [r.x + off, r.y + r.h];
              tip = [hinge[0], hinge[1] - dw];
              end = [hinge[0] + dw, hinge[1]];
            } else if (side === "top") {
              hinge = [r.x + off, r.y];
              tip = [hinge[0], hinge[1] + dw];
              end = [hinge[0] + dw, hinge[1]];
            } else if (side === "left") {
              hinge = [r.x, r.y + off];
              tip = [hinge[0] + dw, hinge[1]];
              end = [hinge[0], hinge[1] + dw];
            } else {
              hinge = [r.x + r.w, r.y + off];
              tip = [hinge[0] - dw, hinge[1]];
              end = [hinge[0], hinge[1] + dw];
            }
            const k = 0.5523;
            const c1: [number, number] = [tip[0] + k * (end[0] - hinge[0]), tip[1] + k * (end[1] - hinge[1])];
            const c2: [number, number] = [end[0] + k * (tip[0] - hinge[0]), end[1] + k * (tip[1] - hinge[1])];
            P.lines.push({ x1: hinge[0], y1: hinge[1], x2: tip[0], y2: tip[1], sw: r.door.main ? 0.06 : 0.04, color: INK });
            P.curves.push({ p0: tip, c1, c2, p1: end, sw: 0.02, color: THIN });
          }
        }
      }
    }

    // staircase: two flights with treads, landing at the back, arrow
    if (r.type === "stair") {
      const landing = Math.min(1.0, r.h * 0.3);
      const fy = r.y + landing;
      const mid = r.x + r.w / 2;
      P.lines.push({ x1: mid, y1: fy, x2: mid, y2: r.y + r.h, sw: 0.04, color: INK });
      P.lines.push({ x1: r.x, y1: fy, x2: r.x + r.w, y2: fy, sw: 0.03, color: THIN });
      for (let ty = fy + 0.25; ty < r.y + r.h - 0.05; ty += 0.25) {
        P.lines.push({ x1: r.x, y1: ty, x2: mid, y2: ty, sw: 0.015, color: THIN });
        P.lines.push({ x1: mid, y1: ty, x2: r.x + r.w, y2: ty, sw: 0.015, color: THIN });
      }
      const ax = r.x + r.w * 0.75;
      P.lines.push({ x1: ax, y1: r.y + r.h - 0.3, x2: ax, y2: fy + 0.2, sw: 0.03, color: INK });
      P.lines.push({ x1: ax, y1: fy + 0.2, x2: ax - 0.12, y2: fy + 0.38, sw: 0.03, color: INK });
      P.lines.push({ x1: ax, y1: fy + 0.2, x2: ax + 0.12, y2: fy + 0.38, sw: 0.03, color: INK });
      P.texts.push({ x: r.x + r.w * 0.75, y: r.y + r.h - 0.08, text: opts.up ?? "UP", size: 0.2, bold: true, color: INK, anchor: "middle" });
    }

    // labels
    const fs = Math.max(0.2, Math.min(0.36, Math.min(r.w, r.h) / 4.2));
    const cx = r.x + r.w / 2,
      cy = r.y + r.h / 2;
    if (r.type === "stair") {
      P.texts.push({ x: r.x + r.w * 0.25, y: r.y + Math.min(1.0, r.h * 0.3) / 2 + fs * 0.35, text: names("stair"), size: fs * 0.9, bold: true, color: INK, anchor: "middle" });
    } else {
      // text width ≈ 0.6 × size per character: use the room name when it fits, else the short code
      const nameText = names(r.type).toUpperCase();
      const fitsName = nameText.length * fs * 0.85 * 0.62 < r.w * 0.92 && r.h > fs * 2.6;
      const big = fitsName && r.h > fs * 3.2;
      const label = fitsName ? nameText : r.key;
      const lsize = Math.min(fs * 0.85, (r.w * 0.9) / Math.max(1, label.length * 0.62));
      P.texts.push({ x: cx, y: cy - (big ? fs * 0.25 : -lsize * 0.35), text: label, size: lsize, bold: true, color: INK, anchor: "middle" });
      if (big && r.L !== undefined && r.B !== undefined && r.w > fs * 3.5)
        P.texts.push({ x: cx, y: cy + fs * 0.85, text: `${ft(Math.max(r.L, r.B))}' × ${ft(Math.min(r.L, r.B))}'`, size: fs * 0.72, color: [74, 71, 64], anchor: "middle" });
    }
  }

  // overall dimensions
  const dy = D + 0.45;
  P.lines.push({ x1: 0, y1: dy, x2: W, y2: dy, sw: 0.02, color: INK });
  for (const x of [0, W]) P.lines.push({ x1: x, y1: dy - 0.12, x2: x, y2: dy + 0.12, sw: 0.03, color: INK });
  P.texts.push({ x: W / 2, y: dy - 0.08, text: formatFtIn(W), size: 0.26, bold: true, color: INK, anchor: "middle" });
  const dx = -0.45;
  P.lines.push({ x1: dx, y1: 0, x2: dx, y2: D, sw: 0.02, color: INK });
  for (const y of [0, D]) P.lines.push({ x1: dx - 0.12, y1: y, x2: dx + 0.12, y2: y, sw: 0.03, color: INK });
  P.texts.push({ x: dx - 0.12, y: D / 2, text: formatFtIn(D), size: 0.26, bold: true, color: INK, anchor: "middle", rotate: -90 });
  // road
  P.lines.push({ x1: -0.3, y1: D + 1.0, x2: W + 0.3, y2: D + 1.0, sw: 0.02, color: THIN, dash: true });
  P.texts.push({ x: W / 2, y: D + 1.42, text: opts.road ?? "ROAD / FRONT", size: 0.28, bold: true, color: THIN, anchor: "middle" });
  return P;
}
