// Background Paths from 21st.dev (supplied by the owner: "добавь такое на вход и страницу входа сайта").
// The floating paths keep the component's geometry and widths. The flow runs in CSS with a random
// phase per line, so some lines are always moving and no element gets its own GPU layer.
import { type CSSProperties, useMemo } from "react";

function FloatingPaths({ position, count }: { position: number; count: number }) {
  const paths = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const duration = 14 + Math.random() * 10;
        return {
          id: i,
          d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
          width: 0.5 + i * 0.03,
          style: {
            "--a": 0.1 + i * 0.03,
            animationDuration: `${duration}s, ${7 + Math.random() * 5}s`,
            animationDelay: `-${Math.random() * duration}s, -${Math.random() * 6}s`,
          } as CSSProperties,
        };
      }),
    [count, position],
  );
  return (
    <svg className="bm-paths-layer" viewBox="0 0 696 316" fill="none">
      {paths.map((path) => (
        <path key={path.id} d={path.d} stroke="currentColor" strokeWidth={path.width} pathLength={1} style={path.style} />
      ))}
    </svg>
  );
}

export function BackgroundPaths({ className = "", count = 36 }: { className?: string; count?: number }) {
  return (
    <div className={`bm-paths ${className}`} aria-hidden="true">
      <FloatingPaths position={1} count={count} />
      <FloatingPaths position={-1} count={count} />
    </div>
  );
}

export default BackgroundPaths;
