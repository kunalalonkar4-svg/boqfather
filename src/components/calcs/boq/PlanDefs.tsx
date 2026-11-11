/** Floor-material patterns (units are metres, like the plan) and the drawing frame with blue corners. */
export function PlanDefs({ id }: { id: string }) {
  const k = (n: string) => `pt-${id}-${n}`;
  return (
    <defs>
      <pattern id={k("wood")} width="1.2" height="0.3" patternUnits="userSpaceOnUse">
        <rect width="1.2" height="0.3" fill="#c9965f" />
        <rect width="1.2" height="0.3" fill="none" stroke="#a9763f" strokeWidth="0.012" />
        <path d="M0.6 0V0.3" stroke="#a9763f" strokeWidth="0.01" />
        <path d="M0.05 0.1H0.5M0.7 0.2H1.15" stroke="#d8aa78" strokeWidth="0.012" />
      </pattern>
      <pattern id={k("marble")} width="1.2" height="1.2" patternUnits="userSpaceOnUse">
        <rect width="1.2" height="1.2" fill="#efedea" />
        <path d="M0 0.2C0.3 0.35 0.45 0.1 0.7 0.3S1.0 0.5 1.2 0.4M0.2 1.2C0.3 0.9 0.6 0.95 0.75 0.7S1.0 0.8 1.2 1" fill="none" stroke="#cfcac4" strokeWidth="0.012" />
        <path d="M0.6 0V1.2M0 0.6H1.2" stroke="#e1ddd8" strokeWidth="0.008" />
      </pattern>
      <pattern id={k("tile")} width="0.6" height="0.6" patternUnits="userSpaceOnUse">
        <rect width="0.6" height="0.6" fill="#f1f0ec" />
        <path d="M0 0H0.6V0.6" fill="none" stroke="#cdcac3" strokeWidth="0.012" />
      </pattern>
      <pattern id={k("tileBlue")} width="0.3" height="0.3" patternUnits="userSpaceOnUse">
        <rect width="0.3" height="0.3" fill="#b9cfe6" />
        <path d="M0 0H0.3V0.3" fill="none" stroke="#8fb0d2" strokeWidth="0.01" />
      </pattern>
      <pattern id={k("paver")} width="0.5" height="0.25" patternUnits="userSpaceOnUse">
        <rect width="0.5" height="0.25" fill="#c6c6c6" />
        <path d="M0 0H0.5M0.25 0V0.25M0 0.25H0.5" fill="none" stroke="#a4a4a4" strokeWidth="0.012" />
      </pattern>
      <pattern id={k("stone")} width="0.8" height="0.8" patternUnits="userSpaceOnUse">
        <rect width="0.8" height="0.8" fill="#e6dccf" />
        <path d="M0 0H0.8V0.8" fill="none" stroke="#cbbdab" strokeWidth="0.012" />
      </pattern>
      <pattern id={k("grass")} width="0.4" height="0.4" patternUnits="userSpaceOnUse">
        <rect width="0.4" height="0.4" fill="#7fb264" />
        <circle cx="0.1" cy="0.12" r="0.07" fill="#6ba052" />
        <circle cx="0.28" cy="0.3" r="0.08" fill="#92c276" />
      </pattern>
    </defs>
  );
}

/** Thin double border with blue squares in the corners, like a drawing sheet. */
export function PlanFrame({ b }: { b: { x: number; y: number; w: number; h: number } }) {
  const m = 0.12;
  const c = 0.55;
  const { x, y, w, h } = b;
  return (
    <g aria-hidden="true">
      <rect x={x + m} y={y + m} width={w - 2 * m} height={h - 2 * m} fill="none" stroke="#2a2a2a" strokeWidth="0.03" />
      <rect x={x + m * 2.4} y={y + m * 2.4} width={w - 4.8 * m} height={h - 4.8 * m} fill="none" stroke="#9aa4b2" strokeWidth="0.015" />
      {[
        [x + m, y + m],
        [x + w - m - c, y + m],
        [x + m, y + h - m - c],
        [x + w - m - c, y + h - m - c],
      ].map(([cx, cy], i) => (
        <rect key={i} x={cx} y={cy} width={c} height={c} fill="#3b6fb6" opacity="0.9" />
      ))}
    </g>
  );
}
