import type { DiagramKind } from "@/content/journey";
import type { Lang } from "@/lib/site";

const tx = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);

const INK = "#080808";
const BLUE = "#146ef5";
const MUTE = "#5a5a5a";
const LINE = "#b9c2cf";

function Frame({ title, desc, children, vb = "0 0 640 340" }: { title: string; desc: string; children: React.ReactNode; vb?: string }) {
  return (
    <figure className="m-0 overflow-hidden rounded-[14px] border border-line bg-white">
      <svg viewBox={vb} role="img" aria-label={`${title}. ${desc}`} className="block h-auto w-full" fontFamily="system-ui, sans-serif" fontSize="13">
        <title>{title}</title>
        <desc>{desc}</desc>
        {children}
      </svg>
      <figcaption className="border-t border-line bg-[#f4f7fb] px-4 py-2.5 text-[13px] leading-snug text-[#5a5a5a]">{desc}</figcaption>
    </figure>
  );
}

function Tag({ x, y, children, anchor = "start", bold }: { x: number; y: number; children: React.ReactNode; anchor?: "start" | "middle" | "end"; bold?: boolean }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={INK} fontWeight={bold ? 700 : 500}>
      {children}
    </text>
  );
}

function Layout({ lang }: { lang: Lang }) {
  return (
    <Frame
      title={tx(lang, "Layout marking on the plot", "प्लॉट पर मार्किंग")}
      desc={tx(
        lang,
        "Plan view: the plot boundary, the setbacks, the house rectangle with equal diagonals, and a 3-4-5 triangle that gives a right angle.",
        "ऊपर से दृश्य: प्लॉट की सीमा, सेटबैक, बराबर विकर्ण वाला घर का आयत, और समकोण देने वाला 3-4-5 त्रिकोण।",
      )}
    >
      <rect x="40" y="30" width="400" height="280" fill="#f7f9fc" stroke={INK} strokeWidth="2" />
      <rect x="90" y="80" width="300" height="170" fill="#e6efff" stroke={BLUE} strokeWidth="2.5" />
      <line x1="90" y1="80" x2="390" y2="250" stroke={BLUE} strokeDasharray="6 4" />
      <line x1="390" y1="80" x2="90" y2="250" stroke={BLUE} strokeDasharray="6 4" />
      {[[90, 80], [390, 80], [90, 250], [390, 250]].map(([x, y]) => (
        <g key={`${x}${y}`}>
          <circle cx={x} cy={y} r="5" fill={BLUE} />
        </g>
      ))}
      <Tag x={240} y={22} anchor="middle" bold>{tx(lang, "Road side (front)", "सड़क की तरफ़ (आगे)")}</Tag>
      <Tag x={240} y={170} anchor="middle" bold>{tx(lang, "House rectangle", "घर का आयत")}</Tag>
      <Tag x={240} y={190} anchor="middle">{tx(lang, "both diagonals equal = square corners", "दोनों विकर्ण बराबर = कोने समकोण")}</Tag>
      <line x1="40" y1="60" x2="90" y2="60" stroke={INK} />
      <Tag x={65} y={55} anchor="middle">{tx(lang, "setback", "सेटबैक")}</Tag>
      <line x1="240" y1="250" x2="240" y2="310" stroke={INK} />
      <Tag x={248} y={285}>{tx(lang, "rear setback", "पीछे का सेटबैक")}</Tag>
      <Tag x={46} y={326}>{tx(lang, "Plot boundary (thick line)", "प्लॉट की सीमा (मोटी रेखा)")}</Tag>
      {/* 3-4-5 triangle */}
      <g transform="translate(470 70)">
        <Tag x={0} y={-8} bold>{tx(lang, "3-4-5 right angle", "3-4-5 से समकोण")}</Tag>
        <polygon points="0,150 120,150 0,60" fill="#fff" stroke={INK} strokeWidth="2" />
        <rect x="0" y="136" width="14" height="14" fill="none" stroke={BLUE} strokeWidth="2" />
        <Tag x={60} y={168} anchor="middle">{tx(lang, "4 m", "4 m")}</Tag>
        <Tag x={-6} y={110} anchor="end">{tx(lang, "3 m", "3 m")}</Tag>
        <Tag x={70} y={96}>{tx(lang, "5 m", "5 m")}</Tag>
        <Tag x={0} y={196}>{tx(lang, "If the long side is", "अगर लंबी भुजा")}</Tag>
        <Tag x={0} y={212}>{tx(lang, "exactly 5 m, the corner", "ठीक 5 m है, तो कोना")}</Tag>
        <Tag x={0} y={228}>{tx(lang, "is 90 degrees.", "90 डिग्री है।")}</Tag>
      </g>
    </Frame>
  );
}

