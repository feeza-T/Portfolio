import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText, prefersReducedMotion } from '../../lib/scroll'
import { useProximity } from '../../lib/useProximity'
import { site } from '../../config/site'
import { RollText } from '../Navbar/Navbar'
import './Beyond.css'

/**
 * Beyond code — a short look at product design & PM work. Compact cards in a
 * grid; hovering one lifts it and fills it with gold.
 */
export default function Beyond() {
  const root = useRef(null)
  const title = useRef(null)
  const [ready, setReady] = useState(false)
  useProximity(title, '.char', { enabled: ready, radius: 200, scale: 0.32 })

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      if (prefersReducedMotion()) {
        setReady(true)
        return
      }
      const head = SplitText.create(q('.beyond__title-line'), { type: 'chars', charsClass: 'char' })
      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: 'top 75%' },
          onComplete: () => {
            title.current?.classList.add('is-ready')
            setReady(true)
          },
        })
        .from(head.chars, { yPercent: 115, rotate: 5, duration: 1.2, stagger: 0.03, ease: 'expo.out' })
        .from(q('.beyond__aside > *'), { y: 20, autoAlpha: 0, stagger: 0.08, duration: 0.9, ease: 'expo.out' }, 0.2)
      gsap.from(q('.case'), {
        y: 80,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: { trigger: q('.beyond__row')[0], start: 'top 85%' },
      })
      return () => head.revert()
    },
    { scope: root },
  )

  const behance = site.socials.find((s) => s.label === 'Behance')?.href

  return (
    <section id="beyond" className="beyond" ref={root}>
      <div className="beyond__head">
        <h2 className="beyond__title" ref={title} aria-label="Beyond code">
          <span className="beyond__idx" aria-hidden="true">
            [ 06 ]
          </span>
          <span className="beyond__title-line" aria-hidden="true">
            Beyond
          </span>
          <span className="beyond__title-line beyond__title-line--outline" aria-hidden="true">
            Code<span className="beyond__dot">.</span>
          </span>
        </h2>
        <div className="beyond__aside">
          <p>
            I also design products. Before I write a line of code I like to understand the problem — so I scope MVPs,
            map flows and design in Figma. A few case studies:
          </p>
          <p className="beyond__note">
            <span className="dot" aria-hidden="true" /> Full design portfolio coming soon
          </p>
          {behance && (
            <a className="beyond__link" href={behance} target="_blank" rel="noreferrer">
              <RollText>All work on Behance</RollText> <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </div>

      <div className="beyond__row">
        {site.caseStudies.map((c, i) => (
          <a
            key={c.title}
            className="case"
            href={c.href}
            target="_blank"
            rel="noreferrer"
            data-cursor={`Open ${c.where}`}
          >
            <span className="case__top">
              <span className="case__num">0{i + 1}</span>
              <span className="case__kind">{c.kind}</span>
              <span className="case__date">{c.date}</span>
            </span>
            <span className="case__title">{c.title}</span>
            <span className="case__text">{c.text}</span>
            <span className="case__tools">
              {c.tools.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </span>
            <span className="case__cta">
              View on {c.where} <span aria-hidden="true">↗</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}