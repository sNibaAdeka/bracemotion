import { ArrowUpRight } from "lucide-react";

const builds = [
  {
    v: "V2",
    title: "From mechanics to vibration",
    text: "The project dropped mechanical compensation for vibration and put the board in a protective case.",
    img: "/images/prototype-v2.webp",
    alt: "BraceMotion V2: an ESP32 development board with a red status light inside a black open case on a wide white strap",
  },
  {
    v: "V3",
    title: "A smaller case, USB-C, a motion sensor",
    text: "The electronics moved into a white screwed case with USB-C charging. The app was shown as a demo.",
    img: "/images/prototype-v3-closed.webp",
    alt: "BraceMotion V3: a white case with four visible screws and the name moulded in, on a white strap",
  },
];

export function Builds() {
  return (
    <section id="builds" aria-labelledby="builds-title" className="screen border-t border-line" style={{ ["--h" as string]: 1 }}>
      <div className="wrap flex flex-1 flex-col">
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12 lg:gap-6">
          <h2 id="builds-title" className="h2 lg:col-span-6">
            Three builds, from the bench to the wrist
          </h2>
          <p className="lead lg:col-span-6 lg:max-w-none">
            Photographs from the project presentation. Each build changed one big thing.
          </p>
        </div>

        <ol className="mt-10 grid flex-1 grid-cols-1 gap-4 md:grid-cols-3 lg:mt-12">
          {builds.map((b) => (
            <li key={b.v} className="card flex flex-col overflow-hidden">
              <div className="p-6 pb-5">
                <span className="font-mono text-[13px] text-accent">{b.v}</span>
                <h3 className="mt-3 text-[21px] font-medium leading-snug tracking-[-0.02em]">{b.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{b.text}</p>
              </div>
              <div className="frame mx-3 mb-3 mt-auto aspect-[4/3] !rounded-[16px] md:aspect-[4/3.4]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.img} alt={b.alt} width={864} height={867} loading="lazy" />
              </div>
            </li>
          ))}

          {/* Adapted from the 21st.dev "stats-bento" primary tile. */}
          <li className="relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] bg-ink p-7 text-bg">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(45deg,rgb(255_74_31/0.9)_0px_1px,transparent_1px_10px)] opacity-30 [mask-image:radial-gradient(ellipse_80%_60%_at_100%_0%,#000_60%,transparent_110%)]"
            />
            <div className="relative">
              <span className="font-mono text-[13px] text-[#4a4c50]">V4 · now</span>
              <p className="mt-4 text-[clamp(34px,4.4vw,56px)] font-medium leading-[0.9] tracking-[-0.045em] text-[#c8360f]">V4</p>
              <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 font-mono text-[13px]">
                <dt>Board</dt>
                <dd>ESP32-C3</dd>
                <dt>Sensor</dt>
                <dd>MPU6050</dd>
                <dt>Charging</dt>
                <dd>USB-C</dd>
              </dl>
            </div>
            <div className="relative">
              <h3 className="text-[21px] font-medium leading-snug tracking-[-0.02em]">The compact build</h3>
              <p className="mt-2 max-w-[32ch] text-[15px] leading-relaxed">
                A smaller white case with a lift-off lid, on a slim textile strap.
              </p>
              <a href="#inside" className="mt-5 inline-flex min-h-11 items-center gap-2 font-medium underline decoration-1 underline-offset-4 hover:decoration-2 focus-visible:outline-[#18191b]">
                Look inside the V4
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}
