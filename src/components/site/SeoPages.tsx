import Link from "next/link";
import type { ReactNode } from "react";
import { calcHouse, QUALITY_RATES, ROOM_DEFS, RoomType } from "@/engine";
import {
  getQuestion,
  getTopic,
  GUIDE_BASE,
  QUESTIONS,
  TOPICS,
} from "@/content/guideTopics";
import {
  buildableSqft,
  ftIn,
  getPlot,
  inr,
  lakh,
  plotArea,
  plotEstimate,
  plotRooms,
  PLOTS,
  plotSlug,
  plotSummary,
  SQFT_SIZES,
  sqftSlug,
} from "@/content/plots";
import { name, t } from "@/i18n/ui";
import { FACING_NAME, NAKSHE } from "@/content/naksha";
import { Lang, langPath, SITE_NAME, SITE_URL } from "@/lib/site";
import HouseCalc from "@/components/calcs/HouseCalc";
import { CHECKLIST, CHECKLIST_COUNT, ytUrl } from "@/content/checklist";
import { Checklist } from "./ChecklistClient";
import { SiteFooter, SiteHeader } from "./Chrome";
import { PlotPlanPreview } from "./PlotPlanPreview";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);
const num = (n: number, d = 0) =>
  n.toLocaleString("en-IN", { maximumFractionDigits: d });

/* ---------------------------------------------------------------- shell */

type Crumb = { name: string; path?: string };

export function Shell({
  lang,
  path,
  crumbs,
  h1,
  intro,
  faqs,
  faqsHidden,
  children,
}: {
  lang: Lang;
  path: string;
  crumbs: Crumb[];
  h1: string;
  intro: ReactNode;
  faqs?: { q: string; a: string }[];
  /** Only in the structured data (the page shows the answer itself). */
  faqsHidden?: boolean;
  children: ReactNode;
}) {
  const all: Crumb[] = [{ name: SITE_NAME, path: "/" }, ...crumbs];
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: all.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: `${SITE_URL}${langPath(lang, c.path ?? path)}`,
      })),
    },
    ...(faqs?.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]
      : []),
  ];
  return (
    <>
      <SiteHeader
        lang={lang}
        altPath={langPath(lang === "en" ? "hi" : "en", path)}
      />
      <main lang={lang} className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_1px_1px,rgba(22,24,26,0.07)_1px,transparent_0)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
        <nav
          aria-label="Breadcrumb"
          className="w-fit max-w-full truncate rounded-full border border-line bg-white/80 px-3.5 py-1.5 text-[13px] text-muted shadow-sm"
        >
          {all.map((c, i) => (
            <span key={c.name}>
              {i > 0 && <span className="mx-1.5">/</span>}
              {c.path && i < all.length - 1 ? (
                <Link href={langPath(lang, c.path)} className="hover:text-ink">
                  {c.name}
                </Link>
              ) : (
                <span className="text-ink">{c.name}</span>
              )}
            </span>
          ))}
        </nav>
        <div className="mb-10 mt-6 flex max-w-3xl flex-col gap-4">
          <h1 className="font-display text-[34px] font-extrabold leading-[1.06] tracking-tight [text-wrap:balance] sm:text-[48px]">
            {h1}
          </h1>
          <div className="text-[17px] leading-relaxed text-body sm:text-[18px]">
            {intro}
          </div>
        </div>
        <div className="flex flex-col gap-14">{children}</div>
        {faqs?.length && !faqsHidden ? <Faqs lang={lang} faqs={faqs} /> : null}
        <p className="mb-16 mt-12 max-w-3xl rounded-2xl border border-[#f0dfae] bg-warn-tint px-5 py-4 text-[13px] leading-relaxed text-[#4a3b12]">
          {t(lang).disclaimer}
        </p>
        </div>
      </main>
      <SiteFooter lang={lang} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-display text-[26px] font-extrabold leading-tight tracking-tight [text-wrap:balance] sm:text-[32px]">
      {children}
    </h2>
  );
}

