import { describe, expect, it } from "vitest";
import {
  barKgPerM,
  calcAreaSteel,
  calcBarWeight,
  calcBrickwork,
  calcConcrete,
  calcExcavation,
  calcHouse,
  calcMemberSteel,
  calcPaint,
  calcPlaster,
  calcTiles,
  formatFtIn,
  inr,
  parseFtIn,
  PHASES,
} from "./index";

describe("units", () => {
  it("parses feet-inch text", () => {
    expect(parseFtIn(`13'-8"`)).toBeCloseTo(4.1656, 3);
    expect(parseFtIn("10")).toBeCloseTo(3.048, 3);
    expect(parseFtIn("9' 10\"")).toBeCloseTo(2.9972, 3);
    expect(Number.isNaN(parseFtIn("abc"))).toBe(true);
    expect(Number.isNaN(parseFtIn(`5'-14"`))).toBe(true);
  });
  it("formats feet-inch", () => {
    expect(formatFtIn(3.6)).toBe(`11'-10"`);
    expect(formatFtIn(11.1)).toBe(`36'-5"`);
  });
  it("groups Indian numbers", () => {
    expect(inr(3640723)).toBe("36,40,723");
    expect(inr(999)).toBe("999");
    expect(inr(100000)).toBe("1,00,000");
  });
});

describe("concrete", () => {
  it("M20 per m³ gives the textbook 8.06 bags, 0.42 m³ sand, 0.84 m³ aggregate", () => {
    const r = calcConcrete({ volumeM3: 1, grade: "M20", wastagePct: 0 });
    expect(r.values.dryVolumeM3).toBeCloseTo(1.54, 3);
    expect(r.values.cementBags).toBeCloseTo(8.064, 2);
    expect(r.values.sandM3).toBeCloseTo(0.42, 3);
    expect(r.values.aggregateM3).toBeCloseTo(0.84, 3);
  });
  it("M15 (1:2:4) per m³ gives 6.34 bags", () => {
    const r = calcConcrete({ volumeM3: 1, grade: "M15", wastagePct: 0 });
    expect(r.values.cementBags).toBeCloseTo(6.336, 2);
  });
  it("adds wastage", () => {
    const r = calcConcrete({ volumeM3: 1, grade: "M20", wastagePct: 5 });
    expect(r.values.cementBags).toBeCloseTo(8.064 * 1.05, 2);
  });
});

describe("brickwork", () => {
  it("modular bricks: 500 per m³ and about 1.26 bags cement in CM 1:6", () => {
    const r = calcBrickwork({ lengthM: 1, heightM: 1, thicknessM: 1, brick: "modular", ratio: "1:6", brickWastagePct: 0 });
    expect(r.values.bricks).toBe(500);
    expect(r.values.cementBags).toBeCloseTo(1.26, 1);
  });
  it("deducts openings", () => {
    const a = calcBrickwork({ lengthM: 4, heightM: 3, thicknessM: 0.23, brick: "modular", ratio: "1:6" });
    const b = calcBrickwork({ lengthM: 4, heightM: 3, thicknessM: 0.23, openingsM2: 2, brick: "modular", ratio: "1:6" });
    expect(a.values.volumeM3 - b.values.volumeM3).toBeCloseTo(0.46, 3);
  });
});

describe("plaster", () => {
  it("100 m², 12 mm, 1:6 needs about 7.5 bags", () => {
    const r = calcPlaster({ areaM2: 100, thicknessMm: 12, ratio: "1:6" });
    expect(r.values.cementBags).toBeCloseTo(7.53, 1);
    expect(r.values.sandM3).toBeCloseTo(1.568, 2);
  });
});

describe("steel", () => {
  it("unit weights by d²/162", () => {
    expect(barKgPerM(8)).toBeCloseTo(0.395, 3);
    expect(barKgPerM(12)).toBeCloseTo(0.889, 3);
    expect(barKgPerM(16)).toBeCloseTo(1.58, 2);
  });
  it("bar weight and 12 m bars", () => {
    const r = calcBarWeight({ diaMm: 12, lengthM: 3.953, nos: 24 });
    expect(r.values.kg).toBeCloseTo(84.33, 1);
    expect(r.values.bars12m).toBe(8);
  });
  it("member and area thumb rules", () => {
    expect(calcMemberSteel({ member: "column", concreteM3: 10, wastagePct: 0 }).values.kg).toBe(1800);
    expect(calcAreaSteel({ builtUpSqft: 1000 }).values.kg).toBe(4000);
  });
});

describe("tiles and paint", () => {
  it("tiles for 20 m² of 60x60", () => {
    const r = calcTiles({ areaM2: 20, size: "60x60", wastagePct: 8 });
    expect(r.values.tiles).toBe(60); // 55.6 × 1.08 = 60
    expect(r.values.boxes).toBe(15);
  });
  it("paint litres", () => {
    const r = calcPaint({ areaM2: 100, coats: 2, coverageSqftPerL: 120 });
    expect(r.values.paintL).toBeCloseTo((1076.39 * 2) / 120, 1);
  });
});

describe("excavation", () => {
  it("pits with working space and bulking", () => {
    const r = calcExcavation({ lengthM: 1.5, widthM: 1.5, depthM: 1.5, nos: 16, workingSpaceM: 0.2, swellPct: 25 });
    expect(r.values.volumeM3).toBeCloseTo(86.64, 2);
    expect(r.values.looseM3).toBeCloseTo(108.3, 1);
  });
});

