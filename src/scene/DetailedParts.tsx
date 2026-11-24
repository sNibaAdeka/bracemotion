import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { roundedRectangle, createWire } from './geometry';
import type { Triple } from './detailedPose';

const COLORS = { solder: '#c8d2d4', gold: '#bba462', chip: '#182124', pcb: '#174c40', edge: '#87aa80' };
function Box({ at, size, color, metal = 0, rough = .5 }: { at: Triple; size: Triple; color: string; metal?: number; rough?: number }) {
  return <mesh position={at} castShadow receiveShadow><boxGeometry args={size} /><meshStandardMaterial color={color} metalness={metal} roughness={rough} /></mesh>;
}
function Wire({ points, color }: { points: Triple[]; color: string }) {
  const g = useMemo(() => createWire(points), [points]);
  useEffect(() => () => g.dispose(), [g]);
  return <mesh geometry={g} castShadow><meshStandardMaterial color={color} roughness={.5} /></mesh>;
}
function Silkscreen({ text, at, width, height = .13 }: { text: string; at: Triple; width: number; height?: number }) {
  const texture = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 80;
    const ctx = c.getContext('2d');
    if (ctx) { ctx.clearRect(0, 0, 512, 80); ctx.fillStyle = '#f1f4dd'; ctx.font = 'bold 45px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 256, 42, 500); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  }, [text]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh position={at}><planeGeometry args={[width, height]} /><meshBasicMaterial map={texture} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-2} /></mesh>;
}
/** Board drill holes are real geometry; pads are plated annuli, not printed black dots. */
function CircuitBoard({ width, height, holes, active = false }: { width: number; height: number; holes: Triple[]; active?: boolean }) {
  const geometry = useMemo(() => {
    const shape = roundedRectangle(width, height, .045);
    holes.forEach(([x, y]) => { const h = new THREE.Path(); h.absarc(x, y, .027, 0, Math.PI * 2, true); shape.holes.push(h); });
    return new THREE.ExtrudeGeometry(shape, { depth: .047, bevelEnabled: false, curveSegments: 10 });
  }, [width, height, holes]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <group>
    <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial color={COLORS.pcb} roughness={.68} metalness={.18} emissive={active ? '#385c35' : '#000000'} emissiveIntensity={.12} /></mesh>
    {holes.map(([x, y], i) => <group key={i} position={[x, y, .049]}>
      <mesh><ringGeometry args={[.027, .047, 16]} /><meshStandardMaterial color={COLORS.gold} metalness={.82} roughness={.3} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 0, -.05]}><ringGeometry args={[.027, .047, 16]} /><meshStandardMaterial color={COLORS.gold} metalness={.82} roughness={.3} side={THREE.DoubleSide} /></mesh>
    </group>)}
  </group>;
}
const ESP_HOLES: Triple[] = [-1, 1].flatMap(side => Array.from({ length: 8 }, (_, i) => [side * .439, .490 - i * .14, 0] as Triple));
const SENSOR_HOLES: Triple[] = [[-.19, -.29, 0], [0, -.29, 0], [.19, -.29, 0], [-.20, .32, 0], [.20, .32, 0]];
const POWER_HOLES: Triple[] = [[-.25, -.39, 0], [.25, -.39, 0], [-.25, .39, 0], [.25, .39, 0]];

