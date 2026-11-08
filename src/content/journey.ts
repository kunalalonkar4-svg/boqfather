/**
 * "House building, zero to move-in": 14 stages in order. Stages 1-5 link to the existing guide topic pages;
 * stages 6-14 have their own page here, each with what the owner must know, what to check, the common mistakes,
 * a diagram where the work is hidden once it is done, FAQs and videos.
 * Numbers marked "typical" are common site practice; the structural drawing and the local bye-laws always decide.
 */

export type T = { en: string; hi: string; bn?: string; mr?: string; te?: string; ta?: string; gu?: string };
export interface Faq {
  q: T;
  a: T;
}

export type DiagramKind = "layout" | "foundation" | "column" | "slab" | "roof";

export interface Stage {
  n: number;
  slug: string;
  short: T;
  title: T;
  metaTitle: T;
  description: T;
  lead: T;
  time: T;
  know: T[];
  check: T[];
  mistakes: T[];
  faqs: Faq[];
  diagram?: DiagramKind;
  /** BOQ section codes of the sample house that belong to this stage (A = earthwork and foundation …). */
  boq?: string[];
  /** YouTube search words (Hindi / Hinglish). */
  yt: string;
  /** A chosen video: full YouTube URL. */
  video?: string;
  tools: { path: string; label: T }[];
  /** The "do not go on until" moment owners should be present for. */
  hold?: T;
}

/** Stages 1-5 already have a guide page; the roadmap links to it. */
export interface Earlier {
  n: number;
  slug: string;
  short: T;
  line: T;
}

export const EARLIER: Earlier[] = [
  {
    n: 1,
    slug: "construction-budget",
    short: { en: "Budget and loan", hi: "बजट और लोन" },
    line: {
      en: "How much the house will really cost, how to keep a reserve and how a home loan is paid out.",
      hi: "घर का असली खर्च कितना होगा, रिज़र्व कैसे रखें और होम लोन की किस्तें कैसे मिलती हैं।",
    },
  },
  {
    n: 2,
    slug: "land-documents",
    short: { en: "Plot papers", hi: "प्लॉट के कागज़" },
    line: {
      en: "Sale deed, land record, mutation, NA order and encumbrance certificate: what each proves.",
      hi: "रजिस्ट्री, भू-अभिलेख, नामांतरण, NA आदेश और बोझ-मुक्त प्रमाणपत्र: हर कागज़ क्या साबित करता है।",
    },
  },
  {
    n: 3,
    slug: "building-approvals",
    short: { en: "Map approval", hi: "नक्शा पास" },
    line: {
      en: "The building permit, setbacks and the connections you need before and after construction.",
      hi: "नक्शा पास, सेटबैक और निर्माण से पहले और बाद में ज़रूरी कनेक्शन।",
    },
  },
  {
    n: 4,
    slug: "house-planning",
    short: { en: "Design and plan", hi: "डिज़ाइन और नक्शा" },
    line: {
      en: "Plan, Vastu, elevation and the drawings the engineer needs before any digging.",
      hi: "नक्शा, वास्तु, एलिवेशन और खुदाई से पहले इंजीनियर को चाहिए वाली ड्रॉइंग।",
    },
  },
  {
    n: 5,
    slug: "contractor-agreement",
    short: { en: "Contractor and agreement", hi: "ठेकेदार और एग्रीमेंट" },
    line: {
      en: "Labour-only or turnkey, stage-wise payment and what to put in writing.",
      hi: "सिर्फ़ मज़दूरी या टर्नकी, स्टेज-वार पेमेंट और लिखित में क्या रखें।",
    },
  },
];

