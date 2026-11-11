import Link from "next/link";
import { Cta, H2, Shell } from "./SeoPages";
import { JourneyDiagram } from "./JourneyDiagrams";
import { PrintButton } from "./PrintButton";
import { GUIDE_BASE } from "@/content/guideTopics";
import {
  AGREEMENT_FAQS,
  AGREEMENT_PAGE,
  AGREEMENT_SLUG,
  CLAUSES,
  AGREEMENT_TYPES,
  EARLIER,
  getStage,
  PAYMENT_EXAMPLE,
  RED_FLAGS,
  SAMPLE_PAGE,
  SAMPLE_PARTS,
  SAMPLE_SIGN,
  SAMPLE_SLUG,
  STAGES,
  stageIndex,
  type T,
} from "@/content/journey";
import { ytUrl } from "@/content/checklist";
import { NAKSHE, nakshaPlan } from "@/content/naksha";
import { Lang, langPath } from "@/lib/site";

const pick = (v: T, lang: Lang): string => (v as unknown as Record<string, string | undefined>)[lang] ?? v.en;
const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);

export const journeyTitle = (slug: string, lang: Lang) => {
  const s = getStage(slug);
  if (s) return pick(s.metaTitle, lang);
  return pick(slug === AGREEMENT_SLUG ? AGREEMENT_PAGE.metaTitle : SAMPLE_PAGE.metaTitle, lang);
};
export const journeyDescription = (slug: string, lang: Lang) => {
  const s = getStage(slug);
  if (s) return pick(s.description, lang);
  return pick(slug === AGREEMENT_SLUG ? AGREEMENT_PAGE.description : SAMPLE_PAGE.description, lang);
};

const gp = (lang: Lang, slug: string) => langPath(lang, `${GUIDE_BASE}/${slug}`);

function Bullets({ items, lang, mark }: { items: T[]; lang: Lang; mark?: "check" | "warn" }) {
  return (
    <ul className="flex max-w-3xl flex-col gap-2.5">
      {items.map((x) => (
        <li key={x.en} className="flex gap-3 text-[16px] leading-relaxed text-body">
          <span
            aria-hidden="true"
            className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] text-[12px] font-extrabold ${
              mark === "warn" ? "bg-[#fde8e6] text-[#b42318]" : "bg-[#e6efff] text-amber-dark"
            }`}
          >
            {mark === "warn" ? "!" : "✓"}
          </span>
          <span>{pick(x, lang)}</span>
        </li>
      ))}
    </ul>
  );
}

/** Where the money goes at this stage, from the sample G+1 house (standard finish) in the engine. */
function CostShare({ codes, lang }: { codes: string[]; lang: Lang }) {
  const n = NAKSHE.find((x) => x.slug.startsWith("30x40")) ?? NAKSHE[0];
  const { res } = nakshaPlan(n);
  const sum = res.sections.reduce((a: number, s: { subtotal: number }) => a + s.subtotal, 0);
  const rows = res.sections.filter((s: { code: string }) => codes.includes(s.code)) as {
    code: string;
    title: T;
    subtotal: number;
  }[];
  if (!rows.length || !sum) return null;
  const part = rows.reduce((a, s) => a + s.subtotal, 0);
  const pct = Math.round((part / sum) * 100);
  return (
    <section className="flex max-w-3xl flex-col gap-3 rounded-[14px] border border-line bg-[#f4f7fb] p-5">
      <H2>{L(lang, "How much of the budget this stage takes", "बजट का कितना हिस्सा इस चरण में जाता है")}</H2>
      <p className="text-[16px] leading-relaxed text-body">
        {L(
          lang,
          `In this site's sample G+1 house (${n.plot.w}×${n.plot.d} ft plot, standard finish) the items for this stage are about ${pct}% of the construction cost: ${rows.map((r) => pick(r.title, lang)).join(", ")}. Your own share will differ with design and rates.`,
          `इस साइट के सैंपल G+1 घर (${n.plot.w}×${n.plot.d} ft प्लॉट, स्टैंडर्ड फ़िनिश) में इस चरण के आइटम निर्माण लागत का लगभग ${pct}% हैं: ${rows.map((r) => pick(r.title, lang)).join(", ")}। आपका हिस्सा डिज़ाइन और रेट के साथ बदलेगा।`,
        )}
      </p>
    </section>
  );
}

