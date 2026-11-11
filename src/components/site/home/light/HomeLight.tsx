import Link from "next/link";
import type { ReactNode } from "react";
import { CALCULATORS } from "@/content/calculators";
import { CHECKLIST_COUNT } from "@/content/checklist";
import { CITIES } from "@/content/cities";
import {
  DESIGNS,
  FACING_NAME,
  getNaksha,
  NAKSHE,
  nakshaImage,
  nakshaInfo,
  nakshaPlan,
} from "@/content/naksha";
import { nakshaPreview } from "@/content/nakshaPreview";
import { t } from "@/i18n/ui";
import { Lang, langPath, SITE_NAME, SITE_URL } from "@/lib/site";
import { SiteFooter, SiteHeader } from "../../Chrome";
import { BeforeAfter } from "../BeforeAfter";
import { Reveal } from "../Motion";
import { LiveEstimate, type LiveRow } from "./LiveEstimate";
import { HeroSlider, type HeroSlide } from "./HeroSlider";
import { Showcase, type ShowItem } from "./Showcase";
import { ElevationCarousel, type CarouselItem } from "./ElevationCarousel";
import { Newsletter } from "./Newsletter";
import { designOf, elevationForDesign, elevationImage, ELEVATIONS, groupOf } from "@/content/elevations";
import { getPlot, plotEstimate } from "@/content/plots";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);
const lakh = (x: number, lang: Lang) =>
  `₹${(x / 1e5).toLocaleString("en-IN", { maximumFractionDigits: 1 })} ${L(lang, "lakh", "लाख")}`;
const num = (x: number, d = 0) => x.toLocaleString("en-IN", { maximumFractionDigits: d });

const wrap = "mx-auto w-full max-w-[1240px] px-4 sm:px-6";
const btnDark =
  "inline-flex h-12 items-center rounded-[4px] bg-amber px-6 text-[15px] font-bold text-white transition hover:bg-amber-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber";
const btnLight =
  "inline-flex h-12 items-center rounded-[4px] border border-line bg-white px-6 text-[15px] font-bold text-ink transition hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber";
const link = "font-bold underline decoration-amber decoration-2 underline-offset-4 hover:text-amber-dark";

/** Section heading and its short text, each lifting in 70 ms after the one before. */
function Head({ title, text, center, children }: { title: string; text?: ReactNode; center?: boolean; children?: ReactNode }) {
  return (
    <div className={`flex flex-col gap-3 ${center ? "mx-auto max-w-3xl items-center text-center" : "max-w-2xl"}`}>
      <Reveal>
        <h2 className="font-display text-[28px] font-extrabold leading-[1.12] tracking-tight [text-wrap:balance] sm:text-[36px]">{title}</h2>
      </Reveal>
      {text && (
        <Reveal delay={70}>
          <p className="text-[17px] leading-relaxed text-body">{text}</p>
        </Reveal>
      )}
      {children && <Reveal delay={140}>{children}</Reveal>}
    </div>
  );
}

/** A real capture of the tool, cropped to the readable part (the wide ones scroll sideways on a phone). */
function Crop({ src, alt, w, h, min = 720 }: { src: string; alt: string; w: number; h: number; min?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} width={w} height={h} loading="lazy" draggable={false} className="block h-auto w-full" style={{ minWidth: min }} />
  );
}
const Caption = ({ children }: { children: ReactNode }) => (
  <p className="border-t border-line bg-[#f7f9fc] px-4 py-2 text-[12.5px] text-[#5a5a5a]">{children}</p>
);

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

/** Text on one side, a visual on the other; sides swap with `flip`. */
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
    <section id={id} className={tint ? "bg-[#f4f7fb]" : "bg-white"}>
      <div className={`${wrap} grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-20`}>
        <div className={`min-w-0 ${flip ? "lg:order-2" : ""}`}>
          <div className="flex flex-col gap-4">
            <Reveal>
              <h2 className="font-display text-[28px] font-extrabold leading-[1.12] tracking-tight [text-wrap:balance] sm:text-[36px]">{title}</h2>
            </Reveal>
            <Reveal delay={70}>
              <div className="text-[17px] leading-relaxed text-body">{text}</div>
            </Reveal>
            {points && (
              <Reveal delay={110}>
                <ul className="flex flex-col gap-2.5">{points.map((p, i) => <Tick key={i}>{p}</Tick>)}</ul>
              </Reveal>
            )}
            {ctas && (
              <Reveal delay={150}>
                <div className="mt-2 flex flex-wrap gap-3">{ctas}</div>
              </Reveal>
            )}
          </div>
        </div>
        <Reveal className="min-w-0" delay={100}>
          {visual}
        </Reveal>
      </div>
    </section>
  );
}