export const STAGES: Stage[] = [
  {
    n: 6,
    slug: "house-construction-site-preparation",
    short: { en: "Site preparation", hi: "साइट की तैयारी" },
    title: {
      en: "Site preparation and marking before construction starts",
      hi: "निर्माण शुरू करने से पहले साइट की तैयारी और मार्किंग",
    },
    metaTitle: {
      en: "Site Preparation and Layout Marking for a House: Checklist",
      hi: "घर बनाने से पहले साइट की तैयारी और मार्किंग: चेकलिस्ट",
    },
    description: {
      en: "What to do before the first dig: clear and level the plot, mark the layout from the approved plan, fix a benchmark, arrange water, power and storage. A checklist for owners.",
      hi: "पहली खुदाई से पहले क्या करें: प्लॉट साफ़ और समतल करें, मंज़ूर नक्शे से मार्किंग करें, बेंचमार्क तय करें, पानी, बिजली और स्टोरेज का इंतज़ाम करें। मालिकों के लिए चेकलिस्ट।",
    },
    lead: {
      en: "Most costly mistakes are made in the first week: a wall a foot over the setback, a plinth lower than the road. Both are decided here, on the ground, before any concrete is poured.",
      hi: "सबसे महंगी ग़लतियां पहले हफ़्ते में होती हैं: सेटबैक से एक फ़ुट बाहर दीवार, सड़क से नीची प्लिंथ। दोनों यहीं, ज़मीन पर, कंक्रीट डालने से पहले तय होती हैं।",
    },
    time: { en: "About 1 to 2 weeks", hi: "लगभग 1 से 2 हफ़्ते" },
    diagram: "layout",
    know: [
      {
        en: "Clear the plot of bushes, roots and rubbish, level it roughly, and put up a gate and fence. Security and a clean site save material from theft and waste.",
        hi: "प्लॉट की झाड़ियां, जड़ें और कचरा हटाएं, मोटा-मोटा समतल करें, और गेट और बाड़ लगाएं। सुरक्षा और साफ़ साइट से सामान चोरी और बर्बादी से बचता है।",
      },
      {
        en: "Marking (setting out) must follow the approved map: plot boundary, front, rear and side setbacks, then the column centre lines. Use a tape and the 3-4-5 triangle for right angles, and mark with pegs and lime or string.",
        hi: "मार्किंग मंज़ूर नक्शे के हिसाब से ही हो: प्लॉट की सीमा, आगे, पीछे और साइड के सेटबैक, फिर कॉलम की सेंटर लाइन। टेप और 3-4-5 त्रिकोण से सही कोण निकालें, और खूंटी और चूने या डोरी से निशान लगाएं।",
      },
      {
        en: "Fix a permanent benchmark (a reference level) on a fixed object, such as a boundary wall or a pillar, and write down its level against the road. Plinth height is measured from it. A plinth that ends up below the road level lets rain water into the house.",
        hi: "किसी पक्की चीज़, जैसे बाउंड्री या पिलर, पर स्थायी बेंचमार्क (रेफ़रेंस लेवल) तय करें और सड़क से उसका लेवल लिखें। प्लिंथ की ऊंचाई उसी से नापी जाती है। सड़क से नीची प्लिंथ में बारिश का पानी घर में आता है।",
      },
      {
        en: "Arrange a temporary water and electricity supply, and decide in the agreement who pays. Make a dry shed for cement and keep steel on blocks under cover. Sand and aggregate need separate, clean heaps.",
        hi: "पानी और बिजली का अस्थायी इंतज़ाम करें, और एग्रीमेंट में लिखें कि बिल कौन भरेगा। सीमेंट के लिए सूखा शेड बनाएं और सरिया ब्लॉक पर ढककर रखें। रेत और गिट्टी के अलग, साफ़ ढेर हों।",
      },
    ],
    check: [
      { en: "Marking matches the approved map, with setbacks measured and written down", hi: "मार्किंग मंज़ूर नक्शे से मेल खाती है, सेटबैक नापकर लिखे गए हैं" },
      { en: "Diagonals of the plot and of the house rectangle are equal (square corners)", hi: "प्लॉट और घर के आयत के दोनों विकर्ण बराबर हैं (कोने समकोण)" },
      { en: "Benchmark fixed and its level against the road is recorded", hi: "बेंचमार्क तय है और सड़क से उसका लेवल दर्ज है" },
      { en: "You signed or photographed the marking before digging started", hi: "खुदाई शुरू होने से पहले आपने मार्किंग देखी और उसकी फ़ोटो ली" },
      { en: "Cement shed is dry, raised off the ground, and bags are stacked and used in order", hi: "सीमेंट का शेड सूखा है, ज़मीन से ऊपर है, और बोरियां क्रम से रखी और इस्तेमाल हो रही हैं" },
      { en: "Water and power arrangement and who pays are in writing", hi: "पानी, बिजली का इंतज़ाम और बिल कौन भरेगा, लिखित में है" },
    ],
    mistakes: [
      { en: "Marking by the mason's eye, without a tape or a diagonal check", hi: "टेप और विकर्ण जांच के बिना राजमिस्त्री की नज़र से मार्किंग" },
      { en: "No benchmark, so the plinth level is argued about later", hi: "बेंचमार्क नहीं, तो प्लिंथ लेवल पर बाद में बहस होती है" },
      { en: "Building up to the neighbour's line instead of the approved setback", hi: "मंज़ूर सेटबैक की जगह पड़ोसी की लाइन तक निर्माण" },
      { en: "Storing cement bags on bare ground or in the open", hi: "सीमेंट की बोरियां खुली ज़मीन पर या बाहर रखना" },
    ],
    faqs: [
      {
        q: { en: "How high should the plinth be above the road?", hi: "प्लिंथ सड़क से कितनी ऊंची होनी चाहिए?" },
        a: {
          en: "Many local bye-laws ask for a plinth at least about 450 mm (1.5 ft) above the road or ground level, and more where water collects. The rule differs by city, so check your approved map and ask your engineer.",
          hi: "कई स्थानीय बाय-लॉ में प्लिंथ सड़क या ज़मीन के लेवल से कम से कम लगभग 450 mm (1.5 फ़ुट) ऊपर मांगी जाती है, और जहां पानी जमता है वहां और ऊपर। नियम शहर के हिसाब से बदलता है, इसलिए अपना मंज़ूर नक्शा देखें और इंजीनियर से पूछें।",
        },
      },
      {
        q: { en: "Is bhumi pujan needed before construction?", hi: "क्या निर्माण से पहले भूमि पूजन ज़रूरी है?" },
        a: {
          en: "It is a family and community custom, not a technical or legal step. Do it if it matters to you, but do not let it replace the marking check and the benchmark.",
          hi: "यह परिवार और समाज की परंपरा है, तकनीकी या क़ानूनी चरण नहीं। आपके लिए मायने रखता हो तो करें, पर मार्किंग की जांच और बेंचमार्क की जगह इसे न दें।",
        },
      },
    ],
    hold: { en: "Do not let digging start until you have seen and photographed the marking.", hi: "जब तक आप मार्किंग देख और उसकी फ़ोटो न ले लें, खुदाई शुरू न होने दें।" },
    yt: "plot marking setting out ghar construction kaise kare",
    tools: [
      { path: "house-boq-estimate", label: { en: "Make the item-wise BOQ", hi: "आइटम-वार BOQ बनाएं" } },
      { path: "house-construction-guide/checklist", label: { en: "Full site checklist", hi: "पूरी साइट चेकलिस्ट" } },
    ],
  },
  {
    n: 7,
    slug: "house-foundation-construction-steps",
    short: { en: "Foundation", hi: "नींव" },
    title: {
      en: "House foundation: steps, depth and what to check before concrete",
      hi: "घर की नींव: चरण, गहराई और कंक्रीट डालने से पहले क्या जांचें",
    },
    metaTitle: {
      en: "House Foundation Construction Steps and Checklist (G+1, India)",
      hi: "घर की नींव बनाने के चरण और चेकलिस्ट (G+1, भारत)",
    },
    description: {
      en: "Excavation, PCC, footing steel, concrete, plinth beam and anti-termite treatment explained for house owners, with a section drawing and the checks to make before every pour.",
      hi: "खुदाई, PCC, फ़ुटिंग का सरिया, कंक्रीट, प्लिंथ बीम और दीमक-रोधी इलाज, घर मालिकों के लिए, सेक्शन ड्रॉइंग और हर ढलाई से पहले की जांच के साथ।",
    },
    lead: {
      en: "The foundation is the one part you can never inspect again once it is covered. Everything above it depends on what happened in these few weeks, so this is the stage to be on site.",
      hi: "नींव वह हिस्सा है जिसे ढकने के बाद दोबारा कभी नहीं जांच सकते। उसके ऊपर सब कुछ इन्हीं कुछ हफ़्तों पर टिका है, इसलिए इस चरण में साइट पर रहें।",
    },
    time: { en: "About 3 to 5 weeks", hi: "लगभग 3 से 5 हफ़्ते" },
    diagram: "foundation",
    boq: ["A"],
    know: [
      {
        en: "The type and depth of the foundation come from the soil test and the structural drawing, never from the mason's habit. Isolated footings under each column are common for G+1 and G+2 houses on good soil. Weak or filled soil may need a raft or piles.",
        hi: "नींव का प्रकार और गहराई मिट्टी की जांच और स्ट्रक्चरल ड्रॉइंग से आती है, राजमिस्त्री की आदत से नहीं। अच्छी मिट्टी पर G+1 और G+2 घरों में हर कॉलम के नीचे अलग फ़ुटिंग आम है। कमज़ोर या भरी हुई मिट्टी में राफ़्ट या पाइल लग सकते हैं।",
      },
      {
        en: "Dig to the drawn size and depth. The bottom must be firm, level and free of loose soil and standing water. In this site's sample estimate the column footings are dug 1.5 m deep in ordinary soil. Your own depth must follow your soil test.",
        hi: "ड्रॉइंग के नाप और गहराई तक खोदें। तल मज़बूत, समतल हो और ढीली मिट्टी और जमा पानी से मुक्त। इस साइट के सैंपल एस्टिमेट में आम मिट्टी में कॉलम फ़ुटिंग 1.5 m गहरी खोदी गई है। आपकी गहराई आपकी मिट्टी की जांच से तय होगी।",
      },
      {
        en: "A 100 mm layer of plain cement concrete (PCC, usually 1:4:8) goes first as a clean, level base. The footing steel then sits on cover blocks so that it has about 50 mm of concrete below it.",
        hi: "सबसे पहले 100 mm की प्लेन सीमेंट कंक्रीट (PCC, आमतौर पर 1:4:8) की परत डलती है, साफ़ और समतल आधार के लिए। फ़ुटिंग का सरिया कवर ब्लॉक पर रखा जाता है ताकि उसके नीचे लगभग 50 mm कंक्रीट रहे।",
      },
      {
        en: "The column starter bars must be in the exact position and height shown on the drawing, with the lap length left for the column above. Then come the plinth beam, anti-termite treatment, backfilling in layers and the plinth filling.",
        hi: "कॉलम के स्टार्टर बार ड्रॉइंग में दिखाई जगह और ऊंचाई पर बिल्कुल सही हों, ऊपर के कॉलम के लिए लैप लंबाई छोड़कर। फिर प्लिंथ बीम, दीमक-रोधी इलाज, परतों में बैकफ़िलिंग और प्लिंथ भराई आती है।",
      },
      {
        en: "Concrete must be tested. For each day of casting, make a set of 3 cubes, cure them and test them at 28 days. Keep the results with your papers.",
        hi: "कंक्रीट की जांच ज़रूरी है। ढलाई के हर दिन 3 क्यूब का एक सेट बनाएं, उन्हें क्योर करें और 28 दिन पर टेस्ट करवाएं। नतीजे अपने कागज़ों में रखें।",
      },
    ],
    check: [
      { en: "Soil test report is with the engineer and the foundation drawing follows it", hi: "मिट्टी की जांच रिपोर्ट इंजीनियर के पास है और नींव की ड्रॉइंग उसी के हिसाब से है" },
      { en: "Excavation size and depth match the drawing; bottom is firm, level and dry", hi: "खुदाई का नाप और गहराई ड्रॉइंग से मिलते हैं; तल मज़बूत, समतल और सूखा है" },
      { en: "PCC bed is laid, 100 mm thick, before any steel goes in", hi: "सरिया रखने से पहले 100 mm मोटा PCC बिछा है" },
      { en: "Footing steel: bar diameter, count, spacing and 50 mm cover blocks match the drawing", hi: "फ़ुटिंग का सरिया: व्यास, गिनती, स्पेसिंग और 50 mm कवर ब्लॉक ड्रॉइंग से मिलते हैं" },
      { en: "Steel is free from loose rust, oil and mud", hi: "सरिया ढीली जंग, तेल और कीचड़ से मुक्त है" },
      { en: "Column starters are in the right place, height and lap length", hi: "कॉलम स्टार्टर सही जगह, ऊंचाई और लैप लंबाई पर हैं" },
      { en: "Concrete is mixed by measure, not by guess; water is not added on the pour", hi: "कंक्रीट नाप से बनी है, अंदाज़े से नहीं; ढलाई के समय पानी नहीं मिलाया जा रहा" },
      { en: "Cube samples taken and marked with date and location", hi: "क्यूब सैंपल लिए गए और तारीख़ और जगह लिखी गई" },
      { en: "Anti-termite treatment done before backfilling and plinth filling", hi: "बैकफ़िलिंग और प्लिंथ भराई से पहले दीमक-रोधी इलाज हो चुका है" },
      { en: "Curing for at least 7 days with ordinary cement, 10 days or more with PPC or in hot weather", hi: "आम सीमेंट में कम से कम 7 दिन, PPC या गर्मी में 10 दिन या ज़्यादा क्योरिंग" },
    ],
    mistakes: [
      { en: "Digging less deep than drawn to save time and labour", hi: "समय और मज़दूरी बचाने के लिए ड्रॉइंग से कम गहरी खुदाई" },
      { en: "Skipping the PCC bed, so the steel rests on soil", hi: "PCC न डालना, जिससे सरिया मिट्टी पर टिका रहता है" },
      { en: "No cover blocks, so the steel touches the soil and rusts", hi: "कवर ब्लॉक नहीं, इसलिए सरिया मिट्टी से छूकर जंग खाता है" },
      { en: "Pouring concrete into standing water or loose soil", hi: "जमा पानी या ढीली मिट्टी में कंक्रीट डालना" },
      { en: "No curing, or curing only for a day or two", hi: "क्योरिंग न करना, या सिर्फ़ एक-दो दिन करना" },
      { en: "Column starters cast off-centre and bent into place later", hi: "कॉलम स्टार्टर ग़लत जगह डालकर बाद में मोड़कर बिठाना" },
    ],
    faqs: [
      {
        q: { en: "How deep should the foundation of a G+1 house be?", hi: "G+1 घर की नींव कितनी गहरी होनी चाहिए?" },
        a: {
          en: "It depends on the soil, so there is no single number. For ordinary soil under two-storey houses, isolated footings are often founded somewhere around 1.2 to 2 m below ground, but your soil test and structural drawing must decide it. Never go shallower than the drawing.",
          hi: "यह मिट्टी पर निर्भर है, इसलिए कोई एक संख्या नहीं है। आम मिट्टी में दो मंज़िला घरों की अलग फ़ुटिंग अक्सर ज़मीन से लगभग 1.2 से 2 m नीचे रखी जाती है, पर फ़ैसला आपकी मिट्टी की जांच और स्ट्रक्चरल ड्रॉइंग से होना चाहिए। ड्रॉइंग से कम गहरा कभी न जाएं।",
        },
      },
      {
        q: { en: "Is a soil test really needed for a small house?", hi: "क्या छोटे घर के लिए भी मिट्टी की जांच ज़रूरी है?" },
        a: {
          en: "Yes. The test costs very little compared with the foundation, and it tells the engineer how much load the soil can carry. A wrong guess here shows up later as cracks that are very costly to fix.",
          hi: "हां। जांच का ख़र्च नींव के मुक़ाबले बहुत कम है, और इससे इंजीनियर को पता चलता है कि मिट्टी कितना भार संभाल सकती है। यहां ग़लत अंदाज़ा बाद में दरारों के रूप में आता है जिन्हें ठीक करना बहुत महंगा है।",
        },
      },
    ],
    hold: { en: "Be on site, or have your engineer there, to see the footing steel before the concrete is poured.", hi: "कंक्रीट डलने से पहले फ़ुटिंग का सरिया देखने के लिए साइट पर रहें, या इंजीनियर को भेजें।" },
    yt: "house foundation kaise banate hain footing steel pcc",
    tools: [
      { path: "house-boq-estimate", label: { en: "See the foundation items in the BOQ", hi: "BOQ में नींव के आइटम देखें" } },
      { path: "house-construction-guide/cement-steel-for-1000-sq-ft", label: { en: "Cement and steel needed", hi: "सीमेंट और सरिया कितना लगेगा" } },
    ],
  },
  {
    n: 8,
    slug: "rcc-column-beam-slab-construction-steps",
    short: { en: "Columns, beams and slab", hi: "कॉलम, बीम और स्लैब" },
    title: {
      en: "RCC columns, beams and slab: steel, cover, pouring and curing",
      hi: "RCC कॉलम, बीम और स्लैब: सरिया, कवर, ढलाई और क्योरिंग",
    },
    metaTitle: {
      en: "RCC Column, Beam and Slab Construction Steps and Checklist",
      hi: "RCC कॉलम, बीम और स्लैब बनाने के चरण और चेकलिस्ट",
    },
    description: {
      en: "How a concrete frame is built and what an owner should check before each pour: steel, cover, stirrups, laps, shuttering, concrete, cubes and curing. With drawings.",
      hi: "कंक्रीट का ढांचा कैसे बनता है और हर ढलाई से पहले मालिक को क्या जांचना चाहिए: सरिया, कवर, स्टिरप, लैप, शटरिंग, कंक्रीट, क्यूब और क्योरिंग। ड्रॉइंग के साथ।",
    },
    lead: {
      en: "The frame carries the whole house. Steel, concrete and shuttering decide how long it stands, and each pour is a one-time event: once the concrete is in, you cannot see the steel again.",
      hi: "ढांचा पूरे घर का भार उठाता है। सरिया, कंक्रीट और शटरिंग तय करते हैं कि वह कितने साल टिकेगा, और हर ढलाई एक ही बार होती है: कंक्रीट पड़ गई तो सरिया दोबारा नहीं दिखेगा।",
    },
    time: { en: "About 4 to 6 weeks per floor", hi: "हर मंज़िल के लिए लगभग 4 से 6 हफ़्ते" },
    diagram: "column",
    boq: ["B", "H"],
    know: [
      {
        en: "Sizes and steel come only from the structural drawing. For reference, the sample G+1 house in this site's BOQ uses 300 × 300 mm columns, 230 × 400 mm beams, a 125 mm slab, M20 concrete and Fe500D steel. Yours may differ.",
        hi: "नाप और सरिया सिर्फ़ स्ट्रक्चरल ड्रॉइंग से आते हैं। संदर्भ के लिए, इस साइट के BOQ का सैंपल G+1 घर 300 × 300 mm कॉलम, 230 × 400 mm बीम, 125 mm स्लैब, M20 कंक्रीट और Fe500D सरिया लेता है। आपका अलग हो सकता है।",
      },
      {
        en: "The order is: column steel, column shuttering, column pour, then beam and slab shuttering, beam and slab steel, electrical conduits and sleeves, inspection, and finally the beams and slab poured together in one go.",
        hi: "क्रम यह है: कॉलम का सरिया, कॉलम की शटरिंग, कॉलम की ढलाई, फिर बीम और स्लैब की शटरिंग, बीम और स्लैब का सरिया, बिजली के कंड्यूट और स्लीव, जांच, और आख़िर में बीम और स्लैब की एक साथ एक बार में ढलाई।",
      },
      {
        en: "Use Fe500D TMT bars of a reputed make with the ISI mark. Bars must be straight, with only a light film of rust and no oil or mud. Lap lengths, stirrup spacing and bends must be exactly as drawn. Stirrups are closer together near beam-column joints.",
        hi: "प्रतिष्ठित कंपनी का ISI मार्क वाला Fe500D TMT सरिया लें। सरिया सीधा हो, हल्की जंग ही हो, तेल और कीचड़ न हो। लैप लंबाई, स्टिरप की दूरी और मोड़ ड्रॉइंग के हिसाब से ही हों। बीम-कॉलम जोड़ के पास स्टिरप पास-पास होते हैं।",
      },
      {
        en: "Cover is the concrete between the steel and the surface. It protects the steel from rust and fire. As drawn, it is typically about 40 mm for columns, 25 to 30 mm for beams, 20 to 25 mm for slabs and 50 mm for footings. Use cover blocks, not stones or broken bricks.",
        hi: "कवर सरिया और सतह के बीच की कंक्रीट है। वह सरिया को जंग और आग से बचाता है। ड्रॉइंग के हिसाब से आमतौर पर कॉलम में लगभग 40 mm, बीम में 25 से 30 mm, स्लैब में 20 से 25 mm और फ़ुटिंग में 50 mm होता है। कवर ब्लॉक लगाएं, पत्थर या टूटी ईंट नहीं।",
      },
      {
        en: "Concrete must be M20 or better as drawn, mixed by weight batching or bought as ready-mix. Do not add water on site to make it flow. Compact it with a vibrator so that no honeycombs are left. Pour the slab continuously without a cold joint.",
        hi: "कंक्रीट ड्रॉइंग के अनुसार M20 या बेहतर हो, वज़न से बैचिंग करके बनी या रेडी-मिक्स। बहाव बढ़ाने के लिए साइट पर पानी न मिलाएं। वाइब्रेटर से दबाएं ताकि छत्ते (honeycomb) न रहें। स्लैब को बिना कोल्ड जॉइंट के लगातार डालें।",
      },
      {
        en: "Do not remove shuttering early and keep the props where the engineer says. Cure the slab by ponding water for at least 7 days (10 days or more with PPC or in hot weather).",
        hi: "शटरिंग जल्दी न हटाएं और प्रॉप वहीं रखें जहां इंजीनियर कहे। स्लैब को पानी भरकर कम से कम 7 दिन क्योर करें (PPC या गर्मी में 10 दिन या ज़्यादा)।",
      },
    ],
    check: [
      { en: "Bar diameter, number of bars, spacing and bends match the drawing (count them)", hi: "सरिया का व्यास, छड़ों की संख्या, स्पेसिंग और मोड़ ड्रॉइंग से मिलते हैं (गिनकर देखें)" },
      { en: "Lap lengths and stirrup spacing are as drawn, closer near joints", hi: "लैप लंबाई और स्टिरप की दूरी ड्रॉइंग के अनुसार है, जोड़ के पास पास-पास" },
      { en: "Cover blocks are in place under and beside the steel", hi: "सरिया के नीचे और बगल में कवर ब्लॉक लगे हैं" },
      { en: "Shuttering is tight, level, plumb and well propped; no gaps for the cement to leak", hi: "शटरिंग कसी, समतल, सीधी और ठीक से प्रॉप की हुई है; सीमेंट बहने की दरारें नहीं" },
      { en: "Conduits, sleeves for pipes and cut-outs are fixed before the pour", hi: "कंड्यूट, पाइप के स्लीव और कटआउट ढलाई से पहले लगे हैं" },
      { en: "Slab thickness is marked with pegs and checked while pouring", hi: "स्लैब की मोटाई खूंटियों से चिह्नित है और ढलाई में जांची जाती है" },
      { en: "A slump test is done, and cube sets are taken for every day of casting", hi: "स्लंप टेस्ट होता है, और ढलाई के हर दिन क्यूब सेट लिए जाते हैं" },
      { en: "Concrete is vibrated, and the slab is poured in one go", hi: "कंक्रीट वाइब्रेट की जाती है और स्लैब एक बार में डाली जाती है" },
      { en: "No pouring in heavy rain; fresh concrete is covered if it rains", hi: "तेज़ बारिश में ढलाई नहीं; बारिश आए तो ताज़ी कंक्रीट ढकी जाती है" },
      { en: "Curing starts the next day and goes on for the full period", hi: "क्योरिंग अगले दिन से शुरू होती है और पूरी अवधि चलती है" },
    ],
    mistakes: [
      { en: "Swapping a thicker bar for a thinner one (for example 12 mm for 16 mm) to save steel", hi: "सरिया बचाने के लिए मोटी छड़ की जगह पतली (जैसे 16 mm की जगह 12 mm) लगाना" },
      { en: "Cutting or bending beam steel to let a pipe through", hi: "पाइप निकालने के लिए बीम का सरिया काटना या मोड़ना" },
      { en: "Forgetting sleeves and drilling through the beam later", hi: "स्लीव भूल जाना और बाद में बीम में छेद करना" },
      { en: "Adding water to the mix because it is easier to place", hi: "डालने में आसानी के लिए मिक्स में पानी मिलाना" },
      { en: "Honeycombs patched with plaster instead of being reported to the engineer", hi: "छत्तों को इंजीनियर को बताने की जगह प्लास्टर से भर देना" },
      { en: "Removing props and shuttering early to reuse them", hi: "दोबारा इस्तेमाल के लिए प्रॉप और शटरिंग जल्दी हटाना" },
    ],
    faqs: [
      {
        q: { en: "How many days before slab shuttering can be removed?", hi: "स्लैब की शटरिंग कितने दिन बाद हटा सकते हैं?" },
        a: {
          en: "Side shuttering of columns and beams can usually come off in a day or two, but the slab props must stay much longer, often 7 to 14 days depending on the span. See the full table on our shuttering removal page and follow your engineer.",
          hi: "कॉलम और बीम की साइड शटरिंग आमतौर पर एक-दो दिन में हट सकती है, पर स्लैब के प्रॉप कहीं ज़्यादा समय रहने चाहिए, अक्सर स्पैन के हिसाब से 7 से 14 दिन। पूरी तालिका हमारे शटरिंग हटाने वाले पेज पर है; इंजीनियर की सलाह मानें।",
        },
      },
      {
        q: { en: "Ready-mix concrete or site mix?", hi: "रेडी-मिक्स कंक्रीट या साइट पर मिक्स?" },
        a: {
          en: "Ready-mix gives a more consistent grade if it is ordered for the right strength and delivered on time. Site mix works if materials are measured by weight and water is controlled. Either way, take cubes and test them.",
          hi: "सही मज़बूती के लिए ऑर्डर हो और समय पर पहुंचे तो रेडी-मिक्स ज़्यादा एक जैसा ग्रेड देती है। साइट मिक्स तब ठीक है जब सामान वज़न से नापा जाए और पानी नियंत्रित हो। दोनों में क्यूब लें और टेस्ट करवाएं।",
        },
      },
    ],
    hold: { en: "Never let a slab or beam pour start until you or your engineer have checked the steel and signed it off. Take photos of every bar layout.", hi: "जब तक आप या आपका इंजीनियर सरिया जांचकर मंज़ूरी न दे दे, स्लैब या बीम की ढलाई शुरू न होने दें। हर सरिया लेआउट की फ़ोटो लें।" },
    yt: "slab ka steel checking column beam bar bending shuttering",
    tools: [
      { path: "house-boq-estimate", label: { en: "See RCC items and steel (BBS)", hi: "RCC आइटम और सरिया (BBS) देखें" } },
      { path: "house-construction-guide/slab-shuttering-removal-time", label: { en: "Shuttering removal time", hi: "शटरिंग हटाने का समय" } },
    ],
  },
  {
    n: 9,
    slug: "brick-wall-construction-checklist",
    short: { en: "Brickwork and lintels", hi: "ईंट की चिनाई और लिंटल" },
    title: {
      en: "Brickwork and lintels: wall thickness, mortar and what to check",
      hi: "ईंट की चिनाई और लिंटल: दीवार की मोटाई, मसाला और क्या जांचें",
    },
    metaTitle: {
      en: "Brick Wall Construction Checklist for House Owners (India)",
      hi: "घर मालिकों के लिए ईंट की दीवार बनाने की चेकलिस्ट (भारत)",
    },
    description: {
      en: "Wall thickness, mortar mix, bond, plumb, lintels and chases explained simply. A checklist to see whether the masonry on your site is being done properly.",
      hi: "दीवार की मोटाई, मसाले का मिक्स, बॉन्ड, ओलम्ब, लिंटल और चेज़, सरल भाषा में। यह जांचने की चेकलिस्ट कि आपकी साइट पर चिनाई ठीक से हो रही है या नहीं।",
    },
    lead: {
      en: "Walls decide how straight the house looks, how much plaster you pay for, and whether doors and windows fit. Good masonry is easy to see if you know what to look for.",
      hi: "दीवारें तय करती हैं कि घर कितना सीधा दिखेगा, प्लास्टर पर कितना ख़र्च होगा, और दरवाज़े-खिड़कियां ठीक बैठेंगी या नहीं। सही चिनाई देखकर पहचानी जा सकती है, अगर पता हो कि क्या देखना है।",
    },
    time: { en: "About 3 to 5 weeks per floor", hi: "हर मंज़िल के लिए लगभग 3 से 5 हफ़्ते" },
    boq: ["C"],
    know: [
      {
        en: "Outer walls are usually 230 mm (9 inch) thick and inner partitions 115 mm (4.5 inch). The sample BOQ here uses brickwork in cement mortar 1:6. AAC blocks are the lighter alternative; our red bricks versus AAC page compares them.",
        hi: "बाहरी दीवारें आमतौर पर 230 mm (9 इंच) और भीतरी पार्टीशन 115 mm (4.5 इंच) की होती हैं। यहां के सैंपल BOQ में सीमेंट मसाला 1:6 की ईंट चिनाई ली गई है। AAC ब्लॉक हल्का विकल्प है; हमारे लाल ईंट बनाम AAC वाले पेज पर तुलना है।",
      },
      {
        en: "Bricks should be well burnt, uniform and soaked in water before laying, so that they do not suck water out of the mortar. Mortar joints should be about 10 mm and full, with the bricks laid in a proper bond so that vertical joints do not line up.",
        hi: "ईंटें अच्छी पकी, एक जैसी हों और चिनाई से पहले पानी में भिगोई जाएं, ताकि वे मसाले का पानी न खींचें। मसाले के जोड़ लगभग 10 mm और भरे हुए हों, और ईंटें सही बॉन्ड में लगें ताकि खड़े जोड़ एक सीध में न आएं।",
      },
      {
        en: "Check every course with a plumb bob and a spirit level, and a string line for straightness. Raise the wall no more than about 1 m a day so that the fresh mortar does not squash.",
        hi: "हर परत को साहुल और स्प्रिट लेवल से और सीधाई के लिए डोरी से जांचें। एक दिन में दीवार लगभग 1 m से ज़्यादा ऊंची न उठाएं ताकि ताज़ा मसाला दब न जाए।",
      },
      {
        en: "Lintels are the RCC beams over doors and windows. They should bear at least about 150 mm into the wall on each side, as the drawing shows. Cutting grooves (chases) for pipes and wires should be done with a cutter, not by hammering, which cracks the wall.",
        hi: "लिंटल दरवाज़ों और खिड़कियों के ऊपर के RCC बीम हैं। ड्रॉइंग के अनुसार उनका हर तरफ़ दीवार में कम से कम लगभग 150 mm बेयरिंग होना चाहिए। पाइप और तारों के लिए नाली (चेज़) कटर से काटें, हथौड़े से नहीं, उससे दीवार में दरार आती है।",
      },
      {
        en: "Cure the masonry by sprinkling water for about 7 days. Fix door frames and window frames in the marked positions as the wall rises, and keep their levels the same on every floor.",
        hi: "चिनाई को लगभग 7 दिन पानी छिड़ककर क्योर करें। दीवार उठते समय दरवाज़े और खिड़कियों के फ़्रेम चिह्नित जगह पर लगाएं, और हर मंज़िल पर उनके लेवल एक जैसे रखें।",
      },
    ],
    check: [
      { en: "Wall thickness and positions match the plan", hi: "दीवार की मोटाई और जगह नक्शे से मिलती है" },
      { en: "Bricks are soaked and of one size and colour; broken pieces are not used in bulk", hi: "ईंटें भिगोई हुई, एक नाप और रंग की हैं; टूटे टुकड़े बड़ी मात्रा में नहीं लग रहे" },
      { en: "Mortar mix is as agreed (for example 1:6) and joints are full and even", hi: "मसाले का मिक्स तय अनुसार (जैसे 1:6) है और जोड़ भरे और एक-से हैं" },
      { en: "Wall is plumb and level; checked with a plumb bob and a spirit level", hi: "दीवार साहुल और लेवल में है; साहुल और स्प्रिट लेवल से जांची गई" },
      { en: "Lintels bear at least 150 mm each side and are at the same height all round", hi: "लिंटल हर तरफ़ कम से कम 150 mm टिके हैं और चारों तरफ़ एक ऊंचाई पर हैं" },
      { en: "Door and window openings match the schedule in size", hi: "दरवाज़े और खिड़की के खुले हिस्से शेड्यूल के नाप से मिलते हैं" },
      { en: "Chases are cut with a cutter and refilled after the pipes and wires go in", hi: "चेज़ कटर से काटे गए हैं और पाइप और तार डलने के बाद भरे जाते हैं" },
      { en: "Wall is tied to columns as the engineer's drawing shows", hi: "दीवार इंजीनियर की ड्रॉइंग के अनुसार कॉलम से बंधी है" },
    ],
    mistakes: [
      { en: "Dry bricks that take the water out of the mortar and weaken the joint", hi: "सूखी ईंटें जो मसाले का पानी सोखकर जोड़ कमज़ोर करती हैं" },
      { en: "Thick uneven joints used to hide a wall that is not straight", hi: "टेढ़ी दीवार छिपाने के लिए मोटे, ऊबड़-खाबड़ जोड़" },
      { en: "Raising a very tall wall in one day", hi: "एक दिन में बहुत ऊंची दीवार उठाना" },
      { en: "Hammering wall chases, which cracks the brickwork", hi: "हथौड़े से दीवार के चेज़ काटना, जिससे दरार आती है" },
      { en: "Lintels with too little bearing, or missing over small openings", hi: "बहुत कम बेयरिंग वाले लिंटल, या छोटे खुले हिस्सों पर लिंटल न होना" },
    ],
    faqs: [
      {
        q: { en: "Red bricks or AAC blocks for a house?", hi: "घर के लिए लाल ईंट या AAC ब्लॉक?" },
        a: {
          en: "Both work. AAC blocks are lighter, faster to lay and insulate better, and need the right adhesive and a skilled mason. Good red bricks are cheaper in many places and widely understood by masons. Compare the cost for your city on our red bricks versus AAC page.",
          hi: "दोनों चलते हैं। AAC ब्लॉक हल्के हैं, जल्दी लगते हैं, गर्मी कम रोकते हैं, पर सही चिपकाने वाला मसाला और कुशल मिस्त्री चाहिए। अच्छी लाल ईंट कई जगह सस्ती है और मिस्त्री उससे ज़्यादा परिचित हैं। अपने शहर की लागत की तुलना हमारे लाल ईंट बनाम AAC पेज पर देखें।",
        },
      },
    ],
    hold: { en: "Check the first three courses and the door and window openings before the masons carry on. A wrong start gets repeated on every wall.", hi: "मिस्त्री आगे बढ़ें, उससे पहले पहली तीन परतें और दरवाज़े-खिड़की के नाप जांच लें। ग़लत शुरुआत हर दीवार पर दोहराई जाती है।" },
    yt: "brick masonry kaise karte hain deewar chinai checking",
    tools: [
      { path: "house-construction-guide/red-bricks-vs-aac-blocks", label: { en: "Red bricks vs AAC blocks", hi: "लाल ईंट बनाम AAC ब्लॉक" } },
      { path: "calculators", label: { en: "Brick and mortar calculators", hi: "ईंट और मसाला कैलकुलेटर" } },
    ],
  },
  {
    n: 10,
    slug: "terrace-waterproofing-roof-slab-steps",
    short: { en: "Roof and terrace waterproofing", hi: "छत और टेरेस वॉटरप्रूफिंग" },
    title: {
      en: "Terrace waterproofing and roof finishing: layers, slope and the water test",
      hi: "टेरेस वॉटरप्रूफिंग और छत की फ़िनिशिंग: परतें, ढलान और पानी की जांच",
    },
    metaTitle: {
      en: "Terrace Waterproofing for a New House: Steps, Slope and Test",
      hi: "नए घर की छत की वॉटरप्रूफिंग: चरण, ढलान और पानी की जांच",
    },
    description: {
      en: "How a terrace should be finished so it does not leak: slope, screed, membrane, protection layer, parapet, outlets and the 48-hour ponding test. A checklist for owners.",
      hi: "छत ऐसी कैसे बने कि टपके नहीं: ढलान, स्क्रीड, मेम्ब्रेन, सुरक्षा परत, पैरापेट, आउटलेट और 48 घंटे की पानी की जांच। मालिकों के लिए चेकलिस्ट।",
    },
    lead: {
      en: "A leaking terrace is one of the most common complaints in new houses, and it is almost always a workmanship problem, not a bad-luck one. The cure is a good slope, one good membrane and a water test you witness.",
      hi: "टपकती छत नए घरों की सबसे आम शिकायतों में से है, और यह लगभग हमेशा काम की गुणवत्ता की समस्या होती है, क़िस्मत की नहीं। इलाज है अच्छी ढलान, एक अच्छा मेम्ब्रेन और पानी की जांच जो आप ख़ुद देखें।",
    },
    time: { en: "About 1 to 2 weeks, plus the test", hi: "लगभग 1 से 2 हफ़्ते, जांच अलग" },
    diagram: "roof",
    boq: [],
    know: [
      {
        en: "Water must leave the terrace on its own. Give a slope of roughly 1 in 100 to 1 in 50 towards the outlets using a screed or brickbat coba, and make sure no pocket is left where water can stand.",
        hi: "पानी छत से अपने-आप निकलना चाहिए। स्क्रीड या ईंट-रोड़ी की कोबा से आउटलेट की तरफ़ लगभग 1 में 100 से 1 में 50 की ढलान दें, और कोई गड्ढा न छोड़ें जहां पानी रुके।",
      },
      {
        en: "The common layers, from the slab upwards, are: a cleaned slab, a sloping screed, the waterproofing membrane (cementitious, liquid or sheet), a protective screed, and then tiles or a finish. Ask the applicator for the product name and the number of coats in writing.",
        hi: "स्लैब से ऊपर की तरफ़ आम परतें हैं: साफ़ स्लैब, ढलान वाली स्क्रीड, वॉटरप्रूफिंग मेम्ब्रेन (सीमेंट आधारित, लिक्विड या शीट), सुरक्षा स्क्रीड, और फिर टाइल या फ़िनिश। लगाने वाले से प्रोडक्ट का नाम और कोटों की संख्या लिखित में लें।",
      },
      {
        en: "Take the membrane up the parapet wall by a proper height, and seal around pipes, outlets and the edge of the water tank base, because most leaks start at corners, joints and pipe penetrations.",
        hi: "मेम्ब्रेन को पैरापेट की दीवार पर ठीक ऊंचाई तक ले जाएं, और पाइप, आउटलेट और पानी की टंकी के आधार के किनारों पर सील करें, क्योंकि ज़्यादातर रिसाव कोनों, जोड़ों और पाइप वाली जगहों से शुरू होते हैं।",
      },
      {
        en: "A parapet is usually about 1 m (3 ft) high, but check your local bye-laws. Fix rain water pipes of enough size, with a clean outlet at every low point and a mesh to stop leaves from blocking them.",
        hi: "पैरापेट आमतौर पर लगभग 1 m (3 फ़ुट) ऊंचा होता है, पर अपने स्थानीय बाय-लॉ देखें। पर्याप्त नाप के बरसाती पानी के पाइप लगाएं, हर निचली जगह पर साफ़ आउटलेट और पत्तों से रुकावट रोकने वाली जाली के साथ।",
      },
      {
        en: "Before any tile goes on, do a ponding test: block the outlets, flood the terrace with about 50 mm of water and leave it for 48 hours. Check the ceiling below for any damp patch or drip, and mark the water level at the start and the end.",
        hi: "कोई टाइल लगने से पहले पानी भरकर जांच करें: आउटलेट बंद करें, छत में लगभग 50 mm पानी भरें और 48 घंटे छोड़ दें। नीचे की छत पर नमी का धब्बा या टपकन देखें, और शुरू और अंत में पानी का स्तर चिह्नित करें।",
      },
      {
        en: "Get a written warranty for the waterproofing, with the number of years and what it covers, and keep the bills of the material.",
        hi: "वॉटरप्रूफिंग की लिखित वारंटी लें, कितने साल और क्या शामिल है, और सामान के बिल रखें।",
      },
    ],
    check: [
      { en: "Slab is clean and any cracks are filled before the work starts", hi: "काम शुरू होने से पहले स्लैब साफ़ है और दरारें भरी हैं" },
      { en: "Slope towards every outlet; no pockets where water can stand", hi: "हर आउटलेट की तरफ़ ढलान; कोई गड्ढा नहीं जहां पानी रुके" },
      { en: "Membrane goes up the parapet and around pipes and the tank base", hi: "मेम्ब्रेन पैरापेट पर और पाइप और टंकी के आधार के चारों तरफ़ जाता है" },
      { en: "Product name, coats and thickness are as agreed, with the empty containers shown", hi: "प्रोडक्ट का नाम, कोट और मोटाई तय अनुसार हैं, ख़ाली डिब्बे दिखाए गए" },
      { en: "A 48-hour water test is done before the protective screed or tiles", hi: "सुरक्षा स्क्रीड या टाइल से पहले 48 घंटे की पानी की जांच हो चुकी है" },
      { en: "Ceiling below is checked and photographed after the test", hi: "जांच के बाद नीचे की छत देखी और उसकी फ़ोटो ली गई" },
      { en: "Rain water outlets are clear, with a mesh", hi: "बरसाती पानी के आउटलेट साफ़ हैं, जाली के साथ" },
      { en: "Written warranty and material bills are in your file", hi: "लिखित वारंटी और सामान के बिल आपकी फ़ाइल में हैं" },
    ],
    mistakes: [
      { en: "Applying the membrane on a dirty or damp slab, so it does not stick", hi: "गंदे या गीले स्लैब पर मेम्ब्रेन लगाना, जिससे वह चिपकता नहीं" },
      { en: "No slope, so water stands and finds the first crack", hi: "ढलान नहीं, इसलिए पानी रुकता है और पहली दरार ढूंढ लेता है" },
      { en: "Laying tiles before the water test", hi: "पानी की जांच से पहले टाइल लगाना" },
      { en: "Skipping the corners and pipe joints, where leaks begin", hi: "कोने और पाइप के जोड़ छोड़ देना, जहां से रिसाव शुरू होता है" },
      { en: "A one-line verbal promise instead of a written warranty", hi: "लिखित वारंटी की जगह एक लाइन का ज़बानी वादा" },
    ],
    faqs: [
      {
        q: { en: "Which waterproofing is best for a terrace?", hi: "टेरेस के लिए कौनसी वॉटरप्रूफिंग सबसे अच्छी है?" },
        a: {
          en: "No single product is best everywhere. Cementitious and liquid-applied coatings, and bitumen or polymer sheet membranes, all work when the slab is prepared well, the slope is right and the edges are sealed. A good applicator, a written warranty and the water test matter more than the brand.",
          hi: "हर जगह कोई एक प्रोडक्ट सबसे अच्छा नहीं होता। सीमेंट आधारित और लिक्विड कोटिंग, और बिटुमेन या पॉलीमर शीट मेम्ब्रेन, सभी तब काम करते हैं जब स्लैब ठीक तैयार हो, ढलान सही हो और किनारे सील हों। अच्छा मिस्त्री, लिखित वारंटी और पानी की जांच ब्रांड से ज़्यादा मायने रखते हैं।",
        },
      },
      {
        q: { en: "How long should the water test run?", hi: "पानी की जांच कितने समय चलनी चाहिए?" },
        a: {
          en: "A common practice is to hold about 50 mm of water for 48 hours, with the outlets blocked, and then check the ceiling below. Some specifications ask for 72 hours. Do not skip the test to save two days.",
          hi: "आम तरीक़ा है आउटलेट बंद करके लगभग 50 mm पानी 48 घंटे रखना और फिर नीचे की छत देखना। कुछ स्पेसिफ़िकेशन 72 घंटे मांगते हैं। दो दिन बचाने के लिए जांच न छोड़ें।",
        },
      },
    ],
    hold: { en: "Be present when the water test starts and ends, and photograph the ceiling below.", hi: "पानी की जांच शुरू और ख़त्म होते समय मौजूद रहें, और नीचे की छत की फ़ोटो लें।" },
    yt: "terrace waterproofing kaise kare ponding test",
    tools: [
      { path: "house-construction-guide/construction-stages-quality-checks", label: { en: "Quality checks by stage", hi: "स्टेज-वार क्वालिटी जांच" } },
      { path: "house-boq-estimate", label: { en: "See waterproofing in the BOQ", hi: "BOQ में वॉटरप्रूफिंग देखें" } },
    ],
  },
  {
    n: 11,
    slug: "house-electrical-plumbing-checklist-before-plaster",
    short: { en: "Electrical and plumbing", hi: "बिजली और प्लंबिंग" },
    title: {
      en: "Electrical and plumbing work: what to check before the walls are plastered",
      hi: "बिजली और प्लंबिंग का काम: दीवारों पर प्लास्टर से पहले क्या जांचें",
    },
    metaTitle: {
      en: "House Electrical and Plumbing Checklist Before Plastering",
      hi: "प्लास्टर से पहले घर की बिजली और प्लंबिंग की चेकलिस्ट",
    },
    description: {
      en: "Points, wire sizes, earthing, pipes, slopes and pressure tests to check before plastering hides them. Includes the photo habit that saves owners later.",
      hi: "प्लास्टर से ढकने से पहले जांचने वाले पॉइंट, तार के नाप, अर्थिंग, पाइप, ढलान और प्रेशर टेस्ट। साथ में वह फ़ोटो की आदत जो मालिक को बाद में बचाती है।",
    },
    lead: {
      en: "Once the plaster is on, every wire and pipe is hidden for good. Changing a point later means breaking a finished wall. This stage is about planning and checking while everything is still open.",
      hi: "प्लास्टर चढ़ने के बाद हर तार और पाइप हमेशा के लिए छिप जाता है। बाद में पॉइंट बदलना यानी बनी हुई दीवार तोड़ना। यह चरण सब कुछ खुला होते हुए योजना और जांच का है।",
    },
    time: { en: "About 2 to 4 weeks, along with brickwork and plaster", hi: "लगभग 2 से 4 हफ़्ते, चिनाई और प्लास्टर के साथ-साथ" },
    boq: ["G"],
    know: [
      {
        en: "Mark every light, fan, switch, socket, AC and geyser point on a wall-by-wall drawing with the owner, before any chase is cut. Think about where furniture, the bed head, the TV and the kitchen appliances will go.",
        hi: "कोई चेज़ कटने से पहले हर लाइट, पंखा, स्विच, सॉकेट, AC और गीज़र पॉइंट दीवार-दर-दीवार ड्रॉइंग पर मालिक के साथ चिह्नित करें। सोचें कि फ़र्नीचर, पलंग का सिरहाना, टीवी और किचन के उपकरण कहां जाएंगे।",
      },
      {
        en: "Use ISI-marked copper wire in PVC conduit. In common Indian practice 1.5 sq mm wire serves lights and fans, 2.5 sq mm serves sockets, and 4 sq mm serves an AC or geyser. Separate circuits with MCBs, an RCCB or ELCB for safety, and proper earthing, are essential.",
        hi: "PVC कंड्यूट में ISI मार्क वाला कॉपर तार लें। भारत की आम प्रथा में लाइट और पंखे के लिए 1.5 sq mm, सॉकेट के लिए 2.5 sq mm, और AC या गीज़र के लिए 4 sq mm का तार लगता है। MCB के साथ अलग सर्किट, सुरक्षा के लिए RCCB या ELCB और सही अर्थिंग ज़रूरी हैं।",
      },
      {
        en: "Use ISI-marked pipes for water supply and drainage. Waste lines need a continuous slope, commonly between about 1 in 40 and 1 in 60, with no sags. Fix traps, floor drains and the vent line as the plumber's drawing shows.",
        hi: "पानी की सप्लाई और निकासी के लिए ISI मार्क वाले पाइप लें। वेस्ट लाइन में लगातार ढलान चाहिए, आमतौर पर लगभग 1 में 40 से 1 में 60, बिना झोल के। ट्रैप, फ़्लोर ड्रेन और वेंट लाइन प्लंबर की ड्रॉइंग के अनुसार लगाएं।",
      },
      {
        en: "Pressure-test the water pipes before they are covered, and keep them under pressure for 24 hours. A drop in pressure means a leak somewhere in the wall.",
        hi: "पानी के पाइप ढकने से पहले उनका प्रेशर टेस्ट करें, और उन्हें 24 घंटे प्रेशर में रखें। प्रेशर गिरना यानी दीवार में कहीं रिसाव।",
      },
      {
        en: "Photograph every wall and floor with the pipes and conduits visible and a tape showing the distance from a corner. These photos will tell you where it is safe to drill for the next twenty years.",
        hi: "हर दीवार और फ़र्श की फ़ोटो लें जिसमें पाइप और कंड्यूट दिखें और कोने से दूरी बताता टेप हो। ये फ़ोटो अगले बीस साल बताएंगी कि कहां ड्रिल करना सुरक्षित है।",
      },
      {
        en: "Plan the septic tank or sewer connection, the soak pit, the sump and the overhead tank, and the borewell if needed, along with the outside drainage level.",
        hi: "सेप्टिक टैंक या सीवर कनेक्शन, सोक पिट, सम्प और ऊपर की टंकी, ज़रूरत हो तो बोरवेल, और बाहर की निकासी के लेवल की योजना बनाएं।",
      },
    ],
    check: [
      { en: "Point drawing agreed and signed for each room before chasing", hi: "चेज़ करने से पहले हर कमरे की पॉइंट ड्रॉइंग तय और हस्ताक्षरित है" },
      { en: "Wire size and make as agreed; circuits separated, with MCB and RCCB", hi: "तार का नाप और ब्रांड तय अनुसार; सर्किट अलग, MCB और RCCB के साथ" },
      { en: "Earthing pit made and tested", hi: "अर्थिंग पिट बना है और जांचा गया है" },
      { en: "Conduits are fixed firmly, with no loose joints or sharp bends", hi: "कंड्यूट मज़बूती से लगे हैं, ढीले जोड़ या तीखे मोड़ नहीं" },
      { en: "Pipes are ISI-marked; slope on waste lines is continuous", hi: "पाइप ISI मार्क वाले हैं; वेस्ट लाइन की ढलान लगातार है" },
      { en: "Water lines pressure-tested for 24 hours with no drop", hi: "पानी की लाइनें 24 घंटे प्रेशर में जांची गईं, गिरावट नहीं" },
      { en: "Bathroom floor drains and traps are fixed at the right level", hi: "बाथरूम के फ़्लोर ड्रेन और ट्रैप सही लेवल पर लगे हैं" },
      { en: "Dated photos of every wall with pipes and conduits are saved", hi: "पाइप और कंड्यूट के साथ हर दीवार की तारीख़ वाली फ़ोटो सुरक्षित हैं" },
    ],
    mistakes: [
      { en: "Deciding the point positions after the chasing is done", hi: "चेज़िंग हो जाने के बाद पॉइंट की जगह तय करना" },
      { en: "Thin, non-ISI wire that heats and wastes power", hi: "पतला, बिना ISI का तार जो गर्म होता है और बिजली बर्बाद करता है" },
      { en: "No earthing, or an earth wire that is not connected to anything", hi: "अर्थिंग नहीं, या ऐसा अर्थ तार जो कहीं जुड़ा नहीं" },
      { en: "Burying pipes without a pressure test", hi: "प्रेशर टेस्ट के बिना पाइप दबा देना" },
      { en: "Waste pipes laid flat, so they block again and again", hi: "वेस्ट पाइप सीधे बिछाना, जिससे वे बार-बार जाम होते हैं" },
    ],
    faqs: [
      {
        q: { en: "What wire size is used for lights, sockets and AC in a house?", hi: "घर में लाइट, सॉकेट और AC के लिए कितने नाप का तार लगता है?" },
        a: {
          en: "In common Indian practice, 1.5 sq mm copper wire is used for lights and fans, 2.5 sq mm for power sockets and 4 sq mm for an AC or geyser, each on a separate circuit with the right MCB. Your electrician or engineer must confirm it for your loads.",
          hi: "भारत की आम प्रथा में लाइट और पंखे के लिए 1.5 sq mm, पावर सॉकेट के लिए 2.5 sq mm और AC या गीज़र के लिए 4 sq mm कॉपर तार लगता है, हर एक अलग सर्किट और सही MCB के साथ। आपके लोड के लिए इलेक्ट्रीशियन या इंजीनियर से पक्का करवाएं।",
        },
      },
    ],
    hold: { en: "Do not allow plastering until the wiring and pipes are inspected, tested and photographed.", hi: "जब तक वायरिंग और पाइप की जांच, टेस्ट और फ़ोटो न हो जाएं, प्लास्टर न होने दें।" },
    yt: "house electrical wiring plumbing checklist plaster se pehle",
    tools: [
      { path: "house-boq-estimate", label: { en: "See plumbing and electrical in the BOQ", hi: "BOQ में प्लंबिंग और बिजली देखें" } },
      { path: "house-construction-guide/checklist", label: { en: "Full site checklist", hi: "पूरी साइट चेकलिस्ट" } },
    ],
  },
  {
    n: 12,
    slug: "plaster-flooring-tiles-doors-windows-checklist",
    short: { en: "Plaster, flooring, doors and windows", hi: "प्लास्टर, फ़्लोरिंग, दरवाज़े और खिड़कियां" },
    title: {
      en: "Plaster, flooring, tiles, doors and windows: a checklist for owners",
      hi: "प्लास्टर, फ़्लोरिंग, टाइल, दरवाज़े और खिड़कियां: मालिकों के लिए चेकलिस्ट",
    },
    metaTitle: {
      en: "Plaster, Tiles, Flooring, Doors and Windows: House Checklist",
      hi: "प्लास्टर, टाइल, फ़्लोरिंग, दरवाज़े और खिड़कियां: घर की चेकलिस्ट",
    },
    description: {
      en: "Plaster thickness and curing, floor levels, tile laying, bathroom waterproofing and flood test, door and window frames. What to check before you pay for this stage.",
      hi: "प्लास्टर की मोटाई और क्योरिंग, फ़र्श का लेवल, टाइल लगाना, बाथरूम वॉटरप्रूफिंग और पानी की जांच, दरवाज़े और खिड़की के फ़्रेम। इस चरण का पैसा देने से पहले क्या जांचें।",
    },
    lead: {
      en: "This is where the house starts to look finished, and where the biggest bills for finishing begin. Quality shows in small things: a straight wall, a floor with no hollow tiles, a door that closes without a push.",
      hi: "यहां घर तैयार दिखने लगता है, और फ़िनिशिंग के सबसे बड़े बिल यहीं से शुरू होते हैं। गुणवत्ता छोटी चीज़ों में दिखती है: सीधी दीवार, बिना खोखली टाइल का फ़र्श, और बिना धक्के के बंद होने वाला दरवाज़ा।",
    },
    time: { en: "About 4 to 8 weeks", hi: "लगभग 4 से 8 हफ़्ते" },
    boq: ["D", "E", "F"],
    know: [
      {
        en: "Plaster is usually about 12 mm inside and 15 to 20 mm outside, in cement mortar such as 1:4 or 1:6 as agreed. Check the surface with a straight edge, and cure it with water for about 7 days so it does not crack.",
        hi: "प्लास्टर आमतौर पर अंदर लगभग 12 mm और बाहर 15 से 20 mm, तय अनुसार 1:4 या 1:6 जैसे सीमेंट मसाले में होता है। सतह को सीधी पट्टी से जांचें, और दरार से बचाने के लिए लगभग 7 दिन पानी से क्योर करें।",
      },
      {
        en: "Floors need a level base and a slope towards the drain in bathrooms, kitchens and the wash area, commonly about 1 in 100. Lay tiles on a proper bed or adhesive with full contact, and tap each tile to check that it is not hollow.",
        hi: "फ़र्श के लिए समतल आधार चाहिए, और बाथरूम, किचन और धुलाई की जगह में नाली की तरफ़ ढलान, आमतौर पर लगभग 1 में 100। टाइल उचित बेड या चिपकाने वाले मसाले पर पूरे संपर्क के साथ लगाएं, और हर टाइल को थपथपाकर देखें कि खोखली न हो।",
      },
      {
        en: "Waterproof every bathroom floor and the lower part of its walls before tiling, then flood it and hold the water for 24 to 48 hours. Check the ceiling below. Do this test before the tiles go on.",
        hi: "टाइल से पहले हर बाथरूम का फ़र्श और दीवारों का निचला हिस्सा वॉटरप्रूफ करें, फिर पानी भरकर 24 से 48 घंटे रखें। नीचे की छत देखें। यह जांच टाइल लगने से पहले करें।",
      },
      {
        en: "Door and window frames must be plumb, square and fixed firmly with the right clearance. Decide the frame material (wood, steel, UPVC or aluminium), the shutter type and the hardware early, because the lead time can be weeks.",
        hi: "दरवाज़े और खिड़की के फ़्रेम सीधे, समकोण और मज़बूती से, सही गैप के साथ लगें। फ़्रेम की सामग्री (लकड़ी, स्टील, UPVC या एल्युमिनियम), शटर का प्रकार और हार्डवेयर पहले तय करें, क्योंकि मिलने में हफ़्ते लग सकते हैं।",
      },
      {
        en: "Order tiles and fittings in one go, with about 5 to 10 percent extra, from the same batch so that the shade matches. Keep the leftover tiles for repairs.",
        hi: "टाइल और फ़िटिंग एक साथ ऑर्डर करें, लगभग 5 से 10 प्रतिशत ज़्यादा, एक ही बैच की ताकि रंग मिले। बची हुई टाइलें मरम्मत के लिए रखें।",
      },
    ],
    check: [
      { en: "Plaster is straight and plumb, with no hollow sound and no hairline cracks", hi: "प्लास्टर सीधा और ओलम्ब में है, खोखली आवाज़ और बाल जैसी दरार नहीं" },
      { en: "Plaster is cured for about 7 days", hi: "प्लास्टर की लगभग 7 दिन क्योरिंग हुई है" },
      { en: "Floor level is even and slopes to the drains in wet areas", hi: "फ़र्श का लेवल एक-सा है और गीली जगहों में नाली की तरफ़ ढलान है" },
      { en: "Bathroom waterproofing done and flood-tested for 24 to 48 hours", hi: "बाथरूम की वॉटरप्रूफिंग हुई और 24 से 48 घंटे पानी से जांची गई" },
      { en: "Tiles are laid with full contact (tap test), straight joints and even spacing", hi: "टाइलें पूरे संपर्क (थपथपाकर जांच), सीधे जोड़ और बराबर गैप से लगी हैं" },
      { en: "Frames are plumb and square; shutters open and close freely", hi: "फ़्रेम सीधे और समकोण हैं; शटर आराम से खुलते और बंद होते हैं" },
      { en: "Brand, size and batch of tiles match your order; spare tiles are kept", hi: "टाइल का ब्रांड, नाप और बैच आपके ऑर्डर से मिलता है; फ़ालतू टाइलें रखी हैं" },
    ],
    mistakes: [
      { en: "Plastering over a wall that was never properly cured or is full of dust", hi: "ऐसी दीवार पर प्लास्टर जो कभी ठीक से क्योर नहीं हुई या धूल से भरी है" },
      { en: "Tiles placed on dabs of mortar, leaving hollow spots that crack later", hi: "मसाले के गुच्छों पर टाइल रखना, जिससे खोखली जगहें बनती हैं और बाद में टूटती हैं" },
      { en: "Fixing bathroom tiles before testing the waterproofing", hi: "वॉटरप्रूफिंग की जांच से पहले बाथरूम की टाइल लगाना" },
      { en: "Floors with no slope, so water stands in the bathroom", hi: "बिना ढलान का फ़र्श, जिससे बाथरूम में पानी रुकता है" },
      { en: "Ordering tiles in batches from different lots", hi: "अलग-अलग लॉट से किस्तों में टाइल मंगवाना" },
    ],
    faqs: [
      {
        q: { en: "How thick should wall plaster be?", hi: "दीवार का प्लास्टर कितना मोटा होना चाहिए?" },
        a: {
          en: "Usually about 12 mm for internal walls and 15 to 20 mm for external walls. Plaster much thicker than this tends to crack and costs more material. If the wall is very uneven, fix it with a coat in two layers, not one thick layer.",
          hi: "आमतौर पर अंदरूनी दीवारों के लिए लगभग 12 mm और बाहरी दीवारों के लिए 15 से 20 mm। इससे बहुत मोटा प्लास्टर टूटता है और सामान ज़्यादा लगता है। दीवार बहुत ऊबड़-खाबड़ हो तो एक मोटी परत की जगह दो परतों में ठीक करें।",
        },
      },
    ],
    hold: { en: "Witness the bathroom flood test before any tile is laid.", hi: "कोई टाइल लगने से पहले बाथरूम की पानी की जांच ख़ुद देखें।" },
    yt: "plastering tiles flooring checklist ghar construction",
    tools: [
      { path: "calculators", label: { en: "Tiles and plaster calculators", hi: "टाइल और प्लास्टर कैलकुलेटर" } },
      { path: "house-boq-estimate", label: { en: "See plaster, flooring and doors in the BOQ", hi: "BOQ में प्लास्टर, फ़्लोरिंग और दरवाज़े देखें" } },
    ],
  },
  {
    n: 13,
    slug: "house-painting-finishing-steps",
    short: { en: "Painting and finishing", hi: "पेंटिंग और फ़िनिशिंग" },
    title: {
      en: "House painting and finishing: putty, primer, paint and fittings",
      hi: "घर की पेंटिंग और फ़िनिशिंग: पुट्टी, प्राइमर, पेंट और फ़िटिंग",
    },
    metaTitle: {
      en: "House Painting and Finishing Steps: Putty, Primer, Paint",
      hi: "घर की पेंटिंग और फ़िनिशिंग के चरण: पुट्टी, प्राइमर, पेंट",
    },
    description: {
      en: "Waiting time before paint, putty, primer, coats, exterior paint, fittings and false ceiling, and how to make sure the painter really applies every coat you pay for.",
      hi: "पेंट से पहले इंतज़ार का समय, पुट्टी, प्राइमर, कोट, बाहरी पेंट, फ़िटिंग और फ़ॉल्स सीलिंग, और यह कैसे पक्का करें कि पेंटर हर वह कोट लगाए जिसका आप पैसा दे रहे हैं।",
    },
    lead: {
      en: "Paint is the last layer and the first thing every visitor sees. It is also the stage where shortcuts are easiest to hide, such as a missing coat or a thinned-down paint.",
      hi: "पेंट आख़िरी परत है और हर मेहमान को सबसे पहले दिखती है। यही वह चरण भी है जहां शॉर्टकट छिपाना सबसे आसान है, जैसे एक कोट कम या पानी मिलाया हुआ पेंट।",
    },
    time: { en: "About 3 to 5 weeks", hi: "लगभग 3 से 5 हफ़्ते" },
    boq: ["I"],
    know: [
      {
        en: "Let the plaster dry well before putty and paint, usually a few weeks. Painting damp walls leads to peeling, patches and white salt marks. Fix any hairline cracks and leaks first.",
        hi: "पुट्टी और पेंट से पहले प्लास्टर को अच्छी तरह सूखने दें, आमतौर पर कुछ हफ़्ते। गीली दीवार पर पेंट से पपड़ी, धब्बे और सफ़ेद नमक के निशान आते हैं। पहले बाल जैसी दरारें और रिसाव ठीक करें।",
      },
      {
        en: "A usual internal system is two coats of wall putty, sanding between coats, one coat of primer, and two coats of emulsion. For the outside, use a weather-proof exterior paint on a suitable primer.",
        hi: "आम अंदरूनी सिस्टम है: वॉल पुट्टी के दो कोट, कोटों के बीच घिसाई, प्राइमर का एक कोट, और इमल्शन के दो कोट। बाहर के लिए उचित प्राइमर पर मौसम-रोधी एक्सटीरियर पेंट लगाएं।",
      },
      {
        en: "Insist on sealed tins of the agreed brand and shade, opened in front of you. Thinning paint with extra water is the commonest way to cheat. Note the batch number so that a repair later matches.",
        hi: "तय ब्रांड और शेड के सील बंद डिब्बे मांगें, जो आपके सामने खुलें। ज़्यादा पानी मिलाकर पेंट पतला करना धोखे का सबसे आम तरीक़ा है। बैच नंबर लिख लें ताकि बाद की मरम्मत मेल खाए।",
      },
      {
        en: "Do the wood work, false ceiling and tiling work before painting, and fix switches, fans, lights and sanitary fittings after painting, so that nothing gets splashed. Do a final cleaning once all this is done.",
        hi: "लकड़ी का काम, फ़ॉल्स सीलिंग और टाइलिंग पेंट से पहले करें, और स्विच, पंखे, लाइट और सैनिटरी फ़िटिंग पेंट के बाद लगाएं, ताकि छींटे न पड़ें। यह सब होने के बाद आख़िरी सफ़ाई करें।",
      },
    ],
    check: [
      { en: "Walls are dry; cracks and leaks are fixed before putty", hi: "दीवारें सूखी हैं; पुट्टी से पहले दरारें और रिसाव ठीक हैं" },
      { en: "Two coats of putty, sanded, with a smooth finish under a bright torch light", hi: "पुट्टी के दो कोट, घिसे हुए, तेज़ टॉर्च की रोशनी में चिकनी फ़िनिश" },
      { en: "Primer applied before the paint", hi: "पेंट से पहले प्राइमर लगा है" },
      { en: "Paint tins are sealed, of the agreed brand and shade, and opened on site", hi: "पेंट के डिब्बे सील बंद, तय ब्रांड और शेड के हैं और साइट पर खोले गए" },
      { en: "The number of coats matches the agreement", hi: "कोटों की संख्या एग्रीमेंट के अनुसार है" },
      { en: "No roller marks, drips or patches in daylight and at night", hi: "दिन और रात की रोशनी में रोलर के निशान, टपकन या धब्बे नहीं" },
      { en: "Fittings are fixed, tested and cleaned; spare paint is handed over", hi: "फ़िटिंग लगी, जांची और साफ़ हैं; बचा हुआ पेंट सौंपा गया" },
    ],
    mistakes: [
      { en: "Painting over damp or dusty plaster", hi: "गीले या धूल वाले प्लास्टर पर पेंट" },
      { en: "Skipping the primer or the second coat", hi: "प्राइमर या दूसरा कोट छोड़ देना" },
      { en: "Thinning paint with water to make it last longer", hi: "ज़्यादा चलाने के लिए पेंट में पानी मिलाना" },
      { en: "Fixing switch plates and fittings before painting, then painting around them", hi: "पेंट से पहले स्विच प्लेट और फ़िटिंग लगा देना, फिर उनके आसपास पेंट करना" },
    ],
    faqs: [
      {
        q: { en: "How long to wait before painting new plaster?", hi: "नए प्लास्टर पर पेंट से पहले कितना इंतज़ार करें?" },
        a: {
          en: "A common rule of thumb is to let it dry for a few weeks, about 3 to 4, and longer in monsoon or on thick plaster. The wall must be dry to the touch and show no damp patch. Painting too early causes peeling and salt marks.",
          hi: "आम अंगूठा नियम है कि उसे कुछ हफ़्ते, लगभग 3 से 4, सूखने दें, और मानसून या मोटे प्लास्टर में और ज़्यादा। दीवार छूने पर सूखी हो और नमी का धब्बा न दिखे। जल्दी पेंट करने से पपड़ी और नमक के निशान आते हैं।",
        },
      },
    ],
    hold: { en: "See the paint tins opened and the coats counted, before the painter's bill is paid.", hi: "पेंटर का बिल देने से पहले पेंट के डिब्बे खुलते देखें और कोट गिनें।" },
    yt: "house painting putty primer paint kaise karte hain",
    tools: [
      { path: "calculators", label: { en: "Paint calculator", hi: "पेंट कैलकुलेटर" } },
      { path: "house-boq-estimate", label: { en: "See painting in the BOQ", hi: "BOQ में पेंटिंग देखें" } },
    ],
  },
  {
    n: 14,
    slug: "house-handover-completion-certificate-checklist",
    short: { en: "Handover and completion", hi: "हैंडओवर और कम्प्लीशन" },
    title: {
      en: "House handover: snag list, final bill and completion certificate",
      hi: "घर का हैंडओवर: कमियों की सूची, आख़िरी बिल और कम्प्लीशन सर्टिफ़िकेट",
    },
    metaTitle: {
      en: "House Handover Checklist: Snag List, Final Bill, Completion Certificate",
      hi: "घर हैंडओवर चेकलिस्ट: कमियों की सूची, आख़िरी बिल, कम्प्लीशन सर्टिफ़िकेट",
    },
    description: {
      en: "How to take over a finished house: the snag walk-through, final measurement and bill, retention, warranties, drawings, completion certificate and permanent connections.",
      hi: "तैयार घर को कैसे अपने हाथ में लें: कमियां देखने की वॉक-थ्रू, आख़िरी नाप और बिल, रिटेंशन, वारंटी, ड्रॉइंग, कम्प्लीशन सर्टिफ़िकेट और स्थायी कनेक्शन।",
    },
    lead: {
      en: "The house is only finished when the papers are finished too. A careful handover protects you from paying for work not done, and keeps the right to have every defect fixed.",
      hi: "घर तब तक पूरा नहीं है जब तक कागज़ पूरे न हों। सावधानी से किया हैंडओवर आपको न हुए काम के पैसे देने से बचाता है, और हर कमी ठीक करवाने का हक़ बनाए रखता है।",
    },
    time: { en: "About 2 to 4 weeks, plus the defect period", hi: "लगभग 2 से 4 हफ़्ते, डिफ़ेक्ट अवधि अलग" },
    boq: [],
    know: [
      {
        en: "Walk through the house with your engineer and the contractor, room by room, with a written snag list: leaks, cracks, loose tiles, doors that rub, dead switches, slow drains, paint marks. Test every tap, switch, flush and lock. Agree a date by which each item is fixed.",
        hi: "इंजीनियर और ठेकेदार के साथ कमरे-दर-कमरे घर देखें और कमियों की लिखित सूची बनाएं: रिसाव, दरारें, ढीली टाइल, अटकते दरवाज़े, बेकार स्विच, धीमी निकासी, पेंट के निशान। हर नल, स्विच, फ़्लश और ताला चलाकर देखें। हर कमी ठीक होने की तारीख़ तय करें।",
      },
      {
        en: "Take the final measurement against the BOQ or agreement, and pay the final bill only for work done. Keep the retention (often about 5 percent) until the defect liability period ends, usually 12 months.",
        hi: "BOQ या एग्रीमेंट के सामने आख़िरी नाप लें, और आख़िरी बिल सिर्फ़ हुए काम का दें। रिटेंशन (अक्सर लगभग 5 प्रतिशत) डिफ़ेक्ट लायबिलिटी अवधि, आमतौर पर 12 महीने, ख़त्म होने तक रोकें।",
      },
      {
        en: "Collect all drawings (architectural, structural, electrical, plumbing) and ideally marked-up copies of how it was actually built, the warranty cards, the cube test reports, the bills of main materials and the contact details of every trade.",
        hi: "सारी ड्रॉइंग (आर्किटेक्चर, स्ट्रक्चर, बिजली, प्लंबिंग), हो सके तो असल में जैसा बना उसकी निशान लगी कॉपी, वारंटी कार्ड, क्यूब टेस्ट रिपोर्ट, मुख्य सामान के बिल और हर कारीगर के संपर्क लें।",
      },
      {
        en: "Apply for the completion (or occupancy) certificate from the local authority, where it is required, and then for the permanent electricity and water connections. A bank loan and a later sale often need these papers.",
        hi: "जहां ज़रूरी हो, स्थानीय प्राधिकरण से कम्प्लीशन (या ऑक्यूपेंसी) सर्टिफ़िकेट के लिए आवेदन करें, फिर स्थायी बिजली और पानी के कनेक्शन के लिए। बैंक लोन और आगे बेचने के लिए अक्सर इन कागज़ों की ज़रूरत पड़ती है।",
      },
      {
        en: "Update the property tax record for the new building, insure the house, and keep a simple maintenance routine: clean terrace outlets before every monsoon, and service the tank, pump and electrical board once a year.",
        hi: "नई इमारत के लिए संपत्ति कर रिकॉर्ड अपडेट करें, घर का बीमा करवाएं, और सरल रखरखाव दिनचर्या रखें: हर मानसून से पहले छत के आउटलेट साफ़ करें, और साल में एक बार टंकी, पंप और बिजली का बोर्ड सर्विस करवाएं।",
      },
    ],
    check: [
      { en: "Written snag list signed by you and the contractor, with dates", hi: "आपके और ठेकेदार के हस्ताक्षर वाली लिखित कमियों की सूची, तारीख़ों के साथ" },
      { en: "Every tap, switch, flush, door and lock tested", hi: "हर नल, स्विच, फ़्लश, दरवाज़ा और ताला जांचा गया" },
      { en: "Final measurement matches the BOQ or agreement; extras were in writing", hi: "आख़िरी नाप BOQ या एग्रीमेंट से मिलता है; अतिरिक्त काम लिखित में थे" },
      { en: "Retention held back until the defect period ends", hi: "डिफ़ेक्ट अवधि ख़त्म होने तक रिटेंशन रोका गया" },
      { en: "All drawings, warranties, test reports and bills are in one file", hi: "सारी ड्रॉइंग, वारंटी, टेस्ट रिपोर्ट और बिल एक फ़ाइल में हैं" },
      { en: "Completion or occupancy certificate applied for, where required", hi: "जहां ज़रूरी है, कम्प्लीशन या ऑक्यूपेंसी सर्टिफ़िकेट के लिए आवेदन किया" },
      { en: "Permanent electricity and water connections applied for", hi: "स्थायी बिजली और पानी कनेक्शन के लिए आवेदन किया" },
      { en: "Property tax updated and house insured", hi: "संपत्ति कर अपडेट और घर का बीमा हुआ" },
    ],
    mistakes: [
      { en: "Paying the full bill before the snag list is cleared", hi: "कमियों की सूची साफ़ होने से पहले पूरा बिल दे देना" },
      { en: "Moving in before the completion certificate, then facing a bank or sale problem", hi: "कम्प्लीशन सर्टिफ़िकेट से पहले रहने लगना, फिर बैंक या बिक्री में दिक्कत" },
      { en: "Not collecting the drawings and photos, which makes later repairs a guess", hi: "ड्रॉइंग और फ़ोटो न लेना, जिससे बाद की मरम्मत अंदाज़े पर होती है" },
      { en: "Releasing the retention early", hi: "रिटेंशन जल्दी छोड़ देना" },
    ],
    faqs: [
      {
        q: { en: "What is a snag list?", hi: "स्नैग लिस्ट क्या होती है?" },
        a: {
          en: "A snag list is a written list of small defects and unfinished work found when you inspect the finished house, such as a cracked tile, a door that rubs or a leaking tap. The contractor fixes each item, and you tick it off before the final payment.",
          hi: "स्नैग लिस्ट तैयार घर की जांच में मिली छोटी कमियों और अधूरे कामों की लिखित सूची है, जैसे टूटी टाइल, अटकता दरवाज़ा या टपकता नल। ठेकेदार हर कमी ठीक करता है, और आख़िरी भुगतान से पहले आप उस पर टिक करते हैं।",
        },
      },
    ],
    hold: { en: "Do not release the final payment or the retention until the snag list is closed.", hi: "कमियों की सूची बंद होने तक आख़िरी भुगतान या रिटेंशन न छोड़ें।" },
    yt: "ghar handover snag list completion certificate kaise le",
    tools: [
      { path: "house-construction-guide/contractor-agreement-format", label: { en: "Contractor agreement format", hi: "ठेकेदार एग्रीमेंट फ़ॉर्मेट" } },
      { path: "house-construction-guide/checklist", label: { en: "Full site checklist", hi: "पूरी साइट चेकलिस्ट" } },
    ],
  },
];

