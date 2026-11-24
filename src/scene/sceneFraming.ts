import {braceSceneCoord} from '@/lib/brace-choreography';
import type {DetailPart} from './detailedPose';

/** Pixel-space allocation shared by the renderer and its narrow-screen regression tests. */
export function sceneFraming(width:number,height:number,extentX:number,extentY:number,step:number,cinematic:boolean,size=1){
 const compact=cinematic&&(width<700||height<330);
 const reserve=cinematic?(step<2?4:12):Math.min(84,height*.29);
 const footer=cinematic&&step>=2?46:step>=3&&step<=6?46:cinematic&&step!==1?40:0;
 const usableWidth=Math.max(1,width-24),usableHeight=Math.max(1,height-reserve-footer-24);
 const zoom=Math.min(usableWidth/Math.max(.01,extentX*1.10),usableHeight/Math.max(.01,extentY*1.10))*size;
 return{compact,reserve,footer,usableWidth,usableHeight,zoom};
}

export interface SceneBounds {x:number;y:number;width:number;height:number}
export interface SceneView {x:number;y:number;zoom:number}
export const FOCUS_PARTS:readonly (DetailPart|undefined)[]=[undefined,undefined,'lid','controller','sensor','motor','power',undefined];
/** Absolute, scroll-driven framing. Each detail holds in the same central viewing
 * area; logarithmic zoom avoids a speed surge while travelling between sizes. */
export function anatomyView(progress:number,full:SceneBounds,parts:Partial<Record<DetailPart,SceneBounds>>,budget:ReturnType<typeof sceneFraming>):SceneView{
 const coord=braceSceneCoord(progress),a=Math.floor(coord),b=Math.min(7,a+1),t=coord-a;
 const frame=(index:number):SceneView=>{
  const part=FOCUS_PARTS[index],bounds=part?parts[part]:undefined;
  if(!bounds)return{x:full.x,y:full.y,zoom:budget.zoom};
  return{x:bounds.x,y:bounds.y,zoom:Math.min(budget.usableWidth*.64/Math.max(.01,bounds.width),budget.usableHeight*.64/Math.max(.01,bounds.height))};
 };
 const start=frame(a),end=frame(b);
 return{x:start.x+(end.x-start.x)*t,y:start.y+(end.y-start.y)*t,zoom:Math.exp(Math.log(start.zoom)+(Math.log(end.zoom)-Math.log(start.zoom))*t)};
}
