/**
 * Front elevation designs (artist-impression renders). Each one is matched to the plot size it suits, so its
 * page can show that plot's real built-up area and cost from the engine.
 */
import { getNaksha, DESIGNS, type Naksha } from "./naksha";
import { getPlot, plotSlug } from "./plots";

type T = { en: string; hi: string };

export interface Elevation {
  /** gallery file number (public/elevations/gallery/eNN.webp) */
  n: number;
  slug: string;
  /** plot size it suits, "25x50" or "25x50-shop" */
  plot: string;
  style: T;
  blurb: T;
  features: { en: string[]; hi: string[] };
  cars: number;
}

const e = (
  n: number,
  slug: string,
  plot: string,
  style: T,
  blurb: T,
  en: string[],
  hi: string[],
  cars: number,
): Elevation => ({ n, slug, plot, style, blurb, features: { en, hi }, cars });

export const ELEVATIONS: Elevation[] = [
  e(1, "modern-luxury-jaali-50x80", "50x80",
    { en: "Modern luxury with a jaali screen", hi: "जाली स्क्रीन के साथ मॉडर्न लग्ज़री" },
    { en: "A wide, two-storey front with stone cladding, a backlit jaali panel and a double-height glass entrance. Built for large plots where the facade can spread out.", hi: "पत्थर की क्लैडिंग, बैकलिट जाली पैनल और डबल-हाइट कांच के प्रवेश वाला चौड़ा दो मंज़िला फ़्रंट। बड़े प्लॉट के लिए, जहां फ़ेसाड फैल सके।" },
    ["Travertine-look stone cladding", "Backlit jaali (perforated) screen", "Cantilevered balcony with glass railing and planter", "Double-height glazed entrance", "Two-car porch"],
    ["ट्रैवर्टीन जैसी पत्थर क्लैडिंग", "बैकलिट जाली स्क्रीन", "कांच की रेलिंग और प्लांटर वाली बालकनी", "डबल-हाइट कांच का प्रवेश", "दो कार का पोर्च"], 2),
  e(2, "white-contemporary-green-wall-50x50", "50x50",
    { en: "White contemporary with a green wall", hi: "ग्रीन वॉल के साथ सफ़ेद कंटेम्पररी" },
    { en: "Clean white volumes, a glowing LED edge and a tall glass entrance. The vertical garden softens the front and keeps the upper floor cooler.", hi: "साफ़ सफ़ेद बनावट, LED की चमकती किनारी और ऊंचा कांच का प्रवेश। वर्टिकल गार्डन फ़्रंट को नरम बनाता है और ऊपरी मंज़िल को ठंडा रखता है।" },
    ["White textured plaster with slab-edge LED lighting", "Double-height glass entrance in a timber frame", "Vertical green wall panel", "Glass-railing balcony over the porch", "Two-car porch"],
    ["सफ़ेद टेक्सचर प्लास्टर, स्लैब किनारे पर LED लाइट", "लकड़ी के फ़्रेम में डबल-हाइट कांच का प्रवेश", "वर्टिकल ग्रीन वॉल पैनल", "पोर्च के ऊपर कांच की रेलिंग वाली बालकनी", "दो कार का पोर्च"], 2),
  e(3, "dark-timber-travertine-40x60", "40x60",
    { en: "Dark timber and travertine", hi: "डार्क टिम्बर और ट्रैवर्टीन" },
    { en: "A calm, symmetrical front: charcoal walls, vertical timber fins and a full-height timber door set in warm stone.", hi: "शांत, संतुलित फ़्रंट: चारकोल दीवारें, खड़ी लकड़ी की फ़िन और गर्म पत्थर में लगा पूरी ऊंचाई का लकड़ी का दरवाज़ा।" },
    ["Charcoal plaster with vertical timber fins", "Full-height timber entrance door", "Stone cladding around the entrance", "Glass-railing balcony on the right", "Two-car porch with a slatted gate"],
    ["चारकोल प्लास्टर और खड़ी लकड़ी की फ़िन", "पूरी ऊंचाई का लकड़ी का मुख्य दरवाज़ा", "प्रवेश के चारों ओर पत्थर क्लैडिंग", "दाईं ओर कांच की रेलिंग वाली बालकनी", "स्लैट वाले गेट के साथ दो कार का पोर्च"], 2),
  e(4, "tropical-terracotta-roof-garden-40x80", "40x80",
    { en: "Tropical brick with a roof garden", hi: "रूफ़ गार्डन के साथ ट्रॉपिकल ब्रिक" },
    { en: "Terracotta brick, timber shutters and planted edges on every slab. A warm, shaded front that suits hot, humid cities.", hi: "टेराकोटा ईंट, लकड़ी के शटर और हर स्लैब पर पौधों की किनारी। गर्म और उमस वाले शहरों के लिए छायादार, गर्म फ़्रंट।" },
    ["Terracotta brick jaali and timber shutters", "Planters on the roof edge and balcony", "Tall timber door with glass side panels", "Timber soffit with cove lighting", "Two-car porch, stone boundary wall"],
    ["टेराकोटा ईंट की जाली और लकड़ी के शटर", "छत की किनारी और बालकनी पर प्लांटर", "कांच के साइड पैनल वाला ऊंचा लकड़ी का दरवाज़ा", "कोव लाइट के साथ लकड़ी की सॉफ़िट", "दो कार का पोर्च, पत्थर की बाउंड्री वॉल"], 2),
  e(5, "tropical-brick-shutters-30x60", "30x60",
    { en: "Tropical brick with timber shutters", hi: "लकड़ी के शटर के साथ ट्रॉपिकल ब्रिक" },
    { en: "A brick lattice, louvred shutters and a green roof edge on a compact footprint, with the garage tucked under the first floor.", hi: "कम जगह में ईंट की जाली, लूवर शटर और हरी छत की किनारी, गैराज पहली मंज़िल के नीचे।" },
    ["Brick lattice panel", "Louvred timber shutters", "Green planter along the roof edge", "Glass-railing balcony", "Garage under the first floor"],
    ["ईंट की जाली का पैनल", "लकड़ी के लूवर शटर", "छत की किनारी पर हरा प्लांटर", "कांच की रेलिंग वाली बालकनी", "पहली मंज़िल के नीचे गैराज"], 2),
  e(6, "tropical-brick-open-porch-30x30", "30x30",
    { en: "Tropical brick with an open porch", hi: "खुले पोर्च के साथ ट्रॉपिकल ब्रिक" },
    { en: "Brick jaali, planted balcony and a stone wall at the gate. A small-plot front that still feels generous.", hi: "ईंट की जाली, पौधों वाली बालकनी और गेट पर पत्थर की दीवार। छोटे प्लॉट का फ़्रंट जो फिर भी खुला लगता है।" },
    ["Brick jaali screen", "Planted balcony edge", "Timber entrance door with steps", "Stone and brick boundary wall", "Single-car open porch"],
    ["ईंट की जाली स्क्रीन", "पौधों वाली बालकनी की किनारी", "सीढ़ियों के साथ लकड़ी का मुख्य दरवाज़ा", "पत्थर और ईंट की बाउंड्री वॉल", "एक कार का खुला पोर्च"], 1),
  e(7, "neo-classical-35x50", "35x50",
    { en: "Neo-classical with arched windows", hi: "मेहराबदार खिड़कियों वाला नियो-क्लासिकल" },
    { en: "Cornice mouldings, tall arched windows and fluted columns in a soft sand colour. A formal, traditional front.", hi: "कार्निस मोल्डिंग, ऊंची मेहराबदार खिड़कियां और रेत के रंग में फ़्लूटेड कॉलम। औपचारिक, पारंपरिक फ़्रंट।" },
    ["Dentil cornice and plaster mouldings", "Tall arched windows with wall lanterns", "Fluted columns at the porch", "Wrought-iron balcony railing and gate", "Stone plinth"],
    ["डेंटिल कार्निस और प्लास्टर मोल्डिंग", "दीवार के लैंप वाली ऊंची मेहराबदार खिड़कियां", "पोर्च पर फ़्लूटेड कॉलम", "लोहे की नक्काशीदार बालकनी रेलिंग और गेट", "पत्थर का प्लिंथ"], 1),
  e(8, "sloped-roof-concrete-band-30x50", "30x50",
    { en: "Sloped roof with a concrete band", hi: "ढलान वाली छत और कंक्रीट बैंड" },
    { en: "A dark mono-pitch roof over a board-marked concrete band, timber cladding and a corner window.", hi: "बोर्ड-मार्क कंक्रीट बैंड के ऊपर गहरे रंग की ढलान वाली छत, लकड़ी की क्लैडिंग और कॉर्नर विंडो।" },
    ["Dark metal mono-pitch roof", "Board-formed concrete band", "Timber-clad wall and corner glazing", "Slim steel pergola", "Glass-railing balcony"],
    ["गहरे रंग की मेटल ढलान वाली छत", "बोर्ड-फ़ॉर्म्ड कंक्रीट बैंड", "लकड़ी की क्लैडिंग और कॉर्नर कांच", "पतला स्टील पेरगोला", "कांच की रेलिंग वाली बालकनी"], 1),
  e(9, "beige-jaali-balcony-30x45", "30x45",
    { en: "Beige render with a jaali panel", hi: "जाली पैनल के साथ बेज रेंडर" },
    { en: "Warm beige plaster, grey stone accents and a backlit jaali square, with a planted balcony over the porch.", hi: "गर्म बेज प्लास्टर, ग्रे पत्थर और बैकलिट जाली, पोर्च के ऊपर पौधों वाली बालकनी।" },
    ["Beige plaster with grey stone accents", "Backlit jaali square panel", "Planted balcony with glass railing", "Carved teak entrance door", "Single-car porch"],
    ["बेज प्लास्टर और ग्रे पत्थर", "बैकलिट जाली पैनल", "पौधों और कांच की रेलिंग वाली बालकनी", "नक्काशीदार सागौन का दरवाज़ा", "एक कार का पोर्च"], 1),
  e(10, "beige-jaali-sunshades-30x40", "30x40",
    { en: "Jaali window with deep sunshades", hi: "गहरी छज्जों के साथ जाली विंडो" },
    { en: "A square jaali window, timber-lined sunshades and a roof terrace with glass railing. Made for a 30×40 plot with one car.", hi: "चौकोर जाली विंडो, लकड़ी की लाइनिंग वाले छज्जे और कांच की रेलिंग वाली छत। एक कार वाले 30×40 प्लॉट के लिए।" },
    ["Square jaali window panel", "Deep sunshades lined in timber", "Roof terrace with glass railing", "Stone-clad wall with planter niche", "Single-car porch with sliding gate"],
    ["चौकोर जाली विंडो पैनल", "लकड़ी की लाइनिंग वाले गहरे छज्जे", "कांच की रेलिंग वाली छत", "प्लांटर निचे के साथ पत्थर की दीवार", "स्लाइडिंग गेट के साथ एक कार का पोर्च"], 1),
  e(11, "white-led-outline-25x60", "25x60",
    { en: "White with a glowing LED outline", hi: "चमकती LED किनारी वाला सफ़ेद फ़्रंट" },
    { en: "Stepped white boxes outlined in warm light, with a vertical garden and a glass balcony.", hi: "गर्म रोशनी से घिरे सीढ़ीदार सफ़ेद डिब्बे, वर्टिकल गार्डन और कांच की बालकनी।" },
    ["LED outline along the slab edges", "Vertical green wall", "Glass-railing balcony", "Dark flush entrance door", "Single-car porch"],
    ["स्लैब किनारों पर LED आउटलाइन", "वर्टिकल ग्रीन वॉल", "कांच की रेलिंग वाली बालकनी", "गहरे रंग का फ़्लश दरवाज़ा", "एक कार का पोर्च"], 1),
  e(12, "travertine-shopfront-30x50-shop", "30x50-shop",
    { en: "House with a shop, travertine front", hi: "दुकान के साथ घर, ट्रैवर्टीन फ़्रंट" },
    { en: "A glazed shopfront with a blank fascia board on the ground floor and a separate house entrance beside it. The family lives above.", hi: "ग्राउंड फ़्लोर पर कांच की दुकान और खाली फ़ेशिया बोर्ड, उसके बगल में घर का अलग प्रवेश। परिवार ऊपर रहता है।" },
    ["Full-width glazed shopfront", "Separate house entrance with canopy", "Travertine cladding with timber fins", "First-floor glass balcony", "Warm cove lighting"],
    ["पूरी चौड़ाई की कांच की दुकान", "कैनोपी के साथ घर का अलग प्रवेश", "लकड़ी की फ़िन के साथ ट्रैवर्टीन क्लैडिंग", "पहली मंज़िल की कांच की बालकनी", "गर्म कोव लाइटिंग"], 0),
  e(13, "travertine-shopfront-corner-25x50-shop", "25x50-shop",
    { en: "Shop and house, corner view", hi: "दुकान और घर, कॉर्नर व्यू" },
    { en: "The same idea for a narrower plot: a big glass shop below, a cantilevered family floor above and a canopy over the house door.", hi: "कम चौड़े प्लॉट के लिए वही विचार: नीचे बड़ी कांच की दुकान, ऊपर बाहर निकला परिवार का फ़्लोर और घर के दरवाज़े पर कैनोपी।" },
    ["Large glazed shopfront", "Cantilevered first floor with glass railing", "Canopy over the house door", "Timber fin panels", "Stepped, lit entrance"],
    ["बड़ी कांच की दुकान", "कांच की रेलिंग वाला बाहर निकला पहला फ़्लोर", "घर के दरवाज़े पर कैनोपी", "लकड़ी की फ़िन के पैनल", "रोशनी वाली सीढ़ियां"], 0),
  e(14, "tropical-brick-green-roof-20x50", "20x50",
    { en: "Tropical brick for a narrow plot", hi: "संकरे प्लॉट के लिए ट्रॉपिकल ब्रिक" },
    { en: "Brick jaali, timber shutters and a green roof, stacked tall on a 20-foot front.", hi: "20 फ़ीट के फ़्रंट पर ऊंची बनी ईंट की जाली, लकड़ी के शटर और हरी छत।" },
    ["Brick jaali and louvred shutters", "Green roof and planted balcony", "Timber door with entrance steps", "Stone and brick gate wall", "Single-car porch"],
    ["ईंट की जाली और लूवर शटर", "हरी छत और पौधों वाली बालकनी", "सीढ़ियों के साथ लकड़ी का दरवाज़ा", "पत्थर और ईंट की गेट दीवार", "एक कार का पोर्च"], 1),
  e(15, "neo-classical-narrow-20x45", "20x45",
    { en: "Neo-classical for a narrow plot", hi: "संकरे प्लॉट के लिए नियो-क्लासिकल" },
    { en: "Tall arched windows, a small wrought-iron balcony and fluted columns, compact enough for a 20-foot frontage.", hi: "ऊंची मेहराबदार खिड़कियां, छोटी लोहे की बालकनी और फ़्लूटेड कॉलम, 20 फ़ीट के फ़्रंट के लिए सधा हुआ।" },
    ["Tall arched windows", "Wrought-iron balcony", "Fluted columns and cornice", "Carved double door", "Stone plinth"],
    ["ऊंची मेहराबदार खिड़कियां", "लोहे की नक्काशीदार बालकनी", "फ़्लूटेड कॉलम और कार्निस", "नक्काशीदार डबल दरवाज़ा", "पत्थर का प्लिंथ"], 1),
  e(16, "sloped-roof-concrete-band-25x50", "25x50",
    { en: "Sloped roof, compact version", hi: "ढलान वाली छत, कॉम्पैक्ट रूप" },
    { en: "A dark pitched roof, concrete band and a big corner window fitted to a 25-foot front.", hi: "25 फ़ीट के फ़्रंट में गहरे रंग की ढलान वाली छत, कंक्रीट बैंड और बड़ी कॉर्नर विंडो।" },
    ["Dark metal pitched roof", "Concrete band over the porch", "Timber cladding with big corner window", "Glass-railing balcony", "Single-car porch"],
    ["गहरे रंग की मेटल ढलान वाली छत", "पोर्च के ऊपर कंक्रीट बैंड", "बड़ी कॉर्नर विंडो के साथ लकड़ी क्लैडिंग", "कांच की रेलिंग वाली बालकनी", "एक कार का पोर्च"], 1),
  e(17, "jaali-stone-narrow-25x40", "25x40",
    { en: "Jaali and stone, stepped front", hi: "जाली और पत्थर, सीढ़ीदार फ़्रंट" },
    { en: "Stepped floors with a backlit jaali panel, stone base and a planted balcony. Good for a short 25×40 plot.", hi: "सीढ़ीदार फ़्लोर, बैकलिट जाली पैनल, पत्थर का बेस और पौधों वाली बालकनी। छोटे 25×40 प्लॉट के लिए।" },
    ["Backlit jaali panel", "Stone-clad base", "Planted balcony with glass railing", "Carved wooden door", "Side car porch"],
    ["बैकलिट जाली पैनल", "पत्थर का बेस", "कांच की रेलिंग और पौधों वाली बालकनी", "नक्काशीदार लकड़ी का दरवाज़ा", "साइड में कार पोर्च"], 1),
  e(18, "white-led-vertical-garden-20x40", "20x40",
    { en: "White front with a vertical garden", hi: "वर्टिकल गार्डन वाला सफ़ेद फ़्रंट" },
    { en: "The smallest plot in the set gets a bold front: white volumes, a green strip and a glass balcony, with the car on the side.", hi: "सेट के सबसे छोटे प्लॉट के लिए बोल्ड फ़्रंट: सफ़ेद बनावट, हरी पट्टी और कांच की बालकनी, कार साइड में।" },
    ["White plaster with LED edge", "Vertical green strip", "Glass-railing balcony", "Dark entrance door", "Side car parking"],
    ["LED किनारी के साथ सफ़ेद प्लास्टर", "खड़ी हरी पट्टी", "कांच की रेलिंग वाली बालकनी", "गहरे रंग का मुख्य दरवाज़ा", "साइड में कार पार्किंग"], 1),
  e(19, "travertine-timber-slats-20x60", "20x60",
    { en: "Travertine with timber slats", hi: "लकड़ी की स्लैट के साथ ट्रैवर्टीन" },
    { en: "Backlit timber slats against warm stone, a glass balcony and a double timber door. Long and narrow, made for 20×60.", hi: "गर्म पत्थर पर बैकलिट लकड़ी की स्लैट, कांच की बालकनी और डबल लकड़ी का दरवाज़ा। लंबा और संकरा, 20×60 के लिए।" },
    ["Backlit vertical timber slats", "Travertine-look cladding", "Cantilevered glass balcony", "Double timber entrance door", "Perforated metal gates"],
    ["बैकलिट खड़ी लकड़ी की स्लैट", "ट्रैवर्टीन जैसी क्लैडिंग", "बाहर निकली कांच की बालकनी", "डबल लकड़ी का मुख्य दरवाज़ा", "छिद्रित मेटल गेट"], 1),
  e(20, "modern-corner-garden-40x50", "40x50",
    { en: "Modern corner house with a garden", hi: "बगीचे के साथ मॉडर्न कॉर्नर घर" },
    { en: "A cantilevered upper floor with a timber soffit over dark stone, set in a landscaped garden. Suits a corner plot with two road sides.", hi: "गहरे पत्थर के ऊपर लकड़ी की सॉफ़िट वाला बाहर निकला ऊपरी फ़्लोर, सजे बगीचे में। दो सड़कों वाले कॉर्नर प्लॉट के लिए।" },
    ["Cantilevered first floor with timber soffit", "Dark stone cladding on the ground floor", "Glass-railing balcony", "Wall lights and a landscaped garden", "Slatted sliding gates"],
    ["लकड़ी की सॉफ़िट वाला बाहर निकला पहला फ़्लोर", "ग्राउंड फ़्लोर पर गहरे पत्थर की क्लैडिंग", "कांच की रेलिंग वाली बालकनी", "दीवार के लैंप और सजा बगीचा", "स्लैट वाले स्लाइडिंग गेट"], 1),
];

