/**
 * Plot-first start: plot size + setbacks + BHK → rooms that fit the buildable area,
 * and a schematic floor sketch (rooms as blocks inside the floor outline).
 */
import { NBC_MIN, ROOM_DEFS, RoomSpec, RoomType } from "./boq";
import { round } from "./units";

export interface PlotInput {
  /** Plot length (front to back) and width, metres. */
  plotL: number;
  plotB: number;
  /** Setbacks, metres. */
  front: number;
  back: number;
  side: number;
  bhk: number;
  floors: number;
  /** Keep a car parking on the ground floor. */
  parking: boolean;
  /** One family house (BHK = whole house, bedrooms spread over the floors, one kitchen) or a separate unit on every floor. */
  layout?: "family" | "units";
}

export interface PlotFit {
  buildL: number;
  buildB: number;
  buildArea: number;
  /** Rooms of each floor, ground first. */
  floorRooms: RoomSpec[][];
  /** Room scale applied to default sizes (1 = default). */
  scale: number;
  warnings: string[];
  /** Changes made so the rooms fit a small plot (English / Hindi). */
  notes: { en: string; hi: string }[];
}

const STAIR_FP = 6.83;

function template(bhk: number, ground: boolean, parking: boolean): RoomSpec[] {
  const t = (
    type: RoomType,
    L?: number,
    B?: number,
    extra: Partial<RoomSpec> = {},
  ): RoomSpec => ({
    type,
    L: L ?? ROOM_DEFS[type].L,
    B: B ?? ROOM_DEFS[type].B,
    ...extra,
  });
  const n = Math.max(1, Math.min(4, Math.round(bhk)));
  const list: RoomSpec[] = [];
  if (ground && parking) list.push(t("parking"));
  list.push(t("hall"));
  list.push(t("kitchen"));
  if (n >= 2) list.push(t("dining"));
  for (let i = 0; i < n; i++) list.push(t("bedroom", i === 0 ? 3.9 : 3.6, 3.3));
  list.push(t("passage", Math.max(3, 1.2 * (n + Math.min(n, 3))), 1.0));
  const toilets = Math.min(n, 3);
  for (let i = 0; i < toilets; i++)
    list.push(
      t("toilet", undefined, undefined, {
        wc: ground && toilets > 1 && i === toilets - 1 ? "iwc" : "ewc",
      }),
    );
  if (n >= 3) list.push(t("pooja"));
  if (!ground) list.push(t("balcony"));
  return list;
}

/**
 * One family house, the way an experienced architect zones a G+n home:
 * ground floor — parking, porch, living hall, kitchen + dining, pooja, one bedroom (parents / guests) with its toilet, a common toilet;
 * upper floors — family lounge, the other bedrooms each with an attached toilet, a balcony; no second kitchen.
 */
function familyTemplate(
  bhk: number,
  floors: number,
  parking: boolean,
): RoomSpec[][] {
  const t = (
    type: RoomType,
    L?: number,
    B?: number,
    extra: Partial<RoomSpec> = {},
  ): RoomSpec => ({
    type,
    L: L ?? ROOM_DEFS[type].L,
    B: B ?? ROOM_DEFS[type].B,
    ...extra,
  });
  const N = Math.max(1, Math.min(6, Math.round(bhk)));
  const F = Math.max(1, floors);
  // bedrooms per floor: ground gets one (all of them on a single-storey house), the rest spread evenly upstairs
  const per = Array(F).fill(0);
  if (F === 1) per[0] = N;
  else {
    per[0] = N >= 2 ? 1 : 0;
    let left = N - per[0];
    for (let f = 1; left > 0; f = f + 1 > F - 1 ? 1 : f + 1) {
      per[f]++;
      left--;
    }
  }
  const floorsOut: RoomSpec[][] = [];
  for (let f = 0; f < F; f++) {
    const list: RoomSpec[] = [];
    if (f === 0) {
      if (parking) list.push(t("parking"));
      list.push(t("hall", 4.8, 3.9));
      list.push(t("kitchen", 3.3, 2.7));
      list.push(t("dining", 3.3, 2.7));
      if (N >= 3) list.push(t("pooja"));
      for (let i = 0; i < per[0]; i++) {
        list.push(t("bedroom", 3.6, 3.3));
        list.push(t("toilet"));
      }
      list.push(t("toilet", 2.1, 1.5, { wc: "iwc" })); // common toilet near the living area
      list.push(t("passage", 3.6, 1.0));
    } else {
      list.push(t("hall", 3.6, 3.3)); // family lounge at the stair landing
      for (let i = 0; i < per[f]; i++) {
        list.push(t("bedroom", i === 0 ? 3.9 : 3.6, 3.3));
        list.push(t("toilet"));
      }
      if (per[f] === 0) list.push(t("toilet"));
      list.push(t("passage", 3.6, 1.0));
      list.push(t("balcony"));
    }
    floorsOut.push(list);
  }
  return floorsOut;
}

/**
 * Small plot: take rooms out the way an architect would, one step at a time, until every floor fits —
 * ground floor: pooja → bedroom moves upstairs → dining joins the hall → parking;
 * upper floors: balcony → bedrooms share a toilet → a bedroom moves up (or the house loses one); the lounge stays as the stair landing.
 */
function trimToFit(
  floors: RoomSpec[][],
  parking: boolean,
  fits: (list: RoomSpec[], f: number) => boolean,
  notes: { en: string; hi: string }[],
) {
  const F = floors.length;
  const note = (en: string, hi: string) => {
    notes.push({ en, hi });
    return true;
  };
  const take = (list: RoomSpec[], pred: (r: RoomSpec) => boolean) => {
    const i = list.findIndex(pred);
    return i >= 0 ? list.splice(i, 1)[0] : undefined;
  };
  const isType = (t: RoomType) => (r: RoomSpec) => r.type === t;
  const ownToilet = (r: RoomSpec) => r.type === "toilet" && r.wc !== "iwc";
  const flr = (f: number) =>
    f === 0
      ? ["ground floor", "ग्राउंड फ़्लोर"]
      : f === 1
        ? ["first floor", "पहली मंज़िल"]
        : f === 2
          ? ["second floor", "दूसरी मंज़िल"]
          : ["third floor", "तीसरी मंज़िल"];
  // move a bedroom (with its toilet) to the floor above, or drop it on the top floor
  const moveBedroomUp = (f: number) => {
    const list = floors[f];
    const beds = list.filter(isType("bedroom")).length;
    if (!beds || (f === F - 1 && beds <= 1)) return false;
    const bed = take(list, isType("bedroom"))!;
    const toilet =
      list.filter((r) => r.type === "toilet").length > 1
        ? take(list, ownToilet)
        : undefined;
    if (f < F - 1) {
      floors[f + 1].splice(1, 0, bed, ...(toilet ? [toilet] : []));
      const [a, b] = flr(f + 1);
      const [c, d] = flr(f);
      return note(
        `Plot is small: one bedroom moved from the ${c} to the ${a}.`,
        `प्लॉट छोटा है: एक बेडरूम ${d} से ${b} पर रखा।`,
      );
    }
    return note(
      "Plot is too small for this many bedrooms: one bedroom left out — add a floor to get it back.",
      "इतने बेडरूम के लिए प्लॉट छोटा है: एक बेडरूम कम किया — एक मंज़िल बढ़ाएं तो वापस आएगा।",
    );
  };
  for (let f = 0; f < F; f++) {
    const list = floors[f];
    const steps: (() => boolean)[] =
      f === 0
        ? [
            () =>
              !!take(list, isType("pooja")) &&
              note(
                "Plot is small: pooja room left out (a pooja niche in the hall works).",
                "प्लॉट छोटा है: पूजा रूम हटाया (हॉल में पूजा का आला बना सकते हैं)।",
              ),
            () => F > 1 && moveBedroomUp(0),
            () =>
              !!take(list, isType("dining")) &&
              note(
                "Plot is small: no separate dining room — the dining table goes in the open space beside the kitchen.",
                "प्लॉट छोटा है: अलग डाइनिंग रूम नहीं — डाइनिंग टेबल किचन के पास की खुली जगह में।",
              ),
            () =>
              parking &&
              !!take(list, isType("parking")) &&
              note(
                "Plot is too small for car parking with these rooms: parking left out (try fewer bedrooms or one more floor).",
                "इन कमरों के साथ कार पार्किंग की जगह नहीं: पार्किंग हटाई (कम बेडरूम या एक मंज़िल और आज़माएं)।",
              ),
            () => moveBedroomUp(0),
          ]
        : [
            () =>
              !!take(list, isType("balcony")) &&
              note(
                `Plot is small: no balcony on the ${flr(f)[0]}.`,
                `प्लॉट छोटा है: ${flr(f)[1]} पर बालकनी नहीं।`,
              ),
            () => {
              const toilets = list.filter((r) => r.type === "toilet");
              if (toilets.length < 2) return false;
              take(list, ownToilet);
              return note(
                `Plot is small: bedrooms on the ${flr(f)[0]} share a toilet.`,
                `प्लॉट छोटा है: ${flr(f)[1]} के बेडरूम एक टॉयलेट शेयर करेंगे।`,
              );
            },
            () => moveBedroomUp(f),
          ];
    let s = 0;
    while (s < steps.length && !fits(list, f)) if (!steps[s]()) s++;
  }
}

const FIXED: RoomType[] = ["toilet", "parking", "pooja", "store", "utility"];

