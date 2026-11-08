import Link from "next/link";
import { nakshaPreview } from "@/content/nakshaPreview";
import { ROOM_DEFS, RoomType } from "@/engine";
import {
  FACING_NAME,
  DESIGNS,
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
import {
  CustomNakshaForm,
  GalleryCard,
  NakshaGallery,
  NakshaPlanView,
} from "./NakshaClient";
import { Cta, H2, LinkGrid, Shell, Stats, Table } from "./SeoPages";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);
const num = (n: number, d = 0) =>
  n.toLocaleString("en-IN", { maximumFractionDigits: d });
const FT = 0.3048;
const BASE = "naksha";

/** Vastu zones, room roles and verdicts in plain words (English / Hindi) for the direction-wise table. */
const ZONE_NAME: Record<string, [string, string]> = {
  NE: ["North-East", "उत्तर-पूर्व"],
  N: ["North", "उत्तर"],
  NW: ["North-West", "उत्तर-पश्चिम"],
  E: ["East", "पूर्व"],
  C: ["Centre", "बीच"],
  W: ["West", "पश्चिम"],
  SE: ["South-East", "दक्षिण-पूर्व"],
  S: ["South", "दक्षिण"],
  SW: ["South-West", "दक्षिण-पश्चिम"],
};
const ROLE_NAME: Record<string, [string, string]> = {
  entrance: ["Main entrance", "मुख्य प्रवेश"],
  kitchen: ["Kitchen", "रसोई"],
  master: ["Master bedroom", "मास्टर बेडरूम"],
  bedroom: ["Bedroom", "बेडरूम"],
  pooja: ["Pooja", "पूजा"],
  toilet: ["Toilet", "टॉयलेट"],
  stair: ["Staircase", "सीढ़ी"],
  hall: ["Living hall", "लिविंग हॉल"],
  dining: ["Dining", "डाइनिंग"],
  parking: ["Car parking", "कार पार्किंग"],
  balcony: ["Balcony", "बालकनी"],
};
const STATUS_NAME: Record<string, [string, string]> = {
  good: ["Recommended", "उत्तम"],
  ok: ["Acceptable", "चलने लायक़"],
  bad: ["Not ideal", "अनुकूल नहीं"],
};
const STATUS_CLASS: Record<string, string> = {
  good: "text-good",
  ok: "text-steel",
  bad: "text-warn",
};
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
    `${n.plot.w}x${n.plot.d} ${FACING_NAME[n.facing].en.toLowerCase()} ${n.kind === "shop" ? "house with shop" : "house"} plan, ground and first floor, drawn to scale — ${nakshaHinglish(n)}`,
    `${n.plot.w}x${n.plot.d} ${FACING_NAME[n.facing].hi} ${n.kind === "shop" ? "दुकान के साथ घर" : "घर"} का नक्शा, ग्राउंड और पहली मंज़िल, स्केल पर — ${nakshaHinglish(n)}`,
  );

function card(n: Naksha, lang: Lang): GalleryCard {
  const i = nakshaInfo(n);
  return {
    slug: n.slug,
    href: langPath(lang, `${BASE}/${n.slug}`),
    img: nakshaPreview(n).src,
    alt: nakshaAlt(n, lang),
    title: nakshaTitle(n, lang),
    sub: L(
      lang,
      `${num(gajOf(n.plot), 0)} gaj · G+1 ${i.bhk}BHK · Vastu ${i.vastu.pct}% · about ${lakh(i.total, "en")}`,
      `${num(gajOf(n.plot), 0)} गज़ · G+1 ${i.bhk}BHK · वास्तु ${i.vastu.pct}% · लगभग ${lakh(i.total, "hi")}`,
    ),
    size: plotSlug(n.plot),
    facing: n.facing,
    kind: n.kind,
    gaj: gajOf(n.plot),
  };
}

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
      className="flex scroll-mt-4 flex-col gap-4 rounded-2xl border-2 border-amber bg-white p-5 sm:p-6"
    >
      <div className="flex max-w-3xl flex-col gap-1">
        <H2>
          {L(
            lang,
            "Want a custom naksha for your plot?",
            "अपने प्लॉट का कस्टम नक्शा चाहिए?",
          )}
        </H2>
        <p className="text-[15px] leading-relaxed text-body">
          {L(
            lang,
            "Odd plot shape, a corner plot, a full Vastu layout, a shop or rent floor, lift, 3D elevation or a structural drawing — send your details and we will get back to you on WhatsApp.",
            "टेढ़ा प्लॉट, कॉर्नर प्लॉट, पूरा वास्तु लेआउट, दुकान या किराये का फ़्लोर, लिफ़्ट, 3D एलिवेशन या स्ट्रक्चरल ड्रॉइंग — अपनी जानकारी भेजें, हम WhatsApp पर संपर्क करेंगे।",
          )}
        </p>
      </div>
      <CustomNakshaForm lang={lang} defaults={{ size, facing }} />
    </section>
  );
}

