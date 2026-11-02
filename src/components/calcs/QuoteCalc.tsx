"use client";

import { useMemo, useState } from "react";
import { checkQuote, inr, ITEM_BENCHMARKS, lakhWords, Location, LOCATION_FACTORS, Quality, QUOTE_CHECKLIST, QuoteItem, round, rupees, Verdict } from "@/engine";
import { t } from "@/i18n/ui";
import type { Lang } from "@/lib/site";
import { NumberField, num, Segmented, SelectField } from "@/components/ui/Fields";
import { Invalid, WhatsAppShare } from "@/components/ui/Results";

const VERDICT: Record<Verdict, { en: string; hi: string; enD: string; hiD: string; cls: string }> = {
  too_low: {
    en: "Too low — check what is left out",
    hi: "बहुत कम — देखें क्या छोड़ा गया है",
    enD: "A quote far below market usually means cheaper materials, missing items or extra bills later. Get every inclusion in writing.",
    hiD: "बाज़ार से बहुत कम रेट का मतलब अक्सर सस्ता माल, छूटे हुए आइटम या बाद में अलग बिल होता है। हर चीज़ लिखित में लें।",
    cls: "bg-[#fdecea] text-[#9a3b2e] border-[#f1b8ae]",
  },
  good: {
    en: "Good deal",
    hi: "अच्छा रेट",
    enD: "Below the usual market rate. Confirm the brands and specifications so quality does not drop.",
    hiD: "बाज़ार रेट से कम है। ब्रांड और स्पेसिफ़िकेशन पक्का कर लें ताकि क्वालिटी न गिरे।",
    cls: "bg-[#e5f4ec] text-good border-[#a8d8be]",
  },
  fair: {
    en: "Fair quote",
    hi: "सही रेट",
    enD: "In line with the market for this quality and location.",
    hiD: "इस क्वालिटी और जगह के हिसाब से बाज़ार के बराबर।",
    cls: "bg-[#e5f4ec] text-good border-[#a8d8be]",
  },
  slightly_high: {
    en: "Slightly high — negotiate",
    hi: "थोड़ा ज़्यादा — मोलभाव करें",
    enD: "Higher than usual. Ask which items or brands justify it, or negotiate.",
    hiD: "सामान्य से ज़्यादा है। पूछें किस आइटम या ब्रांड की वजह से, या मोलभाव करें।",
    cls: "bg-warn-tint text-warn border-[#e5c77a]",
  },
  high: {
    en: "High",
    hi: "ज़्यादा",
    enD: "Well above market. Get an item-wise BOQ from the contractor and compare item by item.",
    hiD: "बाज़ार से काफ़ी ज़्यादा। ठेकेदार से आइटम-वार BOQ मांगें और हर आइटम मिलाएं।",
    cls: "bg-[#fdecea] text-[#9a3b2e] border-[#f1b8ae]",
  },
};

const ITEM_LABEL: Record<QuoteItem, { en: string; hi: string }> = {
  cement: { en: "Cement (₹/bag)", hi: "सीमेंट (₹/बोरी)" },
  steel: { en: "Steel (₹/kg)", hi: "सरिया (₹/किलो)" },
  rcc: { en: "RCC M20 laid (₹/m³)", hi: "RCC M20 ढलाई (₹/m³)" },
  brickwork: { en: "Brickwork (₹/m³)", hi: "ईंट चिनाई (₹/m³)" },
  plaster: { en: "Plaster 12 mm (₹/m²)", hi: "प्लास्टर 12 mm (₹/m²)" },
  tiles: { en: "Vitrified tiles laid (₹/sqft)", hi: "विट्रिफ़ाइड टाइल लगी हुई (₹/sqft)" },
  labour: { en: "Labour only (₹/sqft)", hi: "सिर्फ़ मज़दूरी (₹/sqft)" },
};

