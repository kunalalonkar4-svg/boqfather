import Link from "next/link";
import type { ReactNode } from "react";
import { CALCULATORS } from "@/content/calculators";
import { CHECKLIST_COUNT } from "@/content/checklist";
import { CITIES } from "@/content/cities";
import { getNaksha, NAKSHE, nakshaImage, nakshaInfo } from "@/content/naksha";
import { t } from "@/i18n/ui";
import { Lang, langPath, SITE_NAME, SITE_URL } from "@/lib/site";
import { SiteFooter, SiteHeader } from "../../Chrome";
import { ElevationDrawing } from "./ElevationDrawing";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);
const wrap = "mx-auto w-full max-w-[1120px] px-5 sm:px-8";
const serif = "font-[Merriweather,'Noto_Serif_Devanagari',Georgia,serif]";
const teal = "text-[#0b5f6e]";
const btnYellow =
  "inline-flex h-12 items-center justify-center rounded-[6px] bg-[#fdbd2f] px-7 text-[15px] font-semibold text-[#1a1a1a] transition hover:bg-[#f0ae15] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b5f6e]";
const btnLine =
  "inline-flex h-12 items-center justify-center rounded-[6px] border border-[#0b5f6e] bg-white px-7 text-[15px] font-semibold text-[#0b5f6e] transition hover:bg-[#eef6f7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b5f6e]";

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className={`text-[14px] font-semibold ${teal}`}>— {n} —</p>
      <h2 className={`${serif} mt-3 text-[28px] font-normal leading-tight [text-wrap:balance] sm:text-[36px]`}>{title}</h2>
      <p className="mt-3 text-[16px] leading-relaxed text-body">{text}</p>
    </div>
  );
}

function Card({ img, title, text, href, cta, children }: { img?: ReactNode; title: string; text: string; href?: string; cta?: string; children?: ReactNode }) {
  return (
    <li className="flex flex-col overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-white">
      {img && <div className="overflow-hidden border-b border-[#eef0f2] bg-[#f6f7f8]">{img}</div>}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className={`${serif} text-[19px] font-normal leading-snug`}>{title}</h3>
        <p className="text-[14.5px] leading-relaxed text-body">{text}</p>
        {children}
        {href && cta && (
          <Link href={href} className={`mt-auto pt-2 text-[13px] font-bold tracking-wide ${teal} hover:underline`}>
            {cta.toUpperCase()} →
          </Link>
        )}
      </div>
    </li>
  );
}

const Tick = ({ children }: { children: ReactNode }) => (
  <li className="flex gap-2 text-[14.5px] text-body">
    <span aria-hidden="true" className={`${teal} font-bold`}>✓</span>
    {children}
  </li>
);

