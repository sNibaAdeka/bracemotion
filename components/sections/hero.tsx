"use client";

import { ArrowRight, Pause, Play } from "lucide-react";
import { useState } from "react";
import { BackgroundPaths } from "@/components/ui/background-paths";

const facts = [
  { k: "Controller", v: "ESP32-C3" },
  { k: "Sensor", v: "MPU6050, 6-axis" },
  { k: "Output", v: "Coin vibration motor" },
  { k: "Power", v: "Li-Po, USB-C" },
];

/** CSS entrance (see .enter in globals.css): runs once on load, needs no JavaScript, rests under reduced motion. */
const d = (i: number) => ({ animationDelay: `${i * 80}ms` });

export function Hero() {
  const [paused, setPaused] = useState(false);

  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate overflow-hidden" data-enter>
      <BackgroundPaths paused={paused} />

      <div className="wrap relative z-[1] grid min-h-[100svh] grid-cols-1 content-start gap-6 pb-6 pt-[calc(var(--header-h)+16px)] sm:pb-12 lg:grid-cols-12 lg:content-center lg:items-start lg:gap-6 lg:pb-16 lg:pt-[calc(var(--header-h)+24px)]">
        <div className="hero-text lg:col-span-6 lg:pr-6">
          <p className="enter eyebrow mb-4 flex items-center gap-2.5 sm:mb-6" style={d(0)}>
            <span className="inline-block size-2 rounded-full bg-accent" aria-hidden="true" />
            Student research prototype · V4
          </p>

          <h1
            id="hero-title"
            className="enter text-[38px] font-medium leading-[1.02] tracking-[-0.04em] sm:text-[60px] xl:text-[72px]"
            style={{ ...d(1), textWrap: "balance" }}
          >
            A wrist-worn prototype for studying tremor
          </h1>

          <p className="enter lead mt-4 max-sm:text-[16px] sm:mt-6" style={d(2)}>
            BraceMotion reads hand movement with a six-axis sensor and answers with vibration from a small motor.
            The fourth build fits all of it into one case on a textile strap.
          </p>

          <div className="enter mt-7 flex flex-wrap gap-3 sm:mt-9" style={d(3)}>
            <a href="#inside" className="btn btn-primary max-sm:flex-1 max-sm:!px-[16px]">
              See inside the V4
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a href="#app" className="btn btn-ghost max-sm:flex-1 max-sm:!px-[16px]">
              Open the app
            </a>
          </div>

          <dl className="enter hairline mt-8 grid grid-cols-2 gap-x-6 gap-y-4 pt-5 sm:mt-12 sm:grid-cols-4 sm:pt-6" style={d(4)}>
            {facts.map((f) => (
              <div key={f.k}>
                <dt className="font-mono text-[12px] uppercase tracking-[0.08em] text-faint">{f.k}</dt>
                <dd className="mt-1.5 text-[15px] leading-snug">{f.v}</dd>
              </div>
            ))}
          </dl>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            className="enter mt-6 hidden min-h-11 items-center gap-2 rounded-full border border-line px-4 font-mono text-[12px] text-muted transition-colors hover:border-line-strong hover:text-ink sm:inline-flex"
            style={d(5)}
          >
            {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
            {paused ? "Play lines" : "Pause lines"}
          </button>
        </div>

        <div className="enter-photo order-first lg:order-none lg:col-span-6" style={d(1)}>
          <div data-product className="frame aspect-[16/9] w-full shadow-[0_40px_120px_-40px_rgb(0_0_0/0.8)] lg:aspect-square">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/prototype-v4-closed.webp"
              alt="BraceMotion V4: a compact white case with the name moulded into the lid, on a light textile strap"
              width={864}
              height={867}
              fetchPriority="high"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
