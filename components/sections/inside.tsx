import { SignalPath } from "@/components/ui/signal-path";

const parts = [
  { n: "01", name: "Case and strap", text: "Printed case, lift-off lid, thin textile strap." },
  { n: "02", name: "ESP32-C3", text: "Runs the firmware; USB-C and antenna on the board." },
  { n: "03", name: "MPU6050", text: "Measures acceleration and angular velocity." },
  { n: "04", name: "Coin motor", text: "Turns a signal from the board into vibration." },
  { n: "05", name: "Li-Po battery", text: "Powers the board; a separate module charges it." },
];

export function Inside() {
  return (
    <section id="inside" aria-labelledby="inside-title" className="screen border-t border-line" style={{ ["--h" as string]: 1 }}>
      <div className="wrap grid flex-1 grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-6">
        <div className="flex flex-col lg:col-span-6 lg:pr-10">
          <h2 id="inside-title" className="h2">
            Sensor, board, motor and battery in one case
          </h2>
          <p className="lead mt-5">Lift the lid of the V4 and the whole system is in reach.</p>

          <ol className="mt-8 lg:mt-auto">
            {parts.map((p) => (
              <li key={p.n} className="grid grid-cols-[40px_1fr] gap-x-3 border-t border-line py-3.5 last:border-b">
                <span className="pt-[3px] font-mono text-[13px] text-accent">{p.n}</span>
                <div>
                  <p className="text-[17px] font-medium leading-snug tracking-[-0.01em]">{p.name}</p>
                  <p className="mt-0.5 text-[15px] leading-snug text-muted">{p.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-6">
          <div className="frame aspect-[4/3] w-full lg:aspect-auto lg:min-h-[360px] lg:flex-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/prototype-v4-open.webp"
              alt="The V4 with its lid off: the ESP32-C3 board, coloured wiring and a green switch inside the white case"
              width={864}
              height={867}
              loading="lazy"
              className="absolute inset-0 object-[50%_38%]"
            />
          </div>
          <SignalPath />
        </div>
      </div>
    </section>
  );
}