/** Fit a BHK layout into the buildable part of a plot. */
export function fitPlot(p: PlotInput): PlotFit {
  const buildL = Math.max(3, p.plotL - p.front - p.back);
  const buildB = Math.max(3, p.plotB - 2 * p.side);
  const buildArea = buildL * buildB;
  const warnings: string[] = [];
  const floorRooms: RoomSpec[][] = [];
  let scale = 1;
  const scaleList = (list: RoomSpec[], k: number) =>
    list.map((r) => {
      if (FIXED.includes(r.type)) return r;
      // passages keep their width; everything else scales, then is held at the NBC minimum
      let L = round(r.L * k, 2),
        B = r.type === "passage" ? r.B : round(r.B * k, 2);
      const m = NBC_MIN[r.type];
      if (m?.width !== undefined && Math.min(L, B) < m.width) {
        if (L < B) L = m.width;
        else B = m.width;
      }
      if (m?.area !== undefined && L * B < m.area)
        L = round(m.area / B + 0.005, 2);
      return { ...r, L, B };
    });
  const depthFor = (list: RoomSpec[], ground: boolean) =>
    requiredDepth(
      buildB,
      list.map((r, i) => ({
        key: `${r.type}${i}`,
        type: r.type,
        area: r.L * r.B,
        L: r.L,
        B: r.B,
        windows: r.windows ?? ROOM_DEFS[r.type].windows,
        vents: ROOM_DEFS[r.type].vents,
        wc: r.wc,
      })),
      STAIR_FP,
      ground,
    );
  const wide = isWidePlot(buildB, buildL);
  const fitsFor = (list: RoomSpec[], ground: boolean): boolean =>
    depthFor(list, ground) <= buildL + 0.05 ||
    (wide &&
      requiredWidth(
        buildL,
        list.map((r, i) => ({
          key: `${r.type}${i}`,
          type: r.type,
          area: r.L * r.B,
          L: r.L,
          B: r.B,
          windows: r.windows ?? ROOM_DEFS[r.type].windows,
          vents: ROOM_DEFS[r.type].vents,
          wc: r.wc,
        })),
        STAIR_FP,
        ground,
      ) <=
        buildB + 0.05);
  const family =
    (p.layout ?? "family") === "family"
      ? familyTemplate(p.bhk, Math.max(1, p.floors), p.parking)
      : null;
  const notes: { en: string; hi: string }[] = [];
  // trim only when the floor is really short of area (the layout estimate is cautious on wider plots)
  const tight = (list: RoomSpec[]) =>
    buildB < 7.0 || // narrow plots: the row-by-row estimate is exact
    (scaleList(list, 0.8).reduce((t, r) => t + r.L * r.B, 0) + STAIR_FP) / 0.6 >
      buildArea;
  if (family)
    trimToFit(
      family,
      p.parking,
      (list, f) => !tight(list) || fitsFor(scaleList(list, 0.8), f === 0),
      notes,
    );
  for (let f = 0; f < Math.max(1, p.floors); f++) {
    const list = family ? family[f] : template(p.bhk, f === 0, p.parking);
    // largest room scale (0.8–1.3) whose planned layout still fits the buildable depth
    let k = 1.1; // rooms grow at most 10% on big plots; spare plot stays open (garden / backyard)
    while (k > 0.8 && !fitsFor(scaleList(list, k), f === 0))
      k = round(k - 0.025, 3);
    const fitsAtMin = fitsFor(scaleList(list, k), f === 0);
    if (!fitsAtMin && f === 0)
      warnings.push(
        `The plot is small for ${p.bhk}BHK${p.parking ? " with parking" : ""}: even with rooms at the minimum size the plan needs more depth than the plot allows. Try fewer bedrooms or no parking.`,
      );
    if (f === 0) scale = k;
    floorRooms.push(scaleList(list, k));
  }
  return { buildL, buildB, buildArea, floorRooms, scale, warnings, notes };
}

export type Side = "top" | "bottom" | "left" | "right";
export type SketchKind =
  RoomType | "stair" | "corridor" | "porch" | "open" | "column" | "dress";

/** A door or a plain opening on one edge; `at` = distance from the edge start (left / top end), metres. */
export interface SketchDoor {
  side: Side;
  at: number;
  width: number;
  main?: boolean;
  /** Opening without a shutter (arch / passage). */
  open?: boolean;
  /** Rolling shutter. */
  shutter?: boolean;
}

export interface SketchRect {
  key: string;
  label: string;
  type: SketchKind;
  /** Clear (inside) extent of the space, metres; y = 0 at the back wall, grows towards the road. */
  x: number;
  y: number;
  w: number;
  h: number;
  doors?: SketchDoor[];
  windows?: { side: Side; vent?: boolean }[];
}

export interface LayoutRoom {
  key: string;
  type: RoomType;
  area: number;
  L: number;
  B: number;
  windows: number;
  vents: number;
  wc?: "ewc" | "iwc";
}

const IW = 0.115; // internal wall
const STAIR_W = 2.3; // dog-legged stair: 2 flights of 1.0 m + 0.1 gap + wall play
const STAIR_D = 3.35; // flights + landing
const FLEX: RoomType[] = [
  "hall",
  "bedroom",
  "kitchen",
  "dining",
  "study",
  "shop",
];

interface Slot {
  room?: LayoutRoom;
  kind: SketchKind;
  key: string;
  depth: number;
  /** Area to hold (m²), minimum depth and an optional fixed depth (stair, parking, balcony). */
  area: number;
  minD: number;
  fixedD?: number;
  /** Hall / balcony also cover the passage strip. */
  spans?: boolean;
  /** Bedroom this toilet belongs to (door from the bedroom). */
  attachedTo?: string;
  /** A second space in the same row: attached toilet beside its bedroom, store / lobby beside the stair. */
  side?: Slot;
  sideW?: number;
}

interface Lanes {
  two: boolean;
  a: number;
  b: number;
  c: number;
  left: Slot[];
  right: Slot[];
}

function laneTotal(l: Slot[]) {
  return l.reduce((t, x) => t + x.depth, 0) + IW * Math.max(0, l.length - 1);
}

const MIN_D: Partial<Record<RoomType, number>> = {
  bedroom: 2.7,
  hall: 3.0,
  kitchen: 2.1,
  dining: 2.1,
  toilet: 1.2,
  study: 2.4,
  pooja: 1.5,
  store: 1.2,
  utility: 1.2,
  shop: 3.0,
};

