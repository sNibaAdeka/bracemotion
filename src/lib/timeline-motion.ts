import type {SplitText as SplitTextType} from 'gsap/SplitText';

export const TIMELINE_ROOMY_QUERY = '(min-width: 1100px) and (min-height: 780px) and (prefers-reduced-motion: no-preference)';
export function timelineDistance(track:Pick<HTMLElement,'scrollWidth'>,viewport:Pick<HTMLElement,'clientWidth'>) {
  return Math.max(0,track.scrollWidth-viewport.clientWidth);
}


/** Paragraph roles cannot be named with aria-label. Keep their real text in
 * the accessibility tree; headings can use SplitText's valid auto name. */
export function timelineSplitConfig(text:Pick<HTMLElement,'tagName'>) {
  return {type:'lines',mask:'lines',aria:text.tagName==='P'?'none':'auto',tag:'span',autoSplit:true} as const;
}
export function prepareTimelineSplitLines(split:Pick<SplitTextType,'lines'|'masks'>) {
  // Phrasing-content spans keep <p> valid, while matching the old block-line
  // and mask geometry so the horizontal reveal remains unchanged.
  [...split.lines,...split.masks].forEach(element=>{const style=(element as HTMLElement).style;style.display='block';style.position='relative';});
}

/** All browser-dependent imports happen after the preference/viewport gate. */
export async function mountTimelineMotion(root:HTMLElement,viewport:HTMLElement,track:HTMLElement,duration:number,signal:AbortSignal):Promise<()=>void> {
  if (typeof window==='undefined'||signal.aborted || !window.matchMedia?.(TIMELINE_ROOMY_QUERY).matches) return ()=>{};
  const [{gsap},{ScrollTrigger},{SplitText}] = await Promise.all([import('gsap'),import('gsap/ScrollTrigger'),import('gsap/SplitText')]);
  if (signal.aborted || !window.matchMedia(TIMELINE_ROOMY_QUERY).matches) return ()=>{};
  gsap.registerPlugin(ScrollTrigger,SplitText);
  const distance=timelineDistance(track,viewport);
  if (!distance) return ()=>{};
  const splits:SplitTextType[]=[];
  const reveals:{kill:()=>unknown}[]=[];
  const context=gsap.context(()=>{},root);
  const dispose=()=>{reveals.forEach(animation=>animation.kill());splits.forEach(split=>{split.revert();split.kill();});context.revert();};
  try {context.add(()=>{
    const slider=gsap.to(track,{x:()=>-timelineDistance(track,viewport),ease:'none',scrollTrigger:{trigger:root,start:'top 20%',end:()=>`+=${timelineDistance(track,viewport)}`,scrub:true,pin:viewport,invalidateOnRefresh:true}});
    const line=root.querySelector<HTMLElement>('.bm-journey-line');
    if (line) gsap.fromTo(line,{scaleX:0},{scaleX:1,ease:'none',scrollTrigger:{trigger:root,start:'top 20%',end:()=>`+=${timelineDistance(track,viewport)}`,scrub:true}});
    root.querySelectorAll<HTMLElement>('[data-timeline-item]').forEach((item,index)=>{
      const stem=item.querySelector('.bm-journey-stem'),dot=item.querySelector('.bm-journey-dot');
      const progress=index/Math.max(1,track.children.length-1);
      // Relative progress follows the real track, not a seven-item template.
      const endOffset=Math.min(distance,Math.max(Math.min(240,distance),distance*progress));
      const startOffset=Math.max(0,endOffset-Math.min(240,distance));
      const reveal=gsap.timeline({scrollTrigger:{trigger:root,start:()=>`top+=${startOffset} 20%`,end:()=>`top+=${endOffset} 20%`,scrub:true}});
      reveal.fromTo([stem,dot],{scale:0},{scale:1,duration:duration*.4});
      item.querySelectorAll<HTMLElement>('[data-timeline-reveal]').forEach(text=>{
        const split=SplitText.create(text,{...timelineSplitConfig(text),onSplit(self){
          prepareTimelineSplitLines(self);
          const tween=gsap.fromTo(self.lines,{yPercent:100},{yPercent:0,duration,ease:'power2.out',stagger:.02});
          reveal.add(tween,0);
          return tween;
        }});
        splits.push(split);
      });
      reveals.push(reveal);
    });
    reveals.push(slider);
  });} catch(error){dispose();throw error;}
  if (signal.aborted) {dispose();return ()=>{};}
  return dispose;
}
