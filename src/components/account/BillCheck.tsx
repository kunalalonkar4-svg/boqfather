"use client";

import { useState } from "react";
import {
  BOQ_RATES,
  LOCATION_FACTORS,
  verdictFor,
  type Location,
  type RateKey,
} from "@/engine";
import { PLANS } from "@/lib/pricing";
import { api } from "@/lib/supabase";
import type { Lang } from "@/lib/site";
import { alertBox, useAccount } from "./Account";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);

interface Line {
  desc: string;
  qty: number | null;
  unit: string;
  rate: number | null;
  amount: number | null;
  key: RateKey | null;
}

/** Our unit for each rate (same as the BOQ). */
const OUR_UNIT: Partial<Record<RateKey, string>> = {};
const M3: RateKey[] = [
  "exc",
  "pcc",
  "back",
  "murum",
  "rcc",
  "brick",
  "aac",
  "lintel",
];
const M2: RateKey[] = [
  "termite",
  "sh_col",
  "sh_beam",
  "sh_slab",
  "sh_foot",
  "pl_int",
  "pl_ext",
  "pl_ceil",
  "pl_para",
  "vit",
  "anti",
  "wtile",
  "toi_wp",
  "ter_wp",
  "granite",
  "pvc",
  "alwin",
  "vent",
  "p_int",
  "p_ext",
  "st_tile",
  "st_soffit",
  "shutter",
  "ff_ceiling",
  "gate",
  "elev",
];
for (const k of M3) OUR_UNIT[k] = "m3";
for (const k of M2) OUR_UNIT[k] = "m2";
OUR_UNIT.steel = "kg";
for (const k of ["skirt", "rail", "cpvc", "bore"] as RateKey[])
  OUR_UNIT[k] = "m";

/** Factor to turn a rate per `unit` into a rate per our unit (null if they cannot be compared). */
function toOurUnit(unit: string, ours: string | undefined): number | null {
  const u = unit.toLowerCase().replace(/[\s.]/g, "");
  const is = (...xs: string[]) => xs.includes(u);
  if (!ours)
    return is("nos", "no", "each", "number", "ls", "job", "set", "point")
      ? 1
      : null;
  if (ours === "m3")
    return is("m3", "cum", "cubm", "cubicmetre", "cubicmeter", "m³")
      ? 1
      : is("cft", "cuft", "cubicfeet", "ft3")
        ? 35.3147
        : is("brass")
          ? 1 / 2.832
          : null;
  if (ours === "m2")
    return is("m2", "sqm", "sqmt", "m²")
      ? 1
      : is("sqft", "sft", "ft2")
        ? 10.7639
        : null;
  if (ours === "kg")
    return is("kg", "kgs")
      ? 1
      : is("mt", "tonne", "ton", "t", "quintal", "qtl")
        ? is("quintal", "qtl")
          ? 1 / 100
          : 1 / 1000
        : null;
  if (ours === "m")
    return is("m", "rm", "rmt", "mtr", "metre", "meter")
      ? 1
      : is("rft", "ft", "feet")
        ? 3.28084
        : null;
  return null;
}

