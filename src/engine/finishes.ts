import { CalcResult, Step } from "./types";
import { ceilSafe, m2ToSqft, round } from "./units";

/* ------------------------------------------------------------------ tiles */

/** Common tile sizes (cm) with typical pieces per box. */
export const TILE_SIZES = {
  "30x30": { w: 30, h: 30, perBox: 10 },
  "40x40": { w: 40, h: 40, perBox: 6 },
  "30x60": { w: 30, h: 60, perBox: 8 },
  "60x60": { w: 60, h: 60, perBox: 4 },
  "60x120": { w: 60, h: 120, perBox: 2 },
  "80x80": { w: 80, h: 80, perBox: 3 },
} as const;
export type TileSize = keyof typeof TILE_SIZES;

export interface TileInput {
  areaM2: number;
  size: TileSize;
  wastagePct?: number;
  perBox?: number;
  ratePerSqft?: number;
}

export function calcTiles(input: TileInput): CalcResult<{
  areaSqft: number;
  tileAreaM2: number;
  tiles: number;
  boxes: number;
  orderSqft: number;
  cost: number;
}> {
  const s = TILE_SIZES[input.size];
  const tileArea = (s.w / 100) * (s.h / 100);
  const w = (input.wastagePct ?? 8) / 100;
  const perBox = input.perBox ?? s.perBox;
  const tilesNet = input.areaM2 / tileArea;
  const tiles = ceilSafe(tilesNet * (1 + w));
  const boxes = ceilSafe(tiles / perBox);
  const orderSqft = m2ToSqft(boxes * perBox * tileArea);
  const cost = orderSqft * (input.ratePerSqft ?? 0);
  return {
    values: { areaSqft: m2ToSqft(input.areaM2), tileAreaM2: tileArea, tiles, boxes, orderSqft, cost },
    steps: [
      { label: "Floor area", value: `${round(input.areaM2, 2)} m² = ${round(m2ToSqft(input.areaM2), 1)} sqft` },
      { label: "One tile", formula: `${s.w / 100} × ${s.h / 100}`, value: `${round(tileArea, 3)} m²` },
      { label: "Tiles (net)", formula: `${round(input.areaM2, 2)} ÷ ${round(tileArea, 3)}`, value: `${round(tilesNet, 1)}` },
      { label: "With cutting / breakage", formula: `${round(tilesNet, 1)} × (1 + ${round(w * 100)}%)`, value: `${tiles} tiles` },
      { label: "Boxes", formula: `${tiles} ÷ ${perBox} per box`, value: `${boxes} boxes` },
    ],
    assumptions: [`${s.w} × ${s.h} cm tiles, ${perBox} per box (check the brand's box).`, `${round(w * 100)}% for cutting and breakage (use 10–12% for diagonal laying).`],
  };
}

/* ------------------------------------------------------------------ paint */

export interface PaintInput {
  /** Net area to paint, m². */
  areaM2: number;
  coats?: number;
  /** Paint coverage per coat, sqft per litre. */
  coverageSqftPerL?: number;
  primer?: boolean;
  primerCoverageSqftPerL?: number;
  putty?: boolean;
  /** Putty coverage for 2 coats, sqft per kg. */
  puttyCoverageSqftPerKg?: number;
}

export function calcPaint(input: PaintInput): CalcResult<{ areaSqft: number; paintL: number; primerL: number; puttyKg: number }> {
  const sqft = m2ToSqft(input.areaM2);
  const coats = input.coats ?? 2;
  const cov = input.coverageSqftPerL ?? 120;
  const paintL = (sqft * coats) / cov;
  const primerCov = input.primerCoverageSqftPerL ?? 110;
  const primerL = input.primer === false ? 0 : sqft / primerCov;
  const puttyCov = input.puttyCoverageSqftPerKg ?? 15;
  const puttyKg = input.putty === false ? 0 : sqft / puttyCov;
  const steps: Step[] = [
    { label: "Area to paint", value: `${round(input.areaM2, 2)} m² = ${round(sqft, 1)} sqft` },
    { label: `Paint, ${coats} coats`, formula: `${round(sqft, 1)} × ${coats} ÷ ${cov} sqft/L`, value: `${round(paintL, 1)} L` },
  ];
  if (primerL) steps.push({ label: "Primer, 1 coat", formula: `${round(sqft, 1)} ÷ ${primerCov} sqft/L`, value: `${round(primerL, 1)} L` });
  if (puttyKg) steps.push({ label: "Wall putty, 2 coats", formula: `${round(sqft, 1)} ÷ ${puttyCov} sqft/kg`, value: `${round(puttyKg, 1)} kg` });
  return {
    values: { areaSqft: sqft, paintL, primerL, puttyKg },
    steps,
    assumptions: [
      `Paint coverage ${cov} sqft per litre per coat (check the product label; smooth putty-finished walls cover more).`,
      `Primer ${primerCov} sqft/L; putty ${puttyCov} sqft/kg for 2 coats.`,
    ],
  };
}

/** Net wall area of a room: perimeter × height − openings (+ ceiling optionally). */
export function roomPaintArea(lengthM: number, widthM: number, heightM: number, openingsM2: number, ceiling: boolean) {
  const walls = 2 * (lengthM + widthM) * heightM - openingsM2;
  return Math.max(0, walls) + (ceiling ? lengthM * widthM : 0);
}
