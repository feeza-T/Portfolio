import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText, prefersReducedMotion, scrollToTarget, supportsWebGL } from '../../lib/scroll'
import { useProximity } from '../../lib/useProximity'
import { fullName, site } from '../../config/site'
import { loadCanvas } from '../Hero/assets'
import { ProjectTitle } from '../Projects/ProjectChapters'
import '../Hero/Hero.css'
import './ProjectsHero.css'

const SmokeCanvas = lazy(() => loadCanvas().then((m) => ({ default: m.SmokeCanvas })))
const mod = (a, n) => ((a % n) + n) % n
const themeVars = (t) => ({ '--c-bg': t.bg, '--c-bg2': t.bg2 ?? t.bg, '--c-ink': t.ink, '--c-accent': t.accent })

// What the wall can show: a name card first, then every project.
const ITEMS = [{ kind: 'card' }, ...site.projects.map((p) => ({ kind: 'project', project: p }))]

/** One full-size picture. Every vane shows a slice of it (shifted left by `offset`). */
function Panel({ item, offset, W, H }) {
  const style = { left: -offset, width: W, height: H }
  if (item.kind === 'card') {
    return (
      <div className="tvp tvp--card" style={style}>
        <span className="tvp__corner tvp__corner--tl">[ Index ] Projects</span>
        <span className="tvp__corner tvp__corner--tr">Edition 2026</span>
        <div className="tvp__name">
          <span>{site.firstName}</span>
          <span className="tvp__name-outline">{site.middleName}</span>
          <span className="tvp__name-red">
            {site.lastName}
            <i>.</i>
          </span>
        </div>
        <span className="tvp__corner tvp__corner--bl">{site.role[0]} · {site.location}</span>
        <span className="tvp__corner tvp__corner--br">↓ {String(site.projects.length).padStart(2, '0')} projects</span>
      </div>
    )
  }
  const p = item.project
  return (
    <div className="tvp tvp--project" style={{ ...style, ...themeVars(p.theme) }}>
      {p.image ? (
        <div className="tvp__img" style={{ backgroundImage: `url(${p.image})` }} />
      ) : (
        <div className="tvp__soon">
          <span>{p.titleParts?.[0] ?? p.title}</span>
          <span className="tvp__soon-b">{p.titleParts?.[1]}</span>
        </div>
      )}
      <div className="tvp__shade" />
      <div className="tvp__label">
        <ProjectTitle project={p} as="span" className="tvp__title" />
        <span className="tvp__type">
          {p.type}
          {!p.image && p.status ? ` · ${p.status}` : ''}
        </span>
      </div>
    </div>
  )
}