export function Faqs({
  lang,
  faqs,
}: {
  lang: Lang;
  faqs: { q: string; a: string }[];
}) {
  return (
    <section className="mt-16 max-w-3xl">
      <H2>{t(lang).faq}</H2>
      <div className="mt-4 flex flex-col gap-2">
        {faqs.map((f) => (
          <details
            key={f.q}
            className="group rounded-2xl border border-line bg-white px-5 py-4 transition open:pb-5 open:shadow-sm hover:border-[#d6d0c4]"
          >
            <summary className="cursor-pointer list-none text-[16px] font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
              <span className="flex items-start justify-between gap-3">
                {f.q}
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-tint text-[18px] text-amber-dark transition group-open:rotate-45"
                >
                  +
                </span>
              </span>
            </summary>
            <p className="mt-2 text-[14px] leading-relaxed text-body">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Stats({ items }: { items: [string, string][] }) {
  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map(([k, v]) => (
        <div
          key={k}
          className="flex flex-col gap-1.5 rounded-[20px] border border-line bg-white px-5 py-4 shadow-[0_8px_24px_-16px_rgba(22,24,26,0.25)]"
        >
          <dt className="text-[12px] font-bold uppercase tracking-[0.08em] text-muted">
            {k}
          </dt>
          <dd className="font-display text-[22px] font-extrabold leading-tight sm:text-[26px]">
            {v}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function Table({
  head,
  rows,
  caption,
}: {
  head: string[];
  rows: ReactNode[][];
  caption?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-[20px] border border-line bg-white shadow-[0_8px_24px_-18px_rgba(22,24,26,0.3)]">
      <table className="w-full min-w-[480px] border-collapse text-[14px]">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="bg-[#eef4fb] text-left">
            {head.map((h, i) => (
              <th
                key={h}
                scope="col"
                className={
                  "px-4 py-2.5 font-semibold " + (i > 0 ? "text-right" : "")
                }
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-line">
              {r.map((c, j) => (
                <td
                  key={j}
                  className={
                    "px-4 py-2.5 " +
                    (j > 0 ? "text-right tabular-nums" : "font-medium")
                  }
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Cta({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-12 w-fit items-center gap-2 rounded-2xl bg-ink px-6 text-[15px] font-bold text-white shadow-[0_10px_30px_-12px_rgba(22,24,26,0.6)] transition hover:-translate-y-0.5"
    >
      {children}
    </Link>
  );
}

export function LinkGrid({
  links,
}: {
  links: { href: string; title: string; sub: string; current?: boolean }[];
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {links.map((l) => (
        <li key={l.href}>
          <Link
            href={l.href}
            aria-current={l.current ? "page" : undefined}
            className={
              "flex h-full flex-col gap-0.5 rounded-2xl border bg-white px-4 py-3.5 transition hover:-translate-y-0.5 hover:border-amber hover:shadow-md " +
              (l.current ? "border-amber" : "border-line")
            }
          >
            <span className="font-display text-[17px] font-extrabold">
              {l.title}
            </span>
            <span className="text-[13px] text-muted">{l.sub}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ---------------------------------------------------------------- plot pages */

const ROOM_EXTRA: Record<string, [string, string]> = {
  porch: ["Porch", "पोर्च"],
  open: ["Open sit-out", "खुला सिट-आउट"],
  dress: ["Dress", "ड्रेस"],
};
const roomLabel = (type: string, floor: number, lang: Lang, mFt = 30) => {
  if (type === "open" && floor > 0 && mFt < 5.25)
    return L(lang, "Dry balcony", "ड्राई बालकनी");
  if (type === "porch" && mFt < 4.9) return L(lang, "Entrance", "प्रवेश");
  if (type === "open" && floor > 0) return L(lang, "Open terrace", "खुली छत");
  if (ROOM_EXTRA[type]) return L(lang, ...ROOM_EXTRA[type]);
  if (type in ROOM_DEFS)
    return ROOM_DEFS[type as RoomType].name[lang]
      .replace(" / living", "")
      .replace(" / bath", "")
      .replace(" / लिविंग", "")
      .replace(" / बाथ", "");
  return type;
};
const FLOORS = (i: number, lang: Lang) =>
  lang === "hi"
    ? ["ग्राउंड फ़्लोर", "पहली मंज़िल", "दूसरी मंज़िल"][i]
    : ["Ground floor", "First floor", "Second floor"][i];

export const plotTitle = (slug: string, lang: Lang) => {
  const p = getPlot(slug)!;
  const s = `${p.w}×${p.d}`;
  return L(
    lang,
    `${s} House Plan (${plotArea(p)} sq ft) with Cost Estimate`,
    `${s} घर का नक्शा (${plotArea(p)} sq ft) और बनाने का खर्च`,
  );
};
export const plotDescription = (slug: string, lang: Lang) => {
  const p = getPlot(slug)!;
  const g1 = plotSummary(p, 2);
  const s = `${p.w}×${p.d}`;
  return L(
    lang,
    `${s} plot house plan: G+1 ${p.bhk}BHK with parking, drawn to scale, ground and first floor. Construction cost about ${lakh(g1.total, "en")} for ${num(g1.builtUp)} sq ft, with cement, steel and brick quantities.`,
    `${s} प्लॉट का नक्शा: पार्किंग के साथ G+1 ${p.bhk}BHK, स्केल पर ग्राउंड और पहली मंज़िल। ${num(g1.builtUp)} sq ft बनाने का खर्च लगभग ${lakh(g1.total, "hi")}, सीमेंट, सरिया और ईंट की मात्रा के साथ।`,
  );
};

export function PlotPage({ lang, slug }: { lang: Lang; slug: string }) {
  const p = getPlot(slug)!;
  const s = `${p.w}×${p.d}`;
  const path = `house-plan/${slug}`;
  const g1 = plotSummary(p, 2);
  const g2 = plotSummary(p, 3);
  const { fit } = plotEstimate(p, 2);
  const floorsRooms = plotRooms(p, 2);
  const bw = p.w - 2 * p.side,
    bd = p.d - p.front - p.back;
  const gaj = plotArea(p) / 9;
  const hasParking = fit.floorRooms[0].some((r) => r.type === "parking");
  const tool = `${langPath(lang, "house-boq-estimate")}?w=${p.w}&d=${p.d}&bhk=${p.bhk}&floors=2&front=${p.front}&back=${p.back}&side=${p.side}&facing=E`;
  const setbackText = L(
    lang,
    `${p.front} ft in front, ${p.back} ft at the back${p.side ? ` and ${p.side} ft on each side` : " and none on the sides"}`,
    `आगे ${p.front} ft, पीछे ${p.back} ft${p.side ? ` और दोनों बगल ${p.side}-${p.side} ft` : " और बगल में कुछ नहीं"}`,
  );
  const mat = (k: string) => g1.materials.find((m) => m.key === k);
  const cement = mat("cement"),
    steel = mat("steel");

  const faqs = [
    {
      q: L(
        lang,
        `How much does it cost to build a house on a ${s} plot?`,
        `${s} प्लॉट पर घर बनाने में कितना खर्च आएगा?`,
      ),
      a: L(
        lang,
        `A G+1 house of about ${num(g1.builtUp)} sq ft built-up on a ${s} plot costs about ${lakh(g1.total, "en")} at standard finish (${lakh(g1.basic, "en")} basic to ${lakh(g1.premium, "en")} premium) in a tier-2 city, material and labour together. A G+2 house of ${num(g2.builtUp)} sq ft costs about ${lakh(g2.total, "en")}.`,
        `${s} प्लॉट पर लगभग ${num(g1.builtUp)} sq ft बिल्ट-अप का G+1 घर टियर-2 शहर में स्टैंडर्ड फ़िनिश में लगभग ${lakh(g1.total, "hi")} (बेसिक ${lakh(g1.basic, "hi")} से प्रीमियम ${lakh(g1.premium, "hi")}) में बनता है — सामग्री और मज़दूरी मिलाकर। ${num(g2.builtUp)} sq ft का G+2 घर लगभग ${lakh(g2.total, "hi")} में।`,
      ),
    },
    {
      q: L(
        lang,
        `How many bedrooms can be built on a ${s} plot?`,
        `${s} प्लॉट में कितने बेडरूम बन सकते हैं?`,
      ),
      a: L(
        lang,
        `With setbacks of ${setbackText}, each floor can be about ${bw} × ${bd} ft. A G+1 house fits ${p.bhk} bedrooms${hasParking ? " with car parking" : ""}; a G+2 house can take one or two more.`,
        `${setbackText} सेटबैक छोड़कर हर मंज़िल लगभग ${bw} × ${bd} ft की बनती है। G+1 में ${p.bhk} बेडरूम${hasParking ? " कार पार्किंग के साथ" : ""} आते हैं; G+2 में एक-दो और।`,
      ),
    },
    ...(cement && steel
      ? [
          {
            q: L(
              lang,
              `How much cement and steel for a ${s} G+1 house?`,
              `${s} G+1 घर में कितना सीमेंट और सरिया लगेगा?`,
            ),
            a: L(
              lang,
              `About ${num(cement.qty)} bags of cement and ${num(steel.qty)} kg (${num(steel.qty / 1000, 1)} tonnes) of steel for this plan, worked out item by item from the BOQ. Add 3–5% for wastage when ordering.`,
              `इस नक्शे में लगभग ${num(cement.qty)} बोरी सीमेंट और ${num(steel.qty)} किलो (${num(steel.qty / 1000, 1)} टन) सरिया — BOQ से आइटम-वार निकाला गया। ऑर्डर करते समय 3–5% वेस्टेज जोड़ें।`,
            ),
          },
        ]
      : []),
    {
      q: L(
        lang,
        `Is this plan right for an east or north facing ${s} plot?`,
        `क्या यह नक्शा पूर्व या उत्तर मुखी ${s} प्लॉट के लिए ठीक है?`,
      ),
      a: L(
        lang,
        "The road is at the bottom of the drawing, so the plan works for any facing. Open the plan in the BOQ tool, pick your road direction and the north arrow turns with it; move rooms there if you follow vastu.",
        "ड्रॉइंग में सड़क नीचे है, इसलिए नक्शा किसी भी दिशा के लिए चलता है। BOQ टूल में नक्शा खोलें, सड़क की दिशा चुनें तो उत्तर का तीर उसी हिसाब से घूमता है; वास्तु मानते हैं तो कमरे वहीं बदलें।",
      ),
    },
    {
      q: L(
        lang,
        `How long will a ${s} G+1 house take to build?`,
        `${s} G+1 घर बनने में कितना समय लगेगा?`,
      ),
      a: L(
        lang,
        `About ${g1.months} months from digging to handover with a steady crew and money on time.`,
        `लगातार काम और समय पर पैसा हो तो खुदाई से हैंडओवर तक लगभग ${g1.months} महीने।`,
      ),
    },
  ];

  return (
    <Shell
      lang={lang}
      path={path}
      crumbs={[
        { name: L(lang, "House plans", "घर के नक्शे"), path: "house-plan" },
        { name: `${s}` },
      ]}
      h1={plotTitle(slug, lang)}
      faqs={faqs}
      intro={
        <p>
          {L(
            lang,
            `A ${p.w} ft × ${p.d} ft plot is ${num(plotArea(p))} sq ft (${num(gaj, 1)} gaj). Leaving ${setbackText}, the house can be ${bw} × ${bd} ft = ${num(buildableSqft(p))} sq ft per floor. Below is a G+1 ${p.bhk}BHK plan${hasParking ? " with car parking" : ""} drawn to scale, and its cost worked out item by item: about ${lakh(g1.total, "en")} at standard finish.`,
            `${p.w} ft × ${p.d} ft का प्लॉट ${num(plotArea(p))} sq ft (${num(gaj, 1)} गज़) का होता है। ${setbackText} छोड़कर घर ${bw} × ${bd} ft = ${num(buildableSqft(p))} sq ft प्रति मंज़िल बन सकता है। नीचे${hasParking ? " कार पार्किंग के साथ" : ""} G+1 ${p.bhk}BHK का स्केल पर बना नक्शा है, और आइटम-वार निकाला गया खर्च: स्टैंडर्ड फ़िनिश में लगभग ${lakh(g1.total, "hi")}।`,
          )}
        </p>
      }
    >
      <Stats
        items={[
          [L(lang, "Plot area", "प्लॉट एरिया"), `${num(plotArea(p))} sq ft`],
          [L(lang, "House per floor", "घर प्रति मंज़िल"), `${bw} × ${bd} ft`],
          [L(lang, "Built-up G+1", "बिल्ट-अप G+1"), `${num(g1.builtUp)} sq ft`],
          [L(lang, "Cost G+1", "खर्च G+1"), lakh(g1.total, lang)],
        ]}
      />

      <section className="flex flex-col gap-4">
        <H2>
          {L(
            lang,
            `${s} house plan — ground and first floor`,
            `${s} घर का नक्शा — ग्राउंड और पहली मंज़िल`,
          )}
        </H2>
        <div className="rounded-2xl border border-line bg-white p-4 sm:p-6">
          <PlotPlanPreview lang={lang} slug={slug} />
        </div>
        {fit.notes.length > 0 && (
          <ul className="flex flex-col gap-1.5 text-[14px] text-body">
            {fit.notes.map((n) => (
              <li
                key={n.en}
                className="rounded-lg bg-amber-tint px-3 py-2 text-ink"
              >
                {n[lang]}
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Cta href={tool}>
            {L(
              lang,
              "Change this plan · full BOQ, PDF, Excel →",
              "यह नक्शा बदलें · पूरा BOQ, PDF, Excel →",
            )}
          </Cta>
          <span className="text-[13px] text-muted">
            {L(
              lang,
              "Opens the plan in the estimate tool: change BHK, floors, road direction or any room.",
              "नक्शा एस्टिमेट टूल में खुलेगा: BHK, मंज़िल, सड़क की दिशा या कोई भी कमरा बदलें।",
            )}
          </span>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <H2>
          {L(
            lang,
            `${s} naksha for every road direction (Vastu)`,
            `${s} का हर दिशा का नक्शा (वास्तु अनुसार)`,
          )}
        </H2>
        <LinkGrid
          links={NAKSHE.filter((x) => plotSlug(x.plot) === slug).map((x) => ({
            href: langPath(lang, `naksha/${x.slug}`),
            title:
              lang === "hi"
                ? FACING_NAME[x.facing].hi
                : FACING_NAME[x.facing].en,
            sub:
              x.kind === "shop"
                ? L(lang, "with shop", "दुकान के साथ")
                : L(lang, "with parking", "पार्किंग के साथ"),
          }))}
        />
      </section>

      <section className="flex flex-col gap-4">
        <H2>{L(lang, "Rooms and sizes", "कमरे और उनके साइज़")}</H2>
        <div className="grid gap-4 md:grid-cols-2">
          {floorsRooms.map((f) => (
            <div
              key={f.floor}
              className="rounded-2xl border border-line bg-white p-4"
            >
              <h3 className="text-[15px] font-bold">{FLOORS(f.floor, lang)}</h3>
              <ul className="mt-2 flex flex-col text-[14px]">
                {f.rooms.map((r, i) => (
                  <li
                    key={i}
                    className="flex justify-between gap-3 border-t border-line py-1.5 first:border-t-0"
                  >
                    <span>
                      {roomLabel(r.type, f.floor, lang, Math.min(r.a, r.b))}
                    </span>
                    <span className="tabular-nums text-muted">
                      {ftIn(r.a)} × {ftIn(r.b)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <H2>
          {L(lang, `${s} house construction cost`, `${s} घर बनाने का खर्च`)}
        </H2>
        <Table
          caption={L(
            lang,
            "Cost by floors and finish",
            "मंज़िल और फ़िनिश के हिसाब से खर्च",
          )}
          head={[
            L(lang, "House", "घर"),
            L(lang, "Built-up", "बिल्ट-अप"),
            L(lang, "Basic", "बेसिक"),
            L(lang, "Standard", "स्टैंडर्ड"),
            L(lang, "Premium", "प्रीमियम"),
            L(lang, "Time", "समय"),
          ]}
          rows={[g1, g2].map((g) => [
            `G+${g.floors - 1}`,
            `${num(g.builtUp)} sq ft`,
            lakh(g.basic, lang),
            <strong key="s">{lakh(g.total, lang)}</strong>,
            lakh(g.premium, lang),
            L(lang, `${g.months} months`, `${g.months} महीने`),
          ])}
        />
        <p className="max-w-3xl text-[14px] leading-relaxed text-body">
          {L(
            lang,
            `Standard finish works out to about ${inr(g1.perSqft)} per sq ft of built-up area for this plan. Prices are for a tier-2 city in 2026, material and labour together; land, approvals, interiors, compound wall and borewell are extra.`,
            `इस नक्शे में स्टैंडर्ड फ़िनिश का खर्च बिल्ट-अप पर लगभग ${inr(g1.perSqft)} per sq ft आता है। दाम 2026 में टियर-2 शहर के, सामग्री और मज़दूरी मिलाकर; ज़मीन, मंज़ूरी, इंटीरियर, बाउंड्री वॉल और बोरवेल अलग।`,
          )}
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <H2>
          {L(
            lang,
            `Material needed for a ${s} G+1 house`,
            `${s} G+1 घर में लगने वाली सामग्री`,
          )}
        </H2>
        <Table
          caption={L(lang, "Material quantities", "सामग्री की मात्रा")}
          head={[L(lang, "Material", "सामग्री"), L(lang, "Quantity", "मात्रा")]}
          rows={g1.materials.map((m) => [
            name(m.key, lang),
            `${num(m.qty)} ${name(m.unit, lang)}`,
          ])}
        />
      </section>

      <section className="flex flex-col gap-4">
        <H2>{L(lang, "Other plot sizes", "दूसरे प्लॉट साइज़")}</H2>
        <LinkGrid
          links={PLOTS.map((q) => ({
            href: langPath(lang, `house-plan/${plotSlug(q)}`),
            title: `${q.w}×${q.d}`,
            sub: L(
              lang,
              `${plotArea(q)} sq ft · ${q.bhk}BHK`,
              `${plotArea(q)} sq ft · ${q.bhk}BHK`,
            ),
            current: plotSlug(q) === slug,
          }))}
        />
      </section>
    </Shell>
  );
}

export function PlotIndexPage({ lang }: { lang: Lang }) {
  return (
    <Shell
      lang={lang}
      path="house-plan"
      crumbs={[{ name: L(lang, "House plans", "घर के नक्शे") }]}
      h1={L(
        lang,
        "House Plans by Plot Size, with Cost",
        "प्लॉट साइज़ के हिसाब से घर के नक्शे और खर्च",
      )}
      intro={
        <p>
          {L(
            lang,
            "Pick your plot size (road-side width × depth, in feet). Each page has a G+1 family house plan drawn to scale — parking, porch, hall, kitchen with dining and bedrooms — and its construction cost and material worked out item by item.",
            "अपना प्लॉट साइज़ चुनें (सड़क की तरफ़ चौड़ाई × गहराई, फ़ीट में)। हर पेज पर स्केल पर बना G+1 फ़ैमिली घर का नक्शा है — पार्किंग, पोर्च, हॉल, किचन-डाइनिंग और बेडरूम — और आइटम-वार निकाला गया खर्च और सामग्री।",
          )}
        </p>
      }
    >
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PLOTS.map((p) => {
          const g = plotSummary(p, 2);
          return (
            <li key={plotSlug(p)}>
              <Link
                href={langPath(lang, `house-plan/${plotSlug(p)}`)}
                className="flex h-full flex-col gap-2 rounded-2xl border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-amber"
              >
                <span className="font-display text-[26px] font-extrabold leading-none">
                  {p.w}×{p.d}
                </span>
                <span className="text-[14px] text-body">
                  {L(
                    lang,
                    `${plotArea(p)} sq ft plot · G+1 ${p.bhk}BHK · ${num(g.builtUp)} sq ft built-up`,
                    `${plotArea(p)} sq ft प्लॉट · G+1 ${p.bhk}BHK · ${num(g.builtUp)} sq ft बिल्ट-अप`,
                  )}
                </span>
                <span className="text-[15px] font-semibold text-amber-dark">
                  {L(lang, "about", "लगभग")} {lakh(g.total, lang)} →
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <section className="flex flex-col gap-3">
        <H2>
          {L(
            lang,
            "Plot size not listed?",
            "आपका प्लॉट साइज़ लिस्ट में नहीं है?",
          )}
        </H2>
        <p className="max-w-3xl text-[15px] leading-relaxed text-body">
          {L(
            lang,
            "Enter any plot size, setbacks, BHK and road direction in the estimate tool — it draws the plan and works out the full BOQ for your plot.",
            "एस्टिमेट टूल में कोई भी प्लॉट साइज़, सेटबैक, BHK और सड़क की दिशा डालें — वह आपके प्लॉट का नक्शा बनाकर पूरा BOQ निकाल देगा।",
          )}
        </p>
        <Cta href={langPath(lang, "house-boq-estimate")}>
          {L(
            lang,
            "Make my plan and estimate →",
            "मेरा नक्शा और एस्टिमेट बनाएं →",
          )}
        </Cta>
      </section>
      <SqftLinks lang={lang} />
    </Shell>
  );
}

/* ---------------------------------------------------------------- built-up area pages */

const sqftCost = (n: number) =>
  (["basic", "standard", "premium"] as const).map((q) => ({
    q,
    v: calcHouse({
      areaPerFloorSqft: n,
      floors: 1,
      quality: q,
      location: "tier2",
    }).values,
  }));

export const sqftTitle = (n: number, lang: Lang) =>
  L(
    lang,
    `${num(n)} sq ft House Construction Cost in India (2026)`,
    `${num(n)} sq ft घर बनाने का खर्च (2026)`,
  );
export const sqftDescription = (n: number, lang: Lang) => {
  const [b, s, p] = sqftCost(n);
  return L(
    lang,
    `Cost to build a ${num(n)} sq ft house: about ${lakh(s.v.total, "en")} at standard finish (${lakh(b.v.total, "en")}–${lakh(p.v.total, "en")}). Cement bags, steel kg, sand, aggregate and bricks needed, stage-wise cost and time.`,
    `${num(n)} sq ft घर बनाने का खर्च: स्टैंडर्ड फ़िनिश में लगभग ${lakh(s.v.total, "hi")} (${lakh(b.v.total, "hi")}–${lakh(p.v.total, "hi")})। कितनी सीमेंट बोरी, सरिया, रेत, गिट्टी और ईंट लगेगी, स्टेज-वार खर्च और समय।`,
  );
};

function SqftLinks({ lang, current }: { lang: Lang; current?: number }) {
  return (
    <section className="flex flex-col gap-4">
      <H2>
        {L(
          lang,
          "Construction cost by built-up area",
          "बिल्ट-अप एरिया के हिसाब से खर्च",
        )}
      </H2>
      <LinkGrid
        links={SQFT_SIZES.map((n) => ({
          href: langPath(lang, `house-construction-cost/${sqftSlug(n)}`),
          title: `${num(n)} sq ft`,
          sub: lakh(sqftCost(n)[1].v.total, lang),
          current: n === current,
        }))}
      />
    </section>
  );
}

export function SqftPage({ lang, n }: { lang: Lang; n: number }) {
  const path = `house-construction-cost/${sqftSlug(n)}`;
  const costs = sqftCost(n);
  const s = costs[1].v;
  const mat = (k: string) => s.materials.find((m) => m.key === k)!;
  const near = PLOTS.filter(
    (p) => Math.abs(plotSummary(p, 2).builtUp - n) / n < 0.25,
  );
  const qName = (q: string) =>
    ({
      basic: L(lang, "Basic", "बेसिक"),
      standard: L(lang, "Standard", "स्टैंडर्ड"),
      premium: L(lang, "Premium", "प्रीमियम"),
    })[q]!;
  const faqs = [
    {
      q: L(
        lang,
        `What is the cost of constructing a ${num(n)} sq ft house?`,
        `${num(n)} sq ft घर बनाने में कितना खर्च आता है?`,
      ),
      a: L(
        lang,
        `About ${lakh(s.total, "en")} at standard finish (${inr(QUALITY_RATES.standard)} per sq ft), ${lakh(costs[0].v.total, "en")} basic and ${lakh(costs[2].v.total, "en")} premium, in a tier-2 city, material and labour together. Metros are about 15% higher, small towns about 8% lower.`,
        `स्टैंडर्ड फ़िनिश (${inr(QUALITY_RATES.standard)} per sq ft) में लगभग ${lakh(s.total, "hi")}, बेसिक ${lakh(costs[0].v.total, "hi")} और प्रीमियम ${lakh(costs[2].v.total, "hi")} — टियर-2 शहर में, सामग्री और मज़दूरी मिलाकर। मेट्रो में लगभग 15% ज़्यादा, छोटे क़स्बों में लगभग 8% कम।`,
      ),
    },
    {
      q: L(
        lang,
        `How many cement bags are needed for ${num(n)} sq ft?`,
        `${num(n)} sq ft में कितनी बोरी सीमेंट लगेगी?`,
      ),
      a: L(
        lang,
        `About ${num(mat("cement").qty)} bags (0.4 bag per sq ft of built-up area) for the whole house — foundation, frame, brickwork, plaster and flooring.`,
        `पूरे घर में लगभग ${num(mat("cement").qty)} बोरी (बिल्ट-अप के प्रति sq ft 0.4 बोरी) — नींव, ढांचा, चिनाई, प्लास्टर और फ़र्श मिलाकर।`,
      ),
    },
    {
      q: L(
        lang,
        `How much steel is needed for ${num(n)} sq ft?`,
        `${num(n)} sq ft में कितना सरिया लगेगा?`,
      ),
      a: L(
        lang,
        `About ${num(mat("steel").qty)} kg (${num(mat("steel").qty / 1000, 1)} tonnes) at 4 kg per sq ft for an RCC framed house. The structural drawing and bar bending schedule give the exact figure.`,
        `RCC फ़्रेम घर में 4 किलो प्रति sq ft से लगभग ${num(mat("steel").qty)} किलो (${num(mat("steel").qty / 1000, 1)} टन)। सही आंकड़ा स्ट्रक्चरल ड्रॉइंग और BBS से निकलता है।`,
      ),
    },
    {
      q: L(
        lang,
        `Is ${num(n)} sq ft the plot size or the built-up area?`,
        `${num(n)} sq ft प्लॉट का साइज़ है या बिल्ट-अप एरिया?`,
      ),
      a: L(
        lang,
        `These figures are for ${num(n)} sq ft of built-up area — the total covered floor area of all floors, measured to the outside of the walls. A G+1 house of ${num(n / 2)} sq ft per floor is also ${num(n)} sq ft.`,
        `ये आंकड़े ${num(n)} sq ft बिल्ट-अप एरिया के हैं — सभी मंज़िलों का कुल ढका हुआ एरिया, दीवारों के बाहर तक नापा हुआ। ${num(n / 2)} sq ft प्रति मंज़िल का G+1 घर भी ${num(n)} sq ft ही है।`,
      ),
    },
    {
      q: L(
        lang,
        `How much is the labour cost for ${num(n)} sq ft?`,
        `${num(n)} sq ft की मज़दूरी कितनी होगी?`,
      ),
      a: L(
        lang,
        `Labour is about 30% of the total: roughly ${lakh(s.total * 0.3, "en")} for ${num(n)} sq ft at standard finish.`,
        `मज़दूरी कुल खर्च का लगभग 30% होती है: स्टैंडर्ड फ़िनिश में ${num(n)} sq ft के लिए लगभग ${lakh(s.total * 0.3, "hi")}।`,
      ),
    },
  ];
  return (
    <Shell
      lang={lang}
      path={path}
      crumbs={[
        {
          name: L(lang, "Construction cost", "निर्माण खर्च"),
          path: "house-construction-cost",
        },
        { name: `${num(n)} sq ft` },
      ]}
      h1={sqftTitle(n, lang)}
      faqs={faqs}
      intro={
        <p>
          {L(
            lang,
            `Building ${num(n)} sq ft of built-up area costs about ${lakh(s.total, "en")} at standard finish — ${inr(s.ratePerSqft)} per sq ft, material and labour together, in a tier-2 city in 2026. Below: cost by finish level, the material you will buy, what each stage costs, and a calculator to change area, floors and city.`,
            `${num(n)} sq ft बिल्ट-अप बनाने में स्टैंडर्ड फ़िनिश में लगभग ${lakh(s.total, "hi")} लगते हैं — ${inr(s.ratePerSqft)} per sq ft, सामग्री और मज़दूरी मिलाकर, 2026 में टियर-2 शहर में। नीचे: फ़िनिश के हिसाब से खर्च, ख़रीदनी पड़ने वाली सामग्री, हर स्टेज का खर्च, और एरिया, मंज़िल और शहर बदलने के लिए कैलकुलेटर।`,
          )}
        </p>
      }
    >
      <Stats
        items={[
          [L(lang, "Standard cost", "स्टैंडर्ड खर्च"), lakh(s.total, lang)],
          [L(lang, "Rate", "रेट"), `${inr(s.ratePerSqft)}/sq ft`],
          [
            L(lang, "Cement", "सीमेंट"),
            `${num(mat("cement").qty)} ${name("bags", lang)}`,
          ],
          [
            L(lang, "Steel", "सरिया"),
            `${num(mat("steel").qty / 1000, 1)} ${L(lang, "tonnes", "टन")}`,
          ],
        ]}
      />

      <section className="flex flex-col gap-4">
        <H2>
          {L(lang, "Cost by finish level", "फ़िनिश लेवल के हिसाब से खर्च")}
        </H2>
        <Table
          head={[
            L(lang, "Finish", "फ़िनिश"),
            L(lang, "Rate per sq ft", "रेट per sq ft"),
            L(lang, "Total", "कुल"),
            L(lang, "Range ±10%", "रेंज ±10%"),
          ]}
          rows={costs.map(({ q, v }) => [
            qName(q),
            inr(v.ratePerSqft),
            <strong key="t">{lakh(v.total, lang)}</strong>,
            `${lakh(v.low, lang)} – ${lakh(v.high, lang)}`,
          ])}
        />
      </section>

      <section className="flex flex-col gap-4">
        <H2>
          {L(
            lang,
            `Material for a ${num(n)} sq ft house`,
            `${num(n)} sq ft घर की सामग्री`,
          )}
        </H2>
        <Table
          head={[
            L(lang, "Material", "सामग्री"),
            L(lang, "Per sq ft", "प्रति sq ft"),
            L(lang, "Quantity", "मात्रा"),
            L(lang, "Approx. cost", "लगभग दाम"),
          ]}
          rows={s.materials.map((m) => [
            name(m.key, lang),
            `${m.perSqft} ${name(m.unit, lang)}`,
            `${num(m.qty)} ${name(m.unit, lang)}`,
            inr(m.amount),
          ])}
        />
      </section>

      <section className="flex flex-col gap-4">
        <H2>{L(lang, "Stage-wise cost", "स्टेज के हिसाब से खर्च")}</H2>
        <Table
          head={[
            L(lang, "Stage", "स्टेज"),
            L(lang, "Share", "हिस्सा"),
            L(lang, "Amount", "रक़म"),
          ]}
          rows={s.phases.map((ph) => [
            name(ph.key, lang),
            `${ph.pct}%`,
            inr(ph.amount),
          ])}
        />
      </section>

      <section className="flex flex-col gap-4">
        <H2>
          {L(
            lang,
            "Change area, floors, finish or city",
            "एरिया, मंज़िल, फ़िनिश या शहर बदलें",
          )}
        </H2>
        <HouseCalc lang={lang} initialArea={n} initialFloors={1} />
      </section>

      {near.length > 0 && (
        <section className="flex flex-col gap-4">
          <H2>
            {L(
              lang,
              `House plans close to ${num(n)} sq ft`,
              `${num(n)} sq ft के आसपास के घर के नक्शे`,
            )}
          </H2>
          <LinkGrid
            links={near.map((p) => ({
              href: langPath(lang, `house-plan/${plotSlug(p)}`),
              title: `${p.w}×${p.d}`,
              sub: L(
                lang,
                `G+1 ${p.bhk}BHK · ${num(plotSummary(p, 2).builtUp)} sq ft`,
                `G+1 ${p.bhk}BHK · ${num(plotSummary(p, 2).builtUp)} sq ft`,
              ),
            }))}
          />
        </section>
      )}
      <SqftLinks lang={lang} current={n} />
    </Shell>
  );
}

export function SqftIndexPage({ lang }: { lang: Lang }) {
  return (
    <Shell
      lang={lang}
      path="house-construction-cost"
      crumbs={[{ name: L(lang, "Construction cost", "निर्माण खर्च") }]}
      h1={L(
        lang,
        "House Construction Cost by Area (2026)",
        "एरिया के हिसाब से घर बनाने का खर्च (2026)",
      )}
      intro={
        <p>
          {L(
            lang,
            `Construction cost of an RCC house in India in 2026: about ${inr(QUALITY_RATES.basic)} per sq ft (basic), ${inr(QUALITY_RATES.standard)} (standard) and ${inr(QUALITY_RATES.premium)} (premium) of built-up area in a tier-2 city. Pick your area for the full cost, material and stage-wise breakdown.`,
            `2026 में भारत में RCC घर बनाने का खर्च टियर-2 शहर में बिल्ट-अप पर लगभग ${inr(QUALITY_RATES.basic)} per sq ft (बेसिक), ${inr(QUALITY_RATES.standard)} (स्टैंडर्ड) और ${inr(QUALITY_RATES.premium)} (प्रीमियम)। पूरा खर्च, सामग्री और स्टेज-वार हिसाब के लिए अपना एरिया चुनें।`,
          )}
        </p>
      }
    >
      <SqftLinks lang={lang} />
      <Cta href={langPath(lang, "house-construction-cost-in")}>
        {L(
          lang,
          "Construction cost in your city →",
          "अपने शहर में निर्माण खर्च →",
        )}
      </Cta>
      <section className="flex flex-col gap-4">
        <H2>
          {L(lang, "House plans by plot size", "प्लॉट साइज़ के हिसाब से नक्शे")}
        </H2>
        <LinkGrid
          links={PLOTS.map((p) => ({
            href: langPath(lang, `house-plan/${plotSlug(p)}`),
            title: `${p.w}×${p.d}`,
            sub: `${plotArea(p)} sq ft · ${p.bhk}BHK`,
          }))}
        />
      </section>
    </Shell>
  );
}

/* ---------------------------------------------------------------- guide */

export const guideTitle = (lang: Lang) =>
  L(
    lang,
    "How to Build a House in India: Complete Guide (2026)",
    "घर कैसे बनाएं: पूरी गाइड (2026)",
  );
export const guideDescription = (lang: Lang) =>
  L(
    lang,
    "Everything a house owner and a new site engineer must know: land papers, approvals, planning, budget and BOQ, contractor, stage-wise quality checks, thumb rules, and answers to the most asked questions.",
    "घर मालिक और नए साइट इंजीनियर को जो पता होना चाहिए: ज़मीन के कागज़, मंज़ूरी, प्लानिंग, बजट और BOQ, ठेकेदार, हर स्टेज की जांच, थंब रूल, और सबसे ज़्यादा पूछे जाने वाले सवालों के जवाब।",
  );

const guideName = (lang: Lang) =>
  L(lang, "House building guide", "घर बनाने की गाइड");

function CardList({
  items,
}: {
  items: { href: string; title: string; sub: string; tag?: string }[];
}) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((it) => (
        <li key={it.href}>
          <Link
            href={it.href}
            className="flex h-full flex-col gap-1.5 rounded-2xl border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-amber"
          >
            {it.tag && (
              <span className="text-[12px] font-bold uppercase tracking-wide text-amber-dark">
                {it.tag}
              </span>
            )}
            <span className="text-[17px] font-bold leading-snug [text-wrap:balance]">
              {it.title} →
            </span>
            <span className="text-[14px] leading-relaxed text-body">
              {it.sub}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function GuidePage({ lang }: { lang: Lang }) {
  return (
    <Shell
      lang={lang}
      path={GUIDE_BASE}
      crumbs={[{ name: guideName(lang) }]}
      h1={guideTitle(lang)}
      intro={
        <p>
          {L(
            lang,
            "What a house owner — and a new site engineer — should know before the first brick. Each topic has its own page with a checklist, the common mistakes and the tool that works it out for your house.",
            "पहली ईंट से पहले घर मालिक — और नए साइट इंजीनियर — को क्या पता होना चाहिए। हर विषय का अलग पेज है: चेकलिस्ट, आम ग़लतियां, और वह टूल जो आपके घर का हिसाब निकालता है।",
          )}
        </p>
      }
    >
      <Link
        href={langPath(lang, `${GUIDE_BASE}/checklist`)}
        className="flex max-w-3xl flex-col gap-2 rounded-2xl border-2 border-amber bg-amber-tint p-5 transition hover:-translate-y-0.5 sm:p-6"
      >
        <span className="self-start rounded-full bg-amber px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-white">
          {L(
            lang,
            `${CHECKLIST_COUNT} POINTS · WITH VIDEOS`,
            `${CHECKLIST_COUNT} पॉइंट · वीडियो के साथ`,
          )}
        </span>
        <span className="font-display text-[22px] font-extrabold leading-tight">
          {L(
            lang,
            "The complete checklist, plot to handover →",
            "पूरी चेकलिस्ट, प्लॉट से हैंडओवर तक →",
          )}
        </span>
        <span className="text-[15px] text-body">
          {L(
            lang,
            "Tick each check as the work goes on; every point has YouTube videos showing how it is done.",
            "काम के साथ हर जांच पर टिक करें; हर पॉइंट के साथ YouTube वीडियो हैं जिनमें काम होते दिखता है।",
          )}
        </span>
      </Link>
      <section className="flex flex-col gap-4">
        <H2>{L(lang, "Step by step", "क़दम-दर-क़दम")}</H2>
        <CardList
          items={TOPICS.map((tp, i) => ({
            href: langPath(lang, `${GUIDE_BASE}/${tp.slug}`),
            tag: L(lang, `Step ${i + 1}`, `चरण ${i + 1}`),
            title: tp.title[lang],
            sub: tp.section.intro[lang],
          }))}
        />
      </section>
      <section className="flex flex-col gap-4">
        <H2>
          {L(lang, "Most asked questions", "सबसे ज़्यादा पूछे जाने वाले सवाल")}
        </H2>
        <CardList
          items={QUESTIONS.map((q) => ({
            href: langPath(lang, `${GUIDE_BASE}/${q.slug}`),
            title: q.faq.q[lang],
            sub: q.faq.a[lang],
          }))}
        />
      </section>
      <section className="flex flex-col gap-4">
        <H2>{L(lang, "Plans and costs", "नक्शे और खर्च")}</H2>
        <CardList
          items={[
            {
              href: langPath(lang, "house-plan"),
              title: L(
                lang,
                "House plans by plot size",
                "प्लॉट साइज़ के हिसाब से नक्शे",
              ),
              sub: L(
                lang,
                "20×40, 25×50, 30×40, 30×50, 30×60 and more — drawn to scale with cost.",
                "20×40, 25×50, 30×40, 30×50, 30×60 और भी — स्केल पर बने, खर्च के साथ।",
              ),
            },
            {
              href: langPath(lang, "house-construction-cost"),
              title: L(
                lang,
                "Construction cost by sq ft",
                "sq ft के हिसाब से खर्च",
              ),
              sub: L(
                lang,
                "500 to 3000 sq ft — total cost, material and stage-wise cost.",
                "500 से 3000 sq ft — कुल खर्च, सामग्री और स्टेज-वार खर्च।",
              ),
            },
          ]}
        />
      </section>
    </Shell>
  );
}

export const guideItemTitle = (slug: string, lang: Lang) =>
  (getTopic(slug) ?? getQuestion(slug))!.title[lang];
export const guideItemDescription = (slug: string, lang: Lang) =>
  (getTopic(slug) ?? getQuestion(slug))!.description[lang];

function Paras({
  items,
  lang,
}: {
  items: { en: string; hi: string }[];
  lang: Lang;
}) {
  return (
    <div className="flex max-w-3xl flex-col gap-3 text-[16px] leading-relaxed text-body">
      {items.map((b) => (
        <p key={b.en}>{b[lang]}</p>
      ))}
    </div>
  );
}

function GuideNext({ lang, slug }: { lang: Lang; slug: string }) {
  const all = [
    ...TOPICS.map((x) => ({ slug: x.slug, title: x.title[lang] })),
    ...QUESTIONS.map((x) => ({ slug: x.slug, title: x.faq.q[lang] })),
  ];
  const i = all.findIndex((x) => x.slug === slug);
  const next = all[(i + 1) % all.length];
  const prev = all[(i - 1 + all.length) % all.length];
  return (
    <nav
      aria-label={L(lang, "More from the guide", "गाइड में और")}
      className="grid max-w-3xl gap-3 sm:grid-cols-2"
    >
      {[
        [prev, L(lang, "← Previous", "← पिछला")],
        [next, L(lang, "Next →", "अगला →")],
      ].map(([x, lbl]) => {
        const it = x as { slug: string; title: string };
        return (
          <Link
            key={lbl as string}
            href={langPath(lang, `${GUIDE_BASE}/${it.slug}`)}
            className="flex flex-col gap-1 rounded-xl border border-line bg-white px-4 py-3 hover:border-amber"
          >
            <span className="text-[12px] font-semibold uppercase tracking-wide text-muted">
              {lbl as string}
            </span>
            <span className="text-[15px] font-semibold">{it.title}</span>
          </Link>
        );
      })}
      <Link
        href={langPath(lang, GUIDE_BASE)}
        className="text-[14px] font-semibold text-steel hover:text-ink sm:col-span-2"
      >
        {L(lang, "All guide topics →", "गाइड के सभी विषय →")}
      </Link>
    </nav>
  );
}

export function GuideItemPage({ lang, slug }: { lang: Lang; slug: string }) {
  const path = `${GUIDE_BASE}/${slug}`;
  const crumbs = (title: string) => [
    { name: guideName(lang), path: GUIDE_BASE },
    { name: title },
  ];
  const tp = getTopic(slug);
  if (tp) {
    const n = TOPICS.indexOf(tp) + 1;
    return (
      <Shell
        lang={lang}
        path={path}
        crumbs={crumbs(tp.section.title[lang].replace(/^\d+\.\s*/, ""))}
        h1={tp.title[lang]}
        intro={
          <p>
            <span className="font-semibold text-amber-dark">
              {L(
                lang,
                `Step ${n} of ${TOPICS.length}`,
                `चरण ${n} / ${TOPICS.length}`,
              )}
              {" · "}
            </span>
            {tp.section.intro[lang]}
          </p>
        }
      >
        <Paras items={tp.body} lang={lang} />
        <section className="flex max-w-3xl flex-col gap-3">
          <H2>{L(lang, "Checklist", "चेकलिस्ट")}</H2>
          <ul className="flex flex-col gap-2">
            {tp.section.items.map((it) => (
              <li
                key={it.t.en}
                className="flex gap-3 rounded-xl border border-line bg-white px-4 py-3"
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-amber text-[11px] font-black text-amber-dark"
                >
                  ✓
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="text-[15px] leading-relaxed">
                    {it.t[lang]}
                  </span>
                  <span className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-semibold">
                    {it.yt && (
                      <a
                        href={ytUrl(it)}
                        target="_blank"
                        rel="noopener"
                        className="text-[#b3261e] hover:underline"
                      >
                        ▶{" "}
                        {L(
                          lang,
                          "Watch videos on YouTube",
                          "YouTube पर वीडियो देखें",
                        )}
                      </a>
                    )}
                    {it.link && (
                      <Link
                        href={langPath(lang, it.link)}
                        className="text-steel hover:text-ink"
                      >
                        {L(lang, "Work it out →", "हिसाब निकालें →")}
                      </Link>
                    )}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="flex max-w-3xl flex-col gap-3">
          <H2>{L(lang, "Common mistakes", "आम ग़लतियां")}</H2>
          <ul className="flex flex-col gap-2">
            {tp.mistakes.map((m) => (
              <li
                key={m.en}
                className="flex gap-3 rounded-xl bg-warn-tint px-4 py-3 text-[15px] leading-relaxed text-[#4a3b12]"
              >
                <span aria-hidden="true" className="font-black">
                  ✕
                </span>
                <span>{m[lang]}</span>
              </li>
            ))}
          </ul>
        </section>
        <GuideNext lang={lang} slug={slug} />
      </Shell>
    );
  }
  const q = getQuestion(slug)!;
  return (
    <Shell
      lang={lang}
      path={path}
      crumbs={crumbs(q.title[lang])}
      h1={q.title[lang]}
      faqs={[{ q: q.faq.q[lang], a: q.faq.a[lang] }]}
      faqsHidden
      intro={null}
    >
      <div className="max-w-3xl rounded-2xl border-2 border-amber bg-white p-5">
        <p className="text-[12px] font-bold uppercase tracking-wide text-amber-dark">
          {L(lang, "Short answer", "छोटा जवाब")}
        </p>
        <p className="mt-1 text-[17px] font-medium leading-relaxed">
          {q.faq.a[lang]}
        </p>
      </div>
      <Paras items={q.body} lang={lang} />
      {q.tool && (
        <Cta href={langPath(lang, q.tool.path)}>{q.tool.label[lang]}</Cta>
      )}
      <GuideNext lang={lang} slug={slug} />
    </Shell>
  );
}

/* ---------------------------------------------------------------- checklist */

export const checklistTitle = (lang: Lang) =>
  L(
    lang,
    `House Construction Checklist: ${CHECKLIST_COUNT} Points from Plot to Handover`,
    `घर बनाने की चेकलिस्ट: प्लॉट से हैंडओवर तक ${CHECKLIST_COUNT} पॉइंट`,
  );
export const checklistDescription = (lang: Lang) =>
  L(
    lang,
    `The ${CHECKLIST_COUNT} checks a house owner must do — plot papers, design, budget, contractor, foundation, columns, slab, concrete, handover — each with YouTube videos showing how it is done.`,
    `घर मालिक को करनी चाहिए ये ${CHECKLIST_COUNT} जांच — प्लॉट के कागज़, डिज़ाइन, बजट, ठेकेदार, नींव, कॉलम, स्लैब, कंक्रीट, हैंडओवर — हर पॉइंट के साथ YouTube वीडियो।`,
  );

export function ChecklistPage({ lang }: { lang: Lang }) {
  const faqs = CHECKLIST.slice(0, 5).map((s) => ({
    q: L(
      lang,
      `What to check at "${s.title.en.split("·")[1].trim()}"?`,
      `"${s.title.hi.split("·")[1].trim()}" में क्या जांचें?`,
    ),
    a: s.points.map((pt) => pt.t[lang]).join("; "),
  }));
  return (
    <Shell
      lang={lang}
      path="house-construction-guide/checklist"
      crumbs={[
        {
          name: L(lang, "House building guide", "घर बनाने की गाइड"),
          path: "house-construction-guide",
        },
        { name: L(lang, "Checklist", "चेकलिस्ट") },
      ]}
      h1={checklistTitle(lang)}
      faqs={faqs}
      faqsHidden
      intro={
        <p>
          {L(
            lang,
            `The main ${CHECKLIST_COUNT} things to check, in the order they come up. Tick them as you go (ticks stay in this browser), and open the YouTube videos with each point to see how the work should be done — useful even when the engineer is not on site.`,
            `जांचने वाली ${CHECKLIST_COUNT} मुख्य बातें, उसी क्रम में जिसमें काम आता है। जैसे-जैसे पूरा हो, टिक करते जाएं (टिक इसी ब्राउज़र में सेव रहते हैं), और हर पॉइंट के साथ YouTube वीडियो खोलकर देखें कि काम कैसे होना चाहिए — इंजीनियर साइट पर न हो तब भी काम आएगा।`,
          )}
        </p>
      }
    >
      <Checklist lang={lang} />
      <p className="max-w-3xl rounded-xl bg-[#f3efe7] px-4 py-3 text-[13px] leading-relaxed text-body">
        {L(
          lang,
          "The video links open YouTube results for each topic; the videos are made by others, so check that what you watch matches your drawings. Structural work must follow your engineer's drawing.",
          "वीडियो लिंक हर विषय के YouTube नतीजे खोलते हैं; वीडियो दूसरों के बनाए हैं, इसलिए देखें कि जो दिख रहा है वो आपकी ड्रॉइंग से मेल खाता है। स्ट्रक्चर का काम इंजीनियर की ड्रॉइंग के अनुसार ही करें।",
        )}
      </p>
    </Shell>
  );
}
