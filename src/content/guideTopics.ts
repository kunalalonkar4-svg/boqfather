/**
 * Separate pages for the house-building guide: one per topic and one per most-searched question.
 * The checklist items come from guide.ts; this file adds the page URL, the page title,
 * a longer explanation and the common mistakes.
 */
import { GUIDE, GUIDE_FAQ, GuideFaq, GuideSection } from "./guide";

type T = { en: string; hi: string };

export interface TopicPage {
  slug: string;
  section: GuideSection;
  title: T;
  description: T;
  /** Longer explanation, paragraph by paragraph. */
  body: T[];
  mistakes: T[];
}

export interface QuestionPage {
  slug: string;
  faq: GuideFaq;
  title: T;
  description: T;
  body: T[];
  /** Tool that answers it for the reader's own house. */
  tool?: { path: string; label: T };
}

const sec = (id: string) => GUIDE.find((s) => s.id === id)!;
const faq = (start: string) => GUIDE_FAQ.find((f) => f.q.en.startsWith(start))!;

export const TOPICS: TopicPage[] = [
  {
    slug: "land-documents",
    section: sec("land"),
    title: {
      en: "Plot Documents to Check Before Building a House",
      hi: "घर बनाने से पहले प्लॉट के कौन से कागज़ जांचें",
    },
    description: {
      en: "Sale deed, land record (7/12, khasra), mutation, NA order, encumbrance certificate and tax receipts — what each paper proves and how to check it before you build.",
      hi: "रजिस्ट्री, भू-अभिलेख (7/12, खसरा), नामांतरण, डायवर्शन आदेश, बोझ-मुक्त प्रमाणपत्र और टैक्स रसीद — हर कागज़ क्या साबित करता है और बनाने से पहले कैसे जांचें।",
    },
    body: [
      {
        en: "A house is only as safe as the land under it. The bank checks these papers before a home loan, the municipality checks them before passing the map, and a buyer checks them when you sell. If one is missing you find out at the worst time — after the money is spent.",
        hi: "घर उतना ही सुरक्षित है जितनी उसके नीचे की ज़मीन। होम लोन से पहले बैंक ये कागज़ देखता है, नक्शा पास करने से पहले नगर निगम, और बेचते समय ख़रीदार। कोई कागज़ कम हो तो पता सबसे ग़लत समय पर चलता है — पैसा लग जाने के बाद।",
      },
      {
        en: "Get the land record extract and the encumbrance certificate fresh from the government portal or office, not as photocopies from the seller. Match the plot number, area and boundaries in the deed with what is on the ground — a boundary dispute stops construction faster than anything else.",
        hi: "भू-अभिलेख की नकल और बोझ-मुक्त प्रमाणपत्र सरकारी पोर्टल या दफ़्तर से ताज़ा निकलवाएं, बेचने वाले की फ़ोटोकॉपी पर भरोसा न करें। रजिस्ट्री में लिखा प्लॉट नंबर, एरिया और सीमा ज़मीन पर मिलाएं — सीमा का झगड़ा काम सबसे जल्दी रोकता है।",
      },
      {
        en: "If the plot is in a private colony, ask for the approved layout and check that your plot is shown as a residential plot on it, with the road width written. A plot on land that was never converted from agriculture may not get a building permit at all.",
        hi: "प्लॉट प्राइवेट कॉलोनी में है तो स्वीकृत लेआउट मांगें और देखें कि उसमें आपका प्लॉट आवासीय दिखाया गया है और सड़क की चौड़ाई लिखी है। जो ज़मीन खेती से बदली (डायवर्ट) ही नहीं हुई, उस पर नक्शा पास होना मुश्किल है।",
      },
    ],
    mistakes: [
      {
        en: "Starting work on a power of attorney or an agreement to sell instead of a registered sale deed.",
        hi: "रजिस्टर्ड रजिस्ट्री की जगह मुख़्तारनामे या इक़रारनामे पर काम शुरू कर देना।",
      },
      {
        en: "Not getting the mutation done, so the land record still shows the old owner.",
        hi: "नामांतरण न करवाना, जिससे भू-अभिलेख में अब भी पुराने मालिक का नाम रहता है।",
      },
      {
        en: "Building to the boundary wall the seller showed instead of the measured plot — and losing a few feet to the neighbour later.",
        hi: "नापे हुए प्लॉट की जगह बेचने वाले की बताई दीवार तक बना लेना — और बाद में कुछ फ़ीट पड़ोसी को देना पड़ना।",
      },
    ],
  },
  {
    slug: "building-approvals",
    section: sec("rules"),
    title: {
      en: "Building Permission, Setbacks and FAR for a House",
      hi: "घर का नक्शा पास, सेटबैक और FAR — पूरी जानकारी",
    },
    description: {
      en: "What setbacks, ground coverage and FAR / FSI mean, how they limit your house, and the approvals needed before and after construction.",
      hi: "सेटबैक, ग्राउंड कवरेज और FAR / FSI का मतलब, ये आपके घर को कैसे सीमित करते हैं, और निर्माण से पहले और बाद में कौन सी मंज़ूरी चाहिए।",
    },
    body: [
      {
        en: "Setbacks are the open strips you must leave around the house — in front, at the back and on the sides. They decide the real size of each floor: a 30 × 50 ft plot with 5 ft in front, 3 ft at the back and 3 ft on each side leaves only 24 × 42 ft to build on.",
        hi: "सेटबैक वो खुली पट्टियां हैं जो घर के चारों ओर छोड़नी होती हैं — आगे, पीछे और बगल में। इन्हीं से हर मंज़िल का असली साइज़ तय होता है: 30 × 50 ft प्लॉट में आगे 5 ft, पीछे 3 ft और दोनों बगल 3-3 ft छोड़ें तो बनाने को सिर्फ़ 24 × 42 ft बचता है।",
      },
      {
        en: "FAR (floor area ratio, also called FSI) caps the total floor area of all floors together. With an FAR of 1.5 on a 1,500 sq ft plot you may build 2,250 sq ft in total — that is what limits the number of floors, not the strength of the columns.",
        hi: "FAR (फ़्लोर एरिया रेशियो, जिसे FSI भी कहते हैं) सभी मंज़िलों का कुल एरिया सीमित करता है। 1,500 sq ft प्लॉट पर FAR 1.5 हो तो कुल 2,250 sq ft बना सकते हैं — मंज़िलों की गिनती यही तय करता है, कॉलम की ताक़त नहीं।",
      },
      {
        en: "The figures differ from city to city and change with the road width, so take them from your local body's bye-laws or your architect. Build only after the map is passed; an unapproved floor can be sealed, and it blocks the completion certificate, the permanent connections and a resale.",
        hi: "ये आंकड़े हर शहर में अलग हैं और सड़क की चौड़ाई से बदलते हैं, इसलिए लोकल भवन नियम या आर्किटेक्ट से लें। नक्शा पास होने के बाद ही बनाएं; बिना मंज़ूरी की मंज़िल सील हो सकती है, और उससे कंप्लीशन सर्टिफ़िकेट, स्थायी कनेक्शन और बिक्री अटकती है।",
      },
    ],
    mistakes: [
      {
        en: "Covering the front setback with a room or a slab to gain space.",
        hi: "जगह बढ़ाने के लिए आगे के सेटबैक पर कमरा या स्लैब डाल देना।",
      },
      {
        en: "Getting a G+1 map passed and building G+2.",
        hi: "G+1 का नक्शा पास करवाकर G+2 बना लेना।",
      },
      {
        en: "Forgetting the completion certificate, then struggling for the permanent power and water connections.",
        hi: "कंप्लीशन सर्टिफ़िकेट भूल जाना, फिर स्थायी बिजली-पानी कनेक्शन के लिए भटकना।",
      },
    ],
  },
  {
    slug: "house-planning",
    section: sec("plan"),
    title: {
      en: "How to Plan a House: Rooms, Stair, Parking and Light",
      hi: "घर का नक्शा कैसे प्लान करें: कमरे, सीढ़ी, पार्किंग और रोशनी",
    },
    description: {
      en: "Plan the house fully on paper before the first slab: BHK and future floors, parking, stair, kitchen and toilets, light and ventilation, soil test and structural drawing.",
      hi: "पहले स्लैब से पहले पूरा घर काग़ज़ पर प्लान करें: BHK और आगे की मंज़िलें, पार्किंग, सीढ़ी, किचन-टॉयलेट, रोशनी-हवा, मिट्टी की जांच और स्ट्रक्चरल ड्रॉइंग।",
    },
    body: [
      {
        en: "Good planning is about zoning. The ground floor carries the public part of the home — parking, porch, living hall, kitchen with dining, a common toilet and often one bedroom for parents. The upper floors carry the private part — bedrooms with attached toilets, a family lounge at the stair landing and a balcony.",
        hi: "अच्छी प्लानिंग का मतलब है सही ज़ोनिंग। ग्राउंड फ़्लोर पर घर का बाहर वाला हिस्सा — पार्किंग, पोर्च, हॉल, किचन-डाइनिंग, कॉमन टॉयलेट और अक्सर बुज़ुर्गों का एक बेडरूम। ऊपर की मंज़िलों पर निजी हिस्सा — अटैच्ड टॉयलेट वाले बेडरूम, सीढ़ी के पास फ़ैमिली लाउंज और बालकनी।",
      },
      {
        en: "Keep the kitchen and toilets close to each other and stacked floor over floor, so the water and drain pipes run short and straight. Put the stair near the entrance so an upper floor can later be rented out without passing through your hall.",
        hi: "किचन और टॉयलेट पास-पास और हर मंज़िल पर एक के ऊपर एक रखें, ताकि पानी और नाली के पाइप छोटे और सीधे रहें। सीढ़ी मुख्य दरवाज़े के पास रखें ताकि ऊपर की मंज़िल बाद में किराये पर दे सकें और कोई हॉल से न गुज़रे।",
      },
      {
        en: "Every room needs a window on an outside wall or an open shaft, and every toilet needs a ventilator. If you plan to add a floor in a few years, tell the structural engineer now — footings and columns are sized for the final number of floors, not today's.",
        hi: "हर कमरे में बाहर की दीवार या खुले शाफ़्ट पर खिड़की चाहिए, और हर टॉयलेट में वेंटिलेटर। कुछ साल बाद मंज़िल बढ़ानी है तो स्ट्रक्चरल इंजीनियर को अभी बताएं — नींव और कॉलम आख़िरी मंज़िल के हिसाब से बनते हैं, आज के हिसाब से नहीं।",
      },
    ],
    mistakes: [
      {
        en: "Building from a rough sketch and deciding rooms as the walls go up.",
        hi: "कच्चे स्केच से बनाना और दीवारें उठते-उठते कमरे तय करना।",
      },
      {
        en: "A parking too short for a car (needs about 5 m / 16.5 ft clear) or a stair too narrow (at least 0.9–1.0 m).",
        hi: "कार के लिए छोटी पार्किंग (लगभग 5 m / 16.5 ft साफ़ जगह चाहिए) या संकरी सीढ़ी (कम से कम 0.9–1.0 m)।",
      },
      {
        en: "Skipping the soil test and the structural drawing to save a few thousand rupees.",
        hi: "कुछ हज़ार रुपये बचाने के लिए मिट्टी की जांच और स्ट्रक्चरल ड्रॉइंग छोड़ देना।",
      },
    ],
  },
  {
    slug: "construction-budget",
    section: sec("budget"),
    title: {
      en: "How to Make a House Construction Budget and BOQ",
      hi: "घर बनाने का बजट और BOQ कैसे बनाएं",
    },
    description: {
      en: "From a per-sq-ft figure to an item-wise BOQ: what to include, how much extra to keep, material quantities and stage-wise cash flow for a house in India.",
      hi: "per sq ft रेट से आइटम-वार BOQ तक: क्या-क्या जोड़ें, कितना अतिरिक्त रखें, सामग्री की मात्रा और स्टेज-वार पैसों का प्लान।",
    },
    body: [
      {
        en: "Start with a rough figure: built-up area × rate per sq ft. In a tier-2 city in 2026 that is about ₹1,450 (basic), ₹1,700 (standard) or ₹2,400 (premium) per sq ft, material and labour together. This tells you whether the plan fits your money before anything is drawn in detail.",
        hi: "शुरुआत मोटे आंकड़े से करें: बिल्ट-अप एरिया × per sq ft रेट। 2026 में टियर-2 शहर में यह लगभग ₹1,450 (बेसिक), ₹1,700 (स्टैंडर्ड) या ₹2,400 (प्रीमियम) per sq ft है, सामग्री और मज़दूरी मिलाकर। डिटेल ड्रॉइंग से पहले ही पता चल जाता है कि नक्शा आपके बजट में आता है या नहीं।",
      },
      {
        en: "Once the plan is final, make an item-wise BOQ (bill of quantities): every item measured from the drawing and priced — excavation, PCC, footings, columns, beams, slabs, brickwork, plaster, flooring, doors, windows, electrical, plumbing, paint. The BOQ is what you compare contractors' quotes against and what you check running bills with.",
        hi: "नक्शा फ़ाइनल होते ही आइटम-वार BOQ (बिल ऑफ़ क्वांटिटी) बनाएं: ड्रॉइंग से हर आइटम का नाप और दाम — खुदाई, PCC, फ़ुटिंग, कॉलम, बीम, स्लैब, चिनाई, प्लास्टर, फ़र्श, दरवाज़े, खिड़की, बिजली, प्लंबिंग, पेंट। ठेकेदारों के कोटेशन इसी BOQ से मिलाए जाते हैं और चालू बिल इसी से जांचे जाते हैं।",
      },
      {
        en: "Keep 8–10% on top for price rises and changes. Land, approvals, architect fees, interiors, furniture, compound wall, borewell and water tank are usually outside the per-sq-ft rate — list them separately so they don't surprise you at the end.",
        hi: "दाम बढ़ने और बदलाव के लिए 8–10% अलग रखें। ज़मीन, मंज़ूरी, आर्किटेक्ट फ़ीस, इंटीरियर, फ़र्नीचर, बाउंड्री वॉल, बोरवेल और पानी की टंकी आमतौर पर per sq ft रेट से बाहर होते हैं — इन्हें अलग लिखें ताकि आख़िर में झटका न लगे।",
      },
    ],
    mistakes: [
      {
        en: "Taking a per-sq-ft quote without knowing what it includes.",
        hi: "per sq ft कोटेशन ले लेना बिना यह जाने कि उसमें क्या-क्या शामिल है।",
      },
      {
        en: "Spending the whole budget on the structure and running short at finishing.",
        hi: "पूरा बजट ढांचे पर लगा देना और फ़िनिशिंग में पैसा कम पड़ जाना।",
      },
      {
        en: "Buying all material at once without a stage-wise plan, and losing some to theft or weather.",
        hi: "स्टेज-वार प्लान के बिना सारी सामग्री एक साथ ख़रीद लेना, और कुछ चोरी या मौसम में ख़राब होना।",
      },
    ],
  },
  {
    slug: "contractor-agreement",
    section: sec("contract"),
    title: {
      en: "Choosing a House Contractor and Writing the Agreement",
      hi: "घर के लिए ठेकेदार कैसे चुनें और एग्रीमेंट में क्या लिखें",
    },
    description: {
      en: "Labour-only or turnkey contract, what to write in the agreement, brands and grades, stage-wise payments and how to check a contractor's rate.",
      hi: "सिर्फ़ लेबर या टर्नकी ठेका, एग्रीमेंट में क्या लिखें, ब्रांड और ग्रेड, स्टेज-वार भुगतान और ठेकेदार का रेट कैसे जांचें।",
    },
    body: [
      {
        en: "In a labour-only contract you buy the material and the contractor supplies the workers; you control quality but must be on site often. In a material-plus-labour (turnkey) contract the contractor does everything for a rate per sq ft; it is simpler, but only as good as the specification you write down.",
        hi: "सिर्फ़ लेबर ठेके में सामग्री आप ख़रीदते हैं और ठेकेदार मज़दूर देता है; क्वालिटी आपके हाथ में है पर साइट पर बार-बार जाना पड़ता है। सामग्री + लेबर (टर्नकी) ठेके में ठेकेदार per sq ft रेट पर सब करता है; आसान है, पर उतना ही अच्छा जितनी अच्छी आपकी लिखी स्पेसिफ़िकेशन।",
      },
      {
        en: "The agreement should name the drawings, the brands and grades of every material, the finish items (tile size and price, door type, number of electrical points), the time for completion, the payment schedule, and what happens with extra work and delays.",
        hi: "एग्रीमेंट में ड्रॉइंग, हर सामग्री का ब्रांड और ग्रेड, फ़िनिश आइटम (टाइल का साइज़ और दाम, दरवाज़े का प्रकार, बिजली के पॉइंट की गिनती), पूरा होने का समय, भुगतान का शेड्यूल, और अतिरिक्त काम और देरी पर क्या होगा — सब लिखा हो।",
      },
      {
        en: "Pay against completed stages — plinth, each slab, brickwork, plaster, flooring, handover — and keep 5% back until a few months after handover for leaks and cracks.",
        hi: "भुगतान पूरे हुए स्टेज पर करें — प्लिंथ, हर स्लैब, चिनाई, प्लास्टर, फ़र्श, हैंडओवर — और लीकेज-दरार के लिए हैंडओवर के कुछ महीने बाद तक 5% रोककर रखें।",
      },
    ],
    mistakes: [
      {
        en: "Giving a large advance before work starts.",
        hi: "काम शुरू होने से पहले बड़ा एडवांस दे देना।",
      },
      {
        en: "A one-page agreement with only the rate per sq ft.",
        hi: "सिर्फ़ per sq ft रेट वाला एक पन्ने का एग्रीमेंट।",
      },
      {
        en: "Choosing the cheapest quote without checking what was left out of it.",
        hi: "सबसे सस्ता कोटेशन चुन लेना बिना देखे कि उसमें से क्या छोड़ा गया है।",
      },
    ],
  },
  {
    slug: "construction-stages-quality-checks",
    section: sec("stages"),
    title: {
      en: "House Construction Stages and Quality Checks at Each Stage",
      hi: "घर निर्माण के स्टेज और हर स्टेज पर क्वालिटी जांच",
    },
    description: {
      en: "Layout, foundation, columns, slab, concrete, curing, brickwork, services and finishing — what to check on site at every stage of building a house.",
      hi: "लेआउट, नींव, कॉलम, स्लैब, कंक्रीट, तराई, चिनाई, सर्विसेज़ और फ़िनिशिंग — घर बनाते समय हर स्टेज पर साइट पर क्या जांचें।",
    },
    body: [
      {
        en: "A house goes up in a fixed order: layout and excavation → PCC and footings → columns up to plinth → plinth beams and filling → columns, beams and slab for each floor → brickwork → electrical and plumbing chasing → plaster → waterproofing → flooring and tiling → doors and windows → painting and fittings.",
        hi: "घर एक तय क्रम में बनता है: लेआउट और खुदाई → PCC और फ़ुटिंग → प्लिंथ तक कॉलम → प्लिंथ बीम और भराई → हर मंज़िल के कॉलम, बीम और स्लैब → चिनाई → बिजली-प्लंबिंग की खुदाई (चेज़िंग) → प्लास्टर → वॉटरप्रूफ़िंग → फ़र्श और टाइल → दरवाज़े-खिड़की → पेंट और फ़िटिंग।",
      },
      {
        en: "The checks that matter most happen just before concrete is poured, because after that the steel is hidden for ever. Count the bars, check the diameters and spacing against the drawing, look for cover blocks under the steel, and make sure the shuttering is level, tight and well propped.",
        hi: "सबसे ज़रूरी जांच कंक्रीट डालने से ठीक पहले होती है, क्योंकि उसके बाद सरिया हमेशा के लिए छिप जाता है। सरिये गिनें, मोटाई और दूरी ड्रॉइंग से मिलाएं, सरिये के नीचे कवर ब्लॉक देखें, और शटरिंग लेवल में, कसी हुई और अच्छी टेक वाली हो।",
      },
      {
        en: "After the pour, curing decides how strong the concrete really becomes. Keep it wet for at least 7 days (10 days with PPC cement), and leave slab props for 7–14 days depending on the span.",
        hi: "ढलाई के बाद तराई तय करती है कि कंक्रीट असल में कितना मज़बूत बनेगा। कम से कम 7 दिन गीला रखें (PPC सीमेंट में 10 दिन), और स्पैन के हिसाब से स्लैब की टेक 7–14 दिन रहने दें।",
      },
    ],
    mistakes: [
      {
        en: "Adding extra water to make concrete easier to pour — it can cut the strength badly.",
        hi: "ढलाई आसान करने के लिए कंक्रीट में ज़्यादा पानी डालना — इससे मज़बूती बहुत घट जाती है।",
      },
      {
        en: "Cutting walls for pipes after plaster, or plastering before the pipes are pressure-tested.",
        hi: "प्लास्टर के बाद पाइप के लिए दीवार काटना, या पाइप का प्रेशर टेस्ट किए बिना प्लास्टर कर देना।",
      },
      {
        en: "Tiling a toilet or terrace before the waterproofing is done and tested.",
        hi: "वॉटरप्रूफ़िंग करके टेस्ट किए बिना टॉयलेट या छत पर टाइल लगा देना।",
      },
    ],
  },
  {
    slug: "site-engineer-thumb-rules",
    section: sec("engineer"),
    title: {
      en: "Thumb Rules for Site Engineers: Cement, Steel, Concrete, Bricks",
      hi: "साइट इंजीनियर के लिए थंब रूल: सीमेंट, सरिया, कंक्रीट, ईंट",
    },
    description: {
      en: "Quick numbers a new site engineer should know: material per sq ft, concrete mixes, steel weight per metre, cover, bricks per m³, plaster thickness and unit conversions.",
      hi: "नए साइट इंजीनियर को याद रखने वाले आंकड़े: प्रति sq ft सामग्री, कंक्रीट मसाला, सरिया का वज़न प्रति मीटर, कवर, प्रति m³ ईंट, प्लास्टर की मोटाई और इकाई बदलना।",
    },
    body: [
      {
        en: "Thumb rules are for checking, not for designing. Use them to see in a minute whether a supplier's bill, a contractor's claim or your own estimate is in the right range; then work out the real quantity from the drawing.",
        hi: "थंब रूल जांचने के लिए हैं, डिज़ाइन के लिए नहीं। इनसे एक मिनट में पता चलता है कि सप्लायर का बिल, ठेकेदार का दावा या आपका अपना एस्टिमेट सही दायरे में है या नहीं; असली मात्रा ड्रॉइंग से निकालें।",
      },
      {
        en: "Concrete volume in a drawing is wet volume; the dry material you buy is about 1.54 times that. For M20 (1:1.5:3) one cubic metre needs about 8 bags of cement, 0.42 m³ of sand and 0.84 m³ of aggregate.",
        hi: "ड्रॉइंग में कंक्रीट का आयतन गीला होता है; ख़रीदना सूखा सामान लगभग 1.54 गुना पड़ता है। M20 (1:1.5:3) में एक घन मीटर के लिए लगभग 8 बोरी सीमेंट, 0.42 m³ रेत और 0.84 m³ गिट्टी लगती है।",
      },
      {
        en: "Steel is ordered by weight but shown on drawings by length and diameter. Weight per metre is d²/162 kg with d in mm — so a 12 mm bar of 12 m weighs about 10.7 kg.",
        hi: "सरिया वज़न से ख़रीदा जाता है पर ड्रॉइंग में लंबाई और मोटाई से दिखता है। प्रति मीटर वज़न d²/162 किलो (d mm में) — यानी 12 m लंबा 12 mm सरिया लगभग 10.7 किलो का।",
      },
    ],
    mistakes: [
      {
        en: "Ordering material from a thumb rule without checking it against the drawing.",
        hi: "ड्रॉइंग से मिलाए बिना थंब रूल से सामग्री ऑर्डर कर देना।",
      },
      {
        en: "Mixing up wet and dry volume, or sq ft and sq m.",
        hi: "गीला और सूखा आयतन, या sq ft और sq m में गड़बड़ करना।",
      },
      {
        en: "Forgetting laps and wastage (3–5%) in the steel order.",
        hi: "सरिये के ऑर्डर में लैप और वेस्टेज (3–5%) भूल जाना।",
      },
    ],
  },
];

