"use client";

import { useMemo, useState } from "react";
import {
  areaToM2,
  BRICK_SIZES,
  BrickSize,
  calcBrickwork,
  inr,
  LengthUnit,
  MORTAR_RATIOS,
  MortarRatio,
  round,
} from "@/engine";
import { t } from "@/i18n/ui";
import type { Lang } from "@/lib/site";
import {
  dimToM,
  NumberField,
  num,
  Segmented,
  SelectField,
} from "@/components/ui/Fields";
import {
  CalcFrame,
  Invalid,
  ResultPanel,
  WhatsAppShare,
  Working,
} from "@/components/ui/Results";
import { areaSuffix, UnitToggle, unitSuffix } from "./shared";

const BRICK_LABEL: Record<BrickSize, { en: string; hi: string }> = {
  modular: { en: "Modular 190×90×90", hi: "मॉड्यूलर 190×90×90" },
  standard: { en: "Traditional 230×110×75", hi: "देसी 230×110×75" },
  fly_ash: { en: "Fly ash 230×100×75", hi: "फ्लाई ऐश 230×100×75" },
};

export default function BrickCalc({ lang }: { lang: Lang }) {
  const d = t(lang);
  const [unit, setUnit] = useState<LengthUnit>("ft");
  const [L, setL] = useState("13");
  const [H, setH] = useState("10");
  const [thk, setThk] = useState<"0.23" | "0.115">("0.23");
  const [open, setOpen] = useState("21");
  const [brick, setBrick] = useState<BrickSize>("standard");
  const [ratio, setRatio] = useState<MortarRatio>("1:6");
  const [wastage, setWastage] = useState("5");

  const changeUnit = (u: LengthUnit) => {
    setUnit(u);
    if (u === "m") {
      setL("4");
      setH("3");
      setOpen("2");
    } else {
      setL("13");
      setH("10");
      setOpen("21");
    }
  };

  const res = useMemo(() => {
    const l = dimToM(L, unit),
      h = dimToM(H, unit),
      o = num(open || "0"),
      w = num(wastage);
    if (![l, h, o, w].every((x) => Number.isFinite(x) && x >= 0) || l * h <= 0)
      return null;
    return calcBrickwork({
      lengthM: l,
      heightM: h,
      thicknessM: Number(thk),
      openingsM2: areaToM2(o, unit),
      brick,
      ratio,
      brickWastagePct: w,
    });
  }, [L, H, thk, open, brick, ratio, wastage, unit]);

  const u = unitSuffix(unit);
  const v = res?.values;
  return (
    <CalcFrame
      form={
        <>
          <UnitToggle lang={lang} unit={unit} onChange={changeUnit} />
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label={d.length}
              value={L}
              onChange={setL}
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
          <Segmented
            label={d.thickness}
            value={thk}
            onChange={setThk}
            options={[
              {
                value: "0.23",
                label: lang === "hi" ? "9 इंच (230 mm)" : "9 inch (230 mm)",
              },
              {
                value: "0.115",
                label: lang === "hi" ? "4.5 इंच (115 mm)" : "4.5 inch (115 mm)",
              },
            ]}
          />
          <NumberField
            label={d.openings}
            value={open}
            onChange={setOpen}
            suffix={areaSuffix(unit)}
          />
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label={d.brick_size}
              value={brick}
              onChange={setBrick}
              options={(Object.keys(BRICK_SIZES) as BrickSize[]).map((k) => ({
                value: k,
                label: BRICK_LABEL[k][lang],
              }))}
            />
            <SelectField
              label={d.mortar}
              value={ratio}
              onChange={setRatio}
              options={(Object.keys(MORTAR_RATIOS) as MortarRatio[]).map(
                (k) => ({ value: k, label: `CM ${k}` }),
              )}
            />
          </div>
          <NumberField
            label={d.wastage}
            value={wastage}
            onChange={setWastage}
            suffix="%"
          />
        </>
      }
      result={
        v ? (
          <>
            <ResultPanel
              lang={lang}
              stats={[
                {
                  label: d.bricks,
                  value: `${inr(v.bricksWithWastage)}`,
                  sub:
                    lang === "hi"
                      ? `टूट-फूट सहित (${inr(v.bricks)} नेट)`
                      : `incl. breakage (${inr(v.bricks)} net)`,
                },
                {
                  label: d.cement,
                  value: `${round(v.cementBags, 1)} ${d.bags}`,
                  sub: `CM ${ratio}`,
                },
                {
                  label: d.sand,
                  value: `${round(v.sandCft, 1)} cft`,
                  sub: `${round(v.sandM3, 2)} m³`,
                },
                {
                  label: d.volume,
                  value: `${round(v.volumeM3, 2)} m³`,
                  sub: lang === "hi" ? "नेट चिनाई" : "net brickwork",
                },
              ]}
            />
            <WhatsAppShare
              lang={lang}
              text={`BOQFather – Brickwork ${round(v.volumeM3, 2)} m³: ${inr(v.bricksWithWastage)} bricks, cement ${round(v.cementBags, 1)} bags, sand ${round(v.sandCft, 1)} cft`}
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
