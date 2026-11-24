"use client";

import React, {forwardRef, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore} from 'react';
import {AnimatePresence, motion, useMotionValue, useSpring} from 'motion/react';
import {ArrowLeft, Check, Eye, EyeOff, KeyRound, Loader2} from 'lucide-react';
import {cn} from '@/lib/utils';
import {BackgroundPaths} from './background-paths';
import './space-login.css';

export {cn} from '@/lib/utils';

// The owner's reference is adapted locally; no authentication service is provisioned.
// This local, decorative SVG is explicitly a fallback while the exact supplied PNG
// cannot be recovered as a file. Pass astronautSrc to use the original recovered asset.
export const DEFAULT_ASTRONAUT_IMAGE = '/images/space-astronaut-fallback.svg';

function subscribeToReducedMotion(notify: () => void) {
  const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  query?.addEventListener('change', notify);
  return () => query?.removeEventListener('change', notify);
}
function getReducedMotion() { return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? true; }
function useReducedMotionPreference() { return useSyncExternalStore(subscribeToReducedMotion, getReducedMotion, () => true); }

function useAmbientMotion(ref:React.RefObject<HTMLDivElement|null>,reduced:boolean) {
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    const element=ref.current;
    if(!element||reduced){setVisible(false);return;}
    let inView=typeof IntersectionObserver==='undefined';
    const sync=()=>setVisible(inView&&!document.hidden);
    const observer=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;sync();});
    observer?.observe(element);document.addEventListener('visibilitychange',sync);sync();
    return()=>{observer?.disconnect();document.removeEventListener('visibilitychange',sync);};
  },[ref,reduced]);
  return visible&&!reduced;
}

export function useDarkMode(enabled = true): boolean {
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    if (!enabled) return;
    const query = window.matchMedia?.('(prefers-color-scheme: dark)');
    const sync = () => {
      const html = document.documentElement;
      setIsDark(html.dataset.theme === 'dark' || html.classList.contains('dark') || (html.dataset.theme !== 'light' && !!query?.matches));
    };
    sync();
    query?.addEventListener('change', sync);
    const observer = typeof MutationObserver === 'undefined' ? null : new MutationObserver(sync);
    observer?.observe(document.documentElement, {attributes:true, attributeFilter:['class', 'data-theme']});
    return () => { query?.removeEventListener('change', sync); observer?.disconnect(); };
  }, [enabled]);
  return isDark;
}

export const GLASS_PRESETS = {
  subtle: {backgroundOpacity:0.06, saturation:1.1, brightness:55, blur:8, displace:0.3, distortionScale:-20, redOffset:-1, greenOffset:1, blueOffset:3, mixBlendMode:'difference'},
  default: {backgroundOpacity:0.1, saturation:1.4, brightness:55, blur:10, displace:0.4, distortionScale:-35, redOffset:0, greenOffset:2, blueOffset:4, mixBlendMode:'difference'},
  bold: {backgroundOpacity:0.18, saturation:1.8, brightness:60, blur:12, displace:0.6, distortionScale:-55, redOffset:1, greenOffset:3, blueOffset:6, mixBlendMode:'screen'},
  ghost: {backgroundOpacity:0, saturation:1, brightness:55, blur:6, displace:0, distortionScale:0, redOffset:0, greenOffset:0, blueOffset:0, mixBlendMode:'difference'},
} as const;
export type GlassVariant = keyof typeof GLASS_PRESETS;
export const GLASS_DEFAULTS = {width:'auto', height:'auto', borderRadius:16, borderWidth:0.03, opacity:0.93, xChannel:'R' as const, yChannel:'G' as const};
export interface GlassProps {
  variant?:GlassVariant; children?:React.ReactNode; className?:string; style?:React.CSSProperties;
  width?:number|string; height?:number|string; borderRadius?:number; borderWidth?:number;
  brightness?:number; opacity?:number; blur?:number; displace?:number; backgroundOpacity?:number;
  saturation?:number; distortionScale?:number; redOffset?:number; greenOffset?:number; blueOffset?:number;
  xChannel?:'R'|'G'|'B'|'A'; yChannel?:'R'|'G'|'B'|'A'; mixBlendMode?:React.CSSProperties['mixBlendMode']; dark?:boolean;
  /** Use the portable blur rendering when the host cannot render SVG backdrop filters. */
  filterMode?:'auto'|'blur';
}
const finite = (value:number|undefined, fallback:number) => value !== undefined && Number.isFinite(value) ? value : fallback;
function supportsSvgGlass() {
  return typeof CSS !== 'undefined' && typeof CSS.supports === 'function'
    && CSS.supports('backdrop-filter', 'url(#space-glass-probe)')
    && typeof SVGFEImageElement !== 'undefined';
}

