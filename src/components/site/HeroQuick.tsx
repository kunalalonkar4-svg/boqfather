"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { calcHouse, inr, lakhWords, Quality, round, rupees } from "@/engine";
import { t } from "@/i18n/ui";
import { Lang, langPath } from "@/lib/site";
import { NumberField, num, Segmented } from "@/components/ui/Fields";

export default function HeroQuick({ lang }: { lang: Lang }) {
  const d = t(lang);
  const [area, setArea] = useState("1000");
  const [floors, setFloors] = useState<"1" | "2" | "3">("1");
  const [quality, setQuality] = useState<Quality>("standard");
  const v = useMemo(() => {
    const a = num(area);
    return a > 0
      ? calcHouse({
          areaPerFloorSqft: a,
          floors: Number(floors),
          quality,
          location: "tier2",
        }).values
      : null;
  }, [area, floors, quality]);

  return (
    <div className="rounded-2xl bg-white p-5 text-ink shadow-[0_20px_50px_rgba(0,0,0,0.25)] sm:p-6">
      <h2 className="font-display text-[19px] font-bold">{d.nav_house}</h2>
      <div className="mt-4 flex flex-col gap-4">
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
          options={[
            { value: "1", label: "G" },
            { value: "2", label: "G+1" },
            { value: "3", label: "G+2" },
          ]}
        />
        <Segmented
          label={d.quality}
          value={quality}
          onChange={setQuality}
          options={[
            { value: "basic", label: d.q_basic },
            { value: "standard", label: d.q_standard },
            { value: "premium", label: d.q_premium },
          ]}
        />
      </div>
      {v && (
        <div
          aria-live="polite"
          className="mt-5 rounded-xl bg-ink p-4 text-[#f5f3ef]"
        >
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[12px] text-[#cfcbc2]">{d.total_cost}</span>
            <span className="text-[13px] font-bold text-amber">
              {rupees(v.ratePerSqft)} {d.per_sqft}
            </span>
          </div>
          <div className="font-display mt-1 text-[30px] font-extrabold leading-tight">
            {rupees(v.total)}
          </div>
          <div className="mt-1 text-[13px] text-[#cfcbc2]">
            ≈ ₹{lakhWords(v.total)} · {d.cement}{" "}
            {inr(round(v.materials[0].qty))} {d.bags} · {d.steel}{" "}
            {inr(round(v.materials[1].qty))} kg
          </div>
        </div>
      )}
      <Link
        href={langPath(lang, "house-construction-cost-calculator")}
        className="font-display mt-4 flex h-12 items-center justify-center rounded-xl bg-amber text-[16px] font-extrabold text-ink hover:brightness-105"
      >
        {lang === "hi"
          ? "पूरी रिपोर्ट + PDF देखें →"
          : "See full report + PDF →"}
      </Link>
    </div>
  );
}
