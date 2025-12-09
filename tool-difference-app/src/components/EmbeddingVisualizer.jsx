import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

// Deterministic random vector generator based on ID
const getClassVector = (id) => {
    let hash = 0;
    const str = id.toString();
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    const phi = Math.acos(2 * ((hash & 0xFF) / 255) - 1);
    const theta = 2 * Math.PI * (((hash >> 8) & 0xFF) / 255);
    const r = 3;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    return [x, y, z];
};

const FIXED_VECTORS = {
    0: [3, 0, 0],
    1: [0, 3, 0],
    2: [0, 0, 3]
};

const AxisLabel = ({ position, text, color }) => {
    return (
        <Text position={position} fontSize={0.2} color={color} anchorX="center" anchorY="middle">
            {text}
        </Text>
    )
}

const ClassVector = ({ end, color }) => {
    return (
        <Line points={[[0, 0, 0], end]} color={color} lineWidth={1} transparent opacity={0.3} />
    )
}

const StaticScene = ({ classes }) => {
    const COLORS = ['#832161', '#ADFC92', '#bdceea', '#ffffff', '#000000', '#ff4d4d', '#ffff4d'];

    const classVectors = useMemo(() => {
        const vectors = {};
        classes.forEach((c, idx) => {
            // Use INDEX (idx) for vector assignment, not ID
            vectors[c.id] = FIXED_VECTORS[idx] || getClassVector(idx);
        });
        return vectors;
    }, [classes]);

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshBasicMaterial color="black" transparent opacity={0.2} />
            </mesh>
            {classes.map((c, idx) => {
                const vec = classVectors[c.id];
                const labelPos = [vec[0] * 1.1, vec[1] * 1.1, vec[2] * 1.1];
                const classColor = COLORS[c.id % COLORS.length];
                return (
                    <group key={c.id}>
                        <ClassVector end={vec} color={classColor} />
                        <AxisLabel position={labelPos} text={c.name} color="black" />
                        <mesh position={vec}>
                            <sphereGeometry args={[0.05]} />
                            <meshBasicMaterial color={classColor} />
                        </mesh>
                    </group>
                )
            })}
            <gridHelper args={[10, 10, 0xdddddd, 0xeeeeee]} position={[0, -3, 0]} />
        </>
    );
};

const SmoothedDataPoint = ({ confidences, classes }) => {
    const meshRef = useRef();
    const targetPos = useRef(new THREE.Vector3(0, 0, 0));
    const currentPos = useRef(new THREE.Vector3(0, 0, 0));
    const targetColor = useRef(new THREE.Color('#cccccc'));

    const COLORS = ['#832161', '#ADFC92', '#bdceea', '#ffffff', '#000000', '#ff4d4d', '#ffff4d'];

    // Calculate target position and color based on props
    useMemo(() => {
        let x = 0, y = 0, z = 0;
        let maxConf = 0;
        let dominantClassId = null;

        // Re-calculate vectors here or pass them? 
        // For simplicity, re-calc (cheap)
        classes.forEach((c, idx) => {
            // Use INDEX (idx) for vector assignment
            const vec = FIXED_VECTORS[idx] || getClassVector(idx);
            const conf = confidences[c.id] || 0;
            x += vec[0] * conf;
            y += vec[1] * conf;
            z += vec[2] * conf;

            if (conf > maxConf) {
                maxConf = conf;
                dominantClassId = c.id;
            }
        });

        targetPos.current.set(x, y, z);

        if (dominantClassId !== null && maxConf > 0.4) {
            targetColor.current.set(COLORS[dominantClassId % COLORS.length]);
        } else {
            targetColor.current.set('#cccccc');
        }

    }, [confidences, classes]);

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Lerp position
            currentPos.current.lerp(targetPos.current, 0.1); // 0.1 = smoothing factor
            meshRef.current.position.copy(currentPos.current);

            // Lerp color
            meshRef.current.material.color.lerp(targetColor.current, 0.1);
            meshRef.current.material.emissive.lerp(targetColor.current, 0.1);
        }
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[0.15, 32, 32]} />
            <meshStandardMaterial color="#cccccc" emissive="#cccccc" emissiveIntensity={0.5} />
        </mesh>
    );
};

const EmbeddingVisualizer = ({ confidences, classes }) => {
    return (
        <div style={{ height: '400px', width: '100%', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <Canvas camera={{ position: [6, 4, 6], fov: 45 }}>
                <StaticScene classes={classes} />
                <SmoothedDataPoint confidences={confidences} classes={classes} />
                <OrbitControls enableZoom={true} />
            </Canvas>
        </div>
    );
};

export default EmbeddingVisualizer;
