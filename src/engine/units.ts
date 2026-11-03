/** Unit constants and helpers. All engine maths runs in SI (metre, m², m³, kg). */

export const CFT_PER_M3 = 35.3147;
export const SQFT_PER_M2 = 10.7639;
export const FT_PER_M = 3.28084;
export const BRASS_CFT = 100; // 1 brass = 100 cft (used for sand / aggregate in India)
export const CEMENT_BAG_KG = 50;
export const CEMENT_DENSITY = 1440; // kg/m³ (loose)
export const CEMENT_BAG_M3 = CEMENT_BAG_KG / CEMENT_DENSITY; // 0.03472 m³

export type LengthUnit = "m" | "ft";

/** Convert a length in the given unit to metres. */
export function toM(value: number, unit: LengthUnit): number {
  return unit === "m" ? value : value / FT_PER_M;
}

/** Convert an area in m² or sqft to m². */
export function areaToM2(value: number, unit: LengthUnit): number {
  return unit === "m" ? value : value / SQFT_PER_M2;
}

export const m3ToCft = (m3: number) => m3 * CFT_PER_M3;
export const cftToM3 = (cft: number) => cft / CFT_PER_M3;
export const m2ToSqft = (m2: number) => m2 * SQFT_PER_M2;
export const sqftToM2 = (sqft: number) => sqft / SQFT_PER_M2;
export const m3ToBrass = (m3: number) => m3ToCft(m3) / BRASS_CFT;

/**
 * Parse a feet-inch string such as 13'-8", 13' 8", 13-8, 13.5 or 13'.
 * Returns metres, or NaN when the text cannot be read.
 */
export function parseFtIn(text: string): number {
  const t = text.trim().replace(/[″”]/g, '"').replace(/[′’]/g, "'");
  if (!t) return NaN;
  const m = t.match(
    /^(\d+(?:\.\d+)?)\s*(?:'|ft)?\s*[-\s]?\s*(?:(\d+(?:\.\d+)?)\s*(?:"|in)?)?$/i,
  );
  if (!m) return NaN;
  const feet = parseFloat(m[1]);
  const inches = m[2] ? parseFloat(m[2]) : 0;
  if (inches >= 12) return NaN;
  return (feet + inches / 12) / FT_PER_M;
}

/** Format metres as feet-inch, e.g. 4.166 -> 13'-8". */
export function formatFtIn(metres: number): string {
  const totalIn = Math.round(metres * FT_PER_M * 12);
  const ft = Math.floor(totalIn / 12);
  const inch = totalIn - ft * 12;
  return `${ft}'-${inch}"`;
}

/** Round to a number of decimals (avoids floating noise in results). */
export function round(value: number, decimals = 2): number {
  const f = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * f) / f;
}

/** Round up, ignoring floating-point noise (60.000000001 → 60, not 61). */
export function ceilSafe(value: number): number {
  return Math.ceil(round(value, 6));
}

/** Indian digit grouping: 3640723 -> 36,40,723. */
export function inr(value: number, decimals = 0): string {
  const neg = value < 0;
  const fixed = Math.abs(value).toFixed(decimals);
  const [intPart, dec] = fixed.split(".");
  let out = intPart;
  if (intPart.length > 3) {
    const last3 = intPart.slice(-3);
    const rest = intPart.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    out = `${rest},${last3}`;
  }
  return `${neg ? "-" : ""}${out}${dec ? "." + dec : ""}`;
}

export const rupees = (value: number) => `₹${inr(value)}`;

/** Short Indian money words: 3640723 -> "36.41 lakh". */
export function lakhWords(value: number): string {
  if (value >= 1e7) return `${round(value / 1e7, 2)} crore`;
  if (value >= 1e5) return `${round(value / 1e5, 2)} lakh`;
  return inr(value);
}
