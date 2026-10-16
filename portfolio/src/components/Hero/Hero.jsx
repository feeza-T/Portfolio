import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText, prefersReducedMotion, scrollToTarget, supportsWebGL } from '../../lib/scroll'
import { useProximity } from '../../lib/useProximity'
import { fullName, site } from '../../config/site'
import { RollText } from '../Navbar/Navbar'
import { loadCanvas, portrait } from './assets'
import './Hero.css'

const SmokeCanvas = lazy(() => loadCanvas().then((m) => ({ default: m.SmokeCanvas })))

function Clock() {
  const fmt = () =>
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: site.timeZone }).format(
      new Date(),
    )
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 10_000)
    return () => clearInterval(id)
  }, [])
  const [h, m] = time.split(':')
  return (
    <span className="clock">
      {h}
      <span className="clock__colon">:</span>
      {m} <span className="muted">local</span>
    </span>
  )
}

// Buttons drift slightly toward the cursor.
export function Magnetic({ children, strength = 0.3 }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(pointer: coarse)').matches) return
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' })
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' })
    const move = (e) => {
      const r = el.getBoundingClientRect()
      x((e.clientX - (r.left + r.width / 2)) * strength)
      y((e.clientY - (r.top + r.height / 2)) * strength)
    }
    const leave = () => {
      x(0)
      y(0)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [strength])
  return (
    <span ref={ref} className="magnetic">
      {children}
    </span>
  )
}

