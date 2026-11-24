// Adapted from Motion Primitives by ibelick, MIT. See licenses/MOTION-PRIMITIVES-LICENCE.
// The source's motion values, distance falloff and spring are retained. Pointer
// listeners are local; reduced motion, keyboard focus and coarse pointers stay still.
'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react';
export function Magnetic({children, intensity = 0.16, range = 180}: {children: ReactNode; intensity?: number; range?: number}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const x = useMotionValue(0), y = useMotionValue(0);
  const springX = useSpring(x, {stiffness: 160, damping: 22, mass: 0.25});
  const springY = useSpring(y, {stiffness: 160, damping: 22, mass: 0.25});
  useEffect(() => {
    const node = ref.current;
    if (!node || reduced || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const reset = () => {x.set(0); y.set(0);};
    const move = (e: PointerEvent) => {
      if (node.matches(':focus-within')) return reset();
      const r = node.getBoundingClientRect();
      const dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2;
      const distance = Math.hypot(dx, dy), scale = Math.max(0, 1 - distance / range);
      x.set(Math.max(-6, Math.min(6, dx * intensity * scale)));
      y.set(Math.max(-6, Math.min(6, dy * intensity * scale)));
    };
    node.addEventListener('pointermove', move);
    node.addEventListener('pointerleave', reset);
    node.addEventListener('focusin', reset);
    return () => {node.removeEventListener('pointermove', move); node.removeEventListener('pointerleave', reset); node.removeEventListener('focusin', reset); reset();};
  }, [intensity, range, reduced, x, y]);
  return <motion.div className="magnetic-wrap" ref={ref} style={{x: reduced ? 0 : springX, y: reduced ? 0 : springY}}>{children}</motion.div>;
}
