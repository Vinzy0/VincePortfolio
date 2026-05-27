"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Shooting Stars ───────────────────────────────────────────────────────────

function ShootingStars() {
  const ref0 = useRef<THREE.Mesh>(null);
  const ref1 = useRef<THREE.Mesh>(null);
  const ref2 = useRef<THREE.Mesh>(null);
  const meshRefs = [ref0, ref1, ref2];

  const states = useRef([
    { active: false, progress: 0, nextFire: 2.5,  sx: 14,  sy:  9, dx: -0.85, dy: -0.65, speed: 1.6 },
    { active: false, progress: 0, nextFire: 7.0,  sx: -6,  sy: 11, dx:  0.75, dy: -0.90, speed: 2.0 },
    { active: false, progress: 0, nextFire: 12.0, sx: 10,  sy:  6, dx: -0.60, dy: -0.80, speed: 1.8 },
  ]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    meshRefs.forEach((mRef, i) => {
      const s = states.current[i];
      const mesh = mRef.current;
      if (!mesh) return;

      if (!s.active) {
        if (t > s.nextFire) { s.active = true; s.progress = 0; }
        mesh.visible = false;
        return;
      }

      s.progress += delta * s.speed;
      if (s.progress >= 1) {
        s.active = false;
        s.nextFire = t + 5 + Math.random() * 7;
        mesh.visible = false;
        return;
      }

      mesh.visible = true;
      const dist = 32;
      mesh.position.set(
        s.sx + s.dx * s.progress * dist,
        s.sy + s.dy * s.progress * dist,
        -3,
      );
      mesh.rotation.z = Math.atan2(s.dy, s.dx) + Math.PI / 2;

      const p = s.progress;
      const alpha = p < 0.12 ? p / 0.12 : p > 0.72 ? (1 - p) / 0.28 : 1;
      (mesh.material as THREE.MeshBasicMaterial).opacity = alpha * 0.9;
    });
  });

  return (
    <>
      {meshRefs.map((r, i) => (
        <mesh key={i} ref={r} visible={false}>
          <cylinderGeometry args={[0.025, 0.004, 2.8, 5]} />
          <meshBasicMaterial color="#e8f0ff" transparent opacity={0} />
        </mesh>
      ))}
    </>
  );
}

// ─── Main Scene ───────────────────────────────────────────────────────────────

const BIG_STAR_COUNT = 14;

function Scene() {
  const groupRef = useRef<THREE.Group>(null);

  // Three twinkling groups of dot stars
  const geo0 = useRef<THREE.BufferGeometry>(null);
  const geo1 = useRef<THREE.BufferGeometry>(null);
  const geo2 = useRef<THREE.BufferGeometry>(null);
  const mat0 = useRef<THREE.PointsMaterial>(null);
  const mat1 = useRef<THREE.PointsMaterial>(null);
  const mat2 = useRef<THREE.PointsMaterial>(null);

  const pointSets = useMemo(() =>
    [60, 70, 50].map((count) => {
      const arr = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(2 * Math.random() - 1);
        const r     = 9 + Math.random() * 14;
        arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
        arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        arr[i * 3 + 2] = r * Math.cos(phi);
      }
      return arr;
    }),
  []);

  useEffect(() => {
    [[geo0, 0], [geo1, 1], [geo2, 2]].forEach(([gRef, idx]) => {
      (gRef as React.RefObject<THREE.BufferGeometry>).current?.setAttribute(
        "position",
        new THREE.BufferAttribute(pointSets[idx as number], 3),
      );
    });
  }, [pointSets]);

  const bigStars = useMemo(() =>
    Array.from({ length: BIG_STAR_COUNT }, (_, id) => {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 7 + Math.random() * 10;
      return {
        id,
        position: [r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi)] as [number, number, number],
        scale:    0.12 + Math.random() * 0.28,
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number],
      };
    }),
  []);

  useFrame(({ clock }, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.rotation.x += delta * 0.012;
    }

    // Twinkle each group at a different rate and phase
    const t = clock.getElapsedTime();
    if (mat0.current) mat0.current.opacity = 0.45 + 0.32 * Math.sin(t * 0.70);
    if (mat1.current) mat1.current.opacity = 0.45 + 0.32 * Math.sin(t * 1.10 + 1.8);
    if (mat2.current) mat2.current.opacity = 0.45 + 0.32 * Math.sin(t * 0.85 + 3.5);
  });

  return (
    <>
      <group ref={groupRef}>
        <points><bufferGeometry ref={geo0} /><pointsMaterial ref={mat0} size={0.065} color="#ffd44a" sizeAttenuation transparent opacity={0.7} /></points>
        <points><bufferGeometry ref={geo1} /><pointsMaterial ref={mat1} size={0.065} color="#ffd44a" sizeAttenuation transparent opacity={0.7} /></points>
        <points><bufferGeometry ref={geo2} /><pointsMaterial ref={mat2} size={0.055} color="#ffe88a" sizeAttenuation transparent opacity={0.5} /></points>

        {bigStars.map((s) => (
          <mesh key={s.id} position={s.position} rotation={s.rotation} scale={s.scale}>
            <octahedronGeometry args={[1, 0]} />
            <meshBasicMaterial color="#ffd44a" wireframe transparent opacity={0.78} />
          </mesh>
        ))}

        <mesh position={[8, 5, -4]}>
          <sphereGeometry args={[1.5, 10, 10]} />
          <meshBasicMaterial color="#e8d080" wireframe transparent opacity={0.55} />
        </mesh>
      </group>

      <ShootingStars />
    </>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function StarfieldBackground() {
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0 }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 120% 80% at 60% 0%, #010c1a 0%, #00060e 50%, #000204 100%)",
      }} />
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} xmlns="http://www.w3.org/2000/svg">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" opacity="0.09" />
      </svg>
      <Canvas style={{ position: "absolute", inset: 0 }} camera={{ position: [0, 0, 20], fov: 60 }} gl={{ alpha: true, antialias: true }}>
        <Scene />
      </Canvas>
    </div>
  );
}