/** Upload a contractor's bill or quotation (photo / PDF) → each line priced against the market. Pro. */
export function BillCheck({ lang }: { lang: Lang }) {
  const a = useAccount();
  const [lines, setLines] = useState<Line[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [needPro, setNeedPro] = useState(false);
  const [loc, setLoc] = useState<Location>("tier2");

  const pick = async (file: File) => {
    if (!a.aiReady)
      return alertBox(
        L(lang, "Bill reading opens soon.", "बिल पढ़ना जल्द शुरू होगा।"),
      );
    if (!a.user) return a.openLogin(() => void pick(file));
    setBusy(true);
    setNeedPro(false);
    try {
      const base64 = await new Promise<string>((ok, bad) => {
        const r = new FileReader();
        r.onload = () => ok(String(r.result).split(",")[1]);
        r.onerror = bad;
        r.readAsDataURL(file);
      });
      const j = await api<{ items: Line[] }>("/api/read-bill", {
        file: { mime: file.type || "image/jpeg", base64 },
      });
      setLines(j.items);
    } catch (e) {
      const m = e instanceof Error ? e.message : "";
      if (/Pro feature/i.test(m)) {
        if (a.payReady) setNeedPro(true);
        else
          alertBox(
            L(
              lang,
              "This opens with Pro very soon.",
              "यह प्रो के साथ बहुत जल्द शुरू होगा।",
            ),
          );
      }
      else alertBox(m || "Could not read the bill");
    } finally {
      setBusy(false);
    }
  };

  const rows = (lines ?? []).map((l) => {
    const market = l.key
      ? Math.round(BOQ_RATES[l.key] * LOCATION_FACTORS[loc])
      : null;
    const f = l.key ? toOurUnit(l.unit, OUR_UNIT[l.key]) : null;
    const per = l.rate !== null && f !== null ? l.rate * f : null;
    const diff =
      per !== null && market ? ((per - market) / market) * 100 : null;
    const extra =
      diff !== null && diff > 10 && l.qty !== null && f !== null && market
        ? (per! - market) * (l.qty / f)
        : 0;
    return { l, market, per, diff, extra };
  });
  const extraTotal = rows.reduce((t, r) => t + r.extra, 0);
  const cls = (d: number | null) =>
    d === null
      ? "text-muted"
      : d > 20
        ? "text-[#a8321f]"
        : d > 10
          ? "text-warn"
          : d < -25
            ? "text-[#a8321f]"
            : "text-[#1d7a46]";

  return (
    <section
      id="bill-check"
      className="flex scroll-mt-24 flex-col gap-3 rounded-2xl border-2 border-amber bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-amber px-1.5 text-[11px] font-extrabold">
          PRO
        </span>
        <h2 className="font-display text-[20px] font-bold">
          {L(
            lang,
            "Check a contractor's bill line by line",
            "ठेकेदार का बिल लाइन-दर-लाइन जांचें",
          )}
        </h2>
      </div>
      <p className="text-[14px] text-body">
        {L(
          lang,
          "Upload a photo or PDF of the bill or quotation. Each item is read and compared with the market rate; items charged well above it are marked, with the extra amount.",
          "बिल या कोटेशन की फ़ोटो या PDF अपलोड करें। हर आइटम पढ़कर बाज़ार रेट से मिलाया जाता है; बहुत ज़्यादा रेट वाले आइटम अलग दिखते हैं, ज़्यादा लिए गए पैसे के साथ।",
        )}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-[14px] font-semibold text-white">
          {busy
            ? L(lang, "Reading the bill…", "बिल पढ़ा जा रहा है…")
            : L(
                lang,
                "Upload bill (photo / PDF)",
                "बिल अपलोड करें (फ़ोटो / PDF)",
              )}
          <input
            type="file"
            accept="image/*,application/pdf"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) void pick(f);
            }}
          />
        </label>
        <select
          className="rounded-lg border border-line px-2 py-2 text-[14px]"
          value={loc}
          onChange={(e) => setLoc(e.target.value as Location)}
        >
          <option value="metro">{L(lang, "Metro city", "मेट्रो शहर")}</option>
          <option value="tier1">{L(lang, "Big city", "बड़ा शहर")}</option>
          <option value="tier2">{L(lang, "Mid city", "मध्यम शहर")}</option>
          <option value="town">{L(lang, "Town", "क़स्बा")}</option>
          <option value="rural">{L(lang, "Village", "गांव")}</option>
        </select>
      </div>
      {needPro && (
        <button
          type="button"
          className="w-fit rounded-lg bg-ink px-3 py-2 text-[14px] font-semibold text-white"
          onClick={async () => {
            const ok = await a.buy("month").catch(() => false);
            if (ok) setNeedPro(false);
          }}
        >
          {L(
            lang,
            `Get Pro · ₹${PLANS.month.inr}/month`,
            `प्रो लें · ₹${PLANS.month.inr}/महीना`,
          )}
        </button>
      )}
      {lines && (
        <>
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[640px] text-[13px]">
              <thead>
                <tr className="bg-[#f4f1ea] text-left">
                  <th className="px-3 py-2">{L(lang, "Item", "आइटम")}</th>
                  <th className="px-3 py-2 text-right">
                    {L(lang, "Bill rate", "बिल रेट")}
                  </th>
                  <th className="px-3 py-2 text-right">
                    {L(lang, "Market rate", "बाज़ार रेट")}
                  </th>
                  <th className="px-3 py-2 text-right">
                    {L(lang, "Difference", "फ़र्क़")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ l, market, per, diff }, i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="px-3 py-2">
                      {l.desc}
                      <span className="text-muted">
                        {" "}
                        · {l.qty ?? "–"} {l.unit}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {l.rate !== null
                        ? `₹${l.rate.toLocaleString("en-IN")}/${l.unit}`
                        : "–"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {market && per !== null
                        ? `₹${Math.round(market / (per / (l.rate || 1))).toLocaleString("en-IN")}/${l.unit}`
                        : "–"}
                    </td>
                    <td
                      className={
                        "px-3 py-2 text-right font-semibold tabular-nums " +
                        cls(diff)
                      }
                    >
                      {diff === null
                        ? L(lang, "not compared", "मिलान नहीं")
                        : `${diff > 0 ? "+" : ""}${Math.round(diff)}%`}
                      {diff !== null && (
                        <span className="block text-[11px] font-normal">
                          {lang === "hi"
                            ? (
                                {
                                  too_low: "बहुत कम",
                                  good: "अच्छा",
                                  fair: "सही",
                                  slightly_high: "थोड़ा ज़्यादा",
                                  high: "ज़्यादा",
                                } as const
                              )[verdictFor(diff)]
                            : (
                                {
                                  too_low: "too low",
                                  good: "good",
                                  fair: "fair",
                                  slightly_high: "slightly high",
                                  high: "high",
                                } as const
                              )[verdictFor(diff)]}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {extraTotal > 0 && (
            <p className="rounded-lg bg-[#fbe9e5] px-3 py-2 text-[14px] font-semibold text-[#a8321f]">
              {L(
                lang,
                `Items charged more than 10% above market add up to about ₹${Math.round(extraTotal).toLocaleString("en-IN")} extra — ask the contractor about these.`,
                `बाज़ार से 10% से ज़्यादा रेट वाले आइटम में लगभग ₹${Math.round(extraTotal).toLocaleString("en-IN")} ज़्यादा लगे हैं — इन पर ठेकेदार से बात करें।`,
              )}
            </p>
          )}
          <p className="text-[12px] text-muted">
            {L(
              lang,
              "Market rates are 2026 composite rates (material + labour) for standard specification; your brand and site conditions can justify some difference.",
              "बाज़ार रेट 2026 के स्टैंडर्ड स्पेसिफ़िकेशन के कम्पोज़िट रेट (सामग्री + मज़दूरी) हैं; ब्रांड और साइट की स्थिति से कुछ फ़र्क़ जायज़ हो सकता है।",
            )}
          </p>
        </>
      )}
    </section>
  );
}
