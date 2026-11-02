/**
 * Room-based item-wise BOQ (no drawing needed).
 * Rooms → assumed RCC frame layout → measurement book rows (Nos × L × B × H) → abstract of cost.
 * Mirrors the founder's estimate format: sections A–I, sub-totals, 5% contingency, grand total.
 */
import { CEMENT_BAG_M3, CFT_PER_M3, round, SQFT_PER_M2 } from "./units";

export type RoomType = "hall" | "dining" | "kitchen" | "bedroom" | "toilet" | "passage" | "balcony" | "pooja" | "store" | "study" | "utility" | "parking" | "shop";

export type DoorKind = "main" | "balcony" | "flush" | "pvc" | "shutter" | "none";

interface RoomDef {
  L: number;
  B: number;
  code: string;
  door: DoorKind;
  /** Door / opening width (m) — used for skirting and lintels. */
  doorW: number;
  windows: number;
  vents: number;
  floor: "vit" | "anti";
  plaster: boolean;
  ceiling: boolean;
  skirting: boolean;
  name: { en: string; hi: string };
}

/** Every room type with its default size (m) and what it brings with it. */
export const ROOM_DEFS: Record<RoomType, RoomDef> = {
  hall: {
    L: 4.5,
    B: 3.9,
    code: "H",
    door: "main",
    doorW: 1.0,
    windows: 2,
    vents: 0,
    floor: "vit",
    plaster: true,
    ceiling: true,
    skirting: true,
    name: { en: "Hall / living", hi: "हॉल / लिविंग" },
  },
  bedroom: {
    L: 3.6,
    B: 3.3,
    code: "BR",
    door: "flush",
    doorW: 0.9,
    windows: 1,
    vents: 0,
    floor: "vit",
    plaster: true,
    ceiling: true,
    skirting: true,
    name: { en: "Bedroom", hi: "बेडरूम" },
  },
  kitchen: {
    L: 3.0,
    B: 2.7,
    code: "K",
    door: "flush",
    doorW: 0.9,
    windows: 1,
    vents: 0,
    floor: "vit",
    plaster: true,
    ceiling: true,
    skirting: true,
    name: { en: "Kitchen", hi: "किचन" },
  },
  dining: {
    L: 3.0,
    B: 2.7,
    code: "D",
    door: "none",
    doorW: 1.2,
    windows: 1,
    vents: 0,
    floor: "vit",
    plaster: true,
    ceiling: true,
    skirting: true,
    name: { en: "Dining", hi: "डाइनिंग" },
  },
  toilet: {
    L: 2.4,
    B: 1.5,
    code: "T",
    door: "pvc",
    doorW: 0.75,
    windows: 0,
    vents: 1,
    floor: "anti",
    plaster: true,
    ceiling: true,
    skirting: false,
    name: { en: "Toilet / bath", hi: "टॉयलेट / बाथ" },
  },
  passage: {
    L: 3.6,
    B: 1.0,
    code: "P",
    door: "none",
    doorW: 2.0,
    windows: 0,
    vents: 0,
    floor: "vit",
    plaster: true,
    ceiling: true,
    skirting: true,
    name: { en: "Passage / lobby", hi: "पैसेज / लॉबी" },
  },
  balcony: {
    L: 3.0,
    B: 1.2,
    code: "BL",
    door: "balcony",
    doorW: 1.0,
    windows: 0,
    vents: 0,
    floor: "vit",
    plaster: false,
    ceiling: false,
    skirting: true,
    name: { en: "Balcony", hi: "बालकनी" },
  },
  pooja: {
    L: 1.8,
    B: 1.5,
    code: "PJ",
    door: "flush",
    doorW: 0.75,
    windows: 0,
    vents: 0,
    floor: "vit",
    plaster: true,
    ceiling: true,
    skirting: true,
    name: { en: "Pooja room", hi: "पूजा घर" },
  },
  store: {
    L: 2.1,
    B: 1.8,
    code: "S",
    door: "flush",
    doorW: 0.75,
    windows: 0,
    vents: 1,
    floor: "vit",
    plaster: true,
    ceiling: true,
    skirting: true,
    name: { en: "Store", hi: "स्टोर" },
  },
  study: {
    L: 3.0,
    B: 3.0,
    code: "ST",
    door: "flush",
    doorW: 0.9,
    windows: 1,
    vents: 0,
    floor: "vit",
    plaster: true,
    ceiling: true,
    skirting: true,
    name: { en: "Study / office", hi: "स्टडी / ऑफ़िस" },
  },
  utility: {
    L: 2.1,
    B: 1.5,
    code: "U",
    door: "none",
    doorW: 0.9,
    windows: 0,
    vents: 1,
    floor: "anti",
    plaster: true,
    ceiling: true,
    skirting: false,
    name: { en: "Wash / utility", hi: "वॉश / यूटिलिटी" },
  },
  parking: {
    L: 5.4,
    B: 3.0,
    code: "PK",
    door: "none",
    doorW: 3.0,
    windows: 0,
    vents: 0,
    floor: "anti",
    plaster: true,
    ceiling: true,
    skirting: false,
    name: { en: "Parking", hi: "पार्किंग" },
  },
  shop: {
    L: 4.5,
    B: 3.0,
    code: "SH",
    door: "shutter",
    doorW: 2.4,
    windows: 0,
    vents: 0,
    floor: "vit",
    plaster: true,
    ceiling: true,
    skirting: true,
    name: { en: "Shop (shutter)", hi: "दुकान (शटर)" },
  },
};
export const ROOM_TYPES = Object.keys(ROOM_DEFS) as RoomType[];

/** Default clear sizes in metres (L × B) — kept for older callers. */
export const ROOM_SIZES = Object.fromEntries(ROOM_TYPES.map((t) => [t, [ROOM_DEFS[t].L, ROOM_DEFS[t].B]])) as Record<RoomType, [number, number]>;

