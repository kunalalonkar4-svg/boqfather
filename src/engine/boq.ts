/**
 * Room-based item-wise BOQ (no drawing needed).
 * Rooms → assumed RCC frame layout → measurement book rows (Nos × L × B × H) → abstract of cost.
 * Mirrors the founder's estimate format: sections A–I, sub-totals, 5% contingency, grand total.
 */
import { CEMENT_BAG_M3, CFT_PER_M3, round, SQFT_PER_M2 } from "./units";
import { BbsResult, calcBbs } from "./bbs";
import { BoqQuality, QUALITY_RATE_OVERRIDES, SPEC_SHEET } from "./specs";
import {
  isWidePlot,
  layoutFloor,
  requiredDepth,
  requiredWidth,
  SketchRect,
} from "./plot";

export type RoomType =
  | "hall"
  | "dining"
  | "kitchen"
  | "bedroom"
  | "toilet"
  | "passage"
  | "balcony"
  | "pooja"
  | "store"
  | "study"
  | "utility"
  | "parking"
  | "shop";

export type DoorKind =
  "main" | "balcony" | "flush" | "pvc" | "shutter" | "none";

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

/** Minimum room sizes for residential buildings (NBC 2016, Part 3) — area m², narrowest side m. */
export const NBC_MIN: Partial<
  Record<RoomType, { area?: number; width?: number }>
> = {
  hall: { area: 9.5, width: 2.4 },
  bedroom: { area: 7.5, width: 2.4 },
  study: { area: 7.5, width: 2.4 },
  kitchen: { area: 5.0, width: 1.8 },
  toilet: { area: 2.8, width: 1.2 },
  passage: { width: 1.0 },
  balcony: { width: 0.9 },
};

/** Default clear sizes in metres (L × B) — kept for older callers. */
export const ROOM_SIZES = Object.fromEntries(
  ROOM_TYPES.map((t) => [t, [ROOM_DEFS[t].L, ROOM_DEFS[t].B]]),
) as Record<RoomType, [number, number]>;

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
  exc: 280,
  pcc: 4800,
  back: 150,
  termite: 60,
  murum: 900,
  rcc: 6500,
  steel: 72,
  sh_col: 320,
  sh_beam: 320,
  sh_slab: 280,
  sh_foot: 280,
  brick: 6200,
  lintel: 16000,
  pl_int: 300,
  pl_ext: 380,
  pl_ceil: 320,
  pl_para: 380,
  vit: 1300,
  skirt: 130,
  anti: 950,
  wtile: 950,
  toi_wp: 500,
  ter_wp: 420,
  granite: 4000,
  mdoor: 25000,
  bdoor: 12000,
  fdoor: 11000,
  pvc: 3800,
  alwin: 4800,
  vent: 1500,
  ewc: 8500,
  iwc: 4500,
  basin: 3000,
  shower: 3500,
  taps: 2000,
  fdrain: 500,
  sink: 4000,
  cpvc: 280,
  swr110: 900,
  swr75: 600,
  riser: 12000,
  elec: 800,
  p_int: 220,
  p_ext: 200,
  st_tile: 1600,
  st_soffit: 550,
  rail: 2500,
  shutter: 3200,
  aac: 5600,
  ff_ceiling: 1200,
  gate: 3500,
  septic: 45000,
  oht: 12000,
  sump: 14000,
  bore: 150,
  pump: 28000,
  elev: 1800,
  rwh: 25000,
  conn: 20000,
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
  /** Materials consumed by this item. */
  mat: Partial<Record<MatKey, number>>;
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
  /** Outline length ÷ width (default 1.25; from the plot when given). */
  aspect?: number;
  /** Finish level (default standard). */
  quality?: BoqQuality;
  /** Wall material (default brick 230 / 115 mm; AAC 200 / 100 mm). */
  wall?: "brick" | "aac";
  /** Steel from bar bending schedule (default) or thumb rule kg/m³. */
  steelFrom?: "bbs" | "thumb";
  /** Buildable area of the plot (m²) — warns when a floor is bigger. */
  buildableM2?: number;
  /** Buildable width of the plot (m): the house uses the full width; depth comes from the plan. */
  widthM?: number;
  /** Buildable depth of the plot (m): on shallow wide plots the house takes the full depth and rooms run along the road. */
  depthM?: number;
  /** Direction the road side faces (for the north arrow). */
  facing?: "N" | "E" | "S" | "W";
}

/** Optional external works and services. Lengths in metres. */
export interface BoqExtras {
  boundary?: { length: number; height: number };
  gate?: { width: number; height: number };
  septic?: { users: number };
  oht?: { litres: number };
  sump?: { litres: number };
  borewell?: { depthFt: number; pump: boolean };
  elevation?: boolean;
  falseCeiling?: boolean;
  rwh?: boolean;
  connections?: boolean;
}

export type MatKey =
  "cement" | "steel" | "sand" | "aggregate" | "bricks" | "blocks" | "tiles";

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
  /** A full rate set (e.g. imported SOR / DSR rates) by rate key — used as is, without location factor. */
  rateSet?: Partial<Record<RateKey, number>>;
  extras?: BoqExtras;
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

const row = (
  desc: string,
  n: number,
  L?: number,
  B?: number,
  H?: number,
  rem?: string,
): MbRow => {
  let q = n;
  for (const d of [L, B, H]) if (d !== undefined) q *= d;
  return { desc, n, L, B, H, q, rem };
};
const qRow = (desc: string, q: number, rem?: string): MbRow => ({
  desc,
  n: 1,
  L: round(q, 3),
  q,
  rem,
});

export const roomName = (t: RoomType, lang: "en" | "hi" = "en") =>
  ROOM_DEFS[t].name[lang];

/** Typical room list for one floor from a simple plan. */
export function planRooms(
  plan: FloorPlan,
  sizes: Partial<Record<RoomType, [number, number]>> = {},
  isGround = true,
): RoomSpec[] {
  const size = (t: RoomType): [number, number] => sizes[t] ?? ROOM_SIZES[t];
  const list: RoomSpec[] = [
    { type: "hall", L: size("hall")[0], B: size("hall")[1] },
  ];
  if (plan.dining)
    list.push({ type: "dining", L: size("dining")[0], B: size("dining")[1] });
  if (plan.kitchen)
    list.push({
      type: "kitchen",
      L: size("kitchen")[0],
      B: size("kitchen")[1],
    });
  for (let i = 0; i < plan.bedrooms; i++) {
    const [l, b] = size("bedroom");
    list.push({
      type: "bedroom",
      L: i === 0 && !sizes.bedroom ? round(l + 0.3, 2) : l,
      B: b,
    });
  }
  list.push({
    type: "passage",
    L:
      sizes.passage?.[0] ??
      Math.max(3, round(1.2 * (plan.bedrooms + plan.toilets), 2)),
    B: size("passage")[1],
  });
  for (let i = 0; i < plan.toilets; i++)
    list.push({
      type: "toilet",
      L: size("toilet")[0],
      B: size("toilet")[1],
      wc:
        isGround && plan.toilets > 1 && i === plan.toilets - 1 ? "iwc" : "ewc",
    });
  for (let i = 0; i < plan.balconies; i++)
    list.push({
      type: "balcony",
      L: size("balcony")[0],
      B: size("balcony")[1],
    });
  return list;
}

