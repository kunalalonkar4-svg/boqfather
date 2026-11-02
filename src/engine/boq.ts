/**
 * Room-based item-wise BOQ (no drawing needed).
 * Rooms → assumed RCC frame layout → measurement book rows (Nos × L × B × H) → abstract of cost.
 * Mirrors the founder's estimate format: sections A–I, sub-totals, 5% contingency, grand total.
 */
import { CEMENT_BAG_M3, CFT_PER_M3, round, SQFT_PER_M2 } from "./units";

export type RoomType = "hall" | "dining" | "kitchen" | "bedroom" | "toilet" | "passage" | "balcony";

/** Default clear sizes in metres (L × B). */
export const ROOM_SIZES: Record<RoomType, [number, number]> = {
  hall: [4.5, 3.9],
  dining: [3.0, 2.7],
  kitchen: [3.0, 2.7],
  bedroom: [3.6, 3.3],
  toilet: [2.4, 1.5],
  passage: [4.8, 1.0],
  balcony: [3.0, 1.2],
};

export interface FloorPlan {
  bedrooms: number;
  toilets: number;
  kitchen: boolean;
  dining: boolean;
  balconies: number;
}

/** Composite rates (material + labour), ₹ — editable. */
export const BOQ_RATES = {
  exc: 280, pcc: 5200, back: 150, termite: 60, murum: 900, rcc: 7000, steel: 78, sh_col: 350, sh_beam: 350, sh_slab: 300,
  sh_foot: 300, brick: 6500, lintel: 18000, pl_int: 345, pl_ext: 430, pl_ceil: 365, pl_para: 430, vit: 1615, skirt: 150,
  anti: 1075, wtile: 1025, toi_wp: 540, ter_wp: 450, granite: 4500, mdoor: 25000, fdoor: 13500, pvc: 3800, alwin: 5920,
  vent: 1800, ewc: 8500, iwc: 4500, basin: 3500, shower: 4500, taps: 2400, fdrain: 600, sink: 4500, cpvc: 310, swr110: 1050,
  swr75: 690, riser: 15000, elec: 1185, p_int: 280, p_ext: 235, st_tile: 1830, st_soffit: 645, rail: 3935,
} as const;
export type RateKey = keyof typeof BOQ_RATES;

export interface MbRow {
  desc: string;
  n: number;
  L?: number;
  B?: number;
  H?: number;
  q: number;
  rem?: string;
}

export interface BoqItem {
  code: string;
  desc: string;
  unit: string;
  rateKey: RateKey;
  rate: number;
  basis: string;
  rows: MbRow[];
  qty: number;
  dec: number;
  amount: number;
}

export interface BoqSection {
  code: string;
  title: { en: string; hi: string };
  items: BoqItem[];
  subtotal: number;
}

export interface BoqInput {
  floors: number;
  plan: FloorPlan;
  /** Multiplier applied to every composite rate (city / market level). */
  locationFactor?: number;
  /** Rate overrides by item code (A1, B2…). */
  rateOverrides?: Record<string, number>;
  roomSizes?: Partial<Record<RoomType, [number, number]>>;
}

export interface Room {
  code: string;
  type: RoomType;
  floor: number;
  L: number;
  B: number;
  area: number;
  per: number;
  doorWidth: number;
}

const row = (desc: string, n: number, L?: number, B?: number, H?: number, rem?: string): MbRow => {
  let q = n;
  for (const d of [L, B, H]) if (d !== undefined) q *= d;
  return { desc, n, L, B, H, q, rem };
};
const qRow = (desc: string, q: number, rem?: string): MbRow => ({ desc, n: 1, L: round(q, 3), q, rem });

const ROOM_CODE: Record<RoomType, string> = { hall: "H", dining: "D", kitchen: "K", bedroom: "BR", toilet: "T", passage: "P", balcony: "BL" };
const ROOM_NAME: Record<RoomType, string> = {
  hall: "Hall / living",
  dining: "Dining",
  kitchen: "Kitchen",
  bedroom: "Bedroom",
  toilet: "Toilet",
  passage: "Passage",
  balcony: "Balcony",
};
export const roomName = (t: RoomType) => ROOM_NAME[t];

