/* Scroll reveals adapted from the owner's Forma Pilates Studio template (src/components/reveal). */
import {
  boundedDelay,
  lineIndices,
  type RevealVariant,
  revealDefaults,
  revealPresets,
  staggerDelay,
} from "./presets";

const revealed = new WeakSet<HTMLElement>();
const pending = new Map<HTMLElement, () => void>();
let observer: IntersectionObserver | undefined;

function unobserve(element: HTMLElement) {
  pending.delete(element);
  observer?.unobserve(element);
  if (pending.size === 0) {
    observer?.disconnect();
    observer = undefined;
  }
}

function observe(element: HTMLElement, play: () => void) {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        // Also release targets skipped by a fast scroll or restored scroll position.
        if (entry.isIntersecting || entry.boundingClientRect.bottom <= 0) {
          pending.get(entry.target as HTMLElement)?.();
        }
      }
    },
    { threshold: 0, rootMargin: revealDefaults.rootMargin },
  );
  pending.set(element, play);
  observer.observe(element);
}

function groupDelay(element: HTMLElement) {
  const group = element.closest<HTMLElement>("[data-reveal-group]");
  if (!group) return 0;
  const siblings = Array.from(
    group.querySelectorAll<HTMLElement>("[data-reveal]"),
  ).filter(
    (item) =>
      item.closest("[data-reveal-group]") === group &&
      !item.parentElement?.closest("[data-reveal]"),
  );
  return staggerDelay(
    Math.max(0, siblings.indexOf(element)),
    siblings.length - 1,
    boundedDelay(Number(group.dataset.revealGroup)),
    revealDefaults.groupSpread,
  );
}

export type RevealOptions = {
  variant: RevealVariant;
  delay: number;
  disabled: boolean;
};

/** Progressive enhancement: no hidden server HTML, no content/DOM replacement. */
export function registerReveal(element: HTMLElement, options: RevealOptions) {
  if (
    options.disabled ||
    revealed.has(element) ||
    element.parentElement?.closest("[data-reveal]") ||
    typeof IntersectionObserver === "undefined" ||
    typeof element.animate !== "function" ||
    typeof window.matchMedia !== "function"
  )
    return () => {};

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (motion.matches) return () => {};

  let animations: Animation[] = [];
  let resize: ResizeObserver | undefined;
  let disposed = false;
  let complete = false;
  let fontWait: ReturnType<typeof setTimeout> | undefined;
  let waitingForFonts = false;

  function removeListeners() {
    motion.removeEventListener("change", onMotionChange);
    element.removeEventListener("focusin", onFocus);
    window.removeEventListener("hashchange", onHashChange);
    window.removeEventListener("beforeprint", finish);
    document.fonts?.removeEventListener("loadingdone", finish);
    clearTimeout(fontWait);
    resize?.disconnect();
    unobserve(element);
  }

  function cancelAnimations() {
    for (const animation of animations) animation.cancel();
    animations = [];
  }

  function finish() {
    if (disposed || complete) return;
    complete = true;
    revealed.add(element);
    element.dataset.revealState = "complete";
    removeListeners();
    cancelAnimations();
  }

  function onFocus(event: Event) {
    // Pointer focus happens between down and up. Finishing a moving card there
    // shifts its button away from the pointer and can swallow the click.
    const target = event.target as HTMLElement | null;
    if (
      element.dataset.revealState === "running" &&
      target?.matches(":focus-visible") === false
    )
      return;
    finish();
  }

  function onMotionChange() {
    if (motion.matches) finish();
  }

  function onHashChange() {
    // Covers a target itself, a target inside a card, and a target section ancestor.
    if (element.closest(":target") || element.querySelector(":target"))
      finish();
  }

  function play() {
    if (disposed || revealed.has(element) || waitingForFonts) return;
    const isText = options.variant === "words" || options.variant === "lines";
    if (isText && document.fonts?.status === "loading") {
      waitingForFonts = true;
      unobserve(element);
      // Measure final font metrics, with a bounded wait if a font request stalls.
      fontWait = setTimeout(startAnimation, 500);
      void document.fonts.ready.then(startAnimation, startAnimation);
    } else startAnimation();
  }

  function startAnimation() {
    if (disposed || revealed.has(element)) return;
    clearTimeout(fontWait);
    revealed.add(element);
    unobserve(element);
    try {
      const preset = revealPresets[options.variant];
      const words = Array.from(
        element.querySelectorAll<HTMLElement>("[data-reveal-token]"),
      ).filter((word) => word.closest("[data-reveal]") === element);
      const isText = options.variant === "words" || options.variant === "lines";
      const targets = isText && words.length ? words : [element];
      const indices =
        options.variant === "lines"
          ? lineIndices(targets.map((word) => word.getBoundingClientRect().top))
          : targets.map((_, index) => index);
      const last = Math.max(...indices);
      const delay = boundedDelay(options.delay) + groupDelay(element);

      targets.forEach((target, index) => {
        const animation = target.animate([preset.from, preset.to], {
          duration: preset.duration,
          delay:
            delay +
            staggerDelay(indices[index], last, preset.stagger, preset.spread),
          easing: preset.easing,
          fill: "both",
        });
        // Track each successful start so a later failure cannot strand earlier words.
        animations.push(animation);
        // Cancellation rejects `finished`, even if a later animate() call throws
        // before Promise.all is installed. Handle each rejection immediately.
        void animation.finished.catch(finish);
      });
      element.dataset.revealState = "running";
      // Reflow during playback should resolve immediately, never retain stale lines.
      if (isText && typeof ResizeObserver !== "undefined") {
        const { width, height } = element.getBoundingClientRect();
        resize = new ResizeObserver(() => {
          const bounds = element.getBoundingClientRect();
          if (
            Math.abs(bounds.width - width) > 1 ||
            Math.abs(bounds.height - height) > 1
          )
            finish();
        });
        resize.observe(element);
        document.fonts?.addEventListener("loadingdone", finish);
      }
      void Promise.all(animations.map((animation) => animation.finished)).then(
        finish,
        finish,
      );
    } catch {
      finish();
    }
  }

  motion.addEventListener("change", onMotionChange);
  element.addEventListener("focusin", onFocus);
  window.addEventListener("hashchange", onHashChange);
  window.addEventListener("beforeprint", finish);

  try {
    observe(element, play);
    element.dataset.revealState = "pending";
    if (element.contains(document.activeElement)) finish();
    onHashChange();
  } catch {
    finish();
  }

  return () => {
    disposed = true;
    removeListeners();
    cancelAnimations();
    // Strict Mode, content edits, route unmounts and HMR all leave readable content.
    if (revealed.has(element)) element.dataset.revealState = "complete";
    else delete element.dataset.revealState;
  };
}
