import Link from "next/link";
import type { ReactNode } from "react";
import {
  Lang,
  langPath,
  OWNER,
  SITE_NAME,
  SITE_URL,
  WHATSAPP_NUMBER,
} from "@/lib/site";
import { CustomNakshaForm } from "./NakshaClient";
import { ProBuy } from "@/components/account/ProBuy";
import { AccountView } from "@/components/account/AccountPage";
import { H2, Shell } from "./SeoPages";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);

function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="flex max-w-3xl flex-col gap-3 text-[16px] leading-relaxed text-body [&_h2]:mt-4 [&_li]:ml-5 [&_li]:list-disc">
      {children}
    </div>
  );
}

export const INFO_META: Record<
  "about" | "contact" | "privacy" | "terms" | "pro" | "account",
  { title: [string, string]; description: [string, string] }
> = {
  about: {
    title: [
      "About BOQFather — who makes these estimates",
      "BOQFather के बारे में — ये एस्टिमेट कौन बनाता है",
    ],
    description: [
      "BOQFather is made by a civil engineer to give Indian home builders honest, item-wise construction estimates and house plans, free.",
      "BOQFather एक सिविल इंजीनियर ने बनाया है ताकि घर बनाने वालों को ईमानदार, आइटम-वार एस्टिमेट और नक्शे मुफ़्त मिलें।",
    ],
  },
  contact: {
    title: [
      "Contact BOQFather — custom naksha and estimates",
      "BOQFather से संपर्क — कस्टम नक्शा और एस्टिमेट",
    ],
    description: [
      "Get in touch for a custom house plan, a detailed BOQ for your drawings, or feedback on the calculators.",
      "कस्टम नक्शा, अपनी ड्रॉइंग का डिटेल BOQ, या कैलकुलेटर पर सुझाव के लिए संपर्क करें।",
    ],
  },
  privacy: {
    title: ["Privacy Policy — BOQFather", "प्राइवेसी पॉलिसी — BOQFather"],
    description: [
      "What BOQFather collects (almost nothing), what stays in your browser, and how contact requests are handled.",
      "BOQFather क्या जानकारी लेता है (लगभग कुछ नहीं), क्या आपके ब्राउज़र में रहता है, और संपर्क अनुरोध कैसे संभाले जाते हैं।",
    ],
  },
  pro: {
    title: [
      "BOQFather Pro — clean reports, plan & bill reading",
      "BOQFather प्रो — बिना निशान रिपोर्ट, नक्शा और बिल पढ़ना",
    ],
    description: [
      "Pro: PDF / Excel with your name, saved projects, plan photo to estimate, contractor bill checker. ₹199 a project or ₹499 a month.",
      "प्रो: आपके नाम के साथ PDF / Excel, सेव प्रोजेक्ट, नक्शे की फ़ोटो से एस्टिमेट, ठेकेदार बिल चेकर। ₹199 प्रति प्रोजेक्ट या ₹499 महीना।",
    ],
  },
  account: {
    title: ["My account — BOQFather", "मेरा अकाउंट — BOQFather"],
    description: [
      "Your saved projects and Pro plan.",
      "आपके सेव प्रोजेक्ट और प्रो प्लान।",
    ],
  },
  terms: {
    title: ["Terms of Use — BOQFather", "उपयोग की शर्तें — BOQFather"],
    description: [
      "How BOQFather estimates and house plans may be used, and their limits.",
      "BOQFather के एस्टिमेट और नक्शे कैसे इस्तेमाल करें, और उनकी सीमाएं।",
    ],
  },
};

const initials = OWNER.name
  .split(" ")
  .map((x) => x[0])
  .join("")
  .slice(0, 2);

