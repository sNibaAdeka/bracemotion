/** Lycoris's held, scroll-scrubbed frame grammar, adapted to eight product chapters.
 * Pure absolute transforms: reverse scroll reconstructs the same camera and type.
 */
export const BRACE_STOPS = [0, .15, .25, .365, .495, .625, .765, .95] as const;
export const clamp01 = (value: number) => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
export const easeInOut = (t: number) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const smoothstep = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export function braceSceneCoord(progress: number) {
  const p = clamp01(progress);
  if (p >= BRACE_STOPS[7]) return 7;
  const i = BRACE_STOPS.findIndex((stop, index) => index < 7 && p >= stop && p < BRACE_STOPS[index + 1]);
  if (i < 0) return 0;
  const local = (p - BRACE_STOPS[i]) / (BRACE_STOPS[i + 1] - BRACE_STOPS[i]);
  // 34% of every interval is held, as in the supplied Lycoris reference.
  return i + easeInOut(clamp01((local - .17) / .66));
}
export function braceReveal(coord: number, scene: number, delay = 0) {
  const d = coord - scene;
  const lag = d < 0 ? delay : 1 - delay;
  return clamp01((.6 - Math.abs(d) - lag * .2) / .25);
}
export const chapterForProgress = (progress: number) => Math.min(7, Math.round(braceSceneCoord(progress)));
export type BraceCameraKey = { x: number; y: number; z: number; size: number };
// One continuous turn leads into the crown; later holds stay front-readable
// while looking alternately above and below the emerging assemblies.
const turn=Math.PI*2;
const CAMERA_KEYS: BraceCameraKey[] = [
  {x: -.55, y: .45, z: -.18, size: 1.02},
  {x: -.92, y: turn+.10, z: .18, size: .88},
  {x: -.15, y: turn+.16, z: -.015, size: .90},
  {x: -.15, y: turn+.16, z: -.015, size: .96},
  {x: -.15, y: turn+.16, z: -.015, size: .94},
  {x: -.15, y: turn+.16, z: -.015, size: .95},
  {x: -.15, y: turn+.16, z: -.015, size: .91},
  {x: -.22, y: turn+.16, z: -.06, size: .96},
];
export function braceCameraAt(progress: number): BraceCameraKey {
  const coord = braceSceneCoord(progress), i = Math.floor(coord), j = Math.min(7, i + 1), f = coord - i;
  const a = CAMERA_KEYS[i], b = CAMERA_KEYS[j];
  return { x: a.x + (b.x-a.x)*f, y: a.y + (b.y-a.y)*f, z: a.z + (b.z-a.z)*f, size: a.size + (b.size-a.size)*f };
}
