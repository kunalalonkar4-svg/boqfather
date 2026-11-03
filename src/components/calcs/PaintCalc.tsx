"use client";

import { useMemo, useState } from "react";
import {
  areaToM2,
  calcPaint,
  LengthUnit,
  round,
  roomPaintArea,
} from "@/engine";
import { t } from "@/i18n/ui";
import type { Lang } from "@/lib/site";
import { dimToM, NumberField, num, Segmented } from "@/components/ui/Fields";
import {
  CalcFrame,
  Invalid,
  ResultPanel,
  WhatsAppShare,
  Working,
} from "@/components/ui/Results";
import { areaSuffix, UnitToggle, unitSuffix } from "./shared";

export default function PaintCalc({ lang }: { lang: Lang }) {
  const d = t(lang);
  const [unit, setUnit] = useState<LengthUnit>("ft");
  const [L, setL] = useState("12");
  const [B, setB] = useState("10");
  const [H, setH] = useState("10");
  const [open, setOpen] = useState("40");
  const [ceiling, setCeiling] = useState<"yes" | "no">("yes");
  const [coats, setCoats] = useState("2");
  const [cov, setCov] = useState("120");

  const changeUnit = (u: LengthUnit) => {
    setUnit(u);
    if (u === "m") {
      setL("3.66");
      setB("3.05");
      setH("3");
      setOpen("3.7");
    } else {
      setL("12");
      setB("10");
      setH("10");
      setOpen("40");
    }
  };

  const res = useMemo(() => {
    const l = dimToM(L, unit),
      b = dimToM(B, unit),
      h = dimToM(H, unit),
      o = num(open || "0"),
      c = num(coats),
      cv = num(cov);
    if (
      ![l, b, h, o, c, cv].every((x) => Number.isFinite(x) && x >= 0) ||
      cv <= 0 ||
      c <= 0
    )
      return null;
    const area = roomPaintArea(l, b, h, areaToM2(o, unit), ceiling === "yes");
    if (area <= 0) return null;
    return calcPaint({ areaM2: area, coats: c, coverageSqftPerL: cv });
  }, [L, B, H, open, ceiling, coats, cov, unit]);

  const u = unitSuffix(unit);
  const v = res?.values;
  return (
    <CalcFrame
      form={
        <>
          <UnitToggle lang={lang} unit={unit} onChange={changeUnit} />
          <div className="grid grid-cols-3 gap-3">
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
              label={d.height}
              value={H}
              onChange={setH}
              suffix={u}
              inputMode="text"
            />
          </div>
          <NumberField
            label={d.openings}
            value={open}
            onChange={setOpen}
            suffix={areaSuffix(unit)}
          />
          <Segmented
            label={lang === "hi" ? "छत (सीलिंग) भी?" : "Include ceiling?"}
            value={ceiling}
            onChange={setCeiling}
            options={[
              { value: "yes", label: lang === "hi" ? "हां" : "Yes" },
              { value: "no", label: lang === "hi" ? "नहीं" : "No" },
            ]}
          />
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label={lang === "hi" ? "कोट" : "Coats"}
              value={coats}
              onChange={setCoats}
            />
            <NumberField
              label={
                lang === "hi"
                  ? "कवरेज (sqft/लीटर/कोट)"
                  : "Coverage (sqft/L/coat)"
              }
              value={cov}
              onChange={setCov}
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
                  label: d.paint,
                  value: `${round(v.paintL, 1)} L`,
                  sub: `${coats} ${lang === "hi" ? "कोट" : "coats"}`,
                },
                {
                  label: lang === "hi" ? "प्राइमर" : "Primer",
                  value: `${round(v.primerL, 1)} L`,
                },
                {
                  label: lang === "hi" ? "वॉल पुट्टी" : "Wall putty",
                  value: `${round(v.puttyKg, 1)} kg`,
                },
                { label: d.area, value: `${round(v.areaSqft)} sqft` },
              ]}
            />
            <WhatsAppShare
              lang={lang}
              text={`BOQFather – Paint for ${round(v.areaSqft)} sqft: paint ${round(v.paintL, 1)} L, primer ${round(v.primerL, 1)} L, putty ${round(v.puttyKg, 1)} kg`}
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