export function Glass({variant='default', children, className='', style={}, width, height, borderRadius, borderWidth,
  brightness, opacity, blur, displace, backgroundOpacity, saturation, distortionScale, redOffset, greenOffset, blueOffset,
  xChannel, yChannel, mixBlendMode, dark, filterMode='auto'}:GlassProps) {
  const uniqueId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const filterId = `space-glass-${uniqueId}`;
  const redGradId = `space-red-${uniqueId}`;
  const blueGradId = `space-blue-${uniqueId}`;
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({width:400, height:200});
  const [svgSupported, setSvgSupported] = useState(false);
  const systemDark = useDarkMode(dark === undefined);
  const isDark = dark ?? systemDark;
  const preset = GLASS_PRESETS[variant] ?? GLASS_PRESETS.default;
  const v = {
    width:width ?? GLASS_DEFAULTS.width, height:height ?? GLASS_DEFAULTS.height,
    borderRadius:Math.max(0,finite(borderRadius,GLASS_DEFAULTS.borderRadius)),
    borderWidth:Math.max(0,finite(borderWidth,GLASS_DEFAULTS.borderWidth)),
    brightness:Math.max(0,Math.min(100,finite(brightness,preset.brightness))),
    opacity:Math.max(0,Math.min(1,finite(opacity,GLASS_DEFAULTS.opacity))),
    blur:Math.max(0,finite(blur,preset.blur)), displace:finite(displace,preset.displace),
    backgroundOpacity:Math.max(0,Math.min(1,finite(backgroundOpacity,preset.backgroundOpacity))),
    saturation:Math.max(0,finite(saturation,preset.saturation)), distortionScale:finite(distortionScale,preset.distortionScale),
    redOffset:finite(redOffset,preset.redOffset), greenOffset:finite(greenOffset,preset.greenOffset), blueOffset:finite(blueOffset,preset.blueOffset),
    xChannel:xChannel ?? GLASS_DEFAULTS.xChannel, yChannel:yChannel ?? GLASS_DEFAULTS.yChannel, mixBlendMode:mixBlendMode ?? preset.mixBlendMode,
  };
  useEffect(() => { setSvgSupported(filterMode !== 'blur' && supportsSvgGlass()); }, [filterMode]);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      const width = Math.max(1,Math.round(rect.width || 400));
      const height = Math.max(1,Math.round(rect.height || 200));
      setSize(old => old.width === width && old.height === height ? old : {width,height});
    };
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize',measure);
      return () => window.removeEventListener('resize',measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const map = useMemo(() => {
    const edge = Math.min(size.width,size.height) * v.borderWidth * 0.5;
    const svg = `<svg viewBox="0 0 ${size.width} ${size.height}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%"><stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="red"/></linearGradient><linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="blue"/></linearGradient></defs><rect width="${size.width}" height="${size.height}" fill="black"/><rect width="${size.width}" height="${size.height}" rx="${v.borderRadius}" fill="url(#${redGradId})"/><rect width="${size.width}" height="${size.height}" rx="${v.borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode:${v.mixBlendMode}"/><rect x="${edge}" y="${edge}" width="${Math.max(1,size.width-edge*2)}" height="${Math.max(1,size.height-edge*2)}" rx="${v.borderRadius}" fill="hsl(0 0% ${v.brightness}% / ${v.opacity})" style="filter:blur(${v.blur}px)"/></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }, [size.width,size.height,v.borderWidth,v.borderRadius,v.mixBlendMode,v.brightness,v.opacity,v.blur,redGradId,blueGradId]);
  const filter = svgSupported ? `url(#${filterId}) saturate(${v.saturation})` : `blur(12px) saturate(${v.saturation})`;
  const containerStyle:React.CSSProperties = {...style,
    ...(v.width !== 'auto' ? {width:v.width} : {}), ...(v.height !== 'auto' ? {height:v.height} : {}),
    borderRadius:v.borderRadius, background:isDark ? `rgb(24 22 38 / ${svgSupported ? v.backgroundOpacity : Math.max(0.3,v.backgroundOpacity)})` : `rgb(255 255 255 / ${Math.max(0.2,v.backgroundOpacity)})`,
    backdropFilter:filter, WebkitBackdropFilter:filter,
    border:isDark ? '1px solid rgb(255 255 255 / .14)' : '1px solid rgb(0 0 0 / .12)',
    boxShadow:'0 0 1px rgb(255 255 255 / .15) inset, 0 4px 16px rgb(0 0 0 / .08)',
  };
  return <div ref={ref} className={cn('space-glass',className)} style={containerStyle} data-glass-renderer={svgSupported ? 'svg' : 'blur'}>
    {svgSupported && <svg aria-hidden="true" focusable="false" className="space-glass-filter" width="0" height="0" xmlns="http://www.w3.org/2000/svg"><defs>
      <filter id={filterId} colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
        <feImage href={map} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map"/>
        <feDisplacementMap in="SourceGraphic" in2="map" scale={v.distortionScale+v.redOffset} xChannelSelector={v.xChannel} yChannelSelector={v.yChannel} result="dispRed"/>
        <feColorMatrix in="dispRed" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="red"/>
        <feDisplacementMap in="SourceGraphic" in2="map" scale={v.distortionScale+v.greenOffset} xChannelSelector={v.xChannel} yChannelSelector={v.yChannel} result="dispGreen"/>
        <feColorMatrix in="dispGreen" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="green"/>
        <feDisplacementMap in="SourceGraphic" in2="map" scale={v.distortionScale+v.blueOffset} xChannelSelector={v.xChannel} yChannelSelector={v.yChannel} result="dispBlue"/>
        <feColorMatrix in="dispBlue" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="blue"/>
        <feBlend in="red" in2="green" mode="screen" result="rg"/><feBlend in="rg" in2="blue" mode="screen" result="output"/>
        <feGaussianBlur in="output" stdDeviation={Math.max(0,v.displace)}/>
      </filter>
    </defs></svg>}
    <div className="space-glass-content">{children}</div>
  </div>;
}

export interface GlassInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>,'size'> {
  variant?:GlassVariant; containerClassName?:string; rightElement?:React.ReactNode;
  borderRadius?:number; height?:number|string; glassProps?:Partial<GlassProps>;
}
export const GlassInput = forwardRef<HTMLInputElement,GlassInputProps>(function GlassInput({variant='default',className='',containerClassName='',rightElement,borderRadius=14,height=52,glassProps,...inputProps},ref) {
  return <Glass variant={variant} borderRadius={borderRadius} dark height={height} {...glassProps} className={cn('space-input-glass',containerClassName)}>
    <div className="space-input-wrap"><input ref={ref} className={cn('space-input',rightElement && 'space-input-has-end',className)} {...inputProps}/>
      {rightElement && <div className="space-input-end">{rightElement}</div>}
    </div>
  </Glass>;
});

function SparkleStar({className,style}:{className?:string;style?:React.CSSProperties}) {
  return <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor" className={cn('space-sparkle',className)} style={style}><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/></svg>;
}
// These social brand paths are preserved from the supplied reference, rather than
// replaced with inaccurate generic icons. Generic controls use lucide-react.
function GoogleIcon() { return <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>; }
function GitHubIcon() { return <svg aria-hidden="true" focusable="false" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>; }
function FacebookIcon() { return <svg aria-hidden="true" focusable="false" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>; }
function WindowsIcon() { return <svg aria-hidden="true" focusable="false" fill="currentColor" viewBox="0 0 24 24"><path d="M0 3.449L9.75 2.1v9.451H0V3.449zm10.75-1.551L24 0v11.551h-13.25V1.898zM0 12.449h9.75v9.451L0 20.551v-8.102zm10.75 0H24V24l-13.25-1.898v-9.653z"/></svg>; }

export function CosmicStarfield({reduced=false}:{reduced?:boolean}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    let ctx:CanvasRenderingContext2D|null;
    try {ctx=canvas.getContext('2d');} catch {return;}
    if (!ctx) return;
    type Star = {x:number;y:number;size:number;baseOpacity:number;speed:number;color:string;sparkle:boolean};
    type ShootingStar = {x:number;y:number;length:number;speed:number;angle:number;life:number};
    let width=1,height=1,dpr=1,stars:Star[]=[],shooting:ShootingStar[]=[],raf=0,running=false,visible=true,last=0,tick=0;
    const pointer = {x:0,y:0,tx:0,ty:0};
    const colors = ['#ffffff','#e0f2fe','#fdf4ff','#fbcfe8','#bae6fd'];
    const measure = () => {
      const box=parent.getBoundingClientRect();
      width=Math.max(1,Math.round(box.width || parent.clientWidth || window.innerWidth));
      height=Math.max(1,Math.round(box.height || parent.clientHeight || window.innerHeight));
      dpr=Math.min(2,window.devicePixelRatio || 1);
      canvas.width=Math.round(width*dpr); canvas.height=Math.round(height*dpr);
      stars=Array.from({length:Math.min(650,Math.max(30,Math.floor(width*height/3200)))},()=>{
        const sparkle=Math.random()<0.08;
        return {x:Math.random()*width,y:Math.random()*height,size:sparkle?Math.random()*1.8+1.2:Math.random()*1.3+0.5,baseOpacity:sparkle?0.6+Math.random()*0.4:0.2+Math.random()*0.7,speed:0.48+Math.random()*1.2,color:colors[Math.floor(Math.random()*colors.length)],sparkle};
      });
      shooting=[];
    };
    const draw = (dt:number) => {
      tick+=dt;
      pointer.x+=(pointer.tx-pointer.x)*(1-Math.exp(-dt*3)); pointer.y+=(pointer.ty-pointer.y)*(1-Math.exp(-dt*3));
      ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,width,height);
      for (let i=0;i<stars.length;i++) {
        const star=stars[i]; const x=star.x+pointer.x*star.size*0.8; const y=star.y+pointer.y*star.size*0.8;
        ctx.fillStyle=star.color; ctx.globalAlpha=reduced?star.baseOpacity:Math.max(0.1,Math.min(1,star.baseOpacity+Math.sin(tick*star.speed+i)*0.35));
        ctx.beginPath();
        if (star.sparkle) { const s=star.size*2.2; ctx.moveTo(x,y-s);ctx.lineTo(x+s*0.25,y-s*0.25);ctx.lineTo(x+s,y);ctx.lineTo(x+s*0.25,y+s*0.25);ctx.lineTo(x,y+s);ctx.lineTo(x-s*0.25,y+s*0.25);ctx.lineTo(x-s,y);ctx.lineTo(x-s*0.25,y-s*0.25);ctx.closePath();ctx.fill();ctx.beginPath();ctx.arc(x,y,star.size*0.8,0,Math.PI*2);ctx.fill(); }
        else { ctx.arc(x,y,star.size,0,Math.PI*2);ctx.fill(); }
      }
      if (!reduced && Math.random()<1-Math.exp(-0.72*dt) && shooting.length<2) shooting.push({x:Math.random()*width,y:Math.random()*height*0.5,length:Math.random()*80+40,speed:420+Math.random()*540,angle:Math.PI/4+Math.random()*0.2-0.1,life:1});
      for (const star of shooting) { star.x+=Math.cos(star.angle)*star.speed*dt;star.y+=Math.sin(star.angle)*star.speed*dt;star.life-=dt*0.9;ctx.globalAlpha=Math.max(0,star.life*0.8);ctx.strokeStyle='#ffffff';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(star.x,star.y);ctx.lineTo(star.x-Math.cos(star.angle)*star.length,star.y-Math.sin(star.angle)*star.length);ctx.stroke(); }
      shooting=shooting.filter(star=>star.life>0&&star.x<width+100&&star.y<height+100);ctx.globalAlpha=1;
    };
    const stop = () => { running=false;cancelAnimationFrame(raf);raf=0; };
    const frame = (now:number) => { if (!running) return;const dt=Math.min(0.05,Math.max(0,(now-last)/1000));last=now;draw(dt);raf=requestAnimationFrame(frame); };
    const start = () => { if (running || reduced || !visible || document.hidden) return;running=true;last=performance.now();raf=requestAnimationFrame(frame); };
    const resize = () => { measure();draw(0); };
    const visibility = () => { if (document.hidden) stop();else start(); };
    const move = (event:PointerEvent) => { if (event.pointerType === 'touch' || !running) return; const box=parent.getBoundingClientRect();pointer.tx=(event.clientX-box.left-width/2)*0.03;pointer.ty=(event.clientY-box.top-height/2)*0.03; };
    const leave = () => {pointer.tx=0;pointer.ty=0;};
    const observer=typeof ResizeObserver === 'undefined'?null:new ResizeObserver(resize);observer?.observe(parent);
    const intersection=typeof IntersectionObserver === 'undefined'?null:new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)start();else stop();});intersection?.observe(parent);
    window.addEventListener('resize',resize); document.addEventListener('visibilitychange',visibility);
    if (!reduced) {parent.addEventListener('pointermove',move,{passive:true});parent.addEventListener('pointerleave',leave);}
    resize();start();
    return () => {stop();observer?.disconnect();intersection?.disconnect();window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);parent.removeEventListener('pointermove',move);parent.removeEventListener('pointerleave',leave);};
  }, [reduced]);
  return <canvas ref={ref} aria-hidden="true" className="space-starfield"/>;
}

