import Link from "next/link";
import type { ReactNode } from "react";
import { BOQ_RATES, ROOM_DEFS, verdictFor, type RoomType } from "@/engine";
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
} from "@/content/naksha";
import { PLOTS } from "@/content/plots";
import { t } from "@/i18n/ui";
import { Lang, langPath, SITE_NAME, SITE_URL } from "@/lib/site";
import { SiteFooter, SiteHeader } from "../Chrome";
import HeroQuick from "../HeroQuick";
import { BeforeAfter } from "./BeforeAfter";
import { HeroDemo } from "./HeroDemo";
import { CountUp, Reveal } from "./Motion";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);
const lakh = (x: number, lang: Lang) =>
  `₹${(x / 1e5).toLocaleString("en-IN", { maximumFractionDigits: 1 })} ${L(lang, "lakh", "लाख")}`;

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-amber-dark">
      {children}
    </span>
  );
}
function Check({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3 text-[16px] leading-relaxed text-body">
      <span
        aria-hidden="true"
        className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-amber"
      >
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}
function Feature({
  eyebrow,
  title,
  text,
  points,
  link,
  visual,
  flip,
}: {
  eyebrow: string;
  title: string;
  text: string;
  points: string[];
  link: { href: string; label: string };
  visual: ReactNode;
  flip?: boolean;
}) {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24">
      <Reveal className={`min-w-0 ${flip ? "lg:order-2" : ""}`}>
        <div className="flex flex-col gap-4">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="font-display text-[30px] font-extrabold leading-[1.1] tracking-tight text-balance sm:text-[40px]">
            {title}
          </h2>
          <p className="max-w-xl text-[17px] leading-relaxed text-body">
            {text}
          </p>
          <ul className="flex flex-col gap-2.5">
            {points.map((p) => (
              <Check key={p}>{p}</Check>
            ))}
          </ul>
          <Link
            href={link.href}
            className="group mt-2 inline-flex w-fit items-center gap-2 text-[16px] font-bold text-ink underline decoration-amber decoration-2 underline-offset-[6px] hover:decoration-ink"
          >
            {link.label}
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </Reveal>
      <Reveal className="min-w-0" delay={120}>
        {visual}
      </Reveal>
    </section>
  );
}

