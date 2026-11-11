import Link from "next/link";
import { CALCULATORS } from "@/content/calculators";
import { CHECKLIST_COUNT } from "@/content/checklist";
import { CITIES } from "@/content/cities";
import { t } from "@/i18n/ui";
import { Lang, langPath, SITE_NAME, SITE_URL } from "@/lib/site";
import { SiteFooter, SiteHeader } from "../../Chrome";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);
const wrap = "mx-auto w-full max-w-[1100px] px-5 sm:px-8";
const pillDark =
  "inline-flex h-12 items-center gap-2 rounded-full bg-[#111827] px-7 text-[15px] font-semibold text-white transition hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";
const pillLine =
  "inline-flex h-12 items-center rounded-full border border-[#111827] bg-white px-7 text-[15px] font-semibold text-ink transition hover:bg-[#f3f4f6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

/** Home page in a plain, product-first style: short hero, number cards, three steps, a facts table, FAQ, one closing band. */
export function HomeLight({ lang }: { lang: Lang }) {
  const d = t(lang);
  const start = langPath(lang, "house-boq-estimate");

  const stats: [string, string][] = [
    [String(CALCULATORS.length), L(lang, "construction calculators, with the working shown", "निर्माण कैलकुलेटर, पूरे हिसाब के साथ")],
    [String(CITIES.length), L(lang, "city-wise rate pages", "शहर-वार रेट पेज")],
    ["14", L(lang, "stages in the house-building guide", "घर बनाने की गाइड के चरण")],
    [String(CHECKLIST_COUNT), L(lang, "point site checklist", "पॉइंट की साइट चेकलिस्ट")],
  ];
  const steps = [
    L(lang, "Pick a plot size or open a ready house plan.", "प्लॉट साइज़ चुनें या कोई बना हुआ नक्शा खोलें।"),
    L(lang, "Choose the finish and review the estimate, item by item.", "फ़िनिश चुनें और एस्टिमेट आइटम-दर-आइटम देखें।"),
    L(lang, "Change any rate, then download the BOQ as PDF or Excel.", "कोई भी रेट बदलें, फिर BOQ PDF या Excel में डाउनलोड करें।"),
  ];
  const facts: [string, string, string?][] = [
    [L(lang, "House plans", "घर के नक्शे"), L(lang, "Scaled plans with room sizes, a front elevation and a Vastu chart, for common plot sizes.", "आम प्लॉट साइज़ के लिए नाप वाले नक्शे, कमरों के साइज़, फ़्रंट एलिवेशन और वास्तु चार्ट के साथ।"), langPath(lang, "naksha")],
    [L(lang, "Item-wise BOQ", "आइटम-वार BOQ"), L(lang, "Every item with quantity, unit, rate and amount. Rates can be edited.", "हर आइटम मात्रा, यूनिट, रेट और रकम के साथ। रेट बदले जा सकते हैं।"), start],
    [L(lang, "Reports", "रिपोर्ट"), L(lang, "Measurement book, steel BBS, PDF and Excel downloads.", "मेज़रमेंट बुक, सरिया BBS, PDF और Excel डाउनलोड।"), start],
    [L(lang, "Quote checker", "कोटेशन चेकर"), L(lang, "Set a contractor's rate beside the market rate for your city.", "ठेकेदार का रेट अपने शहर के बाज़ार रेट के बगल में रखें।"), langPath(lang, "contractor-quote-checker")],
    [L(lang, "Your own plan", "अपना नक्शा"), L(lang, "Upload an AutoCAD DXF (free), or a photo or PDF of the plan (Pro).", "AutoCAD DXF अपलोड करें (फ़्री), या नक्शे की फ़ोटो / PDF (प्रो)।"), langPath(lang, "plan-to-estimate")],
    [L(lang, "Price", "कीमत"), L(lang, "Calculators, BOQ and house plans are free. Pro adds clean reports with your name and saved projects.", "कैलकुलेटर, BOQ और नक्शे फ़्री हैं। प्रो में आपके नाम की रिपोर्ट और सेव प्रोजेक्ट मिलते हैं।"), langPath(lang, "pricing")],
    [L(lang, "Languages", "भाषाएं"), L(lang, "English and Hindi.", "हिंदी और अंग्रेज़ी।")],
  ];
  const faqs: [string, string][] = [
    [L(lang, "Is Guniyo free?", "क्या Guniyo फ़्री है?"), L(lang, "Yes. Every calculator, the item-wise BOQ, all house plans and the downloads are free. Pro adds clean reports with your name, reading plan photos and bills, and saved projects.", "हां। सारे कैलकुलेटर, आइटम-वार BOQ, सारे नक्शे और डाउनलोड फ़्री हैं। प्रो में आपके नाम के साथ बिना निशान रिपोर्ट, नक्शे और बिल की फ़ोटो पढ़ना, और सेव प्रोजेक्ट मिलते हैं।")],
    [L(lang, "How accurate is the estimate?", "एस्टिमेट कितना सही होता है?"), L(lang, "Each item is measured from the plan and priced at 2026 market rates for your city type. Your brand choices, soil and the structural design can change it. It is a planning estimate, so have your engineer confirm sizes and steel.", "हर आइटम नक्शे से नापा जाता है और आपके शहर के 2026 के बाज़ार रेट से जोड़ा जाता है। ब्रांड, मिट्टी और स्ट्रक्चर डिज़ाइन से फ़र्क़ आ सकता है। यह प्लानिंग एस्टिमेट है, इसलिए साइज़ और सरिया अपने इंजीनियर से पक्का करवाएं।")],
    [L(lang, "Can I change the rates?", "क्या मैं रेट बदल सकता हूं?"), L(lang, "Yes. Start from mid-city market rates and type your own contractor's rate for any item. Every total updates.", "हां। मध्यम शहर के बाज़ार रेट से शुरू करें और किसी भी आइटम में अपने ठेकेदार का रेट डालें। हर टोटल बदल जाता है।")],
    [L(lang, "Are the house plans as per Vastu?", "क्या नक्शे वास्तु के अनुसार हैं?"), L(lang, "Each plan is set the way that suits Vastu best for its road side, with a room-by-room Vastu chart. Get the final drawing made by your architect.", "हर नक्शा सड़क की दिशा के हिसाब से वास्तु अनुसार रखा गया है, हर कमरे के वास्तु चार्ट के साथ। फ़ाइनल ड्रॉइंग अपने आर्किटेक्ट से बनवाएं।")],
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
      <main lang={lang} className="bg-white text-ink">
        {/* hero */}
        <section className={`${wrap} pb-14 pt-12 sm:pt-20`}>
          <p className="text-[13.5px] font-medium text-muted">{L(lang, "Guniyo · House construction cost", "Guniyo · घर बनाने का खर्च")}</p>
          <h1 className="mt-3 max-w-3xl text-[34px] font-bold leading-[1.1] tracking-[-0.02em] [text-wrap:balance] sm:text-[52px]">
            {L(lang, "Know your construction cost before you build.", "घर बनाने से पहले जानिए, कितना खर्च आएगा।")}
          </h1>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-body">
            {L(lang, "Choose a house plan, then see the quantities, rates and cost behind your estimate. Made by a civil engineer and valuer.", "घर का नक्शा चुनें, फिर अपने एस्टिमेट के पीछे की मात्रा, रेट और खर्च देखें। एक सिविल इंजीनियर और वैल्यूअर द्वारा बनाया गया।")}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={start} className={pillDark}>{L(lang, "Start free estimate", "मुफ़्त एस्टिमेट शुरू करें")} <span aria-hidden="true">→</span></Link>
            <Link href={langPath(lang, "naksha")} className={pillLine}>{L(lang, "Explore house plans", "घर के नक्शे देखें")}</Link>
          </div>
          <p className="mt-4 text-[13px] text-muted">{L(lang, "Free to start · no sign-up · English and Hindi", "शुरू करना फ़्री · साइन-अप नहीं · हिंदी और अंग्रेज़ी")}</p>

          <dl className="mt-12 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map(([v, l]) => (
              <div key={l} className="rounded-2xl bg-[#f4f4f5] p-5 sm:p-6">
                <dd className="order-1 text-[32px] font-bold leading-none tracking-tight sm:text-[40px]">{v}</dd>
                <dt className="mt-2 text-[13.5px] leading-snug text-muted">{l}</dt>
              </div>
            ))}
          </dl>
        </section>

        {/* how it works */}
        <section className={`${wrap} py-14`}>
          <h2 className="text-center text-[24px] font-bold tracking-tight sm:text-[30px]">{L(lang, "How it works", "यह कैसे काम करता है")}</h2>
          <ol className="mt-9 grid gap-3 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s} className="flex flex-col items-center gap-3 rounded-2xl bg-[#f4f4f5] px-6 py-7 text-center">
                <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111827] text-[14px] font-bold text-white">{i + 1}</span>
                <span className="text-[15px] leading-snug text-body">{s}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* what is included */}
        <section className={`${wrap} py-14`}>
          <h2 className="text-center text-[24px] font-bold tracking-tight sm:text-[30px]">{L(lang, "What you get", "आपको क्या मिलता है")}</h2>
          <dl className="mx-auto mt-9 max-w-[900px] divide-y divide-[#e5e7eb] border-y border-[#e5e7eb]">
            {facts.map(([k, v, href]) => (
              <div key={k} className="grid gap-1 py-4 sm:grid-cols-[200px_1fr] sm:gap-6">
                <dt className="text-[15px] font-semibold">{href ? <Link href={href} className="underline decoration-[#d1d5db] underline-offset-4 hover:decoration-ink">{k}</Link> : k}</dt>
                <dd className="text-[15px] leading-relaxed text-body">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* FAQ */}
        <section className={`${wrap} py-14`}>
          <h2 className="text-center text-[24px] font-bold tracking-tight sm:text-[30px]">{d.faq}</h2>
          <div className="mx-auto mt-9 flex max-w-[900px] flex-col gap-2">
            {faqs.map(([q, a]) => (
              <details key={q} className="group rounded-2xl bg-[#f4f4f5] px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15.5px] font-semibold [&::-webkit-details-marker]:hidden">
                  {q}
                  <span aria-hidden="true" className="text-[20px] font-normal transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-[15px] leading-relaxed text-body">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* closing band */}
        <section className={`${wrap} pb-20 pt-6`}>
          <div className="flex flex-col items-center gap-5 rounded-[28px] bg-[#0b0b0c] px-6 py-14 text-center text-white">
            <h2 className="max-w-xl text-[26px] font-bold leading-tight tracking-tight [text-wrap:balance] sm:text-[34px]">
              {L(lang, "Plan the whole house before you pay for a single brick.", "एक भी ईंट ख़रीदने से पहले पूरा घर प्लान करें।")}
            </h2>
            <Link href={start} className="inline-flex h-12 items-center rounded-full bg-white px-8 text-[15px] font-semibold text-ink transition hover:bg-[#e5e7eb]">
              {L(lang, "Start free estimate", "मुफ़्त एस्टिमेट शुरू करें")}
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter lang={lang} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
