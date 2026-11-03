import Link from "next/link";
import type { ComponentType } from "react";
import { CalcSlug, getCalc } from "@/content/calculators";
import { t } from "@/i18n/ui";
import { Lang, langPath, SITE_NAME, SITE_URL } from "@/lib/site";
import { SiteFooter, SiteHeader } from "./Chrome";
import BrickCalc from "@/components/calcs/BrickCalc";
import ConcreteCalc from "@/components/calcs/ConcreteCalc";
import ConverterCalc from "@/components/calcs/ConverterCalc";
import ExcavationCalc from "@/components/calcs/ExcavationCalc";
import HouseCalc from "@/components/calcs/HouseCalc";
import PaintCalc from "@/components/calcs/PaintCalc";
import PlasterCalc from "@/components/calcs/PlasterCalc";
import SteelCalc from "@/components/calcs/SteelCalc";
import TileCalc from "@/components/calcs/TileCalc";
import BoqCalc from "@/components/calcs/BoqCalc";
import QuoteCalc from "@/components/calcs/QuoteCalc";

const COMPONENTS: Record<CalcSlug, ComponentType<{ lang: Lang }>> = {
  "house-construction-cost-calculator": HouseCalc,
  "concrete-calculator": ConcreteCalc,
  "brick-calculator": BrickCalc,
  "plaster-calculator": PlasterCalc,
  "steel-calculator": SteelCalc,
  "tile-calculator": TileCalc,
  "paint-calculator": PaintCalc,
  "excavation-calculator": ExcavationCalc,
  "construction-unit-converter": ConverterCalc,
  "house-boq-estimate": BoqCalc,
  "contractor-quote-checker": QuoteCalc,
};

export function CalculatorPage({ lang, slug }: { lang: Lang; slug: CalcSlug }) {
  const calc = getCalc(slug)!;
  const c = calc[lang];
  const d = t(lang);
  const Calc = COMPONENTS[slug];
  const url = `${SITE_URL}${langPath(lang, slug)}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: c.h1,
      url,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      inLanguage: lang === "hi" ? "hi-IN" : "en-IN",
      offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: c.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: SITE_NAME,
          item: `${SITE_URL}${langPath(lang)}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: d.nav_calculators,
          item: `${SITE_URL}${langPath(lang, "calculators")}`,
        },
        { "@type": "ListItem", position: 3, name: c.name, item: url },
      ],
    },
  ];

  return (
    <>
      <SiteHeader
        lang={lang}
        altPath={langPath(lang === "en" ? "hi" : "en", slug)}
      />
      <main lang={lang} className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[380px] bg-[radial-gradient(circle_at_1px_1px,rgba(22,24,26,0.07)_1px,transparent_0)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10">
        <nav
          aria-label="Breadcrumb"
          className="w-fit max-w-full truncate rounded-full border border-line bg-white/80 px-3.5 py-1.5 text-[13px] text-muted shadow-sm"
        >
          <Link href={langPath(lang)} className="hover:text-ink">
            {SITE_NAME}
          </Link>
          <span className="mx-1.5">/</span>
          <Link href={langPath(lang, "calculators")} className="hover:text-ink">
            {d.nav_calculators}
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink">{c.name}</span>
        </nav>
        <div className="mb-8 mt-6 flex max-w-3xl flex-col gap-3">
          <h1 className="font-display text-[32px] font-extrabold leading-[1.06] tracking-tight [text-wrap:balance] sm:text-[46px]">
            {c.h1}
          </h1>
          <p className="text-[17px] leading-relaxed text-body">{c.intro}</p>
        </div>

        <Calc lang={lang} />

        <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div>
            <h2 className="font-display text-[26px] font-extrabold tracking-tight">{d.faq}</h2>
            <div className="mt-4 flex flex-col gap-2">
              {c.faqs.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-2xl border border-line bg-white px-5 py-4 open:pb-5 open:shadow-sm"
                >
                  <summary className="cursor-pointer list-none text-[15px] font-semibold marker:hidden">
                    <span className="flex items-start justify-between gap-3">
                      {f.q}
                      <span
                        aria-hidden="true"
                        className="text-amber-dark transition group-open:rotate-45"
                      >
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="mt-2 text-[14px] leading-relaxed text-body">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
          <aside>
            <h2 className="font-display text-[26px] font-extrabold tracking-tight">{d.related}</h2>
            <ul className="mt-4 flex flex-col gap-2">
              {calc.related.map((s) => {
                const r = getCalc(s)!;
                return (
                  <li key={s}>
                    <Link
                      href={langPath(lang, s)}
                      className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 transition hover:-translate-y-0.5 hover:border-amber hover:shadow-md"
                    >
                      <span className="font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-tint text-[14px] font-extrabold text-amber-dark">
                        {r.mark}
                      </span>
                      <span className="flex flex-col">
                        <span className="text-[15px] font-semibold">
                          {r[lang].name}
                        </span>
                        <span className="text-[13px] text-muted">
                          {r[lang].short}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="mt-5 rounded-xl bg-warn-tint px-4 py-3 text-[13px] leading-relaxed text-[#4a3b12]">
              {d.disclaimer}
            </p>
          </aside>
        </section>
        <div className="h-16" />
        </div>
      </main>
      <SiteFooter lang={lang} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
