import type { Metadata } from "next";
import { hasPage, HREFLANG, langPath, OG_LOCALE, SITE_NAME, SITE_URL, XLANGS, type XLang } from "./site";

export const DEFAULT_OG = "/og.png";

/** Page metadata with canonical URL and hreflang alternates for English / Hindi. */
export function pageMeta(opts: {
  lang: XLang;
  path: string;
  title: string;
  description: string;
  /** Site path of a preview image, e.g. /naksha/img/x.png */
  image?: string;
}): Metadata {
  const url = `${SITE_URL}${langPath(opts.lang, opts.path)}`;
  return {
    title: opts.title,
    description: opts.description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(
          XLANGS.filter((l) => hasPage(l, opts.path)).map((l) => [HREFLANG[l], `${SITE_URL}${langPath(l, opts.path)}`]),
        ),
        "x-default": `${SITE_URL}${langPath("en", opts.path)}`,
      },
    },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: SITE_NAME,
      locale: OG_LOCALE[opts.lang],
      type: "website",
      images: [{ url: `${SITE_URL}${opts.image ?? DEFAULT_OG}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [`${SITE_URL}${opts.image ?? DEFAULT_OG}`],
      title: opts.title,
      description: opts.description,
    },
  };
}
