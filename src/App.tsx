import { lazy, Suspense } from 'react'

// three.js is heavy — load it in its own chunk so text renders immediately
const HeroScene = lazy(() => import('./components/HeroScene'))

const year = new Date().getFullYear()

const features = [
  {
    title: 'Fast by default',
    body: 'Static assets served from a global CDN, so pages load quickly wherever your visitors are.',
  },
  {
    title: 'Interactive 3D',
    body: 'Real-time WebGL rendering with three.js that responds to the cursor.',
  },
  {
    title: 'Simple to ship',
    body: 'Build once, sync to S3, and invalidate the cache. No servers to manage.',
  },
]

export default function App() {
  return (
    <>
      <header className="nav">
        <span className="logo">Nebula</span>
        <nav>
          <a href="#features">Features</a>
          <a href="#cta" className="btn btn-small">Get started</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-canvas" aria-hidden="true">
            <Suspense fallback={null}>
              <HeroScene />
            </Suspense>
          </div>
          <div className="hero-content">
            <h1>Build something<br />out of this world</h1>
            <p>A landing page starter with React, three.js, and a one-command deploy to AWS.</p>
            <div className="hero-actions">
              <a href="#cta" className="btn">Get started</a>
              <a href="#features" className="btn btn-ghost">Learn more</a>
            </div>
          </div>
        </section>

        <section id="features" className="features">
          {features.map((f) => (
            <article key={f.title} className="card">
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </article>
          ))}
        </section>

        <section id="cta" className="cta">
          <h2>Ready to launch?</h2>
          <p>Join the waitlist and be the first to know.</p>
          <form className="cta-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="you@example.com" aria-label="Email address" required />
            <button type="submit" className="btn">Notify me</button>
          </form>
        </section>
      </main>

      <footer className="footer">© {year} Nebula</footer>
    </>
  )
}