function Foundation({ lang }: { lang: Lang }) {
  return (
    <Frame
      title={tx(lang, "Section through a column footing", "कॉलम फ़ुटिंग का सेक्शन")}
      desc={tx(
        lang,
        "Section of an isolated footing: PCC bed, footing steel on cover blocks, column starter bars, plinth beam, backfill and the plinth above road level. Sizes come from your structural drawing.",
        "अलग फ़ुटिंग का सेक्शन: PCC बेड, कवर ब्लॉक पर फ़ुटिंग का सरिया, कॉलम स्टार्टर बार, प्लिंथ बीम, बैकफ़िल और सड़क से ऊपर प्लिंथ। नाप आपकी स्ट्रक्चरल ड्रॉइंग से आएंगे।",
      )}
    >
      <rect x="0" y="110" width="640" height="230" fill="#efe6d8" />
      <line x1="0" y1="110" x2="640" y2="110" stroke={INK} strokeWidth="2" />
      <Tag x={10} y={130}>{tx(lang, "Ground / road level", "ज़मीन / सड़क लेवल")}</Tag>
      <rect x="150" y="150" width="240" height="170" fill="#fff" stroke={INK} strokeDasharray="5 4" />
      <rect x="150" y="300" width="240" height="20" fill="#cfd6df" stroke={INK} />
      <rect x="170" y="268" width="200" height="32" fill="#bcd4fb" stroke={INK} />
      {[182, 210, 238, 266, 294, 322, 350].map((x) => (
        <circle key={x} cx={x} cy="277" r="3.5" fill={INK} />
      ))}
      {[200, 340].map((x) => (
        <rect key={x} x={x} y="290" width="14" height="8" fill="#8a8a8a" />
      ))}
      <rect x="250" y="40" width="40" height="228" fill="#bcd4fb" stroke={INK} />
      {[256, 284].map((x) => (
        <line key={x} x1={x} y1="30" x2={x} y2="285" stroke={INK} strokeWidth="2.5" />
      ))}
      <rect x="150" y="84" width="240" height="26" fill="#d9e6fb" stroke={INK} />
      <Tag x={396} y={102}>{tx(lang, "plinth beam", "प्लिंथ बीम")}</Tag>
      <line x1="150" y1="84" x2="150" y2="110" stroke={BLUE} strokeWidth="3" />
      <line x1="470" y1="84" x2="470" y2="110" stroke={BLUE} strokeWidth="2" />
      <line x1="470" y1="110" x2="470" y2="62" stroke={BLUE} strokeWidth="2" />
      <Tag x={480} y={78}>{tx(lang, "plinth height", "प्लिंथ की ऊंचाई")}</Tag>
      <Tag x={480} y={94}>{tx(lang, "per approved map", "मंज़ूर नक्शे अनुसार")}</Tag>
      <Tag x={398} y={176}>{tx(lang, "backfill in layers, compacted", "बैकफ़िल परतों में, दबाई हुई")}</Tag>
      <Tag x={398} y={284}>{tx(lang, "footing concrete + steel", "फ़ुटिंग कंक्रीट + सरिया")}</Tag>
      <Tag x={398} y={300}>{tx(lang, "50 mm cover (blocks)", "50 mm कवर (ब्लॉक)")}</Tag>
      <Tag x={398} y={316}>{tx(lang, "PCC 100 mm bed", "PCC 100 mm बेड")}</Tag>
      <Tag x={300} y={60}>{tx(lang, "column starter bars", "कॉलम स्टार्टर बार")}</Tag>
      <Tag x={300} y={76}>{tx(lang, "with lap length left", "लैप लंबाई छोड़कर")}</Tag>
      <Tag x={10} y={330} bold>{tx(lang, "Firm, level, dry bottom", "मज़बूत, समतल, सूखा तल")}</Tag>
    </Frame>
  );
}