/** Distribute the rooms of one floor into lanes (front to back) and size the lanes so both come out about equally deep. */
function makeLanes(
  W: number,
  idTarget: number,
  rooms: LayoutRoom[],
  stairArea: number,
  ground: boolean,
  wall: number,
): Lanes {
  const iw = W - 2 * wall;
  const hasStair = stairArea > 0;
  const two = iw >= 2.7 + IW + 1.0 + IW + STAIR_W;
  const c = two
    ? iw > 10
      ? 1.2
      : 1.05
    : Math.min(1.05, Math.max(0.9, iw * 0.2));
  const avail = two ? iw - c - 2 * IW : iw - c - IW;
  const by = (t: RoomType) => rooms.filter((r) => r.type === t);
  const slot = (r: LayoutRoom, extra: Partial<Slot> = {}): Slot => ({
    room: r,
    kind: r.type,
    key: r.key,
    depth: 0,
    area: r.area,
    minD: MIN_D[r.type] ?? 1.0,
    ...extra,
  });
  const toilets = by("toilet");
  const bedrooms = by("bedroom");
  const attN =
    toilets.length >= 2 ? Math.min(toilets.length - 1, bedrooms.length) : 0;
  const attached = toilets.slice(0, attN);
  const common = toilets.slice(attN);
  const left: Slot[] = [];
  const right: Slot[] = [];
  for (const r of by("parking"))
    left.push(slot(r, { fixedD: Math.max(5.0, r.L > r.B ? r.L : r.B) }));
  for (const r of by("shop")) left.push(slot(r));
  for (const r of by("balcony"))
    left.push(
      slot(r, {
        spans: true,
        fixedD: Math.min(1.5, Math.max(1.0, Math.min(r.L, r.B))),
      }),
    );
  // ground floor without parking: an entrance porch / sit-out in front of the hall
  if (
    ground &&
    !by("parking").length &&
    !by("shop").length &&
    by("hall").length
  )
    left.push({
      kind: "porch",
      key: "PORCH",
      depth: 0,
      area: 0,
      minD: 1.5,
      fixedD: 1.5,
      spans: true,
    });
  for (const h of by("hall")) left.push(slot(h, { spans: true }));
  const R = two ? right : left;
  if (hasStair)
    R.push({
      kind: "stair",
      key: "STAIR",
      depth: 0,
      area: STAIR_W * STAIR_D,
      minD: STAIR_D,
      fixedD: STAIR_D,
    });
  const kitchen = by("kitchen"),
    dining = by("dining");
  kitchen.forEach((k, i) => {
    R.push(slot(k));
    if (dining[i]) R.push(slot(dining[i]));
  });
  for (const d of dining.slice(kitchen.length)) R.push(slot(d));
  for (const t of ["utility", "store", "pooja", "study"] as RoomType[])
    for (const r of by(t)) R.push(slot(r));
  for (const t of common) R.push(slot(t));
  const areaOf = (l: Slot[]) => l.reduce((t, x) => t + x.area, 0);
  const beds = [...bedrooms].sort((x, y) => x.area - y.area);
  const att = [...attached];
  beds.forEach((bd, i) => {
    // the right lane gets bedrooms only when it can be at least 2.9 m wide (no long thin bedrooms)
    // a bedroom goes in the right lane only if that lane can be wide enough for a well-proportioned room (≤ 1.5 : 1)
    // and the left lane still keeps 2.9 m
    const maxBed = Math.max(0, ...bedrooms.map((x) => x.area));
    const rightOk = two && avail - Math.sqrt(maxBed / 1.5) >= 2.9;
    const lane =
      !two || !rightOk || areaOf(left) <= areaOf(right) ? left : right;
    lane.push(slot(bd));
    if (att.length > 0 && beds.length - i <= att.length) {
      const t = att.shift()!;
      lane.push(slot(t, { attachedTo: bd.key }));
    }
  });

  let a = avail,
    b = 0;
  const applyWidths = () => {
    const rowDepth = (x: Slot, w: number) => {
      if (x.side) {
        if (x.kind === "stair") {
          x.sideW = w - STAIR_W - IW;
          x.depth = STAIR_D;
        } else if (x.side.kind === "kitchen") {
          // kitchen beside the dining: kitchen on the outer wall, 2.1 m wide or more
          let kw = 2.4;
          for (let k = 0; k < 4; k++) {
            const d = Math.max(2.4, (x.area + x.side.area) / (w - IW));
            kw = Math.max(2.1, Math.min(w - 2.4 - IW, x.side.area / d));
            x.depth = d;
          }
          x.sideW = kw;
        } else {
          // toilet beside its bedroom: about 1.2–1.7 m wide, as deep as the bedroom
          let tw = 1.5;
          for (let k = 0; k < 3; k++) {
            const d = Math.max(x.minD, x.area / (w - tw - IW));
            tw = Math.max(1.2, Math.min(1.7, w - 2.5 - IW, x.side.area / d));
            x.depth = d;
          }
          x.sideW = tw;
        }
        x.side.depth = x.depth;
        return;
      }
      if (x.kind === "toilet" && w > 2.6) {
        // a toilet on its own row in a wide lane: about 2.1 m wide (rest becomes dress / wash area), 1.5–2.1 m deep
        x.depth = Math.max(1.5, Math.min(2.1, x.area / 2.1));
        return;
      }
      const span = x.spans ? w + IW + c : w;
      // living rooms are kept to at most 2.4 : 1, so a wide lane does not turn the hall into a strip
      x.depth =
        x.fixedD ??
        Math.max(x.minD, x.area / span, x.kind === "hall" ? span / 2.4 : 0);
    };
    for (const x of left) rowDepth(x, a);
    for (const x of right) rowDepth(x, b);
  };
  const size = () => {
    if (!two) {
      applyWidths();
      return;
    }
    // choose the lane split so both lanes come out equally deep (stair lane ≥ 2.3 m, parking lane ≥ 3 m)
    const minA = by("parking").length ? 3.0 : 2.7;
    // keep the lanes in proportion (each 40–60% of the width) so no lane turns into a strip
    const rBed = Math.max(
      0,
      ...right.filter((x) => x.kind === "bedroom").map((x) => x.area),
    );
    let lo = Math.max(
        rBed
          ? Math.max(2.5, Math.sqrt(rBed / 1.5))
          : right.some((x) => x.kind === "study")
            ? 2.5
            : STAIR_W,
        avail * 0.4,
      ),
      hi = Math.max(lo, Math.min(avail - minA, avail * 0.6));
    for (let it = 0; it < 24; it++) {
      b = (lo + hi) / 2;
      a = avail - b;
      applyWidths();
      if (laneTotal(right) > laneTotal(left)) lo = b;
      else hi = b;
    }
    b = (lo + hi) / 2;
    a = avail - b;
    applyWidths();
  };
  size();

  // balance: move movable rooms from the deeper lane to the other one
  if (two) {
    const movable = (x: Slot) =>
      x.room &&
      ["toilet", "utility", "store", "pooja", "study", "bedroom"].includes(
        x.room.type,
      ) &&
      !x.attachedTo &&
      !(
        x.room.type === "bedroom" && avail - Math.sqrt(x.room.area / 1.5) < 2.9
      );
    for (let guard = 0; guard < 6; guard++) {
      const [big, small] =
        laneTotal(right) > laneTotal(left) ? [right, left] : [left, right];
      const diff = laneTotal(big) - laneTotal(small);
      if (diff < 1.2) break;
      let best: { i: number; gain: number } | undefined;
      big.forEach((x, i) => {
        if (!movable(x)) return;
        const pairD =
          big[i + 1]?.attachedTo === x.key ? big[i + 1].depth + IW : 0;
        const moved = x.depth + pairD + IW;
        const gain = Math.abs(diff) - Math.abs(diff - 2 * moved);
        if (gain > 0.2 && (!best || gain > best.gain)) best = { i, gain };
      });
      if (!best) break;
      const { i } = best;
      const x = big[i];
      const pair =
        big[i + 1]?.attachedTo === x.key ? big.splice(i + 1, 1)[0] : undefined;
      big.splice(i, 1);
      if (x.room?.type === "bedroom") {
        small.push(x);
        if (pair) small.push(pair);
      } else {
        let idx = small.findIndex((y) =>
          ["hall", "stair", "kitchen", "dining"].includes(y.kind),
        );
        while (
          idx + 1 < small.length &&
          ["hall", "stair", "kitchen", "dining"].includes(small[idx + 1].kind)
        )
          idx++;
        small.splice(idx + 1, 0, x);
      }
      size();
    }
  }
  // ---- second space in a row: attached toilet beside its bedroom (wide lanes), store / lobby beside the stair
  const lanesW: [Slot[], number][] = two
    ? [
        [left, a],
        [right, b],
      ]
    : [[left, a]];
  for (const [lane, w] of lanesW) {
    if (w >= 4.6)
      for (let i = 0; i < lane.length - 1; i++) {
        const k = lane[i],
          d = lane[i + 1];
        if (k.kind === "kitchen" && d.kind === "dining" && !k.side && !d.side) {
          d.side = k;
          lane.splice(i, 1);
        }
      }
    if (w >= 4.0)
      for (let i = 0; i < lane.length - 1; i++) {
        const x = lane[i],
          t = lane[i + 1];
        if (x.kind === "bedroom" && t.attachedTo === x.key) {
          x.side = t;
          lane.splice(i + 1, 1);
        }
      }
    const st = lane.find((x) => x.kind === "stair");
    if (st && w - STAIR_W - IW >= 1.5) {
      const pool = two ? [...right, ...left] : left;
      const pick = pool.find(
        (x) =>
          x.room &&
          ["utility", "store", "pooja"].includes(x.room.type) &&
          !x.side,
      );
      if (pick) {
        for (const l of [left, right]) {
          const k = l.indexOf(pick);
          if (k >= 0) l.splice(k, 1);
        }
        st.side = pick;
      } else
        st.side = {
          kind: "corridor",
          key: "LOBBY",
          depth: 0,
          area: 0,
          minD: 0,
        };
    }
  }
  // keep the lane widths found above; drop any second space that ended up too narrow
  applyWidths();
  for (const [lane, w] of lanesW) {
    for (let i = 0; i < lane.length; i++) {
      const x = lane[i];
      if (!x.side) continue;
      const sw = x.sideW ?? 0;
      const mainW = w - sw - IW;
      const ok =
        x.kind === "stair"
          ? sw >= 1.5 || (x.side.key === "LOBBY" && sw >= 0.9)
          : x.side.kind === "kitchen"
            ? sw >= 2.1 && mainW >= 2.4
            : sw >= 1.2 && mainW >= 2.5;
      if (ok) continue;
      const side = x.side;
      x.side = undefined;
      x.sideW = undefined;
      if (side.room) {
        if (side.kind === "kitchen") lane.splice(i, 0, side);
        else lane.splice(i + 1, 0, side);
        i++;
      }
    }
  }
  applyWidths();
  void idTarget;
  return { two, a, b, c, left, right };
}

/** Shared edge between two spaces separated by one wall: side of `p` it is on and the overlap span along that edge (relative to p). */
function sharedEdge(
  p: SketchRect,
  q: SketchRect,
): { side: Side; from: number; to: number } | null {
  const G = 0.2; // a wall between them (115 / 230 mm)
  const ox0 = Math.max(p.x, q.x),
    ox1 = Math.min(p.x + p.w, q.x + q.w);
  const oy0 = Math.max(p.y, q.y),
    oy1 = Math.min(p.y + p.h, q.y + q.h);
  if (ox1 - ox0 > 0.05) {
    const gapTop = p.y - (q.y + q.h);
    if (gapTop >= -0.01 && gapTop <= G)
      return { side: "top", from: ox0 - p.x, to: ox1 - p.x };
    const gapBot = q.y - (p.y + p.h);
    if (gapBot >= -0.01 && gapBot <= G)
      return { side: "bottom", from: ox0 - p.x, to: ox1 - p.x };
  }
  if (oy1 - oy0 > 0.05) {
    const gapL = p.x - (q.x + q.w);
    if (gapL >= -0.01 && gapL <= G)
      return { side: "left", from: oy0 - p.y, to: oy1 - p.y };
    const gapR = q.x - (p.x + p.w);
    if (gapR >= -0.01 && gapR <= G)
      return { side: "right", from: oy0 - p.y, to: oy1 - p.y };
  }
  return null;
}

const OPEN_KINDS: SketchKind[] = [
  "corridor",
  "dining",
  "porch",
  "dress",
  "open",
];
/** Preferred spaces to open into (circulation first, private rooms last). */
const VIA_RANK: Partial<Record<SketchKind, number>> = {
  corridor: 0,
  hall: 1,
  dining: 2,
  porch: 3,
  stair: 4,
  dress: 5,
  kitchen: 6,
  study: 7,
  bedroom: 8,
  toilet: 9,
};

/** Which spaces cannot be reached from the entrance (ground floor) or the staircase (upper floors). */
export function unreachableSpaces(
  rects: SketchRect[],
  W: number,
  D: number,
  wall: number,
): string[] {
  return reach(rects, W, D, wall).unreached.map((r) => r.key);
}

function reach(rects: SketchRect[], W: number, D: number, wall: number) {
  const sp = rects.filter((r) => r.type !== "column");
  const links = new Map<SketchRect, Set<SketchRect>>();
  const link = (a: SketchRect, b: SketchRect) => {
    if (!links.has(a)) links.set(a, new Set());
    if (!links.has(b)) links.set(b, new Set());
    links.get(a)!.add(b);
    links.get(b)!.add(a);
  };
  const roots: SketchRect[] = [];
  for (const p of sp) {
    for (const d of p.doors ?? []) {
      const ext =
        (d.side === "bottom" && p.y + p.h >= D - wall - 0.05) ||
        (d.side === "top" && p.y <= wall + 0.05) ||
        (d.side === "left" && p.x <= wall + 0.05) ||
        (d.side === "right" && p.x + p.w >= W - wall - 0.05);
      if (ext) roots.push(p);
      for (const q of sp) {
        if (q === p) continue;
        const e = sharedEdge(p, q);
        if (
          e &&
          e.side === d.side &&
          Math.min(e.to, d.at + d.width) - Math.max(e.from, d.at) > 0.25
        )
          link(p, q);
      }
    }
  }
  const stair = sp.find((r) => r.type === "stair");
  if (stair) roots.push(stair);
  const seen = new Set<SketchRect>(roots);
  const queue = [...roots];
  while (queue.length) {
    const x = queue.shift()!;
    for (const y of links.get(x) ?? [])
      if (!seen.has(y)) (seen.add(y), queue.push(y));
  }
  return {
    sp,
    seen,
    unreached: sp.filter((r) => !seen.has(r) && r.type !== "open"),
  };
}

