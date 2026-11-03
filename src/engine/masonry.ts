import { CalcResult, Step } from "./types";
import { CEMENT_BAG_M3, ceilSafe, m3ToCft, round } from "./units";

export const BRICK_SIZES = {
  modular: { l: 0.19, w: 0.09, h: 0.09, name: "Modular 190 × 90 × 90 mm" },
  standard: {
    l: 0.23,
    w: 0.11,
    h: 0.075,
    name: "Traditional 230 × 110 × 75 mm",
  },
  fly_ash: { l: 0.23, w: 0.1, h: 0.075, name: "Fly ash 230 × 100 × 75 mm" },
} as const;
export type BrickSize = keyof typeof BRICK_SIZES;

export const MORTAR_RATIOS = {
  "1:3": 3,
  "1:4": 4,
  "1:5": 5,
  "1:6": 6,
} as const;
export type MortarRatio = keyof typeof MORTAR_RATIOS;

/* ------------------------------------------------------------------ brickwork */

export interface BrickworkInput {
  lengthM: number;
  heightM: number;
  thicknessM: number;
  /** Total opening area (doors, windows) to deduct, m². */
  openingsM2?: number;
  brick: BrickSize;
  jointM?: number;
  ratio: MortarRatio;
  brickWastagePct?: number;
  /** Dry volume factor for masonry mortar (1.33 incl. frog filling). */
  mortarDryFactor?: number;
}

export interface BrickworkValues {
  volumeM3: number;
  bricks: number;
  bricksWithWastage: number;
  mortarWetM3: number;
  mortarDryM3: number;
  cementBags: number;
  sandM3: number;
  sandCft: number;
}

export function calcBrickwork(
  input: BrickworkInput,
): CalcResult<BrickworkValues> {
  const t = input.jointM ?? 0.01;
  const b = BRICK_SIZES[input.brick];
  const openings = input.openingsM2 ?? 0;
  const gross = input.lengthM * input.heightM * input.thicknessM;
  const deduct = openings * input.thicknessM;
  const volume = Math.max(0, gross - deduct);
  const withMortar = (b.l + t) * (b.w + t) * (b.h + t);
  const bricks = volume / withMortar;
  const brickVol = b.l * b.w * b.h;
  const mortarWet = Math.max(0, volume - bricks * brickVol);
  const dryFactor = input.mortarDryFactor ?? 1.33;
  const mortarDry = mortarWet * dryFactor;
  const sandParts = MORTAR_RATIOS[input.ratio];
  const cementM3 = mortarDry / (1 + sandParts);
  const sandM3 = (mortarDry * sandParts) / (1 + sandParts);
  const wastage = (input.brickWastagePct ?? 5) / 100;

  const steps: Step[] = [
    {
      label: "Wall volume",
      formula: `${round(input.lengthM, 3)} × ${round(input.heightM, 3)} × ${input.thicknessM}`,
      value: `${round(gross, 3)} m³`,
    },
    ...(openings > 0
      ? [
          {
            label: "Less openings",
            formula: `${round(openings, 2)} m² × ${input.thicknessM}`,
            value: `−${round(deduct, 3)} m³`,
          },
        ]
      : []),
    { label: "Net brickwork", value: `${round(volume, 3)} m³` },
    {
      label: "One brick with mortar",
      formula: `(${b.l}+${t}) × (${b.w}+${t}) × (${b.h}+${t})`,
      value: `${round(withMortar, 6)} m³`,
    },
    {
      label: "Number of bricks",
      formula: `${round(volume, 3)} ÷ ${round(withMortar, 6)}`,
      value: `${ceilSafe(bricks)} nos`,
    },
    {
      label: "With breakage",
      formula: `${ceilSafe(bricks)} × (1 + ${round(wastage * 100, 1)}%)`,
      value: `${ceilSafe(bricks * (1 + wastage))} nos`,
    },
    {
      label: "Wet mortar",
      formula: `${round(volume, 3)} − ${round(bricks, 1)} × ${round(brickVol, 6)}`,
      value: `${round(mortarWet, 3)} m³`,
    },
    {
      label: "Dry mortar",
      formula: `${round(mortarWet, 3)} × ${dryFactor}`,
      value: `${round(mortarDry, 3)} m³`,
    },
    {
      label: `Cement (${input.ratio})`,
      formula: `${round(mortarDry, 3)} ÷ ${1 + sandParts} ÷ ${round(CEMENT_BAG_M3, 4)}`,
      value: `${round(cementM3 / CEMENT_BAG_M3, 2)} bags`,
    },
    {
      label: "Sand",
      formula: `${round(mortarDry, 3)} × ${sandParts} / ${1 + sandParts}`,
      value: `${round(sandM3, 3)} m³ = ${round(m3ToCft(sandM3), 1)} cft`,
    },
  ];

  return {
    values: {
      volumeM3: volume,
      bricks: ceilSafe(bricks),
      bricksWithWastage: ceilSafe(bricks * (1 + wastage)),
      mortarWetM3: mortarWet,
      mortarDryM3: mortarDry,
      cementBags: cementM3 / CEMENT_BAG_M3,
      sandM3,
      sandCft: m3ToCft(sandM3),
    },
    steps,
    assumptions: [
      `Brick: ${b.name}, mortar joint ${round(t * 1000)} mm.`,
      `Mortar dry volume factor ${dryFactor} (includes frog filling and bulking).`,
      `Brick breakage ${round(wastage * 100, 1)}%.`,
      "Openings deducted in full (IS 1200: openings up to 0.1 m² are not deducted).",
    ],
  };
}

