"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ROOM_DEFS, RoomType } from "@/engine";
import { SketchPanel } from "@/components/calcs/boq/BoqPanels";
import { getNaksha, nakshaPlan } from "@/content/naksha";
import { Lang, WHATSAPP_NUMBER } from "@/lib/site";
import { useAccount } from "@/components/account/Account";
import { PLANS } from "@/lib/pricing";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);

/** The drawn G+1 plan of one naksha with its Vastu chart (rendered into the static page). */
export function NakshaPlanView({ lang, slug }: { lang: Lang; slug: string }) {
  const r = useMemo(() => {
    const n = getNaksha(slug);
    return n ? nakshaPlan(n).res : null;
  }, [slug]);
  if (!r) return null;
  return (
    <SketchPanel
      r={r}
      lang={lang}
      names={(tp) =>
        tp in ROOM_DEFS ? ROOM_DEFS[tp as RoomType].name[lang] : tp
      }
    />
  );
}

export interface GalleryCard {
  slug: string;
  href: string;
  img: string;
  alt: string;
  title: string;
  sub: string;
  size: string;
  facing: string;
  kind: string;
  gaj: number;
}

/** Filterable list of nakshe — every card is in the HTML, filters only hide cards. */
export function NakshaGallery({
  lang,
  cards,
  sizes,
}: {
  lang: Lang;
  cards: GalleryCard[];
  sizes: string[];
}) {
  const [size, setSize] = useState("");
  const [facing, setFacing] = useState("");
  const [kind, setKind] = useState("");
  const shown = cards.filter(
    (c) =>
      (!size || c.size === size) &&
      (!facing || c.facing === facing) &&
      (!kind || c.kind === kind),
  );
  const sel =
    "rounded-lg border border-line bg-white px-3 py-2 text-[14px] font-semibold";
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-white p-4">
        <label className="flex flex-col gap-1 text-[12px] font-semibold uppercase tracking-wide text-muted">
          {L(lang, "Plot size", "प्लॉट साइज़")}
          <select
            className={sel}
            value={size}
            onChange={(e) => setSize(e.target.value)}
          >
            <option value="">{L(lang, "All sizes", "सभी साइज़")}</option>
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s.replace("x", " × ")} ft
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[12px] font-semibold uppercase tracking-wide text-muted">
          {L(lang, "Road side (facing)", "सड़क की दिशा")}
          <select
            className={sel}
            value={facing}
            onChange={(e) => setFacing(e.target.value)}
          >
            <option value="">{L(lang, "All directions", "सभी दिशा")}</option>
            <option value="E">{L(lang, "East facing", "पूर्व मुखी")}</option>
            <option value="N">{L(lang, "North facing", "उत्तर मुखी")}</option>
            <option value="W">{L(lang, "West facing", "पश्चिम मुखी")}</option>
            <option value="S">{L(lang, "South facing", "दक्षिण मुखी")}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[12px] font-semibold uppercase tracking-wide text-muted">
          {L(lang, "Type", "प्रकार")}
          <select
            className={sel}
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            <option value="">{L(lang, "All", "सभी")}</option>
            <option value="house">
              {L(lang, "House with parking", "पार्किंग वाला घर")}
            </option>
            <option value="shop">
              {L(lang, "House with shop", "दुकान के साथ घर")}
            </option>
          </select>
        </label>
        <span className="pb-2 text-[13px] text-muted">
          {L(lang, `${shown.length} plans`, `${shown.length} नक्शे`)}
        </span>
      </div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <li key={c.slug} hidden={!shown.includes(c)}>
            <Link
              href={c.href}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-0.5 hover:border-amber"
            >
              <span className="flex aspect-[4/3] items-center justify-center bg-[#faf8f4] p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.img}
                  alt={c.alt}
                  loading="lazy"
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="flex flex-col gap-1 p-4">
                <span className="text-[16px] font-bold leading-snug">
                  {c.title}
                </span>
                <span className="text-[13px] text-muted">{c.sub}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Custom naksha request: the details go to WhatsApp as one ready message. */
