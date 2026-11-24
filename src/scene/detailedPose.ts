/** Presentation transforms, not an assembly drawing or a measured V4 wiring map. */
export type Triple = [number, number, number];
export type DetailPart = 'lid' | 'controller' | 'sensor' | 'motor' | 'power';
export interface PartPose { position: Triple; rotation: Triple; scale: number }
export const PART_INTERVALS: Record<DetailPart, readonly [number, number]> = {
  lid: [.2, .25], controller: [.28, .365], sensor: [.40, .495], motor: [.53, .625], power: [.66, .765],
};
const clamp = (n: number) => Math.min(1, Math.max(0, n));
/** Quintic easing ends with zero velocity and acceleration, leaving each chapter a reading pause. */
export function detailPhase(p: number, start: number, end: number) {
  const t = clamp(((Number.isFinite(p) ? p : 0) - start) / (end - start));
  return t * t * t * (t * (t * 6 - 15) + 10);
}
const REST: Record<DetailPart, Triple> = {
  lid: [0, 0, .30], controller: [.29, -.01, .01], sensor: [-.68, .27, .07], motor: [.73, -.56, .07], power: [-.30, -.11, -.10],
};
const OPEN: Record<DetailPart, Triple> = {
  lid: [-1.65, 2.60, .68], controller: [1.16, 2.52, .84], sensor: [2.50, 1.00, .84], motor: [-2.63, .94, .74], power: [.10, -2.00, .80],
};
export function detailPose(part: DetailPart, progress: number): PartPose {
  const t = detailPhase(progress, ...PART_INTERVALS[part]);
  const rest = REST[part], open = OPEN[part];
  return {
    position: rest.map((value, index) => value + (open[index] - value) * t) as Triple,
    // Small, fixed tilts reveal thickness while every soldered subcomponent travels as one unit.
    rotation: [t * (part === 'lid' ? -.13 : .09), t * (part === 'motor' ? -.18 : -.06), t * (part === 'lid' ? -.12 : .09)],
    scale: 1 + t * (part === 'controller' ? .48 : part === 'sensor' ? .60 : part === 'motor' ? .60 : .06),
  };
}
export function strapOpening(progress: number) { return detailPhase(progress, .1, .16); }
export const DETAIL_LABELS = [
  ['BraceMotion / V4', 'Prototype based on source photographs'],
  ['Fabric strap', 'Holds the device on the wrist'],
  ['Removable lid', 'Covers the internal components'],
  ['ESP32-C3 SuperMini', 'Coordinates device operation'],
  ['MPU6050', 'Measures acceleration and angular velocity'],
  ['Vibration motor', 'Converts an electrical signal into vibration'],
  ['Battery and power', 'Supply power to the electronics'],
  ['Prototype architecture', 'Illustrative component arrangement'],
] as const;