export function buildRooms(floors: number, plan: FloorPlan, sizes: Partial<Record<RoomType, [number, number]>> = {}): Room[] {
  const size = (t: RoomType): [number, number] => sizes[t] ?? ROOM_SIZES[t];
  const counts: Record<string, number> = {};
  const rooms: Room[] = [];
  const passageLen = Math.max(3, round(1.2 * (plan.bedrooms + plan.toilets), 2));
  for (let f = 0; f < floors; f++) {
    const list: { t: RoomType; L: number; B: number; dw: number }[] = [];
    const [hl, hb] = size("hall");
    list.push({ t: "hall", L: hl, B: hb, dw: 2.0 });
    if (plan.dining) list.push({ t: "dining", L: size("dining")[0], B: size("dining")[1], dw: 1.0 });
    if (plan.kitchen) list.push({ t: "kitchen", L: size("kitchen")[0], B: size("kitchen")[1], dw: 0.9 });
    for (let i = 0; i < plan.bedrooms; i++) {
      const [l, b] = size("bedroom");
      // master bedroom slightly larger when defaults are used
      list.push({ t: "bedroom", L: i === 0 && !sizes.bedroom ? round(l + 0.3, 2) : l, B: b, dw: 0.9 });
    }
    list.push({ t: "passage", L: sizes.passage?.[0] ?? passageLen, B: size("passage")[1], dw: 0.9 * plan.bedrooms + 0.75 * plan.toilets + 1.0 });
    for (let i = 0; i < plan.toilets; i++) list.push({ t: "toilet", L: size("toilet")[0], B: size("toilet")[1], dw: 0.75 });
    for (let i = 0; i < plan.balconies; i++) list.push({ t: "balcony", L: size("balcony")[0], B: size("balcony")[1], dw: 1.0 });
    for (const r of list) {
      const c = ROOM_CODE[r.t];
      counts[c] = (counts[c] ?? 0) + 1;
      rooms.push({ code: `${c}${counts[c]}`, type: r.t, floor: f, L: r.L, B: r.B, area: r.L * r.B, per: 2 * (r.L + r.B), doorWidth: r.dw });
    }
  }
  return rooms;
}

export interface BoqResult {
  rooms: Room[];
  geometry: {
    floors: number;
    L0: number;
    B0: number;
    footprintM2: number;
    builtUpSqftPerFloor: number;
    builtUpSqft: number;
    carpetSqftPerFloor: number;
    columns: number;
    baysL: number;
    baysB: number;
    partitionPerFloor: number;
  };
  sections: BoqSection[];
  itemsTotal: number;
  contingency: number;
  grandTotal: number;
  perSqft: number;
  materials: { key: string; unit: string; qty: number; basis: string }[];
  thumb: { key: string; unit: string; perSqft: number; thumbQty: number; qty: number; diffPct: number }[];
  assumptions: string[];
}

