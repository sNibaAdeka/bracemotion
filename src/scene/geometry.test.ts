import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createBase, createCase, createLettering, createLid, createStrapGeometry, createWrappedPack, createSwitchHousing, holeCenters, strapPoint, updateStrapGeometry } from './geometry';

const finiteGeometry = (geometry: THREE.BufferGeometry) => {
  for (const attribute of Object.values(geometry.attributes)) {
    expect(Array.from(attribute.array).every(Number.isFinite)).toBe(true);
  }
};

describe('source-informed bracelet geometry', () => {
  it('has four actual lid recesses and an intact face', () => {
    const geometry = createLid();
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
    const cast = (x: number, y: number) => new THREE.Raycaster(new THREE.Vector3(x, y, 2), new THREE.Vector3(0, 0, -1)).intersectObject(mesh);
    holeCenters.forEach(([x, y]) => expect(cast(x, y)).toHaveLength(0));
    expect(cast(0, 0).length).toBeGreaterThan(0);
    finiteGeometry(geometry);
    geometry.dispose();
  });
  it('has an open case interior rather than a solid block beneath the lid', () => {
    const geometry = createCase();
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
    const intersections = new THREE.Raycaster(new THREE.Vector3(0, 0, 2), new THREE.Vector3(0, 0, -1)).intersectObject(mesh);
    expect(intersections).toHaveLength(0);
    finiteGeometry(geometry);
    geometry.dispose();
  });
  it('keeps the ribbon finite, connected and reversible throughout its full scroll range', () => {
    const geometry = createStrapGeometry();
    for (const side of [-1, 1]) {
      updateStrapGeometry(geometry, side, 0);
      const closed = Array.from(geometry.getAttribute('position').array);
      for (const open of [.25, .5, .75, 1, .75, .5, .25, 0]) {
        updateStrapGeometry(geometry, side, open);
        finiteGeometry(geometry);
        expect(geometry.boundingSphere!.radius).toBeLessThan(3.8);
      }
      expect(Array.from(geometry.getAttribute('position').array)).toEqual(closed);
      expect(strapPoint(0, side, 0).distanceTo(strapPoint(0, side, 1))).toBeLessThan(.01);
    }
    geometry.dispose();
  });
  it('fits the complete closed-to-open sequence inside the responsive camera', () => {
    for (let step = 0; step <= 20; step++) {
      const p = step / 20;
      const open = THREE.MathUtils.smoothstep(p, .1, .88);
      const lift = THREE.MathUtils.smoothstep(p, .38, 1);
      const model = new THREE.Matrix4().compose(
        new THREE.Vector3(.12 - p * .13, -.03 - p * .24, 0),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(-.34 - p * .21, .53 - p * .23, -.23 + p * .10)),
        new THREE.Vector3().setScalar(1.30 - p * .38),
      );
      const cap = new THREE.Matrix4().compose(
        new THREE.Vector3(-lift * .12, lift * .40, .30 + lift * 1.33),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(lift * -.11, lift * -.05, lift * -.035)),
        new THREE.Vector3(1, 1, 1),
      );
      const points: THREE.Vector3[] = [];
      for (const side of [-1, 1]) {
        for (let i = 0; i <= 80; i++) for (const y of [-.64, .64]) points.push(strapPoint(i / 80, side, open).add(new THREE.Vector3(0, y, 0)));
        for (const y of [-1.10, 1.10]) for (const z of [-.20, .25]) points.push(new THREE.Vector3(side * 1.30, y, z));
        for (const y of [-1.10, 1.10]) for (const z of [-.04, .14]) points.push(new THREE.Vector3(side * 1.30, y, z).applyMatrix4(cap));
      }
      for (const x of [.05, .73]) for (const y of [1.035, 1.20]) for (const z of [-.10, .20]) points.push(new THREE.Vector3(x, y, z));
      for (const [width, height] of [[820, 650], [700, 550], [390, 410], [343, 350], [343, 260], [320, 360]]) {
        const zoom = Math.min(width / 6.9, height / 4.8);
        points.forEach(point => {
          const projected = point.clone().applyMatrix4(model);
          expect(Math.abs(projected.x) * zoom).toBeLessThan(width / 2);
          expect(Math.abs(projected.y) * zoom).toBeLessThan(height / 2);
        });
      }
    }
  });
  it('makes wordmarks, the back shell and visible pack and switch geometries finite', () => {
    for (const geometry of [createLettering('Brace'), createLettering('Motion'), createBase(), createWrappedPack(), createSwitchHousing()]) {
      finiteGeometry(geometry);
      geometry.computeBoundingBox();
      expect(geometry.boundingBox!.getSize(new THREE.Vector3()).x).toBeLessThan(2.5);
      geometry.dispose();
    }
  });
});
