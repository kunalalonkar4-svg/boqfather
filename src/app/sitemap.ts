import type { MetadataRoute } from "next";
import { CALCULATORS } from "@/content/calculators";
import { PLOTS, plotSlug, SQFT_SIZES, sqftSlug } from "@/content/plots";
import { langPath, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "calculators",
    ...CALCULATORS.map((c) => c.slug),
    "house-plan",
    ...PLOTS.map((p) => `house-plan/${plotSlug(p)}`),
    "house-construction-cost",
    ...SQFT_SIZES.map((n) => `house-construction-cost/${sqftSlug(n)}`),
    "house-construction-guide",
  ];
  const lastModified = new Date("2026-11-03");
  return paths.flatMap((p) =>
    (["en", "hi"] as const).map((lang) => ({
      url: `${SITE_URL}${langPath(lang, p)}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority:
        p === "/" ? 1 : p === "house-construction-cost-calculator" ? 0.9 : 0.8,
      alternates: {
        languages: {
          "en-IN": `${SITE_URL}${langPath("en", p)}`,
          "hi-IN": `${SITE_URL}${langPath("hi", p)}`,
        },
      },
    })),
  );
}
