import {useSyncExternalStore} from 'react';
const query='(prefers-reduced-motion: reduce)';
const getSnapshot=()=>typeof window!=='undefined'&&typeof window.matchMedia==='function'?window.matchMedia(query).matches:false;
const getServerSnapshot=()=>false;
function subscribe(onChange:()=>void){
 if(typeof window==='undefined'||typeof window.matchMedia!=='function')return()=>{};
 const media=window.matchMedia(query);
 media.addEventListener('change',onChange);
 return()=>media.removeEventListener('change',onChange);
}
/** React to preference changes as well as the value at initial mount. */
export function useReducedMotionPreference(){return useSyncExternalStore(subscribe,getSnapshot,getServerSnapshot);}
