"use client";

import { useMemo, useState } from "react";
import { BoqResult, calcBoq, inr, lakhWords, Location, LOCATION_FACTORS, round, ROOM_SIZES, RoomType, rupees } from "@/engine";
import { name, t } from "@/i18n/ui";
import type { Lang } from "@/lib/site";
import { dimToM, Segmented, SelectField } from "@/components/ui/Fields";
import { WhatsAppShare } from "@/components/ui/Results";

const FT = 3.28084;
const SIZE_TYPES: RoomType[] = ["hall", "bedroom", "kitchen", "dining", "toilet", "balcony"];
const ROOM_LABEL: Record<RoomType, { en: string; hi: string }> = {
  hall: { en: "Hall / living", hi: "हॉल / लिविंग" },
  dining: { en: "Dining", hi: "डाइनिंग" },
  kitchen: { en: "Kitchen", hi: "किचन" },
  bedroom: { en: "Bedroom", hi: "बेडरूम" },
  toilet: { en: "Toilet", hi: "टॉयलेट" },
  passage: { en: "Passage", hi: "पैसेज" },
  balcony: { en: "Balcony", hi: "बालकनी" },
};

function Stepper(props: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-line px-3 py-2">
      <span className="text-[14px] font-semibold">{props.label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={`${props.label} −`}
          onClick={() => props.onChange(Math.max(props.min, props.value - 1))}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#efece6] text-[20px] font-bold disabled:opacity-40"
          disabled={props.value <= props.min}
        >
          −
        </button>
        <output className="w-8 text-center text-[17px] font-bold">{props.value}</output>
        <button
          type="button"
          aria-label={`${props.label} +`}
          onClick={() => props.onChange(Math.min(props.max, props.value + 1))}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#efece6] text-[20px] font-bold disabled:opacity-40"
          disabled={props.value >= props.max}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function BoqCalc({ lang }: { lang: Lang }) {
  const d = t(lang);
  const hi = lang === "hi";
  const [floors, setFloors] = useState<"1" | "2" | "3" | "4">("2");
  const [bed, setBed] = useState(2);
  const [toi, setToi] = useState(2);
  const [kitchen, setKitchen] = useState<"yes" | "no">("yes");
  const [dining, setDining] = useState<"yes" | "no">("yes");
  const [balc, setBalc] = useState(0);
  const [location, setLocation] = useState<Location>("tier2");
  const [sizes, setSizes] = useState<Record<string, [string, string]>>(
    Object.fromEntries(SIZE_TYPES.map((k) => [k, [String(round(ROOM_SIZES[k][0] * FT, 1)), String(round(ROOM_SIZES[k][1] * FT, 1))]])),
  );
  const [rates, setRates] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<"" | "pdf" | "xls">("");

  const roomSizes = useMemo(() => {
    const out: Partial<Record<RoomType, [number, number]>> = {};
    for (const k of SIZE_TYPES) {
      const l = dimToM(sizes[k][0], "ft"), b = dimToM(sizes[k][1], "ft");
      const dl = ROOM_SIZES[k][0], db = ROOM_SIZES[k][1];
      if (l > 0.5 && b > 0.5 && (Math.abs(l - dl) > 0.02 || Math.abs(b - db) > 0.02)) out[k] = [round(l, 2), round(b, 2)];
    }
    return out;
  }, [sizes]);

  const res: BoqResult = useMemo(() => {
    const input = {
      floors: Number(floors),
      plan: { bedrooms: bed, toilets: toi, kitchen: kitchen === "yes", dining: dining === "yes", balconies: balc },
      locationFactor: LOCATION_FACTORS[location],
      roomSizes,
    };
    const first = calcBoq(input);
    const overrides: Record<string, number> = {};
    for (const s of first.sections)
      for (const i of s.items) {
        const v = Number(rates[i.desc]);
        if (rates[i.desc] !== undefined && rates[i.desc] !== "" && Number.isFinite(v) && v >= 0) overrides[i.code] = v;
      }
    return Object.keys(overrides).length ? calcBoq({ ...input, rateOverrides: overrides }) : first;
  }, [floors, bed, toi, kitchen, dining, balc, location, roomSizes, rates]);

  const g = res.geometry;
  const title = `${bed}BHK ${floors === "1" ? "G" : `G+${Number(floors) - 1}`} house – ${Math.round(g.builtUpSqft)} sqft`;
  const maxSub = Math.max(...res.sections.map((s) => s.subtotal));

  const run = async (kind: "pdf" | "xls") => {
    setBusy(kind);
    try {
      const m = await import("@/lib/boqExport");
      if (kind === "pdf") await m.downloadBoqPdf(res, title);
      else await m.downloadBoqExcel(res, title);
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 sm:p-6">
          <Segmented
            label={d.floors}
            value={floors}
            onChange={setFloors}
            options={(["1", "2", "3", "4"] as const).map((f) => ({ value: f, label: f === "1" ? "G" : `G+${Number(f) - 1}` }))}
          />
          <span className="text-[13px] font-semibold text-body">{hi ? "हर मंज़िल पर" : "On every floor"}</span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Stepper label={hi ? "बेडरूम" : "Bedrooms"} value={bed} min={1} max={5} onChange={setBed} />
            <Stepper label={hi ? "टॉयलेट" : "Toilets"} value={toi} min={1} max={5} onChange={setToi} />
            <Stepper label={hi ? "बालकनी" : "Balconies"} value={balc} min={0} max={3} onChange={setBalc} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Segmented label={hi ? "किचन" : "Kitchen"} value={kitchen} onChange={setKitchen} options={[{ value: "yes", label: hi ? "हां" : "Yes" }, { value: "no", label: hi ? "नहीं" : "No" }]} />
            <Segmented label={hi ? "डाइनिंग" : "Dining"} value={dining} onChange={setDining} options={[{ value: "yes", label: hi ? "हां" : "Yes" }, { value: "no", label: hi ? "नहीं" : "No" }]} />
          </div>
          <SelectField
            label={d.location}
            value={location}
            onChange={setLocation}
            options={(Object.keys(LOCATION_FACTORS) as Location[]).map((k) => ({ value: k, label: `${d[`loc_${k}` as const]} (×${LOCATION_FACTORS[k]} ${hi ? "रेट" : "rates"})` }))}
          />
          <details className="rounded-xl border border-line px-4 py-3">
            <summary className="cursor-pointer text-[14px] font-semibold">{hi ? "कमरों के साइज़ बदलें (फ़ीट)" : "Change room sizes (feet)"}</summary>
            <div className="mt-3 flex flex-col gap-2">
              {SIZE_TYPES.map((k) => (
                <div key={k} className="grid grid-cols-[minmax(0,1fr)_76px_14px_76px] items-center gap-2 text-[14px]">
                  <span>{ROOM_LABEL[k][lang]}</span>
                  <input
                    aria-label={`${ROOM_LABEL[k][lang]} length ft`}
                    inputMode="text"
                    className="h-10 rounded-lg border border-[#cfc9be] px-2 text-right"
                    value={sizes[k][0]}
                    onChange={(e) => setSizes((s) => ({ ...s, [k]: [e.target.value, s[k][1]] }))}
                  />
                  <span className="text-center text-muted">×</span>
                  <input
                    aria-label={`${ROOM_LABEL[k][lang]} width ft`}
                    inputMode="text"
                    className="h-10 rounded-lg border border-[#cfc9be] px-2 text-right"
                    value={sizes[k][1]}
                    onChange={(e) => setSizes((s) => ({ ...s, [k]: [s[k][0], e.target.value] }))}
                  />
                </div>
              ))}
              <span className="text-[12px] text-muted">{hi ? `12.5 या 12'-6" दोनों चलेंगे` : `Type 12.5 or 12'-6"`}</span>
            </div>
          </details>
        </div>

        <div className="flex flex-col gap-3 lg:sticky lg:top-4">
          <section aria-live="polite" className="rounded-2xl bg-ink p-5 text-[#f5f3ef] sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] font-bold uppercase tracking-wide text-amber">{hi ? "आइटम-वार BOQ – कुल" : "Item-wise BOQ – grand total"}</span>
              <span className="rounded-full bg-[#2a2c2f] px-2.5 py-1 text-[11px] font-semibold text-[#cfcbc2]">{d.preliminary}</span>
            </div>
            <div className="font-display mt-2 text-[38px] font-extrabold leading-none sm:text-[44px]">{rupees(res.grandTotal)}</div>
            <div className="mt-1 text-[14px] text-[#cfcbc2]">
              ≈ ₹{lakhWords(res.grandTotal)} · {hi ? "5% आकस्मिक खर्च सहित" : "incl. 5% contingency"}
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-xl bg-[#222427] p-3">
                <dt className="text-[12px] text-[#cfcbc2]">{d.per_sqft}</dt>
                <dd className="text-[17px] font-bold text-amber">{rupees(res.perSqft)}</dd>
              </div>
              <div className="rounded-xl bg-[#222427] p-3">
                <dt className="text-[12px] text-[#cfcbc2]">{hi ? "बिल्ट-अप / मंज़िल" : "Built-up / floor"}</dt>
                <dd className="text-[17px] font-bold">{inr(g.builtUpSqftPerFloor)} sqft</dd>
              </div>
              <div className="rounded-xl bg-[#222427] p-3">
                <dt className="text-[12px] text-[#cfcbc2]">{hi ? "कारपेट / मंज़िल" : "Carpet / floor"}</dt>
                <dd className="text-[17px] font-bold">{inr(g.carpetSqftPerFloor)} sqft</dd>
              </div>
              <div className="rounded-xl bg-[#222427] p-3">
                <dt className="text-[12px] text-[#cfcbc2]">{hi ? "BOQ आइटम" : "BOQ items"}</dt>
                <dd className="text-[17px] font-bold">{res.sections.reduce((a, s) => a + s.items.length, 0)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[13px] text-[#cfcbc2]">
              {hi ? "अनुमानित लेआउट" : "Assumed layout"}: {round(g.L0 * FT, 1)} × {round(g.B0 * FT, 1)} ft · {g.columns} {hi ? "कॉलम" : "columns"} · {inr(g.builtUpSqft)} sqft {hi ? "कुल" : "total"}
            </p>
          </section>
          <div className="no-print flex flex-wrap gap-2">
            <button type="button" onClick={() => run("xls")} disabled={!!busy} className="inline-flex h-11 items-center justify-center rounded-lg bg-amber px-4 text-[14px] font-extrabold text-ink hover:brightness-105 disabled:opacity-60">
              {busy === "xls" ? "…" : hi ? "Excel डाउनलोड" : "Download Excel"}
            </button>
            <button type="button" onClick={() => run("pdf")} disabled={!!busy} className="inline-flex h-11 items-center justify-center rounded-lg border border-ink bg-white px-4 text-[14px] font-bold disabled:opacity-60">
              {busy === "pdf" ? "…" : hi ? "PDF (एब्स्ट्रैक्ट + MB)" : "PDF (abstract + MB)"}
            </button>
            <WhatsAppShare lang={lang} text={`BOQFather – ${title}: item-wise BOQ ${rupees(res.grandTotal)} (${rupees(res.perSqft)}/sqft)`} />
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-[20px] font-bold">{hi ? "एब्स्ट्रैक्ट ऑफ़ कॉस्ट" : "Abstract of cost"}</h2>
          <span className="text-[13px] text-muted">{hi ? "कोई भी रेट बदलें — कुल अपने आप बदलेगा" : "Edit any rate — totals update instantly"}</span>
        </div>
        <ul className="mt-4 flex flex-col gap-2">
          {res.sections.map((s) => (
            <li key={s.code} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 text-[14px] sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)_120px]">
              <span className="font-semibold">
                {s.code}. {s.title[lang]}
              </span>
              <span className="order-3 col-span-2 h-2.5 rounded-full bg-[#f0ece5] sm:order-none sm:col-span-1">
                <span className="block h-2.5 rounded-full bg-amber" style={{ width: `${(s.subtotal / maxSub) * 100}%` }} />
              </span>
              <span className="text-right font-semibold">{rupees(s.subtotal)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col gap-3">
          {res.sections.map((s, si) => (
            <details key={s.code} open={si === 0} className="rounded-xl border border-line">
              <summary className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-[#fbf3de] px-4 py-3 text-[15px] font-bold">
                <span>
                  {s.code}. {s.title[lang]} <span className="font-normal text-muted">· {s.items.length} {hi ? "आइटम" : "items"}</span>
                </span>
                <span>{rupees(s.subtotal)}</span>
              </summary>
              <ul className="divide-y divide-[#f0ece5]">
                {s.items.map((i) => (
                  <li key={i.code} className="px-4 py-3">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 sm:grid-cols-[48px_minmax(0,1fr)_120px_110px_120px] sm:items-center">
                      <span className="hidden text-[13px] font-bold text-amber-dark sm:block">{i.code}</span>
                      <span className="text-[14px]">
                        <span className="mr-1.5 font-bold text-amber-dark sm:hidden">{i.code}</span>
                        {i.desc}
                      </span>
                      <span className="text-right text-[14px] font-semibold">
                        {i.qty} {i.unit}
                      </span>
                      <label className="flex items-center gap-2 text-[12px] text-muted sm:justify-end">
                        <span>₹</span>
                        <input
                          aria-label={`${i.code} rate`}
                          inputMode="decimal"
                          className="h-9 w-24 rounded-md border border-[#cfc9be] px-2 text-right text-[14px] text-ink"
                          value={rates[i.desc] ?? String(i.rate)}
                          onChange={(e) => setRates((r) => ({ ...r, [i.desc]: e.target.value }))}
                        />
                        <span>/{i.unit}</span>
                      </label>
                      <span className="text-right text-[14px] font-bold">{rupees(i.amount)}</span>
                    </div>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-[13px] font-semibold text-steel">{hi ? "मेज़रमेंट देखें" : "Show measurement"}</summary>
                      <p className="mt-1 text-[12px] italic text-muted">{i.basis}</p>
                      <div className="mt-2 overflow-x-auto">
                        <table className="w-full min-w-[520px] border-collapse text-[12.5px]">
                          <thead>
                            <tr className="bg-[#f5f3ef] text-left text-muted">
                              <th className="px-2 py-1.5 font-semibold">{hi ? "विवरण" : "Description"}</th>
                              <th className="px-2 py-1.5 text-right font-semibold">Nos</th>
                              <th className="px-2 py-1.5 text-right font-semibold">L</th>
                              <th className="px-2 py-1.5 text-right font-semibold">B</th>
                              <th className="px-2 py-1.5 text-right font-semibold">H/D</th>
                              <th className="px-2 py-1.5 text-right font-semibold">Qty</th>
                            </tr>
                          </thead>
                          <tbody className="tabular-nums">
                            {i.rows.map((x, k) => (
                              <tr key={k} className={"border-t border-[#f0ece5] " + (x.q < 0 ? "text-[#9a3b2e]" : "")}>
                                <td className="px-2 py-1.5">{x.desc}</td>
                                <td className="px-2 py-1.5 text-right">{x.n}</td>
                                <td className="px-2 py-1.5 text-right">{x.L !== undefined ? round(x.L, 3) : ""}</td>
                                <td className="px-2 py-1.5 text-right">{x.B !== undefined ? round(x.B, 3) : ""}</td>
                                <td className="px-2 py-1.5 text-right">{x.H !== undefined ? round(x.H, 3) : ""}</td>
                                <td className="px-2 py-1.5 text-right font-semibold">{round(x.q, Math.max(i.dec, 1))}</td>
                              </tr>
                            ))}
                            <tr className="border-t border-line bg-[#fce7b2]">
                              <td className="px-2 py-1.5 font-bold">TOTAL</td>
                              <td colSpan={4} />
                              <td className="px-2 py-1.5 text-right font-bold">
                                {i.qty} {i.unit}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>

        <dl className="mt-5 flex flex-col gap-1.5 border-t border-line pt-4 text-[15px]">
          <div className="flex justify-between gap-3">
            <dt>{hi ? "सभी आइटम का जोड़" : "Total of all items"}</dt>
            <dd className="font-semibold">{rupees(res.itemsTotal)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>{hi ? "आकस्मिक / अन्य 5%" : "Contingency / misc. 5%"}</dt>
            <dd className="font-semibold">{rupees(res.contingency)}</dd>
          </div>
          <div className="flex justify-between gap-3 rounded-lg bg-[#fce7b2] px-3 py-2 text-[17px] font-extrabold">
            <dt>{hi ? "कुल योग" : "Grand total"}</dt>
            <dd>{rupees(res.grandTotal)}</dd>
          </div>
        </dl>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="font-display text-[19px] font-bold">{hi ? "सामग्री और थंब रूल जांच" : "Materials and thumb-rule check"}</h2>
          <ul className="mt-4 flex flex-col divide-y divide-[#f0ece5] text-[14px]">
            {res.thumb.map((tr) => {
              const off = Math.abs(tr.diffPct) > 25;
              return (
                <li key={tr.key} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-0.5 py-2.5">
                  <span className="font-semibold">{name(tr.key, lang)}</span>
                  <span className="text-right font-bold">
                    {inr(tr.qty)} {name(tr.unit, lang)}
                  </span>
                  <span className="text-[12px] text-muted">
                    {hi ? "थंब रूल" : "Thumb rule"} {tr.perSqft}/sqft = {inr(tr.thumbQty)}
                  </span>
                  <span className={"text-right text-[12px] font-bold " + (off ? "text-warn" : "text-good")}>
                    {tr.diffPct >= 0 ? "+" : ""}
                    {Math.round(tr.diffPct)}%
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-[12px] leading-relaxed text-muted">
            {hi
              ? "25% से ज़्यादा फ़र्क पीले रंग में। एक-मंज़िला घर, 9 इंच की बाहरी दीवार और पैरापेट से ईंट थंब रूल से ज़्यादा आती है।"
              : "Differences over 25% are flagged. Low-rise houses with 9-inch outer walls and parapets need more bricks than the multi-storey thumb rule."}
          </p>
        </section>

        <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="font-display text-[19px] font-bold">{hi ? "कमरों की सूची (हर मंज़िल)" : "Room schedule (each floor)"}</h2>
          <ul className="mt-4 flex flex-col divide-y divide-[#f0ece5] text-[14px]">
            {res.rooms
              .filter((r) => r.floor === 0)
              .map((r) => (
                <li key={r.code} className="flex justify-between gap-3 py-2">
                  <span>
                    <span className="mr-2 font-bold text-amber-dark">{r.code}</span>
                    {ROOM_LABEL[r.type][lang]}
                  </span>
                  <span className="tabular-nums text-muted">
                    {round(r.L * FT, 1)} × {round(r.B * FT, 1)} ft · {round(r.area * 10.764)} sqft
                  </span>
                </li>
              ))}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
        <h2 className="font-display text-[19px] font-bold">{d.assumptions}</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[13.5px] leading-relaxed text-body">
          {res.assumptions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
