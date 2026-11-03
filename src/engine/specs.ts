/**
 * Quality presets for the item-wise BOQ: one tap changes finish rates and the spec sheet.
 * Structure (concrete, steel, masonry) stays the same; finishes, doors, windows, fittings change.
 */
import type { RateKey } from "./boq";

export type BoqQuality = "basic" | "standard" | "premium";

/** Rates that differ from the standard (market) set, ₹ composite. */
export const QUALITY_RATE_OVERRIDES: Record<
  BoqQuality,
  Partial<Record<RateKey, number>>
> = {
  basic: {
    vit: 1050,
    skirt: 100,
    anti: 800,
    wtile: 800,
    granite: 3200,
    mdoor: 15000,
    bdoor: 9000,
    fdoor: 8500,
    pvc: 3000,
    alwin: 3800,
    vent: 1200,
    ewc: 6000,
    iwc: 3500,
    basin: 2200,
    shower: 2000,
    taps: 1400,
    sink: 3000,
    elec: 650,
    p_int: 170,
    p_ext: 160,
    st_tile: 1300,
    rail: 2000,
    ff_ceiling: 1000,
  },
  standard: {},
  premium: {
    vit: 2100,
    skirt: 190,
    anti: 1300,
    wtile: 1400,
    granite: 6000,
    mdoor: 45000,
    bdoor: 20000,
    fdoor: 16000,
    pvc: 6000,
    alwin: 7500,
    vent: 2500,
    ewc: 18000,
    iwc: 6000,
    basin: 7000,
    shower: 9000,
    taps: 5000,
    sink: 7000,
    elec: 1100,
    p_int: 300,
    p_ext: 260,
    st_tile: 2400,
    rail: 4500,
    ff_ceiling: 1600,
  },
};

export interface SpecLine {
  key: string;
  item: { en: string; hi: string };
  spec: Record<BoqQuality, { en: string; hi: string }>;
}

const same = (en: string, hi: string) => ({
  basic: { en, hi },
  standard: { en, hi },
  premium: { en, hi },
});

