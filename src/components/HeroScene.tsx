import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Stars } from '@react-three/drei'
import { ExtrudeGeometry, Shape } from 'three'
import type { Mesh } from 'three'

function createHeartGeometry() {
  // Classic bezier heart outline (drawn point-up, flipped below)
  const shape = new Shape()
  shape.moveTo(5, 5)
  shape.bezierCurveTo(5, 5, 4, 0, 0, 0)
  shape.bezierCurveTo(-6, 0, -6, 7, -6, 7)
  shape.bezierCurveTo(-6, 11, -3, 15.4, 5, 19)
  shape.bezierCurveTo(12, 15.4, 16, 11, 16, 7)
  shape.bezierCurveTo(16, 7, 16, 0, 10, 0)
  shape.bezierCurveTo(7, 0, 5, 5, 5, 5)

  const geometry = new ExtrudeGeometry(shape, {
    depth: 4,
    bevelEnabled: true,
    bevelThickness: 2.5,
    bevelSize: 2,
    bevelSegments: 12,
    curveSegments: 48,
  })
  geometry.rotateZ(Math.PI)
  geometry.center()
  geometry.computeVertexNormals()
  return geometry
}

const HEART_SCALE = 0.1

function Heart() {
  const mesh = useRef<Mesh>(null)
  const geometry = useMemo(() => createHeartGeometry(), [])

  useFrame(({ pointer, clock }, delta) => {
    if (!mesh.current) return
    mesh.current.rotation.y += delta * 0.4
    // Ease toward the pointer for a subtle parallax tilt
    mesh.current.rotation.x += (pointer.y * 0.4 - mesh.current.rotation.x) * 0.05
    mesh.current.position.x += (pointer.x * 0.3 - mesh.current.position.x) * 0.05

    // Heartbeat: two quick pulses, then a rest, about once per second
    const t = clock.elapsedTime % 1.1
    const beat = Math.exp(-((t - 0.1) ** 2) / 0.004) + 0.6 * Math.exp(-((t - 0.32) ** 2) / 0.004)
    mesh.current.scale.setScalar(HEART_SCALE * (1 + 0.08 * beat))
  })

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1}>
      <mesh ref={mesh} geometry={geometry} scale={HEART_SCALE}>
        <meshPhysicalMaterial
          color="#e0102f"
          emissive="#5a0010"
          roughness={0.25}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.15}
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
      <hemisphereLight args={['#ffd0d8', '#0a0820', 1]} />
      <directionalLight position={[3, 3, 5]} intensity={1.8} />
      <pointLight position={[-4, -2, -2]} color="#ff4d88" intensity={30} />
      <Heart />
      <Stars radius={60} depth={40} count={2500} factor={3} fade speed={0.6} />
    </Canvas>
  )
}
