import Link from "next/link";
import { PlanUploader } from "@/components/account/PlanUploader";
import { AI_DAILY_LIMIT, PLANS } from "@/lib/pricing";
import { langPath, type Lang } from "@/lib/site";
import { H2, Shell } from "./SeoPages";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);

export const PLAN_UPLOAD_META = {
  title: [
    "Plan to Estimate — upload your house plan, get the BOQ",
    "नक्शे से एस्टिमेट — अपना नक्शा अपलोड करें, BOQ पाएं",
  ],
  description: [
    "Upload your house plan as AutoCAD DXF, photo or PDF. Every room is read, you check the sizes, and you get an item-wise BOQ, material list, steel (BBS) and total cost.",
    "अपना नक्शा AutoCAD DXF, फ़ोटो या PDF में अपलोड करें। हर कमरा पढ़ा जाता है, आप साइज़ जांचते हैं, और आइटम-वार BOQ, मटेरियल लिस्ट, सरिया (BBS) और कुल खर्च मिलता है।",
  ],
};

const card = "flex flex-col gap-2 rounded-2xl border border-line bg-white p-5";

export function PlanUploadPage({ lang }: { lang: Lang }) {
  const steps: [string, string][] = [
    [
      L(lang, "Upload the plan", "नक्शा अपलोड करें"),
      L(
        lang,
        "AutoCAD DXF, a photo of a printed or hand-drawn plan, or a PDF from your architect.",
        "AutoCAD की DXF फ़ाइल, छपे या हाथ से बने नक्शे की फ़ोटो, या आर्किटेक्ट की PDF।",
      ),
    ],
    [
      L(lang, "Rooms are read", "कमरे पढ़े जाते हैं"),
      L(
        lang,
        "Each room's name and size (length × width in feet) is read, floor by floor — ground floor, first floor and so on.",
        "हर कमरे का नाम और साइज़ (लंबाई × चौड़ाई, फ़ीट में) मंज़िल के हिसाब से पढ़ा जाता है — ग्राउंड, पहली मंज़िल आदि।",
      ),
    ],
    [
      L(lang, "You check the rooms", "आप कमरे जांचते हैं"),
      L(
        lang,
        "A table shows every room. Change the type or size of anything read wrong, or remove it. Nothing is used until you press “Use these rooms”.",
        "एक टेबल में हर कमरा दिखता है। जो ग़लत पढ़ा गया हो उसका प्रकार या साइज़ बदलें, या हटा दें। “ये कमरे इस्तेमाल करें” दबाने तक कुछ इस्तेमाल नहीं होता।",
      ),
    ],
    [
      L(lang, "Get the estimate", "एस्टिमेट पाएं"),
      L(
        lang,
        "The item-wise BOQ tool opens with your rooms: quantities, rates, total cost, materials and steel — ready to change and download.",
        "आपके कमरों के साथ आइटम-वार BOQ टूल खुलता है: मात्रा, रेट, कुल खर्च, मटेरियल और सरिया — बदलने और डाउनलोड के लिए तैयार।",
      ),
    ],
  ];

  const gets = [
    L(
      lang,
      "Item-wise BOQ — excavation to painting, about 55–60 items",
      "आइटम-वार BOQ — खुदाई से पेंटिंग तक, लगभग 55–60 आइटम",
    ),
    L(
      lang,
      "Measurement book (Nos × L × B × H) for every item",
      "हर आइटम की मेज़रमेंट बुक (Nos × L × B × H)",
    ),
    L(
      lang,
      "Steel (BBS) — bar diameter and kg for footings, columns, beams, slab",
      "सरिया (BBS) — फ़ुटिंग, कॉलम, बीम, स्लैब के लिए सरिये का साइज़ और किलो",
    ),
    L(
      lang,
      "Material list — cement bags, sand, aggregate, bricks, tiles",
      "मटेरियल लिस्ट — सीमेंट बैग, रेत, गिट्टी, ईंट, टाइल",
    ),
    L(
      lang,
      "Total cost, cost per sq ft, floor-wise built-up area",
      "कुल खर्च, प्रति sq ft खर्च, मंज़िल-वार बिल्ट-अप एरिया",
    ),
    L(
      lang,
      "Download Excel and PDF; save the project and share a link",
      "Excel और PDF डाउनलोड; प्रोजेक्ट सेव करें और लिंक शेयर करें",
    ),
  ];

  const formats: [string, string, string, string][] = [
    [
      "DXF (AutoCAD)",
      L(lang, "Free", "फ़्री"),
      L(
        lang,
        "Read on your phone or computer; the file is not uploaded anywhere. Most accurate — sizes come from the drawing itself.",
        "आपके फ़ोन या कंप्यूटर पर ही पढ़ी जाती है; फ़ाइल कहीं अपलोड नहीं होती। सबसे सटीक — साइज़ ड्रॉइंग से ही आते हैं।",
      ),
      ".dxf",
    ],
    [
      L(lang, "Photo", "फ़ोटो"),
      "Pro",
      L(
        lang,
        "Photo of a printed, blueprint or hand-drawn plan. Read by AI. Sizes must be written in the rooms.",
        "छपे, ब्लूप्रिंट या हाथ से बने नक्शे की फ़ोटो। AI से पढ़ी जाती है। कमरों में साइज़ लिखे होने चाहिए।",
      ),
      "JPG, PNG, WebP",
    ],
    [
      "PDF",
      "Pro",
      L(
        lang,
        "PDF from your architect or a scan. Read by AI.",
        "आर्किटेक्ट की PDF या स्कैन। AI से पढ़ी जाती है।",
      ),
      ".pdf",
    ],
    [
      "DWG (AutoCAD)",
      "—",
      L(
        lang,
        "Not read directly. In AutoCAD: Save As → DXF, then upload the DXF.",
        "सीधे नहीं पढ़ी जाती। AutoCAD में Save As → DXF करें, फिर DXF अपलोड करें।",
      ),
      ".dwg",
    ],
  ];

  const dxfRules = [
    L(
      lang,
      "Draw each room as a closed polyline (or rectangle).",
      "हर कमरा एक बंद पॉलीलाइन (या रेक्टेंगल) से बना हो।",
    ),
    L(
      lang,
      "Write the room name inside it — Bedroom, Kitchen, Toilet, Hall, Dining, Pooja, Store, Parking, Balcony... Hindi names (शयनकक्ष, रसोई, शौचालय) also work.",
      "कमरे का नाम उसके अंदर लिखा हो — Bedroom, Kitchen, Toilet, Hall, Dining, Pooja, Store, Parking, Balcony... हिंदी नाम (शयनकक्ष, रसोई, शौचालय) भी चलते हैं।",
    ),
    L(
      lang,
      "If a size is written in the room (12'6\" x 10'0\", 12x10, 3.6x3.0 m), that size is used; otherwise the polyline is measured.",
      "कमरे में साइज़ लिखा हो (12'6\" x 10'0\", 12x10, 3.6x3.0 m) तो वही लिया जाता है; नहीं तो पॉलीलाइन नापी जाती है।",
    ),
    L(
      lang,
      "Drawing units are taken from the file (Units setting); if none is set, millimetres are assumed.",
      "ड्रॉइंग की यूनिट फ़ाइल की Units सेटिंग से ली जाती है; सेट न हो तो मिलीमीटर माना जाता है।",
    ),
    L(
      lang,
      "More than one floor: write titles like GROUND FLOOR PLAN / FIRST FLOOR PLAN above each floor, or keep each floor as a separate outline.",
      "एक से ज़्यादा मंज़िल: हर मंज़िल के ऊपर GROUND FLOOR PLAN / FIRST FLOOR PLAN जैसा शीर्षक लिखें, या हर मंज़िल को अलग आउटलाइन में रखें।",
    ),
  ];

  const photoTips = [
    L(
      lang,
      "Shoot from straight above, the whole plan in the frame, in good light, without shadows.",
      "बिल्कुल ऊपर से फ़ोटो लें, पूरा नक्शा फ़्रेम में, अच्छी रोशनी में, बिना परछाईं के।",
    ),
    L(
      lang,
      "Room sizes must be readable — zoom in on your phone to check before uploading.",
      "कमरों के साइज़ साफ़ पढ़े जाने चाहिए — अपलोड से पहले फ़ोन पर ज़ूम करके देख लें।",
    ),
    L(
      lang,
      "One floor per photo is best; a sheet with two floors and clear titles also works.",
      "एक फ़ोटो में एक मंज़िल सबसे अच्छा; दो मंज़िल वाली शीट भी चलती है अगर शीर्षक साफ़ हों।",
    ),
    L(
      lang,
      "Up to 8 MB per file. Big photos are shrunk on your phone before upload.",
      "एक फ़ाइल 8 MB तक। बड़ी फ़ोटो अपलोड से पहले फ़ोन पर ही छोटी हो जाती है।",
    ),
  ];

  const faqs = [
    {
      q: L(
        lang,
        "How accurate is the estimate from an uploaded plan?",
        "अपलोड किए नक्शे से एस्टिमेट कितना सही होता है?",
      ),
      a: L(
        lang,
        "As accurate as the room sizes. A DXF gives exact sizes; a photo or PDF is read by AI and can miss or misread a size, which is why you check every room before it is used. The BOQ uses standard specifications (foundation, column and slab sizes); a structural engineer's design can change steel and concrete.",
        "जितने सही कमरों के साइज़, उतना सही। DXF से सटीक साइज़ मिलते हैं; फ़ोटो या PDF AI पढ़ता है और कोई साइज़ छूट या ग़लत पढ़ सकता है, इसीलिए इस्तेमाल से पहले आप हर कमरा जांचते हैं। BOQ स्टैंडर्ड स्पेसिफ़िकेशन (नींव, कॉलम, स्लैब साइज़) पर बनता है; स्ट्रक्चरल इंजीनियर के डिज़ाइन से सरिया और कंक्रीट बदल सकते हैं।",
      ),
    },
    {
      q: L(
        lang,
        "Is my plan kept or shared?",
        "क्या मेरा नक्शा रखा या शेयर किया जाता है?",
      ),
      a: L(
        lang,
        "A DXF never leaves your device. A photo or PDF is sent once to the AI service (Claude, by Anthropic) to be read, and BOQFather does not store it; only the rooms you save in a project are kept, in your account.",
        "DXF आपके डिवाइस से बाहर नहीं जाती। फ़ोटो या PDF सिर्फ़ पढ़ने के लिए एक बार AI सेवा (Anthropic का Claude) को भेजी जाती है, और BOQFather उसे सेव नहीं करता; सिर्फ़ वो कमरे रखे जाते हैं जो आप प्रोजेक्ट में सेव करते हैं, आपके अकाउंट में।",
      ),
    },
    {
      q: L(
        lang,
        "What if my plan has no sizes written?",
        "अगर मेरे नक्शे में साइज़ नहीं लिखे हैं तो?",
      ),
      a: L(
        lang,
        "From a DXF the sizes are measured from the drawing. From a photo the AI estimates them from the scale, which is rough — type the correct sizes in the check table.",
        "DXF से साइज़ ड्रॉइंग से नापे जाते हैं। फ़ोटो से AI स्केल देखकर अंदाज़ा लगाता है, जो मोटा होता है — जांच टेबल में सही साइज़ भर दें।",
      ),
    },
    {
      q: L(
        lang,
        "How many plans can I read?",
        "कितने नक्शे पढ़वा सकते हैं?",
      ),
      a: L(
        lang,
        `DXF: unlimited and free. Photo / PDF: up to ${AI_DAILY_LIMIT} a day on Pro (₹${PLANS.project.inr} for one project or ₹${PLANS.month.inr} a month).`,
        `DXF: असीमित और फ़्री। फ़ोटो / PDF: प्रो में दिन में ${AI_DAILY_LIMIT} तक (एक प्रोजेक्ट ₹${PLANS.project.inr} या ₹${PLANS.month.inr} महीना)।`,
      ),
    },
  ];

  return (
    <Shell
      lang={lang}
      path="plan-to-estimate"
      crumbs={[{ name: L(lang, "Plan to Estimate", "नक्शे से एस्टिमेट") }]}
      h1={L(
        lang,
        "Plan to Estimate — upload your plan, get the BOQ",
        "नक्शे से एस्टिमेट — नक्शा अपलोड करें, BOQ पाएं",
      )}
      faqs={faqs}
      intro={
        <p>
          {L(
            lang,
            "Already have a house plan from your architect or contractor? Upload it here. Every room is read, you check the sizes, and the full item-wise estimate is made from your own plan — not from a thumb-rule rate per sq ft.",
            "आर्किटेक्ट या ठेकेदार से नक्शा पहले से है? यहां अपलोड करें। हर कमरा पढ़ा जाता है, आप साइज़ जांचते हैं, और पूरा आइटम-वार एस्टिमेट आपके अपने नक्शे से बनता है — प्रति sq ft के अंदाज़े से नहीं।",
          )}
        </p>
      }
    >
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-amber px-1.5 text-[11px] font-extrabold">
            PRO
          </span>
          <span className="text-[14px] text-body">
            {L(
              lang,
              "DXF is free · photo and PDF reading is Pro",
              "DXF फ़्री · फ़ोटो और PDF पढ़ना प्रो में",
            )}
          </span>
        </div>
        <PlanUploader lang={lang} />
      </section>

      <section className="flex flex-col gap-4">
        <H2>{L(lang, "How it works", "यह कैसे काम करता है")}</H2>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([t, d], i) => (
            <li key={t} className={card}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-[14px] font-bold text-white">
                {i + 1}
              </span>
              <strong className="text-[16px]">{t}</strong>
              <p className="text-[14px] leading-relaxed text-body">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-4">
        <H2>{L(lang, "What you get", "आपको क्या मिलता है")}</H2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {gets.map((g) => (
            <li
              key={g}
              className="flex gap-2 rounded-xl border border-line bg-white px-4 py-3 text-[15px]"
            >
              <span className="font-bold text-[#1d7a46]">✓</span>
              {g}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <H2>{L(lang, "File formats", "फ़ाइल फ़ॉर्मेट")}</H2>
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[560px] text-[14px]">
            <thead>
              <tr className="bg-[#f4f1ea] text-left">
                <th className="px-4 py-2.5">{L(lang, "Format", "फ़ॉर्मेट")}</th>
                <th className="px-4 py-2.5">{L(lang, "Files", "फ़ाइल")}</th>
                <th className="px-4 py-2.5">{L(lang, "Plan", "प्लान")}</th>
                <th className="px-4 py-2.5">
                  {L(lang, "How it is read", "कैसे पढ़ी जाती है")}
                </th>
              </tr>
            </thead>
            <tbody>
              {formats.map(([f, plan, how, ext]) => (
                <tr key={f} className="border-t border-line align-top">
                  <td className="px-4 py-3 font-semibold">{f}</td>
                  <td className="px-4 py-3 text-muted">{ext}</td>
                  <td className="px-4 py-3">
                    {plan === "Pro" ? (
                      <span className="rounded bg-amber px-1.5 text-[11px] font-extrabold">
                        PRO
                      </span>
                    ) : (
                      <span className="font-semibold text-[#1d7a46]">
                        {plan}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-body">{how}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className={card}>
          <h2 className="font-display text-[19px] font-bold">
            {L(lang, "Preparing a DXF", "DXF कैसे तैयार करें")}
          </h2>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[14px] leading-relaxed text-body">
            {dxfRules.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div className={card}>
          <h2 className="font-display text-[19px] font-bold">
            {L(lang, "Taking a good photo", "अच्छी फ़ोटो कैसे लें")}
          </h2>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[14px] leading-relaxed text-body">
            {photoTips.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border-2 border-amber bg-amber-tint/50 p-5">
        <h2 className="font-display text-[19px] font-bold">
          {L(lang, "Good to know", "ध्यान रखें")}
        </h2>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[14px] leading-relaxed">
          <li>
            {L(
              lang,
              "Staircase, lift, shafts and open setbacks are left out of the room list; the BOQ adds the stair and structure itself.",
              "सीढ़ी, लिफ़्ट, शाफ़्ट और खुले सेटबैक कमरों की लिस्ट में नहीं आते; सीढ़ी और स्ट्रक्चर BOQ ख़ुद जोड़ता है।",
            )}
          </li>
          <li>
            {L(
              lang,
              "Up to 4 floors are read. Rates are 2026 market rates for a mid-size city — change the city or any rate in the tool.",
              "4 मंज़िल तक पढ़ी जाती हैं। रेट 2026 के मध्यम शहर के बाज़ार रेट हैं — टूल में शहर या कोई भी रेट बदलें।",
            )}
          </li>
          <li>
            {L(
              lang,
              "A photo or PDF is read only after you log in; it is not stored.",
              "फ़ोटो या PDF सिर्फ़ लॉगिन के बाद पढ़ी जाती है; सेव नहीं होती।",
            )}
          </li>
        </ul>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href={langPath(lang, "pro")}
            className="rounded-lg bg-ink px-4 py-2.5 text-[14px] font-semibold text-white"
          >
            {L(
              lang,
              `Pro plans · ₹${PLANS.project.inr} / project · ₹${PLANS.month.inr} / month →`,
              `प्रो प्लान · ₹${PLANS.project.inr} / प्रोजेक्ट · ₹${PLANS.month.inr} / महीना →`,
            )}
          </Link>
          <Link
            href={langPath(lang, "house-boq-estimate")}
            className="rounded-lg border border-ink bg-white px-4 py-2.5 text-[14px] font-semibold"
          >
            {L(
              lang,
              "No plan yet? Make one from the plot size →",
              "नक्शा नहीं है? प्लॉट साइज़ से बनाएं →",
            )}
          </Link>
        </div>
      </section>

    </Shell>
  );
}
