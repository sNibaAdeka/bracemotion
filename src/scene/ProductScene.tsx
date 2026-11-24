import { Component, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { MotionValue } from 'motion/react';
import * as THREE from 'three';
import {
  createBase, createCase, createLettering, createLid, createStrapGeometry,
  createWire, createWovenTexture, createWrappedPack, createSwitchHousing, holeCenters, updateStrapGeometry,
} from './geometry';

export interface ProductSceneProps {
  progress: MotionValue<number>;
  reducedMotion?: boolean;
  className?: string;
  onUnavailable?: () => void;
}

const fallbackSrc = '/images/prototype-v4-closed.webp';

function SourceFallback() {
  return <img src={fallbackSrc} alt="Photograph of the BraceMotion V4 prototype: embossed white case on a light textile strap" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8%' }} />;
}

class SceneBoundary extends Component<{ children: ReactNode; onUnavailable?:()=>void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(_error: Error, _info: ErrorInfo) { this.props.onUnavailable?.(); }
  render() { return this.state.failed ? <SourceFallback /> : this.props.children; }
}

function CameraFit() {
  const { camera, size, invalidate } = useThree();
  useEffect(() => {
    const c = camera as THREE.OrthographicCamera;
    c.zoom = Math.min(size.width / 6.9, size.height / 4.8);
    c.updateProjectionMatrix();
    invalidate();
  }, [camera, size, invalidate]);
  return null;
}

function useOwnedGeometries() {
  const geometries = useMemo(() => ({
    lid: createLid(), body: createCase(), base: createBase(),
    brace: createLettering('Brace'), motion: createLettering('Motion'),
    left: createStrapGeometry(), right: createStrapGeometry(),
    wrappedPack: createWrappedPack(), switchHousing: createSwitchHousing(),
    blueWire: createWire([[-.69, -.60, .09], [-.91, -.27, .22], [-.78, .59, .20], [-.30, .63, .24], [.24, .21, .14]]),
    yellowWire: createWire([[.61, -.49, .12], [.84, -.22, .17], [.72, .48, .23], [.04, .62, .22], [-.23, .38, .16]]),
    grayWire: createWire([[-.58, .13, .15], [-.71, -.42, .20], [-.08, -.73, .23], [.67, -.32, .14]]),
  }), []);
  useEffect(() => () => Object.values(geometries).forEach(g => g.dispose()), [geometries]);
  return geometries;
}

function Bracelet({ progress, reducedMotion = false }: Omit<ProductSceneProps, 'className'>) {
  const root = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const current = useRef(reducedMotion ? 0 : progress.get());
  const lastStrap = useRef(-1);
  const { invalidate } = useThree();
  const g = useOwnedGeometries();
  const fabric = useMemo(() => createWovenTexture().map, []);
  useEffect(() => () => fabric.dispose(), [fabric]);
  useEffect(() => {
    invalidate();
    return progress.on('change', () => { if (!reducedMotion) invalidate(); });
  }, [progress, reducedMotion, invalidate]);

  useFrame((_state, dt) => {
    const target = reducedMotion ? 0 : THREE.MathUtils.clamp(progress.get(), 0, 1);
    current.current = reducedMotion ? 0 : THREE.MathUtils.damp(current.current, target, 10, Math.min(dt, .05));
    if (Math.abs(current.current - target) > .0001) invalidate();
    const p = current.current;
    const opening = THREE.MathUtils.smoothstep(p, .1, .88);
    const lifting = THREE.MathUtils.smoothstep(p, .38, 1);
    if (root.current) {
      root.current.rotation.set(-.34 - p * .21, .53 - p * .23, -.23 + p * .10);
      root.current.position.set(.12 - p * .13, -.03 - p * .24, 0);
      root.current.scale.setScalar(1.30 - p * .38);
    }
    if (lid.current) {
      // Independent lift, not a hinge. The photographed lid is removable.
      lid.current.position.set(-lifting * .12, lifting * .40, .30 + lifting * 1.33);
      lid.current.rotation.set(lifting * -.11, lifting * -.05, lifting * -.035);
    }
    if (Math.abs(lastStrap.current - opening) > .00005) {
      updateStrapGeometry(g.left, -1, opening);
      updateStrapGeometry(g.right, 1, opening);
      lastStrap.current = opening;
    }
  });

  return <group ref={root} dispose={null}>
    <mesh geometry={g.left} castShadow receiveShadow>
      <meshStandardMaterial color="#f4f1e9" map={fabric} bumpMap={fabric} bumpScale={.018} roughness={.97} side={THREE.DoubleSide} />
    </mesh>
    <mesh geometry={g.right} castShadow receiveShadow>
      <meshStandardMaterial color="#f4f1e9" map={fabric} bumpMap={fabric} bumpScale={.018} roughness={.97} side={THREE.DoubleSide} />
    </mesh>
    <mesh geometry={g.base} position={[0, 0, -.19]} castShadow receiveShadow>
      <meshStandardMaterial color="#e5e5de" roughness={.65} />
    </mesh>
    <mesh geometry={g.body} position={[0, 0, -.14]} castShadow receiveShadow>
      <meshStandardMaterial color="#eeeee8" roughness={.58} />
    </mesh>
    {/* Simplified electronics visible in the source photograph. No unseen sensor design is claimed. */}
    <group position={[0, 0, -.01]}>
      {/* The blue wrap is visible around the board in the reference; no capacity or cell layout is inferred. */}
      <mesh geometry={g.wrappedPack} position={[-.32, -.10, -.105]} castShadow receiveShadow>
        <meshStandardMaterial color="#263fa4" roughness={.48} />
      </mesh>
      <mesh position={[.29, -.01, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.15, 1.4, .12]} />
        <meshStandardMaterial color="#242e34" roughness={.85} />
      </mesh>
      <mesh position={[-.26, .04, .11]} rotation={[0, 0, -.12]} castShadow receiveShadow>
        <boxGeometry args={[.85, 1.26, .055]} />
        <meshStandardMaterial color="#222d30" roughness={.74} />
      </mesh>
      <mesh position={[-.28, -.06, .157]} rotation={[0, 0, -.12]} castShadow>
        <boxGeometry args={[.41, .43, .045]} />
        <meshStandardMaterial color="#131b20" roughness={.54} />
      </mesh>
      <mesh position={[-.2, .55, .168]} rotation={[0, 0, -.12]} castShadow>
        <boxGeometry args={[.34, .25, .10]} />
        <meshStandardMaterial color="#a8ada9" metalness={.55} roughness={.48} />
      </mesh>
      {[-1, 1].flatMap(side => Array.from({ length: 7 }, (_, i) =>
        <mesh key={`${side}-${i}`} position={[-.26 + side * .355 - i * .014, .42 - i * .14, .165]}>
          <boxGeometry args={[.065, .065, .029]} />
          <meshStandardMaterial color="#b4b39b" metalness={.45} roughness={.47} />
        </mesh>
      ))}
      <mesh geometry={g.blueWire} castShadow><meshStandardMaterial color="#354d99" roughness={.56} /></mesh>
      <mesh geometry={g.yellowWire} castShadow><meshStandardMaterial color="#bca64e" roughness={.6} /></mesh>
      <mesh geometry={g.grayWire} castShadow><meshStandardMaterial color="#989b95" roughness={.68} /></mesh>
    </group>
    {/* Source-visible black case-edge switch with a green face. No function or indicator state is implied. */}
    <group position={[.39, 1.045, .04]}>
      <mesh geometry={g.switchHousing} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#1b2528" roughness={.68} />
      </mesh>
      <mesh position={[0, .087, 0]} rotation={[.08, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[.30, .11, .15]} />
        <meshStandardMaterial color="#176b50" roughness={.43} />
      </mesh>
    </group>
    {/* Dark blind recesses beneath the lid's true through-holes. */}
    {holeCenters.map(([x, y]) => <mesh key={`${x}-${y}`} position={[x, y, .235]}>
      <circleGeometry args={[.050, 16]} /><meshStandardMaterial color="#514f48" roughness={.85} />
    </mesh>)}
    <group ref={lid} position={[0, 0, .30]}>
      <mesh geometry={g.lid} castShadow receiveShadow>
        <meshStandardMaterial color="#f0f0eb" roughness={.56} />
      </mesh>
      {/* The wordmark stays the same white plastic as the lid; grazing light reveals its raised edges. */}
      <mesh geometry={g.brace} position={[0, .15, .100]} castShadow receiveShadow>
        <meshStandardMaterial color="#f0f0eb" roughness={.56} />
      </mesh>
      <mesh geometry={g.motion} position={[0, -.36, .100]} castShadow receiveShadow>
        <meshStandardMaterial color="#f0f0eb" roughness={.56} />
      </mesh>
    </group>
  </group>;
}

function Stage({ progress, reducedMotion }: Omit<ProductSceneProps, 'className'>) {
  return <>
    <CameraFit />
    <ambientLight intensity={.22} />
    <hemisphereLight color="#fafaf7" groundColor="#92928a" intensity={.6} />
    {/* One raking key gives the physical lettering, holes and woven strap a readable light/shadow edge. */}
    <directionalLight
      position={[-4.5, 5, 3.5]} intensity={3.6} color="#fffdf8" castShadow
      shadow-mapSize={[2048, 2048]} shadow-bias={-.000025} shadow-normalBias={.002}
      shadow-camera-near={.5} shadow-camera-far={18}
      shadow-camera-left={-4.5} shadow-camera-right={4.5}
      shadow-camera-top={4.5} shadow-camera-bottom={-4.5}
    />
    {/* Fill stays well below the key so white-on-white relief is not flattened. */}
    <directionalLight position={[5, 1, 4]} intensity={.65} color="#eff2f1" />
    <directionalLight position={[1, -3, -1]} intensity={.38} color="#ffffff" />
    <Bracelet progress={progress} reducedMotion={reducedMotion} />
  </>;
}

/** Transparent, demand-rendered source-informed product scene. The parent owns scroll. */
export default function ProductScene({ progress, reducedMotion = false, className, onUnavailable }: ProductSceneProps) {
  const [contextLost, setContextLost] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const reportUnavailable = useCallback(() => {setUnavailable(true); onUnavailable?.();}, [onUnavailable]);
  return <div className={className} role={unavailable ? undefined : "img"} aria-label={unavailable ? undefined : "Three-dimensional visualization of the BraceMotion prototype. Scrolling unfolds the textile strap and lifts the lid. Illustrative reconstruction from a photograph, not an engineering model."} style={{ width: '100%', height: '100%', position: 'relative' }}>
    <SceneBoundary onUnavailable={reportUnavailable}>
      {contextLost ? <SourceFallback /> : <Canvas
        orthographic camera={{ position: [0, 0, 10], zoom: 100, near: .1, far: 50 }}
        dpr={[1, 1.75]} frameloop="demand" shadows="soft"
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        // Canvas keeps these HTML children mounted even with a healthy renderer.
        // The fallback must be passive; only real errors/context loss change availability.
        fallback={<SourceFallback />}
        onCreated={({ gl }) => {
          gl.setClearColor('#fafaf7', 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = .95;
          gl.domElement.addEventListener('webglcontextlost', (event) => { event.preventDefault(); setContextLost(true); reportUnavailable(); }, { once: true });
        }}
        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <Stage progress={progress} reducedMotion={reducedMotion} />
      </Canvas>}
    </SceneBoundary>
  </div>;
}
