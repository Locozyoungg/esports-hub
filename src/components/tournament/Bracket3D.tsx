'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text, Box } from '@react-three/drei'
import { useRef } from 'react'

export default function Bracket3D({ matches }: { matches: any[] }) {
  // Simple 3D visualization: each match is a box with text
  return (
    <div className="h-96 w-full bg-black/30 rounded-lg">
      <Canvas camera={{ position: [0, 5, 10] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls enableZoom enablePan />
        {matches.map((match, idx) => (
          <group key={idx} position={[idx * 3 - 3, 0, 0]}>
            <Box args={[2, 0.5, 1]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#8b5cf6" />
            </Box>
            <Text
              position={[0, 0.5, 0]}
              fontSize={0.3}
              color="white"
              anchorX="center"
            >
              {match.teamA || 'TBD'} vs {match.teamB || 'TBD'}
            </Text>
          </group>
        ))}
      </Canvas>
    </div>
  )
}
