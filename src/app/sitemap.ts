import type { MetadataRoute } from "next";
import { SITE_PATHS } from "@/lib/sitePaths";
import { hasPage, HREFLANG, langPath, SITE_URL, XLANGS } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = SITE_PATHS;

  // date of the last real site-wide change (new design, plan drawings and header); update it when pages change
  const lastModified = new Date("2026-11-21");
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
