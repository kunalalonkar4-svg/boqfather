import type { Lang } from "@/lib/site";

export type CalcSlug =
  | "house-construction-cost-calculator"
  | "concrete-calculator"
  | "brick-calculator"
  | "plaster-calculator"
  | "steel-calculator"
  | "tile-calculator"
  | "paint-calculator"
  | "excavation-calculator"
  | "construction-unit-converter"
  | "house-boq-estimate"
  | "contractor-quote-checker";

interface Copy {
  name: string;
  short: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  faqs: { q: string; a: string }[];
}

export interface CalcInfo {
  slug: CalcSlug;
  mark: string;
  related: CalcSlug[];
  en: Copy;
  hi: Copy;
}

export const CALCULATORS: CalcInfo[] = [
  {
    slug: "house-construction-cost-calculator",
    mark: "₹",
    related: [
      "house-boq-estimate",
      "contractor-quote-checker",
      "steel-calculator",
    ],
    en: {
      name: "House Construction Cost",
      short: "Total cost, materials, stages",
      h1: "House Construction Cost Calculator",
      metaTitle:
        "House Construction Cost Calculator India 2026 – Cost per sqft, Materials | Guniyo",
      metaDescription:
        "Calculate house construction cost in India from built-up area, floors, city and quality. Get cement, steel, sand, bricks, stage-wise cost, payment schedule and a PDF report.",
      intro:
        "Enter the built-up area, floors, location and quality. You get the total cost, cost per sqft, material quantities by thumb rule, cost by construction stage and a suggested payment schedule.",
      faqs: [
        {
          q: "What is the construction cost per sqft in India in 2026?",
          a: "For an RCC framed house it is roughly ₹1,400–1,550 per sqft for basic quality, ₹1,600–1,800 for standard and ₹2,300+ for premium in a tier-2 city, higher in metros. A single-storey house costs about 8–10% more per sqft than G+1 because the foundation and roof are shared by less area. Use the rate box to enter your local rate.",
        },
        {
          q: "How much cement and steel does a 1000 sqft house need?",
          a: "By thumb rule about 400 bags of cement (0.4 bag/sqft) and 3.5–4.5 tonnes of steel (about 4 kg/sqft) for 1000 sqft of built-up area.",
        },
        {
          q: "How accurate is this estimate?",
          a: "It is an area-based estimate, usually within ±10%. For an item-wise BOQ with measurement book you need the plan, which is what the Detailed Estimate does.",
        },
        {
          q: "What is not included?",
          a: "Land, approvals and fees, interiors, furniture, modular kitchen, compound wall, borewell and water tank are not included.",
        },
      ],
    },
    hi: {
      name: "घर निर्माण का खर्च",
      short: "कुल खर्च, सामग्री, चरण",
      h1: "घर बनाने का खर्च कैलकुलेटर",
      metaTitle:
        "घर बनाने का खर्च कैलकुलेटर 2026 – प्रति sqft रेट, सीमेंट, सरिया | Guniyo",
      metaDescription:
        "एरिया, मंज़िल, शहर और क्वालिटी डालकर घर बनाने का कुल खर्च निकालें। सीमेंट, सरिया, रेत, ईंट, चरण अनुसार खर्च, भुगतान शेड्यूल और PDF रिपोर्ट।",
      intro:
        "बिल्ट-अप एरिया, मंज़िलें, जगह और क्वालिटी डालें। आपको कुल खर्च, प्रति sqft रेट, थंब रूल से सामग्री, हर चरण का खर्च और भुगतान का शेड्यूल मिलेगा।",
      faqs: [
        {
          q: "2026 में घर बनाने का प्रति sqft खर्च कितना है?",
          a: "RCC फ्रेम वाले घर के लिए टियर-2 शहर में बेसिक क्वालिटी में लगभग ₹1,400–1,550, स्टैंडर्ड में ₹1,600–1,800 और प्रीमियम में ₹2,300+ प्रति sqft, मेट्रो में ज़्यादा। सिर्फ़ ग्राउंड फ़्लोर वाला घर G+1 से प्रति sqft 8–10% महंगा पड़ता है क्योंकि नींव और छत का खर्च कम एरिया पर बंटता है। रेट बॉक्स में अपना लोकल रेट डाल सकते हैं।",
        },
        {
          q: "1000 sqft घर में कितना सीमेंट और सरिया लगेगा?",
          a: "थंब रूल से 1000 sqft बिल्ट-अप के लिए लगभग 400 बोरी सीमेंट (0.4 बोरी/sqft) और 3.5–4.5 टन सरिया (लगभग 4 किलो/sqft)।",
        },
        {
          q: "यह अनुमान कितना सही है?",
          a: "यह एरिया पर आधारित अनुमान है, आमतौर पर ±10% के अंदर। मेज़रमेंट बुक के साथ आइटम-वार BOQ के लिए नक्शा चाहिए, जो विस्तृत एस्टिमेट करेगा।",
        },
        {
          q: "इसमें क्या शामिल नहीं है?",
          a: "ज़मीन, नक्शा पास और फ़ीस, इंटीरियर, फ़र्नीचर, मॉड्यूलर किचन, बाउंड्री वॉल, बोरवेल और पानी की टंकी शामिल नहीं हैं।",
        },
      ],
    },
  },
  {
    slug: "concrete-calculator",
    mark: "C",
    related: [
      "steel-calculator",
      "construction-unit-converter",
      "excavation-calculator",
    ],
    en: {
      name: "Concrete (PCC / RCC)",
      short: "Cement, sand, aggregate",
      h1: "Concrete Calculator – Cement, Sand and Aggregate",
      metaTitle:
        "Concrete Calculator – Cement, Sand, Aggregate for M20, M15, M10 | Guniyo",
      metaDescription:
        "Find cement bags, sand and aggregate for M5 to M25 concrete. Enter slab, beam, column or footing size in metre or feet. Step-by-step working with the 1.54 dry volume factor.",
      intro:
        "Enter the size of the slab, beam, column or footing and choose the mix. The calculator applies the 1.54 dry volume factor and shows cement bags, sand and aggregate in m³ and cft.",
      faqs: [
        {
          q: "How many cement bags are needed for 1 m³ of M20 concrete?",
          a: "About 8.06 bags for nominal mix M20 (1:1.5:3): dry volume 1.54 m³ × 1/5.5 = 0.28 m³ of cement ÷ 0.0347 m³ per bag.",
        },
        {
          q: "Why multiply by 1.54?",
          a: "Dry materials shrink when water is added and voids fill up. 1.54 converts wet concrete volume to the dry volume of materials.",
        },
        {
          q: "What mix is used for PCC and for RCC?",
          a: "PCC below footings and floors is usually M7.5 (1:4:8) or M10 (1:3:6). RCC slabs, beams and columns in houses are usually M20 or higher, as per the structural design.",
        },
      ],
    },
    hi: {
      name: "कंक्रीट (PCC / RCC)",
      short: "सीमेंट, रेत, गिट्टी",
      h1: "कंक्रीट कैलकुलेटर – सीमेंट, रेत और गिट्टी",
      metaTitle:
        "कंक्रीट कैलकुलेटर – M20, M15 में सीमेंट, रेत, गिट्टी कितनी लगेगी | Guniyo",
      metaDescription:
        "M5 से M25 कंक्रीट के लिए सीमेंट की बोरी, रेत और गिट्टी निकालें। स्लैब, बीम, कॉलम या फुटिंग का साइज़ मीटर या फ़ीट में डालें। 1.54 ड्राई वॉल्यूम के साथ पूरी गणना।",
      intro:
        "स्लैब, बीम, कॉलम या फुटिंग का साइज़ डालें और मिक्स चुनें। कैलकुलेटर 1.54 ड्राई वॉल्यूम फ़ैक्टर लगाकर सीमेंट की बोरी, रेत और गिट्टी m³ और cft में बताता है।",
      faqs: [
        {
          q: "1 m³ M20 कंक्रीट में कितनी बोरी सीमेंट लगती है?",
          a: "नॉमिनल मिक्स M20 (1:1.5:3) में लगभग 8.06 बोरी: ड्राई वॉल्यूम 1.54 m³ × 1/5.5 = 0.28 m³ सीमेंट ÷ 0.0347 m³ प्रति बोरी।",
        },
        {
          q: "1.54 से गुणा क्यों करते हैं?",
          a: "पानी मिलाने पर सूखा माल बैठ जाता है और खाली जगह भर जाती है। 1.54 गीले कंक्रीट को सूखे माल के आयतन में बदलता है।",
        },
        {
          q: "PCC और RCC में कौन सा मिक्स लगता है?",
          a: "फुटिंग और फ़र्श के नीचे PCC आमतौर पर M7.5 (1:4:8) या M10 (1:3:6)। घर के स्लैब, बीम, कॉलम आमतौर पर M20 या ज़्यादा, स्ट्रक्चरल डिज़ाइन के अनुसार।",
        },
      ],
    },
  },
  {
    slug: "brick-calculator",
    mark: "B",
    related: [
      "plaster-calculator",
      "house-construction-cost-calculator",
      "paint-calculator",
    ],
    en: {
      name: "Brickwork",
      short: "Bricks, cement, sand",
      h1: "Brick Calculator – Bricks, Cement and Sand for a Wall",
      metaTitle:
        "Brick Calculator – How Many Bricks in a Wall, Cement & Sand for Brickwork | Guniyo",
      metaDescription:
        "Calculate the number of bricks, cement bags and sand for 9 inch (230 mm) or 4.5 inch (115 mm) walls. Deduct doors and windows. Modular, traditional and fly ash bricks.",
      intro:
        "Enter wall length, height and thickness, deduct doors and windows, and pick the brick size and mortar mix. You get bricks (with breakage), mortar, cement bags and sand.",
      faqs: [
        {
          q: "How many bricks are in 1 m³ of brickwork?",
          a: "About 500 modular bricks (190 × 90 × 90 mm) with 10 mm joints, before breakage.",
        },
        {
          q: "How much cement is needed for 1 m³ of brickwork in 1:6?",
          a: "About 1.26 bags of cement and 0.26 m³ of sand, using a dry mortar factor of 1.33.",
        },
        {
          q: "Should openings be deducted?",
          a: "Yes. As per IS 1200, openings larger than 0.1 m² are deducted from brickwork.",
        },
      ],
    },
    hi: {
      name: "ईंट की चिनाई",
      short: "ईंट, सीमेंट, रेत",
      h1: "ईंट कैलकुलेटर – दीवार में ईंट, सीमेंट और रेत",
      metaTitle:
        "ईंट कैलकुलेटर – दीवार में कितनी ईंट लगेगी, सीमेंट और रेत | Guniyo",
      metaDescription:
        "9 इंच (230 mm) या 4.5 इंच (115 mm) दीवार में ईंट, सीमेंट की बोरी और रेत निकालें। दरवाज़े-खिड़की घटाएं। मॉड्यूलर, देसी और फ्लाई ऐश ईंट।",
      intro:
        "दीवार की लंबाई, ऊंचाई और मोटाई डालें, दरवाज़े-खिड़की घटाएं, ईंट का साइज़ और मसाला अनुपात चुनें। आपको ईंट (टूट-फूट सहित), मसाला, सीमेंट की बोरी और रेत मिलेगी।",
      faqs: [
        {
          q: "1 m³ चिनाई में कितनी ईंट लगती है?",
          a: "10 mm जोड़ के साथ लगभग 500 मॉड्यूलर ईंट (190 × 90 × 90 mm), टूट-फूट से पहले।",
        },
        {
          q: "1:6 में 1 m³ चिनाई में कितना सीमेंट लगेगा?",
          a: "1.33 ड्राई फ़ैक्टर से लगभग 1.26 बोरी सीमेंट और 0.26 m³ रेत।",
        },
        {
          q: "क्या दरवाज़े-खिड़की घटाने चाहिए?",
          a: "हां। IS 1200 के अनुसार 0.1 m² से बड़े खुले हिस्से चिनाई से घटाए जाते हैं।",
        },
      ],
    },
  },
  {
    slug: "plaster-calculator",
    mark: "P",
    related: ["brick-calculator", "paint-calculator", "tile-calculator"],
    en: {
      name: "Plaster",
      short: "Cement and sand for plaster",
      h1: "Plaster Calculator – Cement and Sand for Wall Plaster",
      metaTitle:
        "Plaster Calculator – Cement & Sand for 12 mm, 15 mm, 20 mm Plaster | Guniyo",
      metaDescription:
        "Calculate cement bags and sand for internal and external plaster in 1:4, 1:5 or 1:6. Enter area in sqft or m², choose 12, 15 or 20 mm thickness.",
      intro:
        "Enter the plaster area and choose thickness and mix. The calculator adds 20% for filling joints and uneven surfaces, applies the 1.27 dry factor and shows cement and sand.",
      faqs: [
        {
          q: "How much cement is needed for 100 m² of 12 mm plaster in 1:6?",
          a: "About 7.5 bags of cement and 1.57 m³ of sand.",
        },
        {
          q: "Which thickness should I use?",
          a: "Usually 12 mm for internal walls, 15 mm for rough internal surfaces and 20 mm (often in two coats) for external walls. Ceilings are typically 6–12 mm.",
        },
        {
          q: "Which mix is common?",
          a: "1:4 for external and ceiling plaster, 1:5 or 1:6 for internal walls.",
        },
      ],
    },
    hi: {
      name: "प्लास्टर",
      short: "प्लास्टर में सीमेंट और रेत",
      h1: "प्लास्टर कैलकुलेटर – दीवार के प्लास्टर में सीमेंट और रेत",
      metaTitle:
        "प्लास्टर कैलकुलेटर – 12, 15, 20 mm प्लास्टर में सीमेंट और रेत | Guniyo",
      metaDescription:
        "1:4, 1:5 या 1:6 में अंदर और बाहर के प्लास्टर के लिए सीमेंट की बोरी और रेत निकालें। एरिया sqft या m² में, मोटाई 12, 15 या 20 mm।",
      intro:
        "प्लास्टर का एरिया डालें और मोटाई व मिक्स चुनें। कैलकुलेटर जोड़ भरने और ऊबड़-खाबड़ सतह के लिए 20% जोड़ता है, 1.27 ड्राई फ़ैक्टर लगाकर सीमेंट और रेत बताता है।",
      faqs: [
        {
          q: "1:6 में 100 m², 12 mm प्लास्टर में कितना सीमेंट लगेगा?",
          a: "लगभग 7.5 बोरी सीमेंट और 1.57 m³ रेत।",
        },
        {
          q: "कितनी मोटाई रखें?",
          a: "अंदर की दीवार 12 mm, खुरदरी सतह 15 mm और बाहर की दीवार 20 mm (अक्सर दो कोट में)। छत (सीलिंग) आमतौर पर 6–12 mm।",
        },
        {
          q: "कौन सा मिक्स आम है?",
          a: "बाहर और छत के प्लास्टर में 1:4, अंदर की दीवार में 1:5 या 1:6।",
        },
      ],
    },
  },
  {
    slug: "steel-calculator",
    mark: "S",
    related: [
      "concrete-calculator",
      "house-construction-cost-calculator",
      "construction-unit-converter",
    ],
    en: {
      name: "Steel / Rebar",
      short: "Bar weight, kg per m³, kg per sqft",
      h1: "Steel Calculator – Rebar Weight and Steel Quantity",
      metaTitle:
        "Steel Calculator – Rebar Weight (D²/162), Steel for Slab, Beam, Column | Guniyo",
      metaDescription:
        "Calculate steel bar weight with D²/162, steel for footing, column, beam and slab by thumb rule, and total steel for a house per sqft. 8 mm to 32 mm bars.",
      intro:
        "Three ways to get steel: exact bar weight from diameter and length, steel for a member from its concrete volume, or total steel for a house from its built-up area.",
      faqs: [
        {
          q: "What is the weight of a 12 mm bar per metre?",
          a: "12² ÷ 162 = 0.889 kg per metre. A 12 m bar of 12 mm weighs about 10.7 kg.",
        },
        {
          q: "How much steel per sqft for a house?",
          a: "Typically 3.5–4.5 kg per sqft of built-up area for an RCC framed house; 4 kg/sqft is a common thumb rule.",
        },
        {
          q: "How much steel is in 1 m³ of slab?",
          a: "As a thumb rule about 80–100 kg per m³ for slabs, 120–160 for beams and 150–200 for columns. The structural drawing gives the actual figure.",
        },
      ],
    },
    hi: {
      name: "सरिया / स्टील",
      short: "सरिया का वज़न, kg/m³, kg/sqft",
      h1: "सरिया कैलकुलेटर – सरिया का वज़न और मात्रा",
      metaTitle:
        "सरिया कैलकुलेटर – D²/162 से वज़न, स्लैब, बीम, कॉलम में सरिया | Guniyo",
      metaDescription:
        "D²/162 से सरिया का वज़न, थंब रूल से फुटिंग, कॉलम, बीम और स्लैब में सरिया, और प्रति sqft घर का कुल सरिया निकालें। 8 mm से 32 mm।",
      intro:
        "सरिया निकालने के तीन तरीके: डायमीटर और लंबाई से सही वज़न, कंक्रीट के आयतन से किसी मेंबर का सरिया, या बिल्ट-अप एरिया से पूरे घर का सरिया।",
      faqs: [
        {
          q: "12 mm सरिया का प्रति मीटर वज़न कितना है?",
          a: "12² ÷ 162 = 0.889 किलो प्रति मीटर। 12 मीटर की 12 mm सरिया लगभग 10.7 किलो।",
        },
        {
          q: "घर में प्रति sqft कितना सरिया लगता है?",
          a: "RCC फ्रेम घर में आमतौर पर 3.5–4.5 किलो प्रति sqft बिल्ट-अप; 4 किलो/sqft आम थंब रूल है।",
        },
        {
          q: "1 m³ स्लैब में कितना सरिया होता है?",
          a: "थंब रूल से स्लैब में 80–100 किलो प्रति m³, बीम में 120–160 और कॉलम में 150–200। असली मात्रा स्ट्रक्चरल ड्रॉइंग से।",
        },
      ],
    },
  },
  {
    slug: "tile-calculator",
    mark: "T",
    related: [
      "paint-calculator",
      "plaster-calculator",
      "house-construction-cost-calculator",
    ],
    en: {
      name: "Tiles / Flooring",
      short: "Tiles and boxes",
      h1: "Tile Calculator – How Many Tiles and Boxes",
      metaTitle:
        "Tile Calculator – How Many Tiles & Boxes for a Room (60x60, 60x120, 80x80) | Guniyo",
      metaDescription:
        "Calculate tiles and boxes for any floor area with wastage. Sizes 30x30 to 80x80 and 60x120 cm. Enter room size in feet or metre.",
      intro:
        "Enter the room size or floor area and pick the tile size. You get the number of tiles with cutting wastage, boxes to buy and the cost.",
      faqs: [
        {
          q: "How much wastage should I add for tiles?",
          a: "8% for straight laying and 10–12% for diagonal laying, large tiles or rooms with many corners.",
        },
        {
          q: "How many 60x60 tiles are in a box?",
          a: "Usually 4 tiles (1.44 m² or about 15.5 sqft), but check the brand's box.",
        },
        {
          q: "How many tiles for a 12 × 10 ft room?",
          a: "120 sqft = 11.15 m². With 60x60 tiles that is 31 tiles + 8% = 34 tiles, or 9 boxes.",
        },
      ],
    },
    hi: {
      name: "टाइल्स / फ़र्श",
      short: "टाइल्स और बॉक्स",
      h1: "टाइल कैलकुलेटर – कितनी टाइल्स और बॉक्स लगेंगे",
      metaTitle:
        "टाइल कैलकुलेटर – कमरे में कितनी टाइल्स और बॉक्स (60x60, 60x120) | Guniyo",
      metaDescription:
        "किसी भी फ़र्श के लिए वेस्टेज सहित टाइल्स और बॉक्स निकालें। 30x30 से 80x80 और 60x120 cm साइज़। कमरे का साइज़ फ़ीट या मीटर में।",
      intro:
        "कमरे का साइज़ या फ़र्श का एरिया डालें और टाइल साइज़ चुनें। आपको कटिंग वेस्टेज सहित टाइल्स, खरीदने के बॉक्स और लागत मिलेगी।",
      faqs: [
        {
          q: "टाइल्स में कितना वेस्टेज जोड़ें?",
          a: "सीधी लगाई में 8% और तिरछी लगाई, बड़ी टाइल्स या ज़्यादा कोनों वाले कमरे में 10–12%।",
        },
        {
          q: "60x60 के एक बॉक्स में कितनी टाइल्स होती हैं?",
          a: "आमतौर पर 4 टाइल्स (1.44 m² यानी लगभग 15.5 sqft), लेकिन ब्रांड का बॉक्स देखें।",
        },
        {
          q: "12 × 10 फ़ीट कमरे में कितनी टाइल्स?",
          a: "120 sqft = 11.15 m²। 60x60 टाइल्स से 31 टाइल्स + 8% = 34 टाइल्स, यानी 9 बॉक्स।",
        },
      ],
    },
  },
  {
    slug: "paint-calculator",
    mark: "Pt",
    related: [
      "plaster-calculator",
      "tile-calculator",
      "house-construction-cost-calculator",
    ],
    en: {
      name: "Paint",
      short: "Paint, primer, putty",
      h1: "Paint Calculator – Paint, Primer and Putty for a Room",
      metaTitle:
        "Paint Calculator – How Much Paint, Primer & Putty for a Room or House | Guniyo",
      metaDescription:
        "Calculate litres of paint, primer and kg of wall putty from room size or wall area. Deduct doors and windows, choose coats and coverage.",
      intro:
        "Enter the room size (or wall area), deduct doors and windows and choose the number of coats. You get paint and primer in litres and wall putty in kg.",
      faqs: [
        {
          q: "How much area does 1 litre of paint cover?",
          a: "Interior emulsion typically covers 100–140 sqft per litre per coat on a smooth putty finish. Check the product label.",
        },
        {
          q: "How many coats are needed?",
          a: "One coat of primer and two coats of paint is standard for new walls.",
        },
        {
          q: "How much putty for a room?",
          a: "About 1 kg per 15 sqft for two coats, depending on the wall surface.",
        },
      ],
    },
    hi: {
      name: "पेंट",
      short: "पेंट, प्राइमर, पुट्टी",
      h1: "पेंट कैलकुलेटर – कमरे में पेंट, प्राइमर और पुट्टी",
      metaTitle:
        "पेंट कैलकुलेटर – कमरे या घर में कितना पेंट, प्राइमर और पुट्टी | Guniyo",
      metaDescription:
        "कमरे के साइज़ या दीवार के एरिया से पेंट और प्राइमर (लीटर) और वॉल पुट्टी (किलो) निकालें। दरवाज़े-खिड़की घटाएं, कोट और कवरेज चुनें।",
      intro:
        "कमरे का साइज़ (या दीवार का एरिया) डालें, दरवाज़े-खिड़की घटाएं और कोट चुनें। आपको लीटर में पेंट और प्राइमर और किलो में वॉल पुट्टी मिलेगी।",
      faqs: [
        {
          q: "1 लीटर पेंट कितना एरिया कवर करता है?",
          a: "अंदर का इमल्शन चिकनी पुट्टी वाली दीवार पर आमतौर पर 100–140 sqft प्रति लीटर प्रति कोट। प्रोडक्ट का लेबल देखें।",
        },
        {
          q: "कितने कोट चाहिए?",
          a: "नई दीवार पर एक कोट प्राइमर और दो कोट पेंट आम है।",
        },
        {
          q: "एक कमरे में कितनी पुट्टी?",
          a: "दो कोट के लिए लगभग 1 किलो प्रति 15 sqft, दीवार की सतह के हिसाब से।",
        },
      ],
    },
  },
  {
    slug: "excavation-calculator",
    mark: "E",
    related: [
      "concrete-calculator",
      "construction-unit-converter",
      "house-construction-cost-calculator",
    ],
    en: {
      name: "Excavation",
      short: "Volume, brass, cost",
      h1: "Excavation Calculator – Volume, Brass and Cost",
      metaTitle:
        "Excavation Calculator – Foundation Pit & Trench Volume in m³, cft, Brass | Guniyo",
      metaDescription:
        "Calculate excavation volume for footing pits and trenches with working space. Get m³, cft, brass, loose soil for disposal and cost.",
      intro:
        "Enter pit or trench size, depth and number, and the working space around it. You get the excavation volume in m³, cft and brass, the loose soil to dispose and the cost.",
      faqs: [
        {
          q: "What is 1 brass?",
          a: "1 brass = 100 cft = 2.83 m³. It is commonly used in India for excavation, sand and aggregate.",
        },
        {
          q: "Why add working space?",
          a: "Workers need room to fix shuttering and work around the footing, usually 150–300 mm on each side.",
        },
        {
          q: "Why is loose soil more than the pit volume?",
          a: "Excavated soil bulks up by about 20–30% in ordinary soil, so more truck loads are needed than the pit volume suggests.",
        },
      ],
    },
    hi: {
      name: "खुदाई",
      short: "आयतन, ब्रास, खर्च",
      h1: "खुदाई कैलकुलेटर – आयतन, ब्रास और खर्च",
      metaTitle:
        "खुदाई कैलकुलेटर – नींव के गड्ढे की खुदाई m³, cft, ब्रास में | Guniyo",
      metaDescription:
        "वर्किंग स्पेस के साथ फुटिंग के गड्ढे और नाली की खुदाई का आयतन निकालें। m³, cft, ब्रास, फेंकने वाली ढीली मिट्टी और खर्च।",
      intro:
        "गड्ढे या नाली का साइज़, गहराई और संख्या, और चारों ओर वर्किंग स्पेस डालें। आपको m³, cft और ब्रास में खुदाई, फेंकने वाली ढीली मिट्टी और खर्च मिलेगा।",
      faqs: [
        {
          q: "1 ब्रास कितना होता है?",
          a: "1 ब्रास = 100 cft = 2.83 m³। भारत में खुदाई, रेत और गिट्टी के लिए आम इकाई है।",
        },
        {
          q: "वर्किंग स्पेस क्यों जोड़ते हैं?",
          a: "शटरिंग लगाने और फुटिंग के चारों ओर काम करने के लिए जगह चाहिए, आमतौर पर हर तरफ़ 150–300 mm।",
        },
        {
          q: "ढीली मिट्टी गड्ढे से ज़्यादा क्यों होती है?",
          a: "खुदी हुई मिट्टी साधारण ज़मीन में लगभग 20–30% फूल जाती है, इसलिए ज़्यादा ट्रिप लगती हैं।",
        },
      ],
    },
  },
  {
    slug: "construction-unit-converter",
    mark: "⇄",
    related: [
      "concrete-calculator",
      "excavation-calculator",
      "steel-calculator",
    ],
    en: {
      name: "Unit Converter",
      short: "m³ ↔ cft ↔ brass, bags ↔ kg",
      h1: "Construction Unit Converter – m³, cft, Brass, sqft, Cement Bags",
      metaTitle:
        "Construction Unit Converter – m³ to cft, Brass, sqft to m², Cement Bags to kg | Guniyo",
      metaDescription:
        "Convert construction units instantly: cubic metre to cft and brass, sqft to m², cement bags to kg and m³, kg to tonnes, feet-inch to metre.",
      intro:
        "Convert the units used on Indian sites: volume (m³, cft, brass), area (m², sqft), cement (bags, kg, m³), steel (kg, tonnes) and length (feet-inch, metre).",
      faqs: [
        { q: "How many cft in 1 m³?", a: "1 m³ = 35.315 cft." },
        {
          q: "What is the volume of one cement bag?",
          a: "A 50 kg bag is about 0.0347 m³ (1.226 cft) at a density of 1440 kg/m³.",
        },
        {
          q: "How do I convert 13'-8\" to metre?",
          a: "13 ft 8 in = 13.667 ft ÷ 3.2808 = 4.166 m. Type it in the length box as 13'-8\".",
        },
      ],
    },
    hi: {
      name: "यूनिट कन्वर्टर",
      short: "m³ ↔ cft ↔ ब्रास, बोरी ↔ किलो",
      h1: "निर्माण यूनिट कन्वर्टर – m³, cft, ब्रास, sqft, सीमेंट बोरी",
      metaTitle:
        "यूनिट कन्वर्टर – m³ से cft, ब्रास, sqft से m², सीमेंट बोरी से किलो | Guniyo",
      metaDescription:
        "निर्माण की इकाइयां तुरंत बदलें: घन मीटर से cft और ब्रास, sqft से m², सीमेंट बोरी से किलो और m³, किलो से टन, फ़ीट-इंच से मीटर।",
      intro:
        "साइट पर इस्तेमाल होने वाली इकाइयां बदलें: आयतन (m³, cft, ब्रास), एरिया (m², sqft), सीमेंट (बोरी, किलो, m³), सरिया (किलो, टन) और लंबाई (फ़ीट-इंच, मीटर)।",
      faqs: [
        { q: "1 m³ में कितने cft होते हैं?", a: "1 m³ = 35.315 cft।" },
        {
          q: "सीमेंट की एक बोरी का आयतन कितना है?",
          a: "50 किलो की बोरी 1440 kg/m³ घनत्व पर लगभग 0.0347 m³ (1.226 cft)।",
        },
        {
          q: "13'-8\" को मीटर में कैसे बदलें?",
          a: "13 फ़ीट 8 इंच = 13.667 फ़ीट ÷ 3.2808 = 4.166 मीटर। लंबाई बॉक्स में 13'-8\" लिखें।",
        },
      ],
    },
  },
  {
    slug: "house-boq-estimate",
    mark: "BQ",
    related: [
      "house-construction-cost-calculator",
      "contractor-quote-checker",
      "steel-calculator",
    ],
    en: {
      name: "Item-wise House BOQ",
      short: "Rooms → BOQ, measurement book, Excel",
      h1: "House BOQ Estimate – Item-wise with Measurement Book",
      metaTitle:
        "House BOQ Estimate in Excel – Item-wise Cost, Measurement Book | Guniyo",
      metaDescription:
        "Enter floors, bedrooms, toilets and kitchen to get an item-wise BOQ of your house: excavation, RCC, steel, brickwork, plaster, flooring, doors, plumbing, electrical — with measurement book, editable rates, Excel and PDF.",
      intro:
        "Choose G, G+1, G+2 or G+3, then add the rooms of each floor with their sizes — hall, bedrooms, kitchen, toilets, pooja, store, parking, shop and more. Guniyo lays out columns, beams and walls floor by floor and builds an item-wise BOQ with a measurement book (Nos × L × B × H) for every item. Change any rate and the total updates. Download Excel or PDF.",
      faqs: [
        {
          q: "How is this different from the house cost calculator?",
          a: "The cost calculator uses a single rate per sqft. This tool measures every item — excavation, footings, columns, beams, slab, brickwork, plaster, tiles, doors and windows, plumbing, electrical — and prices it item by item, like an engineer's estimate.",
        },
        {
          q: "Do I need a plan or drawing?",
          a: "No. It assumes standard room sizes (you can change them) and a typical RCC frame. For an estimate from your own plan, the Detailed Estimate with plan upload is coming in Pro.",
        },
        {
          q: "Can I change the rates?",
          a: "Yes. Every item rate is editable and the location setting adjusts all rates for your city type. Rates are composite (material + labour).",
        },
        {
          q: "Can I download the BOQ in Excel?",
          a: "Yes. The Excel file has four sheets: Abstract, Measurement Book, Materials and Rooms. A branded PDF is also available.",
        },
      ],
    },
    hi: {
      name: "आइटम-वार घर का BOQ",
      short: "कमरे → BOQ, मेज़रमेंट बुक, Excel",
      h1: "घर का BOQ एस्टिमेट – आइटम-वार, मेज़रमेंट बुक के साथ",
      metaTitle:
        "घर का BOQ एस्टिमेट Excel में – आइटम-वार खर्च, मेज़रमेंट बुक | Guniyo",
      metaDescription:
        "मंज़िल, बेडरूम, टॉयलेट और किचन डालें और घर का आइटम-वार BOQ पाएं: खुदाई, RCC, सरिया, ईंट, प्लास्टर, फ़्लोरिंग, दरवाज़े, प्लंबिंग, बिजली — मेज़रमेंट बुक, बदलने लायक रेट, Excel और PDF के साथ।",
      intro:
        "G, G+1, G+2 या G+3 चुनें, फिर हर मंज़िल के कमरे उनके साइज़ के साथ जोड़ें — हॉल, बेडरूम, किचन, टॉयलेट, पूजा, स्टोर, पार्किंग, दुकान और बाकी। Guniyo हर मंज़िल के कॉलम, बीम और दीवारें तय करके हर आइटम का मेज़रमेंट बुक (Nos × L × B × H) के साथ आइटम-वार BOQ बनाता है। कोई भी रेट बदलें, टोटल अपने आप बदलेगा। Excel या PDF डाउनलोड करें।",
      faqs: [
        {
          q: "यह घर खर्च कैलकुलेटर से अलग कैसे है?",
          a: "खर्च कैलकुलेटर एक ही प्रति sqft रेट लगाता है। यह टूल हर आइटम नापता है — खुदाई, फ़ुटिंग, कॉलम, बीम, स्लैब, ईंट, प्लास्टर, टाइल, दरवाज़े-खिड़की, प्लंबिंग, बिजली — और इंजीनियर के एस्टिमेट की तरह हर आइटम का रेट लगाता है।",
        },
        {
          q: "क्या नक्शा चाहिए?",
          a: "नहीं। यह स्टैंडर्ड कमरों के साइज़ (जिन्हें आप बदल सकते हैं) और सामान्य RCC फ्रेम मानता है। अपने नक्शे से एस्टिमेट के लिए प्लान अपलोड वाला विस्तृत एस्टिमेट Pro में आ रहा है।",
        },
        {
          q: "क्या रेट बदल सकते हैं?",
          a: "हाँ। हर आइटम का रेट बदल सकते हैं और लोकेशन सेटिंग आपके शहर के हिसाब से सभी रेट बदल देती है। रेट माल + मज़दूरी मिलाकर हैं।",
        },
        {
          q: "क्या BOQ Excel में मिलेगा?",
          a: "हाँ। Excel में चार शीट हैं: Abstract, Measurement Book, Materials और Rooms। ब्रांडेड PDF भी मिलता है।",
        },
      ],
    },
  },
  {
    slug: "contractor-quote-checker",
    mark: "✓",
    related: [
      "house-boq-estimate",
      "house-construction-cost-calculator",
      "steel-calculator",
    ],
    en: {
      name: "Contractor Quote Checker",
      short: "Is your contractor's rate fair?",
      h1: "Contractor Quote Checker – Is Your Construction Rate Fair?",
      metaTitle:
        "Contractor Rate Checker India – Is ₹/sqft Construction Quote Fair? | Guniyo",
      metaDescription:
        "Check if your contractor's construction quote is fair. Compare ₹/sqft for turnkey or labour-only contracts with market benchmarks for your city and quality, check item rates, and get a checklist before signing.",
      intro:
        "Enter the contractor's rate per sqft (or total amount), the built-up area, quality and city type. Guniyo compares it with the market benchmark, flags item rates that are too high or suspiciously low, and gives you the questions to ask before you sign.",
      faqs: [
        {
          q: "What is a fair turnkey construction rate in India?",
          a: "For an RCC framed house with standard finishes, about ₹1,600–1,800 per sqft in tier-2 cities in 2026; metros are 10–20% higher, small towns and villages lower.",
        },
        {
          q: "What is a fair labour-only rate?",
          a: "Labour-only contracts (owner buys material) are typically ₹330–520 per sqft depending on quality and city.",
        },
        {
          q: "Why is a very low quote a warning sign?",
          a: "A rate far below market usually means cheaper materials, missing items such as waterproofing or electrical points, or extra bills later. Always ask for the inclusions and brands in writing.",
        },
        {
          q: "How can I compare two contractors properly?",
          a: "Ask both for an item-wise BOQ on the same specification, then compare item by item. Our item-wise BOQ tool gives you a reference BOQ to compare against.",
        },
      ],
    },
    hi: {
      name: "ठेकेदार रेट चेकर",
      short: "ठेकेदार का रेट सही है या नहीं?",
      h1: "ठेकेदार रेट चेकर – आपका कंस्ट्रक्शन रेट सही है?",
      metaTitle:
        "ठेकेदार रेट चेकर – ₹/sqft कंस्ट्रक्शन रेट सही है या ज़्यादा? | Guniyo",
      metaDescription:
        "जांचें कि ठेकेदार का कंस्ट्रक्शन रेट सही है या नहीं। टर्नकी या सिर्फ़ मज़दूरी के ₹/sqft रेट को अपने शहर और क्वालिटी के बाज़ार रेट से मिलाएं, आइटम रेट जांचें और साइन करने से पहले की चेकलिस्ट पाएं।",
      intro:
        "ठेकेदार का प्रति sqft रेट (या कुल रकम), बिल्ट-अप एरिया, क्वालिटी और शहर डालें। Guniyo इसे बाज़ार बेंचमार्क से मिलाता है, बहुत ज़्यादा या शक वाले कम आइटम रेट बताता है, और साइन करने से पहले पूछने वाले सवाल देता है।",
      faqs: [
        {
          q: "भारत में सही टर्नकी कंस्ट्रक्शन रेट क्या है?",
          a: "स्टैंडर्ड फ़िनिश वाले RCC फ्रेम घर के लिए 2026 में टियर-2 शहरों में लगभग ₹1,600–1,800 प्रति sqft; मेट्रो में 10–20% ज़्यादा, छोटे शहर और गांव में कम।",
        },
        {
          q: "सिर्फ़ मज़दूरी का सही रेट क्या है?",
          a: "सिर्फ़ मज़दूरी के ठेके (माल मालिक ख़रीदे) आमतौर पर क्वालिटी और शहर के हिसाब से ₹330–520 प्रति sqft होते हैं।",
        },
        {
          q: "बहुत कम रेट ख़तरे की निशानी क्यों है?",
          a: "बाज़ार से बहुत कम रेट का मतलब अक्सर सस्ता माल, छूटे हुए आइटम जैसे वॉटरप्रूफिंग या बिजली पॉइंट्स, या बाद में अलग बिल होता है। हमेशा क्या शामिल है और ब्रांड लिखित में लें।",
        },
        {
          q: "दो ठेकेदारों की सही तुलना कैसे करें?",
          a: "दोनों से एक ही स्पेसिफ़िकेशन पर आइटम-वार BOQ मांगें, फिर हर आइटम मिलाएं। हमारा आइटम-वार BOQ टूल तुलना के लिए एक रेफ़रेंस BOQ देता है।",
        },
      ],
    },
  },
];

export const getCalc = (slug: string) =>
  CALCULATORS.find((c) => c.slug === slug);
export const copy = (c: CalcInfo, lang: Lang) => c[lang];