export default function QuoteCalc({ lang }: { lang: Lang }) {
  const d = t(lang);
  const hi = lang === "hi";
  const [area, setArea] = useState("2000");
  const [quality, setQuality] = useState<Quality>("standard");
  const [location, setLocation] = useState<Location>("tier2");
  const [scope, setScope] = useState<"turnkey" | "labour">("turnkey");
  const [mode, setMode] = useState<"sqft" | "lump">("sqft");
  const [quote, setQuote] = useState("1950");
  const [items, setItems] = useState<Record<QuoteItem, string>>({ cement: "", steel: "", rcc: "", brickwork: "", plaster: "", tiles: "", labour: "" });
  const [checked, setChecked] = useState<boolean[]>(QUOTE_CHECKLIST.map(() => false));

  const res = useMemo(() => {
    const a = num(area), q = num(quote);
    if (!(a > 0 && q > 0)) return null;
    const it: Partial<Record<QuoteItem, number>> = {};
    for (const k of Object.keys(items) as QuoteItem[]) {
      const v = num(items[k]);
      if (v > 0) it[k] = v;
    }
    return checkQuote({ builtUpSqft: a, quality, location, scope, mode, quote: q, items: it });
  }, [area, quality, location, scope, mode, quote, items]);

  const v = res ? VERDICT[res.verdict] : null;
  const done = checked.filter(Boolean).length;
  // position of the quote on a −30%…+30% scale
  const pos = res ? Math.min(100, Math.max(0, ((res.diffPct + 30) / 60) * 100)) : 50;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 sm:p-6">
          <NumberField label={hi ? "कुल बिल्ट-अप एरिया (सभी मंज़िल)" : "Total built-up area (all floors)"} value={area} onChange={setArea} suffix="sqft" />
          <Segmented
            label={hi ? "ठेके का प्रकार" : "Contract type"}
            value={scope}
            onChange={(s) => {
              setScope(s);
              setQuote(s === "turnkey" ? "1950" : "480");
            }}
            options={[
              { value: "turnkey", label: hi ? "माल + मज़दूरी (टर्नकी)" : "Material + labour" },
              { value: "labour", label: hi ? "सिर्फ़ मज़दूरी" : "Labour only" },
            ]}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Segmented
              label={d.quality}
              value={quality}
              onChange={setQuality}
              options={[
                { value: "basic", label: d.q_basic },
                { value: "standard", label: d.q_standard },
                { value: "premium", label: d.q_premium },
              ]}
            />
            <SelectField label={d.location} value={location} onChange={setLocation} options={(Object.keys(LOCATION_FACTORS) as Location[]).map((k) => ({ value: k, label: d[`loc_${k}` as const] }))} />
          </div>
          <Segmented
            label={hi ? "ठेकेदार का रेट" : "Contractor's quote as"}
            value={mode}
            onChange={setMode}
            options={[
              { value: "sqft", label: "₹ / sqft" },
              { value: "lump", label: hi ? "कुल रकम ₹" : "Total ₹" },
            ]}
          />
          <NumberField label={mode === "sqft" ? (hi ? "ठेकेदार का रेट (₹/sqft)" : "Quoted rate (₹/sqft)") : hi ? "ठेकेदार की कुल रकम (₹)" : "Quoted total (₹)"} value={quote} onChange={setQuote} suffix="₹" />
          <details className="rounded-xl border border-line px-4 py-3">
            <summary className="cursor-pointer text-[14px] font-semibold">{hi ? "आइटम-वार रेट भी जांचें (वैकल्पिक)" : "Also check item rates (optional)"}</summary>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(Object.keys(ITEM_BENCHMARKS) as QuoteItem[]).map((k) => (
                <NumberField key={k} label={ITEM_LABEL[k][lang]} value={items[k]} onChange={(x) => setItems((s) => ({ ...s, [k]: x }))} />
              ))}
            </div>
          </details>
        </div>

        {res && v ? (
          <div className="flex flex-col gap-3 lg:sticky lg:top-4">
            <section aria-live="polite" className="rounded-2xl bg-ink p-5 text-[#f5f3ef] sm:p-6">
              <span className="block text-[13px] font-bold uppercase tracking-wide text-amber">{hi ? "फ़ैसला" : "Verdict"}</span>
              <div className={"mt-2 inline-flex rounded-xl border px-3 py-2 text-[18px] font-extrabold " + v.cls}>{v[lang]}</div>
              <p className="mt-3 text-[14px] leading-relaxed text-[#e7e3dc]">{hi ? v.hiD : v.enD}</p>

              <div className="mt-5" aria-hidden="true">
                <div className="relative h-3 rounded-full" style={{ background: "linear-gradient(90deg,#c0503f 0%,#e8c55a 25%,#4fae7d 40%,#4fae7d 63%,#e8c55a 75%,#c0503f 100%)" }}>
                  <span className="absolute top-1/2 h-6 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded bg-white shadow" style={{ left: `${pos}%` }} />
                </div>
                <div className="mt-1.5 flex justify-between text-[11px] text-[#cfcbc2]">
                  <span>−30%</span>
                  <span>{hi ? "बाज़ार" : "Market"}</span>
                  <span>+30%</span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-[#222427] p-3">
                  <dt className="text-[12px] text-[#cfcbc2]">{hi ? "ठेकेदार" : "Quote"}</dt>
                  <dd className="text-[18px] font-bold">{rupees(res.quotePerSqft)}/sqft</dd>
                  <dd className="text-[12px] text-[#cfcbc2]">₹{lakhWords(res.quoteTotal)}</dd>
                </div>
                <div className="rounded-xl bg-[#222427] p-3">
                  <dt className="text-[12px] text-[#cfcbc2]">{hi ? "BOQFather बेंचमार्क" : "BOQFather benchmark"}</dt>
                  <dd className="text-[18px] font-bold text-amber">{rupees(res.benchPerSqft)}/sqft</dd>
                  <dd className="text-[12px] text-[#cfcbc2]">₹{lakhWords(res.benchTotal)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-[14px]">
                {hi ? "फ़र्क" : "Difference"}:{" "}
                <strong className={res.diffAmount > 0 ? "text-[#f1a597]" : "text-[#9fdcbb]"}>
                  {res.diffPct >= 0 ? "+" : ""}
                  {round(res.diffPct, 1)}% ({res.diffAmount >= 0 ? "+" : "−"}
                  {rupees(Math.abs(res.diffAmount))})
                </strong>
              </p>
            </section>
            <WhatsAppShare
              lang={lang}
              text={`BOQFather quote check: contractor ${rupees(res.quotePerSqft)}/sqft vs benchmark ${rupees(res.benchPerSqft)}/sqft (${res.diffPct >= 0 ? "+" : ""}${round(res.diffPct, 1)}%) – ${VERDICT[res.verdict].en}`}
            />
          </div>
        ) : (
          <Invalid lang={lang} />
        )}
      </div>

      {res && res.items.length > 0 && (
        <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="font-display text-[19px] font-bold">{hi ? "आइटम-वार जांच" : "Item-wise check"}</h2>
          <ul className="mt-4 flex flex-col divide-y divide-[#f0ece5] text-[14px]">
            {res.items.map((i) => (
              <li key={i.key} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 py-3">
                <span className="font-semibold">{ITEM_LABEL[i.key][lang]}</span>
                <span
                  className={
                    "rounded-full px-2.5 py-0.5 text-[12px] font-bold " +
                    (i.status === "ok" ? "bg-[#e5f4ec] text-good" : i.status === "high" ? "bg-[#fdecea] text-[#9a3b2e]" : "bg-warn-tint text-warn")
                  }
                >
                  {i.status === "ok" ? (hi ? "ठीक" : "OK") : i.status === "high" ? (hi ? "ज़्यादा" : "High") : hi ? "कम — क्वालिटी जांचें" : "Low — check quality"}
                </span>
                <span className="text-muted">
                  {hi ? "कोट" : "Quoted"} ₹{inr(i.rate)} · {hi ? "बाज़ार" : "market"} ₹{inr(i.min)}–{inr(i.max)}/{i.unit}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-muted">{hi ? "बाज़ार रेंज सांकेतिक है; अपने शहर के हिसाब से जांचें।" : "Market ranges are indicative; check them for your city."}</p>
        </section>
      )}

      <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-[19px] font-bold">{hi ? "साइन करने से पहले ठेकेदार से पूछें" : "Ask the contractor before signing"}</h2>
          <span className="text-[13px] font-semibold text-steel">
            {done} / {QUOTE_CHECKLIST.length} {hi ? "पक्का" : "clarified"}
          </span>
        </div>
        <ul className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
          {QUOTE_CHECKLIST.map((c, i) => (
            <li key={c.en}>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line px-3 py-2.5 text-[14px] leading-snug has-[:checked]:border-[#a8d8be] has-[:checked]:bg-[#f2faf5]">
                <input
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[#1f7a4d]"
                  checked={checked[i]}
                  onChange={(e) => setChecked((s) => s.map((x, k) => (k === i ? e.target.checked : x)))}
                />
                {c[lang]}
              </label>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
