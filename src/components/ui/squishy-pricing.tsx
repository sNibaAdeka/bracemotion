"use client";

import { useId, useState } from 'react';
import type { ComponentType, FocusEvent } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import './squishy-pricing.css';
import {useReducedMotionPreference} from '@/lib/use-reduced-motion-preference';

export type SquishyBackground = 'circles' | 'squares' | 'layers';
export type SquishyTone = 'violet' | 'purple' | 'plum';

export interface SquishyPricingCardData {
  id: string;
  label: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  /** Optional, confirmed display text. No currency or billing period is inferred. */
  price?: string;
  tone?: SquishyTone;
  background?: SquishyBackground;
}

export interface SquishyPricingProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  cards?: readonly SquishyPricingCardData[];
  note?: string;
  className?: string;
}

export const BRACEMOTION_INQUIRY_CARDS: readonly SquishyPricingCardData[] = [
  {
    id: 'prototype',
    label: 'Prototype',
    title: 'Explore the project',
    description: 'Ask about the V4 bracelet, its hardware, and the development of the prototype.',
    cta: 'Ask about the prototype',
    href: '#contact',
    tone: 'violet',
    background: 'circles',
  },
  {
    id: 'research',
    label: 'Research',
    title: 'Discuss research',
    description: 'Start a conversation about engineering, motion data, or future evaluation.',
    cta: 'Discuss research',
    href: '#contact',
    tone: 'purple',
    background: 'squares',
  },
  {
    id: 'pricing',
    label: 'Project information',
    title: 'Request pricing',
    description: 'Ask the team about pricing or project details. Prices and sales availability are not confirmed.',
    cta: 'Request pricing',
    href: '#contact',
    tone: 'plum',
    background: 'layers',
  },
];

const BACKGROUNDS: Record<SquishyBackground, ComponentType> = {
  circles: BGComponent1,
  squares: BGComponent2,
  layers: BGComponent3,
};

const transition = { duration: 1, ease: 'backInOut' as const };
const shapeTransition = { ...transition, delay: 0.2 };

/** The supplied animated card layout, adapted to the research prototype. */
export function SquishyPricing({
  id = 'pricing',
  eyebrow = 'Project conversations',
  title = 'Start a conversation.',
  description = 'BraceMotion is a research prototype. Choose a topic and use the project inquiry form.',
  cards = BRACEMOTION_INQUIRY_CARDS,
  note = 'Clinical effectiveness is not validated. Medical certification, prices, and availability are not confirmed.',
  className,
}: SquishyPricingProps) {
  const headingId = useId();
  const noteId = useId();

  return (
    <section
      id={id}
      className={cn('squishy-pricing section-shell', className)}
      aria-labelledby={headingId}
      aria-describedby={note ? noteId : undefined}
    >
      <div className="squishy-pricing-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={headingId}>{title}</h2>
        <p className="squishy-pricing-description">{description}</p>
      </div>
      <div className="squishy-pricing-grid">
        {cards.map(card => <PricingCard key={card.id} {...card} />)}
      </div>
      {note ? <p id={noteId} className="squishy-pricing-note">{note}</p> : null}
    </section>
  );
}

export function PricingCard({
  id,
  label,
  title,
  description,
  cta,
  href,
  price,
  tone = 'violet',
  background = 'circles',
}: SquishyPricingCardData) {
  const headingId = useId();
  const reduced = useReducedMotionPreference();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const active = !reduced && (hovered || focused || touched);
  const BGComponent = BACKGROUNDS[background];

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  };

  return (
    <motion.article
      initial={false}
      animate={active ? 'hover' : 'rest'}
      variants={{ rest: { scale: 1 }, hover: { scale: 1.025 } }}
      transition={reduced ? { duration: 0 } : transition}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={handleBlur}
      onPointerDown={event => { if (event.pointerType === 'touch') setTouched(true); }}
      onPointerUp={() => setTouched(false)}
      onPointerCancel={() => setTouched(false)}
      className={cn('squishy-card', `squishy-card--${tone}`)}
      aria-labelledby={headingId}
      data-card={id}
      data-animation={reduced ? 'reduced' : 'squishy'}
      data-active={active ? 'true' : 'false'}
    >
      <div className="squishy-card-copy">
        <span className="squishy-card-label">{label}</span>
        <motion.h3
          id={headingId}
          initial={false}
          variants={{ rest: { scale: 0.96 }, hover: { scale: 1 } }}
          transition={reduced ? { duration: 0 } : transition}
          className="squishy-card-title"
        >
          {title}
        </motion.h3>
        {price ? <p className="squishy-card-price">{price}</p> : null}
        <p className="squishy-card-description">{description}</p>
      </div>
      <a className="squishy-card-cta" href={href}>{cta}</a>
      <BGComponent />
    </motion.article>
  );
}

