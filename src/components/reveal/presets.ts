/* Scroll reveals adapted from the owner's Forma Pilates Studio template (src/components/reveal). */
/** Reveal durations and delays are in milliseconds. */
export const revealPresets = {
  words: {
    duration: 700,
    stagger: 50,
    spread: 350,
    easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    from: { opacity: 0, filter: "blur(10px)" },
    to: { opacity: 1, filter: "blur(0px)" },
  },
  lines: {
    duration: 1000,
    stagger: 80,
    spread: 400,
    easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    from: { opacity: 0, translate: "0 40px" },
    to: { opacity: 1, translate: "0 0" },
  },
  lift: {
    duration: 1000,
    stagger: 0,
    spread: 0,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    from: { opacity: 0, translate: "0 40px" },
    to: { opacity: 1, translate: "0 0" },
  },
  action: {
    duration: 600,
    stagger: 0,
    spread: 0,
    easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    from: { opacity: 0, translate: "0 24px" },
    to: { opacity: 1, translate: "0 0" },
  },
} satisfies Record<
  string,
  {
    duration: number;
    stagger: number;
    spread: number;
    easing: string;
    from: Keyframe;
    to: Keyframe;
  }
>;

export type RevealVariant = keyof typeof revealPresets;

export const revealDelays = {
  heroTitle: 150,
  heroCopy: 250,
  heroActions: 550,
  action: 300,
};

export const revealDefaults = {
  groupStagger: 100,
  groupSpread: 400,
  maxDelay: 1000,
  // A pixel inset works for both tiny headings and elements taller than a screen.
  rootMargin: "0px 0px -24px 0px",
};

export function boundedDelay(value: number) {
  return Number.isFinite(value)
    ? Math.max(0, Math.min(value, revealDefaults.maxDelay))
    : 0;
}

/** Keep ordering, but bound the total wait when copy or list length grows. */
export function staggerDelay(
  index: number,
  last: number,
  step: number,
  cap: number,
) {
  return index * Math.min(step, cap / Math.max(1, last));
}

/** Tolerate fractional font metrics; measure visual lines, never hardcode breaks. */
export function lineIndices(tops: number[]) {
  const lines: number[] = [];
  return tops.map((top) => {
    const existing = lines.findIndex((line) => Math.abs(line - top) < 2);
    if (existing !== -1) return existing;
    lines.push(top);
    return lines.length - 1;
  });
}
