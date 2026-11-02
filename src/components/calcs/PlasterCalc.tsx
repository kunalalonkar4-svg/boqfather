"use client";

import { useMemo, useState } from "react";
import { areaToM2, calcPlaster, LengthUnit, m2ToSqft, MORTAR_RATIOS, MortarRatio, round } from "@/engine";
import { t } from "@/i18n/ui";
import type { Lang } from "@/lib/site";
import { dimToM, NumberField, num, Segmented, SelectField } from "@/components/ui/Fields";
import { CalcFrame, Invalid, ResultPanel, WhatsAppShare, Working } from "@/components/ui/Results";
import { areaSuffix, UnitToggle, unitSuffix } from "./shared";

export default function PlasterCalc({ lang }: { lang: Lang }) {
  const d = t(lang);
  const [unit, setUnit] = useState<LengthUnit>("ft");
  const [L, setL] = useState("13");
  const [H, setH] = useState("10");
  const [nos, setNos] = useState("4");
  const [open, setOpen] = useState("40");
  const [thk, setThk] = useState<"12" | "15" | "20">("12");
  const [ratio, setRatio] = useState<MortarRatio>("1:6");

  const changeUnit = (u: LengthUnit) => {
    setUnit(u);
    if (u === "m") {
      setL("4");
      setH("3");
      setOpen("4");
    } else {
      setL("13");
      setH("10");
      setOpen("40");
    }
  };

  const res = useMemo(() => {
    const l = dimToM(L, unit), h = dimToM(H, unit), n = num(nos), o = num(open || "0");
    if (![l, h, n, o].every((x) => Number.isFinite(x) && x >= 0)) return null;
    const area = l * h * n - areaToM2(o, unit);
    if (area <= 0) return null;
    return calcPlaster({ areaM2: area, thicknessMm: Number(thk), ratio });
  }, [L, H, nos, open, thk, ratio, unit]);

  const u = unitSuffix(unit);
  const v = res?.values;
  const area = res ? res.values.wetM3 / (Number(thk) / 1000) : 0;
  return (
    <CalcFrame
      form={
        <>
          <UnitToggle lang={lang} unit={unit} onChange={changeUnit} />
          <div className="grid grid-cols-3 gap-3">
            <NumberField label={lang === "hi" ? "दीवार की लंबाई" : "Wall length"} value={L} onChange={setL} suffix={u} inputMode="text" />
            <NumberField label={d.height} value={H} onChange={setH} suffix={u} inputMode="text" />
            <NumberField label={lang === "hi" ? "दीवारें" : "Walls"} value={nos} onChange={setNos} suffix="nos" />
          </div>
          <NumberField label={d.openings} value={open} onChange={setOpen} suffix={areaSuffix(unit)} />
          <Segmented
            label={d.plaster_thk}
            value={thk}
            onChange={setThk}
            options={[
              { value: "12", label: "12 mm" },
              { value: "15", label: "15 mm" },
              { value: "20", label: "20 mm" },
            ]}
          />
          <SelectField
            label={d.mortar}
            value={ratio}
            onChange={setRatio}
            options={(Object.keys(MORTAR_RATIOS) as MortarRatio[]).map((k) => ({ value: k, label: `CM ${k}` }))}
          />
        </>
      }
      result={
        v ? (
          <>
            <ResultPanel
              lang={lang}
              stats={[
                { label: d.cement, value: `${round(v.cementBags, 1)} ${d.bags}`, sub: `CM ${ratio}, ${thk} mm` },
                { label: d.sand, value: `${round(v.sandCft, 1)} cft`, sub: `${round(v.sandM3, 2)} m³` },
                { label: d.area, value: `${round(m2ToSqft(area))} sqft`, sub: `${round(area, 2)} m²` },
                { label: lang === "hi" ? "सूखा मसाला" : "Dry mortar", value: `${round(v.dryM3, 3)} m³` },
              ]}
            />
            <WhatsAppShare
              lang={lang}
              text={`BOQFather – Plaster ${round(m2ToSqft(area))} sqft, ${thk} mm, CM ${ratio}: cement ${round(v.cementBags, 1)} bags, sand ${round(v.sandCft, 1)} cft`}
            />
          </>
        ) : (
          <Invalid lang={lang} />
        )
      }
      working={res && <Working lang={lang} steps={res.steps} assumptions={res.assumptions} />}
    />
  );
}