export function CustomNakshaForm({
  lang,
  defaults,
}: {
  lang: Lang;
  defaults?: { size?: string; facing?: string };
}) {
  const [f, setF] = useState({
    name: "",
    city: "",
    size: defaults?.size ?? "",
    facing: defaults?.facing ?? "",
    floors: "G+1",
    bhk: "3",
    need: "",
  });
  const [sent, setSent] = useState(false);
  const acc = useAccount();
  const [paid, setPaid] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) =>
    setF((x) => ({ ...x, [k]: e.target.value }));
  const msg = [
    L(lang, "Custom naksha request (BOQFather)", "कस्टम नक्शा (BOQFather)"),
    `${L(lang, "Name", "नाम")}: ${f.name}`,
    `${L(lang, "City", "शहर")}: ${f.city}`,
    `${L(lang, "Plot size (ft)", "प्लॉट साइज़ (ft)")}: ${f.size}`,
    `${L(lang, "Road facing", "सड़क की दिशा")}: ${f.facing}`,
    `${L(lang, "Floors", "मंज़िल")}: ${f.floors} · ${f.bhk} BHK`,
    `${L(lang, "Requirements", "ज़रूरत")}: ${f.need}`,
  ].join("\n");
  const url = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`
    : "";
  const inp =
    "rounded-lg border border-line bg-white px-3 py-2 text-[15px] text-ink";
  const lab = "flex flex-col gap-1 text-[13px] font-semibold";
  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
        if (url) window.open(url, "_blank", "noopener");
      }}
    >
      <label className={lab}>
        {L(lang, "Your name", "आपका नाम")}
        <input className={inp} value={f.name} onChange={set("name")} required />
      </label>
      <label className={lab}>
        {L(lang, "City", "शहर")}
        <input className={inp} value={f.city} onChange={set("city")} />
      </label>
      <label className={lab}>
        {L(
          lang,
          "Plot size (width × depth, ft)",
          "प्लॉट साइज़ (चौड़ाई × गहराई, ft)",
        )}
        <input
          className={inp}
          value={f.size}
          onChange={set("size")}
          placeholder="30 x 50"
          required
        />
      </label>
      <label className={lab}>
        {L(lang, "Road on which side", "सड़क किस तरफ़")}
        <select className={inp} value={f.facing} onChange={set("facing")}>
          <option value="">—</option>
          <option value={L(lang, "East", "पूर्व")}>
            {L(lang, "East", "पूर्व")}
          </option>
          <option value={L(lang, "North", "उत्तर")}>
            {L(lang, "North", "उत्तर")}
          </option>
          <option value={L(lang, "West", "पश्चिम")}>
            {L(lang, "West", "पश्चिम")}
          </option>
          <option value={L(lang, "South", "दक्षिण")}>
            {L(lang, "South", "दक्षिण")}
          </option>
        </select>
      </label>
      <label className={lab}>
        {L(lang, "Floors", "मंज़िल")}
        <select className={inp} value={f.floors} onChange={set("floors")}>
          {["G", "G+1", "G+2", "G+3"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </label>
      <label className={lab}>
        BHK
        <select className={inp} value={f.bhk} onChange={set("bhk")}>
          {["1", "2", "3", "4", "5"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </label>
      <label className={lab + " sm:col-span-2"}>
        {L(
          lang,
          "What you need (Vastu, shop, parking, rent floor, lift…)",
          "क्या चाहिए (वास्तु, दुकान, पार्किंग, किराये का फ़्लोर, लिफ़्ट…)",
        )}
        <textarea
          className={inp + " min-h-[88px]"}
          value={f.need}
          onChange={set("need")}
        />
      </label>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <div className="flex flex-wrap gap-2">
          {acc.payReady && (
            <button
              type="button"
              disabled={!f.name || !f.size}
              onClick={async () => {
                const ok = await acc
                  .buy("custom", { details: f })
                  .catch(() => false);
                if (ok) {
                  setPaid(true);
                  if (url) window.open(url, "_blank", "noopener");
                }
              }}
              className="w-fit rounded-xl bg-ink px-5 py-3 text-[15px] font-semibold text-white disabled:opacity-50"
            >
              {L(
                lang,
                `Order custom naksha · ₹${PLANS.custom.inr.toLocaleString("en-IN")}`,
                `कस्टम नक्शा ऑर्डर करें · ₹${PLANS.custom.inr.toLocaleString("en-IN")}`,
              )}
            </button>
          )}
          <button
            type="submit"
            className="w-fit rounded-xl bg-[#1d7a46] px-5 py-3 text-[15px] font-semibold text-white hover:bg-[#17633a]"
          >
            {L(lang, "Ask on WhatsApp", "WhatsApp पर पूछें")}
          </button>
        </div>
        {acc.payReady && (
          <p className="text-[12px] text-muted">
            {L(
              lang,
              "Custom naksha: plan + item-wise BOQ for your plot in 3 days, up to 2 rounds of changes.",
              "कस्टम नक्शा: आपके प्लॉट का नक्शा + आइटम-वार BOQ 3 दिन में, 2 बार बदलाव तक।",
            )}
          </p>
        )}
        {paid && (
          <p className="rounded-lg bg-[#e6f4ec] px-3 py-2 text-[14px] font-semibold text-[#1d7a46]">
            {L(
              lang,
              "Order received! We will contact you within a day. You can see it under My account.",
              "ऑर्डर मिल गया! हम एक दिन में संपर्क करेंगे। इसे 'मेरा अकाउंट' में देख सकते हैं।",
            )}
          </p>
        )}
        {sent &&
          (url ? (
            <p className="text-[14px]">
              <a
                href={url}
                target="_blank"
                rel="noopener"
                className="font-semibold text-[#1d7a46] underline"
              >
                {L(
                  lang,
                  "Open WhatsApp with your details →",
                  "अपनी जानकारी के साथ WhatsApp खोलें →",
                )}
              </a>
            </p>
          ) : (
            <p className="rounded-lg bg-warn-tint px-3 py-2 text-[14px] text-[#4a3b12]">
              {L(
                lang,
                "Custom plan requests open very soon. Meanwhile, make your own plan and estimate in the BOQ tool.",
                "कस्टम नक्शे की बुकिंग बहुत जल्द शुरू होगी। तब तक BOQ टूल में अपना नक्शा और एस्टिमेट ख़ुद बनाएं।",
              )}
            </p>
          ))}
      </div>
    </form>
  );
}
