import { describe, expect, it } from "vitest";
import { calcBoq, fitPlot, unreachableSpaces } from "./index";

const ft = (x: number) => x / 3.28084;
const problems: string[] = [];
describe("plan sweep: every plot input gives a sound plan", () => {
  it("sweep", () => {
    let n = 0;
    for (const L of [20, 25, 30, 40, 50, 60, 80])
      for (const B of [20, 25, 30, 40, 50])
        for (const bhk of [1, 2, 3, 4])
          for (const parking of [false, true])
            for (const floors of [1, 2, 3])
              for (const layout of ["family", "units"] as const) {
                const setF = L >= 50 ? 10 : L <= 25 ? 3 : 5,
                  side = B >= 30 ? 3 : 0;
                const p = fitPlot({
                  plotL: ft(L),
                  plotB: ft(B),
                  front: ft(setF),
                  back: ft(3),
                  side: ft(side),
                  bhk,
                  floors,
                  parking,
                  layout,
                });
                const r = calcBoq({
                  floorRooms: p.floorRooms,
                  spec: {
                    aspect: p.buildL / p.buildB,
                    buildableM2: p.buildArea,
                    widthM: p.buildB,
                    depthM: p.buildL,
                  },
                });
                n++;
                const tag = `${L}x${B} ${bhk}BHK park=${parking} G+${floors - 1} ${layout}`;
                if (!Number.isFinite(r.grandTotal) || r.grandTotal <= 0)
                  problems.push(`${tag}: bad total`);
                // one outline and one stair, floor over floor
                {
                  const s0 = r.sketch[0];
                  const st0 = s0.rects.find((x) => x.type === "stair");
                  for (const sk of r.sketch.slice(1)) {
                    if (
                      Math.abs(sk.L - s0.L) > 0.05 ||
                      Math.abs(sk.B - s0.B) > 0.05
                    )
                      problems.push(
                        `${tag} F${sk.floor}: OUTLINE outline differs`,
                      );
                    const st = sk.rects.find((x) => x.type === "stair");
                    if (st0 && st) {
                      const f0 = s0.B - st0.y - st0.h,
                        f1 = sk.B - st.y - st.h;
                      if (
                        Math.abs(st.x - st0.x) > 0.05 ||
                        Math.abs(st.w - st0.w) > 0.05 ||
                        Math.abs(f1 - f0) > 0.05 ||
                        Math.abs(st.h - st0.h) > 0.05
                      )
                        problems.push(`${tag} F${sk.floor}: STAIR stair moves`);
                    }
                  }
                }
                for (const sk of r.sketch) {
                  const sp = sk.rects.filter((x) => x.type !== "column");
                  for (const x of sp) {
                    if (!(x.w > 0.5 && x.h > 0.5))
                      problems.push(
                        `${tag} F${sk.floor}: ${x.key} tiny ${x.w.toFixed(2)}x${x.h.toFixed(2)}`,
                      );
                    if (
                      x.x < -1e-6 ||
                      x.y < -1e-6 ||
                      x.x + x.w > sk.L + 1e-6 ||
                      x.y + x.h > sk.B + 1e-6
                    )
                      problems.push(`${tag} F${sk.floor}: ${x.key} outside`);
                    if (
                      // the upstairs lounge can open only onto the stair / lobby (their openings); reachability is checked below
                      !["corridor", "balcony", "open", "hall"].includes(
                        x.type,
                      ) &&
                      !x.doors?.length
                    )
                      problems.push(
                        `${tag} F${sk.floor}: ${x.key} (${x.type}) no door`,
                      );
                  }
                  for (let i = 0; i < sp.length; i++)
                    for (let j = i + 1; j < sp.length; j++) {
                      const a = sp[i],
                        b = sp[j];
                      const ox =
                        Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
                      const oy =
                        Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
                      if (ox > 0.01 && oy > 0.01)
                        problems.push(
                          `${tag} F${sk.floor}: ${a.key} overlaps ${b.key}`,
                        );
                    }
                  for (const k of unreachableSpaces(sk.rects, sk.L, sk.B, 0.23))
                    problems.push(`${tag} F${sk.floor}: ${k} unreachable`);
                  // every input room (except passage) is drawn
                  const keys = new Set(sp.map((x) => x.key));
                  for (const room of r.rooms.filter(
                    (q) => q.floor === sk.floor && q.type !== "passage",
                  ))
                    if (!keys.has(room.code))
                      problems.push(
                        `${tag} F${sk.floor}: ${room.code} missing`,
                      );
                  // bedroom / hall widths drawn ≥ 2.3 m
                  for (const x of sp)
                    if (
                      ["bedroom", "hall", "kitchen", "dining"].includes(
                        x.type,
                      ) &&
                      Math.max(x.w, x.h) / Math.min(x.w, x.h) > 2.5
                    )
                      problems.push(
                        `${tag} F${sk.floor}: ${x.key} (${x.type}) long ${(Math.max(x.w, x.h) / Math.min(x.w, x.h)).toFixed(1)}`,
                      );
                  for (const x of sp)
                    if (
                      !p.warnings.length && // the plot is too small and already warned
                      (x.type === "bedroom" || x.type === "hall") &&
                      Math.min(x.w, x.h) < 2.3
                    )
                      problems.push(
                        `${tag} F${sk.floor}: ${x.key} narrow ${Math.min(x.w, x.h).toFixed(2)}`,
                      );
                }
              }
    const uniq = [
      ...new Set(
        problems.map((p) =>
          p.replace(/^\S+ \S+ park=\S+ G\+\d /, "").replace(/F\d: /, ""),
        ),
      ),
    ];
    console.log(`cases ${n}, problems ${problems.length}`);
    if (process.env.RAW) console.log("RAW\n" + problems.join("\n"));
    const agg = new Map<string, number>();
    for (const pr of problems) {
      const [tag, rest] = pr.split(": ");
      const B = tag.split(" ")[0].split("x")[1];
      const kind =
        rest.replace(/^\S+ /, "").replace(/[\d.]+(x[\d.]+)?/g, "#") +
        ` L=${tag.split(" ")[0].split("x")[0]}`;
      const bh = tag.split(" ")[1];
      const k = `B=${B} ${bh} ${kind}`;
      agg.set(k, (agg.get(k) ?? 0) + 1);
    }
    console.log(
      [...agg.entries()]
        .sort()
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n"),
    );
    console.log(
      "kinds:",
      [
        ...new Set(
          problems.map((p) =>
            p
              .split(": ")[1]
              ?.replace(/[A-Z]+\d*(-[A-Z0-9]+)?/g, "X")
              .replace(/[\d.]+x?[\d.]*/g, "#"),
          ),
        ),
      ].join(" | "),
    );
    void uniq;
    expect(problems.length).toBe(0);
  });
});
