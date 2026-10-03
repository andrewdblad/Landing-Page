import { lazy, Suspense } from 'react'

// three.js is heavy — load it in its own chunk so text renders immediately
const HeroScene = lazy(() => import('./components/HeroScene'))

export default function App() {
  return (
    <main className="hero">
      <div className="hero-canvas" aria-hidden="true">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </div>
      <h1>I love Amelia and Payge Blad</h1>
    </main>
  )
}
