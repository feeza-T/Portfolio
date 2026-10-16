import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/scroll'
import './Cursor.css'

// Gold dot + trailing ring. Grows over links; shows a label over [data-cursor].
export default function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)
  const label = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    document.documentElement.classList.add('has-cursor')
    gsap.set([dot.current, ring.current], { xPercent: -50, yPercent: -50 })

    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.12, ease: 'power3.out' })
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.12, ease: 'power3.out' })
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.55, ease: 'power3.out' })
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.55, ease: 'power3.out' })

    const move = (e) => {
      dx(e.clientX)
      dy(e.clientY)
      rx(e.clientX)
      ry(e.clientY)
      ring.current.classList.remove('is-out')
      dot.current.classList.remove('is-out')
    }
    const over = (e) => {
      const tagged = e.target.closest('[data-cursor]')
      const link = e.target.closest('a, button')
      ring.current.classList.toggle('is-link', !!link && !tagged)
      ring.current.classList.toggle('is-label', !!tagged)
      label.current.textContent = tagged?.dataset.cursor ?? ''
    }
    const out = () => {
      ring.current.classList.add('is-out')
      dot.current.classList.add('is-out')
    }

    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerover', over)
    document.documentElement.addEventListener('pointerleave', out)
    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', over)
      document.documentElement.removeEventListener('pointerleave', out)
    }
  }, [])

  return (
    <div className="cursor" aria-hidden="true">
      <div ref={ring} className="cursor__ring is-out">
        <span ref={label} className="cursor__label" />
      </div>
      <div ref={dot} className="cursor__dot is-out" />
    </div>
  )
}
