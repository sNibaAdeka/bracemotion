"use client";

/**
 * Adapted from the 21st.dev "background-paths" component.
 * Changes: the strands are always drawn in full at low contrast (so the ground
 * is never empty, paused or under reduced motion) and short bright segments
 * travel along every third strand; one strand runs in the accent colour;
 * deterministic durations (no Math.random) so the static export hydrates cleanly;
 * a pause switch for the endless loop; phones get the still lines.
 */
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/** Motion only where the pause switch is shown (640px and up); phones get the still lines. */
function useWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return wide;
}

function FloatingPaths({ position, paused }: { position: number; paused: boolean }) {
  const reduced = useReducedMotion();
  const wide = useWide();
  const still = paused || !!reduced || !wide;

  const paths = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${
      312 - i * 5 * position
    } ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
    accent: position === 1 && i === 22,
    travels: i % 3 === 0 || (position === 1 && i === 22),
    duration: 9 + ((i * 7) % 8),
    delay: (i * 0.37) % 4,
  }));

  return (
    <svg className="h-full w-full" viewBox="0 0 696 316" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      {paths.map((p) => (
        <path
          key={`base-${p.id}`}
          d={p.d}
          strokeWidth={p.width}
          style={{ stroke: p.accent ? "var(--accent)" : "var(--ink)", strokeOpacity: p.accent ? 0.35 : 0.035 + p.id * 0.006 }}
        />
      ))}
      {!still &&
        paths
          .filter((p) => p.travels)
          .map((p) => (
            <motion.path
              key={`run-${p.id}`}
              d={p.d}
              strokeWidth={p.accent ? 1.6 : p.width + 0.3}
              strokeLinecap="round"
              style={{ stroke: p.accent ? "var(--accent)" : "var(--ink)", strokeOpacity: p.accent ? 0.95 : 0.35 }}
              initial={{ pathLength: 0.08, pathOffset: 0 }}
              animate={{ pathOffset: [0, 0.92] }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
          ))}
    </svg>
  );
}

export function BackgroundPaths({ paused = false }: { paused?: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden [mask-image:radial-gradient(ellipse_62%_95%_at_80%_55%,#000_35%,transparent_80%)] max-lg:[mask-image:radial-gradient(ellipse_120%_45%_at_50%_22%,#000_30%,transparent_80%)]">
      <div className="absolute inset-0">
        <FloatingPaths position={1} paused={paused} />
      </div>
      <div className="absolute inset-0">
        <FloatingPaths position={-1} paused={paused} />
      </div>
    </div>
  );
}
