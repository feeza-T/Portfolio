import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { motion } from 'motion/react'
import { gsap, SplitText, prefersReducedMotion, ScrollTrigger } from '../../lib/scroll'
import { useProximity } from '../../lib/useProximity'
import { site } from '../../config/site'
import { icons } from './icons'
import './Skills.css'

function Chip({ skill }) {
  const icon = skill.icon ? icons[skill.icon] : null
  return (
    <motion.span
      className="chip"
      style={{ '--brand': icon ? `#${icon.hex}` : 'var(--red)' }}
      whileHover={{ scale: 1.16, y: -6 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 420, damping: 18 }}
    >
      <span className="chip__icon" aria-hidden="true">
        {icon ? (
          <svg viewBox="0 0 24 24">
            <path d={icon.path} />
          </svg>
        ) : (
          <span className="chip__letter">{skill.name[0]}</span>
        )}
      </span>
      {skill.name}
    </motion.span>
  )
}

/**
 * One endless ribbon. Position is advanced every frame (not a repeating tween)
 * so scroll velocity can speed it up or flip its direction without glitches.
 */
function Ribbon({ items, direction = 1, variant, speedRef }) {
  const track = useRef(null)
  const hovered = useRef(false)

  useEffect(() => {
    const el = track.current
    if (!el) return
    const wrap = gsap.utils.wrap(-50, 0)
    let x = direction > 0 ? -50 : 0
    let mult = 1
    const tick = (_, dt) => {
      const target = hovered.current ? 0.15 : 1
      mult += (target - mult) * 0.08
      // base speed ≈ 2.2% of the track per second, boosted by scroll velocity
      x = wrap(x + direction * speedRef.current * mult * 0.0022 * dt)
      el.style.transform = `translate3d(${x}%,0,0)`
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [direction, speedRef])

  const doubled = [...items, ...items]
  return (
    <div
      className={`ribbon ribbon--${variant}`}
      onPointerEnter={() => (hovered.current = true)}
      onPointerLeave={() => (hovered.current = false)}
    >
      <div className="ribbon__track" ref={track}>
        {doubled.map((s, i) => (
          <span className="ribbon__item" key={i} aria-hidden={i >= items.length}>
            <Chip skill={s} />
            <span className="ribbon__sep" aria-hidden="true">
              ✱
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Skills() {
  const root = useRef(null)
  const title = useRef(null)
  const speed = useRef(1) // shared multiplier: >1 while scrolling fast, sign = scroll direction
  const [ready, setReady] = useState(false)

  useProximity(title, '.char', { enabled: ready, radius: 180, scale: 0.35 })

  const rowA = site.skills
  const rowB = [...site.skills].reverse()

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const reduced = prefersReducedMotion()

      // Scroll velocity drives the ribbons; they ease back to cruising speed.
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const v = self.getVelocity()
          const boost = Math.min(Math.abs(v) / 250, 8)
          gsap.to(speed, {
            current: self.direction * (1 + boost),
            duration: 0.25,
            overwrite: true,
            onComplete: () => gsap.to(speed, { current: self.direction, duration: 1.2, ease: 'power2.out' }),
          })
        },
      })

      if (reduced) {
        setReady(true)
        return () => st.kill()
      }

      const split = SplitText.create(q('.skills__title-line'), { type: 'chars', charsClass: 'char' })
      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: 'top 75%' },
          onComplete: () => {
            title.current?.classList.add('is-ready')
            setReady(true)
          },
        })
        .from(split.chars, { yPercent: 110, rotate: 6, duration: 1.1, stagger: 0.03, ease: 'expo.out' })
        .from(q('.skills__aside > *'), { y: 20, autoAlpha: 0, stagger: 0.08, duration: 0.9, ease: 'expo.out' }, 0.2)
        .from(
          q('.ribbon'),
          { xPercent: (i) => (i ? 30 : -30), autoAlpha: 0, duration: 1.4, stagger: 0.1, ease: 'expo.out' },
          0.15,
        )

      // The crossing ribbons tilt a little more as the section scrolls through.
      gsap.fromTo(
        q('.skills__float'),
        { rotate: -1.5, y: 40 },
        {
          rotate: 1.5,
          y: -40,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
        },
      )

      return () => {
        st.kill()
        split.revert()
      }
    },
    { scope: root },
  )

  return (
    <section id="skills" className="skills" ref={root}>
      <div className="skills__head">
        <h2 className="skills__title" ref={title} aria-label="Toolkit">
          <span className="skills__idx" aria-hidden="true">
            [ 02 ]
          </span>
          <span className="skills__title-line" aria-hidden="true">
            Tool
          </span>
          <span className="skills__title-line skills__title-line--red" aria-hidden="true">
            kit<span className="skills__dot">.</span>
          </span>
        </h2>
        <div className="skills__aside">
          <p>The languages, libraries and tools I reach for — from the first layout to the last animation.</p>
          <p className="skills__hint">
            <span className="dot" aria-hidden="true" /> Hover to slow · scroll to speed up
          </p>
        </div>
      </div>

      <div className="skills__stage">
        <div className="skills__float">
          <Ribbon items={rowA} direction={-1} variant="red" speedRef={speed} />
          <Ribbon items={rowB} direction={1} variant="gold" speedRef={speed} />
        </div>
      </div>

      <ul className="sr-only">
        {site.skills.map((s) => (
          <li key={s.name}>{s.name}</li>
        ))}
      </ul>
    </section>
  )
}
