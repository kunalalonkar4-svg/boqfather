/**
 * Reads rooms from an AutoCAD DXF plan on the user's device (free, no upload).
 * A room = a closed polyline with a room name written inside it ("BED ROOM", "KITCHEN 10'x8'"...).
 * The size comes from the size written in the room if there is one, else from the polyline.
 * Floors are told apart by titles like "GROUND FLOOR PLAN" / "FIRST FLOOR PLAN", or by separate outlines.
 */
import {
  cleanPlan,
  roomTypeOf,
  type ReadPlan,
  type ReadRoom,
} from "./planRead";

interface Poly {
  pts: [number, number][];
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  area: number;
}
interface Txt {
  x: number;
  y: number;
  s: string;
}

/** Feet per drawing unit from $INSUNITS (default: millimetres, the Indian CAD habit). */
const UNIT_FT: Record<number, number> = {
  1: 1 / 12,
  2: 1,
  4: 1 / 304.8,
  5: 1 / 30.48,
  6: 3.28084,
};

export function parseDxf(text: string): {
  polys: Poly[];
  texts: Txt[];
  unitFt: number;
} {
  const lines = text.split(/\r?\n/);
  const pairs: [number, string][] = [];
  for (let i = 0; i + 1 < lines.length; i += 2)
    pairs.push([parseInt(lines[i].trim(), 10), lines[i + 1].trim()]);
  let unitFt = UNIT_FT[4];
  const polys: Poly[] = [];
  const texts: Txt[] = [];
  const mk = (pts: [number, number][]): Poly | null => {
    if (pts.length < 3) return null;
    const xs = pts.map((p) => p[0]),
      ys = pts.map((p) => p[1]);
    let a = 0;
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i],
        [x2, y2] = pts[(i + 1) % pts.length];
      a += x1 * y2 - x2 * y1;
    }
    return {
      pts,
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys),
      area: Math.abs(a) / 2,
    };
  };
  for (let i = 0; i < pairs.length; i++) {
    const [c, v] = pairs[i];
    if (c === 9 && v === "$INSUNITS") {
      const u = pairs.slice(i + 1, i + 4).find((p) => p[0] === 70);
      if (u && UNIT_FT[+u[1]]) unitFt = UNIT_FT[+u[1]];
    }
    if (c !== 0) continue;
    // collect this entity's group codes
    let j = i + 1;
    const body: [number, string][] = [];
    while (j < pairs.length && pairs[j][0] !== 0) body.push(pairs[j++]);
    if (v === "LWPOLYLINE") {
      const flags = +(body.find((p) => p[0] === 70)?.[1] ?? 0);
      const pts: [number, number][] = [];
      for (let k = 0; k < body.length; k++)
        if (body[k][0] === 10) {
          const y = body.slice(k + 1).find((p) => p[0] === 20);
          pts.push([+body[k][1], y ? +y[1] : 0]);
        }
      const closed =
        (flags & 1) === 1 ||
        (pts.length > 3 && near(pts[0], pts[pts.length - 1]));
      const p = closed ? mk(pts) : null;
      if (p) polys.push(p);
    } else if (v === "POLYLINE") {
      // old-style polyline: VERTEX entities follow until SEQEND
      const flags = +(body.find((p) => p[0] === 70)?.[1] ?? 0);
      const pts: [number, number][] = [];
      let k = j;
      while (
        k < pairs.length &&
        !(pairs[k][0] === 0 && pairs[k][1] === "SEQEND")
      ) {
        if (pairs[k][0] === 0 && pairs[k][1] === "VERTEX") {
          let x = 0,
            y = 0;
          for (let m = k + 1; m < pairs.length && pairs[m][0] !== 0; m++) {
            if (pairs[m][0] === 10) x = +pairs[m][1];
            if (pairs[m][0] === 20) y = +pairs[m][1];
          }
          pts.push([x, y]);
        }
        k++;
      }
      const p =
        (flags & 1) === 1 ||
        (pts.length > 3 && near(pts[0], pts[pts.length - 1]))
          ? mk(pts)
          : null;
      if (p) polys.push(p);
    } else if (v === "TEXT" || v === "MTEXT") {
      const x = +(body.find((p) => p[0] === 10)?.[1] ?? NaN),
        y = +(body.find((p) => p[0] === 20)?.[1] ?? NaN);
      const s = body
        .filter((p) => p[0] === 3 || p[0] === 1)
        .map((p) => p[1])
        .join("");
      if (Number.isFinite(x) && Number.isFinite(y) && s)
        texts.push({ x, y, s: cleanMtext(s) });
    }
  }
  return { polys, texts, unitFt };
}

const near = (a: [number, number], b: [number, number]) =>
  Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6;

