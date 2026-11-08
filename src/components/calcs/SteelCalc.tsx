"use client";

import { useMemo, useState } from "react";
import {
  BAR_DIAS,
  calcAreaSteel,
  calcBarWeight,
  calcMemberSteel,
  inr,
  LengthUnit,
  Member,
  MEMBER_KG_PER_M3,
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
import { UnitToggle, unitSuffix } from "./shared";

type Mode = "bar" | "member" | "house";

const MEMBER_LABEL: Record<Member, { en: string; hi: string }> = {
  footing: { en: "Footing", hi: "फुटिंग" },
  column: { en: "Column", hi: "कॉलम" },
  plinth_beam: { en: "Plinth beam", hi: "प्लिंथ बीम" },
  beam: { en: "Beam", hi: "बीम" },
  slab: { en: "Slab", hi: "स्लैब" },
  staircase: { en: "Staircase", hi: "सीढ़ी" },
};

export default function SteelCalc({ lang }: { lang: Lang }) {
  const d = t(lang);
  const [mode, setMode] = useState<Mode>("bar");
  const [unit, setUnit] = useState<LengthUnit>("m");
  const [dia, setDia] = useState("12");
  const [len, setLen] = useState("12");
  const [nos, setNos] = useState("10");
  const [member, setMember] = useState<Member>("slab");
  const [vol, setVol] = useState("1.5");
  const [kgm3, setKgm3] = useState(String(MEMBER_KG_PER_M3.slab));
  const [sqft, setSqft] = useState("1000");
  const [kgsqft, setKgsqft] = useState("4");

  const res = useMemo(() => {
    if (mode === "bar") {
      const l = dimToM(len, unit),
        n = num(nos);
      if (!(l > 0 && n > 0)) return null;
      return {
        kind: mode,
        r: calcBarWeight({ diaMm: Number(dia), lengthM: l, nos: n }),
      } as const;
    }
    if (mode === "member") {
      const v = num(vol),
        k = num(kgm3);
      if (!(v > 0 && k > 0)) return null;
      return {
        kind: mode,
        r: calcMemberSteel({ member, concreteM3: v, kgPerM3: k }),
      } as const;
    }
    const a = num(sqft),
      k = num(kgsqft);
    if (!(a > 0 && k > 0)) return null;
    return {
      kind: mode,
      r: calcAreaSteel({ builtUpSqft: a, kgPerSqft: k }),
    } as const;
  }, [mode, unit, dia, len, nos, member, vol, kgm3, sqft, kgsqft]);

  const stats = !res
    ? []
    : res.kind === "bar"
      ? [
          {
            label: lang === "hi" ? "कुल वज़न" : "Total weight",
            value: `${round(res.r.values.kg, 1)} kg`,
          },
          {
            label: lang === "hi" ? "प्रति मीटर" : "Per metre",
            value: `${round(res.r.values.kgPerM, 3)} kg`,
          },
          {
            label: lang === "hi" ? "कुल लंबाई" : "Total length",
            value: `${round(res.r.values.totalLengthM, 1)} m`,
          },
          {
            label: lang === "hi" ? "12 मी. की सरिया" : "12 m bars",
            value: `${res.r.values.bars12m} nos`,
          },
        ]
      : res.kind === "member"
        ? [
            {
              label: d.steel,
              value: `${round(res.r.values.kg)} kg`,
              sub: `${round(res.r.values.kg / 1000, 2)} t`,
            },
            { label: "kg/m³", value: `${res.r.values.kgPerM3}` },
          ]
        : [
            {
              label: d.steel,
              value: `${inr(res.r.values.kg)} kg`,
              sub: `${round(res.r.values.tonnes, 2)} t`,
            },
            { label: "kg/sqft", value: `${res.r.values.kgPerSqft}` },
          ];

  return (
    <CalcFrame
      form={
        <>
          <Segmented
            label={lang === "hi" ? "तरीका" : "Method"}
            value={mode}
            onChange={setMode}
            options={[
              {
                value: "bar",
                label: lang === "hi" ? "सरिया का वज़न" : "Bar weight",
              },
              {
                value: "member",
                label: lang === "hi" ? "मेंबर (kg/m³)" : "Member (kg/m³)",
              },
              {
                value: "house",
                label: lang === "hi" ? "पूरा घर" : "Whole house",
              },
            ]}
          />
          {mode === "bar" && (
            <>
              <UnitToggle lang={lang} unit={unit} onChange={setUnit} />
              <div className="grid grid-cols-3 gap-3">
                <SelectField
                  label="Dia (mm)"
                  value={dia}
                  onChange={setDia}
                  options={BAR_DIAS.map((x) => ({
                    value: String(x),
                    label: `${x} mm`,
                  }))}
                />
                <NumberField
                  label={
                    lang === "hi" ? "एक सरिया की लंबाई" : "Length of one bar"
                  }
                  value={len}
                  onChange={setLen}
                  suffix={unitSuffix(unit)}
                  inputMode="text"
                />
                <NumberField
                  label={d.count}
                  value={nos}
                  onChange={setNos}
                  suffix="nos"
                />
              </div>
            </>
          )}
          {mode === "member" && (
            <>
              <SelectField
                label={lang === "hi" ? "मेंबर" : "Member"}
                value={member}
                onChange={(m) => {
                  setMember(m);
                  setKgm3(String(MEMBER_KG_PER_M3[m]));
                }}
                options={(Object.keys(MEMBER_KG_PER_M3) as Member[]).map(
                  (k) => ({ value: k, label: MEMBER_LABEL[k][lang] }),
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label={lang === "hi" ? "कंक्रीट का आयतन" : "Concrete volume"}
                  value={vol}
                  onChange={setVol}
                  suffix="m³"
                />
                <NumberField
                  label={lang === "hi" ? "सरिया प्रति m³" : "Steel per m³"}
                  value={kgm3}
                  onChange={setKgm3}
                  suffix="kg"
                />
              </div>
            </>
          )}
          {mode === "house" && (
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label={
                  lang === "hi" ? "कुल बिल्ट-अप एरिया" : "Total built-up area"
                }
                value={sqft}
                onChange={setSqft}
                suffix="sqft"
              />
              <NumberField
                label="kg / sqft"
                value={kgsqft}
                onChange={setKgsqft}
                hint={lang === "hi" ? "आम रेंज 3.5–4.5" : "Typical 3.5–4.5"}
              />
            </div>
          )}
        </>
      }
      result={
        res ? (
          <>
            <ResultPanel lang={lang} stats={stats} />
            <WhatsAppShare
              lang={lang}
              text={`Guniyo – Steel: ${stats.map((s) => `${s.label} ${s.value}`).join(", ")}`}
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
            steps={res.r.steps}
            assumptions={res.r.assumptions}
          />
        )
      }
    />
  );
}
