import Link from "next/link";
import { CALCULATORS } from "@/content/calculators";
import { AccountButton } from "@/components/account/Account";
import { PLOTS, plotSlug, SQFT_SIZES, sqftSlug } from "@/content/plots";
import { t } from "@/i18n/ui";
import { Lang, langPath } from "@/lib/site";

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="bf-logo-mark font-display flex h-9 w-9 items-center justify-center rounded-lg bg-amber text-[14px] font-extrabold text-white">
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
    { href: langPath(lang), label: hi ? "होम" : "Home" },
    { href: `${langPath(lang)}#features`, label: hi ? "फ़ीचर" : "Features" },
    { href: langPath(lang, "naksha"), label: hi ? "घर के नक्शे" : "House Plans", desk: true },
    { href: langPath(lang, "calculators"), label: d.nav_calculators, desk: true },
    { href: langPath(lang, "plan-to-estimate"), label: hi ? "नक्शे से एस्टिमेट" : "Plan → Estimate", pro: true, desk: true },
    { href: langPath(lang, "pro"), label: hi ? "प्राइसिंग" : "Pricing", desk: true },
    { href: langPath(lang, "house-boq-estimate"), label: hi ? "आइटम-वार BOQ" : "Item-wise BOQ" },
    { href: langPath(lang, "house-construction-cost"), label: d.nav_house },
    { href: langPath(lang, "house-owner-guide"), label: hi ? "घर-मालिक गाइड" : "House Owner Guide", desk: true },
  ];
  const cta = (
    <Link
      href={langPath(lang, "house-boq-estimate")}
      className="bf-site-cta"
    >
      {hi ? "मुफ़्त एस्टिमेट" : "Start Free Estimate"}
    </Link>
  );
  return (
    <header className="bf-site-header sticky top-0 z-40 border-b backdrop-blur-xl">
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
                className="bf-site-nav-link flex items-center gap-1.5 rounded-full px-3 py-2 font-medium transition"
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
            className="bf-site-language rounded-full border px-3 py-1.5 text-[13px] font-semibold"
          >
            {d.lang_switch}
          </Link>
          <span className="hidden sm:inline-flex">{cta}</span>
          <details className="group relative xl:hidden">
            <summary
              aria-label={hi ? "मेनू" : "Menu"}
              className="bf-site-menu-trigger flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border [&::-webkit-details-marker]:hidden"
            >
              <span aria-hidden="true" className="flex flex-col gap-[5px]">
                <span className="block h-0.5 w-5 rounded bg-ink transition group-open:translate-y-[7px] group-open:rotate-45" />
                <span className="block h-0.5 w-5 rounded bg-ink transition group-open:opacity-0" />
                <span className="block h-0.5 w-5 rounded bg-ink transition group-open:-translate-y-[7px] group-open:-rotate-45" />
              </span>
            </summary>
            <nav
              aria-label="Main"
              className="bf-site-menu-panel absolute right-0 top-12 flex w-[min(88vw,340px)] flex-col gap-0.5 rounded-2xl border p-2"
            >
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-[16px] font-semibold"
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
  const hi = lang === "hi";
  const resourceLinks = [
    ["house-owner-guide", hi ? "घर-मालिक निर्माण गाइड" : "House Owner Guide"],
    ["plan-to-estimate", hi ? "नक्शे से एस्टिमेट" : "Plan to estimate"],
    ["house-construction-guide", hi ? "घर बनाने की गाइड" : "Building guide"],
    ["house-construction-guide/checklist", hi ? "निर्माण चेकलिस्ट" : "Build checklist"],
    ["house-construction-cost-in", hi ? "शहर के अनुसार खर्च" : "Cost by city"],
  ] as const;
  const companyLinks = [
    ["about", hi ? "हमारे बारे में" : "About"],
    ["contact", hi ? "संपर्क" : "Contact"],
    ["privacy", hi ? "प्राइवेसी" : "Privacy"],
    ["terms", hi ? "नियम और शर्तें" : "Terms"],
  ] as const;

  return (
    <footer className="bf-site-footer">
      <div className="bf-footer-main">
        <div className="bf-footer-intro">
          <Link href={langPath(lang)} aria-label="BOQFather home" className="bf-footer-brand">
            <Logo />
          </Link>
          <p className="bf-footer-tagline">{d.tagline}</p>
          <p className="bf-footer-disclaimer">{d.disclaimer}</p>
        </div>
        <Link className="bf-footer-cta" href={langPath(lang, "plan-to-estimate")}>
          <span>{hi ? "नक्शे से एस्टिमेट तक" : "FROM PLAN TO ESTIMATE"}</span>
          <strong>
            {hi
              ? "अपने प्लान को साफ़ प्रोजेक्ट एस्टिमेट में बदलें।"
              : "Turn your plan into a clear project estimate."}
          </strong>
          <i>{hi ? "वर्कफ़्लो देखें" : "Explore the workflow"} <b>↗</b></i>
        </Link>
      </div>

      <div className="bf-footer-link-grid">
        <section className="bf-footer-group bf-footer-tools">
          <h2>{d.all_calculators}</h2>
          <ul>
            {CALCULATORS.map((c) => (
              <li key={c.slug}>
                <Link href={langPath(lang, c.slug)}>{c[lang].name}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="bf-footer-group">
          <h2>
            <Link href={langPath(lang, "house-plan")}>
              {hi ? "घर के नक्शे" : "House plans"}
            </Link>
          </h2>
          <ul className="bf-footer-plots">
            {PLOTS.map((p) => (
              <li key={plotSlug(p)}>
                <Link href={langPath(lang, `house-plan/${plotSlug(p)}`)}>
                  {p.w}×{p.d}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="bf-footer-group">
          <h2>
            <Link href={langPath(lang, "house-construction-cost")}>
              {hi ? "निर्माण लागत" : "Construction cost"}
            </Link>
          </h2>
          <ul className="bf-footer-costs">
            {SQFT_SIZES.map((n) => (
              <li key={n}>
                <Link href={langPath(lang, `house-construction-cost/${sqftSlug(n)}`)}>
                  {n} sq ft
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="bf-footer-more">
          <section className="bf-footer-group">
            <h2>{hi ? "संसाधन" : "Resources"}</h2>
            <ul>
              {resourceLinks.map(([path, label]) => (
                <li key={path}>
                  <Link href={langPath(lang, path)}>{label}</Link>
                </li>
              ))}
            </ul>
          </section>
          <section className="bf-footer-group">
            <h2>{hi ? "कंपनी" : "Company"}</h2>
            <ul>
              {companyLinks.map(([path, label]) => (
                <li key={path}>
                  <Link href={langPath(lang, path)}>{label}</Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <div className="bf-footer-bottom">
        <div>
          <span>© {new Date().getFullYear()} BOQFather</span>
          <span>{hi ? "सभी अधिकार सुरक्षित।" : "All rights reserved."}</span>
        </div>
        <span className="bf-footer-origin">
          <i aria-hidden="true">✦</i>
          {hi ? "भारत में बना, भारत के लिए" : "Made in India, for India"}
        </span>
      </div>
    </footer>
  );
}
