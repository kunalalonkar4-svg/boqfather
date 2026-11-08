import Link from "next/link";
import type { ReactNode } from "react";
import { CALCULATORS } from "@/content/calculators";
import { CHECKLIST, CHECKLIST_COUNT, ytUrl } from "@/content/checklist";
import { CITIES } from "@/content/cities";
import {
  DESIGNS,
  FACING_NAME,
  getNaksha,
  NAKSHE,
  nakshaImage,
  nakshaInfo,
  nakshaPlan,
  nakshaTitle,
  type Naksha,
} from "@/content/naksha";
import { nakshaPreview } from "@/content/nakshaPreview";
import { t } from "@/i18n/ui";
import { Lang, langPath, SITE_NAME, SITE_URL } from "@/lib/site";
import { SiteFooter, SiteHeader } from "../../Chrome";
import { BeforeAfter } from "../BeforeAfter";
import { CountUp, Reveal } from "../Motion";
import { PlanTabs } from "./PlanTabs";
import { LiveEstimate, type LiveRow } from "./LiveEstimate";
import { getPlot, plotEstimate } from "@/content/plots";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);
const lakh = (x: number, lang: Lang) =>
  `₹${(x / 1e5).toLocaleString("en-IN", { maximumFractionDigits: 1 })} ${L(lang, "lakh", "लाख")}`;
const num = (x: number, d = 0) => x.toLocaleString("en-IN", { maximumFractionDigits: d });

