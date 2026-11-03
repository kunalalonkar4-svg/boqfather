import { describe, expect, it } from "vitest";
import { unreachableSpaces } from "../engine";
import { PLOTS, plotEstimate, plotSlug, plotSummary } from "./plots";

describe("plot pages: every listed plot gives a sound plan", () => {
  for (const p of PLOTS)
    for (const floors of [2, 3])
      it(`${plotSlug(p)} G+${floors - 1}`, () => {
        const { res, fit } = plotEstimate(p, floors);
        expect(fit.warnings).toEqual([]);
        for (const sk of res.sketch) {
          expect(sk.L, "house width").toBeLessThanOrEqual(fit.buildB + 0.1);
          expect(sk.B, "house depth").toBeLessThanOrEqual(fit.buildL + 0.1);
        }
        expect(res.grandTotal).toBeGreaterThan(0);
        for (const sk of res.sketch) {
          const sp = sk.rects.filter((x) => x.type !== "column");
          for (const x of sp) {
            if (!["corridor", "balcony", "open", "hall"].includes(x.type))
              expect(x.doors?.length, `${x.key} door`).toBeGreaterThan(0);
            if (["bedroom", "hall"].includes(x.type))
              expect(Math.min(x.w, x.h), `${x.key} width`).toBeGreaterThan(2.3);
          }
          expect(unreachableSpaces(sk.rects, sk.L, sk.B, 0.23)).toEqual([]);
        }
        if (floors === 2) {
          const s = plotSummary(p, 2);
          console.log(
            plotSlug(p),
            p.bhk + "BHK",
            Math.round(s.builtUp),
            "sqft",
            Math.round((s.total / 1e5) * 10) / 10,
            "L",
            Math.round(s.perSqft) + "/sqft",
            fit.notes.map((n) => n.en).join(" / "),
          );
        }
      });
});
