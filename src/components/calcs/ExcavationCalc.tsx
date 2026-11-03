"use client";

import { useMemo, useState } from "react";
import { calcExcavation, LengthUnit, round, rupees } from "@/engine";
import { t } from "@/i18n/ui";
import type { Lang } from "@/lib/site";
import { dimToM, NumberField, num } from "@/components/ui/Fields";
import {
  CalcFrame,
  Invalid,
  ResultPanel,
  WhatsAppShare,
  Working,
} from "@/components/ui/Results";
import { UnitToggle, unitSuffix } from "./shared";

export default function ExcavationCalc({ lang }: { lang: Lang }) {
  const d = t(lang);
  const [unit, setUnit] = useState<LengthUnit>("m");
  const [L, setL] = useState("1.5");
  const [B, setB] = useState("1.5");
  const [D, setD] = useState("1.5");
  const [nos, setNos] = useState("16");
  const [ws, setWs] = useState("0.2");
  const [swell, setSwell] = useState("25");
  const [rate, setRate] = useState("280");

  const changeUnit = (u: LengthUnit) => {
    setUnit(u);
    if (u === "m") {
      setL("1.5");
      setB("1.5");
      setD("1.5");
      setWs("0.2");
    } else {
      setL("5");
      setB("5");
      setD("5");
      setWs("0.66");
    }
  };

  const res = useMemo(() => {
    const l = dimToM(L, unit),
      b = dimToM(B, unit),
      dd = dimToM(D, unit),
      n = num(nos),
      w = dimToM(ws || "0", unit),
      s = num(swell),
      r = num(rate || "0");
    if (
      ![l, b, dd, n, w, s, r].every((x) => Number.isFinite(x) && x >= 0) ||
      l * b * dd * n <= 0
    )
      return null;
    return calcExcavation({
      lengthM: l,
      widthM: b,
      depthM: dd,
      nos: n,
      workingSpaceM: round(w, 3),
      swellPct: s,
      ratePerM3: r,
    });
  }, [L, B, D, nos, ws, swell, rate, unit]);

  const u = unitSuffix(unit);
  const v = res?.values;
  return (
    <CalcFrame
      form={
        <>
          <UnitToggle lang={lang} unit={unit} onChange={changeUnit} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <NumberField
              label={d.length}
              value={L}
              onChange={setL}
              suffix={u}
              inputMode="text"
            />
            <NumberField
              label={d.width}
              value={B}
              onChange={setB}
              suffix={u}
              inputMode="text"
            />
            <NumberField
              label={lang === "hi" ? "गहराई" : "Depth"}
              value={D}
              onChange={setD}
              suffix={u}
              inputMode="text"
            />
            <NumberField
              label={lang === "hi" ? "गड्ढे" : "Pits"}
              value={nos}
              onChange={setNos}
              suffix="nos"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <NumberField
              label={
                lang === "hi"
                  ? "वर्किंग स्पेस (हर तरफ़)"
                  : "Working space (each side)"
              }
              value={ws}
              onChange={setWs}
              suffix={u}
              inputMode="text"
            />
            <NumberField
              label={lang === "hi" ? "मिट्टी फूलना" : "Soil bulking"}
              value={swell}
              onChange={setSwell}
              suffix="%"
            />
            <NumberField
              label={lang === "hi" ? "रेट (₹/m³)" : "Rate (₹/m³)"}
              value={rate}
              onChange={setRate}
            />
          </div>
        </>
      }
      result={
        v ? (
          <>
            <ResultPanel
              lang={lang}
              stats={[
                {
                  label: d.volume,
                  value: `${round(v.volumeM3, 2)} m³`,
                  sub: `${round(v.volumeCft)} cft`,
                },
                {
                  label: lang === "hi" ? "ब्रास" : "Brass",
                  value: `${round(v.brass, 2)}`,
                },
                {
                  label: lang === "hi" ? "ढीली मिट्टी" : "Loose soil",
                  value: `${round(v.looseM3, 1)} m³`,
                },
                { label: d.cost, value: rupees(v.cost) },
              ]}
            />
            <WhatsAppShare
              lang={lang}
              text={`BOQFather – Excavation: ${round(v.volumeM3, 2)} m³ (${round(v.brass, 2)} brass), cost ${rupees(v.cost)}`}
            />
          </>
        ) : (
          <Invalid lang={lang} />
        )
      }
      working={
        res && (
          <Working
            lang={lang}
            steps={res.steps}
            assumptions={res.assumptions}
          />
        )
      }
    />
  );
}
