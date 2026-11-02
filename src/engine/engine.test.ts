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
  it("1000 sqft G+1 standard tier-2 = 2000 × 1700", () => {
    const r = calcHouse({ areaPerFloorSqft: 1000, floors: 2, quality: "standard", location: "tier2" });
    expect(r.values.total).toBe(3_400_000);
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
    expect(r.geometry.builtUpSqftPerFloor).toBeLessThan(1300);
    const steel = r.thumb.find((t) => t.key === "steel")!;
    expect(steel.qty / r.geometry.builtUpSqft).toBeGreaterThan(2.5);
    expect(steel.qty / r.geometry.builtUpSqft).toBeLessThan(5);
    const cement = r.thumb.find((t) => t.key === "cement")!;
    expect(cement.qty / r.geometry.builtUpSqft).toBeGreaterThan(0.33);
    expect(cement.qty / r.geometry.builtUpSqft).toBeLessThan(0.5);
    expect(r.perSqft).toBeGreaterThan(1200);
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
    for (const s of r.sections) for (const i of s.items) expect(i.rows.reduce((a, x) => a + x.q, 0)).toBeCloseTo(i.qty, Math.max(0, i.dec - 1));
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
    const a = checkQuote({ builtUpSqft: 2000, quality: "standard", location: "tier2", scope: "turnkey", mode: "sqft", quote: 1870 });
    const b = checkQuote({ builtUpSqft: 2000, quality: "standard", location: "tier2", scope: "turnkey", mode: "lump", quote: 3_740_000 });
    expect(a.benchPerSqft).toBe(1700);
    expect(a.diffPct).toBeCloseTo(10, 5);
    expect(b.quotePerSqft).toBe(1870);
    expect(a.verdict).toBe("slightly_high");
    expect(a.diffAmount).toBe(340_000);
  });
  it("flags item rates", () => {
    const r = checkQuote({ builtUpSqft: 1000, quality: "standard", location: "tier2", scope: "labour", mode: "sqft", quote: 420, items: { steel: 90, cement: 380, tiles: 80 } });
    expect(r.verdict).toBe("fair");
    expect(Object.fromEntries(r.items.map((i) => [i.key, i.status]))).toEqual({ steel: "high", cement: "ok", tiles: "low" });
  });
});

describe("floor-wise rooms", () => {
  const gf = [
    { type: "parking", L: 5.4, B: 3.0 },
    { type: "hall", L: 4.5, B: 3.9 },
    { type: "kitchen", L: 3, B: 2.7 },
    { type: "bedroom", L: 3.6, B: 3.3 },
    { type: "toilet", L: 2.4, B: 1.5, wc: "iwc" },
  ] as const;
  const ff = [
    { type: "bedroom", L: 3.6, B: 3.3 },
    { type: "toilet", L: 2.4, B: 1.5 },
  ] as const;
  it("G only gives one floor, G+1 adds the first floor's own rooms", () => {
    const g = calcBoq({ floorRooms: [[...gf]] });
    const g1 = calcBoq({ floorRooms: [[...gf], [...ff]] });
    expect(g.geometry.perFloor).toHaveLength(1);
    expect(g1.geometry.perFloor).toHaveLength(2);
    expect(g1.geometry.perFloor[1].builtUpSqft).toBeLessThan(g1.geometry.perFloor[0].builtUpSqft);
    expect(g1.grandTotal).toBeGreaterThan(g.grandTotal);
    expect(g1.geometry.builtUpSqft).toBeCloseTo(
      g1.geometry.perFloor.reduce((a, p) => a + p.builtUpSqft, 0),
      5,
    );
  });
  it("WC choice, windows and room-driven items", () => {
    const r = calcBoq({ floorRooms: [[...gf], [...ff]] });
    const all = r.sections.flatMap((s) => s.items);
    expect(all.find((i) => i.rateKey === "iwc")!.qty).toBe(1);
    expect(all.find((i) => i.rateKey === "ewc")!.qty).toBe(1);
    expect(all.find((i) => i.rateKey === "sink")!.qty).toBe(1);
    const more = calcBoq({ floorRooms: [[...gf.map((x) => (x.type === "hall" ? { ...x, windows: 4 } : x))], [...ff]] });
    const win = (b: typeof r) => b.sections.flatMap((s) => s.items).find((i) => i.rateKey === "alwin")!.qty;
    expect(win(more)).toBeGreaterThan(win(r));
  });
  it("smaller upper floor leaves an open terrace with parapet; no stair when G only without terrace", () => {
    const r = calcBoq({ floorRooms: [[...gf], [...ff]] });
    const para = r.sections.find((s) => s.code === "C")!.items.find((i) => i.desc.startsWith("Parapet"))!;
    expect(para.rows.length).toBe(2);
    const g = calcBoq({ floorRooms: [[...gf]], spec: { stairToTerrace: false } });
    expect(g.sections.some((s) => s.title.en.startsWith("Staircase"))).toBe(false);
  });
  it("every item's measurement rows add up", () => {
    const r = calcBoq({ floorRooms: [[...gf], [...ff], [...ff]], spec: { floorH: 3.2 } });
    for (const s of r.sections) for (const i of s.items) expect(i.rows.reduce((a, x) => a + x.q, 0)).toBeCloseTo(i.qty, Math.max(0, i.dec - 1));
  });
});

