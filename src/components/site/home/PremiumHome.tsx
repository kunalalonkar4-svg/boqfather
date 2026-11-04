import Link from "next/link";
import { CALCULATORS } from "@/content/calculators";
import { getNaksha, nakshaInfo, nakshaPlan, nakshaPreview } from "@/content/naksha";
import { t } from "@/i18n/ui";
import { langPath, type Lang, SITE_NAME, SITE_URL } from "@/lib/site";
import { SiteFooter, SiteHeader } from "../Chrome";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/** Premium editorial home page built from the same live planning and BOQ engines as the app. */
export function PremiumHome({ lang }: { lang: Lang }) {
  const d = t(lang);
  const plan = getNaksha("30x40-east-facing");
  if (!plan) throw new Error("Featured house plan is unavailable");
  const info = nakshaInfo(plan);
  const preview = nakshaPreview(plan);
  const { res } = nakshaPlan(plan);
  const materials = res.materials;
  const material = (key: string) => materials.find((x) => x.key === key)?.qty ?? 0;
  const rows = res.sections.flatMap((section) => section.items.map((item) => ({
    code: item.code,
    description: item.name,
    qty: item.qty,
    unit: item.unit,
    rate: item.rate,
    amount: item.amount,
  }))).slice(0, 5);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}${langPath(lang)}`,
    inLanguage: lang === "hi" ? "hi-IN" : "en-IN",
    description: d.home_sub,
  };
  const tools = [
    { mark: "01", name: L(lang, "House cost estimator", "घर निर्माण लागत"), desc: L(lang, "Build a project estimate from your plot, rooms and specification.", "प्लॉट, कमरे और स्पेसिफिकेशन से प्रोजेक्ट एस्टिमेट बनाएं।"), href: "house-construction-cost-calculator" },
    { mark: "02", name: L(lang, "Item-wise BOQ", "आइटम-वार BOQ"), desc: L(lang, "Quantities, rates, Measurement Book and material totals in one workspace.", "एक ही वर्कस्पेस में मात्रा, रेट, मेज़रमेंट बुक और सामग्री का हिसाब।"), href: "house-boq-estimate" },
    { mark: "03", name: L(lang, "Plan to estimate", "नक्शे से एस्टिमेट"), desc: L(lang, "Upload a drawing, verify every room, then continue into your estimate.", "ड्रॉइंग अपलोड करें, हर कमरे को जांचें और एस्टिमेट बनाएं।"), href: "plan-to-estimate" },
    { mark: "04", name: L(lang, "Contractor quote checker", "ठेकेदार कोटेशन जांचें"), desc: L(lang, "Compare quoted rates with market references before you sign.", "साइन करने से पहले कोट किए गए रेट की तुलना करें।"), href: "contractor-quote-checker" },
  ];
  const workflow = [
    [L(lang, "Set up a project", "प्रोजेक्ट बनाएं"), L(lang, "Enter your plot, floors and project details.", "प्लॉट, मंज़िल और प्रोजेक्ट जानकारी दर्ज करें।")],
    [L(lang, "Add a plan", "नक्शा जोड़ें"), L(lang, "Choose a house plan or upload a drawing to read.", "घर का नक्शा चुनें या ड्रॉइंग अपलोड करें।")],
    [L(lang, "Verify dimensions", "माप जांचें"), L(lang, "Review room names and measurements before calculations.", "गणना से पहले कमरे के नाम और माप जांचें।")],
    [L(lang, "Review the quantities", "मात्रा की समीक्षा करें"), L(lang, "Inspect BOQ, measurement sheets, steel schedule and materials.", "BOQ, मेज़रमेंट शीट, स्टील शेड्यूल और सामग्री जांचें।")],
    [L(lang, "Export your report", "रिपोर्ट डाउनलोड करें"), L(lang, "Download the available project reports in PDF or Excel.", "उपलब्ध प्रोजेक्ट रिपोर्ट PDF या Excel में डाउनलोड करें।")],
  ];
  const faqs = [
    [L(lang, "What can I do with BOQFather?", "BOQFather पर क्या कर सकते हैं?"), L(lang, "Plan a house, estimate construction costs, review item-wise quantities, calculate materials and steel, and export project reports.", "घर प्लान करें, निर्माण लागत का अनुमान लगाएं, आइटम-वार मात्रा, सामग्री और स्टील की गणना करें और रिपोर्ट डाउनलोड करें।")],
    [L(lang, "Can I use my own drawing?", "क्या मैं अपना नक्शा इस्तेमाल कर सकता हूं?"), L(lang, "Yes. Upload an AutoCAD DXF drawing or, where available, a plan photo or PDF. Review extracted room information before using it in an estimate.", "हां। AutoCAD DXF ड्रॉइंग या उपलब्ध होने पर नक्शे की फ़ोटो अथवा PDF अपलोड करें। एस्टिमेट में उपयोग से पहले निकाली गई जानकारी जांचें।")],
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
            <span className="premium-eyebrow"><i />{L(lang, "ENGINEERING YOUR NEXT BUILD", "आपके अगले निर्माण की इंजीनियरिंग")}</span>
            <h1>{L(lang, "Every construction calculation.", "निर्माण की हर गणना।")}<span>{L(lang, "One intelligent platform.", "एक इंटेलिजेंट प्लेटफ़ॉर्म।")}</span></h1>
            <p>{L(lang, "From the first floor plan to a measured BOQ, BOQFather brings house planning, construction estimates and practical engineering tools into one clear workspace.", "पहले फ़्लोर प्लान से मापे गए BOQ तक, BOQFather घर की प्लानिंग, निर्माण एस्टिमेट और इंजीनियरिंग टूल एक स्पष्ट वर्कस्पेस में लाता है।")}</p>
            <div className="premium-hero-actions">
              <Link className="premium-button premium-button-blue" href={langPath(lang, "house-boq-estimate")}>{L(lang, "Start free estimate", "मुफ़्त एस्टिमेट शुरू करें")} <span>↗</span></Link>
              <Link className="premium-button premium-button-outline" href="#platform">{L(lang, "Explore the platform", "प्लेटफ़ॉर्म देखें")} <span>↓</span></Link>
            </div>
            <div className="premium-proof"><span className="premium-check">✓</span>{L(lang, "Built around real engineering workflows", "वास्तविक इंजीनियरिंग वर्कफ़्लो के लिए बनाया गया")}</div>
          </div>
          <div className="premium-hero-visual">
            <div className="premium-house-frame">
              <img src="/home/hero-house.webp" alt={L(lang, "Architectural visualization of a contemporary home", "आधुनिक घर का आर्किटेक्चरल 3D दृश्य")} fetchPriority="high" />
              <div className="premium-image-caption"><span className="premium-live-dot" />{L(lang, "PROJECT VISUALIZATION", "प्रोजेक्ट विज़ुअलाइज़ेशन")}<span>30 × 40 · G+1</span></div>
            </div>
            <div className="premium-float-card premium-cost-card"><span className="premium-card-label">{L(lang, "ESTIMATED PROJECT COST", "अनुमानित प्रोजेक्ट लागत")}</span><strong>{inr(info.total)}</strong><small>{L(lang, "Illustrative live estimate · standard finish", "उदाहरण लाइव एस्टिमेट · स्टैंडर्ड फिनिश")}</small><div className="premium-cost-line"><span>{L(lang, "Built-up area", "बिल्ट-अप एरिया")}</span><b>{Math.round(info.builtUp).toLocaleString("en-IN")} sq ft</b></div></div>
            <div className="premium-float-card premium-material-card"><span className="premium-card-label">{L(lang, "MATERIAL SNAPSHOT", "सामग्री सारांश")}</span><div><span className="premium-material-icon">C</span><span>{L(lang, "Cement", "सीमेंट")}</span><b>{Math.round(material("cement")).toLocaleString("en-IN")} {L(lang, "bags", "बैग")}</b></div><div><span className="premium-material-icon premium-steel-icon">S</span><span>{L(lang, "Steel", "स्टील")}</span><b>{(material("steel") / 1000).toFixed(1)} t</b></div></div>
            <div className="premium-orbit-label"><span>⌘</span>{L(lang, "PLAN · MEASURE · BUILD", "प्लान · माप · निर्माण")}</div>
          </div>
        </div>
        <div className="premium-trust-strip"><span>{L(lang, "ONE WORKSPACE", "एक वर्कस्पेस")}</span><i />{L(lang, "House planning", "घर की प्लानिंग")}<i />{L(lang, "Quantity estimation", "मात्रा का अनुमान")}<i />{L(lang, "Professional exports", "प्रोफेशनल रिपोर्ट")}</div>
      </section>

      <section id="platform" className="premium-section premium-platform">
        <div className="premium-section-head"><div><span className="premium-kicker">01 / {L(lang, "THE PLATFORM", "प्लेटफ़ॉर्म")}</span><h2>{L(lang, "Engineering clarity at every stage.", "हर चरण में इंजीनियरिंग की स्पष्टता।")}</h2></div><p>{L(lang, "The tools you need to move from an early idea to quantities you can review, refine and share.", "शुरुआती विचार से लेकर जांचने, सुधारने और साझा करने योग्य मात्रा तक, जरूरी टूल एक जगह।")}</p></div>
        <div className="premium-tool-grid">{tools.map((tool) => <Link className="premium-tool-card" href={langPath(lang, tool.href)} key={tool.mark}><span className="premium-tool-number">{tool.mark}</span><span className="premium-tool-arrow">↗</span><h3>{tool.name}</h3><p>{tool.desc}</p><span className="premium-tool-link">{L(lang, "Explore tool", "टूल देखें")} <span>→</span></span></Link>)}</div>
      </section>

      <section className="premium-section premium-workflow-section"><div className="premium-section-head"><div><span className="premium-kicker">02 / {L(lang, "FROM DRAWING TO BOQ", "ड्रॉइंग से BOQ")}</span><h2>{L(lang, "A connected workflow. Your work stays yours.", "एक जुड़ा हुआ वर्कफ़्लो। आपका काम, आपका नियंत्रण।")}</h2></div><Link className="premium-text-link" href={langPath(lang, "plan-to-estimate")}>{L(lang, "Open drawing workflow", "ड्रॉइंग वर्कफ़्लो खोलें")} ↗</Link></div>
        <ol className="premium-steps">{workflow.map(([title, desc], i) => <li key={title}><span className="premium-step-index">0{i + 1}</span><span className="premium-step-rule" /><h3>{title}</h3><p>{desc}</p></li>)}</ol>
      </section>

      <section className="premium-section premium-boq-section"><div className="premium-boq-intro"><span className="premium-kicker premium-kicker-light">03 / {L(lang, "A CLOSER LOOK", "एक नज़दीकी नज़र")}</span><h2>{L(lang, "See the numbers behind the build.", "निर्माण के पीछे के आंकड़े देखें।")}</h2><p>{L(lang, "An example generated by the existing house-planning and estimate engine. Review the project before using any quantities for construction.", "मौजूदा घर-प्लानिंग और एस्टिमेट इंजन से बनाया गया उदाहरण। निर्माण के लिए मात्रा इस्तेमाल करने से पहले प्रोजेक्ट जांचें।")}</p><Link className="premium-button premium-button-white" href={langPath(lang, "house-boq-estimate")}>{L(lang, "Build an item-wise BOQ", "आइटम-वार BOQ बनाएं")} <span>↗</span></Link><div className="premium-boq-metrics"><div><span>{L(lang, "BUILT-UP AREA", "बिल्ट-अप एरिया")}</span><b>{Math.round(info.builtUp).toLocaleString("en-IN")} <small>sq ft</small></b></div><div><span>{L(lang, "CEMENT", "सीमेंट")}</span><b>{Math.round(material("cement")).toLocaleString("en-IN")} <small>{L(lang, "bags", "बैग")}</small></b></div><div><span>{L(lang, "STEEL", "स्टील")}</span><b>{(material("steel") / 1000).toFixed(1)} <small>t</small></b></div></div></div>
        <div className="premium-table-wrap"><div className="premium-table-top"><div><span className="premium-table-mark">BF</span><span><b>{L(lang, "BOQ · WORKING ABSTRACT", "BOQ · लागत सारांश")}</b><small>30 × 40 · {L(lang, "East-facing · G+1", "पूर्व मुखी · G+1")}</small></span></div><span className="premium-table-status"><i />{L(lang, "ENGINE-ESTIMATED", "इंजन से अनुमानित")}</span></div><div className="premium-table-overflow"><table className="premium-sample-table"><thead><tr><th>{L(lang, "ITEM", "आइटम")}</th><th>{L(lang, "QTY", "मात्रा")}</th><th>{L(lang, "UNIT", "यूनिट")}</th><th>{L(lang, "RATE", "दर")}</th><th>{L(lang, "AMOUNT", "रकम")}</th></tr></thead><tbody>{rows.map((row) => <tr key={row.code}><td><span className="premium-item-code">{row.code}</span>{row.description}</td><td>{Number(row.qty).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td><td>{row.unit}</td><td>{inr(Number(row.rate))}</td><td>{inr(Number(row.amount))}</td></tr>)}</tbody></table></div><div className="premium-table-total"><span>{L(lang, "Estimated construction total", "अनुमानित निर्माण लागत")}<small>{L(lang, "Illustrative · standard finish", "उदाहरण · स्टैंडर्ड फिनिश")}</small></span><b>{inr(info.total)}</b></div></div>
      </section>

      <section className="premium-section premium-visual-section"><div className="premium-section-head"><div><span className="premium-kicker">04 / {L(lang, "VISUALIZE THE PLAN", "नक्शे को देखें")}</span><h2>{L(lang, "From a measured plan to a clearer picture.", "मापे गए नक्शे से एक स्पष्ट तस्वीर तक।")}</h2></div><p>{L(lang, "Explore house plans with detailed 2D layouts and architectural visualization. Your selected plan carries through to a real estimate.", "विस्तृत 2D लेआउट और आर्किटेक्चरल विज़ुअलाइज़ेशन के साथ घर के नक्शे देखें। चुना गया नक्शा वास्तविक एस्टिमेट में इस्तेमाल करें।")}</p></div><div className="premium-plan-showcase"><div className="premium-plan-image"><img src={preview.src} alt={L(lang, "3D architectural house plan preview", "घर के नक्शे का 3D आर्किटेक्चरल प्रीव्यू")} loading="lazy" /><span className="premium-view-chip">{preview.is3d ? "3D · LIVE PLAN" : "2D · FLOOR PLAN"}</span></div><div className="premium-plan-details"><span className="premium-kicker">{L(lang, "FEATURED PROJECT", "विशेष प्रोजेक्ट")}</span><h3>30 × 40 <span>{L(lang, "East-facing home", "पूर्व मुखी घर")}</span></h3><div className="premium-detail-row"><span>{L(lang, "Configuration", "कॉन्फ़िगरेशन")}</span><b>G+1 · {info.bhk} BHK</b></div><div className="premium-detail-row"><span>{L(lang, "Built-up area", "बिल्ट-अप एरिया")}</span><b>{Math.round(info.builtUp).toLocaleString("en-IN")} sq ft</b></div><div className="premium-detail-row"><span>{L(lang, "Estimated total", "अनुमानित कुल")}</span><b>{inr(info.total)}</b></div><Link className="premium-plan-link" href={langPath(lang, `naksha/${plan.slug}`)}>{L(lang, "View plan details", "नक्शे की जानकारी देखें")} <span>↗</span></Link></div></div></section>

      <section className="premium-section premium-calculator-section"><div className="premium-section-head"><div><span className="premium-kicker">05 / {L(lang, "ENGINEERING TOOLKIT", "इंजीनियरिंग टूलकिट")}</span><h2>{L(lang, "The right calculation. Right when you need it.", "जरूरत के वक्त सही गणना।")}</h2></div><Link className="premium-text-link" href={langPath(lang, "calculators")}>{L(lang, "All calculators", "सभी कैलकुलेटर")} ↗</Link></div><div className="premium-calculator-grid">{CALCULATORS.slice(0, 8).map((calc, i) => <Link href={langPath(lang, calc.slug)} className="premium-calc-row" key={calc.slug}><span className="premium-calc-icon">{calc.mark}</span><span><b>{calc[lang].name}</b><small>{calc[lang].short}</small></span><span className="premium-calc-arrow">↗</span><span className="premium-calc-index">0{i + 1}</span></Link>)}</div></section>

      <section className="premium-pricing-band"><div><span className="premium-kicker premium-kicker-light">{L(lang, "SIMPLE, TRANSPARENT ACCESS", "सरल और पारदर्शी सुविधाएं")}</span><h2>{L(lang, "Start planning. Upgrade when you need more.", "प्लानिंग शुरू करें। जरूरत पड़ने पर अपग्रेड करें।")}</h2><p>{L(lang, "Core calculators, estimates and house plans are available to explore. Optional Pro features include clean branded reports, saved projects and AI drawing or bill reading.", "मुख्य कैलकुलेटर, एस्टिमेट और घर के नक्शे उपलब्ध हैं। वैकल्पिक Pro सुविधाओं में ब्रांडेड रिपोर्ट, सेव किए गए प्रोजेक्ट और AI ड्रॉइंग या बिल रीडिंग शामिल हैं।")}</p><Link className="premium-button premium-button-white" href={langPath(lang, "pro")}>{L(lang, "Explore plans", "प्लान देखें")} <span>↗</span></Link></div><div className="premium-price-card"><span>{L(lang, "PRO MONTHLY", "PRO मासिक")}</span><strong>₹499<small> / {L(lang, "month", "महीना")}</small></strong><p>{L(lang, "For active projects, polished exports and additional project tools.", "चलते प्रोजेक्ट, बेहतर रिपोर्ट और अतिरिक्त प्रोजेक्ट टूल के लिए।")}</p><Link href={langPath(lang, "pro")}>{L(lang, "View what's included", "शामिल सुविधाएं देखें")} →</Link></div></section>

      <section className="premium-section premium-faq-section"><div className="premium-section-head"><div><span className="premium-kicker">06 / FAQ</span><h2>{L(lang, "Good questions. Clear answers.", "जरूरी सवाल। स्पष्ट जवाब।")}</h2></div><p>{L(lang, "A few things to know before you start your next project.", "अगला प्रोजेक्ट शुरू करने से पहले कुछ बातें जानें।")}</p></div><div className="premium-faq-list">{faqs.map(([q, a]) => <details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></section>
      <section className="premium-final-cta"><span className="premium-kicker premium-kicker-light">BOQFATHER · ENGINEERING WORKSPACE</span><h2>{L(lang, "Make your next estimate a more informed one.", "अपना अगला एस्टिमेट बेहतर जानकारी के साथ बनाएं।")}</h2><p>{L(lang, "Bring the plan, quantities and project costs into focus.", "नक्शे, मात्रा और प्रोजेक्ट लागत को स्पष्ट रूप से समझें।")}</p><Link className="premium-button premium-button-blue" href={langPath(lang, "house-boq-estimate")}>{L(lang, "Start free estimate", "मुफ़्त एस्टिमेट शुरू करें")} <span>↗</span></Link></section>
    </main>
    <SiteFooter lang={lang} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  </>;
}
