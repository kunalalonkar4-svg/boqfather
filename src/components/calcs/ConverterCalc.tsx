"use client";

import { useState } from "react";
import { CEMENT_BAG_KG, CEMENT_BAG_M3, CFT_PER_M3, formatFtIn, FT_PER_M, parseFtIn, round, SQFT_PER_M2 } from "@/engine";
import type { Lang } from "@/lib/site";
import { NumberField, SelectField } from "@/components/ui/Fields";

type Group = { key: string; en: string; hi: string; units: { u: string; label: string; toBase: number }[] };

/** Every unit as a factor to a base unit (m³, m², kg, bag). */
const GROUPS: Group[] = [
  {
    key: "volume",
    en: "Volume",
    hi: "आयतन",
    units: [
      { u: "m3", label: "m³", toBase: 1 },
      { u: "cft", label: "cft", toBase: 1 / CFT_PER_M3 },
      { u: "brass", label: "brass (100 cft)", toBase: 100 / CFT_PER_M3 },
      { u: "litre", label: "litre", toBase: 0.001 },
    ],
  },
  {
    key: "area",
    en: "Area",
    hi: "क्षेत्रफल",
    units: [
      { u: "m2", label: "m²", toBase: 1 },
      { u: "sqft", label: "sqft", toBase: 1 / SQFT_PER_M2 },
      { u: "sqyd", label: "sq yard / gaj", toBase: 9 / SQFT_PER_M2 },
      { u: "acre", label: "acre", toBase: 4046.856 },
    ],
  },
  {
    key: "cement",
    en: "Cement",
    hi: "सीमेंट",
    units: [
      { u: "bag", label: "bags (50 kg)", toBase: 1 },
      { u: "kg", label: "kg", toBase: 1 / CEMENT_BAG_KG },
      { u: "m3", label: "m³", toBase: 1 / CEMENT_BAG_M3 },
      { u: "cft", label: "cft", toBase: 1 / (CEMENT_BAG_M3 * CFT_PER_M3) },
    ],
  },
  {
    key: "weight",
    en: "Steel / weight",
    hi: "सरिया / वज़न",
    units: [
      { u: "kg", label: "kg", toBase: 1 },
      { u: "quintal", label: "quintal", toBase: 100 },
      { u: "tonne", label: "tonne", toBase: 1000 },
    ],
  },
];

function GroupCard({ g, lang }: { g: Group; lang: Lang }) {
  const [val, setVal] = useState("1");
  const [from, setFrom] = useState(g.units[0].u);
  const unit = g.units.find((x) => x.u === from)!;
  const n = Number(val);
  const base = Number.isFinite(n) ? n * unit.toBase : NaN;
  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      <h2 className="font-display text-[18px] font-bold">{g[lang]}</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <NumberField label={lang === "hi" ? "मान" : "Value"} value={val} onChange={setVal} />
        <SelectField label={lang === "hi" ? "से" : "From"} value={from} onChange={setFrom} options={g.units.map((x) => ({ value: x.u, label: x.label }))} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2">
        {g.units
          .filter((x) => x.u !== from)
          .map((x) => (
            <div key={x.u} className="rounded-xl bg-ground px-3 py-2.5">
              <dt className="text-[12px] text-muted">{x.label}</dt>
              <dd className="text-[17px] font-bold">{Number.isFinite(base) ? round(base / x.toBase, 4).toLocaleString("en-IN") : "—"}</dd>
            </div>
          ))}
      </dl>
    </section>
  );
}

function LengthCard({ lang }: { lang: Lang }) {
  const [ftin, setFtin] = useState(`13'-8"`);
  const [m, setM] = useState("4.166");
  const fromFt = parseFtIn(ftin);
  const fromM = Number(m);
  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      <h2 className="font-display text-[18px] font-bold">{lang === "hi" ? "लंबाई (फ़ीट-इंच ↔ मीटर)" : "Length (feet-inch ↔ metre)"}</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <NumberField label={lang === "hi" ? "फ़ीट-इंच" : "Feet-inch"} value={ftin} onChange={setFtin} inputMode="text" hint={`13'-8", 10' 6", 9.5`} />
          <div className="rounded-xl bg-ground px-3 py-2.5 text-[17px] font-bold">{Number.isFinite(fromFt) ? `${round(fromFt, 3)} m` : "—"}</div>
        </div>
        <div className="flex flex-col gap-2">
          <NumberField label={lang === "hi" ? "मीटर" : "Metre"} value={m} onChange={setM} hint=" " />
          <div className="rounded-xl bg-ground px-3 py-2.5 text-[17px] font-bold">
            {Number.isFinite(fromM) && fromM >= 0 ? `${formatFtIn(fromM)} · ${round(fromM * FT_PER_M, 3)} ft` : "—"}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ConverterCalc({ lang }: { lang: Lang }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {GROUPS.map((g) => (
        <GroupCard key={g.key} g={g} lang={lang} />
      ))}
      <LengthCard lang={lang} />
    </div>
  );
}
