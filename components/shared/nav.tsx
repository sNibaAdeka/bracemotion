"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { GithubMark } from "@/components/ui/github-mark";
import { useEffect, useState } from "react";
import { easeOut } from "@/lib/animations";
import { REPO_URL } from "@/lib/site";

const links = [
  { href: "#inside", label: "Inside" },
  { href: "#builds", label: "Builds" },
  { href: "#app", label: "App" },
  { href: "#questions", label: "Questions" },
];

export function Logo() {
  return (
    <a href="#top" className="flex min-h-11 items-center gap-2.5" aria-label="BraceMotion, back to top">
      <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill="var(--surface-2)" />
        <path
          d="M10 34h9l4-12 6 22 6-26 5 20 4-8h9"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-[17px] font-medium tracking-[-0.02em]">BraceMotion</span>
    </a>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="nav fixed inset-x-0 top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-accent-ink"
      >
        Skip to content
      </a>
      <div className="wrap flex h-16 items-center justify-between">
        <Logo />
        <nav aria-label="Sections" className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="link text-[15px] text-muted">
              {l.label}
            </a>
          ))}
        </nav>
        <a href={REPO_URL} className="btn btn-ghost hidden !min-h-10 !px-4 text-[15px] md:inline-flex" target="_blank" rel="noreferrer">
          <GithubMark size={16} />
          Source code
        </a>
        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-full border border-line-strong md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-x-0 bottom-0 top-16 z-40 bg-bg md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.25, ease: easeOut } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <nav aria-label="Menu" className="wrap flex flex-col pt-6">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-14 items-center border-b border-line text-[28px] tracking-[-0.03em]"
                >
                  {l.label}
                </a>
              ))}
              <a href={REPO_URL} target="_blank" rel="noreferrer" className="btn btn-ghost mt-8 w-full">
                <GithubMark size={18} />
                Source code on GitHub
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