/** Home page: split hero with a manual elevation slider, product showcase, live estimate, reasons, gallery, tools, newsletter. */
export function HomeLight({ lang }: { lang: Lang }) {
  const d = t(lang);
  const n = getNaksha("30x40-east-facing") ?? NAKSHE[0];
  const info = nakshaInfo(n);
  const { res } = nakshaPlan(n);
  const hiSfx = lang === "hi" ? "-hi" : "";
  const boqHref = (p: NonNullable<ReturnType<typeof getPlot>>) =>
    `${langPath(lang, "house-boq-estimate")}?w=${p.w}&d=${p.d}&bhk=${p.bhk}&floors=2&front=${p.front}&back=${p.back}&side=${p.side}&facing=E`;
  const houseOf = (p: NonNullable<ReturnType<typeof getPlot>>) => DESIGNS.find((x) => x.plot === p && x.kind === "house")!;

  const liveRows: LiveRow[] = ["20x40", "20x50", "25x40", "25x50", "30x40", "30x50", "30x60", "40x50", "40x60", "50x80"].map((sz) => {
    const p = getPlot(sz)!;
    const house = houseOf(p);
    const q = {} as LiveRow["q"];
    let builtUp = 0;
    for (const k of ["basic", "standard", "premium"] as const) {
      const { res: r } = plotEstimate(p, 2, k);
      builtUp = r.geometry.builtUpSqft;
      q[k] = {
        total: r.grandTotal,
        perSqft: r.perSqft,
        stages: [...r.sections].sort((x, y) => y.subtotal - x.subtotal).slice(0, 6).map((x) => ({ t: x.title[lang].replace(/^[A-Z]\.\s*/, ""), v: x.subtotal })),
      };
    }
    return { slug: sz, w: p.w, d: p.d, bhk: p.bhk, builtUp, img: nakshaPreview(house).src, href: boqHref(p), q };
  });

  // hero: only elevation ↔ plot pairs that the elevation system itself defines
  const slides: HeroSlide[] = ["30x40", "40x60", "20x40", "25x50"].flatMap((sz) => {
    const p = getPlot(sz);
    if (!p) return [];
    const house = houseOf(p);
    const el = elevationForDesign(house);
    if (!el) return [];
    const { res: r } = plotEstimate(p, 2, "standard");
    return [
      {
        img: elevationImage(el),
        alt: L(lang, `${el.style.en}: front elevation of a ${p.w}×${p.d} ft house`, `${el.style.hi}: ${p.w}×${p.d} ft घर का फ़्रंट एलिवेशन`),
        style: el.style[lang],
        plot: `${p.w} × ${p.d} ft`,
        builtUp: `${num(r.geometry.builtUpSqft)} sq ft`,
        bhk: `${p.bhk} BHK G+1`,
        total: lakh(r.grandTotal, lang),
        perSqft: `₹${num(r.perSqft)}`,
        planHref: langPath(lang, `naksha/${house.slug}`),
        boqHref: boqHref(p),
      },
    ];
  });
  const heroLabels = {
    region: L(lang, "Sample elevations with their estimates", "एलिवेशन और उनके सैंपल एस्टिमेट"),
    prev: L(lang, "Previous elevation", "पिछला एलिवेशन"),
    next: L(lang, "Next elevation", "अगला एलिवेशन"),
    slide: L(lang, "{i} of {n}", "{i} / {n}"),
    plot: L(lang, "Plot size", "प्लॉट साइज़"),
    builtUp: L(lang, "Built-up area", "बिल्ट-अप एरिया"),
    finish: L(lang, "Finish", "फ़िनिश"),
    finishValue: L(lang, "Standard", "स्टैंडर्ड"),
    estimate: L(lang, "Sample estimate", "सैंपल एस्टिमेट"),
    perSqft: L(lang, "per sq ft", "प्रति sq ft"),
    sample: L(lang, "Sample estimate, mid-city rates, parking included", "सैंपल एस्टिमेट, मध्यम शहर के रेट, पार्किंग सहित"),
    openPlan: L(lang, "Open this plan", "यह नक्शा खोलें"),
    getBoq: L(lang, "Get full BOQ", "पूरा BOQ पाएं"),
  };

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
    cta: L(lang, "Get Full BOQ for {size}", "{size} का पूरा BOQ पाएं"),
    note: L(lang, "G+1 house with parking, mid-city rates. Sample estimate; the front view is an artist impression.", "G+1 घर, पार्किंग के साथ, मध्यम शहर के रेट। सैंपल एस्टिमेट; सामने का चित्र काल्पनिक है।"),
  };

  // "What you get": four real previews
  const elev30 = ELEVATIONS.find((x) => x.plot === "30x40");
  const showItems: ShowItem[] = [
    {
      key: "plans",
      label: L(lang, "House plans and elevations", "घर के नक्शे और एलिवेशन"),
      outcome: L(lang, "See the plan, the front and what it costs.", "नक्शा, फ़्रंट और उसका खर्च, एक साथ।"),
      cta: L(lang, "Explore house plans", "घर के नक्शे देखें"),
      href: langPath(lang, "naksha"),
      preview: (
        <div>
          <div className="overflow-x-auto">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={elev30 ? elevationImage(elev30) : nakshaPreview(n).src} alt={L(lang, "Front elevation of a 30×40 ft house", "30×40 ft घर का फ़्रंट एलिवेशन")} width={1600} height={833} loading="lazy" className="aspect-[2/1] w-full object-cover" />
              <div className="grid border-t border-line sm:grid-cols-[1.1fr_1fr]">
                <div className="relative h-[200px] bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={nakshaImage(n)} alt={L(lang, "30×40 ft East-facing floor plan with room sizes", "30×40 ft पूर्व-मुखी नक्शा, कमरों के साइज़ के साथ")} loading="lazy" className="absolute inset-0 h-full w-full object-contain p-2" />
                </div>
                <dl className="grid grid-cols-2 content-center gap-x-4 gap-y-3 border-t border-line p-5 text-[14px] sm:border-l sm:border-t-0">
                  <div><dt className="text-[#5a5a5a]">{L(lang, "Plot", "प्लॉट")}</dt><dd className="font-bold tabular-nums">30 × 40 ft</dd></div>
                  <div><dt className="text-[#5a5a5a]">{L(lang, "Rooms", "कमरे")}</dt><dd className="font-bold">{info.bhk} BHK · G+1</dd></div>
                  <div><dt className="text-[#5a5a5a]">{L(lang, "Built-up", "बिल्ट-अप")}</dt><dd className="font-bold tabular-nums">{num(info.builtUp)} sq ft</dd></div>
                  <div><dt className="text-[#5a5a5a]">{L(lang, "Vastu", "वास्तु")}</dt><dd className="font-bold tabular-nums">{info.vastu.pct}%</dd></div>
                  <div className="col-span-2"><dt className="text-[#5a5a5a]">{L(lang, "Sample estimate", "सैंपल एस्टिमेट")}</dt><dd className="font-bold tabular-nums text-amber-dark">{lakh(info.total, lang)}</dd></div>
                </dl>
              </div>
            </div>
          </div>
          <Caption>{L(lang, "East-facing 30×40 ft plan with its front elevation. Plans for all four road sides are on the plan page.", "पूर्व-मुखी 30×40 ft नक्शा और उसका फ़्रंट एलिवेशन। चारों सड़क दिशाओं के नक्शे नक्शे वाले पेज पर हैं।")}</Caption>
        </div>
      ),
    },
    {
      key: "boq",
      label: L(lang, "Item-wise BOQ", "आइटम-वार BOQ"),
      outcome: L(lang, "Every item with quantity, unit, rate and amount.", "हर आइटम, मात्रा, यूनिट, रेट और रकम के साथ।"),
      cta: L(lang, "Make my BOQ", "मेरा BOQ बनाएं"),
      href: langPath(lang, "house-boq-estimate"),
      preview: (
        <div>
          <div className="overflow-x-auto">
            <div style={{ minWidth: 720 }}>
              <Crop src={`/home/crops/boq-abstract${hiSfx}.webp`} alt={L(lang, "Abstract of cost: nine sections from earthwork to electrical and painting, with amounts", "लागत का सार: खुदाई से इलेक्ट्रिकल और पेंटिंग तक नौ सेक्शन, रकम के साथ")} w={1104} h={378} />
              <div className="border-t border-line">
                <Crop src={`/home/crops/boq-items${hiSfx}.webp`} alt={L(lang, "BOQ items with quantity, unit, editable rate and amount", "BOQ आइटम: मात्रा, यूनिट, बदलने वाला रेट और रकम")} w={1060} h={400} />
              </div>
            </div>
          </div>
          <Caption>{L(lang, "Screen from the BOQ tool, sample project. Every rate can be edited.", "BOQ टूल की स्क्रीन, सैंपल प्रोजेक्ट। हर रेट बदला जा सकता है।")}</Caption>
        </div>
      ),
    },
    {
      key: "reports",
      label: L(lang, "Material quantities and reports", "मटेरियल मात्रा और रिपोर्ट"),
      outcome: L(lang, "Know what to buy at each stage, then download it.", "हर स्टेज पर क्या ख़रीदना है जानें, और डाउनलोड करें।"),
      cta: L(lang, "See the reports", "रिपोर्ट देखें"),
      href: langPath(lang, "house-boq-estimate"),
      preview: (
        <div>
          <div className="overflow-x-auto">
            <div style={{ minWidth: 720 }}>
              <Crop src={`/home/crops/stages${hiSfx}.webp`} alt={L(lang, "Stage plan: items and the cement, sand, aggregate and steel to buy before each stage", "स्टेज प्लान: हर स्टेज से पहले ख़रीदने वाला सीमेंट, रेत, गिट्टी और सरिया")} w={1104} h={400} />
              <ul className="grid grid-cols-2 gap-3 border-t border-line bg-[#f7f9fc] p-4 sm:grid-cols-4">
                {[
                  ["MB", L(lang, "Measurement book", "मेज़रमेंट बुक"), "Nos × L × B × H"],
                  ["BBS", L(lang, "Steel schedule", "सरिया शेड्यूल"), L(lang, "Bar bending", "बार बेंडिंग")],
                  ["PDF", L(lang, "PDF report", "PDF रिपोर्ट"), L(lang, "Abstract + MB", "सार + MB")],
                  ["XLS", L(lang, "Excel download", "Excel डाउनलोड"), L(lang, "Keep working in your sheet", "अपनी शीट में काम करें")],
                ].map(([k, t1, t2]) => (
                  <li key={k} className="flex items-start gap-2.5 rounded-[10px] border border-line bg-white p-3">
                    <span aria-hidden="true" className="flex h-8 w-9 shrink-0 items-center justify-center rounded-[4px] bg-[#eaf3ff] text-[12px] font-extrabold text-amber-dark">{k}</span>
                    <span className="min-w-0 text-[13px] leading-snug"><b className="block text-[14px]">{t1}</b><span className="text-[#5a5a5a]">{t2}</span></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Caption>{L(lang, "Screens from the BOQ tool, sample project.", "BOQ टूल की स्क्रीन, सैंपल प्रोजेक्ट।")}</Caption>
        </div>
      ),
    },
    {
      key: "quote",
      label: L(lang, "Contractor quote checker", "ठेकेदार कोटेशन चेकर"),
      outcome: L(lang, "Put a contractor's rate next to the market rate.", "ठेकेदार का रेट बाज़ार रेट के सामने रखें।"),
      cta: L(lang, "Check a quote", "कोटेशन जांचें"),
      href: langPath(lang, "contractor-quote-checker"),
      preview: (
        <div>
          <div className="overflow-x-auto">
            <div style={{ minWidth: 720 }}>
              <Crop src={`/home/crops/quote${hiSfx}.webp`} alt={L(lang, "Quote checker: a ₹1,950 per sq ft quote against a ₹1,700 benchmark, slightly high", "कोटेशन चेकर: ₹1,950 प्रति sq ft का कोटेशन, ₹1,700 बेंचमार्क के सामने, थोड़ा ज़्यादा")} w={1300} h={639} />
              <div className="border-t border-line">
                <p className="px-5 pt-3 text-[14px] font-bold">{L(lang, "14 questions to ask before you sign", "साइन करने से पहले पूछने के 14 सवाल")}</p>
                <Crop src={`/home/crops/checks${hiSfx}.webp`} alt={L(lang, "Checklist: cement and steel brand, doors and windows material, plumbing brands, excavation depth", "चेकलिस्ट: सीमेंट और सरिया ब्रांड, दरवाज़े-खिड़की का मटीरियल, प्लंबिंग ब्रांड, खुदाई की गहराई")} w={1300} h={250} />
              </div>
            </div>
          </div>
          <Caption>{L(lang, "Screen from the quote checker, with an example quote.", "कोटेशन चेकर की स्क्रीन, एक उदाहरण कोटेशन के साथ।")}</Caption>
        </div>
      ),
    },
  ];

  // why choose: proofs built from the same engine and screens
  const topSections = [...res.sections].sort((a, b) => b.subtotal - a.subtotal).slice(0, 5);
  const topMax = topSections[0]?.subtotal ?? 1;
  const rateItems = res.sections[0].items.slice(0, 3);
  const linkedHref = langPath(lang, `naksha/${n.slug}`);

  // elevation gallery: one card per elevation, with the plan of the plot it was drawn for
  const carousel: CarouselItem[] = ELEVATIONS.flatMap((x) => {
    const des = designOf(x.plot);
    if (!des) return [];
    const di = nakshaInfo(des);
    return [
      {
        slug: x.slug,
        group: groupOf(x),
        href: langPath(lang, `elevations/${x.slug}`),
        planHref: langPath(lang, `naksha/${des.slug}`),
        front: elevationImage(x, true),
        plan: nakshaImage(des),
        style: x.style[lang],
        plot: `${des.plot.w}×${des.plot.d} ft${des.kind === "shop" ? L(lang, " + shop", " + दुकान") : ""}`,
        facing: `${L(lang, FACING_NAME[des.facing].en, FACING_NAME[des.facing].hi)} ${L(lang, "plan", "नक्शा")}`,
        meta: `${di.bhk} BHK · G+1 · ${num(di.builtUp)} sq ft`,
        cost: lakh(di.total, lang),
      },
    ];
  });
  const carouselLabels = {
    region: L(lang, "Front elevations", "फ़्रंट एलिवेशन"),
    prev: L(lang, "Scroll back", "पीछे"),
    next: L(lang, "Scroll forward", "आगे"),
    front: L(lang, "Front", "फ़्रंट"),
    plan: L(lang, "Plan", "नक्शा"),
    view: L(lang, "Show front elevation or plan", "फ़्रंट एलिवेशन या नक्शा दिखाएं"),
    filter: L(lang, "Filter by plot width", "प्लॉट की चौड़ाई से छांटें"),
    groups: {
      all: L(lang, "All", "सभी"),
      narrow: L(lang, "Up to 25 ft", "25 ft तक"),
      medium: L(lang, "26–35 ft", "26–35 ft"),
      wide: L(lang, "36 ft and wider", "36 ft और चौड़े"),
      shop: L(lang, "With shop", "दुकान के साथ"),
    },
    openElevation: L(lang, "View elevation", "एलिवेशन देखें"),
    openPlan: L(lang, "Plan and cost", "नक्शा और खर्च"),
    from: L(lang, "about", "लगभग"),
  };

  const steps = [
    L(lang, "Pick a plot or open an existing plan.", "प्लॉट चुनें या कोई बना हुआ नक्शा खोलें।"),
    L(lang, "Select the specification and review your estimate.", "फ़िनिश चुनें और अपना एस्टिमेट देखें।"),
    L(lang, "Open the detailed BOQ and use the report options.", "पूरा BOQ खोलें और रिपोर्ट के विकल्प इस्तेमाल करें।"),
  ];

  const paths = [
    {
      t: L(lang, "House owners", "मकान मालिक"),
      d: L(lang, "Know the full cost before you start and check what a contractor charges.", "शुरू करने से पहले पूरा खर्च जानें और ठेकेदार का रेट जांचें।"),
      href: langPath(lang, "house-construction-cost-calculator"),
      cta: L(lang, "Cost of my house", "मेरे घर का खर्च"),
    },
    {
      t: L(lang, "Contractors", "ठेकेदार"),
      d: L(lang, "Make an item-wise client quotation in minutes, as a PDF with your firm's name.", "मिनटों में आइटम-वार कोटेशन बनाएं, आपकी फ़र्म के नाम के साथ PDF में।"),
      href: langPath(lang, "house-boq-estimate"),
      cta: L(lang, "Make a quotation", "कोटेशन बनाएं"),
    },
    {
      t: L(lang, "Engineers", "इंजीनियर"),
      d: L(lang, "BOQ, measurement book, steel BBS and Excel, with an AutoCAD plan read straight into the estimate.", "BOQ, मेज़रमेंट बुक, सरिया BBS और Excel, और AutoCAD नक्शा सीधे एस्टिमेट में।"),
      href: langPath(lang, "plan-to-estimate"),
      cta: L(lang, "Plan → Estimate", "नक्शे से एस्टिमेट"),
    },
  ];
  const tools = [
    { href: langPath(lang, "house-construction-guide"), t: L(lang, "House construction guide", "घर बनाने की गाइड"), d: L(lang, `Stage by stage, with ${CHECKLIST_COUNT} site checks`, `स्टेज-दर-स्टेज, ${CHECKLIST_COUNT} साइट जांच के साथ`) },
    { href: langPath(lang, "calculators"), t: L(lang, `${CALCULATORS.length} calculators`, `${CALCULATORS.length} कैलकुलेटर`), d: L(lang, "Concrete, steel, bricks, paint and more, with the working shown", "कंक्रीट, सरिया, ईंट, पेंट और बहुत कुछ, पूरे हिसाब के साथ") },
    { href: langPath(lang, "contractor-quote-checker"), t: L(lang, "Contractor quote checker", "ठेकेदार कोटेशन चेकर"), d: L(lang, "Is a quoted rate fair for your city?", "क्या आपके शहर के लिए रेट सही है?") },
    { href: langPath(lang, "house-boq-estimate"), t: L(lang, "Downloadable reports", "डाउनलोड रिपोर्ट"), d: L(lang, "Excel, PDF with measurement book, steel BBS", "Excel, मेज़रमेंट बुक वाला PDF, सरिया BBS") },
    { href: langPath(lang, "house-construction-cost-in"), t: L(lang, `Rates for ${CITIES.length} cities`, `${CITIES.length} शहरों के रेट`), d: L(lang, "Cost levels set for your city", "आपके शहर के हिसाब से खर्च का स्तर") },
  ];

  const faqs = [
    [L(lang, "Is Guniyo free?", "क्या Guniyo फ़्री है?"), L(lang, "Yes. Every calculator, the item-wise BOQ, all house plans and the downloads are free. Pro adds clean reports with your name, reading plan photos and bills, and saved projects.", "हां। सारे कैलकुलेटर, आइटम-वार BOQ, सारे नक्शे और डाउनलोड फ़्री हैं। प्रो में आपके नाम के साथ बिना निशान रिपोर्ट, नक्शे और बिल की फ़ोटो पढ़ना, और सेव प्रोजेक्ट मिलते हैं।")],
    [L(lang, "How accurate is the estimate?", "एस्टिमेट कितना सही होता है?"), L(lang, "Each item is measured from the plan and priced at 2026 market rates for your city type. Your brand choices, soil and the structural design can change it. It is a planning estimate, so have your engineer confirm sizes and steel.", "हर आइटम नक्शे से नापा जाता है और आपके शहर के 2026 के बाज़ार रेट से जोड़ा जाता है। ब्रांड, मिट्टी और स्ट्रक्चर डिज़ाइन से फ़र्क़ आ सकता है। यह प्लानिंग एस्टिमेट है, इसलिए साइज़ और सरिया अपने इंजीनियर से पक्का करवाएं।")],
    [L(lang, "Can I change the rates?", "क्या मैं रेट बदल सकता हूं?"), L(lang, "Yes. Start from mid-city market rates and type your own contractor's rate for any item. Every total updates.", "हां। मध्यम शहर के बाज़ार रेट से शुरू करें और किसी भी आइटम में अपने ठेकेदार का रेट डालें। हर टोटल बदल जाता है।")],
    [L(lang, "Can I use my own plan?", "क्या मैं अपना नक्शा इस्तेमाल कर सकता हूं?"), L(lang, "Yes. Upload an AutoCAD DXF (free), or a photo or PDF of the plan (Pro), or type the rooms yourself.", "हां। AutoCAD DXF अपलोड करें (फ़्री), या नक्शे की फ़ोटो / PDF (प्रो), या कमरे ख़ुद भरें।")],
    [L(lang, "Are the house plans as per Vastu?", "क्या नक्शे वास्तु के अनुसार हैं?"), L(lang, "Each plan is set the way that suits Vastu best for its road side, with a room-by-room Vastu chart. Get the final drawing made by your architect.", "हर नक्शा सड़क की दिशा के हिसाब से वास्तु अनुसार रखा गया है, हर कमरे के वास्तु चार्ट के साथ। फ़ाइनल ड्रॉइंग अपने आर्किटेक्ट से बनवाएं।")],
    [L(lang, "Does it work in Hindi?", "क्या यह हिंदी में चलता है?"), L(lang, "Every page, tool and report is in Hindi and English.", "हर पेज, टूल और रिपोर्ट हिंदी और अंग्रेज़ी दोनों में है।")],
  ];

  const nlLabels = {
    title: L(lang, "Get practical house-building tips in your inbox.", "घर बनाने के काम के टिप्स सीधे अपने इनबॉक्स में पाएं।"),
    text: L(lang, "Site checklists, estimating tips and guidance for planning your house.", "साइट चेकलिस्ट, एस्टिमेट के टिप्स और घर प्लान करने की जानकारी।"),
    email: L(lang, "Email address", "ईमेल पता"),
    placeholder: "name@example.com",
    subscribe: L(lang, "Subscribe", "सब्सक्राइब करें"),
    sending: L(lang, "Subscribing…", "सब्सक्राइब हो रहा है…"),
    consent: L(lang, "I agree to get these emails. I can unsubscribe at any time from the link in each email. Your email is used only for this.", "मैं ये ईमेल पाने के लिए सहमत हूं। हर ईमेल के लिंक से मैं कभी भी सदस्यता बंद कर सकता हूं। आपका ईमेल सिर्फ़ इसी काम में आता है।"),
    privacy: L(lang, "Privacy policy", "प्राइवेसी पॉलिसी"),
    privacyHref: langPath(lang, "privacy"),
    success: L(lang, "You are subscribed. Thank you.", "आप सब्सक्राइब हो गए हैं। धन्यवाद।"),
    already: L(lang, "This email is already subscribed.", "यह ईमेल पहले से सब्सक्राइब है।"),
    invalid: L(lang, "Enter a valid email address.", "सही ईमेल पता डालें।"),
    failed: L(lang, "Could not subscribe right now. Please try again later.", "अभी सब्सक्राइब नहीं हो पाया। कृपया बाद में फिर कोशिश करें।"),
    consentNeeded: L(lang, "Tick the box to agree to get the emails.", "ईमेल पाने की सहमति के लिए बॉक्स पर टिक करें।"),
    off: L(lang, "Email sign-up is not open yet.", "ईमेल सब्सक्रिप्शन अभी शुरू नहीं हुआ है।"),
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: SITE_NAME, url: `${SITE_URL}${langPath(lang)}`, inLanguage: lang === "hi" ? "hi-IN" : "en-IN", description: d.home_sub },
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

  const reasons = [
    {
      t: L(lang, "See where the money goes", "देखिए पैसा कहां जाता है"),
      d: L(lang, "Review an item-wise breakdown, from excavation to finishes.", "खुदाई से फ़िनिशिंग तक, आइटम-वार हिसाब देखें।"),
      proof: (
        <div className="rounded-[10px] border border-line bg-white p-4">
          <p className="mb-3 text-[12.5px] font-semibold text-[#5a5a5a]">{L(lang, `Biggest cost heads · ${n.plot.w}×${n.plot.d} G+1, standard`, `सबसे बड़े खर्च · ${n.plot.w}×${n.plot.d} G+1, स्टैंडर्ड`)}</p>
          <ul className="flex flex-col gap-2.5">
            {topSections.map((x) => (
              <li key={x.code} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 text-[13px]">
                <span className="truncate">{x.title[lang].replace(/^[A-Z]\.\s*/, "")}</span>
                <span className="font-semibold tabular-nums">₹{num(x.subtotal / 1e5, 1)} {L(lang, "lakh", "लाख")}</span>
                <span className="col-span-2 h-[5px] bg-[#e8eef6]">
                  <span className="block h-full bg-amber" style={{ width: `${Math.max(4, (x.subtotal / topMax) * 100)}%` }} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      ),
      href: langPath(lang, "house-boq-estimate"),
      cta: L(lang, "See the BOQ", "BOQ देखें"),
    },
    {
      t: L(lang, "Work with your own rates", "अपने रेट से हिसाब लगाएं"),
      d: L(lang, "Edit the rates the tool supports and see every total update.", "टूल में बदले जा सकने वाले रेट बदलें और हर टोटल बदलते देखें।"),
      proof: (
        <div className="overflow-x-auto rounded-[10px] border border-line bg-white">
          <table className="w-full min-w-[420px] text-left text-[12.5px]">
            <thead>
              <tr className="bg-[#f4f7fb] text-[#5a5a5a]">
                <th className="px-3 py-2 font-semibold">{L(lang, "Item", "आइटम")}</th>
                <th className="px-2 py-2 text-right font-semibold">{L(lang, "Qty", "मात्रा")}</th>
                <th className="px-2 py-2 font-semibold">{L(lang, "Unit", "यूनिट")}</th>
                <th className="px-2 py-2 text-right font-semibold">{L(lang, "Rate (₹)", "रेट (₹)")}</th>
                <th className="px-3 py-2 text-right font-semibold">{L(lang, "Amount (₹)", "रकम (₹)")}</th>
              </tr>
            </thead>
            <tbody>
              {rateItems.map((it) => (
                <tr key={it.code} className="border-t border-line align-top">
                  <td className="px-3 py-2"><b className="text-amber-dark">{it.code}</b> {it.desc}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{num(it.qty, it.dec)}</td>
                  <td className="px-2 py-2">{it.unit}</td>
                  <td className="px-2 py-2 text-right"><span className="inline-block rounded-[4px] border border-[#b9d3fb] bg-[#f6f9ff] px-2 py-0.5 font-semibold tabular-nums">{num(it.rate)}</span></td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">{num(it.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
      href: langPath(lang, "house-boq-estimate"),
      cta: L(lang, "Try changing a rate", "रेट बदलकर देखें"),
    },
    {
      t: L(lang, "Compare plan, elevation and budget together", "नक्शा, एलिवेशन और बजट साथ में देखें"),
      d: L(lang, "Open a real project and see all three on one page.", "एक असली प्रोजेक्ट खोलें और तीनों एक ही पेज पर देखें।"),
      proof: (
        <Link href={linkedHref} className="group grid grid-cols-[1.4fr_1fr] overflow-hidden rounded-[10px] border border-line bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={nakshaPreview(n).src} alt={L(lang, "Front elevation of the 30×40 ft house", "30×40 ft घर का फ़्रंट एलिवेशन")} loading="lazy" className="aspect-[3/2] h-full w-full object-cover" />
          <span className="relative border-l border-line bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={nakshaImage(n)} alt={L(lang, "Its floor plan", "उसका नक्शा")} loading="lazy" className="absolute inset-0 h-full w-full object-contain p-2" />
          </span>
          <span className="col-span-2 flex flex-wrap items-baseline justify-between gap-2 border-t border-line bg-[#f4f7fb] px-4 py-2.5 text-[13px]">
            <b>{n.plot.w}×{n.plot.d} ft · {info.bhk} BHK · {num(info.builtUp)} sq ft</b>
            <span className="font-bold text-amber-dark">{lakh(info.total, lang)}</span>
          </span>
        </Link>
      ),
      href: linkedHref,
      cta: L(lang, "Open this project", "यह प्रोजेक्ट खोलें"),
    },
    {
      t: L(lang, "Take the estimate to site", "एस्टिमेट साइट तक ले जाएं"),
      d: L(lang, "Use the measurement book, steel BBS, PDF or Excel where the tool offers them.", "जहां टूल में मिले, मेज़रमेंट बुक, सरिया BBS, PDF या Excel इस्तेमाल करें।"),
      proof: (
        <ul className="grid grid-cols-2 gap-3">
          {[
            ["MB", L(lang, "Measurement book", "मेज़रमेंट बुक"), "Nos × L × B × H"],
            ["BBS", L(lang, "Steel BBS", "सरिया BBS"), L(lang, "Bar bending schedule", "बार बेंडिंग शेड्यूल")],
            ["PDF", L(lang, "PDF quotation", "PDF कोटेशन"), L(lang, "Abstract and measurement book", "सार और मेज़रमेंट बुक")],
            ["XLS", L(lang, "Excel download", "Excel डाउनलोड"), L(lang, "Take it into your own sheet", "अपनी शीट में ले जाएं")],
          ].map(([k, t1, t2]) => (
            <li key={k} className="flex items-start gap-2.5 rounded-[10px] border border-line bg-white p-3">
              <span aria-hidden="true" className="flex h-8 w-9 shrink-0 items-center justify-center rounded-[4px] bg-[#eaf3ff] text-[12px] font-extrabold text-amber-dark">{k}</span>
              <span className="min-w-0 text-[13px] leading-snug"><b className="block text-[14px]">{t1}</b><span className="text-[#5a5a5a]">{t2}</span></span>
            </li>
          ))}
        </ul>
      ),
      href: langPath(lang, "house-boq-estimate"),
      cta: L(lang, "See the downloads", "डाउनलोड देखें"),
    },
  ];

  return (
    <>
      <SiteHeader lang={lang} altPath={langPath(lang === "en" ? "hi" : "en")} />
      <main lang={lang} className="home-hoard overflow-x-clip bg-white">
        {/* hero: centred promise, then the real product in a window frame */}
        <section className="relative overflow-hidden bg-white">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[560px] [background:radial-gradient(60%_60%_at_50%_0%,#d6e6ff_0%,rgba(214,230,255,0)_100%)]" />
          <div className={`${wrap} relative flex flex-col items-center pb-14 pt-14 text-center sm:pt-20 lg:pb-20`}>
            <p className="rounded-full border border-[#c9dcfb] bg-white/80 px-4 py-1.5 text-[13.5px] font-semibold text-amber-dark">
              {L(lang, "House plans · Construction cost · Item-wise BOQ", "घर के नक्शे · निर्माण खर्च · आइटम-वार BOQ")}
            </p>
            <h1 className="font-hoard mt-6 max-w-4xl text-[38px] font-extrabold leading-[1.04] tracking-[-0.025em] text-ink [text-wrap:balance] sm:text-[58px] lg:text-[72px]">
              {L(lang, "The house cost studio for India.", "भारत के लिए घर के खर्च का स्टूडियो।")}
            </h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-body sm:text-[20px]">
              {L(lang, "Pick a plan, see the elevation, and get the quantities, rates and cost behind your estimate. Know the number before you build.", "नक्शा चुनिए, एलिवेशन देखिए, और अपने एस्टिमेट के पीछे की मात्रा, रेट और खर्च पाइए। बनाने से पहले आंकड़ा जानिए।")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href={langPath(lang, "house-boq-estimate")} className="inline-flex h-13 items-center rounded-full bg-ink px-8 py-3.5 text-[16px] font-bold text-white transition hover:bg-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber">
                {L(lang, "Start free estimate", "मुफ़्त एस्टिमेट शुरू करें")}
              </Link>
              <Link href={langPath(lang, "naksha")} className="inline-flex items-center rounded-full border border-[#cbd5e3] bg-white px-8 py-3.5 text-[16px] font-bold text-ink transition hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber">
                {L(lang, "Explore house plans", "घर के नक्शे देखें")}
              </Link>
            </div>
            <p className="mt-4 text-[14px] text-muted">{L(lang, "Free, no sign-up · In English and Hindi", "मुफ़्त, साइन-अप नहीं · हिंदी और अंग्रेज़ी में")}</p>

            <div className="mt-12 w-full max-w-5xl overflow-hidden rounded-[22px] border border-[#d5deeb] bg-white text-left shadow-[0_30px_80px_-30px_rgba(20,60,130,0.35)]">
              <div className="flex items-center gap-2 border-b border-[#e3e9f2] bg-[#f4f7fb] px-4 py-3">
                <span aria-hidden="true" className="h-3 w-3 rounded-full bg-[#ff6b5f]" />
                <span aria-hidden="true" className="h-3 w-3 rounded-full bg-[#ffc23d]" />
                <span aria-hidden="true" className="h-3 w-3 rounded-full bg-[#2bc84a]" />
                <span className="ml-3 truncate rounded-full bg-white px-4 py-1 text-[12.5px] font-semibold text-muted">guniyo.com · {L(lang, "Sample project", "सैंपल प्रोजेक्ट")}</span>
              </div>
              <div className="p-3 sm:p-5">
                <HeroSlider slides={slides} labels={heroLabels} />
              </div>
            </div>
          </div>
        </section>

        {/* three things you do */}
        <section className="bg-white">
          <div className={`${wrap} pb-6 pt-4 lg:pb-10`}>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-[30px] font-extrabold leading-[1.1] tracking-tight [text-wrap:balance] sm:text-[44px]">
                {L(lang, "Anyone can plan a house with numbers.", "कोई भी घर को आंकड़ों के साथ प्लान कर सकता है।")}
              </h2>
            </div>
            <ul className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                { k: "plan", t: L(lang, "Choose a plan", "नक्शा चुनिए"), d: L(lang, "Scaled house plans with a front elevation and a Vastu chart, for every common plot size.", "हर आम प्लॉट साइज़ के लिए नाप वाले नक्शे, फ़्रंट एलिवेशन और वास्तु चार्ट के साथ।"), href: langPath(lang, "naksha"), cta: L(lang, "Explore house plans", "घर के नक्शे देखें") },
                { k: "boq", t: L(lang, "Get the BOQ", "BOQ पाइए"), d: L(lang, "Every item with quantity, unit, rate and amount. Change any rate and watch the total move.", "हर आइटम मात्रा, यूनिट, रेट और रकम के साथ। कोई भी रेट बदलिए और टोटल बदलते देखिए।"), href: langPath(lang, "house-boq-estimate"), cta: L(lang, "Make my BOQ", "मेरा BOQ बनाएं") },
                { k: "quote", t: L(lang, "Check the quote", "कोटेशन जांचिए"), d: L(lang, "Set a contractor's rate beside the market rate before you sign anything.", "कुछ भी साइन करने से पहले ठेकेदार का रेट बाज़ार रेट के बगल में रखिए।"), href: langPath(lang, "contractor-quote-checker"), cta: L(lang, "Check a quote", "कोटेशन जांचें") },
              ].map((c) => (
                <li key={c.k} className="flex flex-col rounded-[24px] bg-[#f2f6fc] p-7 transition hover:bg-[#e8f0fb]">
                  <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-white">
                    {c.k === "plan" && (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16v16H4zM4 11h9M13 4v16M13 15h7" /></svg>)}
                    {c.k === "boq" && (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 3h14v18H5zM8 8h8M8 12h8M8 16h5" /></svg>)}
                    {c.k === "quote" && (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 12l5 5L20 6" /></svg>)}
                  </span>
                  <h3 className="mt-6 text-[24px] font-extrabold leading-tight">{c.t}</h3>
                  <p className="mt-2 text-[16px] leading-relaxed text-body">{c.d}</p>
                  <Link href={c.href} className="mt-6 inline-flex w-fit items-center rounded-full bg-white px-5 py-2.5 text-[15px] font-bold text-ink shadow-sm transition hover:bg-ink hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber">
                    {c.cta}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* numbers: only facts that are true of the site and its author */}
        <section className="bg-white">
          <div className={`${wrap} py-12 lg:py-16`}>
            <dl className="grid grid-cols-2 gap-y-10 text-center lg:grid-cols-4">
              {([
                [String(CALCULATORS.length), L(lang, "construction calculators", "निर्माण कैलकुलेटर")],
                [String(CITIES.length), L(lang, "city-wise rate pages", "शहर-वार रेट पेज")],
                ["14", L(lang, "stage house-building guide", "चरणों की गाइड")],
                [String(CHECKLIST_COUNT), L(lang, "point site checklist", "पॉइंट की साइट चेकलिस्ट")],
              ] as [string, string][]).map(([v, l]) => (
                <div key={l} className="flex flex-col items-center">
                  <dd className="order-1 font-hoard text-[56px] font-extrabold leading-none tracking-tight text-ink sm:text-[76px]">{v}</dd>
                  <dt className="order-2 mt-2 text-[15px] text-muted">{l}</dt>
                </div>
              ))}
            </dl>
            <p className="mx-auto mt-12 flex max-w-xl items-center justify-center gap-3 text-left text-[14px] leading-snug text-body">
              <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-[15px] font-extrabold text-white">KA</span>
              <span>
                <strong className="block text-[15px] text-ink">{L(lang, "Built by a civil engineer and valuer", "सिविल इंजीनियर और वैल्यूअर द्वारा बनाया गया")}</strong>
                {L(lang, "Kunal Alonkar · 12+ years · IIV member (Cat-I/F-7426)", "कुणाल अलोणकर · 12+ वर्ष · IIV सदस्य (Cat-I/F-7426)")}
              </span>
            </p>
          </div>
        </section>

        {/* what you get */}
        <section id="features" className="bg-white">
          <div className={`${wrap} py-16 lg:py-20`}>
            <Head
              title={L(lang, "What you get with Guniyo", "Guniyo में आपको क्या मिलता है")}
              text={L(lang, "Real screens from the tool, not mock-ups. Pick one to preview it.", "टूल की असली स्क्रीन, मॉक-अप नहीं। देखने के लिए एक चुनिए।")}
            />
            <div className="mt-9">
              <Showcase items={showItems} label={L(lang, "What you get", "आपको क्या मिलता है")} />
            </div>
          </div>
        </section>

        {/* live estimate */}
        <section id="live-estimate" className="bg-[#eef3fa]">
          <div className={`${wrap} py-16 lg:py-20`}>
            <Head
              title={L(lang, "Pick a plot. Watch the cost change.", "प्लॉट चुनिए। खर्च बदलते देखिए।")}
              text={L(lang, "Choose a plot size and a finish. The elevation, the cost breakdown and the link to the full BOQ change together.", "प्लॉट साइज़ और फ़िनिश चुनिए। एलिवेशन, खर्च का हिसाब और पूरे BOQ का लिंक साथ-साथ बदलते हैं।")}
            />
            <div className="mt-8">
              <LiveEstimate rows={liveRows} initial="30x40" labels={liveLabels} />
            </div>
            <Reveal>
              <ol aria-label={L(lang, "How it works", "यह कैसे काम करता है")} className="mt-10 grid gap-3 sm:grid-cols-3">
                {steps.map((s, i) => (
                  <li key={s} className="flex items-start gap-3 rounded-[10px] border border-line bg-white p-4">
                    <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber text-[14px] font-extrabold text-white">{i + 1}</span>
                    <span className="text-[15px] font-semibold leading-snug text-ink">{s}</span>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </section>

        {/* why choose */}
        <section className="bg-white">
          <div className={`${wrap} py-16 lg:py-20`}>
            <Head
              title={L(lang, "Why choose Guniyo?", "Guniyo क्यों चुनें?")}
              text={L(lang, "Four practical reasons, each with the output behind it.", "चार काम की वजहें, हर एक के पीछे का असली आउटपुट के साथ।")}
            >
              <Link href={langPath(lang, "about")} className={`text-[15px] ${link}`}>
                {L(lang, "How the estimate is calculated", "एस्टिमेट कैसे बनता है")}
              </Link>
            </Head>
            <ul className="mt-9 grid grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-2">
              {reasons.map((r, i) => (
                <li key={r.t} className="min-w-0">
                  <Reveal delay={(i % 2) * 70} className="h-full min-w-0">
                    <div className="flex h-full flex-col gap-4 rounded-[14px] border border-line bg-white p-5 sm:p-6">
                      <div>
                        <h3 className="font-display text-[20px] font-extrabold leading-snug">{r.t}</h3>
                        <p className="mt-1.5 text-[15px] leading-relaxed text-body">{r.d}</p>
                      </div>
                      {r.proof}
                      <Link href={r.href} className={`mt-auto text-[15px] ${link}`}>
                        {r.cta} →
                      </Link>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* elevation gallery */}
        <section className="bg-[#f4f7fb]">
          <div className={`${wrap} py-16 lg:py-20`}>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <Head
                title={L(lang, "Front elevations for every plot size", "हर प्लॉट साइज़ के लिए फ़्रंट एलिवेशन")}
                text={L(lang, "Each elevation was drawn for a plot size. Open it to see the plan it fits and what the whole house costs.", "हर एलिवेशन एक प्लॉट साइज़ के लिए बना है। खोलकर देखिए कौन सा नक्शा उसमें बैठता है और पूरे घर का खर्च कितना आएगा।")}
              />
              <Link href={langPath(lang, "elevations")} className={btnDark}>
                {L(lang, "Browse All Elevations", "सभी एलिवेशन देखें")}
              </Link>
            </div>
            <ElevationCarousel items={carousel} labels={carouselLabels} />
            <p className="mt-3 text-[12.5px] text-[#5a5a5a]">{L(lang, "Front views are artist impressions of the design, not photographs of built houses.", "फ़्रंट व्यू डिज़ाइन के काल्पनिक चित्र हैं, बने हुए घरों की फ़ोटो नहीं।")}</p>
          </div>
        </section>

        <Split
          title={L(lang, "From floor plan to front elevation", "फ़्लोर प्लान से फ़्रंट एलिवेशन तक")}
          text={L(lang, "Every plan is drawn to scale from the plot, with walls, doors, stair and room sizes, then paired with its front elevation and full construction cost.", "हर नक्शा प्लॉट से स्केल पर बनता है, दीवारें, दरवाज़े, सीढ़ी और कमरों के साइज़ के साथ, फिर उसके फ़्रंट एलिवेशन और पूरे निर्माण खर्च से जुड़ता है।")}
          points={[
            L(lang, "Ground and first floor, with sizes on every room", "ग्राउंड और पहली मंज़िल, हर कमरे पर साइज़"),
            L(lang, "A Vastu chart for each room", "हर कमरे का वास्तु चार्ट"),
            L(lang, "Download the plan as a PDF or image", "नक्शा PDF या इमेज में डाउनलोड"),
          ]}
          ctas={
            <>
              <Link href={langPath(lang, `naksha/${n.slug}`)} className={btnDark}>{L(lang, "Open this plan", "यह नक्शा खोलें")}</Link>
              <a href={nakshaImage(n)} target="_blank" rel="noopener noreferrer" className={btnLight}>{L(lang, "View the plan full size", "नक्शा पूरे साइज़ में देखें")}</a>
            </>
          }
          visual={
            <div className="flex flex-col gap-3">
              <BeforeAfter
                before={<img src={nakshaImage(n)} alt={L(lang, "30×40 ft floor plan", "30×40 ft नक्शा")} loading="lazy" className="absolute inset-0 h-full w-full bg-white object-contain p-3" />}
                after={<img src={nakshaPreview(n).src} alt={L(lang, "Front elevation of the same house", "उसी घर का फ़्रंट एलिवेशन")} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />}
                label={L(lang, "Compare plan and elevation (use arrow keys)", "नक्शे और एलिवेशन की तुलना (तीर वाली कुंजियां इस्तेमाल करें)")}
              />
              <p className="text-center text-[13px] text-muted">{L(lang, "Drag, or focus the handle and use the arrow keys", "खींचें, या हैंडल पर जाकर तीर वाली कुंजियां इस्तेमाल करें")}</p>
            </div>
          }
        />

        <Split
          tint
          flip
          title={L(lang, "Already have a plan?", "नक्शा पहले से है?")}
          text={L(lang, "Upload it and get the estimate. An AutoCAD DXF is read on your own device, free. A photo or PDF of the plan is read by AI on Pro. You check every room before it is used.", "अपलोड करें और एस्टिमेट पाएं। AutoCAD DXF आपके डिवाइस पर ही पढ़ी जाती है, फ़्री। नक्शे की फ़ोटो या PDF प्रो में AI पढ़ता है। इस्तेमाल से पहले आप हर कमरा जांचते हैं।")}
          points={[
            L(lang, "DXF is free; photo and PDF need Pro", "DXF फ़्री है; फ़ोटो और PDF के लिए प्रो चाहिए"),
            L(lang, "Rooms and sizes are read floor by floor", "कमरे और साइज़ मंज़िल-दर-मंज़िल पढ़े जाते हैं"),
            L(lang, "Opens straight in the BOQ tool", "सीधे BOQ टूल में खुलता है"),
          ]}
          ctas={<Link href={langPath(lang, "plan-to-estimate")} className={btnDark}>{L(lang, "Upload a plan", "नक्शा अपलोड करें")}</Link>}
          visual={
            <div className="grid items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr]">
              <div className="flex flex-col overflow-hidden rounded-[14px] border border-line bg-white p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={nakshaImage(n)} alt={L(lang, "A floor plan to upload", "अपलोड करने वाला नक्शा")} loading="lazy" className="aspect-square w-full object-contain" />
                <p className="pt-2 text-[13px] font-semibold text-muted">{L(lang, "Your plan", "आपका नक्शा")}</p>
              </div>
              <span aria-hidden="true" className="flex items-center justify-center text-[24px] text-amber sm:rotate-0">→</span>
              <div className="flex flex-col justify-between gap-3 rounded-[14px] border border-line bg-[#0f2440] p-5 text-white">
                <div>
                  <p className="text-[13px] font-semibold text-[#b8cdea]">{L(lang, "Estimate from this plan", "इस नक्शे से एस्टिमेट")}</p>
                  <p className="font-hoard mt-1 text-[38px] font-black leading-none tabular-nums">{lakh(info.total, lang)}</p>
                </div>
                <dl className="grid grid-cols-2 gap-2 text-[13px]">
                  <div className="rounded-lg bg-white/10 p-2.5"><dt className="text-[#b8cdea]">{L(lang, "Built-up", "बिल्ट-अप")}</dt><dd className="font-bold tabular-nums">{num(info.builtUp)} sq ft</dd></div>
                  <div className="rounded-lg bg-white/10 p-2.5"><dt className="text-[#b8cdea]">{L(lang, "BOQ items", "BOQ आइटम")}</dt><dd className="font-bold tabular-nums">{res.sections.reduce((a, s) => a + s.items.length, 0)}</dd></div>
                </dl>
                <p className="text-[12px] text-[#b8cdea]">{L(lang, "Sample from the 30×40 ft plan, standard finish", "30×40 ft नक्शे का सैंपल, स्टैंडर्ड फ़िनिश")}</p>
              </div>
            </div>
          }
        />

        {/* tools */}
        <section className="bg-white">
          <div className={`${wrap} py-16 lg:py-20`}>
            <Head title={L(lang, "Tools for every step", "हर कदम के लिए टूल")} text={L(lang, "Pick the path that matches your role, or go straight to a tool.", "अपनी भूमिका के हिसाब से रास्ता चुनिए, या सीधे किसी टूल पर जाइए।")} />
            <div className="mt-9 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
              <ul className="grid gap-3">
                {paths.map((p) => (
                  <li key={p.t}>
                    <Reveal>
                      <div className="flex flex-col gap-1.5 rounded-[14px] border border-line bg-white p-5 transition hover:border-ink">
                        <h3 className="font-display text-[19px] font-extrabold">{p.t}</h3>
                        <p className="text-[15px] leading-relaxed text-body">{p.d}</p>
                        <Link href={p.href} className={`pt-1 text-[15px] ${link}`}>{p.cta} →</Link>
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ul>
              <ul className="divide-y divide-line rounded-[14px] border border-line">
                {tools.map((x) => (
                  <li key={x.t}>
                    <Link href={x.href} className="group flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-[#f4f7fb] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-amber">
                      <span className="min-w-0">
                        <span className="block text-[16px] font-bold">{x.t}</span>
                        <span className="block text-[14px] leading-snug text-[#5a5a5a]">{x.d}</span>
                      </span>
                      <span aria-hidden="true" className="text-[18px] text-amber transition group-hover:translate-x-1">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-[#f4f7fb]">
          <div className={`${wrap} grid gap-8 py-16 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-14 lg:py-20`}>
            <Head title={d.faq} text={L(lang, "Straight answers about estimates, rates, plans and what is free.", "एस्टिमेट, रेट, नक्शे और क्या फ़्री है, इस पर सीधे जवाब।")} />
            <div className="flex min-w-0 flex-col gap-2">
              {faqs.map(([q, a]) => (
                <details key={q} className="group rounded-[10px] border border-line bg-white px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-3 text-[16px] font-semibold [&::-webkit-details-marker]:hidden">
                    {q}
                    <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eaf3ff] text-[18px] transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 text-[15px] leading-relaxed text-body">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <Newsletter enabled={process.env.NEXT_PUBLIC_NEWSLETTER_READY === "1"} labels={nlLabels} />

        {/* closing */}
        <section className="-mb-16 bg-[#eef3fa]">
          <div className={`${wrap} flex flex-col items-start justify-between gap-6 py-14 pb-[calc(3.5rem+4rem)] sm:flex-row sm:items-center sm:pb-[calc(3.5rem+4rem)]`}>
            <h2 className="font-display max-w-xl text-[28px] font-extrabold leading-tight [text-wrap:balance] sm:text-[36px]">
              {L(lang, "Plan the whole house before you pay for a single brick.", "एक भी ईंट ख़रीदने से पहले पूरा घर प्लान करें।")}
            </h2>
            <Link href={langPath(lang, "house-boq-estimate")} className="inline-flex h-14 shrink-0 items-center rounded-[4px] bg-amber px-8 text-[16px] font-extrabold text-white transition hover:bg-amber-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber">
              {L(lang, "Start Free Estimate", "मुफ़्त एस्टिमेट शुरू करें")}
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter lang={lang} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
