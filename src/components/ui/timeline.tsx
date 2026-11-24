// Adapted from the user-supplied Timeline.
// Built using Hyperiux Vault: https://vault.hyperiux.com
import {useEffect,useId,useRef} from 'react';
import type {CSSProperties} from 'react';
import {mountTimelineMotion,timelineDistance,TIMELINE_ROOMY_QUERY} from '@/lib/timeline-motion';
import './timeline.css';

export type TimelineItem = {id:string;label:string;title:string;description:string;source?:string};
export type TimelineProps = {
  items:readonly TimelineItem[];
  title?:string;periodLabel?:string;textColor?:string;mutedTextColor?:string;activeColor?:string;backgroundColor?:string;
  imageUrl?:string;imageAlt?:string;duration?:number;scrollDuration?:number;
};

export default function Timeline({items,title='The iteration history',periodLabel='V1–V4',textColor='var(--ink)',mutedTextColor='var(--muted)',activeColor='var(--accent)',backgroundColor='transparent',imageUrl,imageAlt,duration,scrollDuration=1.2}:TimelineProps) {
  const id=useId();const rootRef=useRef<HTMLElement>(null),viewportRef=useRef<HTMLDivElement>(null),trackRef=useRef<HTMLOListElement>(null);
  const requestedDuration=duration??scrollDuration;
  const animationDuration=Number.isFinite(requestedDuration)?Math.min(10,Math.max(.2,requestedDuration)):1.2;
  // Replace the DOM target on content changes: an old SplitText.revert() must
  // never restore previous HTML over React's newly committed text.
  const contentKey=JSON.stringify(items.map(item=>[item.id,item.label,item.title,item.description,item.source]));
  useEffect(()=>{
    const root=rootRef.current,viewport=viewportRef.current,track=trackRef.current;
    if (!root||!viewport||!track||!window.matchMedia) return;
    const media=window.matchMedia(TIMELINE_ROOMY_QUERY);
    let controller:AbortController|undefined,dispose=()=>{},timer:ReturnType<typeof setTimeout>|undefined;
    const rebuild=()=>{
      controller?.abort();dispose();dispose=()=>{};root.dataset.timelineMode='flow';
      if (!media.matches||items.length<2) return;
      root.dataset.timelineMode='horizontal';
      if(timelineDistance(track,viewport)<=0||viewport.scrollHeight>window.innerHeight*.8){root.dataset.timelineMode='flow';return;}
      controller=new AbortController();const current=controller;
      void mountTimelineMotion(root,viewport,track,animationDuration,current.signal).then(cleanup=>{
        if(current.signal.aborted) cleanup(); else {dispose=cleanup;root.dataset.timelineMode='horizontal';}
      }).catch(()=>{if(!current.signal.aborted) root.dataset.timelineMode='flow';});
    };
    const resize=()=>{clearTimeout(timer);timer=setTimeout(rebuild,100);};
    rebuild();media.addEventListener('change',rebuild);window.addEventListener('resize',resize);
    let observedWidth=root.clientWidth;
    const observer=typeof ResizeObserver==='undefined'?undefined:new ResizeObserver(entries=>{const width=entries[0]?.contentRect.width;if(width&&width!==observedWidth){observedWidth=width;resize();}});observer?.observe(root);
    document.fonts?.addEventListener('loadingdone',resize);
    return ()=>{clearTimeout(timer);controller?.abort();dispose();observer?.disconnect();media.removeEventListener('change',rebuild);window.removeEventListener('resize',resize);document.fonts?.removeEventListener('loadingdone',resize);};
  },[items,animationDuration]);
  const style={color:textColor,backgroundColor,'--journey-active':activeColor,'--journey-muted':mutedTextColor} as CSSProperties;
  return <section ref={rootRef} className="bm-timeline nexacore-history-rail" aria-labelledby={`${id}-title`} style={style} data-timeline-mode="flow">
    <div className="bm-timeline-heading"><h3 id={`${id}-title`}>{title}</h3><p>{periodLabel}. Version order from the project presentation.</p></div>
    {imageUrl&&<figure className="bm-timeline-source"><img src={imageUrl} alt={imageAlt??'Project prototype photograph'} loading="lazy"/></figure>}
    <div ref={viewportRef} className="bm-timeline-viewport"><div className="bm-timeline-track-wrap">
      <ol key={contentKey} ref={trackRef} className="bm-timeline-track" role="list">
        {items.map((item,index)=><li key={item.id} className={`bm-journey-item ${index%2?'is-bottom':'is-top'}`} data-timeline-item>
          <span className="bm-journey-stem" aria-hidden="true"/><span className="bm-journey-dot" aria-hidden="true"/>
          <div className="bm-journey-copy"><span className="bm-journey-label">{item.label}</span><h4 data-timeline-reveal>{item.title}</h4><p data-timeline-reveal>{item.description}</p>{item.source&&<span className="bm-journey-source">{item.source}</span>}</div>
        </li>)}
      </ol><span className="bm-journey-line" aria-hidden="true"/>
    </div></div>
  </section>;
}