export function AboutPage({ lang }: { lang: Lang }) {
  const facts = [OWNER.degree, OWNER.experience, OWNER.city].filter(Boolean);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    founder: {
      "@type": "Person",
      name: OWNER.name,
      ...(OWNER.degree ? { hasCredential: OWNER.degree } : {}),
      jobTitle: "Civil Engineer",
    },
  };
  return (
    <Shell
      lang={lang}
      path="about"
      crumbs={[{ name: L(lang, "About", "हमारे बारे में") }]}
      h1={L(lang, "About BOQFather", "BOQFather के बारे में")}
      intro={
        <p>
          {L(
            lang,
            "Most families build a house once. They should know what it will cost, what material goes into it and whether a contractor's quote is fair — before the first brick. BOQFather works that out the way a site engineer does, item by item, and gives it away free.",
            "ज़्यादातर परिवार ज़िंदगी में एक बार घर बनाते हैं। पहली ईंट से पहले उन्हें पता होना चाहिए कि कितना खर्च होगा, कितनी सामग्री लगेगी और ठेकेदार का रेट सही है या नहीं। BOQFather यह हिसाब एक साइट इंजीनियर की तरह, आइटम-वार निकालता है — और मुफ़्त देता है।",
          )}
        </p>
      }
    >
      <section className="flex max-w-3xl flex-col gap-4 rounded-2xl border border-line bg-white p-5 sm:flex-row sm:items-center">
        {OWNER.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={OWNER.photo}
            alt={OWNER.name}
            className="h-24 w-24 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="font-display flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-amber text-[26px] font-extrabold text-ink">
            {initials}
          </span>
        )}
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-[12px] font-bold uppercase tracking-wide text-amber-dark">
            {L(lang, "Founder", "संस्थापक")}
          </p>
          <p className="font-display text-[22px] font-extrabold">
            {OWNER.name}
          </p>
          <p className="text-[15px] text-body">
            {L(lang, "Civil engineer", "सिविल इंजीनियर")}
            {facts.length ? ` · ${facts.join(" · ")}` : ""}
          </p>
          {OWNER.work && <p className="text-[15px] text-body">{OWNER.work}</p>}
        </div>
      </section>
      <Prose>
        <H2>{L(lang, "How the numbers are made", "आंकड़े कैसे बनते हैं")}</H2>
        <ul>
          <li>
            {L(
              lang,
              "Plans come from a planning engine that places rooms to scale, keeps the stair and walls in line floor over floor, and checks every room has a door, light and air. It is tested on 1,680 plot sizes on every change.",
              "नक्शे एक प्लानिंग इंजन से बनते हैं जो कमरे स्केल पर रखता है, हर मंज़िल पर सीढ़ी और दीवारें एक लाइन में रखता है, और जांचता है कि हर कमरे में दरवाज़ा, रोशनी और हवा हो। हर बदलाव पर इसे 1,680 प्लॉट साइज़ पर टेस्ट किया जाता है।",
            )}
          </li>
          <li>
            {L(
              lang,
              "Estimates are item-wise BOQs measured from the plan — excavation, concrete, steel from a bar bending schedule, brickwork, plaster, flooring, doors, windows, services — priced at 2026 market rates.",
              "एस्टिमेट नक्शे से नापा गया आइटम-वार BOQ है — खुदाई, कंक्रीट, BBS से सरिया, चिनाई, प्लास्टर, फ़र्श, दरवाज़े, खिड़की, सर्विसेज़ — 2026 के बाज़ार रेट पर।",
            )}
          </li>
          <li>
            {L(
              lang,
              "Quantities follow standard Indian practice (IS 456, IS 1200 methods of measurement, NBC minimum room sizes). Every calculator shows its working so you can check it.",
              "मात्रा भारतीय मानकों के हिसाब से (IS 456, IS 1200 नाप के तरीके, NBC के न्यूनतम कमरे के साइज़)। हर कैलकुलेटर अपना पूरा हिसाब दिखाता है ताकि आप जांच सकें।",
            )}
          </li>
        </ul>
        <H2>{L(lang, "What BOQFather is not", "BOQFather क्या नहीं है")}</H2>
        <p>
          {L(
            lang,
            "It is not a structural design or a sanctioned drawing. Use the plans and estimates to plan, budget and talk to your architect and contractor — then get the drawings signed by a registered professional and passed by your local body.",
            "यह स्ट्रक्चरल डिज़ाइन या पास किया हुआ नक्शा नहीं है। नक्शे और एस्टिमेट से प्लानिंग, बजट और आर्किटेक्ट-ठेकेदार से बात करें — फिर ड्रॉइंग रजिस्टर्ड प्रोफ़ेशनल से साइन करवाकर नगर निकाय से पास करवाएं।",
          )}
        </p>
        <p>
          <Link
            href={langPath(lang, "contact")}
            className="font-semibold text-steel underline"
          >
            {L(lang, "Contact us →", "संपर्क करें →")}
          </Link>
        </p>
      </Prose>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </Shell>
  );
}

