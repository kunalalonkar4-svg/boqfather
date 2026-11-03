import Link from "next/link";
import { CALCULATORS } from "@/content/calculators";
import { AccountButton } from "@/components/account/Account";
import { PLOTS, plotSlug, SQFT_SIZES, sqftSlug } from "@/content/plots";
import { t } from "@/i18n/ui";
import { Lang, langPath } from "@/lib/site";

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="font-display flex h-9 w-9 items-center justify-center rounded-lg bg-amber text-[14px] font-extrabold text-ink">
        BF
      </span>
      <span className="font-display text-[20px] font-extrabold tracking-tight">
        BOQFather
      </span>
    </span>
  );
}

/** Top bar. `altPath` is the same page in the other language. */
export function SiteHeader({ lang, altPath }: { lang: Lang; altPath: string }) {
  const d = t(lang);
  return (
    <header className="bg-ink text-[#f5f3ef]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href={langPath(lang)} aria-label="BOQFather home">
          <Logo />
        </Link>
        <nav
          aria-label="Main"
          className="flex flex-wrap items-center gap-1 text-[14px]"
        >
          <Link
            href={langPath(lang, "calculators")}
            className="rounded-lg px-3 py-2 text-[#cfcbc2] hover:text-white"
          >
            {d.nav_calculators}
          </Link>
          <Link
            href={langPath(lang, "naksha")}
            className="rounded-lg px-3 py-2 font-semibold text-amber hover:text-white"
          >
            {lang === "hi" ? "नक्शे" : "Naksha"}
          </Link>
          <Link
            href={langPath(lang, "house-construction-cost")}
            className="rounded-lg px-3 py-2 text-[#cfcbc2] hover:text-white"
          >
            {d.nav_house}
          </Link>
          <Link
            href={langPath(lang, "house-construction-guide")}
            className="rounded-lg px-3 py-2 text-[#cfcbc2] hover:text-white"
          >
            {lang === "hi" ? "गाइड" : "Guide"}
          </Link>
          <Link
            href={langPath(lang, "pro")}
            className="rounded-lg px-3 py-2 font-extrabold text-amber hover:text-white"
          >
            Pro
          </Link>
          <AccountButton lang={lang} />
          <Link
            href={altPath}
            hrefLang={lang === "en" ? "hi" : "en"}
            className="ml-1 rounded-full border border-[#4a4c50] px-3 py-1.5 font-semibold text-white hover:border-amber"
          >
            {d.lang_switch}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter({ lang }: { lang: Lang }) {
  const d = t(lang);
  return (
    <footer className="mt-16 bg-ink text-[#cfcbc2]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_2fr]">
        <div className="flex flex-col gap-3">
          <span className="text-white">
            <Logo />
          </span>
          <p className="max-w-sm text-[14px] leading-relaxed">{d.tagline}</p>
          <p className="max-w-sm text-[12px] leading-relaxed text-[#9c968b]">
            {d.disclaimer}
          </p>
        </div>
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-[13px] font-bold uppercase tracking-wide text-amber">
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
              <h2 className="text-[13px] font-bold uppercase tracking-wide text-amber">
                <Link
                  href={langPath(lang, "house-plan")}
                  className="hover:text-white"
                >
                  {lang === "hi" ? "घर के नक्शे" : "House plans"}
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
              <h2 className="text-[13px] font-bold uppercase tracking-wide text-amber">
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
                  className="font-semibold text-white hover:text-amber"
                >
                  {lang === "hi"
                    ? "घर बनाने की पूरी गाइड →"
                    : "House building guide →"}
                </Link>
              </p>
              <p className="mt-2 text-[14px]">
                <Link
                  href={langPath(lang, "house-construction-cost-in")}
                  className="font-semibold text-white hover:text-amber"
                >
                  {lang === "hi" ? "शहर के हिसाब से खर्च →" : "Cost by city →"}
                </Link>
              </p>
              <p className="mt-2 text-[14px]">
                <Link
                  href={langPath(lang, "house-construction-guide/checklist")}
                  className="font-semibold text-white hover:text-amber"
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
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-4 text-[12px] text-[#9c968b] sm:px-6">
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