/** Room list for every floor (older simple input). */
export function buildRooms(
  floors: number,
  plan: FloorPlan,
  sizes: Partial<Record<RoomType, [number, number]>> = {},
): Room[] {
  return toRooms(
    Array.from({ length: floors }, (_, f) => planRooms(plan, sizes, f === 0)),
  );
}

function toRooms(floorRooms: RoomSpec[][]): Room[] {
  const counts: Record<string, number> = {};
  const rooms: Room[] = [];
  // One main entrance for the house: the first ground-floor hall (or passage if there is no hall).
  const gf = floorRooms[0] ?? [];
  const mainIdx =
    gf.findIndex((r) => r.type === "hall") >= 0
      ? gf.findIndex((r) => r.type === "hall")
      : gf.findIndex((r) => r.type === "passage");
  floorRooms.forEach((list, f) => {
    const firstHall = list.findIndex((r) => r.type === "hall");
    list.forEach((r, i) => {
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
        // other halls: entry door from the stair lobby on upper floors (first hall only), otherwise open to the house
        door:
          f === 0 && i === mainIdx
            ? "main"
            : r.type === "hall"
              ? f > 0 && i === firstHall
                ? "flush"
                : "none"
              : def.door,
        doorWidth: def.doorW,
        windows: Math.max(0, Math.round(r.windows ?? def.windows)),
        vents: def.vents,
        wc: r.type === "toilet" ? (r.wc ?? "ewc") : undefined,
      });
    });
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
  /** Building cost per sqft of built-up (external works excluded). */
  perSqft: number;
  /** External works incl. their 5% contingency share (0 when none). */
  externalTotal: number;
  materials: { key: string; unit: string; qty: number; basis: string }[];
  thumb: {
    key: string;
    unit: string;
    perSqft: number;
    thumbQty: number;
    qty: number;
    diffPct: number;
  }[];
  assumptions: string[];
  quality: BoqQuality;
  facing?: "N" | "E" | "S" | "W";
  wall: "brick" | "aac";
  bbs: BbsResult;
  /** Steel by thumb rule, for comparison with the BBS (kg, structure only). */
  steelThumbKg: number;
  specSheet: {
    key: string;
    item: { en: string; hi: string };
    spec: { en: string; hi: string };
  }[];
  sketch: { floor: number; L: number; B: number; rects: SketchRect[] }[];
  /** Plot and building-code checks (English / Hindi). */
  warnings: { en: string; hi: string }[];
}

export function floorLabel(f: number, total: number) {
  return f === 0 ? "GF" : total > 2 ? `F${f}` : "FF";
}

