/** Site-wide settings. Testing on Vercel; switch SITE_URL when the domain is bought. */
export const SITE_URL = "https://guniyo.com";
export const SITE_NAME = "Guniyo";

export const LANGS = ["en", "hi"] as const;
export type Lang = (typeof LANGS)[number];

/**
 * Languages beyond Hindi and English. A language gets its own pages only for the paths in READY below:
 * a page that is not fully translated is not published in that language (no mixed-language pages).
 */
export const XLANGS = ["en", "hi", "mr", "gu"] as const;
export type XLang = (typeof XLANGS)[number];
export type NewLang = Exclude<XLang, Lang>;

export const LANG_LABEL: Record<XLang, string> = { en: "English", hi: "हिंदी", mr: "मराठी", gu: "ગુજરાતી" };
export const HREFLANG: Record<XLang, string> = { en: "en-IN", hi: "hi-IN", mr: "mr-IN", gu: "gu-IN" };
export const OG_LOCALE: Record<XLang, string> = { en: "en_IN", hi: "hi_IN", mr: "mr_IN", gu: "gu_IN" };

/** The language whose data tables and labels a page falls back to where a translation does not exist yet. */
export const baseLang = (l: XLang): Lang => (l === "mr" ? "hi" : l === "gu" ? "en" : l);

/** Paths (no slashes at the ends; "" is the home page) that are fully translated, per added language. */
export const READY: Record<NewLang, string[]> = { mr: [], gu: [] };
export const hasPage = (lang: XLang, path: string): boolean => {
  if (lang === "en" || lang === "hi") return true;
  const p = path === "/" ? "" : path.replace(/^\/|\/$/g, "");
  return READY[lang].includes(p);
};

/** Path for a page in a language: English lives at the root, every other language under its code. */
export function langPath(lang: XLang, path = "/"): string {
  const clean = path === "/" ? "/" : `/${path.replace(/^\/|\/$/g, "")}/`;
  return lang === "en" ? clean : `/${lang}${clean === "/" ? "/" : clean}`;
}

/** WhatsApp number for custom naksha requests, with country code and no "+" (e.g. "9198xxxxxxxx"). Empty = form shown, sending disabled. */
export const WHATSAPP_NUMBER = "";

/** The person behind the site — shown on the About and Contact pages. Empty fields are left out. */
export const OWNER = {
  name: "Kunal Alonkar",
  /** e.g. "B.E. Civil Engineering" */
  degree: "Civil Engineer",
  /** e.g. "8 years in house construction, estimation and site work" */
  experience: "12+ years in civil engineering and valuation",
  /** e.g. "Indore, Madhya Pradesh" */
  city: "Chhindwara, Madhya Pradesh",
  /** One or two lines about the work done, e.g. "50+ houses planned and estimated across MP". */
  work: "Civil engineer and valuer. Valuer, Indian Institution of Valuers (IIV), Pune, Membership No. Cat-I/F-7426.",
  /** Public contact email; empty = not shown. */
  email: "uniquevaluerandengineers@yahoo.com",
  /** Photo path under /public, e.g. "/team/kunal.webp"; empty = initials. */
  photo: "",
};

/** Google Analytics 4 measurement ID ("G-XXXXXXX"); empty = no tracking script. */
export const GA_ID = "";
/** Google Search Console HTML-tag verification code (the content="..." value); empty = no tag. */
export const GSC_VERIFICATION = "";