/** Home page in the RoomSketcher layout: split hero, three numbered steps, free-plan block, reasons, FAQ, closing band. */
export function HomeLight({ lang }: { lang: Lang }) {
  const d = t(lang);
  const hi = lang === "hi" ? "-hi" : "";
  const n = getNaksha("30x40-east-facing") ?? NAKSHE[0];
  const info = nakshaInfo(n);
  const start = langPath(lang, "house-boq-estimate");
  const crop = (name: string, alt: string, w: number, h: number) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`/home/crops/${name}${hi}.webp`} alt={alt} width={w} height={h} loading="lazy" className="aspect-[16/10] w-full object-cover object-left-top" />
  );

  const faqs: [string, string][] = [
    [L(lang, "Is Guniyo free?", "क्या Guniyo फ़्री है?"), L(lang, "Yes. Every calculator, the item-wise BOQ, all house plans and the downloads are free. Pro adds clean reports with your name, reading plan photos and bills, and saved projects.", "हां। सारे कैलकुलेटर, आइटम-वार BOQ, सारे नक्शे और डाउनलोड फ़्री हैं। प्रो में आपके नाम के साथ बिना निशान रिपोर्ट, नक्शे और बिल की फ़ोटो पढ़ना, और सेव प्रोजेक्ट मिलते हैं।")],
    [L(lang, "How accurate is the estimate?", "एस्टिमेट कितना सही होता है?"), L(lang, "Each item is measured from the plan and priced at 2026 market rates for your city type. Your brand choices, soil and the structural design can change it. It is a planning estimate, so have your engineer confirm sizes and steel.", "हर आइटम नक्शे से नापा जाता है और आपके शहर के 2026 के बाज़ार रेट से जोड़ा जाता है। ब्रांड, मिट्टी और स्ट्रक्चर डिज़ाइन से फ़र्क़ आ सकता है। यह प्लानिंग एस्टिमेट है, इसलिए साइज़ और सरिया अपने इंजीनियर से पक्का करवाएं।")],
    [L(lang, "Can I change the rates?", "क्या मैं रेट बदल सकता हूं?"), L(lang, "Yes. Start from mid-city market rates and type your own contractor's rate for any item. Every total updates.", "हां। मध्यम शहर के बाज़ार रेट से शुरू करें और किसी भी आइटम में अपने ठेकेदार का रेट डालें। हर टोटल बदल जाता है।")],
    [L(lang, "Can I use my own plan?", "क्या मैं अपना नक्शा इस्तेमाल कर सकता हूं?"), L(lang, "Yes. Upload an AutoCAD DXF (free), or a photo or PDF of the plan (Pro), or type the rooms yourself.", "हां। AutoCAD DXF अपलोड करें (फ़्री), या नक्शे की फ़ोटो / PDF (प्रो), या कमरे ख़ुद भरें।")],
    [L(lang, "Are the house plans as per Vastu?", "क्या नक्शे वास्तु के अनुसार हैं?"), L(lang, "Each plan is set the way that suits Vastu best for its road side, with a room-by-room Vastu chart. Get the final drawing made by your architect.", "हर नक्शा सड़क की दिशा के हिसाब से वास्तु अनुसार रखा गया है, हर कमरे के वास्तु चार्ट के साथ। फ़ाइनल ड्रॉइंग अपने आर्किटेक्ट से बनवाएं।")],
    [L(lang, "Does it work in Hindi?", "क्या यह हिंदी में चलता है?"), L(lang, "Yes. The site, the estimate and the reports are available in English and Hindi.", "हां। साइट, एस्टिमेट और रिपोर्ट हिंदी और अंग्रेज़ी में उपलब्ध हैं।")],
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: SITE_NAME, url: `${SITE_URL}${langPath(lang)}`, inLanguage: lang === "hi" ? "hi-IN" : "en-IN", description: d.home_sub },
      { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/icon.svg` },
      { "@type": "WebApplication", name: `${SITE_NAME} house construction cost calculator`, url: SITE_URL, applicationCategory: "BusinessApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" } },
    ],
  };

  return (
    <>
      <SiteHeader lang={lang} altPath={langPath(lang === "en" ? "hi" : "en")} />
      <main lang={lang} className="overflow-x-clip bg-white text-ink">
        {lang === "en" ? (
          <section className="bg-white">
            <h1 className="sr-only">Professional House Cost Estimates in Minutes</h1>
            <picture>
              <source media="(max-width: 639px)" srcSet="/home/hero-banner-m.webp" width={800} height={614} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/home/hero-banner.webp" alt="A two-storey house with its floor plan, estimated cost and material BOQ cards: professional house cost estimates in minutes" width={2000} height={848} fetchPriority="high" className="block h-auto w-full" />
            </picture>
            <div className={`${wrap} flex flex-col items-center gap-4 py-8 text-center`}>
              <p className="max-w-2xl text-[17px] leading-relaxed text-body">Choose a house plan and get an item-wise BOQ with quantities, rates and costs. Built by a civil engineer and valuer, free to start.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href={start} className={btnYellow}>Start free estimate</Link>
                <Link href={langPath(lang, "naksha")} className={btnLine}>Explore house plans</Link>
              </div>
            </div>
          </section>
        ) : (
        <section className={`${wrap} grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_1.05fr] lg:gap-14`}>
          <div>
            <h1 className={`${serif} text-[36px] font-normal leading-[1.15] tracking-[-0.01em] [text-wrap:balance] sm:text-[52px]`}>
              {L(lang, "Professional House Cost Estimates in Minutes", "मिनटों में घर का पक्का खर्च का एस्टिमेट")}
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-body">
              {L(lang, "Choose a house plan and get an item-wise BOQ with quantities, rates and costs. Built by a civil engineer and valuer, free to start.", "घर का नक्शा चुनें और मात्रा, रेट और खर्च के साथ आइटम-वार BOQ पाएं। एक सिविल इंजीनियर और वैल्यूअर द्वारा बनाया गया, शुरू करना फ़्री।")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={start} className={btnYellow}>{L(lang, "Start free estimate", "मुफ़्त एस्टिमेट शुरू करें")}</Link>
              <Link href={langPath(lang, "naksha")} className={btnLine}>{L(lang, "Explore house plans", "घर के नक्शे देखें")}</Link>
            </div>
          </div>
          <div className="rounded-[10px] bg-[#0b6b7a] p-4 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="overflow-hidden rounded-[8px] bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={nakshaImage(n)} alt={L(lang, "30×40 ft floor plan with room sizes", "30×40 ft नक्शा, कमरों के साइज़ के साथ")} width={1200} height={800} className="aspect-[4/5] w-full object-contain p-2 sm:aspect-auto sm:h-full" />
              </div>
              <div className="flex flex-col gap-3">
                <div className="overflow-hidden rounded-[8px] bg-white">
                  <ElevationDrawing w={n.plot.w} className="block aspect-[16/10] w-full object-cover" />
                </div>
                <div className="rounded-[8px] bg-white p-4">
                  <p className="text-[12.5px] text-muted">{L(lang, "Sample estimate · 30×40 ft, G+1, standard", "सैंपल एस्टिमेट · 30×40 ft, G+1, स्टैंडर्ड")}</p>
                  <p className={`${serif} mt-1 text-[30px] leading-none`}>₹{(info.total / 1e5).toLocaleString("en-IN", { maximumFractionDigits: 1 })} {L(lang, "lakh", "लाख")}</p>
                  <p className="mt-2 text-[12.5px] text-muted">{info.bhk} BHK · {info.builtUp.toLocaleString("en-IN")} sq ft</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* step 1 */}
        <section className="bg-white">
          <div className={`${wrap} py-14`}>
            <Step n={L(lang, "STEP 1", "चरण 1")} title={L(lang, "Start with a House Plan", "घर के नक्शे से शुरू करें")} text={L(lang, "Whether you have a plan already or need one, Guniyo takes you to the next step.", "नक्शा पहले से हो या चाहिए, Guniyo आपको अगले कदम तक ले जाता है।")} />
            <ul className="mt-10 grid gap-5 md:grid-cols-2">
              <Card
                img={
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src="/home/plan-35x50.webp" alt={L(lang, "A coloured 35×50 ft floor plan, ground and first floor, east facing", "35×50 ft का रंगीन नक्शा, ग्राउंड और पहली मंज़िल, पूर्व-मुखी")} width={1200} height={1600} loading="lazy" className="aspect-square w-full object-cover object-top" />
                }
                title={L(lang, "Already have a plan? Upload it", "नक्शा पहले से है? अपलोड करें")}
                text={L(lang, "An AutoCAD DXF is read on your own device, free. A photo or PDF is read by AI on Pro.", "AutoCAD DXF आपके अपने डिवाइस पर पढ़ा जाता है, फ़्री। फ़ोटो या PDF प्रो में AI पढ़ता है।")}
                href={langPath(lang, "plan-to-estimate")}
                cta={L(lang, "Learn more", "और जानें")}
              >
                <ul className="mt-1 flex flex-col gap-1"><Tick>{L(lang, "DXF is free", "DXF फ़्री है")}</Tick><Tick>{L(lang, "You check every room", "हर कमरा आप जांचते हैं")}</Tick><Tick>{L(lang, "Opens straight in the BOQ", "सीधे BOQ में खुलता है")}</Tick></ul>
              </Card>
              <Card
                img={
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src="/home/house-estimate.webp" alt={L(lang, "Front view of a 30×40 ft G+1 house with its sample estimate of ₹25.9 lakh", "30×40 ft G+1 घर का फ़्रंट व्यू, ₹25.9 लाख के सैंपल एस्टिमेट के साथ")} width={1400} height={781} loading="lazy" className="block h-auto w-full" />
                }
                title={L(lang, "No plan yet? Pick one", "नक्शा नहीं है? चुनें")}
                text={L(lang, "Scaled plans with room sizes, a front elevation and a Vastu chart, for common plot sizes.", "आम प्लॉट साइज़ के लिए नाप वाले नक्शे, कमरों के साइज़, फ़्रंट एलिवेशन और वास्तु चार्ट के साथ।")}
                href={langPath(lang, "naksha")}
                cta={L(lang, "Learn more", "और जानें")}
              >
                <ul className="mt-1 flex flex-col gap-1"><Tick>{L(lang, "Plans for all four road sides", "चारों सड़क दिशाओं के नक्शे")}</Tick><Tick>{L(lang, "Vastu chart for each room", "हर कमरे का वास्तु चार्ट")}</Tick><Tick>{L(lang, "Cost shown with each plan", "हर नक्शे के साथ खर्च")}</Tick></ul>
              </Card>
            </ul>
          </div>
        </section>

        {/* step 2 */}
        <section className="bg-white">
          <div className={`${wrap} py-14`}>
            <Step n={L(lang, "STEP 2", "चरण 2")} title={L(lang, "Review and Edit Your BOQ", "अपना BOQ देखें और बदलें")} text={L(lang, "Every item shows quantity, unit, rate and amount. Change any rate and every total updates.", "हर आइटम में मात्रा, यूनिट, रेट और रकम दिखती है। कोई भी रेट बदलें, हर टोटल बदल जाता है।")} />
            <ul className="mt-10 grid gap-5 md:grid-cols-3">
              <Card img={crop("boq-items", L(lang, "BOQ items with editable rates", "बदलने वाले रेट के साथ BOQ आइटम"), 1060, 400)} title={L(lang, "Item-wise BOQ", "आइटम-वार BOQ")} text={L(lang, "From excavation to painting, each item with its own rate you can edit.", "खुदाई से पेंटिंग तक, हर आइटम का अपना रेट जो आप बदल सकते हैं।")} />
              <Card img={crop("stages", L(lang, "Stage plan with materials to buy", "स्टेज प्लान, ख़रीदने वाला मटीरियल"), 1104, 400)} title={L(lang, "Stage-wise materials", "स्टेज-वार मटीरियल")} text={L(lang, "Know the cement, sand, aggregate and steel to buy before each stage.", "हर स्टेज से पहले ख़रीदने वाला सीमेंट, रेत, गिट्टी और सरिया जानें।")} />
              <Card img={crop("quote", L(lang, "Quote checker", "कोटेशन चेकर"), 1300, 639)} title={L(lang, "Contractor quote checker", "ठेकेदार कोटेशन चेकर")} text={L(lang, "Set a contractor's rate beside the market rate before you sign.", "साइन करने से पहले ठेकेदार का रेट बाज़ार रेट के बगल में रखें।")} href={langPath(lang, "contractor-quote-checker")} cta={L(lang, "Check a quote", "कोटेशन जांचें")} />
            </ul>
          </div>
        </section>

        {/* step 3 */}
        <section className="bg-white">
          <div className={`${wrap} py-14`}>
            <Step n={L(lang, "STEP 3", "चरण 3")} title={L(lang, "Download Reports for the Site", "साइट के लिए रिपोर्ट डाउनलोड करें")} text={L(lang, "Take the estimate to your contractor, your bank or your site.", "एस्टिमेट अपने ठेकेदार, बैंक या साइट तक ले जाएं।")} />
            <ul className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                [L(lang, "Measurement book", "मेज़रमेंट बुक"), L(lang, "Nos × L × B × H for every item, ready to check on site.", "हर आइटम के Nos × L × B × H, साइट पर जांचने के लिए तैयार।")],
                [L(lang, "Steel BBS", "सरिया BBS"), L(lang, "Bar bending schedule for the steel you need to order.", "जो सरिया मंगाना है उसका बार बेंडिंग शेड्यूल।")],
                [L(lang, "PDF quotation", "PDF कोटेशन"), L(lang, "Abstract and measurement book, with your firm's name on Pro.", "सार और मेज़रमेंट बुक, प्रो में आपकी फ़र्म के नाम के साथ।")],
                [L(lang, "Excel download", "Excel डाउनलोड"), L(lang, "Take the BOQ into your own sheet and keep working.", "BOQ अपनी शीट में ले जाएं और काम जारी रखें।")],
                [L(lang, `${CALCULATORS.length} calculators`, `${CALCULATORS.length} कैलकुलेटर`), L(lang, "Concrete, steel, bricks, paint and more, with the working shown.", "कंक्रीट, सरिया, ईंट, पेंट और बहुत कुछ, पूरे हिसाब के साथ।")],
                [L(lang, `Rates for ${CITIES.length} cities`, `${CITIES.length} शहरों के रेट`), L(lang, "Cost levels set for your city, not one number for all of India.", "आपके शहर के हिसाब से खर्च का स्तर, पूरे भारत का एक ही नंबर नहीं।")],
              ].map(([a, b]) => (
                <Card key={a} title={a} text={b} />
              ))}
            </ul>
          </div>
        </section>

        {/* free plan */}
        <section className={`${wrap} grid items-center gap-10 py-16 lg:grid-cols-2`}>
          <div>
            <p className={`text-[14px] font-semibold ${teal}`}>— {L(lang, "START FREE", "फ़्री शुरू करें")}</p>
            <h2 className={`${serif} mt-3 text-[28px] font-normal leading-tight sm:text-[36px]`}>{L(lang, "Get Started for Free, Upgrade Anytime", "फ़्री शुरू करें, कभी भी अपग्रेड करें")}</h2>
            <p className="mt-4 text-[16px] leading-relaxed text-body">{L(lang, "Calculators, the item-wise BOQ and house plans are free, with no sign-up to try them.", "कैलकुलेटर, आइटम-वार BOQ और नक्शे फ़्री हैं, आज़माने के लिए साइन-अप नहीं चाहिए।")}</p>
            <p className="mt-3 text-[16px] leading-relaxed text-body">{L(lang, "When you need clean reports with your name, plan photos read by AI or saved projects, move to Pro.", "जब आपको अपने नाम की साफ़ रिपोर्ट, AI से पढ़ी गई नक्शे की फ़ोटो या सेव प्रोजेक्ट चाहिए, प्रो लें।")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={start} className={btnYellow}>{L(lang, "Start free estimate", "मुफ़्त एस्टिमेट शुरू करें")}</Link>
              <Link href={langPath(lang, "pricing")} className={btnLine}>{L(lang, "View pricing", "कीमत देखें")}</Link>
            </div>
          </div>
          <div className="rounded-[8px] border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <p className={`${serif} text-center text-[18px]`}>{L(lang, "Free includes", "फ़्री में शामिल")}</p>
            <ul className="mt-4 divide-y divide-[#eef0f2]">
              {[L(lang, `All ${CALCULATORS.length} calculators`, `सारे ${CALCULATORS.length} कैलकुलेटर`), L(lang, "Item-wise BOQ with editable rates", "बदलने वाले रेट के साथ आइटम-वार BOQ"), L(lang, "House plans, elevations and Vastu charts", "नक्शे, एलिवेशन और वास्तु चार्ट"), L(lang, "Downloads and AutoCAD DXF upload", "डाउनलोड और AutoCAD DXF अपलोड"), L(lang, "Contractor quote checker", "ठेकेदार कोटेशन चेकर")].map((x) => (
                <li key={x} className="flex gap-3 py-3 text-[14.5px]"><span aria-hidden="true" className={`${teal} font-bold`}>✓</span>{x}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* reasons and facts */}
        <section className="bg-[#f3f4f5]">
          <div className={`${wrap} py-16`}>
            <h2 className={`${serif} text-center text-[28px] font-normal leading-tight sm:text-[34px]`}>{L(lang, "Three Reasons to Choose Guniyo", "Guniyo चुनने की तीन वजहें")}</h2>
            <ul className="mt-10 grid gap-8 md:grid-cols-3">
              {[
                [L(lang, "Built by an engineer", "इंजीनियर का बनाया"), L(lang, "Kunal Alonkar, civil engineer and valuer, IIV member (Cat-I/F-7426), 12+ years in the field.", "कुणाल अलोणकर, सिविल इंजीनियर और वैल्यूअर, IIV सदस्य (Cat-I/F-7426), 12+ वर्ष का अनुभव।")],
                [L(lang, "Every number shown", "हर नंबर दिखता है"), L(lang, "Quantities, rates and amounts are on screen, not hidden behind one total.", "मात्रा, रेट और रकम स्क्रीन पर दिखती हैं, एक टोटल के पीछे छिपी नहीं।")],
                [L(lang, "Your rates, your city", "आपके रेट, आपका शहर"), L(lang, "Start from city-type market rates and use your contractor's rate where it differs.", "शहर के हिसाब से बाज़ार रेट से शुरू करें और जहां फ़र्क़ हो वहां ठेकेदार का रेट डालें।")],
              ].map(([a, b]) => (
                <li key={a} className="text-center">
                  <h3 className={`${serif} text-[20px] font-normal`}>{a}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-body">{b}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-12 grid grid-cols-2 gap-y-8 text-center lg:grid-cols-4">
              {([
                [String(CALCULATORS.length), L(lang, "Calculators", "कैलकुलेटर")],
                [String(CITIES.length), L(lang, "City rate pages", "शहर रेट पेज")],
                ["14", L(lang, "Stage guide", "चरणों की गाइड")],
                [String(CHECKLIST_COUNT), L(lang, "Site checks", "साइट जांच")],
              ] as [string, string][]).map(([v, l]) => (
                <div key={l}>
                  <dd className={`${serif} text-[40px] font-light leading-none`}>{v}</dd>
                  <dt className="mt-2 text-[14px] text-muted">{l}</dt>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* FAQ */}
        <section className={`${wrap} py-16`}>
          <div className="mx-auto max-w-[760px]">
            <p className={`text-center text-[14px] font-semibold ${teal}`}>— FAQ</p>
            <h2 className={`${serif} mt-3 text-center text-[28px] font-normal leading-tight sm:text-[34px]`}>{L(lang, "Your Questions Answered", "आपके सवालों के जवाब")}</h2>
            <div className="mt-8 flex flex-col gap-3">
              {faqs.map(([q, a]) => (
                <details key={q} className="group rounded-[6px] bg-[#f3f4f5] px-5 py-4">
                  <summary className={`${serif} flex cursor-pointer list-none items-center justify-between gap-3 text-[16px] [&::-webkit-details-marker]:hidden`}>
                    {q}
                    <span aria-hidden="true" className="text-[14px] transition group-open:rotate-180">⌄</span>
                  </summary>
                  <p className="mt-3 text-[15px] leading-relaxed text-body">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* closing band */}
        <section className="bg-[#161616] text-white">
          <div className={`${wrap} flex flex-col items-center gap-5 py-16 text-center`}>
            <h2 className={`${serif} max-w-2xl text-[26px] font-normal leading-tight [text-wrap:balance] sm:text-[34px]`}>
              {L(lang, "Your house estimate is five minutes away.", "आपके घर का एस्टिमेट पांच मिनट दूर है।")}
            </h2>
            <p className="max-w-xl text-[16px] text-[#d4d4d8]">{L(lang, "Pick a plan, review the BOQ and download it. No sign-up to start.", "नक्शा चुनें, BOQ देखें और डाउनलोड करें। शुरू करने के लिए साइन-अप नहीं।")}</p>
            <Link href={start} className={btnYellow}>{L(lang, "Start free estimate", "मुफ़्त एस्टिमेट शुरू करें")}</Link>
          </div>
        </section>
      </main>
      <SiteFooter lang={lang} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
