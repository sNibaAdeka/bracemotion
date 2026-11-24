import { Component, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ControllerBoard, MotionSensor, CoinMotor, PowerAssembly } from './DetailedParts';
import { DETAIL_LABELS } from './detailedPose';

function InspectionFallback() { return <p style={{ padding: 24, color: '#eee1ff' }}>3D viewing is unavailable in this browser. The component description is still available below.</p>; }
class InspectionBoundary extends Component<{ children: ReactNode; onUnavailable: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onUnavailable(); }
  render() { return this.state.failed ? <InspectionFallback /> : this.props.children; }
}
function InspectionModel({ step, angles }: { step: number; angles: [number, number] }) {
  const group = useRef<THREE.Group>(null);
  const { camera, size, invalidate } = useThree();
  const scratch = useMemo(() => ({ box: new THREE.Box3(), center: new THREE.Vector3(), extent: new THREE.Vector3() }), []);
  useEffect(() => { invalidate(); }, [angles, size, invalidate]);
  useFrame(() => {
    if (!group.current) return;
    group.current.rotation.set(angles[0], angles[1], -.04);
    group.current.updateWorldMatrix(true, true);
    scratch.box.setFromObject(group.current); scratch.box.getSize(scratch.extent); scratch.box.getCenter(scratch.center);
    const c = camera as THREE.OrthographicCamera;
    c.zoom = Math.min(size.width / (scratch.extent.x * 1.35), size.height / (scratch.extent.y * 1.35));
    c.position.set(scratch.center.x, scratch.center.y, 10); c.updateProjectionMatrix(); c.updateMatrixWorld();
  });
  return <>
    <ambientLight intensity={.5} /><hemisphereLight color='#eadfff' groundColor='#35234b' intensity={1} />
    <directionalLight position={[-3, 5, 6]} intensity={3.5} color='#fff4e6' /><directionalLight position={[4, -2, 4]} intensity={1.7} color='#baa0ff' />
    <group ref={group}>
      {step === 3 ? <ControllerBoard active /> : step === 4 ? <MotionSensor active /> : step === 5 ? <CoinMotor /> : <PowerAssembly active />}
    </group>
  </>;
}
const buttonStyle = { border: '1px solid #755891', background: '#352045', color: '#f7eeff', borderRadius: 10, padding: '8px 13px', minHeight: 40, font: 'inherit', fontSize: 13, cursor: 'pointer' } as const;
export default function SceneInspector({ step, origin, fallbackFocus, onClose }: { step: number; origin: RefObject<HTMLButtonElement | null>; fallbackFocus: RefObject<HTMLDivElement | null>; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId(), helpId = useId();
  const [angles, setAngles] = useState<[number, number]>([-.27, .25]);
  const [contextLost, setContextLost] = useState(false);
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const label = DETAIL_LABELS[step];
  useEffect(() => {
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (element && !element.open) element.showModal();
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);
  function close() {
    dialog.current?.close();
  }
  const turn = (dx: number, dy: number) => setAngles(([x, y]) => [Math.max(-1.2, Math.min(1.2, x + dy)), y + dx]);
  return createPortal(<dialog ref={dialog} aria-labelledby={titleId} aria-describedby={helpId}
    onClose={() => {
      onClose();
      requestAnimationFrame(() => {
        const target = origin.current?.isConnected ? origin.current : fallbackFocus.current;
        target?.focus({ preventScroll: true });
      });
    }}
    style={{ width: 'min(680px, calc(100vw - 24px))', maxWidth: 'calc(100vw - 24px)', maxHeight: '90svh', boxSizing: 'border-box', padding: 'clamp(16px, 4vw, 28px)', margin: 'auto', overflow: 'auto', border: '1px solid #8463a6', borderRadius: 22, background: '#000', color: '#f8f0ff', boxShadow: '0 24px 140px #09020cdf' }}>
    <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 14, position: 'sticky', top: 0, zIndex: 1, background: '#000' }}>
      <div><p style={{ margin: '0 0 5px', color: '#c8a6e4', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase' }}>Components / close-up</p>
        <h2 id={titleId} style={{ margin: 0, fontSize: 'clamp(20px, 5vw, 28px)', lineHeight: 1.15 }}>{label[0]}</h2></div>
      <button type='button' onClick={close} style={buttonStyle} aria-label='Close component view'>Close</button>
    </div>
    <div role={contextLost ? undefined : 'img'} aria-label={contextLost ? undefined : `Close-up 3D model: ${label[0]}`} style={{ height: 'min(48svh, 390px)', minHeight: 180, width: '100%', margin: '10px 0', borderRadius: 16, background: '#000', touchAction: 'none', cursor: 'grab' }}
      onPointerDown={event => { if (event.button !== 0) return; event.currentTarget.setPointerCapture(event.pointerId); drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY }; }}
      onPointerMove={event => { if (drag.current?.id !== event.pointerId) return; const dx = event.clientX - drag.current.x, dy = event.clientY - drag.current.y; drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY }; turn(dx * .012, dy * .012); }}
      onPointerUp={event => { if (drag.current?.id === event.pointerId) drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
      <InspectionBoundary onUnavailable={() => setContextLost(true)}>{contextLost ? <InspectionFallback /> : <Canvas orthographic camera={{ position: [0, 0, 10], zoom: 100 }} frameloop='demand' dpr={[1, 1.5]} gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }} fallback={<InspectionFallback />}
        onCreated={({ gl }) => { gl.setClearColor('#211030', 0); gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = .95; gl.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); setContextLost(true); }, { once: true }); }}>
        <InspectionModel step={step} angles={angles} />
      </Canvas>}</InspectionBoundary>
    </div>
    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', justifyContent: 'center' }}>
      <button type='button' style={buttonStyle} onClick={() => turn(-.3, 0)} aria-label='Rotate component left'>←</button>
      <button type='button' style={buttonStyle} onClick={() => turn(.3, 0)} aria-label='Rotate component right'>→</button>
      <button type='button' style={buttonStyle} onClick={() => turn(0, -.2)} aria-label='Tilt component up'>↑</button>
      <button type='button' style={buttonStyle} onClick={() => turn(0, .2)} aria-label='Tilt component down'>↓</button>
      <button type='button' style={buttonStyle} onClick={() => setAngles([-.27, .25])}>Reset view</button>
    </div>
    <p id={helpId} style={{ margin: '14px 0 6px', color: '#e5d2f5', fontSize: 14, lineHeight: 1.5 }}>{label[1]}. Drag the model or use the rotation buttons.</p>
    <p style={{ margin: 0, color: '#cbb2dd', fontSize: 11, lineHeight: 1.5 }}>3D reconstruction based on project materials. Individual component placement is illustrative; this is not an engineering drawing.</p>
  </dialog>, document.body);
}
