import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

/**
 * CollabifyCore — The signature 3D artifact used across all marketing pages.
 * Mode variations: 'homepage' | 'brands' | 'creators' | 'ai' | 'demo'
 *
 * Principles:
 *  - Consistent top-left light direction
 *  - Subtle material realism (low emissive, metalness + roughness)
 *  - Respects prefers-reduced-motion
 *  - Reduced intensity on mobile/low-power via quality prop
 */

// Detect reduced motion preference
function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReduced(mq.matches);
        const handler = (e) => setReduced(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);
    return reduced;
}

/* ── Core mesh: icosahedron (homepage) ── */
const HomepageCore = ({ reduced }) => {
    const meshRef = useRef();
    const speed = reduced ? 0 : 1;

    useFrame((state) => {
        if (reduced || !meshRef.current) return;
        const t = state.clock.getElapsedTime();
        meshRef.current.rotation.x = Math.cos(t / 5) * 0.15;
        meshRef.current.rotation.y = Math.sin(t / 5) * 0.15;
    });

    return (
        <Float speed={reduced ? 0 : 1.2} rotationIntensity={reduced ? 0 : 0.3} floatIntensity={reduced ? 0 : 0.4}>
            <group ref={meshRef}>
                <mesh>
                    <icosahedronGeometry args={[4, 12]} />
                    <MeshDistortMaterial
                        color="#d0d8e8"
                        speed={reduced ? 0 : 1.5}
                        distort={0.18}
                        radius={1}
                        metalness={0.9}
                        roughness={0.15}
                        transparent
                        opacity={0.12}
                    />
                </mesh>
                <mesh scale={1.04}>
                    <icosahedronGeometry args={[4, 1]} />
                    <meshStandardMaterial
                        color="#e8eaf0"
                        wireframe
                        transparent
                        opacity={0.06}
                    />
                </mesh>
            </group>
        </Float>
    );
};

/* ── Brands: node network ── */
const BrandsCore = ({ reduced }) => {
    const groupRef = useRef();
    const count = reduced ? 20 : 38;

    const [positions, linePositions] = useMemo(() => {
        const pos = [];
        for (let i = 0; i < count; i++) {
            pos.push(new THREE.Vector3(
                (Math.random() - 0.5) * 14,
                (Math.random() - 0.5) * 14,
                (Math.random() - 0.5) * 8
            ));
        }
        const lines = [];
        for (let i = 0; i < count; i++) {
            for (let j = i + 1; j < count; j++) {
                if (pos[i].distanceTo(pos[j]) < 5) {
                    lines.push(pos[i].x, pos[i].y, pos[i].z, pos[j].x, pos[j].y, pos[j].z);
                }
            }
        }
        return [pos, new Float32Array(lines)];
    }, [count]);

    useFrame((state) => {
        if (reduced || !groupRef.current) return;
        groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.04;
    });

    return (
        <group ref={groupRef}>
            {positions.map((p, i) => (
                <mesh key={i} position={p}>
                    <sphereGeometry args={[0.06, 8, 8]} />
                    <meshStandardMaterial color="#c8d0e0" metalness={0.8} roughness={0.2} />
                </mesh>
            ))}
            {linePositions.length > 0 && (
                <lineSegments>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            count={linePositions.length / 3}
                            array={linePositions}
                            itemSize={3}
                        />
                    </bufferGeometry>
                    <lineBasicMaterial color="#c8d0e0" transparent opacity={0.08} />
                </lineSegments>
            )}
        </group>
    );
};

/* ── Creators: layered floating cubes ── */
const CreatorsCore = ({ reduced }) => {
    const meshRef = useRef();

    useFrame((state) => {
        if (reduced || !meshRef.current) return;
        meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.08;
        meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.12;
    });

    return (
        <Float speed={reduced ? 0 : 1.8} rotationIntensity={reduced ? 0 : 0.6} floatIntensity={reduced ? 0 : 0.8}>
            <group ref={meshRef}>
                {[1, 1.2, 1.4].map((scale, i) => (
                    <mesh key={i} scale={scale}>
                        <boxGeometry args={[3.5, 3.5, 3.5]} />
                        <meshStandardMaterial
                            color="#d8dce8"
                            wireframe
                            transparent
                            opacity={Math.max(0.03, 0.09 - i * 0.03)}
                        />
                    </mesh>
                ))}
                <mesh>
                    <boxGeometry args={[3.4, 3.4, 3.4]} />
                    <MeshDistortMaterial
                        color="#d8dce8"
                        speed={reduced ? 0 : 0.8}
                        distort={0.15}
                        radius={1}
                        metalness={0.9}
                        roughness={0.08}
                        transparent
                        opacity={0.08}
                    />
                </mesh>
            </group>
        </Float>
    );
};

