import Link from "next/link";
import type { ReactNode } from "react";
import { CALCULATORS } from "@/content/calculators";
import { CHECKLIST, CHECKLIST_COUNT, ytUrl } from "@/content/checklist";
import { CITIES } from "@/content/cities";
import {
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
  "inline-flex h-12 items-center rounded-full bg-ink px-6 text-[15px] font-bold text-white transition hover:bg-[#1d3352]";
const btnLight =
  "inline-flex h-12 items-center rounded-full border border-line bg-white px-6 text-[15px] font-bold text-ink transition hover:border-ink";

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
    <section id={id} className={tint ? "bg-[#f7fafe]" : "bg-white"}>
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
    <div className="overflow-hidden rounded-[16px] border border-line bg-white shadow-[0_30px_70px_-35px_rgba(22,24,26,0.45)]">
      <div className="flex items-center gap-2 border-b border-line bg-[#f7fafe] px-4 py-2.5">
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
  const host = "boqfather.vercel.app";
  const facing = (x: Naksha) => L(lang, FACING_NAME[x.facing].en, FACING_NAME[x.facing].hi);
  const card = (x: Naksha) => {
    const xi = nakshaInfo(x);
    return {
      href: langPath(lang, `naksha/${x.slug}`),
      title: `${x.plot.w}×${x.plot.d} ${facing(x)}`,
      sub: `${xi.bhk} BHK · G+1 · ${num(xi.builtUp)} sq ft · ${L(lang, "Vastu", "वास्तु")} ${xi.vastu.pct}%`,
      cost: lakh(xi.total, lang),
      img3d: nakshaPreview(x).src,
      img2d: nakshaImage(x),
    };
  };
  const pick = (f: (x: Naksha) => boolean, k = 6) => NAKSHE.filter(f).slice(0, k).map(card);
  const tabs = [
    { key: "2", label: "2 BHK", plans: pick((x) => nakshaInfo(x).bhk === 2 && x.kind === "house") },
    { key: "3", label: "3 BHK", plans: pick((x) => nakshaInfo(x).bhk === 3 && x.kind === "house" && x.facing === "E") },
    { key: "4", label: "4 BHK", plans: pick((x) => nakshaInfo(x).bhk >= 4 && x.kind === "house") },
    { key: "E", label: L(lang, "East facing", "पूर्व मुखी"), plans: pick((x) => x.facing === "E" && x.kind === "house" && x.plot.w >= 25) },
    { key: "N", label: L(lang, "North facing", "उत्तर मुखी"), plans: pick((x) => x.facing === "N" && x.kind === "house" && x.plot.w >= 25) },
    { key: "shop", label: L(lang, "With shop", "दुकान के साथ"), plans: pick((x) => x.kind === "shop") },
  ].filter((x) => x.plans.length);

  const mosaic = ["20x50-east-facing", "30x40-east-facing", "40x60-north-facing", "30x50-east-facing-shop", "25x50-west-facing", "30x60-south-facing", "40x50-east-facing", "20x40-north-facing", "35x50-west-facing"]
    .map((s) => getNaksha(s))
    .filter((x): x is Naksha => !!x);

  const stats: [number, string][] = [
    [CALCULATORS.length, L(lang, "calculators", "कैलकुलेटर")],
    [items, L(lang, "BOQ items per house", "BOQ आइटम हर घर में")],
    [NAKSHE.length, L(lang, "house plans, 2D + 3D", "घर के नक्शे, 2D + 3D")],
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
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}${langPath(lang)}`,
    inLanguage: lang === "hi" ? "hi-IN" : "en-IN",
    description: d.home_sub,
  };

  return (
    <>
      <SiteHeader lang={lang} altPath={langPath(lang === "en" ? "hi" : "en")} />
      <main lang={lang} className="overflow-x-clip bg-white">
        {/* hero */}
        <section className="relative bg-[linear-gradient(180deg,#eaf3ff_0%,#ffffff_70%)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(23,105,210,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(23,105,210,0.06)_1px,transparent_1px)] [background-size:40px_40px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:pb-20 lg:pt-16">
            <div className="flex min-w-0 flex-col gap-5">
              <span className="w-fit rounded-full border border-line bg-white px-3 py-1 text-[13px] font-semibold text-steel">
                {L(lang, "Construction planning · Quantity estimation · BOQ", "निर्माण प्लानिंग · मात्रा का हिसाब · BOQ")}
              </span>
              <h1 className="font-display text-[34px] font-extrabold leading-[1.08] tracking-[-0.02em] text-steel [text-wrap:balance] sm:text-[50px]">
                {L(lang, "Plan your house.", "घर का नक्शा बनाइए।")}
                <br />
                {L(lang, "Measure every detail.", "हर चीज़ का नाप लीजिए।")}
                <br />
                <span className="bg-gradient-to-r from-[#1769d2] to-[#3b82f6] bg-clip-text text-transparent">
                  {L(lang, "Know your construction cost.", "निर्माण का खर्च जानिए।")}
                </span>
              </h1>
              <p className="text-[18px] leading-relaxed text-body">
                {L(lang, "From architectural planning to quantity estimation and BOQ generation, manage your entire house construction journey in one place.", "नक्शे से लेकर मात्रा के हिसाब और BOQ तक, घर बनाने का पूरा काम एक ही जगह।")}
              </p>
              <ul className="flex flex-col gap-2.5">
                <Tick>{L(lang, "Start from your plot size, a ready Vastu plan, or your own drawing", "अपने प्लॉट साइज़, तैयार वास्तु नक्शे, या अपनी ड्रॉइंग से शुरू करें")}</Tick>
                <Tick>{L(lang, `Get an item-wise BOQ — ${items} items, steel BBS and material list`, `आइटम-वार BOQ पाएं — ${items} आइटम, सरिया BBS और मटेरियल लिस्ट`)}</Tick>
                <Tick>{L(lang, "See the plan in 2D and 3D, download PDF and Excel", "नक्शा 2D और 3D में देखें, PDF और Excel डाउनलोड करें")}</Tick>
              </ul>
              <div className="mt-1 flex flex-wrap gap-3">
                <Link href={langPath(lang, "house-boq-estimate")} className="inline-flex h-14 items-center rounded-full bg-amber px-7 text-[16px] font-extrabold text-white shadow-[0_10px_30px_-12px_rgba(23,105,210,0.7)] transition hover:brightness-105">
                  {L(lang, "Start free estimate", "मुफ़्त एस्टिमेट शुरू करें")}
                </Link>
                <Link href={langPath(lang, "naksha")} className="inline-flex h-14 items-center rounded-full border border-line bg-white px-6 text-[16px] font-bold transition hover:border-ink">
                  {L(lang, "Explore house plans", "घर के नक्शे देखें")}
                </Link>
              </div>
              <p className="text-[14px] text-muted">
                {L(lang, "No sign-up · IS 456 / IS 1200 based · made by a civil engineer", "साइन-अप नहीं · IS 456 / IS 1200 आधारित · सिविल इंजीनियर द्वारा")}
              </p>
            </div>
            {/* collage: a 3D plan, the BOQ on a phone, a floating cost card */}
            <div className="relative min-w-0">
              <div className="overflow-hidden rounded-[18px] border border-line bg-[#eef3f9] shadow-[0_40px_80px_-40px_rgba(22,24,26,0.45)]">
                <img src={nakshaPreview(n).src} alt={nakshaTitle(n, lang)} className="aspect-[16/10] w-full object-cover object-top" fetchPriority="high" />
              </div>
              <div className="absolute -bottom-8 -left-3 w-[38%] max-w-[205px] overflow-hidden rounded-[26px] border-[6px] border-ink bg-white shadow-2xl sm:-left-8">
                <img src={`/home/shots/boq${hiSfx}.webp`} alt={L(lang, "Item-wise BOQ on a phone", "फ़ोन पर आइटम-वार BOQ")} className="aspect-[9/16] w-full object-cover object-left-top" />
              </div>
              <div className="absolute -right-2 -top-5 rounded-2xl border border-line bg-white px-4 py-3 shadow-xl sm:-right-6">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{n.plot.w}×{n.plot.d} · G+1 {info.bhk}BHK</p>
                <p className="font-display text-[24px] font-extrabold leading-tight">{lakh(info.total, lang)}</p>
                <p className="text-[12px] text-muted">{L(lang, "full cost, standard finish", "पूरा खर्च, स्टैंडर्ड")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* numbers */}
        <section className="border-y border-line bg-[#f7fafe]">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-6 px-4 py-8 sm:px-6 md:grid-cols-5">
            {stats.map(([v, k]) => (
              <div key={k} className="flex flex-col items-center text-center">
                <span className="font-display text-[32px] font-extrabold leading-none sm:text-[38px]">
                  <CountUp to={v} />
                </span>
                <span className="mt-1.5 text-[14px] text-muted">{k}</span>
              </div>
            ))}
          </div>
        </section>

        {/* overview + mosaic */}
        <section id="features" className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <Reveal>
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="font-display text-[28px] font-extrabold leading-[1.12] tracking-tight [text-wrap:balance] sm:text-[36px]">
                  {L(lang, "One place for the whole house: plan it, measure it, price it", "पूरे घर के लिए एक जगह: नक्शा, नाप और खर्च")}
                </h2>
                <p className="mt-4 text-[17px] leading-relaxed text-body">
                  {L(lang, "Ready plans for every common plot size and road side, each with its full estimate. Change anything and the numbers follow.", "हर आम प्लॉट साइज़ और दिशा के तैयार नक्शे, हर एक का पूरा एस्टिमेट। कुछ भी बदलें, नंबर अपने आप बदलेंगे।")}
                </p>
              </div>
            </Reveal>
            <ul className="mt-10 grid auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[190px] sm:grid-cols-4">
              {mosaic.slice(0, 9).map((x, i) => (
                <li key={x.slug} className={i === 0 ? "col-span-2 row-span-2" : ""}>
                  <Link href={langPath(lang, `naksha/${x.slug}`)} className="group relative block h-full overflow-hidden rounded-2xl bg-[#eef3f9]">
                    <img src={nakshaPreview(x).src} alt={nakshaTitle(x, lang)} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-3 py-1 text-[12px] font-bold shadow">
                      {x.plot.w}×{x.plot.d} · {facing(x)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Split
          tint
          title={L(lang, "See your naksha come to life in 3D", "अपना नक्शा 3D में बनता देखिए")}
          text={L(lang, "Every plan is drawn to scale from the plot — walls, doors, stair and furniture — and shown in 3D on the plot with its road, garden and parking.", "हर नक्शा प्लॉट से स्केल पर बनता है — दीवारें, दरवाज़े, सीढ़ी और फ़र्नीचर — और 3D में सड़क, बगीचे और पार्किंग के साथ प्लॉट पर दिखता है।")}
          points={[
            L(lang, "Ground and first floor, room sizes on every room", "ग्राउंड और पहली मंज़िल, हर कमरे पर साइज़"),
            L(lang, "Vastu chart for each room", "हर कमरे का वास्तु चार्ट"),
            L(lang, "Download the plan as PDF or image", "नक्शा PDF या इमेज में डाउनलोड"),
          ]}
          ctas={
            <>
              <Link href={langPath(lang, `naksha/${n.slug}`)} className={btnDark}>{L(lang, "Open a plan in 3D", "नक्शा 3D में खोलें")}</Link>
              <Link href={langPath(lang, "naksha")} className={btnLight}>{L(lang, "All plans", "सभी नक्शे")}</Link>
            </>
          }
          visual={
            <div className="flex flex-col gap-3">
              <BeforeAfter
                before={<img src={nakshaImage(n)} alt="" className="absolute inset-0 h-full w-full bg-white object-contain p-3" />}
                after={<img src={nakshaPreview(n).src} alt="" className="absolute inset-0 h-full w-full object-cover" />}
                label={L(lang, "Drag to compare 2D and 3D", "2D और 3D की तुलना के लिए खींचें")}
              />
              <p className="text-center text-[13px] text-muted">{L(lang, "2D plan ‹ drag › 3D view", "2D नक्शा ‹ खींचें › 3D व्यू")}</p>
            </div>
          }
        />

        <Split
          flip
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
          tint
          title={L(lang, "Already have a plan? Upload it, get the estimate", "नक्शा पहले से है? अपलोड करें, एस्टिमेट पाएं")}
          text={L(lang, "AutoCAD DXF is read on your own device, free. A photo or PDF of the plan is read by AI on Pro. You check every room before it is used.", "AutoCAD DXF आपके डिवाइस पर ही पढ़ी जाती है, फ़्री। नक्शे की फ़ोटो या PDF प्रो में AI पढ़ता है। इस्तेमाल से पहले आप हर कमरा जांचते हैं।")}
          points={[
            L(lang, "Rooms and sizes read floor by floor", "कमरे और साइज़ मंज़िल-दर-मंज़िल पढ़े जाते हैं"),
            L(lang, "Opens straight in the BOQ tool", "सीधे BOQ टूल में खुलता है"),
          ]}
          ctas={<Link href={langPath(lang, "plan-to-estimate")} className={btnDark}>{L(lang, "Upload a plan", "नक्शा अपलोड करें")}</Link>}
          visual={
            <div className="grid grid-cols-2 gap-3">
              <div className="overflow-hidden rounded-2xl border border-line bg-white p-2">
                <img src={nakshaImage(n)} alt={L(lang, "Your plan", "आपका नक्शा")} loading="lazy" className="aspect-square w-full object-contain [filter:grayscale(1)_contrast(1.1)]" />
                <p className="px-1 pt-1 text-[12px] font-semibold text-muted">{L(lang, "1 · Your plan", "1 · आपका नक्शा")}</p>
              </div>
              <div className="overflow-hidden rounded-2xl border border-line bg-white p-2">
                <img src={`/home/shots/materials${hiSfx}.webp`} alt={L(lang, "Estimate", "एस्टिमेट")} loading="lazy" className="aspect-square w-full object-cover object-left-top" />
                <p className="px-1 pt-1 text-[12px] font-semibold text-muted">{L(lang, "2 · Estimate and purchase plan", "2 · एस्टिमेट और ख़रीद प्लान")}</p>
              </div>
            </div>
          }
        />

        <Split
          flip
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
                <li key={c.p.id} className="flex items-start gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm">
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

        {/* band */}
        <section className="bg-ink text-white">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-14 text-center sm:px-6">
            <h2 className="font-display max-w-3xl text-[28px] font-extrabold leading-tight [text-wrap:balance] sm:text-[36px]">
              {L(lang, "Plan the whole house — before you pay for a single brick", "पूरा घर प्लान करें — एक भी ईंट ख़रीदने से पहले")}
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href={langPath(lang, "house-boq-estimate")} className="inline-flex h-12 items-center rounded-full bg-amber px-7 text-[15px] font-extrabold text-white">
                {L(lang, "Start free estimate", "मुफ़्त एस्टिमेट शुरू करें")}
              </Link>
              <Link href={langPath(lang, "pro")} className="inline-flex h-12 items-center rounded-full border border-white/30 px-6 text-[15px] font-bold hover:border-white">
                {L(lang, "See pricing", "प्राइसिंग देखें")}
              </Link>
            </div>
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
                  <li className="flex h-full flex-col overflow-hidden rounded-[16px] border border-line bg-white transition hover:-translate-y-1 hover:shadow-lg">
                    <img src={w.img} alt="" loading="lazy" className="aspect-[4/3] w-full bg-[#eef3f9] object-cover object-left-top" />
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

        {/* plans by type */}
        <section className="bg-[#f7fafe]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <h2 className="font-display mb-8 text-center text-[28px] font-extrabold tracking-tight sm:text-[36px]">
              {L(lang, "See house plans by type", "प्रकार के हिसाब से नक्शे देखें")}
            </h2>
            <PlanTabs lang={lang} tabs={tabs} allHref={langPath(lang, "naksha")} />
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
                  <Link href={langPath(lang, c.slug)} className="flex h-full items-center gap-4 rounded-2xl border border-line bg-white p-4 transition hover:border-ink hover:shadow-md">
                    <span className="font-display flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-tint text-[16px] font-extrabold text-amber-dark">{c.mark}</span>
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
        <section className="bg-[#f7fafe]">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:py-20">
            <div className="flex min-w-0 flex-col gap-4">
              <h2 className="font-display text-[28px] font-extrabold tracking-tight sm:text-[36px]">{d.faq}</h2>
              <img src={nakshaPreview(mosaic[2] ?? n).src} alt="" loading="lazy" className="hidden aspect-[4/3] w-full rounded-[16px] object-cover lg:block" />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              {faqs.map(([q, a]) => (
                <details key={q} className="group rounded-2xl border border-line bg-white px-5 py-4 open:shadow-sm">
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
            <span className="font-display flex h-16 w-16 items-center justify-center rounded-2xl bg-amber text-[24px] font-extrabold text-white">BF</span>
            <h2 className="font-display text-[28px] font-extrabold tracking-tight sm:text-[40px]">
              {L(lang, "Plan your own house on BOQFather", "अपना घर BOQFather पर प्लान करें")}
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href={langPath(lang, "house-boq-estimate")} className="inline-flex h-14 items-center rounded-full bg-amber px-8 text-[16px] font-extrabold text-white">
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