export const getStage = (slug: string) => STAGES.find((s) => s.slug === slug);
export const stageIndex = (slug: string) => STAGES.findIndex((s) => s.slug === slug);

/* ------------------------------------------------------------------ agreement */

export interface Clause {
  h: T;
  items: T[];
}

export const AGREEMENT_TYPES: { h: T; d: T; when: T }[] = [
  {
    h: { en: "Labour-only", hi: "सिर्फ़ मज़दूरी" },
    d: { en: "You buy the material. The contractor charges only for labour.", hi: "सामान आप ख़रीदते हैं। ठेकेदार सिर्फ़ मज़दूरी लेता है।" },
    when: { en: "You can watch the site and want to control brands and cost.", hi: "आप साइट देख सकते हैं और ब्रांड और ख़र्च अपने हाथ में रखना चाहते हैं।" },
  },
  {
    h: { en: "Material and labour (turnkey)", hi: "सामान और मज़दूरी (टर्नकी)" },
    d: { en: "The contractor supplies material and labour for a total or a per sq ft rate.", hi: "ठेकेदार सामान और मज़दूरी देता है, कुल रकम या प्रति sq ft रेट पर।" },
    when: { en: "You live far away or have little time. Here the brand list in writing is most important.", hi: "आप दूर रहते हैं या समय कम है। यहां लिखित ब्रांड सूची सबसे ज़रूरी है।" },
  },
  {
    h: { en: "Item-rate", hi: "आइटम-रेट" },
    d: { en: "Every item has an agreed rate and is paid for as it is measured.", hi: "हर आइटम का तय रेट होता है और नापकर भुगतान होता है।" },
    when: { en: "Most transparent. Works best with an item-wise BOQ.", hi: "सबसे पारदर्शी। आइटम-वार BOQ के साथ सबसे अच्छा।" },
  },
];

