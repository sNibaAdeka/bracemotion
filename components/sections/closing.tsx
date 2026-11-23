import { ArrowUp } from "lucide-react";
import { GithubMark } from "@/components/ui/github-mark";
import { Logo } from "@/components/shared/nav";
import { REPO_URL } from "@/lib/site";

const tree: Array<[string, string]> = [
  ["app/", "layout, page, design tokens"],
  ["components/sections/", "hero, inside, builds, app demo, questions"],
  ["components/ui/", "background paths, stat card, charts, signal path"],
  ["lib/demo-data.ts", "synthetic recordings for the app preview"],
  ["public/images/", "prototype photographs, V2 to V4"],
];

const borrowed = ["background-paths", "health-stat-card", "stats-bento", "mini-chart"];

export function Closing() {
  return (
    <section aria-labelledby="close-title" className="screen border-t border-line" style={{ ["--h" as string]: 1 }}>
      <div className="wrap flex flex-1 flex-col">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-6 lg:pr-10">
            <p className="eyebrow">Open source · MIT</p>
            <h2 id="close-title" className="h2 mt-5">
              Source code for the prototype site
            </h2>
            <p className="lead mt-5">
              Next.js, Tailwind and Framer Motion, exported as a static site. Fork it, open an issue or reuse a component.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href={REPO_URL} target="_blank" rel="noreferrer" className="btn btn-primary">
                <GithubMark size={18} />
                View the code on GitHub
              </a>
              <a href="#top" className="btn btn-ghost">
                <ArrowUp size={18} aria-hidden="true" />
                Back to the top
              </a>
            </div>
            <p className="mt-10 text-[15px] leading-relaxed text-muted">
              Adapted from 21st.dev components: <span className="font-mono text-[14px] text-ink">{borrowed.join(", ")}</span>.
            </p>
          </div>

          <div data-ui className="overflow-hidden rounded-[var(--radius-lg)] border border-line-strong bg-surface font-mono text-[13px] lg:col-span-6">
            <div className="flex items-center gap-2 border-b border-line px-5 py-3 text-muted">
              <GithubMark size={14} />
              sNibaAdeka/bracemotion
            </div>
            <pre className="whitespace-pre-wrap break-all px-5 py-5 leading-7 text-ink">
              <code>
                <span className="text-faint">$</span> git clone {REPO_URL}
                {"\n"}
                <span className="text-faint">$</span> cd bracemotion && npm install
                {"\n"}
                <span className="text-faint">$</span> npm run dev
              </code>
            </pre>
            <ul className="border-t border-line px-5 py-4">
              {tree.map(([path, what]) => (
                <li key={path} className="grid grid-cols-1 gap-x-4 py-1.5 sm:grid-cols-[190px_1fr]">
                  <span className="text-accent">{path}</span>
                  <span className="text-muted">{what}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <footer className="closing mt-auto pt-14">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <Logo />
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="link inline-flex min-h-11 items-center gap-2 text-[14px] text-muted">
              <GithubMark size={14} />
              sNibaAdeka/bracemotion
            </a>
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            A research prototype, not a medical device. Photographs: BraceMotion project presentation. © 2026 BraceMotion.
          </p>
        </footer>
      </div>
    </section>
  );
}