export const QUESTIONS: QuestionPage[] = [
  {
    slug: "construction-cost-per-sq-ft",
    faq: faq("What is the house construction cost"),
    title: {
      en: "House Construction Cost per Sq Ft in India (2026)",
      hi: "भारत में घर बनाने का खर्च per sq ft (2026)",
    },
    description: {
      en: "Current house construction rate per sq ft in India for basic, standard and premium finish, what changes it, and what it does not include.",
      hi: "बेसिक, स्टैंडर्ड और प्रीमियम फ़िनिश के लिए भारत में घर बनाने का मौजूदा per sq ft रेट, इसे क्या बदलता है, और इसमें क्या शामिल नहीं है।",
    },
    body: [
      {
        en: "The rate is quoted on built-up area — the covered floor area of all floors measured to the outside of the walls. A G+1 house of 1,000 sq ft per floor is 2,000 sq ft built-up.",
        hi: "रेट बिल्ट-अप एरिया पर बताया जाता है — सभी मंज़िलों का ढका हुआ एरिया, दीवारों के बाहर तक। 1,000 sq ft प्रति मंज़िल का G+1 घर 2,000 sq ft बिल्ट-अप है।",
      },
      {
        en: "Three things move the rate most: the finish level (tiles, doors, windows, fittings, paint), the city (metros about 15% higher, small towns about 8% lower) and the shape of the house (more corners and more floors on a small plot cost more per sq ft).",
        hi: "रेट को सबसे ज़्यादा तीन चीज़ें बदलती हैं: फ़िनिश लेवल (टाइल, दरवाज़े, खिड़की, फ़िटिंग, पेंट), शहर (मेट्रो में लगभग 15% ज़्यादा, छोटे क़स्बों में लगभग 8% कम) और घर का आकार (छोटे प्लॉट पर ज़्यादा कोने और ज़्यादा मंज़िलें — per sq ft महंगा)।",
      },
      {
        en: "The rate covers structure, masonry, plaster, flooring, doors and windows, electrical, plumbing, painting and waterproofing. Land, approvals, interiors, furniture, compound wall, borewell and water tank are extra.",
        hi: "रेट में ढांचा, चिनाई, प्लास्टर, फ़र्श, दरवाज़े-खिड़की, बिजली, प्लंबिंग, पेंट और वॉटरप्रूफ़िंग शामिल है। ज़मीन, मंज़ूरी, इंटीरियर, फ़र्नीचर, बाउंड्री वॉल, बोरवेल और पानी की टंकी अलग।",
      },
    ],
    tool: {
      path: "house-construction-cost-calculator",
      label: {
        en: "Work out the cost of your house →",
        hi: "अपने घर का खर्च निकालें →",
      },
    },
  },
  {
    slug: "cement-steel-for-1000-sq-ft",
    faq: faq("How much cement and steel"),
    title: {
      en: "Cement and Steel Needed for a 1000 Sq Ft House",
      hi: "1000 sq ft घर में कितना सीमेंट और सरिया लगता है",
    },
    description: {
      en: "How many cement bags and how much steel a 1000 sq ft house needs, with sand, aggregate and bricks — thumb rule and the plan-based way.",
      hi: "1000 sq ft घर में कितनी बोरी सीमेंट और कितना सरिया लगता है, रेत, गिट्टी और ईंट के साथ — थंब रूल से और नक्शे से।",
    },
    body: [
      {
        en: "Thumb rules per sq ft of built-up area for an RCC framed house: cement 0.4 bag, steel 4 kg, sand 1.8 cft, aggregate 1.35 cft, bricks 8. For 1,000 sq ft that is about 400 bags, 4,000 kg of steel, 1,800 cft of sand, 1,350 cft of aggregate and 8,000 bricks.",
        hi: "RCC फ़्रेम घर में बिल्ट-अप के प्रति sq ft थंब रूल: सीमेंट 0.4 बोरी, सरिया 4 किलो, रेत 1.8 cft, गिट्टी 1.35 cft, ईंट 8। 1,000 sq ft के लिए लगभग 400 बोरी, 4,000 किलो सरिया, 1,800 cft रेत, 1,350 cft गिट्टी और 8,000 ईंट।",
      },
      {
        en: "The real figure depends on the plan: number of floors, column grid, slab spans, wall lengths and the soil. A plan-based BOQ measures every footing, column, beam, slab and wall and usually comes out within 10–15% of the thumb rule.",
        hi: "असली आंकड़ा नक्शे पर निर्भर है: मंज़िलें, कॉलम ग्रिड, स्लैब का स्पैन, दीवारों की लंबाई और मिट्टी। नक्शे वाला BOQ हर फ़ुटिंग, कॉलम, बीम, स्लैब और दीवार नापता है और आमतौर पर थंब रूल से 10–15% के अंदर आता है।",
      },
    ],
    tool: {
      path: "house-boq-estimate",
      label: {
        en: "Get exact quantities from your plan →",
        hi: "अपने नक्शे से सही मात्रा निकालें →",
      },
    },
  },
  {
    slug: "labour-rate-per-sq-ft",
    faq: faq("What is the labour rate"),
    title: {
      en: "Labour Rate for House Construction per Sq Ft",
      hi: "घर बनाने का लेबर रेट per sq ft",
    },
    description: {
      en: "What a labour-only contract costs per sq ft, what it covers, and how to compare contractor quotes.",
      hi: "सिर्फ़ लेबर ठेका per sq ft कितने का होता है, उसमें क्या आता है, और ठेकेदारों के कोटेशन कैसे मिलाएं।",
    },
    body: [
      {
        en: "In a labour-only contract the contractor supplies masons, helpers, bar-benders and carpenters for the structure, masonry and plaster; tiling, electrical, plumbing and painting are often separate contracts. Ask which trades are included before comparing rates.",
        hi: "सिर्फ़ लेबर ठेके में ठेकेदार ढांचे, चिनाई और प्लास्टर के लिए मिस्त्री, बेलदार, सरिया बांधने वाले और बढ़ई देता है; टाइल, बिजली, प्लंबिंग और पेंट अक्सर अलग ठेके होते हैं। रेट मिलाने से पहले पूछें कि कौन-कौन से काम शामिल हैं।",
      },
      {
        en: "Also ask who provides shuttering, scaffolding, the concrete mixer and vibrator, water and power on site — these can add ₹50–100 per sq ft if they fall on you.",
        hi: "यह भी पूछें कि शटरिंग, पाड़, कंक्रीट मिक्सर और वाइब्रेटर, साइट पर पानी और बिजली कौन देगा — ये आप पर आएं तो ₹50–100 per sq ft बढ़ सकता है।",
      },
    ],
    tool: {
      path: "contractor-quote-checker",
      label: {
        en: "Check a contractor's rate →",
        hi: "ठेकेदार का रेट जांचें →",
      },
    },
  },
  {
    slug: "house-construction-time",
    faq: faq("How long does it take"),
    title: {
      en: "How Long Does It Take to Build a House in India?",
      hi: "भारत में घर बनने में कितना समय लगता है?",
    },
    description: {
      en: "Typical time for a G, G+1 and G+2 house, stage by stage, and what causes delays.",
      hi: "G, G+1 और G+2 घर में आमतौर पर कितना समय, स्टेज-वार, और देरी किससे होती है।",
    },
    body: [
      {
        en: "Rough timeline for a G+1 house: layout, excavation and footings 3–4 weeks; plinth 2–3 weeks; each floor's columns, beams and slab about 4 weeks plus curing; brickwork 4–6 weeks; electrical, plumbing and plaster 6–8 weeks; flooring, doors, windows and painting 6–8 weeks.",
        hi: "G+1 घर की मोटी समय-सारणी: लेआउट, खुदाई और फ़ुटिंग 3–4 हफ़्ते; प्लिंथ 2–3 हफ़्ते; हर मंज़िल के कॉलम, बीम, स्लैब लगभग 4 हफ़्ते और तराई; चिनाई 4–6 हफ़्ते; बिजली, प्लंबिंग, प्लास्टर 6–8 हफ़्ते; फ़र्श, दरवाज़े-खिड़की और पेंट 6–8 हफ़्ते।",
      },
      {
        en: "Delays usually come from money arriving late, material shortages (sand in the monsoon), labour leaving for festivals or harvest, and design changes after work has started.",
        hi: "देरी आमतौर पर पैसे देर से आने, सामग्री की कमी (बरसात में रेत), त्योहार या फ़सल पर मज़दूरों के जाने, और काम शुरू होने के बाद डिज़ाइन बदलने से होती है।",
      },
    ],
    tool: {
      path: "house-boq-estimate",
      label: {
        en: "See the stage plan and cash flow for your house →",
        hi: "अपने घर का स्टेज प्लान और पैसों का हिसाब देखें →",
      },
    },
  },
  {
    slug: "slab-shuttering-removal-time",
    faq: faq("When can slab shuttering"),
    title: {
      en: "When to Remove Slab and Beam Shuttering (IS 456)",
      hi: "स्लैब और बीम की शटरिंग कितने दिन बाद खोलें (IS 456)",
    },
    description: {
      en: "Minimum days before removing formwork for slabs, beams and columns as per IS 456, and how curing and cement type change it.",
      hi: "IS 456 के अनुसार स्लैब, बीम और कॉलम की शटरिंग खोलने से पहले न्यूनतम दिन, और तराई व सीमेंट का प्रकार इसे कैसे बदलते हैं।",
    },
    body: [
      {
        en: "IS 456 gives these minimum times for ordinary Portland cement in normal weather: vertical formwork of columns, walls and beam sides 16–24 hours; slab bottom sheets 3 days with props left in; slab props 7 days (span up to 4.5 m) or 14 days (longer); beam bottom props 14 days (span up to 6 m) or 21 days (longer).",
        hi: "IS 456 सामान्य मौसम में साधारण पोर्टलैंड सीमेंट के लिए ये न्यूनतम समय देता है: कॉलम, दीवार और बीम की साइड की खड़ी शटरिंग 16–24 घंटे; स्लैब की नीचे की प्लेट 3 दिन (टेक लगी रहे); स्लैब की टेक 7 दिन (4.5 m तक स्पैन) या 14 दिन (बड़ा स्पैन); बीम की नीचे की टेक 14 दिन (6 m तक) या 21 दिन (बड़ा)।",
      },
      {
        en: "In cold weather or with PPC / slag cement, concrete gains strength more slowly, so keep the props longer. Never load a fresh slab with bricks or cement bags before the props come out.",
        hi: "ठंड में या PPC / स्लैग सीमेंट के साथ कंक्रीट धीरे मज़बूत होता है, इसलिए टेक ज़्यादा दिन रखें। टेक निकलने से पहले ताज़ा स्लैब पर ईंट या सीमेंट की बोरियां न रखें।",
      },
    ],
    tool: {
      path: "concrete-calculator",
      label: {
        en: "Work out concrete for your slab →",
        hi: "अपने स्लैब का कंक्रीट निकालें →",
      },
    },
  },
  {
    slug: "red-bricks-vs-aac-blocks",
    faq: faq("Which is better for a house"),
    title: {
      en: "Red Bricks vs AAC Blocks: Which Is Better for a House?",
      hi: "लाल ईंट या AAC ब्लॉक: घर के लिए कौन सा बेहतर?",
    },
    description: {
      en: "Cost, weight, speed, heat and strength of red bricks and AAC blocks compared for an Indian house.",
      hi: "भारतीय घर के लिए लाल ईंट और AAC ब्लॉक की तुलना — खर्च, वज़न, रफ़्तार, गर्मी और मज़बूती।",
    },
    body: [
      {
        en: "An AAC block weighs roughly a third of the same volume of brickwork, so the beams, columns and footings carry less load and the frame needs a little less steel and concrete. Big blocks also go up faster and use less mortar and plaster.",
        hi: "AAC ब्लॉक उतनी ही ईंट की चिनाई के लगभग एक-तिहाई वज़न का होता है, इसलिए बीम, कॉलम और फ़ुटिंग पर भार कम पड़ता है और ढांचे में सरिया-कंक्रीट थोड़ा कम लगता है। बड़े ब्लॉक जल्दी लगते हैं और मसाला व प्लास्टर कम लेते हैं।",
      },
      {
        en: "Red bricks are available everywhere, every mason knows them, and they hold nails and wall fixings well. AAC needs block-jointing mortar and care with heavy fixings like geysers and kitchen cabinets. In most cities the total wall cost comes out close; compare both for your own house before deciding.",
        hi: "लाल ईंट हर जगह मिलती है, हर मिस्त्री उसे जानता है, और उसमें कील और फ़िटिंग अच्छी पकड़ती है। AAC के लिए ब्लॉक-जोड़ने वाला मसाला चाहिए और गीज़र, किचन कैबिनेट जैसी भारी फ़िटिंग में सावधानी। ज़्यादातर शहरों में दीवार का कुल खर्च क़रीब-क़रीब आता है; फ़ैसले से पहले अपने घर के लिए दोनों मिलाएं।",
      },
    ],
    tool: {
      path: "house-boq-estimate",
      label: {
        en: "Compare brick and AAC for your house →",
        hi: "अपने घर के लिए ईंट और AAC मिलाएं →",
      },
    },
  },
];

export const getTopic = (slug: string) => TOPICS.find((t) => t.slug === slug);
export const getQuestion = (slug: string) =>
  QUESTIONS.find((q) => q.slug === slug);
export const GUIDE_BASE = "house-construction-guide";
