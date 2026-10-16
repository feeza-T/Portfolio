import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText, prefersReducedMotion } from '../../lib/scroll'
import { useProximity } from '../../lib/useProximity'
import { site } from '../../config/site'
import CopyEmail from '../CopyEmail/CopyEmail'
import polka from '../../assets/portrait-polka.jpg'
import saree from '../../assets/portrait-saree.jpg'
import wave from '../../assets/avatar/wave.webp'
import './About.css'

const PRINTS = [
  { src: polka, caption: 'Tea-stall days', cls: 'print--a' },
  { src: saree, caption: 'In red', cls: 'print--b' },
  { src: wave, caption: 'My avatar', cls: 'print--c', sticker: true },
]

function Mode({ mode, index }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <button
      type="button"
      className={`mode ${flipped ? 'is-flipped' : ''}`}
      onClick={() => setFlipped((f) => !f)}
      aria-pressed={flipped}
      data-cursor="Flip"
    >
      <span className="mode__inner">
        <span className="mode__face mode__front">
          <span className="mode__num">0{index + 1}</span>
          <span className="mode__title">{mode.title}</span>
          <span className="mode__line">{mode.line}</span>
          <span className="mode__hint" aria-hidden="true">
            ↻
          </span>
        </span>
        <span className="mode__face mode__back">
          <span className="mode__num">0{index + 1} · {mode.title}</span>
          <span className="mode__body">{mode.body}</span>
        </span>
      </span>
    </button>
  )
}

export default function About() {
  const root = useRef(null)
  const title = useRef(null)
  const [ready, setReady] = useState(false)
  useProximity(title, '.char', { enabled: ready, radius: 200, scale: 0.32 })
  const { about } = site

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const reduced = prefersReducedMotion()

      if (reduced) {
        setReady(true)
        return
      }

      const head = SplitText.create(q('.about__title-line'), { type: 'chars', charsClass: 'char' })
      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: 'top 75%' },
          onComplete: () => {
            title.current?.classList.add('is-ready')
            setReady(true)
          },
        })
        .from(head.chars, { yPercent: 115, rotate: 5, duration: 1.2, stagger: 0.03, ease: 'expo.out' })
        .from(q('.print'), { yPercent: 40, autoAlpha: 0, duration: 1.3, stagger: 0.1, ease: 'expo.out' }, 0.15)

      // statement lights up word by word as you scroll through it
      const words = SplitText.create(q('.about__statement'), { type: 'words', wordsClass: 'sw' })
      gsap.fromTo(
        words.words,
        { opacity: 0.14 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: 'none',
          scrollTrigger: { trigger: q('.about__statement')[0], start: 'top 80%', end: 'bottom 45%', scrub: 0.6 },
        },
      )

      gsap.from(q('.mode'), {
        y: 60,
        autoAlpha: 0,
        rotateX: -25,
        stagger: 0.08,
        duration: 1.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: q('.about__modes')[0], start: 'top 85%' },
      })

      // timeline: the line draws itself, items arrive one by one
      gsap.fromTo(
        q('.tl__fill'),
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: q('.tl')[0], start: 'top 70%', end: 'bottom 60%', scrub: 0.6 },
        },
      )
      q('.tl__item').forEach((item) =>
        gsap.from(item, {
          x: -30,
          autoAlpha: 0,
          duration: 0.9,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 78%',
            onEnter: () => item.classList.add('is-lit'),
            onLeaveBack: () => item.classList.remove('is-lit'),
          },
        }),
      )
      gsap.from(q('.about__reach > *'), {
        y: 30,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: { trigger: q('.about__reach')[0], start: 'top 85%' },
      })

      return () => {
        head.revert()
        words.revert()
      }
    },
    { scope: root },
  )

  return (
    <section id="about" className="about" ref={root}>
      <div className="about__top">
        <h2 className="about__title" ref={title} aria-label="About me">
          <span className="about__idx" aria-hidden="true">
            [ 05 ]
          </span>
          <span className="about__title-line" aria-hidden="true">
            About
          </span>
          <span className="about__title-line about__title-line--red" aria-hidden="true">
            Me<span className="about__dot">.</span>
          </span>
        </h2>

        <div className="prints" aria-label="Photos of Takwa">
          {PRINTS.map((p) => (
            <figure key={p.caption} className={`print ${p.cls}`} tabIndex={0} data-cursor="Straighten">
              <div className={`print__img ${p.sticker ? 'print__img--sticker' : ''}`}>
                <img src={p.src} alt={p.caption} loading="lazy" draggable="false" />
              </div>
              <figcaption>{p.caption}</figcaption>
            </figure>
          ))}
          <span className="prints__hint" aria-hidden="true">
            Hover to straighten
          </span>
        </div>

        <p className="about__statement">{about.statement}</p>
      </div>

      <div className="about__modes-head">
        <span className="about__idx-inline">How I work</span>
        <span className="muted">Tap or click a card to flip it</span>
      </div>
      <div className="about__modes">
        {about.modes.map((m, i) => (
          <Mode key={m.title} mode={m} index={i} />
        ))}
      </div>

      <div className="about__bottom">
        <div className="tl">
          <span className="about__idx-inline">Path so far</span>
          <div className="tl__track" aria-hidden="true">
            <span className="tl__fill" />
          </div>
          <ol className="tl__list">
            {about.timeline.map((t) => (
              <li className="tl__item" key={t.title}>
                <span className="tl__dot" aria-hidden="true" />
                <span className="tl__when">{t.when}</span>
                <span className="tl__title">{t.title}</span>
                <span className="tl__text">{t.text}</span>
              </li>
            ))}
          </ol>
        </div>

        <aside className="about__reach">
          <span className="about__idx-inline">Say hello</span>
          <p>
            I&apos;m open to frontend and full-stack internships and entry-level roles. The easiest way to reach me is
            email.
          </p>
          <CopyEmail />
        </aside>
      </div>
    </section>
  )
}