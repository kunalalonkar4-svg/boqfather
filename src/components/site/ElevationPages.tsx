import Link from "next/link";
import { ELEVATIONS, designOf, elevationImage, getElevation, groupOf, type Elevation } from "@/content/elevations";
import { nakshaInfo, nakshaTitle } from "@/content/naksha";
import { lakh, plotSlug } from "@/content/plots";
import { Lang, langPath } from "@/lib/site";
import { ElevationCard, ElevationGallery } from "./ElevationClient";
import { Cta, H2, LinkGrid, Shell, Stats } from "./SeoPages";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);
const num = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
const BASE = "elevations";

const sizeOf = (x: Elevation) => x.plot.replace("-shop", "").replace("x", "×");
const withShop = (x: Elevation, lang: Lang) => (x.plot.endsWith("-shop") ? L(lang, " with shop", " दुकान के साथ") : "");

export const elevationsTitle = (lang: Lang) =>
  L(lang, "House Front Elevation Designs for Indian Plots, with Plan and Cost", "भारतीय प्लॉट के लिए घर के फ़्रंट एलिवेशन डिज़ाइन, नक्शे और खर्च के साथ");
export const elevationsDescription = (lang: Lang) =>
  L(
    lang,
    `${ELEVATIONS.length} front elevation designs for 20×40 to 50×80 plots, including house-with-shop fronts. Each one comes with its features, the plot it suits, the plan and the full construction cost.`,
    `20×40 से 50×80 प्लॉट के लिए ${ELEVATIONS.length} फ़्रंट एलिवेशन डिज़ाइन, दुकान के साथ घर के फ़्रंट भी। हर डिज़ाइन के साथ खूबियां, किस प्लॉट के लिए, नक्शा और पूरा निर्माण खर्च।`,
  );
export const elevationTitle = (x: Elevation, lang: Lang) =>
  L(lang, `${x.style.en}: ${sizeOf(x)} house${withShop(x, lang)} front elevation`, `${x.style.hi}: ${sizeOf(x)} घर${withShop(x, lang)} का फ़्रंट एलिवेशन`);
export const elevationDescription = (x: Elevation, lang: Lang) => {
  const d = designOf(x.plot)!;
  const i = nakshaInfo(d);
  return L(
    lang,
    `${x.style.en} front elevation for a ${sizeOf(x)} ft plot. ${x.features.en.slice(0, 3).join(", ")}. G+1 ${i.bhk}BHK, about ${lakh(i.total, "en")} to build.`,
    `${sizeOf(x)} फ़ीट प्लॉट के लिए ${x.style.hi} फ़्रंट एलिवेशन। ${x.features.hi.slice(0, 3).join(", ")}। G+1 ${i.bhk}BHK, बनाने का खर्च लगभग ${lakh(i.total, "hi")}।`,
  );
};

const alt = (x: Elevation, lang: Lang) =>
  L(lang, `${x.style.en}, front elevation of a ${sizeOf(x)} ft G+1 house${withShop(x, lang)}`, `${x.style.hi}, ${sizeOf(x)} फ़ीट G+1 घर${withShop(x, lang)} का फ़्रंट एलिवेशन`);

function card(x: Elevation, lang: Lang): ElevationCard {
  const i = nakshaInfo(designOf(x.plot)!);
  return {
    href: langPath(lang, `${BASE}/${x.slug}`),
    img: elevationImage(x, true),
    alt: alt(x, lang),
    title: x.style[lang],
    sub: `${sizeOf(x)} ft${withShop(x, lang)} · ${i.bhk} BHK · ${L(lang, "about", "लगभग")} ${lakh(i.total, lang)}`,
    group: groupOf(x),
  };
}

export function ElevationIndexPage({ lang }: { lang: Lang }) {
  return (
    <Shell
      lang={lang}
      path={BASE}
      crumbs={[{ name: L(lang, "Elevations", "एलिवेशन") }]}
      h1={elevationsTitle(lang)}
      intro={
        <p>
          {L(
            lang,
            "Pick the front you like, then see the plan it fits and what the whole house costs to build. Every design is matched to a plot size, so the cost shown is for a real, drawn-to-scale plan.",
            "अपना पसंदीदा फ़्रंट चुनिए, फिर देखिए कि कौन सा नक्शा उसमें बैठता है और पूरे घर का खर्च कितना आएगा। हर डिज़ाइन एक प्लॉट साइज़ से जुड़ा है, इसलिए दिखाया गया खर्च स्केल पर बने असली नक्शे का है।",
          )}
        </p>
      }
    >
      <ElevationGallery lang={lang} cards={ELEVATIONS.map((x) => card(x, lang))} />
      <p className="max-w-3xl text-[13px] text-muted">
        {L(lang, "All pictures are artist impressions. The final look depends on your design, materials and finishes.", "सभी चित्र काल्पनिक हैं। अंतिम रूप आपके डिज़ाइन, मटेरियल और फ़िनिश पर निर्भर करेगा।")}
      </p>
    </Shell>
  );
}