/** USB shell is a hollow metal extrusion, with a dark recess and contact tongue. */
function UsbC({ at, scale = 1 }: { at: Triple; scale?: number }) {
  const g = useMemo(() => {
    const shape = roundedRectangle(.52, .18, .067);
    const inner = roundedRectangle(.434, .106, .034);
    shape.holes.push(new THREE.Path(inner.getPoints(10).reverse()));
    return new THREE.ExtrudeGeometry(shape, { depth: .29, bevelEnabled: true, bevelSize: .008, bevelThickness: .008, bevelSegments: 2 });
  }, []);
  useEffect(() => () => g.dispose(), [g]);
  return <group position={at} scale={scale}>
    <mesh geometry={g} rotation={[Math.PI / 2, 0, 0]} castShadow><meshStandardMaterial color='#d2dbdf' metalness={.92} roughness={.27} /></mesh>
    <Box at={[0, -.145, -.015]} size={[.34, .265, .04]} color='#222b2f' rough={.78} />
    {Array.from({ length: 8 }, (_, i) => <Box key={i} at={[-.14 + i * .04, -.23, .009]} size={[.019, .10, .009]} color={COLORS.gold} metal={.85} rough={.28} />)}
    {[-1, 1].map(side => <Box key={side} at={[side * .277, -.13, -.052]} size={[.08, .15, .035]} color={COLORS.solder} metal={.8} />)}
  </group>;
}
function SurfacePart({ at, size = [.092, .048, .044], color = '#bdba9a' }: { at: Triple; size?: Triple; color?: string }) {
  return <group position={at}>
    <Box at={[0, 0, 0]} size={size} color={color} rough={.65} />
    {[-1, 1].map(side => <Box key={side} at={[side * size[0] * .39, 0, .002]} size={[size[0] * .20, size[1] + .004, size[2] + .005]} color={COLORS.solder} metal={.78} rough={.3} />)}
  </group>;
}
function Button({ at }: { at: Triple }) {
  return <group position={at}><Box at={[0, 0, 0]} size={[.19, .17, .055]} color={COLORS.solder} metal={.72} />
    <mesh position={[0, 0, .043]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[.048, .048, .045, 16]} /><meshStandardMaterial color='#172327' roughness={.65} /></mesh>
  </group>;
}
export function ControllerBoard({ active }: { active: boolean }) {
  return <group name='ESP32-C3-SuperMini-assembly'>
    {/* 22.52 × 18 mm proportions. The chip, antenna and connector remain soldered to this assembly. */}
    <CircuitBoard width={1.02} height={1.276} holes={ESP_HOLES} active={active} />
    <Box at={[0, .09, .092]} size={[.283, .283, .078]} color={COLORS.chip} rough={.45} />
    <Silkscreen text='ESP32-C3' at={[0, .09, .133]} width={.24} height={.042} />
    {[-1, 1].flatMap(side => Array.from({ length: 8 }, (_, i) => <group key={`${side}-${i}`}>
      <Box at={[side * .151, .09 - .09905 + i * .0283, .076]} size={[.027, .018, .02]} color={COLORS.solder} metal={.72} />
      <Box at={[-.09905 + i * .0283, .09 + side * .151, .076]} size={[.018, .027, .02]} color={COLORS.solder} metal={.72} />
    </group>))}
    <Box at={[.07, .46, .102]} size={[.15, .225, .102]} color='#efe5cd' rough={.73} />
    <Box at={[.07, .36, .115]} size={[.15, .04, .12]} color={COLORS.solder} metal={.65} />
    <Box at={[-.16, .32, .082]} size={[.185, .12, .05]} color='#b8c4c9' metal={.84} rough={.28} />
    <Silkscreen text='40' at={[-.16, .32, .109]} width={.10} height={.041} />
    <Button at={[-.24, -.26, .09]} /><Button at={[.24, -.26, .09]} />
    <Silkscreen text='BOOT' at={[-.24, -.15, .051]} width={.20} height={.055} />
    <Silkscreen text='RST' at={[.24, -.15, .051]} width={.16} height={.055} />
    <UsbC at={[0, -.47, .145]} />
    {Array.from({ length: 6 }, (_, i) => <SurfacePart key={i} at={[-.30 + (i % 2) * .57, .34 - Math.floor(i / 2) * .135, .079]} size={[.073, .045, .037]} />)}
    {[-1, 1].flatMap(side => Array.from({ length: 6 }, (_, i) => <group key={`${side}-${i}`}>
      <Box at={[side * .302, .407 - i * .14, .050]} size={[.15, .009, .003]} color='#487456' metal={.32} />
      <Box at={[side * (.24 - i * .008), .355 - i * .115, .050]} size={[.009, .11, .003]} color='#487456' metal={.32} />
    </group>))}
    <Silkscreen text='SuperMini' at={[0, -.035, .051]} width={.34} height={.066} />
  </group>;
}
export function MotionSensor({ active }: { active: boolean }) {
  return <group name='MPU6050-illustrative-module'>
    <CircuitBoard width={.58} height={.77} holes={SENSOR_HOLES} active={active} />
    <Box at={[0, .04, .088]} size={[.23, .23, .068]} color={COLORS.chip} />
    <Silkscreen text='MPU6050' at={[0, .045, .124]} width={.20} height={.036} />
    <Silkscreen text='IMU' at={[0, .265, .051]} width={.21} height={.064} />
    {[-1, 1].flatMap(side => Array.from({ length: 6 }, (_, i) => <group key={`${side}-${i}`}><Box at={[side * .122, .04 - .071875 + i * .02875, .068]} size={[.022, .017, .013]} color={COLORS.solder} metal={.7} /><Box at={[-.071875 + i * .02875, .04 + side * .122, .068]} size={[.017, .022, .013]} color={COLORS.solder} metal={.7} /></group>))}
    {[-1, 1].map(side => <SurfacePart key={side} at={[side * .20, -.13, .076]} size={[.07, .035, .035]} />)}
    <Box at={[0, -.18, .052]} size={[.39, .011, .008]} color='#668970' metal={.45} />
  </group>;
}
const MOTOR_RED: Triple[] = [[-.15, -.06, .07], [-.32, -.24, .11], [-.33, -.49, .08], [-.14, -.60, .10]];
const MOTOR_BLACK: Triple[] = [[-.08, -.10, .065], [-.23, -.26, .13], [-.25, -.49, .11], [-.08, -.60, .1]];
export function CoinMotor() {
  return <group name='representative-coin-vibration-motor'>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[.265, .265, .125, 48]} /><meshStandardMaterial color='#b7c4ce' metalness={.92} roughness={.31} /></mesh>
    <mesh position={[0, 0, .066]}><ringGeometry args={[.22, .25, 48]} /><meshStandardMaterial color='#727f89' metalness={.9} roughness={.25} /></mesh>
    <mesh position={[0, 0, .068]}><circleGeometry args={[.205, 40]} /><meshStandardMaterial color='#cbd5d9' metalness={.78} roughness={.43} /></mesh>
    <Silkscreen text='1027' at={[0, .025, .071]} width={.22} height={.074} />
    <Box at={[-.12, -.18, .056]} size={[.17, .10, .037]} color='#a38752' metal={.7} />
    <Wire points={MOTOR_RED} color='#bb454d' /><Wire points={MOTOR_BLACK} color='#242332' />
  </group>;
}
const POWER_RED: Triple[] = [[-.36, .56, .08], [-.16, .77, .08], [.39, .72, .16], [.69, .4, .14]];
const POWER_BLACK: Triple[] = [[-.24, .56, .08], [-.12, .66, .11], [.4, .61, .19], [.57, .4, .14]];
export function PowerAssembly({ active }: { active: boolean }) {
  const pack = useMemo(() => new THREE.ExtrudeGeometry(roundedRectangle(1.05, 1.38, .06), { depth: .105, bevelEnabled: true, bevelThickness: .025, bevelSize: .022, bevelSegments: 2 }), []);
  useEffect(() => () => pack.dispose(), [pack]);
  return <group name='illustrative-lipol-and-power-assembly'>
    {/* Capacity, converter topology and exact V4 wiring are deliberately not invented. */}
    <mesh geometry={pack} position={[-.26, 0, -.05]} castShadow><meshStandardMaterial color='#9bafba' metalness={.86} roughness={.43} /></mesh>
    <Box at={[-.26, 0, .08]} size={[1.00, 1.33, .018]} color='#bcc5cd' metal={.72} rough={.46} />
    <Box at={[-.26, .0, .095]} size={[1.015, .97, .035]} color='#2b4c9d' rough={.56} />
    <Box at={[-.26, .47, .098]} size={[1.03, .08, .039]} color='#315ebd' rough={.55} />
    <Box at={[-.26, -.47, .098]} size={[1.03, .08, .039]} color='#315ebd' rough={.55} />
    <Silkscreen text='Li-Po' at={[-.26, .15, .115]} width={.43} height={.14} />
    <Silkscreen text='RECHARGEABLE' at={[-.26, -.03, .115]} width={.77} height={.08} />
    <Silkscreen text='+         −' at={[-.26, .40, .119]} width={.67} height={.10} />
    <group position={[.75, -.05, .04]}>
      <CircuitBoard width={.63} height={.90} holes={POWER_HOLES} active={active} />
      <Box at={[0, .05, .087]} size={[.18, .24, .074]} color={COLORS.chip} />
      {[-1, 1].flatMap(side => [0, 1, 2, 3].map(i => <Box key={`${side}-${i}`} at={[side * .115, -.02 + .05 * i, .077]} size={[.062, .025, .025]} color={COLORS.solder} metal={.76} />))}
      <SurfacePart at={[-.18, .26, .08]} /><SurfacePart at={[.18, .26, .08]} />
      <UsbC at={[0, -.33, .139]} scale={.8} />
      <Silkscreen text='CHARGE' at={[0, -.16, .052]} width={.44} height={.07} />
    </group>
    <Wire points={POWER_RED} color='#c35461' /><Wire points={POWER_BLACK} color='#252637' />
  </group>;
}
