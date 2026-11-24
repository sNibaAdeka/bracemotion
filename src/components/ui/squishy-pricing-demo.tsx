import { SquishyPricing } from '@/components/ui/squishy-pricing';

/** Standalone visual demo. The main app supplies the existing #contact target. */
export function DemoOne() {
  return (
    <>
      <SquishyPricing />
      <section id="contact" className="section-shell" aria-labelledby="squishy-demo-contact">
        <h2 id="squishy-demo-contact">Project inquiry</h2>
        <p>This preview shows the card interaction. The BraceMotion page includes its project inquiry form here.</p>
      </section>
    </>
  );
}

export default DemoOne;