export type SpaceLoginProvider = 'google'|'github'|'facebook'|'windows'|'passkey';
export type SpaceLoginResult = {authenticated:true}|{authenticated:false;reason?:'credentials'|'unavailable'|'network'};
export type SpaceLoginData = {email:string;password:string;rememberMe:boolean};
export type SpaceLoginRequest = {signal:AbortSignal};
export interface SpaceLoginProps {
  title?:string; subtitle?:string; astronautSrc?:string;
  /** The host must return authenticated:true only after its real provider confirms a session. */
  onSubmit?:(data:SpaceLoginData,request:SpaceLoginRequest)=>Promise<SpaceLoginResult>|SpaceLoginResult;
  onForgotPassword?:()=>void; onSignUp?:()=>void;
  onSocialLogin?:(provider:SpaceLoginProvider,request:SpaceLoginRequest)=>Promise<SpaceLoginResult>|SpaceLoginResult;
  availableProviders?:readonly SpaceLoginProvider[]; onAuthenticated?:()=>void;
  className?:string; defaultEmail?:string; showSocialButtons?:boolean; glassVariant?:GlassVariant;
  backHref?:string; backLabel?:string;
  previewHref?:string;
}
const EMPTY_PROVIDERS:readonly SpaceLoginProvider[]=[];
const PROVIDERS:readonly SpaceLoginProvider[]=['google','github','facebook','windows','passkey'];
const PROVIDER_NAMES:Record<SpaceLoginProvider,string>={google:'Google',github:'GitHub',facebook:'Facebook',windows:'Microsoft',passkey:'Passkey'};
const ERRORS={credentials:'The email or password wasn’t accepted. Please try again.',unavailable:'Account access isn’t available right now. Please try again later.',network:'We couldn’t sign you in. Please check your connection and try again.'};

