/**
 * "How to build a house" guide: what an owner (and a new site engineer) must know, stage by stage,
 * and the questions people search most — each answer points to the tool that works it out.
 */

type T = { en: string; hi: string };

export interface GuideItem {
  t: T;
  /** YouTube search words for videos on this point (Hindi / Hinglish). */
  yt?: string;
  /** A specific YouTube video instead of the search. */
  video?: string;
  /** Tool or page that does this (site path without language prefix). */
  link?: string;
}

export interface GuideSection {
  id: string;
  title: T;
  intro: T;
  items: GuideItem[];
}

export const GUIDE: GuideSection[] = [
  {
    id: "land",
    title: { en: "1. Land and papers", hi: "1. ज़मीन और कागज़" },
    intro: {
      en: "Check the land before you spend a rupee on the house. A loan, a building permit and a later sale all depend on these papers.",
      hi: "घर पर एक रुपया लगाने से पहले ज़मीन जांचें। लोन, नक्शा पास और आगे बेचना — सब इन्हीं कागज़ों पर टिका है।",
    },
    items: [
      {
        yt: "plot registry kaise check kare",
        t: {
          en: "Registered sale deed in your name, and the chain of earlier deeds (ideally 30 years).",
          hi: "आपके नाम की रजिस्टर्ड रजिस्ट्री, और पिछली रजिस्ट्रियों की चेन (हो सके तो 30 साल)।",
        },
      },
      {
        yt: "khasra khatauni namantaran kaise kare",
        t: {
          en: "Land record (7/12, khasra-khatauni, RTC — the name differs by state) and mutation (namantaran) in your name.",
          hi: "भू-अभिलेख (7/12, खसरा-खतौनी, RTC — राज्य के हिसाब से नाम) और आपके नाम पर नामांतरण।",
        },
      },
      {
        yt: "plot diversion NA approved layout",
        t: {
          en: "Non-agricultural (NA / diversion) order and an approved layout if the plot is in a colony.",
          hi: "डायवर्शन / NA आदेश, और कॉलोनी में प्लॉट हो तो स्वीकृत लेआउट।",
        },
      },
      {
        yt: "encumbrance certificate kya hai",
        t: {
          en: "Encumbrance certificate (no loan or case on the land), property tax paid, boundary stones matching the deed.",
          hi: "बोझ-मुक्त प्रमाणपत्र (ज़मीन पर कोई लोन या केस नहीं), संपत्ति कर जमा, और रजिस्ट्री के हिसाब से मुनारे / सीमा।",
        },
      },
      {
        yt: "plot kharidne se pehle kya check kare",
        t: {
          en: "Road width in front, which way the road faces, and whether water, sewer and power lines reach the plot.",
          hi: "सामने सड़क कितनी चौड़ी है, किस दिशा में है, और पानी, सीवर, बिजली की लाइन प्लॉट तक है या नहीं।",
        },
      },
    ],
  },
  {
    id: "rules",
    title: { en: "2. Rules and approvals", hi: "2. नियम और मंज़ूरी" },
    intro: {
      en: "Every city's building bye-laws decide how much of the plot you may build on and how high. Ask the local body or your architect for the exact figures.",
      hi: "हर शहर के भवन नियम तय करते हैं कि प्लॉट के कितने हिस्से पर और कितना ऊंचा बना सकते हैं। सही आंकड़े नगर निगम / पंचायत या आर्किटेक्ट से पूछें।",
    },
    items: [
      {
        yt: "setback kya hota hai ghar",
        t: {
          en: "Setbacks — the open space to leave in front, at the back and on the sides (depends on plot size and road width).",
          hi: "सेटबैक — आगे, पीछे और बगल में कितनी खुली जगह छोड़नी है (प्लॉट साइज़ और सड़क की चौड़ाई पर निर्भर)।",
        },
        link: "house-plan",
      },
      {
        yt: "FAR FSI kya hota hai",
        t: {
          en: "Ground coverage and FAR / FSI — how much floor area in total you may build; this caps the number of floors.",
          hi: "ग्राउंड कवरेज और FAR / FSI — कुल कितना फ़्लोर एरिया बना सकते हैं; इसी से मंज़िलों की गिनती तय होती है।",
        },
      },
      {
        yt: "naksha pass kaise karaye",
        t: {
          en: "Building permission (naksha pass) before you start: drawings signed by a registered architect or engineer.",
          hi: "काम शुरू करने से पहले नक्शा पास: रजिस्टर्ड आर्किटेक्ट या इंजीनियर के साइन वाली ड्रॉइंग।",
        },
      },
      {
        yt: "rainwater harvesting ghar me kaise kare",
        t: {
          en: "Temporary power and water connection for construction; rainwater harvesting where the bye-laws ask for it.",
          hi: "निर्माण के लिए अस्थायी बिजली और पानी कनेक्शन; जहां नियम कहें वहां वर्षा जल संचयन।",
        },
      },
      {
        yt: "completion certificate kaise milta hai",
        t: {
          en: "Completion / occupancy certificate at the end — needed for the permanent connections and for a resale.",
          hi: "आख़िर में कंप्लीशन / ऑक्युपेंसी सर्टिफ़िकेट — स्थायी कनेक्शन और आगे बेचने के लिए ज़रूरी।",
        },
      },
    ],
  },
  {
    id: "plan",
    title: { en: "3. Plan and design", hi: "3. नक्शा और डिज़ाइन" },
    intro: {
      en: "Settle the plan fully on paper. Every change after the slab is cast costs double.",
      hi: "नक्शा पूरी तरह काग़ज़ पर तय कर लें। स्लैब डलने के बाद हर बदलाव दोगुना महंगा पड़ता है।",
    },
    items: [
      {
        yt: "ghar ka naksha kaise banaye planning",
        t: {
          en: "How many BHK, how many floors now and later — if you will add a floor later, design the columns and footings for it today.",
          hi: "कितने BHK, अभी कितनी मंज़िल और बाद में कितनी — बाद में मंज़िल बढ़ानी है तो कॉलम और नींव आज ही उसके हिसाब से बनवाएं।",
        },
        link: "house-plan",
      },
      {
        yt: "ghar me seedhi kaha banaye toilet kitchen planning",
        t: {
          en: "Parking, staircase position, kitchen and toilets near each other (shorter pipes), light and cross-ventilation in every room.",
          hi: "पार्किंग, सीढ़ी की जगह, किचन और टॉयलेट पास-पास (पाइप छोटे), हर कमरे में रोशनी और हवा का आर-पार रास्ता।",
        },
      },
      {
        yt: "vastu ke anusar ghar ka naksha",
        t: {
          en: "Vastu preferences (if any) decided before the drawing, not after.",
          hi: "वास्तु की पसंद (अगर है) ड्रॉइंग से पहले तय करें, बाद में नहीं।",
        },
      },
      {
        yt: "soil test structural drawing ghar",
        t: {
          en: "Soil test (bearing capacity) and a structural drawing from an engineer: footing sizes, column and beam sizes, and the bar bending schedule.",
          hi: "मिट्टी की जांच (भार क्षमता) और इंजीनियर से स्ट्रक्चरल ड्रॉइंग: फ़ुटिंग, कॉलम, बीम के साइज़ और सरिया की कटिंग लिस्ट (BBS)।",
        },
        link: "steel-calculator",
      },
      {
        yt: "ghar ki wiring plumbing planning",
        t: {
          en: "Electrical and plumbing layout on the drawing — point positions decided before the walls are plastered.",
          hi: "बिजली और प्लंबिंग का लेआउट ड्रॉइंग पर — प्लास्टर से पहले पॉइंट की जगह तय।",
        },
      },
    ],
  },
  {
    id: "budget",
    title: { en: "4. Budget and estimate", hi: "4. बजट और एस्टिमेट" },
    intro: {
      en: "Start with a per-sqft figure, then make an item-wise BOQ from the plan. The BOQ is what you compare contractors against.",
      hi: "शुरुआत per sqft रेट से करें, फिर नक्शे से आइटम-वार BOQ बनाएं। ठेकेदारों के रेट इसी BOQ से मिलाए जाते हैं।",
    },
    items: [
      {
        yt: "ghar banane ka kharcha per sqft",
        t: {
          en: "Rough cost: built-up area × rate per sqft (finish level and city change the rate).",
          hi: "मोटा खर्च: बिल्ट-अप एरिया × per sqft रेट (फ़िनिश लेवल और शहर से रेट बदलता है)।",
        },
        link: "house-construction-cost-calculator",
      },
      {
        yt: "BOQ kaise banaye ghar ka",
        t: {
          en: "Detailed BOQ: every item measured — excavation, concrete, steel, brickwork, plaster, flooring, doors, windows, electrical, plumbing, paint.",
          hi: "डिटेल BOQ: हर आइटम का नाप — खुदाई, कंक्रीट, सरिया, चिनाई, प्लास्टर, फ़र्श, दरवाज़े, खिड़की, बिजली, प्लंबिंग, पेंट।",
        },
        link: "house-boq-estimate",
      },
      {
        yt: "1000 sqft me kitna cement sariya",
        t: {
          en: "Material quantities — cement bags, steel kg, sand, aggregate, bricks — so you can buy in time and check deliveries.",
          hi: "सामग्री की मात्रा — सीमेंट बोरी, सरिया किलो, रेत, गिट्टी, ईंट — ताकि समय पर ख़रीद सकें और सप्लाई जांच सकें।",
        },
        link: "house-construction-cost",
      },
      {
        yt: "ghar banane ka budget kaise banaye",
        t: {
          en: "Keep 8–10% extra for price rises and changes; land, approvals, interiors and furniture are on top.",
          hi: "दाम बढ़ने और बदलाव के लिए 8–10% अलग रखें; ज़मीन, मंज़ूरी, इंटीरियर और फ़र्नीचर अलग से।",
        },
      },
      {
        yt: "home construction loan pre emi",
        t: {
          en: "Cash flow: how much money is needed at each stage, and the loan EMI or pre-EMI during construction.",
          hi: "पैसों का प्लान: हर स्टेज पर कितना पैसा चाहिए, और निर्माण के दौरान लोन की EMI या प्री-EMI।",
        },
        link: "house-boq-estimate",
      },
    ],
  },
  {
    id: "contract",
    title: { en: "5. Contractor and contract", hi: "5. ठेकेदार और एग्रीमेंट" },
    intro: {
      en: "Most fights on site come from what was never written down.",
      hi: "साइट पर ज़्यादातर झगड़े उन बातों से होते हैं जो लिखी ही नहीं गईं।",
    },
    items: [
      {
        yt: "labour contract vs material contract",
        t: {
          en: "Choose the contract type: labour only (you buy material), or material + labour (turnkey) at a rate per sqft.",
          hi: "ठेका किस तरह का: सिर्फ़ लेबर (सामग्री आप ख़रीदें), या सामग्री + लेबर (टर्नकी) per sqft रेट पर।",
        },
      },
      {
        yt: "construction material brand kaun sa le",
        t: {
          en: "Write down the brands and grades: cement, steel (Fe500D), tiles, doors, windows, wires, pipes, sanitary and paint.",
          hi: "ब्रांड और ग्रेड लिखित में: सीमेंट, सरिया (Fe500D), टाइल्स, दरवाज़े, खिड़की, तार, पाइप, सैनिटरी और पेंट।",
        },
      },
      {
        yt: "thekedar ko payment kaise kare",
        t: {
          en: "Payments linked to stages (plinth, each slab, brickwork, plaster, finishing), never in advance of the work.",
          hi: "भुगतान स्टेज से जुड़ा (प्लिंथ, हर स्लैब, चिनाई, प्लास्टर, फ़िनिशिंग), काम से पहले कभी नहीं।",
        },
      },
      {
        yt: "contractor quotation compare kaise kare",
        t: {
          en: "Compare the contractor's rate with the market before signing, and keep a measurement book (MB) for running bills.",
          hi: "साइन करने से पहले ठेकेदार का रेट बाज़ार से मिलाएं, और चालू बिलों के लिए मेज़रमेंट बुक (MB) रखें।",
        },
        link: "contractor-quote-checker",
      },
    ],
  },
  {
    id: "stages",
    title: {
      en: "6. Construction stages and checks",
      hi: "6. निर्माण के स्टेज और जांच",
    },
    intro: {
      en: "Stand on site at these points. Each check takes minutes; fixing it later takes weeks.",
      hi: "इन मौक़ों पर साइट पर ज़रूर रहें। हर जांच में कुछ मिनट लगते हैं; बाद में सुधारने में हफ़्ते।",
    },
    items: [
      {
        yt: "house layout kaise kare diagonal check",
        t: {
          en: "Layout: check the centre lines and the diagonals of the marking against the drawing before digging.",
          hi: "लेआउट: खुदाई से पहले सेंटर लाइन और मार्किंग के विकर्ण (डायगोनल) ड्रॉइंग से मिलाएं।",
        },
        link: "excavation-calculator",
      },
      {
        yt: "footing reinforcement kaise check kare",
        t: {
          en: "Foundation: footing depth reached firm soil, PCC under the footing, steel mesh size and spacing as per drawing, 50 mm cover.",
          hi: "नींव: फ़ुटिंग की गहराई पक्की मिट्टी तक, फ़ुटिंग के नीचे PCC, सरिया की जाली का साइज़ और दूरी ड्रॉइंग के हिसाब से, 50 mm कवर।",
        },
      },
      {
        yt: "column slab casting se pehle kya check kare",
        t: {
          en: "Columns and slab before concreting: bar count and diameter, stirrup spacing, cover blocks, shuttering in level and propped.",
          hi: "कॉलम और स्लैब की ढलाई से पहले: सरिया की गिनती और मोटाई, रिंग की दूरी, कवर ब्लॉक, शटरिंग लेवल में और टेक लगी हुई।",
        },
        link: "steel-calculator",
      },
      {
        yt: "M20 concrete mix ratio cube test",
        t: {
          en: "Concrete: mix (M20 ≈ 1:1.5:3), little water, vibrator used, cubes cast for 7- and 28-day tests.",
          hi: "कंक्रीट: मसाला (M20 ≈ 1:1.5:3), पानी कम, वाइब्रेटर चला, 7 और 28 दिन के टेस्ट के लिए क्यूब भरे।",
        },
        link: "concrete-calculator",
      },
      {
        yt: "curing kitne din kare slab",
        t: {
          en: "Curing: keep concrete wet at least 7 days (10 days with PPC cement); slab props stay 7–14 days depending on span.",
          hi: "तराई: कंक्रीट को कम से कम 7 दिन गीला रखें (PPC सीमेंट में 10 दिन); स्पैन के हिसाब से स्लैब की टेक 7–14 दिन रहे।",
        },
      },
      {
        yt: "brick work kaise kare sahi tarika",
        t: {
          en: "Brickwork: bricks soaked, joints 10–12 mm and filled, walls in plumb; lintels over every opening.",
          hi: "चिनाई: ईंटें भीगी हुईं, जोड़ 10–12 mm और भरे हुए, दीवार साहुल में; हर खुलने वाली जगह पर लिंटल।",
        },
        link: "brick-calculator",
      },
      {
        yt: "plumbing pressure test before plaster",
        t: {
          en: "Before plaster: electrical conduits and plumbing lines fixed and pressure-tested; toilet and terrace waterproofing done.",
          hi: "प्लास्टर से पहले: बिजली की कंड्यूट और प्लंबिंग लाइन फ़िट और प्रेशर टेस्ट; टॉयलेट और छत की वॉटरप्रूफ़िंग पूरी।",
        },
        link: "plaster-calculator",
      },
      {
        yt: "tiles hollow check flooring",
        t: {
          en: "Finishing: floor slopes towards the drains, tile joints and hollowness, doors closing freely, paint coats as agreed.",
          hi: "फ़िनिशिंग: फ़र्श का ढलान नाली की ओर, टाइल के जोड़ और खोखलापन, दरवाज़े आराम से बंद हों, पेंट के कोट तय हिसाब से।",
        },
        link: "tile-calculator",
      },
    ],
  },
  {
    id: "engineer",
    title: {
      en: "7. For new site engineers: numbers to keep handy",
      hi: "7. नए साइट इंजीनियर के लिए: याद रखने वाले आंकड़े",
    },
    intro: {
      en: "Thumb rules for checking quantities quickly. The structural drawing and the BBS always govern.",
      hi: "मात्रा जल्दी जांचने के अंगूठे के नियम। आख़िरी फ़ैसला स्ट्रक्चरल ड्रॉइंग और BBS का।",
    },
    items: [
      {
        yt: "thumb rule cement steel per sqft",
        t: {
          en: "Per sqft of built-up area (RCC house): cement ≈ 0.4 bag, steel ≈ 4 kg, sand ≈ 1.8 cft, aggregate ≈ 1.35 cft, bricks ≈ 8.",
          hi: "बिल्ट-अप के प्रति sqft (RCC घर): सीमेंट ≈ 0.4 बोरी, सरिया ≈ 4 किलो, रेत ≈ 1.8 cft, गिट्टी ≈ 1.35 cft, ईंट ≈ 8।",
        },
        link: "house-construction-cost-calculator",
      },
      {
        yt: "concrete mix ratio calculation",
        t: {
          en: "Concrete mixes: M15 ≈ 1:2:4, M20 ≈ 1:1.5:3; dry volume = wet volume × 1.54; one cement bag = 50 kg = 0.0347 m³.",
          hi: "कंक्रीट मसाला: M15 ≈ 1:2:4, M20 ≈ 1:1.5:3; सूखा आयतन = गीला × 1.54; एक बोरी सीमेंट = 50 किलो = 0.0347 m³।",
        },
        link: "concrete-calculator",
      },
      {
        yt: "steel weight formula d2/162",
        t: {
          en: "Steel weight per metre = d²/162 kg (d in mm): 8 mm 0.395, 10 mm 0.617, 12 mm 0.889, 16 mm 1.58 kg/m.",
          hi: "सरिया का वज़न प्रति मीटर = d²/162 किलो (d mm में): 8 mm 0.395, 10 mm 0.617, 12 mm 0.889, 16 mm 1.58 किलो/मी.।",
        },
        link: "steel-calculator",
      },
      {
        yt: "clear cover in footing column beam slab",
        t: {
          en: "Clear cover: footing 50 mm, column 40 mm, beam 25 mm, slab 20 mm; lap length about 50 × bar diameter.",
          hi: "कवर: फ़ुटिंग 50 mm, कॉलम 40 mm, बीम 25 mm, स्लैब 20 mm; लैप की लंबाई लगभग 50 × सरिये की मोटाई।",
        },
      },
      {
        yt: "brick calculation per cubic meter",
        t: {
          en: "Brickwork: about 500 bricks per m³ (9-inch wall); plaster 12 mm inside (1:6), 20 mm outside (1:4).",
          hi: "चिनाई: लगभग 500 ईंट प्रति m³ (9 इंच दीवार); प्लास्टर अंदर 12 mm (1:6), बाहर 20 mm (1:4)।",
        },
        link: "brick-calculator",
      },
      {
        yt: "unit conversion civil engineering",
        t: {
          en: "Units: 1 m = 3.281 ft, 1 m² = 10.764 sqft, 1 m³ = 35.31 cft, 1 gaj (sq yard) = 9 sqft.",
          hi: "इकाई: 1 m = 3.281 ft, 1 m² = 10.764 sqft, 1 m³ = 35.31 cft, 1 गज़ = 9 sqft।",
        },
        link: "construction-unit-converter",
      },
    ],
  },
];

