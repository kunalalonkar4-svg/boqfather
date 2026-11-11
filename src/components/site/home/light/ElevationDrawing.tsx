/** A clean architectural front view, drawn to the plot's frontage. G+1, parking on the left, balcony above. */
export function ElevationDrawing({ w, label, className = "" }: { w: number; label?: string; className?: string }) {
  const bw = Math.min(330, 110 + w * 4.4);
  const x0 = (400 - bw) / 2;
  const gy = 226; // ground line
  const fh = 66; // storey height
  const top = gy - fh * 2;
  const gw = bw * 0.46; // parking bay
  const dx = x0 + gw + (bw - gw) * 0.22; // front door
  const win = (x: number, y: number, ww: number, hh: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={ww} height={hh} fill="#9fc0e6" stroke="#1b2b44" strokeWidth="1.4" />
      <path d={`M${x + ww / 2} ${y}V${y + hh}M${x} ${y + hh * 0.62}H${x + ww}`} stroke="#1b2b44" strokeWidth="1" />
      <path d={`M${x + 2} ${y + 3}L${x + ww * 0.4} ${y + 3}L${x + 2} ${y + hh * 0.35}Z`} fill="#fff" opacity=".45" />
    </g>
  );
  const jx = x0 + bw * 0.58;
  const jw = bw * 0.34;
  return (
    <svg viewBox="-40 0 480 260" role="img" aria-label={label ?? `Front elevation of a ${w} ft frontage house`} className={className}>
      <defs>
        <linearGradient id="eg-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3eeff" />
          <stop offset="1" stopColor="#f7faff" />
        </linearGradient>
        <pattern id="eg-jaali" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M4 0L8 4L4 8L0 4Z" fill="none" stroke="#c88a3c" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="-40" width="480" height="260" fill="url(#eg-sky)" />
      {/* trees */}
      <g>
        <rect x={x0 - 22} y={gy - 34} width="4" height="34" fill="#6b4a2b" />
        <circle cx={x0 - 20} cy={gy - 46} r="20" fill="#7fb77e" />
        <rect x={x0 + bw + 18} y={gy - 28} width="4" height="28" fill="#6b4a2b" />
        <circle cx={x0 + bw + 20} cy={gy - 38} r="16" fill="#8cc58a" />
      </g>
      {/* water tank + parapet */}
      <rect x={x0 + bw * 0.7} y={top - 24} width="26" height="16" rx="3" fill="#cfd8e6" stroke="#1b2b44" strokeWidth="1.2" />
      <rect x={x0 - 4} y={top - 8} width={bw + 8} height="8" fill="#dfe5ef" stroke="#1b2b44" strokeWidth="1.4" />
      {/* first floor */}
      <rect x={x0} y={top} width={bw} height={fh} fill="#f1ede4" stroke="#1b2b44" strokeWidth="1.6" />
      <rect x={jx} y={top + 10} width={jw} height={fh - 20} fill="#5b3a1e" />
      <rect x={jx} y={top + 10} width={jw} height={fh - 20} fill="url(#eg-jaali)" />
      <rect x={jx} y={top + 10} width={jw} height={fh - 20} fill="none" stroke="#1b2b44" strokeWidth="1.2" />
      {win(x0 + bw * 0.08, top + 12, bw * 0.16, fh - 24)}
      {win(x0 + bw * 0.31, top + 12, bw * 0.16, fh - 24)}
      {/* balcony slab with glass railing */}
      <rect x={x0 - 6} y={top + fh - 2} width={bw * 0.56} height="7" fill="#c9a574" stroke="#1b2b44" strokeWidth="1.2" />
      {/* ground floor */}
      <rect x={x0} y={top + fh + 5} width={bw} height={fh - 5} fill="#e6e0d3" stroke="#1b2b44" strokeWidth="1.6" />
      <rect x={x0 + 6} y={top + fh + 12} width={gw - 12} height={fh - 12} fill="#d9dee7" stroke="#1b2b44" strokeWidth="1.2" />
      {Array.from({ length: Math.max(4, Math.round(gw / 12)) }).map((_, i, a) => (
        <path key={i} d={`M${x0 + 6 + ((gw - 12) / (a.length)) * (i + 0.5)} ${top + fh + 12}v${fh - 12}`} stroke="#1b2b44" strokeWidth="1.4" />
      ))}
      <rect x={dx} y={top + fh + 16} width="26" height={fh - 16} fill="#7a4a24" stroke="#1b2b44" strokeWidth="1.3" />
      <circle cx={dx + 21} cy={top + fh + 16 + (fh - 16) / 2} r="1.8" fill="#f2c15c" />
      {win(dx + 40, top + fh + 20, bw * 0.12, 26)}
      {/* ground, steps, gate line */}
      <rect x="-40" y={gy} width="480" height="34" fill="#cfd5df" />
      <path d={`M-40 ${gy}H440`} stroke="#1b2b44" strokeWidth="1.6" />
      <rect x={dx - 4} y={gy - 4} width="34" height="4" fill="#b8bfcc" />
      {/* frontage dimension */}
      <g stroke="#146ef5" strokeWidth="1.2" fill="none">
        <path d={`M${x0} ${gy + 16}H${x0 + bw}M${x0} ${gy + 11}V${gy + 21}M${x0 + bw} ${gy + 11}V${gy + 21}`} />
      </g>
      <rect x="176" y={gy + 9} width="48" height="16" rx="3" fill="#fff" />
      <text x="200" y={gy + 21} textAnchor="middle" fontSize="11" fontWeight="700" fill="#146ef5" fontFamily="Inter, system-ui, sans-serif">
        {w} ft
      </text>
    </svg>
  );
}