export const getElevation = (slug: string) => ELEVATIONS.find((x) => x.slug === slug);
export const elevationImage = (x: Elevation, small = false) =>
  `/elevations/gallery/e${String(x.n).padStart(2, "0")}${small ? "-s" : ""}.webp`;

/** The design (E-facing) a plot key like "30x40" or "25x50-shop" refers to. */
export function designOf(plot: string): Naksha | undefined {
  const shop = plot.endsWith("-shop");
  const key = plot.replace("-shop", "");
  return DESIGNS.find((d) => plotSlug(d.plot) === key && d.kind === (shop ? "shop" : "house"));
}

/** Elevation chosen for a design: "30x40" → its own photo; shop designs without one reuse a shop front. */
export function elevationForDesign(n: Naksha): Elevation | undefined {
  const key = `${plotSlug(n.plot)}${n.kind === "shop" ? "-shop" : ""}`;
  return ELEVATIONS.find((x) => x.plot === key) ?? (n.kind === "shop" ? ELEVATIONS.find((x) => x.plot === "30x50-shop") : undefined);
}

export type WidthGroup = "narrow" | "medium" | "wide" | "shop";
export function groupOf(x: Elevation): WidthGroup {
  if (x.plot.endsWith("-shop")) return "shop";
  const w = getPlot(x.plot)?.w ?? 30;
  return w <= 25 ? "narrow" : w <= 35 ? "medium" : "wide";
}
export { getNaksha };
