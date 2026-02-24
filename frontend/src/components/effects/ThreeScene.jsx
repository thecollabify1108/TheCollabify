import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, Environment, Sphere } from '@react-three/drei';
import * as THREE from 'three';

/**
 * IntelligenceCore
 * The central branding visual for the Corporate Elite experience.
 * Metallic, slow-moving, neural-inspired architecture.
 */
const IntelligenceCore = () => {
    const meshRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        meshRef.current.rotation.x = Math.cos(t / 4) * 0.2;
        meshRef.current.rotation.y = Math.sin(t / 4) * 0.2;
    });

    return (
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={meshRef}>
                <icosahedronGeometry args={[4, 15]} />
                <MeshDistortMaterial
                    color="#ffffff"
                    speed={2}
                    distort={0.3}
                    radius={1}
                    metalness={1}
                    roughness={0.1}
                    transparent
                    opacity={0.1}
                />
            </mesh>
            <mesh scale={1.05}>
                <icosahedronGeometry args={[4, 1]} />
                <meshStandardMaterial
                    color="#ffffff"
                    wireframe
                    transparent
                    opacity={0.05}
                />
            </mesh>
        </Float>
    );
};

/**
 * DataNodeNetwork
 * Specialized for Brands page. Represents data intelligence and connectivity.
 */
const DataNodeNetwork = () => {
    const groupRef = useRef();
    const count = 40;

    const [positions, connections] = useMemo(() => {
        const pos = [];
        for (let i = 0; i < count; i++) {
            pos.push(new THREE.Vector3(
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 15
            ));
        }

        const lines = [];
        for (let i = 0; i < count; i++) {
            for (let j = i + 1; j < count; j++) {
                if (pos[i].distanceTo(pos[j]) < 5) {
                    lines.push(pos[i], pos[j]);
                }
            }
        }
        return [pos, lines];
    }, []);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
        }
    });

    return (
        <group ref={groupRef}>
            {positions.map((p, i) => (
                <mesh key={i} position={p}>
                    <sphereGeometry args={[0.05, 16, 16]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
            ))}
            <lineSegments>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={connections.length}
                        array={new Float32Array(connections.flatMap(v => [v.x, v.y, v.z]))}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial color="#ffffff" transparent opacity={0.1} />
            </lineSegments>
        </group>
    );
};

/**
 * ContentCube
 * Specialized for Creators page. Layered floating architecture.
 */
const ContentCube = () => {
    const meshRef = useRef();
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.1;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
        }
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <group ref={meshRef}>
                {[1, 1.2, 1.4].map((scale, i) => (
                    <mesh key={i} scale={scale}>
                        <boxGeometry args={[4, 4, 4]} />
                        <meshStandardMaterial
                            color="#ffffff"
                            wireframe
                            transparent
                            opacity={0.1 - (i * 0.03)}
                        />
                    </mesh>
                ))}
                <mesh>
                    <boxGeometry args={[3.8, 3.8, 3.8]} />
                    <MeshDistortMaterial
                        color="#ffffff"
                        speed={1}
                        distort={0.2}
                        radius={1}
                        metalness={1}
                        roughness={0}
                        transparent
                        opacity={0.05}
                    />
                </mesh>
            </group>
        </Float>
    );
};

/**
 * AssistantVisual
 * Minimal orbital visual for the IA Assistant.
 */
const AssistantVisual = () => {
    return (
        <group scale={0.5}>
            <Sphere args={[1, 32, 32]}>
                <meshStandardMaterial color="#ffffff" metalness={1} roughness={0} />
            </Sphere>
            <Float speed={5} rotationIntensity={2} floatIntensity={1}>
                <mesh position={[2, 0, 0]}>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
                </mesh>
            </Float>
        </group>
    );
};

export const ThreeScene = ({ type = 'homepage' }) => {
    return (
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
            <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
                <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                <Environment preset="city" />

                {type === 'homepage' && <IntelligenceCore />}
                {type === 'brands' && <DataNodeNetwork />}
                {type === 'creators' && <ContentCube />}
                {type === 'assistant' && <AssistantVisual />}

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                />
            </Canvas>
        </div>
    );
};

export default ThreeScene;