export default function ProjectsHero({ play }) {
  const root = useRef(null)
  const head = useRef(null)
  const wall = useRef(null)
  const [size, setSize] = useState({ W: 0, H: 0 })
  const [pos, setPos] = useState(0) // unbounded step counter; item = pos mod items
  const [faces, setFaces] = useState([0, 1, 2]) // which item each prism face shows
  const [introDone, setIntroDone] = useState(false)
  const [paused, setPaused] = useState(false)
  const [webgl] = useState(() => supportsWebGL() && !prefersReducedMotion())
  const lastPos = useRef(0)
  const N = ITEMS.length
  const current = mod(pos, N)

  useProximity(head, '.phero__word .char', { enabled: introDone, radius: 200, scale: 0.28 })

  // measure the wall; fewer vanes on small screens
  useLayoutEffect(() => {
    const el = wall.current
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect
      setSize({ W: Math.round(width), H: Math.round(height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const count = size.W < 700 ? 10 : 18
  const w = size.W / count
  const r = w / (2 * Math.tan(Math.PI / 3)) // distance from prism centre to each face

  // turn to a step: load the incoming item onto the hidden face first, then rotate
  const go = useCallback(
    (dir) => {
      setPos((p) => {
        const next = p + dir
        setFaces((f) => {
          const copy = [...f]
          copy[mod(next, 3)] = mod(next, N)
          return copy
        })
        return next
      })
    },
    [N],
  )

  // vanes flip in once they exist (they're created after the wall is measured)
  const flippedIn = useRef(false)
  useEffect(() => {
    if (!play || flippedIn.current || !size.W || prefersReducedMotion()) return
    const strips = wall.current?.querySelectorAll('.tv__strip')
    if (!strips?.length) return
    flippedIn.current = true
    gsap.from(strips, { rotationY: 90, autoAlpha: 0, duration: 1.2, stagger: 0.04, ease: 'power3.out', delay: 0.35 })
  }, [play, size.W])

  // rotate the vanes whenever the step changes (staggered like a trivision billboard)
  useEffect(() => {
    const prisms = wall.current?.querySelectorAll('.tv__prism')
    if (!prisms?.length) return
    const dir = Math.sign(pos - lastPos.current) || 1
    lastPos.current = pos
    gsap.to(prisms, {
      rotationY: -120 * pos,
      z: -r,
      duration: prefersReducedMotion() ? 0 : 1.15,
      ease: 'power3.inOut',
      stagger: { each: 0.035, from: dir > 0 ? 'start' : 'end' },
      overwrite: 'auto',
    })
  }, [pos, r, count])

  // auto-turn every few seconds unless the visitor is interacting (restarts after any turn)
  useEffect(() => {
    if (!introDone || paused || prefersReducedMotion()) return
    const id = setTimeout(() => go(1), 4200)
    return () => clearTimeout(id)
  }, [introDone, paused, go, pos])

  // vanes lean slightly toward the cursor (applied to the strip, not the turning prism)
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches || prefersReducedMotion()) return
    const el = wall.current
    const move = (e) => {
      const rect = el.getBoundingClientRect()
      el.querySelectorAll('.tv__strip').forEach((s, i) => {
        const cx = rect.left + (i + 0.5) * (rect.width / count)
        const d = (e.clientX - cx) / rect.width
        gsap.to(s, { rotationY: gsap.utils.clamp(-14, 14, -d * 40) * Math.max(0, 1 - Math.abs(d) * 2.5), duration: 0.6, ease: 'power3.out', overwrite: 'auto' })
      })
    }
    const leave = () => gsap.to(el.querySelectorAll('.tv__strip'), { rotationY: 0, duration: 0.8, ease: 'power3.out' })
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [count])

  // drag / swipe to turn
  const drag = useRef(null)
  const onDown = (e) => (drag.current = e.clientX)
  const onUp = (e) => {
    if (drag.current == null) return
    const dx = e.clientX - drag.current
    drag.current = null
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
    else if (ITEMS[current].kind === 'project') scrollToTarget(`#${ITEMS[current].project.slug}`)
    else go(1)
  }

  useGSAP(
    () => {
      if (!play) return
      const q = gsap.utils.selector(root)
      if (prefersReducedMotion()) {
        gsap.set(q('.js-hide'), { autoAlpha: 1 })
        setIntroDone(true)
        return
      }
      const words = SplitText.create(q('.phero__word'), { type: 'chars', charsClass: 'char' })
      gsap.set(q('.js-hide'), { autoAlpha: 1 })
      gsap
        .timeline({
          defaults: { ease: 'expo.out' },
          delay: 0.15,
          onComplete: () => {
            root.current?.classList.add('is-ready')
            setIntroDone(true)
          },
        })
        .from(words.chars, { yPercent: 120, duration: 1.2, stagger: 0.03 }, 0)
        .from(q('.meta'), { y: 16, autoAlpha: 0, duration: 1, stagger: 0.07 }, 0.2)
        .from(q('.hero__rule'), { scaleX: 0, transformOrigin: 'left', duration: 1.4, ease: 'expo.inOut' }, 0.15)
        .fromTo(q('.tv'), { clipPath: 'inset(50% 0% 50% 0% round 18px)' }, { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1.4, ease: 'expo.inOut' }, 0.2)
        .from(q('.phero__controls > *, .phero__caption > *'), { y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.06 }, 0.6)

      // scroll away: the wall settles back and the title drifts apart
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 } })
        .to(q('.tv'), { scale: 0.92, yPercent: -6, ease: 'none' }, 0)
        .to(q('.phero__word--1'), { xPercent: -10, ease: 'none' }, 0)
        .to(q('.phero__word--3'), { xPercent: 10, ease: 'none' }, 0)
        .fromTo(root.current, { '--bg-fade': 1 }, { '--bg-fade': 0.2, ease: 'none' }, 0)

      return () => words.revert()
    },
    { scope: root, dependencies: [play] },
  )

  const item = ITEMS[current]
  const project = item.kind === 'project' ? item.project : null

  return (
    <section className="phero hero" ref={root} data-state={play ? 'play' : 'pre'} id="projects-top">
      {webgl && (
        <Suspense fallback={null}>
          <SmokeCanvas play={play} focus={[0.5, 0.45]} />
        </Suspense>
      )}
      <div className="hero__vignette" aria-hidden="true" />

      <div className="phero__inner">
        <div className="hero__meta">
          <div className="meta js-hide">
            <span className="meta__idx">[ Index ]</span>
            <span>Projects</span>
            <span className="muted">Edition 2026</span>
          </div>
          <div className="meta js-hide">
            <span className="meta__idx">[ Count ]</span>
            <span>{String(site.projects.length).padStart(2, '0')} projects</span>
            <span className="muted">1 solo · 2 team</span>
          </div>
          <div className="meta js-hide">
            <span className="meta__idx">[ Stack ]</span>
            <span>React · MERN</span>
            <span className="muted">GSAP · Motion</span>
          </div>
          <div className="meta meta--status js-hide">
            <span className="meta__idx">[ Status ]</span>
            <span className="meta__status">
              <span className="dot" aria-hidden="true" />
              {site.status}
            </span>
          </div>
        </div>
        <div className="hero__rule" aria-hidden="true" />

        <div className="phero__head" ref={head}>
          <h1 className="phero__title js-hide" aria-label="Things I've built">
            <span className="phero__word phero__word--1" aria-hidden="true">
              Things
            </span>{' '}
            <span className="phero__word phero__word--2" aria-hidden="true">
              I&apos;ve
            </span>{' '}
            <span className="phero__word phero__word--3" aria-hidden="true">
              Built<i>.</i>
            </span>
          </h1>
          <div className="phero__controls">
            <span className="phero__counter js-hide">
              <b>{String(current).padStart(2, '0')}</b> / {String(N - 1).padStart(2, '0')}
            </span>
            <div className="phero__arrows js-hide">
              <button type="button" onClick={() => go(-1)} aria-label="Previous" data-cursor="Prev">
                ←
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next" data-cursor="Next">
                →
              </button>
            </div>
            <span className="phero__hint js-hide">Drag or swipe to turn</span>
          </div>
        </div>

        <div
          className="tv js-hide"
          ref={wall}
          onPointerDown={onDown}
          onPointerUp={onUp}
          onPointerLeave={() => {
            drag.current = null
            setPaused(false)
          }}
          onPointerEnter={() => setPaused(true)}
          data-cursor={project ? 'Drag · Open' : 'Drag'}
          role="region"
          aria-roledescription="carousel"
          aria-label={`Showing ${project ? project.title : fullName}`}
        >
          {size.W > 0 &&
            Array.from({ length: count }, (_, i) => (
              <div className="tv__strip" key={`${count}-${i}`} style={{ left: i * w, width: Math.ceil(w) + 1 }}>
                <div className="tv__prism">
                  {[0, 1, 2].map((f) => (
                    <div className="tv__face" key={f} style={{ transform: `rotateY(${f * 120}deg) translateZ(${r}px)` }}>
                      <Panel item={ITEMS[faces[f]]} offset={i * w} W={size.W} H={size.H} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>

        <div className="phero__caption">
          <span className="phero__cap-num js-hide">{project ? `0${current}` : '00'}</span>
          <span className="phero__cap-text js-hide" key={current}>
            {project ? `${project.title} — ${project.subtitle}` : `${fullName} — selected work`}
          </span>
          <button
            type="button"
            className="btn btn--gold js-hide"
            onClick={() => scrollToTarget(project ? `#${project.slug}` : `#${site.projects[0].slug}`)}
          >
            {project ? 'Explore project' : 'Start exploring'}
            <span className="btn__icon" aria-hidden="true">
              ↓
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
