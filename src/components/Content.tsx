import type { ComponentType } from 'react'
import { CubeIcon, GitHubIcon, GmailIcon, LinkedInIcon, PhoneIcon } from './Icons'
import byuIdahoLogo from '../assets/logos/byu-idaho.svg'
import premeraLogo from '../assets/logos/premera-blue-cross.svg'
import wincoLogo from '../assets/logos/winco-foods.svg'
import trailerLoadingImage from '../assets/projects/trailer-loading.jpg'

type ContactLink = {
  label: string
  value: string // what's shown under the label
  href: string
  Icon: ComponentType<{ className?: string }>
  external?: boolean // open in a new tab
}

type TimelineItem = {
  title: string
  org: string
  logo: string
  current?: boolean
}

type Project = {
  title: string
  description: string
  tech: string[]
  image: string
  href?: string // when set, the whole card links here and shows "Click to view"
}

type Section = {
  id: string
  label: string // short name used in the nav and eyebrow
  title: string
  body: string
  tags?: string[]
  links?: ContactLink[]
  timeline?: TimelineItem[] // listed newest first, top to bottom
  projects?: Project[]
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
    body: 'A few projects I have worked on.',
    projects: [
      {
        title: 'Trailer Loading',
        description:
          'Distribution center trailer loading 3D model concept. Developed using C#/.Net backend and React + Three.js.',
        tech: ['C#', '.NET', 'React', 'Three.js'],
        image: trailerLoadingImage,
        href: 'https://trailer.andrewblad.dev',
      },
    ],
    wide: true,
  },
  {
    id: 'experience',
    label: 'Experience',
    title: 'Experience',
    body: "Where I've studied and worked.",
    timeline: [
      {
        title: 'Software Developer',
        org: 'WinCo Foods',
        logo: wincoLogo,
        current: true,
      },
      {
        title: 'Software Engineer Intern',
        org: 'Premera Blue Cross',
        logo: premeraLogo,
      },
      {
        title: "Bachelor's Degree in Software Engineering",
        org: 'BYU-Idaho',
        logo: byuIdahoLogo,
      },
    ],
  },
  {
    id: 'contact',
    label: 'Contact',
    title: 'Get in touch',
    body: 'Feel free to reach out or connect.',
    links: [
      {
        label: 'GitHub',
        value: 'github.com/andrewdblad',
        href: 'https://github.com/andrewdblad',
        Icon: GitHubIcon,
        external: true,
      },
      {
        label: 'LinkedIn',
        value: 'linkedin.com/in/andrewblad',
        href: 'https://www.linkedin.com/in/andrewblad/',
        Icon: LinkedInIcon,
        external: true,
      },
      {
        label: 'Email',
        value: 'andrewdblad@gmail.com',
        href: 'mailto:andrewdblad@gmail.com',
        Icon: GmailIcon,
      },
      {
        label: 'Phone',
        value: '(208) 695-3154',
        href: 'tel:+12086953154',
        Icon: PhoneIcon,
      },
    ],
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
              {s.projects && (
                <ul className="projects">
                  {s.projects.map((project) => {
                    const body = (
                      <>
                        <div className="project-media">
                          <img
                            className="project-image"
                            src={project.image}
                            alt={`${project.title} preview`}
                            loading="lazy"
                          />
                          <span className="project-overlay" aria-hidden="true">
                            <span className="project-overlay-pill">
                              {project.href ? 'Click to view ↗' : 'Link coming soon'}
                            </span>
                          </span>
                        </div>
                        <div className="project-body">
                          <span className="project-icon">
                            <CubeIcon />
                          </span>
                          <h3>{project.title}</h3>
                          <p>{project.description}</p>
                          <ul className="tags tags--small" aria-label="Built with">
                            {project.tech.map((t) => (
                              <li key={t}>{t}</li>
                            ))}
                          </ul>
                          {project.href && (
                            <span className="project-cta">
                              Click to view <span aria-hidden="true">→</span>
                            </span>
                          )}
                        </div>
                      </>
                    )
                    return (
                      <li key={project.title}>
                        {project.href ? (
                          <a
                            className="project-card project-card--link"
                            href={project.href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {body}
                          </a>
                        ) : (
                          <div className="project-card">{body}</div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
              {s.timeline && (
                <ol className="timeline">
                  {s.timeline.map((item) => (
                    <li key={item.org} className={`timeline-item${item.current ? ' timeline-item--current' : ''}`}>
                      <span className="timeline-rail" aria-hidden="true" />
                      <div className="timeline-card">
                        <span className="timeline-logo">
                          <img src={item.logo} alt={`${item.org} logo`} loading="lazy" />
                        </span>
                        <span className="timeline-text">
                          <span className="timeline-title">{item.title}</span>
                          <span className="timeline-org">
                            {item.org}
                            {item.current && <span className="timeline-current">Current</span>}
                          </span>
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
              {s.links && (
                <ul className="contact-links">
                  {s.links.map(({ label, value, href, Icon, external }) => (
                    <li key={label}>
                      <a
                        className="contact-link"
                        href={href}
                        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      >
                        <span className="contact-icon">
                          <Icon />
                        </span>
                        <span className="contact-text">
                          <span className="contact-label">{label}</span>
                          <span className="contact-value">{value}</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
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