/** Make sure every space can be reached: open a door from each cut-off space into its best reachable neighbour. */
function connectAll(rects: SketchRect[], W: number, D: number, wall: number) {
  for (let guard = 0; guard < 20; guard++) {
    const { sp, seen, unreached } = reach(rects, W, D, wall);
    if (!unreached.length) return;
    let changed = false;
    for (const p of unreached) {
      const cands = sp
        .filter(
          (q) =>
            q !== p && seen.has(q) && q.type !== "open" && q.type !== "toilet",
        )
        .map((q) => ({ q, e: sharedEdge(p, q) }))
        .filter(
          (
            c,
          ): c is {
            q: SketchRect;
            e: { side: Side; from: number; to: number };
          } => !!c.e && c.e.to - c.e.from >= 0.7,
        )
        .sort(
          (x, y) =>
            (VIA_RANK[x.q.type] ?? 5) - (VIA_RANK[y.q.type] ?? 5) ||
            y.e.to - y.e.from - (x.e.to - x.e.from),
        );
      const c = cands[0];
      if (!c) continue;
      const open =
        OPEN_KINDS.includes(p.type) ||
        (OPEN_KINDS.includes(c.q.type) &&
          p.type !== "toilet" &&
          p.type !== "bedroom" &&
          p.type !== "kitchen");
      const want = p.type === "toilet" ? 0.75 : open ? 1.0 : 0.9;
      const wd = Math.min(want, c.e.to - c.e.from - 0.1);
      p.doors = p.doors ?? [];
      p.doors.push({
        side: c.e.side,
        at:
          c.e.from +
          Math.max(0.05, Math.min(0.15, c.e.to - c.e.from - wd - 0.05)),
        width: wd,
        ...(open ? { open: true } : {}),
      });
      seen.add(p);
      changed = true;
    }
    if (!changed) return;
  }
}

const twoLanes = (W: number, wall: number) =>
  W - 2 * wall >= 2.7 + IW + 1.0 + IW + STAIR_W;

interface Cell {
  key: string;
  kind: SketchKind;
  room?: LayoutRoom;
  w: number;
}
interface Row {
  cells: Cell[];
  depth: number;
  flex?: boolean;
}
type CellIn = {
  key: string;
  kind: SketchKind;
  room?: LayoutRoom;
  area: number;
  fixedW?: number;
};

/**
 * Narrow plots (about 20–25 ft frontage): full-width rows with the dining as the circulation hub —
 * front: parking + porch / balcony; hall + stair; kitchen + dining; toilets either side of a small lobby; bedrooms side by side.
 */
