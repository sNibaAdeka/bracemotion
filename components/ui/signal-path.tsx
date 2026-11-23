/**
 * Signal path card: one input, the controller, three lanes.
 * Pulses travel along the connectors (transform only, 3 s loop, rest under reduced motion).
 */
const lanes = [
  { name: "Coin motor", role: "vibration" },
  { name: "App", role: "modes" },
  { name: "USB-C", role: "charging" },
];

function Node({ name, role, strong = false, compact = false }: { name: string; role: string; strong?: boolean; compact?: boolean }) {
  return (
    <div
      className={`rounded-xl border ${compact ? "px-3 py-2" : "px-4 py-3"} ${
        strong ? "border-accent/60 bg-accent/10" : "border-line-strong bg-surface-2"
      }`}
    >
      <p className={`${compact ? "text-[14px]" : "text-[15px]"} font-medium leading-tight`}>{name}</p>
      <p className="mt-0.5 font-mono text-[12px] text-muted">{role}</p>
    </div>
  );
}

function Wire({ delay = 0 }: { delay?: number }) {
  return (
    <div className="wire relative mx-auto h-6 w-px shrink-0 bg-line-strong md:mx-0 md:h-px md:w-auto md:min-w-6 md:flex-1" aria-hidden="true">
      <span className="pulse" style={{ animationDelay: `${delay}s` }} />
    </div>
  );
}

export function SignalPath() {
  return (
    <div
      className="card p-4 md:p-5"
      role="img"
      aria-label="Signal path: the MPU6050 sensor feeds the ESP32-C3, which drives the coin motor, talks to the app and charges over USB-C"
    >
      <div className="flex flex-col items-stretch md:flex-row md:items-center">
        <div className="md:w-[22%]">
          <Node name="MPU6050" role="motion in" />
        </div>
        <Wire />
        <div className="md:w-[22%]">
          <Node name="ESP32-C3" role="control" strong />
        </div>
        <Wire delay={0.6} />
        <div className="grid grid-cols-3 gap-2 md:w-[30%] md:grid-cols-1 md:gap-1.5">
          {lanes.map((l) => (
            <Node key={l.name} name={l.name} role={l.role} compact />
          ))}
        </div>
      </div>
      <style>{`
        .wire .pulse { position: absolute; inset: 0; animation: pulse-y 3s cubic-bezier(.45,0,.55,1) infinite; }
        .wire .pulse::before {
          content: ""; position: absolute; left: -2px; top: -2px; width: 5px; height: 5px; border-radius: 999px;
          background: var(--accent); box-shadow: 0 0 10px var(--accent);
        }
        @media (min-width: 768px) { .wire .pulse { animation-name: pulse-x; } }
        @keyframes pulse-y { 0% { transform: translateY(0); opacity: 0 } 15% { opacity: 1 } 85% { opacity: 1 } 100% { transform: translateY(100%); opacity: 0 } }
        @keyframes pulse-x { 0% { transform: translateX(0); opacity: 0 } 15% { opacity: 1 } 85% { opacity: 1 } 100% { transform: translateX(100%); opacity: 0 } }
        @media (prefers-reduced-motion: reduce) { .wire .pulse { animation: none; opacity: 0 } }
      `}</style>
    </div>
  );
}