export const CLAUSES: Clause[] = [
  {
    h: { en: "A. Parties and property", hi: "A. पक्ष और संपत्ति" },
    items: [
      { en: "Full names, addresses, PAN and phone of the owner and the contractor (and the firm's name and registration if any).", hi: "मालिक और ठेकेदार के पूरे नाम, पते, PAN और फ़ोन (और फ़र्म का नाम और पंजीकरण, अगर हो)।" },
      { en: "Plot address, plot or khasra number and area.", hi: "प्लॉट का पता, प्लॉट या खसरा नंबर और क्षेत्रफल।" },
      { en: "Date and place of signing.", hi: "हस्ताक्षर की तारीख़ और जगह।" },
    ],
  },
  {
    h: { en: "B. Scope of work", hi: "B. काम का दायरा" },
    items: [
      { en: "The approved plan, number of floors and built-up area.", hi: "मंज़ूर नक्शा, मंज़िलों की संख्या और बिल्ट-अप एरिया।" },
      { en: "What is included, from excavation to the last coat of paint, or only the structure.", hi: "क्या शामिल है, खुदाई से पेंट के आख़िरी कोट तक, या सिर्फ़ ढांचा।" },
      { en: "What is not included, in plain words: boundary wall, borewell, septic tank, false ceiling, modular kitchen, fittings, the front elevation work.", hi: "क्या शामिल नहीं है, साफ़ शब्दों में: बाउंड्री वॉल, बोरवेल, सेप्टिक टैंक, फ़ॉल्स सीलिंग, मॉड्यूलर किचन, फ़िटिंग, फ़्रंट एलिवेशन का काम।" },
      { en: "Annexures attached: approved plan, structural drawing, BOQ or rate sheet and the material specification list.", hi: "संलग्न अनुलग्नक: मंज़ूर नक्शा, स्ट्रक्चरल ड्रॉइंग, BOQ या रेट शीट और सामान की स्पेसिफ़िकेशन सूची।" },
    ],
  },
  {
    h: { en: "C. Price and rates", hi: "C. कीमत और रेट" },
    items: [
      { en: "Total amount, per sq ft rate or item-wise rates.", hi: "कुल रकम, प्रति sq ft रेट या आइटम-वार रेट।" },
      { en: "How the area is measured for a per sq ft rate (built-up or carpet, whether balcony and parking are counted).", hi: "प्रति sq ft रेट में क्षेत्रफल कैसे नापा जाएगा (बिल्ट-अप या कारपेट, बालकनी और पार्किंग गिनी जाएंगी या नहीं)।" },
      { en: "GST: included or extra, and at what rate.", hi: "GST: शामिल या अलग, और किस दर पर।" },
      { en: "Rates for extra work agreed in advance, such as extra depth of excavation or rock.", hi: "अतिरिक्त काम के रेट पहले से तय, जैसे ज़्यादा गहरी खुदाई या चट्टान।" },
      { en: "Whether the rate is fixed or can change if steel and cement prices rise, and by what formula.", hi: "रेट तय रहेगा या सरिया और सीमेंट महंगा होने पर बदलेगा, और किस फ़ॉर्मूले से।" },
    ],
  },
  {
    h: { en: "D. Payment schedule", hi: "D. भुगतान की समय-सारणी" },
    items: [
      { en: "Link every payment to a stage of the work, not to a date.", hi: "हर भुगतान को काम के चरण से जोड़ें, तारीख़ से नहीं।" },
      { en: "Pay by cheque or bank transfer and take a written receipt each time. Never pay in cash without a receipt.", hi: "चेक या बैंक ट्रांसफ़र से भुगतान करें और हर बार लिखित रसीद लें। बिना रसीद नक़द कभी न दें।" },
      { en: "Never pay for work ahead of the stage reached.", hi: "पहुंचे हुए चरण से आगे के काम का भुगतान कभी न करें।" },
      { en: "Hold back a retention until the defect period ends.", hi: "डिफ़ेक्ट अवधि ख़त्म होने तक रिटेंशन रोकें।" },
    ],
  },
  {
    h: { en: "E. Material", hi: "E. सामान" },
    items: [
      { en: "A written list of brand and grade: cement (OPC 53 or PPC), steel (Fe500D and make), bricks or AAC blocks, sand, tiles, pipes, wires, paint.", hi: "ब्रांड और ग्रेड की लिखित सूची: सीमेंट (OPC 53 या PPC), सरिया (Fe500D और कंपनी), ईंट या AAC ब्लॉक, रेत, टाइल, पाइप, तार, पेंट।" },
      { en: "Watch the words \"or equivalent\". They are the usual door for swapping a brand.", hi: "\"या समकक्ष\" शब्द पर ध्यान दें। ब्रांड बदलने का यही आम रास्ता है।" },
      { en: "Your right to see and approve samples, and to reject poor material.", hi: "सैंपल देखने और मंज़ूर करने, और ख़राब सामान लौटाने का आपका हक़।" },
      { en: "Material tests (steel, concrete cubes) and who pays for them.", hi: "सामान की जांच (सरिया, कंक्रीट क्यूब) और उसका ख़र्च कौन देगा।" },
    ],
  },
  {
    h: { en: "F. Time", hi: "F. समय" },
    items: [
      { en: "Start date, completion date and milestone dates.", hi: "शुरू होने की तारीख़, पूरा होने की तारीख़ और बीच के पड़ावों की तारीख़ें।" },
      { en: "A penalty for delay, as a fixed amount or a percent per week.", hi: "देरी का जुर्माना, तय रकम या प्रति सप्ताह प्रतिशत।" },
      { en: "Which delays are excused: heavy rain, late payment or drawings from the owner, government orders.", hi: "कौन सी देरी माफ़ है: भारी बारिश, मालिक की तरफ़ से देर से भुगतान या ड्रॉइंग, सरकारी आदेश।" },
    ],
  },
  {
    h: { en: "G. Quality and inspection", hi: "G. क्वालिटी और जांच" },
    items: [
      { en: "The work follows the relevant IS codes and the approved drawings.", hi: "काम संबंधित IS कोड और मंज़ूर ड्रॉइंग के अनुसार होगा।" },
      { en: "Hold points where work cannot go on without your engineer's written approval: foundation steel, every slab and beam steel before pouring, waterproofing, and pipes and conduits before covering.", hi: "होल्ड पॉइंट जहां इंजीनियर की लिखित मंज़ूरी के बिना काम आगे नहीं बढ़ेगा: नींव का सरिया, हर स्लैब और बीम का सरिया ढलाई से पहले, वॉटरप्रूफिंग, और पाइप और कंड्यूट ढकने से पहले।" },
      { en: "Name of the site engineer or supervisor, and a daily progress register.", hi: "साइट इंजीनियर या सुपरवाइज़र का नाम, और रोज़ की प्रगति का रजिस्टर।" },
      { en: "Faulty work is broken and redone at the contractor's cost.", hi: "ख़राब काम तोड़कर ठेकेदार के ख़र्च पर दोबारा होगा।" },
    ],
  },
  {
    h: { en: "H. Changes and extra work", hi: "H. बदलाव और अतिरिक्त काम" },
    items: [
      { en: "Every change in writing, with its rate and effect on time, signed by both before the work starts.", hi: "हर बदलाव लिखित में, उसके रेट और समय पर असर के साथ, काम शुरू होने से पहले दोनों के हस्ताक्षर से।" },
      { en: "No verbal \"do it now, we will settle later\".", hi: "ज़बानी \"अभी कर दो, बाद में हिसाब कर लेंगे\" नहीं।" },
    ],
  },
  {
    h: { en: "I. Site, workers and safety", hi: "I. साइट, मज़दूर और सुरक्षा" },
    items: [
      { en: "The contractor is responsible for workers' wages, accidents, insurance and labour laws.", hi: "मज़दूरों की मज़दूरी, दुर्घटना, बीमा और श्रम क़ानूनों की ज़िम्मेदारी ठेकेदार की।" },
      { en: "Safety on site: scaffolding, nets, helmets.", hi: "साइट की सुरक्षा: परछत्ती (scaffolding), जाली, हेलमेट।" },
      { en: "Who pays for water and electricity, and who clears the debris.", hi: "पानी और बिजली का ख़र्च कौन देगा, और मलबा कौन हटाएगा।" },
      { en: "Damage to the neighbour's wall or property is the contractor's cost.", hi: "पड़ोसी की दीवार या संपत्ति को नुक़सान का ख़र्च ठेकेदार का।" },
      { en: "No sub-contracting without your written permission.", hi: "आपकी लिखित अनुमति के बिना आगे ठेका नहीं।" },
    ],
  },
  {
    h: { en: "J. Defect period and warranty", hi: "J. डिफ़ेक्ट अवधि और वारंटी" },
    items: [
      { en: "A defect liability period of about 12 months after completion, in which visible defects (cracks, seepage, lifting tiles) are fixed at the contractor's cost.", hi: "पूरा होने के बाद लगभग 12 महीने की डिफ़ेक्ट लायबिलिटी अवधि, जिसमें दिखने वाली कमियां (दरार, सीलन, उखड़ती टाइल) ठेकेदार के ख़र्च पर ठीक होंगी।" },
      { en: "A separate written warranty for waterproofing, with the number of years.", hi: "वॉटरप्रूफिंग की अलग लिखित वारंटी, कितने साल की।" },
    ],
  },
  {
    h: { en: "K. Ending the agreement", hi: "K. एग्रीमेंट ख़त्म करना" },
    items: [
      { en: "When each side can end it: work stopped, poor quality, payment not made.", hi: "कब कोई भी पक्ष इसे ख़त्म कर सकता है: काम रुकना, ख़राब गुणवत्ता, भुगतान न होना।" },
      { en: "The notice period, and how the work done so far is measured and paid.", hi: "नोटिस की अवधि, और अब तक का काम कैसे नापा और चुकाया जाएगा।" },
      { en: "Your right to appoint another contractor to finish.", hi: "बाक़ी काम के लिए दूसरा ठेकेदार लगाने का आपका हक़।" },
    ],
  },
  {
    h: { en: "L. Disputes", hi: "L. विवाद" },
    items: [
      { en: "First talks, then mediation or arbitration, and the city whose courts have jurisdiction.", hi: "पहले बातचीत, फिर मध्यस्थता या आर्बिट्रेशन, और किस शहर की अदालत का अधिकार क्षेत्र होगा।" },
    ],
  },
  {
    h: { en: "M. Handover and signing", hi: "M. हैंडओवर और हस्ताक्षर" },
    items: [
      { en: "The method of handover: snag list, final measurement, final bill, drawings and warranties.", hi: "हैंडओवर का तरीक़ा: कमियों की सूची, आख़िरी नाप, आख़िरी बिल, ड्रॉइंग और वारंटी।" },
      { en: "Stamp paper as your state requires, two witnesses, and both parties' signature or initial on every page.", hi: "आपके राज्य की ज़रूरत के अनुसार स्टांप पेपर, दो गवाह, और दोनों पक्षों के हर पेज पर हस्ताक्षर या इनिशियल।" },
    ],
  },
];

