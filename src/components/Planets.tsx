import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BackSide, Color, DoubleSide, ShaderMaterial, Vector3 } from 'three'
import type { Group, Mesh } from 'three'
import type { Motion } from '../motion'

const SUN_DIR = new Vector3(-0.8, 0.45, 0.55).normalize()
const FLY_IN_DISTANCE = 250

const noiseGlsl = /* glsl */ `
  float hash3(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise3(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash3(i), hash3(i + vec3(1, 0, 0)), f.x),
          mix(hash3(i + vec3(0, 1, 0)), hash3(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash3(i + vec3(0, 0, 1)), hash3(i + vec3(1, 0, 1)), f.x),
          mix(hash3(i + vec3(0, 1, 1)), hash3(i + vec3(1, 1, 1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise3(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }
`

const surfaceVertex = /* glsl */ `
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vPos = normalize(position);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const surfaceFragment = /* glsl */ `
  uniform vec3 uA;
  uniform vec3 uB;
  uniform vec3 uC;
  uniform vec3 uAtmo;
  uniform vec3 uSun;
  uniform float uScale;
  uniform float uBands;
  uniform float uSpots;
  uniform float uTime;
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec3 vView;
  ${noiseGlsl}
  void main() {
    float n = fbm(vPos * uScale + vec3(0.0, uTime * 0.03, 0.0));
    float pattern = uBands > 0.0 ? sin(vPos.y * uBands + n * 5.0) * 0.5 + 0.5 : n;
    vec3 col = mix(uA, uB, smoothstep(0.2, 0.8, pattern));
    col = mix(col, uC, smoothstep(0.62, 0.75, n) * 0.8);

    float diffuse = max(dot(vNormal, uSun), 0.0);
    float rim = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.5);
    vec3 lit = col * (0.06 + 0.94 * diffuse) + uAtmo * rim * (0.25 + 0.75 * diffuse);

    // Bioluminescent patches that glow on the night side
    if (uSpots > 0.0) {
      float s = smoothstep(0.7, 0.8, fbm(vPos * uScale * 2.5 + 7.0));
      lit += uC * s * (1.0 - diffuse) * uSpots;
    }
    gl_FragColor = vec4(lit, 1.0);
  }
`

const glowVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPos;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
    vViewPos = viewPos.xyz;
    gl_Position = projectionMatrix * viewPos;
  }
`

const glowFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  void main() {
    // Back faces: strongest just outside the planet's edge, fading outward.
    // Uses the per-pixel view ray so the halo stays even off-center.
    float facing = dot(normalize(vNormal), normalize(-vViewPos));
    float i = pow(smoothstep(0.0, 0.6, -facing), 2.0);
    gl_FragColor = vec4(uColor * i * 0.7 * uOpacity, 1.0);
  }
