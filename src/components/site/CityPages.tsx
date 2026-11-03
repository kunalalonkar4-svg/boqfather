import Link from "next/link";
import {
  CITIES,
  City,
  cityAreaCosts,
  cityBoq30x50,
  cityRates,
  getCity,
} from "@/content/cities";
import { inr, lakh } from "@/content/plots";
import { Lang, langPath } from "@/lib/site";
import HouseCalc from "@/components/calcs/HouseCalc";
import { Cta, H2, LinkGrid, Shell, Stats, Table } from "./SeoPages";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);
const num = (n: number) =>
  n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
export const CITY_BASE = "house-construction-cost-in";
const cname = (c: City, lang: Lang) => (lang === "hi" ? c.hi : c.en);

export const cityTitle = (slug: string, lang: Lang) => {
  const c = getCity(slug)!;
  return L(
    lang,
    `House Construction Cost in ${c.en} per Sq Ft (2026)`,
    `${c.hi} में घर बनाने का खर्च per sq ft (2026)`,
  );
};
export const cityDescription = (slug: string, lang: Lang) => {
  const c = getCity(slug)!;
  const r = cityRates(c);
  return L(
    lang,
    `Construction cost in ${c.en}, ${c.state[0]}: about ₹${num(r.basic)} (basic), ₹${num(r.standard)} (standard) and ₹${num(r.premium)} (premium) per sq ft of built-up area in 2026, with cost for 1000–2500 sq ft and a 30×50 house.`,
    `${c.hi}, ${c.state[1]} में 2026 में घर बनाने का खर्च बिल्ट-अप पर लगभग ₹${num(r.basic)} (बेसिक), ₹${num(r.standard)} (स्टैंडर्ड) और ₹${num(r.premium)} (प्रीमियम) per sq ft — 1000–2500 sq ft और 30×50 घर का खर्च भी।`,
  );
};

