import { useEffect, useRef, useState } from 'react'
import { gsap, lockScroll, prefersReducedMotion } from '../../lib/scroll'
import { site } from '../../config/site'
import './Loader.css'

const RADIUS = 54
const CIRC = 2 * Math.PI * RADIUS
const MIN_DURATION = 1600 // ms — keeps the intro readable even on a warm cache
const SAFETY_TIMEOUT = 7000 // ms — never trap a visitor behind a stuck asset
const SEEN_KEY = 'tj-intro-seen'

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = img.onerror = () => resolve()
    img.src = src
    img.decode?.().then(resolve, resolve)
  })
}

const labelFor = (p) =>
  p >= 100 ? 'Ready' : p >= 35 ? 'Loading assets' : 'Initializing'

/**
 * Full-screen intro. Progress follows real work (fonts + images),
 * eased so the number never jumps. Shown once per browser session.
 */
export default function Loader({ assets = [], onExitStart, onComplete }) {
  const [skip] = useState(() => {
    if (prefersReducedMotion()) return true
    try {
      return sessionStorage.getItem(SEEN_KEY) === '1'
    } catch {
      return false
    }
  })
  const [done, setDone] = useState(skip)

  const root = useRef(null)
  const counter = useRef(null)
  const ring = useRef(null)
  const label = useRef(null)
  const count = useRef(null)

  useEffect(() => {
    if (skip) {
      onExitStart?.()
      onComplete?.()
      return
    }

    lockScroll(true)
    let completed = 0
    const tasks = [
      document.fonts?.ready ?? Promise.resolve(),
      ...assets.map((a) => (typeof a === 'function' ? Promise.resolve(a()).catch(() => {}) : preloadImage(a))),
    ]
    const total = tasks.length
    const state = { real: 0, shown: 0, finished: false }
    const start = performance.now()

    tasks.forEach((t) =>
      Promise.resolve(t).then(() => {
        completed += 1
        state.real = (completed / total) * 100
        if (count.current) count.current.textContent = `${completed}/${total}`
      }),
    )
    const safety = setTimeout(() => (state.real = 100), SAFETY_TIMEOUT)
    if (count.current) count.current.textContent = `0/${total}`

    const render = () => {
      const timeCap = ((performance.now() - start) / MIN_DURATION) * 100
      const target = Math.min(state.real, timeCap, 100)
      state.shown += (target - state.shown) * 0.09
      if (target === 100 && state.shown > 99.4) state.shown = 100

      const v = Math.floor(state.shown)
      if (counter.current) counter.current.textContent = v === 100 ? '100' : String(v).padStart(2, '0')
      if (ring.current) ring.current.style.strokeDashoffset = CIRC * (1 - state.shown / 100)
      if (label.current) label.current.textContent = labelFor(v)

      if (state.shown === 100 && !state.finished) {
        state.finished = true
        gsap.ticker.remove(render)
        exit()
      }
    }

    const exit = () => {
      const q = gsap.utils.selector(root)
      gsap
        .timeline({ delay: 0.25 })
        .to(q('.loader__meta, .loader__ticks'), { autoAlpha: 0, duration: 0.35, ease: 'power2.out' })
        .to(q('.loader__counter-inner'), { yPercent: -110, duration: 0.6, ease: 'expo.in' }, 0)
        .to(q('.loader__ring'), { scale: 0.4, rotate: 120, autoAlpha: 0, duration: 0.7, ease: 'expo.in' }, 0.05)
        .add(() => onExitStart?.(), 0.55)
        .to(q('.loader__panel--black'), { yPercent: -100, duration: 1.05, ease: 'expo.inOut' }, 0.6)
        .to(q('.loader__panel--red'), { yPercent: -100, duration: 1.05, ease: 'expo.inOut' }, 0.72)
        .add(() => {
          try {
            sessionStorage.setItem(SEEN_KEY, '1')
          } catch {
            /* private mode — fine */
          }
          setDone(true)
          onComplete?.()
        })
    }

    gsap.ticker.add(render)
    return () => {
      gsap.ticker.remove(render)
      clearTimeout(safety)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (done) return null

  return (
    <div className="loader" ref={root} role="status" aria-live="polite" aria-label="Loading portfolio">
      <div className="loader__panel loader__panel--red" />
      <div className="loader__panel loader__panel--black">
        <div className="loader__meta loader__meta--tl">
          <span className="loader__star">✱</span> {site.firstName} {site.lastName}
        </div>
        <div className="loader__meta loader__meta--tr">
          Portfolio <span className="loader__dim">—</span> Edition 2026
        </div>

        <div className="loader__center">
          <svg className="loader__ring" viewBox="0 0 140 140" aria-hidden="true">
            <g className="loader__ticks">
              {Array.from({ length: 24 }, (_, i) => (
                <line
                  key={i}
                  x1="70"
                  y1="4"
                  x2="70"
                  y2={i % 6 === 0 ? 11 : 8}
                  transform={`rotate(${i * 15} 70 70)`}
                />
              ))}
            </g>
            <circle className="loader__track" cx="70" cy="70" r={RADIUS} />
            <circle
              ref={ring}
              className="loader__progress"
              cx="70"
              cy="70"
              r={RADIUS}
              transform="rotate(-90 70 70)"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC}
            />
          </svg>
          <div className="loader__counter">
            <div className="loader__counter-inner">
              <span ref={counter}>00</span>
              <sup>%</sup>
            </div>
          </div>
        </div>

        <div className="loader__meta loader__meta--bl">
          <span className="loader__blink" aria-hidden="true" />
          <span ref={label}>Initializing</span>
        </div>
        <div className="loader__meta loader__meta--br">
          [ Assets <span ref={count} className="loader__gold">0/0</span> ]
        </div>
      </div>
    </div>
  )
}
