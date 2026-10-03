import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import type { PerspectiveCamera, Points } from 'three'
import { computeMotion } from '../motion'
import type { Motion, Phase } from '../motion'
import Warp from './Warp'

type Props = { phase: Phase; reduced: boolean }

// Updates the shared motion state each frame from the current phase
function Director({ phase, reduced, motion }: Props & { motion: Motion }) {
  const phaseStart = useRef<number | null>(null)
  const introStart = useRef<number | null>(null)

  useEffect(() => {
    phaseStart.current = null
  }, [phase])

  useFrame(({ clock }) => {
    const now = clock.elapsedTime
    introStart.current ??= now
    phaseStart.current ??= now
    computeMotion(motion, phase, now - phaseStart.current, now - introStart.current, reduced)
  })
  return null
}

function CameraRig({ motion }: { motion: Motion }) {
  useFrame(({ camera, pointer, clock }) => {
    const cam = camera as PerspectiveCamera
    if (Math.abs(cam.fov - motion.fov) > 0.01) {
      cam.fov = motion.fov
      cam.updateProjectionMatrix()
    }
    const t = clock.elapsedTime
    // Engine rumble while accelerating, gentle mouse parallax once we arrive
    const shakeX = (Math.sin(t * 53) + Math.sin(t * 31)) * motion.shake
    const shakeY = (Math.sin(t * 47) + Math.sin(t * 37)) * motion.shake
    const target = motion.arrival
    cam.position.x += (pointer.x * 0.35 * target + shakeX - cam.position.x) * 0.2
    cam.position.y += (pointer.y * 0.25 * target + shakeY - cam.position.y) * 0.2
    cam.lookAt(0, 0, -100)
  })
  return null
}

// Distant background stars, hidden while inside the hyperspace tunnel
function BackgroundStars({ motion }: { motion: Motion }) {
  const ref = useRef<Points>(null)
  useFrame(() => {
    if (ref.current) ref.current.visible = motion.tunnel < 0.5
  })
  return <Stars ref={ref} radius={150} depth={60} count={3000} factor={4} saturation={0} fade speed={0.5} />
}

export default function SpaceScene({ phase, reduced }: Props) {
  const motion = useMemo<Motion>(
    () => ({ speed: 1.2, tail: 0, tunnel: 0, fov: 60, shake: 0, arrival: 0 }),
    [],
  )

  return (
    <Canvas camera={{ position: [0, 0, 0], fov: 60, near: 0.1, far: 1000 }} dpr={[1, 2]}>
      <color attach="background" args={['#000000']} />
      {/* Distant warp stars fade into black instead of piling up at the center */}
      <fog attach="fog" args={['#000000', 40, 320]} />
      <Director phase={phase} reduced={reduced} motion={motion} />
      <CameraRig motion={motion} />
      <BackgroundStars motion={motion} />
      <Warp motion={motion} />
    </Canvas>
  )
}
