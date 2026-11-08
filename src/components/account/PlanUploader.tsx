"use client";

import { langPath, type Lang } from "@/lib/site";
import type { ReadPlan } from "@/lib/planRead";
import { PlanImport } from "./PlanImport";

/** Key under which the checked rooms are handed to the BOQ tool. */
export const UPLOADED_PLAN_KEY = "guniyo:uploaded-plan";

/** Plan → Estimate page: read the plan here, then open the BOQ tool with these rooms. */
export function PlanUploader({ lang }: { lang: Lang }) {
  return (
    <PlanImport
      lang={lang}
      open
      onApply={(p: ReadPlan) => {
        try {
          sessionStorage.setItem(UPLOADED_PLAN_KEY, JSON.stringify(p));
        } catch {
          /* storage blocked: the tool opens with its default plan */
        }
        window.location.href = `${langPath(lang, "house-boq-estimate")}?from=upload`;
      }}
    />
  );
}
