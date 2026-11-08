import type { Metadata } from "next";
import { Lang, langPath, SITE_NAME, SITE_URL } from "./site";

export const DEFAULT_OG = "/og.png";

/** Page metadata with canonical URL and hreflang alternates for English / Hindi. */
export function pageMeta(opts: {
  lang: Lang;
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
        "en-IN": `${SITE_URL}${langPath("en", opts.path)}`,
        "hi-IN": `${SITE_URL}${langPath("hi", opts.path)}`,
        "x-default": `${SITE_URL}${langPath("en", opts.path)}`,
      },
    },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: SITE_NAME,
      locale: opts.lang === "hi" ? "hi_IN" : "en_IN",
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