export function SpaceLogin({title='Sign In',subtitle,astronautSrc=DEFAULT_ASTRONAUT_IMAGE,onSubmit,onForgotPassword,onSignUp,onSocialLogin,availableProviders=EMPTY_PROVIDERS,onAuthenticated,className,defaultEmail='',showSocialButtons=true,glassVariant='default',backHref='/',backLabel='Back to BraceMotion',previewHref='/account/preview'}:SpaceLoginProps) {
  const id=useId().replace(/[^a-zA-Z0-9_-]/g,'');
  const emailId=`space-email-${id}`,passwordId=`space-password-${id}`,rememberId=`space-remember-${id}`,noticeId=`space-notice-${id}`,errorId=`space-error-${id}`;
  const [email,setEmail]=useState(defaultEmail),[password,setPassword]=useState(''),[showPassword,setShowPassword]=useState(false),[rememberMe,setRememberMe]=useState(false);
  const [phase,setPhase]=useState<'idle'|'loading'|'success'>('idle'),[error,setError]=useState(''),[status,setStatus]=useState('');
  const pending=useRef<AbortController|null>(null);
  const pendingProvider=useRef<SpaceLoginProvider|null>(null);
  const rootRef=useRef<HTMLDivElement>(null);
  const mounted=useRef(false);
  const inputRef=useRef<HTMLInputElement>(null);
  const focusAfterCancel=useRef(false);
  useEffect(()=>{if(phase==='idle'&&focusAfterCancel.current){focusAfterCancel.current=false;inputRef.current?.focus();}},[phase]);
  const reduced=useReducedMotionPreference();
  const ambient=useAmbientMotion(rootRef,reduced);
  const providerKey=availableProviders.join('|');
  useEffect(()=>{
    if(!pending.current||!pendingProvider.current||providerKey.split('|').includes(pendingProvider.current))return;
    pending.current.abort();pending.current=null;pendingProvider.current=null;setPassword('');setPhase('idle');setError('');setStatus('Sign-in cancelled because this method is no longer available.');
  },[providerKey]);
  const mouseX=useMotionValue(0),mouseY=useMotionValue(0);
  const x=useSpring(mouseX,{damping:30,stiffness:60}),y=useSpring(mouseY,{damping:30,stiffness:60});
  const isLoading=phase==='loading',isSuccess=phase==='success';
  const hasSocial=showSocialButtons&&!!onSocialLogin&&availableProviders.some(provider=>PROVIDERS.includes(provider));
  const unavailable=!onSubmit&&!hasSocial;
  useEffect(() => {mounted.current=true;return()=>{mounted.current=false;pending.current?.abort();pending.current=null;};},[]);
  useEffect(() => {return()=>{
    if (!pending.current) return;
    pending.current.abort();pending.current=null;
    if (mounted.current) {setPhase('idle');setPassword('');setError('');setStatus('Sign-in cancelled because account access changed.');}
  };},[onSubmit,onSocialLogin]);
  useEffect(() => {if(reduced){mouseX.set(0);mouseY.set(0);}},[reduced,mouseX,mouseY]);
  const request = async (run:(request:SpaceLoginRequest)=>Promise<SpaceLoginResult>|SpaceLoginResult,provider:SpaceLoginProvider|null=null) => {
    if (pending.current || phase==='success') return;
    const controller=new AbortController();pending.current=controller;pendingProvider.current=provider;setPhase('loading');setError('');setStatus('Signing in…');
    try {
      const result=await run({signal:controller.signal});
      if (!mounted.current||controller.signal.aborted||pending.current!==controller) return;
      if (result?.authenticated !== true) {setError(ERRORS[result && !result.authenticated ? result.reason ?? 'network' : 'network']);setPhase('idle');setStatus('');setPassword('');return;}
      setPassword('');setPhase('success');setStatus('Welcome back!');
      try {onAuthenticated?.();} catch {setStatus('You’re signed in. Account navigation isn’t available right now.');}
    } catch {
      if (!mounted.current||controller.signal.aborted||pending.current!==controller) return;
      setError(ERRORS.network);setStatus('');setPhase('idle');setPassword('');
    } finally {if(pending.current===controller){pending.current=null;pendingProvider.current=null;}}
  };
  const submit = (event:React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!onSubmit || isLoading || isSuccess) return;
    if (!event.currentTarget.checkValidity() || !email.trim() || !password) {setError('Enter a valid email address and password.');return;}
    const data={email:email.trim(),password,rememberMe};
    void request(request=>onSubmit(data,request));
  };
  const cancel = () => {pending.current?.abort();pending.current=null;pendingProvider.current=null;setPassword('');setPhase('idle');setError('');setStatus('Sign-in cancelled.');focusAfterCancel.current=true;};
  const move = (event:React.PointerEvent<HTMLDivElement>) => {
    if(!ambient||event.pointerType==='touch')return;
    const rect=event.currentTarget.getBoundingClientRect();mouseX.set(((event.clientX-rect.left)/rect.width-0.5)*30);mouseY.set(((event.clientY-rect.top)/rect.height-0.5)*30);
  };
  return <div ref={rootRef} className={cn('space-login',className)} onPointerMove={move} onPointerLeave={()=>{mouseX.set(0);mouseY.set(0);}} data-auth-available={!unavailable} data-motion={reduced?'reduced':ambient?'full':'paused'}>
    <CosmicStarfield reduced={reduced}/>
    {!reduced&&<BackgroundPaths count={28}/>}
    <div className="space-horizon" aria-hidden="true"><div/><div/></div>
    <a className="space-back" href={backHref}><ArrowLeft size={17} aria-hidden="true"/>{backLabel}</a>
    <main className="space-login-main" aria-labelledby={`space-title-${id}`}>
      <motion.div className="space-astronaut" style={{x:ambient?x:0,y:ambient?y:0}} aria-hidden="true">
        <motion.div className="space-astronaut-float" animate={ambient?{y:[-12,14,-12],rotate:[-2,3,-2]}:{y:0,rotate:0}} transition={ambient?{duration:7,repeat:Infinity,ease:'easeInOut'}:{duration:0}}>
          <img src={astronautSrc} alt="" width="346" height="346" draggable={false} decoding="async"/>
          <motion.div className="space-accent-star" animate={ambient?{scale:[0.85,1.25,0.85],opacity:[0.65,1,0.65]}:{scale:1,opacity:1}} transition={ambient?{duration:2.8,repeat:Infinity,ease:'easeInOut'}:{duration:0}}><SparkleStar/></motion.div>
        </motion.div>
      </motion.div>
      <motion.div className="space-form-container" initial={reduced?false:{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:reduced?0:0.6,ease:'easeOut'}}>
        <a href={backHref} className="space-brand" aria-label="BraceMotion home">Brace<span>Motion</span><span aria-hidden="true">·</span></a>
        <h1 id={`space-title-${id}`}>{title}</h1>
        {subtitle && <p className="space-subtitle">{subtitle}</p>}
        <form onSubmit={submit} className="space-form" aria-label="Sign in to BraceMotion" aria-describedby={unavailable?noticeId:undefined} aria-busy={isLoading}>
          <div className="space-field"><label htmlFor={emailId}>Email</label><GlassInput ref={inputRef} id={emailId} name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required placeholder="name@example.com" value={email} onChange={event=>setEmail(event.target.value)} variant={glassVariant} disabled={!onSubmit||isLoading||isSuccess} aria-invalid={!!error} aria-describedby={error?errorId:undefined}/></div>
          <div className="space-field"><label htmlFor={passwordId}>Password</label><GlassInput id={passwordId} name="password" type={showPassword?'text':'password'} autoComplete="current-password" required placeholder="••••••••••••" value={password} onChange={event=>setPassword(event.target.value)} variant={glassVariant} disabled={!onSubmit||isLoading||isSuccess} aria-invalid={!!error} aria-describedby={error?errorId:undefined} rightElement={<button type="button" className="space-eye" onClick={()=>setShowPassword(value=>!value)} aria-label={showPassword?'Hide password':'Show password'} aria-pressed={showPassword} disabled={!onSubmit||isLoading||isSuccess}>{showPassword?<EyeOff size={20} aria-hidden="true"/>:<Eye size={20} aria-hidden="true"/>}</button>}/></div>
          <div className="space-options"><label className="space-remember" htmlFor={rememberId}><input id={rememberId} name="rememberMe" type="checkbox" checked={rememberMe} onChange={event=>setRememberMe(event.target.checked)} disabled={!onSubmit||isLoading||isSuccess}/><span>Remember me</span></label><button type="button" className="space-text-button" onClick={onForgotPassword} disabled={!onForgotPassword||isLoading}>Forgot password?</button></div>
          {error && <p role="alert" id={errorId} className="space-error">{error}</p>}
          <motion.button type="submit" className={cn('space-submit',isSuccess&&'space-submit-success')} disabled={!onSubmit||isLoading||isSuccess} whileTap={reduced?undefined:{scale:0.98}}>
            {reduced ? <span>{isLoading?<><Loader2 size={17} aria-hidden="true"/>Signing in…</>:isSuccess?<><Check size={17} aria-hidden="true"/>Welcome back!</>:"Sign In"}</span> : <AnimatePresence mode="wait" initial={false}>
              {isLoading?<motion.span key="loading" initial={{opacity:reduced?1:0}} animate={{opacity:1}} exit={{opacity:0}}><Loader2 size={17} aria-hidden="true" className={reduced?'':'space-spin'}/>Signing in…</motion.span>:isSuccess?<motion.span key="success" initial={{opacity:reduced?1:0}} animate={{opacity:1}} exit={{opacity:0}}><Check size={17} aria-hidden="true"/>Welcome back!</motion.span>:<motion.span key="idle" initial={{opacity:1}} animate={{opacity:1}} exit={{opacity:0}}>Sign In</motion.span>}
            </AnimatePresence>}
          </motion.button>
          {isLoading&&<button type="button" className="space-cancel" onClick={cancel}>Cancel sign-in</button>}
          <p role="status" aria-live="polite" className="space-visually-hidden">{status}</p>
          <p className="space-signup">Don’t have an account? <button type="button" className="space-text-button" onClick={onSignUp} disabled={!onSignUp||isLoading}>Sign Up</button></p>
          {showSocialButtons&&<><div className="space-divider" aria-hidden="true"/><div className="space-social" role="group" aria-label="Other sign-in methods">{PROVIDERS.map(provider=><motion.button key={provider} type="button" className="space-social-button" disabled={!onSocialLogin||!availableProviders.includes(provider)||isLoading||isSuccess} whileHover={reduced?undefined:{y:-2,scale:1.05}} whileTap={reduced?undefined:{scale:0.95}} onClick={()=>{if(onSocialLogin&&availableProviders.includes(provider))void request(request=>onSocialLogin(provider,request),provider);}} aria-label={`Sign in with ${PROVIDER_NAMES[provider]}`} title={!onSocialLogin||!availableProviders.includes(provider)?`${PROVIDER_NAMES[provider]} sign-in isn’t connected`:undefined}>{provider==='google'?<GoogleIcon/>:provider==='github'?<GitHubIcon/>:provider==='facebook'?<FacebookIcon/>:provider==='windows'?<WindowsIcon/>:<KeyRound size={17} className="space-key" aria-hidden="true"/>}</motion.button>)}</div></>}
        </form>
        {unavailable&&<p id={noticeId} className="space-unavailable">Account access isn’t available yet. You can <a href={backHref}>explore BraceMotion</a> and <a href={`${backHref}#contact`}>contact the team</a> without signing in. {previewHref&&<a href={previewHref}>View the public account layout preview</a>}</p>}
      </motion.div>
    </main>
  </div>;
}
export default SpaceLogin;
