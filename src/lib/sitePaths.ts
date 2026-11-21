import { CALCULATORS } from "@/content/calculators";
import { PLOTS, plotSlug, SQFT_SIZES, sqftSlug } from "@/content/plots";
import { GUIDE_BASE, QUESTIONS, TOPICS } from "@/content/guideTopics";
import { JOURNEY_SLUGS } from "@/content/journey";
import { GAJ, NAKSHE } from "@/content/naksha";
import { CITIES } from "@/content/cities";
import { ELEVATIONS } from "@/content/elevations";

/** Every page path on the site (shared by sitemap.xml and the "All pages" HTML index). */
export const SITE_PATHS: string[] = [
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
  "feedback",
  "privacy",
  "terms",
  "all-pages",
];