function Video({ stage, lang }: { stage: { yt: string; video?: string }; lang: Lang }) {
  const url = ytUrl(stage);
  const id = stage.video?.match(/(?:v=|youtu\.be\/)([\w-]{11})/)?.[1];
  return (
    <section className="flex max-w-3xl flex-col gap-3">
      <H2>{L(lang, "Watch how it is done", "देखें यह कैसे होता है")}</H2>
      {id ? (
        <div className="aspect-video overflow-hidden rounded-[14px] border border-line bg-black">
          <iframe
            title={L(lang, "Video for this stage", "इस चरण का वीडियो")}
            src={`https://www.youtube-nocookie.com/embed/${id}`}
            loading="lazy"
            allow="encrypted-media; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      ) : (
        <p className="text-[16px] leading-relaxed text-body">
          {L(
            lang,
            "Search YouTube for site videos of this stage in Hindi:",
            "इस चरण के साइट वीडियो हिंदी में YouTube पर खोजें:",
          )}{" "}
          <a href={url} target="_blank" rel="noopener noreferrer" className="font-bold text-ink underline decoration-amber decoration-2 underline-offset-4">
            {L(lang, "Open YouTube search", "YouTube सर्च खोलें")}
          </a>
        </p>
      )}
    </section>
  );
}