function Column({ lang }: { lang: Lang }) {
  const bars: [number, number][] = [[85, 70], [185, 70], [85, 170], [185, 170]];
  return (
    <Frame
      title={tx(lang, "RCC column: cross-section and side view", "RCC कॉलम: क्रॉस-सेक्शन और साइड व्यू")}
      desc={tx(
        lang,
        "Left: column cross-section with four corner bars, a stirrup and the cover. Right: side view where stirrups sit closer together near the ends. Bar sizes and spacing come from the structural drawing.",
        "बाएं: चार कोने के सरिया, स्टिरप और कवर के साथ क्रॉस-सेक्शन। दाएं: साइड व्यू जहां स्टिरप सिरों के पास पास-पास होते हैं। सरिया का नाप और दूरी स्ट्रक्चरल ड्रॉइंग से आएगी।",
      )}
    >
      <rect x="60" y="45" width="150" height="150" fill="#e8e8e8" stroke={INK} strokeWidth="2" />
      <rect x="72" y="57" width="126" height="126" fill="none" stroke={BLUE} strokeWidth="3" />
      {bars.map(([x, y], i) => (
        <circle key={i} cx={x - 5 + (i % 2) * 5} cy={y - 8 + (i > 1 ? 10 : 0) + 0} r="8" fill={INK} />
      ))}
      <Tag x={135} y={225} anchor="middle" bold>{tx(lang, "Cross-section", "क्रॉस-सेक्शन")}</Tag>
      <Tag x={135} y={243} anchor="middle">{tx(lang, "4 corner bars (more as drawn)", "4 कोने के सरिया (ड्रॉइंग अनुसार ज़्यादा)")}</Tag>
      <line x1="60" y1="120" x2="72" y2="120" stroke="#d11" strokeWidth="2.5" />
      <Tag x={60} y={270}>{tx(lang, "Red = cover: concrete between steel and surface", "लाल = कवर: सरिया और सतह के बीच कंक्रीट")}</Tag>
      <Tag x={60} y={288}>{tx(lang, "(about 40 mm for columns, as drawn)", "(कॉलम में लगभग 40 mm, ड्रॉइंग अनुसार)")}</Tag>
      <rect x="340" y="25" width="70" height="280" fill="#e8e8e8" stroke={INK} strokeWidth="2" />
      <line x1="356" y1="25" x2="356" y2="305" stroke={INK} strokeWidth="3" />
      <line x1="394" y1="25" x2="394" y2="305" stroke={INK} strokeWidth="3" />
      {[35, 50, 65, 80, 95, 130, 165, 200, 235, 250, 265, 280, 295].map((y) => (
        <line key={y} x1="350" y1={y} x2="400" y2={y} stroke={BLUE} strokeWidth="2.5" />
      ))}
      <Tag x={430} y={55}>{tx(lang, "Stirrups close together", "स्टिरप पास-पास")}</Tag>
      <Tag x={430} y={71}>{tx(lang, "near the beam joint", "बीम जोड़ के पास")}</Tag>
      <Tag x={430} y={175}>{tx(lang, "wider spacing in the middle", "बीच में दूरी ज़्यादा")}</Tag>
      <Tag x={430} y={265}>{tx(lang, "close again at the bottom", "नीचे फिर पास-पास")}</Tag>
      <Tag x={375} y={322} anchor="middle" bold>{tx(lang, "Side view", "साइड व्यू")}</Tag>
    </Frame>
  );
}

function Roof({ lang }: { lang: Lang }) {
  const layers: [string, string, string, number, string][] = [
    ["Tiles or finish", "टाइल या फ़िनिश", "#e9e1d3", 30, ""],
    ["Protective screed", "सुरक्षा स्क्रीड", "#d6dbe3", 30, ""],
    ["Waterproofing membrane", "वॉटरप्रूफिंग मेम्ब्रेन", "#146ef5", 12, ""],
    ["Sloping screed / coba (1 in 100 to 1 in 50)", "ढलान वाली स्क्रीड / कोबा (1 में 100 से 1 में 50)", "#c8ccd2", 44, ""],
    ["RCC roof slab", "RCC छत की स्लैब", "#9aa3ad", 58, ""],
  ];
  let y = 90;
  return (
    <Frame
      title={tx(lang, "Terrace layers", "छत की परतें")}
      desc={tx(
        lang,
        "Section of a terrace from the slab upwards: slab, sloping screed, waterproofing membrane taken up the parapet, protective screed and finish, with the slope towards the outlet.",
        "स्लैब से ऊपर तक छत का सेक्शन: स्लैब, ढलान वाली स्क्रीड, पैरापेट तक ले जाया गया वॉटरप्रूफिंग मेम्ब्रेन, सुरक्षा स्क्रीड और फ़िनिश, ढलान आउटलेट की तरफ़।",
      )}
    >
      <rect x="40" y="20" width="26" height="250" fill="#b8bfc8" stroke={INK} />
      <Tag x={76} y={36} bold>{tx(lang, "Parapet wall", "पैरापेट दीवार")}</Tag>
      <Tag x={76} y={52}>{tx(lang, "membrane goes up the wall", "मेम्ब्रेन दीवार पर ऊपर जाता है")}</Tag>
      <path d="M 66 88 L 66 34" stroke={BLUE} strokeWidth="4" fill="none" />
      {layers.map(([en, hi, fill, h]) => {
        const top = y;
        y += h;
        return (
          <g key={en}>
            <rect x="66" y={top} width="360" height={h} fill={fill} stroke={INK} />
            <Tag x={440} y={top + h / 2 + 5}>{tx(lang, en, hi)}</Tag>
          </g>
        );
      })}
      <path d="M 80 82 L 410 82" stroke="none" />
      <rect x="426" y="230" width="22" height="40" fill="#fff" stroke={INK} />
      <Tag x={150} y={298} bold>{tx(lang, "Water runs to the outlet; no pockets where it can stand", "पानी आउटलेट की तरफ़ बहे; कोई गड्ढा नहीं जहां रुके")}</Tag>
      <Tag x={150} y={316}>{tx(lang, "Test: block the outlet, hold about 50 mm of water for 48 hours", "जांच: आउटलेट बंद करें, लगभग 50 mm पानी 48 घंटे रखें")}</Tag>
    </Frame>
  );
}

export function JourneyDiagram({ kind, lang }: { kind: DiagramKind; lang: Lang }) {
  if (kind === "layout") return <Layout lang={lang} />;
  if (kind === "foundation") return <Foundation lang={lang} />;
  if (kind === "column") return <Column lang={lang} />;
  if (kind === "roof") return <Roof lang={lang} />;
  return null;
}
