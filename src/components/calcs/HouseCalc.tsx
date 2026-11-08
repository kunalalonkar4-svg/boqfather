"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  calcHouse,
  HouseInput,
  inr,
  lakhWords,
  Location,
  LOCATION_FACTORS,
  Material,
  Quality,
  QUALITY_RATES,
  round,
  rupees,
  THUMB_RULES,
} from "@/engine";
import { floorName, name, t } from "@/i18n/ui";
import { langPath, type Lang } from "@/lib/site";
import {
  NumberField,
  num,
  Segmented,
  SelectField,
} from "@/components/ui/Fields";
import { Invalid, WhatsAppShare, Working } from "@/components/ui/Results";

const FLOOR_OPTS = ["1", "2", "3", "4"] as const;

export default function HouseCalc({
  lang,
  initialArea = 1000,
  initialFloors = 2,
  initialRate,
}: {
  lang: Lang;
  /** Standard rate ₹/sqft to start with (a city's rate). */
  initialRate?: number;
  /** Built-up area per floor (sqft) and floors to start with. */
  initialArea?: number;
  initialFloors?: 1 | 2 | 3 | 4;
}) {
  const d = t(lang);
  const [area, setArea] = useState(String(initialArea));
  const [floors, setFloors] = useState<(typeof FLOOR_OPTS)[number]>(
    String(initialFloors) as (typeof FLOOR_OPTS)[number],
  );
  const [quality, setQuality] = useState<Quality>("standard");
  const [location, setLocation] = useState<Location>("tier2");
  const [rate, setRate] = useState(
    String(initialRate ?? QUALITY_RATES.standard),
  );
  const [matRates, setMatRates] = useState<Record<Material, string>>(
    Object.fromEntries(
      (Object.keys(THUMB_RULES) as Material[]).map((k) => [
        k,
        String(THUMB_RULES[k].rate),
      ]),
    ) as Record<Material, string>,
  );
  const [busy, setBusy] = useState(false);

  const input: HouseInput | null = useMemo(() => {
    const a = num(area),
      r = num(rate);
    if (!(a > 0 && r > 0)) return null;
    const mr: Partial<Record<Material, number>> = {};
    for (const k of Object.keys(matRates) as Material[]) {
      const v = num(matRates[k]);
      if (Number.isFinite(v) && v >= 0) mr[k] = v;
    }
    return {
      areaPerFloorSqft: a,
      floors: Number(floors),
      quality,
      location,
      baseRate: r,
      materialRates: mr,
    };
  }, [area, floors, quality, location, rate, matRates]);
  const res = useMemo(() => (input ? calcHouse(input) : null), [input]);
  const v = res?.values;

  const pickQuality = (q: Quality) => {
    setQuality(q);
    // a city page starts from its own level; other finishes keep that level
    const k = (initialRate ?? QUALITY_RATES.standard) / QUALITY_RATES.standard;
    setRate(String(Math.round((QUALITY_RATES[q] * k) / 10) * 10));
  };

  const pdf = async () => {
    if (!input || !v) return;
    setBusy(true);
    try {
      const { downloadHousePdf } = await import("@/lib/housePdf");
      await downloadHousePdf(input, v);
    } finally {
      setBusy(false);
    }
  };

  const maxPhase = v ? Math.max(...v.phases.map((p) => p.pct)) : 1;
  const floorLabel = (f: string) => (f === "1" ? "G" : `G+${Number(f) - 1}`);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4">
            <NumberField
              label={d.area_per_floor}
              value={area}
              onChange={setArea}
              suffix="sqft"
            />
            <Segmented
              label={d.floors}
              value={floors}
              onChange={setFloors}
              options={FLOOR_OPTS.map((f) => ({
                value: f,
                label: floorLabel(f),
              }))}
            />
            <SelectField
              label={d.location}
              value={location}
              onChange={setLocation}
              options={(Object.keys(LOCATION_FACTORS) as Location[]).map(
                (k) => ({
                  value: k,
                  label: `${d[`loc_${k}` as const]} (×${LOCATION_FACTORS[k]})`,
                }),
              )}
            />
            <Segmented
              label={d.quality}
              value={quality}
              onChange={pickQuality}
              options={(Object.keys(QUALITY_RATES) as Quality[]).map((q) => ({
                value: q,
                label: d[`q_${q}` as const],
              }))}
            />
            <NumberField
              label={d.base_rate}
              value={rate}
              onChange={setRate}
              suffix="₹"
              hint={
                lang === "hi"
                  ? "अपना लोकल रेट डाल सकते हैं"
                  : "Enter your local rate if you know it"
              }
            />
          </div>
        </div>

        {v ? (
          <div className="flex flex-col gap-3 lg:sticky lg:top-20">
            <section
              aria-live="polite"
              className="rounded-2xl bg-ink p-5 text-[#f7fafe] sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-bold uppercase tracking-wide text-amber">
                  {d.total_cost}
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-[#c3cfdd]">
                  {d.preliminary}
                </span>
              </div>
              <div className="font-display mt-2 text-[38px] font-extrabold leading-none sm:text-[44px]">
                {rupees(v.total)}
              </div>
              <div className="mt-1 text-[14px] text-[#c3cfdd]">
                ≈ ₹{lakhWords(v.total)}
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-white/[0.07] p-3 ring-1 ring-white/10">
                  <dt className="text-[12px] text-[#c3cfdd]">{d.per_sqft}</dt>
                  <dd className="text-[18px] font-bold text-amber">
                    {rupees(v.ratePerSqft)}
                  </dd>
                </div>
                <div className="rounded-xl bg-white/[0.07] p-3 ring-1 ring-white/10">
                  <dt className="text-[12px] text-[#c3cfdd]">
                    {lang === "hi" ? "बिल्ट-अप" : "Built-up"}
                  </dt>
                  <dd className="text-[18px] font-bold">
                    {inr(v.totalSqft)} sqft
                  </dd>
                </div>
                <div className="rounded-xl bg-white/[0.07] p-3 ring-1 ring-white/10">
                  <dt className="text-[12px] text-[#c3cfdd]">{d.timeline}</dt>
                  <dd className="text-[18px] font-bold">
                    ~{v.months} {d.months}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-[13px] text-[#c3cfdd]">
                {d.likely_range}: {rupees(v.low)} – {rupees(v.high)}
              </p>
            </section>
            <div className="no-print flex flex-wrap gap-2">
              <button
                type="button"
                onClick={pdf}
                disabled={busy}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-amber px-4 text-[14px] font-extrabold text-white hover:brightness-105 disabled:opacity-60"
              >
                {busy ? "…" : d.download_pdf}
              </button>
              <WhatsAppShare
                lang={lang}
                text={`BOQFather – ${inr(v.totalSqft)} sqft house (${floorLabel(floors)}, ${quality}): approx. ${rupees(v.total)} (${rupees(v.ratePerSqft)}/sqft). Cement ${inr(round(v.materials[0].qty))} bags, steel ${inr(round(v.materials[1].qty))} kg.`}
              />
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-line bg-white px-4 text-[14px] font-semibold"
              >
                {d.print}
              </button>
            </div>
          </div>
        ) : (
          <Invalid lang={lang} />
        )}
      </div>

      {v && res && (
        <>
          <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
            <h2 className="font-display text-[19px] font-bold">
              {d.materials_needed}
            </h2>
            <p className="mt-1 text-[13px] text-muted">
              {lang === "hi"
                ? "रेट बदलकर अपना खर्च देखें।"
                : "Change any rate to see your own cost."}
            </p>
            <ul className="mt-4 flex flex-col divide-y divide-[#f0ece5] border-y border-line">
              <li className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_96px_minmax(0,1fr)] gap-3 py-2 text-[12px] font-semibold text-muted sm:grid">
                <span>{d.material}</span>
                <span className="text-right">
                  {lang === "hi" ? "थंब रूल / sqft" : "Thumb rule / sqft"}
                </span>
                <span className="text-right">{d.quantity}</span>
                <span className="text-right">{d.rate} (₹)</span>
                <span className="text-right">{d.amount}</span>
              </li>
              {v.materials.map((m) => (
                <li
                  key={m.key}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 py-3 text-[14px] sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_96px_minmax(0,1fr)] sm:gap-3"
                >
                  <span className="font-semibold">
                    {name(m.key, lang)}
                    <span className="ml-2 text-[12px] font-normal text-muted sm:hidden">
                      {m.perSqft} {name(m.unit, lang)}/sqft
                    </span>
                  </span>
                  <span className="hidden text-right text-muted sm:block">
                    {m.perSqft} {name(m.unit, lang)}
                  </span>
                  <span className="text-right font-semibold">
                    {inr(round(m.qty))} {name(m.unit, lang)}
                  </span>
                  <label className="flex items-center gap-2 text-[12px] text-muted sm:justify-end">
                    <span className="sm:hidden">{d.rate} ₹</span>
                    <input
                      aria-label={`${name(m.key, lang)} ${d.rate}`}
                      inputMode="decimal"
                      className="h-9 w-20 rounded-md border border-[#cfc9be] px-2 text-right text-[14px] text-ink"
                      value={matRates[m.key]}
                      onChange={(e) =>
                        setMatRates((s) => ({ ...s, [m.key]: e.target.value }))
                      }
                    />
                  </label>
                  <span className="text-right font-semibold">
                    {rupees(m.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
              <h2 className="font-display text-[19px] font-bold">
                {d.stage_cost}
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {v.phases.map((p) => (
                  <li
                    key={p.key}
                    className="grid grid-cols-[minmax(0,1fr)_88px] items-center gap-x-3 gap-y-1 text-[14px] sm:grid-cols-[minmax(0,170px)_minmax(0,1fr)_96px]"
                  >
                    <span className="min-w-0">{name(p.key, lang)}</span>
                    <span className="order-3 col-span-2 h-2.5 rounded-full bg-[#f0ece5] sm:order-none sm:col-span-1">
                      <span
                        className="block h-2.5 rounded-full bg-amber"
                        style={{ width: `${(p.pct / maxPhase) * 100}%` }}
                      />
                    </span>
                    <span className="text-right font-semibold">
                      {rupees(p.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <div className="flex flex-col gap-5">
              <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
                <h2 className="font-display text-[19px] font-bold">
                  {d.cost_split}
                </h2>
                <div
                  className="mt-4 flex h-3 overflow-hidden rounded-full"
                  aria-hidden="true"
                >
                  {v.split.map((s, i) => (
                    <span
                      key={s.key}
                      style={{
                        width: `${s.pct}%`,
                        background: [
                          "#e8a317",
                          "#2f4b66",
                          "#8a8478",
                          "#cfc9be",
                        ][i],
                      }}
                    />
                  ))}
                </div>
                <ul className="mt-3 flex flex-col gap-1.5 text-[14px]">
                  {v.split.map((s, i) => (
                    <li
                      key={s.key}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            background: [
                              "#e8a317",
                              "#2f4b66",
                              "#8a8478",
                              "#cfc9be",
                            ][i],
                          }}
                        />
                        {name(s.key, lang)} · {s.pct}%
                      </span>
                      <span className="font-semibold">{rupees(s.amount)}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
                <h2 className="font-display text-[19px] font-bold">
                  {d.payment_schedule}
                </h2>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full border-collapse text-[14px]">
                    <thead>
                      <tr className="border-b border-line text-left text-[12px] text-muted">
                        <th className="py-2 pr-2 font-semibold">
                          {d.milestone}
                        </th>
                        <th className="py-2 pr-2 text-right font-semibold">
                          {d.share}
                        </th>
                        <th className="py-2 text-right font-semibold">
                          {d.amount}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {v.payments.map((p, i) => (
                        <tr key={i} className="border-b border-[#f0ece5]">
                          <td className="py-2 pr-2">
                            {p.key === "slab"
                              ? `${floorName(p.floor ?? 0, lang)} – ${name("slab", lang)}`
                              : name(p.key, lang)}
                          </td>
                          <td className="py-2 pr-2 text-right text-muted">
                            {round(p.pct, 1)}%
                          </td>
                          <td className="whitespace-nowrap py-2 text-right font-semibold">
                            {rupees(p.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>

          <Working
            lang={lang}
            steps={res.steps}
            assumptions={res.assumptions}
          />

          <Link
            href={langPath(lang, "house-boq-estimate")}
            className="rounded-2xl border border-amber bg-white px-5 py-4 text-[14px] font-semibold text-body hover:bg-amber-tint"
          >
            {d.detailed_cta}
          </Link>
        </>
      )}
    </div>
  );
}
