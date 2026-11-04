import Link from "next/link";
import { CALCULATORS } from "@/content/calculators";
import { getNaksha, nakshaImage, nakshaInfo, nakshaPlan } from "@/content/naksha";
import { t } from "@/i18n/ui";
import { langPath, type Lang, SITE_NAME, SITE_URL } from "@/lib/site";
import { PLANS } from "@/lib/pricing";
import { EngineeringJourney, type JourneyScene } from "./EngineeringJourney";
import { SiteFooter, SiteHeader } from "../Chrome";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/** Premium editorial home page built from the same live planning and BOQ engines as the app. */
export function PremiumHome({ lang }: { lang: Lang }) {
  const d = t(lang);
  const plan = getNaksha("30x40-east-facing");
  if (!plan) throw new Error("Featured house plan is unavailable");
  const info = nakshaInfo(plan);
  const preview = { src: nakshaImage(plan) };
  const galleryPlan = getNaksha("20x40-east-facing");
  if (!galleryPlan) throw new Error("Featured 2D gallery plan is unavailable");
  const galleryInfo = nakshaInfo(galleryPlan);
  const galleryPreview = { src: nakshaImage(galleryPlan) };
  const { res } = nakshaPlan(plan);
  const materials = res.materials;
  const material = (key: string) => materials.find((x) => x.key === key)?.qty ?? 0;
  const rows = res.sections.flatMap((section) => section.items.map((item) => ({
    code: item.code,
    description: item.desc,
    qty: item.qty,
    unit: item.unit,
    rate: item.rate,
    amount: item.amount,
  }))).slice(0, 5);
  const boqItemCount = res.sections.reduce((count, section) => count + section.items.length, 0);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}${langPath(lang)}`,
    inLanguage: lang === "hi" ? "hi-IN" : "en-IN",
    description: d.home_sub,
  };
  const tools = [
    { mark: "01", name: L(lang, "House planning", "घर की प्लानिंग"), desc: L(lang, "Set plot dimensions, rooms, floors and project specifications.", "प्लॉट का माप, कमरे, मंज़िल और प्रोजेक्ट स्पेसिफिकेशन तय करें।"), href: "house-plan" },
    { mark: "02", name: L(lang, "2D floor plans", "2D फ़्लोर प्लान"), desc: L(lang, "Review room layouts, plot dimensions, facing and plan details.", "कमरों का लेआउट, प्लॉट माप, दिशा और नक्शे की जानकारी देखें।"), href: "naksha" },
    { mark: "03", name: L(lang, "BOQ generation", "BOQ तैयार करें"), desc: L(lang, "Review item-wise quantities, editable rates and live amounts.", "आइटम-वार मात्रा, बदली जा सकने वाली दरें और लाइव रकम जांचें।"), href: "house-boq-estimate" },
    { mark: "04", name: L(lang, "Quantity estimation", "मात्रा का अनुमान"), desc: L(lang, "Trace quantities through the working abstract and measurement rows.", "वर्किंग एब्स्ट्रैक्ट और मेज़रमेंट रो में मात्रा देखें।"), href: "house-boq-estimate" },
    { mark: "05", name: L(lang, "Material calculation", "सामग्री की गणना"), desc: L(lang, "Estimate cement, concrete and other material requirements.", "सीमेंट, कंक्रीट और अन्य सामग्री की आवश्यकता का अनुमान लगाएं।"), href: "concrete-calculator" },
    { mark: "06", name: L(lang, "Steel BBS", "स्टील BBS"), desc: L(lang, "Review reinforcement quantities and the bar bending schedule.", "रीइन्फोर्समेंट मात्रा और बार बेंडिंग शेड्यूल जांचें।"), href: "house-boq-estimate" },
    { mark: "07", name: L(lang, "Measurement book", "मेज़रमेंट बुक"), desc: L(lang, "Inspect the dimensions and quantity workings behind each item.", "हर आइटम के पीछे के माप और मात्रा की गणना देखें।"), href: "house-boq-estimate" },
    { mark: "08", name: L(lang, "Cost estimation", "लागत का अनुमान"), desc: L(lang, "Compare project totals across finish levels and locations.", "फ़िनिश स्तर और लोकेशन के अनुसार प्रोजेक्ट लागत देखें।"), href: "house-construction-cost-calculator" },
    { mark: "09", name: L(lang, "PDF and Excel exports", "PDF और Excel एक्सपोर्ट"), desc: L(lang, "Prepare project reports and downloadable working sheets.", "प्रोजेक्ट रिपोर्ट और डाउनलोड करने योग्य वर्किंग शीट तैयार करें।"), href: "house-boq-estimate" },
  ];
  const journey: JourneyScene[] = [
    {
      label: L(lang, "01 · PLAN", "01 · प्लान"),
      title: L(lang, "Start with a measured 2D plan.", "माप वाले 2D प्लान से शुरुआत करें।"),
      description: L(lang, "Review the selected plot, road-facing direction and floor layout before carrying the plan into an estimate.", "एस्टिमेट में ले जाने से पहले चुना हुआ प्लॉट, सड़क की दिशा और फ़्लोर लेआउट देखें।"),
      image: preview.src,
      alt: L(lang, "Actual 2D floor plan for the 30 by 40 foot east-facing G+1 house", "30 × 40 फ़ीट पूर्व मुखी G+1 घर का 2D फ़्लोर प्लान"),
      facts: [
        [L(lang, "Plot", "प्लॉट"), "30 × 40 ft"],
        [L(lang, "Facing", "दिशा"), L(lang, "East", "पूर्व")],
        [L(lang, "Floors", "मंज़िल"), "G+1"],
      ],
    },
    {
      label: L(lang, "02 · MEASURE", "02 · माप"),
      title: L(lang, "Keep the dimensions in view.", "माप को साफ़-साफ़ देखें।"),
      description: L(lang, "Inspect the measurement book and the plan details used by the existing estimation workflow.", "मौजूदा एस्टिमेशन वर्कफ़्लो में इस्तेमाल होने वाली मेज़रमेंट बुक और प्लान विवरण जांचें।"),
      image: "/assets/site-measurement-1920.webp",
      srcSet: "/assets/site-measurement-960.webp 960w, /assets/site-measurement-1920.webp 1920w",
      sizes: "(max-width: 900px) 100vw, 55vw",
      imageFit: "cover",
      alt: L(lang, "Engineers measuring and setting out the foundation of a school building in El Salvador", "एल साल्वाडोर में स्कूल भवन की नींव का माप लेते और निशान लगाते इंजीनियर"),
      facts: [
        [L(lang, "Configuration", "कॉन्फ़िगरेशन"), `${info.bhk} BHK`],
        [L(lang, "Built-up area", "बिल्ट-अप एरिया"), `${Math.round(info.builtUp).toLocaleString("en-IN")} sq ft`],
      ],
    },
    {
      label: L(lang, "03 · QUANTITIES", "03 · मात्रा"),
      title: L(lang, "Trace each quantity to its item.", "हर मात्रा को उसके आइटम से जोड़ें।"),
      description: L(lang, "Review the real item-wise quantities and rates produced for this example plan; no illustrative formulas or placeholder totals.", "इस उदाहरणी प्लान के लिए बनी वास्तविक आइटम-वार मात्रा और दरें देखें; कोई काल्पनिक फ़ॉर्मूला या कुल नहीं।"),
      image: "/assets/engineer-plan-review-1920.webp",
      srcSet: "/assets/engineer-plan-review-960.webp 960w, /assets/engineer-plan-review-1920.webp 1920w",
      sizes: "(max-width: 900px) 100vw, 55vw",
      imageFit: "cover",
      imagePosition: "center 58%",
      alt: L(lang, "An engineer reviewing a measured architectural floor plan", "माप वाले आर्किटेक्चरल फ़्लोर प्लान की समीक्षा करते इंजीनियर"),
      facts: [
        [L(lang, "BOQ items", "BOQ आइटम"), String(boqItemCount)],
        [L(lang, "First item", "पहला आइटम"), rows[0]?.code ?? "—"],
      ],
    },
    {
      label: L(lang, "04 · MATERIALS", "04 · सामग्री"),
      title: L(lang, "See material demand in context.", "सामग्री की ज़रूरत को समझें।"),
      description: L(lang, "The material photography is paired with cement, steel, sand and aggregate quantities from the existing estimate for this plan.", "इस प्लान के मौजूदा एस्टिमेट से मिली सीमेंट, स्टील, रेत और एग्रीगेट मात्रा के साथ सामग्री की तस्वीरें।"),
      image: "/assets/construction-materials-board.webp",
      sizes: "(max-width: 900px) 100vw, 55vw",
      alt: L(lang, "Four material photographs showing cement, reinforcement steel, construction sand and coarse aggregate", "सीमेंट, रीइन्फोर्समेंट स्टील, निर्माण रेत और मोटे एग्रीगेट की चार तस्वीरें"),
      credit: {
        label: "Aggregate photo: Emadrazo · CC BY-SA 4.0",
        href: "https://commons.wikimedia.org/wiki/File:Agregakinak_Aggregate.JPG",
      },
      facts: [
        [L(lang, "Cement", "सीमेंट"), `${Math.round(material("cement")).toLocaleString("en-IN")} ${L(lang, "bags", "बैग")}`],
        [L(lang, "Steel", "स्टील"), `${(material("steel") / 1000).toFixed(1)} t`],
      ],
    },
    {
      label: L(lang, "05 · COST", "05 · लागत"),
      title: L(lang, "Bring the project cost into focus.", "प्रोजेक्ट लागत को स्पष्ट रूप से समझें।"),
      description: L(lang, "Compare the estimate total with the built-up area and the engine-calculated rate per square foot.", "एस्टिमेट कुल की तुलना बिल्ट-अप एरिया और इंजन से निकली प्रति वर्ग फ़ुट दर के साथ करें।"),
      image: "/assets/concrete-workers-1920.webp",
      srcSet: "/assets/concrete-workers-960.webp 960w, /assets/concrete-workers-1920.webp 1920w",
      sizes: "(max-width: 900px) 100vw, 55vw",
      imageFit: "cover",
      imagePosition: "center 57%",
      alt: L(lang, "Construction workers placing concrete at a building site", "निर्माण स्थल पर कंक्रीट डालते निर्माण कर्मी"),
      credit: {
        label: "Photo: Jamain · CC BY-SA 3.0",
        href: "https://commons.wikimedia.org/wiki/File:Concrete_workers_J1.jpg",
      },
      facts: [
        [L(lang, "Estimated total", "अनुमानित कुल"), inr(info.total)],
        [L(lang, "Rate", "दर"), `${inr(info.perSqft)} / sq ft`],
      ],
    },
    {
      label: L(lang, "06 · STEEL BBS", "06 · स्टील BBS"),
      title: L(lang, "Review reinforcement in a bar schedule.", "बार शेड्यूल में रीइन्फोर्समेंट देखें।"),
      description: L(lang, "Inspect the existing steel bar bending schedule and its project quantities before preparing a report.", "रिपोर्ट तैयार करने से पहले मौजूदा स्टील बार बेंडिंग शेड्यूल और उसकी प्रोजेक्ट मात्रा जांचें।"),
      image: "/assets/rebar-installation-1920.webp",
      sizes: "(max-width: 900px) 100vw, 55vw",
      imageFit: "cover",
      alt: L(lang, "Reinforcement steel being tied on a construction site", "निर्माण स्थल पर बांधा जा रहा रीइन्फोर्समेंट स्टील"),
      facts: [
        [L(lang, "BBS weight", "BBS वजन"), `${(res.bbs.total / 1000).toFixed(2)} t`],
        [L(lang, "Bar sizes", "बार आकार"), "8 · 10 · 12 · 16 mm"],
      ],
    },
    {
      label: L(lang, "07 · REPORTS", "07 · रिपोर्ट"),
      title: L(lang, "Take the working out with you.", "अपनी गणना की रिपोर्ट साथ ले जाएं।"),
      description: L(lang, "Use the reports and export options already supported by the application to review and share project work.", "प्रोजेक्ट कार्य की समीक्षा और साझाकरण के लिए ऐप में पहले से उपलब्ध रिपोर्ट और एक्सपोर्ट विकल्प इस्तेमाल करें।"),
      image: "/assets/boq-report-30x40.svg",
      alt: L(lang, "Illustrative BOQ report page populated with the existing estimate engine output", "मौजूदा एस्टिमेट इंजन के डेटा से बना उदाहरण BOQ रिपोर्ट पेज"),
      facts: [
        [L(lang, "Available formats", "उपलब्ध फ़ॉर्मेट"), "PDF · Excel"],
        [L(lang, "Workings", "गणना"), "BOQ · MB · BBS"],
      ],
    },
  ];
  const faqs = [
    [L(lang, "What can I do with BOQFather?", "BOQFather पर क्या कर सकते हैं?"), L(lang, "Plan a house, estimate construction costs, review item-wise quantities, calculate materials and steel, and export project reports.", "घर प्लान करें, निर्माण लागत का अनुमान लगाएं, आइटम-वार मात्रा, सामग्री और स्टील की गणना करें और रिपोर्ट डाउनलोड करें।")],
    [L(lang, "How should I use the sample estimate?", "उदाहरण एस्टिमेट का उपयोग कैसे करें?"), L(lang, "It is generated for a 30 × 40 ft, east-facing G+1 example at standard finish. Treat it as a planning reference: actual quantities and costs depend on your drawings, specifications, location and rates, and should be checked by a qualified professional.", "यह 30 × 40 फ़ीट, पूर्व मुखी G+1 उदाहरण के लिए स्टैंडर्ड फ़िनिश पर बनाया गया है। इसे शुरुआती संदर्भ मानें: वास्तविक मात्रा और लागत आपके नक्शे, स्पेसिफिकेशन, लोकेशन और रेट पर निर्भर करती है और योग्य विशेषज्ञ से जांचनी चाहिए।")],
    [L(lang, "Can I use my own drawing?", "क्या मैं अपना नक्शा इस्तेमाल कर सकता हूं?"), L(lang, "Yes. Upload an AutoCAD DXF drawing or, where available, a plan photo or PDF. Review extracted room information before using it in an estimate.", "हां। AutoCAD DXF ड्रॉइंग या उपलब्ध होने पर नक्शे की फ़ोटो अथवा PDF अपलोड करें। एस्टिमेट में उपयोग से पहले निकाली गई जानकारी जांचें।")],
    [L(lang, "Which region and currency are estimates designed for?", "एस्टिमेट किन क्षेत्रों और मुद्रा के लिए हैं?"), L(lang, "The current experience is India-focused and displays costs in INR. You can adjust rates for your project, but local prices, codes and site conditions need independent verification.", "मौजूदा अनुभव भारत-केंद्रित है और लागत INR में दिखाता है। अपने प्रोजेक्ट के लिए रेट बदल सकते हैं, लेकिन स्थानीय कीमतों, कोड और साइट की स्थितियों की अलग से पुष्टि करें।")],
    [L(lang, "Are calculations and reports still available?", "क्या गणना और रिपोर्ट उपलब्ध हैं?"), L(lang, "The existing calculators, BOQ workflow, Measurement Book, steel schedule and PDF/Excel exports remain part of the application.", "मौजूदा कैलकुलेटर, BOQ वर्कफ़्लो, मेज़रमेंट बुक, स्टील शेड्यूल और PDF/Excel एक्सपोर्ट ऐप में उपलब्ध हैं।")],
    [L(lang, "Do I have to create an account?", "क्या अकाउंट बनाना जरूरी है?"), L(lang, "You can use the available calculators without an account. Sign in when you want to use account features such as saved projects.", "उपलब्ध कैलकुलेटर बिना अकाउंट के इस्तेमाल कर सकते हैं। सेव प्रोजेक्ट जैसी अकाउंट सुविधाओं के लिए साइन इन करें।")],
  ];

  return <>
    <SiteHeader lang={lang} altPath={langPath(lang === "en" ? "hi" : "en")} />
    <main lang={lang} className="premium-home">
      <section className="premium-hero">
        <div className="premium-hero-grid" aria-hidden="true" />
        <div className="premium-hero-inner">
          <div className="premium-hero-copy">
            <span className="premium-eyebrow"><i />{L(lang, "INDIA-FOCUSED CONSTRUCTION ESTIMATION", "भारत-केंद्रित निर्माण एस्टिमेशन")}</span>
            <h1>{L(lang, "Plan to BOQ.", "नक्शे से BOQ तक।")}<span>{L(lang, "Costs, made clear.", "लागत साफ़ तौर पर।")}</span></h1>
            <p>{L(lang, "Create a house plan, review real item-wise quantities, and understand the estimate before you build.", "घर का नक्शा बनाएं, असली आइटम-वार मात्रा देखें और निर्माण से पहले एस्टिमेट समझें।")}</p>
            <div className="premium-hero-actions">
              <Link className="premium-button premium-button-blue" href={langPath(lang, "house-boq-estimate")}>{L(lang, "Build your estimate", "अपना एस्टिमेट बनाएं")} <span>↗</span></Link>
              <Link className="premium-button premium-button-outline" href="#sample-boq">{L(lang, "View sample BOQ", "BOQ उदाहरण देखें")} <span>↓</span></Link>
            </div>
            <p className="premium-proof"><span className="premium-check" aria-hidden="true">✓</span>{L(lang, "Example figures are transparent and reviewable—not a construction guarantee.", "उदाहरण के आंकड़े स्पष्ट और जांचने योग्य हैं—निर्माण की गारंटी नहीं।")}</p>
          </div>
          <div className="premium-hero-visual">
            <figure className="premium-hero-photo">
              <picture>
                <img
                  src="/assets/hero-modern-residence-960.webp"
                  srcSet="/assets/hero-modern-residence-960.webp 960w, /assets/hero-modern-residence-1920.webp 1920w"
                  sizes="(max-width: 900px) 100vw, 55vw"
                  alt={L(lang, "Contemporary modern villa with a pool", "स्विमिंग पूल के साथ आधुनिक विला")}
                  width="960"
                  height="637"
                  fetchPriority="high"
                />
              </picture>
              <figcaption>
                <span>MODERN VILLA / ARCHITECTURE</span>
                <a
                  href="https://unsplash.com/license"
                  target="_blank"
                  rel="noreferrer"
                >
                  Unsplash License
                </a>
              </figcaption>
            </figure>
            <div className="premium-preview-window">
              <div className="premium-preview-toolbar"><span className="premium-table-mark">BF</span><span><b>{L(lang, "Project workspace", "प्रोजेक्ट वर्कस्पेस")}</b><small>30 × 40 · {L(lang, "East-facing · G+1", "पूर्व मुखी · G+1")}</small></span><i>2D · BOQ</i></div>
              <div className="premium-preview-body">
                <div className="premium-preview-plan"><img src={preview.src} alt={L(lang, "2D G+1 floor plan for the featured 30 by 40 house", "विशेष 30 बाय 40 घर का 2D G+1 फ़्लोर प्लान")} fetchPriority="high" /><span>{L(lang, "2D G+1 PLAN", "2D G+1 प्लान")}</span></div>
                <div className="premium-preview-summary"><span className="premium-card-label">{L(lang, "ESTIMATED PROJECT COST", "अनुमानित प्रोजेक्ट लागत")}</span><strong>{inr(info.total)}</strong><small>{L(lang, "Illustrative · standard finish", "उदाहरण · स्टैंडर्ड फ़िनिश")}</small><div className="premium-preview-metric"><span>{L(lang, "Built-up area", "बिल्ट-अप एरिया")}</span><b>{Math.round(info.builtUp).toLocaleString("en-IN")} sq ft</b></div><div className="premium-preview-metric"><span>{L(lang, "Cement", "सीमेंट")}</span><b>{Math.round(material("cement")).toLocaleString("en-IN")} {L(lang, "bags", "बैग")}</b></div><div className="premium-preview-metric"><span>{L(lang, "Steel", "स्टील")}</span><b>{(material("steel") / 1000).toFixed(1)} t</b></div></div>
              </div>
              <div className="premium-preview-rows"><span>{L(lang, "BOQ WORKING ABSTRACT", "BOQ लागत सारांश")}</span>{rows.slice(0, 3).map((row) => <div key={row.code}><b>{row.code}</b><span>{row.description}</span><strong>{inr(Number(row.amount))}</strong></div>)}</div>
            </div>
          </div>
        </div>
        <div className="premium-trust-strip"><span>{L(lang, "PRODUCT SCOPE", "उत्पाद का दायरा")}</span><i aria-hidden="true" /><span>{L(lang, "India-focused estimates", "भारत-केंद्रित एस्टिमेट")}</span><i aria-hidden="true" /><span>{L(lang, "Editable project rates", "बदलने योग्य प्रोजेक्ट रेट")}</span><i aria-hidden="true" /><span>{L(lang, "English + हिन्दी", "English + हिन्दी")}</span></div>
      </section>

      <section id="features" className="premium-section premium-platform">
        <div className="premium-section-head"><div><span className="premium-kicker">01 / {L(lang, "THE PLATFORM", "प्लेटफ़ॉर्म")}</span><h2>{L(lang, "Engineering clarity at every stage.", "हर चरण में इंजीनियरिंग की स्पष्टता।")}</h2></div><p>{L(lang, "The tools you need to move from an early idea to quantities you can review, refine and share.", "शुरुआती विचार से लेकर जांचने, सुधारने और साझा करने योग्य मात्रा तक, जरूरी टूल एक जगह।")}</p></div>
        <div className="premium-tool-grid">{tools.map((tool) => <Link className="premium-tool-card" href={langPath(lang, tool.href)} key={tool.mark}><span className="premium-tool-number">{tool.mark}</span><span className="premium-tool-arrow">↗</span><h3>{tool.name}</h3><p>{tool.desc}</p><span className="premium-tool-link">{L(lang, "Explore tool", "टूल देखें")} <span>→</span></span></Link>)}</div>
      </section>

      <EngineeringJourney lang={lang} scenes={journey} href={langPath(lang, "plan-to-estimate")} />

      <section id="sample-boq" className="premium-section premium-boq-section" aria-labelledby="sample-boq-title"><div className="premium-boq-intro"><span className="premium-kicker premium-kicker-light">03 / {L(lang, "A CLOSER LOOK", "एक नज़दीकी नज़र")}</span><h2 id="sample-boq-title">{L(lang, "See the numbers behind the build.", "निर्माण के पीछे के आंकड़े देखें।")}</h2><p>{L(lang, "This generated example uses the existing estimate engine for a 30 × 40 ft, east-facing G+1 plan at standard finish.", "यह उदाहरण मौजूदा एस्टिमेट इंजन से 30 × 40 फ़ीट, पूर्व मुखी G+1 प्लान के लिए स्टैंडर्ड फ़िनिश पर बनाया गया है।")}</p><p className="premium-estimate-note">{L(lang, "Planning reference only. Actual costs and quantities depend on drawings, specifications, location and market rates. Have project details reviewed by a qualified professional before construction.", "सिर्फ शुरुआती योजना के लिए। वास्तविक लागत और मात्रा नक्शे, स्पेसिफिकेशन, लोकेशन और बाज़ार के रेट पर निर्भर करती है। निर्माण से पहले प्रोजेक्ट विवरण योग्य विशेषज्ञ से जांचें।")}</p><Link className="premium-button premium-button-white" href={langPath(lang, "house-boq-estimate")}>{L(lang, "Build an item-wise BOQ", "आइटम-वार BOQ बनाएं")} <span>↗</span></Link><div className="premium-boq-metrics"><div><span>{L(lang, "BUILT-UP AREA", "बिल्ट-अप एरिया")}</span><b>{Math.round(info.builtUp).toLocaleString("en-IN")} <small>sq ft</small></b></div><div><span>{L(lang, "CEMENT", "सीमेंट")}</span><b>{Math.round(material("cement")).toLocaleString("en-IN")} <small>{L(lang, "bags", "बैग")}</small></b></div><div><span>{L(lang, "STEEL", "स्टील")}</span><b>{(material("steel") / 1000).toFixed(1)} <small>t</small></b></div></div></div>
        <div className="premium-table-wrap"><div className="premium-table-top"><div><span className="premium-table-mark">BF</span><span><b>{L(lang, "BOQ · WORKING ABSTRACT", "BOQ · लागत सारांश")}</b><small>30 × 40 · {L(lang, "East-facing · G+1", "पूर्व मुखी · G+1")}</small></span></div><span className="premium-table-status"><i />{L(lang, "ENGINE-ESTIMATED", "इंजन से अनुमानित")}</span></div><div className="premium-table-overflow" tabIndex={0} role="region" aria-label={L(lang, "Scrollable sample BOQ table", "स्क्रॉल करने योग्य BOQ उदाहरण तालिका")}><table className="premium-sample-table"><caption className="sr-only">{L(lang, "Sample bill of quantities for a 30 by 40 foot east-facing G+1 house", "30 × 40 फ़ीट पूर्व मुखी G+1 घर के लिए BOQ उदाहरण")}</caption><thead><tr><th scope="col">{L(lang, "ITEM", "आइटम")}</th><th scope="col">{L(lang, "QTY", "मात्रा")}</th><th scope="col">{L(lang, "UNIT", "यूनिट")}</th><th scope="col">{L(lang, "RATE", "दर")}</th><th scope="col">{L(lang, "AMOUNT", "रकम")}</th></tr></thead><tbody>{rows.map((row) => <tr key={row.code}><td><span className="premium-item-code">{row.code}</span>{row.description}</td><td>{Number(row.qty).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td><td>{row.unit}</td><td>{inr(Number(row.rate))}</td><td>{inr(Number(row.amount))}</td></tr>)}</tbody></table></div><div className="premium-table-total"><span>{L(lang, "Estimated construction total", "अनुमानित निर्माण लागत")}<small>{L(lang, "Illustrative · standard finish · INR", "उदाहरण · स्टैंडर्ड फ़िनिश · INR")}</small></span><b>{inr(info.total)}</b></div></div>
      </section>

      <section className="premium-section premium-visual-section"><div className="premium-section-head"><div><span className="premium-kicker">04 / {L(lang, "2D HOUSE PLANS", "2D घर के नक्शे")}</span><h2>{L(lang, "Review every room before you estimate.", "एस्टिमेट से पहले हर कमरे की जांच करें।")}</h2></div><p>{L(lang, "Browse detailed, to-scale floor plans with plot dimensions, facing, BHK and room details. Carry the selected plan into a construction estimate.", "प्लॉट माप, दिशा, BHK और कमरों की जानकारी वाले स्केल पर बने फ़्लोर प्लान देखें। चुने हुए नक्शे से निर्माण एस्टिमेट बनाएं।")}</p></div><div className="premium-plan-showcase"><div className="premium-plan-image"><img src={galleryPreview.src} alt={L(lang, "20 by 40 east-facing 2D floor plan", "20 बाय 40 पूर्व मुखी 2D फ़्लोर प्लान")} loading="lazy" /><span className="premium-view-chip">2D · FLOOR PLAN</span></div><div className="premium-plan-details"><span className="premium-kicker">{L(lang, "FEATURED 2D PLAN", "विशेष 2D नक्शा")}</span><h3>20 × 40 <span>{L(lang, "East-facing home", "पूर्व मुखी घर")}</span></h3><div className="premium-detail-row"><span>{L(lang, "Configuration", "कॉन्फ़िगरेशन")}</span><b>G+1 · {galleryInfo.bhk} BHK</b></div><div className="premium-detail-row"><span>{L(lang, "Built-up area", "बिल्ट-अप एरिया")}</span><b>{Math.round(galleryInfo.builtUp).toLocaleString("en-IN")} sq ft</b></div><div className="premium-detail-row"><span>{L(lang, "Estimated total", "अनुमानित कुल")}</span><b>{inr(galleryInfo.total)}</b></div><Link className="premium-plan-link" href={langPath(lang, `naksha/${galleryPlan.slug}`)}>{L(lang, "View plan details", "नक्शे की जानकारी देखें")} <span>↗</span></Link></div></div></section>

      <section className="premium-section premium-calculator-section"><div className="premium-section-head"><div><span className="premium-kicker">05 / {L(lang, "ENGINEERING TOOLKIT", "इंजीनियरिंग टूलकिट")}</span><h2>{L(lang, "The right calculation. Right when you need it.", "जरूरत के वक्त सही गणना।")}</h2></div><Link className="premium-text-link" href={langPath(lang, "calculators")}>{L(lang, "All calculators", "सभी कैलकुलेटर")} ↗</Link></div><div className="premium-calculator-grid">{CALCULATORS.slice(0, 8).map((calc, i) => <Link href={langPath(lang, calc.slug)} className="premium-calc-row" key={calc.slug}><span className="premium-calc-icon">{calc.mark}</span><span><b>{calc[lang].name}</b><small>{calc[lang].short}</small></span><span className="premium-calc-arrow">↗</span><span className="premium-calc-index">0{i + 1}</span></Link>)}</div></section>

      <section className="premium-pricing-band"><div><span className="premium-kicker premium-kicker-light">{L(lang, "SIMPLE, TRANSPARENT ACCESS", "सरल और पारदर्शी सुविधाएं")}</span><h2>{L(lang, "Start planning. Upgrade when you need more.", "प्लानिंग शुरू करें। जरूरत पड़ने पर अपग्रेड करें।")}</h2><p>{L(lang, "Explore core calculators, estimates and house plans before choosing a Pro option. Pro features include saved projects, branded reports and supported drawing or bill-reading tools.", "Pro विकल्प चुनने से पहले कैलकुलेटर, एस्टिमेट और घर के नक्शे देखें। Pro में सेव प्रोजेक्ट, ब्रांडेड रिपोर्ट और उपलब्ध ड्रॉइंग या बिल पढ़ने के टूल शामिल हैं।")}</p><Link className="premium-button premium-button-white" href={langPath(lang, "pro")}>{L(lang, "Compare plans and features", "प्लान और सुविधाएं तुलना करें")} <span>↗</span></Link></div><div className="premium-price-card"><span>{L(lang, "PRO OPTIONS · PRICED IN INR", "PRO विकल्प · कीमत INR में")}</span><strong>₹{PLANS.project.inr}<small> / {L(lang, "project", "प्रोजेक्ट")}</small></strong><p>{L(lang, "Or", "या")} ₹{PLANS.month.inr} / {L(lang, "month", "महीना")} · {L(lang, "See the pricing page for the current feature list and billing terms.", "मौजूदा सुविधाओं और बिलिंग शर्तों के लिए प्राइसिंग पेज देखें।")}</p><Link href={langPath(lang, "pro")}>{L(lang, "Review what's included", "शामिल सुविधाएं देखें")} →</Link></div></section>

      <section className="premium-section premium-faq-section"><div className="premium-section-head"><div><span className="premium-kicker">06 / FAQ</span><h2>{L(lang, "Good questions. Clear answers.", "जरूरी सवाल। स्पष्ट जवाब।")}</h2></div><p>{L(lang, "A few things to know before you start your next project.", "अगला प्रोजेक्ट शुरू करने से पहले कुछ बातें जानें।")}</p></div><div className="premium-faq-list">{faqs.map(([q, a]) => <details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></section>
      <section className="premium-final-cta"><span className="premium-kicker premium-kicker-light">BOQFATHER · ENGINEERING WORKSPACE</span><h2>{L(lang, "Make your next estimate a more informed one.", "अपना अगला एस्टिमेट बेहतर जानकारी के साथ बनाएं।")}</h2><p>{L(lang, "Bring the plan, quantities and project costs into focus.", "नक्शे, मात्रा और प्रोजेक्ट लागत को स्पष्ट रूप से समझें।")}</p><Link className="premium-button premium-button-blue" href={langPath(lang, "house-boq-estimate")}>{L(lang, "Start free estimate", "मुफ़्त एस्टिमेट शुरू करें")} <span>↗</span></Link></section>
    </main>
    <SiteFooter lang={lang} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  </>;
}