/* ── AI / How It Works: ring torus ── */
const AICore = ({ reduced }) => {
    const groupRef = useRef();

    useFrame((state) => {
        if (reduced || !groupRef.current) return;
        groupRef.current.rotation.x = state.clock.getElapsedTime() * 0.07;
        groupRef.current.rotation.z = state.clock.getElapsedTime() * 0.05;
    });

    return (
        <Float speed={reduced ? 0 : 1.0} rotationIntensity={reduced ? 0 : 0.4} floatIntensity={reduced ? 0 : 0.3}>
            <group ref={groupRef}>
                <mesh>
                    <torusGeometry args={[3.5, 0.12, 16, 80]} />
                    <meshStandardMaterial color="#c8d0e0" metalness={0.95} roughness={0.05} transparent opacity={0.5} />
                </mesh>
                <mesh rotation={[Math.PI / 3, 0, 0]}>
                    <torusGeometry args={[3.5, 0.08, 12, 80]} />
                    <meshStandardMaterial color="#c8d0e0" metalness={0.9} roughness={0.1} transparent opacity={0.3} />
                </mesh>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                    <torusGeometry args={[3.5, 0.06, 10, 80]} />
                    <meshStandardMaterial color="#c8d0e0" metalness={0.85} roughness={0.15} transparent opacity={0.2} />
                </mesh>
            </group>
        </Float>
    );
};

/* ── Demo: octahedron ── */
const DemoCore = ({ reduced }) => {
    const meshRef = useRef();

    useFrame((state) => {
        if (reduced || !meshRef.current) return;
        meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.09;
        meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.14;
    });

    return (
        <Float speed={reduced ? 0 : 1.5} rotationIntensity={reduced ? 0 : 0.5} floatIntensity={reduced ? 0 : 0.5}>
            <group ref={meshRef}>
                <mesh>
                    <octahedronGeometry args={[4, 0]} />
                    <meshStandardMaterial color="#d0d8e8" wireframe transparent opacity={0.1} />
                </mesh>
                <mesh scale={0.9}>
                    <octahedronGeometry args={[4, 2]} />
                    <MeshDistortMaterial
                        color="#d0d8e8"
                        speed={reduced ? 0 : 1.2}
                        distort={0.2}
                        radius={1}
                        metalness={0.9}
                        roughness={0.1}
                        transparent
                        opacity={0.1}
                    />
                </mesh>
            </group>
        </Float>
    );
};

/**
 * CollabifyCore canvas component
 * @param {string} mode - 'homepage' | 'brands' | 'creators' | 'ai' | 'demo'
 * @param {string} className - additional className for the container div
 */
const CollabifyCore = ({ mode = 'homepage', className = '' }) => {
    const reduced = usePrefersReducedMotion();

    return (
        <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`} style={{ zIndex: 'var(--z-artifact)' }}>
            <Canvas
                camera={{ position: [0, 0, 14], fov: 45 }}
                dpr={[1, reduced ? 1 : 1.5]}
                performance={{ min: 0.5 }}
            >
                {/* Consistent top-left light direction */}
                <ambientLight intensity={0.15} />
                <directionalLight position={[-6, 8, 6]} intensity={0.6} color="#f0f4ff" />
                <pointLight position={[8, -4, 6]} intensity={0.2} color="#e8eaf5" />
                <Environment preset="city" />

                {mode === 'homepage' && <HomepageCore reduced={reduced} />}
                {mode === 'brands' && <BrandsCore reduced={reduced} />}
                {mode === 'creators' && <CreatorsCore reduced={reduced} />}
                {mode === 'ai' && <AICore reduced={reduced} />}
                {mode === 'demo' && <DemoCore reduced={reduced} />}
            </Canvas>
        </div>
    );
};

export default CollabifyCore;
