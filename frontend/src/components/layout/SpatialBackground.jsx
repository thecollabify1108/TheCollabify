import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, PerspectiveCamera, OrbitControls, Environment, Text } from '@react-three/drei';
import * as THREE from 'three';

const Logo3D = () => {
    const meshRef = useRef();

    // Continuous slow rotation
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.003;
            // Subtle floating sin wave
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        }
    });

    return (
        <group ref={meshRef}>
            {/* 
        Simplified 3D Logo: TorusKnot for an 'AI Core' feel. 
        In a real scenario, this would be the actual SVG extruded.
      */}
            <mesh castShadow receiveShadow>
                <torusKnotGeometry args={[0.5, 0.15, 128, 32]} />
                <meshStandardMaterial
                    color="#5B7CFA"
                    roughness={0.1}
                    metalness={0.8}
                    emissive="#7C6CF2"
                    emissiveIntensity={0.5}
                />
            </mesh>

            {/* Internal Glow Core */}
            <mesh>
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshStandardMaterial
                    color="#7C6CF2"
                    emissive="#7C6CF2"
                    emissiveIntensity={2}
                    transparent
                    opacity={0.8}
                />
            </mesh>
        </group>
    );
};

const Scene = () => {
    const { mouse, viewport } = useThree();
    const groupRef = useRef();

    // Cursor parallax tilt
    useFrame(() => {
        if (groupRef.current) {
            const targetRotateX = (mouse.y * Math.PI) / 36; // Max ~5 degrees
            const targetRotateY = (mouse.x * Math.PI) / 36;

            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotateX, 0.1);
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotateY, 0.1);
        }
    });

    return (
        <group ref={groupRef}>
            <Logo3D />
        </group>
    );
};

const SpatialBackground = () => {
    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#0A0F1F]">
            {/* Radial Center Glow */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    background: 'radial-gradient(circle at 50% 50%, #141B2E 0%, #0A0F1F 100%)'
                }}
            />

            <Canvas
                shadows
                gl={{ antialias: true, alpha: true }}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            >
                <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />

                {/* Lights */}
                <ambientLight intensity={0.2} />
                <directionalLight
                    position={[10, 10, 5]}
                    intensity={1.5}
                    castShadow
                    color="#FFFFFF"
                />
                <pointLight position={[-5, -5, -5]} intensity={0.5} color="#5B7CFA" />

                <Scene />

                <Environment preset="night" />
            </Canvas>

            {/* Grain Overlay */}
            <div className="grain-overlay" />
        </div>
    );
};

export default SpatialBackground;