import { buildPlan, fitPlot, loanPlan } from "./index";

describe("advanced BOQ", () => {
  const fr = calcBoq({ floors: 2, plan: { bedrooms: 2, toilets: 2, kitchen: true, dining: true, balconies: 1 } });
  it("BBS steel is in the usual 2.5–4 kg/sqft band and drives the steel item", () => {
    const kg = fr.materials.find((m) => m.key === "steel")!.qty;
    expect(kg / fr.geometry.builtUpSqft).toBeGreaterThan(2.5);
    expect(kg / fr.geometry.builtUpSqft).toBeLessThan(4);
    const item = fr.sections.flatMap((s) => s.items).find((i) => i.rateKey === "steel")!;
    expect(item.qty).toBeCloseTo(fr.bbs.total, 0);
  });
  it("quality and wall material change the cost in the right direction", () => {
    const plan = { bedrooms: 2, toilets: 2, kitchen: true, dining: true, balconies: 0 };
    const b = calcBoq({ floors: 2, plan, spec: { quality: "basic" } }).grandTotal;
    const s = calcBoq({ floors: 2, plan }).grandTotal;
    const p = calcBoq({ floors: 2, plan, spec: { quality: "premium" } }).grandTotal;
    expect(b).toBeLessThan(s);
    expect(p).toBeGreaterThan(s);
    const aac = calcBoq({ floors: 2, plan, spec: { wall: "aac" } });
    expect(aac.materials.some((m) => m.key === "blocks")).toBe(true);
    expect(aac.materials.some((m) => m.key === "bricks")).toBe(false);
  });
  it("imported rate set is used as is", () => {
    const r = calcBoq({ floors: 1, plan: { bedrooms: 1, toilets: 1, kitchen: true, dining: false, balconies: 0 }, rateSet: { rcc: 9000 }, locationFactor: 1.15 });
    expect(r.sections.flatMap((s) => s.items).find((i) => i.rateKey === "rcc")!.rate).toBe(9000);
  });
  it("external works add a section", () => {
    const r = calcBoq({
      floors: 1,
      plan: { bedrooms: 2, toilets: 1, kitchen: true, dining: false, balconies: 0 },
      extras: { boundary: { length: 30, height: 1.5 }, septic: { users: 6 }, borewell: { depthFt: 200, pump: true } },
    });
    const last = r.sections.at(-1)!;
    expect(last.title.en).toBe("External works and services");
    expect(last.items.length).toBe(8);
  });
  it("plan stages add up to the grand total; loan splits own money and loan", () => {
    const p = buildPlan(fr);
    expect(p.stages.reduce((a, s) => a + s.amount, 0)).toBeCloseTo(fr.grandTotal, -1);
    expect(p.months.at(-1)!.cumulative).toBeCloseTo(fr.grandTotal, -2);
    const l = loanPlan(p, fr.grandTotal, 2_000_000, 8.5, 20);
    expect(l.emi).toBeGreaterThan(17000);
    expect(l.emi).toBeLessThan(18000);
    expect(l.construction.at(-1)!.disbursed).toBeCloseTo(2_000_000, -2);
  });
  it("plot fit sizes rooms to the buildable area and flags small plots", () => {
    const ft = (x: number) => x / 3.28084;
    const big = fitPlot({ plotL: ft(60), plotB: ft(40), front: ft(10), back: ft(5), side: ft(5), bhk: 3, floors: 2, parking: false });
    expect(big.warnings).toHaveLength(0);
    const r = calcBoq({ floorRooms: big.floorRooms, spec: { aspect: big.buildL / big.buildB, buildableM2: big.buildArea, widthM: big.buildB } });
    expect(r.warnings).toHaveLength(0);
    expect(r.geometry.perFloor[0].areaM2).toBeLessThanOrEqual(big.buildArea * 1.02);
    const small = fitPlot({ plotL: ft(30), plotB: ft(20), front: ft(5), back: ft(3), side: ft(3), bhk: 3, floors: 1, parking: true });
    expect(small.warnings.length).toBeGreaterThan(0);
  });
  it("sketch places every room inside the outline", () => {
    for (const s of fr.sketch)
      for (const x of s.rects) {
        expect(x.x + x.w).toBeLessThanOrEqual(s.L + 1e-6);
        expect(x.y + x.h).toBeLessThanOrEqual(s.B + 1e-6);
      }
  });
});

