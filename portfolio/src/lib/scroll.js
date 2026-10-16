import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, SplitText)

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

let lenis = null

// Smooth scroll driven by GSAP's ticker so ScrollTrigger and Lenis stay in sync.
export function initLenis() {
  if (lenis || prefersReducedMotion()) return lenis
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 })
  lenis.on('scroll', ScrollTrigger.update)
  const raf = (time) => lenis?.raf(time * 1000)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)
  lenis._gsapRaf = raf
  return lenis
}

export function destroyLenis() {
  if (!lenis) return
  gsap.ticker.remove(lenis._gsapRaf)
  lenis.destroy()
  lenis = null
}

export const getLenis = () => lenis

export function lockScroll(locked) {
  document.documentElement.classList.toggle('is-locked', locked)
  if (locked) lenis?.stop()
  else lenis?.start()
}

export function scrollToTarget(href) {
  const el = href === '#home' || href === '#top' ? 0 : document.querySelector(href)
  if (el === null) return
  if (lenis) lenis.scrollTo(el, { duration: 1.4 })
  else if (el === 0) window.scrollTo({ top: 0, behavior: 'smooth' })
  else el.scrollIntoView({ behavior: 'smooth' })
}

export function supportsWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export { gsap, ScrollTrigger, SplitText }
