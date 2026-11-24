import { type RefObject, useLayoutEffect } from "react";
import { type RevealVariant, revealDefaults } from "./presets";
import { registerReveal } from "./runtime";

export interface RevealTarget {
  /** Elements to reveal, matched inside the scope. */
  selector: string;
  preset?: Exclude<RevealVariant, "words" | "lines">;
  /** Containers whose matched children stagger in DOM order. */
  group?: string;
  delay?: number;
}

/**
 * Element reveals for markup owned by other components (cards, grids, forms),
 * without adding wrappers that would change their grid or flex layout.
 */
export function useRevealTargets(
  scope: RefObject<HTMLElement | null>,
  targets: readonly RevealTarget[],
) {
  useLayoutEffect(() => {
    const root = scope.current;
    if (!root) return;
    const cleanups: (() => void)[] = [];
    const marked: HTMLElement[] = [];
    const groups: HTMLElement[] = [];
    for (const { selector, preset = "lift", group, delay = 0 } of targets) {
      if (group) {
        for (const element of root.querySelectorAll<HTMLElement>(group)) {
          if (element.dataset.revealGroup) continue;
          element.dataset.revealGroup = String(revealDefaults.groupStagger);
          groups.push(element);
        }
      }
      for (const element of root.querySelectorAll<HTMLElement>(selector)) {
        if (element.dataset.reveal) continue;
        element.dataset.reveal = preset;
        marked.push(element);
        cleanups.push(registerReveal(element, { variant: preset, delay, disabled: false }));
      }
    }
    return () => {
      for (const cleanup of cleanups) cleanup();
      // Strict Mode and remounts register again from a clean slate.
      for (const element of marked) delete element.dataset.reveal;
      for (const element of groups) delete element.dataset.revealGroup;
    };
  }, [scope, targets]);
}