/** Example only: a stage-linked payment plan for a G+1 house. */
export const PAYMENT_EXAMPLE: { stage: T; pct: number }[] = [
  { stage: { en: "On signing the agreement (advance)", hi: "एग्रीमेंट पर हस्ताक्षर (एडवांस)" }, pct: 10 },
  { stage: { en: "Foundation and plinth complete", hi: "नींव और प्लिंथ पूरी" }, pct: 15 },
  { stage: { en: "Ground floor slab cast", hi: "ग्राउंड फ़्लोर स्लैब ढल गई" }, pct: 20 },
  { stage: { en: "First floor slab cast", hi: "पहली मंज़िल की स्लैब ढल गई" }, pct: 20 },
  { stage: { en: "Brickwork and plaster complete", hi: "चिनाई और प्लास्टर पूरा" }, pct: 15 },
  { stage: { en: "Flooring, doors, windows, plumbing and electrical", hi: "फ़्लोरिंग, दरवाज़े, खिड़कियां, प्लंबिंग और बिजली" }, pct: 10 },
  { stage: { en: "Painting and finishing", hi: "पेंटिंग और फ़िनिशिंग" }, pct: 5 },
  { stage: { en: "Retention, after the defect period", hi: "रिटेंशन, डिफ़ेक्ट अवधि के बाद" }, pct: 5 },
];

