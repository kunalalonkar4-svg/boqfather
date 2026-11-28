import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ELEVATIONS, designOf, elevationForDesign, elevationImage } from "./elevations";
import { DESIGNS, NAKSHE } from "./naksha";

describe("elevation catalogue", () => {
  it("gives every plot and house/shop design its own elevation", () => {
    const assigned = DESIGNS.map((n) => elevationForDesign(n));
    expect(assigned.every(Boolean)).toBe(true);
    expect(new Set(assigned.map((x) => x?.n)).size).toBe(DESIGNS.length);
    expect(ELEVATIONS.every((x) => Boolean(designOf(x.plot)))).toBe(true);
  });

  it("uses the same plot/type elevation for each road direction", () => {
    for (const n of NAKSHE) {
      const x = elevationForDesign(n);
      expect(x?.plot).toBe(`${n.plot.w}x${n.plot.d}${n.kind === "shop" ? "-shop" : ""}`);
    }
  });

  it("ships unique full images and complete thumbnail assets", () => {
    const hashes = ELEVATIONS.map((x) => {
      for (const small of [false, true]) {
        expect(existsSync(join(process.cwd(), "public", elevationImage(x, small)))).toBe(true);
      }
      return createHash("sha256").update(readFileSync(join(process.cwd(), "public", elevationImage(x)))).digest("hex");
    });
    expect(new Set(hashes).size).toBe(ELEVATIONS.length);
    expect(new Set(ELEVATIONS.map((x) => x.slug)).size).toBe(ELEVATIONS.length);
  });
});
