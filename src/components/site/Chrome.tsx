import Link from "next/link";
import { CALCULATORS } from "@/content/calculators";
import { AccountButton } from "@/components/account/Account";
import { CITIES } from "@/content/cities";
import { ELEVATIONS, groupOf } from "@/content/elevations";
import { GUIDE_BASE, QUESTIONS, TOPICS } from "@/content/guideTopics";
import { PLOTS, plotSlug, SQFT_SIZES, sqftSlug } from "@/content/plots";
import { FooterGroups } from "./FooterGroups";
import { t } from "@/i18n/ui";
import { baseLang, hasPage, langPath, LANG_LABEL, XLANGS, type XLang } from "@/lib/site";

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="font-display flex h-9 w-9 items-center justify-center rounded-lg bg-amber text-[14px] font-extrabold text-white">
        G
      </span>
      <span className="font-display text-[20px] font-extrabold tracking-tight">
        Guniyo
      </span>
    </span>
  );
}

/** Top bar: dark glass, stays on top while scrolling. `altPath` is the same page in the other language. */
export function SiteHeader({ lang, altPath }: { lang: XLang; altPath: string }) {
  const b = baseLang(lang);
  const d = t(b);
  const hi = lang === "hi";
  const x = (en: string, h: string, mr: string, gu: string) => (lang === "mr" ? mr : lang === "gu" ? gu : hi ? h : en);
  /** This page in every language that has it (English and Hindi always do). */
  const pagePath = lang === "en" ? altPath.replace(/^\/hi(?=\/)/, "") : altPath;
  const available = XLANGS.filter((l) => hasPage(l, pagePath));
  const links: { href: string; label: string; pro?: boolean; desk?: boolean; guide?: boolean }[] = [
    { href: langPath(lang, "house-construction-guide"), label: x("Guide", "गाइड", "गाइड", "ગાઇડ"), desk: true, guide: true },
    { href: `${langPath(lang)}#features`, label: x("Features", "फ़ीचर", "वैशिष्ट्ये", "ફીચર્સ"), desk: true },
    { href: langPath(lang, "naksha"), label: x("Plans & Cost", "नक्शे और खर्च", "नकाशे आणि खर्च", "નકશા અને ખર્ચ"), desk: true },
    { href: langPath(lang, "elevations"), label: x("Elevations", "एलिवेशन", "एलिव्हेशन", "એલિવેશન"), desk: true },
    { href: langPath(lang, "calculators"), label: x("Calculators", "कैलकुलेटर", "कॅल्क्युलेटर", "કેલ્ક્યુલેટર"), desk: true },
    { href: langPath(lang, "plan-to-estimate"), label: x("Plan → Estimate", "नक्शे से एस्टिमेट", "नकाशावरून अंदाज", "નકશા પરથી અંદાજ"), pro: true, desk: true },
    { href: langPath(lang, "pro"), label: x("Pricing", "प्राइसिंग", "किंमत", "કિંમત"), desk: true },
    { href: langPath(lang, "house-boq-estimate"), label: x("Item-wise BOQ", "आइटम-वार BOQ", "आयटमनिहाय BOQ", "આઇટમ-વાર BOQ") },
    { href: langPath(lang, "house-construction-cost"), label: x("House cost", "घर का खर्च", "घराचा खर्च", "ઘરનો ખર્ચ") },
    { href: langPath(lang), label: x("Home", "होम", "होम", "હોમ") },
  ];
  const cta = (
    <Link
      href={langPath(lang, "house-boq-estimate")}
      className="inline-flex h-10 items-center rounded-[4px] bg-amber px-4 text-[14px] font-bold text-white transition hover:bg-amber-dark"
    >
      {x("Start Free Estimate", "मुफ़्त एस्टिमेट", "मोफत अंदाज", "મફત અંદાજ")}
    </Link>
  );
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/90 text-ink backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href={langPath(lang)} aria-label="Guniyo home" className="shrink-0">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-0.5 text-[14px] xl:flex">
          {links
            .filter((l) => l.desk)
            .map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-1.5 rounded-[4px] px-3 py-2 font-medium text-body transition hover:bg-[#eaf3ff] hover:text-ink"
              >
                {l.label}
                {l.pro && (
                  <span className="rounded bg-amber px-1 text-[10px] font-extrabold text-white">
                    PRO
                  </span>
                )}
              </Link>
            ))}
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex">
            <AccountButton lang={b} />
          </span>
          <Link
            href={langPath(lang, "house-construction-guide")}
            className="inline-flex h-10 items-center rounded-[4px] bg-ink px-3 text-[14px] font-bold text-white transition hover:bg-[#333] xl:hidden"
          >
            {hi ? "गाइड" : "Guide"}
          </Link>
          {available.length <= 2 ? (
            <Link
              href={altPath}
              hrefLang={lang === "en" ? "hi" : "en"}
              className="rounded-[4px] border border-line px-3 py-1.5 text-[13px] font-semibold text-ink hover:border-ink"
            >
              {lang === "en" ? LANG_LABEL.hi : LANG_LABEL.en}
            </Link>
          ) : (
            <details className="group relative">
              <summary className="flex h-10 cursor-pointer list-none items-center gap-1.5 rounded-[4px] border border-line px-3 text-[13px] font-semibold text-ink hover:border-ink [&::-webkit-details-marker]:hidden">
                <span aria-hidden="true">🌐</span>
                {LANG_LABEL[lang]}
              </summary>
              <ul className="absolute right-0 top-12 z-50 min-w-[150px] rounded-lg border border-line bg-white p-1.5 shadow-[0_24px_60px_-20px_rgba(22,24,26,0.35)]">
                {available.map((l) => (
                  <li key={l}>
                    <Link
                      href={langPath(l, pagePath)}
                      hrefLang={l}
                      lang={l}
                      aria-current={l === lang ? "true" : undefined}
                      className={`block rounded-[4px] px-3 py-2 text-[15px] hover:bg-[#eef4fb] ${l === lang ? "font-bold" : "font-medium"}`}
                    >
                      {LANG_LABEL[l]}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          )}
          <span className="hidden sm:inline-flex">{cta}</span>
          <details className="group relative xl:hidden">
            <summary
              aria-label={x("Menu", "मेनू", "मेनू", "મેનુ")}
              className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-[4px] border border-line bg-white [&::-webkit-details-marker]:hidden"
            >
              <span aria-hidden="true" className="flex flex-col gap-[5px]">
                <span className="block h-0.5 w-5 rounded bg-ink transition group-open:translate-y-[7px] group-open:rotate-45" />
                <span className="block h-0.5 w-5 rounded bg-ink transition group-open:opacity-0" />
                <span className="block h-0.5 w-5 rounded bg-ink transition group-open:-translate-y-[7px] group-open:-rotate-45" />
              </span>
            </summary>
            <nav
              aria-label="Main"
              className="absolute right-0 top-12 flex w-[min(88vw,340px)] flex-col gap-0.5 rounded-lg border border-line bg-white p-2 shadow-[0_24px_60px_-20px_rgba(22,24,26,0.35)]"
            >
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center justify-between rounded-lg px-4 py-3 text-[16px] font-semibold text-ink hover:bg-[#eef4fb]"
                >
                  {l.label}
                  {l.pro && (
                    <span className="rounded bg-amber px-1.5 text-[11px] font-extrabold text-white">
                      PRO
                    </span>
                  )}
                </Link>
              ))}
              <div className="mt-1 flex flex-wrap items-center gap-2 border-t border-line px-2 pt-3">
                <AccountButton lang={b} />
                <span className="sm:hidden">{cta}</span>
              </div>
            </nav>
          </details>
        </div>
      </div>
      {/* section links stay in the bar on phones and tablets, scrolling sideways */}
      <nav aria-label={x("Sections", "सेक्शन", "विभाग", "વિભાગ")} className="border-t border-line/70 xl:hidden">
        <div className="mx-auto flex max-w-7xl gap-1.5 overflow-x-auto px-4 py-2 text-[14px] [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
          {links
            .filter((l) => l.href !== langPath(lang))
            .map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#f1f3f6] px-3.5 py-1.5 font-semibold text-ink transition hover:bg-ink hover:text-white active:scale-95"
              >
                {l.label}
                {l.pro && <span className="rounded bg-amber px-1 text-[10px] font-extrabold text-white">PRO</span>}
              </Link>
            ))}
        </div>
      </nav>
    </header>
  );
}

