/**
 * Bar bending schedule from the assumed RCC frame (typical detailing for low-rise houses).
 * Unit weight d²/162 kg/m. Cover: footing 50, column 40, beam 25, slab 20 mm.
 * This is a quantity BBS for estimating — the structural engineer's drawing governs.
 */
import { round } from "./units";

export interface BbsRow {
  member: string;
  mark: string;
  desc: string;
  dia: number;
  nos: number;
  cutLen: number;
  totalLen: number;
  kg: number;
}

export interface BbsResult {
  rows: BbsRow[];
  byDia: { dia: number; kg: number }[];
  byMember: { member: string; kg: number }[];
  /** Net weight, wastage, total (kg). */
  net: number;
  wastage: number;
  total: number;
  notes: string[];
}

export interface BbsInput {
  floors: number;
  footing: { n: number; size: number; depth: number };
  column: { n: number; belowPlinth: number; perFloor: { n: number; h: number }[]; floorH: number };
  /** Plinth beam lines (continuous length of each grid line, m) and clear spans. */
  plinth: { lines: number[]; spans: number[] };
  /** Floor beams for each floor. */
  beams: { floor: string; lines: number[]; spans: number[] }[];
  /** Slab outline per floor (m). */
  slabs: { floor: string; L: number; B: number }[];
}

const kgm = (d: number) => (d * d) / 162;
const LAP = (d: number) => 50 * (d / 1000);
/** Bars of 12 m stock: add one lap per 12 m. */
const withLaps = (len: number, d: number) => len + Math.max(0, Math.ceil(len / 12) - 1) * LAP(d);

