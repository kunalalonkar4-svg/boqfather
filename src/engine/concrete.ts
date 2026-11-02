import { CalcResult, Step } from "./types";
import { CEMENT_BAG_KG, CEMENT_BAG_M3, m3ToCft, round } from "./units";

/** Nominal mixes (cement : sand : aggregate) as used in Indian practice / IS 456 nominal mix table. */
export const MIXES = {
  M5: [1, 5, 10],
  "M7.5": [1, 4, 8],
  M10: [1, 3, 6],
  M15: [1, 2, 4],
  M20: [1, 1.5, 3],
  M25: [1, 1, 2],
} as const;
export type MixGrade = keyof typeof MIXES;

export interface ConcreteInput {
  /** Wet (finished) concrete volume in m³. */
  volumeM3: number;
  grade: MixGrade;
  /** Dry volume factor; 1.54 is the standard value for concrete. */
  dryFactor?: number;
  wastagePct?: number;
}

export interface ConcreteValues {
  wetVolumeM3: number;
  dryVolumeM3: number;
  cementBags: number;
  cementKg: number;
  sandM3: number;
  sandCft: number;
  aggregateM3: number;
  aggregateCft: number;
}

export function calcConcrete(input: ConcreteInput): CalcResult<ConcreteValues> {
  const { volumeM3, grade } = input;
  const dryFactor = input.dryFactor ?? 1.54;
  const wastage = (input.wastagePct ?? 2) / 100;
  const [c, s, a] = MIXES[grade];
  const parts = c + s + a;
  const dry = volumeM3 * dryFactor * (1 + wastage);
  const cementM3 = (dry * c) / parts;
  const cementBags = cementM3 / CEMENT_BAG_M3;
  const sandM3 = (dry * s) / parts;
  const aggM3 = (dry * a) / parts;

  const steps: Step[] = [
    { label: "Wet volume of concrete", value: `${round(volumeM3, 3)} m³` },
    {
      label: "Dry volume (with wastage)",
      formula: `${round(volumeM3, 3)} × ${dryFactor} × (1 + ${round(wastage * 100, 1)}%)`,
      value: `${round(dry, 3)} m³`,
    },
    { label: `Mix ${grade}`, formula: `${c} : ${s} : ${a} → total parts`, value: `${parts}` },
    { label: "Cement volume", formula: `${round(dry, 3)} × ${c} / ${parts}`, value: `${round(cementM3, 3)} m³` },
    {
      label: "Cement bags",
      formula: `${round(cementM3, 3)} ÷ ${round(CEMENT_BAG_M3, 4)} m³ per bag`,
      value: `${round(cementBags, 2)} bags`,
    },
    { label: "Sand", formula: `${round(dry, 3)} × ${s} / ${parts}`, value: `${round(sandM3, 3)} m³ = ${round(m3ToCft(sandM3), 1)} cft` },
    { label: "Aggregate", formula: `${round(dry, 3)} × ${a} / ${parts}`, value: `${round(aggM3, 3)} m³ = ${round(m3ToCft(aggM3), 1)} cft` },
  ];

  return {
    values: {
      wetVolumeM3: volumeM3,
      dryVolumeM3: dry,
      cementBags,
      cementKg: cementBags * CEMENT_BAG_KG,
      sandM3,
      sandCft: m3ToCft(sandM3),
      aggregateM3: aggM3,
      aggregateCft: m3ToCft(aggM3),
    },
    steps,
    assumptions: [
      `Nominal mix ${grade} (${c}:${s}:${a}); for design mixes use the mix design proportions.`,
      `Dry volume factor ${dryFactor} (voids + shrinkage).`,
      `Cement bag 50 kg = ${round(CEMENT_BAG_M3, 4)} m³ (density 1440 kg/m³).`,
      `Wastage ${round(wastage * 100, 1)}%.`,
    ],
  };
}
