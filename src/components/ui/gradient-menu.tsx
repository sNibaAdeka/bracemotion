"use client";

import type {CSSProperties, ReactNode} from 'react';
import {House} from '@phosphor-icons/react/dist/csr/House';
import {Stack} from '@phosphor-icons/react/dist/csr/Stack';
import {Question} from '@phosphor-icons/react/dist/csr/Question';
import {EnvelopeSimple} from '@phosphor-icons/react/dist/csr/EnvelopeSimple';
import {cn} from '@/lib/utils';
import './gradient-menu.css';

export type GradientMenuLink = {
  title: string;
  href: string;
  icon?: ReactNode;
  gradientFrom?: string;
  gradientTo?: string;
};

export type GradientMenuProps = {
  links?: readonly GradientMenuLink[];
  currentHref?: string;
  onNavigate?: (href: string) => void;
  ariaLabel?: string;
  className?: string;
};

const ICONS = [
  <House key="device" aria-hidden="true"/>,
  <Stack key="development" aria-hidden="true"/>,
  <Question key="questions" aria-hidden="true"/>,
  <EnvelopeSimple key="contact" aria-hidden="true"/>,
];

const DEFAULT_LINKS: readonly GradientMenuLink[] = [
  {title: 'Device', href: '#top'},
  {title: 'Development', href: '#development'},
  {title: 'Questions', href: '#questions'},
  {title: 'Contact', href: '#contact'},
];

type GradientStyle = CSSProperties & {
  '--gradient-from': string;
  '--gradient-to': string;
};

/**
 * Adapted from the owner's supplied GradientMenu: a round icon expands into
 * a glowing gradient label. This is navigation, so every item is a real link.
 * Touch/narrow layouts keep visible labels instead of relying on hover.
 */
export default function GradientMenu({
  links = DEFAULT_LINKS,
  currentHref,
  onNavigate,
  ariaLabel = 'Main navigation',
  className,
}: GradientMenuProps) {
  return (
    <nav className={cn('gradient-menu', className)} aria-label={ariaLabel}>
      <ul className="gradient-menu-list">
        {links.map(({title, href, icon, gradientFrom, gradientTo}, index) => {
          const gradient: GradientStyle = {
            '--gradient-from': gradientFrom ?? '#7134bd',
            '--gradient-to': gradientTo ?? '#9844c4',
          };
          return (
            <li key={href} className="gradient-menu-item">
              <a
                href={href}
                style={gradient}
                className="gradient-menu-link"
                aria-label={title}
                aria-current={currentHref === href ? 'location' : undefined}
                onClick={() => onNavigate?.(href)}
              >
                <span className="gradient-menu-icon" aria-hidden="true">
                  {icon ?? ICONS[index % ICONS.length]}
                </span>
                <span className="gradient-menu-title" aria-hidden="true">{title}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
