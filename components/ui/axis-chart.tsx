"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { AXIS_LIMIT, DURATION_S, axes, toPath } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const W = 640;
const H = 240;

/** Three-axis movement chart. Axes can be switched off; lines draw in once when the chart is first seen. */
export function AxisChart() {
  const [visible, setVisible] = useState<Record<string, boolean>>({ X: true, Y: true, Z: true });

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[15px] font-medium">Recording · Fri 14, 09:12</p>
          <p className="font-mono text-[12px] text-muted">Angular velocity, °/s · first {DURATION_S} s</p>
        </div>
        <div className="flex gap-2" role="group" aria-label="Show or hide an axis">
          {axes.map((a) => (
            <button
              key={a.axis}
              type="button"
              aria-pressed={visible[a.axis]}
              onClick={() => setVisible((v) => ({ ...v, [a.axis]: !v[a.axis] }))}
              className={cn(
                "flex min-h-11 items-center gap-2 rounded-full border px-3.5 font-mono text-[13px] transition-colors",
                visible[a.axis] ? "border-line-strong text-ink" : "border-line text-faint"
              )}
            >
              <span className="size-2.5 rounded-full" style={{ background: visible[a.axis] ? a.color : "transparent", border: `1px solid ${a.color}` }} />
              {a.axis}
              <span className="text-muted">{a.peak}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-5 min-h-[200px] flex-1">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" role="img" aria-label="Line chart of X, Y and Z angular velocity over ten seconds, synthetic data">
          {[-AXIS_LIMIT, -AXIS_LIMIT / 2, 0, AXIS_LIMIT / 2, AXIS_LIMIT].map((v) => {
            const y = H / 2 - (v / AXIS_LIMIT) * (H / 2);
            return (
              <line
                key={v}
                x1={0}
                x2={W}
                y1={y}
                y2={y}
                style={{ stroke: v === 0 ? "var(--line-strong)" : "var(--line)" }}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
          {axes.map((a) => (
            <motion.path
              key={a.axis}
              d={toPath(a.points, W, H)}
              fill="none"
              strokeWidth={a.axis === "X" ? 1.6 : 1.2}
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1.4, ease: "easeOut" }}
              style={{
                stroke: a.color,
                strokeOpacity: a.axis === "Y" ? 0.75 : 1,
                opacity: visible[a.axis] ? 1 : 0,
                transition: "opacity 200ms",
              }}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex flex-col justify-between py-0 font-mono text-[11px] text-faint">
          <span>+{AXIS_LIMIT}</span>
          <span>0</span>
          <span>−{AXIS_LIMIT}</span>
        </div>
      </div>
      <div className="mt-2 flex justify-between font-mono text-[11px] text-faint" aria-hidden="true">
        {[0, 2, 4, 6, 8, 10].map((s) => (
          <span key={s}>{s} s</span>
        ))}
      </div>
    </div>
  );
}
