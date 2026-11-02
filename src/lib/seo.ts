import type { Metadata } from "next";
import { Lang, langPath, SITE_NAME, SITE_URL } from "./site";

/** Page metadata with canonical URL and hreflang alternates for English / Hindi. */
export function pageMeta(opts: { lang: Lang; path: string; title: string; description: string }): Metadata {
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
    },
    twitter: { card: "summary", title: opts.title, description: opts.description },
  };
}
