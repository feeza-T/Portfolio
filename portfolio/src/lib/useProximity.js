import { useEffect } from 'react'
import { gsap, prefersReducedMotion } from './scroll'

/**
 * Letters (or words) swell as the cursor gets close, then settle back.
 * `enabled` lets callers wait until their intro animation has finished.
 */
export function useProximity(scopeRef, selector, { enabled = true, radius = 200, scale = 0.32 } = {}) {
  useEffect(() => {
    const scope = scopeRef.current
    if (!enabled || !scope || prefersReducedMotion()) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    let items = []
    let setters = []
    const collect = () => {
      items = [...scope.querySelectorAll(selector)]
      setters = items.map((el) => {
        gsap.set(el, { transformOrigin: '50% 100%' })
        return gsap.quickTo(el, 'scaleY', { duration: 0.45, ease: 'power3.out' })
      })
    }
    collect()

    let frame = 0
    const onMove = (e) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        items.forEach((el, i) => {
          const r = el.getBoundingClientRect()
          const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2))
          setters[i](1 + scale * Math.max(0, 1 - d / radius))
        })
      })
    }
    const onLeave = () => setters.forEach((s) => s(1))

    scope.addEventListener('pointermove', onMove)
    scope.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      scope.removeEventListener('pointermove', onMove)
      scope.removeEventListener('pointerleave', onLeave)
    }
  }, [scopeRef, selector, enabled, radius, scale])
}
