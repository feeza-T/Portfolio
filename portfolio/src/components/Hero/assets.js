import portraitPolka from '../../assets/portrait-polka.jpg'
import portraitSaree from '../../assets/portrait-saree.jpg'
import { prefersReducedMotion, supportsWebGL } from '../../lib/scroll'

// The polka-dot photo matches the avatar's dress, so she looks like she
// steps out of it. Swap to `portraitSaree` here if you prefer that photo.
export const portrait = portraitPolka
export { portraitSaree }

// Three.js lives in its own chunk; the loader waits for it so the hero
// never pops in half-built.
export const loadCanvas = () => import('./HeroCanvas')

export const heroAssets = [
  portrait,
  () => (supportsWebGL() && !prefersReducedMotion() ? loadCanvas() : null),
]
