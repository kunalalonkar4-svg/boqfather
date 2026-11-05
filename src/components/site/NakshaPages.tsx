import Link from "next/link";
import { ROOM_DEFS, RoomType } from "@/engine";
import {
  FACING_NAME,
  FACINGS,
  GAJ,
  gajOf,
  getGaj,
  getNaksha,
  Naksha,
  NAKSHE,
  nakshaHinglish,
  nakshaInfo,
  nakshaPlan,
  nakshaTitle,
} from "@/content/naksha";
import { ftIn, inr, lakh, PLOTS, plotSlug } from "@/content/plots";
import { name } from "@/i18n/ui";
import { Lang, langPath } from "@/lib/site";
import { CustomNakshaForm, NakshaPlanView } from "./NakshaClient";
import { Cta, H2, LinkGrid, Shell, Stats, Table } from "./SeoPages";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);
const num = (n: number, d = 0) =>
  n.toLocaleString("en-IN", { maximumFractionDigits: d });
const FT = 0.3048;
const BASE = "naksha";
const naksheName = (lang: Lang) =>
  L(lang, "House plans (naksha)", "घर के नक्शे");

const ROOM_EXTRA: Record<string, [string, string]> = {
  porch: ["Porch", "पोर्च"],
  dress: ["Dress", "ड्रेस"],
};
const roomLabel = (type: string, floor: number, lang: Lang, m = 9) => {
  if (type === "open" && floor === 0 && m < 1.6)
    return L(lang, "Back yard", "पीछे का आंगन");
  if (type === "open" && floor > 0 && m < 1.6)
    return L(lang, "Dry balcony", "ड्राई बालकनी");
  if (type === "porch" && m < 1.5) return L(lang, "Entrance", "प्रवेश");
  if (type === "open")
    return floor > 0
      ? L(lang, "Open terrace", "खुली छत")
      : L(lang, "Open sit-out", "खुला सिट-आउट");
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

export const nakshaAlt = (n: Naksha, lang: Lang) =>
  L(
    lang,
    `${n.plot.w}x${n.plot.d} ${FACING_NAME[n.facing].en.toLowerCase()} plan — ${nakshaHinglish(n)}`,
    `${n.plot.w}x${n.plot.d} ${FACING_NAME[n.facing].hi} प्लान — ${nakshaHinglish(n)}`,
  );

function CustomSection({
  lang,
  size,
  facing,
}: {
  lang: Lang;
  size?: string;
  facing?: string;
}) {
  return (
    <section
      id="custom"
      className="flex scroll-mt-4 flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-lg text-slate-900"
    >
      <div className="flex max-w-3xl flex-col gap-2">
        <H2>
          {L(
            lang,
            "Custom 3D House Planning & Structural Drawings",
            "अपने प्लॉट का कस्टम 3D नक्शा और स्ट्रक्चरल डिज़ाइन बनवाएं",
          )}
        </H2>
        <p className="text-[15px] leading-relaxed text-slate-600">
          {L(
            lang,
            "Get custom Vastu-compliant architectural plans, 3D elevation renders, structural drawings, and bank-approved itemized BOQ measurement sheets customized for your plot.",
            "वास्तु अनुसार कस्टम 3D एलिवेशन, स्ट्रक्चरल ड्रॉइंग, और बैंक लोन के लिए विस्तृत BOQ मेज़रमेंट बुक तैयार करवाएं। अपनी जानकारी भेजें, हम WhatsApp पर संपर्क करेंगे।",
          )}
        </p>
      </div>
      <CustomNakshaForm lang={lang} defaults={{ size, facing }} />
    </section>
  );
}

/* ---------------------------------------------------------------- gallery index */

export const naksheTitle = (lang: Lang) =>
  L(
    lang,
    "Architectural House Plans & Turnkey Cost Estimation",
    "घर का नक्शा और कंस्ट्रक्शन कॉस्ट एस्टीमेशन",
  );
export const naksheDescription = (lang: Lang) =>
  L(
    lang,
    "Custom Vastu-approved house planning, 3D architectural models, and instant itemized BOQ estimation for all plot sizes.",
    "हर प्लॉट साइज़ के लिए वास्तु अनुसार 3D प्लानिंग, सटीक मटेरियल हिसाब और बैंक अप्रूव्ड BOQ एस्टीमेट।",
  );

export function NakshaIndexPage({ lang }: { lang: Lang }) {
  return (
    <Shell
      lang={lang}
      path={BASE}
      crumbs={[{ name: naksheName(lang) }]}
      h1={naksheTitle(lang)}
      intro={
        <p>
          {L(
            lang,
            "Start your house construction journey with architectural accuracy. Select your plot dimensions below to get an instant room-by-room layout and turnkey cost estimate.",
            "अपने प्लॉट का साइज़ चुनिए और तुरंत रूम-वाइज़ लेआउट, सीमेंट, सरिया और टोटल कंस्ट्रक्शन खर्च का लाइव एस्टीमेट पाइए।",
          )}
        </p>
      }
    >
      {/* Sleek Plot Dimension Grid (Cartoon Images Removed) */}
      <div className="my-8 p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl">
        <div className="max-w-2xl mb-6">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
            ⚡ Quick Plot Dimensions
          </span>
          <h2 className="text-xl sm:text-2xl font-bold mt-1">
            {L(lang, "Select your plot size for instant BOQ", "अपने प्लॉट का साइज़ चुनें और लाइव खर्च देखें")}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {PLOTS.map((p) => (
            <Link
              key={plotSlug(p)}
              href={langPath(lang, `house-boq-estimate?w=${p.w}&d=${p.d}`)}
              className="group p-4 rounded-2xl bg-slate-800/80 hover:bg-blue-600 border border-slate-700/80 hover:border-blue-500 transition-all text-center flex flex-col justify-between"
            >
              <span className="font-mono text-base sm:text-lg font-bold text-white group-hover:scale-105 transition-transform">
                {p.w} × {p.d}
              </span>
              <span className="text-[11px] text-slate-400 group-hover:text-blue-100 mt-1">
                {p.w * p.d} sq.ft
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Gaj Navigation */}
      <nav
        aria-label={L(lang, "By gaj", "गज़ के हिसाब से")}
        className="flex flex-wrap gap-2 mb-8"
      >
        {GAJ.map((g) => (
          <Link
            key={g.slug}
            href={langPath(lang, `${BASE}/gaj/${g.slug}`)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[14px] font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-600 shadow-sm transition-all"
          >
            {L(lang, `${g.gaj} gaj naksha`, `${g.gaj} गज़ का नक्शा`)}
          </Link>
        ))}
      </nav>

      {/* Custom Request Form */}
      <CustomSection lang={lang} />
    </Shell>
  );
}

/* ---------------------------------------------------------------- one naksha */

export const nakshaDescription = (slug: string, lang: Lang) => {
  const n = getNaksha(slug)!;
  const i = nakshaInfo(n);
  return L(
    lang,
    `${nakshaTitle(n, "en")}: G+1 ${i.bhk}BHK, ${num(i.builtUp)} sq ft, drawn to scale with room sizes, Vastu check (${i.vastu.pct}%), and construction cost about ${lakh(i.total, "en")}. ${nakshaHinglish(n)}.`,
    `${nakshaTitle(n, "hi")}: G+1 ${i.bhk}BHK, ${num(i.builtUp)} sq ft, कमरों के साइज़, वास्तु जांच (${i.vastu.pct}%) और बनाने का खर्च लगभग ${lakh(i.total, "hi")}। ${nakshaHinglish(n)}।`,
  );
};

export function NakshaPage({ lang, slug }: { lang: Lang; slug: string }) {
  const n = getNaksha(slug)!;
  const i = nakshaInfo(n);
  const { fit, res } = nakshaPlan(n);
  const p = n.plot;
  const s = `${p.w}×${p.d}`;
  const bw = p.w - 2 * p.side,
    bd = p.d - p.front - p.back;
  const f = FACING_NAME[n.facing];
  const tool = `${langPath(lang, "house-boq-estimate")}?w=${p.w}&d=${p.d}&bhk=${p.bhk}&floors=2&front=${p.front}&back=${p.back}&side=${p.side}&facing=${n.facing}`;
  const mat = (k: string) => res.materials.find((m) => m.key === k);
  const bad = i.vastu.rows.filter((x) => x.status === "bad").length;
  const siblings = NAKSHE.filter(
    (x) => plotSlug(x.plot) === plotSlug(p) && x.kind === n.kind && x !== n,
  );
  const otherKind = NAKSHE.find(
    (x) =>
      plotSlug(x.plot) === plotSlug(p) &&
      x.facing === n.facing &&
      x.kind !== n.kind,
  );
  const sameFacing = NAKSHE.filter(
    (x) => x.facing === n.facing && x.kind === n.kind && x !== n,
  );
  const faqs = [
    {
      q: L(
        lang,
        `Is this ${s} ${f.en.toLowerCase()} plan as per Vastu?`,
        `क्या यह ${s} ${f.hi} नक्शा वास्तु के अनुसार है?`,
      ),
      a: L(
        lang,
        `The plan is set the way that suits Vastu best for a ${f.en.toLowerCase()} plot: ${i.vastu.pct}% of the checked rooms sit in a recommended or acceptable direction.`,
        `${f.hi} प्लॉट के लिए नक्शा उस तरह रखा गया है जो वास्तु के सबसे अनुकूल है: जांचे गए ${i.vastu.pct}% कमरे सही या चलने लायक़ दिशा में हैं।`,
      ),
    },
    {
      q: L(
        lang,
        `How much will it cost to build this ${s} house?`,
        `यह ${s} घर बनाने में कितना खर्च आएगा?`,
      ),
      a: L(
        lang,
        `About ${lakh(i.total, "en")} for ${num(i.builtUp)} sq ft at standard finish (${lakh(i.basic, "en")} basic to ${lakh(i.premium, "en")} premium), material and labour together.`,
        `${num(i.builtUp)} sq ft के लिए स्टैंडर्ड फ़िनिश में लगभग ${lakh(i.total, "hi")} (बेसिक ${lakh(i.basic, "hi")} से प्रीमियम ${lakh(i.premium, "hi")}), सामग्री और मज़दूरी मिलाकर।`,
      ),
    },
  ];

  return (
    <Shell
      lang={lang}
      path={`${BASE}/${slug}`}
      crumbs={[
        { name: naksheName(lang), path: BASE },
        {
          name: `${s} ${L(lang, f.en, f.hi)}${n.kind === "shop" ? L(lang, " · shop", " · दुकान") : ""}`,
        },
      ]}
      h1={nakshaTitle(n, lang)}
      faqs={faqs}
      intro={
        <p>
          {L(
            lang,
            `${nakshaHinglish(n)} — G+1 ${i.bhk}BHK ${n.kind === "shop" ? "with a shop" : "with parking"}. Plot ${num(p.w * p.d)} sq ft (${num(gajOf(p), 1)} gaj); after setbacks the house is ${bw} × ${bd} ft per floor.`,
            `${nakshaHinglish(n)} — G+1 ${i.bhk}BHK ${n.kind === "shop" ? "दुकान के साथ" : "पार्किंग के साथ"}। प्लॉट ${num(p.w * p.d)} sq ft (${num(gajOf(p), 1)} गज़)।`,
          )}
        </p>
      }
    >
      <Stats
        items={[
          [
            L(lang, "Plot", "प्लॉट"),
            `${s} ft · ${num(gajOf(p), 0)} ${L(lang, "gaj", "गज़")}`,
          ],
          [L(lang, "Built-up G+1", "बिल्ट-अप G+1"), `${num(i.builtUp)} sq ft`],
          [L(lang, "Vastu", "वास्तु"), `${i.vastu.pct}%`],
          [L(lang, "Cost", "खर्च"), lakh(i.total, lang)],
        ]}
      />

      <section className="flex flex-col gap-4">
        <H2>
          {L(
            lang,
            `${s} ${f.en.toLowerCase()} plan — 2D Blueprint & Layout`,
            `${s} ${f.hi} नक्शा — 2D लेआउट`,
          )}
        </H2>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
          <NakshaPlanView lang={lang} slug={slug} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Cta href={tool}>
            {L(
              lang,
              "Calculate Full BOQ & Material Breakdown →",
              "पूरा BOQ और मटेरियल खर्च निकालें →",
            )}
          </Cta>
          <a
            href="#custom"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-[14px] font-semibold text-slate-800 hover:border-blue-500 shadow-sm"
          >
            {L(lang, "Get a custom naksha", "कस्टम नक्शा बनवाएं")}
          </a>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <H2>{L(lang, "Rooms and sizes", "कमरे और साइज़")}</H2>
        <div className="grid gap-4 md:grid-cols-2">
          {res.sketch.map((fl) => (
            <div
              key={fl.floor}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="flex justify-between text-[15px] font-bold text-slate-900">
                {FLOORS(fl.floor, lang)}
                <span className="font-normal text-slate-500">
                  {ftIn(fl.L / FT)} × {ftIn(fl.B / FT)}
                </span>
              </h3>
              <ul className="mt-3 flex flex-col text-[14px]">
                {fl.rects
                  .filter(
                    (x) => !["column", "corridor", "stair"].includes(x.type),
                  )
                  .map((x, k) => (
                    <li
                      key={k}
                      className="flex justify-between gap-3 border-t border-slate-100 py-2 first:border-t-0"
                    >
                      <span className="text-slate-800 font-medium">
                        {roomLabel(x.type, fl.floor, lang, Math.min(x.w, x.h))}
                      </span>
                      <span className="tabular-nums text-slate-500">
                        {ftIn(x.w / FT)} × {ftIn(x.h / FT)} ·{" "}
                        {num((x.w * x.h) / (FT * FT))} sq ft
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
          {L(lang, "Cost to build this house", "यह घर बनाने का खर्च")}
        </H2>
        <Table
          head={[
            L(lang, "Finish", "फ़िनिश"),
            L(lang, "Total (G+1)", "कुल (G+1)"),
          ]}
          rows={[
            [L(lang, "Basic", "बेसिक"), lakh(i.basic, lang)],
            [
              L(lang, "Standard", "स्टैंडर्ड"),
              <strong key="s" className="text-blue-600">{lakh(i.total, lang)}</strong>,
            ],
            [L(lang, "Premium", "प्रीमियम"), lakh(i.premium, lang)],
          ]}
        />
        <Table
          head={[L(lang, "Material", "सामग्री"), L(lang, "Quantity", "मात्रा")]}
          rows={res.materials.map((m) => [
            name(m.key, lang),
            `${num(m.qty)} ${name(m.unit, lang)}`,
          ])}
        />
      </section>

      <CustomSection
        lang={lang}
        size={`${p.w} x ${p.d}`}
        facing={L(lang, f.en.split(" ")[0], f.hi.replace(" मुखी", ""))}
      />
    </Shell>
  );
}

/* ---------------------------------------------------------------- gaj */

export const gajTitle = (slug: string, lang: Lang) => {
  const g = getGaj(slug)!;
  return L(
    lang,
    `${g.gaj} Gaj House Cost & Planning as per Vastu`,
    `${g.gaj} गज़ का घर (वास्तु अनुसार और खर्च)`,
  );
};
export const gajDescription = (slug: string, lang: Lang) => {
  const g = getGaj(slug)!;
  const sizes = g.plots.map((p) => `${p.w}×${p.d}`).join(", ");
  return L(
    lang,
    `${g.gaj} gaj house estimation for ${sizes} plots with Vastu check and construction cost.`,
    `${g.gaj} गज़ के लिए ${sizes} प्लॉट का वास्तु जांच और कंस्ट्रक्शन खर्च।`,
  );
};

export function GajPage({ lang, slug }: { lang: Lang; slug: string }) {
  const g = getGaj(slug)!;
  return (
    <Shell
      lang={lang}
      path={`${BASE}/gaj/${slug}`}
      crumbs={[
        { name: naksheName(lang), path: BASE },
        { name: L(lang, `${g.gaj} gaj`, `${g.gaj} गज़`) },
      ]}
      h1={gajTitle(slug, lang)}
      intro={
        <p>
          {L(
            lang,
            `1 gaj (square yard) = 9 sq ft, so ${g.gaj} gaj is about ${num(g.gaj * 9)} sq ft. Select your dimensions below to calculate full construction BOQ.`,
            `1 गज़ = 9 sq ft, यानी ${g.gaj} गज़ लगभग ${num(g.gaj * 9)} sq ft। पूरा BOQ निकालने के लिए नीचे प्लॉट साइज़ चुनें।`,
          )}
        </p>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
        {g.plots.map((p) => (
          <Link
            key={plotSlug(p)}
            href={langPath(lang, `house-boq-estimate?w=${p.w}&d=${p.d}`)}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-600 text-center font-bold text-slate-800 hover:text-blue-600 shadow-sm transition-all"
          >
            {p.w} × {p.d} ft
          </Link>
        ))}
      </div>
      <CustomSection lang={lang} />
    </Shell>
  );
}

export { FACINGS };
