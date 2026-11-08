import Link from "next/link";
import { CALCULATORS } from "@/content/calculators";
import { CHECKLIST_COUNT } from "@/content/checklist";
import { CITIES } from "@/content/cities";
import {
  FACING_NAME,
  getNaksha,
  NAKSHE,
  nakshaImage,
  nakshaInfo,
  nakshaPlan,
  nakshaTitle,
} from "@/content/naksha";
import { nakshaPreview } from "@/content/nakshaPreview";
import { t } from "@/i18n/ui";
import { Lang, langPath, SITE_NAME, SITE_URL } from "@/lib/site";
import { SiteFooter, SiteHeader } from "../Chrome";
import { BoqShowcase } from "./cine/BoqShowcase";
import { BuildJourney, type StageInfo } from "./cine/BuildJourney";
import { CalcRail } from "./cine/CalcRail";
import { HeroCine } from "./cine/HeroCine";
import { PlansGallery } from "./cine/PlansGallery";
import { PlanToEstimate } from "./cine/PlanToEstimate";
import { Reports } from "./cine/Reports";
import { Reveal } from "./Motion";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);
const lakh = (x: number, lang: Lang) =>
  `₹${(x / 1e5).toLocaleString("en-IN", { maximumFractionDigits: 1 })} ${L(lang, "lakh", "लाख")}`;
const num = (x: number, d = 0) => x.toLocaleString("en-IN", { maximumFractionDigits: d });

