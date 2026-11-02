/** Site-wide settings. The domain is a placeholder until the name is final. */
export const SITE_URL = "https://boqfather.in";
export const SITE_NAME = "BOQFather";

export const LANGS = ["en", "hi"] as const;
export type Lang = (typeof LANGS)[number];

/** Path for a page in a language: English lives at the root, Hindi under /hi. */
export function langPath(lang: Lang, path = "/"): string {
  const clean = path === "/" ? "/" : `/${path.replace(/^\/|\/$/g, "")}/`;
  return lang === "en" ? clean : `/hi${clean === "/" ? "/" : clean}`;
}