/** Strips MTEXT formatting codes: \P new line, {\fArial;...}, \H2.5x; etc. */
function cleanMtext(s: string) {
  return s
    .replace(/\\P/g, " ")
    .replace(/\\[A-Za-z][^;\\{}]*;/g, "")
    .replace(/[{}]/g, "")
    .replace(/%%[cdpCDP]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** A size written as 12'6"x10'0", 12'-6" X 10', 12x10, 3.6x3.0 (metres) → feet. */
export function sizeInText(s: string): [number, number] | null {
  const ft = /(\d+(?:\.\d+)?)\s*'\s*-?\s*(\d+(?:\.\d+)?)?\s*(?:"|''|)?/;
  const m = s.match(new RegExp(`${ft.source}\\s*[xX×*]\\s*${ft.source}`));
  if (m)
    return [+m[1] + (m[2] ? +m[2] / 12 : 0), +m[3] + (m[4] ? +m[4] / 12 : 0)];
  const plain = s.match(/(\d+(?:\.\d+)?)\s*[xX×*]\s*(\d+(?:\.\d+)?)/);
  if (plain) {
    const a = +plain[1],
      b = +plain[2];
    // small numbers with a decimal point are metres
    return a < 8 && b < 8 && /\./.test(plain[0])
      ? [a * 3.28084, b * 3.28084]
      : [a, b];
  }
  return null;
}

const inside = (p: Poly, x: number, y: number) => {
  let c = false;
  for (let i = 0, j = p.pts.length - 1; i < p.pts.length; j = i++) {
    const [xi, yi] = p.pts[i],
      [xj, yj] = p.pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      c = !c;
  }
  return c;
};

const FLOOR_TITLES: [RegExp, number][] = [
  [/ground|g\.?\s*f\b|ग्राउंड|भूतल/i, 0],
  [/first|1st|f\.?\s*f\b|पहली|प्रथम/i, 1],
  [/second|2nd|दूसरी|द्वितीय/i, 2],
  [/third|3rd|तीसरी/i, 3],
];

export function roomsFromDxf(text: string): ReadPlan {
  const { polys, texts, unitFt } = parseDxf(text);
  const found: { room: ReadRoom; x: number; y: number }[] = [];
  const used = new Set<Poly>();
  for (const t of texts) {
    if (
      /floor\s*plan|फ़्लोर|मंज़िल/i.test(t.s) &&
      !/bed|kitchen|toilet/i.test(t.s)
    )
      continue;
    const type = roomTypeOf(t.s);
    if (!type) continue;
    // smallest closed outline around the label
    const box = polys
      .filter((p) => inside(p, t.x, t.y) && !used.has(p))
      .sort((a, b) => a.area - b.area)[0];
    let size = sizeInText(t.s);
    if (!size) {
      // a size written just below the name
      const below = texts.find(
        (u) =>
          u !== t &&
          Math.abs(u.x - t.x) < (box ? (box.maxX - box.minX) / 2 : Infinity) &&
          sizeInText(u.s) &&
          (!box || inside(box, u.x, u.y)),
      );
      if (below) size = sizeInText(below.s);
    }
    if (!size && box)
      size = [(box.maxX - box.minX) * unitFt, (box.maxY - box.minY) * unitFt];
    if (!size) continue;
    if (box) used.add(box);
    found.push({
      room: {
        type,
        name: t.s.slice(0, 40),
        L: Math.max(size[0], size[1]),
        B: Math.min(size[0], size[1]),
      },
      x: t.x,
      y: t.y,
    });
  }
  // floors: by floor titles (nearest title in x), else by the outer outlines that hold the rooms
  const titles = texts
    .map((t) => ({
      t,
      f: FLOOR_TITLES.find(
        ([re]) => re.test(t.s) && /floor|plan|फ़्लोर|मंज़िल|तल/i.test(t.s),
      )?.[1],
    }))
    .filter((x): x is { t: Txt; f: number } => x.f !== undefined);
  const floors: ReadRoom[][] = [[], [], [], []];
  if (titles.length > 1) {
    for (const r of found) {
      const nearest = titles.sort(
        (a, b) => Math.abs(a.t.x - r.x) - Math.abs(b.t.x - r.x),
      )[0];
      floors[nearest.f].push(r.room);
    }
  } else {
    const outers = polys
      .filter(
        (p) =>
          !used.has(p) && found.filter((r) => inside(p, r.x, r.y)).length >= 2,
      )
      .sort((a, b) => b.area - a.area);
    const groups: Poly[] = [];
    for (const o of outers)
      if (
        !groups.some((g) =>
          inside(g, (o.minX + o.maxX) / 2, (o.minY + o.maxY) / 2),
        )
      )
        groups.push(o);
    groups.sort((a, b) => a.minX - b.minX || b.minY - a.minY);
    if (groups.length > 1)
      for (const r of found) {
        const gi = groups.findIndex((g) => inside(g, r.x, r.y));
        floors[Math.max(0, Math.min(3, gi))].push(r.room);
      }
    else floors[0].push(...found.map((r) => r.room));
  }
  return cleanPlan({ floors });
}