/** The cinematic home page. Every number on it comes from the same engine as the tools. */
export function Cinematic({ lang }: { lang: Lang }) {
  const d = t(lang);
  const n = getNaksha("30x40-east-facing") ?? NAKSHE[0];
  const info = nakshaInfo(n);
  const { res } = nakshaPlan(n);
  const sec = (code: string) => res.sections.find((s) => s.code === code);
  const sub = (...codes: string[]) => codes.reduce((a, c) => a + (sec(c)?.subtotal ?? 0), 0);
  const items = res.sections.flatMap((s) => s.items);
  const qtyOf = (...keys: string[]) =>
    items.filter((i) => keys.includes(i.rateKey as string)).reduce((a, i) => a + i.qty, 0);
  const amtOf = (...keys: string[]) =>
    items.filter((i) => keys.includes(i.rateKey as string)).reduce((a, i) => a + i.amount, 0);
  const mat = (k: string) => res.materials.find((m) => m.key === k)?.qty ?? 0;
  const itemCount = items.length;
  const facing = L(lang, FACING_NAME[n.facing].en, FACING_NAME[n.facing].hi);
  const sample = L(
    lang,
    `Real Guniyo output for a ${n.plot.w}×${n.plot.d} ft ${facing.toLowerCase()} G+1 ${info.bhk}BHK, standard specification, mid-size city rates (2026).`,
    `${n.plot.w}×${n.plot.d} फ़ीट ${facing} G+1 ${info.bhk}BHK का असली Guniyo आउटपुट — स्टैंडर्ड स्पेसिफ़िकेशन, मध्यम शहर के रेट (2026)।`,
  );

  const stages: StageInfo[] = [
    {
      title: L(lang, "Empty plot", "खाली प्लॉट"),
      desc: L(lang, "Plot marked out with pegs and string. The plan sets where every column goes.", "खूंटी और डोरी से प्लॉट की मार्किंग। नक्शा तय करता है कि हर कॉलम कहां आएगा।"),
      facts: [
        { k: L(lang, "Plot", "प्लॉट"), v: `${n.plot.w} × ${n.plot.d} ft` },
        { k: L(lang, "Built-up G+1", "बिल्ट-अप G+1"), v: `${num(info.builtUp)} sq ft` },
      ],
      costSoFar: 0,
    },
    {
      title: L(lang, "Excavation", "खुदाई"),
      desc: L(lang, "Footing pits dug to 1.5 m, with working space on every side.", "फ़ुटिंग के गड्ढे 1.5 m गहरे, हर तरफ़ काम की जगह के साथ।"),
      facts: [
        { k: L(lang, "Earthwork", "खुदाई"), v: `${num(qtyOf("exc"), 1)} m³` },
        { k: L(lang, "Cost", "खर्च"), v: lakh(amtOf("exc"), lang) },
      ],
      costSoFar: amtOf("exc"),
    },
    {
      title: L(lang, "Foundation", "नींव"),
      desc: L(lang, "PCC bed, RCC footings, column starters, backfill and the plinth.", "PCC बेड, RCC फ़ुटिंग, कॉलम स्टार्टर, भराई और प्लिंथ।"),
      facts: [
        { k: "PCC", v: `${num(qtyOf("pcc"), 1)} m³` },
        { k: L(lang, "Section A", "भाग A"), v: lakh(sub("A"), lang) },
      ],
      costSoFar: sub("A"),
    },
    {
      title: L(lang, "RCC structure", "RCC ढांचा"),
      desc: L(lang, "Columns, beams and slabs in M20 concrete with Fe500D steel, floor by floor.", "M20 कंक्रीट और Fe500D सरिये से कॉलम, बीम और स्लैब, मंज़िल-दर-मंज़िल।"),
      facts: [
        { k: L(lang, "Concrete", "कंक्रीट"), v: `${num(mat("rcc"), 1)} m³` },
        { k: L(lang, "Steel", "सरिया"), v: `${num(mat("steel") / 1000, 1)} ${L(lang, "t", "टन")}` },
      ],
      costSoFar: sub("A", "B"),
    },
    {
      title: L(lang, "Brickwork", "ईंट की चिनाई"),
      desc: L(lang, "9-inch outer walls, 4½-inch partitions, lintels over every opening.", "9 इंच बाहरी दीवार, 4½ इंच पार्टीशन, हर खुली जगह पर लिंटल।"),
      facts: [
        { k: L(lang, "Bricks", "ईंट"), v: num(mat("bricks")) },
        { k: L(lang, "Section C", "भाग C"), v: lakh(sub("C"), lang) },
      ],
      costSoFar: sub("A", "B", "C"),
    },
    {
      title: L(lang, "Plaster & floors", "प्लास्टर और फ़र्श"),
      desc: L(lang, "Inside and outside plaster, ceiling, then tiles and waterproofing.", "अंदर-बाहर का प्लास्टर, छत, फिर टाइल और वॉटरप्रूफ़िंग।"),
      facts: [
        { k: L(lang, "Plaster", "प्लास्टर"), v: `${num(qtyOf("pl_int", "pl_ext", "pl_ceil", "pl_para"))} m²` },
        { k: L(lang, "Tiles", "टाइल"), v: `${num(mat("tiles"))} sq ft` },
      ],
      costSoFar: sub("A", "B", "C", "D", "E"),
    },
    {
      title: L(lang, "Finishing", "फ़िनिशिंग"),
      desc: L(lang, "Doors, windows, plumbing, the stair, wiring and two coats of paint.", "दरवाज़े, खिड़कियां, प्लंबिंग, सीढ़ी, वायरिंग और पेंट के दो कोट।"),
      facts: [
        { k: L(lang, "Doors & windows", "दरवाज़े-खिड़की"), v: lakh(sub("F"), lang) },
        { k: L(lang, "Paint", "पेंट"), v: `${num(qtyOf("p_int", "p_ext"))} m²` },
      ],
      costSoFar: res.itemsTotal,
    },
    {
      title: L(lang, "Your house", "आपका घर"),
      desc: L(lang, "Every item measured and priced — before the first brick was bought.", "हर आइटम नापा और जोड़ा गया — पहली ईंट ख़रीदने से पहले।"),
      facts: [
        { k: L(lang, "Total", "कुल"), v: lakh(res.grandTotal, lang) },
        { k: L(lang, "Per sq ft", "प्रति sq ft"), v: `₹${num(res.perSqft)}` },
      ],
      costSoFar: res.grandTotal,
    },
  ];

  const tiles = [
    { k: L(lang, "Cement", "सीमेंट"), v: Math.round(mat("cement")), unit: L(lang, "bags", "बैग") },
    { k: L(lang, "Steel", "सरिया"), v: Math.round(mat("steel")), unit: "kg" },
    { k: L(lang, "Bricks", "ईंट"), v: Math.round(mat("bricks")), unit: "" },
    { k: L(lang, "Sand", "रेत"), v: Math.round(mat("sand")), unit: "cft" },
    { k: L(lang, "Aggregate", "गिट्टी"), v: Math.round(mat("aggregate")), unit: "cft" },
    { k: L(lang, "RCC concrete", "RCC कंक्रीट"), v: mat("rcc"), unit: "m³", dec: 1 },
    { k: L(lang, "RCC cost", "RCC खर्च"), v: Math.round(sub("B")), unit: "", rupee: true },
    {
      k: L(lang, "Labour (≈30%)", "मज़दूरी (≈30%)"),
      v: Math.round(res.grandTotal * 0.3),
      unit: "",
      rupee: true,
      note: L(lang, "Thumb-rule share used by the house cost calculator; BOQ rates include labour.", "घर-खर्च कैलकुलेटर का अनुमानित हिस्सा; BOQ रेट में मज़दूरी शामिल है।"),
    },
  ];
  const rows = res.sections.map((s) => {
    const it = [...s.items].sort((a, b) => b.amount - a.amount)[0];
    return {
      code: it.code,
      desc: it.desc,
      qty: `${num(it.qty, it.dec ?? 2)} ${it.unit}`,
      rate: `₹${num(it.rate)}/${it.unit}`,
      amount: it.amount,
    };
  });

  const calcOrder = [
    "concrete-calculator",
    "steel-calculator",
    "brick-calculator",
    "plaster-calculator",
    "tile-calculator",
    "paint-calculator",
    "excavation-calculator",
    "construction-unit-converter",
    "house-construction-cost-calculator",
  ];
  const calcCards = calcOrder
    .map((slug) => CALCULATORS.find((c) => c.slug === slug)!)
    .filter(Boolean)
    .map((c) => ({
      slug: c.slug,
      href: langPath(lang, c.slug),
      name: c[lang].name,
      short: c[lang].short,
      intro: c[lang].intro,
    }));

  const tab = (key: string, label: string, title: string, points: string[]) => ({
    key,
    label,
    title,
    points,
    img: `/home/shots/${key}${lang === "hi" ? "-hi" : ""}.webp`,
    alt: `${label} — Guniyo`,
  });
  const tabs = [
    tab("boq", L(lang, "Item-wise BOQ", "आइटम-वार BOQ"), L(lang, `${itemCount} items, A to I`, `${itemCount} आइटम, A से I तक`), [
      L(lang, "Excavation to painting, each item priced at your city's rate.", "खुदाई से पेंटिंग तक, हर आइटम आपके शहर के रेट पर।"),
      L(lang, "Change any rate; every total follows.", "कोई भी रेट बदलें; हर टोटल अपने आप बदलेगा।"),
      L(lang, "SOR / DSR or your own rate set.", "SOR / DSR या अपने रेट।"),
    ]),
    tab("mb", L(lang, "Measurement Book", "मेज़रमेंट बुक"), L(lang, "Nos × L × B × H for every line", "हर लाइन का Nos × L × B × H"), [
      L(lang, "Every quantity traced back to its dimensions.", "हर मात्रा उसके नाप से जुड़ी।"),
      L(lang, "The basis of each item written out, IS 1200 style.", "हर आइटम का आधार लिखा हुआ, IS 1200 जैसा।"),
    ]),
    tab("bbs", L(lang, "Steel BBS", "सरिया BBS"), L(lang, "Bar bending schedule, member by member", "बार बेंडिंग शेड्यूल, हर मेंबर का"), [
      L(lang, "Footings, columns, beams, slabs and stair.", "फ़ुटिंग, कॉलम, बीम, स्लैब और सीढ़ी।"),
      L(lang, "Bar diameter, numbers, cutting length and kg.", "सरिये का साइज़, संख्या, कटिंग लंबाई और किलो।"),
    ]),
    tab("materials", L(lang, "Material list", "मटेरियल लिस्ट"), L(lang, "What to order, and when", "क्या मंगाना है, और कब"), [
      L(lang, "Cement, steel, sand, aggregate, bricks, tiles.", "सीमेंट, सरिया, रेत, गिट्टी, ईंट, टाइल।"),
      L(lang, "Stage-wise purchase plan and loan / EMI.", "स्टेज के हिसाब से ख़रीद और लोन / EMI।"),
    ]),
    tab("pdf", L(lang, "PDF report", "PDF रिपोर्ट"), L(lang, "Abstract and measurement book, ready to hand over", "एब्स्ट्रैक्ट और मेज़रमेंट बुक, देने लायक"), [
      L(lang, "With your firm's name on Pro.", "प्रो में आपकी फ़र्म के नाम के साथ।"),
      L(lang, "Plan sheet as PDF or image too.", "नक्शे की शीट भी PDF या इमेज में।"),
    ]),
    tab("excel", L(lang, "Excel export", "Excel एक्सपोर्ट"), L(lang, "The whole BOQ, editable", "पूरा BOQ, बदलने लायक"), [
      L(lang, "Abstract, measurement book and BBS sheets.", "एब्स्ट्रैक्ट, मेज़रमेंट बुक और BBS की शीट।"),
      L(lang, "Open in Excel or Google Sheets.", "Excel या Google Sheets में खोलें।"),
    ]),
  ];
  const extras = [
    { href: langPath(lang, "contractor-quote-checker"), tag: L(lang, "Quote check", "रेट जांच"), title: L(lang, "Contractor quote checker", "ठेकेदार रेट चेकर"), text: L(lang, "Each rate against the market; overcharges flagged.", "हर रेट बाज़ार से मिलाकर; ज़्यादा रेट पकड़ें।") },
    { href: langPath(lang, "house-construction-guide/checklist"), tag: L(lang, "Site checks", "साइट जांच"), title: L(lang, `${CHECKLIST_COUNT} site checks`, `${CHECKLIST_COUNT} साइट जांच`), text: L(lang, "Stage by stage, each with a video.", "स्टेज के हिसाब से, हर एक के साथ वीडियो।") },
    { href: langPath(lang, "house-construction-cost-in"), tag: L(lang, "Rates", "रेट"), title: L(lang, `${CITIES.length} city rates`, `${CITIES.length} शहरों के रेट`), text: L(lang, "Cost per sq ft and BOQ for your city.", "आपके शहर का प्रति sq ft खर्च और BOQ।") },
    { href: langPath(lang, "house-construction-guide"), tag: L(lang, "Guide", "गाइड"), title: L(lang, "House building guide", "घर बनाने की गाइड"), text: L(lang, "From buying the plot to moving in.", "प्लॉट ख़रीदने से गृह-प्रवेश तक।") },
  ];

  const plans = NAKSHE.map((x) => {
    const xi = nakshaInfo(x);
    return {
      slug: x.slug,
      href: langPath(lang, `naksha/${x.slug}`),
      size: `${x.plot.w}×${x.plot.d}`,
      facing: x.facing,
      facingLabel: L(lang, FACING_NAME[x.facing].en, FACING_NAME[x.facing].hi),
      bhk: xi.bhk,
      shop: x.kind === "shop",
      cost: lakh(xi.total, lang),
      img2d: nakshaImage(x),
      img3d: nakshaPreview(x).src,
      title: nakshaTitle(x, lang),
    };
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}${langPath(lang)}`,
    inLanguage: lang === "hi" ? "hi-IN" : "en-IN",
    description: d.home_sub,
  };

  return (
    <div className="bg-night">
      <SiteHeader lang={lang} altPath={langPath(lang === "en" ? "hi" : "en")} />
      <main lang={lang} className="-mt-16 overflow-x-clip">
        <HeroCine
          lang={lang}
          estimateHref={langPath(lang, "house-boq-estimate")}
          plansHref={langPath(lang, "naksha")}
          stats={[
            [String(CALCULATORS.length), L(lang, "Calculators", "कैलकुलेटर")],
            [String(itemCount), L(lang, "BOQ items", "BOQ आइटम")],
            [String(CITIES.length), L(lang, "City rates", "शहरों के रेट")],
            [String(NAKSHE.length), L(lang, "House plans", "घर के नक्शे")],
          ]}
        />
        <BuildJourney lang={lang} stages={stages} total={res.grandTotal} caption={sample} />
        <BoqShowcase
          lang={lang}
          total={res.grandTotal}
          perSqft={res.perSqft}
          builtUp={info.builtUp}
          tiles={tiles}
          rows={rows}
          items={itemCount}
          caption={sample}
          href={langPath(lang, "house-boq-estimate")}
        />
        <PlanToEstimate
          lang={lang}
          img2d={nakshaImage(n)}
          img3d={nakshaPreview(n).src}
          chips={[
            { k: L(lang, "Concrete", "कंक्रीट"), v: `${num(mat("rcc"), 1)} m³` },
            { k: L(lang, "Steel", "सरिया"), v: `${num(mat("steel"))} kg` },
            { k: L(lang, "Bricks", "ईंट"), v: num(mat("bricks")) },
            { k: L(lang, "Cement", "सीमेंट"), v: `${num(mat("cement"))} ${L(lang, "bags", "बैग")}` },
          ]}
          rows={["A", "B", "C", "D", "E"].map((c) => ({ k: `${c}. ${sec(c)?.title[lang] ?? ""}`, v: lakh(sub(c), lang) }))}
          href={langPath(lang, "plan-to-estimate")}
        />
        <CalcRail lang={lang} cards={calcCards} allHref={langPath(lang, "calculators")} />
        <Reports lang={lang} tabs={tabs} href={langPath(lang, "house-boq-estimate")} extras={extras} />
        <PlansGallery lang={lang} plans={plans} allHref={langPath(lang, "naksha")} boqHref={langPath(lang, "house-boq-estimate")} />

        {/* 08 — final call */}
        <section className="relative overflow-hidden bg-night px-5 py-20 text-white sm:px-8 sm:py-28">
          <img
            src="/home/hero-house.webp"
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,9,11,0.55)_0%,#08090b_75%)]" />
          <Reveal className="relative mx-auto max-w-5xl text-center">
            <h2 className="font-display text-[34px] font-black uppercase leading-[0.92] tracking-tight sm:text-[60px]">
              {L(lang, "Before you build.", "बनाने से पहले,")}
              <br />
              <span className="text-amber">{L(lang, "Know what it costs.", "खर्च जानिए।")}</span>
            </h2>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                href={langPath(lang, "house-boq-estimate")}
                className="inline-flex h-16 items-center rounded-full bg-amber px-9 text-[17px] font-extrabold uppercase tracking-wide text-white shadow-[0_0_60px_-10px_rgba(23,105,210,0.8)] transition hover:brightness-110"
              >
                {L(lang, "Start your house estimate", "अपना एस्टिमेट शुरू करें")}
              </Link>
              <Link
                href={langPath(lang, "calculators")}
                className="inline-flex h-16 items-center rounded-full border border-white/30 px-8 text-[17px] font-bold transition hover:border-white"
              >
                {L(lang, "All calculators", "सभी कैलकुलेटर")}
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter lang={lang} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
