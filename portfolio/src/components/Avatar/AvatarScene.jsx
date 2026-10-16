import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, prefersReducedMotion, ScrollTrigger } from '../../lib/scroll'
import { site } from '../../config/site'
import idle from '../../assets/avatar/idle.webp'
import jump from '../../assets/avatar/jump.webp'
import wink from '../../assets/avatar/wink.webp'
import kick from '../../assets/avatar/kick.webp'
import oops from '../../assets/avatar/oops.webp'
import wave from '../../assets/avatar/wave.webp'
import './AvatarScene.css'

const POSES = [
  { src: idle, word: 'Hi!', step: 'Hello', air: false },
  { src: jump, word: 'Jump!', step: 'Ideas', air: true },
  { src: wink, word: 'Wink', step: 'Mischief', air: false },
  { src: kick, word: 'Whee!', step: 'Excited', air: true },
  { src: oops, word: 'Oops', step: 'Wait…', air: false },
  { src: wave, word: 'Bye!', step: 'Bye', air: false },
]
const TAP_LINES = ['Hehe!', 'Again?', 'Boing!', 'Okay okay!', 'Scroll on!']

/**
 * Pinned scene: as you scroll she goes hi → jump → wink → kick → oops → bye.
 * Poses cross-fade (the old one dissolves while the new one settles in) with a
 * soft squash, so a change reads as one movement. She always stays upright —
 * no skew or rotation — and moves only up/down and sideways.
 */
