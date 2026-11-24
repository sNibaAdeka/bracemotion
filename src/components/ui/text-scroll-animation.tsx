"use client";
import {useRef} from 'react';
import {motion,useScroll,useTransform} from 'motion/react';
import type {MotionValue} from 'motion/react';
import {Cpu} from '@phosphor-icons/react/dist/csr/Cpu';
import {WaveSine} from '@phosphor-icons/react/dist/csr/WaveSine';
import {BatteryCharging} from '@phosphor-icons/react/dist/csr/BatteryCharging';
import {Hand} from '@phosphor-icons/react/dist/csr/Hand';
import {Wrench} from '@phosphor-icons/react/dist/csr/Wrench';
import {Circuitry} from '@phosphor-icons/react/dist/csr/Circuitry';
import './text-scroll-animation.css';
import {useReducedMotionPreference} from '@/lib/use-reduced-motion-preference';

const parts=[
 {label:'Textile strap',role:'Holds the enclosure',Icon:Hand},
 {label:'Removable lid',role:'Covers the electronics',Icon:Wrench},
 {label:'ESP32-C3',role:'Coordinates the prototype',Icon:Cpu},
 {label:'MPU6050',role:'Measures movement',Icon:Circuitry},
 {label:'Vibration motor',role:'Produces vibration',Icon:WaveSine},
 {label:'Power assembly',role:'Supplies the electronics',Icon:BatteryCharging},
] as const;
type CharacterProps={char:string;index:number;centerIndex:number;scrollYProgress:MotionValue<number>;reduced?:boolean};
export function CharacterV1({char,index,centerIndex,scrollYProgress,reduced=false}:CharacterProps){
 const distance=index-centerIndex;
 const x=useTransform(scrollYProgress,[0,.42],[distance*12,0]);
 const rotateX=useTransform(scrollYProgress,[0,.42],[distance*15,0]);
 return <motion.span aria-hidden="true" style={reduced?undefined:{x,rotateX}}>{char===' '?'\u00a0':char}</motion.span>;
}
function ComponentTile({index,progress,reduced}:{index:number;progress:MotionValue<number>;reduced:boolean}){
 const part=parts[index],distance=index-2.5;
 const x=useTransform(progress,[.1,.62],[distance*28,0]);
 const y=useTransform(progress,[.1,.62],[Math.abs(distance)*28,0]);
 const rotate=useTransform(progress,[.1,.62],[distance*13,0]);
 const scale=useTransform(progress,[.1,.62],[.8,1]);
 return <motion.li style={reduced?undefined:{x,y,rotate,scale}}><span aria-hidden="true"><part.Icon size={30}/></span><strong>{part.label}</strong><small>{part.role}</small></motion.li>;
}
/** Character/icon assembly from the supplied Skiper31 reference, scoped to one product section.
 * Native document scrolling; no Lenis root, nested main or negative viewport overlaps.
 */
export function Skiper31(){
 const target=useRef<HTMLDivElement>(null),reduced=useReducedMotionPreference();
 const {scrollYProgress}=useScroll({target,offset:['start end','end start']});
 const text='Every part has a purpose.';
 return <div ref={target} className={`brace-text-scroll${reduced?' is-reduced':''}`} data-component="TextScrollAnimation">
  <div className="brace-text-scroll-stage">
   <h3 aria-label={text}>{Array.from(text).map((char,index)=><CharacterV1 key={index} char={char} index={index} centerIndex={(text.length-1)/2} scrollYProgress={scrollYProgress} reduced={reduced}/>)}</h3>
   <p className="brace-text-scroll-caption">Six roles, brought into view.</p>
   <ul>{parts.map((part,index)=><ComponentTile key={part.label} index={index} progress={scrollYProgress} reduced={reduced}/>)}</ul>
   <p className="brace-text-scroll-note">Component roles from the project materials. The internal arrangement is illustrative, not a measured assembly drawing.</p>
  </div>
 </div>;
}
export default Skiper31;