/** Text in the page language; Marathi falls back to Hindi and Gujarati to English where no translation is given. */
const L2 = (lang: XLang, en: string, hi: string, mr?: string, gu?: string) =>
  lang === "mr" ? (mr ?? hi) : lang === "gu" ? (gu ?? en) : lang === "hi" ? hi : en;

export function SiteFooter({ lang }: { lang: XLang }) {
  const b = baseLang(lang);
  const d = t(b);
  const a = "hover:text-white";
  const sub = "mb-2 text-[12px] font-bold uppercase tracking-wide text-[#8fb8ee]";
  const col = "flex flex-col gap-2 text-[14px] sm:columns-2 sm:block sm:space-y-2 lg:columns-3";
  const groupName = {
    narrow: L2(lang, "Narrow plots (up to 25 ft)", "संकरे प्लॉट (25 ft तक)", "अरुंद प्लॉट (25 ft पर्यंत)", "સાંકડા પ્લોટ (25 ft સુધી)"),
    medium: L2(lang, "Medium plots (30 to 35 ft)", "मध्यम प्लॉट (30 से 35 ft)", "मध्यम प्लॉट (30 ते 35 ft)", "મધ્યમ પ્લોટ (30 થી 35 ft)"),
    wide: L2(lang, "Wide plots (40 ft and more)", "चौड़े प्लॉट (40 ft और ज़्यादा)", "रुंद प्लॉट (40 ft आणि जास्त)", "પહોળા પ્લોટ (40 ft અને વધુ)"),
    shop: L2(lang, "House with a shop", "दुकान वाला घर", "दुकान असलेले घर", "દુકાનવાળું ઘર"),
  } as const;
  const groups = [
    {
      key: "plans",
      label: L2(lang, "Plans & elevations", "नक्शे और एलिवेशन", "नकाशे आणि एलिव्हेशन", "નકશા અને એલિવેશન"),
      panel: (
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className={sub}>
              <Link href={langPath(lang, "naksha")} className={a}>
                {L2(lang, "House plans by plot size", "प्लॉट साइज़ के हिसाब से नक्शे", "प्लॉट साईझनुसार घराचे नकाशे", "પ્લોટ સાઇઝ પ્રમાણે ઘરના નકશા")}
              </Link>
            </h2>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-[14px]">
              {PLOTS.map((p) => (
                <li key={plotSlug(p)}>
                  <Link href={langPath(lang, `house-plan/${plotSlug(p)}`)} className={a}>
                    {p.w}×{p.d}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {(["narrow", "medium", "wide", "shop"] as const).map((g) => (
              <div key={g}>
                <h2 className={sub}>{groupName[g]}</h2>
                <ul className="flex flex-col gap-1.5 text-[14px]">
                  {ELEVATIONS.filter((x) => groupOf(x) === g).map((x) => (
                    <li key={x.slug}>
                      <Link href={langPath(lang, `elevations/${x.slug}`)} className={a}>
                        {x.plot.replace("-shop", "").replace("x", "×")} · {x.style[b]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: "cost",
      label: L2(lang, "Construction cost", "निर्माण खर्च", "बांधकाम खर्च", "બાંધકામ ખર્ચ"),
      panel: (
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div>
            <h2 className={sub}>
              <Link href={langPath(lang, "house-construction-cost")} className={a}>
                {L2(lang, "Cost by built-up area", "बिल्ट-अप एरिया के हिसाब से खर्च", "बिल्ट-अप एरियानुसार खर्च", "બિલ્ટ-અપ એરિયા પ્રમાણે ખર્ચ")}
              </Link>
            </h2>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[14px]">
              {SQFT_SIZES.map((n) => (
                <li key={n}>
                  <Link href={langPath(lang, `house-construction-cost/${sqftSlug(n)}`)} className={a}>
                    {n} sq ft
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className={sub}>{L2(lang, "Estimate your house", "अपने घर का एस्टिमेट", "तुमच्या घराचा अंदाज", "તમારા ઘરનો અંદાજ")}</h2>
            <ul className="flex flex-col gap-2 text-[14px]">
              <li><Link href={langPath(lang, "house-boq-estimate")} className={a}>{L2(lang, "Item-wise house BOQ", "आइटम-वार घर का BOQ", "आयटमनिहाय घराचे BOQ", "આઇટમ-વાર ઘરનું BOQ")}</Link></li>
              <li><Link href={langPath(lang, "plan-to-estimate")} className={a}>{L2(lang, "Plan → Estimate", "नक्शे से एस्टिमेट", "नकाशावरून अंदाज", "નકશા પરથી અંદાજ")}</Link></li>
              <li><Link href={langPath(lang, "contractor-quote-checker")} className={a}>{L2(lang, "Contractor quote checker", "ठेकेदार कोटेशन चेकर", "कंत्राटदार कोटेशन तपासणी", "કોન્ટ્રાક્ટર કોટેશન ચેકર")}</Link></li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      key: "city",
      label: L2(lang, "Cost by city", "शहर के हिसाब से खर्च", "शहरानुसार खर्च", "શહેર પ્રમાણે ખર્ચ"),
      panel: (
        <div>
          <h2 className={sub}>
            <Link href={langPath(lang, "house-construction-cost-in")} className={a}>
              {L2(lang, "House construction cost in your city", "आपके शहर में घर बनाने का खर्च", "तुमच्या शहरात घर बांधण्याचा खर्च", "તમારા શહેરમાં ઘર બાંધવાનો ખર્ચ")}
            </Link>
          </h2>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-[14px] sm:grid-cols-3 lg:grid-cols-5">
            {CITIES.map((c) => (
              <li key={c.slug}>
                <Link href={langPath(lang, `house-construction-cost-in/${c.slug}`)} className={a}>
                  {c[b]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      key: "guide",
      label: L2(lang, "Guides", "गाइड", "मार्गदर्शक", "ગાઇડ"),
      panel: (
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className={sub}>
              <Link href={langPath(lang, GUIDE_BASE)} className={a}>
                {L2(lang, "Build your house step by step", "घर बनाइए, क़दम-दर-क़दम", "घर बांधा, पायरी-पायरीने", "ઘર બનાવો, પગલે-પગલે")}
              </Link>
            </h2>
            <ul className={col}>
              {TOPICS.map((x) => (
                <li key={x.slug} className="break-inside-avoid">
                  <Link href={langPath(lang, `${GUIDE_BASE}/${x.slug}`)} className={a}>{x.title[b]}</Link>
                </li>
              ))}
              <li className="break-inside-avoid">
                <Link href={langPath(lang, `${GUIDE_BASE}/checklist`)} className={a}>
                  {L2(lang, "House checklist (82 points)", "घर बनाने की चेकलिस्ट (82 पॉइंट)", "घर बांधणीची चेकलिस्ट (82 मुद्दे)", "ઘર બાંધકામ ચેકલિસ્ટ (82 મુદ્દા)")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className={sub}>{L2(lang, "Questions owners ask", "मकान मालिक अक्सर पूछते हैं", "घरमालक नेहमी विचारतात ते प्रश्न", "ઘરમાલિકો વારંવાર પૂછે છે તે પ્રશ્નો")}</h2>
            <ul className={col}>
              {QUESTIONS.map((x) => (
                <li key={x.slug} className="break-inside-avoid">
                  <Link href={langPath(lang, `${GUIDE_BASE}/${x.slug}`)} className={a}>{x.title[b]}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ),
    },
    {
      key: "calc",
      label: L2(lang, "Calculators", "कैलकुलेटर", "कॅल्क्युलेटर", "કેલ્ક્યુલેટર"),
      panel: (
        <div>
          <h2 className={sub}>
            <Link href={langPath(lang, "calculators")} className={a}>{d.all_calculators}</Link>
          </h2>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-2 text-[14px] sm:grid-cols-2 lg:grid-cols-3">
            {CALCULATORS.map((c) => (
              <li key={c.slug}>
                <Link href={langPath(lang, c.slug)} className={a}>{c[b].name}</Link>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
  ];
  const links: [string, string, string, string, string][] = [
    ["about", "About", "हमारे बारे में", "आमच्याबद्दल", "અમારા વિશે"],
    ["contact", "Contact", "संपर्क", "संपर्क", "સંપર્ક"],
    ["feedback", "Feedback", "फ़ीडबैक", "अभिप्राय", "પ્રતિભાવ"],
    ["pro", "Pricing", "प्राइसिंग", "किंमत", "કિંમત"],
    ["elevations", "Elevations", "एलिवेशन", "एलिव्हेशन", "એલિવેશન"],
    ["naksha", "House plans", "घर के नक्शे", "घराचे नकाशे", "ઘરના નકશા"],
    ["calculators", "Calculators", "कैलकुलेटर", "कॅल्क्युलेटर", "કેલ્ક્યુલેટર"],
    [GUIDE_BASE, "Guide", "गाइड", "गाइड", "ગાઇડ"],
    ["privacy", "Privacy", "प्राइवेसी", "गोपनीयता", "ગોપનીયતા"],
    ["terms", "Terms of use", "नियम और शर्तें", "वापराच्या अटी", "ઉપયોગની શરતો"],
  ];
  return (
    <footer className="mt-16 bg-[#0f2440] text-[#b8c6d8]">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 px-4 py-10 sm:px-6 md:flex-row md:items-center">
        <div className="flex flex-col gap-2">
          <span className="text-white">
            <Logo />
          </span>
          <p className="max-w-md text-[14px] leading-relaxed">{L2(lang, t("en").tagline, t("hi").tagline, "बांधकाम खर्चाचा अचूक हिशोब, अभियंत्याच्या पद्धतीने", "બાંધકામનો સાચો હિસાબ, એન્જિનિયરની રીતે")}</p>
        </div>
        <Link
          href={langPath(lang, "house-boq-estimate")}
          className="inline-flex h-12 items-center rounded-full bg-[#ffc933] px-6 text-[15px] font-extrabold text-[#0e2a47] hover:bg-[#ffd75e]"
        >
          {L2(lang, "Start free estimate", "मुफ़्त एस्टिमेट शुरू करें", "मोफत अंदाज सुरू करा", "મફત અંદાજ શરૂ કરો")}
        </Link>
      </div>

      <FooterGroups groups={groups} />

      <nav aria-label="Footer" className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-6 gap-y-3 px-4 py-8 text-[14px] text-[#d3deec] sm:px-6">
        {links.map(([p, en, hi, mr, gu]) => (
          <Link key={p} href={langPath(lang, p)} className="hover:text-white">
            {L2(lang, en, hi, mr, gu)}
          </Link>
        ))}
      </nav>

      <div className="border-t border-[#1d3a60]">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-8 text-center text-[12px] leading-relaxed text-[#8397b1] sm:px-6">
          <p>
            {L2(
              lang,
              t("en").disclaimer,
              t("hi").disclaimer,
              "हे निकाल प्रमाण अंगठा-नियमांवर आणि दिलेल्या माहितीवर आधारित प्राथमिक अंदाज आहेत. अंतिम प्रमाण ड्रॉइंग आणि सविस्तर BOQ मधून येते. स्ट्रक्चरल आकार आणि सळईची तपासणी पात्र अभियंत्याने करावी.",
              "આ પરિણામો પ્રમાણભૂત અંગૂઠા-નિયમો અને આપેલી માહિતી પર આધારિત પ્રાથમિક અંદાજ છે. અંતિમ જથ્થા ડ્રોઇંગ અને વિગતવાર BOQ પરથી આવે છે. સ્ટ્રક્ચરલ સાઇઝ અને સળિયાની તપાસ લાયક એન્જિનિયરે કરવી જોઈએ.",
            )}
          </p>
          <p>
            {L2(
              lang,
              "House photographs on this site are artist impressions of a front elevation, made to show a style. The final look depends on your design, materials and finishes. House plans are drawn to scale for planning; your architect or structural engineer must finalise the drawing and check local bye-laws before work starts. Vastu results follow standard directional rules and are a guide, not a certificate.",
              "इस साइट की घर की तस्वीरें फ़्रंट एलिवेशन का काल्पनिक चित्र हैं, जो सिर्फ़ शैली दिखाती हैं। अंतिम रूप आपके डिज़ाइन, सामग्री और फ़िनिश पर निर्भर करेगा। घर के नक्शे प्लानिंग के लिए स्केल पर बने हैं; काम शुरू होने से पहले आपके आर्किटेक्ट या स्ट्रक्चरल इंजीनियर को ड्रॉइंग फ़ाइनल करनी और लोकल नियम जांचने होंगे। वास्तु नतीजे मानक दिशा-नियमों पर हैं और एक मार्गदर्शन हैं, प्रमाणपत्र नहीं।",
              "या साइटवरील घरांची छायाचित्रे समोरच्या एलिव्हेशनची कलात्मक कल्पना आहेत; ती फक्त शैली दाखवतात. अंतिम रूप तुमचे डिझाइन, साहित्य आणि फिनिशवर अवलंबून असेल. घरांचे नकाशे नियोजनासाठी मापानुसार काढले आहेत; काम सुरू होण्यापूर्वी तुमच्या आर्किटेक्ट किंवा स्ट्रक्चरल इंजिनिअरने ड्रॉइंग अंतिम करून स्थानिक नियम तपासले पाहिजेत. वास्तू निकाल मानक दिशा-नियमांवर आहेत आणि ते मार्गदर्शन आहे, प्रमाणपत्र नाही.",
              "આ સાઇટ પરના ઘરના ફોટા આગળના એલિવેશનની કલાત્મક કલ્પના છે અને માત્ર શૈલી બતાવે છે. અંતિમ દેખાવ તમારી ડિઝાઇન, સામગ્રી અને ફિનિશ પર આધાર રાખશે. ઘરના નકશા આયોજન માટે માપ પ્રમાણે દોર્યા છે; કામ શરૂ થાય તે પહેલાં તમારા આર્કિટેક્ટ અથવા સ્ટ્રક્ચરલ એન્જિનિયરે ડ્રોઇંગ અંતિમ કરી સ્થાનિક નિયમો તપાસવા જોઈએ. વાસ્તુ પરિણામો પ્રમાણભૂત દિશા-નિયમો પર છે અને માર્ગદર્શન માત્ર છે, પ્રમાણપત્ર નથી.",
            )}
          </p>
          <p>
            {L2(
              lang,
              "Costs are for planning, in 2026 rupees, material and labour together, and do not include land, approvals, interiors, compound wall or borewell. Rates differ by city, season and contractor, so use your own quotes for the final budget.",
              "खर्च प्लानिंग के लिए हैं, 2026 के रुपयों में, सामग्री और मज़दूरी मिलाकर; इनमें ज़मीन, मंज़ूरी, इंटीरियर, बाउंड्री वॉल और बोरवेल शामिल नहीं हैं। रेट शहर, मौसम और ठेकेदार के हिसाब से बदलते हैं, इसलिए अंतिम बजट के लिए अपने कोटेशन इस्तेमाल करें।",
              "खर्च नियोजनासाठी आहेत, 2026 च्या रुपयांत, साहित्य आणि मजुरी मिळून; त्यात जमीन, मंजुरी, इंटिरिअर, कंपाउंड भिंत आणि बोअरवेल धरलेले नाहीत. दर शहर, हंगाम आणि कंत्राटदारानुसार बदलतात, म्हणून अंतिम बजेटसाठी तुमचे स्वतःचे कोटेशन वापरा.",
              "ખર્ચ આયોજન માટે છે, 2026ના રૂપિયામાં, સામગ્રી અને મજૂરી સાથે; તેમાં જમીન, મંજૂરી, ઇન્ટિરિયર, કમ્પાઉન્ડ દીવાલ અને બોરવેલ સામેલ નથી. ભાવ શહેર, સીઝન અને કોન્ટ્રાક્ટર પ્રમાણે બદલાય છે, એટલે અંતિમ બજેટ માટે તમારા પોતાના કોટેશન વાપરો.",
            )}
          </p>
        </div>
        <div className="border-t border-[#1d3a60]">
          <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-4 text-[12px] text-[#8397b1] sm:px-6">
            <span>© 2026 Guniyo</span>
            <span>{L2(lang, "Made in India, for India", "भारत के लिए बना", "भारतासाठी भारतात बनवले", "ભારત માટે ભારતમાં બનાવ્યું")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