function Roadmap({ lang, current }: { lang: Lang; current: number }) {
  const items = [
    ...EARLIER.map((e) => ({ n: e.n, slug: e.slug, label: pick(e.short, lang) })),
    ...STAGES.map((s) => ({ n: s.n, slug: s.slug, label: pick(s.short, lang) })),
  ];
  const phases: { en: string; hi: string; from: number; to: number }[] = [
    { en: "Plan and paperwork", hi: "योजना और काग़ज़ात", from: 1, to: 5 },
    { en: "Build the structure", hi: "ढांचा बनाना", from: 6, to: 10 },
    { en: "Services and finishing", hi: "फिनिशिंग का काम", from: 11, to: 13 },
    { en: "Handover", hi: "हैंडओवर", from: 14, to: 14 },
  ];
  return (
    <nav aria-label={L(lang, "All 14 stages", "सभी 14 चरण")} className="grid gap-4 lg:grid-cols-2">
      {phases.map((ph) => (
        <div key={ph.from} className="rounded-xl border border-line bg-white p-5">
          <p className="mb-3 text-[15px] font-bold text-amber-dark">
            {L(lang, ph.en, ph.hi)}
          </p>
          <ol className="relative flex flex-col gap-1 before:absolute before:bottom-4 before:left-[15px] before:top-4 before:w-px before:bg-line">
            {items
              .filter((it) => it.n >= ph.from && it.n <= ph.to)
              .map((it) => (
                <li key={it.slug} className="relative">
                  <Link
                    href={gp(lang, it.slug)}
                    aria-current={it.n === current ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-lg px-1.5 py-2 text-[15px] font-semibold transition hover:bg-[#eef5ff] ${
                      it.n === current ? "bg-[#eef5ff]" : ""
                    }`}
                  >
                    <span
                      className={`relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${
                        it.n === current ? "bg-amber text-white" : "border border-[#b9cdea] bg-[#eef5ff] text-steel"
                      }`}
                    >
                      {it.n}
                    </span>
                    {it.label}
                  </Link>
                </li>
              ))}
          </ol>
        </div>
      ))}
    </nav>
  );
}

export { Roadmap };

function PrevNext({ lang, slug }: { lang: Lang; slug: string }) {
  const i = stageIndex(slug);
  const prev = i > 0 ? STAGES[i - 1] : null;
  const next = i < STAGES.length - 1 ? STAGES[i + 1] : null;
  const prevHref = prev ? gp(lang, prev.slug) : gp(lang, "contractor-agreement");
  const prevLabel = prev ? pick(prev.short, lang) : pick(EARLIER[4].short, lang);
  return (
    <nav className="grid max-w-3xl gap-3 sm:grid-cols-2" aria-label={L(lang, "Next and previous stage", "अगला और पिछला चरण")}>
      <Link href={prevHref} className="flex flex-col gap-1 rounded-lg border border-line bg-white px-4 py-3 hover:border-amber">
        <span className="text-[12px] font-semibold text-muted">{L(lang, "← Previous stage", "← पिछला चरण")}</span>
        <span className="text-[15px] font-semibold">{prevLabel}</span>
      </Link>
      {next ? (
        <Link href={gp(lang, next.slug)} className="flex flex-col gap-1 rounded-lg border border-line bg-white px-4 py-3 hover:border-amber">
          <span className="text-[12px] font-semibold text-muted">{L(lang, "Next stage →", "अगला चरण →")}</span>
          <span className="text-[15px] font-semibold">{pick(next.short, lang)}</span>
        </Link>
      ) : (
        <Link href={langPath(lang, GUIDE_BASE)} className="flex flex-col gap-1 rounded-lg border border-line bg-white px-4 py-3 hover:border-amber">
          <span className="text-[12px] font-semibold text-muted">{L(lang, "Done", "पूरा")}</span>
          <span className="text-[15px] font-semibold">{L(lang, "Back to the full guide", "पूरी गाइड पर वापस")}</span>
        </Link>
      )}
    </nav>
  );
}

function StagePage({ lang, slug }: { lang: Lang; slug: string }) {
  const s = getStage(slug)!;
  const path = `${GUIDE_BASE}/${slug}`;
  const faqs = s.faqs.map((f) => ({ q: pick(f.q, lang), a: pick(f.a, lang) }));
  return (
    <Shell
      lang={lang}
      path={path}
      crumbs={[
        { name: L(lang, "House building guide", "घर बनाने की गाइड"), path: GUIDE_BASE },
        { name: pick(s.short, lang) },
      ]}
      h1={pick(s.title, lang)}
      intro={
        <>
          <p>
            <span className="font-semibold text-amber-dark">{L(lang, `Stage ${s.n} of 14`, `चरण ${s.n} / 14`)}</span> ·{" "}
            {pick(s.time, lang)}
          </p>
          <p className="mt-3">{pick(s.lead, lang)}</p>
        </>
      }
      faqs={faqs}
    >
      {s.hold && (
        <p className="max-w-3xl rounded-[10px] border-l-4 border-amber bg-[#eef5ff] px-5 py-4 text-[16px] font-semibold leading-relaxed text-ink">
          {pick(s.hold, lang)}
        </p>
      )}
      <section className="flex flex-col gap-4">
        <H2>{L(lang, "What you need to know", "आपको क्या जानना चाहिए")}</H2>
        <div className="flex max-w-3xl flex-col gap-3 text-[16px] leading-relaxed text-body">
          {s.know.map((k) => (
            <p key={k.en}>{pick(k, lang)}</p>
          ))}
        </div>
      </section>
      {s.diagram && <JourneyDiagram kind={s.diagram} lang={lang} />}
      <section className="flex flex-col gap-4">
        <H2>{L(lang, "Check this before you move on", "आगे बढ़ने से पहले यह जांचें")}</H2>
        <Bullets items={s.check} lang={lang} />
      </section>
      <section className="flex flex-col gap-4">
        <H2>{L(lang, "Common mistakes", "आम ग़लतियां")}</H2>
        <Bullets items={s.mistakes} lang={lang} mark="warn" />
      </section>
      {s.boq?.length ? <CostShare codes={s.boq} lang={lang} /> : null}
      <Video stage={s} lang={lang} />
      <section className="flex max-w-3xl flex-col gap-3">
        <H2>{L(lang, "Tools for this stage", "इस चरण के टूल")}</H2>
        <ul className="flex flex-col gap-2">
          {s.tools.map((tl) => (
            <li key={tl.path}>
              <Link href={langPath(lang, tl.path)} className="text-[16px] font-bold text-ink underline decoration-amber decoration-2 underline-offset-4 hover:text-amber-dark">
                {pick(tl.label, lang)}
              </Link>
            </li>
          ))}
        </ul>
        <Cta href={langPath(lang, "house-boq-estimate")}>{L(lang, "Make my item-wise BOQ", "मेरा आइटम-वार BOQ बनाएं")}</Cta>
      </section>
      <section className="flex flex-col gap-4">
        <H2>{L(lang, "All 14 stages", "सभी 14 चरण")}</H2>
        <Roadmap lang={lang} current={s.n} />
      </section>
      <PrevNext lang={lang} slug={slug} />
    </Shell>
  );
}

function AgreementPage({ lang }: { lang: Lang }) {
  const faqs = AGREEMENT_FAQS.map((f) => ({ q: pick(f.q, lang), a: pick(f.a, lang) }));
  return (
    <Shell
      lang={lang}
      path={`${GUIDE_BASE}/${AGREEMENT_SLUG}`}
      crumbs={[
        { name: L(lang, "House building guide", "घर बनाने की गाइड"), path: GUIDE_BASE },
        { name: L(lang, "Contractor agreement format", "ठेकेदार एग्रीमेंट फ़ॉर्मेट") },
      ]}
      h1={pick(AGREEMENT_PAGE.title, lang)}
      intro={
        <p>
          {L(
            lang,
            "Twelve groups of clauses that protect a house owner, in plain words. Use it as a checklist when you read the contractor's draft, then fill in the blanks of the sample agreement.",
            "बारह तरह के क्लॉज़ जो घर मालिक की सुरक्षा करते हैं, सरल शब्दों में। ठेकेदार का मसौदा पढ़ते समय इसे चेकलिस्ट की तरह इस्तेमाल करें, फिर सैंपल एग्रीमेंट के ख़ाली स्थान भरें।",
          )}
        </p>
      }
      faqs={faqs}
    >
      <section className="flex flex-col gap-4">
        <H2>{L(lang, "Three common ways to hire", "काम देने के तीन आम तरीक़े")}</H2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {AGREEMENT_TYPES.map((a) => (
            <li key={a.h.en} className="flex flex-col gap-1.5 rounded-[12px] border border-line bg-white p-4">
              <h3 className="text-[17px] font-extrabold leading-snug">{pick(a.h, lang)}</h3>
              <p className="text-[14.5px] leading-relaxed text-body">{pick(a.d, lang)}</p>
              <p className="text-[14px] leading-relaxed text-[#5a5a5a]">{pick(a.when, lang)}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="flex flex-col gap-6">
        <H2>{L(lang, "What the agreement must contain", "एग्रीमेंट में क्या होना चाहिए")}</H2>
        {CLAUSES.map((c) => (
          <div key={c.h.en} className="flex max-w-3xl flex-col gap-2.5">
            <h3 className="text-[19px] font-extrabold">{pick(c.h, lang)}</h3>
            <Bullets items={c.items} lang={lang} />
          </div>
        ))}
      </section>
      <section className="flex max-w-3xl flex-col gap-4">
        <H2>{L(lang, "Example: stage-wise payment plan", "उदाहरण: स्टेज-वार भुगतान योजना")}</H2>
        <p className="text-[16px] leading-relaxed text-body">
          {L(lang, "This is only an example for a G+1 house. Agree your own percentages with your engineer.", "यह सिर्फ़ G+1 घर का उदाहरण है। अपने प्रतिशत इंजीनियर के साथ तय करें।")}
        </p>
        <div className="overflow-x-auto rounded-[12px] border border-line">
          <table className="w-full min-w-[420px] text-left text-[15px]">
            <caption className="sr-only">{L(lang, "Example stage-wise payment plan", "उदाहरण स्टेज-वार भुगतान योजना")}</caption>
            <thead className="bg-[#f4f7fb] text-[13px]">
              <tr>
                <th scope="col" className="px-4 py-2.5">{L(lang, "Stage reached", "पहुंचा हुआ चरण")}</th>
                <th scope="col" className="px-4 py-2.5 text-right">{L(lang, "Payment", "भुगतान")}</th>
              </tr>
            </thead>
            <tbody>
              {PAYMENT_EXAMPLE.map((r) => (
                <tr key={r.stage.en} className="border-t border-line">
                  <td className="px-4 py-2.5">{pick(r.stage, lang)}</td>
                  <td className="px-4 py-2.5 text-right font-bold tabular-nums">{r.pct}%</td>
                </tr>
              ))}
              <tr className="border-t border-line bg-[#f4f7fb] font-bold">
                <td className="px-4 py-2.5">{L(lang, "Total", "कुल")}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{PAYMENT_EXAMPLE.reduce((a, r) => a + r.pct, 0)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <H2>{L(lang, "Red flags", "चेतावनी के संकेत")}</H2>
        <Bullets items={RED_FLAGS} lang={lang} mark="warn" />
      </section>
      <section className="flex max-w-3xl flex-col gap-3">
        <Link href={gp(lang, SAMPLE_SLUG)} className="text-[17px] font-bold underline decoration-amber decoration-2 underline-offset-4">
          {L(lang, "Open the sample agreement with blanks →", "ख़ाली स्थान वाला सैंपल एग्रीमेंट खोलें →")}
        </Link>
        <p className="text-[14px] leading-relaxed text-[#5a5a5a]">{pick(AGREEMENT_PAGE.disclaimer, lang)}</p>
      </section>
      <section className="flex flex-col gap-4">
        <H2>{L(lang, "All 14 stages", "सभी 14 चरण")}</H2>
        <Roadmap lang={lang} current={5} />
      </section>
    </Shell>
  );
}

function SamplePage({ lang }: { lang: Lang }) {
  return (
    <Shell
      lang={lang}
      path={`${GUIDE_BASE}/${SAMPLE_SLUG}`}
      crumbs={[
        { name: L(lang, "House building guide", "घर बनाने की गाइड"), path: GUIDE_BASE },
        { name: L(lang, "Contractor agreement format", "ठेकेदार एग्रीमेंट फ़ॉर्मेट"), path: `${GUIDE_BASE}/${AGREEMENT_SLUG}` },
        { name: L(lang, "Sample agreement", "सैंपल एग्रीमेंट") },
      ]}
      h1={pick(SAMPLE_PAGE.title, lang)}
      intro={
        <p>
          {L(
            lang,
            "A short sample you can print or save as a PDF, then fill in by hand. It covers the ten points that matter most. For the reasons behind each, read the clause guide.",
            "छोटा सैंपल जिसे आप प्रिंट कर सकते हैं या PDF में सेव करके हाथ से भर सकते हैं। इसमें सबसे ज़रूरी दस बातें हैं। हर बात का कारण समझने के लिए क्लॉज़ गाइड पढ़ें।",
          )}
        </p>
      }
    >
      <div className="no-print flex flex-wrap items-center gap-4">
        <PrintButton label={L(lang, "Print or save as PDF", "प्रिंट करें या PDF सेव करें")} />
        <Link href={gp(lang, AGREEMENT_SLUG)} className="text-[15px] font-bold underline decoration-amber decoration-2 underline-offset-4">
          {L(lang, "Clause-by-clause guide", "क्लॉज़-वार गाइड")}
        </Link>
      </div>
      <article className="max-w-3xl rounded-[14px] border border-line bg-white p-5 sm:p-8 print:border-0 print:p-0">
        <h2 className="font-display text-[24px] font-extrabold leading-tight">
          {L(lang, "House Construction Agreement", "घर निर्माण एग्रीमेंट")}
        </h2>
        <div className="mt-5 flex flex-col gap-5">
          {SAMPLE_PARTS.map((p) => (
            <section key={p.h.en}>
              <h3 className="text-[17px] font-extrabold">{pick(p.h, lang)}</h3>
              <p className="mt-1.5 text-[15.5px] leading-[1.75] text-body">{pick(p.text, lang)}</p>
            </section>
          ))}
          <p className="mt-4 border-t border-line pt-5 text-[15px] leading-[2.2] text-body">{L(lang, SAMPLE_SIGN.en, SAMPLE_SIGN.hi)}</p>
        </div>
      </article>
      <p className="max-w-3xl text-[14px] leading-relaxed text-[#5a5a5a]">{pick(AGREEMENT_PAGE.disclaimer, lang)}</p>
    </Shell>
  );
}

export function JourneyPage({ lang, slug }: { lang: Lang; slug: string }) {
  if (slug === AGREEMENT_SLUG) return <AgreementPage lang={lang} />;
  if (slug === SAMPLE_SLUG) return <SamplePage lang={lang} />;
  return <StagePage lang={lang} slug={slug} />;
}

/** The 14-stage roadmap block for the guide hub. */
export function JourneyRoadmap({ lang }: { lang: Lang }) {
  return (
    <section className="flex flex-col gap-4">
      <H2>{L(lang, "Zero to move-in: the 14 stages", "शून्य से गृह-प्रवेश तक: 14 चरण")}</H2>
      <p className="max-w-3xl text-[16px] leading-relaxed text-body">
        {L(
          lang,
          "Follow the stages in order. Each page tells you what to know, what to check before you move on, the common mistakes and where to watch a video.",
          "चरण क्रम से चलें। हर पेज बताता है कि क्या जानना है, आगे बढ़ने से पहले क्या जांचना है, आम ग़लतियां और वीडियो कहां देखना है।",
        )}
      </p>
      <Roadmap lang={lang} current={0} />
    </section>
  );
}
