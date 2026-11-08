"use client";

import { useMemo } from "react";
import { ROOM_DEFS, RoomType } from "@/engine";
import { SketchPanel } from "@/components/calcs/boq/BoqPanels";
import { getPlot, plotEstimate } from "@/content/plots";
import type { Lang } from "@/lib/site";

/** The drawn G+1 plan of one plot size (rendered into the static page). */
export function PlotPlanPreview({
  lang,
  slug,
  floors = 2,
}: {
  lang: Lang;
  slug: string;
  floors?: number;
}) {
  const r = useMemo(() => {
    const p = getPlot(slug);
    return p ? plotEstimate(p, floors).res : null;
  }, [slug, floors]);
  const plot = useMemo(() => {
    const p = getPlot(slug);
    return p ? { w: p.w, d: p.d, back: p.back } : undefined;
  }, [slug]);
  if (!r) return null;
  return (
    <SketchPanel
      r={r}
      lang={lang}
      title={
        lang === "hi"
          ? `${slug.replace("x", " × ")} फ़ीट प्लॉट का नक्शा`
          : `${slug.replace("x", " × ")} ft house plan`
      }
      fileName={`${slug}-house-plan-boqfather`}
      plot={plot}
      look3d="model"
      names={(tp) =>
        tp in ROOM_DEFS ? ROOM_DEFS[tp as RoomType].name[lang] : tp
      }
    />
  );
}
