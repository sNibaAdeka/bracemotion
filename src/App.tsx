import {lazy, Suspense, useEffect, useRef, useState} from 'react';
import {ArrowUpRight} from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import {ArrowRight} from '@phosphor-icons/react/dist/csr/ArrowRight';
import {List} from '@phosphor-icons/react/dist/csr/List';
import {X} from '@phosphor-icons/react/dist/csr/X';
import {Sun} from '@phosphor-icons/react/dist/csr/Sun';
import {Moon} from '@phosphor-icons/react/dist/csr/Moon';
import {Accordion, AccordionItem, AccordionTrigger, AccordionContent} from './components/borrowed/accordion';
import InquiryForm from './components/InquiryForm';
import Timeline from '@/components/ui/timeline';
import MorphOrb from '@/components/ui/ai-thiking-orb-and-input';
import {answerProjectQuestion,developmentHistory} from '@/lib/project-facts';
import DisassemblyStory from './components/DisassemblyStory';
import {Reveal, RevealText} from './components/reveal';
import {useRevealTargets, type RevealTarget} from './components/reveal/use-reveal-targets';
import GradientMenu from '@/components/ui/gradient-menu';
import TextScrollAnimation from '@/components/ui/text-scroll-animation';
import StatsBento from '@/components/ui/stats-bento';
import {SquishyPricing} from '@/components/ui/squishy-pricing';
import {NexacoreServiceCard} from '@/components/borrowed/nexacore-service-card';

const SpaceLogin = lazy(()=>import('@/components/ui/space-login'));
const AccountOverview = lazy(()=>import('@/components/account/AccountOverview'));

const faqs = [
  ['Is this a finished medical device?','No. BraceMotion is a research prototype undergoing testing. The project presentation states that it has not yet been clinically validated or medically certified.'],
  ['What can the prototype do?','The project presents vibration stimulation, gyroscope-based movement monitoring and app-controlled modes. These are stated prototype capabilities, not evidence of medical effectiveness.'],
  ['What does the 3D model show?','The exterior was reconstructed from V4 photographs. Electronic parts are based on components in the presentation and public hardware references; their placement inside the case is illustrative. This is an exploded-view illustration, not a measured CAD model or a repair guide.'],
  ['Can the bracelet be used for treatment?','This website does not offer the device for self-treatment or provide medical advice. Prototype data is no substitute for professional advice or prescribed treatment.'],
  ['How can I contact the project?','Leave your email and choose a topic in the form below. Your inquiry will be saved for the BraceMotion team. Use it to discuss research, engineering or general project information.'],
];

/** Cards, grids and forms owned by other components rise in as they enter the viewport. */
const REVEAL_TARGETS: readonly RevealTarget[] = [
  {selector:'.source-study'},
  {selector:'.function-notes > *', group:'.function-notes'},
  {selector:'.signal-path > li', group:'.signal-path'},
  {selector:'.signal-note'},
  {selector:'.brace-stats-heading > *', group:'.brace-stats-heading'},
  {selector:'.brace-stats-grid > *', group:'.brace-stats-grid'},
  {selector:'.bm-timeline-heading'},
  {selector:'.research-track > article', group:'.research-track'},
  {selector:'.faq-list > *', group:'.faq-list'},
  {selector:'.project-question-block'},
  {selector:'.squishy-pricing-heading > *', group:'.squishy-pricing-heading'},
  {selector:'.squishy-pricing-grid > *', group:'.squishy-pricing-grid'},
  {selector:'.squishy-pricing-note'},
  {selector:'.inquiry-form > *', group:'.inquiry-form'},
  {selector:'.footer-top > *, .medical-notice, .footer-details, .footer-bottom', group:'.footer'},
];

function Brand() {
  return <a href="#top" aria-label="BraceMotion, back to top" className="brand">Brace<span>Motion</span><span className="brand-dot" aria-hidden="true">·</span></a>;
}

