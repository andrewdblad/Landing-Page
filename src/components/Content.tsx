// Placeholder sections — replace the titles and text with your own content
const SECTIONS = [
  { id: 'about', title: 'About', body: 'A short introduction about who you are and what you do.' },
  { id: 'projects', title: 'Projects', body: 'Highlight a few things you have built or worked on.' },
  { id: 'experience', title: 'Experience', body: 'Roles, skills, and the work you are proud of.' },
  { id: 'contact', title: 'Contact', body: 'Where people can reach you: email, GitHub, LinkedIn.' },
]

export default function Content() {
  return (
    <div className="content">
      <header className="site-header">
        <span className="site-name">Andrew Blad</span>
      </header>

      <div className="sections">
        {SECTIONS.map((section, i) => (
          <section
            key={section.id}
            id={section.id}
            className="panel"
            style={{ animationDelay: `${0.3 + i * 0.12}s` }}
          >
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
