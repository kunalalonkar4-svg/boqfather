/** Site-wide settings. Testing on Vercel; switch SITE_URL when the domain is bought. */
export const SITE_URL = "https://guniyo.com";
export const SITE_NAME = "Guniyo";

export const LANGS = ["en", "hi"] as const;
export type Lang = (typeof LANGS)[number];

/** Path for a page in a language: English lives at the root, Hindi under /hi. */
export function langPath(lang: Lang, path = "/"): string {
  const clean = path === "/" ? "/" : `/${path.replace(/^\/|\/$/g, "")}/`;
  return lang === "en" ? clean : `/hi${clean === "/" ? "/" : clean}`;
}

/** WhatsApp number for custom naksha requests, with country code and no "+" (e.g. "9198xxxxxxxx"). Empty = form shown, sending disabled. */
export const WHATSAPP_NUMBER = "";

/** The person behind the site — shown on the About and Contact pages. Empty fields are left out. */
export const OWNER = {
  name: "Kunal Alonkar",
  /** e.g. "B.E. Civil Engineering" */
  degree: "",
  /** e.g. "8 years in house construction, estimation and site work" */
  experience: "",
  /** e.g. "Indore, Madhya Pradesh" */
  city: "",
  /** One or two lines about the work done, e.g. "50+ houses planned and estimated across MP". */
  work: "",
  /** Public contact email; empty = not shown. */
  email: "",
  /** Photo path under /public, e.g. "/team/kunal.webp"; empty = initials. */
  photo: "",
};

/** Google Analytics 4 measurement ID ("G-XXXXXXX"); empty = no tracking script. */
export const GA_ID = "";
/** Google Search Console HTML-tag verification code (the content="..." value); empty = no tag. */
export const GSC_VERIFICATION = "";
