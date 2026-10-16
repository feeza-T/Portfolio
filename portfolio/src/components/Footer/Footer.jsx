import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText, prefersReducedMotion, scrollToTarget, ScrollTrigger } from '../../lib/scroll'
import { useProximity } from '../../lib/useProximity'
import { fullName, site } from '../../config/site'
import { RollText } from '../Navbar/Navbar'
import { Magnetic } from '../Hero/Hero'
import CopyEmail from '../CopyEmail/CopyEmail'
import './Footer.css'

function LocalTime() {
  const fmt = () =>
    new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: site.timeZone,
    }).format(new Date())
  const [t, setT] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="foot__time">{t}</span>
}

export default function Footer() {
  const root = useRef(null)
  const title = useRef(null)
  const track = useRef(null)
  const speed = useRef(1)
  const [ready, setReady] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  useProximity(title, '.char', { enabled: ready, radius: 220, scale: 0.3 })

  // home sections scroll in place; from other pages go home first
  const go = (e, item) => {
    e.preventDefault()
    if (item.to) return navigate(item.to)
    if (pathname === '/' || document.querySelector(item.href)) return scrollToTarget(item.href)
    navigate(item.href === '#home' ? '/' : `/${item.href}`)
  }

  // giant name marquee — speeds up and flips with your scroll
  useEffect(() => {
    const el = track.current
    if (!el || prefersReducedMotion()) return
    const wrap = gsap.utils.wrap(-50, 0)
    let x = 0
    const tick = (_, dt) => {
      x = wrap(x - speed.current * 0.0016 * dt)
      el.style.transform = `translate3d(${x}%,0,0)`
    }
    gsap.ticker.add(tick)
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const boost = Math.min(Math.abs(self.getVelocity()) / 300, 6)
        gsap.to(speed, {
          current: self.direction * (1 + boost),
          duration: 0.25,
          overwrite: true,
          onComplete: () => gsap.to(speed, { current: self.direction, duration: 1.2 }),
        })
      },
    })
    return () => {
      gsap.ticker.remove(tick)
      st.kill()
    }
  }, [])

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      if (prefersReducedMotion()) {
        setReady(true)
        return
      }
      const head = SplitText.create(q('.foot__line'), { type: 'chars', charsClass: 'char' })
      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: 'top 70%' },
          onComplete: () => {
            title.current?.classList.add('is-ready')
            setReady(true)
          },
        })
        .from(head.chars, { yPercent: 115, duration: 1.2, stagger: 0.025, ease: 'expo.out' })
        .from(q('.foot__reach > *'), { y: 30, autoAlpha: 0, stagger: 0.08, duration: 1, ease: 'expo.out' }, 0.25)
        .from(q('.foot__col'), { y: 30, autoAlpha: 0, stagger: 0.07, duration: 1, ease: 'expo.out' }, 0.35)
      return () => head.revert()
    },
    { scope: root },
  )

  const name = `${fullName} ✱ `
  return (
    <footer id="contact" className="foot" ref={root}>
      <div className="foot__top">
        <h2 className="foot__title" ref={title} aria-label="Let's build something">
          <span className="foot__idx" aria-hidden="true">
            [ 07 ] Contact
          </span>
          <span className="foot__line" aria-hidden="true">
            Let&apos;s build
          </span>
          <span className="foot__line foot__line--red" aria-hidden="true">
            something<span className="foot__dot">.</span>
          </span>
        </h2>
        <div className="foot__reach">
          <p>
            Open to frontend and full-stack internships and entry-level roles. Have an idea, a role or just a question?
            Drop me an email.
          </p>
          <CopyEmail big />
        </div>
      </div>

      <div className="foot__grid">
        <nav className="foot__col" aria-label="Footer">
          <span className="foot__label">Index</span>
          {site.nav.map((l) => (
            <a key={l.label} href={l.to ?? `/${l.href === '#home' ? '' : l.href}`} onClick={(e) => go(e, l)}>
              <RollText>{l.label}</RollText>
            </a>
          ))}
        </nav>
        <div className="foot__col">
          <span className="foot__label">Elsewhere</span>
          {site.socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
              <RollText>{s.label}</RollText> <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
        <div className="foot__col">
          <span className="foot__label">Local time</span>
          <LocalTime />
          <span className="muted">
            {site.location} · GMT+6
          </span>
        </div>
        <div className="foot__col foot__col--end">
          <span className="foot__label">Status</span>
          <span className="foot__status">
            <span className="dot" aria-hidden="true" /> {site.status}
          </span>
          <Magnetic>
            <button type="button" className="foot__top-btn" onClick={() => scrollToTarget('#top')} data-cursor="Up">
              ↑<span className="sr-only">Back to top</span>
            </button>
          </Magnetic>
        </div>
      </div>

      <div className="foot__marquee" aria-hidden="true">
        <div className="foot__marquee-track" ref={track}>
          <span>{name.repeat(3)}</span>
          <span>{name.repeat(3)}</span>
        </div>
      </div>

      <div className="foot__bar">
        <span>© 2026 {fullName}</span>
        <span>Built with React · GSAP · Three.js · Motion</span>
      </div>
    </footer>
  )
}
