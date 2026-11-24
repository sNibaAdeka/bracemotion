import { Component, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ErrorInfo, ReactNode, RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { MotionValue } from 'motion/react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createBase, createCase, createLettering, createLid, createPrintTexture, createStrapGeometry, createSwitchHousing, createWovenTexture, holeCenters, updateStrapGeometry } from './geometry';
import { ControllerBoard, MotionSensor, CoinMotor, PowerAssembly } from './DetailedParts';
import { DETAIL_LABELS, detailPose, strapOpening } from './detailedPose';
import type { DetailPart } from './detailedPose';
import SceneInspector from './SceneInspector';
import {braceCameraAt,braceSceneCoord,clamp01,smoothstep} from '@/lib/brace-choreography';
import {anatomyView,FOCUS_PARTS,sceneFraming} from './sceneFraming';
import type {SceneBounds} from './sceneFraming';

export interface DetailedSceneProps {
  progress: MotionValue<number>;
  activeStep: number;
  className?: string;
  onUnavailable?: () => void;
  cinematic?: boolean;
  /** Fires once every material is compiled and the first visible frame can draw without a stall. */
  onReady?: () => void;
}
function SourceFallback() {
  return <img src='/images/prototype-v4-closed.webp' alt='Photograph of the BraceMotion V4 prototype: white enclosure on a light textile strap' style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8%' }} />;
}
class SceneBoundary extends Component<{ children: ReactNode; onUnavailable: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(_error: Error, _info: ErrorInfo) { this.props.onUnavailable(); }
  render() { return this.state.failed ? <SourceFallback /> : this.props.children; }
}
interface ArrowRefs { path: RefObject<SVGPathElement | null>; dot: RefObject<SVGCircleElement | null> }
type StageProps = Pick<DetailedSceneProps, 'progress' | 'activeStep' | 'cinematic' | 'onReady'> & { arrows: ArrowRefs; angles: [number, number]; surface:RefObject<HTMLDivElement|null> };
function Model({ progress, activeStep, arrows, cinematic, angles, surface, onReady }: StageProps) {
  const root = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null), controller = useRef<THREE.Group>(null), sensor = useRef<THREE.Group>(null), motor = useRef<THREE.Group>(null), power = useRef<THREE.Group>(null);
  const lastStrap = useRef(-1);
  const { camera, size, invalidate, gl, scene, setFrameloop } = useThree();
  const ready = useRef(false);
  // Live motion state: damped drag, pointer tilt, entrance and whether frames must keep running.
  const live = useRef({ angles: [0, 0] as [number, number], pointer: { x: 0, y: 0 }, target: { x: 0, y: 0 }, start: -1, loop: 'demand' as 'always' | 'demand', visible: true });
  const owned = useMemo(() => {
    const geometry = {
      lid: createLid(), body: createCase(), base: createBase(), brace: createLettering('Brace'), motion: createLettering('Motion'),
      left: createStrapGeometry(), right: createStrapGeometry(), switchHousing: createSwitchHousing(),
    };
    // Real attributes before shader compilation, so programs match the first drawn frame.
    updateStrapGeometry(geometry.left, -1, 0); updateStrapGeometry(geometry.right, 1, 0);
    return geometry;
  }, []);
  // Compile every program off the main thread (KHR_parallel_shader_compile) while the loader
  // plays; the bracelet stays hidden until then, so the page never freezes on a half-drawn model.
  useEffect(() => {
    const group = root.current; if (!group) return;
    let cancelled = false;
    group.visible = false;
    const reveal = () => { if (cancelled) return; group.visible = true; ready.current = true; live.current.start = -1; invalidate(); onReady?.(); };
    gl.compileAsync(scene, camera).then(reveal, reveal);
    return () => { cancelled = true; };
  }, [gl, scene, camera, invalidate, onReady]);
  const fabric = useMemo(() => createWovenTexture(), []);
  const print = useMemo(() => createPrintTexture(), []);
  const materialDefaults=useMemo(()=>new WeakMap<THREE.Material,{opacity:number;transparent:boolean;depthWrite:boolean}>(),[]);
  const scratch = useMemo(() => ({ box: new THREE.Box3(), extent: new THREE.Vector3(), center: new THREE.Vector3(), target: new THREE.Vector3(), detailBox:new THREE.Box3(),detailExtent:new THREE.Vector3(),detailCenter:new THREE.Vector3() }), []);
  useEffect(() => () => { Object.values(owned).forEach(g => g.dispose()); fabric.map.dispose(); fabric.bump.dispose(); print.dispose(); }, [owned, fabric, print]);
  useEffect(() => {
    if (!cinematic) return;
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      live.current.target.x = event.clientX / window.innerWidth * 2 - 1;
      live.current.target.y = event.clientY / window.innerHeight * 2 - 1;
      invalidate();
    };
    const visibility = () => invalidate();
    const observer = new IntersectionObserver(([entry]) => { live.current.visible = entry.isIntersecting; invalidate(); });
    observer.observe(gl.domElement);
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); window.removeEventListener('pointermove', move); document.removeEventListener('visibilitychange', visibility); };
  }, [cinematic, gl, invalidate]);
  useEffect(() => { invalidate(); return progress.on('change', () => invalidate()); }, [progress, invalidate]);
  useEffect(() => { invalidate(); }, [activeStep, size, invalidate, angles]);

  useFrame((state, delta) => {
    if (!root.current || !ready.current) return;
    const m = live.current, dt = Math.min(delta, 1 / 20), time = state.clock.elapsedTime;
    if (m.start < 0) m.start = time;
    const p = Math.min(1, Math.max(0, Number.isFinite(progress.get()) ? progress.get() : 0));
    // Drag and keyboard turns ease into place instead of snapping.
    const ease = 1 - Math.exp(-dt * 9);
    m.angles[0] += (angles[0] - m.angles[0]) * ease; m.angles[1] += (angles[1] - m.angles[1]) * ease;
    const settling = Math.abs(angles[0] - m.angles[0]) + Math.abs(angles[1] - m.angles[1]) > 1e-4;
    root.current.position.set(0, 0, 0); root.current.scale.setScalar(1);
    // Absolute poses have no springs, elapsed-time rotation or cumulative transforms.
    const cameraPose = braceCameraAt(p);
    const coord=braceSceneCoord(p),index=Math.floor(coord),next=Math.min(7,index+1),mix=coord-index;
    root.current.rotation.set(cinematic ? cameraPose.x + m.angles[0] : -.35 + p * .17, cinematic ? cameraPose.y + m.angles[1] : .32 - p * .14, cinematic ? cameraPose.z : -.12 + p * .055);
    const parts: [DetailPart, RefObject<THREE.Group | null>][] = [['lid', lid], ['controller', controller], ['sensor', sensor], ['motor', motor], ['power', power]];
    parts.forEach(([part, ref]) => {
      if (!ref.current) return;
      const pose = detailPose(part, p);
      ref.current.position.set(...pose.position); ref.current.rotation.set(...pose.rotation); ref.current.scale.setScalar(pose.scale);
    });
    const opening = strapOpening(p);
    if (lastStrap.current !== opening) { updateStrapGeometry(owned.left, -1, opening); updateStrapGeometry(owned.right, 1, opening); lastStrap.current = opening; }
    root.current.updateWorldMatrix(true, true);
    // Retain a quiet assembly context without letting an enlarged shell compete
    // with the board under inspection. Restore original material flags exactly.
    const focusAmount=cinematic?Number(Boolean(FOCUS_PARTS[index]))*(1-mix)+Number(Boolean(FOCUS_PARTS[next]))*mix:0;
    // Entrance: the whole canvas fades in (CSS), the solid bracelet turns and settles. No
    // material transparency, so the case never turns see-through while it arrives.
    const introRaw = cinematic ? clamp01((time - m.start) / 1.6) : 1;
    const intro = 1 - Math.pow(1 - introRaw, 3);
    const contextOpacity=1-focusAmount*.90;
    const shade=(group:THREE.Object3D,amount:number)=>group.traverse(object=>{
      if(!(object instanceof THREE.Mesh))return;
      const materials=Array.isArray(object.material)?object.material:[object.material];
      for(const material of materials){
        let defaults=materialDefaults.get(material);
        if(!defaults){defaults={opacity:material.opacity,transparent:material.transparent,depthWrite:material.depthWrite};materialDefaults.set(material,defaults);}
        const transparent=amount<.999999||defaults.transparent;
        if(material.transparent!==transparent){material.transparent=transparent;material.needsUpdate=true;}
        material.opacity=defaults.opacity*amount;material.depthWrite=amount<.999999?false:defaults.depthWrite;
      }
    });
    shade(root.current,contextOpacity);
    for(const [part,ref] of parts){if(ref.current){const weight=cinematic?(FOCUS_PARTS[index]===part?1-mix:0)+(FOCUS_PARTS[next]===part?mix:0):0;shade(ref.current,contextOpacity+weight*.90);}}
    // Fit the complete overview or focus the emerging assembly. Screen-parallel
    // camera axes and one stable detail viewport keep transitions easy to follow.
    scratch.box.setFromObject(root.current);
    scratch.box.getSize(scratch.extent); scratch.box.getCenter(scratch.center);
    const c = camera as THREE.OrthographicCamera;
    const framing=sceneFraming(size.width,size.height,scratch.extent.x,scratch.extent.y,activeStep,Boolean(cinematic),cinematic?cameraPose.size:1);
    const {reserve,footer}=framing;
    const full={x:scratch.center.x,y:scratch.center.y,width:scratch.extent.x,height:scratch.extent.y};
    const needed=new Set([FOCUS_PARTS[index],FOCUS_PARTS[Math.min(7,index+1)],FOCUS_PARTS[activeStep]]);
    const bounds:Partial<Record<DetailPart,SceneBounds>>={};
    for(const [part,ref] of parts){
      if(!cinematic||!needed.has(part)||!ref.current)continue;
      scratch.detailBox.setFromObject(ref.current);scratch.detailBox.getSize(scratch.detailExtent);scratch.detailBox.getCenter(scratch.detailCenter);
      bounds[part]={x:scratch.detailCenter.x,y:scratch.detailCenter.y,width:scratch.detailExtent.x,height:scratch.detailExtent.y};
    }
    const view=cinematic?anatomyView(p,full,bounds,framing):{x:full.x,y:full.y,zoom:framing.zoom};
    c.zoom=view.zoom;
    c.position.set(view.x, view.y + (reserve - footer) / (2 * c.zoom), 15);
    c.updateProjectionMatrix(); c.updateMatrixWorld();
    // Life on the cover only: a slow float, a tilt toward the pointer and the entrance turn.
    // Applied after framing so the camera stays still while the bracelet moves.
    const cover = cinematic ? 1 - smoothstep(0, .03, p) : 0;
    const follow = 1 - Math.exp(-dt * 3.2);
    m.pointer.x += (m.target.x - m.pointer.x) * follow; m.pointer.y += (m.target.y - m.pointer.y) * follow;
    // Idle motion eases in after the entrance instead of jumping on top of it.
    const idle = cover * smoothstep(.55, 1, introRaw);
    root.current.rotation.x += (Math.sin(time * .42 + 1.1) * .03 + m.pointer.y * .09) * idle + (1 - intro) * .18;
    root.current.rotation.y += (Math.sin(time * .55) * .08 + m.pointer.x * .16) * idle - (1 - intro) * .55;
    root.current.rotation.z += Math.sin(time * .5 + 2.1) * .016 * idle;
    root.current.position.y = Math.sin(time * .8) * .045 * idle - (1 - intro) * .18;
    root.current.scale.setScalar(.9 + .1 * intro);
    root.current.updateWorldMatrix(true, true);
    const animating = Boolean(cinematic) && m.visible && !document.hidden && (cover > .001 || introRaw < 1);
    const loop = animating ? 'always' : 'demand';
    if (loop !== m.loop) { m.loop = loop; setFrameloop(loop); }
    if (!animating && (settling || Math.abs(m.target.x - m.pointer.x) + Math.abs(m.target.y - m.pointer.y) > .002)) invalidate();
    const active = activeStep === 2 ? lid.current : activeStep === 3 ? controller.current : activeStep === 4 ? sensor.current : activeStep === 5 ? motor.current : activeStep === 6 ? power.current : root.current;
    if (active) {
      const selectedPart=FOCUS_PARTS[activeStep],focused=selectedPart?bounds[selectedPart]:undefined;
      if(focused)scratch.target.set(focused.x,focused.y,.15);
      else{scratch.target.set(activeStep === 1 ? -2.45 : 0, 0, activeStep === 1 ? -.38 : .15);active.localToWorld(scratch.target);}
      scratch.target.project(c);
      const x = (scratch.target.x * .5 + .5) * size.width, y = (-scratch.target.y * .5 + .5) * size.height;
      const labelBottom = Math.min(74, reserve - 5);
      arrows.path.current?.setAttribute('d', `M ${size.width * .5} ${labelBottom} L ${size.width * .5} ${labelBottom + 9} L ${x} ${y}`);
      arrows.dot.current?.setAttribute('cx', String(x)); arrows.dot.current?.setAttribute('cy', String(y));
      if(surface.current){
        surface.current.dataset.sceneProgress=String(p);
        surface.current.dataset.focusPart=FOCUS_PARTS[activeStep]||'overview';
        surface.current.dataset.focusX=String(x/size.width);
        surface.current.dataset.focusY=String(y/size.height);
        surface.current.dataset.focusWidth=String(focused?focused.width*c.zoom/size.width:0);
        surface.current.dataset.focusHeight=String(focused?focused.height*c.zoom/size.height:0);
        surface.current.dataset.cameraZoom=String(c.zoom);
      }
    }
  });
  return <group ref={root}>
    <mesh geometry={owned.left} castShadow receiveShadow><meshPhysicalMaterial {...FABRIC} map={fabric.map} bumpMap={fabric.bump} /></mesh>
    <mesh geometry={owned.right} castShadow receiveShadow><meshPhysicalMaterial {...FABRIC} map={fabric.map} bumpMap={fabric.bump} /></mesh>
    <mesh geometry={owned.base} position={[0, 0, -.19]} castShadow receiveShadow><meshPhysicalMaterial {...SHELL} color='#e6e7e1' roughness={.56} bumpMap={print} /></mesh>
    <mesh geometry={owned.body} position={[0, 0, -.14]} castShadow receiveShadow><meshPhysicalMaterial {...SHELL} color='#f1f1ec' bumpMap={print} /></mesh>
    {holeCenters.map(([x, y]) => <mesh key={`${x}-${y}`} position={[x, y, .235]}><circleGeometry args={[.050, 24]} /><meshStandardMaterial color='#3c4045' roughness={.85} /></mesh>)}
    <group ref={controller}><ControllerBoard active={activeStep === 3} /></group>
    <group ref={sensor}><MotionSensor active={activeStep === 4} /></group>
    <group ref={motor}><CoinMotor /></group>
    <group ref={power}><PowerAssembly active={activeStep === 6} /></group>
    <group position={[.39, 1.045, .04]}>
      <mesh geometry={owned.switchHousing} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow><meshStandardMaterial color='#1b2528' roughness={.68} /></mesh>
      <mesh position={[0, .087, 0]} rotation={[.08, 0, 0]} castShadow><boxGeometry args={[.30, .11, .15]} /><meshStandardMaterial color='#176b50' roughness={.43} /></mesh>
    </group>
    <group ref={lid}>
      <mesh geometry={owned.lid} castShadow receiveShadow><meshPhysicalMaterial {...SHELL} bumpMap={print} /></mesh>
      <mesh geometry={owned.brace} position={[0, .15, .100]} castShadow receiveShadow><meshPhysicalMaterial {...SHELL} roughness={.4} /></mesh>
      <mesh geometry={owned.motion} position={[0, -.36, .100]} castShadow receiveShadow><meshPhysicalMaterial {...SHELL} roughness={.4} /></mesh>
    </group>
  </group>;
}
/** Matte printed shell: satin highlights from the room light, a faint clear coat, layer-line bump. */
const SHELL = { color: '#f4f2ec', roughness: .46, clearcoat: .22, clearcoatRoughness: .5, bumpScale: .35, envMapIntensity: 1 } as const;
/** Woven strap: rough fibres with a soft sheen along the threads. */
const FABRIC = { color: '#ddd5c6', roughness: .95, sheen: .7, sheenRoughness: .6, sheenColor: '#e6d8ff', bumpScale: 1.6, envMapIntensity: .6, side: THREE.DoubleSide } as const;
/** Image-based lighting from three's neutral studio room, so plastic and solder reflect something real. */
function StudioEnvironment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const generator = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const map = generator.fromScene(room, .04).texture;
    scene.environment = map; scene.environmentIntensity = .34;
    return () => { scene.environment = null; map.dispose(); room.dispose(); generator.dispose(); };
  }, [gl, scene]);
  return null;
}
function Stage(props: StageProps) {
  return <>
    <StudioEnvironment />
    <ambientLight intensity={.14} />
    <hemisphereLight color='#efe6ff' groundColor='#2a1640' intensity={.42} />
    <directionalLight position={[-4, 6, 7]} intensity={2.7} color='#fff4e8' castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-camera-far={25} shadow-bias={-.00004} shadow-normalBias={.015} shadow-radius={4} />
    <directionalLight position={[4.5, 3, -6]} intensity={2.6} color='#cdb2ff' />
    <directionalLight position={[5, 1, 5]} intensity={.65} color='#dccfff' />
    <directionalLight position={[-1, -5, 2]} intensity={.45} color='#c4dce8' />
    <Model {...props} />
  </>;
}
/** Procedural reconstruction. Outer geometry follows V4; internal arrangement is illustrative. */
export default function DetailedScene({ progress, activeStep, className, onUnavailable, onReady, cinematic=false }: DetailedSceneProps) {
  const mounted = useRef(true);
  useLayoutEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const [unavailable, setUnavailable] = useState(false);
  const [angles, setAngles] = useState<[number,number]>([0,0]);
  const drag = useRef<{id:number;x:number;y:number;active:boolean}|null>(null);
  const turn = (x:number,y:number) => setAngles(([tilt,spin]) => [Math.max(-.9,Math.min(.9,tilt+y)),spin+x]);
  const [inspectorStep, setInspectorStep] = useState<number | null>(null);
  const inspectButton = useRef<HTMLButtonElement>(null);
  const sceneHost = useRef<HTMLDivElement>(null);
  const reported = useRef(false);
  const path = useRef<SVGPathElement>(null), dot = useRef<SVGCircleElement>(null);
  const arrows = useMemo(() => ({ path, dot }), []);
  const step = Math.max(0, Math.min(7, Math.round(activeStep)));
  const label = DETAIL_LABELS[step];
  const reportUnavailable = useCallback(() => {
    if (reported.current) return;
    reported.current = true; setUnavailable(true); onUnavailable?.();
  }, [onUnavailable]);
  return <div ref={sceneHost} tabIndex={cinematic && !unavailable ? 0 : -1} role={cinematic && !unavailable ? 'group' : undefined} aria-label={cinematic && !unavailable ? 'Interactive bracelet. Use arrow keys to turn; Home resets the view.' : undefined}
    onKeyDown={event => { if (!cinematic || event.target !== event.currentTarget) return; if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key)) { event.preventDefault(); if (event.key === 'Home') setAngles([0,0]); else turn(event.key === 'ArrowLeft' ? -.22 : event.key === 'ArrowRight' ? .22 : 0,event.key === 'ArrowUp' ? -.16 : event.key === 'ArrowDown' ? .16 : 0); } }}
    onPointerDown={event => { if(!cinematic || unavailable || event.button!==0 || !event.currentTarget.contains(event.target as Node) || (event.target as HTMLElement).closest('button,a'))return; drag.current={id:event.pointerId,x:event.clientX,y:event.clientY,active:event.pointerType==='mouse'}; if(event.pointerType==='mouse') event.currentTarget.setPointerCapture(event.pointerId); }}
    onPointerMove={event => { const d=drag.current;if(!d||d.id!==event.pointerId)return;const dx=event.clientX-d.x,dy=event.clientY-d.y; if(!d.active){if(Math.abs(dy)>Math.abs(dx)+5){drag.current=null;return;}if(Math.abs(dx)<8)return;d.active=true;event.currentTarget.setPointerCapture(event.pointerId);}turn(dx*.008,event.pointerType==='mouse'?dy*.008:0);d.x=event.clientX;d.y=event.clientY; }}
    onPointerUp={event => {if(drag.current?.id===event.pointerId){drag.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}}} onPointerCancel={() => {drag.current=null;}} onLostPointerCapture={() => {drag.current=null;}} className={className} data-detailed-scene data-detail-step={step}  style={{ position: 'relative', width: '100%', height: '100%', isolation: 'isolate', touchAction: 'pan-y', cursor: cinematic && !unavailable ? 'grab' : undefined }}>
    <div role={unavailable ? undefined : 'img'} aria-label={unavailable ? undefined : `Three-dimensional disassembly of BraceMotion. ${label[0]}. ${label[1]}. Enclosure follows V4 photographs; internal placement is illustrative.`} style={{ width: '100%', height: '100%' }}>
    <SceneBoundary onUnavailable={reportUnavailable}>
      {unavailable ? <SourceFallback /> : <Canvas orthographic camera={{ position: [0, 0, 15], zoom: 60, near: .1, far: 40 }} dpr={[1, 2]} frameloop='demand' shadows='soft' gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        fallback={<SourceFallback />}
        onCreated={({ gl }) => {
          gl.setClearColor('#000', 0); gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1;
          gl.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); if (mounted.current) reportUnavailable(); }, { once: true });
        }} style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
        <Stage progress={progress} activeStep={step} arrows={arrows} cinematic={cinematic} angles={angles} surface={sceneHost} onReady={onReady} />
      </Canvas>}
    </SceneBoundary>
    </div>
    {!unavailable && (!cinematic || step > 1) && <div aria-hidden='true' data-detail-annotation style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <svg width='100%' height='100%' style={{ position: 'absolute', inset: 0, opacity: step > 0 && step < 7 ? 1 : 0 }}>
        <path ref={path} fill='none' stroke='#caa4ff' strokeWidth='1.3' strokeLinejoin='round' opacity='.85' />
        <circle ref={dot} r='3.5' fill='#f4eaff' stroke='#aa78eb' strokeWidth='1.5' />
      </svg>
      <div data-detail-label style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 'max-content', maxWidth: 'calc(100% - 24px)', boxSizing: 'border-box', padding: step === 0 ? '8px 13px' : '9px 14px', background: 'rgba(30, 15, 50, .94)', border: '1px solid rgba(202, 164, 255, .25)', borderRadius: 12, boxShadow: '0 8px 30px #08031033', textAlign: 'center', color: '#f6eeff' }}>
        <strong style={{ display: 'block', fontSize: 13, lineHeight: 1.4, fontWeight: 650, letterSpacing: '.012em' }}>{label[0]}</strong>
        {step !== 0 && <span style={{ display: 'block', marginTop: 2, fontSize: 11, lineHeight: 1.45, color: '#d7c1ec' }}>{label[1]}</span>}
      </div>
    </div>}
    {!unavailable && step >= 3 && step <= 6 && <button ref={inspectButton} type='button' data-detail-inspect onClick={() => setInspectorStep(step)} style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', padding: '9px 15px', border: '1px solid #9871bd', borderRadius: 999, color: '#f8efff', background: '#352047', font: 'inherit', fontSize: 12, lineHeight: 1.3, cursor: 'pointer', whiteSpace: 'nowrap' }}>Inspect component ↗</button>}
    {inspectorStep !== null && <SceneInspector step={inspectorStep} origin={inspectButton} fallbackFocus={sceneHost} onClose={() => setInspectorStep(null)} />}
  </div>;
}
