import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText, prefersReducedMotion } from '../../lib/scroll'
import { useProximity } from '../../lib/useProximity'
import { site } from '../../config/site'
import { RollText } from '../Navbar/Navbar'
import { Magnetic } from '../Hero/Hero'
import { ProjectTitle } from './ProjectChapters'
import './Projects.css'

const themeVars = (t) => ({ '--c-bg': t.bg, '--c-bg2': t.bg2 ?? t.bg, '--c-ink': t.ink, '--c-accent': t.accent })

/**
 * Home page "Selected Work": a big index list. Hovering a row sweeps in the
 * project's colour, nudges the title and turns the arrow. Each row opens that
 * project on the /projects page.
 */
export default function Projects() {
  const root = useRef(null)
  const title = useRef(null)
  const [ready, setReady] = useState(false)
  const [active, setActive] = useState(-1)
  useProximity(title, '.char', { enabled: ready, radius: 200, scale: 0.32 })

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      if (prefersReducedMotion()) {
        setReady(true)
        return
      }
      const head = SplitText.create(q('.work__title-line'), { type: 'chars', charsClass: 'char' })
      gsap
        .timeline({
          scrollTrigger: { trigger: q('.work__head')[0], start: 'top 80%' },
          onComplete: () => {
            title.current?.classList.add('is-ready')
            setReady(true)
          },
        })
        .from(head.chars, { yPercent: 115, rotate: 5, duration: 1.2, stagger: 0.03, ease: 'expo.out' })
        .from(q('.work__aside > *'), { y: 20, autoAlpha: 0, stagger: 0.08, duration: 0.9, ease: 'expo.out' }, 0.2)

      gsap.from(q('.wrow'), {
        yPercent: 60,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 1.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: q('.wlist')[0], start: 'top 80%' },
      })
      gsap.from(q('.wlist__line'), {
        scaleX: 0,
        transformOrigin: 'left',
        stagger: 0.1,
        duration: 1.4,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: q('.wlist')[0], start: 'top 80%' },
      })
      gsap.from(q('.work__cta > *'), {
        y: 30,
        autoAlpha: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: { trigger: q('.work__cta')[0], start: 'top 90%' },
      })
      return () => head.revert()
    },
    { scope: root },
  )

  return (
    <section id="work" className="work" ref={root}>
      <div className="work__head">
        <h2 className="work__title" ref={title} aria-label="Selected work">
          <span className="work__idx" aria-hidden="true">
            [ 04 ]
          </span>
          <span className="work__title-line" aria-hidden="true">
            Selected
          </span>
          <span className="work__title-line work__title-line--red" aria-hidden="true">
            Work<span className="work__dot">.</span>
          </span>
        </h2>
        <div className="work__aside">
          <p>A full-stack app I built solo, and two team projects where I owned the frontend.</p>
          <p className="work__count">
            <span className="dot" aria-hidden="true" /> {String(site.projects.length).padStart(2, '0')} projects
          </p>
        </div>
      </div>

      <ul className="wlist" onPointerLeave={() => setActive(-1)}>
        <li className="wlist__line" aria-hidden="true" />
        {site.projects.map((p, i) => (
          <li key={p.slug} className="wlist__item">
            <Link
              to={`/projects#${p.slug}`}
              className={`wrow ${active === i ? 'is-active' : ''}`}
              style={themeVars(p.theme)}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(-1)}
              data-cursor="Open"
            >
              <span className="wrow__fill" aria-hidden="true" />
              <span className="wrow__num">{String(i + 1).padStart(2, '0')}</span>
              <ProjectTitle project={p} as="span" className="wrow__title" />
              <span className="wrow__meta">
                <span>{p.type}</span>
                <span className="wrow__sub">{p.subtitle}</span>
              </span>
              <span className="wrow__arrow" aria-hidden="true">
                ↗
              </span>
              <span className="wrow__thumb" aria-hidden="true">
                {p.image ? <img src={p.image} alt="" loading="lazy" /> : <span className="wrow__thumb-soon">{p.mark}</span>}
              </span>
            </Link>
            <span className="wlist__line" aria-hidden="true" />
          </li>
        ))}
      </ul>

      <div className="work__cta">
        <Magnetic>
          <Link to="/projects" className="btn btn--gold work__all">
            <RollText>View all projects</RollText>
            <span className="btn__icon" aria-hidden="true">
              →
            </span>
          </Link>
        </Magnetic>
      </div>

    </section>
  )
}