"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity, LayoutGrid, NotebookPen } from "lucide-react";
import { useRef, useState } from "react";
import { AxisChart } from "@/components/ui/axis-chart";
import { MiniChart } from "@/components/ui/mini-chart";
import { StatCard } from "@/components/ui/stat-card";
import { easeOut } from "@/lib/animations";
import { axes, journal, overview, week } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "analysis", label: "Analysis", icon: Activity },
  { id: "journal", label: "Journal", icon: NotebookPen },
] as const;

type TabId = (typeof tabs)[number]["id"];

function Journal() {
  const [selected, setSelected] = useState<string>(journal[0].id);
  return (
    <div className="h-full overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-left text-[14px]">
        <caption className="sr-only">Recent recordings, synthetic data</caption>
        <thead>
          <tr className="font-mono text-[11px] uppercase tracking-[0.08em] text-faint">
            <th className="pb-3 font-normal">Date</th>
            <th className="pb-3 font-normal">Length</th>
            <th className="pb-3 font-normal">Peak Hz</th>
            <th className="pb-3 font-normal">Vibration</th>
            <th className="pb-3 font-normal">Note</th>
          </tr>
        </thead>
        <tbody>
          {journal.map((r) => (
            <tr
              key={r.id}
              onClick={() => setSelected(r.id)}
              className={cn(
                "cursor-pointer border-t border-line transition-colors hover:bg-ink/[0.03]",
                selected === r.id && "bg-ink/[0.05]"
              )}
            >
              <td className="py-3.5 pr-4">
                <button type="button" className="text-left" onClick={() => setSelected(r.id)} aria-pressed={selected === r.id}>
                  {r.date} <span className="font-mono text-[12px] text-muted">{r.time}</span>
                </button>
              </td>
              <td className="py-3.5 pr-4 font-mono">{r.length}</td>
              <td className="py-3.5 pr-4 font-mono">{r.hz}</td>
              <td className="py-3.5 pr-4">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 font-mono text-[12px]",
                    r.vibration === "On" ? "bg-accent/15 text-[#ff8a6b]" : "bg-ink/10 text-muted"
                  )}
                >
                  {r.vibration}
                </span>
              </td>
              <td className="py-3.5 text-muted">{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AppDemo() {
  const [tab, setTab] = useState<TabId>("overview");
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
    const next = tabs[(i + dir + tabs.length) % tabs.length];
    setTab(next.id);
    refs.current[next.id]?.focus();
  };

  return (
    <section id="app" aria-labelledby="app-title" className="screen border-t border-line" style={{ ["--h" as string]: 1 }}>
      <div className="wrap flex flex-1 flex-col">
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12 lg:gap-6">
          <h2 id="app-title" className="h2 lg:col-span-6">
            Prototype recordings, plotted on three axes
          </h2>
          <p className="lead lg:col-span-6 lg:max-w-none">
            The companion app plots each session as X, Y and Z movement and keeps a journal. The numbers here are synthetic.
          </p>
        </div>

        {/* app-frame */}
        <div data-ui className="app-frame mt-10 flex min-h-[520px] flex-col overflow-hidden lg:h-[520px] rounded-[var(--radius-lg)] border border-line-strong bg-surface shadow-[0_40px_120px_-50px_rgb(0_0_0/0.9)] lg:mt-12">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3 md:px-5">
            <div className="flex items-center gap-2.5">
              <svg width="22" height="22" viewBox="0 0 64 64" aria-hidden="true">
                <rect width="64" height="64" rx="14" fill="var(--surface-2)" />
                <path d="M10 34h9l4-12 6 22 6-26 5 20 4-8h9" fill="none" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[14px] font-medium">BraceMotion account</span>
            </div>
            <span className="rounded-full border border-line-strong px-3 py-1 font-mono text-[11px] text-muted">Synthetic demo data</span>
          </div>

          <div className="flex min-h-0 flex-1 flex-col md:flex-row">
            <div
              role="tablist"
              aria-label="App views"
              aria-orientation="vertical"
              className="flex gap-1 border-b border-line p-2 md:w-52 md:flex-col md:border-b-0 md:border-r md:p-3"
            >
              {tabs.map((t, i) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    ref={(el) => {
                      refs.current[t.id] = el;
                    }}
                    role="tab"
                    id={`tab-${t.id}`}
                    aria-selected={active}
                    aria-controls={`panel-${t.id}`}
                    tabIndex={active ? 0 : -1}
                    onClick={() => setTab(t.id)}
                    onKeyDown={(e) => onKey(e, i)}
                    className={cn(
                      "flex min-h-11 flex-1 items-center justify-center gap-2.5 rounded-xl px-2 text-[14px] transition-colors sm:px-3 md:flex-none md:justify-start",
                      active ? "bg-ink/[0.08] text-ink" : "text-muted hover:bg-ink/[0.04] hover:text-ink"
                    )}
                  >
                    <Icon size={16} aria-hidden="true" className={cn("max-[359px]:hidden", active && "text-accent")} />
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div className="relative min-h-0 flex-1 overflow-auto p-4 md:p-6">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={tab}
                  id={`panel-${tab}`}
                  role="tabpanel"
                  aria-labelledby={`tab-${tab}`}
                  className="h-full"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.28, ease: easeOut } }}
                  exit={{ opacity: 0, y: -4, transition: { duration: 0.17 } }}
                >
                  {tab === "overview" && (
                    <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-5">
                      <StatCard
                        className="xl:col-span-3"
                        title="This week"
                        stats={overview}
                        bars={week.map((d) => ({ label: d.day, value: d.minutes }))}
                        barUnit="synthetic data"
                      />
                      <div className="flex flex-col justify-between rounded-2xl border border-line bg-bg/60 p-5 md:p-6 xl:col-span-2">
                        <div>
                          <p className="text-[15px] font-medium">Last recording</p>
                          <p className="mt-1 font-mono text-[12px] text-muted">Fri 14 · 09:12 · 8:05 min</p>
                        </div>
                        <MiniChart
                          points={axes[0].points.slice(0, 120)}
                          label="X axis over the first three seconds of the last recording, synthetic data"
                          className="my-5 h-24 w-full flex-1"
                        />
                        <dl className="grid grid-cols-2 gap-4">
                          <div>
                            <dt className="text-[12px] text-muted">Peak, X axis</dt>
                            <dd className="mt-1 text-[28px] font-medium tracking-[-0.03em]">
                              {axes[0].peak} <span className="font-mono text-[12px] text-muted">°/s</span>
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[12px] text-muted">Vibration</dt>
                            <dd className="mt-1 text-[28px] font-medium tracking-[-0.03em]">On</dd>
                          </div>
                        </dl>
                        <button
                          type="button"
                          onClick={() => setTab("analysis")}
                          className="btn btn-ghost mt-6 w-full !min-h-11 text-[14px]"
                        >
                          Open the recording
                        </button>
                      </div>
                    </div>
                  )}
                  {tab === "analysis" && <AxisChart />}
                  {tab === "journal" && <Journal />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