export function calcBbs(i: BbsInput): BbsResult {
  const rows: BbsRow[] = [];
  const add = (member: string, mark: string, desc: string, dia: number, nos: number, cutLen: number) => {
    if (nos <= 0 || cutLen <= 0) return;
    const totalLen = nos * cutLen;
    rows.push({ member, mark, desc, dia, nos: round(nos, 0), cutLen: round(cutLen, 3), totalLen: round(totalLen, 2), kg: round(totalLen * kgm(dia), 2) });
  };
  const F = i.floors;

  // Footings: mesh both ways, bars bent up at ends
  {
    const { n, size, depth } = i.footing;
    const d = size >= 1.5 ? 12 : 10;
    const sp = size >= 1.5 ? 0.125 : 0.15;
    const bars = Math.floor((size - 0.1) / sp) + 1;
    add("Footings", "F1", `Bottom mesh ${d} mm @${sp * 1000} c/c each way (L-bent ends)`, d, n * bars * 2, size - 0.1 + 2 * (depth - 0.1));
  }

  // Columns: main bars continuous from footing to roof with laps, ties 8 mm @150
  {
    const c = i.column;
    const height = c.belowPlinth + c.perFloor.length * c.floorH;
    const run = (d: number, floorsUp: number) => c.belowPlinth + floorsUp * c.floorH + 0.3 /* L at footing */ + 0.3 /* top anchorage */ + Math.max(0, floorsUp - 1) * LAP(d);
    if (F === 1) add("Columns", "C1", "Main bars 6 nos 12 mm, footing to roof", 12, c.n * 6, run(12, 1));
    else {
      add("Columns", "C1", `Main bars 4 nos 16 mm, footing to roof incl. laps`, 16, c.n * 4, run(16, F));
      add("Columns", "C2", `Main bars ${F >= 3 ? 4 : 2} nos 12 mm, footing to ${F >= 3 ? "second floor" : "roof"} incl. laps`, 12, c.n * (F >= 3 ? 4 : 2), run(12, F >= 3 ? 2 : F));
    }
    const tie = 2 * (0.3 - 0.08 + 0.3 - 0.08) + 2 * 10 * 0.008;
    const ties = c.n * (Math.ceil(c.belowPlinth / 0.125) + 1) + c.perFloor.reduce((a, p) => a + p.n * (Math.ceil(c.floorH / 0.125) + 1), 0);
    add("Columns", "C3", "Ties 8 mm @100 near joints / @150 mid (avg @125), 240 × 240 mm", 8, ties, tie);
    void height;
  }

  // Plinth beams 230 × 300: 2-12 top + 2-12 bottom, stirrups 8 @150
  {
    const total = i.plinth.lines.reduce((a, l) => a + withLaps(l + 2 * 0.3, 12), 0);
    add("Plinth beams", "PB1", "Top 2 nos 12 mm continuous", 12, 2, total);
    add("Plinth beams", "PB2", "Bottom 2 nos 12 mm continuous", 12, 2, total);
    const st = 2 * (0.23 - 0.05 + 0.3 - 0.05) + 2 * 10 * 0.008;
    add(
      "Plinth beams",
      "PB3",
      "Stirrups 8 mm @150 c/c (180 × 250 mm)",
      8,
      i.plinth.spans.reduce((a, s) => a + Math.ceil(s / 0.15) + 1, 0),
      st,
    );
  }

  // Floor beams 230 × 400: 3-12 bottom, 2-12 top, extra 1-12 top at supports, stirrups 8 @150
  for (const b of i.beams) {
    const total = b.lines.reduce((a, l) => a + withLaps(l + 2 * 0.3, 12), 0);
    const avgSpan = b.spans.reduce((a, s) => a + s, 0) / Math.max(1, b.spans.length);
    add(`Beams ${b.floor}`, `${b.floor}-B1`, "Bottom 2 nos 12 mm continuous", 12, 2, total);
    add(`Beams ${b.floor}`, `${b.floor}-B2`, "Bottom 1 no 16 mm continuous", 16, 1, total);
    add(`Beams ${b.floor}`, `${b.floor}-B3`, "Top 2 nos 12 mm continuous", 12, 2, total);
    add(`Beams ${b.floor}`, `${b.floor}-B4`, "Extra top 2 nos 12 mm at each support (span/4 each side + anchorage)", 12, 2 * (b.spans.length + b.lines.length), avgSpan / 2 + 0.3);
    const st = 2 * (0.23 - 0.05 + 0.4 - 0.05) + 2 * 10 * 0.008;
    add(
      `Beams ${b.floor}`,
      `${b.floor}-B5`,
      "Stirrups 8 mm @100 ends / @150 mid (avg @125), 180 × 350 mm",
      8,
      b.spans.reduce((a, s) => a + Math.ceil(s / 0.125) + 1, 0),
      st,
    );
  }

  // Slabs 125 mm two-way: bottom 8 @150 both ways, top extra over beams ≈ 8 @300 both ways
  for (const s of i.slabs) {
    const nL = Math.floor(s.B / 0.15) + 1,
      nB = Math.floor(s.L / 0.15) + 1;
    add(`Slab ${s.floor}`, `${s.floor}-S1`, "Bottom 8 mm @150 c/c along length (long span)", 8, nL, withLaps(s.L - 0.04 + 0.2, 8));
    add(`Slab ${s.floor}`, `${s.floor}-S2`, "Bottom 10 mm @150 c/c along width (short span)", 10, nB, withLaps(s.B - 0.04 + 0.2, 10));
    add(
      `Slab ${s.floor}`,
      `${s.floor}-S3`,
      "Top 8 mm @200 over beams, L/4 each side (both ways)",
      8,
      Math.floor(s.B / 0.2) + Math.floor(s.L / 0.2) + 2,
      ((s.L + s.B) / 2) * 0.5 + 0.3,
    );
  }

  const net = rows.reduce((a, r) => a + r.kg, 0);
  const wastage = net * 0.03;
  const group = <K extends string | number>(key: (r: BbsRow) => K) => {
    const m = new Map<K, number>();
    for (const r of rows) m.set(key(r), (m.get(key(r)) ?? 0) + r.kg);
    return [...m.entries()];
  };
  return {
    rows,
    byDia: group((r) => r.dia)
      .map(([dia, kg]) => ({ dia, kg: round(kg, 1) }))
      .sort((a, b) => a.dia - b.dia),
    byMember: group((r) => r.member).map(([member, kg]) => ({ member, kg: round(kg, 1) })),
    net: round(net, 1),
    wastage: round(wastage, 1),
    total: round(net + wastage, 1),
    notes: [
      "Typical detailing for a low-rise RCC house; the structural engineer's drawing and BBS govern.",
      `Columns ${F === 1 ? "6-12" : F === 2 ? "4-16 + 2-12" : "4-16 + 4-12 (up to second floor)"} with 8 mm ties; beams 2-12 + 1-16 bottom, 2-12 top + extra top at supports; slab 10 mm @150 short span, 8 mm @150 long span, 8 mm @200 top over beams.`,
      "Laps 50d, one lap per 12 m bar; 3% cutting wastage. Staircase and lintel steel are counted separately.",
    ],
  };
}
