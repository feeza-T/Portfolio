import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'motion/react'
import { gsap, SplitText, prefersReducedMotion } from '../../lib/scroll'
import { useProximity } from '../../lib/useProximity'
import { site } from '../../config/site'
import { RollText } from '../Navbar/Navbar'
import { Magnetic } from '../Hero/Hero'
import './ProjectChapters.css'

const host = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

// Two-tone title: solid first word, outlined second word with an offset colour shadow.
export function ProjectTitle({ project, as: Tag = 'h3', className = '', id }) {
  const [a, b] = project.titleParts ?? [project.title, '']
  return (
    <Tag className={`ptitle ${className}`} id={id} style={{ '--len': project.title.length }}>
      <span className="ptitle__a">{a}</span>
      {b && <span className="ptitle__b">{b}</span>}
    </Tag>
  )
}

// Real screenshot inside a browser frame.
export function BrowserShot({ project }) {
  return (
    <div className="shot">
      <div className="shot__chrome">
        <i />
        <i />
        <i />
        <span>{host(project.live ?? project.code)}</span>
      </div>
      <img className="shot__img" src={project.image} alt={`${project.title} — screenshot of the live site`} />
    </div>
  )
}

// Shown until a project has a screenshot (EspressoEcho before deploy).
export function ComingSoon({ project }) {
  return (
    <div className="soon">
      <span className="soon__badge">
        <span className="dot" aria-hidden="true" /> {project.status ?? 'Coming soon'}
      </span>
      <div className="soon__words" aria-hidden="true">
        {(project.titleParts ?? [project.title]).map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <p className="soon__note">{project.subtitle} · code on GitHub</p>
    </div>
  )
}

// Tilts toward the cursor with a moving light glare.
function Tilt({ children }) {
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rx = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 180, damping: 18 })
  const ry = useSpring(useTransform(mx, [0, 1], [-11, 11]), { stiffness: 180, damping: 18 })
  const gx = useTransform(mx, [0, 1], ['0%', '100%'])
  const gy = useTransform(my, [0, 1], ['0%', '100%'])
  const glare = useMotionTemplate`radial-gradient(600px circle at ${gx} ${gy}, rgba(255,255,255,0.16), transparent 45%)`
  return (
    <motion.div
      className="tilt"
      style={{ rotateX: rx, rotateY: ry }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        mx.set((e.clientX - r.left) / r.width)
        my.set((e.clientY - r.top) / r.height)
      }}
      onPointerLeave={() => {
        mx.set(0.5)
        my.set(0.5)
      }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    >
      {children}
      <motion.span className="tilt__glare" style={{ background: glare }} aria-hidden="true" />
    </motion.div>
  )
}