export const RED_FLAGS: T[] = [
  { en: "\"Everything is included\" with no written scope.", hi: "\"सब कुछ शामिल है\" पर लिखित दायरा कोई नहीं।" },
  { en: "\"Good company material\" instead of a named brand.", hi: "नाम के ब्रांड की जगह \"अच्छी कंपनी का माल\"।" },
  { en: "Pressure to start work without a written agreement.", hi: "लिखित एग्रीमेंट के बिना काम शुरू करने का दबाव।" },
  { en: "A large advance, or \"pay first, drawings later\".", hi: "बड़ा एडवांस, या \"पहले पैसा, ड्रॉइंग बाद में\"।" },
  { en: "Asking for cash only, with no receipt.", hi: "सिर्फ़ नक़द मांगना, रसीद नहीं।" },
  { en: "No rates fixed for extra work.", hi: "अतिरिक्त काम के रेट तय नहीं।" },
  { en: "No delay penalty and no retention.", hi: "देरी का जुर्माना नहीं और रिटेंशन नहीं।" },
];

export const AGREEMENT_FAQS: Faq[] = [
  {
    q: { en: "Is a written contractor agreement necessary for building a house?", hi: "क्या घर बनाने के लिए ठेकेदार का लिखित एग्रीमेंट ज़रूरी है?" },
    a: {
      en: "Yes. A written agreement that lists the scope, the rate, the payment stages, the brands, the time and the penalty is the single best protection an owner has. A verbal promise cannot be proved if there is a dispute.",
      hi: "हां। जिस लिखित एग्रीमेंट में काम का दायरा, रेट, भुगतान के चरण, ब्रांड, समय और जुर्माना हो, वह मालिक की सबसे अच्छी सुरक्षा है। विवाद होने पर ज़बानी वादा साबित नहीं होता।",
    },
  },
  {
    q: { en: "How should payments to a house contractor be made?", hi: "ठेकेदार को भुगतान कैसे करना चाहिए?" },
    a: {
      en: "Link payments to stages of work such as foundation, each slab and plaster, and pay by cheque or bank transfer with a receipt. Keep about 5 percent as retention until the defect period ends. Never pay far ahead of the work done.",
      hi: "भुगतान काम के चरणों से जोड़ें, जैसे नींव, हर स्लैब और प्लास्टर, और चेक या बैंक ट्रांसफ़र से रसीद के साथ दें। डिफ़ेक्ट अवधि ख़त्म होने तक लगभग 5 प्रतिशत रिटेंशन रखें। हुए काम से बहुत आगे का भुगतान कभी न करें।",
    },
  },
  {
    q: { en: "Do I need stamp paper for a contractor agreement?", hi: "क्या ठेकेदार एग्रीमेंट के लिए स्टांप पेपर चाहिए?" },
    a: {
      en: "The stamp duty on such agreements depends on the state and the amount, so ask a local lawyer or the sub-registrar office. Having it printed on the right stamp paper and signed before witnesses makes it much easier to rely on.",
      hi: "ऐसे एग्रीमेंट पर स्टांप ड्यूटी राज्य और रकम पर निर्भर है, इसलिए स्थानीय वकील या सब-रजिस्ट्रार दफ़्तर से पूछें। सही स्टांप पेपर पर छपवाकर गवाहों के सामने हस्ताक्षर करने से उस पर भरोसा करना बहुत आसान हो जाता है।",
    },
  },
];