function hubFloor(
  W: number,
  D: number | null,
  rooms: LayoutRoom[],
  stairArea: number,
  ground: boolean,
  wall: number,
): { rects: SketchRect[]; need: number } {
  const iw = W - 2 * wall;
  const by = (t: RoomType) => rooms.filter((r) => r.type === t);
  const rows: Row[] = [];
  const split = (cells: CellIn[], minD: number) => {
    const fixedW = cells.reduce((t, c) => t + (c.fixedW ?? 0), 0);
    const free = iw - fixedW - IW * (cells.length - 1);
    const flexA =
      cells
        .filter((c) => c.fixedW === undefined)
        .reduce((t, c) => t + c.area, 0) || 1;
    const depth = Math.max(minD, flexA / Math.max(0.5, free));
    return {
      depth,
      cells: cells.map((c) => ({
        key: c.key,
        kind: c.kind,
        room: c.room,
        w: c.fixedW ?? (free * c.area) / flexA,
      })),
    };
  };
  const cellOf = (r: LayoutRoom, fixedW?: number): CellIn => ({
    key: r.key,
    kind: r.type,
    room: r,
    area: r.area,
    fixedW,
  });
  // front: parking / shop with a porch beside it, or the balcony upstairs
  const park = [...by("parking"), ...by("shop")];
  if (park.length) {
    const p0 = park[0];
    const pw = Math.min(
      iw,
      Math.max(2.7, p0.type === "parking" ? 3.0 : p0.area / 3.5),
    );
    const withPorch = iw - pw - IW >= 0.9;
    const cells: Cell[] = [
      { key: p0.key, kind: p0.type, room: p0, w: withPorch ? pw : iw },
    ];
    if (withPorch) cells.push({ key: "PORCH", kind: "porch", w: iw - pw - IW });
    rows.push({
      cells,
      depth: p0.type === "parking" ? 5.0 : Math.max(3.0, p0.area / pw),
    });
  }
  for (const b of by("balcony"))
    rows.push({
      cells: [{ key: b.key, kind: "balcony", room: b, w: iw }],
      depth: Math.min(1.5, Math.max(1.0, b.area / iw)),
    });
  if (ground && !park.length && by("hall").length)
    rows.push({ cells: [{ key: "PORCH", kind: "porch", w: iw }], depth: 1.5 });
  // hall + stair
  const hall = by("hall")[0];
  const stairBeside = stairArea > 0 && iw - STAIR_W - IW >= 3.0;
  if (hall)
    rows.push({
      ...split(
        [
          cellOf(hall),
          ...(stairBeside
            ? [
                {
                  key: "STAIR",
                  kind: "stair" as SketchKind,
                  area: 0,
                  fixedW: STAIR_W,
                },
              ]
            : []),
        ],
        stairBeside ? STAIR_D : 3.0,
      ),
      flex: true,
    });
  // kitchen + dining (+ stair when it did not fit beside the hall)
  const mid: CellIn[] = [];
  for (const k of by("kitchen"))
    mid.push(cellOf(k, Math.max(2.1, Math.min(iw * 0.45, k.area / 2.7))));
  for (const d of by("dining")) mid.push(cellOf(d));
  if (stairArea > 0 && !stairBeside)
    mid.push({
      key: "STAIR",
      kind: "stair",
      area: 0,
      fixedW: Math.min(STAIR_W, iw * 0.45),
    });
  if (!by("dining").length && mid.length)
    mid.push({ key: "HUB", kind: "corridor", area: 3 });
  // pooja / store / wash / study sit in the kitchen-dining row on narrow plots (keeps the toilet row to two toilets)
  // pooja / store / wash / study join the kitchen-dining row on narrow plots only when the dining keeps 2.4 m (else they go beside the lobby)
  const kW = by("kitchen").length
    ? Math.max(2.1, Math.min(iw * 0.45, by("kitchen")[0].area / 2.7))
    : 0;
  const extraCand = [
    ...by("pooja"),
    ...by("store"),
    ...by("utility"),
    ...by("study"),
  ];
  const extraW = extraCand.reduce(
    (t, x) => t + Math.max(1.5, x.area / 2.4) + IW,
    0,
  );
  const extraSmall =
    by("bedroom").length <= 2 &&
    iw -
      kW -
      IW -
      2.4 -
      extraW -
      (stairArea > 0 && !(iw - STAIR_W - IW >= 3.0) ? STAIR_W + IW : 0) >=
      0
      ? extraCand
      : [];
  for (const x of extraSmall) mid.push(cellOf(x, Math.max(1.5, x.area / 2.4)));
  if (mid.length) rows.push({ ...split(mid, stairBeside ? 2.4 : STAIR_D) }); // kitchen + dining keep their size; slack goes to hall / bedrooms
  // back zone
  const smalls = [
    ...by("toilet"),
    ...(extraSmall.length
      ? []
      : [...by("pooja"), ...by("store"), ...by("utility"), ...by("study")]),
  ];
  const bedrooms = [...by("bedroom")].sort((x, y) => y.area - x.area);
  if (bedrooms.length <= 2 && smalls.length <= 2) {
    // up to 2 bedrooms: toilets either side of a lobby, then the two bedrooms side by side, both opening on the lobby
    if (smalls.length || bedrooms.length) {
      const lobbyW = 1.7;
      const half = (iw - lobbyW - 2 * IW) / 2;
      const cells: Cell[] = [
        smalls[0]
          ? {
              key: smalls[0].key,
              kind: smalls[0].type,
              room: smalls[0],
              w: half,
            }
          : { key: "OPEN-L", kind: "open", w: half },
        { key: "LOBBY", kind: "corridor", w: lobbyW },
        smalls[1]
          ? {
              key: smalls[1].key,
              kind: smalls[1].type,
              room: smalls[1],
              w: half,
            }
          : { key: "OPEN-R", kind: "open", w: half },
      ];
      const depth = Math.max(
        1.5,
        Math.min(
          2.4,
          ...cells.filter((c) => c.room).map((c) => c.room!.area / c.w),
        ),
      );
      rows.push({ cells, depth });
    }
    if (bedrooms.length) {
      const bw = bedrooms.length === 2 ? (iw - IW) / 2 : iw;
      const depth = Math.max(2.7, ...bedrooms.map((bd) => bd.area / bw));
      rows.push({
        cells: bedrooms.map((bd) => ({
          key: bd.key,
          kind: "bedroom",
          room: bd,
          w: bw,
        })),
        depth,
        flex: true,
      });
    }
  } else {
    // more rooms: a 1 m side passage along the right wall; toilets in pairs and bedrooms one per row beside it
    const roomW = iw - 1.0 - IW;
    let n = 0;
    const lobby = (): Cell => ({
      key: n++ === 0 ? "LOBBY" : `LOBBY${n}`,
      kind: "corridor",
      w: 1.0,
    });
    const step = roomW >= 2 * 2.4 + IW ? 2 : 1; // two small rooms side by side only when both can still reach the passage width-wise
    for (let i = 0; i < smalls.length; i += step) {
      const pair = smalls.slice(i, i + step);
      const w = pair.length === 2 ? (roomW - IW) / 2 : roomW;
      const depth = Math.max(
        1.5,
        Math.min(2.4, ...pair.map((x) => x.area / w)),
      );
      rows.push({
        cells: [
          ...pair.map((x) => ({ key: x.key, kind: x.type, room: x, w })),
          lobby(),
        ],
        depth,
      });
    }
    for (const bd of bedrooms)
      rows.push({
        cells: [{ key: bd.key, kind: "bedroom", room: bd, w: roomW }, lobby()],
        depth: Math.max(2.7, bd.area / roomW),
        flex: true,
      });
  }

  const total = () =>
    rows.reduce((t, r) => t + r.depth, 0) + IW * Math.max(0, rows.length - 1);
  const need = total();
  if (D === null) return { rects: [], need: need + 2 * wall };
  const id = D - 2 * wall;
  // fit: flexible rows take the slack up to +25%, the rest is an open sit-out at the back
  const flexD = rows.filter((r) => r.flex).reduce((t, r) => t + r.depth, 0);
  let k = flexD > 0 ? (id - (need - flexD)) / flexD : 1;
  k = Math.max(0.7, Math.min(1.25, k));
  for (const r of rows)
    if (r.flex) {
      const minW = Math.min(
        ...r.cells.filter((cc) => cc.room).map((cc) => cc.w),
        iw,
      );
      r.depth =
        k > 1
          ? Math.min(r.depth * k, Math.max(r.depth, 1.6 * minW))
          : r.depth * k;
    }
  if (id - total() - IW > 0.75)
    rows.push({
      cells: [{ key: "OTS", kind: "open", w: iw }],
      depth: id - total() - IW,
    });
  else if (rows.length) rows[rows.length - 1].depth += id - total();

  // place: front row at the bottom
  const out: SketchRect[] = [];
  let yf = 0;
  for (const r of rows) {
    let x = wall;
    const y = wall + id - yf - r.depth;
    for (const c of r.cells) {
      out.push({
        key: c.key,
        label: c.key,
        type: c.kind,
        x,
        y,
        w: c.w,
        h: r.depth,
        doors: [],
        windows: [],
      });
      x += c.w + IW;
    }
    yf += r.depth + IW;
  }
  const find = (t: SketchKind) => out.find((q) => q.type === t);
  const overlapX = (p: SketchRect, q: SketchRect) =>
    Math.max(0, Math.min(p.x + p.w, q.x + q.w) - Math.max(p.x, q.x));
  const vNeighbour = (p: SketchRect, q: SketchRect) =>
    Math.abs(p.y - (q.y + q.h + IW)) < 0.02 ||
    Math.abs(q.y - (p.y + p.h + IW)) < 0.02;
  const hNeighbour = (p: SketchRect, q: SketchRect) =>
    Math.abs(p.y - q.y) < 0.02 &&
    (Math.abs(p.x + p.w + IW - q.x) < 0.02 ||
      Math.abs(q.x + q.w + IW - p.x) < 0.02);
  const doorBetween = (
    p: SketchRect,
    q: SketchRect | undefined,
    width: number,
    extra: Partial<SketchDoor> = {},
  ) => {
    if (!q) return false;
    if (vNeighbour(p, q) && overlapX(p, q) >= 0.7) {
      const lo = Math.max(p.x, q.x),
        hi = Math.min(p.x + p.w, q.x + q.w);
      const wd = Math.min(width, hi - lo - 0.1);
      p.doors!.push({
        side: q.y < p.y ? "top" : "bottom",
        at: lo - p.x + (hi - lo - wd) / 2,
        width: wd,
        ...extra,
      });
      return true;
    }
    if (hNeighbour(p, q)) {
      const wd = Math.min(width, Math.min(p.h, q.h) - 0.3);
      if (wd < 0.6) return false;
      p.doors!.push({
        side: q.x > p.x ? "right" : "left",
        at: Math.max(0.1, p.h - wd - 0.2),
        width: wd,
        ...extra,
      });
      return true;
    }
    return false;
  };
  const hallR = find("hall"),
    porch = find("porch"),
    lobby = out.find((q) => q.key === "LOBBY");
  const hub =
    out.find((q) => q.type === "dining") ?? out.find((q) => q.key === "HUB");
  for (const r of out) {
    switch (r.type) {
      case "parking":
        r.doors!.push({
          side: "bottom",
          at: 0.1,
          width: r.w - 0.2,
          open: true,
        });
        break;
      case "porch":
        r.doors!.push({
          side: "bottom",
          at: 0.05,
          width: r.w - 0.1,
          open: true,
        });
        break;
      case "shop":
        r.doors!.push({
          side: "bottom",
          at: Math.max(0.1, (r.w - Math.min(2.4, r.w - 0.3)) / 2),
          width: Math.min(2.4, r.w - 0.3),
          shutter: true,
        });
        break;
      case "hall":
        if (ground) {
          if (porch) doorBetween(r, porch, 1.0, { main: true });
          else if (!out.some((q) => q.type === "parking" || q.type === "shop"))
            r.doors!.push({
              side: "bottom",
              at: Math.max(0.2, r.w / 2 - 0.5),
              width: 1.0,
              main: true,
            });
          else
            r.doors!.push({ side: "bottom", at: 0.2, width: 1.0, main: true });
        }
        doorBetween(r, hub, 1.5, { open: true }) ||
          doorBetween(
            r,
            out.find((q) => q.type === "kitchen"),
            0.9,
          );
        doorBetween(r, find("balcony"), 1.0);
        break;
      case "stair":
        doorBetween(
          r,
          hallR && Math.abs(hallR.y - r.y) < 0.02 ? hallR : hub,
          1.0,
          { open: true },
        );
        break;
      case "kitchen":
        doorBetween(r, hub, 1.0, { open: true }) || doorBetween(r, hallR, 0.9);
        break;
      case "dining":
        doorBetween(r, lobby, 1.0, { open: true });
        break;
      case "corridor":
        if (r.key === "HUB") doorBetween(r, lobby, 1.0, { open: true });
        break;
      case "bedroom": {
        const lobbies = out.filter(
          (q) => q.type === "corridor" && q.key.startsWith("LOBBY"),
        );
        let ok = false;
        for (const l of lobbies) if (!ok) ok = doorBetween(r, l, 0.9);
        if (!ok) doorBetween(r, hub, 0.9);
        break;
      }
      case "open":
        break;
      default:
        doorBetween(r, lobby, r.type === "study" ? 0.9 : 0.75) ||
          doorBetween(r, hub, 0.75);
    }
    // windows on outer walls
    const ext: Side[] = [];
    if (r.y + r.h >= wall + id - 0.01) ext.push("bottom");
    if (r.y <= wall + 0.01) ext.push("top");
    if (r.x <= wall + 0.01) ext.push("left");
    if (r.x + r.w >= wall + iw - 0.01) ext.push("right");
    const room = rooms.find((q) => q.key === r.key);
    if (room) {
      const nW =
        room.type === "toilet" ||
        room.type === "store" ||
        room.type === "utility"
          ? 0
          : room.windows;
      const pref = (["left", "right", "top", "bottom"] as Side[]).filter((sd) =>
        ext.includes(sd),
      );
      for (let i = 0; i < nW && pref.length; i++)
        r.windows!.push({ side: pref[i % pref.length] });
      for (let i = 0; i < room.vents && pref.length; i++)
        r.windows!.push({ side: pref[(nW + i) % pref.length], vent: true });
    }
  }
  connectAll(out, W, D, wall);
  // columns on the side walls every ≤ 4.2 m
  const nY = Math.max(1, Math.ceil(D / 4.2));
  for (let i = 0; i <= nY; i++) {
    const cy = Math.min(D - 0.3, Math.max(0, (D * i) / nY - 0.15));
    for (const cx of [0, W - 0.3])
      out.push({
        key: `C${i}-${cx.toFixed(2)}`,
        label: "",
        type: "column",
        x: cx,
        y: cy,
        w: 0.3,
        h: 0.3,
      });
  }
  return { rects: out, need: need + 2 * wall };
}

/** Shallow, wide plots (deep less than ~10.5 m, much wider than deep): bands run along the road instead of lanes going back. */
export const isWidePlot = (buildW: number, buildD: number) =>
  buildD < 10.5 && buildW > buildD * 1.3;

interface WCell {
  key: string;
  kind: SketchKind;
  room?: LayoutRoom;
  w: number;
  minW: number;
  flex?: boolean;
  attachedTo?: string;
}

/**
 * Wide plot layout: front band along the road (parking, hall, kitchen + dining, stair), a 1 m passage along the width,
 * back band (bedrooms with attached toilets, common toilets, pooja, store). Very shallow plots get one band behind a front verandah.
 * Returns the rects for width W, or (W = null) the width the house needs.
 */