/* ---------------------------------------------------------------- gallery */

export const naksheTitle = (lang: Lang) =>
  L(
    lang,
    "Ghar ka Naksha: House Plans for Every Plot Size and Facing, as per Vastu",
    "घर का नक्शा: हर प्लॉट साइज़ और हर दिशा के वास्तु अनुसार नक्शे",
  );
export const naksheDescription = (lang: Lang) =>
  L(
    lang,
    `${DESIGNS.length} house designs drawn to scale — 20×40 to 50×80, each set for east, north, west and south facing plots, with parking or a shop — every one with a Vastu check, room sizes and construction cost.`,
    `स्केल पर बने ${DESIGNS.length} घर के डिज़ाइन — 20×40 से 50×80, हर एक पूर्व, उत्तर, पश्चिम और दक्षिण मुखी प्लॉट के लिए, पार्किंग या दुकान के साथ — हर एक में वास्तु जांच, कमरों के साइज़ और बनाने का खर्च।`,
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
            "Every plan here is drawn to scale by our planning engine — the walls sit on column lines, every room has a door and a window, and the house stays inside the setbacks. Pick your plot size and road direction; each plan comes with a Vastu chart, room sizes and the cost to build it.",
            "यहां हर नक्शा हमारे प्लानिंग इंजन से स्केल पर बना है — दीवारें कॉलम लाइन पर, हर कमरे में दरवाज़ा और खिड़की, और घर सेटबैक के अंदर। अपना प्लॉट साइज़ और सड़क की दिशा चुनें; हर नक्शे के साथ वास्तु चार्ट, कमरों के साइज़ और बनाने का खर्च है।",
          )}
        </p>
      }
    >
      <nav
        aria-label={L(lang, "By gaj", "गज़ के हिसाब से")}
        className="flex flex-wrap gap-2"
      >
        {GAJ.map((g) => (
          <Link
            key={g.slug}
            href={langPath(lang, `${BASE}/gaj/${g.slug}`)}
            className="rounded-full border border-line bg-white px-4 py-2 text-[14px] font-semibold hover:border-amber"
          >
            {L(lang, `${g.gaj} gaj naksha`, `${g.gaj} गज़ का नक्शा`)}
          </Link>
        ))}
      </nav>
      <NakshaGallery
        lang={lang}
        cards={NAKSHE.map((n) => card(n, lang))}
        sizes={PLOTS.map(plotSlug)}
      />
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
    `${nakshaTitle(n, "hi")}: G+1 ${i.bhk}BHK, ${num(i.builtUp)} sq ft, स्केल पर, कमरों के साइज़, वास्तु जांच (${i.vastu.pct}%) और बनाने का खर्च लगभग ${lakh(i.total, "hi")}। ${nakshaHinglish(n)}।`,
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
  const entrance = i.vastu.rows.find((x) => x.role === "entrance");
  // number rooms that repeat on a floor (Toilet 1, Toilet 2…) so the Vastu table rows can be told apart
  const roleTotal = new Map<string, number>();
  i.vastu.rows.forEach((r) => {
    const k = `${r.floor}-${r.role}`;
    roleTotal.set(k, (roleTotal.get(k) ?? 0) + 1);
  });
  const roleSeen = new Map<string, number>();
  const vastuRows = i.vastu.rows.map((r) => {
    const k = `${r.floor}-${r.role}`;
    const seen = (roleSeen.get(k) ?? 0) + 1;
    roleSeen.set(k, seen);
    return { r, n: (roleTotal.get(k) ?? 1) > 1 ? seen : 0 };
  });
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
        `Is this ${s} ${f.en.toLowerCase()} naksha as per Vastu?`,
        `क्या यह ${s} ${f.hi} नक्शा वास्तु के अनुसार है?`,
      ),
      a: L(
        lang,
        `The plan is set the way that suits Vastu best for a ${f.en.toLowerCase()} plot: ${i.vastu.pct}% of the checked rooms sit in a recommended or acceptable direction${bad ? `, and ${bad} room${bad > 1 ? "s are" : " is"} marked for change in a custom plan` : ""}. The Vastu chart on this page lists every room.`,
        `${f.hi} प्लॉट के लिए नक्शा उस तरह रखा गया है जो वास्तु के सबसे अनुकूल है: जांचे गए ${i.vastu.pct}% कमरे सही या चलने लायक़ दिशा में हैं${bad ? `, और ${bad} कमरे कस्टम नक्शे में बदलने लायक़ हैं` : ""}। इस पेज के वास्तु चार्ट में हर कमरा दिया है।`,
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
        `About ${lakh(i.total, "en")} for ${num(i.builtUp)} sq ft at standard finish (${lakh(i.basic, "en")} basic to ${lakh(i.premium, "en")} premium), material and labour together, in a tier-2 city in 2026.`,
        `${num(i.builtUp)} sq ft के लिए स्टैंडर्ड फ़िनिश में लगभग ${lakh(i.total, "hi")} (बेसिक ${lakh(i.basic, "hi")} से प्रीमियम ${lakh(i.premium, "hi")}), सामग्री और मज़दूरी मिलाकर, 2026 में टियर-2 शहर में।`,
      ),
    },
    {
      q: L(
        lang,
        `${s} plot is how many gaj?`,
        `${s} प्लॉट कितने गज़ का होता है?`,
      ),
      a: L(
        lang,
        `${num(p.w * p.d)} sq ft ÷ 9 = ${num(gajOf(p), 1)} gaj (square yards).`,
        `${num(p.w * p.d)} sq ft ÷ 9 = ${num(gajOf(p), 1)} गज़।`,
      ),
    },
    {
      q: L(
        lang,
        "Can I get this naksha changed for my plot?",
        "क्या यह नक्शा मेरे प्लॉट के हिसाब से बदल सकता है?",
      ),
      a: L(
        lang,
        "Yes. Open it in the BOQ tool to change rooms, BHK, floors and setbacks yourself, or send your details for a custom naksha.",
        "हां। BOQ टूल में खोलकर कमरे, BHK, मंज़िल और सेटबैक ख़ुद बदलें, या कस्टम नक्शे के लिए अपनी जानकारी भेजें।",
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
            `${nakshaHinglish(n)} — G+1 ${i.bhk}BHK ${n.kind === "shop" ? "with a shop at the front" : "with car parking"}, drawn to scale. The road is on the ${f.en.split(" ")[0].toLowerCase()} side (bottom of the drawing). Plot ${num(p.w * p.d)} sq ft (${num(gajOf(p), 1)} gaj); after setbacks the house is ${bw} × ${bd} ft per floor.`,
            `${nakshaHinglish(n)} — G+1 ${i.bhk}BHK ${n.kind === "shop" ? "आगे दुकान के साथ" : "कार पार्किंग के साथ"}, स्केल पर। सड़क ${f.hi.replace(" मुखी", "")} दिशा में है (ड्रॉइंग में नीचे)। प्लॉट ${num(p.w * p.d)} sq ft (${num(gajOf(p), 1)} गज़); सेटबैक के बाद घर हर मंज़िल पर ${bw} × ${bd} ft।`,
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

      <section className="flex flex-col gap-3">
        <H2>{L(lang, `${s} house front elevation`, `${s} घर का फ़्रंट एलिवेशन`)}</H2>
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={nakshaPreview(n).src}
            alt={L(lang, `${s} ft G+1 house front elevation, ${nakshaHinglish(n)}`, `${s} फ़ीट G+1 घर का फ़्रंट एलिवेशन — ${nakshaHinglish(n)}`)}
            width={nakshaPreview(n).w}
            height={nakshaPreview(n).h}
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
        {(
          <p className="text-[12.5px] text-muted">
            {L(lang, "Artist impression of the front. Final look depends on your design and finishes.", "सामने के हिस्से का काल्पनिक चित्र। अंतिम रूप आपके डिज़ाइन और फ़िनिश पर निर्भर करेगा।")}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <H2>
          {L(
            lang,
            `${s} ${f.en.toLowerCase()} naksha — ground and first floor`,
            `${s} ${f.hi} नक्शा — ग्राउंड और पहली मंज़िल`,
          )}
        </H2>
        <div className="rounded-2xl border border-line bg-white p-4 sm:p-6">
          <NakshaPlanView lang={lang} slug={slug} />
        </div>
        {fit.notes.length > 0 && (
          <ul className="flex flex-col gap-1.5 text-[14px]">
            {fit.notes.map((x) => (
              <li
                key={x.en}
                className="rounded-lg bg-amber-tint px-3 py-2 text-ink"
              >
                {x[lang]}
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Cta href={tool}>
            {L(
              lang,
              "Edit this naksha · full BOQ, PDF, Excel →",
              "यह नक्शा बदलें · पूरा BOQ, PDF, Excel →",
            )}
          </Cta>
          <a
            href="#custom"
            className="rounded-xl border border-line bg-white px-4 py-3 text-[14px] font-semibold hover:border-amber"
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
              className="rounded-2xl border border-line bg-white p-4"
            >
              <h3 className="flex justify-between text-[15px] font-bold">
                {FLOORS(fl.floor, lang)}
                <span className="font-normal text-muted">
                  {ftIn(fl.L / FT)} × {ftIn(fl.B / FT)}
                </span>
              </h3>
              <ul className="mt-2 flex flex-col text-[14px]">
                {fl.rects
                  .filter(
                    (x) => !["column", "corridor", "stair"].includes(x.type),
                  )
                  .map((x, k) => (
                    <li
                      key={k}
                      className="flex justify-between gap-3 border-t border-line py-1.5 first:border-t-0"
                    >
                      <span>
                        {roomLabel(x.type, fl.floor, lang, Math.min(x.w, x.h))}
                      </span>
                      <span className="tabular-nums text-muted">
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
          {L(
            lang,
            `Vastu for a ${f.en.toLowerCase()} plot — where each room sits`,
            `${f.hi} प्लॉट का वास्तु — कौन सा कमरा किस दिशा में`,
          )}
        </H2>
        <p className="max-w-3xl text-[14px] leading-relaxed text-body">
          {entrance
            ? L(
                lang,
                `With the road on the ${f.en.split(" ")[0].toLowerCase()} side, the main door of this plan is in the ${ZONE_NAME[entrance.zone]?.[0] ?? entrance.zone} part of the front wall (${STATUS_NAME[entrance.status][0].toLowerCase()}). The same rooms are arranged differently for each road direction, so the Vastu result changes: this ${f.en.toLowerCase()} plan scores ${i.vastu.pct}%.`,
                `सड़क ${f.hi.replace(" मुखी", "")} दिशा में होने पर इस नक्शे का मुख्य दरवाज़ा सामने की दीवार के ${ZONE_NAME[entrance.zone]?.[1] ?? entrance.zone} हिस्से में है (${STATUS_NAME[entrance.status][1]})। वही कमरे हर सड़क दिशा के लिए अलग तरह से रखे जाते हैं, इसलिए वास्तु नतीजा बदलता है: यह ${f.hi} नक्शा ${i.vastu.pct}% है।`,
              )
            : L(
                lang,
                `The same rooms are arranged differently for each road direction, so the Vastu result changes: this ${f.en.toLowerCase()} plan scores ${i.vastu.pct}%.`,
                `वही कमरे हर सड़क दिशा के लिए अलग तरह से रखे जाते हैं, इसलिए वास्तु नतीजा बदलता है: यह ${f.hi} नक्शा ${i.vastu.pct}% है।`,
              )}
        </p>
        <Table
          head={[
            L(lang, "Room", "कमरा"),
            L(lang, "Direction", "दिशा"),
            L(lang, "Vastu", "वास्तु"),
          ]}
          rows={vastuRows.map(({ r, n }) => [
            `${ROLE_NAME[r.role] ? ROLE_NAME[r.role][lang === "hi" ? 1 : 0] : r.role}${n ? ` ${n}` : ""}${r.floor > 0 ? L(lang, " (first floor)", " (पहली मंज़िल)") : ""}`,
            ZONE_NAME[r.zone]
              ? ZONE_NAME[r.zone][lang === "hi" ? 1 : 0]
              : r.zone,
            <span key={`${r.floor}-${r.key}`} className={`font-semibold ${STATUS_CLASS[r.status]}`}>
              {STATUS_NAME[r.status][lang === "hi" ? 1 : 0]}
            </span>,
          ])}
        />
      </section>

      <section className="flex flex-col gap-4">
        <H2>
          {L(lang, "Cost to build this naksha", "यह नक्शा बनाने का खर्च")}
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
              <strong key="s">{lakh(i.total, lang)}</strong>,
            ],
            [L(lang, "Premium", "प्रीमियम"), lakh(i.premium, lang)],
          ]}
        />
        <p className="max-w-3xl text-[14px] leading-relaxed text-body">
          {L(
            lang,
            `Standard finish is about ${inr(i.perSqft)} per sq ft of built-up area. Structure: RCC frame with ${i.columns} columns${mat("cement") ? `, about ${num(mat("cement")!.qty)} bags of cement` : ""}${mat("steel") ? ` and ${num(mat("steel")!.qty / 1000, 1)} tonnes of steel` : ""}. Land, approvals, interiors, compound wall and borewell are extra.`,
            `स्टैंडर्ड फ़िनिश बिल्ट-अप पर लगभग ${inr(i.perSqft)} per sq ft। ढांचा: ${i.columns} कॉलम वाला RCC फ़्रेम${mat("cement") ? `, लगभग ${num(mat("cement")!.qty)} बोरी सीमेंट` : ""}${mat("steel") ? ` और ${num(mat("steel")!.qty / 1000, 1)} टन सरिया` : ""}। ज़मीन, मंज़ूरी, इंटीरियर, बाउंड्री वॉल और बोरवेल अलग।`,
          )}
        </p>
        <Table
          head={[L(lang, "Material", "सामग्री"), L(lang, "Quantity", "मात्रा")]}
          rows={res.materials.map((m) => [
            name(m.key, lang),
            `${num(m.qty)} ${name(m.unit, lang)}`,
          ])}
        />
      </section>

      <section className="flex flex-col gap-4">
        <H2>
          {L(
            lang,
            `${s} naksha for other directions`,
            `${s} के दूसरी दिशा वाले नक्शे`,
          )}
        </H2>
        <LinkGrid
          links={[
            ...siblings.map((x) => ({
              href: langPath(lang, `${BASE}/${x.slug}`),
              title: L(
                lang,
                FACING_NAME[x.facing].en,
                FACING_NAME[x.facing].hi,
              ),
              sub: L(
                lang,
                `Vastu ${nakshaInfo(x).vastu.pct}%`,
                `वास्तु ${nakshaInfo(x).vastu.pct}%`,
              ),
            })),
            ...(otherKind
              ? [
                  {
                    href: langPath(lang, `${BASE}/${otherKind.slug}`),
                    title:
                      otherKind.kind === "shop"
                        ? L(lang, "With shop", "दुकान के साथ")
                        : L(lang, "With parking", "पार्किंग के साथ"),
                    sub: L(
                      lang,
                      FACING_NAME[otherKind.facing].en,
                      FACING_NAME[otherKind.facing].hi,
                    ),
                  },
                ]
              : []),
          ]}
        />
        <H2>
          {L(lang, `Other ${f.en.toLowerCase()} nakshe`, `दूसरे ${f.hi} नक्शे`)}
        </H2>
        <LinkGrid
          links={sameFacing.map((x) => ({
            href: langPath(lang, `${BASE}/${x.slug}`),
            title: `${x.plot.w}×${x.plot.d}`,
            sub: L(
              lang,
              `${num(gajOf(x.plot), 0)} gaj · ${nakshaInfo(x).bhk}BHK`,
              `${num(gajOf(x.plot), 0)} गज़ · ${nakshaInfo(x).bhk}BHK`,
            ),
          }))}
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
    `${g.gaj} Gaj House Plan (Naksha) as per Vastu, with Cost`,
    `${g.gaj} गज़ का नक्शा (वास्तु अनुसार) और खर्च`,
  );
};
export const gajDescription = (slug: string, lang: Lang) => {
  const g = getGaj(slug)!;
  const sizes = g.plots.map((p) => `${p.w}×${p.d}`).join(", ");
  return L(
    lang,
    `${g.gaj} gaj ka naksha: house plans for ${sizes} plots, east, north, west and south facing, drawn to scale with Vastu check and construction cost.`,
    `${g.gaj} गज़ का नक्शा: ${sizes} प्लॉट के पूर्व, उत्तर, पश्चिम और दक्षिण मुखी घर के नक्शे, स्केल पर, वास्तु जांच और खर्च के साथ।`,
  );
};

export function GajPage({ lang, slug }: { lang: Lang; slug: string }) {
  const g = getGaj(slug)!;
  const list = NAKSHE.filter((n) => g.plots.includes(n.plot));
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
            `1 gaj (square yard) = 9 sq ft, so ${g.gaj} gaj is about ${num(g.gaj * 9)} sq ft. Plots of this size: ${g.plots.map((p) => `${p.w}×${p.d} ft (${num(gajOf(p), 1)} gaj)`).join(", ")}. Every naksha below is drawn to scale for all four road directions.`,
            `1 गज़ = 9 sq ft, यानी ${g.gaj} गज़ लगभग ${num(g.gaj * 9)} sq ft। इस साइज़ के प्लॉट: ${g.plots.map((p) => `${p.w}×${p.d} ft (${num(gajOf(p), 1)} गज़)`).join(", ")}। नीचे हर नक्शा चारों सड़क दिशाओं के लिए स्केल पर बना है।`,
          )}
        </p>
      }
    >
      <NakshaGallery
        lang={lang}
        cards={list.map((n) => card(n, lang))}
        sizes={g.plots.map(plotSlug)}
      />
      <nav className="flex flex-wrap gap-2">
        {GAJ.filter((x) => x !== g).map((x) => (
          <Link
            key={x.slug}
            href={langPath(lang, `${BASE}/gaj/${x.slug}`)}
            className="rounded-full border border-line bg-white px-4 py-2 text-[14px] font-semibold hover:border-amber"
          >
            {L(lang, `${x.gaj} gaj naksha`, `${x.gaj} गज़ का नक्शा`)}
          </Link>
        ))}
      </nav>
      <CustomSection lang={lang} />
    </Shell>
  );
}

export { FACINGS };
