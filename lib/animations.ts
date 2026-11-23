// Shared motion tokens (house standard).
export const spring = { type: "spring", stiffness: 280, damping: 22 } as const;
export const easeOut = [0.22, 1, 0.36, 1] as const;
export const enter = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: easeOut, delay },
});