export interface GuideFaq {
  q: T;
  a: T;
  link?: string;
}

/** The questions people type into Google most often, answered briefly. */
export const GUIDE_FAQ: GuideFaq[] = [
  {
    q: {
      en: "What is the house construction cost per sq ft in India?",
      hi: "भारत में घर बनाने का खर्च per sqft कितना है?",
    },
    a: {
      en: "For an RCC house in a tier-2 city in 2026, about ₹1,450 per sqft (basic), ₹1,700 (standard) and ₹2,400 (premium) of built-up area, material and labour together. Metros cost about 15% more.",
      hi: "2026 में टियर-2 शहर में RCC घर का खर्च बिल्ट-अप एरिया पर लगभग ₹1,450 per sqft (बेसिक), ₹1,700 (स्टैंडर्ड) और ₹2,400 (प्रीमियम) — सामग्री और मज़दूरी मिलाकर। मेट्रो में लगभग 15% ज़्यादा।",
    },
    link: "house-construction-cost",
  },
  {
    q: {
      en: "How much cement and steel is needed for a 1000 sq ft house?",
      hi: "1000 sqft घर में कितना सीमेंट और सरिया लगेगा?",
    },
    a: {
      en: "By thumb rule about 400 bags of cement and 4,000 kg (4 tonnes) of steel for 1,000 sqft of built-up area. A plan-based BOQ gives the exact figure for your house.",
      hi: "अंगूठे के नियम से 1,000 sqft बिल्ट-अप में लगभग 400 बोरी सीमेंट और 4,000 किलो (4 टन) सरिया। आपके घर का सही आंकड़ा नक्शे वाले BOQ से निकलता है।",
    },
    link: "house-construction-cost/1000-sq-ft",
  },
  {
    q: {
      en: "Which house plan fits a 30×40 or 30×50 plot?",
      hi: "30×40 या 30×50 प्लॉट में कौन सा नक्शा बनेगा?",
    },
    a: {
      en: "After setbacks a 30×50 plot leaves about 24 × 42 ft per floor: parking, porch, hall and kitchen with dining on the ground floor, three bedrooms with toilets upstairs — a G+1 3BHK. See the drawn plan and its cost for each plot size.",
      hi: "सेटबैक के बाद 30×50 प्लॉट में हर मंज़िल पर लगभग 24 × 42 ft जगह बचती है: ग्राउंड पर पार्किंग, पोर्च, हॉल और किचन-डाइनिंग, ऊपर टॉयलेट वाले तीन बेडरूम — यानी G+1 3BHK। हर प्लॉट साइज़ का बना हुआ नक्शा और खर्च देखें।",
    },
    link: "house-plan",
  },
  {
    q: {
      en: "What is the labour rate for house construction per sq ft?",
      hi: "घर बनाने का लेबर रेट per sqft कितना है?",
    },
    a: {
      en: "Labour is roughly 25–30% of the total cost — about ₹400–550 per sqft of built-up area in most towns for a labour-only contract. Rates vary a lot by city, so compare 2–3 quotes.",
      hi: "मज़दूरी कुल खर्च का लगभग 25–30% होती है — ज़्यादातर शहरों में सिर्फ़ लेबर ठेके का लगभग ₹400–550 per sqft बिल्ट-अप। शहर के हिसाब से बहुत फ़र्क़ है, इसलिए 2–3 कोटेशन मिलाएं।",
    },
    link: "contractor-quote-checker",
  },
  {
    q: {
      en: "How long does it take to build a G+1 house?",
      hi: "G+1 घर बनने में कितना समय लगता है?",
    },
    a: {
      en: "Usually 8–12 months for a 1,500–2,500 sqft G+1 house: about 2 months to plinth, a month per slab, and 4–5 months for brickwork, plaster and finishing.",
      hi: "1,500–2,500 sqft के G+1 घर में आमतौर पर 8–12 महीने: प्लिंथ तक लगभग 2 महीने, हर स्लैब में एक महीना, और चिनाई, प्लास्टर, फ़िनिशिंग में 4–5 महीने।",
    },
    link: "house-boq-estimate",
  },
  {
    q: {
      en: "When can slab shuttering be removed?",
      hi: "स्लैब की शटरिंग कितने दिन बाद खोलें?",
    },
    a: {
      en: "As per IS 456 with ordinary cement: slab bottom sheets after 3 days with props left in, slab props after 7 days (span up to 4.5 m) or 14 days (longer spans), beam props after 14 days (up to 6 m).",
      hi: "IS 456 के अनुसार सामान्य सीमेंट में: स्लैब की नीचे की प्लेट 3 दिन बाद (टेक लगी रहे), स्लैब की टेक 7 दिन बाद (4.5 m तक स्पैन) या 14 दिन (बड़ा स्पैन), बीम की टेक 14 दिन बाद (6 m तक)।",
    },
  },
  {
    q: {
      en: "Which is better for a house: red bricks or AAC blocks?",
      hi: "घर के लिए लाल ईंट अच्छी या AAC ब्लॉक?",
    },
    a: {
      en: "AAC blocks are lighter (less steel and concrete in the frame), faster to lay and keep the house cooler; red bricks are easier to find in small towns and take fixings well. The BOQ tool shows the cost of both side by side.",
      hi: "AAC ब्लॉक हल्के हैं (ढांचे में सरिया-कंक्रीट कम), जल्दी लगते हैं और घर ठंडा रखते हैं; लाल ईंट छोटे शहरों में आसानी से मिलती है और उसमें कील-फ़िटिंग अच्छी पकड़ती है। BOQ टूल में दोनों का खर्च साथ-साथ दिखता है।",
    },
    link: "house-boq-estimate",
  },
];
