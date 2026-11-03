import Link from "next/link";
import { PLOTS, plotSlug } from "@/content/plots";
import { CALCULATORS } from "@/content/calculators";
import { t } from "@/i18n/ui";
import { Lang, langPath, SITE_NAME, SITE_URL } from "@/lib/site";
import { SiteFooter, SiteHeader } from "./Chrome";
import HeroQuick from "./HeroQuick";

export function HomePage({ lang }: { lang: Lang }) {
  const d = t(lang);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}${langPath(lang)}`,
    inLanguage: lang === "hi" ? "hi-IN" : "en-IN",
    description: d.home_sub,
  };
  const steps = [
    [d.home_step1_t, d.home_step1_d],
    [d.home_step2_t, d.home_step2_d],
    [d.home_step3_t, d.home_step3_d],
  ];
  return (
    <>
      <SiteHeader lang={lang} altPath={langPath(lang === "en" ? "hi" : "en")} />
      <main lang={lang}>
        <section className="bg-ink text-[#f5f3ef]">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pb-20 lg:pt-16">
            <div className="flex flex-col gap-5">
              <span className="self-start rounded-full border border-[#4a4c50] px-3 py-1 text-[12px] font-semibold tracking-wide text-amber">
                {d.home_badge}
              </span>
              <h1 className="font-display text-[36px] font-extrabold leading-[1.1] tracking-tight sm:text-[52px]">
                {d.home_h1}
              </h1>
              <p className="max-w-xl text-[17px] leading-relaxed text-[#cfcbc2]">
                {d.home_sub}
              </p>
              <ul className="mt-1 flex flex-col gap-2 text-[15px] text-[#e7e3dc]">
                {[d.home_why_1, d.home_why_2, d.home_why_3].map((w) => (
                  <li key={w} className="flex gap-2.5">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber"
                    />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
            <HeroQuick lang={lang} />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
          <h2 className="font-display text-[26px] font-extrabold tracking-tight">
            {lang === "hi" ? "एडवांस्ड टूल्स — फ़्री" : "Advanced tools — free"}
          </h2>
          <ul className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            {(
              [
                [
                  "house-boq-estimate",
                  lang === "hi"
                    ? "कमरे बताइए — हर आइटम का नाप, रेट और टोटल। मेज़रमेंट बुक, Excel और PDF।"
                    : "Tell us your rooms — every item measured, priced and totalled. Measurement book, Excel and PDF.",
                ],
                [
                  "contractor-quote-checker",
                  lang === "hi"
                    ? "ठेकेदार का रेट बाज़ार से मिलाएं, ज़्यादा रेट पकड़ें, साइन से पहले 14 सवाल।"
                    : "Compare a contractor's rate with the market, catch overpricing, 14 questions to ask before signing.",
                ],
              ] as const
            ).map(([slug, desc]) => {
              const c = CALCULATORS.find((x) => x.slug === slug)!;
              return (
                <li key={slug}>
                  <Link
                    href={langPath(lang, slug)}
                    className="flex h-full gap-4 rounded-2xl border-2 border-amber bg-white p-5 transition hover:-translate-y-0.5"
                  >
                    <span className="font-display flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink text-[15px] font-extrabold text-amber">
                      {c.mark}
                    </span>
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="text-[17px] font-bold">
                        {c[lang].name} →
                      </span>
                      <span className="text-[14px] leading-snug text-body">
                        {desc}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-[26px] font-extrabold tracking-tight">
              {lang === "hi"
                ? "प्लॉट साइज़ से नक्शा और खर्च"
                : "House plan and cost by plot size"}
            </h2>
            <Link
              href={langPath(lang, "house-construction-guide")}
              className="text-[15px] font-semibold text-steel hover:text-ink"
            >
              {lang === "hi"
                ? "घर बनाने की पूरी गाइड →"
                : "House building guide →"}
            </Link>
          </div>
          <ul className="mt-5 flex flex-wrap gap-2">
            {PLOTS.map((p) => (
              <li key={plotSlug(p)}>
                <Link
                  href={langPath(lang, `house-plan/${plotSlug(p)}`)}
                  className="font-display inline-flex rounded-xl border border-line bg-white px-4 py-2.5 text-[17px] font-extrabold hover:border-amber"
                >
                  {p.w}×{p.d}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={langPath(lang, "house-construction-cost")}
                className="inline-flex rounded-xl border border-dashed border-line px-4 py-2.5 text-[15px] font-semibold text-steel hover:border-amber"
              >
                {lang === "hi" ? "sq ft से खर्च →" : "Cost by sq ft →"}
              </Link>
            </li>
          </ul>
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-[26px] font-extrabold tracking-tight">
              {d.home_popular}
            </h2>
            <Link
              href={langPath(lang, "calculators")}
              className="text-[15px] font-semibold text-steel hover:text-ink"
            >
              {d.all_calculators} →
            </Link>
          </div>
          <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CALCULATORS.filter(
              (c) =>
                ![
                  "house-construction-cost-calculator",
                  "house-boq-estimate",
                  "contractor-quote-checker",
                ].includes(c.slug),
            ).map((c) => (
              <li key={c.slug}>
                <Link
                  href={langPath(lang, c.slug)}
                  className="flex h-full flex-col gap-3 rounded-2xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-amber"
                >
                  <span className="font-display flex h-10 w-10 items-center justify-center rounded-lg bg-amber-tint text-[15px] font-extrabold text-amber-dark">
                    {c.mark}
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[16px] font-bold">
                      {c[lang].name}
                    </span>
                    <span className="text-[13px] text-muted">
                      {c[lang].short}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
          <h2 className="font-display text-[26px] font-extrabold tracking-tight">
            {d.home_how}
          </h2>
          <ol className="mt-5 grid gap-3 md:grid-cols-3">
            {steps.map(([title, desc], i) => (
              <li
                key={title}
                className="flex gap-4 rounded-2xl border border-line bg-white p-5"
              >
                <span className="font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-[16px] font-extrabold text-amber">
                  {i + 1}
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-[16px] font-bold">{title}</span>
                  <span className="text-[14px] text-body">{desc}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-4 pt-14 sm:px-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-2xl bg-steel p-6 text-white sm:p-8">
            <span className="text-[12px] font-bold uppercase tracking-wide text-[#dce4ec]">
              IS 456 · IS 1200
            </span>
            <h2 className="font-display text-[24px] font-extrabold leading-tight">
              {d.home_trust_t}
            </h2>
            <p className="text-[15px] leading-relaxed text-[#e7edf3]">
              {d.home_trust_d}
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-amber bg-amber-tint p-6 sm:p-8">
            <span className="self-start rounded-full bg-amber px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-ink">
              PRO · {lang === "hi" ? "जल्द" : "SOON"}
            </span>
            <h2 className="font-display text-[24px] font-extrabold leading-tight">
              {d.home_pro_t}
            </h2>
            <p className="text-[15px] leading-relaxed text-body">
              {d.home_pro_d}
            </p>
          </div>
        </section>
      </main>
      <SiteFooter lang={lang} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}

export function CalculatorsIndex({ lang }: { lang: Lang }) {
  const d = t(lang);
  return (
    <>
      <SiteHeader
        lang={lang}
        altPath={langPath(lang === "en" ? "hi" : "en", "calculators")}
      />
      <main lang={lang} className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <h1 className="font-display text-[32px] font-extrabold tracking-tight sm:text-[40px]">
          {d.calculators_h1}
        </h1>
        <p className="mt-2 max-w-2xl text-[16px] text-body">
          {d.calculators_sub}
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CALCULATORS.map((c) => (
            <li key={c.slug}>
              <Link
                href={langPath(lang, c.slug)}
                className="flex h-full flex-col gap-3 rounded-2xl border border-line bg-white p-5 transition hover:border-amber"
              >
                <span className="flex items-center gap-3">
                  <span className="font-display flex h-10 w-10 items-center justify-center rounded-lg bg-amber-tint text-[15px] font-extrabold text-amber-dark">
                    {c.mark}
                  </span>
                  <span className="text-[17px] font-bold">{c[lang].name}</span>
                </span>
                <span className="text-[14px] leading-relaxed text-body">
                  {c[lang].intro}
                </span>
                <span className="mt-auto text-[14px] font-semibold text-steel">
                  {d.open} →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