describe("house cost", () => {
  it("1000 sqft G+1 standard tier-2 = 2000 × 1900", () => {
    const r = calcHouse({ areaPerFloorSqft: 1000, floors: 2, quality: "standard", location: "tier2" });
    expect(r.values.total).toBe(3_800_000);
    expect(r.values.materials.find((m) => m.key === "cement")!.qty).toBe(800);
    expect(r.values.materials.find((m) => m.key === "steel")!.qty).toBe(8000);
  });
  it("phases, split and payments each add up to the total", () => {
    const r = calcHouse({ areaPerFloorSqft: 1250, floors: 3, quality: "premium", location: "metro" });
    const sum = (xs: { amount: number }[]) => xs.reduce((a, x) => a + x.amount, 0);
    expect(PHASES.reduce((a, p) => a + p.pct, 0)).toBe(100);
    expect(sum(r.values.phases)).toBeCloseTo(r.values.total, 2);
    expect(sum(r.values.split)).toBeCloseTo(r.values.total, 2);
    expect(sum(r.values.payments)).toBeCloseTo(r.values.total, 2);
    expect(r.values.payments.at(-1)!.cumulative).toBeCloseTo(r.values.total, 2);
  });
});

import { calcBoq } from "./boq";

describe("room-based BOQ", () => {
  const base = { floors: 2, plan: { bedrooms: 2, toilets: 2, kitchen: true, dining: true, balconies: 0 } };
  it("2BHK G+1 lands in realistic ranges", () => {
    const r = calcBoq(base);
    const sum = r.sections.reduce((a, s) => a + s.subtotal, 0);
    expect(sum).toBe(r.itemsTotal);
    expect(r.grandTotal).toBe(r.itemsTotal + r.contingency);
    expect(r.geometry.builtUpSqftPerFloor).toBeGreaterThan(850);
    expect(r.geometry.builtUpSqftPerFloor).toBeLessThan(1150);
    const steel = r.thumb.find((t) => t.key === "steel")!;
    expect(steel.qty / r.geometry.builtUpSqft).toBeGreaterThan(3);
    expect(steel.qty / r.geometry.builtUpSqft).toBeLessThan(5);
    const cement = r.thumb.find((t) => t.key === "cement")!;
    expect(cement.qty / r.geometry.builtUpSqft).toBeGreaterThan(0.33);
    expect(cement.qty / r.geometry.builtUpSqft).toBeLessThan(0.5);
    expect(r.perSqft).toBeGreaterThan(1400);
    expect(r.perSqft).toBeLessThan(2400);
  });
  it("more bedrooms → bigger house and cost", () => {
    const a = calcBoq(base);
    const b = calcBoq({ ...base, plan: { ...base.plan, bedrooms: 3, toilets: 3 } });
    expect(b.geometry.builtUpSqft).toBeGreaterThan(a.geometry.builtUpSqft);
    expect(b.grandTotal).toBeGreaterThan(a.grandTotal);
  });
  it("rate override and location factor apply", () => {
    const a = calcBoq(base);
    const c = a.sections[1].items[0];
    const o = calcBoq({ ...base, rateOverrides: { [c.code]: 8000 } });
    expect(o.sections[1].items[0].amount).toBe(Math.round(c.qty * 8000));
    const f = calcBoq({ ...base, locationFactor: 1.1 });
    expect(f.itemsTotal).toBeGreaterThan(a.itemsTotal * 1.09);
  });
  it("every item has measurement rows that add up to its quantity", () => {
    const r = calcBoq({ floors: 3, plan: { bedrooms: 3, toilets: 2, kitchen: true, dining: false, balconies: 1 } });
    for (const s of r.sections)
      for (const i of s.items) expect(i.rows.reduce((a, x) => a + x.q, 0)).toBeCloseTo(i.qty, Math.max(0, i.dec - 1));
  });
});

import { checkQuote, verdictFor } from "./quote";

describe("quote checker", () => {
  it("verdict bands", () => {
    expect(verdictFor(-20)).toBe("too_low");
    expect(verdictFor(-10)).toBe("good");
    expect(verdictFor(0)).toBe("fair");
    expect(verdictFor(15)).toBe("slightly_high");
    expect(verdictFor(30)).toBe("high");
  });
  it("per sqft and lump sum agree", () => {
    const a = checkQuote({ builtUpSqft: 2000, quality: "standard", location: "tier2", scope: "turnkey", mode: "sqft", quote: 2090 });
    const b = checkQuote({ builtUpSqft: 2000, quality: "standard", location: "tier2", scope: "turnkey", mode: "lump", quote: 4_180_000 });
    expect(a.benchPerSqft).toBe(1900);
    expect(a.diffPct).toBeCloseTo(10, 5);
    expect(b.quotePerSqft).toBe(2090);
    expect(a.verdict).toBe("slightly_high");
    expect(a.diffAmount).toBe(380_000);
  });
  it("flags item rates", () => {
    const r = checkQuote({ builtUpSqft: 1000, quality: "standard", location: "tier2", scope: "labour", mode: "sqft", quote: 420, items: { steel: 90, cement: 380, tiles: 80 } });
    expect(r.verdict).toBe("fair");
    expect(Object.fromEntries(r.items.map((i) => [i.key, i.status]))).toEqual({ steel: "high", cement: "ok", tiles: "low" });
  });
});