describe("plot and building-code checks", () => {
  it("flags rooms below NBC minimum and a house bigger than the plot", () => {
    const r = calcBoq({
      floorRooms: [
        [
          { type: "hall", L: 3.0, B: 3.0 },
          { type: "bedroom", L: 2.7, B: 2.2 },
          { type: "passage", L: 3, B: 0.8 },
        ],
      ],
      spec: { buildableM2: 15 },
    });
    const en = r.warnings.map((w) => w.en).join(" | ");
    expect(en).toContain("plot allows only");
    expect(en).toContain("H1");
    expect(en).toContain("BR1");
    expect(en).toContain("P1");
    expect(r.warnings.every((w) => w.hi.length > 0)).toBe(true);
  });
  it("plot fit keeps passages 1 m wide and bedrooms at NBC size", () => {
    const ft = (x: number) => x / 3.28084;
    const p = fitPlot({ plotL: ft(40), plotB: ft(30), front: ft(5), back: ft(3), side: ft(3), bhk: 2, floors: 1, parking: true });
    const r = calcBoq({ floorRooms: p.floorRooms });
    expect(r.warnings).toHaveLength(0);
  });
  it("plan: stair at the front right on every floor, bedrooms at the back, hall at the front", () => {
    const r = calcBoq({ floors: 3, plan: { bedrooms: 2, toilets: 2, kitchen: true, dining: true, balconies: 1 } });
    for (const sk of r.sketch) {
      const st = sk.rects.find((x) => x.type === "stair")!;
      expect(st.x + st.w).toBeCloseTo(sk.L - 0.23, 5);
      expect(st.y + st.h).toBeCloseTo(sk.B - 0.23, 5);
      const hall = sk.rects.find((x) => x.type === "hall")!;
      const bed = sk.rects.find((x) => x.type === "bedroom")!;
      expect(bed.y).toBeLessThan(hall.y);
      for (const x of sk.rects) {
        expect(x.x + x.w).toBeLessThanOrEqual(sk.L + 1e-6);
        expect(x.y + x.h).toBeLessThanOrEqual(sk.B + 1e-6);
      }
    }
    expect(r.sketch[0].rects.find((x) => x.type === "hall")!.doors!.some((d) => d.main)).toBe(true);
  });
});

describe("architect plan rules", () => {
  const cases = [
    { floors: 2, plan: { bedrooms: 2, toilets: 2, kitchen: true, dining: true, balconies: 1 } },
    { floors: 1, plan: { bedrooms: 3, toilets: 3, kitchen: true, dining: true, balconies: 0 } },
    { floors: 2, plan: { bedrooms: 1, toilets: 1, kitchen: true, dining: false, balconies: 1 } },
  ];
  for (const c of cases)
    it(`every room is reachable and nothing overlaps (${c.plan.bedrooms}BHK, ${c.floors} floor)`, () => {
      const r = calcBoq(c);
      for (const sk of r.sketch) {
        const sp = sk.rects.filter((x) => x.type !== "column");
        for (const x of sp) if (!["corridor", "balcony", "open"].includes(x.type)) expect(x.doors?.length ?? 0, `${x.key} has no door`).toBeGreaterThan(0);
        for (let i = 0; i < sp.length; i++)
          for (let j = i + 1; j < sp.length; j++) {
            const a = sp[i],
              b = sp[j];
            const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
            const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
            expect(ox > 0.01 && oy > 0.01, `${a.key} overlaps ${b.key}`).toBe(false);
          }
      }
    });
});