export default function Hero({ play }) {
  const root = useRef(null)
  const stage = useRef(null)
  const [webgl] = useState(() => supportsWebGL() && !prefersReducedMotion())
  const [introDone, setIntroDone] = useState(false)
  const [focus, setFocus] = useState(null)

  useProximity(stage, '.hero__line .char', { enabled: introDone, radius: 220, scale: 0.3 })

  // Tell the smoke shader where the portrait sits so the glow pools behind it.
  useEffect(() => {
    const update = () => {
      const hero = root.current?.getBoundingClientRect()
      const p = root.current?.querySelector('.portrait__frame')?.getBoundingClientRect()
      if (!hero || !p) return
      setFocus([(p.left + p.width / 2) / hero.width, 1 - (p.top - hero.top + p.height / 2) / hero.height])
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useGSAP(
    () => {
      if (!play) return
      const q = gsap.utils.selector(root)

      if (prefersReducedMotion()) {
        gsap.fromTo(q('.js-hide'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, stagger: 0.03 })
        return
      }

      // Chars stay split so they can react to the cursor afterwards.
      const name = SplitText.create(q('.hero__line'), { type: 'chars', charsClass: 'char' })
      const lead = SplitText.create(q('.hero__lead'), {
        type: 'lines,words',
        mask: 'lines',
        wordsClass: 'word',
      })
      gsap.set(q('.js-hide'), { autoAlpha: 1 })

      gsap
        .timeline({
          defaults: { ease: 'expo.out' },
          onComplete: () => {
            root.current?.classList.add('is-ready')
            setIntroDone(true)
          },
        })
        .from(name.chars, { yPercent: 120, duration: 1.4, stagger: 0.035 }, 0)
        .fromTo(
          q('.portrait__frame'),
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' },
          0.05,
        )
        .from(q('.portrait__img'), { scale: 1.25, duration: 2, ease: 'expo.out' }, 0.25)
        .from(q('.portrait__corner'), { scale: 0, duration: 0.8, stagger: 0.05 }, 0.9)
        .from(q('.portrait figcaption > *'), { yPercent: 100, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 1)
        .from(q('.meta'), { y: 16, autoAlpha: 0, duration: 1, stagger: 0.07 }, 0.35)
        .from(lead.lines, { yPercent: 105, duration: 1.1, stagger: 0.08 }, 0.6)
        .from(q('.hero__actions > *'), { y: 20, autoAlpha: 0, duration: 1, stagger: 0.08 }, 0.8)
        .from(q('.hero__foot > *'), { autoAlpha: 0, duration: 1, stagger: 0.08 }, 1)
        .from(q('.hero__rule'), { scaleX: 0, transformOrigin: 'left', duration: 1.6, ease: 'expo.inOut' }, 0.3)

      // Scroll: the name lines slide apart and the smoke fades. The portrait stays
      // put — the avatar climbs out of it (see components/Companion).
      const st = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 }
      gsap
        .timeline({ scrollTrigger: st })
        .to(q('.hero__line--1'), { xPercent: -16, ease: 'none' }, 0)
        .to(q('.hero__line--2'), { xPercent: 10, ease: 'none' }, 0)
        .to(q('.hero__line--3'), { xPercent: 22, ease: 'none' }, 0)
        .to(q('.hero__intro, .hero__meta'), { autoAlpha: 0, y: -40, ease: 'none' }, 0)
        .fromTo(root.current, { '--bg-fade': 1 }, { '--bg-fade': 0.2, ease: 'none' }, 0)

      return () => {
        name.revert()
        lead.revert()
      }
    },
    { scope: root, dependencies: [play] },
  )

  return (
    <section id="home" ref={root} className="hero" data-state={play ? 'play' : 'pre'}>
      {webgl && (
        <Suspense fallback={null}>
          <SmokeCanvas play={play} focus={focus} />
        </Suspense>
      )}
      <div className="hero__vignette" aria-hidden="true" />

      <div className="hero__inner">
        <div className="hero__meta">
          <div className="meta js-hide">
            <span className="meta__idx">[ 01 ]</span>
            <span>Portfolio</span>
            <span className="muted">Edition 2026</span>
          </div>
          <div className="meta js-hide">
            <span className="meta__idx">[ Role ]</span>
            {site.role.map((r) => (
              <span key={r}>{r}</span>
            ))}
          </div>
          <div className="meta js-hide">
            <span className="meta__idx">[ Based ]</span>
            <span>{site.location}</span>
            <Clock />
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

        <div className="hero__stage" ref={stage}>
          <h1 className="hero__name">
            <span className="sr-only">
              {fullName} — {site.role[0]}
            </span>
            <span className="hero__line hero__line--1 js-hide" aria-hidden="true">
              {site.firstName}
            </span>
            <span className="hero__line hero__line--2 js-hide" aria-hidden="true">
              {site.middleName}
            </span>
            <span className="hero__line hero__line--3 js-hide" aria-hidden="true">
              {site.lastName}
              <span className="hero__dot">.</span>
            </span>
          </h1>

          <figure className="portrait js-hide">
            <span className="portrait__corner portrait__corner--tl" aria-hidden="true" />
            <span className="portrait__corner portrait__corner--tr" aria-hidden="true" />
            <span className="portrait__corner portrait__corner--bl" aria-hidden="true" />
            <span className="portrait__corner portrait__corner--br" aria-hidden="true" />
            <div className="portrait__frame">
              <img
                src={portrait}
                alt={`Portrait of ${fullName}`}
                className="portrait__img"
                width="1040"
                height="1300"
                fetchPriority="high"
              />
              <div className="portrait__veil" aria-hidden="true" />
            </div>
            <figcaption>
              <span>[ Portrait ]</span>
              <span className="muted">{site.location}, 2026</span>
            </figcaption>
          </figure>

          <div className="hero__intro">
            <p className="hero__lead js-hide">{site.intro}</p>
            <div className="hero__actions js-hide">
              <Magnetic>
                <a
                  href="#work"
                  className="btn btn--gold"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToTarget('#work')
                  }}
                >
                  <RollText>Explore my work</RollText>
                  <span className="btn__icon" aria-hidden="true">
                    ↓
                  </span>
                </a>
              </Magnetic>
              <a
                href="#skills"
                className="btn btn--ghost"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToTarget('#skills')
                }}
              >
                <RollText>My toolkit</RollText>
              </a>
            </div>
          </div>
        </div>

        <div className="hero__foot">
          <span className="js-hide">
            <span className="meta__idx">Stack</span> {site.heroStack.join(' · ')}
          </span>
          <span className="hero__scroll js-hide" aria-hidden="true">
            Scroll <span className="hero__scroll-line" />
          </span>
          <span className="hero__edu js-hide">{site.education}</span>
        </div>
      </div>
    </section>
  )
}