/** Sample agreement: the short form with blanks, printed or copied by the owner. */
export const SAMPLE_PARTS: { h: T; text: T }[] = [
  {
    h: { en: "1. Parties", hi: "1. पक्ष" },
    text: {
      en: "This agreement is made on ____ / ____ / ________ at ______________ between Mr/Ms ____________________ (Owner), address ____________________________, PAN ______________, and Mr/Ms ____________________ / M/s ____________________ (Contractor), address ____________________________, PAN ______________.",
      hi: "यह एग्रीमेंट ____ / ____ / ________ को ______________ में श्री/श्रीमती ____________________ (मालिक), पता ____________________________, PAN ______________, और श्री/श्रीमती ____________________ / M/s ____________________ (ठेकेदार), पता ____________________________, PAN ______________ के बीच किया गया है।",
    },
  },
  {
    h: { en: "2. The work", hi: "2. काम" },
    text: {
      en: "The Contractor will construct a ____ floor house of about ______ sq ft built-up area on Plot / Khasra No. ______ at ______________________, as per the approved plan no. ______ dated ____________ and the structural drawing attached as Annexure A. The scope is: ☐ labour only ☐ material and labour. The following are not included: ____________________________.",
      hi: "ठेकेदार प्लॉट / खसरा नंबर ______ पर, ______________________ में, मंज़ूर नक्शा नं. ______ दिनांक ____________ और अनुलग्नक A में लगी स्ट्रक्चरल ड्रॉइंग के अनुसार लगभग ______ sq ft बिल्ट-अप क्षेत्रफल का ____ मंज़िला घर बनाएगा। काम का दायरा: ☐ सिर्फ़ मज़दूरी ☐ सामान और मज़दूरी। ये शामिल नहीं हैं: ____________________________।",
    },
  },
  {
    h: { en: "3. Price", hi: "3. कीमत" },
    text: {
      en: "The Owner will pay ₹ ____________ in total / ₹ ______ per sq ft measured as ______________ / at the item rates in Annexure B. GST is ☐ included ☐ extra at ____ %. Extra work will be done only on a written order that states its rate and effect on time.",
      hi: "मालिक कुल ₹ ____________ / प्रति sq ft ₹ ______ (नाप का तरीक़ा ______________) / अनुलग्नक B के आइटम रेट पर भुगतान करेगा। GST ☐ शामिल ☐ अलग, ____ % पर। अतिरिक्त काम सिर्फ़ ऐसे लिखित आदेश पर होगा जिसमें उसका रेट और समय पर असर लिखा हो।",
    },
  },
  {
    h: { en: "4. Payments", hi: "4. भुगतान" },
    text: {
      en: "Payment will be made by cheque or bank transfer against a receipt, at these stages: advance ____ %; foundation and plinth ____ %; ground floor slab ____ %; first floor slab ____ %; brickwork and plaster ____ %; flooring, doors, plumbing and electrical ____ %; painting and finishing ____ %. The Owner will hold back ____ % as retention until the defect period ends.",
      hi: "भुगतान रसीद के बदले चेक या बैंक ट्रांसफ़र से इन चरणों पर होगा: एडवांस ____ %; नींव और प्लिंथ ____ %; ग्राउंड फ़्लोर स्लैब ____ %; पहली मंज़िल की स्लैब ____ %; चिनाई और प्लास्टर ____ %; फ़्लोरिंग, दरवाज़े, प्लंबिंग और बिजली ____ %; पेंटिंग और फ़िनिशिंग ____ %। मालिक डिफ़ेक्ट अवधि ख़त्म होने तक ____ % रिटेंशन रोकेगा।",
    },
  },
  {
    h: { en: "5. Material", hi: "5. सामान" },
    text: {
      en: "The Contractor will use only the brands and grades in Annexure C (cement ____________, steel ____________ Fe500D, bricks / blocks ____________, tiles ____________, pipes ____________, wires ____________, paint ____________). The Owner may inspect and reject material, and require tests of steel and concrete cubes at the Contractor's cost.",
      hi: "ठेकेदार सिर्फ़ अनुलग्नक C में दिए ब्रांड और ग्रेड इस्तेमाल करेगा (सीमेंट ____________, सरिया ____________ Fe500D, ईंट / ब्लॉक ____________, टाइल ____________, पाइप ____________, तार ____________, पेंट ____________)। मालिक सामान की जांच और अस्वीकृति कर सकता है, और सरिया और कंक्रीट क्यूब की जांच ठेकेदार के ख़र्च पर करवा सकता है।",
    },
  },
  {
    h: { en: "6. Time and delay", hi: "6. समय और देरी" },
    text: {
      en: "Work starts on ____ / ____ / ________ and will be complete by ____ / ____ / ________. For delay not caused by the Owner, heavy rain or government orders, the Contractor will pay ₹ ________ for every week of delay.",
      hi: "काम ____ / ____ / ________ को शुरू होगा और ____ / ____ / ________ तक पूरा होगा। मालिक, भारी बारिश या सरकारी आदेश के कारण न हुई देरी पर ठेकेदार हर हफ़्ते की देरी के लिए ₹ ________ देगा।",
    },
  },
  {
    h: { en: "7. Quality and inspection", hi: "7. क्वालिटी और जांच" },
    text: {
      en: "The work will follow the relevant IS codes and the approved drawings. The Contractor will not pour concrete in the foundation, any column, beam or slab, and will not cover any waterproofing, pipe or conduit, until the Owner's engineer, Mr/Ms ____________, has approved it in writing. Faulty work will be redone at the Contractor's cost.",
      hi: "काम संबंधित IS कोड और मंज़ूर ड्रॉइंग के अनुसार होगा। ठेकेदार नींव, किसी भी कॉलम, बीम या स्लैब में कंक्रीट नहीं डालेगा, और किसी वॉटरप्रूफिंग, पाइप या कंड्यूट को नहीं ढकेगा, जब तक मालिक के इंजीनियर श्री/श्रीमती ____________ उसे लिखित में मंज़ूर न कर दें। ख़राब काम ठेकेदार के ख़र्च पर दोबारा होगा।",
    },
  },
  {
    h: { en: "8. Workers, safety and site", hi: "8. मज़दूर, सुरक्षा और साइट" },
    text: {
      en: "The Contractor is responsible for the wages, safety, insurance and compliance with labour laws for all workers, and for any damage to neighbouring property caused by the work. Water and electricity will be paid by ____________. The Contractor will not sub-contract without the Owner's written permission.",
      hi: "सभी मज़दूरों की मज़दूरी, सुरक्षा, बीमा और श्रम क़ानूनों के पालन, और काम से पड़ोसी संपत्ति को हुए किसी भी नुक़सान की ज़िम्मेदारी ठेकेदार की होगी। पानी और बिजली का ख़र्च ____________ देगा। मालिक की लिखित अनुमति के बिना ठेकेदार आगे ठेका नहीं देगा।",
    },
  },
  {
    h: { en: "9. Defect period and warranty", hi: "9. डिफ़ेक्ट अवधि और वारंटी" },
    text: {
      en: "For ____ months after handover, the Contractor will fix any defect in the work at his own cost within ____ days of notice. Waterproofing carries a written warranty of ____ years.",
      hi: "हैंडओवर के बाद ____ महीने तक ठेकेदार काम की किसी भी कमी को नोटिस के ____ दिन के भीतर अपने ख़र्च पर ठीक करेगा। वॉटरप्रूफिंग की ____ साल की लिखित वारंटी होगी।",
    },
  },
  {
    h: { en: "10. Ending the agreement and disputes", hi: "10. एग्रीमेंट ख़त्म करना और विवाद" },
    text: {
      en: "Either party may end this agreement by ____ days' written notice if the other fails to keep it, and the work done so far will be measured and paid. Any dispute will first be discussed, then referred to ☐ mediation ☐ arbitration at ______________, and the courts of ______________ will have jurisdiction.",
      hi: "यदि दूसरा पक्ष इसका पालन न करे तो कोई भी पक्ष ____ दिन के लिखित नोटिस पर इसे ख़त्म कर सकता है, और अब तक का काम नापकर चुकाया जाएगा। कोई भी विवाद पहले बातचीत से, फिर ☐ मध्यस्थता ☐ आर्बिट्रेशन में ______________ में निपटाया जाएगा, और ______________ की अदालतों का अधिकार क्षेत्र होगा।",
    },
  },
];

