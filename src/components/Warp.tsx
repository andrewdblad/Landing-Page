import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  LineBasicMaterial,
  PointsMaterial,
  ShaderMaterial,
} from 'three'
import type { LineSegments, Mesh, Points } from 'three'
import type { Motion } from '../motion'

const COUNT = 2500
const DEPTH = 400 // stars live between z = -DEPTH and the camera
const NEAR = 2
const WHITE = new Color('#ffffff')
const HYPER_BLUE = new Color('#9cc4ff')

// Small seeded PRNG so the initial starfield is the same on every render
function seededRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Spread evenly across the view; perspective makes streaks radiate from the center
function placeStar(pos: Float32Array, i: number, z: number, random = Math.random) {
  const angle = random() * Math.PI * 2
  const r = 2 + 170 * Math.sqrt(random())
  pos[i * 3] = Math.cos(angle) * r
  pos[i * 3 + 1] = Math.sin(angle) * r
  pos[i * 3 + 2] = z
}

const tunnelVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const tunnelFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  // Value noise that wraps around the tunnel's circumference (no seam)
  float noise(vec2 p, float period) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float x0 = mod(i.x, period);
    float x1 = mod(i.x + 1.0, period);
    return mix(
      mix(hash(vec2(x0, i.y)), hash(vec2(x1, i.y)), u.x),
      mix(hash(vec2(x0, i.y + 1.0)), hash(vec2(x1, i.y + 1.0)), u.x),
      u.y);
  }

  void main() {
    float along = vUv.y * 5.0 + uTime * 7.0;
    float n = noise(vec2(vUv.x * 48.0, along), 48.0) * 0.6
            + noise(vec2(vUv.x * 96.0, along * 2.3), 96.0) * 0.4;
    float streak = smoothstep(0.5, 1.0, n);
    float ends = smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
    vec3 col = mix(vec3(0.15, 0.3, 0.9), vec3(0.85, 0.93, 1.0), streak);
    gl_FragColor = vec4(col * (0.12 + streak) * ends * uOpacity, 1.0);
  }
`

export default function Warp({ motion }: { motion: Motion }) {
  const { pointsGeo, linesGeo, pointsMat, linesMat, tunnelGeo, tunnelMat } = useMemo(() => {
    const random = seededRandom(42)
    const positions = new Float32Array(COUNT * 3)
    const brightness = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      placeStar(positions, i, -random() * DEPTH, random)
      const b = 0.35 + random() * 0.65
      brightness.set([b, b, b * 1.05], i * 3)
    }

    const pointsGeo = new BufferGeometry()
    pointsGeo.setAttribute('position', new BufferAttribute(positions, 3))
    pointsGeo.setAttribute('color', new BufferAttribute(brightness, 3))

    // Each streak is a segment from the star (bright) back to its tail (black,
    // which is invisible under additive blending), giving a fading trail.
    const linesGeo = new BufferGeometry()
    linesGeo.setAttribute('position', new BufferAttribute(new Float32Array(COUNT * 6), 3))
    const lineColors = new Float32Array(COUNT * 6)
    for (let i = 0; i < COUNT; i++) lineColors.set([1, 1, 1, 0, 0, 0], i * 6)
    linesGeo.setAttribute('color', new BufferAttribute(lineColors, 3))

    const pointsMat = new PointsMaterial({
      size: 1.8,
      sizeAttenuation: false,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
    })
    const linesMat = new LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    })

    const tunnelGeo = new CylinderGeometry(9, 9, DEPTH, 96, 1, true)
    tunnelGeo.rotateX(Math.PI / 2)
    tunnelGeo.translate(0, 0, -DEPTH / 2)
    const tunnelMat = new ShaderMaterial({
      vertexShader: tunnelVertex,
      fragmentShader: tunnelFragment,
      uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 } },
      side: BackSide,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    })

    return { pointsGeo, linesGeo, pointsMat, linesMat, tunnelGeo, tunnelMat }
  }, [])

  const pointsRef = useRef<Points>(null)
  const linesRef = useRef<LineSegments>(null)
  const tunnelRef = useRef<Mesh>(null)

  useFrame(({ clock }, delta) => {
    if (!pointsRef.current || !linesRef.current || !tunnelRef.current) return
    const pointsAttr = pointsRef.current.geometry.attributes.position
    const linesAttr = linesRef.current.geometry.attributes.position
    const pos = pointsAttr.array as Float32Array
    const lines = linesAttr.array as Float32Array
    const dz = motion.speed * Math.min(delta, 0.05)

    for (let i = 0; i < COUNT; i++) {
      let z = pos[i * 3 + 2] + dz
      if (z > NEAR) {
        z -= DEPTH
        placeStar(pos, i, z)
      }
      pos[i * 3 + 2] = z
      const x = pos[i * 3]
      const y = pos[i * 3 + 1]
      lines.set([x, y, z, x, y, z - motion.tail], i * 6)
    }
    pointsAttr.needsUpdate = true
    linesAttr.needsUpdate = true

    const linesMat = linesRef.current.material as LineBasicMaterial
    linesMat.opacity = Math.min(motion.tail / 3, 1)
    linesMat.color.copy(WHITE).lerp(HYPER_BLUE, motion.tunnel * 0.7)
    const tunnelMat = tunnelRef.current.material as ShaderMaterial
    tunnelMat.uniforms.uTime.value = clock.elapsedTime
    tunnelMat.uniforms.uOpacity.value = motion.tunnel
  })

  return (
    <>
      <points ref={pointsRef} geometry={pointsGeo} material={pointsMat} frustumCulled={false} />
      <lineSegments ref={linesRef} geometry={linesGeo} material={linesMat} frustumCulled={false} />
      <mesh ref={tunnelRef} geometry={tunnelGeo} material={tunnelMat} frustumCulled={false} />
    </>
  )
}
