import type { MetadataRoute } from "next";
import { CALCULATORS } from "@/content/calculators";
import { PLOTS, plotSlug, SQFT_SIZES, sqftSlug } from "@/content/plots";
import { GUIDE_BASE, QUESTIONS, TOPICS } from "@/content/guideTopics";
import { JOURNEY_SLUGS } from "@/content/journey";
import { GAJ, NAKSHE } from "@/content/naksha";
import { CITIES } from "@/content/cities";
import { ELEVATIONS } from "@/content/elevations";
import { hasPage, HREFLANG, langPath, SITE_URL, XLANGS } from "@/lib/site";

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
    "house-construction-guide/checklist",
    ...[...TOPICS, ...QUESTIONS].map((x) => `${GUIDE_BASE}/${x.slug}`),
    ...JOURNEY_SLUGS.map((s) => `${GUIDE_BASE}/${s}`),
    "naksha",
    ...NAKSHE.map((n) => `naksha/${n.slug}`),
    ...GAJ.map((g) => `naksha/gaj/${g.slug}`),
    "elevations",
    ...ELEVATIONS.map((x) => `elevations/${x.slug}`),
    "house-construction-cost-in",
    ...CITIES.map((c) => `house-construction-cost-in/${c.slug}`),
    "plan-to-estimate",
    "pro",
    "about",
    "contact",
    "privacy",
    "terms",
  ];
  const lastModified = new Date("2026-11-03");
  return paths.flatMap((p) => {
    const langs = XLANGS.filter((l) => hasPage(l, p));
    const languages = Object.fromEntries(langs.map((l) => [HREFLANG[l], `${SITE_URL}${langPath(l, p)}`]));
    return langs.map((lang) => ({
      url: `${SITE_URL}${langPath(lang, p)}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: p === "/" ? 1 : p === "house-construction-cost-calculator" ? 0.9 : 0.8,
      alternates: { languages },
    }));
  });
}