function wideFloor(
  W: number | null,
  D: number,
  rooms: LayoutRoom[],
  stairArea: number,
  ground: boolean,
  wall: number,
): { rects: SketchRect[]; need: number } {
  const id = D - 2 * wall;
  const c = 1.05;
  const by = (t: RoomType) => rooms.filter((r) => r.type === t);
  const twoBands = id >= 3.0 + c + 2.7 + 2 * IW;
  const fd = twoBands
    ? Math.max(3.0, Math.min(5.4, (id - c - 2 * IW) * 0.5))
    : id - c - IW;
  const bd = twoBands ? id - c - 2 * IW - fd : 0;
  const cell = (
    r: LayoutRoom,
    depth: number,
    extra: Partial<WCell> = {},
  ): WCell => {
    const minW = MIN_D[r.type] ?? 1.2;
    return {
      key: r.key,
      kind: r.type,
      room: r,
      w: Math.max(minW, r.area / depth),
      minW,
      flex: FLEX.includes(r.type),
      ...extra,
    };
  };
  const front: WCell[] = [];
  const back: WCell[] = [];
  const B = twoBands ? back : front;
  const bdep = twoBands ? bd : fd;
  for (const p of by("parking"))
    front.push({
      key: p.key,
      kind: "parking",
      room: p,
      w: fd >= 5.0 ? 3.0 : 5.4,
      minW: 3.0,
    });
  for (const s of by("shop")) front.push(cell(s, fd));
  for (const h of by("hall")) front.push(cell(h, fd));
  for (const b of by("balcony"))
    front.push({
      ...cell(b, fd),
      w: Math.max(1.5, b.area / Math.min(fd, 1.5)),
    });
  for (const k of by("kitchen")) front.push(cell(k, fd));
  for (const d of by("dining")) front.push(cell(d, fd));
  const toilets = by("toilet");
  const beds = [...by("bedroom")].sort((x, y) => y.area - x.area);
  const attN =
    toilets.length >= 2 ? Math.min(toilets.length - 1, beds.length) : 0;
  const att = toilets.slice(0, attN);
  beds.forEach((bdm, i) => {
    B.push(cell(bdm, bdep));
    if (att[i]) B.push({ ...cell(att[i], bdep), attachedTo: bdm.key });
  });
  for (const t of [
    ...toilets.slice(attN),
    ...by("pooja"),
    ...by("store"),
    ...by("utility"),
    ...by("study"),
  ])
    B.push(cell(t, bdep));
  const stairW = stairArea > 0 ? Math.max(STAIR_W, stairArea / fd) : 0;
  const sum = (l: WCell[]) =>
    l.reduce((t, x) => t + x.w, 0) + IW * Math.max(0, l.length - 1);
  // balance the bands: move kitchen / dining to the back band or small rooms to the front when one band is much longer
  if (twoBands)
    for (let g = 0; g < 6; g++) {
      const fT = sum(front) + (stairW ? stairW + IW : 0),
        bT = sum(back);
      const diff = fT - bT;
      if (Math.abs(diff) < 1.5) break;
      const [from, to, depthTo] =
        diff > 0 ? [front, back, bd] : [back, front, fd];
      const pick = [...from]
        .reverse()
        .find((x) =>
          diff > 0
            ? x.kind === "dining" || x.kind === "kitchen"
            : ["pooja", "store", "utility", "study"].includes(x.kind) ||
              (x.kind === "toilet" && !x.attachedTo),
        );
      if (!pick || !pick.room) break;
      from.splice(from.indexOf(pick), 1);
      to.push(cell(pick.room, depthTo));
    }
  const need =
    Math.max(sum(front) + (stairW ? stairW + IW : 0), sum(back)) + 2 * wall;
  if (W === null) return { rects: [], need };
  const iw = W - 2 * wall;
  // fit each band to the width: flexible rooms take up the slack (±25%), leftover = open space at the far end
  const fitBand = (band: WCell[], extra: number) => {
    const avail = iw - extra;
    const fixed =
      band.filter((x) => !x.flex).reduce((t, x) => t + x.w, 0) +
      IW * Math.max(0, band.length - 1);
    const flex = band.filter((x) => x.flex).reduce((t, x) => t + x.w, 0);
    let k = flex > 0 ? (avail - fixed) / flex : 1;
    k = Math.max(0.7, Math.min(1.25, k));
    const dep = band === front ? fd : bd;
    for (const x of band)
      if (x.flex)
        x.w =
          k > 1
            ? Math.min(x.w * k, Math.max(x.w, 1.6 * dep))
            : Math.max(x.minW * 0.9, x.w * k);
    const used = sum(band);
    if (avail - used - IW > 0.8)
      band.push({
        key: `OTS-${band === front ? "F" : "B"}`,
        kind: "open",
        w: avail - used - IW,
        minW: 0,
      });
    else if (used > avail) {
      const s2 =
        (avail - IW * Math.max(0, band.length - 1)) /
        band.reduce((t, x) => t + x.w, 0);
      for (const x of band) x.w *= s2;
    } else if (band.length) band[band.length - 1].w += avail - used;
  };
  fitBand(front, stairW ? stairW + IW : 0);
  if (twoBands) fitBand(back, 0);

  const out: SketchRect[] = [];
  const X0 = wall,
    Y0 = wall;
  // y: back band at the top, passage, front band at the bottom (road)
  const yBack = Y0,
    yPass = twoBands ? Y0 + bd + IW : Y0 + fd + IW,
    yFront = twoBands ? yPass + c + IW : Y0;
  const attachedOf = new Map<string, string>();
  const placeBand = (band: WCell[], y: number, h: number) => {
    let x = X0;
    for (const cc of band) {
      if (cc.attachedTo) attachedOf.set(cc.key, cc.attachedTo);
      out.push({
        key: cc.key,
        label: cc.key,
        type: cc.kind,
        x,
        y,
        w: cc.w,
        h,
        doors: [],
        windows: [],
      });
      x += cc.w + IW;
    }
  };
  if (twoBands) placeBand(back, yBack, bd);
  placeBand(front, yFront, fd);
  if (stairW)
    out.push({
      key: "STAIR",
      label: "Stair",
      type: "stair",
      x: X0 + iw - stairW,
      y: yFront,
      w: stairW,
      h: fd,
      doors: [],
      windows: [],
    });
  if (twoBands)
    out.push({
      key: "PASS",
      label: "Passage",
      type: "corridor",
      x: X0,
      y: yPass,
      w: iw,
      h: c,
      doors: [],
      windows: [],
    });
  else
    out.push({
      key: "VERANDAH",
      label: "Verandah",
      type: "porch",
      x: X0,
      y: yPass,
      w: iw,
      h: c,
      doors: [{ side: "bottom", at: 0.3, width: iw - 0.6, open: true }],
      windows: [],
    });
  const pass = out.find((r) => r.key === "PASS" || r.key === "VERANDAH")!;
  const onFront = (r: SketchRect) => Math.abs(r.y - yFront) < 0.01 && twoBands;
  for (const r of out) {
    if (r === pass || r.type === "open") continue;
    const room = rooms.find((q) => q.key === r.key);
    const toPass: Side = onFront(r) ? "top" : "bottom";
    const mid = (w: number) => Math.max(0.1, Math.min(0.3, r.w - w - 0.1));
    switch (r.type) {
      case "parking":
        r.doors!.push({
          side: "bottom",
          at: 0.1,
          width: r.w - 0.2,
          open: true,
        });
        break;
      case "shop":
        r.doors!.push({
          side: "bottom",
          at: Math.max(0.1, (r.w - Math.min(2.4, r.w - 0.3)) / 2),
          width: Math.min(2.4, r.w - 0.3),
          shutter: true,
        });
        break;
      case "hall":
        if (ground && twoBands)
          r.doors!.push({
            side: "bottom",
            at: Math.max(0.2, r.w / 2 - 0.5),
            width: 1.0,
            main: true,
          });
        r.doors!.push({
          side: toPass,
          at: mid(1.2),
          width: Math.min(1.2, r.w - 0.3),
          open: true,
        });
        break;
      case "stair":
        r.doors!.push({
          side: toPass,
          at: 0.1,
          width: Math.min(1.0, r.w - 0.2),
          open: true,
        });
        if (ground && twoBands)
          r.doors!.push({
            side: "bottom",
            at: 0.1,
            width: Math.min(1.0, r.w - 0.2),
            open: true,
          });
        break;
      case "dining":
        r.doors!.push({
          side: toPass,
          at: mid(1.2),
          width: Math.min(1.2, r.w - 0.3),
          open: true,
        });
        break;
      case "balcony":
        break;
      case "toilet": {
        const bed = out.find((q) => q.key === attachedOf.get(r.key));
        if (bed && Math.abs(bed.y - r.y) < 0.01)
          r.doors!.push({
            side: bed.x < r.x ? "left" : "right",
            at: Math.max(0.1, r.h - 0.95),
            width: 0.75,
          });
        else
          r.doors!.push({
            side: toPass,
            at: mid(0.75),
            width: Math.min(0.75, r.w - 0.2),
          });
        break;
      }
      default:
        r.doors!.push({
          side: toPass,
          at: mid(0.9),
          width: Math.min(0.9, r.w - 0.2),
        });
    }
    // windows on outer walls
    if (room) {
      const ext: Side[] = [];
      if (r.y + r.h >= Y0 + id - 0.01) ext.push("bottom");
      if (r.y <= Y0 + 0.01) ext.push("top");
      if (r.x <= X0 + 0.01) ext.push("left");
      if (r.x + r.w >= X0 + iw - 0.01) ext.push("right");
      const nW =
        room.type === "toilet" ||
        room.type === "store" ||
        room.type === "utility"
          ? 0
          : room.windows;
      const pref = (["top", "bottom", "left", "right"] as Side[]).filter((sd) =>
        ext.includes(sd),
      );
      for (let i = 0; i < nW && pref.length; i++)
        r.windows!.push({ side: pref[i % pref.length] });
      for (let i = 0; i < room.vents && pref.length; i++)
        r.windows!.push({ side: pref[(nW + i) % pref.length], vent: true });
    }
  }
  if (pass.key === "PASS")
    pass.windows!.push({ side: "left" }, { side: "right" });
  connectAll(out, W, D, wall);
  // columns along the front and back walls every ≤ 4.2 m, and at the passage walls
  const nX = Math.max(1, Math.ceil(W / 4.2));
  const ys = twoBands
    ? [0, yPass - IW / 2 - 0.15, yPass + c + IW / 2 - 0.15, D - 0.3]
    : [0, D - 0.3];
  for (let i = 0; i <= nX; i++) {
    const cx = Math.min(W - 0.3, Math.max(0, (W * i) / nX - 0.15));
    for (const cy of ys) {
      const yy = Math.min(D - 0.3, Math.max(0, cy));
      const inside = out.some(
        (r) =>
          r.type !== "column" &&
          cx + 0.15 > r.x + 0.05 &&
          cx + 0.15 < r.x + r.w - 0.05 &&
          yy + 0.15 > r.y + 0.05 &&
          yy + 0.15 < r.y + r.h - 0.05,
      );
      if (!inside)
        out.push({
          key: `C${i}-${yy.toFixed(2)}`,
          label: "",
          type: "column",
          x: cx,
          y: yy,
          w: 0.3,
          h: 0.3,
        });
    }
  }
  return { rects: out, need: W };
}