function Tick({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3 text-[16px] leading-relaxed text-body">
      <span aria-hidden="true" className="mt-[3px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber text-[11px] font-black text-white">
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}
const btnDark =
  "inline-flex h-12 items-center rounded-[4px] bg-amber px-6 text-[15px] font-bold text-white transition hover:bg-amber-dark";
const btnLight =
  "inline-flex h-12 items-center rounded-[4px] border border-line bg-white px-6 text-[15px] font-bold text-ink transition hover:border-ink";

/** Text on one side, a picture on the other; sides swap with `flip`. */
function Split({
  title,
  text,
  points,
  ctas,
  visual,
  flip,
  tint,
  id,
}: {
  title: string;
  text: ReactNode;
  points?: ReactNode[];
  ctas?: ReactNode;
  visual: ReactNode;
  flip?: boolean;
  tint?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className={tint ? "bg-[#f5f5f5]" : "bg-white"}>
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <Reveal className={`min-w-0 ${flip ? "lg:order-2" : ""}`}>
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-[28px] font-extrabold leading-[1.12] tracking-tight [text-wrap:balance] sm:text-[36px]">
              {title}
            </h2>
            <div className="text-[17px] leading-relaxed text-body">{text}</div>
            {points && <ul className="flex flex-col gap-2.5">{points.map((p, i) => <Tick key={i}>{p}</Tick>)}</ul>}
            {ctas && <div className="mt-2 flex flex-wrap gap-3">{ctas}</div>}
          </div>
        </Reveal>
        <Reveal className="min-w-0" delay={100}>
          {visual}
        </Reveal>
      </div>
    </section>
  );
}

/** A screenshot of the tool in a light browser frame. */
function Shot({ src, alt, url }: { src: string; alt: string; url: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white shadow-[0_30px_70px_-35px_rgba(22,24,26,0.45)]">
      <div className="flex items-center gap-2 border-b border-line bg-[#f5f5f5] px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="ml-2 truncate rounded-md bg-white px-3 py-1 text-[11px] text-muted">{url}</span>
      </div>
      <img src={src} alt={alt} loading="lazy" className="aspect-[16/10] w-full object-cover object-top" />
    </div>
  );
}

/** Home page in a light, editorial layout (text and pictures in alternating rows). */
export function HomeLight({ lang }: { lang: Lang }) {
  const d = t(lang);
  const n = getNaksha("30x40-east-facing") ?? NAKSHE[0];
  const info = nakshaInfo(n);
  const { res } = nakshaPlan(n);
  const mat = (k: string) => res.materials.find((m) => m.key === k)?.qty ?? 0;
  const items = res.sections.reduce((a, s) => a + s.items.length, 0);
  const hiSfx = lang === "hi" ? "-hi" : "";
  const liveRows: LiveRow[] = ["20x40", "20x50", "25x40", "25x50", "30x40", "30x50", "30x60", "40x50", "40x60", "50x80"].map((sz) => {
    const p = getPlot(sz)!;
    const house = DESIGNS.find((x) => x.plot === p && x.kind === "house")!;
    const q = {} as LiveRow["q"];
    let builtUp = 0;
    for (const k of ["basic", "standard", "premium"] as const) {
      const { res: r } = plotEstimate(p, 2, k);
      builtUp = r.geometry.builtUpSqft;
      q[k] = {
        total: r.grandTotal,
        perSqft: r.perSqft,
        stages: [...r.sections].sort((x, y) => y.subtotal - x.subtotal).slice(0, 4).map((x) => ({ t: x.title[lang].replace(/^[A-Z]\.\s*/, ""), v: x.subtotal })),
      };
    }
    return {
      slug: sz,
      w: p.w,
      d: p.d,
      bhk: p.bhk,
      builtUp,
      img: nakshaPreview(house).src,
      href: `${langPath(lang, "house-boq-estimate")}?w=${p.w}&d=${p.d}&bhk=${p.bhk}&floors=2&front=${p.front}&back=${p.back}&side=${p.side}&facing=E`,
      q,
    };
  });
  const mosaic = ["20x50-east-facing", "30x40-east-facing", "40x60-north-facing", "30x50-east-facing-shop", "25x50-west-facing", "30x60-south-facing", "40x50-east-facing", "20x40-north-facing", "35x50-west-facing"]
    .map((s) => getNaksha(s))
    .filter((x): x is Naksha => !!x);

  const liveLabels = {
    plot: L(lang, "Plot", "प्लॉट"),
    finish: L(lang, "Finish", "फ़िनिश"),
    quality: { basic: L(lang, "Basic", "बेसिक"), standard: L(lang, "Standard", "स्टैंडर्ड"), premium: L(lang, "Premium", "प्रीमियम") },
    sqft: "sq ft",
    built: L(lang, "Built-up", "बिल्ट-अप"),
    perSqft: L(lang, "per sq ft", "प्रति sq ft"),
    total: L(lang, "Full construction cost", "बनाने का पूरा खर्च"),
    lakh: L(lang, "lakh", "लाख"),
    frontage: L(lang, "frontage", "फ़्रंट"),
    biggest: L(lang, "Where the money goes", "पैसा कहां जाता है"),
    cta: L(lang, "Get the full BOQ for {size}", "{size} का पूरा BOQ पाएं"),
    note: L(lang, "G+1 house with parking, mid-city rates. Front view is an artist impression.", "G+1 घर, पार्किंग के साथ, मध्यम शहर के रेट। सामने का चित्र काल्पनिक है।"),
  };
  const cover = "object-cover object-top";
  const heroCards = [
    { href: langPath(lang, "house-boq-estimate"), t: L(lang, "Estimate your house", "अपने घर का एस्टिमेट"), d: L(lang, "Item-wise BOQ with every quantity and rate.", "हर मात्रा और रेट के साथ आइटम-वार BOQ।"), cta: L(lang, "Start", "शुरू करें"), img: `/home/shots/boq${hiSfx}.webp`, fit: cover, eager: true },
    { href: langPath(lang, "naksha"), t: L(lang, "House plans", "घर के नक्शे"), d: L(lang, "Drawn to scale for every plot size and road side.", "हर प्लॉट साइज़ और सड़क दिशा के लिए स्केल पर।"), cta: L(lang, "See plans", "नक्शे देखें"), img: nakshaImage(n), fit: "object-contain p-2 bg-white", eager: true },
    { href: langPath(lang, "elevations"), t: L(lang, "Front elevations", "फ़्रंट एलिवेशन"), d: L(lang, "20 designs with their plan and cost.", "20 डिज़ाइन, नक्शे और खर्च के साथ।"), cta: L(lang, "Browse", "देखें"), img: nakshaPreview(mosaic[1] ?? n).src, fit: "object-cover", eager: true },
    { href: langPath(lang, "contractor-quote-checker"), t: L(lang, "Check a contractor's quote", "ठेकेदार का कोटेशन जांचें"), d: L(lang, "Put each rate next to the market rate for your city.", "हर रेट को अपने शहर के बाज़ार रेट के सामने रखें।"), cta: L(lang, "Check a quote", "कोटेशन जांचें"), img: `/home/shots/materials${hiSfx}.webp`, fit: cover, eager: true },
  ];
  const feats = [
    { href: langPath(lang, "naksha"), t: L(lang, "Vastu check for every room", "हर कमरे की वास्तु जांच"), d: L(lang, "Each plan is set for its road side, with a room-by-room chart.", "हर नक्शा अपनी सड़क दिशा के हिसाब से, कमरे-दर-कमरे चार्ट के साथ।"), img: nakshaImage(n), fit: "object-contain p-3 bg-white" },
    { href: langPath(lang, "house-boq-estimate"), t: L(lang, "Measurement book and steel BBS", "मेज़रमेंट बुक और सरिया BBS"), d: L(lang, "Nos × L × B × H for every item, and bar bending schedules.", "हर आइटम की Nos × L × B × H, और सरिया बेंडिंग शेड्यूल।"), img: `/home/shots/bbs${hiSfx}.webp`, fit: cover },
    { href: langPath(lang, "house-boq-estimate"), t: L(lang, "A quotation with your name", "आपके नाम का कोटेशन"), d: L(lang, "Clean PDF reports a contractor can hand to a client.", "साफ़ PDF रिपोर्ट, जो ठेकेदार ग्राहक को दे सके।"), img: `/home/shots/pdf${hiSfx}.webp`, fit: cover },
    { href: langPath(lang, "house-boq-estimate"), t: L(lang, "Download to Excel", "Excel में डाउनलोड"), d: L(lang, "Take the BOQ into your own sheet and keep working.", "BOQ अपनी शीट में ले जाएं और काम जारी रखें।"), img: `/home/shots/excel${hiSfx}.webp`, fit: cover },
    { href: langPath(lang, "house-construction-cost-in"), t: L(lang, `Rates for ${CITIES.length} cities`, `${CITIES.length} शहरों के रेट`), d: L(lang, "Cost levels set for your city, and every rate is editable.", "आपके शहर के हिसाब से खर्च का स्तर, और हर रेट बदला जा सकता है।"), img: `/home/shots/materials${hiSfx}.webp`, fit: cover },
    { href: langPath(lang === "en" ? "hi" : "en"), t: L(lang, "In Hindi and English", "हिंदी और अंग्रेज़ी में"), d: L(lang, "Every page, tool and report in both languages.", "हर पेज, टूल और रिपोर्ट दोनों भाषाओं में।"), img: nakshaPreview(mosaic[5] ?? n).src, fit: "object-cover" },
  ];

  const host = "boqfather.vercel.app";
  const facing = (x: Naksha) => L(lang, FACING_NAME[x.facing].en, FACING_NAME[x.facing].hi);
  const card = (x: Naksha) => {
    const xi = nakshaInfo(x);
    return {
      href: langPath(lang, `naksha/${x.slug}`),
      // a design card: the four road directions share the same rooms, so the title has no direction
      title: `${x.plot.w}×${x.plot.d}${x.kind === "shop" ? L(lang, " house with shop", " दुकान के साथ घर") : L(lang, " house plan", " घर का नक्शा")}`,
      sub: `${xi.bhk} BHK · G+1 · ${num(xi.builtUp)} sq ft · ${L(lang, "Vastu", "वास्तु")} ${xi.vastu.pct}%`,
      cost: lakh(xi.total, lang),
      img3d: nakshaPreview(x).src,
      img2d: nakshaImage(x),
    };
  };
  // one card per design (the East-facing plan links to the other directions), so no tab repeats the same rooms
  const pick = (f: (x: Naksha) => boolean, k = 6) => DESIGNS.filter(f).slice(0, k).map(card);
  const tabs = [
    { key: "2", label: "2 BHK", plans: pick((x) => nakshaInfo(x).bhk === 2 && x.kind === "house") },
    { key: "3", label: "3 BHK", plans: pick((x) => nakshaInfo(x).bhk === 3 && x.kind === "house") },
    { key: "4", label: "4 BHK", plans: pick((x) => nakshaInfo(x).bhk >= 4 && x.kind === "house") },
    { key: "shop", label: L(lang, "With shop", "दुकान के साथ"), plans: pick((x) => x.kind === "shop") },
  ].filter((x) => x.plans.length);

  const stats: [number, string][] = [
    [CALCULATORS.length, L(lang, "calculators", "कैलकुलेटर")],
    [items, L(lang, "BOQ items in every house", "हर घर में BOQ आइटम")],
    [DESIGNS.length, L(lang, "house designs", "घर के डिज़ाइन")],
    [CITIES.length, L(lang, "city rates", "शहरों के रेट")],
    [CHECKLIST_COUNT, L(lang, "site checks", "साइट जांच")],
  ];

  const who = [
    {
      t: L(lang, "House owners", "मकान मालिक"),
      d: L(lang, "Know the full cost before you start, pick a Vastu plan, and check what the contractor charges.", "शुरू करने से पहले पूरा खर्च जानें, वास्तु नक्शा चुनें, और ठेकेदार का रेट जांचें।"),
      href: langPath(lang, "house-construction-cost-calculator"),
      cta: L(lang, "Cost of my house", "मेरे घर का खर्च"),
      img: nakshaPreview(mosaic[1] ?? n).src,
    },
    {
      t: L(lang, "Contractors", "ठेकेदार"),
      d: L(lang, "Make a client quotation in minutes — item-wise, with your firm's name on the PDF.", "मिनटों में ग्राहक का कोटेशन — आइटम-वार, PDF पर आपकी फ़र्म के नाम के साथ।"),
      href: langPath(lang, "house-boq-estimate"),
      cta: L(lang, "Make a quotation", "कोटेशन बनाएं"),
      img: `/home/shots/pdf${hiSfx}.webp`,
    },
    {
      t: L(lang, "Engineers", "इंजीनियर"),
      d: L(lang, "BOQ, measurement book, steel BBS and Excel — and your AutoCAD plan read straight into the estimate.", "BOQ, मेज़रमेंट बुक, सरिया BBS और Excel — और आपका AutoCAD नक्शा सीधे एस्टिमेट में।"),
      href: langPath(lang, "plan-to-estimate"),
      cta: L(lang, "Plan → Estimate", "नक्शे से एस्टिमेट"),
      img: `/home/shots/bbs${hiSfx}.webp`,
    },
    {
      t: L(lang, "Students", "छात्र"),
      d: L(lang, "Every calculator shows its working step by step, the way it is done in an estimate.", "हर कैलकुलेटर पूरा हिसाब स्टेप-बाय-स्टेप दिखाता है, जैसे एस्टिमेट में होता है।"),
      href: langPath(lang, "calculators"),
      cta: L(lang, "All calculators", "सभी कैलकुलेटर"),
      img: `/home/shots/mb${hiSfx}.webp`,
    },
  ];

  const faqs = [
    [L(lang, "Is BOQFather free?", "क्या BOQFather फ़्री है?"), L(lang, "Yes. Every calculator, the item-wise BOQ, all house plans and the downloads are free. Pro adds clean reports with your name, reading plan photos and bills, and saved projects.", "हां। सारे कैलकुलेटर, आइटम-वार BOQ, सारे नक्शे और डाउनलोड फ़्री हैं। प्रो में आपके नाम के साथ बिना निशान रिपोर्ट, नक्शे और बिल की फ़ोटो पढ़ना, और सेव प्रोजेक्ट मिलते हैं।")],
    [L(lang, "How accurate is the estimate?", "एस्टिमेट कितना सही होता है?"), L(lang, "Each item is measured from the plan and priced at 2026 market rates for your city type. Your brand choices, soil and the structural design can change it — the rates are editable.", "हर आइटम नक्शे से नापा जाता है और आपके शहर के 2026 के बाज़ार रेट से जोड़ा जाता है। ब्रांड, मिट्टी और स्ट्रक्चर डिज़ाइन से फ़र्क़ आ सकता है — रेट बदले जा सकते हैं।")],
    [L(lang, "Can I use my own plan?", "क्या मैं अपना नक्शा इस्तेमाल कर सकता हूं?"), L(lang, "Yes — upload an AutoCAD DXF (free), or a photo or PDF of the plan (Pro), or type the rooms yourself.", "हां — AutoCAD DXF अपलोड करें (फ़्री), या नक्शे की फ़ोटो / PDF (प्रो), या कमरे ख़ुद भरें।")],
    [L(lang, "Are the house plans as per Vastu?", "क्या नक्शे वास्तु के अनुसार हैं?"), L(lang, "Each plan is set the way that suits Vastu best for its road side, with a room-by-room Vastu chart. Get the final drawing made by your architect.", "हर नक्शा सड़क की दिशा के हिसाब से वास्तु अनुसार रखा गया है, हर कमरे के वास्तु चार्ट के साथ। फ़ाइनल ड्रॉइंग अपने आर्किटेक्ट से बनवाएं।")],
    [L(lang, "Does it work in Hindi?", "क्या यह हिंदी में चलता है?"), L(lang, "Every page, tool and report is in Hindi and English.", "हर पेज, टूल और रिपोर्ट हिंदी और अंग्रेज़ी दोनों में है।")],
  ];

  const calcs = CALCULATORS.filter((c) => !["house-boq-estimate", "contractor-quote-checker"].includes(c.slug));
  const checks = CHECKLIST.slice(1, 4).map((s) => ({ stage: s.title[lang], p: s.points[0] }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: SITE_NAME,
        url: `${SITE_URL}${langPath(lang)}`,
        inLanguage: lang === "hi" ? "hi-IN" : "en-IN",
        description: d.home_sub,
      },
      { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/icon.svg` },
      {
        "@type": "WebApplication",
        name: `${SITE_NAME} house construction cost calculator`,
        url: SITE_URL,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
      },
    ],
  };

  return (
    <>
      <SiteHeader lang={lang} altPath={langPath(lang === "en" ? "hi" : "en")} />
      <main lang={lang} className="home-hoard overflow-x-clip bg-white">
        {/* hero: one clear promise, then four ways in */}
        <section className="relative bg-[#f5f5f5]">
          <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-12 sm:px-6 lg:pb-20 lg:pt-20">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
              <h1 className="font-hoard text-[38px] font-extrabold leading-[1.05] tracking-[-0.015em] text-ink [text-wrap:balance] sm:text-[58px]">
                {L(lang, "Know what your house will cost before you build it.", "घर बनाने से पहले जानिए कि उसका खर्च कितना आएगा।")}
              </h1>
              <p className="max-w-[36rem] text-[18px] leading-relaxed text-body">
                {L(lang, "Pick your plot size and see the plan, the front elevation and an item-wise cost. Free, no sign-up.", "अपना प्लॉट साइज़ चुनिए और नक्शा, फ़्रंट एलिवेशन और आइटम-वार खर्च देखिए। मुफ़्त, साइन-अप नहीं।")}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href={langPath(lang, "house-boq-estimate")} className="inline-flex h-14 items-center rounded-[4px] bg-amber px-8 text-[16px] font-bold text-white transition hover:bg-amber-dark">
                  {L(lang, "Start free estimate", "मुफ़्त एस्टिमेट शुरू करें")}
                </Link>
                <Link href={langPath(lang, "naksha")} className="inline-flex h-14 items-center rounded-[4px] border border-line bg-white px-7 text-[16px] font-bold text-ink transition hover:bg-ink hover:text-white">
                  {L(lang, "See house plans", "घर के नक्शे देखें")}
                </Link>
              </div>
            </div>
            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {heroCards.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white hover:shadow-[0_14px_32px_-14px_rgba(8,8,8,0.35)] transition hover:-translate-y-1">
                    <span className="block aspect-[4/3] overflow-hidden border-b border-line bg-[#f5f5f5]">
                      <img src={c.img} alt="" loading={c.eager ? "eager" : "lazy"} className={`h-full w-full ${c.fit} transition duration-500 group-hover:scale-[1.03]`} />
                    </span>
                    <span className="flex flex-1 flex-col gap-1 p-4 text-ink">
                      <span className="text-[18px] font-extrabold leading-snug">{c.t}</span>
                      <span className="text-[14px] leading-relaxed text-[#5a5a5a]">{c.d}</span>
                      <span className="mt-auto pt-2 text-[14px] font-bold underline decoration-amber decoration-2 underline-offset-4">{c.cta} →</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* proof: what is behind the numbers */}
        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-4 py-14 text-center sm:px-6 lg:py-16">
            <Reveal>
              <h2 className="font-display mx-auto max-w-3xl text-[26px] font-extrabold leading-[1.15] tracking-tight [text-wrap:balance] sm:text-[34px]">
                {L(lang, `Every figure comes from one ${items}-item BOQ engine, built on IS 456 and IS 1200 by a civil engineer`, `हर आंकड़ा एक ही ${items}-आइटम BOQ इंजन से आता है, जो एक सिविल इंजीनियर ने IS 456 और IS 1200 पर बनाया है`)}
              </h2>
            </Reveal>
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
              {stats.map(([v, k]) => (
                <div key={k}>
                  <dt className="font-display text-[40px] font-extrabold leading-none tabular-nums text-ink">
                    <CountUp to={v} />
                  </dt>
                  <dd className="mt-2 text-[14px] leading-snug text-muted">{k}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* first block: the live estimate */}
        <Split
          tint
          title={L(lang, "Pick a plot. Watch the cost change.", "प्लॉट चुनिए। खर्च बदलते देखिए।")}
          text={L(lang, "Choose a plot size and a finish and the plan, the front view and the cost update together. Open the full BOQ when you want every item.", "प्लॉट साइज़ और फ़िनिश चुनिए, तो नक्शा, फ़्रंट व्यू और खर्च साथ-साथ बदलते हैं। हर आइटम देखना हो तो पूरा BOQ खोलिए।")}
          points={[
            L(lang, "Ten common plot sizes, three finishes", "दस आम प्लॉट साइज़, तीन फ़िनिश"),
            L(lang, "Biggest cost heads shown as bars", "सबसे बड़े खर्च बार में दिखते हैं"),
            L(lang, "Free, no sign-up", "मुफ़्त, साइन-अप नहीं"),
          ]}
          ctas={<Link href={langPath(lang, "house-boq-estimate")} className={btnDark}>{L(lang, "Start free estimate", "मुफ़्त एस्टिमेट शुरू करें")}</Link>}
          visual={
            <LiveEstimate
              rows={liveRows}
              initial="30x40"
              labels={liveLabels}
            />
          }
        />

        <Split
          title={L(lang, "From naksha to front elevation", "नक्शे से फ़्रंट एलिवेशन तक")}
          text={L(lang, "Every plan is drawn to scale from the plot — walls, doors, stair and rooms — with its Vastu check, a front elevation and the full construction cost, so you can see the house and its price together.", "हर नक्शा प्लॉट से स्केल पर बनता है — दीवारें, दरवाज़े, सीढ़ी और कमरे — वास्तु जांच, फ़्रंट एलिवेशन और पूरे निर्माण खर्च के साथ, ताकि घर और उसकी कीमत साथ दिखे।")}
          points={[
            L(lang, "Ground and first floor, room sizes on every room", "ग्राउंड और पहली मंज़िल, हर कमरे पर साइज़"),
            L(lang, "Vastu chart for each room", "हर कमरे का वास्तु चार्ट"),
            L(lang, "Download the plan as PDF or image", "नक्शा PDF या इमेज में डाउनलोड"),
          ]}
          ctas={
            <>
              <Link href={langPath(lang, `naksha/${n.slug}`)} className={btnDark}>{L(lang, "Open a plan", "नक्शा खोलें")}</Link>
              <Link href={langPath(lang, "elevations")} className={btnLight}>{L(lang, "Browse elevations", "एलिवेशन देखें")}</Link>
              <Link href={langPath(lang, "naksha")} className={btnLight}>{L(lang, "All plans", "सभी नक्शे")}</Link>
            </>
          }
          visual={
            <div className="flex flex-col gap-3">
              <BeforeAfter
                before={<img src={nakshaImage(n)} alt="" className="absolute inset-0 h-full w-full bg-white object-contain p-3" />}
                after={<img src={nakshaPreview(n).src} alt="" className="absolute inset-0 h-full w-full object-cover" />}
                label={L(lang, "Drag to compare plan and elevation", "नक्शे और एलिवेशन की तुलना के लिए खींचें")}
              />
              <p className="text-center text-[13px] text-muted">{L(lang, "Plan ‹ drag › elevation", "नक्शा ‹ खींचें › एलिवेशन")}</p>
            </div>
          }
        />

        <Split
          title={L(lang, "Every rupee, item by item — not a guess per sq ft", "हर रुपये का हिसाब, आइटम-दर-आइटम — sq ft का अंदाज़ा नहीं")}
          text={L(lang, `From excavation to painting, each item is measured from the plan and priced at the market rate. For a ${n.plot.w}×${n.plot.d} G+1 that is ${lakh(info.total, lang)}:`, `खुदाई से पेंटिंग तक, हर आइटम नक्शे से नापा और बाज़ार रेट से जोड़ा जाता है। ${n.plot.w}×${n.plot.d} G+1 के लिए ये ${lakh(info.total, lang)} है:`)}
          points={[
            `${L(lang, "Cement", "सीमेंट")} ${num(mat("cement"))} ${L(lang, "bags", "बैग")} · ${L(lang, "steel", "सरिया")} ${num(mat("steel") / 1000, 1)} ${L(lang, "t", "टन")} · ${L(lang, "bricks", "ईंट")} ${num(mat("bricks"))}`,
            L(lang, "Measurement book (Nos × L × B × H) and steel BBS", "मेज़रमेंट बुक (Nos × L × B × H) और सरिया BBS"),
            L(lang, "Change any rate — every total updates", "कोई भी रेट बदलें — हर टोटल बदल जाएगा"),
          ]}
          ctas={
            <>
              <Link href={langPath(lang, "house-boq-estimate")} className={btnDark}>{L(lang, "Make my BOQ", "मेरा BOQ बनाएं")}</Link>
              <Link href={langPath(lang, "house-construction-cost")} className={btnLight}>{L(lang, "Cost by sq ft", "sq ft से खर्च")}</Link>
            </>
          }
          visual={<Shot src={`/home/shots/boq${hiSfx}.webp`} alt="BOQ" url={`${host}/house-boq-estimate`} />}
        />

        <Split
          title={L(lang, "Already have a plan? Upload it, get the estimate", "नक्शा पहले से है? अपलोड करें, एस्टिमेट पाएं")}
          text={L(lang, "AutoCAD DXF is read on your own device, free. A photo or PDF of the plan is read by AI on Pro. You check every room before it is used.", "AutoCAD DXF आपके डिवाइस पर ही पढ़ी जाती है, फ़्री। नक्शे की फ़ोटो या PDF प्रो में AI पढ़ता है। इस्तेमाल से पहले आप हर कमरा जांचते हैं।")}
          points={[
            L(lang, "Rooms and sizes read floor by floor", "कमरे और साइज़ मंज़िल-दर-मंज़िल पढ़े जाते हैं"),
            L(lang, "Opens straight in the BOQ tool", "सीधे BOQ टूल में खुलता है"),
          ]}
          ctas={<Link href={langPath(lang, "plan-to-estimate")} className={btnDark}>{L(lang, "Upload a plan", "नक्शा अपलोड करें")}</Link>}
          visual={
            <div className="grid grid-cols-2 gap-3">
              <div className="overflow-hidden rounded-lg border border-line bg-white p-2">
                <img src={nakshaImage(n)} alt={L(lang, "Your plan", "आपका नक्शा")} loading="lazy" className="aspect-square w-full object-contain [filter:grayscale(1)_contrast(1.1)]" />
                <p className="px-1 pt-1 text-[12px] font-semibold text-muted">{L(lang, "1 · Your plan", "1 · आपका नक्शा")}</p>
              </div>
              <div className="overflow-hidden rounded-lg border border-line bg-white p-2">
                <img src={`/home/shots/materials${hiSfx}.webp`} alt={L(lang, "Estimate", "एस्टिमेट")} loading="lazy" className="aspect-square w-full object-cover object-left-top" />
                <p className="px-1 pt-1 text-[12px] font-semibold text-muted">{L(lang, "2 · Estimate and purchase plan", "2 · एस्टिमेट और ख़रीद प्लान")}</p>
              </div>
            </div>
          }
        />

        <Split
          title={L(lang, "Check the contractor's rates before you sign", "साइन करने से पहले ठेकेदार का रेट जांचें")}
          text={L(lang, "Put each quoted rate next to the market rate for your city. Items charged well above it stand out, with the extra amount.", "हर रेट को अपने शहर के बाज़ार रेट के सामने रखें। बहुत ज़्यादा रेट वाले आइटम अलग दिखते हैं, ज़्यादा रकम के साथ।")}
          points={[
            L(lang, "14 questions to ask before signing", "साइन से पहले पूछने के 14 सवाल"),
            L(lang, `${CHECKLIST_COUNT} site checks, each with a video`, `${CHECKLIST_COUNT} साइट जांच, हर एक के साथ वीडियो`),
          ]}
          ctas={
            <>
              <Link href={langPath(lang, "contractor-quote-checker")} className={btnDark}>{L(lang, "Check a quote", "कोटेशन जांचें")}</Link>
              <Link href={langPath(lang, "house-construction-guide/checklist")} className={btnLight}>{L(lang, "Site checklist", "साइट चेकलिस्ट")}</Link>
            </>
          }
          visual={
            <ul className="flex flex-col gap-3">
              {checks.map((c) => (
                <li key={c.p.id} className="flex items-start gap-4 rounded-lg border border-line bg-white p-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber text-[13px] font-black">✓</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-bold uppercase tracking-wide text-muted">{c.stage}</span>
                    <span className="block text-[15px] font-semibold leading-snug">{c.p.t[lang]}</span>
                  </span>
                  <a href={ytUrl(c.p)} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="flex h-8 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e52d27] text-white">▶</a>
                </li>
              ))}
            </ul>
          }
        />

        {/* how every number is made: the trust block, in the same drawing-sheet language as the hero */}
        <section className="bg-[#f5f5f5]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <div className="overflow-hidden rounded-lg border border-line bg-white hover:shadow-[0_14px_32px_-14px_rgba(8,8,8,0.35)]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-white px-5 py-3 text-ink">
                <h2 className="font-hoard text-[22px] font-black leading-tight sm:text-[28px]">
                  {L(lang, "How every number is made", "हर आंकड़ा कैसे बनता है")}
                </h2>
                <Link href={langPath(lang, "about")} className="text-[14px] font-bold underline underline-offset-4">
                  {L(lang, "About BOQFather", "BOQFather के बारे में")}
                </Link>
              </div>
              <ul className="grid divide-y divide-line text-ink sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
                {[
                  {
                    h: L(lang, "Measured, not guessed", "नापकर, अंदाज़े से नहीं"),
                    p: L(lang, "56 items are taken off the drawn plan: walls, slabs, steel, finishes. Quantities follow IS 456 and IS 1200 practice.", "56 आइटम बने हुए नक्शे से निकाले जाते हैं: दीवार, स्लैब, स्टील, फिनिशिंग। मात्रा IS 456 और IS 1200 के तरीक़े से।"),
                  },
                  {
                    h: L(lang, "Every rate is yours to change", "हर रेट आप बदल सकते हैं"),
                    p: L(lang, "Start from mid-city market rates, then type your own contractor's rate. Every total updates.", "मध्यम शहर के बाज़ार रेट से शुरू करें, फिर अपने ठेकेदार का रेट डालें। हर टोटल बदल जाता है।"),
                  },
                  {
                    h: L(lang, "Working shown", "पूरा हिसाब दिखता है"),
                    p: L(lang, "Open any item to see its measurement. You can check the sum, or hand it to your engineer to check.", "किसी भी आइटम को खोलकर उसकी नाप देखें। आप हिसाब जाँच सकते हैं या अपने इंजीनियर से जँचवा सकते हैं।"),
                  },
                  {
                    h: L(lang, "Built by a civil engineer", "सिविल इंजीनियर ने बनाया"),
                    p: L(lang, "It is a planning estimate. Structural sizes and steel must be confirmed by your engineer before work starts.", "यह प्लानिंग एस्टिमेट है। काम शुरू होने से पहले स्ट्रक्चर साइज़ और स्टील आपके इंजीनियर से पक्का करवाएं।"),
                  },
                ].map((x) => (
                  <li key={x.h} className="flex flex-col gap-2 p-5">
                    <h3 className="text-[17px] font-extrabold leading-snug">{x.h}</h3>
                    <p className="text-[14px] leading-relaxed text-[#5a5a5a]">{x.p}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* what else is inside */}
        <section id="features" className="bg-[#f5f5f5]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <Reveal>
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="font-display text-[28px] font-extrabold leading-[1.12] tracking-tight [text-wrap:balance] sm:text-[36px]">
                  {L(lang, "Everything an estimate needs, in one place", "एस्टिमेट की हर ज़रूरत, एक जगह")}
                </h2>
                <p className="mt-4 text-[17px] leading-relaxed text-body">
                  {L(lang, "From the plan and its Vastu check to the quotation you hand to a client.", "नक्शे और उसकी वास्तु जांच से लेकर ग्राहक को देने वाले कोटेशन तक।")}
                </p>
              </div>
            </Reveal>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {feats.map((c) => (
                <li key={c.t}>
                  <Link href={c.href} className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white transition hover:-translate-y-1 hover:shadow-lg">
                    <span className="block aspect-[16/10] overflow-hidden bg-[#f0f0f0]">
                      <img src={c.img} alt="" loading="lazy" className={`h-full w-full ${c.fit} transition duration-500 group-hover:scale-[1.03]`} />
                    </span>
                    <span className="flex flex-1 flex-col gap-1.5 p-5">
                      <span className="font-display text-[19px] font-extrabold leading-snug">{c.t}</span>
                      <span className="text-[14px] leading-relaxed text-body">{c.d}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* plans by type */}
        <section className="bg-[#f5f5f5]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <h2 className="font-display mb-8 text-center text-[28px] font-extrabold tracking-tight sm:text-[36px]">
              {L(lang, "See house plans by type", "प्रकार के हिसाब से नक्शे देखें")}
            </h2>
            <PlanTabs lang={lang} tabs={tabs} allHref={langPath(lang, "naksha")} />
          </div>
        </section>

        {/* who it is for */}
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <h2 className="font-display text-center text-[28px] font-extrabold tracking-tight sm:text-[36px]">
              {L(lang, "Made for owners, contractors and engineers", "मकान मालिक, ठेकेदार और इंजीनियर के लिए")}
            </h2>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {who.map((w, i) => (
                <Reveal key={w.t} delay={i * 70}>
                  <li className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white transition hover:-translate-y-1 hover:shadow-lg">
                    <img src={w.img} alt="" loading="lazy" className="aspect-[4/3] w-full bg-[#f0f0f0] object-cover object-left-top" />
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <h3 className="font-display text-[20px] font-extrabold">{w.t}</h3>
                      <p className="text-[14px] leading-relaxed text-body">{w.d}</p>
                      <Link href={w.href} className="mt-auto pt-2 text-[15px] font-bold underline decoration-amber decoration-2 underline-offset-4">
                        {w.cta} →
                      </Link>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* call to action with a picture */}
        <section className="bg-ink text-white">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:py-16">
            <div className="flex flex-col items-start gap-5">
              <h2 className="font-display text-[28px] font-extrabold leading-tight [text-wrap:balance] sm:text-[38px]">
                {L(lang, "Plan the whole house — before you pay for a single brick", "पूरा घर प्लान करें — एक भी ईंट ख़रीदने से पहले")}
              </h2>
              <div className="flex flex-wrap gap-3">
                <Link href={langPath(lang, "house-boq-estimate")} className="inline-flex h-12 items-center rounded-[4px] bg-amber px-7 text-[15px] font-extrabold text-white hover:bg-amber-dark">
                  {L(lang, "Start free estimate", "मुफ़्त एस्टिमेट शुरू करें")}
                </Link>
                <Link href={langPath(lang, "pro")} className="inline-flex h-12 items-center rounded-[4px] border border-white/30 px-6 text-[15px] font-bold hover:border-white">
                  {L(lang, "See pricing", "प्राइसिंग देखें")}
                </Link>
              </div>
            </div>
            <img src={nakshaPreview(mosaic[0] ?? n).src} alt="" loading="lazy" className="aspect-[16/10] w-full rounded-lg object-cover" />
          </div>
        </section>

        {/* overview + mosaic */}
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <Reveal>
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="font-display text-[28px] font-extrabold leading-[1.12] tracking-tight [text-wrap:balance] sm:text-[36px]">
                  {L(lang, "Front elevations for every plot size", "हर प्लॉट साइज़ के लिए फ़्रंट एलिवेशन")}
                </h2>
                <p className="mt-4 text-[17px] leading-relaxed text-body">
                  {L(lang, "Pick the front you like, then see the plan it fits and what the whole house costs.", "वो फ़्रंट चुनिए जो पसंद आए, फिर देखिए कौन सा नक्शा उसमें बैठता है और पूरे घर का खर्च कितना आएगा।")}
                </p>
              </div>
            </Reveal>
            <ul className="mt-10 grid auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[190px] sm:grid-cols-4">
              {mosaic.slice(0, 9).map((x, i) => (
                <li key={x.slug} className={i === 0 ? "col-span-2 row-span-2" : ""}>
                  <Link href={langPath(lang, `naksha/${x.slug}`)} className="group relative block h-full overflow-hidden rounded-lg bg-[#f0f0f0]">
                    <img src={nakshaPreview(x).src} alt={nakshaTitle(x, lang)} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <span className="absolute bottom-2 left-2 rounded-[4px] bg-white/95 px-3 py-1 text-[12px] font-bold shadow">
                      {x.plot.w}×{x.plot.d} · {facing(x)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex justify-center">
              <Link href={langPath(lang, "elevations")} className={btnDark}>{L(lang, "Browse all elevations", "सभी एलिवेशन देखें")}</Link>
            </div>
          </div>
        </section>

        {/* calculators */}
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-display text-[28px] font-extrabold tracking-tight sm:text-[36px]">
                {L(lang, `${CALCULATORS.length} construction calculators`, `${CALCULATORS.length} कंस्ट्रक्शन कैलकुलेटर`)}
              </h2>
              <Link href={langPath(lang, "calculators")} className="text-[15px] font-bold underline decoration-amber decoration-2 underline-offset-4">
                {d.all_calculators} →
              </Link>
            </div>
            <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {calcs.map((c) => (
                <li key={c.slug}>
                  <Link href={langPath(lang, c.slug)} className="flex h-full items-center gap-4 rounded-lg border border-line bg-white p-4 transition hover:border-ink hover:shadow-md">
                    <span className="font-display flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-tint text-[16px] font-extrabold text-amber-dark">{c.mark}</span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-[16px] font-bold">{c[lang].name}</span>
                      <span className="truncate text-[13px] text-muted">{c[lang].short}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-[#f5f5f5]">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:py-20">
            <div className="flex min-w-0 flex-col gap-4">
              <h2 className="font-display text-[28px] font-extrabold tracking-tight sm:text-[36px]">{d.faq}</h2>
              <img src={nakshaPreview(mosaic[2] ?? n).src} alt="" loading="lazy" className="hidden aspect-[4/3] w-full rounded-lg object-cover lg:block" />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              {faqs.map(([q, a]) => (
                <details key={q} className="group rounded-lg border border-line bg-white px-5 py-4 open:shadow-sm">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-3 text-[16px] font-semibold [&::-webkit-details-marker]:hidden">
                    {q}
                    <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-tint text-[18px] transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 text-[15px] leading-relaxed text-body">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* closing */}
        <section className="bg-white">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-20 text-center sm:px-6">
            <span className="font-display flex h-16 w-16 items-center justify-center rounded-lg bg-amber text-[24px] font-extrabold text-white">BF</span>
            <h2 className="font-display text-[28px] font-extrabold tracking-tight sm:text-[40px]">
              {L(lang, "Plan your own house on BOQFather", "अपना घर BOQFather पर प्लान करें")}
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href={langPath(lang, "house-boq-estimate")} className="inline-flex h-14 items-center rounded-[4px] bg-amber px-8 text-[16px] font-extrabold text-white">
                {L(lang, "Make my estimate — free", "मेरा एस्टिमेट बनाएं — फ़्री")}
              </Link>
              <Link href={langPath(lang, "calculators")} className={btnLight}>{d.all_calculators}</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter lang={lang} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