`

const ringVertex = /* glsl */ `
  varying float vR;
  void main() {
    vR = length(position.xy);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const ringFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uInner;
  uniform float uOuter;
  uniform float uOpacity;
  varying float vR;
  void main() {
    float t = (vR - uInner) / (uOuter - uInner);
    float bands = 0.45 + 0.35 * sin(t * 55.0) * sin(t * 13.0 + 1.0);
    float edge = smoothstep(0.0, 0.08, t) * smoothstep(1.0, 0.85, t);
    gl_FragColor = vec4(uColor, bands * edge * 0.75 * uOpacity);
  }
`

type PlanetConfig = {
  fx: number // horizontal placement as a fraction of the half-viewport
  fy: number
  z: number
  radius: number
  colors: [string, string, string]
  atmosphere: string
  scale: number
  bands?: number
  spots?: number
  spin: number
  tilt: number
  ring?: { inner: number; outer: number; color: string }
}

const PLANETS: PlanetConfig[] = [
  {
    fx: -0.62, fy: 0.36, z: -7, radius: 0.5,
    colors: ['#2a0d4d', '#c44dff', '#ffb3f5'], atmosphere: '#d07bff',
    scale: 2.2, bands: 9, spin: 0.06, tilt: 0.35,
    ring: { inner: 0.72, outer: 1.15, color: '#e2b8ff' },
  },
  {
    fx: 0.6, fy: -0.42, z: -8, radius: 0.42,
    colors: ['#062b2a', '#1fbf8f', '#b6ff3b'], atmosphere: '#4dffd2',
    scale: 3, spots: 1.4, spin: 0.09, tilt: -0.2,
  },
  {
    fx: 0.4, fy: 0.52, z: -11, radius: 0.14,
    colors: ['#4a1f0c', '#e07a3a', '#ffd08a'], atmosphere: '#ff9a5a',
    scale: 4, spin: 0.15, tilt: 0.1,
  },
]

function Planet({ config, motion }: { config: PlanetConfig; motion: Motion }) {
  const group = useRef<Group>(null)
  const body = useRef<Mesh>(null)
  const halo = useRef<Mesh>(null)
  const ringMesh = useRef<Mesh>(null)

  const { surface, glow, ring } = useMemo(() => {
    const [a, b, c] = config.colors
    const surface = new ShaderMaterial({
      vertexShader: surfaceVertex,
      fragmentShader: surfaceFragment,
      uniforms: {
        uA: { value: new Color(a) },
        uB: { value: new Color(b) },
        uC: { value: new Color(c) },
        uAtmo: { value: new Color(config.atmosphere) },
        uSun: { value: SUN_DIR },
        uScale: { value: config.scale },
        uBands: { value: config.bands ?? 0 },
        uSpots: { value: config.spots ?? 0 },
        uTime: { value: 0 },
      },
    })
    const glow = new ShaderMaterial({
      vertexShader: glowVertex,
      fragmentShader: glowFragment,
      side: BackSide,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      uniforms: { uColor: { value: new Color(config.atmosphere) }, uOpacity: { value: 0 } },
    })
    const ring = config.ring
      ? new ShaderMaterial({
          vertexShader: ringVertex,
          fragmentShader: ringFragment,
          side: DoubleSide,
          transparent: true,
          depthWrite: false,
          uniforms: {
            uColor: { value: new Color(config.ring.color) },
            uInner: { value: config.ring.inner },
            uOuter: { value: config.ring.outer },
            uOpacity: { value: 0 },
          },
        })
      : null
    return { surface, glow, ring }
  }, [config])

  useFrame(({ camera, size, clock }, delta) => {
    if (!group.current || !body.current) return
    const visible = motion.arrival > 0.001
    group.current.visible = visible
    if (!visible) return

    // Fly in from deep space; x/y are fixed to the final depth, so planets
    // appear near the vanishing point and spread outward as we approach.
    const aspect = size.width / size.height
    const halfH = Math.abs(config.z) * Math.tan((60 * Math.PI) / 360)
    group.current.position.set(
      config.fx * halfH * aspect,
      config.fy * halfH,
      config.z - FLY_IN_DISTANCE * (1 - motion.arrival),
    )
    // Shrink a little on narrow (portrait) screens
    group.current.scale.setScalar(Math.min(Math.max(aspect / 1.4, 0.55), 1))
    group.current.lookAt(camera.position)

    body.current.rotation.y += delta * config.spin
    const surfaceMat = body.current.material as ShaderMaterial
    surfaceMat.uniforms.uTime.value = clock.elapsedTime
    for (const mesh of [halo.current, ringMesh.current]) {
      if (mesh) (mesh.material as ShaderMaterial).uniforms.uOpacity.value = motion.arrival
    }
  })

  return (
    <group ref={group} visible={false}>
      <group rotation={[0, 0, config.tilt]}>
        <mesh ref={body} material={surface}>
          <sphereGeometry args={[config.radius, 64, 64]} />
        </mesh>
        <mesh ref={halo} material={glow} scale={1.25}>
          <sphereGeometry args={[config.radius, 48, 48]} />
        </mesh>
        {ring && config.ring && (
          <mesh ref={ringMesh} material={ring} rotation={[1.25, 0, 0]}>
            <ringGeometry args={[config.ring.inner, config.ring.outer, 128]} />
          </mesh>
        )}
      </group>
    </group>
  )
}

export default function Planets({ motion }: { motion: Motion }) {
  return (
    <>
      {PLANETS.map((p, i) => (
        <Planet key={i} config={p} motion={motion} />
      ))}
    </>
  )
}