function MarketingPage() {
  const [menu, setMenu] = useState(false);
  const [currentHref,setCurrentHref] = useState('#top');
  useEffect(()=>{const sync=()=>setCurrentHref(window.location.hash || '#top');sync();window.addEventListener('hashchange',sync);return()=>window.removeEventListener('hashchange',sync);},[]);
  const menuButton = useRef<HTMLButtonElement>(null);
  const page = useRef<HTMLDivElement>(null);
  useRevealTargets(page, REVEAL_TARGETS);
  const [theme, setTheme] = useState<'light'|'dark'>('dark');
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => {
    if (!menu) return;
    document.querySelector<HTMLAnchorElement>('.header-gradient a')?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenu(false); menuButton.current?.focus(); }
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [menu]);

  return <div ref={page} className="page">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="header">
      <Brand/>
      <div className={menu ? 'header-gradient is-open' : 'header-gradient'}>
        <GradientMenu currentHref={currentHref} onNavigate={href=>{setCurrentHref(href);setMenu(false);}}/>
      </div>
      <div className="header-actions">
        <button className="theme-toggle" aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? <Moon size={17}/> : <Sun size={17}/>}</button>
        <a href="/sign-in" className="account-link">Account</a>
        <a href="#contact" className="nav-contact">Discuss the project<ArrowUpRight size={17} aria-hidden="true"/></a>
        <button ref={menuButton} className="menu-toggle" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X size={24}/> : <List size={24}/>}</button>
      </div>
    </header>
    <main id="main">
      <DisassemblyStory/>
      <section className="intro section-shell" aria-labelledby="intro-title">
        <div className="intro-heading"><RevealText as="p" className="eyebrow">01 / From model to prototype</RevealText>
          <RevealText as="h2" id="intro-title" className="intro-title">The device,<br/>in detail.</RevealText>
          <RevealText as="p" delay={150}>A fabric strap, a removable lid and electronics inside. This is the real fourth prototype behind the 3D model.</RevealText>
        </div>
        <figure className="source-study">
          <div className="source-photo"><img src="/images/prototype-v4-open.webp" alt="The real BraceMotion V4 prototype: its lid beside the open case, showing the board, wires and a blue component inside" loading="lazy" width="1000" height="1000"/></div>
          <figcaption><span>04 / Open case</span><span>Prototype photograph from the project presentation</span></figcaption>
        </figure>
        <div className="function-notes">
          <NexacoreServiceCard level={1} label="01 / Vibration" title="Vibration stimulation" description="A wearable design for exploring vibration stimulation."/>
          <NexacoreServiceCard level={2} label="02 / Monitoring" title="Monitoring" description="Movement monitoring with a gyroscope."/>
          <NexacoreServiceCard level={3} label="03 / Settings" title="Settings" description="Vibration modes controlled through an app."/>
        </div>
      </section>
      <section className="signal-system section-shell" aria-labelledby="signal-title">
        <div className="signal-intro"><RevealText as="p" className="eyebrow">02 / How it works</RevealText><RevealText as="h2" id="signal-title">From movement.<br/><span>To data.</span></RevealText><RevealText as="p" delay={150}>Sensing, control and vibration stimulation are the three areas explored by the prototype.</RevealText></div>
        <ol className="signal-path"><li><span className="signal-symbol" aria-hidden="true">↗</span><small>01 / SENSING</small><h3>Motion sensor</h3><p>Acceleration and angular velocity</p></li><li className="signal-connector" aria-hidden="true"><ArrowRight size={24}/></li><li><span className="signal-symbol chip-symbol" aria-hidden="true">C3</span><small>02 / CONTROL</small><h3>ESP32-C3</h3><p>Coordinates the electronics</p></li><li className="signal-connector" aria-hidden="true"><ArrowRight size={24}/></li><li><span className="signal-symbol" aria-hidden="true">≈</span><small>03 / STIMULATION</small><h3>Vibration motor</h3><p>Mechanical vibration</p></li></ol>
        <TextScrollAnimation/>
        <p className="signal-note">This diagram explains the role of each component. An automatic tremor-compensation algorithm and its effectiveness have not been verified.</p>
      </section>
      <StatsBento/>
      <section id="development" className="development section-shell" aria-label="Prototype history">
        <Timeline items={developmentHistory}/>
      </section>
      <section className="research section-shell" aria-labelledby="research-title">
        <div className="research-heading"><RevealText as="p" className="eyebrow">04 / The next step</RevealText><Reveal as="span" preset="action" className="status-mark">Research in progress</Reveal><RevealText as="h2" id="research-title">What still needs <br/>to be tested.</RevealText><RevealText as="p" delay={150}>Clinical effectiveness has not been established. The device is not yet medically certified.</RevealText></div>
        <div className="research-track">
          <article><span className="track-number">01</span><h3>Design</h3><p>Refine the prototype and gather feedback on how people might use it.</p><span className="track-status">Current stage</span></article>
          <article><span className="track-number">02</span><h3>Measurement</h3><p>Check how accurately the data captures movement characteristics.</p><span className="track-status">Next step</span></article>
          <article><span className="track-number">03</span><h3>Validation</h3><p>Evaluate effectiveness and safety in further research.</p><span className="track-status">Still to come</span></article>
        </div>
      </section>
      <section id="questions" className="questions section-shell" aria-labelledby="faq-title">
        <div><RevealText as="p" className="eyebrow">05 / About the project</RevealText><RevealText as="h2" id="faq-title">Important <br/>questions.</RevealText></div>
        <Accordion type="single" collapsible className="faq-list">{faqs.map(([question,answer],index) => <AccordionItem value={`q${index}`} key={question}><AccordionTrigger>{question}</AccordionTrigger><AccordionContent>{answer}</AccordionContent></AccordionItem>)}</Accordion>
        <div className="project-question-block"><div className="project-question-intro"><h3>Ask about the project.</h3><p>A local guide based on the project presentation. Ask about versions, the design or the demo app.</p><p>Your question stays in your browser. This guide does not provide personal medical advice.</p></div><MorphOrb onSubmit={answerProjectQuestion} speed={2}/></div>
      </section>
      <SquishyPricing/>
      <section id="contact" className="contact section-shell" aria-labelledby="contact-title">
        <div className="contact-heading"><RevealText as="p" className="eyebrow">06 / Take the next step</RevealText><RevealText as="h2" id="contact-title">Discuss <br/>the project.</RevealText><RevealText as="p" delay={150}>Research, hardware or software. Leave your contact details and choose a topic.</RevealText><p className="contact-disclosure">Clinical effectiveness has not been established. The device is not yet medically certified.</p></div>
        <InquiryForm/>
      </section>
    </main>
    <footer className="footer section-shell">
      <div className="footer-top"><Brand/><a href="#top" className="text-link">Back to top <ArrowUpRight size={16} aria-hidden="true"/></a></div>
      <p className="medical-notice">BraceMotion is a research prototype. Clinical effectiveness has not been established, and the device is not yet medically certified. This website does not provide medical advice.</p>
      <div className="footer-details">
        <details id="privacy"><summary>Data privacy</summary><p>The form saves your email, name (if provided), inquiry topic, consent and submission date in private project storage on Netlify. Access is intended for the project owner to respond to your inquiry. No medical information is requested. This website has no analytics or advertising systems connected. A hash of your network address, rather than the address itself, is used to limit spam.</p></details>
        <details><summary>Interface credits</summary><p>Adapted open-source components under the MIT license: <a href="https://21st.dev/@kuratlielia/components/tabs" target="_blank" rel="noreferrer">ARC Tabs</a>, <a href="https://21st.dev/@ibelick/components/magnetic" target="_blank" rel="noreferrer">Motion Primitives Magnetic</a> and <a href="https://21st.dev/@shadcn/components/accordion" target="_blank" rel="noreferrer">shadcn/ui Accordion</a>. The supplied MorphOrb, Timeline, Background Paths and Box Loader components from <a href="https://21st.dev" target="_blank" rel="noreferrer">21st.dev</a> have also been adapted; original Timeline attribution: <a href="https://vault.hyperiux.com" target="_blank" rel="noreferrer">Hyperiux Vault</a>. Timeline animation uses GSAP under a separate license. <a href="/attributions.txt">Licenses and adaptations</a>. <a href="/r5-component-attributions.txt">Additional R5 component references</a>.</p></details>
      </div>
      <div className="footer-bottom"><span>BraceMotion © {new Date().getFullYear()}</span><span>Research prototype</span></div>
    </footer>
  </div>;
}

function App(){
 const [pathname,setPathname]=useState(()=>typeof window==='undefined'?'/':window.location.pathname);
 useEffect(()=>{const sync=()=>setPathname(window.location.pathname);window.addEventListener('popstate',sync);return()=>window.removeEventListener('popstate',sync);},[]);
 if(pathname==='/account/preview'||pathname==='/account/preview/')return <Suspense fallback={<main className="account-loading"><h1>Account preview</h1><p>Loading the public no-data layout.</p><a href="/">Back to BraceMotion</a></main>}><AccountOverview/></Suspense>;
 if(pathname==='/sign-in'||pathname==='/sign-in/')return <Suspense fallback={<main className="account-loading"><h1>Account access</h1><p>Loading the sign-in screen.</p><a href="/">Back to BraceMotion</a></main>}><SpaceLogin/></Suspense>;
 return <MarketingPage/>;
}
export default App;
