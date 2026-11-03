"use client";

import { useMemo, useState } from "react";
import {
  calcTiles,
  inr,
  LengthUnit,
  round,
  rupees,
  TILE_SIZES,
  TileSize,
} from "@/engine";
import { t } from "@/i18n/ui";
import type { Lang } from "@/lib/site";
import { dimToM, NumberField, num, SelectField } from "@/components/ui/Fields";
import {
  CalcFrame,
  Invalid,
  ResultPanel,
  WhatsAppShare,
  Working,
} from "@/components/ui/Results";
import { UnitToggle, unitSuffix } from "./shared";

export default function TileCalc({ lang }: { lang: Lang }) {
  const d = t(lang);
  const [unit, setUnit] = useState<LengthUnit>("ft");
  const [L, setL] = useState("12");
  const [B, setB] = useState("10");
  const [size, setSize] = useState<TileSize>("60x60");
  const [wastage, setWastage] = useState("8");
  const [perBox, setPerBox] = useState(String(TILE_SIZES["60x60"].perBox));
  const [rate, setRate] = useState("55");

  const changeUnit = (u: LengthUnit) => {
    setUnit(u);
    if (u === "m") {
      setL("3.66");
      setB("3.05");
    } else {
      setL("12");
      setB("10");
    }
  };

  const res = useMemo(() => {
    const l = dimToM(L, unit),
      b = dimToM(B, unit),
      w = num(wastage),
      p = num(perBox),
      r = num(rate || "0");
    if (
      ![l, b, w, p, r].every((x) => Number.isFinite(x) && x >= 0) ||
      l * b <= 0 ||
      p <= 0
    )
      return null;
    return calcTiles({
      areaM2: l * b,
      size,
      wastagePct: w,
      perBox: p,
      ratePerSqft: r,
    });
  }, [L, B, size, wastage, perBox, rate, unit]);

  const u = unitSuffix(unit);
  const v = res?.values;
  return (
    <CalcFrame
      form={
        <>
          <UnitToggle lang={lang} unit={unit} onChange={changeUnit} />
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label={lang === "hi" ? "कमरे की लंबाई" : "Room length"}
              value={L}
              onChange={setL}
              suffix={u}
              inputMode="text"
            />
            <NumberField
              label={lang === "hi" ? "कमरे की चौड़ाई" : "Room width"}
              value={B}
              onChange={setB}
              suffix={u}
              inputMode="text"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label={lang === "hi" ? "टाइल साइज़ (cm)" : "Tile size (cm)"}
              value={size}
              onChange={(s) => {
                setSize(s);
                setPerBox(String(TILE_SIZES[s].perBox));
              }}
              options={(Object.keys(TILE_SIZES) as TileSize[]).map((k) => ({
                value: k,
                label: k.replace("x", " × "),
              }))}
            />
            <NumberField
              label={lang === "hi" ? "एक बॉक्स में टाइल्स" : "Tiles per box"}
              value={perBox}
              onChange={setPerBox}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label={d.wastage}
              value={wastage}
              onChange={setWastage}
              suffix="%"
            />
            <NumberField
              label={lang === "hi" ? "रेट (₹/sqft)" : "Rate (₹/sqft)"}
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
                  label: d.tiles,
                  value: `${inr(v.tiles)} nos`,
                  sub: lang === "hi" ? "वेस्टेज सहित" : "incl. wastage",
                },
                {
                  label: lang === "hi" ? "बॉक्स" : "Boxes",
                  value: `${v.boxes}`,
                  sub: `${round(v.orderSqft)} sqft`,
                },
                {
                  label: d.area,
                  value: `${round(v.areaSqft)} sqft`,
                  sub: lang === "hi" ? "फ़र्श" : "floor",
                },
                {
                  label: d.cost,
                  value: rupees(v.cost),
                  sub: lang === "hi" ? "सिर्फ़ टाइल्स" : "tiles only",
                },
              ]}
            />
            <WhatsAppShare
              lang={lang}
              text={`BOQFather – Tiles ${size} for ${round(v.areaSqft)} sqft: ${v.tiles} tiles, ${v.boxes} boxes, ${rupees(v.cost)}`}
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
