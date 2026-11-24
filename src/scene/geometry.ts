import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import helvetiker from 'three/examples/fonts/helvetiker_regular.typeface.json';

/** Visual proportions are estimated from the photographed v4 prototype, not CAD. */
export function roundedRectangle(width: number, height: number, radius: number) {
  const s = new THREE.Shape();
  const x = -width / 2, y = -height / 2, w = width, h = height, r = radius;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

export const holeCenters = [[-1.05, -.77], [1.05, -.77], [-1.05, .77], [1.05, .77]] as const;

export function createLid() {
  const shape = roundedRectangle(2.5, 2.08, .21);
  holeCenters.forEach(([x, y]) => {
    const hole = new THREE.Path();
    hole.absarc(x, y, .053, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  });
  return new THREE.ExtrudeGeometry(shape, {
    depth: .066, bevelEnabled: true, bevelSegments: 3,
    steps: 1, bevelSize: .032, bevelThickness: .034, curveSegments: 12,
  });
}

export function createCase() {
  const shape = roundedRectangle(2.48, 2.06, .2);
  const inner = roundedRectangle(2.20, 1.78, .15);
  shape.holes.push(new THREE.Path(inner.getPoints(12).reverse()));
  return new THREE.ExtrudeGeometry(shape, {
    depth: .38, bevelEnabled: true, bevelSegments: 3,
    steps: 1, bevelSize: .022, bevelThickness: .022, curveSegments: 12,
  });
}

export function createBase() {
  return new THREE.ExtrudeGeometry(roundedRectangle(2.43, 2.01, .19), {
    depth: .045, bevelEnabled: true, bevelSegments: 3,
    bevelSize: .022, bevelThickness: .022, curveSegments: 12,
  });
}

/** Blue wrapped pack visible under the controller in the supplied open v4 photo. */
export function createWrappedPack() {
  return new THREE.ExtrudeGeometry(roundedRectangle(1.20, 1.50, .065), {
    depth: .08, bevelEnabled: true, bevelSegments: 2,
    bevelSize: .018, bevelThickness: .018, curveSegments: 8,
  });
}

/** Only the externally visible black flange is represented, not an inferred switch mechanism. */
export function createSwitchHousing() {
  return new THREE.ExtrudeGeometry(roundedRectangle(.64, .26, .025), {
    depth: .07, bevelEnabled: true, bevelSegments: 2,
    bevelSize: .008, bevelThickness: .008, curveSegments: 6,
  });
}

export function createLettering(word: string) {
  const font = new FontLoader().parse(helvetiker);
  const geometry = new TextGeometry(word, {
    font, size: .345, depth: .018, curveSegments: 10,
    bevelEnabled: true, bevelThickness: .006, bevelSize: .0045, bevelSegments: 4,
  });
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox!;
  geometry.translate(-(bounds.max.x - bounds.min.x) / 2, 0, 0);
  return geometry;
}

/** A source-informed ribbon. Opening is a presentation morph, not a mechanical claim. */
export const STRAP_SEGMENTS = 160;
/** Strap cross-section: a thin rounded rectangle, so the textile edge catches light softly. */
const STRAP_HALF_WIDTH = .61, STRAP_HALF_THICKNESS = .025, STRAP_EDGE_RADIUS = .021, STRAP_CORNER_STEPS = 5;
const STRAP_PROFILE: [number, number][] = (() => {
  const w = STRAP_HALF_WIDTH - STRAP_EDGE_RADIUS, h = STRAP_HALF_THICKNESS - STRAP_EDGE_RADIUS, r = STRAP_EDGE_RADIUS;
  const corners: [number, number, number][] = [[w, h, 0], [-w, h, Math.PI / 2], [-w, -h, Math.PI], [w, -h, Math.PI * 1.5]];
  const points: [number, number][] = [];
  for (const [cx, cy, from] of corners) {
    for (let k = 0; k <= STRAP_CORNER_STEPS; k++) {
      const a = from + (k / STRAP_CORNER_STEPS) * Math.PI / 2;
      points.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  }
  return points;
})();
const RING = STRAP_PROFILE.length;
const CAP_OFFSET = (STRAP_SEGMENTS + 1) * RING;

export function strapPoint(t: number, side: number, open: number) {
  const theta = .68 + t * (Math.PI - .68);
  const closedX = 1.68 * Math.sin(theta);
  const closedZ = -1.19 + 1.12 * Math.cos(theta);
  const flatX = 1.057 + t * 2.24;
  const flatZ = -.32 - Math.sin(t * Math.PI * .92) * .33;
  return new THREE.Vector3(
    side * THREE.MathUtils.lerp(closedX, flatX, open),
    0,
    THREE.MathUtils.lerp(closedZ, flatZ, open),
  );
}

export function createStrapGeometry() {
  const geometry = new THREE.BufferGeometry();
  // Body rings, then two capped ends (centre + duplicated ring, so caps keep flat normals).
  const count = CAP_OFFSET + 2 * (RING + 1);
  const positions = new Float32Array(count * 3);
  const uvs = new Float32Array(count * 2);
  const indices: number[] = [];
  const v = (across: number) => across / STRAP_HALF_WIDTH * .5 + .5;
  for (let i = 0; i <= STRAP_SEGMENTS; i++) {
    for (let k = 0; k < RING; k++) {
      uvs[(i * RING + k) * 2] = i / STRAP_SEGMENTS;
      uvs[(i * RING + k) * 2 + 1] = v(STRAP_PROFILE[k][0]);
      if (i < STRAP_SEGMENTS) {
        const a = i * RING + k, b = i * RING + (k + 1) % RING, c = a + RING, d = b + RING;
        indices.push(a, c, b, b, c, d);
      }
    }
  }
  for (let end = 0; end < 2; end++) {
    const centre = CAP_OFFSET + end * (RING + 1), u = end;
    uvs[centre * 2] = u; uvs[centre * 2 + 1] = .5;
    for (let k = 0; k < RING; k++) {
      const at = centre + 1 + k;
      uvs[at * 2] = u; uvs[at * 2 + 1] = v(STRAP_PROFILE[k][0]);
      const next = centre + 1 + (k + 1) % RING;
      if (end === 0) indices.push(centre, next, at); else indices.push(centre, at, next);
    }
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
}

export function updateStrapGeometry(geometry: THREE.BufferGeometry, side: number, open: number) {
  const positions = geometry.getAttribute('position') as THREE.BufferAttribute;
  const point = new THREE.Vector3(), normal = new THREE.Vector3();
  for (let i = 0; i <= STRAP_SEGMENTS; i++) {
    const t = i / STRAP_SEGMENTS;
    point.copy(strapPoint(t, side, open));
    const tangent = strapPoint(Math.min(1, t + .001), side, open)
      .sub(strapPoint(Math.max(0, t - .001), side, open)).normalize();
    normal.set(-tangent.z * side, 0, tangent.x * side);
    // Tiny rounded tip taper, with no buckles or invented fastener hardware.
    const taper = 1 - .075 * Math.pow(t, 24);
    const lift = side === -1 ? .006 * t : 0;
    for (let k = 0; k < RING; k++) {
      const [across, offset] = STRAP_PROFILE[k];
      const x = point.x + normal.x * offset, y = across * taper, z = point.z + normal.z * offset - lift;
      positions.setXYZ(i * RING + k, x, y, z);
      if (i === 0 || i === STRAP_SEGMENTS) positions.setXYZ(CAP_OFFSET + (i === 0 ? 0 : RING + 1) + 1 + k, x, y, z);
    }
    if (i === 0 || i === STRAP_SEGMENTS) positions.setXYZ(CAP_OFFSET + (i === 0 ? 0 : RING + 1), point.x, 0, point.z - lift);
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
}

/** Textile strap: a fine basket weave with bound edges. Returns colour and height maps. */
export function createWovenTexture() {
  const size = 512, cell = 4;
  const colour = document.createElement('canvas'), height = document.createElement('canvas');
  colour.width = height.width = size; colour.height = height.height = size;
  const c = colour.getContext('2d')!, h = height.getContext('2d')!;
  c.fillStyle = '#d5cfbf'; c.fillRect(0, 0, size, size);
  h.fillStyle = '#5a5a5a'; h.fillRect(0, 0, size, size);
  let seed = 7;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const threadShade = Array.from({length: size / cell}, () => random() * 14 - 7);
  for (let y = 0; y < size; y += cell) {
    for (let x = 0; x < size; x += cell) {
      const over = ((x / cell + y / cell) & 1) === 0;
      const tone = (over ? 232 : 218) + threadShade[y / cell] * .6 + (random() * 6 - 3);
      c.fillStyle = `rgb(${tone},${tone - 4},${tone - 15})`;
      c.fillRect(x, y, cell - (over ? 0 : 1), cell - 1);
      const g = over ? 190 + random() * 30 : 120 + random() * 20;
      h.fillStyle = `rgb(${g},${g},${g})`;
      h.fillRect(x, y, cell - 1, cell - 1);
      c.fillStyle = 'rgba(255,252,245,.55)'; c.fillRect(x, y, 1, cell - 2);
    }
  }
  // Bound edges with a stitched line, visible on the real textile strap.
  for (const y of [16, size - 17]) {
    c.fillStyle = '#bdb39b'; c.fillRect(0, y - 3, size, 6);
    h.fillStyle = '#d8d8d8'; h.fillRect(0, y - 3, size, 6);
    for (let x = 0; x < size; x += 10) {
      c.fillStyle = '#f7f1e4'; c.fillRect(x, y - 1, 6, 2);
      h.fillStyle = '#ffffff'; h.fillRect(x, y - 1, 6, 2);
    }
  }
  const make = (canvas: HTMLCanvasElement, srgb: boolean) => {
    const texture = new THREE.CanvasTexture(canvas);
    if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(4, 1);
    texture.anisotropy = 8;
    return texture;
  };
  return { map: make(colour, true), bump: make(height, false) };
}

/** 3D-printed shell: fine layer lines with a little noise, used as a bump map. */
export function createPrintTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const image = ctx.createImageData(size, size);
  let seed = 11;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let y = 0; y < size; y++) {
    const layer = Math.sin((y / 4) * Math.PI) * 18;
    for (let x = 0; x < size; x++) {
      const value = 128 + layer + (random() - .5) * 16;
      const at = (y * size + x) * 4;
      image.data[at] = image.data[at + 1] = image.data[at + 2] = value; image.data[at + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(.45, .45);
  texture.anisotropy = 8;
  return texture;
}

export function createWire(points: [number, number, number][]) {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), 32, .018, 6, false);
}
