/* Scroll reveals adapted from the owner's Forma Pilates Studio template (src/components/reveal). */
import {
  Children,
  cloneElement,
  createElement,
  Fragment,
  isValidElement,
  type ReactNode,
} from "react";

const inlineTags = new Set([
  "a",
  "abbr",
  "b",
  "cite",
  "em",
  "i",
  "mark",
  "s",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "u",
]);

/**
 * React owns every word. Never split innerHTML or reparent hydrated DOM nodes.
 * Whitespace, links, explicit breaks and inline formatting retain their semantics.
 * Opaque components stay intact; use Reveal for arbitrary component trees.
 */
export function revealTextNodes(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      return String(child)
        .split(/(\s+)/u)
        .map((part, index) =>
          !part || /^\s+$/u.test(part)
            ? part
            : createElement(
                "span",
                { "data-reveal-token": "", key: index },
                part,
              ),
        );
    }
    if (
      !isValidElement<{
        children?: ReactNode;
        "aria-hidden"?: boolean | "true" | "false";
      }>(child)
    )
      return child;
    if (
      child.props["aria-hidden"] === true ||
      child.props["aria-hidden"] === "true"
    )
      return child;
    if (
      child.type === Fragment ||
      (typeof child.type === "string" && inlineTags.has(child.type))
    ) {
      return cloneElement(
        child,
        undefined,
        revealTextNodes(child.props.children),
      );
    }
    return child;
  });
}
