"use client";

import { LengthUnit } from "@/engine";
import { t } from "@/i18n/ui";
import type { Lang } from "@/lib/site";
import { Segmented } from "@/components/ui/Fields";

export function UnitToggle(props: {
  lang: Lang;
  unit: LengthUnit;
  onChange: (u: LengthUnit) => void;
}) {
  const d = t(props.lang);
  return (
    <Segmented
      label={d.unit}
      value={props.unit}
      onChange={props.onChange}
      options={[
        { value: "ft", label: `${d.feet} (ft / 13'-8")` },
        { value: "m", label: d.metre },
      ]}
    />
  );
}

export const unitSuffix = (u: LengthUnit) => (u === "m" ? "m" : "ft");
export const areaSuffix = (u: LengthUnit) => (u === "m" ? "m²" : "sqft");
