import { useId } from "react";

/**
 * A clean front-elevation illustration of a G+1 house, drawn as SVG from a seed (the naksha slug) and the plot width,
 * so every design gets its own look (three styles, three colour schemes, porch left or right) and a narrow plot
 * gets a narrower house. It is an artist impression, not a drawing of the exact plan.
 */
const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

const TONES = [
  { wall: "#f5f2ec", wall2: "#e6e1d8", accent: "#a8744a", accent2: "#8a5c39", dark: "#2b3541", stone: "#8f8b84" },
  { wall: "#efece7", wall2: "#dcd8d1", accent: "#c4885a", accent2: "#a56d43", dark: "#3a3f46", stone: "#9a958c" },
  { wall: "#f3ede2", wall2: "#e3dac9", accent: "#7d5a44", accent2: "#5f4332", dark: "#26323e", stone: "#85796a" },
];

export function Elevation({
  seed,
  plotW = 30,
  shop = false,
  className,
  title,
}: {
  seed: string;
  plotW?: number;
  shop?: boolean;
  className?: string;
  title?: string;
}) {
  const id = useId().replace(/:/g, "");
  const h = hash(seed.replace(/-(east|north|west|south)-facing/, ""));
  const style = h % 3;
  const t = TONES[(h >>> 3) % 3];
  const mirror = (h >>> 5) % 2 === 1;
  const sx = Math.max(0.74, Math.min(1.12, plotW / 36));
  const G = 420; // ground line
  const frame = `translate(400 0) scale(${mirror ? -sx : sx} 1) translate(-400 0)`;
  const glass = `url(#g${id})`;
  const slats = Array.from({ length: 14 }, (_, i) => 520 + i * 13);

  return (
    <svg
      viewBox="0 0 800 480"
      role="img"
      aria-label={title}
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`s${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bcd8f2" />
          <stop offset="0.75" stopColor="#eef5fb" />
          <stop offset="1" stopColor="#f8fafc" />
        </linearGradient>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#bcdcf0" />
          <stop offset="0.55" stopColor="#6fa1c6" />
          <stop offset="1" stopColor="#3f6f96" />
        </linearGradient>
        <linearGradient id={`w${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={t.accent} />
          <stop offset="1" stopColor={t.accent2} />
        </linearGradient>
        <linearGradient id={`sh${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.28" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="800" height="480" fill={`url(#s${id})`} />
      <g fill="#fff" opacity="0.8">
        <ellipse cx="120" cy="80" rx="62" ry="13" />
        <ellipse cx="160" cy="68" rx="40" ry="11" />
        <ellipse cx="640" cy="52" rx="70" ry="12" />
        <ellipse cx="690" cy="42" rx="38" ry="9" />
      </g>
      {/* neighbouring houses, faint */}
      <g fill="#d5dfea">
        <rect x="-10" y="262" width="150" height="160" />
        <rect x="690" y="236" width="130" height="186" />
      </g>
      <g fill="#c9d5e2">
        <rect x="-10" y="262" width="150" height="10" />
        <rect x="690" y="236" width="130" height="10" />
      </g>

      {/* lawn and road */}
      <rect y={G} width="800" height="24" fill="#a6c986" />
      <rect y={G + 24} width="800" height="36" fill="#c7ccd1" />
      <rect y={G + 24} width="800" height="2" fill="#b3b9bf" />

      <g transform={frame}>
        {/* ground-floor block */}
        <rect x="150" y="310" width="510" height="110" fill={t.wall} />
        <rect x="150" y="310" width="510" height="110" fill={`url(#sh${id})`} opacity="0.35" />
        {/* car porch under the cantilever */}
        {shop ? (
          <>
            <rect x="160" y="318" width="140" height="102" fill={t.dark} />
            <rect x="166" y="344" width="128" height="76" fill={glass} />
            <rect x="166" y="344" width="128" height="76" fill="#ffd9a0" opacity="0.38" />
            <rect x="228" y="344" width="3" height="76" fill={t.dark} />
            <rect x="166" y="322" width="128" height="18" rx="2" fill="#fff" opacity="0.92" />
            <rect x="160" y="340" width="140" height="8" fill={t.accent} />
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <rect key={i} x={160 + i * 20} y="340" width="10" height="8" fill="#fff" opacity="0.75" />
            ))}
            <rect x="248" y="372" width="40" height="48" fill={t.dark} opacity="0.55" />
          </>
        ) : (
          <>
            <rect x="160" y="318" width="140" height="102" fill="#4b5663" />
            <rect x="160" y="318" width="140" height="102" fill={`url(#sh${id})`} />
            {/* a car parked under the porch */}
            <ellipse cx="232" cy="418" rx="66" ry="4" fill="#000" opacity="0.28" />
            <path d="M176 410 q0 -22 14 -26 l20 -2 q10 -20 28 -20 h30 q16 0 24 18 l12 4 q8 3 8 14 v12 z" fill="#d6dbe1" />
            <path d="M214 382 q8 -15 22 -15 h26 q12 0 19 15 z" fill="#5d7690" />
            <rect x="240" y="368" width="2.5" height="14" fill="#d6dbe1" />
            <rect x="283" y="395" width="8" height="5" rx="2" fill="#ffe7a8" />
            <circle cx="200" cy="411" r="9" fill="#1d2329" />
            <circle cx="200" cy="411" r="4" fill="#9aa3ad" />
            <circle cx="268" cy="411" r="9" fill="#1d2329" />
            <circle cx="268" cy="411" r="4" fill="#9aa3ad" />
          </>
        )}
        <rect x="150" y="318" width="12" height="102" fill={t.stone} />
        <rect x="298" y="318" width="12" height="102" fill={t.stone} />
        {/* first floor, cantilevered over the porch */}
        <rect x="210" y="190" width="490" height="120" fill={t.wall} />
        <rect x="210" y="190" width="490" height="120" fill={`url(#sh${id})`} opacity="0.18" />
        <rect x="150" y="305" width="550" height="9" fill={t.dark} />
        <rect x="205" y="182" width="500" height="10" fill={t.dark} />
        {style === 1 && (
          <>
            <polygon points="205,182 705,182 705,140 205,168" fill={t.dark} />
            <polygon points="205,168 705,140 705,146 205,175" fill={t.accent} opacity="0.9" />
          </>
        )}
        {style === 0 && <rect x="205" y="176" width="500" height="6" fill={t.accent} />}

        {/* wood slat panel */}
        <rect x="515" y="192" width="185" height="113" fill={`url(#w${id})`} />
        {slats.map((x) => (
          <rect key={x} x={x} y="192" width="2" height="113" fill="#000" opacity="0.16" />
        ))}

        {/* first-floor windows */}
        <rect x="236" y="214" width="170" height="78" fill={t.dark} />
        <rect x="241" y="219" width="160" height="68" fill={glass} />
        {[1, 2].map((i) => (
          <rect key={i} x={241 + (160 / 3) * i - 1.5} y="219" width="3" height="68" fill={t.dark} />
        ))}
        <rect x="241" y="219" width="160" height="22" fill="#fff" opacity="0.14" />
        <rect x="428" y="212" width="70" height="80" fill={t.dark} />
        <rect x="433" y="217" width="60" height="70" fill={glass} />
        <rect x="433" y="217" width="60" height="70" fill="#ffd9a0" opacity="0.25" />
        <rect x="462" y="217" width="3" height="70" fill={t.dark} />
        {/* glass balcony rail */}
        <rect x="418" y="268" width="90" height="38" fill="#cfe6f4" opacity="0.55" />
        <rect x="418" y="266" width="90" height="3" fill={t.dark} />

        {/* ground-floor windows and door */}
        <rect x="336" y="334" width="136" height="62" fill={t.dark} />
        <rect x="341" y="339" width="126" height="52" fill={glass} />
        <rect x="402" y="339" width="3" height="52" fill={t.dark} />
        <rect x="341" y="339" width="126" height="16" fill="#fff" opacity="0.14" />
        <rect x="341" y="339" width="126" height="52" fill="#ffd9a0" opacity="0.22" />
        <rect x="518" y="326" width="92" height="94" fill={t.dark} />
        <rect x="524" y="332" width="50" height="88" fill={`url(#w${id})`} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x="524" y={340 + i * 13} width="50" height="1.5" fill="#000" opacity="0.18" />
        ))}
        <rect x="578" y="332" width="26" height="88" fill={glass} />
        <circle cx="568" cy="378" r="2.6" fill="#e8d8b0" />
        <rect x="508" y="318" width="112" height="8" fill={t.dark} />
        <rect x="498" y="414" width="132" height="6" fill={t.stone} />
        <rect x="504" y="409" width="120" height="5" fill="#b4afa6" />
        {style === 2 && (
          <>
            <rect x="496" y="190" width="14" height="128" fill={t.wall2} />
            <rect x="620" y="190" width="14" height="128" fill={t.wall2} />
            <rect x="490" y="304" width="150" height="8" fill={t.dark} />
          </>
        )}
        {/* stone plinth strip */}
        <rect x="310" y="400" width="350" height="20" fill={t.stone} opacity="0.55" />

        {/* planter and shrubs */}
        <rect x="640" y="396" width="62" height="24" rx="3" fill={t.stone} />
        <circle cx="655" cy="388" r="15" fill="#5f9a4a" />
        <circle cx="678" cy="386" r="18" fill="#6aa955" />
        <circle cx="695" cy="394" r="11" fill="#58903f" />
      </g>

      {/* boundary wall and gate */}
      <rect x="20" y="398" width="115" height="22" fill="#d8d3ca" />
      <rect x="16" y="394" width="123" height="5" fill="#bdb7ac" />
      <rect x="690" y="398" width="100" height="22" fill="#d8d3ca" />
      <rect x="686" y="394" width="108" height="5" fill="#bdb7ac" />
      <g stroke={t.dark} strokeWidth="3" opacity="0.9">
        {Array.from({ length: 9 }, (_, i) => 150 + i * 6).map((x) => (
          <line key={x} x1={x} y1="400" x2={x} y2="420" />
        ))}
      </g>

      {/* trees */}
      <g>
        <rect x="52" y="330" width="7" height="70" fill="#6b4a33" />
        <circle cx="56" cy="318" r="34" fill="#5f9a4a" />
        <circle cx="38" cy="334" r="22" fill="#6aa955" />
        <circle cx="76" cy="332" r="22" fill="#58903f" />
        <rect x="748" y="344" width="6" height="54" fill="#6b4a33" />
        <circle cx="751" cy="330" r="28" fill="#6aa955" />
        <circle cx="768" cy="344" r="17" fill="#58903f" />
      </g>
      {/* ground shadow */}
      <rect y={G} width="800" height="8" fill="#000" opacity="0.06" />
    </svg>
  );
}
