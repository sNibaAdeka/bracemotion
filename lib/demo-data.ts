// Synthetic demo data for the app preview. Deterministic, so the static export
// and the browser render the same numbers. Not sensor readings, not patient data.

function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export interface AxisSeries {
  axis: "X" | "Y" | "Z";
  color: string;
  points: number[];
  peak: number;
}

const SAMPLES = 400; // 10 s at 40 samples a second
export const DURATION_S = 10;

function series(seed: number, amp: number, phase: number, hz: number): number[] {
  const rnd = lcg(seed);
  const out: number[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const t = (i / SAMPLES) * DURATION_S;
    const envelope = 0.65 + 0.35 * Math.sin(t * 0.9 + phase);
    const v = amp * envelope * Math.sin(2 * Math.PI * hz * t + phase) + (rnd() - 0.5) * amp * 0.35;
    out.push(Math.round(v * 10) / 10);
  }
  return out;
}

const raw: Array<Omit<AxisSeries, "peak">> = [
  { axis: "X", color: "var(--axis-x)", points: series(7, 38, 0.2, 5.2) },
  { axis: "Y", color: "var(--axis-y)", points: series(19, 22, 1.4, 5.2) },
  { axis: "Z", color: "var(--axis-z)", points: series(31, 12, 2.6, 5.2) },
];

export const axes: AxisSeries[] = raw.map((a) => ({
  ...a,
  peak: Math.round(Math.max(...a.points.map(Math.abs))),
}));

export const AXIS_LIMIT = 60;

export function toPath(points: number[], w: number, h: number, limit = AXIS_LIMIT): string {
  const step = w / (points.length - 1);
  return points
    .map((v, i) => {
      const x = (i * step).toFixed(1);
      const y = (h / 2 - (v / limit) * (h / 2)).toFixed(1);
      return `${i === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");
}

export const week = [
  { day: "Mon", minutes: 14 },
  { day: "Tue", minutes: 6 },
  { day: "Wed", minutes: 19 },
  { day: "Thu", minutes: 8 },
  { day: "Fri", minutes: 12 },
  { day: "Sat", minutes: 0 },
  { day: "Sun", minutes: 1 },
];

export const overview = [
  { title: "Recordings", value: "9", unit: "this week" },
  { title: "Average session", value: "6:40", unit: "min" },
  { title: "Dominant frequency", value: "5.2", unit: "Hz" },
];

export interface JournalEntry {
  id: string;
  date: string;
  time: string;
  length: string;
  hz: string;
  vibration: "On" | "Off";
  note: string;
}

export const journal: JournalEntry[] = [
  { id: "r14", date: "Fri 14", time: "09:12", length: "8:05", hz: "5.2", vibration: "On", note: "Morning, before coffee" },
  { id: "r13", date: "Thu 13", time: "19:40", length: "4:30", hz: "5.4", vibration: "Off", note: "Writing task" },
  { id: "r12", date: "Wed 12", time: "10:05", length: "9:50", hz: "5.1", vibration: "On", note: "Cup test, both hands" },
  { id: "r11", date: "Wed 12", time: "08:20", length: "6:15", hz: "5.3", vibration: "Off", note: "Baseline" },
  { id: "r10", date: "Mon 10", time: "18:55", length: "7:00", hz: "5.0", vibration: "On", note: "Evening walk" },
];