export function ContactPage({ lang }: { lang: Lang }) {
  return (
    <Shell
      lang={lang}
      path="contact"
      crumbs={[{ name: L(lang, "Contact", "संपर्क") }]}
      h1={L(lang, "Contact", "संपर्क करें")}
      intro={
        <p>
          {L(
            lang,
            "For a custom naksha, a detailed BOQ from your own drawings, or a question about the tools — fill the form and it opens on WhatsApp with your details ready.",
            "कस्टम नक्शा, अपनी ड्रॉइंग का डिटेल BOQ, या टूल के बारे में कोई सवाल — फ़ॉर्म भरें, आपकी जानकारी के साथ WhatsApp खुल जाएगा।",
          )}
        </p>
      }
    >
      <div className="flex flex-wrap gap-3">
        {WHATSAPP_NUMBER && (
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener"
            className="rounded-xl bg-[#1d7a46] px-5 py-3 text-[15px] font-semibold text-white"
          >
            WhatsApp: +{WHATSAPP_NUMBER}
          </a>
        )}
        {OWNER.email && (
          <span className="select-all rounded-xl border border-line bg-white px-5 py-3 text-[15px] font-semibold">
            {OWNER.email}
          </span>
        )}
      </div>
      <section className="max-w-3xl rounded-2xl border border-line bg-white p-5 sm:p-6">
        <CustomNakshaForm lang={lang} />
      </section>
    </Shell>
  );
}

export function PrivacyPage({ lang }: { lang: Lang }) {
  return (
    <Shell
      lang={lang}
      path="privacy"
      crumbs={[{ name: L(lang, "Privacy", "प्राइवेसी") }]}
      h1={L(lang, "Privacy Policy", "प्राइवेसी पॉलिसी")}
      intro={
        <p>
          {L(
            lang,
            "Last updated: 3 November 2026",
            "आख़िरी बदलाव: 3 नवंबर 2026",
          )}
        </p>
      }
    >
      <Prose>
        <H2>{L(lang, "What we collect", "हम क्या जानकारी लेते हैं")}</H2>
        <p>
          {L(
            lang,
            "The calculators, plans and estimates run in your own browser. The sizes, rooms and rates you type are not sent to us and are not stored on any server. There is no sign-up.",
            "कैलकुलेटर, नक्शे और एस्टिमेट आपके अपने ब्राउज़र में चलते हैं। आप जो साइज़, कमरे और रेट डालते हैं वो हमें नहीं भेजे जाते और किसी सर्वर पर सेव नहीं होते। कोई साइन-अप नहीं है।",
          )}
        </p>
        <H2>{L(lang, "Contact requests", "संपर्क अनुरोध")}</H2>
        <p>
          {L(
            lang,
            "When you use the custom naksha or contact form, your details are put into a WhatsApp message on your own phone; nothing is sent until you press send in WhatsApp. We use those details only to reply to you and never sell or share them.",
            "कस्टम नक्शा या संपर्क फ़ॉर्म भरने पर आपकी जानकारी आपके अपने फ़ोन पर WhatsApp मैसेज में भरी जाती है; जब तक आप WhatsApp में भेजें नहीं दबाते, कुछ नहीं जाता। हम उस जानकारी का इस्तेमाल सिर्फ़ आपको जवाब देने के लिए करते हैं, कभी बेचते या शेयर नहीं करते।",
          )}
        </p>
        <H2>{L(lang, "Visitor statistics", "विज़िटर आंकड़े")}</H2>
        <p>
          {L(
            lang,
            "We may use Google Analytics to count visits and see which pages are useful. It sets cookies and collects anonymous usage data such as pages viewed, device type and approximate city. You can block it with your browser settings or an ad blocker.",
            "हम विज़िट गिनने और कौन से पेज काम के हैं यह देखने के लिए Google Analytics इस्तेमाल कर सकते हैं। यह कुकीज़ लगाता है और गुमनाम जानकारी लेता है जैसे देखे गए पेज, डिवाइस और लगभग शहर। आप इसे ब्राउज़र सेटिंग या ऐड ब्लॉकर से रोक सकते हैं।",
          )}
        </p>
        <H2>{L(lang, "Questions", "सवाल")}</H2>
        <p>
          <Link
            href={langPath(lang, "contact")}
            className="font-semibold text-steel underline"
          >
            {L(lang, "Contact us", "संपर्क करें")}
          </Link>
        </p>
      </Prose>
    </Shell>
  );
}