export const SAMPLE_SIGN: { en: string; hi: string } = {
  en: "Owner signature and date ______________      Contractor signature and date ______________      Witness 1 ______________      Witness 2 ______________",
  hi: "मालिक के हस्ताक्षर और तारीख़ ______________      ठेकेदार के हस्ताक्षर और तारीख़ ______________      गवाह 1 ______________      गवाह 2 ______________",
};

/* ------------------------------------------------------------------ pages */

export const AGREEMENT_SLUG = "contractor-agreement-format";
export const SAMPLE_SLUG = "contractor-agreement-sample";

export const AGREEMENT_PAGE = {
  title: {
    en: "Contractor agreement format for house construction: every clause explained",
    hi: "घर बनाने के ठेकेदार एग्रीमेंट का फ़ॉर्मेट: हर क्लॉज़ समझाया हुआ",
  },
  metaTitle: {
    en: "Contractor Agreement Format for House Construction (India)",
    hi: "घर निर्माण के लिए ठेकेदार एग्रीमेंट फ़ॉर्मेट (भारत)",
  },
  description: {
    en: "What a house construction contractor agreement should contain: scope, rates, stage-wise payment, material brands, time, penalty, quality hold points, warranty and termination. With a payment example and red flags.",
    hi: "घर निर्माण के ठेकेदार एग्रीमेंट में क्या होना चाहिए: काम का दायरा, रेट, स्टेज-वार भुगतान, सामान के ब्रांड, समय, जुर्माना, क्वालिटी होल्ड पॉइंट, वारंटी और समाप्ति। भुगतान के उदाहरण और चेतावनी संकेतों के साथ।",
  },
  disclaimer: {
    en: "This is a checklist to help owners, not legal advice. Have the final agreement read by a local lawyer, and follow your state's stamp duty and registration rules.",
    hi: "यह मालिकों की मदद के लिए चेकलिस्ट है, क़ानूनी सलाह नहीं। अंतिम एग्रीमेंट किसी स्थानीय वकील से पढ़वाएं, और अपने राज्य के स्टांप ड्यूटी और रजिस्ट्रेशन के नियम मानें।",
  },
};

export const SAMPLE_PAGE = {
  title: {
    en: "Sample house construction agreement with a contractor (fill in the blanks)",
    hi: "ठेकेदार के साथ घर निर्माण का सैंपल एग्रीमेंट (ख़ाली जगह भरें)",
  },
  metaTitle: {
    en: "Sample House Construction Agreement with Contractor (Printable)",
    hi: "ठेकेदार के साथ घर निर्माण का सैंपल एग्रीमेंट (प्रिंट करने योग्य)",
  },
  description: {
    en: "A short, plain sample agreement between a house owner and a contractor with blanks to fill: scope, price, stage payments, material, time, quality, warranty and disputes. Print it or save it as a PDF.",
    hi: "घर मालिक और ठेकेदार के बीच छोटा, सरल सैंपल एग्रीमेंट, भरने के लिए ख़ाली जगहों के साथ: काम, कीमत, स्टेज भुगतान, सामान, समय, क्वालिटी, वारंटी और विवाद। प्रिंट करें या PDF में सेव करें।",
  },
};

/** Slugs that are not stages but still live under the guide. */
export const JOURNEY_SLUGS = [...STAGES.map((s) => s.slug), AGREEMENT_SLUG, SAMPLE_SLUG];
export const isJourneySlug = (s: string) => JOURNEY_SLUGS.includes(s);