/** Compatibility with the user-supplied demo import. */
export const Component = SquishyPricing;
export default SquishyPricing;

function BGComponent1() {
  return (
    <motion.svg
      width="320" height="384" viewBox="0 0 320 384" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"
      variants={{ rest: { scale: 1 }, hover: { scale: 1.5 } }}
      transition={transition} className="squishy-card-background"
    >
      <motion.circle
        variants={{ rest: { scaleY: 1, y: 0 }, hover: { scaleY: 0.5, y: -25 } }}
        transition={shapeTransition} cx="160.5" cy="114.5" r="101.5"
        fill="rgba(0, 0, 0, 0.2)"
      />
      <motion.ellipse
        variants={{ rest: { scaleY: 1, y: 0 }, hover: { scaleY: 2.25, y: -25 } }}
        transition={shapeTransition} cx="160.5" cy="265.5" rx="101.5" ry="43.5"
        fill="rgba(0, 0, 0, 0.2)"
      />
    </motion.svg>
  );
}

function BGComponent2() {
  return (
    <motion.svg
      width="320" height="384" viewBox="0 0 320 384" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"
      variants={{ rest: { scale: 1 }, hover: { scale: 1.05 } }}
      transition={transition} className="squishy-card-background"
    >
      <motion.rect
        x="14" y="12" width="153" height="153" rx="15" fill="rgba(0, 0, 0, 0.2)"
        variants={{ rest: { y: 0, rotate: '0deg', scaleX: 1 }, hover: { y: 207, rotate: '90deg', scaleX: 2 } }}
        transition={shapeTransition}
      />
      <motion.rect
        x="155" y="219" width="153" height="153" rx="15" fill="rgba(0, 0, 0, 0.2)"
        variants={{ rest: { y: 0, rotate: '0deg', scaleX: 1 }, hover: { y: -207, rotate: '90deg', scaleX: 2 } }}
        transition={shapeTransition}
      />
    </motion.svg>
  );
}

function BGComponent3() {
  return (
    <motion.svg
      width="320" height="384" viewBox="0 0 320 384" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"
      variants={{ rest: { scale: 1 }, hover: { scale: 1.25 } }}
      transition={transition} className="squishy-card-background"
    >
      <motion.path
        variants={{ rest: { y: 0 }, hover: { y: -50 } }}
        transition={{ ...transition, delay: 0.3 }}
        d="M148.893 157.531C154.751 151.673 164.249 151.673 170.107 157.531L267.393 254.818C273.251 260.676 273.251 270.173 267.393 276.031L218.75 324.674C186.027 357.397 132.973 357.397 100.25 324.674L51.6068 276.031C45.7489 270.173 45.7489 260.676 51.6068 254.818L148.893 157.531Z"
        fill="rgba(0, 0, 0, 0.2)"
      />
      <motion.path
        variants={{ rest: { y: 0 }, hover: { y: -50 } }}
        transition={shapeTransition}
        d="M148.893 99.069C154.751 93.2111 164.249 93.2111 170.107 99.069L267.393 196.356C273.251 202.213 273.251 211.711 267.393 217.569L218.75 266.212C186.027 298.935 132.973 298.935 100.25 266.212L51.6068 217.569C45.7489 211.711 45.7489 202.213 51.6068 196.356L148.893 99.069Z"
        fill="rgba(0, 0, 0, 0.2)"
      />
      <motion.path
        variants={{ rest: { y: 0 }, hover: { y: -50 } }}
        transition={{ ...transition, delay: 0.1 }}
        d="M148.893 40.6066C154.751 34.7487 164.249 34.7487 170.107 40.6066L267.393 137.893C273.251 143.751 273.251 153.249 267.393 159.106L218.75 207.75C186.027 240.473 132.973 240.473 100.25 207.75L51.6068 159.106C45.7489 153.249 45.7489 143.751 51.6068 137.893L148.893 40.6066Z"
        fill="rgba(0, 0, 0, 0.2)"
      />
    </motion.svg>
  );
}
