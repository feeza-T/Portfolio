import { Link } from 'react-router'
import ProjectsHero from '../components/ProjectsHero/ProjectsHero'
import ProjectChapters from '../components/Projects/ProjectChapters'
import { RollText } from '../components/Navbar/Navbar'

// /projects — its own hero, then every project as a full-screen chapter.
export default function ProjectsPage({ play }) {
  return (
    <main>
      <ProjectsHero play={play} />
      <ProjectChapters />

      <section className="next next--end">
        <span className="next__idx">[ More ]</span>
        <h2 className="next__title">
          More on <span>GitHub</span>
        </h2>
        <div className="next__actions">
          <a className="btn btn--gold" href="https://github.com/feeza-T" target="_blank" rel="noreferrer">
            <RollText>github.com/feeza-T</RollText>
            <span className="btn__icon" aria-hidden="true">
              ↗
            </span>
          </a>
          <Link className="btn btn--ghost" to="/">
            <RollText>Back home</RollText>
          </Link>
        </div>
      </section>
    </main>
  )
}
