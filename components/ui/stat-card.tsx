"use client";

/**
 * Adapted from the 21st.dev "health-stat-card" component:
 * three headline stats over a bar graph whose bars spring up from the baseline.
 * Rewritten without shadcn tooltip; colours come from the page tokens.
 */
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface StatData {
  title: string;
  value: string;
  unit?: string;
}

export interface BarData {
  label: string;
  value: number;
}

interface StatCardProps {
  title: string;
  stats: StatData[];
  bars: BarData[];
  barUnit: string;
  className?: string;
}

export function StatCard({ title, stats, bars, barUnit, className }: StatCardProps) {
  const max = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div className={cn("flex flex-col rounded-2xl border border-line bg-bg/60 p-5 md:p-6", className)}>
      <p className="text-[15px] font-medium">{title}</p>

      <dl className="mt-5 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.title}>
            <dt className="text-[12px] leading-tight text-muted">{s.title}</dt>
            <dd className="mt-1.5 flex items-baseline gap-1">
              <span className="text-[28px] font-medium leading-none tracking-[-0.03em] md:text-[34px]">{s.value}</span>
              {s.unit && <span className="font-mono text-[12px] text-muted">{s.unit}</span>}
            </dd>
          </div>
        ))}
      </dl>

      <motion.ul
        className="mt-7 flex min-h-36 flex-1 items-end gap-2 md:gap-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.6 }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
        aria-label={`Minutes recorded per day, ${barUnit}`}
      >
        {bars.map((b) => (
          <li key={b.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span className="font-mono text-[11px] text-muted">{b.value}</span>
            <span className="relative w-full flex-1">
              <motion.span
                className={cn("absolute inset-x-0 bottom-0 block origin-bottom rounded-md", b.value === max ? "bg-accent" : "bg-ink/25")}
                style={{ height: `${Math.max((b.value / max) * 100, 3)}%` }}
                variants={{ hidden: { scaleY: 0 }, visible: { scaleY: 1, transition: { type: "spring", stiffness: 140, damping: 18 } } }}
              />
            </span>
            <span className="font-mono text-[11px] text-muted">{b.label}</span>
          </li>
        ))}
      </motion.ul>
    </div>
  );
}