export function TermsPage({ lang }: { lang: Lang }) {
  return (
    <Shell
      lang={lang}
      path="terms"
      crumbs={[{ name: L(lang, "Terms", "नियम और शर्तें") }]}
      h1={L(lang, "Terms of Use", "उपयोग की शर्तें")}
      intro={
        <p>
          {L(
            lang,
            "Last updated: 3 November 2026",
            "आख़िरी बदलाव: 3 नवंबर 2026",
          )}
        </p>
      }
    >
      <Prose>
        <H2>{L(lang, "Estimates", "एस्टिमेट")}</H2>
        <p>
          {L(
            lang,
            "All costs, quantities and rates are preliminary estimates for planning and budgeting. Actual costs depend on your drawings, site, specifications, market prices and contractor. Check them against a detailed estimate before you commit money.",
            "सभी खर्च, मात्रा और रेट प्लानिंग और बजट के लिए शुरुआती अनुमान हैं। असली खर्च आपकी ड्रॉइंग, साइट, स्पेसिफ़िकेशन, बाज़ार के दाम और ठेकेदार पर निर्भर है। पैसा लगाने से पहले डिटेल एस्टिमेट से मिलाएं।",
          )}
        </p>
        <H2>{L(lang, "House plans", "घर के नक्शे")}</H2>
        <p>
          {L(
            lang,
            "The plans are concept layouts. They are not structural designs and are not approved drawings. Before building, get the plan and structure designed and signed by a registered architect / engineer, and get permission from your local authority. You may use the plans for your own house.",
            "नक्शे कॉन्सेप्ट लेआउट हैं। ये स्ट्रक्चरल डिज़ाइन या स्वीकृत ड्रॉइंग नहीं हैं। बनाने से पहले नक्शा और स्ट्रक्चर रजिस्टर्ड आर्किटेक्ट / इंजीनियर से डिज़ाइन और साइन करवाएं, और नगर निकाय से अनुमति लें। आप ये नक्शे अपने घर के लिए इस्तेमाल कर सकते हैं।",
          )}
        </p>
        <H2>{L(lang, "Vastu", "वास्तु")}</H2>
        <p>
          {L(
            lang,
            "Vastu checks follow commonly cited guidelines and are given for information; practice differs between experts.",
            "वास्तु जांच आम तौर पर बताए जाने वाले नियमों पर आधारित है और जानकारी के लिए है; जानकारों की राय में फ़र्क़ होता है।",
          )}
        </p>
        <H2>{L(lang, "Liability", "ज़िम्मेदारी")}</H2>
        <p>
          {L(
            lang,
            "BOQFather is provided as is. We are not responsible for losses from decisions made only on the basis of these tools.",
            "BOQFather जैसा है वैसा दिया गया है। सिर्फ़ इन टूल के आधार पर लिए गए फ़ैसलों से हुए नुकसान की ज़िम्मेदारी हमारी नहीं है।",
          )}
        </p>
      </Prose>
    </Shell>
  );
}