export function calcBoq(input: BoqInput): BoqResult {
  const F = Math.max(1, Math.round(input.floors));
  const plan = input.plan;
  const factor = input.locationFactor ?? 1;
  const overrides = input.rateOverrides ?? {};
  const rooms = buildRooms(F, plan, input.roomSizes);
  const gf = rooms.filter((r) => r.floor === 0);

  // ---------------- geometry
  const STAIR_FP = 6.83;
  const carpet = gf.reduce((a, r) => a + r.area, 0);
  const A = (carpet + STAIR_FP) / 0.83;
  const L0 = round(Math.sqrt(A * 1.25), 2);
  const B0 = round(A / L0, 2);
  const COL = 0.3, BW = 0.23, FH = 3.0, BD = 0.4, SLAB = 0.125, PLINTH = 0.45, WE = 0.23, WI = 0.115;
  const LC = L0 - COL, BC = B0 - COL;
  const NBL = Math.max(2, Math.ceil(LC / 3.6)), NBB = Math.max(2, Math.ceil(BC / 3.6));
  const CLL = round(LC / NBL - COL, 3), CLB = round(BC / NBB - COL, 3);
  const NCOL = (NBL + 1) * (NBB + 1);
  const WALL_H = FH - BD, PL_H = FH - SLAB;
  const INNER_PER = 2 * (L0 - 2 * WE + (B0 - 2 * WE));
  const OUTER_PER = 2 * (L0 + B0);
  const PARA_CL = OUTER_PER - 4 * WE;
  const perimSum = gf.reduce((a, r) => a + r.per, 0);
  const PART = round(Math.max(0, (perimSum - INNER_PER) / 2), 2);
  const NET_GF = round(carpet + STAIR_FP, 2);
  const highGround = F > 1;
  const FOOT = highGround ? 1.5 : 1.2, FOOT_D = highGround ? 0.45 : 0.4, PIT_D = highGround ? 1.5 : 1.2;
  const PCC_W = FOOT + 0.2, PIT = FOOT + 0.4;
  const GA = Array.from({ length: NBB + 1 }, (_, i) => String.fromCharCode(65 + i));
  const GN = Array.from({ length: NBL + 1 }, (_, i) => String(i + 1));

  // openings per floor
  const WIN = plan.bedrooms + 2 + (plan.kitchen ? 1 : 0) + (plan.dining ? 1 : 0);
  const VEN = plan.toilets;
  const RD = plan.bedrooms + (plan.kitchen ? 1 : 0);
  const TD = plan.toilets;
  const MD = 1 + plan.balconies;
  const KIT = plan.kitchen ? F : 0;
  const NT = plan.toilets * F;
  const toilets = rooms.filter((r) => r.type === "toilet");
  const kitchens = rooms.filter((r) => r.type === "kitchen");

  // ---------------- items
  const sections: BoqSection[] = [];
  const sec = (code: string, en: string, hi: string) => sections.push({ code, title: { en, hi }, items: [], subtotal: 0 });
  const item = (desc: string, unit: string, rateKey: RateKey, basis: string, rows: MbRow[], dec = 3): BoqItem => {
    const s = sections.at(-1)!;
    const code = `${s.code}${s.items.length + 1}`;
    const qty = round(rows.reduce((a, r) => a + r.q, 0), dec);
    const rate = overrides[code] ?? Math.round(BOQ_RATES[rateKey] * factor);
    const it: BoqItem = { code, desc, unit, rateKey, rate, basis, rows, qty, dec, amount: Math.round(qty * rate) };
    s.items.push(it);
    return it;
  };

  sec("A", "Earthwork and foundation", "खुदाई और नींव");
  const exc = item(`Excavation for column footings in ordinary soil, depth ${PIT_D} m`, "m³", "exc", `Pit = footing ${FOOT} m + 0.20 m working space each side = ${round(PIT, 2)} m square × ${PIT_D} m deep.`, [
    row(`Footing pits F1–F${NCOL}`, NCOL, PIT, PIT, PIT_D, `${NCOL} columns`),
  ]);
  const pccf = item("PCC 1:4:8 below footings, 100 mm", "m³", "pcc", `${round(PCC_W, 2)} m square × 0.10 m.`, [row("Below footings", NCOL, PCC_W, PCC_W, 0.1)]);
  const foot = item(`RCC M20 isolated footings ${FOOT} × ${FOOT} m, ${FOOT_D * 1000} mm (avg)`, "m³", "rcc", "Typical footing; confirm by soil test and structural design.", [
    row(`Footings F1–F${NCOL}`, NCOL, FOOT, FOOT, FOOT_D),
  ]);
  item("Backfilling pits with excavated soil, rammed", "m³", "back", "Excavation less PCC, footing and column below GL.", [
    qRow("Excavation (A1)", exc.qty),
    qRow("(−) PCC (A2)", -pccf.qty),
    qRow("(−) Footings (A3)", -foot.qty),
    row("(−) Column below GL", -NCOL, COL, COL, round(PIT_D - FOOT_D, 2)),
  ]);
  const pbRows = [
    ...GA.map((g) => row(`Grid ${g} (along length), ${NBL} spans`, NBL, CLL, BW, 0.3)),
    ...GN.map((g) => row(`Grid ${g} (along width), ${NBB} spans`, NBB, CLB, BW, 0.3)),
  ];
  const pbeam = item("RCC M20 plinth beam 230 × 300 mm", "m³", "rcc", "Clear span between columns × 0.23 × 0.30 m.", pbRows);
  item("Anti-termite treatment on plinth area", "m²", "termite", "Outer L × B.", [row("Plinth area", 1, L0, B0)], 2);
  item("Plinth filling with murum / sand, 300 mm", "m³", "murum", "Net ground floor area × 0.30 m.", [row("Net GF area (rooms + stair)", 1, NET_GF, undefined, 0.3)]);
  const pccfl = item("PCC 1:4:8 base for ground floor, 75 mm", "m³", "pcc", "Net ground floor area × 0.075 m.", [row("Net GF area", 1, NET_GF, undefined, 0.075)]);

  sec("B", "RCC structure – M20 / Fe500D", "RCC ढांचा – M20 / Fe500D");
  const colH = round(PIT_D - FOOT_D + PLINTH, 2);
  const col = item("RCC M20 columns 300 × 300 mm", "m³", "rcc", `Below plinth ${colH} m; each floor clear height ${FH} − ${BD} = ${round(WALL_H, 2)} m.`, [
    row("Footing top to plinth", NCOL, COL, COL, colH),
    row(`Columns, ${F} floor(s)`, NCOL * F, COL, COL, round(WALL_H, 2)),
  ]);
  const bmRows = [
    ...GA.map((g) => row(`Grid ${g} (along length), ${NBL} spans × ${F} fl`, NBL * F, CLL, BW, BD - SLAB)),
    ...GN.map((g) => row(`Grid ${g} (along width), ${NBB} spans × ${F} fl`, NBB * F, CLB, BW, BD - SLAB)),
  ];
  const beam = item("RCC M20 beams 230 × 400 mm (275 mm below slab)", "m³", "rcc", "Clear span × 0.23 × 0.275 m; slab portion counted in slab.", bmRows);
  const slab = item("RCC M20 slab 125 mm", "m³", "rcc", `Built-up per floor ${L0} × ${B0} m × 0.125 m.`, Array.from({ length: F }, (_, i) => row(`Roof slab over floor ${i + 1}`, 1, L0, B0, SLAB)));
  const KG = { foot: 80, col: 180, pbeam: 120, beam: 150, slab: 90, stair: 90 };
  const stRows = [
    row("Footings: m³ × 80 kg/m³", 1, foot.qty, KG.foot, undefined, "m³ × kg/m³"),
    row("Columns: m³ × 180 kg/m³", 1, col.qty, KG.col),
    row("Plinth beams: m³ × 120 kg/m³", 1, pbeam.qty, KG.pbeam),
    row("Beams: m³ × 150 kg/m³", 1, beam.qty, KG.beam),
    row("Slabs: m³ × 90 kg/m³", 1, slab.qty, KG.slab),
  ];
  const netSteel = stRows.reduce((a, r) => a + r.q, 0);
  stRows.push(qRow("Add 5% laps / wastage", round(netSteel * 0.05, 1)));
  const steel = item("Reinforcement steel Fe500D (cut, bent, tied)", "kg", "steel", "Thumb rule kg per m³ of concrete by member + 5%. Exact steel comes from the bar bending schedule.", stRows, 1);
  const beamLen = round(bmRows.reduce((a, r) => a + r.n * (r.L ?? 0), 0), 2);
  const pbLen = round(pbRows.reduce((a, r) => a + r.n * (r.L ?? 0), 0), 2);
  item("Shuttering – footing sides", "m²", "sh_foot", "4 sides × size × depth.", [row("Footing sides", NCOL * 4, FOOT, undefined, FOOT_D)], 2);
  item("Shuttering – columns", "m²", "sh_col", "Perimeter 1.20 m × height.", [row("Footing to plinth", NCOL, 1.2, undefined, colH), row(`Columns, ${F} floor(s)`, NCOL * F, 1.2, undefined, round(WALL_H, 2))], 2);
  item("Shuttering – plinth beams and beams", "m²", "sh_beam", "Plinth beam 2 sides × 0.30; beams girth 0.78 m.", [row("Plinth beam sides", 2, pbLen, undefined, 0.3), row("Beams girth 0.78 m", 1, beamLen, 0.78)], 2);
  item("Shuttering / centering – slab soffit and edges", "m²", "sh_slab", "Slab area less beam soffit, plus edges.", [
    row(`Slab soffit, ${F} slab(s)`, F, L0, B0),
    row("(−) Beam soffit", -1, beamLen, BW),
    row("Slab edges", F, round(OUTER_PER, 2), undefined, SLAB),
  ], 2);

  sec("C", "Brickwork, parapet and lintels", "ईंट की चिनाई, पैरापेट और लिंटल");
  const bwE = item("Brickwork 230 mm outer walls, CM 1:6", "m³", "brick", `Between columns × 0.23 × ${round(WALL_H, 2)} m; openings deducted.`, [
    row(`Long sides, ${NBL} spans × 2 × ${F} fl`, NBL * 2 * F, CLL, WE, round(WALL_H, 2)),
    row(`Short sides, ${NBB} spans × 2 × ${F} fl`, NBB * 2 * F, CLB, WE, round(WALL_H, 2)),
    row("(−) Windows 1.5 × 1.2", -WIN * F, 1.5, 1.2, WE),
    row("(−) Main / balcony doors 1.0 × 2.1", -MD * F, 1.0, 2.1, WE),
    ...(VEN ? [row("(−) Ventilators 0.6 × 0.45", -VEN * F, 0.6, 0.45, WE)] : []),
  ], 2);
  const bwI = item("Brickwork 115 mm partitions, CM 1:6", "m³", "brick", `Partition length ${PART} m per floor (from room perimeters) × 0.115 × ${round(WALL_H, 2)} m.`, [
    row(`Partitions, ${F} floor(s)`, F, PART, WI, round(WALL_H, 2)),
    ...(RD ? [row("(−) Room doors 0.9 × 2.1", -RD * F, 0.9, 2.1, WI)] : []),
    ...(TD ? [row("(−) Toilet doors 0.75 × 2.1", -TD * F, 0.75, 2.1, WI)] : []),
  ], 2);
  const para = item("Parapet 230 mm × 0.90 m, CM 1:6", "m³", "brick", "Centre-line length × 0.23 × 0.90.", [row("Roof parapet", 1, round(PARA_CL, 2), WE, 0.9)], 2);
  const lintel = item("RCC lintels incl. steel and shuttering", "m³", "lintel", "Opening + 0.30 m × wall thickness × 0.15 m.", [
    row("Windows (230 wall)", WIN * F, 1.8, WE, 0.15),
    row("Main / balcony doors (230 wall)", MD * F, 1.3, WE, 0.15),
    ...(VEN ? [row("Ventilators (230 wall)", VEN * F, 0.9, WE, 0.15)] : []),
    ...(RD ? [row("Room doors (115 wall)", RD * F, 1.2, WI, 0.15)] : []),
    ...(TD ? [row("Toilet doors (115 wall)", TD * F, 1.05, WI, 0.15)] : []),
  ]);

  sec("D", "Plastering", "प्लास्टर");
  const plI = item("Internal plaster 12 mm, CM 1:5", "m²", "pl_int", `Room perimeter 2(L+B) × ${PL_H} m, less openings (doors in partitions on both faces).`, [
    ...rooms.filter((r) => r.type !== "balcony").map((r) => row(`${flr(r.floor)} ${r.code} ${ROOM_NAME[r.type]} 2(${r.L}+${r.B})`, 1, round(r.per, 2), PL_H)),
    row("(−) Windows (one face)", -WIN * F, 1.5, 1.2),
    row("(−) Main / balcony doors (one face)", -MD * F, 1.0, 2.1),
    ...(VEN ? [row("(−) Ventilators", -VEN * F, 0.6, 0.45)] : []),
    ...(RD ? [row("(−) Room doors (both faces)", -RD * F * 2, 0.9, 2.1)] : []),
    ...(TD ? [row("(−) Toilet doors (both faces)", -TD * F * 2, 0.75, 2.1)] : []),
  ], 1);
  const extH = round(PLINTH + FH * F, 2);
  const plE = item("External plaster 20 mm, CM 1:4", "m²", "pl_ext", `Outer perimeter × ${extH} m, less openings.`, [
    row("Outer faces", 1, round(OUTER_PER, 2), extH),
    row("(−) Windows", -WIN * F, 1.5, 1.2),
    row("(−) Main / balcony doors", -MD * F, 1.0, 2.1),
    ...(VEN ? [row("(−) Ventilators", -VEN * F, 0.6, 0.45)] : []),
  ], 1);
  const plC = item("Ceiling plaster 12 mm, CM 1:5", "m²", "pl_ceil", "Slab soffit of every room = L × B.", rooms.filter((r) => r.type !== "balcony").map((r) => row(`${flr(r.floor)} ${r.code} ${ROOM_NAME[r.type]}`, 1, r.L, r.B)), 1);
  const plP = item("Parapet plaster both faces + coping, CM 1:4", "m²", "pl_para", "Outer + inner face × 0.90 m + coping 0.23 m.", [
    row("Outer face", 1, round(OUTER_PER, 2), 0.9),
    row("Inner face", 1, round(OUTER_PER - 8 * WE, 2), 0.9),
    row("Coping", 1, round(PARA_CL, 2), WE),
  ], 1);

  sec("E", "Flooring, tiles and waterproofing", "फ़र्श, टाइल्स और वॉटरप्रूफिंग");
  const vit = item("Vitrified tiles 600 × 600 in CM bedding", "m²", "vit", "Room floor = clear L × B (toilets separate).", rooms.filter((r) => r.type !== "toilet").map((r) => row(`${flr(r.floor)} ${r.code} ${ROOM_NAME[r.type]}`, 1, r.L, r.B)), 1);
  item("Tile skirting 100 mm", "rm", "skirt", "Room perimeter less door / opening widths.", rooms.filter((r) => r.type !== "toilet").map((r) => row(`${flr(r.floor)} ${r.code} 2(L+B) − ${round(r.doorWidth, 2)}`, 1, round(Math.max(0, r.per - r.doorWidth), 2))), 1);
  const anti = item("Anti-skid floor tiles – toilets", "m²", "anti", "Toilet L × B.", toilets.map((r) => row(`${flr(r.floor)} ${r.code}`, 1, r.L, r.B)), 1);
  const wt = item("Wall tiles – toilets 2.10 m, kitchen dado 0.60 m", "m²", "wtile", "(Perimeter − door) × 2.10; kitchen 3.0 × 0.60.", [
    ...toilets.map((r) => row(`${flr(r.floor)} ${r.code} (${round(r.per, 2)} − 0.75) × 2.10`, 1, round(r.per - 0.75, 2), 2.1)),
    ...(VEN ? [row("(−) Ventilators", -VEN * F, 0.6, 0.45)] : []),
    ...kitchens.map((r) => row(`${flr(r.floor)} ${r.code} dado`, 1, 3.0, 0.6)),
  ], 1);
  item("Toilet waterproofing (floor + 0.30 m turn-up)", "m²", "toi_wp", "Floor + 0.30 m on walls.", [
    ...toilets.map((r) => row(`${flr(r.floor)} ${r.code} floor`, 1, r.L, r.B)),
    ...toilets.map((r) => row(`${flr(r.floor)} ${r.code} turn-up`, 1, round(r.per - 0.75, 2), 0.3)),
  ], 1);
  item("Terrace waterproofing with screed", "m²", "ter_wp", "Roof inside parapet.", [row("Terrace", 1, round(L0 - 2 * WE, 2), round(B0 - 2 * WE, 2))], 1);
  if (KIT) item("Kitchen platform – granite 600 mm", "rm", "granite", "3.0 m per kitchen.", [row(`Kitchens × ${KIT}`, KIT, 3.0)], 1);

  sec("F", "Doors, windows, ventilators", "दरवाज़े, खिड़कियां, वेंटिलेटर");
  item("Main / balcony door 1.0 × 2.1 m, hardwood frame, hardware", "nos", "mdoor", `${MD} per floor.`, [row("Main + balcony doors", MD * F)], 0);
  if (RD) item("Flush door 0.9 × 2.1 m with frame and hardware", "nos", "fdoor", `${RD} per floor (rooms, kitchen).`, [row("Room doors", RD * F)], 0);
  if (TD) item("PVC / UPVC door 0.75 × 2.1 m (toilets)", "nos", "pvc", "One per toilet.", [row("Toilet doors", TD * F)], 0);
  item("Aluminium sliding windows with glass", "m²", "alwin", `${WIN} per floor, 1.5 × 1.2 m.`, [row("Windows", WIN * F, 1.5, 1.2)], 1);
  if (VEN) item("Aluminium ventilator 0.6 × 0.45 m", "nos", "vent", "One per toilet.", [row("Ventilators", VEN * F)], 0);

  sec("G", "Plumbing and sanitary", "प्लंबिंग और सैनिटरी");
  if (NT) {
    item("Western commode (EWC) with cistern and fittings", "nos", "ewc", "All toilets except one.", [row("EWC", Math.max(0, NT - 1))], 0);
    item("Indian WC with cistern and fittings", "nos", "iwc", "One toilet.", [row("IWC", 1)], 0);
    item("Wash basin with tap and waste", "nos", "basin", "One per toilet.", [row("Wash basins", NT)], 0);
    item("Shower with mixer / overhead", "nos", "shower", "One per toilet.", [row("Showers", NT)], 0);
    item("Taps – bib cock + health faucet (set)", "set", "taps", "One set per toilet.", [row("Tap sets", NT)], 0);
  }
  item("Floor drain / trap with jali", "nos", "fdrain", "Toilets + kitchens.", [row("Toilets", NT), row("Kitchens", KIT)], 0);
  if (KIT) item("Kitchen sink (SS) with tap", "nos", "sink", "One per kitchen.", [row("Kitchens", KIT)], 0);
  item("CPVC 20 mm supply pipe, concealed", "rm", "cpvc", "12 m per toilet + 8 m per kitchen.", [row("Toilets", NT, 12), row("Kitchens", KIT, 8)], 1);
  item("SWR 110 mm drain pipe with fittings", "rm", "swr110", "6 m per toilet + 8 m stack.", [row("Toilets", NT, 6), row("Main stack", 1, 8)], 1);
  item("SWR 75 / 40 mm waste pipe with fittings", "rm", "swr75", "6 m per toilet + 4 m per kitchen.", [row("Toilets", NT, 6), row("Kitchens", KIT, 4)], 1);
  item("Main riser + drain stack to ground, chamber connection", "LS", "riser", "Lump sum.", [row("Lump sum", 1)], 0);

  sec("H", "Staircase (dog-legged RCC)", "सीढ़ी (डॉग-लेग्ड RCC)");
  const NS = F; // one flight set per floor, including terrace access
  const nr = 10, rise = FH / 20, tread = 0.25, sw = 1.0, waist = 0.15;
  const incl = Math.hypot((nr - 1) * tread, nr * rise);
  const stc = item("Staircase RCC M20 – 2 flights × 10 risers × 1.0 m + landing", "m³", "rcc", `Waist ${waist} m, inclined length ${round(incl, 3)} m; ${NS} staircase(s) incl. terrace access.`, [
    row("Waist slab, 2 flights", 2 * NS, round(incl, 3), sw, waist),
    row("Steps (triangular)", 2 * nr * NS, tread, sw, round(rise / 2, 3), "½ × tread × riser"),
    row("Mid landing", NS, 2.1, sw, waist),
  ]);
  const sts = item("Staircase steel Fe500D", "kg", "steel", "90 kg per m³ of staircase concrete.", [row("Staircase m³ × 90 kg/m³", 1, stc.qty, KG.stair)], 1);
  item("Staircase shuttering", "m²", "sh_slab", "Waist + landing soffit + risers.", [
    row("Waist soffit", 2 * NS, round(incl, 3), sw),
    row("Landing soffit", NS, 2.1, sw),
    row("Risers", 2 * nr * NS, sw, undefined, round(rise, 3)),
  ], 2);
  const stt = item("Stair tread + riser tiles incl. landing", "m²", "st_tile", "Treads, risers, landing.", [
    row("Treads", 2 * nr * NS, tread, sw),
    row("Risers", 2 * nr * NS, round(rise, 3), sw),
    row("Landing", NS, 2.1, sw),
  ], 2);
  item("Staircase soffit plaster + paint", "m²", "st_soffit", "Waist + landing soffit.", [row("Waist soffit", 2 * NS, round(incl, 3), sw), row("Landing soffit", NS, 2.1, sw)], 2);
  item("MS railing 1 m with handrail", "rm", "rail", "Both flights + landing return.", [row("Railing", NS, round(2 * incl + sw, 2))], 1);

  sec("I", "Electrical and painting", "बिजली और पेंटिंग");
  const Afl = L0 * B0;
  item("Concealed wiring, conduit, switches, DB (excl. fixtures)", "m²", "elec", "Built-up area, all floors.", [row(`Built-up, ${F} floor(s)`, F, round(Afl, 2))], 1);
  item("Internal paint: putty 2 coats + primer + 2 coats emulsion", "m²", "p_int", "Wall plaster less tiles, plus ceilings.", [qRow("Wall plaster (D1)", plI.qty), qRow("(−) Tiled area (E4)", -wt.qty), qRow("Ceilings (D3)", plC.qty)], 1);
  item("External weather-coat paint, primer + 2 coats", "m²", "p_ext", "External plaster + parapet.", [qRow("External plaster (D2)", plE.qty), qRow("Parapet (D4)", plP.qty)], 1);

  for (const s of sections) s.subtotal = s.items.reduce((a, i) => a + i.amount, 0);
  const itemsTotal = sections.reduce((a, s) => a + s.subtotal, 0);
  const contingency = Math.round(itemsTotal * 0.05);
  const grandTotal = itemsTotal + contingency;
  const builtUpSqftPerFloor = Afl * SQFT_PER_M2;
  const builtUpSqft = builtUpSqftPerFloor * F;

  // ---------------- materials
  const m20 = foot.qty + pbeam.qty + col.qty + beam.qty + slab.qty + stc.qty + lintel.qty;
  const pcc = pccf.qty + pccfl.qty;
  const brickV = bwE.qty + bwI.qty + para.qty;
  const mortBw = brickV * 0.26;
  const pl15 = (plI.qty + plC.qty) * 0.012 * 1.3;
  const pl14 = (plE.qty + plP.qty) * 0.02 * 1.3;
  const bed = (vit.qty + anti.qty + stt.qty) * 0.03;
  const cement = m20 * 8.06 + pcc * 3.4 + mortBw * 5.7 + pl15 * 6.8 + pl14 * 8.1 + bed * 8.1;
  const sand = m20 * 0.42 + pcc * 0.47 + (mortBw + pl15 + pl14 + bed) * 1.05;
  const agg = m20 * 0.84 + pcc * 0.94;
  const bricks = brickV * 500 * 1.03;
  const steelT = steel.qty + sts.qty;
  const tilesSqft = (vit.qty + anti.qty + wt.qty + stt.qty) * 1.05 * SQFT_PER_M2;
  const materials = [
    { key: "cement", unit: "bags", qty: cement, basis: "Concrete 8.06, PCC 3.4, masonry mortar 5.7, plaster 6.8 / 8.1 bags per m³" },
    { key: "steel", unit: "kg", qty: steelT, basis: "Items B4 + H2" },
    { key: "sand", unit: "cft", qty: sand * CFT_PER_M3, basis: "Concrete share + 1.05 m³ per m³ of mortar" },
    { key: "aggregate", unit: "cft", qty: agg * CFT_PER_M3, basis: "Concrete only" },
    { key: "bricks", unit: "nos", qty: bricks, basis: "500 per m³ of brickwork + 3% breakage" },
    { key: "tiles", unit: "sqft", qty: tilesSqft, basis: "Floor + wall + stair tiles + 5%" },
    { key: "rcc", unit: "m³", qty: m20, basis: "All M20 concrete incl. lintels and stairs" },
  ];
  const thumbDef: [string, string, number, number][] = [
    ["cement", "bags", 0.4, cement],
    ["steel", "kg", 4.0, steelT],
    ["sand", "cft", 1.816, sand * CFT_PER_M3],
    ["aggregate", "cft", 1.35, agg * CFT_PER_M3],
    ["bricks", "nos", 8, bricks],
    ["tiles", "sqft", 1.3, tilesSqft],
  ];
  const thumb = thumbDef.map(([key, unit, perSqft, qty]) => {
    const thumbQty = perSqft * builtUpSqft;
    return { key, unit, perSqft, thumbQty, qty, diffPct: ((qty - thumbQty) / thumbQty) * 100 };
  });

  return {
    rooms,
    geometry: {
      floors: F,
      L0,
      B0,
      footprintM2: Afl,
      builtUpSqftPerFloor,
      builtUpSqft,
      carpetSqftPerFloor: carpet * SQFT_PER_M2,
      columns: NCOL,
      baysL: NBL,
      baysB: NBB,
      partitionPerFloor: PART,
    },
    sections,
    itemsTotal,
    contingency,
    grandTotal,
    perSqft: grandTotal / builtUpSqft,
    materials,
    thumb,
    assumptions: [
      `Layout assumed from rooms (no drawing): footprint ${L0} × ${B0} m, carpet ≈ 83% of built-up incl. staircase ${STAIR_FP} m².`,
      `RCC frame: ${NCOL} columns 300 × 300 (${NBL} × ${NBB} bays, max 3.6 m), beams 230 × 400, slab 125 mm, floor height ${FH} m, plinth ${PLINTH} m.`,
      `Isolated footings ${FOOT} × ${FOOT} m at ${PIT_D} m depth — confirm by soil test / structural design.`,
      `Per floor: ${WIN} windows 1.5 × 1.2, ${RD} room doors, ${TD} toilet doors, ${MD} main / balcony door(s), ${VEN} ventilators.`,
      "Steel by kg per m³ of concrete (footing 80, column 180, plinth beam 120, beam 150, slab 90, stair 90) + 5%.",
      "Composite rates (material + labour) — edit any rate to match your city or SOR.",
      "Excludes land, approvals, interiors, fixtures, compound wall, borewell, water tank, septic tank, GST if extra.",
    ],
  };

  function flr(f: number) {
    return f === 0 ? "GF" : F > 2 ? `F${f}` : "FF";
  }
}

/** Cement bags in 1 m³ of a given material — exposed for UI notes. */
export const CEMENT_BAG_VOLUME = CEMENT_BAG_M3;