export function calcBoq(input: BoqInput): BoqResult {
  const floorRooms: RoomSpec[][] = input.floorRooms?.length
    ? input.floorRooms
    : Array.from(
        { length: Math.max(1, Math.round(input.floors ?? 1)) },
        (_, f) =>
          planRooms(
            input.plan ?? {
              bedrooms: 2,
              toilets: 2,
              kitchen: true,
              dining: true,
              balconies: 0,
            },
            input.roomSizes,
            f === 0,
          ),
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
    WE = spec.wall === "aac" ? 0.2 : 0.23,
    WI = spec.wall === "aac" ? 0.1 : 0.115;
  const AAC = spec.wall === "aac";
  const WALLK: RateKey = AAC ? "aac" : "brick";
  const quality: BoqQuality = spec.quality ?? "standard";
  const ASPECT = Math.min(2.5, Math.max(0.5, spec.aspect ?? 1.25));
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

  // ---------------- house width on a plot: as wide as the rooms need (same on every floor so columns stack),
  // the full plot width only when the plan would otherwise be deeper than the plot
  const layoutRooms = (f: number) =>
    onFloor(f).map((r) => ({
      key: r.code,
      type: r.type,
      area: r.area,
      L: r.L,
      B: r.B,
      windows: r.windows,
      vents: r.vents,
    }));
  let houseW: number | undefined = spec.widthM;
  if (spec.widthM) {
    const aMax = Math.max(
      ...FL.map(
        (f) => (onFloor(f).reduce((t, r) => t + r.area, 0) + STAIR_FP) / 0.83,
      ),
    );
    const wT = Math.min(spec.widthM, Math.max(6.5, Math.sqrt(aMax * 0.75)));
    const fitsAt = (w: number) =>
      FL.every(
        (f) =>
          !spec.depthM ||
          requiredDepth(
            w,
            layoutRooms(f),
            f < F - 1 || terrace ? STAIR_FP : 0,
            f === 0,
            WE,
          ) <=
            spec.depthM + 0.05,
      );
    // narrowest width (from a compact start) at which every floor fits the plot depth; the rest of the width stays open as a side garden.
    // If no width fits, keep the compact width (well-proportioned rooms) and let the plot warning speak.
    houseW = round(wT, 2);
    for (let w = wT; w <= spec.widthM + 1e-6; w += 0.3)
      if (fitsAt(Math.min(w, spec.widthM))) {
        houseW = round(Math.min(w, spec.widthM), 2);
        break;
      }
  }

  // one structural system for the whole house: rooms along the road (wide plot) only when every floor fits that way
  const wideAll = !!(
    spec.widthM &&
    spec.depthM &&
    isWidePlot(spec.widthM, spec.depthM) &&
    FL.every(
      (f) =>
        requiredWidth(
          spec.depthM!,
          layoutRooms(f),
          f < F - 1 || terrace ? STAIR_FP : 0,
          f === 0,
          WE,
        ) <=
        spec.widthM! + 0.3,
    )
  );

  // ---------------- per-floor geometry (each floor sized from its own rooms)
  const geo = FL.map((f) => {
    const rs = onFloor(f);
    const carpet = rs.reduce((a, r) => a + r.area, 0);
    const hasStair = f < F - 1 || terrace;
    const A = (carpet + (hasStair ? STAIR_FP : 0)) / 0.83;
    // width from the area and plot shape; depth from the planned layout (rooms keep their sizes, plus passage / porch / stair)
    // rooms along the road only when the plot is shallow and wide AND the house really fits its width
    const lr = rs.map((r) => ({
      key: r.code,
      type: r.type,
      area: r.area,
      L: r.L,
      B: r.B,
      windows: r.windows,
      vents: r.vents,
    }));
    const wide = wideAll;
    const B = houseW
      ? round(wide ? spec.widthM! : houseW, 2)
      : round(A / Math.sqrt(A * ASPECT), 2);
    const need = requiredDepth(
      B,
      rs.map((r) => ({
        key: r.code,
        type: r.type,
        area: r.area,
        L: r.L,
        B: r.B,
        windows: r.windows,
        vents: r.vents,
      })),
      hasStair ? STAIR_FP : 0,
      f === 0,
      WE,
    );
    const L = round(
      wide ? spec.depthM! : spec.widthM ? need : Math.max(A / B, need),
      2,
    );
    const LC = L - COL,
      BC = B - COL;
    const NBL = Math.max(1, Math.ceil(LC / 4.2)),
      NBB = Math.max(1, Math.ceil(BC / 4.2));
    const CLL = round(LC / NBL - COL, 3),
      CLB = round(BC / NBB - COL, 3);
    const NCOL = (NBL + 1) * (NBB + 1);
    const innerPer = 2 * (L - 2 * WE + (B - 2 * WE));
    const outerPer = 2 * (L + B);
    const part = round(
      Math.max(0, (rs.reduce((a, r) => a + r.per, 0) - innerPer) / 2),
      2,
    );
    const cnt = (fn: (r: Room) => number) => rs.reduce((a, r) => a + fn(r), 0);
    return {
      f,
      rs,
      carpet,
      hasStair,
      wide,
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
      GA: Array.from({ length: NBB + 1 }, (_, i) =>
        String.fromCharCode(65 + i),
      ),
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
  const tot = (k: "win" | "ven" | "md" | "bd" | "fd" | "td" | "sh") =>
    geo.reduce((a, g) => a + g[k], 0);
  const WIN = tot("win"),
    VEN = tot("ven"),
    MD = tot("md"),
    BALD = tot("bd"),
    FD = tot("fd"),
    TD = tot("td"),
    SH = tot("sh");
  const avgFdW = FD ? round(geo.reduce((a, g) => a + g.fdW, 0) / FD, 2) : 0.9;

  // ---------------- rates: imported set → quality preset → market, × location (not for imported)
  const baseRate = (k: RateKey) => {
    const imp = input.rateSet?.[k];
    if (imp !== undefined && Number.isFinite(imp)) return imp;
    return Math.round(
      (QUALITY_RATE_OVERRIDES[quality][k] ?? BOQ_RATES[k]) * factor,
    );
  };

  // ---------------- items
  const sections: BoqSection[] = [];
  const sec = (code: string, en: string, hi: string) =>
    sections.push({ code, title: { en, hi }, items: [], subtotal: 0 });
  const item = (
    desc: string,
    unit: string,
    rateKey: RateKey,
    basis: string,
    rows: MbRow[],
    dec = 3,
  ): BoqItem => {
    const s = sections.at(-1)!;
    const code = `${s.code}${s.items.length + 1}`;
    const qty = round(
      rows.reduce((a, r) => a + r.q, 0),
      dec,
    );
    const rate = overrides[code] ?? baseRate(rateKey);
    const it: BoqItem = {
      code,
      desc,
      unit,
      rateKey,
      rate,
      basis,
      rows,
      qty,
      dec,
      amount: Math.round(qty * rate),
      mat: {},
    };
    s.items.push(it);
    return it;
  };
  /** Opening deductions for one floor, as MB rows. */
  const openRows = (
    g: (typeof geo)[number],
    t: number,
    mode: "ext" | "int" | "plInt" | "plExt",
  ) => {
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
      r(
        `Room doors ${avgFdW} × 2.1${k === 2 ? " (both faces)" : ""}`,
        g.fd * k,
        avgFdW,
        2.1,
      );
      r(
        `Toilet doors 0.75 × 2.1${k === 2 ? " (both faces)" : ""}`,
        g.td * k,
        0.75,
        2.1,
      );
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
  const pccf = item(
    "PCC 1:4:8 below footings, 100 mm",
    "m³",
    "pcc",
    `${round(PCC_W, 2)} m square × 0.10 m.`,
    [row("Below footings", NCOL, PCC_W, PCC_W, 0.1)],
  );
  const foot = item(
    `RCC M20 isolated footings ${FOOT} × ${FOOT} m, ${FOOT_D * 1000} mm (avg)`,
    "m³",
    "rcc",
    "Typical footing; confirm by soil test and structural design.",
    [row(`Footings F1–F${NCOL}`, NCOL, FOOT, FOOT, FOOT_D)],
  );
  item(
    "Backfilling pits with excavated soil, rammed",
    "m³",
    "back",
    "Excavation less PCC, footing and column below GL.",
    [
      qRow("Excavation (A1)", exc.qty),
      qRow("(−) PCC (A2)", -pccf.qty),
      qRow("(−) Footings (A3)", -foot.qty),
      row("(−) Column below GL", -NCOL, COL, COL, round(PIT_D - FOOT_D, 2)),
    ],
  );
  const pbRows = [
    ...base.GA.map((x) =>
      row(
        `Grid ${x} (along length), ${base.NBL} spans`,
        base.NBL,
        base.CLL,
        BW,
        0.3,
      ),
    ),
    ...base.GN.map((x) =>
      row(
        `Grid ${x} (along width), ${base.NBB} spans`,
        base.NBB,
        base.CLB,
        BW,
        0.3,
      ),
    ),
  ];
  const pbeam = item(
    "RCC M20 plinth beam 230 × 300 mm",
    "m³",
    "rcc",
    "Clear span between columns × 0.23 × 0.30 m.",
    pbRows,
  );
  item(
    "Anti-termite treatment on plinth area",
    "m²",
    "termite",
    "Outer L × B of the ground floor.",
    [row("Plinth area", 1, g0.L, g0.B)],
    2,
  );
  item(
    `Plinth filling with murum / sand, 300 mm`,
    "m³",
    "murum",
    "Net ground floor area (rooms + stair) × 0.30 m.",
    [row("Net GF area", 1, round(g0.net, 2), undefined, 0.3)],
  );
  const pccfl = item(
    "PCC 1:4:8 base for ground floor, 75 mm",
    "m³",
    "pcc",
    "Net ground floor area × 0.075 m.",
    [row("Net GF area", 1, round(g0.net, 2), undefined, 0.075)],
  );

  sec("B", "RCC structure – M20 / Fe500D", "RCC ढांचा – M20 / Fe500D");
  const colH = round(PIT_D - FOOT_D + PLINTH, 2);
  const col = item(
    "RCC M20 columns 300 × 300 mm",
    "m³",
    "rcc",
    `Below plinth ${colH} m; each floor clear height ${FH} − ${BD} = ${WALL_H} m.`,
    [
      row("Footing top to plinth", NCOL, COL, COL, colH),
      ...geo.map((g) => row(`${flr(g.f)} columns`, g.NCOL, COL, COL, WALL_H)),
    ],
  );
  const bmRows = geo.flatMap((g) => [
    row(
      `${flr(g.f)} beams along length (${g.GA.length} grids × ${g.NBL} spans)`,
      g.GA.length * g.NBL,
      g.CLL,
      BW,
      BD - SLAB,
    ),
    row(
      `${flr(g.f)} beams along width (${g.GN.length} grids × ${g.NBB} spans)`,
      g.GN.length * g.NBB,
      g.CLB,
      BW,
      BD - SLAB,
    ),
  ]);
  const beam = item(
    "RCC M20 beams 230 × 400 mm (275 mm below slab)",
    "m³",
    "rcc",
    "Clear span × 0.23 × 0.275 m; slab portion counted in slab.",
    bmRows,
  );
  const slab = item(
    "RCC M20 slab 125 mm",
    "m³",
    "rcc",
    "Each floor's outline L × B × 0.125 m.",
    geo.map((g) => row(`Roof slab over ${flr(g.f)}`, 1, g.L, g.B, SLAB)),
  );
  const KG = { foot: 80, col: 180, pbeam: 120, beam: 150, slab: 90, stair: 90 };
  const stRows = [
    row(
      "Footings: m³ × 80 kg/m³",
      1,
      foot.qty,
      KG.foot,
      undefined,
      "m³ × kg/m³",
    ),
    row("Columns: m³ × 180 kg/m³", 1, col.qty, KG.col),
    row("Plinth beams: m³ × 120 kg/m³", 1, pbeam.qty, KG.pbeam),
    row("Beams: m³ × 150 kg/m³", 1, beam.qty, KG.beam),
    row("Slabs: m³ × 90 kg/m³", 1, slab.qty, KG.slab),
  ];
  stRows.push(
    qRow(
      "Add 5% laps / wastage",
      round(stRows.reduce((a, r) => a + r.q, 0) * 0.05, 1),
    ),
  );
  const steelThumbKg = round(
    stRows.reduce((a, r) => a + r.q, 0),
    1,
  );
  const bbs = calcBbs({
    floors: F,
    footing: { n: NCOL, size: FOOT, depth: FOOT_D },
    column: {
      n: NCOL,
      belowPlinth: round(colH + FOOT_D, 3),
      perFloor: geo.map((g) => ({ n: g.NCOL, h: FH })),
      floorH: FH,
    },
    plinth: {
      lines: [...base.GA.map(() => base.L), ...base.GN.map(() => base.B)],
      spans: [
        ...base.GA.flatMap(() => Array(base.NBL).fill(base.CLL)),
        ...base.GN.flatMap(() => Array(base.NBB).fill(base.CLB)),
      ],
    },
    beams: geo.map((g) => ({
      floor: flr(g.f),
      lines: [...g.GA.map(() => g.L), ...g.GN.map(() => g.B)],
      spans: [
        ...g.GA.flatMap(() => Array(g.NBL).fill(g.CLL)),
        ...g.GN.flatMap(() => Array(g.NBB).fill(g.CLB)),
      ],
    })),
    slabs: geo.map((g) => ({ floor: flr(g.f), L: g.L, B: g.B })),
  });
  const useBbs = (spec.steelFrom ?? "bbs") === "bbs";
  const steel = useBbs
    ? item(
        "Reinforcement steel Fe500D (cut, bent, tied)",
        "kg",
        "steel",
        "From the bar bending schedule (BBS tab / sheet): footings, columns, plinth beams, beams, slabs + 3% wastage.",
        [
          ...bbs.byMember.map((m) => row(`${m.member} (BBS)`, 1, m.kg)),
          qRow("Add 3% cutting wastage", bbs.wastage),
        ],
        1,
      )
    : item(
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
  item(
    "Shuttering – footing sides",
    "m²",
    "sh_foot",
    "4 sides × size × depth.",
    [row("Footing sides", NCOL * 4, FOOT, undefined, FOOT_D)],
    2,
  );
  item(
    "Shuttering – columns",
    "m²",
    "sh_col",
    "Perimeter 1.20 m × height.",
    [
      row("Footing to plinth", NCOL, 1.2, undefined, colH),
      ...geo.map((g) =>
        row(`${flr(g.f)} columns`, g.NCOL, 1.2, undefined, WALL_H),
      ),
    ],
    2,
  );
  item(
    "Shuttering – plinth beams and beams",
    "m²",
    "sh_beam",
    "Plinth beam 2 sides × 0.30; beams girth 0.78 m.",
    [
      row("Plinth beam sides", 2, pbLen, undefined, 0.3),
      row("Beams girth 0.78 m", 1, beamLen, 0.78),
    ],
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
      ...geo.map((g) =>
        row(`${flr(g.f)} slab edges`, 1, round(g.outerPer, 2), undefined, SLAB),
      ),
    ],
    2,
  );

  sec(
    "C",
    AAC
      ? "AAC block masonry, parapet and lintels"
      : "Brickwork, parapet and lintels",
    AAC
      ? "AAC ब्लॉक चिनाई, पैरापेट और लिंटल"
      : "ईंट की चिनाई, पैरापेट और लिंटल",
  );
  const bwE = item(
    AAC
      ? "AAC block masonry 200 mm outer walls, thin-bed adhesive"
      : "Brickwork 230 mm outer walls, CM 1:6",
    "m³",
    WALLK,
    `Between columns × ${WE} × ${WALL_H} m; openings deducted.`,
    geo.flatMap((g) => [
      row(
        `${flr(g.f)} long sides, ${g.NBL} spans × 2`,
        g.NBL * 2,
        g.CLL,
        WE,
        WALL_H,
      ),
      row(
        `${flr(g.f)} short sides, ${g.NBB} spans × 2`,
        g.NBB * 2,
        g.CLB,
        WE,
        WALL_H,
      ),
      ...openRows(g, WE, "ext"),
    ]),
    2,
  );
  const bwI = item(
    AAC
      ? "AAC block masonry 100 mm partitions, thin-bed adhesive"
      : "Brickwork 115 mm partitions, CM 1:6",
    "m³",
    WALLK,
    `Partition length per floor from room perimeters × ${WI} × ${WALL_H} m.`,
    geo.flatMap((g) => [
      row(`${flr(g.f)} partitions ${g.part} m`, 1, g.part, WI, WALL_H),
      ...openRows(g, WI, "int"),
    ]),
    2,
  );
  // parapet on the top roof, and on any lower roof left open by a smaller floor above
  const paraRows = geo.flatMap((g) => {
    const up = geo[g.f + 1];
    if (!up)
      return [row(`Parapet over ${flr(g.f)}`, 1, round(g.paraCl, 2), WE, 0.9)];
    if (g.A > up.A * 1.05)
      return [
        row(
          `Open terrace over ${flr(g.f)}`,
          1,
          round(g.B + 2 * Math.max(0, g.L - up.L), 2),
          WE,
          0.9,
        ),
      ];
    return [];
  });
  const paraLen = paraRows.reduce((a, r) => a + (r.L ?? 0), 0);
  const para = item(
    `Parapet ${WE * 1000} mm × 0.90 m, ${AAC ? "AAC blocks" : "brick in CM 1:6"}`,
    "m³",
    WALLK,
    `Centre-line length × ${WE} × 0.90.`,
    paraRows,
    2,
  );
  const lintel = item(
    "RCC lintels incl. steel and shuttering",
    "m³",
    "lintel",
    "Opening + 0.30 m × wall thickness × 0.15 m.",
    [
      ...(WIN
        ? [row("Windows (outer wall)", WIN, round(WW + 0.3, 2), WE, 0.15)]
        : []),
      ...(MD + BALD
        ? [row("Main / balcony doors (outer wall)", MD + BALD, 1.3, WE, 0.15)]
        : []),
      ...(SH ? [row("Shutters (outer wall)", SH, 2.7, WE, 0.15)] : []),
      ...(geo.some((g) => g.pk)
        ? [
            row(
              "Parking opening beam (outer wall)",
              geo.reduce((a, g) => a + g.pk, 0),
              3.3,
              WE,
              0.15,
            ),
          ]
        : []),
      ...(VEN ? [row("Ventilators (outer wall)", VEN, 0.9, WE, 0.15)] : []),
      ...(FD
        ? [row("Room doors (partition)", FD, round(avgFdW + 0.3, 2), WI, 0.15)]
        : []),
      ...(TD ? [row("Toilet doors (partition)", TD, 1.05, WI, 0.15)] : []),
    ],
  );

  sec("D", "Plastering", "प्लास्टर");
  const plRooms = rooms.filter((r) => ROOM_DEFS[r.type].plaster);
  const plI = item(
    "Internal plaster 12 mm, CM 1:5",
    "m²",
    "pl_int",
    `Room perimeter 2(L+B) × ${PL_H} m, less openings (doors in partitions on both faces).`,
    [
      ...plRooms.map((r) =>
        row(
          `${flr(r.floor)} ${r.code} ${roomName(r.type)} 2(${round(r.L, 2)}+${round(r.B, 2)})`,
          1,
          round(r.per, 2),
          PL_H,
        ),
      ),
      ...geo.flatMap((g) => openRows(g, 0, "plInt")),
    ],
    1,
  );
  const plE = item(
    "External plaster 20 mm, CM 1:4",
    "m²",
    "pl_ext",
    `Outer perimeter × storey height, less openings.`,
    geo.flatMap((g) => [
      row(
        `${flr(g.f)} outer faces`,
        1,
        round(g.outerPer, 2),
        g.f === 0 ? round(FH + PLINTH, 2) : FH,
      ),
      ...openRows(g, 0, "plExt"),
    ]),
    1,
  );
  const plC = item(
    "Ceiling plaster 12 mm, CM 1:5",
    "m²",
    "pl_ceil",
    "Slab soffit of every room = L × B.",
    rooms
      .filter((r) => ROOM_DEFS[r.type].ceiling)
      .map((r) =>
        row(
          `${flr(r.floor)} ${r.code} ${roomName(r.type)}`,
          1,
          round(r.L, 2),
          round(r.B, 2),
        ),
      ),
    1,
  );
  const plP = item(
    "Parapet plaster both faces + coping, CM 1:4",
    "m²",
    "pl_para",
    "Outer + inner face × 0.90 m + coping 0.23 m.",
    [
      row("Outer face", 1, round(paraLen + 4 * WE, 2), 0.9),
      row("Inner face", 1, round(Math.max(0, paraLen - 4 * WE), 2), 0.9),
      row("Coping", 1, round(paraLen, 2), WE),
    ],
    1,
  );

  sec(
    "E",
    "Flooring, tiles and waterproofing",
    "फ़र्श, टाइल्स और वॉटरप्रूफिंग",
  );
  const vitRooms = rooms.filter((r) => ROOM_DEFS[r.type].floor === "vit");
  const antiRooms = rooms.filter((r) => ROOM_DEFS[r.type].floor === "anti");
  const vit = item(
    "Vitrified tiles 600 × 600 in CM bedding",
    "m²",
    "vit",
    "Room floor = clear L × B.",
    vitRooms.map((r) =>
      row(
        `${flr(r.floor)} ${r.code} ${roomName(r.type)}`,
        1,
        round(r.L, 2),
        round(r.B, 2),
      ),
    ),
    1,
  );
  item(
    "Tile skirting 100 mm",
    "rm",
    "skirt",
    "Room perimeter less door / opening width.",
    rooms
      .filter((r) => ROOM_DEFS[r.type].skirting)
      .map((r) =>
        row(
          `${flr(r.floor)} ${r.code} 2(L+B) − ${r.doorWidth}`,
          1,
          round(Math.max(0, r.per - r.doorWidth), 2),
        ),
      ),
    1,
  );
  const anti = item(
    "Anti-skid floor tiles – toilets, wash, parking",
    "m²",
    "anti",
    "Room L × B.",
    antiRooms.map((r) =>
      row(
        `${flr(r.floor)} ${r.code} ${roomName(r.type)}`,
        1,
        round(r.L, 2),
        round(r.B, 2),
      ),
    ),
    1,
  );
  const wt = item(
    "Wall tiles – toilets 2.10 m, kitchen dado 0.60 m",
    "m²",
    "wtile",
    "(Perimeter − door) × 2.10; kitchen platform length × 0.60.",
    [
      ...toilets.map((r) =>
        row(
          `${flr(r.floor)} ${r.code} (${round(r.per, 2)} − 0.75) × 2.10`,
          1,
          round(r.per - 0.75, 2),
          2.1,
        ),
      ),
      ...(NT ? [row("(−) Toilet ventilators", -NT, 0.6, 0.45)] : []),
      ...kitchens.map((r) =>
        row(
          `${flr(r.floor)} ${r.code} dado`,
          1,
          round(Math.min(3.0, r.L), 2),
          0.6,
        ),
      ),
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
        ...toilets.map((r) =>
          row(
            `${flr(r.floor)} ${r.code} floor`,
            1,
            round(r.L, 2),
            round(r.B, 2),
          ),
        ),
        ...toilets.map((r) =>
          row(
            `${flr(r.floor)} ${r.code} turn-up`,
            1,
            round(r.per - 0.75, 2),
            0.3,
          ),
        ),
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
      if (!up)
        return [
          row(
            `Terrace over ${flr(g.f)}`,
            1,
            round(g.L - 2 * WE, 2),
            round(g.B - 2 * WE, 2),
          ),
        ];
      if (g.A > up.A * 1.05)
        return [
          qRow(
            `Open roof over ${flr(g.f)} (${round(g.A, 1)} − ${round(up.A, 1)})`,
            round(g.A - up.A, 2),
          ),
        ];
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
      kitchens.map((r) =>
        row(`${flr(r.floor)} ${r.code}`, 1, round(Math.min(3.0, r.L), 2)),
      ),
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
  if (BALD)
    item(
      "Balcony door 1.0 × 2.1 m, UPVC / aluminium with glass",
      "nos",
      "bdoor",
      "One per balcony.",
      geo
        .filter((g) => g.bd)
        .map((g) => row(`${flr(g.f)} balcony doors`, g.bd)),
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
  if (SH)
    item(
      `Rolling shutter 2.4 × ${SH_H} m with lock`,
      "m²",
      "shutter",
      "One per shop.",
      [row("Shutters", SH, 2.4, SH_H)],
      1,
    );
  if (WIN)
    item(
      "Aluminium sliding windows with glass",
      "m²",
      "alwin",
      `${WW} × ${WH} m each.`,
      geo
        .filter((g) => g.win)
        .map((g) => row(`${flr(g.f)} windows`, g.win, WW, WH)),
      1,
    );
  if (VEN)
    item(
      "Aluminium ventilator 0.6 × 0.45 m",
      "nos",
      "vent",
      "Toilets, store, wash.",
      geo
        .filter((g) => g.ven)
        .map((g) => row(`${flr(g.f)} ventilators`, g.ven)),
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
    item(
      "Indian WC with cistern and fittings",
      "nos",
      "iwc",
      "Toilets set to Indian WC.",
      [row(iwc.map((r) => `${flr(r.floor)} ${r.code}`).join(", "), iwc.length)],
      0,
    );
  if (NT) {
    item(
      "Wash basin with tap and waste",
      "nos",
      "basin",
      "One per toilet.",
      [row("Wash basins", NT)],
      0,
    );
    item(
      "Shower with mixer / overhead",
      "nos",
      "shower",
      "One per toilet.",
      [row("Showers", NT)],
      0,
    );
  }
  if (NT + UT)
    item(
      "Taps – bib cock + health faucet (set)",
      "set",
      "taps",
      "One set per toilet and wash area.",
      [row("Toilets", NT), ...(UT ? [row("Wash / utility", UT)] : [])],
      0,
    );
  if (NT + KIT + UT)
    item(
      "Floor drain / trap with jali",
      "nos",
      "fdrain",
      "Toilets, kitchens, wash areas.",
      [
        row("Toilets", NT),
        row("Kitchens", KIT),
        ...(UT ? [row("Wash / utility", UT)] : []),
      ],
      0,
    );
  if (KIT)
    item(
      "Kitchen sink (SS) with tap",
      "nos",
      "sink",
      "One per kitchen.",
      [row("Kitchens", KIT)],
      0,
    );
  if (NT + KIT + UT) {
    item(
      "CPVC 20 mm supply pipe, concealed",
      "rm",
      "cpvc",
      "12 m per toilet, 8 m per kitchen, 6 m per wash area.",
      [
        row("Toilets", NT, 12),
        row("Kitchens", KIT, 8),
        ...(UT ? [row("Wash / utility", UT, 6)] : []),
      ],
      1,
    );
    item(
      "SWR 110 mm drain pipe with fittings",
      "rm",
      "swr110",
      "6 m per toilet + stack per floor.",
      [row("Toilets", NT, 6), row("Main stack", 1, round(FH * F + 2, 2))],
      1,
    );
    item(
      "SWR 75 / 40 mm waste pipe with fittings",
      "rm",
      "swr75",
      "6 m per toilet, 4 m per kitchen and wash area.",
      [
        row("Toilets", NT, 6),
        row("Kitchens", KIT, 4),
        ...(UT ? [row("Wash / utility", UT, 4)] : []),
      ],
      1,
    );
    item(
      "Main riser + drain stack to ground, chamber connection",
      "LS",
      "riser",
      "Lump sum.",
      [row("Lump sum", 1)],
      0,
    );
  }

  let stc: BoqItem | undefined,
    sts: BoqItem | undefined,
    stt: BoqItem | undefined;
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
        row(
          "Steps (triangular)",
          2 * nr * NS,
          tread,
          sw,
          round(rise / 2, 3),
          "½ × tread × riser",
        ),
        row("Mid landing", NS, 2.1, sw, waist),
      ],
    );
    sts = item(
      "Staircase steel Fe500D",
      "kg",
      "steel",
      "90 kg per m³ of staircase concrete.",
      [row("Staircase m³ × 90 kg/m³", 1, stc.qty, KG.stair)],
      1,
    );
    item(
      "Staircase shuttering",
      "m²",
      "sh_slab",
      "Waist + landing soffit + risers.",
      [
        row("Waist soffit", 2 * NS, round(incl, 3), sw),
        row("Landing soffit", NS, 2.1, sw),
        row("Risers", 2 * nr * NS, sw, undefined, rise),
      ],
      2,
    );
    stt = item(
      "Stair tread + riser tiles incl. landing",
      "m²",
      "st_tile",
      "Treads, risers, landing.",
      [
        row("Treads", 2 * nr * NS, tread, sw),
        row("Risers", 2 * nr * NS, rise, sw),
        row("Landing", NS, 2.1, sw),
      ],
      2,
    );
    item(
      "Staircase soffit plaster + paint",
      "m²",
      "st_soffit",
      "Waist + landing soffit.",
      [
        row("Waist soffit", 2 * NS, round(incl, 3), sw),
        row("Landing soffit", NS, 2.1, sw),
      ],
      2,
    );
    item(
      "MS railing 1 m with handrail",
      "rm",
      "rail",
      "Both flights + landing return.",
      [row("Railing", NS, round(2 * incl + sw, 2))],
      1,
    );
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
    [
      qRow("Wall plaster (D1)", plI.qty),
      qRow("(−) Tiled area", -wt.qty),
      qRow("Ceilings (D3)", plC.qty),
    ],
    1,
  );
  item(
    "External weather-coat paint, primer + 2 coats",
    "m²",
    "p_ext",
    "External plaster + parapet.",
    [qRow("External plaster (D2)", plE.qty), qRow("Parapet (D4)", plP.qty)],
    1,
  );

  // ---------------- external works and services (optional)
  const ex = input.extras ?? {};
  const anyExtra =
    ex.boundary ||
    ex.gate ||
    ex.septic ||
    ex.oht ||
    ex.sump ||
    ex.borewell ||
    ex.elevation ||
    ex.falseCeiling ||
    ex.rwh ||
    ex.connections;
  if (anyExtra) {
    const next = String.fromCharCode(sections.at(-1)!.code.charCodeAt(0) + 1);
    sec(next, "External works and services", "बाहरी काम और सुविधाएं");
    if (ex.boundary && ex.boundary.length > 0) {
      const Lb = round(ex.boundary.length, 2),
        Hb = round(ex.boundary.height, 2);
      item(
        "Boundary wall – excavation for foundation 0.60 × 0.75 m",
        "m³",
        "exc",
        "Trench along the wall.",
        [row("Boundary wall trench", 1, Lb, 0.6, 0.75)],
        2,
      );
      item(
        "Boundary wall – PCC 1:4:8 bed 0.60 × 0.10 m",
        "m³",
        "pcc",
        "Below brick footing.",
        [row("PCC bed", 1, Lb, 0.6, 0.1)],
        2,
      );
      item(
        `Boundary wall – brickwork in CM 1:6, footing + ${round(Hb, 2)} m wall with piers @3 m`,
        "m³",
        "brick",
        "Footing 2 steps (0.45 / 0.35 m wide) + 230 mm wall; piers 350 × 350 add 10%.",
        [
          row("Footing step 1", 1, Lb, 0.45, 0.3),
          row("Footing step 2 up to GL", 1, Lb, 0.35, 0.35),
          row("Wall above GL", 1, Lb, 0.23, Hb),
          row("Piers (≈10%)", 1, round(Lb * 0.1, 2), 0.23, Hb),
        ],
        2,
      );
      item(
        "Boundary wall – plaster both faces + coping",
        "m²",
        "pl_ext",
        "Two faces × height + coping.",
        [row("Both faces", 2, Lb, Hb), row("Coping", 1, Lb, 0.23)],
        1,
      );
      item(
        "Boundary wall – exterior paint both faces",
        "m²",
        "p_ext",
        "Same as plastered area.",
        [row("Both faces", 2, Lb, Hb), row("Coping", 1, Lb, 0.23)],
        1,
      );
    }
    if (ex.gate && ex.gate.width > 0)
      item(
        "MS main gate with frame, fabricated and painted",
        "m²",
        "gate",
        "Gate width × height.",
        [
          row(
            "Main gate",
            1,
            round(ex.gate.width, 2),
            round(ex.gate.height, 2),
          ),
        ],
        2,
      );
    if (ex.septic && ex.septic.users > 0) {
      const big = ex.septic.users > 10 ? 2 : 1;
      item(
        `Septic tank for ${ex.septic.users} users with soak pit (IS 2470), brick masonry + RCC cover`,
        "nos",
        "septic",
        "Composite unit; size as per IS 2470 for the users.",
        [row(`Septic tank ${ex.septic.users} users`, big)],
        0,
      );
    }
    if (ex.oht && ex.oht.litres > 0)
      item(
        `Overhead PVC water tank ${ex.oht.litres} L with stand, inlet / outlet connections`,
        "per 1000 L",
        "oht",
        "Rate per 1,000 litres.",
        [
          row(
            "Tank capacity (thousand litres)",
            1,
            round(ex.oht.litres / 1000, 2),
          ),
        ],
        2,
      );
    if (ex.sump && ex.sump.litres > 0)
      item(
        `RCC underground sump ${ex.sump.litres} L with cover and waterproofing`,
        "per 1000 L",
        "sump",
        "Rate per 1,000 litres.",
        [
          row(
            "Sump capacity (thousand litres)",
            1,
            round(ex.sump.litres / 1000, 2),
          ),
        ],
        2,
      );
    if (ex.borewell && ex.borewell.depthFt > 0) {
      item(
        'Borewell drilling 6.5" with PVC casing',
        "rft",
        "bore",
        "Rate per running foot of depth.",
        [row("Borewell depth (ft)", 1, ex.borewell.depthFt)],
        0,
      );
      if (ex.borewell.pump)
        item(
          "Submersible pump with cable, panel and pipes",
          "nos",
          "pump",
          "One set.",
          [row("Pump set", 1)],
          0,
        );
    }
    if (ex.elevation) {
      const eh = round(PLINTH + FH * F + 0.9, 2);
      item(
        "Front elevation features (cladding / grooves / ACP)",
        "m²",
        "elev",
        "About 40% of the front face (width × height).",
        [row("Front face × 40%", 1, round(g0.B, 2), eh, 0.4)],
        1,
      );
    }
    if (ex.falseCeiling) {
      const fc = rooms.filter(
        (r) => r.type === "hall" || r.type === "bedroom" || r.type === "dining",
      );
      item(
        "Gypsum false ceiling with cove (hall, dining, bedrooms)",
        "m²",
        "ff_ceiling",
        "Room L × B.",
        fc.map((r) =>
          row(
            `${flr(r.floor)} ${r.code} ${roomName(r.type)}`,
            1,
            round(r.L, 2),
            round(r.B, 2),
          ),
        ),
        1,
      );
    }
    if (ex.rwh)
      item(
        "Rainwater harvesting / recharge pit with filter media",
        "LS",
        "rwh",
        "Lump sum.",
        [row("RWH pit", 1)],
        0,
      );
    if (ex.connections)
      item(
        "Electricity and water connection charges, meter",
        "LS",
        "conn",
        "Lump sum; actual fees vary by local body.",
        [row("Connections", 1)],
        0,
      );
  }

  for (const s of sections)
    s.subtotal = s.items.reduce((a, i) => a + i.amount, 0);
  const itemsTotal = sections.reduce((a, s) => a + s.subtotal, 0);
  const contingency = Math.round(itemsTotal * 0.05);
  const grandTotal = itemsTotal + contingency;
  const externalTotal = anyExtra
    ? Math.round(sections.at(-1)!.subtotal * 1.05)
    : 0;
  const builtUpSqft = geo.reduce((a, g) => a + g.A, 0) * SQFT_PER_M2;
  const carpetSqft = geo.reduce((a, g) => a + g.carpet, 0) * SQFT_PER_M2;

  // ---------------- materials, item by item
  const C = CFT_PER_M3;
  const PL12 = 0.012 * 1.3,
    PL20 = 0.02 * 1.3,
    BED = 0.03;
  for (const sct of sections)
    for (const it of sct.items) {
      const q = it.qty;
      const m: Partial<Record<MatKey, number>> = {};
      switch (it.rateKey) {
        case "rcc":
        case "lintel":
          Object.assign(m, {
            cement: q * 8.06,
            sand: q * 0.42 * C,
            aggregate: q * 0.84 * C,
          });
          break;
        case "pcc":
          Object.assign(m, {
            cement: q * 3.4,
            sand: q * 0.47 * C,
            aggregate: q * 0.94 * C,
          });
          break;
        case "brick":
          Object.assign(m, {
            bricks: q * 500 * 1.03,
            cement: q * 0.26 * 5.7,
            sand: q * 0.26 * 1.05 * C,
          });
          break;
        case "aac":
          Object.assign(m, {
            blocks: (q / (0.6 * 0.2 * 0.2)) * 1.03,
            cement: q * 0.35,
          });
          break;
        case "pl_int":
        case "pl_ceil":
        case "st_soffit":
          Object.assign(m, {
            cement: q * PL12 * 6.8,
            sand: q * PL12 * 1.05 * C,
          });
          break;
        case "pl_ext":
        case "pl_para":
          Object.assign(m, {
            cement: q * PL20 * 8.1,
            sand: q * PL20 * 1.05 * C,
          });
          break;
        case "vit":
        case "anti":
        case "st_tile":
          Object.assign(m, {
            tiles: q * 1.05 * SQFT_PER_M2,
            cement: q * BED * 8.1,
            sand: q * BED * 1.05 * C,
          });
          break;
        case "wtile":
          Object.assign(m, { tiles: q * 1.05 * SQFT_PER_M2 });
          break;
        case "steel":
          m.steel = q;
          break;
      }
      it.mat = m;
    }
  const matSum = (k: MatKey, filter: (i: BoqItem) => boolean = () => true) =>
    sections
      .flatMap((x) => x.items)
      .filter(filter)
      .reduce((a, i) => a + (i.mat[k] ?? 0), 0);
  const houseOnly = (i: BoqItem) =>
    !anyExtra || !i.code.startsWith(sections.at(-1)!.code);
  const cement = matSum("cement"),
    sand = matSum("sand"),
    agg = matSum("aggregate"),
    bricks = matSum("bricks"),
    blocks = matSum("blocks"),
    steelT = matSum("steel"),
    tilesSqft = matSum("tiles");
  const m20 =
    sections
      .flatMap((x) => x.items)
      .filter((i) => i.rateKey === "rcc")
      .reduce((a, i) => a + i.qty, 0) + lintel.qty;
  const materials = [
    {
      key: "cement",
      unit: "bags",
      qty: cement,
      basis:
        "Concrete 8.06, PCC 3.4, masonry mortar, plaster and tile bedding — item by item",
    },
    {
      key: "steel",
      unit: "kg",
      qty: steelT,
      basis: useBbs
        ? "Bar bending schedule + staircase"
        : "Thumb rule kg/m³ + staircase",
    },
    {
      key: "sand",
      unit: "cft",
      qty: sand,
      basis: "Concrete share + 1.05 m³ per m³ of mortar",
    },
    { key: "aggregate", unit: "cft", qty: agg, basis: "Concrete and PCC" },
    ...(bricks > 0
      ? [
          {
            key: "bricks",
            unit: "nos",
            qty: bricks,
            basis: "500 per m³ of brickwork + 3% breakage",
          },
        ]
      : []),
    ...(blocks > 0
      ? [
          {
            key: "blocks",
            unit: "nos",
            qty: blocks,
            basis: "AAC 600 × 200 × 200 blocks + 3% breakage",
          },
        ]
      : []),
    {
      key: "tiles",
      unit: "sqft",
      qty: tilesSqft,
      basis: "Floor + wall + stair tiles + 5%",
    },
    {
      key: "rcc",
      unit: "m³",
      qty: m20,
      basis: "All M20 concrete incl. lintels and stairs",
    },
  ];
  const thumbDef: [string, string, number, number][] = [
    ["cement", "bags", 0.4, matSum("cement", houseOnly)],
    ["steel", "kg", 4.0, steelT],
    ["sand", "cft", 1.816, matSum("sand", houseOnly)],
    ["aggregate", "cft", 1.35, matSum("aggregate", houseOnly)],
    ...(AAC
      ? []
      : ([["bricks", "nos", 8, matSum("bricks", houseOnly)]] as [
          string,
          string,
          number,
          number,
        ][])),
    ["tiles", "sqft", 1.3, tilesSqft],
  ];
  const thumb = thumbDef.map(([key, unit, perSqft, qty]) => {
    const thumbQty = perSqft * builtUpSqft;
    return {
      key,
      unit,
      perSqft,
      thumbQty,
      qty,
      diffPct: ((qty - thumbQty) / thumbQty) * 100,
    };
  });

  // ---------------- schematic sketch per floor
  const sketch = geo.map((g) => ({
    floor: g.f,
    // drawn with the front (road) at the bottom: width across the front, depth front to back
    L: g.B,
    B: g.L,
    rects: layoutFloor(
      g.B,
      g.L,
      g.rs.map((r) => ({
        key: r.code,
        type: r.type,
        area: r.area,
        L: r.L,
        B: r.B,
        windows: r.windows,
        vents: r.vents,
      })),
      g.hasStair ? STAIR_FP : 0,
      g.f === 0,
      WE,
      g.wide,
    ),
  }));

  const specSheet = SPEC_SHEET.map((l) => ({
    key: l.key,
    item: l.item,
    spec: l.spec[quality],
  }));
  specSheet.splice(2, 0, {
    key: "walls",
    item: { en: "Walls", hi: "दीवारें" },
    spec: AAC
      ? {
          en: "AAC blocks 200 mm outer / 100 mm inner, thin-bed adhesive",
          hi: "AAC ब्लॉक 200 mm बाहर / 100 mm अंदर, पतला एडहेसिव",
        }
      : {
          en: "Red / fly-ash bricks 230 mm outer / 115 mm inner, CM 1:6",
          hi: "लाल / फ़्लाई-ऐश ईंट 230 mm बाहर / 115 mm अंदर, CM 1:6",
        },
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
    perSqft: (grandTotal - externalTotal) / builtUpSqft,
    externalTotal,
    materials,
    thumb,
    quality,
    facing: spec.facing,
    wall: AAC ? "aac" : "brick",
    bbs,
    steelThumbKg,
    specSheet,
    sketch,
    warnings: [
      ...(spec.buildableM2
        ? geo
            .filter((g) => g.A > spec.buildableM2! * 1.02)
            .map((g) => ({
              en: `${flr(g.f)} needs about ${Math.round(g.A * SQFT_PER_M2)} sqft but the plot allows only ${Math.round(spec.buildableM2! * SQFT_PER_M2)} sqft after setbacks — reduce rooms or sizes.`,
              hi: `${flr(g.f)} को लगभग ${Math.round(g.A * SQFT_PER_M2)} sqft चाहिए, पर सेटबैक के बाद प्लॉट में सिर्फ़ ${Math.round(spec.buildableM2! * SQFT_PER_M2)} sqft की जगह है — कमरे या साइज़ कम करें।`,
            }))
        : []),
      ...rooms.flatMap((r) => {
        const m = NBC_MIN[r.type];
        if (!m) return [];
        const w = Math.min(r.L, r.B);
        const bad =
          (m.area !== undefined && r.area < m.area - 0.05) ||
          (m.width !== undefined && w < m.width - 0.02);
        if (!bad) return [];
        const need = [
          m.area !== undefined
            ? `${m.area} m² (${Math.round(m.area * SQFT_PER_M2)} sqft)`
            : "",
          m.width !== undefined
            ? `${m.width} m (${round(m.width * 3.28084, 1)} ft) wide`
            : "",
        ].filter(Boolean);
        const needHi = [
          m.area !== undefined
            ? `${m.area} m² (${Math.round(m.area * SQFT_PER_M2)} sqft)`
            : "",
          m.width !== undefined
            ? `${m.width} m (${round(m.width * 3.28084, 1)} ft) चौड़ाई`
            : "",
        ].filter(Boolean);
        return [
          {
            en: `${flr(r.floor)} ${r.code} ${ROOM_DEFS[r.type].name.en} is ${round(r.area, 1)} m², ${round(w, 2)} m wide — NBC minimum is ${need.join(" and ")}.`,
            hi: `${flr(r.floor)} ${r.code} ${ROOM_DEFS[r.type].name.hi} ${round(r.area, 1)} m², ${round(w, 2)} m चौड़ा है — NBC के हिसाब से कम से कम ${needHi.join(" और ")} चाहिए।`,
          },
        ];
      }),
    ],
    assumptions: [
      `Each floor's outline is worked out from its own rooms (no drawing): carpet ≈ 83% of built-up incl. staircase ${STAIR_FP} m². ` +
        perFloor.map((p) => `${flr(p.floor)} ${p.L} × ${p.B} m`).join(", ") +
        ".",
      `RCC frame: columns 300 × 300 at max 4.2 m spacing (${NCOL} at foundation), beams 230 × 400, slab 125 mm, floor height ${FH} m, plinth ${PLINTH} m.`,
      `Isolated footings ${FOOT} × ${FOOT} m at ${PIT_D} m depth — confirm by soil test / structural design.`,
      `Openings from rooms: ${WIN} windows ${WW} × ${WH} m, ${FD} room doors, ${TD} toilet doors, ${MD} main door(s), ${BALD} balcony door(s)${SH ? `, ${SH} shutters` : ""}, ${VEN} ventilators.`,
      NS > 0
        ? `${NS} staircase flight set(s)${terrace ? " including terrace access" : ""}.`
        : "No staircase.",
      useBbs
        ? "Steel from a typical bar bending schedule (see BBS) + 3% wastage; staircase steel 90 kg/m³."
        : "Steel by kg per m³ of concrete (footing 80, column 180, plinth beam 120, beam 150, slab 90, stair 90) + 5%.",
      `Finish level: ${quality}; walls: ${AAC ? "AAC blocks" : "bricks"}.`,
      "Composite market rates (material + labour) for private work in a tier-2 city, 2026 — edit any rate to match your city, contractor or SOR.",
      "Excludes land, approvals, interiors, fixtures, compound wall, borewell, water tank, septic tank, GST if extra.",
    ],
  };
}

/** Cement bags in 1 m³ of a given material — exposed for UI notes. */
export const CEMENT_BAG_VOLUME = CEMENT_BAG_M3;
