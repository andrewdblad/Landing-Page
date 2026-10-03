type Section = {
  id: string
  label: string // short name used in the nav and eyebrow
  title: string
  body: string
  tags?: string[]
  placeholder?: boolean // shows a "Coming soon" badge until real content is added
  wide?: boolean // spans the full width on large screens
}

// Edit these to update the page. Remove `placeholder` once a section has real content.
const SECTIONS: Section[] = [
  {
    id: 'about',
    label: 'About',
    title: 'About me',
    body: "I'm a software developer currently working for WinCo Foods.",
    tags: ['Software Developer', 'WinCo Foods'],
    wide: true,
  },
  {
    id: 'projects',
    label: 'Projects',
    title: "Things I've built",
    body: 'A few projects and experiments will live here.',
    placeholder: true,
    wide: true,
  },
  {
    id: 'experience',
    label: 'Experience',
    title: 'Experience',
    body: 'Roles, skills, and the work I am proud of.',
    placeholder: true,
  },
  {
    id: 'contact',
    label: 'Contact',
    title: 'Get in touch',
    body: 'Email, GitHub, and LinkedIn links are on the way.',
    placeholder: true,
  },
]

export default function Content() {
  return (
    <div className="content">
      <header className="site-header">
        <a href="#top" className="site-name">Andrew Blad</a>
        <nav className="site-nav" aria-label="Sections">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`}>{s.label}</a>
          ))}
        </nav>
      </header>

      <div className="page" id="top">
        <div className="intro">
          <p className="eyebrow">Hello, I'm</p>
          <h1 className="intro-title">Andrew Blad</h1>
          <p className="intro-subtitle">Software developer at WinCo Foods</p>
        </div>

        <div className="sections">
          {SECTIONS.map((s, i) => (
            <section
              key={s.id}
              id={s.id}
              className={`panel${s.wide ? ' panel--wide' : ''}${s.placeholder ? ' panel--placeholder' : ''}`}
              style={{ animationDelay: `${0.35 + i * 0.1}s` }}
            >
              <div className="panel-head">
                <p className="eyebrow">
                  {String(i + 1).padStart(2, '0')} — {s.label}
                </p>
                {s.placeholder && <span className="badge">Coming soon</span>}
              </div>
              <h2>{s.title}</h2>
              <p className="panel-body">{s.body}</p>
              {s.tags && (
                <ul className="tags">
                  {s.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
