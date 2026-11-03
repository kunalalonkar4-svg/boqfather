import { CalcResult } from "./types";
import { ceilSafe, round } from "./units";

/** Weight of a steel bar per metre: d² / 162 kg/m (d in mm). */
export const barKgPerM = (diaMm: number) => (diaMm * diaMm) / 162;

export const BAR_DIAS = [6, 8, 10, 12, 16, 20, 25, 32] as const;

export interface BarWeightInput {
  diaMm: number;
  lengthM: number;
  nos: number;
}

export function calcBarWeight(
  input: BarWeightInput,
): CalcResult<{
  kgPerM: number;
  totalLengthM: number;
  kg: number;
  bars12m: number;
}> {
  const kgPerM = barKgPerM(input.diaMm);
  const totalLength = input.lengthM * input.nos;
  const kg = totalLength * kgPerM;
  const bars12m = ceilSafe(totalLength / 12);
  return {
    values: { kgPerM, totalLengthM: totalLength, kg, bars12m },
    steps: [
      {
        label: "Weight per metre",
        formula: `${input.diaMm}² ÷ 162`,
        value: `${round(kgPerM, 3)} kg/m`,
      },
      {
        label: "Total length",
        formula: `${round(input.lengthM, 3)} × ${input.nos}`,
        value: `${round(totalLength, 2)} m`,
      },
      {
        label: "Weight",
        formula: `${round(totalLength, 2)} × ${round(kgPerM, 3)}`,
        value: `${round(kg, 2)} kg`,
      },
      {
        label: "12 m bars to buy",
        formula: `${round(totalLength, 2)} ÷ 12, rounded up`,
        value: `${bars12m} nos`,
      },
    ],
    assumptions: [
      "Unit weight d²/162 kg/m (steel density 7850 kg/m³).",
      "Laps, hooks and wastage not included unless in the length.",
    ],
  };
}

/** Typical steel per m³ of concrete by member (thumb rule, residential RCC). */
export const MEMBER_KG_PER_M3 = {
  footing: 80,
  column: 180,
  plinth_beam: 120,
  beam: 150,
  slab: 90,
  staircase: 90,
} as const;
export type Member = keyof typeof MEMBER_KG_PER_M3;

export function calcMemberSteel(input: {
  member: Member;
  concreteM3: number;
  kgPerM3?: number;
  wastagePct?: number;
}) {
  const k = input.kgPerM3 ?? MEMBER_KG_PER_M3[input.member];
  const w = (input.wastagePct ?? 5) / 100;
  const net = input.concreteM3 * k;
  const kg = net * (1 + w);
  return {
    values: { kgPerM3: k, netKg: net, kg },
    steps: [
      { label: "Concrete volume", value: `${round(input.concreteM3, 3)} m³` },
      {
        label: "Steel",
        formula: `${round(input.concreteM3, 3)} × ${k} kg/m³`,
        value: `${round(net, 1)} kg`,
      },
      {
        label: "With laps / wastage",
        formula: `${round(net, 1)} × (1 + ${round(w * 100)}%)`,
        value: `${round(kg, 1)} kg`,
      },
    ],
    assumptions: [
      `Thumb rule ${k} kg of steel per m³ of ${input.member.replace("_", " ")} concrete.`,
      "Actual steel comes from the structural drawing / bar bending schedule.",
    ],
  } satisfies CalcResult<{ kgPerM3: number; netKg: number; kg: number }>;
}

export function calcAreaSteel(input: {
  builtUpSqft: number;
  kgPerSqft?: number;
}) {
  const k = input.kgPerSqft ?? 4;
  const kg = input.builtUpSqft * k;
  return {
    values: { kgPerSqft: k, kg, tonnes: kg / 1000 },
    steps: [
      {
        label: "Steel",
        formula: `${round(input.builtUpSqft)} sqft × ${k} kg/sqft`,
        value: `${round(kg)} kg = ${round(kg / 1000, 2)} t`,
      },
    ],
    assumptions: [
      `Thumb rule ${k} kg per sqft of built-up area (typical range 3.5–4.5 for RCC framed houses).`,
    ],
  } satisfies CalcResult<{ kgPerSqft: number; kg: number; tonnes: number }>;
}
