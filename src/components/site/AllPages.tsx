import Link from "next/link";
import { CALCULATORS } from "@/content/calculators";
import { CITIES } from "@/content/cities";
import { ELEVATIONS } from "@/content/elevations";
import { GUIDE_BASE, QUESTIONS, TOPICS } from "@/content/guideTopics";
import { JOURNEY_SLUGS } from "@/content/journey";
import { GAJ, NAKSHE, nakshaTitle } from "@/content/naksha";
import { PLOTS, plotSlug, SQFT_SIZES, sqftSlug } from "@/content/plots";
import { langPath, type Lang } from "@/lib/site";
import { cityTitle } from "./CityPages";
import { elevationTitle } from "./ElevationPages";
import { journeyTitle } from "./JourneyPages";
import { gajTitle } from "./NakshaPages";
import { guideItemTitle, plotMetaTitle, sqftMetaTitle, H2, Shell } from "./SeoPages";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);

export const ALL_PAGES_META = {
  title: ["All Pages: Calculators, House Plans, Cost Guides | Guniyo", "सभी पेज: कैलकुलेटर, घर के नक्शे, खर्च गाइड | Guniyo"],
  description: [
    "Every Guniyo page in one list: construction calculators, house plans by plot size, naksha by facing, front elevations, cost by city and the house construction guide.",
    "Guniyo के सभी पेज एक जगह: कंस्ट्रक्शन कैलकुलेटर, प्लॉट साइज़ के हिसाब से घर के नक्शे, दिशा अनुसार नक्शे, फ़्रंट एलिवेशन, शहर के हिसाब से खर्च और गाइड।",
  ],
};

export function AllPagesPage({ lang }: { lang: Lang }) {
  const href = (p: string) => langPath(lang, p);
  const groups: { title: string; links: [string, string][] }[] = [
    {
      title: L(lang, "Main pages", "मुख्य पेज"),
      links: [
        ["/", L(lang, "Home", "होम")],
        ["house-boq-estimate", L(lang, "Item-wise BOQ estimate", "आइटम-वार BOQ एस्टिमेट")],
        ["house-construction-cost", L(lang, "House construction cost per sq ft", "घर बनाने का खर्च per sq ft")],
        ["plan-to-estimate", L(lang, "Plan to estimate", "नक्शे से एस्टिमेट")],
        ["pro", L(lang, "Pricing", "प्राइसिंग")],
        ["about", L(lang, "About", "हमारे बारे में")],
        ["contact", L(lang, "Contact", "संपर्क")],
        ["feedback", L(lang, "Feedback", "फ़ीडबैक")],
        ["privacy", L(lang, "Privacy", "प्राइवेसी")],
        ["terms", L(lang, "Terms", "नियम और शर्तें")],
      ],
    },
    {
      title: L(lang, "Construction calculators", "कंस्ट्रक्शन कैलकुलेटर"),
      links: [
        ["calculators", L(lang, "All calculators", "सभी कैलकुलेटर")],
        ...CALCULATORS.map((c): [string, string] => [c.slug, c[lang].h1]),
      ],
    },
    {
      title: L(lang, "House cost by area", "एरिया के हिसाब से खर्च"),
      links: SQFT_SIZES.map((n): [string, string] => [`house-construction-cost/${sqftSlug(n)}`, sqftMetaTitle(n, lang)]),
    },
    {
      title: L(lang, "House plans by plot size", "प्लॉट साइज़ के हिसाब से घर के नक्शे"),
      links: [
        ["house-plan", L(lang, "All house plans", "सभी घर के नक्शे")],
        ...PLOTS.map((p): [string, string] => [`house-plan/${plotSlug(p)}`, plotMetaTitle(plotSlug(p), lang)]),
      ],
    },
    {
      title: L(lang, "Naksha by facing and shop plans", "दिशा अनुसार नक्शे और दुकान वाले नक्शे"),
      links: [
        ["naksha", L(lang, "All nakshe", "सभी नक्शे")],
        ...NAKSHE.map((n): [string, string] => [`naksha/${n.slug}`, nakshaTitle(n, lang)]),
      ],
    },
    {
      title: L(lang, "Naksha by gaj", "गज़ के हिसाब से नक्शे"),
      links: GAJ.map((g): [string, string] => [`naksha/gaj/${g.slug}`, gajTitle(g.slug, lang)]),
    },
    {
      title: L(lang, "Front elevation designs", "फ़्रंट एलिवेशन डिज़ाइन"),
      links: [
        ["elevations", L(lang, "All elevations", "सभी एलिवेशन")],
        ...ELEVATIONS.map((x): [string, string] => [`elevations/${x.slug}`, elevationTitle(x, lang)]),
      ],
    },
    {
      title: L(lang, "House cost by city", "शहर के हिसाब से घर का खर्च"),
      links: [
        ["house-construction-cost-in", L(lang, "All cities", "सभी शहर")],
        ...CITIES.map((c): [string, string] => [`house-construction-cost-in/${c.slug}`, cityTitle(c.slug, lang)]),
      ],
    },
    {
      title: L(lang, "House construction guide", "घर बनाने की गाइड"),
      links: [
        [GUIDE_BASE, L(lang, "Guide home", "गाइड होम")],
        [`${GUIDE_BASE}/checklist`, L(lang, "House construction checklist", "घर बनाने की चेकलिस्ट")],
        ...[...TOPICS, ...QUESTIONS].map((x): [string, string] => [`${GUIDE_BASE}/${x.slug}`, guideItemTitle(x.slug, lang)]),
        ...JOURNEY_SLUGS.map((s): [string, string] => [`${GUIDE_BASE}/${s}`, journeyTitle(s, lang)]),
      ],
    },
  ];
  return (
    <Shell
      lang={lang}
      path="all-pages"
      crumbs={[{ name: L(lang, "All pages", "सभी पेज") }]}
      h1={L(lang, "All Guniyo pages", "Guniyo के सभी पेज")}
      intro={
        <p>
          {L(
            lang,
            "Every calculator, house plan, elevation, city cost page and guide on Guniyo, in one place.",
            "Guniyo के सारे कैलकुलेटर, घर के नक्शे, एलिवेशन, शहर के खर्च के पेज और गाइड, एक ही जगह।",
          )}
        </p>
      }
    >
      {groups.map((g) => (
        <section key={g.title} className="flex flex-col gap-3">
          <H2>{g.title}</H2>
          <ul className="grid gap-x-6 gap-y-1.5 text-[15px] sm:grid-cols-2 lg:grid-cols-3">
            {g.links.map(([p, label]) => (
              <li key={p}>
                <Link href={href(p)} className="text-ink underline-offset-2 hover:underline">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </Shell>
  );
}
