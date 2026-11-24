/* Scroll reveals adapted from the owner's Forma Pilates Studio template (src/components/reveal). */
import {
  type ComponentPropsWithoutRef,
  createElement,
  type ReactNode,
  useLayoutEffect,
  useRef,
} from "react";
import {
  boundedDelay,
  type RevealVariant,
  revealDefaults,
  revealDelays,
} from "./presets";
import { type RevealOptions, registerReveal } from "./runtime";
import { revealTextNodes } from "./text";
import "./reveal.css";

type ElementTag =
  | "a"
  | "button"
  | "div"
  | "span"
  | "section"
  | "article"
  | "figure"
  | "li"
  | "ul"
  | "ol"
  | "dl"
  | "address"
  | "details"
  | "header"
  | "footer"
  | "aside";
type TextTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
type NativeProps<Tag extends ElementTag | TextTag> = Omit<
  ComponentPropsWithoutRef<Tag>,
  "children"
> & {
  as?: Tag;
  children?: ReactNode;
};
type TimingProps = { delay?: number; disabled?: boolean };

function useReveal(options: RevealOptions) {
  const ref = useRef<HTMLElement>(null);
  // Deliberately refresh after content/prop edits. The runtime remembers completed
  // DOM elements, so edits never replay an already visible reveal.
  useLayoutEffect(() => {
    if (!ref.current) return;
    return registerReveal(ref.current, options);
  });
  return ref;
}

/** Replaces an existing element; it does not add a layout wrapper. */
export function Reveal<Tag extends ElementTag = "div">({
  as,
  children,
  preset = "lift",
  delay = preset === "action" ? revealDelays.action : 0,
  disabled = false,
  ...props
}: NativeProps<Tag> &
  TimingProps & {
    preset?: Exclude<RevealVariant, "words" | "lines">;
  }) {
  const ref = useReveal({ variant: preset, delay, disabled });
  return createElement(
    as ?? "div",
    { ...props, ref, "data-reveal": preset },
    children,
  );
}

/** Headings default to blurred words; paragraphs default to rising visual lines. */
export function RevealText<Tag extends TextTag = "h2">({
  as,
  children,
  mode,
  delay = 0,
  disabled = false,
  ...props
}: NativeProps<Tag> & TimingProps & { mode?: "words" | "lines" }) {
  const variant = mode ?? (as === "p" ? "lines" : "words");
  const ref = useReveal({ variant, delay, disabled });
  return createElement(
    as ?? "h2",
    { ...props, ref, "data-reveal": variant },
    revealTextNodes(children),
  );
}

/** DOM order determines stagger automatically, including after list edits. */
export function RevealGroup<Tag extends ElementTag = "div">({
  as,
  children,
  stagger = revealDefaults.groupStagger,
  ...props
}: NativeProps<Tag> & { stagger?: number }) {
  return createElement(
    as ?? "div",
    { ...props, "data-reveal-group": boundedDelay(stagger) },
    children,
  );
}
