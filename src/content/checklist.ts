/**
 * The house-building checklist: 82 main points from buying the plot to after handover.
 * Every point links to YouTube videos on the same topic (a search with the words builders use),
 * so an owner can see how the work is done even without an engineer on site.
 * To show one chosen video instead, set `video` to its full YouTube URL.
 */

type T = { en: string; hi: string };

export interface CheckPoint {
  id: string;
  t: T;
  /** YouTube search words (Hindi / Hinglish, the way videos are titled). */
  yt: string;
  /** A specific YouTube video to show instead of the search. */
  video?: string;
  /** Tool or page on this site that works the point out. */
  link?: string;
}

export interface CheckStage {
  id: string;
  title: T;
  points: CheckPoint[];
}

let n = 0;
const p = (
  en: string,
  hi: string,
  yt: string,
  link?: string,
  video?: string,
): CheckPoint => ({
  id: `p${++n}`,
  t: { en, hi },
  yt,
  ...(link ? { link } : {}),
  ...(video ? { video } : {}),
});

export const CHECKLIST: CheckStage[] = [
  {
    id: "plot",
    title: {
      en: "Stage 1 · Before buying the plot",
      hi: "स्टेज 1 · प्लॉट ख़रीदने से पहले",
    },
    points: [
      p(
        "Sale deed in the seller's name and a clean chain of earlier deeds",
        "रजिस्ट्री विक्रेता के नाम, और पिछली रजिस्ट्रियों की चेन साफ़",
        "plot kharidne se pehle registry kaise check kare",
      ),
      p(
        "Name in the land record (khasra / khatauni / 7-12) and mutation possible",
        "खसरा / खतौनी / 7-12 में नाम, और नामांतरण हो सके",
        "khasra khatauni namantaran kaise check kare",
      ),
      p(
        "Diversion (NA) order and the approved colony layout",
        "डायवर्शन (NA) आदेश और कॉलोनी का स्वीकृत लेआउट",
        "plot diversion NA approved colony layout check",
      ),
      p(
        "No loan or court case on the land (encumbrance certificate)",
        "ज़मीन पर कोई लोन या केस न हो (बोझ-मुक्त प्रमाणपत्र)",
        "encumbrance certificate kya hai plot",
      ),
      p(
        "Measure the plot and boundaries on site and match the deed",
        "प्लॉट का नाप और सीमा मौके पर रजिस्ट्री से मिलाएं",
        "plot ka naap aur boundary kaise check kare",
      ),
      p(
        "Check the master plan: is the road going to be widened?",
        "मास्टर प्लान: सड़क चौड़ी तो नहीं होगी",
        "master plan road widening plot check",
      ),
      p(
        "No high-tension line overhead, no height limit near an airport or monument",
        "ऊपर HT लाइन नहीं, एयरपोर्ट या स्मारक की ऊंचाई पर रोक नहीं",
        "high tension line ke paas makan banana distance",
      ),
      p(
        "Does water stand here in the rains? Is it filled-up land (old pond or drain)?",
        "बरसात में पानी भरता है? ज़मीन भराव वाली तो नहीं (तालाब या नाला)?",
        "bharav wali zameen par makan nikalna foundation",
      ),
      p(
        "Road width, which way the plot faces, plot shape",
        "सड़क की चौड़ाई, प्लॉट की दिशा और आकार",
        "plot facing direction kaise pata kare",
      ),
      p(
        "Power, water and sewer lines reach the plot",
        "बिजली, पानी और सीवर लाइन प्लॉट तक",
        "plot kharidne se pehle kya check kare bijli pani sewer",
      ),
      p(
        "Ground water: depth and whether it is sweet or salty",
        "बोरवेल का पानी: गहराई, मीठा या खारा",
        "borewell pani ki gehrai kaise pata kare",
      ),
      p(
        "Ask how much you may build: setbacks and FAR / FSI",
        "सेटबैक और FAR / FSI से कितना बन सकता है",
        "setback aur FAR kya hota hai",
        "house-construction-guide/building-approvals",
      ),
    ],
  },
  {
    id: "design",
    title: {
      en: "Stage 2 · Plan and design",
      hi: "स्टेज 2 · नक्शा और डिज़ाइन",
    },
    points: [
      p(
        "Family needs: BHK, a bedroom downstairs for elders, a floor to rent",
        "परिवार की ज़रूरत: BHK, बुज़ुर्गों का कमरा नीचे, किराये का फ़्लोर",
        "ghar ka naksha banane se pehle kya soche",
        "naksha",
      ),
      p(
        "Adding floors later? Design footings and columns for them now",
        "आगे मंज़िल बढ़ानी है तो नींव और कॉलम अभी से उसी हिसाब से",
        "future floor ke liye foundation column design",
      ),
      p(
        "Soil test before the foundation design",
        "मिट्टी की जांच (soil test)",
        "soil test kyon zaroori hai ghar banane se pehle",
      ),
      p(
        "Structural drawing and BBS from a registered engineer, as per the earthquake zone",
        "स्ट्रक्चरल ड्रॉइंग और BBS इंजीनियर से, भूकंप ज़ोन के हिसाब से",
        "structural drawing kaise padhe ghar",
        "steel-calculator",
      ),
      p(
        "Plinth at least 1.5–2 ft above the road",
        "प्लिंथ सड़क से कम से कम 1.5–2 ft ऊंचा",
        "plinth height kitni rakhe road se",
      ),
      p(
        "Drainage slopes to the road drain or sewer; else a septic tank",
        "पानी की निकासी नाली या सीवर की तरफ़, नहीं तो सेप्टिक टैंक",
        "septic tank kaise banaye sahi size",
      ),
      p(
        "Car parking about 10 × 17 ft with an easy ramp",
        "पार्किंग लगभग 10×17 ft, रैंप का ढलान आसान",
        "car parking size ghar me ramp slope",
      ),
      p(
        "Stair placed so an upper floor can be reached on its own",
        "सीढ़ी ऐसी जगह कि ऊपर का फ़्लोर अलग से जा सके",
        "ghar me seedhi kaha banaye",
      ),
      p(
        "Light and cross ventilation in every room; deep sunshades on south and west",
        "हर कमरे में रोशनी और आर-पार हवा; दक्षिण-पश्चिम पर छज्जा बड़ा",
        "cross ventilation ghar design garmi kam",
      ),
      p(
        "Kitchen and toilets close together and stacked floor over floor",
        "किचन और टॉयलेट पास-पास और हर मंज़िल पर एक के ऊपर एक",
        "toilet kitchen plumbing planning ghar",
      ),
      p(
        "Vastu decided before the drawing, not after",
        "वास्तु मानते हैं तो नक्शे से पहले तय करें",
        "vastu ke anusar ghar ka naksha",
        "naksha",
      ),
      p(
        "Electrical load, number of points, inverter wiring, earthing and RCCB",
        "बिजली का लोड, पॉइंट, इन्वर्टर वायरिंग, अर्थिंग और RCCB",
        "ghar ki wiring planning points inverter earthing",
      ),
      p(
        "Piping for AC, solar, EV charging, CCTV and internet laid in advance",
        "AC पाइप, सोलर, EV चार्जिंग, CCTV-इंटरनेट की कंड्यूट पहले से",
        "AC copper piping concealed new house",
      ),
      p(
        "G+2 or more: leave space for a lift",
        "G+2 से ऊपर हो तो लिफ़्ट की जगह",
        "home lift space size ghar me",
      ),
      p(
        "Overhead tank height, sump and rainwater harvesting",
        "ओवरहेड टंकी की ऊंचाई, सम्प, रेनवॉटर हार्वेस्टिंग",
        "rainwater harvesting ghar me kaise kare",
      ),
      p(
        "Roof heat protection (insulation or heat-reflective tiles)",
        "छत पर गर्मी से बचाव (इंसुलेशन या हीट टाइल)",
        "chhat ki garmi kam kaise kare heat proof",
      ),
      p(
        "Get the building plan passed",
        "नक्शा पास करवाना",
        "naksha pass kaise karaye nagar nigam",
      ),
      p(
        "Fix tiles, sanitary, doors, windows and kitchen drawing before plaster",
        "टाइल, सैनिटरी, दरवाज़े, खिड़की, किचन ड्रॉइंग प्लास्टर से पहले फ़ाइनल",
        "ghar banane me finishing items pehle kyon chune",
      ),
    ],
  },
  {
    id: "money",
    title: {
      en: "Stage 3 · Budget, loan and contractor",
      hi: "स्टेज 3 · बजट, लोन और ठेकेदार",
    },
    points: [
      p(
        "Rough cost by rate per sq ft, then an item-wise BOQ from the plan",
        "per sqft रेट से मोटा खर्च, फिर नक्शे से आइटम-वार BOQ",
        "ghar banane ka kharcha kaise nikale BOQ",
        "house-boq-estimate",
      ),
      p(
        "Material quantities: cement, steel, sand, aggregate, bricks",
        "सामग्री की मात्रा: सीमेंट, सरिया, रेत, गिट्टी, ईंट",
        "1000 sqft me kitna cement sariya lagega",
        "house-construction-cost-calculator",
      ),
      p(
        "Keep 8–10% extra",
        "8–10% अतिरिक्त रखें",
        "ghar banane ka budget kaise banaye",
      ),
      p(
        "Add hidden costs: approvals, connections, fees, transport, boundary, borewell, interiors",
        "छुपे खर्च: नक्शा पास, कनेक्शन, फ़ीस, ढुलाई, बाउंड्री, बोरवेल, इंटीरियर",
        "ghar banane me hidden cost",
      ),
      p(
        "Home loan stages, pre-EMI and tax benefit",
        "होम लोन की स्टेज-वार किश्तें, प्री-EMI और टैक्स छूट",
        "home construction loan disbursement pre emi",
      ),
      p(
        "Insurance during construction",
        "निर्माण के दौरान बीमा",
        "construction all risk insurance ghar",
      ),
      p(
        "Contract type: labour only or turnkey",
        "ठेके का प्रकार: सिर्फ़ लेबर या टर्नकी",
        "labour contract vs material contract ghar",
        "house-construction-guide/contractor-agreement",
      ),
      p(
        "See the contractor's old work and talk to old clients",
        "ठेकेदार का पुराना काम और ग्राहकों से बात",
        "thekedar kaise chune ghar banane ke liye",
      ),
      p(
        "2–3 quotes, matched to the BOQ, GST written clearly",
        "2–3 कोटेशन, BOQ से मिलाएं, GST साफ़",
        "contractor quotation compare kaise kare",
        "contractor-quote-checker",
      ),
      p(
        "Agreement: drawings, brands, grades, finish rates, time, penalty for delay",
        "एग्रीमेंट: ड्रॉइंग, ब्रांड, ग्रेड, फ़िनिश रेट, समय, देरी पर पेनल्टी",
        "construction agreement me kya likhe thekedar",
      ),
      p(
        "Pay by stage, no big advance",
        "भुगतान स्टेज के हिसाब से, बड़ा एडवांस नहीं",
        "thekedar ko payment kaise kare stage wise",
      ),
      p(
        "Hold back the last 5% for leaks and cracks",
        "आख़िरी 5% लीकेज-दरार के लिए रोकें",
        "retention money construction contract",
      ),
    ],
  },
  {
    id: "build",
    title: {
      en: "Stage 4 · During construction",
      hi: "स्टेज 4 · निर्माण के दौरान",
    },
    points: [
      p(
        "Cement: brand, not older than 3 months, stored dry",
        "सीमेंट: ब्रांड, 3 महीने से पुराना नहीं, सूखी जगह",
        "cement ki quality kaise check kare site par",
      ),
      p(
        "Steel: Fe500D, ISI mark, test certificate, weigh the bundles, no flaky rust",
        "सरिया: Fe500D, ISI, टेस्ट सर्टिफ़िकेट, बंडल तौलें, ज़्यादा जंग नहीं",
        "sariya ki quality kaise check kare Fe500D",
      ),
      p(
        "Sand without silt, right-size aggregate, no salty water",
        "रेत में मिट्टी नहीं, गिट्टी सही साइज़, पानी खारा नहीं",
        "ret me mitti kaise check kare silt test",
      ),
      p(
        "Count or weigh every delivery; guard the site",
        "हर डिलीवरी गिनें / तौलें; साइट पर चोरी से बचाव",
        "construction material site par kaise check kare",
      ),
      p(
        "Dig to firm soil; check layout diagonals before digging",
        "पक्की मिट्टी तक खुदाई; खुदाई से पहले लेआउट के विकर्ण मिलाएं",
        "house layout kaise kare diagonal check",
        "excavation-calculator",
      ),
      p(
        "Anti-termite treatment before the foundation",
        "नींव से पहले दीमक का ट्रीटमेंट",
        "anti termite treatment foundation",
      ),
      p(
        "PCC, footing to drawing size, 50 mm cover, no concreting in standing water",
        "PCC, फ़ुटिंग ड्रॉइंग वाले साइज़, 50 mm कवर, पानी में ढलाई नहीं",
        "footing reinforcement cover kitna rakhe",
      ),
      p(
        "Plinth beam, backfill compacted in layers, DPC",
        "प्लिंथ बीम, भराई परत-परत दबाकर, DPC",
        "plinth beam aur DPC kyon zaroori",
      ),
      p(
        "Column bars: number and diameter as per drawing",
        "कॉलम: सरिये की गिनती और मोटाई ड्रॉइंग के अनुसार",
        "column reinforcement kaise check kare",
      ),
      p(
        "Laps in the middle half, staggered, 50 × bar diameter long",
        "लैप बीच की ऊंचाई में, staggered, 50d लंबी",
        "column me lap kaha dena chahiye",
      ),
      p(
        "Ties close, 135° hooks, ties also inside the beam-column joint",
        "रिंग पास-पास, हुक 135°, बीम-कॉलम जोड़ पर भी रिंग",
        "column ring 135 degree hook spacing",
      ),
      p(
        "Columns in plumb, no column standing on a beam",
        "कॉलम साहुल में, लटकता कॉलम नहीं",
        "floating column kya hai danger",
      ),
      p(
        "Clean the column base before casting; never cut a column later",
        "ढलाई से पहले कॉलम के नीचे सफ़ाई; बाद में कॉलम न काटें",
        "column casting se pehle kya check kare",
      ),
      p(
        "Beam bars anchored into the column, extra top bars at supports",
        "बीम का सरिया कॉलम में पूरा, सपोर्ट पर ऊपर अतिरिक्त सरिया",
        "beam reinforcement detailing extra top bar",
      ),
      p(
        "Stirrups closer near columns; full beam depth",
        "कॉलम के पास स्टिरप पास-पास; बीम की गहराई पूरी",
        "beam stirrup spacing near column",
      ),
      p(
        "Slab top steel on chairs so it is not trodden down",
        "स्लैब का ऊपर वाला सरिया चेयर पर",
        "slab top bar chair kyon lagate hai",
      ),
      p(
        "Main bars of sunshades and balconies at the top",
        "छज्जे और बालकनी का मेन सरिया ऊपर",
        "cantilever slab reinforcement chajja sariya upar",
      ),
      p(
        "Full slab thickness, cover blocks underneath",
        "स्लैब की मोटाई पूरी, नीचे कवर ब्लॉक",
        "slab casting se pehle checklist",
      ),
      p(
        "Stair bars crossed at the inner corner, main bars at the bottom",
        "सीढ़ी के कोने पर सरिया पार करके, मेन सरिया नीचे",
        "staircase reinforcement detailing dog legged",
      ),
      p(
        "No welding or heating of bars to bend them",
        "सरिये को वेल्ड या गर्म करके न मोड़ें",
        "sariya welding karna sahi hai ya galat",
      ),
      p(
        "Right mix (M20 ≈ 1:1.5:3), machine mixed, little water",
        "सही मसाला (M20 ≈ 1:1.5:3), मिक्सर से, पानी कम",
        "M20 concrete mix ratio site par",
      ),
      p(
        "Place within 30–45 minutes, no dropping from height, vibrator always",
        "30–45 मिनट में डालें, ऊंचाई से न फेंकें, वाइब्रेटर ज़रूर",
        "concrete vibrator kyon zaroori honeycombing",
      ),
      p(
        "Cast in one go; if stopped, the joint in the right place",
        "ढलाई एक बार में; रुकें तो जोड़ सही जगह",
        "construction joint slab kaha rakhe",
      ),
      p(
        "Cube samples from every pour, tested at 7 and 28 days",
        "हर ढलाई के क्यूब, 7 और 28 दिन पर टेस्ट",
        "concrete cube test kaise kare",
      ),
      p(
        "Cure 7–10 days; props 7–14 days; no load on a fresh slab",
        "तराई 7–10 दिन; टेक 7–14 दिन; ताज़ी छत पर भार नहीं",
        "slab curing kitne din kare shuttering kab khole",
        "house-construction-guide/slab-shuttering-removal-time",
      ),
      p(
        "No heavy wall on a slab without a beam",
        "स्लैब पर बिना बीम के भारी दीवार नहीं",
        "slab par diwar banana sahi ya galat",
      ),
      p(
        "Lintels and earthquake band; mesh at brick-column joints",
        "लिंटल और भूकंप बैंड; ईंट-कॉलम जोड़ पर जाली",
        "lintel band earthquake brick wall chicken mesh",
        "brick-calculator",
      ),
      p(
        "Test wiring and plumbing before plaster; inspection chambers on drains",
        "प्लास्टर से पहले बिजली-प्लंबिंग टेस्ट; ड्रेनेज में चैंबर",
        "plumbing pressure test before plaster",
      ),
      p(
        "Waterproof roof, toilets, balconies and tank before tiling",
        "टाइल से पहले छत, टॉयलेट, बालकनी, टंकी की वॉटरप्रूफ़िंग",
        "bathroom waterproofing kaise kare",
      ),
      p(
        "Check before every pour (or get an engineer) and photograph the steel",
        "हर ढलाई से पहले जांच और सरिये की फ़ोटो",
        "dhalai se pehle kya check kare checklist",
      ),
      p(
        "Foundation and plinth done before the monsoon",
        "बरसात से पहले नींव और प्लिंथ पूरा",
        "barish me construction kaise kare foundation",
      ),
      p(
        "Labour safety; talk to neighbours first",
        "मज़दूरों की सुरक्षा; पड़ोसियों से पहले बात",
        "construction site safety ghar",
      ),
    ],
  },
  {
    id: "handover",
    title: {
      en: "Stage 5 · Handover and after",
      hi: "स्टेज 5 · हैंडओवर और बाद में",
    },
    points: [
      p(
        "Floor slopes, hollow tiles, doors and windows closing well",
        "फ़र्श का ढलान, टाइल का खोखलापन, दरवाज़े-खिड़की",
        "new house handover checklist tiles hollow",
      ),
      p(
        "Leak test with water (roof, toilets, tank)",
        "पानी भरकर लीकेज टेस्ट (छत, टॉयलेट, टंकी)",
        "terrace waterproofing ponding test",
      ),
      p(
        "Every electrical point, earthing and MCBs",
        "बिजली के हर पॉइंट, अर्थिंग और MCB की जांच",
        "earthing kaise check kare ghar",
      ),
      p(
        "Railings, 3.5 ft parapet, equal stair steps",
        "रेलिंग, पैरापेट 3.5 ft, सीढ़ी के स्टेप बराबर",
        "staircase riser tread size standard",
      ),
      p(
        "Completion certificate, permanent connections, property tax",
        "कंप्लीशन सर्टिफ़िकेट, स्थायी कनेक्शन, प्रॉपर्टी टैक्स",
        "completion certificate kaise milta hai",
      ),
      p(
        "Keep a file: drawings, BOQ, bills, warranties, test reports, photos",
        "फ़ाइल रखें: ड्रॉइंग, BOQ, बिल, वारंटी, टेस्ट रिपोर्ट, फ़ोटो",
        "ghar ke documents kaun se rakhe",
      ),
      p(
        "Wide or diagonal cracks: show an engineer",
        "चौड़ी या तिरछी दरार हो तो इंजीनियर को दिखाएं",
        "deewar me crack kyon aate hai kab khatarnak",
      ),
      p(
        "Before adding floors or heavy tanks / towers on the roof, get it checked",
        "मंज़िल बढ़ाने या छत पर भारी टंकी / टॉवर से पहले इंजीनियर से जांच",
        "purane ghar par nayi manzil banana safe hai",
      ),
    ],
  },
];

export const CHECKLIST_COUNT = CHECKLIST.reduce(
  (t, s) => t + s.points.length,
  0,
);
export const ytUrl = (pt: { yt?: string; video?: string }) =>
  pt.video ??
  `https://www.youtube.com/results?search_query=${encodeURIComponent(pt.yt ?? "")}`;
