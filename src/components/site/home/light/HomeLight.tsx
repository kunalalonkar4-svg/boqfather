import Link from "next/link";
import { t } from "@/i18n/ui";
import { Lang, langPath, SITE_NAME, SITE_URL } from "@/lib/site";
import { SiteFooter, SiteHeader } from "../../Chrome";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);

/** Home page, reset to a minimal start. The full previous home is kept on the `backup-home-before-reset` branch. */
export function HomeLight({ lang }: { lang: Lang }) {
  const d = t(lang);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: SITE_NAME, url: `${SITE_URL}${langPath(lang)}`, inLanguage: lang === "hi" ? "hi-IN" : "en-IN", description: d.home_sub },
      { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/icon.svg` },
    ],
  };
  return (
    <>
      <SiteHeader lang={lang} altPath={langPath(lang === "en" ? "hi" : "en")} />
      <main lang={lang} className="bg-white">
        <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-6 px-4 py-24 text-center">
          <h1 className="text-[40px] font-extrabold leading-[1.05] tracking-tight [text-wrap:balance] sm:text-[60px]">
            {L(lang, "Know your construction cost before you build.", "घर बनाने से पहले जानिए, कितना खर्च आएगा।")}
          </h1>
          <p className="max-w-xl text-[18px] leading-relaxed text-body">
            {L(lang, "House plans, item-wise BOQ and calculators for India.", "भारत के लिए घर के नक्शे, आइटम-वार BOQ और कैलकुलेटर।")}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={langPath(lang, "house-boq-estimate")} className="inline-flex h-12 items-center rounded-full bg-ink px-8 text-[16px] font-bold text-white">
              {L(lang, "Start free estimate", "मुफ़्त एस्टिमेट शुरू करें")}
            </Link>
            <Link href={langPath(lang, "naksha")} className="inline-flex h-12 items-center rounded-full border border-line px-8 text-[16px] font-bold text-ink">
              {L(lang, "Explore house plans", "घर के नक्शे देखें")}
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter lang={lang} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
