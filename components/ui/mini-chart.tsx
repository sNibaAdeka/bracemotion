/**
 * Small single-series line, in the spirit of the 21st.dev "mini-chart":
 * no axes, a soft fill under the line.
 */
interface MiniChartProps {
  points: number[];
  label: string;
  className?: string;
}

export function MiniChart({ points, label, className }: MiniChartProps) {
  const W = 300;
  const H = 90;
  const step = Math.max(1, Math.floor(points.length / 120));
  const pts = points.filter((_, i) => i % step === 0);
  const max = Math.max(...pts.map(Math.abs), 1);
  const xy = pts.map((v, i) => [(i / (pts.length - 1)) * W, H / 2 - (v / max) * (H / 2 - 4)] as const);
  const line = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${W} ${H} L0 ${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={className} role="img" aria-label={label}>
      <defs>
        <linearGradient id="mini-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--accent)", stopOpacity: 0.22 }} />
          <stop offset="100%" style={{ stopColor: "var(--accent)", stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#mini-fill)" />
      <path d={line} fill="none" style={{ stroke: "var(--accent)" }} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