export default function AvatarScene() {
  const root = useRef(null)
  const figure = useRef(null)
  const bob = useRef(null)
  const shadow = useRef(null)
  const bubble = useRef(null)
  const bubbleText = useRef(null)
  const word = useRef(null)
  const stepRef = useRef(0)
  const loop = useRef(null)
  const taps = useRef(0)
  const [step, setStep] = useState(0)

  const playStep = (next, prev) => {
    const imgs = figure.current.querySelectorAll('img')
    const pose = POSES[next]
    loop.current?.kill()

    if (bubbleText.current) bubbleText.current.textContent = site.avatarLines[next] ?? ''
    if (word.current) word.current.textContent = pose.word

    if (prefersReducedMotion()) {
      gsap.set(imgs, { autoAlpha: 0 })
      gsap.set(imgs[next], { autoAlpha: 1 })
      return
    }

    // cross-fade: outgoing dissolves down a touch, incoming settles in from slightly larger
    imgs.forEach((img, i) => {
      if (i === next) {
        gsap.fromTo(
          img,
          { autoAlpha: 0, scale: 1.04, y: 8 },
          { autoAlpha: 1, scale: 1, y: 0, duration: 0.55, ease: 'power2.out', overwrite: true },
        )
      } else if (i === prev) {
        gsap.to(img, { autoAlpha: 0, scale: 0.97, y: 4, duration: 0.45, ease: 'power2.inOut', overwrite: true })
      } else {
        gsap.set(img, { autoAlpha: 0 })
      }
    })

    // soft squash on the whole figure (vertical/horizontal scale only — never tilted)
    gsap.fromTo(
      figure.current,
      { scaleX: 1.04, scaleY: 0.95 },
      { scaleX: 1, scaleY: 1, duration: 0.8, ease: 'elastic.out(1, 0.55)', overwrite: 'auto' },
    )

    gsap.fromTo(
      bubble.current,
      { scale: 0.7, autoAlpha: 0, y: 10 },
      { scale: 1, autoAlpha: 1, y: 0, duration: 0.55, ease: 'back.out(2)', overwrite: true },
    )
    gsap.fromTo(
      word.current,
      { yPercent: next >= prev ? 40 : -40, autoAlpha: 0 },
      { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out', overwrite: true },
    )

    if (pose.air) {
      // hop: up, hang, land with a little bounce; shadow shrinks while airborne
      gsap
        .timeline({ overwrite: true })
        .to(bob.current, { y: -60, duration: 0.38, ease: 'power2.out' })
        .to(bob.current, { y: 0, duration: 0.5, ease: 'bounce.out' })
      gsap
        .timeline()
        .to(shadow.current, { scaleX: 0.6, opacity: 0.25, duration: 0.38, ease: 'power2.out' })
        .to(shadow.current, { scaleX: 1, opacity: 0.55, duration: 0.5, ease: 'bounce.out' })
    } else {
      gsap.to(bob.current, { y: 0, duration: 0.4, ease: 'power2.out', overwrite: true })
    }

    if (next === POSES.length - 1) {
      // waving: a gentle upright bounce that keeps going until she leaves
      loop.current = gsap.to(bob.current, {
        y: -10,
        duration: 0.45,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 0.4,
      })
    }
  }

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const mm = gsap.matchMedia()

      mm.add({ desktop: '(min-width: 901px)', mobile: '(max-width: 900px)' }, (ctx) => {
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top top',
          end: ctx.conditions.desktop ? '+=360%' : '+=300%',
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const next = Math.min(POSES.length - 1, Math.floor(self.progress * POSES.length * 0.999))
            gsap.set(q('.ava__bar-fill'), { scaleX: self.progress })
            if (next === stepRef.current) return
            const prev = stepRef.current
            stepRef.current = next
            setStep(next)
            playStep(next, prev)
          },
        })
      })

      gsap.fromTo(
        q('.ava__marquee-inner'),
        { xPercent: 0 },
        {
          xPercent: -50,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom+=360% top', scrub: 0.5 },
        },
      )

      gsap.from(q('.ava__head > *, .ava__steps li'), {
        y: 24,
        autoAlpha: 0,
        stagger: 0.05,
        duration: 0.9,
        ease: 'expo.out',
        scrollTrigger: { trigger: root.current, start: 'top 70%' },
      })
      gsap.from(q('.ava__stage'), {
        yPercent: 18,
        autoAlpha: 0,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: { trigger: root.current, start: 'top 70%' },
      })

      // idle breathing (vertical only)
      gsap.to(q('.ava__breathe'), {
        scaleY: 1.012,
        transformOrigin: '50% 100%',
        duration: 1.6,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })

      gsap.set(figure.current.querySelectorAll('img'), { autoAlpha: 0 })
      gsap.set(figure.current.querySelector('img'), { autoAlpha: 1 })
      if (bubbleText.current) bubbleText.current.textContent = site.avatarLines[0]
      return () => {
        mm.revert()
        loop.current?.kill()
      }
    },
    { scope: root },
  )

  // gentle sideways parallax toward the cursor (no rotation, so she stays straight)
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const el = root.current
    const target = el.querySelector('.ava__parallax')
    const toX = gsap.quickTo(target, 'x', { duration: 0.9, ease: 'power3.out' })
    const move = (e) => toX((e.clientX / window.innerWidth - 0.5) * 36)
    el.addEventListener('pointermove', move)
    return () => el.removeEventListener('pointermove', move)
  }, [])

  const onTap = () => {
    if (prefersReducedMotion()) return
    taps.current += 1
    if (bubbleText.current) bubbleText.current.textContent = TAP_LINES[taps.current % TAP_LINES.length]
    gsap.fromTo(bubble.current, { scale: 0.75 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' })
    gsap
      .timeline()
      .to(figure.current, { scaleY: 0.9, scaleX: 1.06, duration: 0.12, ease: 'power2.in' })
      .to(figure.current, { scaleY: 1, scaleX: 1, y: -55, duration: 0.3, ease: 'power2.out' })
      .to(figure.current, { y: 0, duration: 0.55, ease: 'bounce.out' })
  }

  return (
    <section className="ava" ref={root} aria-label="A little hello from Takwa">
      <div className="ava__spot" aria-hidden="true" />
      <div className="ava__marquee" aria-hidden="true">
        <div className="ava__marquee-inner">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i}>Hello ✱ Hello ✱&nbsp;</span>
          ))}
        </div>
      </div>

      <div className="ava__head">
        <span className="ava__idx">[ 03 ]</span>
        <span>Behind the code</span>
        <span className="muted">Scroll — she reacts · tap her</span>
      </div>

      <ol className="ava__steps" aria-hidden="true">
        {POSES.map((p, i) => (
          <li key={p.step} className={i === step ? 'is-active' : i < step ? 'is-done' : ''}>
            <span className="ava__step-num">0{i + 1}</span>
            {p.step}
          </li>
        ))}
      </ol>

      <div className="ava__word" aria-hidden="true">
        <span ref={word}>{POSES[0].word}</span>
      </div>

      <div className="ava__stage">
        <div className="ava__bubble" ref={bubble} aria-live="polite">
          <span ref={bubbleText}>{site.avatarLines[0]}</span>
        </div>
        <div className="ava__parallax">
          <button type="button" className="ava__tap" onClick={onTap} data-cursor="Tap me" aria-label="Make Takwa jump">
            <div className="ava__bob" ref={bob}>
              <div className="ava__breathe">
                <div className="ava__figure" ref={figure}>
                  {POSES.map((p) => (
                    <img key={p.word} src={p.src} alt="" width="400" height="760" decoding="async" draggable="false" />
                  ))}
                </div>
              </div>
            </div>
          </button>
          <div className="ava__shadow" ref={shadow} aria-hidden="true" />
        </div>
      </div>

      <div className="ava__bar" aria-hidden="true">
        <span className="ava__bar-fill" />
      </div>
    </section>
  )
}
