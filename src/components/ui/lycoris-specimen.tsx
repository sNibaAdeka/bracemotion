"use client";

import {lazy, Suspense, useCallback, useEffect, useRef, useState} from 'react';
import type {CSSProperties} from 'react';
import {motion, useMotionValueEvent, useScroll, useSpring, useTransform} from 'motion/react';
import {ArrowLeft} from '@phosphor-icons/react/dist/csr/ArrowLeft';
import {ArrowRight} from '@phosphor-icons/react/dist/csr/ArrowRight';
import {ArrowUpRight} from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import {ProductBoundary, ProductPhoto} from '../SceneFallback';
import {BRACE_STOPS, braceSceneCoord, braceReveal, chapterForProgress, clamp01, easeInOut, smoothstep} from '@/lib/brace-choreography';
import './lycoris-specimen.css';
import BoxLoader from './box-loader';
import {BackgroundPaths} from './background-paths';
import {useReducedMotionPreference} from '@/lib/use-reduced-motion-preference';

const DetailedScene = lazy(() => import('../../scene/DetailedScene'));
export {chapterForProgress};

/** The supplied Lycoris choreography, retold with the real R4 bracelet model.
 * No font-specimen glyph tables or floral geometry enter the product narrative.
 * Eight chapters preserve the requested long, sequential component disassembly.
 */
export const storyParts = [
  {id:'whole',short:'Bracelet',label:'The fourth prototype',title:['A closer','look.'],text:'A wearable research prototype exploring movement and vibration. Follow the thread from its soft outer form to the electronics within.',fact:'BraceMotion / Research prototype',seek:BRACE_STOPS[0]},
  {id:'strap',short:'Strap',label:'01 / The soft structure',title:['Made to','wrap.'],text:'A thin textile strap holds the housing on the wrist. Its shape is reconstructed from photographs of the fourth prototype.',fact:'Textile · flexibility · attachment',seek:BRACE_STOPS[1]},
  {id:'lid',short:'Housing',label:'02 / An opening chapter',title:['Beyond','the shell.'],text:'The removable lid lifts away. Each component then leaves the housing in sequence, revealing its role in the system.',fact:'Removable V4 enclosure',seek:BRACE_STOPS[2]},
  {id:'controller',short:'ESP32',label:'03 / The controller',title:['ESP32-C3','SuperMini.'],text:'The ESP32-C3 board coordinates operation. Its chip, USB-C port and antenna remain one assembly.',fact:'ESP32-C3 Super Mini',seek:BRACE_STOPS[3]},
  {id:'sensor',short:'Sensor',label:'04 / Reading movement',title:['MPU6050.','Motion sensor.'],text:'The MPU6050 measures acceleration and angular velocity to record wrist movement.',fact:'Accelerometer + gyroscope',seek:BRACE_STOPS[4]},
  {id:'motor',short:'Vibration',label:'05 / From signal to motion',title:['The vibration','motor.'],text:'The coin motor turns an electrical signal into mechanical vibration. One representative motor is shown here.',fact:'Coin vibration motor',seek:BRACE_STOPS[5]},
  {id:'power',short:'Power',label:'06 / The energy behind it',title:['Battery','& charging.'],text:'A Li-Pol battery powers the electronics. The separate charging module is shown beside it; its position is illustrative.',fact:'Battery + charging module',seek:BRACE_STOPS[6]},
  {id:'system',short:'Together',label:'07 / Every part in perspective',title:['Many parts.','One inquiry.'],text:'Housing, controller, sensor, power and vibration. Scroll back to bring the components together again, or explore how the prototype evolved.',fact:'An illustrative internal arrangement',seek:BRACE_STOPS[7]},
] as const;

type Fx = 'rise' | 'clip' | 'fade';
const sc = (scene: number, fx: Fx = 'rise', delay = 0) => ({'data-sc':scene, 'data-fx':fx, 'data-d':delay});
export type LycorisSpecimenProps = {name?: string; description?: string; sceneScroll?: number; className?: string};

