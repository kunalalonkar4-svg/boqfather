"use client";

import { useMemo, useState } from "react";
import { BoqQuality, BoqResult, buildPlan, inr, lakhWords, loanPlan, round, rupees } from "@/engine";
import type { Lang } from "@/lib/site";

const FT = 3.28084;
const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);

const ROOM_FILL: Record<string, string> = {
  hall: "#fdf3dc",
  dining: "#fbeccd",
  kitchen: "#fde3d6",
  bedroom: "#e6edf5",
  toilet: "#dff1e8",
  utility: "#dff1e8",
  passage: "#f1eee8",
  balcony: "#eef6dc",
  pooja: "#fbe7f0",
  store: "#ece9e2",
  study: "#e9e6f5",
  parking: "#e4e4e4",
  shop: "#fff0c2",
  stair: "#d9d4ca",
};

const FLOOR = (i: number, lang: Lang) =>
  lang === "hi" ? ["ग्राउंड फ़्लोर", "पहली मंज़िल", "दूसरी मंज़िल", "तीसरी मंज़िल"][i] : ["Ground floor", "First floor", "Second floor", "Third floor"][i];

/** Schematic block sketch of every floor. */
export function SketchPanel({ r, lang, names }: { r: BoqResult; lang: Lang; names: (t: string) => string }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-[13px] text-muted">
        {L(
          lang,
          "Schematic only: room blocks are packed by area inside each floor's outline so you can see proportions. Your architect's plan decides the real layout.",
          "यह सिर्फ़ अंदाज़ा दिखाने वाला स्केच है: हर मंज़िल की बाहरी सीमा में कमरे उनके एरिया के हिसाब से रखे गए हैं। असली लेआउट आपके आर्किटेक्ट का नक्शा तय करेगा।",
        )}
      </p>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {r.sketch.map((s) => {
          const pad = 0.4;
          return (
            <figure key={s.floor} className="m-0 flex min-w-0 flex-col gap-2">
              <figcaption className="flex flex-wrap justify-between gap-2 text-[14px] font-bold">
                <span>{FLOOR(s.floor, lang)}</span>
                <span className="font-normal text-muted">
                  {round(s.L * FT, 1)} × {round(s.B * FT, 1)} ft
                </span>
              </figcaption>
              <svg
                viewBox={`${-pad} ${-pad} ${s.L + 2 * pad} ${s.B + 2 * pad}`}
                className="h-auto w-full rounded-xl border border-line bg-white"
                role="img"
                aria-label={`${FLOOR(s.floor, lang)} sketch`}
              >
                <rect x={0} y={0} width={s.L} height={s.B} fill="none" stroke="#16181a" strokeWidth={0.23} />
                {s.rects.map((x) => {
                  const fs = Math.max(0.22, Math.min(0.42, Math.min(x.w, x.h) / 4));
                  return (
                    <g key={x.key}>
                      <rect
                        x={x.x + 0.06}
                        y={x.y + 0.06}
                        width={Math.max(0, x.w - 0.12)}
                        height={Math.max(0, x.h - 0.12)}
                        fill={ROOM_FILL[x.type] ?? "#eee"}
                        stroke="#8a857b"
                        strokeWidth={0.05}
                      />
                      <text x={x.x + x.w / 2} y={x.y + x.h / 2 - fs * 0.2} textAnchor="middle" fontSize={fs} fontWeight={700} fill="#16181a">
                        {x.type === "stair" ? L(lang, "Stair", "सीढ़ी") : `${x.key}`}
                      </text>
                      {x.type !== "stair" && x.h > fs * 3 && (
                        <text x={x.x + x.w / 2} y={x.y + x.h / 2 + fs * 0.95} textAnchor="middle" fontSize={fs * 0.8} fill="#4a4740">
                          {names(x.type)}
                        </text>
                      )}
                      {x.L !== undefined && x.B !== undefined && x.h > fs * 4.2 && (
                        <text x={x.x + x.w / 2} y={x.y + x.h / 2 + fs * 1.95} textAnchor="middle" fontSize={fs * 0.75} fill="#6b675f">
                          {round(x.L * FT, 1)}×{round(x.B * FT, 1)}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </figure>
          );
        })}
      </div>
    </div>
  );
}

export function SpecPanel({ r, lang }: { r: BoqResult; lang: Lang }) {
  const q = { basic: L(lang, "Basic", "बेसिक"), standard: L(lang, "Standard", "स्टैंडर्ड"), premium: L(lang, "Premium", "प्रीमियम") }[r.quality];
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[14px]">
        {L(lang, "Specification for", "स्पेसिफ़िकेशन")}: <strong>{q}</strong> ·{" "}
        {L(lang, "change the finish level in Step 3 and the rates change with it.", "स्टेप 3 में क्वालिटी बदलें, रेट भी साथ बदलेंगे।")}
      </p>
      <ul className="flex flex-col divide-y divide-[#f0ece5] rounded-xl border border-line">
        {r.specSheet.map((s) => (
          <li key={s.key} className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-4">
            <span className="text-[14px] font-bold">{s.item[lang]}</span>
            <span className="text-[14px] text-body">{s.spec[lang]}</span>
          </li>
        ))}
      </ul>
      <p className="text-[12px] text-muted">
        {L(lang, "Brands are indicative; write the exact brand and model in your contract.", "ब्रांड सांकेतिक हैं; ठेके में सही ब्रांड और मॉडल लिखवाएं।")}
      </p>
    </div>
  );
}

export function BbsPanel({ r, lang }: { r: BoqResult; lang: Lang }) {
  const b = r.bbs;
  const diff = ((b.total - r.steelThumbKg) / r.steelThumbKg) * 100;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {b.byDia.map((d) => (
          <div key={d.dia} className="rounded-xl border border-line bg-[#fcfbf8] p-3">
            <div className="text-[12px] text-muted">{d.dia} mm</div>
            <div className="text-[17px] font-bold">{inr(d.kg)} kg</div>
          </div>
        ))}
      </div>
      <p className="text-[14px]">
        {L(lang, "BBS total", "BBS कुल")}: <strong>{inr(b.total)} kg</strong> ({inr(b.net)} + {L(lang, "3% wastage", "3% वेस्टेज")}) ·{" "}
        {L(lang, "thumb rule would give", "थंब रूल से")} {inr(r.steelThumbKg)} kg ({diff >= 0 ? "+" : ""}
        {Math.round(diff)}%)
      </p>
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[640px] border-collapse text-[12.5px]">
          <thead>
            <tr className="bg-[#f5f3ef] text-left text-muted">
              <th className="px-2 py-2 font-semibold">{L(lang, "Member", "सदस्य")}</th>
              <th className="px-2 py-2 font-semibold">Mark</th>
              <th className="px-2 py-2 font-semibold">{L(lang, "Description", "विवरण")}</th>
              <th className="px-2 py-2 text-right font-semibold">Dia</th>
              <th className="px-2 py-2 text-right font-semibold">Nos</th>
              <th className="px-2 py-2 text-right font-semibold">{L(lang, "Cut length m", "कटिंग लंबाई m")}</th>
              <th className="px-2 py-2 text-right font-semibold">{L(lang, "Total m", "कुल m")}</th>
              <th className="px-2 py-2 text-right font-semibold">kg</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {b.rows.map((x) => (
              <tr key={x.mark + x.desc} className="border-t border-[#f0ece5]">
                <td className="px-2 py-1.5">{x.member}</td>
                <td className="px-2 py-1.5 font-semibold text-amber-dark">{x.mark}</td>
                <td className="px-2 py-1.5">{x.desc}</td>
                <td className="px-2 py-1.5 text-right">{x.dia}</td>
                <td className="px-2 py-1.5 text-right">{x.nos}</td>
                <td className="px-2 py-1.5 text-right">{x.cutLen}</td>
                <td className="px-2 py-1.5 text-right">{inr(x.totalLen)}</td>
                <td className="px-2 py-1.5 text-right font-semibold">{inr(x.kg)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="list-disc space-y-1 pl-5 text-[12.5px] text-muted">
        {b.notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </div>
  );
}

const MAT_LABEL: Record<string, { en: string; hi: string; unit: string }> = {
  cement: { en: "Cement", hi: "सीमेंट", unit: "bags" },
  steel: { en: "Steel", hi: "सरिया", unit: "kg" },
  sand: { en: "Sand", hi: "रेत", unit: "cft" },
  aggregate: { en: "Aggregate", hi: "गिट्टी", unit: "cft" },
  bricks: { en: "Bricks", hi: "ईंट", unit: "nos" },
  blocks: { en: "AAC blocks", hi: "AAC ब्लॉक", unit: "nos" },
  tiles: { en: "Tiles", hi: "टाइल्स", unit: "sqft" },
};

export function PlanPanel({ r, lang }: { r: BoqResult; lang: Lang }) {
  const plan = useMemo(() => buildPlan(r), [r]);
  const [loanL, setLoanL] = useState(String(Math.round((r.grandTotal * 0.6) / 100000)));
  const [rate, setRate] = useState("8.5");
  const [years, setYears] = useState("20");
  const loan = useMemo(() => loanPlan(plan, r.grandTotal, Number(loanL) * 100000 || 0, Number(rate) || 0, Number(years) || 1), [plan, r.grandTotal, loanL, rate, years]);
  const maxM = Math.max(...plan.months.map((m) => m.spend), 1);
  const stageName = (k: string) => plan.stages.find((s) => s.key === k)?.name[lang] ?? k;
  return (
    <div className="flex flex-col gap-6">
      <section>
        <h3 className="font-display text-[17px] font-bold">
          {L(lang, "Stage plan and what to buy", "चरण प्लान और कब क्या ख़रीदें")} · {plan.totalMonths} {L(lang, "months", "महीने")}
        </h3>
        <ol className="mt-3 flex flex-col gap-2">
          {plan.stages.map((s, i) => {
            const mats = Object.entries(s.mat).filter(([, q]) => (q ?? 0) > 0.5);
            return (
              <li key={s.key} className="rounded-xl border border-line p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="text-[14px] font-bold">
                    {i + 1}. {s.name[lang]}
                  </span>
                  <span className="text-[14px] font-bold">{rupees(s.amount)}</span>
                </div>
                <div className="mt-0.5 text-[12.5px] text-muted">
                  {L(lang, "Month", "महीना")} {round(s.start + 1, 1)} – {round(s.start + s.months + 1, 1)} · {L(lang, "items", "आइटम")} {s.items.join(", ")}
                </div>
                {mats.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="text-[12px] font-semibold text-steel">{L(lang, "Buy before this stage:", "इस चरण से पहले ख़रीदें:")}</span>
                    {mats.map(([k, q]) => (
                      <span key={k} className="rounded-full bg-[#efece6] px-2 py-0.5 text-[12px]">
                        {MAT_LABEL[k]?.[lang] ?? k} {inr(q ?? 0)} {MAT_LABEL[k]?.unit}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <section>
        <h3 className="font-display text-[17px] font-bold">{L(lang, "Month-by-month spend", "महीने-वार खर्च")}</h3>
        <ul className="mt-3 flex flex-col gap-1.5">
          {plan.months.map((m) => (
            <li key={m.month} className="grid grid-cols-[64px_minmax(0,1fr)_96px] items-center gap-2 text-[13px]">
              <span className="text-muted">
                {L(lang, "Month", "महीना")} {m.month}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="block h-3 rounded-full bg-[#f0ece5]">
                  <span className="block h-3 rounded-full bg-amber" style={{ width: `${(m.spend / maxM) * 100}%` }} />
                </span>
                <span className="truncate text-[11.5px] text-muted">{m.stages.map(stageName).join(" · ")}</span>
              </span>
              <span className="text-right font-semibold">{rupees(m.spend)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-line p-4">
        <h3 className="font-display text-[17px] font-bold">{L(lang, "Home loan: EMI and pre-EMI", "होम लोन: EMI और प्री-EMI")}</h3>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(
            [
              [L(lang, "Loan (₹ lakh)", "लोन (₹ लाख)"), loanL, setLoanL],
              [L(lang, "Interest %", "ब्याज %"), rate, setRate],
              [L(lang, "Years", "साल"), years, setYears],
            ] as const
          ).map(([lbl, v, set]) => (
            <label key={lbl} className="flex flex-col gap-1 text-[12.5px] font-semibold">
              {lbl}
              <input
                inputMode="decimal"
                className="h-10 w-full min-w-0 rounded-lg border border-[#cfc9be] px-2 text-right text-[14px] font-normal"
                value={v}
                onChange={(e) => set(e.target.value)}
              />
            </label>
          ))}
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-[13px] sm:grid-cols-4">
          <div className="rounded-lg bg-[#fcfbf8] p-2.5">
            <dt className="text-muted">EMI</dt>
            <dd className="text-[16px] font-bold">{rupees(loan.emi)}</dd>
          </div>
          <div className="rounded-lg bg-[#fcfbf8] p-2.5">
            <dt className="text-muted">{L(lang, "Your own money", "आपका अपना पैसा")}</dt>
            <dd className="text-[16px] font-bold">₹{lakhWords(loan.own)}</dd>
          </div>
          <div className="rounded-lg bg-[#fcfbf8] p-2.5">
            <dt className="text-muted">{L(lang, "Pre-EMI during build", "निर्माण के दौरान प्री-EMI")}</dt>
            <dd className="text-[16px] font-bold">{rupees(loan.preEmiTotal)}</dd>
          </div>
          <div className="rounded-lg bg-[#fcfbf8] p-2.5">
            <dt className="text-muted">{L(lang, "Total interest", "कुल ब्याज")}</dt>
            <dd className="text-[16px] font-bold">₹{lakhWords(loan.totalInterest)}</dd>
          </div>
        </dl>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-[12.5px] tabular-nums">
            <thead>
              <tr className="bg-[#f5f3ef] text-left text-muted">
                <th className="px-2 py-1.5">{L(lang, "Month", "महीना")}</th>
                <th className="px-2 py-1.5 text-right">{L(lang, "Spend", "खर्च")}</th>
                <th className="px-2 py-1.5 text-right">{L(lang, "Own", "अपना")}</th>
                <th className="px-2 py-1.5 text-right">{L(lang, "Loan", "लोन")}</th>
                <th className="px-2 py-1.5 text-right">{L(lang, "Pre-EMI", "प्री-EMI")}</th>
              </tr>
            </thead>
            <tbody>
              {loan.construction.map((m) => (
                <tr key={m.month} className="border-t border-[#f0ece5]">
                  <td className="px-2 py-1.5">{m.month}</td>
                  <td className="px-2 py-1.5 text-right">{inr(m.spend)}</td>
                  <td className="px-2 py-1.5 text-right">{inr(m.fromOwn)}</td>
                  <td className="px-2 py-1.5 text-right">{inr(m.fromLoan)}</td>
                  <td className="px-2 py-1.5 text-right">{inr(m.preEmi)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[12px] text-muted">
          {L(
            lang,
            "Assumes you spend your own money first and the bank releases the loan stage by stage; until completion you pay interest only (pre-EMI). Check your bank's terms.",
            "मान लिया है कि पहले आपका अपना पैसा लगेगा, फिर बैंक चरण-वार लोन देगा; घर पूरा होने तक सिर्फ़ ब्याज (प्री-EMI) देना होगा। अपने बैंक की शर्तें जांचें।",
          )}
        </p>
      </section>
    </div>
  );
}

export function ComparePanel({ r, lang, run }: { r: BoqResult; lang: Lang; run: (q: BoqQuality, wall: "brick" | "aac") => BoqResult }) {
  const grid = useMemo(() => {
    const qs: BoqQuality[] = ["basic", "standard", "premium"];
    return qs.map((q) => ({ q, brick: run(q, "brick"), aac: run(q, "aac") }));
  }, [run]);
  const qName = (q: BoqQuality) => ({ basic: L(lang, "Basic", "बेसिक"), standard: L(lang, "Standard", "स्टैंडर्ड"), premium: L(lang, "Premium", "प्रीमियम") })[q];
  const cell = (x: BoqResult, on: boolean) => (
    <td className={"px-3 py-2.5 text-right " + (on ? "bg-amber-tint font-bold" : "")}>
      <div className="text-[14px] font-semibold">₹{lakhWords(x.grandTotal)}</div>
      <div className="text-[12px] text-muted">{rupees(x.perSqft)}/sqft</div>
    </td>
  );
  const std = grid[1];
  const aacSave = std.brick.grandTotal - std.aac.grandTotal;
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[420px] border-collapse">
          <thead>
            <tr className="bg-[#f5f3ef] text-left text-[13px] text-muted">
              <th className="px-3 py-2">{L(lang, "Finish level", "क्वालिटी")}</th>
              <th className="px-3 py-2 text-right">{L(lang, "Brick walls", "ईंट की दीवार")}</th>
              <th className="px-3 py-2 text-right">{L(lang, "AAC block walls", "AAC ब्लॉक दीवार")}</th>
            </tr>
          </thead>
          <tbody>
            {grid.map((g) => (
              <tr key={g.q} className="border-t border-[#f0ece5]">
                <td className="px-3 py-2.5 text-[14px] font-semibold">{qName(g.q)}</td>
                {cell(g.brick, r.quality === g.q && r.wall === "brick")}
                {cell(g.aac, r.quality === g.q && r.wall === "aac")}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="list-disc space-y-1.5 pl-5 text-[13.5px] text-body">
        <li>
          {L(lang, "AAC blocks vs bricks (standard)", "AAC ब्लॉक बनाम ईंट (स्टैंडर्ड)")}: {aacSave >= 0 ? L(lang, "saves", "बचत") : L(lang, "costs extra", "ज़्यादा खर्च")}{" "}
          <strong>{rupees(Math.abs(aacSave))}</strong>.{" "}
          {L(
            lang,
            "AAC is lighter, faster to lay and gives a bit more carpet area (thinner walls); bricks are easier to find everywhere and handle fixings better.",
            "AAC हल्का है, जल्दी लगता है और पतली दीवार से थोड़ा ज़्यादा कारपेट मिलता है; ईंट हर जगह आसानी से मिलती है और कील-फिक्सिंग में बेहतर है।",
          )}
        </li>
        <li>
          {L(lang, "Premium vs basic finish", "प्रीमियम बनाम बेसिक")}: <strong>₹{lakhWords(grid[2].brick.grandTotal - grid[0].brick.grandTotal)}</strong>{" "}
          {L(
            lang,
            "difference — the structure is the same, only finishes, doors, windows and fittings change.",
            "का फ़र्क — ढांचा एक जैसा है, सिर्फ़ फ़िनिश, दरवाज़े, खिड़की और फिटिंग बदलती हैं।",
          )}
        </li>
        <li>
          {L(lang, "Steel by BBS", "BBS से सरिया")}: {inr(r.bbs.total)} kg · {L(lang, "by thumb rule", "थंब रूल से")} {inr(r.steelThumbKg)} kg ({L(lang, "difference", "फ़र्क")}{" "}
          {inr(Math.abs(r.steelThumbKg - r.bbs.total))} kg ≈{" "}
          {rupees(Math.abs(r.steelThumbKg - r.bbs.total) * (r.sections.flatMap((s) => s.items).find((i) => i.rateKey === "steel")?.rate ?? 72))}).
        </li>
      </ul>
    </div>
  );
}