function Chapter({ project, index, total }) {
  const { theme } = project
  const primary = project.live ?? project.code
  return (
    <article
      className="chap"
      id={project.slug}
      style={{ '--c-bg': theme.bg, '--c-bg2': theme.bg2 ?? theme.bg, '--c-ink': theme.ink, '--c-accent': theme.accent }}
      aria-labelledby={`proj-${index}`}
    >
      <div className="chap__panel">
        <span className="chap__mark" aria-hidden="true">
          {project.mark}
        </span>

        <div className="chap__top">
          <span className="chap__count">
            {String(index + 1).padStart(2, '0')} <span>/ {String(total).padStart(2, '0')}</span>
          </span>
          <span className="chap__type">{project.type}</span>
          <span className="chap__bar" aria-hidden="true">
            <span className="chap__bar-fill" />
          </span>
        </div>

        <ProjectTitle project={project} className="chap__title" id={`proj-${index}`} />

        <div className="chap__grid">
          <div className="chap__info">
            <p className="chap__subtitle chap__item">{project.subtitle}</p>
            <p className="chap__blurb chap__item">{project.blurb}</p>
            <ul className="chap__points chap__item">
              {project.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
            <ul className="chap__stack chap__item">
              {project.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p className="chap__role chap__item">{project.role}</p>
            <div className="chap__links chap__item">
              {project.live && (
                <Magnetic>
                  <a className="cbtn cbtn--solid" href={project.live} target="_blank" rel="noreferrer">
                    <RollText>Live demo</RollText>
                    <span aria-hidden="true">↗</span>
                  </a>
                </Magnetic>
              )}
              <Magnetic>
                <a
                  className={`cbtn ${project.live ? 'cbtn--ghost' : 'cbtn--solid'}`}
                  href={project.code}
                  target="_blank"
                  rel="noreferrer"
                >
                  <RollText>GitHub</RollText>
                  <span aria-hidden="true">↗</span>
                </a>
              </Magnetic>
            </div>
          </div>

          <a
            className="chap__visual"
            href={primary}
            target="_blank"
            rel="noreferrer"
            data-cursor={project.live ? 'View live' : 'View code'}
            aria-label={`Open ${project.title}`}
          >
            <div className="chap__stage">
              <Tilt>{project.image ? <BrowserShot project={project} /> : <ComingSoon project={project} />}</Tilt>
            </div>
          </a>
        </div>
      </div>
    </article>
  )
}

export default function ProjectChapters() {
  const root = useRef(null)
  const [charsReady, setCharsReady] = useState(false)
  useProximity(root, '.chap__title .char', { enabled: charsReady, radius: 220, scale: 0.26 })

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      if (prefersReducedMotion()) return

      const titles = SplitText.create(q('.chap__title > span'), { type: 'chars', charsClass: 'char' })
      setCharsReady(true)
      const mm = gsap.matchMedia()

      q('.chap').forEach((chap) => {
        const panel = chap.querySelector('.chap__panel')
        const chars = chap.querySelectorAll('.chap__title .char')
        const stage = chap.querySelector('.chap__stage')
        const items = chap.querySelectorAll('.chap__item')
        const mark = chap.querySelector('.chap__mark')
        const fill = chap.querySelector('.chap__bar-fill')

        // the coloured panel grows from an inset card to full-bleed as it arrives
        gsap.fromTo(
          panel,
          { clipPath: 'inset(14% 7% 14% 7% round 48px)' },
          {
            clipPath: 'inset(0% 0% 0% 0% round 0px)',
            ease: 'none',
            scrollTrigger: { trigger: chap, start: 'top bottom', end: 'top top', scrub: 0.6 },
          },
        )

        const reveal = (tl) =>
          tl
            .from(
              chars,
              {
                yPercent: 120,
                rotateX: -90,
                autoAlpha: 0,
                transformOrigin: '50% 100%',
                stagger: 0.04,
                duration: 0.5,
                ease: 'back.out(1.6)',
              },
              0,
            )
            .from(
              stage,
              { rotateX: 48, rotateZ: -9, scale: 0.62, yPercent: 30, autoAlpha: 0.2, duration: 0.8, ease: 'power3.out' },
              0.08,
            )
            .from(items, { y: 40, autoAlpha: 0, stagger: 0.06, duration: 0.4, ease: 'power3.out' }, 0.35)
            .from(mark, { xPercent: 30, autoAlpha: 0, duration: 0.9, ease: 'power2.out' }, 0)

        // desktop: pin each chapter and scrub the reveal with the scroll
        mm.add('(min-width: 901px)', () => {
          const tl = gsap.timeline({
            scrollTrigger: { trigger: chap, start: 'top top', end: '+=120%', pin: true, scrub: 0.8 },
          })
          reveal(tl)
          tl.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'none' }, 0)
          tl.to(panel, { scale: 0.94, filter: 'brightness(0.6)', duration: 0.3, ease: 'power1.in' }, 1)
        })

        // phones: no pin, play the same reveal when the chapter scrolls in
        mm.add('(max-width: 900px)', () => {
          const tl = gsap.timeline({
            scrollTrigger: { trigger: chap, start: 'top 55%', toggleActions: 'play none none reverse' },
            defaults: { duration: 0.9 },
          })
          reveal(tl)
          tl.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'power2.out' }, 0)
        })
      })

      return () => {
        mm.revert()
        titles.revert()
      }
    },
    { scope: root },
  )

  return (
    <div className="chapters" ref={root}>
      {site.projects.map((p, i) => (
        <Chapter key={p.slug} project={p} index={i} total={site.projects.length} />
      ))}
    </div>
  )
}
