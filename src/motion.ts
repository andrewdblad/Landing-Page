export type Phase = 'typing' | 'hold' | 'fade' | 'jump' | 'hyperspace' | 'exit' | 'arrived'

const JUMP_MS = 1100
const EXIT_MS = 700

// How long each timed phase lasts (ms) and what comes after it.
// 'typing' ends when the terminal finishes; 'arrived' is the resting state.
export const PHASE_DURATIONS: Partial<Record<Phase, number>> = {
  hold: 300, // jump right after the countdown hits 1
  fade: 400,
  jump: JUMP_MS,
  hyperspace: 600,
  exit: EXIT_MS,
}

export const NEXT_PHASE: Partial<Record<Phase, Phase>> = {
  hold: 'fade',
  fade: 'jump',
  jump: 'hyperspace',
  hyperspace: 'exit',
  exit: 'arrived',
}

// Per-frame camera/starfield state shared by everything in the scene
export type Motion = {
  speed: number // star travel speed toward the camera (units/sec)
  tail: number // star streak length (units)
  tunnel: number // hyperspace tunnel opacity (0-1)
  fov: number // camera field of view (degrees)
  shake: number // camera shake amount
  arrival: number // planets fly-in progress (0-1)
}

const CRUISE = 1.2
const WARP = 900
const MAX_TAIL = 140
const BASE_FOV = 60
const WARP_FOV = 88

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/**
 * @param t seconds since the current phase began
 * @param intro seconds since the page started
 */
export function computeMotion(m: Motion, phase: Phase, t: number, intro: number, reduced: boolean) {
  switch (phase) {
    case 'typing':
    case 'hold':
    case 'fade': {
      // Engines spooling up: stars slowly accelerate and begin to stretch
      const s = reduced ? 0 : clamp01(intro / 9) ** 2
      m.speed = CRUISE + 24 * s
      m.tail = 6 * s
      m.fov = BASE_FOV + 3 * s
      m.shake = 0.004 * s
      m.tunnel = 0
      m.arrival = 0
      break
    }
    case 'jump': {
      const p = clamp01(t / (JUMP_MS / 1000))
      m.speed = 25 + (WARP - 25) * p ** 3
      m.tail = 6 + (MAX_TAIL - 6) * p ** 2.2
      m.fov = lerp(BASE_FOV + 3, WARP_FOV, p * p)
      m.shake = 0.004 + 0.02 * p
      m.tunnel = smoothstep(0.8, 1, p)
      m.arrival = 0
      break
    }
    case 'hyperspace':
      m.speed = WARP
      m.tail = MAX_TAIL
      m.fov = WARP_FOV
      m.shake = 0.012
      m.tunnel = 1
      m.arrival = 0
      break
    case 'exit': {
      const p = clamp01(t / (EXIT_MS / 1000))
      const k = (1 - p) ** 4
      m.speed = CRUISE + (WARP - CRUISE) * k
      m.tail = MAX_TAIL * k
      m.fov = BASE_FOV + (WARP_FOV - BASE_FOV) * (1 - p) ** 2
      m.shake = 0.012 * k
      m.tunnel = 1 - smoothstep(0, 0.25, p)
      m.arrival = 1 - (1 - p) ** 3
      break
    }
    case 'arrived':
      m.speed = CRUISE
      m.tail = 0
      m.fov = BASE_FOV
      m.shake = 0
      m.tunnel = 0
      m.arrival = 1
      break
  }
}