export default function LycorisSpecimen({name='BraceMotion', description=storyParts[0].text, sceneScroll=1.42, className=''}:LycorisSpecimenProps) {
  const root = useRef<HTMLElement>(null), stage = useRef<HTMLDivElement>(null), word = useRef<HTMLDivElement>(null);
  const nextControl = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotionPreference();
  const {scrollYProgress} = useScroll({target:root,offset:['start start','end end']});
  const sceneProgress=useSpring(scrollYProgress,{stiffness:180,damping:30,mass:.6,restDelta:.0002,restSpeed:.004});
  // Drifting lines belong to the cover only; they fade out as the story starts.
  const pathsOpacity=useTransform(sceneProgress,[0,.035],[1,0]);
  const [chapter,setChapter] = useState(0), [available,setAvailable] = useState(true);
  const [photoPose,setPhotoPose] = useState<'closed'|'open'>('closed');
  const staticMode = Boolean(reduced) || !available;
  const unavailable = useCallback(() => setAvailable(false),[]);
  const letters = Array.from(name);
  useEffect(() => {
    const href='https://fonts.googleapis.com/css2?family=Federant&display=swap';
    if (Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel=stylesheet]')).some(link=>link.href===href)) return;
    const link=document.createElement('link'); link.rel='stylesheet';link.href=href;link.dataset.braceDisplayFont='';document.head.appendChild(link);
  },[]);
  useMotionValueEvent(sceneProgress,'change',value => {if (!staticMode) setChapter(chapterForProgress(value));});

  useEffect(() => {
    const sr = stage.current, wr = word.current;
    if (!sr || !wr || staticMode) return;
    const chars = Array.from(wr.querySelectorAll<HTMLElement>('[data-ch]'));
    const items = Array.from(sr.querySelectorAll<HTMLElement>('[data-sc]')).map(el => ({el,scene:Number(el.dataset.sc),fx:el.dataset.fx,delay:Number(el.dataset.d)||0}));
    let W=1,H=1;
    let positions:{x:number;y:number;w:number}[]=[];
    const update = () => {
      const coord=braceSceneCoord(sceneProgress.get());
      sr.style.setProperty('--brace-coordinate',String(coord));
      for (const item of items) {
        const amount=braceReveal(coord,item.scene,item.delay), direction=coord<item.scene?1:-1;
        const s=item.el.style;
        s.opacity=String(amount); s.visibility=amount<=0?'hidden':'visible';
        if (item.fx==='fade') continue;
        if (item.fx==='clip') {
          const hidden=(1-amount)*100;
          s.clipPath=direction>0?`inset(0 0 ${hidden}% 0)`:`inset(${hidden}% 0 0 0)`;
          s.transform=`translateY(${(1-amount)*.35*direction}em)`;
        } else {s.transform=`translateY(${(1-amount)*28*direction}px)`;s.filter=amount>.995?'none':`blur(${(1-amount)*7}px)`;}
      }
      // Like the reference, first and last characters become the crown's flanks.
      const morph=easeInOut(clamp01(coord)), out=clamp01(coord-1);
      chars.forEach((char,index) => {
        const start=positions[index]; if(!start)return;
        const flank=index===0||index===chars.length-1;
        if(flank&&chars.length>1){
          const side=index===0?-1:1, target=W*.5+side*Math.min(W*.38,H*.42);
          char.style.transform=`translate(${(target-start.x)*morph}px,${(H*.48-start.y)*morph-out*60}px)`;
          char.style.opacity=String(coord<1?1:1-smoothstep(.1,.45,out));
          char.style.filter=out<.05?'none':`blur(${out*14}px)`;
        }else{
          char.style.transform=`translate(${(W*.5-start.x)*morph*.75}px,${(H*.48-start.y)*morph}px) scale(${1-morph*.7})`;
          char.style.opacity=String(1-smoothstep(0,.4,morph)); char.style.filter=morph<.02?'none':`blur(${morph*12}px)`;
        }
        char.style.visibility=coord>1.6?'hidden':'visible';
      });
    };
    const measure=()=>{
      const rect=sr.getBoundingClientRect();W=Math.max(1,rect.width);H=Math.max(1,rect.height);
      const saved=chars.map(char=>char.style.transform); chars.forEach(char=>{char.style.transform='none';});
      positions=chars.map(char=>{const box=char.getBoundingClientRect();return{x:box.left+box.width/2-rect.left,y:box.top+box.height/2-rect.top,w:box.width};});
      chars.forEach((char,index)=>{char.style.transform=saved[index];});update();
    };
    const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(measure):null;ro?.observe(sr);
    let disposed=false;
    const onFonts=()=>{if(!disposed)measure();};
    document.fonts?.addEventListener('loadingdone',onFonts);document.fonts?.ready.then(onFonts);
    window.addEventListener('resize',measure);measure();
    const cancel=sceneProgress.on('change',update);
    return()=>{disposed=true;cancel();ro?.disconnect();window.removeEventListener('resize',measure);document.fonts?.removeEventListener('loadingdone',onFonts);};
  },[sceneProgress,staticMode,name]);

  const seek=(step:number)=>{
    const element=root.current;if(!element)return;
    const height=stage.current?.clientHeight||window.innerHeight;
    window.scrollTo({top:window.scrollY+element.getBoundingClientRect().top+Math.max(0,element.offsetHeight-height)*storyParts[step].seek,behavior:reduced?'instant':'smooth'});
  };
  // Focus never remains inside an outgoing frame, even if scroll came from a wheel or touch.
  useEffect(()=>{
    const focused=document.activeElement as HTMLElement|null;
    const panel=focused?.closest<HTMLElement>('[data-story-step]');
    if(panel&&Number(panel.dataset.storyStep)!==chapter)nextControl.current?.focus({preventScroll:true});
  },[chapter]);

  return <>
    <section ref={root} id="top" className={`brace-specimen disassembly-story ${staticMode?'is-static':''} ${className}`} aria-label="BraceMotion, an interactive product story" data-story-chapter={chapter} style={{'--brace-travel':`${(1+7*Math.max(.6,sceneScroll))*100}svh`} as CSSProperties}>
      <h1 className="brace-sr-only">{name}: a closer look at movement.</h1>
      <div ref={stage} id="device" className="brace-stage">
        <div className="brace-ambient" aria-hidden="true">{!staticMode&&chapter===0&&<motion.div className="brace-paths" style={{opacity:pathsOpacity}}><BackgroundPaths count={30}/></motion.div>}</div>
        <div className="brace-scene-shell product-stage" data-layout={staticMode?'static':chapter===0?'cover':chapter===1?'crown':'detail'}>
          {staticMode?<ProductPhoto pose={photoPose}/>:<ProductBoundary onUnavailable={unavailable}><Suspense fallback={<BoxLoader label="Loading the 3D bracelet"/>}><DetailedScene progress={sceneProgress} activeStep={chapter} cinematic className="product-canvas" onUnavailable={unavailable}/></Suspense></ProductBoundary>}
        </div>
        <div ref={word} className="brace-cover-word" aria-hidden="true" style={{fontSize:`min(${Math.min(13,128/Math.max(1,letters.length))}cqw, 20cqh)`}}>
          {letters.map((letter,index)=><span data-ch key={index}><span className="brace-letter-enter" style={{animationDelay:`${.35+index*.055}s`}}>{letter===' '?'\u00a0':letter}</span></span>)}
        </div>
        <div className="brace-panels">
          {storyParts.map((part,index)=>{
            if(staticMode&&index>0)return null;
            const shown=staticMode||chapter===index;
            return <div key={part.id} className={`brace-panel brace-panel-${part.id}`} data-story-step={index} aria-hidden={!shown} inert={!shown}>
              {index===0?<p className="brace-sr-only">{description}</p>:<>
              <p {...(!staticMode?sc(index,'clip',0):{})} className="brace-kicker"><span>{String(index+1).padStart(2,'0')}</span>{part.label}</p>
              {index>0&&<h2 {...(!staticMode?sc(index,'clip',.12):{})}>{part.title[0]}<br/><em>{part.title[1]}</em></h2>}
              <p {...(!staticMode?sc(index,'rise',.3):{})} className="brace-description">{part.text}</p>
              <span {...(!staticMode?sc(index,'rise',.45):{})} className="brace-fact">{part.fact}</span>
              {index===7&&<a {...sc(7,'rise',.6)} href="#development" className="brace-story-link" tabIndex={shown?0:-1}>Follow its development<ArrowUpRight size={16} aria-hidden="true"/></a>}
              </>}
            </div>;
          })}
        </div>
        <div className="brace-bottom">
          <div className="brace-controls" aria-label={staticMode?'Prototype photographs':'Story navigation'}>
            <button onClick={()=>staticMode?setPhotoPose('closed'):seek(0)} aria-pressed={staticMode?photoPose==='closed':chapter===0}>Assembled</button>
            <button onClick={()=>staticMode?setPhotoPose('open'):seek(7)} aria-pressed={staticMode?photoPose==='open':chapter===7}>Exploded</button>
            {!staticMode&&<><button disabled={chapter===0} aria-label="Previous component" onClick={()=>seek(Math.max(0,chapter-1))}><ArrowLeft size={16}/></button><button ref={nextControl} disabled={chapter===7} aria-label="Next component" onClick={()=>seek(Math.min(7,chapter+1))}><ArrowRight size={16}/></button></>}
          </div>
        </div>
        {staticMode&&<p className="brace-sr-only">{reduced?'Motion is reduced. Source photographs shown.':'3D is unavailable. Source photographs shown.'}</p>}
        {!staticMode&&<motion.div className="story-progress" style={{scaleX:scrollYProgress}} aria-hidden="true"/>}
      </div>
    </section>
    {staticMode&&<section className="static-breakdown section-shell" aria-labelledby="static-parts-title"><p className="eyebrow">Anatomy of the prototype</p><h2 id="static-parts-title">Inside the bracelet.</h2><ol>{storyParts.slice(1,7).map(part=><li key={part.id}><h3>{part.fact}</h3><p>{part.text}</p></li>)}</ol></section>}
  </>;
}