/* ------------------------------------------------------------------ plaster */

export interface PlasterInput {
  areaM2: number;
  thicknessMm: number;
  ratio: MortarRatio;
  /** Extra for joints, uneven surface and wastage (20% standard). */
  extraPct?: number;
  dryFactor?: number;
}

export interface PlasterValues {
  wetM3: number;
  dryM3: number;
  cementBags: number;
  sandM3: number;
  sandCft: number;
}

export function calcPlaster(input: PlasterInput): CalcResult<PlasterValues> {
  const thk = input.thicknessMm / 1000;
  const extra = (input.extraPct ?? 20) / 100;
  const dryFactor = input.dryFactor ?? 1.27;
  const wet = input.areaM2 * thk;
  const wetPlus = wet * (1 + extra);
  const dry = wetPlus * dryFactor;
  const sandParts = MORTAR_RATIOS[input.ratio];
  const cementM3 = dry / (1 + sandParts);
  const sandM3 = (dry * sandParts) / (1 + sandParts);

  return {
    values: {
      wetM3: wet,
      dryM3: dry,
      cementBags: cementM3 / CEMENT_BAG_M3,
      sandM3,
      sandCft: m3ToCft(sandM3),
    },
    steps: [
      { label: "Plaster area", value: `${round(input.areaM2, 2)} m²` },
      {
        label: "Wet mortar",
        formula: `${round(input.areaM2, 2)} × ${thk}`,
        value: `${round(wet, 3)} m³`,
      },
      {
        label: "Add for joints / uneven surface",
        formula: `${round(wet, 3)} × (1 + ${round(extra * 100)}%)`,
        value: `${round(wetPlus, 3)} m³`,
      },
      {
        label: "Dry mortar",
        formula: `${round(wetPlus, 3)} × ${dryFactor}`,
        value: `${round(dry, 3)} m³`,
      },
      {
        label: `Cement (${input.ratio})`,
        formula: `${round(dry, 3)} ÷ ${1 + sandParts} ÷ ${round(CEMENT_BAG_M3, 4)}`,
        value: `${round(cementM3 / CEMENT_BAG_M3, 2)} bags`,
      },
      {
        label: "Sand",
        formula: `${round(dry, 3)} × ${sandParts} / ${1 + sandParts}`,
        value: `${round(sandM3, 3)} m³ = ${round(m3ToCft(sandM3), 1)} cft`,
      },
    ],
    assumptions: [
      `Thickness ${input.thicknessMm} mm, mix ${input.ratio}.`,
      `${round(extra * 100)}% added for filling joints, uneven surface and wastage.`,
      `Dry volume factor ${dryFactor}.`,
    ],
  };
}
