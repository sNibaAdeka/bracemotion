// Adapted from shadcn/ui, MIT. See licenses/SHADCN-LICENSE.
// CSS-module-free project styling and Phosphor glyph; Radix semantics preserved.
'use client';
import type { ComponentProps } from 'react';
import {CaretDown} from '@phosphor-icons/react/dist/csr/CaretDown';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
const cn = (...values: (string | undefined)[]) => values.filter(Boolean).join(' ');
export function Accordion(props: ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}
export function AccordionItem({ className, ...props }: ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item className={cn('faq-item', className)} {...props} />;
}
export function AccordionTrigger({ className, children, ...props }: ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return <AccordionPrimitive.Header className="faq-heading"><AccordionPrimitive.Trigger className={cn('faq-trigger', className)} {...props}>{children}<CaretDown size={22} aria-hidden="true" /></AccordionPrimitive.Trigger></AccordionPrimitive.Header>;
}
export function AccordionContent({ className, children, ...props }: ComponentProps<typeof AccordionPrimitive.Content>) {
  return <AccordionPrimitive.Content className="faq-content" {...props}><div className={cn('faq-answer', className)}>{children}</div></AccordionPrimitive.Content>;
}