export function ElevationPage({ lang, slug }: { lang: Lang; slug: string }) {
  const x = getElevation(slug)!;
  const d = designOf(x.plot)!;
  const i = nakshaInfo(d);
  const p = d.plot;
  const s = sizeOf(x);
  const tool = `${langPath(lang, "house-boq-estimate")}?w=${p.w}&d=${p.d}&bhk=${p.bhk}&floors=2&front=${p.front}&back=${p.back}&side=${p.side}&facing=E`;
  const same = ELEVATIONS.filter((y) => y !== x);
  const near = [...same].sort((a, b) => Number(groupOf(b) === groupOf(x)) - Number(groupOf(a) === groupOf(x))).slice(0, 8);
  const faqs = [
    {
      q: L(lang, `Which plot suits the ${x.style.en} elevation?`, `${x.style.hi} एलिवेशन किस प्लॉट के लिए ठीक है?`),
      a: L(
        lang,
        `This front is drawn for a ${s} ft plot (G+1, ${i.bhk} BHK). It works on nearby widths with small changes to the porch and balcony.`,
        `यह फ़्रंट ${s} फ़ीट प्लॉट (G+1, ${i.bhk} BHK) के लिए बना है। पोर्च और बालकनी में थोड़े बदलाव के साथ यह आसपास की चौड़ाई पर भी चलता है।`,
      ),
    },
    {
      q: L(lang, `How much does this ${s} house cost to build?`, `यह ${s} घर बनाने में कितना खर्च आएगा?`),
      a: L(
        lang,
        `About ${lakh(i.total, "en")} at standard finish for ${num(i.builtUp)} sq ft, from ${lakh(i.basic, "en")} at basic to ${lakh(i.premium, "en")} at premium finish. A stone-clad or jaali front can push the cost towards the premium end.`,
        `${num(i.builtUp)} sq ft के लिए स्टैंडर्ड फ़िनिश में लगभग ${lakh(i.total, "hi")}, बेसिक में ${lakh(i.basic, "hi")} से प्रीमियम में ${lakh(i.premium, "hi")} तक। पत्थर या जाली वाला फ़्रंट खर्च प्रीमियम की तरफ़ ले जा सकता है।`,
      ),
    },
    {
      q: L(lang, "Is the picture the final design?", "क्या यह चित्र अंतिम डिज़ाइन है?"),
      a: L(
        lang,
        "No. It is an artist impression that shows the style. A final elevation is drawn for your plot, road side and budget.",
        "नहीं। यह शैली दिखाने वाला काल्पनिक चित्र है। अंतिम एलिवेशन आपके प्लॉट, सड़क की दिशा और बजट के हिसाब से बनता है।",
      ),
    },
  ];
  return (
    <Shell
      lang={lang}
      path={`${BASE}/${slug}`}
      crumbs={[{ name: L(lang, "Elevations", "एलिवेशन"), path: BASE }, { name: x.style[lang] }]}
      h1={elevationTitle(x, lang)}
      intro={<p>{x.blurb[lang]}</p>}
      faqs={faqs}
    >
      <section className="flex flex-col gap-3">
        <div className="overflow-hidden rounded-lg border border-line hover:shadow-[0_14px_32px_-14px_rgba(8,8,8,0.35)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={elevationImage(x)} alt={alt(x, lang)} width={1600} height={900} className="aspect-[16/9] w-full object-cover" fetchPriority="high" />
        </div>
        <p className="text-[12.5px] text-muted">{L(lang, "Artist impression. Final look depends on your design and finishes.", "काल्पनिक चित्र। अंतिम रूप आपके डिज़ाइन और फ़िनिश पर निर्भर करेगा।")}</p>
      </section>

      <Stats
        items={[
          [L(lang, "Plot", "प्लॉट"), `${s} ft`],
          [L(lang, "Built-up G+1", "बिल्ट-अप G+1"), `${num(i.builtUp)} sq ft`],
          [L(lang, "Standard finish", "स्टैंडर्ड फ़िनिश"), lakh(i.total, lang)],
          [L(lang, "Premium finish", "प्रीमियम फ़िनिश"), lakh(i.premium, lang)],
        ]}
      />

      <section className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <H2>{L(lang, "What makes this front", "इस फ़्रंट की खूबियां")}</H2>
          <ul className="flex flex-col gap-2.5">
            {x.features[lang].map((f) => (
              <li key={f} className="flex gap-3 text-[16px] leading-relaxed text-body">
                <span aria-hidden="true" className="mt-[3px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber text-[11px] font-black text-white">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <H2>{L(lang, "The plan and cost behind it", "इसके पीछे का नक्शा और खर्च")}</H2>
          <p className="text-[16px] leading-relaxed text-body">
            {L(
              lang,
              `${nakshaTitle(d, "en")}: ${i.bhk} BHK over two floors, ${num(i.builtUp)} sq ft, Vastu ${i.vastu.pct}%. The cost is worked out item by item from excavation to painting.`,
              `${nakshaTitle(d, "hi")}: दो मंज़िल पर ${i.bhk} BHK, ${num(i.builtUp)} sq ft, वास्तु ${i.vastu.pct}%। खर्च खुदाई से पेंटिंग तक आइटम-वार निकाला गया है।`,
            )}
          </p>
          <div className="flex flex-wrap gap-3">
            <Cta href={tool}>{L(lang, `Get the full BOQ for ${s}`, `${s} का पूरा BOQ पाएं`)}</Cta>
            <Link href={langPath(lang, `naksha/${d.slug}`)} className="inline-flex h-12 items-center rounded-lg border border-line bg-white px-5 text-[15px] font-bold hover:border-amber">
              {L(lang, "See the floor plan", "फ़्लोर प्लान देखें")}
            </Link>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <H2>{L(lang, "More front elevations", "और फ़्रंट एलिवेशन")}</H2>
        <LinkGrid
          links={near.map((y) => ({
            href: langPath(lang, `${BASE}/${y.slug}`),
            title: y.style[lang],
            sub: `${sizeOf(y)} ft${withShop(y, lang)}`,
          }))}
        />
      </section>
    </Shell>
  );
}