export function ProPage({ lang }: { lang: Lang }) {
  const rows: [string, string, boolean, boolean][] = [
    [
      L(
        lang,
        "Plan from plot size, item-wise BOQ, BBS, MB",
        "प्लॉट से नक्शा, आइटम-वार BOQ, BBS, MB",
      ),
      "",
      true,
      true,
    ],
    [
      L(
        lang,
        "84 Vastu-checked nakshe, city rates, calculators",
        "84 वास्तु-जांचे नक्शे, शहर के रेट, कैलकुलेटर",
      ),
      "",
      true,
      true,
    ],
    [
      L(lang, "Read your AutoCAD DXF plan", "अपनी AutoCAD DXF फ़ाइल पढ़ें"),
      "",
      true,
      true,
    ],
    [
      L(
        lang,
        "PDF / Excel without the free mark, with your firm's name",
        "बिना निशान PDF / Excel, आपकी फ़र्म के नाम के साथ",
      ),
      "",
      false,
      true,
    ],
    [
      L(
        lang,
        "Save projects and share a link",
        "प्रोजेक्ट सेव करें और लिंक शेयर करें",
      ),
      "",
      true,
      true,
    ],
    [
      L(
        lang,
        "Upload a plan photo / PDF → estimate (AI reads the rooms)",
        "नक्शे की फ़ोटो / PDF अपलोड → एस्टिमेट (AI कमरे पढ़ता है)",
      ),
      "",
      false,
      true,
    ],
    [
      L(
        lang,
        "Contractor bill checker: every line vs market rate",
        "ठेकेदार बिल चेकर: हर लाइन बाज़ार रेट से",
      ),
      "",
      false,
      true,
    ],
  ];
  return (
    <Shell
      lang={lang}
      path="pro"
      crumbs={[{ name: "Pro" }]}
      h1={L(lang, "BOQFather Pro", "BOQFather प्रो")}
      intro={
        <p>
          {L(
            lang,
            "Everything for planning your house stays free. Pro is for the reports you hand over, reading your own drawings and bills, and checking what the contractor charges.",
            "घर की प्लानिंग का सब कुछ फ़्री रहेगा। प्रो उन रिपोर्ट के लिए है जो आप आगे देते हैं, अपनी ड्रॉइंग और बिल पढ़ने के लिए, और ठेकेदार के रेट जांचने के लिए।",
          )}
        </p>
      }
    >
      <div className="grid max-w-4xl gap-4 sm:grid-cols-3">
        {(
          [
            [
              L(lang, "One project", "एक प्रोजेक्ट"),
              "₹199",
              L(
                lang,
                "Clean reports and AI reading for one saved project, for good.",
                "एक सेव प्रोजेक्ट के लिए बिना निशान रिपोर्ट और AI रीडिंग, हमेशा के लिए।",
              ),
            ],
            [
              L(lang, "Monthly", "मासिक"),
              "₹499",
              L(
                lang,
                "All Pro features on every project for 30 days — for engineers and contractors.",
                "30 दिन हर प्रोजेक्ट पर सारे प्रो फ़ीचर — इंजीनियर और ठेकेदार के लिए।",
              ),
            ],
            [
              L(lang, "Custom naksha", "कस्टम नक्शा"),
              "₹2,999",
              L(
                lang,
                "Your plot's plan + item-wise BOQ by an expert in 3 days, 2 rounds of changes.",
                "एक्सपर्ट से आपके प्लॉट का नक्शा + आइटम-वार BOQ 3 दिन में, 2 बार बदलाव।",
              ),
            ],
          ] as const
        ).map(([t, p, d]) => (
          <div
            key={t}
            className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-5"
          >
            <span className="text-[13px] font-bold uppercase tracking-wide text-muted">
              {t}
            </span>
            <span className="font-display text-[30px] font-extrabold">{p}</span>
            <span className="text-[14px] leading-relaxed text-body">{d}</span>
          </div>
        ))}
      </div>
      <div className="max-w-4xl overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[480px] text-[14px]">
          <thead>
            <tr className="bg-[#f4f1ea] text-left">
              <th className="px-4 py-2.5">{L(lang, "Feature", "फ़ीचर")}</th>
              <th className="px-4 py-2.5 text-center">
                {L(lang, "Free", "फ़्री")}
              </th>
              <th className="px-4 py-2.5 text-center">Pro</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([f, , free, pro]) => (
              <tr key={f} className="border-t border-line">
                <td className="px-4 py-2.5">{f}</td>
                <td className="px-4 py-2.5 text-center">{free ? "✓" : "–"}</td>
                <td className="px-4 py-2.5 text-center font-bold text-[#1d7a46]">
                  {pro ? "✓" : "–"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ProBuy lang={lang} />
      <p className="max-w-3xl text-[13px] text-muted">
        {L(
          lang,
          "Payments by UPI, card or net banking through Razorpay. AI reading: up to 15 uploads a day.",
          "पेमेंट Razorpay से UPI, कार्ड या नेट बैंकिंग। AI रीडिंग: दिन में 15 अपलोड तक।",
        )}
      </p>
    </Shell>
  );
}

export function AccountShell({ lang }: { lang: Lang }) {
  return (
    <Shell
      lang={lang}
      path="account"
      crumbs={[{ name: L(lang, "My account", "मेरा अकाउंट") }]}
      h1={L(lang, "My account", "मेरा अकाउंट")}
      intro={null}
    >
      <AccountView lang={lang} />
    </Shell>
  );
}
