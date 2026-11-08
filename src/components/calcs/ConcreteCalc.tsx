"use client";

import { useMemo, useState } from "react";
import {
  calcConcrete,
  inr,
  LengthUnit,
  m3ToCft,
  MIXES,
  MixGrade,
  round,
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

const MEMBERS = {
  slab: {
    en: "Slab",
    hi: "स्लैब",
    ft: ["13", "10", "0.41"],
    m: ["4", "3", "0.125"],
  },
  beam: {
    en: "Beam",
    hi: "बीम",
    ft: ["12", "0.75", "1.33"],
    m: ["3.6", "0.23", "0.4"],
  },
  column: {
    en: "Column",
    hi: "कॉलम",
    ft: ["1", "1", "10"],
    m: ["0.3", "0.3", "3"],
  },
  footing: {
    en: "Footing",
    hi: "फुटिंग",
    ft: ["5", "5", "1.5"],
    m: ["1.5", "1.5", "0.45"],
  },
  pcc: {
    en: "PCC bed",
    hi: "PCC",
    ft: ["5.5", "5.5", "0.33"],
    m: ["1.7", "1.7", "0.1"],
  },
} as const;
type MemberKey = keyof typeof MEMBERS;

export default function ConcreteCalc({ lang }: { lang: Lang }) {
  const d = t(lang);
  const [unit, setUnit] = useState<LengthUnit>("ft");
  const [member, setMember] = useState<MemberKey>("slab");
  const [L, setL] = useState("13");
  const [B, setB] = useState("10");
  const [D, setD] = useState("0.41");
  const [nos, setNos] = useState("1");
  const [grade, setGrade] = useState<MixGrade>("M20");
  const [wastage, setWastage] = useState("2");

  const pickMember = (m: MemberKey, u: LengthUnit = unit) => {
    setMember(m);
    const v = MEMBERS[m][u];
    setL(v[0]);
    setB(v[1]);
    setD(v[2]);
    setGrade(m === "pcc" ? "M7.5" : "M20");
  };
  const changeUnit = (u: LengthUnit) => {
    setUnit(u);
    pickMember(member, u);
  };

  const res = useMemo(() => {
    const l = dimToM(L, unit),
      b = dimToM(B, unit),
      dd = dimToM(D, unit),
      n = num(nos),
      w = num(wastage);
    if (
      ![l, b, dd, n, w].every((x) => Number.isFinite(x) && x >= 0) ||
      l * b * dd * n <= 0
    )
      return null;
    return calcConcrete({ volumeM3: l * b * dd * n, grade, wastagePct: w });
  }, [L, B, D, nos, grade, wastage, unit]);

  const u = unitSuffix(unit);
  const v = res?.values;
  return (
    <CalcFrame
      form={
        <>
          <UnitToggle lang={lang} unit={unit} onChange={changeUnit} />
          <SelectField
            label={lang === "hi" ? "किस हिस्से का" : "Member"}
            value={member}
            onChange={(m) => pickMember(m)}
            options={(Object.keys(MEMBERS) as MemberKey[]).map((k) => ({
              value: k,
              label: MEMBERS[k][lang],
            }))}
          />
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
              label={d.depth}
              value={D}
              onChange={setD}
              suffix={u}
              inputMode="text"
            />
            <NumberField
              label={d.count}
              value={nos}
              onChange={setNos}
              suffix="nos"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label={d.grade}
              value={grade}
              onChange={setGrade}
              options={(Object.keys(MIXES) as MixGrade[]).map((g) => ({
                value: g,
                label: `${g} (${MIXES[g].join(":")})`,
              }))}
            />
            <NumberField
              label={d.wastage}
              value={wastage}
              onChange={setWastage}
              suffix="%"
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
                  label: d.cement,
                  value: `${round(v.cementBags, 1)} ${d.bags}`,
                  sub: `${inr(v.cementKg)} kg`,
                },
                {
                  label: d.sand,
                  value: `${round(v.sandCft, 1)} cft`,
                  sub: `${round(v.sandM3, 2)} m³`,
                },
                {
                  label: d.aggregate,
                  value: `${round(v.aggregateCft, 1)} cft`,
                  sub: `${round(v.aggregateM3, 2)} m³`,
                },
                {
                  label: d.volume,
                  value: `${round(v.wetVolumeM3, 3)} m³`,
                  sub: `${round(m3ToCft(v.wetVolumeM3), 1)} cft`,
                },
              ]}
            />
            <WhatsAppShare
              lang={lang}
              text={`Guniyo – ${grade} concrete ${round(v.wetVolumeM3, 2)} m³: cement ${round(v.cementBags, 1)} bags, sand ${round(v.sandCft, 1)} cft, aggregate ${round(v.aggregateCft, 1)} cft`}
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
