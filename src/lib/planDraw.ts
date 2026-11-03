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
  for (const r of spaces)
    P.rects.push({
      x: r.x,
      y: r.y,
      w: r.w,
      h: r.h,
      fill: PLAN_FILL[r.type] ?? [240, 240, 240],
    });
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

  for (const r of spaces) {
    const fill = PLAN_FILL[r.type] ?? WHITE;
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

    // labels: name + clear size, true to the drawing; long narrow spaces get a rotated label
    const nameText = names(
      r.key.startsWith("LOBBY")
        ? "lobby"
        : r.key.startsWith("WASH")
          ? "wash"
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
