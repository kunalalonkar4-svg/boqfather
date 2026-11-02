import { CalcResult } from "./types";
import { m3ToBrass, m3ToCft, round } from "./units";

export interface ExcavationInput {
  lengthM: number;
  widthM: number;
  depthM: number;
  nos: number;
  /** Working space added on each side, m. */
  workingSpaceM?: number;
  /** Bulking of excavated soil (loose volume for disposal), %. */
  swellPct?: number;
  ratePerM3?: number;
}

export function calcExcavation(input: ExcavationInput): CalcResult<{
  volumeM3: number;
  volumeCft: number;
  brass: number;
  looseM3: number;
  cost: number;
}> {
  const ws = input.workingSpaceM ?? 0;
  const L = input.lengthM + 2 * ws;
  const B = input.widthM + 2 * ws;
  const vol = L * B * input.depthM * input.nos;
  const swell = (input.swellPct ?? 25) / 100;
  const loose = vol * (1 + swell);
  const cost = vol * (input.ratePerM3 ?? 0);
  return {
    values: { volumeM3: vol, volumeCft: m3ToCft(vol), brass: m3ToBrass(vol), looseM3: loose, cost },
    steps: [
      ...(ws > 0 ? [{ label: "Size with working space", formula: `(${input.lengthM} + 2×${ws}) × (${input.widthM} + 2×${ws})`, value: `${round(L, 2)} × ${round(B, 2)} m` }] : []),
      { label: "Excavation volume", formula: `${round(L, 2)} × ${round(B, 2)} × ${input.depthM} × ${input.nos}`, value: `${round(vol, 3)} m³` },
      { label: "In cft / brass", formula: `${round(vol, 3)} × 35.315`, value: `${round(m3ToCft(vol), 1)} cft = ${round(m3ToBrass(vol), 2)} brass` },
      { label: "Loose soil to dispose", formula: `${round(vol, 3)} × (1 + ${round(swell * 100)}%)`, value: `${round(loose, 2)} m³` },
    ],
    assumptions: [
      `Working space ${ws} m each side.`,
      `Soil bulking ${round(swell * 100)}% (ordinary soil 20–30%, rock more).`,
      "Vertical sides assumed; add for slopes / shoring in deep or loose soil.",
    ],
  };
}
