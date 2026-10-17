import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { motion } from 'motion/react'
import { useLocation, useNavigate } from 'react-router'
import { gsap, lockScroll, scrollToTarget, ScrollTrigger } from '../../lib/scroll'
import { site } from '../../config/site'
import './Navbar.css'

// Text that rolls up to a duplicate copy on hover (Nika-style link detail).
export function RollText({ children }) {
  return (
    <span className="roll" aria-hidden="false">
      <span className="roll__a">{children}</span>
      <span className="roll__b" aria-hidden="true">
        {children}
      </span>
    </span>
  )
}

// Falls back to the single resumeUrl if you haven't added `resumes` to site config.
const getResumes = () =>
  site.resumes?.length ? site.resumes : [{ label: 'Résumé', url: site.resumeUrl }]

export default function Navbar({ play }) {
  const root = useRef(null)
  const resumeRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [resumeOpen, setResumeOpen] = useState(false)
  const [spy, setSpy] = useState('Home')
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const onProjects = pathname.startsWith('/projects')
  const active = onProjects ? 'Work' : spy
  const resumes = getResumes()
  const multiResume = resumes.length > 1

  // Scroll-spy (home page): whichever section covers the middle of the screen is active.
  // "Work" is lit by the Selected Work section on home, and always on the /projects page.
  useEffect(() => {
    if (onProjects) return
    const triggers = site.nav
      .map((l) => {
        const el = document.querySelector(l.href ?? '#work')
        if (!el) return null
        return ScrollTrigger.create({
          trigger: el,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: (self) => self.isActive && setSpy(l.label),
        })
      })
      .filter(Boolean)
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    return () => {
      triggers.forEach((t) => t.kill())
      window.removeEventListener('load', refresh)
    }
  }, [onProjects])

  // Hide on scroll down, reveal on scroll up.
  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setHidden(y > 140 && y > last)
      if (y !== last) setResumeOpen(false)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the résumé dropdown on outside click / Escape.
  useEffect(() => {
    if (!resumeOpen) return
    const onDown = (e) => {
      if (resumeRef.current && !resumeRef.current.contains(e.target)) setResumeOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setResumeOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [resumeOpen])

  // Entrance once the loader hands over.
  useGSAP(
    () => {
      if (!play) return
      gsap.from('.nav__item', {
        yPercent: -120,
        autoAlpha: 0,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.06,
        delay: 0.35,
      })
    },
    { scope: root, dependencies: [play] },
  )

  // Mobile menu overlay.
  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      if (open) {
        lockScroll(true)
        gsap
          .timeline()
          .set(q('.menu'), { autoAlpha: 1 })
          .fromTo(q('.menu__bg'), { yPercent: -100 }, { yPercent: 0, duration: 0.7, ease: 'expo.inOut' })
          .fromTo(
            q('.menu__link'),
            { yPercent: 110 },
            { yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06 },
            '-=0.25',
          )
          .fromTo(
            q('.menu__extra'),
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out' },
            '-=0.5',
          )
      } else if (q('.menu')[0] && gsap.getProperty(q('.menu')[0], 'autoAlpha') > 0) {
        gsap
          .timeline({ onComplete: () => lockScroll(false) })
          .to(q('.menu__extra'), { autoAlpha: 0, duration: 0.2 })
          .to(q('.menu__link'), { yPercent: -110, duration: 0.4, ease: 'expo.in', stagger: 0.03 }, '<')
          .to(q('.menu__bg'), { yPercent: -100, duration: 0.6, ease: 'expo.inOut' }, '-=0.15')
          .set(q('.menu'), { autoAlpha: 0 })
      }
    },
    { scope: root, dependencies: [open] },
  )

  // `to` = another page; `href` = a section of the home page (scroll there, or go home first)
  const go = (e, item) => {
    e.preventDefault()
    setOpen(false)
    if (item.to) return navigate(item.to)
    if (pathname === '/' || document.querySelector(item.href)) return scrollToTarget(item.href)
    navigate(item.href === '#home' ? '/' : `/${item.href}`)
  }
  const linkHref = (item) => item.to ?? `/${item.href === '#home' ? '' : item.href}`

  return (
    <header ref={root} className={`nav ${hidden && !open ? 'nav--hidden' : ''} ${open ? 'nav--open' : ''}`}>
      <div className="nav__bar">
        <a href="/" className="nav__item nav__logo" onClick={(e) => go(e, { href: '#home' })} aria-label="Home">
          <span className="nav__star" aria-hidden="true">✱</span>
          <span>{site.firstName}</span>
          <span className="nav__logo-rest">
            {site.middleName} {site.lastName}
          </span>
        </a>

        <span className="nav__item nav__crumb" aria-hidden="true">
          / <span key={active}>{active}</span>
        </span>

        <nav className="nav__links" aria-label="Primary">
          {site.nav.map((l) => {
            const isActive = active === l.label
            return (
              <a
                key={l.label}
                href={linkHref(l)}
                className={`nav__item nav__link ${isActive ? 'is-active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={(e) => go(e, l)}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="nav__pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <RollText>{l.label}</RollText>
              </a>
            )
          })}
        </nav>

        <div className="nav__right">
          <span className="nav__item nav__status">
            <span className="dot" aria-hidden="true" /> Open to work
          </span>

          {/* Résumé: single link, or a dropdown when you have several versions (desktop only) */}
          <div className="nav__item nav__resume" ref={resumeRef}>
            {multiResume ? (
              <>
                <button
                  type="button"
                  className="nav__cta"
                  aria-expanded={resumeOpen}
                  aria-haspopup="menu"
                  onClick={() => setResumeOpen((o) => !o)}
                >
                  <span>Résumé</span>
                  <span className={`nav__caret ${resumeOpen ? 'is-open' : ''}`} aria-hidden="true">↓</span>
                </button>
                <ul className={`resume-menu ${resumeOpen ? 'is-open' : ''}`} role="menu">
                  {resumes.map((r) => (
                    <li key={r.label} role="none">
                      <a
                        role="menuitem"
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setResumeOpen(false)}
                      >
                        <span>{r.label}</span>
                        <span aria-hidden="true">↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <a className="nav__cta" href={resumes[0].url} target="_blank" rel="noreferrer">
                <RollText>Résumé</RollText>
                <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>

          <button
            type="button"
            className="nav__item nav__menu-btn"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="burger" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      <div className="menu" id="mobile-menu" aria-hidden={!open}>
        <div className="menu__bg" />
        <nav className="menu__inner" aria-label="Mobile">
          {site.nav.map((l) => (
            <div className="menu__mask" key={l.label}>
              <a
                href={linkHref(l)}
                className={`menu__link ${active === l.label ? 'is-active' : ''}`}
                aria-current={active === l.label ? 'page' : undefined}
                onClick={(e) => go(e, l)}
                tabIndex={open ? 0 : -1}
              >
                {l.label}
                {active === l.label && <span className="menu__here">● You are here</span>}
              </a>
            </div>
          ))}

          <div className="menu__extra menu__resumes">
            <p className="menu__label">Résumé</p>
            {resumes.map((r) => (
              <a
                key={r.label}
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="menu__resume"
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
              >
                <span>{r.label}</span>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>

          <p className="menu__extra menu__foot">
            <span className="dot" aria-hidden="true" /> {site.status}
          </p>
        </nav>
      </div>
    </header>
  )
}