/** Width a wide-plot floor needs (incl. outer walls) for a given depth. */
export function requiredWidth(
  D: number,
  rooms: LayoutRoom[],
  stairArea: number,
  ground: boolean,
  wall = 0.23,
): number {
  return wideFloor(null, D, rooms, stairArea, ground, wall).need;
}

/** Clear depth a floor needs so that every room keeps its size (lanes + walls), metres incl. outer walls. */
export function requiredDepth(
  W: number,
  rooms: LayoutRoom[],
  stairArea: number,
  ground: boolean,
  wall = 0.23,
): number {
  if (!twoLanes(W, wall))
    return hubFloor(W, null, rooms, stairArea, ground, wall).need;
  let id = 6;
  for (let i = 0; i < 4; i++) {
    const l = makeLanes(W, id, rooms, stairArea, ground, wall);
    const need = Math.max(laneTotal(l.left), l.two ? laneTotal(l.right) : 0);
    if (Math.abs(need - id) < 0.05) break;
    id = need;
  }
  return id + 2 * wall;
}

export function layoutFloor(
  W: number,
  D: number,
  rooms: LayoutRoom[],
  stairArea: number,
  ground: boolean,
  wall = 0.23,
  wide = false,
): SketchRect[] {
  if (wide) return wideFloor(W, D, rooms, stairArea, ground, wall).rects;
  const X0 = wall,
    Y0 = wall;
  const iw = W - 2 * wall,
    id = D - 2 * wall;
  const hasStair = stairArea > 0;
  if (!twoLanes(W, wall))
    return hubFloor(W, D, rooms, stairArea, ground, wall).rects;
  const { two, a, b, c, left, right } = makeLanes(
    W,
    id,
    rooms,
    stairArea,
    ground,
    wall,
  );
  void hasStair;

  // ---- fit each lane to the building depth: flexible rooms take up the slack (±25%), leftover = open sit-out at the back
  const fit = (lane: Slot[]) => {
    const fixed = lane
      .filter((x) => !(x.room && FLEX.includes(x.room.type)))
      .reduce((s, x) => s + x.depth, 0);
    const flex = lane
      .filter((x) => x.room && FLEX.includes(x.room.type))
      .reduce((s, x) => s + x.depth, 0);
    const avail = id - IW * Math.max(0, lane.length - 1);
    let k = flex > 0 ? (avail - fixed) / flex : 1;
    k = Math.max(0.7, Math.min(1.25, k));
    // stretch flexible rooms, but never longer than 1.35 × their width (spare depth becomes open terrace / sit-out)
    const laneW = lane === left ? a : b;
    for (const x of lane)
      if (x.room && FLEX.includes(x.room.type)) {
        const w =
          (x.spans ? laneW + IW + c : laneW) -
          (x.side && x.sideW ? x.sideW + IW : 0);
        x.depth =
          k > 1
            ? Math.min(x.depth * k, Math.max(x.depth, 1.35 * w))
            : x.depth * k;
      }
    const used =
      lane.reduce((s, x) => s + x.depth, 0) + IW * Math.max(0, lane.length - 1);
    if (id - used - IW > 0.75)
      lane.push({
        kind: "open",
        key: `OTS${lane === left ? "L" : "R"}`,
        depth: id - used - IW,
        area: 0,
        minD: 0,
      });
    else if (used > id) {
      // over-full: squeeze everything evenly (the plot / NBC warnings tell the user)
      const s =
        (id - IW * Math.max(0, lane.length - 1)) /
        lane.reduce((t, x) => t + x.depth, 0);
      for (const x of lane) x.depth *= s;
    } else if (lane.length) lane[lane.length - 1].depth += id - used; // absorb rounding
  };
  fit(left);
  if (two) fit(right);

  // ---- place, front first (y measured from the front, converted at the end)
  const out: SketchRect[] = [];
  const xL = X0,
    xC = X0 + a + IW,
    xR = xC + c + IW;
  type Tagged = SketchRect & { slot?: Slot; lane?: "L" | "R"; sideOf?: string };
  const place = (lane: Slot[], x: number, w: number, isLeft: boolean) => {
    let yf = 0;
    const tag = isLeft ? "L" : "R";
    lane.forEach((s, i) => {
      const spans =
        isLeft &&
        (s.kind === "hall" || s.kind === "balcony" || s.kind === "porch"); // hall, balcony and porch also cover the passage strip
      const lastSingle = !two && i === lane.length - 1 && s.kind !== "stair"; // single lane: the back room takes the full width
      let ww = spans || lastSingle ? w + IW + c : w;
      const y = Y0 + id - yf - s.depth;
      let mx = x;
      if (s.side && s.sideW && s.sideW > 0.5) {
        // stair keeps the outer wall; an attached toilet takes the outer wall (ventilator), bedroom faces the passage
        const exteriorLeft = isLeft;
        const sideOnLeft = s.kind === "stair" ? !exteriorLeft : exteriorLeft;
        const sw = s.sideW;
        const sx = sideOnLeft ? x : x + ww - sw;
        mx = sideOnLeft ? x + sw + IW : x;
        ww = ww - sw - IW;
        const td =
          s.side.kind === "toilet"
            ? Math.max(1.5, Math.min(2.4, s.side.area / sw))
            : s.depth;
        if (
          s.side.kind === "toilet" &&
          s.kind === "bedroom" &&
          s.depth - td - IW >= 0.9
        ) {
          // toilet at the back of the strip, walk-in dress in front of it (opens to the bedroom)
          out.push({
            key: s.side.key,
            label: s.side.key,
            type: "toilet",
            x: sx,
            y,
            w: sw,
            h: td,
            doors: [],
            windows: [],
            slot: s.side,
            lane: tag,
            sideOf: `DR-${s.key}`,
          } as Tagged);
          out.push({
            key: `DR-${s.key}`,
            label: "Dress",
            type: "dress",
            x: sx,
            y: y + td + IW,
            w: sw,
            h: s.depth - td - IW,
            doors: [],
            windows: [],
            lane: tag,
            sideOf: s.key,
          } as Tagged);
        } else
          out.push({
            key: s.side.key,
            label: s.side.key,
            type: s.side.kind,
            x: sx,
            y,
            w: sw,
            h: s.depth,
            doors: [],
            windows: [],
            slot: s.side,
            lane: tag,
            sideOf: s.key,
          } as Tagged);
      }
      if (s.kind === "toilet" && !s.side && ww > 2.6 && s.room) {
        const tw = Math.max(
          1.2,
          Math.min(ww - 0.9 - IW, s.room.area / s.depth),
        );
        if (ww - tw - IW >= 0.9) {
          const tx = isLeft ? x : x + ww - tw; // toilet on the outer wall (ventilator)
          const cx = isLeft ? x + tw + IW : x;
          const comp: Tagged = s.attachedTo
            ? {
                key: `DR-${s.attachedTo}`,
                label: "Dress",
                type: "dress",
                x: cx,
                y,
                w: ww - tw - IW,
                h: s.depth,
                doors: [],
                windows: [],
                lane: tag,
                sideOf: s.attachedTo,
              }
            : {
                key: `WASH-${s.key}`,
                label: "Wash",
                type: "corridor",
                x: cx,
                y,
                w: ww - tw - IW,
                h: s.depth,
                doors: [],
                windows: [],
                lane: tag,
              };
          out.push(comp);
          out.push({
            key: s.key,
            label: s.key,
            type: "toilet",
            x: tx,
            y,
            w: tw,
            h: s.depth,
            doors: [],
            windows: [],
            slot: s,
            lane: tag,
            sideOf: comp.key,
          } as Tagged);
          yf += s.depth + IW;
          return;
        }
      }
      const r: Tagged = {
        key: s.key,
        label: s.key,
        type: s.kind,
        x: mx,
        y,
        w: ww,
        h: s.depth,
        doors: [],
        windows: [],
        slot: s,
        lane: tag,
      };
      out.push(r);
      yf += s.depth + IW;
    });
  };
  place(left, xL, a, true);
  if (two) place(right, xR, b, false);
  else {
    // single lane: stair etc. already in the left list; passage on the right
  }

  // passage strip: from behind the hall (or the front) to the back wall
  const hallR = out.find((r) => r.type === "hall");
  const frontStrip = out.filter(
    (r) => r.type === "parking" || r.type === "shop",
  );
  const backFull = !two
    ? out.find(
        (r) =>
          r.w > a + 0.01 &&
          r.type !== "hall" &&
          r.type !== "balcony" &&
          r.y < Y0 + id / 2,
      )
    : undefined;
  const passTop = backFull ? backFull.y + backFull.h + IW : Y0;
  const passBottom = hallR ? hallR.y - IW : Y0 + id;
  if (passBottom - passTop > 0.5)
    out.push({
      key: "PASS",
      label: "Passage",
      type: "corridor",
      x: two ? xC : X0 + a + IW,
      y: passTop,
      w: c,
      h: passBottom - passTop,
      doors: [],
      windows: [],
    });
  // porch in front of the hall beside the parking (ground floor)
  if (ground && hallR && frontStrip.length) {
    const fy = hallR.y + hallR.h + IW;
    out.push({
      key: "PORCH",
      label: "Porch",
      type: "porch",
      x: two ? xC : X0 + a + IW,
      y: fy,
      w: c,
      h: Y0 + id - fy,
      doors: [],
      windows: [],
    });
  }

  // ---- doors, openings, windows
  const at = (r: SketchRect) => out.indexOf(r);
  const overlapY = (p: SketchRect, q: SketchRect) =>
    Math.max(0, Math.min(p.y + p.h, q.y + q.h) - Math.max(p.y, q.y));
  const pass = out.find((r) => r.key === "PASS");
  const porch = out.find((r) => r.type === "porch");
  const isFrontEdge = (r: SketchRect) => r.y + r.h >= Y0 + id - 0.01;
  const isBackEdge = (r: SketchRect) => r.y <= Y0 + 0.01;
  for (const r of out) {
    const tg = r as SketchRect & {
      slot?: Slot;
      lane?: "L" | "R";
      sideOf?: string;
    };
    const slot = tg.slot;
    const onLeftLane = tg.lane ? tg.lane === "L" : Math.abs(r.x - xL) < 1e-6;
    const partner = tg.sideOf
      ? out.find((q) => q.key === tg.sideOf)
      : undefined;
    const room = slot?.room;
    // exterior edges
    const ext: Side[] = [];
    if (isFrontEdge(r)) ext.push("bottom");
    if (isBackEdge(r)) ext.push("top");
    if (Math.abs(r.x - X0) < 1e-6) ext.push("left");
    if (Math.abs(r.x + r.w - (X0 + iw)) < 1e-6) ext.push("right");
    const doorTo = (
      side: Side,
      target: SketchRect | undefined,
      width: number,
      extra: Partial<SketchDoor> = {},
    ) => {
      // place the door where the room touches the target, near the front end
      if (side === "left" || side === "right") {
        const lo = Math.max(r.y, target ? target.y : r.y),
          hi = Math.min(r.y + r.h, target ? target.y + target.h : r.y + r.h);
        if (hi - lo < 0.7) return false;
        const wd = Math.min(width, hi - lo - 0.1);
        r.doors!.push({
          side,
          at: Math.max(0.05, hi - r.y - wd - 0.15),
          width: wd,
          ...extra,
        });
      } else {
        const lo = Math.max(r.x, target ? target.x : r.x),
          hi = Math.min(r.x + r.w, target ? target.x + target.w : r.x + r.w);
        if (hi - lo < 0.7) return false;
        const wd = Math.min(width, hi - lo - 0.1);
        r.doors!.push({
          side,
          at: lo - r.x + Math.max(0.05, (hi - lo - wd) / 2),
          width: wd,
          ...extra,
        });
      }
      return true;
    };
    switch (r.type) {
      case "parking":
        r.doors!.push({
          side: "bottom",
          at: 0.15,
          width: r.w - 0.3,
          open: true,
        });
        break;
      case "shop":
        r.doors!.push({
          side: "bottom",
          at: Math.max(0.15, (r.w - Math.min(2.4, r.w - 0.3)) / 2),
          width: Math.min(2.4, r.w - 0.3),
          shutter: true,
        });
        break;
      case "hall": {
        if (ground) {
          if (porch) doorTo("bottom", porch, 1.0, { main: true });
          else
            r.doors!.push({
              side: "bottom",
              at: Math.max(0.15, r.w - c - 0.6),
              width: 1.0,
              main: true,
            });
        }
        if (pass) doorTo("top", pass, Math.min(1.05, c - 0.05), { open: true });
        const bal = out.find((q) => q.type === "balcony");
        if (bal) r.doors!.push({ side: "bottom", at: 0.3, width: 1.0 });
        break;
      }
      case "corridor":
        if (r.key.startsWith("WASH")) {
          doorTo(onLeftLane ? "right" : "left", pass, 1.0, { open: true }) ||
            doorTo(
              onLeftLane ? "right" : "left",
              out.find((q) => q.type === "hall"),
              1.0,
              { open: true },
            );
          break;
        }
        if (r.key === "LOBBY") {
          const side: Side = onLeftLane ? "right" : "left";
          const tgt =
            (ground && porch && overlapY(r, porch) > 0.8 ? porch : undefined) ??
            (hallR && overlapY(r, hallR) > 0.8 ? hallR : undefined) ??
            pass;
          doorTo(side, tgt, 1.0, { open: true }) ||
            doorTo("top", pass, 1.0, { open: true });
        }
        break;
      case "porch":
        r.doors!.push({
          side: "bottom",
          at: 0.05,
          width: r.w - 0.1,
          open: true,
        });
        break;
      case "stair": {
        const hall = out.find((q) => q.type === "hall");
        const side: Side = onLeftLane ? "right" : "left";
        const lob = out.find(
          (q) => (q as typeof tg).sideOf === r.key && q.key === "LOBBY",
        );
        if (lob) {
          doorTo(lob.x < r.x ? "left" : "right", lob, 1.0, { open: true });
          break;
        }
        if (hall && overlapY(r, hall) > 1.1)
          doorTo(side, hall, 1.0, { open: true });
        else if (ground && porch && overlapY(r, porch) > 1.1)
          doorTo(side, porch, 1.0, { open: true });
        else if (pass) doorTo(side, pass, Math.min(1.0, c), { open: true });
        break;
      }
      case "toilet": {
        if (
          partner &&
          (partner.type === "dress" || partner.key.startsWith("WASH")) &&
          Math.abs(partner.y - r.y) < 0.02
        ) {
          doorTo(partner.x > r.x ? "right" : "left", partner, 0.75);
          break;
        }
        if (slot?.attachedTo) {
          const bedR = out.find((q) => q.key === slot.attachedTo);
          if (partner?.type === "dress") doorTo("bottom", partner, 0.75);
          else if (bedR && partner === bedR)
            doorTo(bedR.x > r.x ? "right" : "left", bedR, 0.75);
          else if (bedR) doorTo("bottom", bedR, 0.75);
        } else
          doorTo(onLeftLane ? "right" : "left", pass, 0.75) ||
            doorTo(
              onLeftLane ? "right" : "left",
              out.find((q) => q.type === "hall"),
              0.75,
            );
        break;
      }
      case "dress":
        if (
          partner &&
          (Math.abs(partner.x - (r.x + r.w + IW)) < 0.02 ||
            Math.abs(r.x - (partner.x + partner.w + IW)) < 0.02)
        )
          doorTo(partner.x > r.x ? "right" : "left", partner, 0.9, {
            open: true,
          });
        else if (partner)
          doorTo("bottom", partner, 0.9, { open: true }) ||
            doorTo("top", partner, 0.9, { open: true });
        break;
      case "open":
        if (pass) doorTo(onLeftLane ? "right" : "left", pass, 0.9);
        break;
      case "dining": {
        // dining opens wide to the passage / hall and to the kitchen
        const side: Side = onLeftLane ? "right" : "left";
        const hall = out.find((q) => q.type === "hall");
        if (!doorTo(side, pass, Math.min(1.2, r.h - 0.4), { open: true }))
          doorTo(side, hall, Math.min(1.2, r.h - 0.4), { open: true });
        break;
      }
      case "kitchen": {
        if (partner?.type === "dining") {
          doorTo(partner.x > r.x ? "right" : "left", partner, 1.2, {
            open: true,
          });
          break;
        }
        const din = out.find(
          (q) =>
            q.type === "dining" &&
            Math.abs(q.x - r.x) < 1e-6 &&
            Math.abs(q.y + q.h + IW - r.y) < 0.02,
        );
        const dinAbove = out.find(
          (q) =>
            q.type === "dining" &&
            Math.abs(q.x - r.x) < 1e-6 &&
            Math.abs(r.y + r.h + IW - q.y) < 0.02,
        );
        if (dinAbove)
          r.doors!.push({
            side: "bottom",
            at: 0.2,
            width: Math.min(1.2, r.w - 0.4),
            open: true,
          });
        else if (din)
          r.doors!.push({
            side: "top",
            at: 0.2,
            width: Math.min(1.2, r.w - 0.4),
            open: true,
          });
        else {
          const side: Side = onLeftLane ? "right" : "left";
          doorTo(side, pass, 0.9) ||
            doorTo(
              side,
              out.find((q) => q.type === "hall"),
              0.9,
            );
        }
        break;
      }
      case "balcony":
        break;
      default: {
        // bedrooms, study, pooja, store, utility: door to the passage, else the hall
        const side: Side = onLeftLane ? "right" : "left";
        const w =
          r.type === "pooja" || r.type === "store" || r.type === "utility"
            ? 0.75
            : 0.9;
        doorTo(side, pass, w) ||
          doorTo(
            side,
            out.find((q) => q.type === "hall"),
            w,
          ) ||
          r.doors!.push({ side: "bottom", at: 0.15, width: w });
      }
    }
    // windows / ventilators on outer walls (side walls first for lane rooms, then front / back)
    if (room) {
      const nW =
        room.type === "toilet" ||
        room.type === "store" ||
        room.type === "utility"
          ? 0
          : room.windows;
      const pref: Side[] = ["left", "right", "top", "bottom"].filter((sd) =>
        ext.includes(sd as Side),
      ) as Side[];
      for (let i = 0; i < nW && pref.length; i++)
        r.windows!.push({ side: pref[i % pref.length] });
      for (let i = 0; i < room.vents && pref.length; i++)
        r.windows!.push({ side: pref[(nW + i) % pref.length], vent: true });
    }
    if (r.type === "corridor" && isBackEdge(r))
      r.windows!.push({ side: "top" });
    void at;
  }
  for (const r of out) delete (r as SketchRect & { slot?: Slot }).slot;

  connectAll(out, W, D, wall);

  // ---- columns on the lane walls and outer walls, spaced ≤ 4.2 m along the depth
  const colX = two
    ? [
        X0 - wall / 2,
        X0 + a + IW / 2,
        X0 + a + IW + c + IW / 2,
        X0 + iw + wall / 2,
      ]
    : [X0 - wall / 2, X0 + a + IW / 2, X0 + iw + wall / 2];
  const nY = Math.max(1, Math.ceil((id + 2 * wall) / 4.2));
  for (let i = 0; i <= nY; i++) {
    const cy = -wall / 2 + Y0 + ((id + wall) * i) / nY;
    for (const cx of colX) {
      const inside = out.some(
        (r) =>
          r.type !== "column" &&
          cx > r.x + 0.05 &&
          cx < r.x + r.w - 0.05 &&
          cy > r.y + 0.05 &&
          cy < r.y + r.h - 0.05,
      );
      if (inside) continue;
      out.push({
        key: `C${i}-${cx.toFixed(2)}`,
        label: "",
        type: "column",
        x: Math.min(W - 0.3, Math.max(0, cx - 0.15)),
        y: Math.min(D - 0.3, Math.max(0, cy - 0.15)),
        w: 0.3,
        h: 0.3,
      });
    }
  }
  return out;
}
