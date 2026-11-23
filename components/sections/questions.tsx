import { Plus } from "lucide-react";
import { REPO_URL } from "@/lib/site";

const qa = [
  {
    q: "Is BraceMotion a medical device?",
    a: "No. It is a student research prototype. Its clinical effect has not been established and it has no medical certification.",
  },
  {
    q: "What does the V4 do today?",
    a: "It records wrist movement with the MPU6050, drives the coin motor and runs vibration modes set from the app. These are prototype functions. Whether they help has not been established.",
  },
  {
    q: "Can I use it to treat a tremor?",
    a: "No. This site does not offer the device for self-treatment and gives no medical advice. Talk to a doctor about any tremor.",
  },
  {
    q: "Where do the app numbers come from?",
    a: "They are synthetic. The preview shows the interface and the charts; no sensor readings or health data are used.",
  },
  {
    q: "Is the code open?",
    a: "The code for this site is public on GitHub, under the MIT licence.",
    link: { href: REPO_URL, label: "Open the repository" },
  },
];

export function Questions() {
  return (
    <section id="questions" aria-labelledby="questions-title" className="screen border-t border-line" style={{ ["--h" as string]: 1 }}>
      <div className="wrap grid flex-1 grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-6 lg:pr-10">
          <h2 id="questions-title" className="h2">
            Questions about the prototype
          </h2>
          <p className="lead mt-5">Short answers, including the limits of what a student build can claim.</p>
        </div>

        <div className="lg:col-span-6">
          {qa.map((item, i) => (
            <details key={item.q} className="group border-t border-line last:border-b" open={i < 3}>
              <summary className="flex min-h-[76px] cursor-pointer list-none items-center justify-between gap-6 py-5 text-[19px] font-medium tracking-[-0.015em] marker:hidden md:text-[22px] [&::-webkit-details-marker]:hidden">
                {item.q}
                <Plus
                  size={20}
                  aria-hidden="true"
                  className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-45 group-open:text-accent"
                />
              </summary>
              <div className="pb-7 text-[17px] leading-relaxed text-muted">
                <p className="max-w-[60ch]">{item.a}</p>
                {item.link && (
                  <a href={item.link.href} target="_blank" rel="noreferrer" className="link mt-3 inline-block text-ink">
                    {item.link.label}
                  </a>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