/** One room as the user enters it (metres). */
export interface RoomSpec {
  type: RoomType;
  L: number;
  B: number;
  /** Windows in this room (default by type). */
  windows?: number;
  /** Toilets only: western or Indian WC. */
  wc?: "ewc" | "iwc";
}

export interface FloorPlan {
  bedrooms: number;
  toilets: number;
  kitchen: boolean;
  dining: boolean;
  balconies: number;
}

/** Composite market rates (material + labour), tier-2 private work 2026, ₹ — editable. */
export const BOQ_RATES = {
  exc: 280, pcc: 4800, back: 150, termite: 60, murum: 900, rcc: 6500, steel: 72, sh_col: 320, sh_beam: 320, sh_slab: 280,
  sh_foot: 280, brick: 6200, lintel: 16000, pl_int: 300, pl_ext: 380, pl_ceil: 320, pl_para: 380, vit: 1300, skirt: 130,
  anti: 950, wtile: 950, toi_wp: 500, ter_wp: 420, granite: 4000, mdoor: 25000, bdoor: 12000, fdoor: 11000, pvc: 3800, alwin: 4800,
  vent: 1500, ewc: 8500, iwc: 4500, basin: 3000, shower: 3500, taps: 2000, fdrain: 500, sink: 4000, cpvc: 280, swr110: 900,
  swr75: 600, riser: 12000, elec: 800, p_int: 220, p_ext: 200, st_tile: 1600, st_soffit: 550, rail: 2500, shutter: 3200,
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

export interface BoqSpec {
  /** Floor-to-floor height, m (default 3.0 = 10 ft). */
  floorH?: number;
  /** Window size, m (default 1.5 × 1.2). */
  winW?: number;
  winH?: number;
  /** Plinth height above ground, m (default 0.45). */
  plinth?: number;
  /** Staircase going up to the terrace (default true). */
  stairToTerrace?: boolean;
}

export interface BoqInput {
  /** Rooms of each floor, ground floor first. When given, floors / plan / roomSizes are ignored. */
  floorRooms?: RoomSpec[][];
  /** Older simple input: same plan repeated on every floor. */
  floors?: number;
  plan?: FloorPlan;
  roomSizes?: Partial<Record<RoomType, [number, number]>>;
  spec?: BoqSpec;
  /** Multiplier applied to every composite rate (city / market level). */
  locationFactor?: number;
  /** Rate overrides by item code (A1, B2…). */
  rateOverrides?: Record<string, number>;
}

export interface Room {
  code: string;
  type: RoomType;
  floor: number;
  L: number;
  B: number;
  area: number;
  per: number;
  door: DoorKind;
  doorWidth: number;
  windows: number;
  vents: number;
  wc?: "ewc" | "iwc";
}

const row = (desc: string, n: number, L?: number, B?: number, H?: number, rem?: string): MbRow => {
  let q = n;
  for (const d of [L, B, H]) if (d !== undefined) q *= d;
  return { desc, n, L, B, H, q, rem };
};
const qRow = (desc: string, q: number, rem?: string): MbRow => ({ desc, n: 1, L: round(q, 3), q, rem });

export const roomName = (t: RoomType, lang: "en" | "hi" = "en") => ROOM_DEFS[t].name[lang];

/** Typical room list for one floor from a simple plan. */
export function planRooms(plan: FloorPlan, sizes: Partial<Record<RoomType, [number, number]>> = {}, isGround = true): RoomSpec[] {
  const size = (t: RoomType): [number, number] => sizes[t] ?? ROOM_SIZES[t];
  const list: RoomSpec[] = [{ type: "hall", L: size("hall")[0], B: size("hall")[1] }];
  if (plan.dining) list.push({ type: "dining", L: size("dining")[0], B: size("dining")[1] });
  if (plan.kitchen) list.push({ type: "kitchen", L: size("kitchen")[0], B: size("kitchen")[1] });
  for (let i = 0; i < plan.bedrooms; i++) {
    const [l, b] = size("bedroom");
    list.push({ type: "bedroom", L: i === 0 && !sizes.bedroom ? round(l + 0.3, 2) : l, B: b });
  }
  list.push({ type: "passage", L: sizes.passage?.[0] ?? Math.max(3, round(1.2 * (plan.bedrooms + plan.toilets), 2)), B: size("passage")[1] });
  for (let i = 0; i < plan.toilets; i++)
    list.push({ type: "toilet", L: size("toilet")[0], B: size("toilet")[1], wc: isGround && plan.toilets > 1 && i === plan.toilets - 1 ? "iwc" : "ewc" });
  for (let i = 0; i < plan.balconies; i++) list.push({ type: "balcony", L: size("balcony")[0], B: size("balcony")[1] });
  return list;
}

/** Room list for every floor (older simple input). */
export function buildRooms(floors: number, plan: FloorPlan, sizes: Partial<Record<RoomType, [number, number]>> = {}): Room[] {
  return toRooms(Array.from({ length: floors }, (_, f) => planRooms(plan, sizes, f === 0)));
}

function toRooms(floorRooms: RoomSpec[][]): Room[] {
  const counts: Record<string, number> = {};
  const rooms: Room[] = [];
  floorRooms.forEach((list, f) => {
    for (const r of list) {
      const def = ROOM_DEFS[r.type];
      counts[def.code] = (counts[def.code] ?? 0) + 1;
      const L = Math.max(0.6, r.L),
        B = Math.max(0.6, r.B);
      rooms.push({
        code: `${def.code}${counts[def.code]}`,
        type: r.type,
        floor: f,
        L,
        B,
        area: L * B,
        per: 2 * (L + B),
        door: r.type === "hall" && f > 0 ? "flush" : def.door,
        doorWidth: def.doorW,
        windows: Math.max(0, Math.round(r.windows ?? def.windows)),
        vents: def.vents,
        wc: r.type === "toilet" ? (r.wc ?? "ewc") : undefined,
      });
    }
  });
  return rooms;
}

export interface FloorGeo {
  floor: number;
  L: number;
  B: number;
  areaM2: number;
  builtUpSqft: number;
  carpetSqft: number;
  columns: number;
  baysL: number;
  baysB: number;
  partition: number;
  rooms: number;
}

export interface BoqResult {
  rooms: Room[];
  geometry: {
    floors: number;
    /** Base (largest) floor outline, used for foundation. */
    L0: number;
    B0: number;
    footprintM2: number;
    /** Ground floor built-up (sqft). */
    builtUpSqftPerFloor: number;
    builtUpSqft: number;
    /** Ground floor carpet (sqft). */
    carpetSqftPerFloor: number;
    carpetSqft: number;
    columns: number;
    baysL: number;
    baysB: number;
    partitionPerFloor: number;
    perFloor: FloorGeo[];
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

export function floorLabel(f: number, total: number) {
  return f === 0 ? "GF" : total > 2 ? `F${f}` : "FF";
}

export function calcBoq(input: BoqInput): BoqResult {
  const floorRooms: RoomSpec[][] = input.floorRooms?.length
    ? input.floorRooms
    : Array.from({ length: Math.max(1, Math.round(input.floors ?? 1)) }, (_, f) =>
        planRooms(input.plan ?? { bedrooms: 2, toilets: 2, kitchen: true, dining: true, balconies: 0 }, input.roomSizes, f === 0),
      );
  const F = floorRooms.length;
  const factor = input.locationFactor ?? 1;
  const overrides = input.rateOverrides ?? {};
  const spec = input.spec ?? {};
  const rooms = toRooms(floorRooms);
  const flr = (f: number) => floorLabel(f, F);
  const FL = Array.from({ length: F }, (_, f) => f);
  const onFloor = (f: number) => rooms.filter((r) => r.floor === f);

  // ---------------- constants
  const COL = 0.3,
    BW = 0.23,
    BD = 0.4,
    SLAB = 0.125,
    WE = 0.23,
    WI = 0.115;
  const FH = round(spec.floorH ?? 3.0, 3);
  const PLINTH = round(spec.plinth ?? 0.45, 3);
  const WW = round(spec.winW ?? 1.5, 3),
    WH = round(spec.winH ?? 1.2, 3);
  const terrace = spec.stairToTerrace ?? true;
  const NS = F - 1 + (terrace ? 1 : 0); // staircases (one per storey climbed)
  const STAIR_FP = 6.83;
  const WALL_H = round(FH - BD, 3),
    PL_H = round(FH - SLAB, 3);
  const SH_H = 2.4; // shutter height

  // ---------------- per-floor geometry (each floor sized from its own rooms)
  const geo = FL.map((f) => {
    const rs = onFloor(f);
    const carpet = rs.reduce((a, r) => a + r.area, 0);
    const hasStair = f < F - 1 || terrace;
    const A = (carpet + (hasStair ? STAIR_FP : 0)) / 0.83;
    const L = round(Math.sqrt(A * 1.25), 2);
    const B = round(A / L, 2);
    const LC = L - COL,
      BC = B - COL;
    const NBL = Math.max(1, Math.ceil(LC / 3.6)),
      NBB = Math.max(1, Math.ceil(BC / 3.6));
    const CLL = round(LC / NBL - COL, 3),
      CLB = round(BC / NBB - COL, 3);
    const NCOL = (NBL + 1) * (NBB + 1);
    const innerPer = 2 * (L - 2 * WE + (B - 2 * WE));
    const outerPer = 2 * (L + B);
    const part = round(Math.max(0, (rs.reduce((a, r) => a + r.per, 0) - innerPer) / 2), 2);
    const cnt = (fn: (r: Room) => number) => rs.reduce((a, r) => a + fn(r), 0);
    return {
      f,
      rs,
      carpet,
      hasStair,
      L,
      B,
      A: L * B,
      NBL,
      NBB,
      CLL,
      CLB,
      NCOL,
      outerPer,
      paraCl: outerPer - 4 * WE,
      part,
      net: carpet + (hasStair ? STAIR_FP : 0),
      win: cnt((r) => r.windows),
      ven: cnt((r) => r.vents),
      md: cnt((r) => (r.door === "main" ? 1 : 0)),
      bd: cnt((r) => (r.door === "balcony" ? 1 : 0)),
      fd: cnt((r) => (r.door === "flush" ? 1 : 0)),
      fdW: cnt((r) => (r.door === "flush" ? r.doorWidth : 0)),
      td: cnt((r) => (r.door === "pvc" ? 1 : 0)),
      sh: cnt((r) => (r.door === "shutter" ? 1 : 0)),
      pk: cnt((r) => (r.type === "parking" ? 1 : 0)),
      GA: Array.from({ length: NBB + 1 }, (_, i) => String.fromCharCode(65 + i)),
      GN: Array.from({ length: NBL + 1 }, (_, i) => String(i + 1)),
    };
  });
  const base = geo.reduce((a, g) => (g.A > a.A ? g : a), geo[0]);
  const g0 = geo[0];
  const NCOL = base.NCOL;
  const highGround = F > 1;
  const FOOT = highGround ? 1.5 : 1.2,
    FOOT_D = highGround ? 0.45 : 0.4,
    PIT_D = highGround ? 1.5 : 1.2;
  const PCC_W = FOOT + 0.2,
    PIT = FOOT + 0.4;

  const toilets = rooms.filter((r) => r.type === "toilet");
  const kitchens = rooms.filter((r) => r.type === "kitchen");
  const utils = rooms.filter((r) => r.type === "utility");
  const NT = toilets.length,
    KIT = kitchens.length,
    UT = utils.length;
  const tot = (k: "win" | "ven" | "md" | "bd" | "fd" | "td" | "sh") => geo.reduce((a, g) => a + g[k], 0);
  const WIN = tot("win"),
    VEN = tot("ven"),
    MD = tot("md"),
    FD = tot("fd"),
    TD = tot("td"),
    SH = tot("sh");
  const avgFdW = FD ? round(geo.reduce((a, g) => a + g.fdW, 0) / FD, 2) : 0.9;

  // ---------------- items
  const sections: BoqSection[] = [];
  const sec = (code: string, en: string, hi: string) => sections.push({ code, title: { en, hi }, items: [], subtotal: 0 });
  const item = (desc: string, unit: string, rateKey: RateKey, basis: string, rows: MbRow[], dec = 3): BoqItem => {
    const s = sections.at(-1)!;
    const code = `${s.code}${s.items.length + 1}`;
    const qty = round(
      rows.reduce((a, r) => a + r.q, 0),
      dec,
    );
    const rate = overrides[code] ?? Math.round(BOQ_RATES[rateKey] * factor);
    const it: BoqItem = { code, desc, unit, rateKey, rate, basis, rows, qty, dec, amount: Math.round(qty * rate) };
    s.items.push(it);
    return it;
  };
  /** Opening deductions for one floor, as MB rows. */
  const openRows = (g: (typeof geo)[number], t: number, mode: "ext" | "int" | "plInt" | "plExt") => {
    const p = flr(g.f);
    const out: MbRow[] = [];
    const r = (desc: string, n: number, L: number, H: number) => {
      if (n) out.push(row(`${p} (−) ${desc}`, -n, L, H));
    };
    if (mode === "ext" || mode === "plExt" || mode === "plInt") {
      r(`Windows ${WW} × ${WH}`, g.win, WW, WH);
      r("Main doors 1.0 × 2.1", g.md, 1.0, 2.1);
      r("Balcony doors 1.0 × 2.1", g.bd, 1.0, 2.1);
      r(`Shutters 2.4 × ${SH_H}`, g.sh, 2.4, SH_H);
      r("Ventilators 0.6 × 0.45", g.ven, 0.6, 0.45);
      r("Parking opening 3.0 × 2.4", g.pk, 3.0, 2.4);
    }
    if (mode === "int" || mode === "plInt") {
      const k = mode === "plInt" ? 2 : 1;
      r(`Room doors ${avgFdW} × 2.1${k === 2 ? " (both faces)" : ""}`, g.fd * k, avgFdW, 2.1);
      r(`Toilet doors 0.75 × 2.1${k === 2 ? " (both faces)" : ""}`, g.td * k, 0.75, 2.1);
    }
    return t ? out.map((x) => row(x.desc, x.n, x.L, x.B, t)) : out;
  };

  sec("A", "Earthwork and foundation", "खुदाई और नींव");
  const exc = item(
    `Excavation for column footings in ordinary soil, depth ${PIT_D} m`,
    "m³",
    "exc",
    `Pit = footing ${FOOT} m + 0.20 m working space each side = ${round(PIT, 2)} m square × ${PIT_D} m deep.`,
    [row(`Footing pits F1–F${NCOL}`, NCOL, PIT, PIT, PIT_D, `${NCOL} columns`)],
  );
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
    ...base.GA.map((x) => row(`Grid ${x} (along length), ${base.NBL} spans`, base.NBL, base.CLL, BW, 0.3)),
    ...base.GN.map((x) => row(`Grid ${x} (along width), ${base.NBB} spans`, base.NBB, base.CLB, BW, 0.3)),
  ];
  const pbeam = item("RCC M20 plinth beam 230 × 300 mm", "m³", "rcc", "Clear span between columns × 0.23 × 0.30 m.", pbRows);
  item("Anti-termite treatment on plinth area", "m²", "termite", "Outer L × B of the ground floor.", [row("Plinth area", 1, g0.L, g0.B)], 2);
  item(`Plinth filling with murum / sand, 300 mm`, "m³", "murum", "Net ground floor area (rooms + stair) × 0.30 m.", [row("Net GF area", 1, round(g0.net, 2), undefined, 0.3)]);
  const pccfl = item("PCC 1:4:8 base for ground floor, 75 mm", "m³", "pcc", "Net ground floor area × 0.075 m.", [row("Net GF area", 1, round(g0.net, 2), undefined, 0.075)]);

  sec("B", "RCC structure – M20 / Fe500D", "RCC ढांचा – M20 / Fe500D");
  const colH = round(PIT_D - FOOT_D + PLINTH, 2);
  const col = item("RCC M20 columns 300 × 300 mm", "m³", "rcc", `Below plinth ${colH} m; each floor clear height ${FH} − ${BD} = ${WALL_H} m.`, [
    row("Footing top to plinth", NCOL, COL, COL, colH),
    ...geo.map((g) => row(`${flr(g.f)} columns`, g.NCOL, COL, COL, WALL_H)),
  ]);
  const bmRows = geo.flatMap((g) => [
    row(`${flr(g.f)} beams along length (${g.GA.length} grids × ${g.NBL} spans)`, g.GA.length * g.NBL, g.CLL, BW, BD - SLAB),
    row(`${flr(g.f)} beams along width (${g.GN.length} grids × ${g.NBB} spans)`, g.GN.length * g.NBB, g.CLB, BW, BD - SLAB),
  ]);
  const beam = item("RCC M20 beams 230 × 400 mm (275 mm below slab)", "m³", "rcc", "Clear span × 0.23 × 0.275 m; slab portion counted in slab.", bmRows);
  const slab = item(
    "RCC M20 slab 125 mm",
    "m³",
    "rcc",
    "Each floor's outline L × B × 0.125 m.",
    geo.map((g) => row(`Roof slab over ${flr(g.f)}`, 1, g.L, g.B, SLAB)),
  );
  const KG = { foot: 80, col: 180, pbeam: 120, beam: 150, slab: 90, stair: 90 };
  const stRows = [
    row("Footings: m³ × 80 kg/m³", 1, foot.qty, KG.foot, undefined, "m³ × kg/m³"),
    row("Columns: m³ × 180 kg/m³", 1, col.qty, KG.col),
    row("Plinth beams: m³ × 120 kg/m³", 1, pbeam.qty, KG.pbeam),
    row("Beams: m³ × 150 kg/m³", 1, beam.qty, KG.beam),
    row("Slabs: m³ × 90 kg/m³", 1, slab.qty, KG.slab),
  ];
  stRows.push(qRow("Add 5% laps / wastage", round(stRows.reduce((a, r) => a + r.q, 0) * 0.05, 1)));
  const steel = item(
    "Reinforcement steel Fe500D (cut, bent, tied)",
    "kg",
    "steel",
    "Thumb rule kg per m³ of concrete by member + 5%. Exact steel comes from the bar bending schedule.",
    stRows,
    1,
  );
  const beamLen = round(
    bmRows.reduce((a, r) => a + r.n * (r.L ?? 0), 0),
    2,
  );
  const pbLen = round(
    pbRows.reduce((a, r) => a + r.n * (r.L ?? 0), 0),
    2,
  );
  item("Shuttering – footing sides", "m²", "sh_foot", "4 sides × size × depth.", [row("Footing sides", NCOL * 4, FOOT, undefined, FOOT_D)], 2);
  item(
    "Shuttering – columns",
    "m²",
    "sh_col",
    "Perimeter 1.20 m × height.",
    [row("Footing to plinth", NCOL, 1.2, undefined, colH), ...geo.map((g) => row(`${flr(g.f)} columns`, g.NCOL, 1.2, undefined, WALL_H))],
    2,
  );
  item(
    "Shuttering – plinth beams and beams",
    "m²",
    "sh_beam",
    "Plinth beam 2 sides × 0.30; beams girth 0.78 m.",
    [row("Plinth beam sides", 2, pbLen, undefined, 0.3), row("Beams girth 0.78 m", 1, beamLen, 0.78)],
    2,
  );
  item(
    "Shuttering / centering – slab soffit and edges",
    "m²",
    "sh_slab",
    "Slab area less beam soffit, plus edges.",
    [
      ...geo.map((g) => row(`${flr(g.f)} slab soffit`, 1, g.L, g.B)),
      row("(−) Beam soffit", -1, beamLen, BW),
      ...geo.map((g) => row(`${flr(g.f)} slab edges`, 1, round(g.outerPer, 2), undefined, SLAB)),
    ],
    2,
  );

  sec("C", "Brickwork, parapet and lintels", "ईंट की चिनाई, पैरापेट और लिंटल");
  const bwE = item(
    "Brickwork 230 mm outer walls, CM 1:6",
    "m³",
    "brick",
    `Between columns × 0.23 × ${WALL_H} m; openings deducted.`,
    geo.flatMap((g) => [
      row(`${flr(g.f)} long sides, ${g.NBL} spans × 2`, g.NBL * 2, g.CLL, WE, WALL_H),
      row(`${flr(g.f)} short sides, ${g.NBB} spans × 2`, g.NBB * 2, g.CLB, WE, WALL_H),
      ...openRows(g, WE, "ext"),
    ]),
    2,
  );
  const bwI = item(
    "Brickwork 115 mm partitions, CM 1:6",
    "m³",
    "brick",
    `Partition length per floor from room perimeters × 0.115 × ${WALL_H} m.`,
    geo.flatMap((g) => [row(`${flr(g.f)} partitions ${g.part} m`, 1, g.part, WI, WALL_H), ...openRows(g, WI, "int")]),
    2,
  );
  // parapet on the top roof, and on any lower roof left open by a smaller floor above
  const paraRows = geo.flatMap((g) => {
    const up = geo[g.f + 1];
    if (!up) return [row(`Parapet over ${flr(g.f)}`, 1, round(g.paraCl, 2), WE, 0.9)];
    if (g.A > up.A * 1.05) return [row(`Open terrace over ${flr(g.f)}`, 1, round(g.B + 2 * Math.max(0, g.L - up.L), 2), WE, 0.9)];
    return [];
  });
  const paraLen = paraRows.reduce((a, r) => a + (r.L ?? 0), 0);
  const para = item("Parapet 230 mm × 0.90 m, CM 1:6", "m³", "brick", "Centre-line length × 0.23 × 0.90.", paraRows, 2);
  const lintel = item("RCC lintels incl. steel and shuttering", "m³", "lintel", "Opening + 0.30 m × wall thickness × 0.15 m.", [
    ...(WIN ? [row("Windows (230 wall)", WIN, round(WW + 0.3, 2), WE, 0.15)] : []),
    ...(MD + BD ? [row("Main / balcony doors (230 wall)", MD + BD, 1.3, WE, 0.15)] : []),
    ...(SH ? [row("Shutters (230 wall)", SH, 2.7, WE, 0.15)] : []),
    ...(geo.some((g) => g.pk)
      ? [
          row(
            "Parking opening beam (230 wall)",
            geo.reduce((a, g) => a + g.pk, 0),
            3.3,
            WE,
            0.15,
          ),
        ]
      : []),
    ...(VEN ? [row("Ventilators (230 wall)", VEN, 0.9, WE, 0.15)] : []),
    ...(FD ? [row("Room doors (115 wall)", FD, round(avgFdW + 0.3, 2), WI, 0.15)] : []),
    ...(TD ? [row("Toilet doors (115 wall)", TD, 1.05, WI, 0.15)] : []),
  ]);

  sec("D", "Plastering", "प्लास्टर");
  const plRooms = rooms.filter((r) => ROOM_DEFS[r.type].plaster);
  const plI = item(
    "Internal plaster 12 mm, CM 1:5",
    "m²",
    "pl_int",
    `Room perimeter 2(L+B) × ${PL_H} m, less openings (doors in partitions on both faces).`,
    [
      ...plRooms.map((r) => row(`${flr(r.floor)} ${r.code} ${roomName(r.type)} 2(${round(r.L, 2)}+${round(r.B, 2)})`, 1, round(r.per, 2), PL_H)),
      ...geo.flatMap((g) => openRows(g, 0, "plInt")),
    ],
    1,
  );
  const plE = item(
    "External plaster 20 mm, CM 1:4",
    "m²",
    "pl_ext",
    `Outer perimeter × storey height, less openings.`,
    geo.flatMap((g) => [row(`${flr(g.f)} outer faces`, 1, round(g.outerPer, 2), g.f === 0 ? round(FH + PLINTH, 2) : FH), ...openRows(g, 0, "plExt")]),
    1,
  );
  const plC = item(
    "Ceiling plaster 12 mm, CM 1:5",
    "m²",
    "pl_ceil",
    "Slab soffit of every room = L × B.",
    rooms.filter((r) => ROOM_DEFS[r.type].ceiling).map((r) => row(`${flr(r.floor)} ${r.code} ${roomName(r.type)}`, 1, round(r.L, 2), round(r.B, 2))),
    1,
  );
  const plP = item(
    "Parapet plaster both faces + coping, CM 1:4",
    "m²",
    "pl_para",
    "Outer + inner face × 0.90 m + coping 0.23 m.",
    [row("Outer face", 1, round(paraLen + 4 * WE, 2), 0.9), row("Inner face", 1, round(Math.max(0, paraLen - 4 * WE), 2), 0.9), row("Coping", 1, round(paraLen, 2), WE)],
    1,
  );

  sec("E", "Flooring, tiles and waterproofing", "फ़र्श, टाइल्स और वॉटरप्रूफिंग");
  const vitRooms = rooms.filter((r) => ROOM_DEFS[r.type].floor === "vit");
  const antiRooms = rooms.filter((r) => ROOM_DEFS[r.type].floor === "anti");
  const vit = item(
    "Vitrified tiles 600 × 600 in CM bedding",
    "m²",
    "vit",
    "Room floor = clear L × B.",
    vitRooms.map((r) => row(`${flr(r.floor)} ${r.code} ${roomName(r.type)}`, 1, round(r.L, 2), round(r.B, 2))),
    1,
  );
  item(
    "Tile skirting 100 mm",
    "rm",
    "skirt",
    "Room perimeter less door / opening width.",
    rooms.filter((r) => ROOM_DEFS[r.type].skirting).map((r) => row(`${flr(r.floor)} ${r.code} 2(L+B) − ${r.doorWidth}`, 1, round(Math.max(0, r.per - r.doorWidth), 2))),
    1,
  );
  const anti = item(
    "Anti-skid floor tiles – toilets, wash, parking",
    "m²",
    "anti",
    "Room L × B.",
    antiRooms.map((r) => row(`${flr(r.floor)} ${r.code} ${roomName(r.type)}`, 1, round(r.L, 2), round(r.B, 2))),
    1,
  );
  const wt = item(
    "Wall tiles – toilets 2.10 m, kitchen dado 0.60 m",
    "m²",
    "wtile",
    "(Perimeter − door) × 2.10; kitchen platform length × 0.60.",
    [
      ...toilets.map((r) => row(`${flr(r.floor)} ${r.code} (${round(r.per, 2)} − 0.75) × 2.10`, 1, round(r.per - 0.75, 2), 2.1)),
      ...(NT ? [row("(−) Toilet ventilators", -NT, 0.6, 0.45)] : []),
      ...kitchens.map((r) => row(`${flr(r.floor)} ${r.code} dado`, 1, round(Math.min(3.0, r.L), 2), 0.6)),
    ],
    1,
  );
  if (NT)
    item(
      "Toilet waterproofing (floor + 0.30 m turn-up)",
      "m²",
      "toi_wp",
      "Floor + 0.30 m on walls.",
      [
        ...toilets.map((r) => row(`${flr(r.floor)} ${r.code} floor`, 1, round(r.L, 2), round(r.B, 2))),
        ...toilets.map((r) => row(`${flr(r.floor)} ${r.code} turn-up`, 1, round(r.per - 0.75, 2), 0.3)),
      ],
      1,
    );
  item(
    "Terrace waterproofing with screed",
    "m²",
    "ter_wp",
    "Open roof inside parapet.",
    geo.flatMap((g) => {
      const up = geo[g.f + 1];
      if (!up) return [row(`Terrace over ${flr(g.f)}`, 1, round(g.L - 2 * WE, 2), round(g.B - 2 * WE, 2))];
      if (g.A > up.A * 1.05) return [qRow(`Open roof over ${flr(g.f)} (${round(g.A, 1)} − ${round(up.A, 1)})`, round(g.A - up.A, 2))];
      return [];
    }),
    1,
  );
  if (KIT)
    item(
      "Kitchen platform – granite 600 mm",
      "rm",
      "granite",
      "Platform along the kitchen length, max 3.0 m.",
      kitchens.map((r) => row(`${flr(r.floor)} ${r.code}`, 1, round(Math.min(3.0, r.L), 2))),
      1,
    );

  sec("F", "Doors, windows, ventilators", "दरवाज़े, खिड़कियां, वेंटिलेटर");
  if (MD)
    item(
      "Main door 1.0 × 2.1 m, teak / hardwood frame and shutter, hardware",
      "nos",
      "mdoor",
      "Entrance door of the ground floor hall.",
      geo.filter((g) => g.md).map((g) => row(`${flr(g.f)} main doors`, g.md)),
      0,
    );
  if (BD)
    item(
      "Balcony door 1.0 × 2.1 m, UPVC / aluminium with glass",
      "nos",
      "bdoor",
      "One per balcony.",
      geo.filter((g) => g.bd).map((g) => row(`${flr(g.f)} balcony doors`, g.bd)),
      0,
    );
  if (FD)
    item(
      `Flush door ${avgFdW} × 2.1 m with frame and hardware`,
      "nos",
      "fdoor",
      "Bedrooms, kitchen, study, pooja, store.",
      geo.filter((g) => g.fd).map((g) => row(`${flr(g.f)} room doors`, g.fd)),
      0,
    );
  if (TD)
    item(
      "PVC / UPVC door 0.75 × 2.1 m (toilets)",
      "nos",
      "pvc",
      "One per toilet.",
      geo.filter((g) => g.td).map((g) => row(`${flr(g.f)} toilet doors`, g.td)),
      0,
    );
  if (SH) item(`Rolling shutter 2.4 × ${SH_H} m with lock`, "m²", "shutter", "One per shop.", [row("Shutters", SH, 2.4, SH_H)], 1);
  if (WIN)
    item(
      "Aluminium sliding windows with glass",
      "m²",
      "alwin",
      `${WW} × ${WH} m each.`,
      geo.filter((g) => g.win).map((g) => row(`${flr(g.f)} windows`, g.win, WW, WH)),
      1,
    );
  if (VEN)
    item(
      "Aluminium ventilator 0.6 × 0.45 m",
      "nos",
      "vent",
      "Toilets, store, wash.",
      geo.filter((g) => g.ven).map((g) => row(`${flr(g.f)} ventilators`, g.ven)),
      0,
    );

  sec("G", "Plumbing and sanitary", "प्लंबिंग और सैनिटरी");
  const ewc = toilets.filter((r) => r.wc !== "iwc"),
    iwc = toilets.filter((r) => r.wc === "iwc");
  if (ewc.length)
    item(
      "Western commode (EWC) with cistern and fittings",
      "nos",
      "ewc",
      "Toilets set to western WC.",
      [row(ewc.map((r) => `${flr(r.floor)} ${r.code}`).join(", "), ewc.length)],
      0,
    );
  if (iwc.length)
    item("Indian WC with cistern and fittings", "nos", "iwc", "Toilets set to Indian WC.", [row(iwc.map((r) => `${flr(r.floor)} ${r.code}`).join(", "), iwc.length)], 0);
  if (NT) {
    item("Wash basin with tap and waste", "nos", "basin", "One per toilet.", [row("Wash basins", NT)], 0);
    item("Shower with mixer / overhead", "nos", "shower", "One per toilet.", [row("Showers", NT)], 0);
  }
  if (NT + UT)
    item("Taps – bib cock + health faucet (set)", "set", "taps", "One set per toilet and wash area.", [row("Toilets", NT), ...(UT ? [row("Wash / utility", UT)] : [])], 0);
  if (NT + KIT + UT)
    item(
      "Floor drain / trap with jali",
      "nos",
      "fdrain",
      "Toilets, kitchens, wash areas.",
      [row("Toilets", NT), row("Kitchens", KIT), ...(UT ? [row("Wash / utility", UT)] : [])],
      0,
    );
  if (KIT) item("Kitchen sink (SS) with tap", "nos", "sink", "One per kitchen.", [row("Kitchens", KIT)], 0);
  if (NT + KIT + UT) {
    item(
      "CPVC 20 mm supply pipe, concealed",
      "rm",
      "cpvc",
      "12 m per toilet, 8 m per kitchen, 6 m per wash area.",
      [row("Toilets", NT, 12), row("Kitchens", KIT, 8), ...(UT ? [row("Wash / utility", UT, 6)] : [])],
      1,
    );
    item("SWR 110 mm drain pipe with fittings", "rm", "swr110", "6 m per toilet + stack per floor.", [row("Toilets", NT, 6), row("Main stack", 1, round(FH * F + 2, 2))], 1);
    item(
      "SWR 75 / 40 mm waste pipe with fittings",
      "rm",
      "swr75",
      "6 m per toilet, 4 m per kitchen and wash area.",
      [row("Toilets", NT, 6), row("Kitchens", KIT, 4), ...(UT ? [row("Wash / utility", UT, 4)] : [])],
      1,
    );
    item("Main riser + drain stack to ground, chamber connection", "LS", "riser", "Lump sum.", [row("Lump sum", 1)], 0);
  }

  let stc: BoqItem | undefined, sts: BoqItem | undefined, stt: BoqItem | undefined;
  if (NS > 0) {
    sec("H", "Staircase (dog-legged RCC)", "सीढ़ी (डॉग-लेग्ड RCC)");
    const nr = Math.max(8, Math.round(FH / 0.15 / 2)),
      rise = round(FH / (2 * nr), 3),
      tread = 0.25,
      sw = 1.0,
      waist = 0.15;
    const incl = Math.hypot((nr - 1) * tread, nr * rise);
    stc = item(
      `Staircase RCC M20 – 2 flights × ${nr} risers × 1.0 m + landing`,
      "m³",
      "rcc",
      `Rise ${rise * 1000} mm, waist ${waist} m, inclined length ${round(incl, 3)} m; ${NS} staircase(s)${terrace ? " incl. terrace access" : ""}.`,
      [
        row("Waist slab, 2 flights", 2 * NS, round(incl, 3), sw, waist),
        row("Steps (triangular)", 2 * nr * NS, tread, sw, round(rise / 2, 3), "½ × tread × riser"),
        row("Mid landing", NS, 2.1, sw, waist),
      ],
    );
    sts = item("Staircase steel Fe500D", "kg", "steel", "90 kg per m³ of staircase concrete.", [row("Staircase m³ × 90 kg/m³", 1, stc.qty, KG.stair)], 1);
    item(
      "Staircase shuttering",
      "m²",
      "sh_slab",
      "Waist + landing soffit + risers.",
      [row("Waist soffit", 2 * NS, round(incl, 3), sw), row("Landing soffit", NS, 2.1, sw), row("Risers", 2 * nr * NS, sw, undefined, rise)],
      2,
    );
    stt = item(
      "Stair tread + riser tiles incl. landing",
      "m²",
      "st_tile",
      "Treads, risers, landing.",
      [row("Treads", 2 * nr * NS, tread, sw), row("Risers", 2 * nr * NS, rise, sw), row("Landing", NS, 2.1, sw)],
      2,
    );
    item(
      "Staircase soffit plaster + paint",
      "m²",
      "st_soffit",
      "Waist + landing soffit.",
      [row("Waist soffit", 2 * NS, round(incl, 3), sw), row("Landing soffit", NS, 2.1, sw)],
      2,
    );
    item("MS railing 1 m with handrail", "rm", "rail", "Both flights + landing return.", [row("Railing", NS, round(2 * incl + sw, 2))], 1);
  }

  sec(NS > 0 ? "I" : "H", "Electrical and painting", "बिजली और पेंटिंग");
  item(
    "Concealed wiring, conduit, switches, DB (excl. fixtures)",
    "m²",
    "elec",
    "Built-up area of every floor.",
    geo.map((g) => row(`${flr(g.f)} built-up`, 1, g.L, g.B)),
    1,
  );
  item(
    "Internal paint: putty 2 coats + primer + 2 coats emulsion",
    "m²",
    "p_int",
    "Wall plaster less tiles, plus ceilings.",
    [qRow("Wall plaster (D1)", plI.qty), qRow("(−) Tiled area", -wt.qty), qRow("Ceilings (D3)", plC.qty)],
    1,
  );
  item("External weather-coat paint, primer + 2 coats", "m²", "p_ext", "External plaster + parapet.", [qRow("External plaster (D2)", plE.qty), qRow("Parapet (D4)", plP.qty)], 1);

  for (const s of sections) s.subtotal = s.items.reduce((a, i) => a + i.amount, 0);
  const itemsTotal = sections.reduce((a, s) => a + s.subtotal, 0);
  const contingency = Math.round(itemsTotal * 0.05);
  const grandTotal = itemsTotal + contingency;
  const builtUpSqft = geo.reduce((a, g) => a + g.A, 0) * SQFT_PER_M2;
  const carpetSqft = geo.reduce((a, g) => a + g.carpet, 0) * SQFT_PER_M2;

  // ---------------- materials
  const m20 = foot.qty + pbeam.qty + col.qty + beam.qty + slab.qty + (stc?.qty ?? 0) + lintel.qty;
  const pcc = pccf.qty + pccfl.qty;
  const brickV = bwE.qty + bwI.qty + para.qty;
  const mortBw = brickV * 0.26;
  const pl15 = (plI.qty + plC.qty) * 0.012 * 1.3;
  const pl14 = (plE.qty + plP.qty) * 0.02 * 1.3;
  const bed = (vit.qty + anti.qty + (stt?.qty ?? 0)) * 0.03;
  const cement = m20 * 8.06 + pcc * 3.4 + mortBw * 5.7 + pl15 * 6.8 + pl14 * 8.1 + bed * 8.1;
  const sand = m20 * 0.42 + pcc * 0.47 + (mortBw + pl15 + pl14 + bed) * 1.05;
  const agg = m20 * 0.84 + pcc * 0.94;
  const bricks = brickV * 500 * 1.03;
  const steelT = steel.qty + (sts?.qty ?? 0);
  const tilesSqft = (vit.qty + anti.qty + wt.qty + (stt?.qty ?? 0)) * 1.05 * SQFT_PER_M2;
  const materials = [
    { key: "cement", unit: "bags", qty: cement, basis: "Concrete 8.06, PCC 3.4, masonry mortar 5.7, plaster 6.8 / 8.1 bags per m³" },
    { key: "steel", unit: "kg", qty: steelT, basis: "Structure + staircase steel" },
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

  const perFloor: FloorGeo[] = geo.map((g) => ({
    floor: g.f,
    L: g.L,
    B: g.B,
    areaM2: g.A,
    builtUpSqft: g.A * SQFT_PER_M2,
    carpetSqft: g.carpet * SQFT_PER_M2,
    columns: g.NCOL,
    baysL: g.NBL,
    baysB: g.NBB,
    partition: g.part,
    rooms: g.rs.length,
  }));

  return {
    rooms,
    geometry: {
      floors: F,
      L0: base.L,
      B0: base.B,
      footprintM2: base.A,
      builtUpSqftPerFloor: g0.A * SQFT_PER_M2,
      builtUpSqft,
      carpetSqftPerFloor: g0.carpet * SQFT_PER_M2,
      carpetSqft,
      columns: NCOL,
      baysL: base.NBL,
      baysB: base.NBB,
      partitionPerFloor: g0.part,
      perFloor,
    },
    sections,
    itemsTotal,
    contingency,
    grandTotal,
    perSqft: grandTotal / builtUpSqft,
    materials,
    thumb,
    assumptions: [
      `Each floor's outline is worked out from its own rooms (no drawing): carpet ≈ 83% of built-up incl. staircase ${STAIR_FP} m². ` +
        perFloor.map((p) => `${flr(p.floor)} ${p.L} × ${p.B} m`).join(", ") +
        ".",
      `RCC frame: columns 300 × 300 at max 3.6 m spacing (${NCOL} at foundation), beams 230 × 400, slab 125 mm, floor height ${FH} m, plinth ${PLINTH} m.`,
      `Isolated footings ${FOOT} × ${FOOT} m at ${PIT_D} m depth — confirm by soil test / structural design.`,
      `Openings from rooms: ${WIN} windows ${WW} × ${WH} m, ${FD} room doors, ${TD} toilet doors, ${MD} main door(s), ${BD} balcony door(s)${SH ? `, ${SH} shutters` : ""}, ${VEN} ventilators.`,
      NS > 0 ? `${NS} staircase flight set(s)${terrace ? " including terrace access" : ""}.` : "No staircase.",
      "Steel by kg per m³ of concrete (footing 80, column 180, plinth beam 120, beam 150, slab 90, stair 90) + 5%.",
      "Composite market rates (material + labour) for private work in a tier-2 city, 2026 — edit any rate to match your city, contractor or SOR.",
      "Excludes land, approvals, interiors, fixtures, compound wall, borewell, water tank, septic tank, GST if extra.",
    ],
  };
}

/** Cement bags in 1 m³ of a given material — exposed for UI notes. */
export const CEMENT_BAG_VOLUME = CEMENT_BAG_M3;
