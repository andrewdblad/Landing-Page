import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import Content from './components/Content'
import Terminal from './components/Terminal'
import { NEXT_PHASE, PHASE_DURATIONS } from './motion'
import type { Phase } from './motion'

// three.js is heavy — load it in its own chunk so the terminal starts immediately
const SpaceScene = lazy(() => import('./components/SpaceScene'))

const MESSAGE = 'Hello! My name is Andrew Blad.'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function App() {
  const [reduced] = useState(prefersReducedMotion)
  const [phase, setPhase] = useState<Phase>('typing')

  useEffect(() => {
    const next = NEXT_PHASE[phase]
    const duration = PHASE_DURATIONS[phase]
    if (!next || duration === undefined) return
    // Skip the hyperspace jump for people who prefer reduced motion
    const target = reduced && phase === 'fade' ? 'arrived' : next
    const id = setTimeout(() => setPhase(target), duration)
    return () => clearTimeout(id)
  }, [phase, reduced])

  const handleTyped = useCallback(() => setPhase((p) => (p === 'typing' ? 'hold' : p)), [])

  const showTerminal = phase === 'typing' || phase === 'hold' || phase === 'fade'
  const flash = phase === 'hyperspace' || phase === 'exit'

  return (
    <main>
      {phase !== 'arrived' && <h1 className="sr-only">{MESSAGE}</h1>}
      <div className="scene" aria-hidden="true">
        <Suspense fallback={null}>
          <SpaceScene phase={phase} reduced={reduced} />
        </Suspense>
      </div>
      {showTerminal && <Terminal fading={phase === 'fade'} onDone={handleTyped} />}
      {flash && !reduced && <div key={phase} className="flash" aria-hidden="true" />}
      {phase === 'arrived' && <Content />}
    </main>
  )
}
