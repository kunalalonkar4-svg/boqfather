import Link from "next/link";
import { CALCULATORS } from "@/content/calculators";
import { AccountButton } from "@/components/account/Account";
import { PLOTS, plotSlug, SQFT_SIZES, sqftSlug } from "@/content/plots";
import { t } from "@/i18n/ui";
import { Lang, langPath } from "@/lib/site";

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="font-display flex h-9 w-9 items-center justify-center rounded-lg bg-amber text-[14px] font-extrabold text-white">
        BF
      </span>
      <span className="font-display text-[20px] font-extrabold tracking-tight">
        BOQFather
      </span>
    </span>
  );
}

/** Top bar: dark glass, stays on top while scrolling. `altPath` is the same page in the other language. */
export function SiteHeader({ lang, altPath }: { lang: Lang; altPath: string }) {
  const d = t(lang);
  const hi = lang === "hi";
  const links: { href: string; label: string; pro?: boolean; desk?: boolean }[] = [
    { href: langPath(lang), label: hi ? "होम" : "Home", desk: true },
    { href: `${langPath(lang)}#features`, label: hi ? "फ़ीचर" : "Features", desk: true },
    { href: langPath(lang, "naksha"), label: hi ? "नक्शे और खर्च" : "Plans & Cost", desk: true },
    { href: langPath(lang, "elevations"), label: hi ? "एलिवेशन" : "Elevations", desk: true },
    { href: langPath(lang, "calculators"), label: d.nav_calculators, desk: true },
    { href: langPath(lang, "plan-to-estimate"), label: hi ? "नक्शे से एस्टिमेट" : "Plan → Estimate", pro: true, desk: true },
    { href: langPath(lang, "pro"), label: hi ? "प्राइसिंग" : "Pricing", desk: true },
    { href: langPath(lang, "house-boq-estimate"), label: hi ? "आइटम-वार BOQ" : "Item-wise BOQ" },
    { href: langPath(lang, "house-construction-cost"), label: d.nav_house },
    { href: langPath(lang, "house-construction-guide"), label: hi ? "गाइड" : "Guide" },
  ];
  const cta = (
    <Link
      href={langPath(lang, "house-boq-estimate")}
      className="inline-flex h-10 items-center rounded-full bg-ink px-4 text-[14px] font-bold text-white transition hover:bg-[#1d3352]"
    >
      {hi ? "मुफ़्त एस्टिमेट" : "Start Free Estimate"}
    </Link>
  );
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/90 text-ink backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href={langPath(lang)} aria-label="BOQFather home" className="shrink-0">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-0.5 text-[14px] xl:flex">
          {links
            .filter((l) => l.desk)
            .map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-1.5 rounded-full px-3 py-2 font-medium text-body transition hover:bg-[#eaf3ff] hover:text-ink"
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
            <AccountButton lang={lang} />
          </span>
          <Link
            href={altPath}
            hrefLang={lang === "en" ? "hi" : "en"}
            className="rounded-full border border-line px-3 py-1.5 text-[13px] font-semibold text-ink hover:border-ink"
          >
            {d.lang_switch}
          </Link>
          <span className="hidden sm:inline-flex">{cta}</span>
          <details className="group relative xl:hidden">
            <summary
              aria-label={hi ? "मेनू" : "Menu"}
              className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-line bg-white [&::-webkit-details-marker]:hidden"
            >
              <span aria-hidden="true" className="flex flex-col gap-[5px]">
                <span className="block h-0.5 w-5 rounded bg-ink transition group-open:translate-y-[7px] group-open:rotate-45" />
                <span className="block h-0.5 w-5 rounded bg-ink transition group-open:opacity-0" />
                <span className="block h-0.5 w-5 rounded bg-ink transition group-open:-translate-y-[7px] group-open:-rotate-45" />
              </span>
            </summary>
            <nav
              aria-label="Main"
              className="absolute right-0 top-12 flex w-[min(88vw,340px)] flex-col gap-0.5 rounded-2xl border border-line bg-white p-2 shadow-[0_24px_60px_-20px_rgba(22,24,26,0.35)]"
            >
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-[16px] font-semibold text-ink hover:bg-[#eef4fb]"
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
                <AccountButton lang={lang} />
                <span className="sm:hidden">{cta}</span>
              </div>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ lang }: { lang: Lang }) {
  const d = t(lang);
  return (
    <footer className="mt-16 border-t border-[#1d3a60] bg-[#0f2440] text-[#b8c6d8]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_2fr]">
        <div className="flex flex-col gap-3">
          <span className="text-white">
            <Logo />
          </span>
          <p className="max-w-sm text-[14px] leading-relaxed">{d.tagline}</p>
          <p className="max-w-sm text-[12px] leading-relaxed text-[#7f93ad]">
            {d.disclaimer}
          </p>
        </div>
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-[13px] font-bold uppercase tracking-wide text-[#8fb8ee]">
              {d.all_calculators}
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-[14px] sm:grid-cols-2">
              {CALCULATORS.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={langPath(lang, c.slug)}
                    className="hover:text-white"
                  >
                    {c[lang].name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="text-[13px] font-bold uppercase tracking-wide text-[#8fb8ee]">
                <Link
                  href={langPath(lang, "house-plan")}
                  className="hover:text-white"
                >
                  {lang === "hi" ? "नक्शे और खर्च" : "Plans & cost"}
                </Link>
              </h2>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[14px]">
                {PLOTS.map((p) => (
                  <li key={plotSlug(p)}>
                    <Link
                      href={langPath(lang, `house-plan/${plotSlug(p)}`)}
                      className="hover:text-white"
                    >
                      {p.w}×{p.d}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-[13px] font-bold uppercase tracking-wide text-[#8fb8ee]">
                <Link
                  href={langPath(lang, "house-construction-cost")}
                  className="hover:text-white"
                >
                  {lang === "hi" ? "निर्माण खर्च" : "Construction cost"}
                </Link>
              </h2>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[14px]">
                {SQFT_SIZES.map((n) => (
                  <li key={n}>
                    <Link
                      href={langPath(
                        lang,
                        `house-construction-cost/${sqftSlug(n)}`,
                      )}
                      className="hover:text-white"
                    >
                      {n} sq ft
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[14px]">
                <Link
                  href={langPath(lang, "house-construction-guide")}
                  className="font-semibold text-white hover:text-[#8fb8ee]"
                >
                  {lang === "hi"
                    ? "घर बनाने की पूरी गाइड →"
                    : "House building guide →"}
                </Link>
              </p>
              <p className="mt-2 text-[14px]">
                <Link
                  href={langPath(lang, "elevations")}
                  className="font-semibold text-white hover:text-[#8fb8ee]"
                >
                  {lang === "hi" ? "फ़्रंट एलिवेशन डिज़ाइन →" : "Front elevation designs →"}
                </Link>
              </p>
              <p className="mt-2 text-[14px]">
                <Link
                  href={langPath(lang, "house-construction-cost-in")}
                  className="font-semibold text-white hover:text-[#8fb8ee]"
                >
                  {lang === "hi" ? "शहर के हिसाब से खर्च →" : "Cost by city →"}
                </Link>
              </p>
              <p className="mt-2 text-[14px]">
                <Link
                  href={langPath(lang, "house-construction-guide/checklist")}
                  className="font-semibold text-white hover:text-[#8fb8ee]"
                >
                  {lang === "hi"
                    ? "घर बनाने की चेकलिस्ट (82 पॉइंट) →"
                    : "House checklist (82 points) →"}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-[#2e3033]">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-4 text-[12px] text-[#7f93ad] sm:px-6">
          <span className="flex flex-wrap gap-x-4 gap-y-1">
            <span>© 2026 BOQFather</span>
            {(
              [
                ["about", "About", "हमारे बारे में"],
                ["contact", "Contact", "संपर्क"],
                ["privacy", "Privacy", "प्राइवेसी"],
                ["terms", "Terms", "नियम और शर्तें"],
              ] as const
            ).map(([p, en, hi]) => (
              <Link
                key={p}
                href={langPath(lang, p)}
                className="hover:text-white"
              >
                {lang === "hi" ? hi : en}
              </Link>
            ))}
          </span>
          <span>
            {lang === "hi" ? "भारत के लिए बना" : "Made in India, for India"}
          </span>
        </div>
      </div>
    </footer>
  );
}