export function HomeV2({ lang }: { lang: Lang }) {
  const d = t(lang);
  const n = getNaksha("30x40-east-facing") ?? NAKSHE[0];
  const info = nakshaInfo(n);
  const { res } = nakshaPlan(n);
  const mat = (k: string) => res.materials.find((m) => m.key === k)?.qty ?? 0;
  const facing = L(lang, FACING_NAME[n.facing].en, FACING_NAME[n.facing].hi);
  const sections = res.sections.filter((s) => s.subtotal > 0);
  const topSections = [...sections]
    .sort((a, b) => b.subtotal - a.subtotal)
    .slice(0, 6);
  const maxSec = topSections[0]?.subtotal ?? 1;
  const items = res.sections.reduce((a, s) => a + s.items.length, 0);

  const gallery = [
    "20x50-east-facing",
    "30x40-north-facing",
    "25x50-west-facing",
    "30x50-east-facing",
    "30x60-south-facing",
    "40x60-north-facing",
    "20x40-east-facing",
    "50x80-east-facing",
  ]
    .map((s) => getNaksha(s))
    .filter((x): x is NonNullable<typeof x> => !!x);

  // contractor bill example: market rate vs a quoted rate
  const bill = [
    {
      item: L(lang, "RCC M20 (slab, beams)", "RCC M20 (स्लैब, बीम)"),
      unit: "m³",
      market: BOQ_RATES.rcc,
      quoted: Math.round(BOQ_RATES.rcc * 1.05),
    },
    {
      item: L(lang, "Steel Fe500 with labour", "सरिया Fe500 मज़दूरी सहित"),
      unit: "kg",
      market: BOQ_RATES.steel,
      quoted: Math.round(BOQ_RATES.steel * 1.28),
    },
    {
      item: L(lang, "Brick masonry 9\"", "ईंट की चिनाई 9\""),
      unit: "m³",
      market: BOQ_RATES.brick,
      quoted: Math.round(BOQ_RATES.brick * 0.98),
    },
    {
      item: L(lang, "Vitrified tiles laid", "विट्रिफ़ाइड टाइल लगाई"),
      unit: "m²",
      market: BOQ_RATES.vit,
      quoted: Math.round(BOQ_RATES.vit * 1.17),
    },
  ].map((r) => ({ ...r, diff: ((r.quoted - r.market) / r.market) * 100 }));
  const verdictText = (v: ReturnType<typeof verdictFor>) =>
    lang === "hi"
      ? {
          too_low: "बहुत कम",
          good: "अच्छा",
          fair: "सही",
          slightly_high: "थोड़ा ज़्यादा",
          high: "ज़्यादा",
        }[v]
      : {
          too_low: "too low",
          good: "good",
          fair: "fair",
          slightly_high: "slightly high",
          high: "high",
        }[v];
  const tone = (diff: number) =>
    diff > 20
      ? "bg-[#fbe9e5] text-[#a8321f]"
      : diff > 10
        ? "bg-warn-tint text-warn"
        : "bg-[#e8f4ec] text-[#1d7a46]";

  const checkSample = CHECKLIST.slice(1, 5).map((st) => ({
    stage: st.title[lang],
    point: st.points[0],
  }));

  const stats: [number, string][] = [
    [NAKSHE.length, L(lang, "Vastu nakshe", "वास्तु नक्शे")],
    [PLOTS.length, L(lang, "plot sizes", "प्लॉट साइज़")],
    [CITIES.length, L(lang, "city rates", "शहरों के रेट")],
    [items, L(lang, "BOQ items per house", "BOQ आइटम हर घर में")],
    [CHECKLIST_COUNT, L(lang, "site checks with videos", "साइट जांच, वीडियो के साथ")],
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}${langPath(lang)}`,
    inLanguage: lang === "hi" ? "hi-IN" : "en-IN",
    description: d.home_sub,
  };

  const planPhoto = (
    <div className="absolute inset-0 flex items-center justify-center bg-[#d9d2c3] p-6">
      <div className="h-full w-full rotate-[-2.5deg] overflow-hidden rounded-sm bg-white p-2 shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
        <img
          src={nakshaImage(n)}
          alt=""
          className="h-full w-full object-contain [filter:grayscale(1)_contrast(1.15)_sepia(0.25)_brightness(0.97)]"
          loading="lazy"
        />
      </div>
      <span className="absolute left-4 top-4 rounded-full bg-ink/85 px-3 py-1 text-[12px] font-bold text-white">
        {L(lang, "Your plan photo", "आपके नक्शे की फ़ोटो")}
      </span>
    </div>
  );
  const planRead = (
    <div className="absolute inset-0 flex flex-col items-end gap-3 bg-[#faf8f4] py-5 pl-[44%] pr-4 sm:pr-6">
      <span className="absolute right-4 top-4 rounded-full bg-amber px-3 py-1 text-[12px] font-bold text-ink">
        {L(lang, "Estimate", "एस्टिमेट")}
      </span>
      <div className="mt-8 flex w-full flex-col gap-1.5 text-[12px] sm:text-[13px]">
        {res.sketch
          .flatMap((s) => s.rects)
          .filter((r) =>
            ["hall", "kitchen", "dining", "bedroom", "toilet", "parking"].includes(
              r.type,
            ),
          )
          .slice(0, 5)
          .map((r, i) => (
            <span
              key={i}
              className="flex justify-between gap-2 rounded-lg border border-line bg-white px-2.5 py-1.5"
            >
              <span className="font-semibold capitalize">
                {r.type in ROOM_DEFS
                  ? ROOM_DEFS[r.type as RoomType].name[lang]
                      .replace(" / living", "")
                      .replace(" / bath", "")
                      .replace(" / लिविंग", "")
                      .replace(" / बाथ", "")
                  : r.type}
              </span>
              <span className="tabular-nums text-muted">
                {(r.w * 3.28084).toFixed(1)}×{(r.h * 3.28084).toFixed(1)}
              </span>
            </span>
          ))}
      </div>
      <div className="mt-auto w-full rounded-2xl bg-ink p-4 text-white">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-amber">
          {L(lang, "Item-wise BOQ", "आइटम-वार BOQ")} · {items}{" "}
          {L(lang, "items", "आइटम")}
        </div>
        <div className="font-display text-[24px] font-extrabold sm:text-[28px]">
          {lakh(info.total, lang)}
        </div>
        <div className="text-[12px] text-[#cfcbc2]">
          {L(lang, "Steel", "सरिया")}{" "}
          {(mat("steel") / 1000).toLocaleString("en-IN", {
            maximumFractionDigits: 1,
          })}{" "}
          {L(lang, "t", "टन")} · {L(lang, "Cement", "सीमेंट")}{" "}
          {Math.round(mat("cement")).toLocaleString("en-IN")}{" "}
          {L(lang, "bags", "बैग")}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <SiteHeader lang={lang} altPath={langPath(lang === "en" ? "hi" : "en")} />
      <main lang={lang} className="overflow-x-clip">
        {/* ---------- hero ---------- */}
        <section className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(22,24,26,0.07)_1px,transparent_0)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-20">
            <div className="flex min-w-0 flex-col gap-6">
              <span className="w-fit rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] font-semibold text-body shadow-sm">
                <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#1d7a46]" />
                {L(
                  lang,
                  "Built by a civil engineer · IS 456 / IS 1200",
                  "सिविल इंजीनियर द्वारा · IS 456 / IS 1200 आधारित",
                )}
              </span>
              <h1 className="font-display text-[42px] font-extrabold leading-[1.02] tracking-tight text-balance sm:text-[62px]">
                {L(lang, "See your whole house ", "घर बनाने से पहले, ")}
                <span className="relative whitespace-nowrap">
                  <span className="relative z-10">
                    {L(lang, "before you build", "पूरा घर देख लीजिए")}
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-1 z-0 h-3 rounded bg-amber/60 sm:h-4"
                  />
                </span>
              </h1>
              <p className="max-w-xl text-[18px] leading-relaxed text-body">
                {L(
                  lang,
                  "Enter your plot size. Get a to-scale Vastu naksha, an item-wise BOQ, the steel and materials, and the full cost — in two minutes, free.",
                  "प्लॉट का साइज़ डालिए। स्केल पर वास्तु नक्शा, आइटम-वार BOQ, सरिया और मटेरियल, और पूरा खर्च — 2 मिनट में, मुफ़्त।",
                )}
              </p>
              <ul className="flex flex-col gap-2">
                <Check>
                  {L(
                    lang,
                    `${NAKSHE.length} nakshe — every common size and facing`,
                    `${NAKSHE.length} नक्शे — हर आम साइज़ और दिशा`,
                  )}
                </Check>
                <Check>
                  {L(
                    lang,
                    "Every item measured: cement, steel, bricks, tiles, labour",
                    "हर आइटम का नाप: सीमेंट, सरिया, ईंट, टाइल, मज़दूरी",
                  )}
                </Check>
                <Check>
                  {L(
                    lang,
                    "PDF and Excel to hand over — in Hindi and English",
                    "PDF और Excel, देने लायक — हिंदी और अंग्रेज़ी में",
                  )}
                </Check>
              </ul>
              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href={langPath(lang, "house-boq-estimate")}
                  className="inline-flex h-14 items-center rounded-2xl bg-ink px-7 text-[17px] font-bold text-white shadow-[0_10px_30px_-10px_rgba(22,24,26,0.6)] transition hover:-translate-y-0.5"
                >
                  {L(lang, "Make my plan & cost →", "मेरा नक्शा और खर्च बनाएं →")}
                </Link>
                <Link
                  href={langPath(lang, "naksha")}
                  className="inline-flex h-14 items-center rounded-2xl border-2 border-ink bg-white px-6 text-[17px] font-bold transition hover:bg-ink hover:text-white"
                >
                  {L(lang, "See nakshe", "नक्शे देखें")}
                </Link>
              </div>
            </div>
            <HeroDemo
              lang={lang}
              img={nakshaImage(n)}
              w={n.plot.w}
              d={n.plot.d}
              bhk={info.bhk}
              facing={facing}
              total={info.total}
              vastu={info.vastu.pct}
              steelT={mat("steel") / 1000}
              cement={Math.round(mat("cement"))}
            />
          </div>
        </section>

        {/* ---------- numbers ---------- */}
        <section className="border-y border-line bg-white">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-6 px-4 py-8 sm:px-6 md:grid-cols-5">
            {stats.map(([v, label]) => (
              <div key={label} className="flex flex-col items-center text-center">
                <span className="font-display text-[34px] font-extrabold tracking-tight sm:text-[40px]">
                  <CountUp to={v} />
                </span>
                <span className="text-[13px] font-semibold text-muted">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- features ---------- */}
        <Feature
          eyebrow={L(lang, "Naksha", "नक्शा")}
          title={L(
            lang,
            "A real naksha, to scale — not a picture from the internet",
            "असली नक्शा, स्केल पर — इंटरनेट की फ़ोटो नहीं",
          )}
          text={L(
            lang,
            "Every plan is drawn from the plot size with walls, columns, doors, stair and furniture in their true sizes, then set the way Vastu prefers for the road side.",
            "हर नक्शा प्लॉट के साइज़ से बनता है — दीवारें, कॉलम, दरवाज़े, सीढ़ी और फ़र्नीचर असली साइज़ में, फिर सड़क की दिशा के हिसाब से वास्तु अनुसार।",
          )}
          points={[
            L(lang, "Ground and first floor, same outline, stair on stair", "ग्राउंड और पहली मंज़िल, एक ही आउटलाइन, सीढ़ी के ऊपर सीढ़ी"),
            L(lang, "Vastu chart for every room", "हर कमरे का वास्तु चार्ट"),
            L(lang, "Download as PDF or image", "PDF या इमेज में डाउनलोड"),
          ]}
          link={{
            href: langPath(lang, "naksha"),
            label: L(lang, `See all ${NAKSHE.length} nakshe`, `सभी ${NAKSHE.length} नक्शे देखें`),
          }}
          visual={
            <div className="group relative [perspective:1600px]">
              <div className="rounded-[24px] border border-line bg-white p-3 shadow-[0_30px_70px_-30px_rgba(22,24,26,0.45)] transition duration-700 [transform:rotateX(14deg)_rotateZ(-3deg)] group-hover:[transform:none]">
                <img
                  src={nakshaImage(n)}
                  alt={nakshaTitle(n, lang)}
                  width={1054}
                  height={911}
                  loading="lazy"
                  className="h-auto w-full rounded-xl"
                />
              </div>
              <span className="absolute -bottom-4 right-6 rounded-full bg-ink px-4 py-2 text-[13px] font-bold text-white shadow-lg">
                {n.plot.w}×{n.plot.d} · {facing} · {lakh(info.total, lang)}
              </span>
            </div>
          }
        />

        <div className="bg-white">
          <Feature
            flip
            eyebrow={L(lang, "Item-wise BOQ", "आइटम-वार BOQ")}
            title={L(
              lang,
              "Every rupee, item by item",
              "हर रुपये का हिसाब, आइटम-दर-आइटम",
            )}
            text={L(
              lang,
              "Not a rough rate per sq ft. Excavation to painting, each item is measured from the plan — Nos × L × B × H — and priced at the market rate. Change any rate and the total follows.",
              "प्रति sq ft का अंदाज़ा नहीं। खुदाई से पेंटिंग तक, हर आइटम नक्शे से नापा जाता है — Nos × L × B × H — और बाज़ार रेट से जोड़ा जाता है। कोई भी रेट बदलें, टोटल अपने आप बदलेगा।",
            )}
            points={[
              L(lang, "Measurement book and steel BBS", "मेज़रमेंट बुक और सरिया BBS"),
              L(lang, "Material list for ordering", "ऑर्डर के लिए मटेरियल लिस्ट"),
              L(lang, "Excel and PDF with your name (Pro)", "आपके नाम के साथ Excel और PDF (प्रो)"),
            ]}
            link={{
              href: langPath(lang, "house-boq-estimate"),
              label: L(lang, "Make my BOQ", "मेरा BOQ बनाएं"),
            }}
            visual={
              <div className="rounded-[24px] bg-ink p-6 text-white shadow-[0_30px_70px_-30px_rgba(22,24,26,0.6)] sm:p-8">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[12px] font-bold uppercase tracking-wide text-amber">
                      G+1 · {n.plot.w}×{n.plot.d} · {items}{" "}
                      {L(lang, "items", "आइटम")}
                    </div>
                    <div className="font-display mt-1 text-[38px] font-extrabold leading-none">
                      ₹<CountUp to={Math.round(info.total)} />
                    </div>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold">
                    ₹{Math.round(info.perSqft).toLocaleString("en-IN")}/sqft
                  </span>
                </div>
                <ul className="mt-6 flex flex-col gap-3">
                  {topSections.map((s) => (
                    <li key={s.code} className="flex flex-col gap-1.5">
                      <span className="flex justify-between gap-3 text-[13px]">
                        <span className="truncate text-[#e7e3dc]">
                          {s.code}. {s.title[lang]}
                        </span>
                        <span className="tabular-nums font-semibold">
                          {lakh(s.subtotal, lang)}
                        </span>
                      </span>
                      <span className="h-2 overflow-hidden rounded-full bg-white/10">
                        <span
                          className="block h-full rounded-full bg-amber"
                          style={{ width: `${(s.subtotal / maxSec) * 100}%` }}
                        />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            }
          />
        </div>

        <Feature
          eyebrow={L(lang, "Plan → Estimate · Pro", "नक्शे से एस्टिमेट · प्रो")}
          title={L(
            lang,
            "Already have a plan? Upload it",
            "नक्शा पहले से है? बस अपलोड करें",
          )}
          text={L(
            lang,
            "AutoCAD DXF, a photo of a printed plan, or a PDF from your architect. Every room is read, you check the sizes, and the full estimate is made from your own plan.",
            "AutoCAD की DXF, छपे नक्शे की फ़ोटो, या आर्किटेक्ट की PDF। हर कमरा पढ़ा जाता है, आप साइज़ जांचते हैं, और पूरा एस्टिमेट आपके अपने नक्शे से बनता है।",
          )}
          points={[
            L(lang, "DXF free, read on your own device", "DXF फ़्री, आपके ही डिवाइस पर पढ़ी जाती है"),
            L(lang, "Photo and PDF read by AI", "फ़ोटो और PDF AI से पढ़ी जाती है"),
            L(lang, "You check every room before it is used", "इस्तेमाल से पहले आप हर कमरा जांचते हैं"),
          ]}
          link={{
            href: langPath(lang, "plan-to-estimate"),
            label: L(lang, "Upload a plan", "नक्शा अपलोड करें"),
          }}
          visual={
            <div className="flex flex-col gap-3">
              <BeforeAfter
                before={planPhoto}
                after={planRead}
                label={L(lang, "Drag to compare", "खींचकर तुलना करें")}
              />
              <p className="text-center text-[13px] font-semibold text-muted">
                ‹ {L(lang, "drag to compare", "खींचकर तुलना करें")} ›
              </p>
            </div>
          }
        />

        <div className="bg-white">
          <Feature
            flip
            eyebrow={L(lang, "Contractor quote check", "ठेकेदार का रेट")}
            title={L(
              lang,
              "Know if the contractor is charging too much",
              "पता करें, ठेकेदार ज़्यादा तो नहीं ले रहा",
            )}
            text={L(
              lang,
              "Put the contractor's rates next to the market rate for your city. Items charged well above it stand out, with the extra amount — before you sign.",
              "ठेकेदार के रेट को अपने शहर के बाज़ार रेट के सामने रखें। बहुत ज़्यादा रेट वाले आइटम अलग दिखते हैं, ज़्यादा लगने वाली रकम के साथ — साइन करने से पहले।",
            )}
            points={[
              L(lang, "Rate per item, not per sq ft", "हर आइटम का रेट, sq ft का नहीं"),
              L(lang, "14 questions to ask before signing", "साइन से पहले पूछने के 14 सवाल"),
              L(lang, "Upload the bill photo (Pro)", "बिल की फ़ोटो अपलोड (प्रो)"),
            ]}
            link={{
              href: langPath(lang, "contractor-quote-checker"),
              label: L(lang, "Check a quote", "कोटेशन जांचें"),
            }}
            visual={
              <div className="overflow-hidden rounded-[24px] border border-line bg-white shadow-[0_30px_70px_-30px_rgba(22,24,26,0.4)]">
                <div className="flex items-center justify-between border-b border-line bg-[#faf8f4] px-5 py-3">
                  <span className="text-[14px] font-bold">
                    {L(lang, "Contractor's quote", "ठेकेदार का कोटेशन")}
                  </span>
                  <span className="rounded-full bg-[#ece8df] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-muted">
                    {L(lang, "Example", "उदाहरण")}
                  </span>
                </div>
                <ul className="divide-y divide-line">
                  {bill.map((b) => (
                    <li
                      key={b.item}
                      className="flex items-center justify-between gap-3 px-5 py-3.5"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-semibold">
                          {b.item}
                        </span>
                        <span className="text-[12px] text-muted">
                          ₹{b.quoted.toLocaleString("en-IN")}/{b.unit} ·{" "}
                          {L(lang, "market", "बाज़ार")} ₹
                          {b.market.toLocaleString("en-IN")}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-bold ${tone(b.diff)}`}
                      >
                        {b.diff > 0 ? "+" : ""}
                        {Math.round(b.diff)}% · {verdictText(verdictFor(b.diff))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            }
          />
        </div>

        <Feature
          eyebrow={L(lang, "While it is being built", "बनते समय")}
          title={L(
            lang,
            `${CHECKLIST_COUNT} checks a contractor will not tell you`,
            `${CHECKLIST_COUNT} जांच, जो ठेकेदार नहीं बताएगा`,
          )}
          text={L(
            lang,
            "From buying the plot to moving in — what to check at each stage so the structure stays strong, each with a video to understand it even when no engineer is on site.",
            "प्लॉट ख़रीदने से घर में जाने तक — हर स्टेज पर क्या जांचें ताकि स्ट्रक्चर मज़बूत रहे, हर पॉइंट के साथ वीडियो, ताकि इंजीनियर न हो तब भी समझ आए।",
          )}
          points={[
            L(lang, "Stage by stage, tick as you go", "स्टेज के हिसाब से, टिक करते चलें"),
            L(lang, "Structural mistakes contractors skip", "स्ट्रक्चर की वो गलतियां जो ठेकेदार छोड़ देते हैं"),
          ]}
          link={{
            href: langPath(lang, "house-construction-guide/checklist"),
            label: L(lang, "Open the checklist", "चेकलिस्ट खोलें"),
          }}
          visual={
            <ul className="flex flex-col gap-3">
              {checkSample.map((c, i) => (
                <li
                  key={c.point.id}
                  className="flex items-start gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm"
                  style={{ marginLeft: `${(i % 2) * 24}px` }}
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-[#1d7a46] text-[13px] font-bold text-[#1d7a46]">
                    ✓
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-bold uppercase tracking-wide text-muted">
                      {c.stage}
                    </span>
                    <span className="block text-[15px] font-semibold leading-snug">
                      {c.point.t[lang]}
                    </span>
                  </span>
                  <a
                    href={ytUrl(c.point)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="flex h-8 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e52d27] text-white"
                  >
                    ▶
                  </a>
                </li>
              ))}
            </ul>
          }
        />

        {/* ---------- naksha gallery ---------- */}
        <section className="bg-white py-16 lg:py-24">
          <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4 sm:px-6">
            <Reveal>
              <div className="flex flex-col gap-2">
                <Eyebrow>{L(lang, "Popular nakshe", "लोकप्रिय नक्शे")}</Eyebrow>
                <h2 className="font-display text-[30px] font-extrabold tracking-tight sm:text-[40px]">
                  {L(lang, "Pick a plan, see its cost", "नक्शा चुनें, उसका खर्च देखें")}
                </h2>
              </div>
            </Reveal>
            <Link
              href={langPath(lang, "naksha")}
              className="text-[15px] font-bold underline decoration-amber decoration-2 underline-offset-4"
            >
              {L(lang, "All nakshe →", "सभी नक्शे →")}
            </Link>
          </div>
          <ul className="mx-auto mt-8 flex max-w-6xl snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:px-6">
            {gallery.map((g) => {
              const gi = nakshaInfo(g);
              return (
                <li key={g.slug} className="w-[270px] shrink-0 snap-start">
                  <Link
                    href={langPath(lang, `naksha/${g.slug}`)}
                    className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-[#faf8f4] transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <span className="block aspect-[4/3] overflow-hidden bg-white">
                      <img
                        src={nakshaImage(g)}
                        alt={nakshaTitle(g, lang)}
                        loading="lazy"
                        width={1054}
                        height={911}
                        className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                      />
                    </span>
                    <span className="flex flex-col gap-1 p-4">
                      <span className="font-display text-[20px] font-extrabold">
                        {g.plot.w}×{g.plot.d}{" "}
                        <span className="text-[14px] font-semibold text-muted">
                          {L(lang, FACING_NAME[g.facing].en, FACING_NAME[g.facing].hi)}
                        </span>
                      </span>
                      <span className="text-[14px] text-body">
                        {gi.bhk} BHK · G+1 · {lakh(gi.total, lang)}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ---------- quick cost ---------- */}
        <section className="bg-ink text-[#f5f3ef]">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1fr] lg:py-20">
            <Reveal>
              <div className="flex flex-col gap-4">
                <Eyebrow>{L(lang, "Quick estimate", "झटपट अंदाज़ा")}</Eyebrow>
                <h2 className="font-display text-[30px] font-extrabold leading-tight tracking-tight text-white sm:text-[40px]">
                  {L(
                    lang,
                    "Only know the sq ft? Start here",
                    "सिर्फ़ sq ft पता है? यहां से शुरू करें",
                  )}
                </h2>
                <p className="max-w-lg text-[17px] leading-relaxed text-[#cfcbc2]">
                  {d.home_sub}
                </p>
              </div>
            </Reveal>
            <HeroQuick lang={lang} />
          </div>
        </section>

        {/* ---------- calculators ---------- */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-[28px] font-extrabold tracking-tight">
              {d.home_popular}
            </h2>
            <Link
              href={langPath(lang, "calculators")}
              className="text-[15px] font-bold underline decoration-amber decoration-2 underline-offset-4"
            >
              {d.all_calculators} →
            </Link>
          </div>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CALCULATORS.filter(
              (c) =>
                ![
                  "house-construction-cost-calculator",
                  "house-boq-estimate",
                  "contractor-quote-checker",
                ].includes(c.slug),
            ).map((c) => (
              <li key={c.slug}>
                <Link
                  href={langPath(lang, c.slug)}
                  className="flex h-full items-center gap-3 rounded-2xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-amber hover:shadow-md"
                >
                  <span className="font-display flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-tint text-[15px] font-extrabold text-amber-dark">
                    {c.mark}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[15px] font-bold">{c[lang].name}</span>
                    <span className="truncate text-[13px] text-muted">
                      {c[lang].short}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- closing ---------- */}
        <section className="px-4 pb-20 sm:px-6">
          <Reveal>
            <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-amber px-6 py-14 text-center sm:px-12">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(22,24,26,0.12)_1px,transparent_0)] [background-size:20px_20px]"
              />
              <div className="relative flex flex-col items-center gap-5">
                <h2 className="font-display max-w-3xl text-[32px] font-extrabold leading-tight tracking-tight text-ink text-balance sm:text-[46px]">
                  {L(
                    lang,
                    "Your house, planned and priced before the first brick",
                    "पहली ईंट से पहले, आपका घर — नक्शे और हिसाब के साथ",
                  )}
                </h2>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    href={langPath(lang, "house-boq-estimate")}
                    className="inline-flex h-14 items-center rounded-2xl bg-ink px-7 text-[17px] font-bold text-white transition hover:-translate-y-0.5"
                  >
                    {L(lang, "Start free →", "मुफ़्त शुरू करें →")}
                  </Link>
                  <Link
                    href={langPath(lang, "naksha")}
                    className="inline-flex h-14 items-center rounded-2xl border-2 border-ink px-6 text-[17px] font-bold text-ink transition hover:bg-ink hover:text-white"
                  >
                    {L(lang, "Custom naksha", "कस्टम नक्शा")}
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter lang={lang} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
