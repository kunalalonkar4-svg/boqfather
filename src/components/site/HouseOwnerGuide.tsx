"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  HOUSE_OWNER_STAGES,
  OWNER_GUIDE_CHECKLIST_COUNT,
  OWNER_GUIDE_WARNINGS,
  OWNER_PAYMENT_STAGES,
  type OwnerGuideStage,
} from "@/content/houseOwnerGuide";
import type { Lang } from "@/lib/site";
import { langPath } from "@/lib/site";
import { SiteFooter, SiteHeader } from "./Chrome";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);
const PROGRESS_KEY = "boqfather-house-owner-guide-v1";
const PAYMENT_KEY = "boqfather-house-owner-payments-v1";

type GuideProgress = { checks: Record<string, boolean>; completed: Record<string, boolean> };
type PaymentRow = { agreed: string; completed: string; verified: string; paid: string };

const emptyProgress: GuideProgress = { checks: {}, completed: {} };
const emptyPayment = (): PaymentRow => ({ agreed: "", completed: "", verified: "", paid: "" });
const initialPayments = () => OWNER_PAYMENT_STAGES.map(emptyPayment);
const stageFor = (id: string) => HOUSE_OWNER_STAGES.find((stage) => stage.id === id)!;

function YouTubeLinks({ lang, title }: { lang: Lang; title: string }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const query = (words: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(words)}`;
  const hindiTitle = lang === "hi" ? title : `${title} Hindi`;
  const practicalTitle = `${title} practical site demonstration`;

  async function copyTitle() {
    try {
      await navigator.clipboard.writeText(title);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  }

  return (
    <div className="hog-video-card">
      <div>
        <span className="hog-eyebrow">{L(lang, "LEARN THE WORK", "काम को समझें")}</span>
        <h4>{L(lang, "Watch video tutorials on YouTube", "YouTube पर वीडियो ट्यूटोरियल देखें")}</h4>
        <p>{L(lang, "Opens topic-specific search results. Choose a qualified source and verify advice against your approved project documents.", "इस विषय की search खुलेगी। योग्य source चुनें और सलाह को अपने स्वीकृत प्रोजेक्ट दस्तावेज़ से मिलाएं।")}</p>
      </div>
      <div className="hog-video-actions">
        <a href={query(hindiTitle)} target="_blank" rel="noreferrer">▶ {L(lang, "Search videos in Hindi", "हिंदी में वीडियो खोजें")}</a>
        <a href={query(`${title} construction inspection`)} target="_blank" rel="noreferrer">▶ {L(lang, "Search videos in English", "English में वीडियो खोजें")}</a>
        <a href={query(practicalTitle)} target="_blank" rel="noreferrer">▶ {L(lang, "Practical site demonstration", "साइट पर व्यावहारिक प्रदर्शन")}</a>
        <button type="button" onClick={copyTitle}>{copied ? L(lang, "Topic copied", "विषय कॉपी हुआ") : L(lang, "Copy topic name", "विषय का नाम कॉपी करें")}</button>
      </div>
      {copyError && <p className="hog-inline-error" role="status">{L(lang, "Clipboard access was unavailable. Select and copy the topic name manually.", "Clipboard उपलब्ध नहीं था। विषय का नाम चुनकर कॉपी करें।")}</p>}
    </div>
  );
}

function ContentList({ items, lang }: { items: { en: string; hi: string }[]; lang: Lang }) {
  return <ul>{items.map((item) => <li key={item.en}>{item[lang]}</li>)}</ul>;
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return <section className="hog-detail-card"><h4>{title}</h4>{children}</section>;
}

function ActivityDetail({
  lang,
  stage,
  activityIndex,
  completed,
  onComplete,
}: {
  lang: Lang;
  stage: OwnerGuideStage;
  activityIndex: number;
  completed: boolean;
  onComplete: () => void;
}) {
  const activity = stage.activities[activityIndex];
  const title = activity.title[lang];
  const isHindi = lang === "hi";
  return (
    <section className="hog-activity-detail" id="hog-active-guide" aria-labelledby="hog-activity-title">
      <div className="hog-detail-heading">
        <div>
          <span className="hog-eyebrow">{L(lang, "PRACTICAL ACTIVITY GUIDE", "व्यावहारिक काम की गाइड")}</span>
          <h3 id="hog-activity-title">{title}</h3>
          <p>{L(lang, `Part of ${stage.title.en}. Follow the approved project drawings and specifications for every site-specific dimension and product choice.`, `${stage.title.hi} का हिस्सा। साइट के वास्तविक माप और सामग्री के लिए स्वीकृत प्रोजेक्ट ड्रॉइंग और specification मानें।`)}</p>
        </div>
        <button type="button" className={`hog-complete-button${completed ? " is-complete" : ""}`} onClick={onComplete}>
          {completed ? `✓ ${L(lang, "Completed", "पूरा हुआ")}` : L(lang, "Mark this guide complete", "इस गाइड को पूरा चिन्हित करें")}
        </button>
      </div>
      <div className="hog-detail-grid">
        <DetailSection title={L(lang, "1 · What is this work?", "1 · यह काम क्या है?")}>
          <p>{L(lang, `${title} is one part of ${stage.title.en.toLowerCase()}. It must be coordinated with the approved drawings and the trades that follow.`, `${title} ${stage.title.hi} का एक हिस्सा है। इसे स्वीकृत drawing और इसके बाद काम करने वाली टीमों के साथ मिलाकर करना चाहिए।`)}</p>
        </DetailSection>
        <DetailSection title={L(lang, "2 · Why it matters", "2 · यह क्यों ज़रूरी है")}>
          <p>{L(lang, `${stage.summary.en} A missed check can hide rework, leakage, a service conflict or a cost dispute later.`, `${stage.summary.hi} जांच छूटने से बाद में दोबारा काम, leakage, service conflict या लागत विवाद छिप सकता है।`)}</p>
        </DetailSection>
        <DetailSection title={L(lang, "3 · Correct method — owner overview", "3 · सही तरीका — मालिक के लिए सार")}>
          <ContentList items={stage.method} lang={lang} />
        </DetailSection>
        <DetailSection title={L(lang, "4 · What to inspect", "4 · क्या जांचें")}>
          <ContentList items={stage.inspections} lang={lang} />
        </DetailSection>
        <DetailSection title={L(lang, "5 · Tools to help you observe", "5 · देखने में मदद के औज़ार")}>
          <ContentList items={stage.tools} lang={lang} />
          <p className="hog-note">{L(lang, "Use tools for observation and measurement only. A house owner’s check is not a structural or electrical safety certificate.", "औज़ार सिर्फ देखने और मापने के लिए हैं। घर-मालिक की जांच structural या electrical safety certificate नहीं है।")}</p>
        </DetailSection>
        <DetailSection title={L(lang, "6 · Quality requirements", "6 · गुणवत्ता की शर्तें")}>
          <ContentList items={stage.quality} lang={lang} />
          <p className="hog-note">{L(lang, "Do not copy a dimension, reinforcement detail, concrete grade or test value from a generic guide. The approved project documents and responsible professional control.", "सामान्य गाइड से कोई माप, reinforcement detail, concrete grade या test value न लें। स्वीकृत प्रोजेक्ट दस्तावेज़ और जिम्मेदार विशेषज्ञ ही अंतिम आधार हैं।")}</p>
        </DetailSection>
        <DetailSection title={L(lang, "7 · Common site mistakes", "7 · साइट की आम गलतियां")}>
          <ContentList items={stage.mistakes} lang={lang} />
        </DetailSection>
        <DetailSection title={L(lang, "8 · Warning signs", "8 · चेतावनी के संकेत")}>
          <ContentList items={stage.warnings} lang={lang} />
        </DetailSection>
        <div className="hog-example-grid" aria-label={L(lang, "Good and poor construction practice examples", "अच्छी और खराब निर्माण पद्धति के उदाहरण")}>
          <article><span>✓ {L(lang, "GOOD PRACTICE", "अच्छी पद्धति")}</span><p>{stage.inspections[0][lang]}</p><small>{L(lang, "Confirm against the approved project documents.", "स्वीकृत प्रोजेक्ट दस्तावेज़ से पुष्टि करें।")}</small></article>
          <article><span>! {L(lang, "ASK FOR CORRECTION", "सुधार के लिए पूछें")}</span><p>{stage.mistakes[0][lang]}</p><small>{L(lang, "Reference photos above are not good/bad evidence of this work.", "ऊपर की संदर्भ तस्वीरें इस काम के अच्छे/खराब होने का प्रमाण नहीं हैं।")}</small></article>
        </div>
        <DetailSection title={L(lang, "9–11 · Before, during & after", "9–11 · पहले, काम के दौरान और बाद")}>
          <div className="hog-check-groups">
            {([
              { label: "BEFORE WORK", items: stage.before },
              { label: "DURING WORK", items: stage.during },
              { label: "AFTER WORK", items: stage.after },
            ] satisfies { label: string; items: OwnerGuideStage["before"] }[]).map(({ label, items }) => (
              <div key={label}>
                <b>{isHindi ? ({ "BEFORE WORK": "काम से पहले", "DURING WORK": "काम के दौरान", "AFTER WORK": "काम के बाद" }[label]) : label}</b>
                <ContentList items={items} lang={lang} />
              </div>
            ))}
          </div>
        </DetailSection>
        <DetailSection title={L(lang, "12 · Payment milestone", "12 · भुगतान का milestone")}>
          <dl className="hog-payment-facts">
            <div><dt>{L(lang, "Release only when", "तभी भुगतान करें जब")}</dt><dd>{stage.payment.complete[lang]}</dd></div>
            <div><dt>{L(lang, "Inspect first", "पहले जांचें")}</dt><dd>{stage.payment.inspect[lang]}</dd></div>
            <div><dt>{L(lang, "Verify measurement", "माप की पुष्टि")}</dt><dd>{stage.payment.measure[lang]}</dd></div>
            <div><dt>{L(lang, "Keep these records", "ये रिकॉर्ड रखें")}</dt><dd>{stage.payment.records[lang]}</dd></div>
          </dl>
          <p className="hog-note">{L(lang, "Pay the amount due under your signed agreement after measured work is verified. No universal stage percentage applies to every contract.", "हस्ताक्षरित agreement के अनुसार मापा और जांचा काम होने पर ही देय रकम दें। हर contract पर एक जैसा stage percentage लागू नहीं होता।")}</p>
        </DetailSection>
      </div>
      <YouTubeLinks lang={lang} title={activity.youtube[lang]} />
    </section>
  );
}

export function HouseOwnerGuide({ lang }: { lang: Lang }) {
  const [ready, setReady] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [progress, setProgress] = useState<GuideProgress>(emptyProgress);
  const [payments, setPayments] = useState<PaymentRow[]>(initialPayments);
  const [query, setQuery] = useState("");
  const [activeStageId, setActiveStageId] = useState(HOUSE_OWNER_STAGES[0].id);
  const [activeActivityIndex, setActiveActivityIndex] = useState(0);
  const [worksheetNotice, setWorksheetNotice] = useState("");
  const activeStage = stageFor(activeStageId);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(PROGRESS_KEY);
      const savedPayments = localStorage.getItem(PAYMENT_KEY);
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress) as Partial<GuideProgress>;
        if (parsed.checks && parsed.completed) {
          setProgress({ checks: parsed.checks, completed: parsed.completed });
        }
      }
      if (savedPayments) {
        const parsed = JSON.parse(savedPayments) as PaymentRow[];
        if (Array.isArray(parsed)) {
          setPayments(initialPayments().map((row, index) => ({ ...row, ...(parsed[index] ?? {}) })));
        }
      }
    } catch {
      setStorageAvailable(false);
    }
    setReady(true);
  }, []);

  const totalChecks = OWNER_GUIDE_CHECKLIST_COUNT;
  const checkedCount = Object.values(progress.checks).filter(Boolean).length;
  const completedStages = HOUSE_OWNER_STAGES.filter((stage) =>
    stage.inspections.every((_, index) => progress.checks[`${stage.id}-check-${index}`]),
  ).length;
  const percent = totalChecks ? Math.round((checkedCount / totalChecks) * 100) : 0;
  const normalizedQuery = query.trim().toLocaleLowerCase(lang === "hi" ? "hi-IN" : "en");
  const searchResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return HOUSE_OWNER_STAGES.flatMap((stage) => [
      ...stage.activities.map((activity, index) => ({
        key: activity.id,
        stage,
        activityIndex: index,
        text: activity.title[lang],
        kind: L(lang, "ACTIVITY GUIDE", "काम की गाइड"),
        haystack: `${activity.title.en} ${activity.title.hi} ${activity.youtube.en} ${activity.youtube.hi} ${stage.title.en} ${stage.title.hi}`.toLocaleLowerCase(),
      })),
      ...stage.inspections.map((item, index) => ({
        key: `${stage.id}-check-${index}`,
        stage,
        activityIndex: Math.min(index, stage.activities.length - 1),
        text: item[lang],
        kind: L(lang, "INSPECTION CHECK", "निरीक्षण जांच"),
        haystack: `${item.en} ${item.hi} ${stage.title.en} ${stage.title.hi}`.toLocaleLowerCase(),
      })),
    ]).filter((result) => result.haystack.includes(normalizedQuery)).slice(0, 12);
  }, [lang, normalizedQuery]);

  function persistProgress(next: GuideProgress) {
    setProgress(next);
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
      setStorageAvailable(true);
    } catch {
      setStorageAvailable(false);
    }
  }

  function persistPayments(next: PaymentRow[]) {
    setPayments(next);
    try {
      localStorage.setItem(PAYMENT_KEY, JSON.stringify(next));
      setStorageAvailable(true);
    } catch {
      setStorageAvailable(false);
    }
  }

  function toggleCheck(stageId: string, index: number) {
    const key = `${stageId}-check-${index}`;
    persistProgress({ ...progress, checks: { ...progress.checks, [key]: !progress.checks[key] } });
  }

  function toggleActivity(id: string) {
    persistProgress({ ...progress, completed: { ...progress.completed, [id]: !progress.completed[id] } });
  }

  function selectActivity(stageId: string, activityIndex: number, scroll = false) {
    setActiveStageId(stageId);
    setActiveActivityIndex(activityIndex);
    if (scroll) requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function continueGuide() {
    const next = HOUSE_OWNER_STAGES.find((stage) =>
      !stage.inspections.every((_, index) => progress.checks[`${stage.id}-check-${index}`]),
    ) ?? HOUSE_OWNER_STAGES[0];
    const nextActivity = next.activities.findIndex((activity) => !progress.completed[activity.id]);
    selectActivity(next.id, Math.max(nextActivity, 0), true);
  }

  function downloadChecklist() {
    const lines = [
      L(lang, "BOQFather House Owner Inspection Checklist", "BOQFather घर-मालिक निरीक्षण चेकलिस्ट"),
      `${checkedCount}/${totalChecks} ${L(lang, "checks completed", "जांच पूरी")}`,
      "",
      ...HOUSE_OWNER_STAGES.flatMap((stage) => [
        stage.title[lang],
        ...stage.inspections.map((item, index) => `${progress.checks[`${stage.id}-check-${index}`] ? "[x]" : "[ ]"} ${item[lang]}`),
        "",
      ]),
      L(lang, "Educational guide only. Follow approved drawings, project specifications and qualified professional advice.", "सिर्फ शैक्षणिक गाइड। स्वीकृत drawing, project specification और योग्य विशेषज्ञ की सलाह मानें।"),
    ];
    const file = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "boqfather-house-inspection-checklist.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  function updatePayment(index: number, key: keyof PaymentRow, value: string) {
    const next = payments.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row);
    persistPayments(next);
  }

  const money = (value: string) => {
    const amount = Number(value);
    return Number.isFinite(amount) && amount > 0
      ? `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
      : "—";
  };

  const paymentTotals = payments.reduce((totals, row) => ({
    agreed: totals.agreed + (Number(row.agreed) || 0),
    verified: totals.verified + (Number(row.verified) || 0),
    paid: totals.paid + (Number(row.paid) || 0),
  }), { agreed: 0, verified: 0, paid: 0 });

  const finalStage = stageFor("stage-12");
  const finalChecklist = finalStage.inspections;

  return (
    <>
    <SiteHeader lang={lang} altPath={langPath(lang === "en" ? "hi" : "en", "house-owner-guide")} />
    <main className="hog-page" lang={lang}>
      <section className="hog-hero">
        <div className="hog-hero-backdrop" aria-hidden="true" />
        <div className="hog-hero-content">
          <span className="hog-eyebrow">{L(lang, "BOQFATHER · HOUSE OWNER KNOWLEDGE CENTER", "BOQFATHER · घर-मालिक जानकारी केंद्र")}</span>
          <h1>{L(lang, "Your Complete House Construction Guide", "घर निर्माण की पूरी गाइड")}</h1>
          <p>{L(lang, "Build your home with confidence. Know what to check, when to pay and how to avoid construction mistakes.", "आत्मविश्वास से घर बनवाएं। जानें क्या जांचना है, भुगतान कब करना है और निर्माण की गलतियों से कैसे बचना है।")}</p>
          <div className="hog-hero-actions">
            <button type="button" onClick={continueGuide}>{L(lang, "Continue where you left off", "जहां छोड़ा था, वहीं से आगे बढ़ें")} <span aria-hidden="true">→</span></button>
            <a href="#hog-stages">{L(lang, "Explore all 12 stages", "सभी 12 चरण देखें")} ↓</a>
          </div>
        </div>
        <div className="hog-progress-card">
          <div className="hog-progress-top"><div><span className="hog-eyebrow">{L(lang, "YOUR CONSTRUCTION JOURNEY", "आपकी निर्माण यात्रा")}</span><strong>{percent}%</strong></div><span>{checkedCount}/{totalChecks} {L(lang, "checks", "जांच")}</span></div>
          <div className="hog-progress-track" role="progressbar" aria-label={L(lang, "Construction journey progress", "निर्माण यात्रा की प्रगति")} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percent}%` }} /></div>
          <div className="hog-journey-dots" aria-label={L(lang, "Twelve construction stages", "निर्माण के बारह चरण")}>{HOUSE_OWNER_STAGES.map((stage, index) => <button key={stage.id} type="button" aria-label={`${index + 1}. ${stage.title[lang]}`} aria-current={stage.id === activeStageId ? "step" : undefined} className={stage.inspections.every((_, checkIndex) => progress.checks[`${stage.id}-check-${checkIndex}`]) ? "is-done" : stage.id === activeStageId ? "is-active" : ""} onClick={() => selectActivity(stage.id, 0, true)}>{String(index + 1).padStart(2, "0")}</button>)}</div>
        </div>
      </section>

      <div className="hog-content">
        <section className="hog-stat-grid" aria-label={L(lang, "Guide overview", "गाइड का सार")}>
          <article><span>{L(lang, "TOTAL STAGES", "कुल चरण")}</span><strong>12</strong><small>{L(lang, "Plot to handover", "प्लॉट से handover तक")}</small></article>
          <article><span>{L(lang, "COMPLETED", "पूरे हुए")}</span><strong>{completedStages}</strong><small>{L(lang, "Stages with all checks ticked", "सभी जांच पूरे हुए चरण")}</small></article>
          <article><span>{L(lang, "PENDING", "बाकी")}</span><strong>{12 - completedStages}</strong><small>{L(lang, "Stages to review", "जांचने के बाकी चरण")}</small></article>
          <article className="is-alert"><span>{L(lang, "INSPECTION ALERTS", "निरीक्षण चेतावनी")}</span><strong>{OWNER_GUIDE_WARNINGS.length}</strong><small>{L(lang, "Critical hold points to review", "ध्यान देने योग्य जरूरी जांच")}</small></article>
        </section>

        <section className="hog-search-card" aria-label={L(lang, "Search the guide", "गाइड में खोजें")}>
          <label htmlFor="hog-search">{L(lang, "Search anything about house construction…", "घर निर्माण के बारे में कुछ भी खोजें…")}</label>
          <div className="hog-search-input"><span aria-hidden="true">⌕</span><input id="hog-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={L(lang, "Try “slab reinforcement”, “bathroom slope” or “contractor payment”", "“slab reinforcement”, “bathroom slope” या “contractor payment” खोजें")} /><kbd>⌕</kbd></div>
          {normalizedQuery && <div className="hog-search-results" role="region" aria-live="polite" aria-label={L(lang, "Search results", "खोज के नतीजे")}>
            {searchResults.length ? searchResults.map((result) => <button type="button" key={result.key} onClick={() => { selectActivity(result.stage.id, result.activityIndex, true); setQuery(""); }}><span>{result.text}</span><small>{result.kind} · {result.stage.title[lang]}</small></button>) : <p>{L(lang, "No exact match. Try a stage name, material or inspection keyword.", "सटीक नतीजा नहीं मिला। चरण, सामग्री या जांच का शब्द खोजें।")}</p>}
            {["payment", "pay", "भुगतान", "contractor"].some((word) => normalizedQuery.includes(word)) && <a href="#hog-payments">{L(lang, "Open the contractor payment guide →", "ठेकेदार भुगतान गाइड खोलें →")}</a>}
          </div>}
        </section>

        {!storageAvailable && <p className="hog-storage-warning" role="status">{L(lang, "This browser could not save your progress. Keep a downloaded copy of your checklist.", "इस browser में प्रगति सेव नहीं हो सकी। चेकलिस्ट डाउनलोड करके रखें।")}</p>}

        <section className="hog-alert-section" aria-labelledby="hog-alert-title">
          <div className="hog-section-heading"><div><span className="hog-eyebrow">{L(lang, "STOP & VERIFY", "रुकें और जांचें")}</span><h2 id="hog-alert-title">{L(lang, "Important site inspection alerts", "साइट निरीक्षण की जरूरी चेतावनी")}</h2></div><p>{L(lang, "Pause work at these hold points until the responsible professional has checked and recorded acceptance.", "इन जरूरी पड़ावों पर काम रोककर responsible professional से जांच और स्वीकृति दर्ज कराएं।")}</p></div>
          <div className="hog-alert-grid">{OWNER_GUIDE_WARNINGS.map((warning, index) => {
            const stage = stageFor(warning.stageId);
            return <button type="button" key={index} onClick={() => selectActivity(stage.id, warning.activityIndex, true)}><span aria-hidden="true">!</span><b>{warning[lang]}</b><small>{stage.title[lang]} · {stage.activities[warning.activityIndex].title[lang]} ↗</small></button>;
          })}</div>
        </section>

        <section id="hog-stages" className="hog-stage-section" aria-labelledby="hog-stages-title">
          <div className="hog-section-heading"><div><span className="hog-eyebrow">{L(lang, "YOUR BUILD, STEP BY STEP", "आपका निर्माण, चरण-दर-चरण")}</span><h2 id="hog-stages-title">{L(lang, "The complete construction journey", "निर्माण की पूरी यात्रा")}</h2></div><div className="hog-tools"><button type="button" onClick={downloadChecklist}>↓ {L(lang, "Download checklist", "चेकलिस्ट डाउनलोड करें")}</button><button type="button" onClick={() => window.print()}>⎙ {L(lang, "Print / save PDF", "प्रिंट / PDF सेव करें")}</button></div></div>
          <div className="hog-stage-layout">
            <nav className="hog-stage-nav" aria-label={L(lang, "Construction stages", "निर्माण के चरण")}>
              {HOUSE_OWNER_STAGES.map((stage, index) => {
                const stageDone = stage.inspections.every((_, checkIndex) => progress.checks[`${stage.id}-check-${checkIndex}`]);
                const stageChecked = stage.inspections.filter((_, checkIndex) => progress.checks[`${stage.id}-check-${checkIndex}`]).length;
                return <button type="button" key={stage.id} aria-current={activeStageId === stage.id ? "step" : undefined} className={activeStageId === stage.id ? "is-active" : ""} onClick={() => selectActivity(stage.id, 0)}><span>{String(index + 1).padStart(2, "0")}</span><b>{stage.title[lang]}</b><small>{stageDone ? `✓ ${L(lang, "Complete", "पूरा")}` : `${stageChecked}/${stage.inspections.length} ${L(lang, "checks", "जांच")}`}</small></button>;
              })}
            </nav>
            <div className="hog-stage-detail" ref={detailRef}>
              <div className="hog-stage-banner">
                <img src={activeStage.image} alt={activeStage.imageAlt[lang]} loading="lazy" />
                <div><span className="hog-eyebrow">{L(lang, `STAGE ${activeStage.id.slice(-2)}`, `चरण ${activeStage.id.slice(-2)}`)}</span><h3>{activeStage.title[lang]}</h3><p>{activeStage.summary[lang]}</p><small>{activeStage.photoCredit} · {L(lang, "Reference image only—not site evidence", "सिर्फ संदर्भ तस्वीर—साइट का प्रमाण नहीं")}</small></div>
              </div>
              <div className="hog-activity-browser">
                <div><span className="hog-eyebrow">{L(lang, "ACTIVITY GUIDES", "काम की गाइड")}</span><p>{L(lang, "Choose any activity to open its practical guide, checklist and topic-specific video searches.", "व्यावहारिक गाइड, checklist और इसी विषय के video search के लिए कोई काम चुनें।")}</p></div>
                <div className="hog-activity-list">{activeStage.activities.map((activity, index) => <button type="button" key={activity.id} aria-pressed={activeActivityIndex === index} className={activeActivityIndex === index ? "is-selected" : ""} onClick={() => setActiveActivityIndex(index)}><span>{progress.completed[activity.id] ? "✓" : String(index + 1).padStart(2, "0")}</span>{activity.title[lang]}<b aria-hidden="true">↗</b></button>)}</div>
              </div>
              <div className="hog-inspection-panel">
                <div className="hog-inspection-heading"><div><span className="hog-eyebrow">{L(lang, "SITE INSPECTION CHECKLIST", "साइट निरीक्षण चेकलिस्ट")}</span><h4>{activeStage.title[lang]} · {L(lang, "Owner checks", "मालिक की जांच")}</h4></div><span>{activeStage.inspections.filter((_, index) => progress.checks[`${activeStage.id}-check-${index}`]).length}/{activeStage.inspections.length}</span></div>
                <div className="hog-checklist-items">{activeStage.inspections.map((item, index) => {
                  const key = `${activeStage.id}-check-${index}`;
                  return <label key={key} className={progress.checks[key] ? "is-checked" : ""}><input type="checkbox" checked={!!progress.checks[key]} onChange={() => toggleCheck(activeStage.id, index)} /><span>{item[lang]}</span></label>;
                })}</div>
              </div>
              <ActivityDetail lang={lang} stage={activeStage} activityIndex={activeActivityIndex} completed={!!progress.completed[activeStage.activities[activeActivityIndex]?.id]} onComplete={() => toggleActivity(activeStage.activities[activeActivityIndex].id)} />
            </div>
          </div>
        </section>

        <section id="hog-payments" className="hog-payment-section" aria-labelledby="hog-payment-title">
          <div className="hog-section-heading"><div><span className="hog-eyebrow">{L(lang, "CONTRACT-FIRST PAYMENT GUIDE", "समझौते के अनुसार भुगतान गाइड")}</span><h2 id="hog-payment-title">{L(lang, "When & how much should I pay my contractor?", "ठेकेदार को भुगतान कब और कितना करें?")}</h2></div><p>{L(lang, "Pay only for agreed, completed and measured work. This tracker is an editable worksheet—not a universal payment schedule.", "सिर्फ तय, पूरे और मापे गए काम का भुगतान करें। यह बदलने योग्य worksheet है—सार्वभौमिक payment schedule नहीं।")}</p></div>
          <div className="hog-payment-rules">
            <article><b>01</b><strong>{L(lang, "Follow the signed agreement", "हस्ताक्षरित समझौता मानें")}</strong><p>{L(lang, "No fixed stage percentage suits every contract. Use its payment terms and approved variations.", "हर contract पर एक जैसा stage percentage लागू नहीं होता। उसकी payment terms और approved बदलाव मानें।")}</p></article>
            <article><b>02</b><strong>{L(lang, "Verify the running bill", "Running bill जांचें")}</strong><p>{L(lang, "Compare measured quantities, agreed rates, prior bills, advances and receipts before release.", "भुगतान से पहले मापी मात्रा, तय rate, पिछले bill, advance और रसीद मिलाएं।")}</p></article>
            <article><b>03</b><strong>{L(lang, "Keep contractual retention", "Contract वाला retention रखें")}</strong><p>{L(lang, "Hold back only what the agreement allows, until its defect and handover conditions are met.", "सिर्फ agreement में तय रकम रोकें, और उसकी defect/handover शर्त पूरी होने पर दें।")}</p></article>
          </div>
          <p className="hog-payment-warning">⚠ {L(lang, "Never pay 100% before work completion, measured-bill verification and agreed inspection. Do not invent a retention percentage—use the signed contract.", "काम पूरा होने, measured bill जांच और तय inspection से पहले 100% भुगतान न करें। Retention का प्रतिशत खुद तय न करें—हस्ताक्षरित contract मानें।")}</p>
          <div className="hog-payment-table-wrap">
            <table className="hog-payment-table">
              <caption>{L(lang, "Illustrative, editable worksheet—enter amounts from your own agreement and measured bills. No default percentages are set. Amounts are saved in this browser.", "उदाहरण के लिए बदलने योग्य worksheet—अपने समझौते और measured bill की रकम भरें। कोई default percentage नहीं है। रकम इसी browser में सेव होती है।")}</caption>
              <thead><tr><th>{L(lang, "MILESTONE", "MILESTONE")}</th><th>{L(lang, "AGREED AMOUNT · ₹", "तय रकम · ₹")}</th><th>{L(lang, "WORK COMPLETED · ₹", "पूरा काम · ₹")}</th><th>{L(lang, "VERIFIED AMOUNT · ₹", "जांची रकम · ₹")}</th><th>{L(lang, "PAID · ₹", "भुगतान · ₹")}</th><th>{L(lang, "UNPAID AGREED BALANCE", "बाकी तय रकम")}</th></tr></thead>
              <tbody>{OWNER_PAYMENT_STAGES.map((milestone, index) => {
                const row = payments[index] ?? emptyPayment();
                const balance = Math.max(0, (Number(row.agreed) || 0) - (Number(row.paid) || 0));
                const linkedStage = stageFor(milestone.stageId);
                return <tr key={`${milestone.stageId}-${index}`}><th scope="row"><button type="button" onClick={() => selectActivity(linkedStage.id, 0, true)}>{index + 1}. {milestone[lang]}<small>{L(lang, "Open inspection guide", "निरीक्षण गाइड खोलें")} ↗</small></button></th>{(["agreed", "completed", "verified", "paid"] as const).map((field) => <td key={field}><label className="sr-only" htmlFor={`payment-${index}-${field}`}>{`${milestone[lang]} · ${field}`}</label><input id={`payment-${index}-${field}`} type="number" min="0" step="0.01" inputMode="decimal" placeholder="0.00" value={row[field]} onChange={(event) => updatePayment(index, field, event.target.value)} /></td>)}<td>{money(String(balance))}</td></tr>;
              })}</tbody>
              <tfoot><tr><th scope="row">{L(lang, "Entered totals (INR)", "दर्ज रकम का कुल (INR)")}</th><td>{money(String(paymentTotals.agreed))}</td><td>—</td><td>{money(String(paymentTotals.verified))}</td><td>{money(String(paymentTotals.paid))}</td><td>{money(String(Math.max(0, paymentTotals.agreed - paymentTotals.paid)))}</td></tr></tfoot>
            </table>
          </div>
          <div className="hog-payment-detail-grid">{OWNER_PAYMENT_STAGES.map((milestone, index) => {
            const stage = stageFor(milestone.stageId);
            return <details key={`${milestone.stageId}-detail-${index}`}><summary>{index + 1}. {milestone[lang]}<span>+</span></summary><dl><div><dt>{L(lang, "Complete first", "पहले पूरा हो")}</dt><dd>{stage.payment.complete[lang]}</dd></div><div><dt>{L(lang, "Inspect & measure", "जांचें और नापें")}</dt><dd>{stage.payment.inspect[lang]} {stage.payment.measure[lang]}</dd></div><div><dt>{L(lang, "Collect records", "रिकॉर्ड लें")}</dt><dd>{stage.payment.records[lang]}</dd></div></dl><p>{L(lang, "Release only the amount due under the signed agreement for verified work. Amounts and retention are contract-specific.", "जांचे काम की सिर्फ वही रकम दें जो हस्ताक्षरित समझौते में देय हो। रकम और retention हर contract में अलग हैं।")}</p></details>;
          })}</div>
        </section>

        <section className="hog-handover-section" aria-labelledby="hog-handover-title">
          <div className="hog-section-heading"><div><span className="hog-eyebrow">{L(lang, "THE LAST WALK-THROUGH", "आखिरी निरीक्षण")}</span><h2 id="hog-handover-title">{L(lang, "Final house handover checklist", "घर handover की अंतिम चेकलिस्ट")}</h2></div><p>{L(lang, "Save this device-local list, print it or download a plain-text copy to take to site.", "यह सूची इसी device पर सेव करें, print करें या साइट के लिए text copy डाउनलोड करें।")}</p></div>
          <div className="hog-handover-card"><div className="hog-handover-progress"><span>{finalChecklist.filter((_, index) => progress.checks[`stage-12-check-${index}`]).length}/{finalChecklist.length} {L(lang, "handover checks", "handover जांच")}</span><div className="hog-progress-track"><span style={{ width: `${100 * finalChecklist.filter((_, index) => progress.checks[`stage-12-check-${index}`]).length / finalChecklist.length}%` }} /></div></div><div className="hog-handover-grid">{finalChecklist.map((item, index) => {
            const key = `stage-12-check-${index}`;
            return <label key={key} className={progress.checks[key] ? "is-checked" : ""}><input type="checkbox" checked={!!progress.checks[key]} onChange={() => toggleCheck("stage-12", index)} /><span>{item[lang]}</span></label>;
          })}</div><div className="hog-tools"><button type="button" onClick={downloadChecklist}>↓ {L(lang, "Download full checklist", "पूरी चेकलिस्ट डाउनलोड करें")}</button><button type="button" onClick={() => window.print()}>⎙ {L(lang, "Print / save PDF", "प्रिंट / PDF सेव करें")}</button></div></div>
          <p className="hog-safety-note"><b>{L(lang, "Important safety boundary", "सुरक्षा की जरूरी सीमा")}</b>{L(lang, " This is general educational guidance for owners, not engineering approval, legal advice or a safety certificate. Never change structural work based on a video or this guide alone. Stop for unsafe formwork, significant cracks, settlement, electrical hazards or unexpected ground conditions and contact the responsible qualified professional.", " यह मालिकों के लिए सामान्य शैक्षणिक जानकारी है—engineering approval, legal advice या safety certificate नहीं। केवल video या इस guide के आधार पर structural काम न बदलें। असुरक्षित formwork, बड़ी crack, settlement, electrical खतरे या जमीन की अनपेक्षित स्थिति पर काम रोककर जिम्मेदार योग्य विशेषज्ञ से संपर्क करें।")}</p>
        </section>
      </div>
      {!ready && <span className="hog-loading-status" role="status">{L(lang, "Loading saved guide progress…", "सेव की गई गाइड प्रगति लोड हो रही है…")}</span>}
    </main>
    <SiteFooter lang={lang} />
    </>
  );
}
