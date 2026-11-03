import { describe, expect, it } from "vitest";
import { unreachableSpaces } from "../engine";
import { NAKSHE, nakshaInfo, nakshaPlan } from "./naksha";

describe("naksha catalogue: every plan is sound and inside the plot", () => {
  for (const n of NAKSHE)
    it(n.slug, () => {
      const { fit, res } = nakshaPlan(n);
      expect(fit.warnings).toEqual([]);
      for (const sk of res.sketch) {
        expect(sk.L).toBeLessThanOrEqual(fit.buildB + 0.1);
        expect(sk.B).toBeLessThanOrEqual(fit.buildL + 0.1);
        const sp = sk.rects.filter((x) => x.type !== "column");
        for (const x of sp) {
          if (!["corridor", "balcony", "open", "hall"].includes(x.type))
            expect(x.doors?.length, `${x.key} door`).toBeGreaterThan(0);
          expect(x.x).toBeGreaterThanOrEqual(-1e-6);
          expect(x.x + x.w).toBeLessThanOrEqual(sk.L + 1e-6);
        }
        expect(unreachableSpaces(sk.rects, sk.L, sk.B, 0.23)).toEqual([]);
      }
      if (n.kind === "shop")
        expect(res.sketch[0].rects.some((x) => x.type === "shop")).toBe(true);
      const info = nakshaInfo(n);
      console.log(
        n.slug,
        `vastu ${info.vastu.pct}%`,
        `${info.bhk}BHK`,
        Math.round(info.builtUp),
        info.notes.map((x) => x.en.slice(0, 40)).join(" / "),
      );
    });
});