/** What each quality level means — shown as the spec sheet. */
export const SPEC_SHEET: SpecLine[] = [
  {
    key: "structure",
    item: { en: "Structure", hi: "ढांचा" },
    spec: same(
      "RCC frame, M20 concrete, Fe500D TMT steel",
      "RCC फ्रेम, M20 कंक्रीट, Fe500D TMT सरिया",
    ),
  },
  {
    key: "cement_steel",
    item: { en: "Cement and steel", hi: "सीमेंट और सरिया" },
    spec: {
      basic: {
        en: "ISI-marked PPC cement, ISI TMT steel",
        hi: "ISI मार्क PPC सीमेंट, ISI TMT सरिया",
      },
      standard: {
        en: "Branded PPC / OPC 53 cement, branded Fe500D TMT",
        hi: "ब्रांडेड PPC / OPC 53 सीमेंट, ब्रांडेड Fe500D TMT",
      },
      premium: {
        en: "Top-brand OPC 53 + PPC, top-brand Fe500D / Fe550D TMT",
        hi: "टॉप ब्रांड OPC 53 + PPC, टॉप ब्रांड Fe500D / Fe550D TMT",
      },
    },
  },
  {
    key: "flooring",
    item: { en: "Flooring", hi: "फ़्लोरिंग" },
    spec: {
      basic: {
        en: "Vitrified 600×600 double-charge (tile ₹35–45/sqft)",
        hi: "विट्रिफ़ाइड 600×600 डबल चार्ज (टाइल ₹35–45/sqft)",
      },
      standard: {
        en: "GVT / PGVT 600×1200 or 800×800 (tile ₹55–70/sqft)",
        hi: "GVT / PGVT 600×1200 या 800×800 (टाइल ₹55–70/sqft)",
      },
      premium: {
        en: "Large-format GVT 800×1600 / marble-look slabs (tile ₹100+/sqft)",
        hi: "बड़ी GVT 800×1600 / मार्बल लुक स्लैब (टाइल ₹100+/sqft)",
      },
    },
  },
  {
    key: "toilet_tiles",
    item: { en: "Toilet walls and floor", hi: "टॉयलेट दीवार और फ़र्श" },
    spec: {
      basic: {
        en: "Ceramic 300×450 wall tiles to 7 ft, anti-skid floor",
        hi: "सिरेमिक 300×450 दीवार टाइल 7 फ़ीट तक, एंटी-स्किड फ़र्श",
      },
      standard: {
        en: "Glazed 300×600 wall tiles to 7 ft, anti-skid floor",
        hi: "ग्लेज़्ड 300×600 दीवार टाइल 7 फ़ीट तक, एंटी-स्किड फ़र्श",
      },
      premium: {
        en: "Designer / GVT wall tiles full height, matt anti-skid floor",
        hi: "डिज़ाइनर / GVT दीवार टाइल पूरी ऊंचाई, मैट एंटी-स्किड फ़र्श",
      },
    },
  },
  {
    key: "kitchen",
    item: { en: "Kitchen platform", hi: "किचन प्लेटफ़ॉर्म" },
    spec: {
      basic: {
        en: "Black granite 18 mm, SS sink single bowl",
        hi: "काला ग्रेनाइट 18 mm, SS सिंक सिंगल बाउल",
      },
      standard: {
        en: "Granite 20 mm with edge polish, SS sink with drainboard",
        hi: "ग्रेनाइट 20 mm एज पॉलिश, ड्रेनबोर्ड वाला SS सिंक",
      },
      premium: {
        en: "Quartz / premium granite, double-bowl sink",
        hi: "क्वार्ट्ज़ / प्रीमियम ग्रेनाइट, डबल बाउल सिंक",
      },
    },
  },
  {
    key: "main_door",
    item: { en: "Main door", hi: "मुख्य दरवाज़ा" },
    spec: {
      basic: {
        en: "Sal / hardwood frame, flush shutter with laminate",
        hi: "साल / हार्डवुड चौखट, लैमिनेट वाला फ़्लश शटर",
      },
      standard: {
        en: "Teak frame, teak-veneer shutter, branded lock",
        hi: "सागौन चौखट, सागौन विनियर शटर, ब्रांडेड ताला",
      },
      premium: {
        en: "Solid teak frame and carved shutter, digital lock",
        hi: "सॉलिड सागौन चौखट और नक्काशी वाला शटर, डिजिटल लॉक",
      },
    },
  },
  {
    key: "doors",
    item: { en: "Room and toilet doors", hi: "कमरे और टॉयलेट के दरवाज़े" },
    spec: {
      basic: {
        en: "Hardwood frame, 30 mm flush door painted; PVC toilet doors",
        hi: "हार्डवुड चौखट, 30 mm फ़्लश दरवाज़ा पेंट; PVC टॉयलेट दरवाज़े",
      },
      standard: {
        en: "Hardwood frame, 32 mm flush door with laminate; WPC / UPVC toilet doors",
        hi: "हार्डवुड चौखट, लैमिनेट वाला 32 mm फ़्लश; WPC / UPVC टॉयलेट दरवाज़े",
      },
      premium: {
        en: "Teak frame, veneer / membrane doors; WPC toilet doors",
        hi: "सागौन चौखट, विनियर / मेम्ब्रेन दरवाज़े; WPC टॉयलेट दरवाज़े",
      },
    },
  },
  {
    key: "windows",
    item: { en: "Windows", hi: "खिड़कियां" },
    spec: {
      basic: {
        en: "Aluminium 2-track sliding, 4 mm glass, MS grill",
        hi: "एल्युमिनियम 2-ट्रैक स्लाइडिंग, 4 mm कांच, MS ग्रिल",
      },
      standard: {
        en: "Aluminium 3-track with mosquito mesh, 5 mm glass, MS grill",
        hi: "एल्युमिनियम 3-ट्रैक मच्छरदानी के साथ, 5 mm कांच, MS ग्रिल",
      },
      premium: {
        en: "UPVC with toughened glass and mesh, SS grill",
        hi: "UPVC टफ़न कांच और मेश के साथ, SS ग्रिल",
      },
    },
  },
  {
    key: "sanitary",
    item: { en: "Sanitary and CP fittings", hi: "सैनिटरी और नल-फिटिंग" },
    spec: {
      basic: {
        en: "ISI sanitaryware, basic chrome taps",
        hi: "ISI सैनिटरी, बेसिक क्रोम नल",
      },
      standard: {
        en: "Branded mid-range sanitaryware and CP fittings",
        hi: "ब्रांडेड मिड-रेंज सैनिटरी और नल-फिटिंग",
      },
      premium: {
        en: "Wall-hung WC, premium-brand CP fittings, diverter showers",
        hi: "वॉल-हंग WC, प्रीमियम ब्रांड नल, डायवर्टर शावर",
      },
    },
  },
  {
    key: "plumbing",
    item: { en: "Plumbing pipes", hi: "प्लंबिंग पाइप" },
    spec: same(
      "CPVC supply, SWR drainage (ISI)",
      "CPVC सप्लाई, SWR ड्रेनेज (ISI)",
    ),
  },
  {
    key: "electrical",
    item: { en: "Electrical", hi: "बिजली" },
    spec: {
      basic: {
        en: "ISI FR wires, standard switches, MCB DB",
        hi: "ISI FR वायर, सामान्य स्विच, MCB DB",
      },
      standard: {
        en: "Branded FR wires, modular switches, MCB + RCCB",
        hi: "ब्रांडेड FR वायर, मॉड्यूलर स्विच, MCB + RCCB",
      },
      premium: {
        en: "FRLS wires, premium modular switches, more points, RCCB",
        hi: "FRLS वायर, प्रीमियम मॉड्यूलर स्विच, ज़्यादा पॉइंट, RCCB",
      },
    },
  },
  {
    key: "paint",
    item: { en: "Painting", hi: "पेंटिंग" },
    spec: {
      basic: {
        en: "Putty + primer + economy emulsion; exterior economy paint",
        hi: "पुट्टी + प्राइमर + इकोनॉमी इमल्शन; बाहर इकोनॉमी पेंट",
      },
      standard: {
        en: "2 coats putty + primer + premium emulsion; weather-coat exterior",
        hi: "2 कोट पुट्टी + प्राइमर + प्रीमियम इमल्शन; बाहर वेदर-कोट",
      },
      premium: {
        en: "Luxury / sheen emulsion; weather-coat with elastomeric top coat",
        hi: "लग्ज़री / शीन इमल्शन; इलास्टोमेरिक वेदर-कोट",
      },
    },
  },
  {
    key: "railing",
    item: { en: "Stair railing", hi: "सीढ़ी की रेलिंग" },
    spec: {
      basic: { en: "MS railing, enamel paint", hi: "MS रेलिंग, एनामेल पेंट" },
      standard: {
        en: "MS railing with wooden / SS handrail",
        hi: "लकड़ी / SS हैंडरेल वाली MS रेलिंग",
      },
      premium: {
        en: "SS 304 with toughened glass",
        hi: "SS 304 टफ़न कांच के साथ",
      },
    },
  },
];