export function CityPage({ lang, slug }: { lang: Lang; slug: string }) {
  const c = getCity(slug)!;
  const r = cityRates(c);
  const areas = cityAreaCosts(c);
  const b = cityBoq30x50(c);
  const n = cname(c, lang);
  const sameState = CITIES.filter((x) => x.state[0] === c.state[0] && x !== c);
  const others = CITIES.filter((x) => x.state[0] !== c.state[0]).slice(0, 12);
  const faqs = [
    {
      q: L(
        lang,
        `What is the construction cost per sq ft in ${c.en}?`,
        `${c.hi} में घर बनाने का रेट per sq ft कितना है?`,
      ),
      a: L(
        lang,
        `In 2026 a house in ${c.en} costs about ₹${num(r.basic)} per sq ft for basic finish, ₹${num(r.standard)} for standard and ₹${num(r.premium)} for premium, material and labour together, on built-up area.`,
        `2026 में ${c.hi} में घर बनाने का खर्च बिल्ट-अप पर बेसिक फ़िनिश में लगभग ₹${num(r.basic)}, स्टैंडर्ड में ₹${num(r.standard)} और प्रीमियम में ₹${num(r.premium)} per sq ft है — सामग्री और मज़दूरी मिलाकर।`,
      ),
    },
    {
      q: L(
        lang,
        `How much does a 1000 sq ft house cost in ${c.en}?`,
        `${c.hi} में 1000 sq ft घर कितने में बनेगा?`,
      ),
      a: L(
        lang,
        `About ${lakh(areas[0].standard, "en")} at standard finish (${lakh(areas[0].basic, "en")} basic to ${lakh(areas[0].premium, "en")} premium).`,
        `स्टैंडर्ड फ़िनिश में लगभग ${lakh(areas[0].standard, "hi")} (बेसिक ${lakh(areas[0].basic, "hi")} से प्रीमियम ${lakh(areas[0].premium, "hi")})।`,
      ),
    },
    {
      q: L(
        lang,
        `How much will a 30×50 G+1 house cost in ${c.en}?`,
        `${c.hi} में 30×50 G+1 घर कितने में बनेगा?`,
      ),
      a: L(
        lang,
        `Our item-wise BOQ of the 30×50 family plan (${num(b.builtUp)} sq ft) comes to about ${lakh(b.total, "en")} at ${c.en} prices.`,
        `30×50 फ़ैमिली नक्शे (${num(b.builtUp)} sq ft) का आइटम-वार BOQ ${c.hi} के दाम पर लगभग ${lakh(b.total, "hi")} आता है।`,
      ),
    },
  ];
  return (
    <Shell
      lang={lang}
      path={`${CITY_BASE}/${slug}`}
      crumbs={[
        {
          name: L(lang, "Construction cost", "निर्माण खर्च"),
          path: "house-construction-cost",
        },
        { name: L(lang, "By city", "शहर के हिसाब से"), path: CITY_BASE },
        { name: n },
      ]}
      h1={cityTitle(slug, lang)}
      faqs={faqs}
      intro={
        <p>
          {L(
            lang,
            `Building a house in ${c.en} (${c.state[0]}) costs about ₹${num(r.standard)} per sq ft of built-up area at standard finish in 2026, material and labour together. Below: rates by finish, cost for common house sizes, and an item-wise estimate of a real plan priced for ${c.en}.`,
            `${c.hi} (${c.state[1]}) में 2026 में स्टैंडर्ड फ़िनिश में घर बनाने का खर्च बिल्ट-अप पर लगभग ₹${num(r.standard)} per sq ft है, सामग्री और मज़दूरी मिलाकर। नीचे: फ़िनिश के हिसाब से रेट, आम साइज़ के घर का खर्च, और ${c.hi} के दाम पर एक असली नक्शे का आइटम-वार एस्टिमेट।`,
          )}
        </p>
      }
    >
      <Stats
        items={[
          [L(lang, "Basic", "बेसिक"), `₹${num(r.basic)}/sq ft`],
          [L(lang, "Standard", "स्टैंडर्ड"), `₹${num(r.standard)}/sq ft`],
          [L(lang, "Premium", "प्रीमियम"), `₹${num(r.premium)}/sq ft`],
          [L(lang, "30×50 G+1", "30×50 G+1"), lakh(b.total, lang)],
        ]}
      />
      <section className="flex flex-col gap-4">
        <H2>
          {L(
            lang,
            `House cost in ${c.en} by size`,
            `${c.hi} में साइज़ के हिसाब से घर का खर्च`,
          )}
        </H2>
        <Table
          head={[
            L(lang, "Built-up", "बिल्ट-अप"),
            L(lang, "Basic", "बेसिक"),
            L(lang, "Standard", "स्टैंडर्ड"),
            L(lang, "Premium", "प्रीमियम"),
          ]}
          rows={areas.map((a) => [
            <Link
              key="l"
              href={langPath(lang, `house-construction-cost/${a.sqft}-sq-ft`)}
              className="underline"
            >
              {num(a.sqft)} sq ft
            </Link>,
            lakh(a.basic, lang),
            <strong key="s">{lakh(a.standard, lang)}</strong>,
            lakh(a.premium, lang),
          ])}
        />
        <p className="max-w-3xl text-[14px] leading-relaxed text-body">
          {L(
            lang,
            `City levels come from 2026 city rate studies and are anchored to our own item-wise BOQ; ${c.en} works out to ${Math.round(r.factor * 100)}% of a typical tier-2 city. Land, approvals, interiors, compound wall and borewell are extra. Local sand, brick and labour prices can move the figure by ±10%.`,
            `शहर के स्तर 2026 की सिटी रेट स्टडी से लिए गए हैं और हमारे आइटम-वार BOQ से मिलाए गए हैं; ${c.hi} एक आम टियर-2 शहर का ${Math.round(r.factor * 100)}% बैठता है। ज़मीन, मंज़ूरी, इंटीरियर, बाउंड्री वॉल और बोरवेल अलग। लोकल रेत, ईंट और मज़दूरी के दाम से आंकड़ा ±10% बदल सकता है।`,
          )}
        </p>
      </section>
      <section className="flex flex-col gap-4">
        <H2>
          {L(lang, "Work out your own house", "अपने घर का हिसाब निकालें")}
        </H2>
        <HouseCalc
          lang={lang}
          initialArea={1000}
          initialFloors={2}
          initialRate={r.standard}
        />
        <Cta href={langPath(lang, "house-boq-estimate")}>
          {L(
            lang,
            "Item-wise BOQ from your plot →",
            "अपने प्लॉट से आइटम-वार BOQ →",
          )}
        </Cta>
      </section>
      {sameState.length > 0 && (
        <section className="flex flex-col gap-4">
          <H2>
            {L(
              lang,
              `Other cities in ${c.state[0]}`,
              `${c.state[1]} के दूसरे शहर`,
            )}
          </H2>
          <LinkGrid
            links={sameState.map((x) => ({
              href: langPath(lang, `${CITY_BASE}/${x.slug}`),
              title: cname(x, lang),
              sub: `₹${num(cityRates(x).standard)}/sq ft`,
            }))}
          />
        </section>
      )}
      <section className="flex flex-col gap-4">
        <H2>{L(lang, "More cities", "और शहर")}</H2>
        <LinkGrid
          links={others.map((x) => ({
            href: langPath(lang, `${CITY_BASE}/${x.slug}`),
            title: cname(x, lang),
            sub: `₹${num(cityRates(x).standard)}/sq ft`,
          }))}
        />
      </section>
    </Shell>
  );
}

export function CityIndexPage({ lang }: { lang: Lang }) {
  const states = [...new Set(CITIES.map((x) => x.state[0]))];
  return (
    <Shell
      lang={lang}
      path={CITY_BASE}
      crumbs={[
        {
          name: L(lang, "Construction cost", "निर्माण खर्च"),
          path: "house-construction-cost",
        },
        { name: L(lang, "By city", "शहर के हिसाब से") },
      ]}
      h1={L(
        lang,
        "House Construction Cost by City (2026)",
        "शहर के हिसाब से घर बनाने का खर्च (2026)",
      )}
      intro={
        <p>
          {L(
            lang,
            `Standard-finish construction rate per sq ft in ${CITIES.length} Indian cities, with basic and premium rates and the cost of a 30×50 house in each.`,
            `${CITIES.length} भारतीय शहरों में स्टैंडर्ड फ़िनिश का per sq ft रेट, बेसिक और प्रीमियम रेट, और हर शहर में 30×50 घर का खर्च।`,
          )}
        </p>
      }
    >
      {states.map((st) => {
        const list = CITIES.filter((x) => x.state[0] === st);
        return (
          <section key={st} className="flex flex-col gap-3">
            <H2>{lang === "hi" ? list[0].state[1] : st}</H2>
            <LinkGrid
              links={list.map((x) => ({
                href: langPath(lang, `${CITY_BASE}/${x.slug}`),
                title: cname(x, lang),
                sub: `₹${num(cityRates(x).standard)}/sq ft · ${inr(cityRates(x).basic)}–${inr(cityRates(x).premium)}`,
              }))}
            />
          </section>
        );
      })}
    </Shell>
  );
}
