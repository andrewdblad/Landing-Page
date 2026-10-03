import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Stars } from '@react-three/drei'
import type { Mesh } from 'three'

function Blob() {
  const mesh = useRef<Mesh>(null)

  useFrame(({ pointer }, delta) => {
    if (!mesh.current) return
    mesh.current.rotation.y += delta * 0.15
    // Ease toward the pointer for a subtle parallax tilt
    mesh.current.rotation.x += (pointer.y * 0.4 - mesh.current.rotation.x) * 0.05
    mesh.current.position.x += (pointer.x * 0.3 - mesh.current.position.x) * 0.05
  })

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={mesh} scale={1.6}>
        <icosahedronGeometry args={[1, 64]} />
        <MeshDistortMaterial
          color="#7c5cff"
          roughness={0.15}
          metalness={0.3}
          distort={0.35}
          speed={2}
        />
      </mesh>
    </Float>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.6} />
      <hemisphereLight args={['#b9a8ff', '#0a0820', 1]} />
      <directionalLight position={[3, 3, 5]} intensity={1.5} />
      <pointLight position={[-4, -2, -2]} color="#00d4ff" intensity={30} />
      <Blob />
      <Stars radius={60} depth={40} count={2500} factor={3} fade speed={0.6} />
    </Canvas>
  )
}
