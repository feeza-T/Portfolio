import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from '../../lib/scroll'
import { fullscreenVertex, smokeFragment } from './shaders'

const CANVAS_PROPS = {
  dpr: [1, 1.5],
  flat: true,
  linear: true,
  gl: { antialias: false, alpha: false, powerPreference: 'high-performance' },
}

// Pause rendering when the canvas is off screen.
function useInView(ref) {
  const [inView, setInView] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
  return inView
}

// Per-frame uniform updates.
function tick(material, size, dt, mouse, mouseEase) {
  const u = material?.uniforms
  if (!u) return
  u.uTime.value += dt
  u.uRes.value.set(size.width, size.height)
  u.uMouse.value.lerp(mouse, mouseEase)
}

/* ---------------- Background smoke ---------------- */

// R3F copies the `uniforms` prop onto the material, so every update below goes
// through the material ref rather than the object we pass in.
const smokeUniforms = () => ({
  uTime: { value: 0 },
  uIntro: { value: 0 },
  uRes: { value: new THREE.Vector2(1, 1) },
  uMouse: { value: new THREE.Vector2(0.5, 0.5) },
  uFocus: { value: new THREE.Vector2(0.7, 0.45) },
})

function Smoke({ play, focus }) {
  const mat = useRef(null)
  const mouse = useRef(new THREE.Vector2(0.5, 0.5))
  const [uniforms] = useState(smokeUniforms)

  useEffect(() => {
    const onMove = (e) => mouse.current.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight)
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useEffect(() => {
    const u = mat.current?.uniforms
    if (play && u) gsap.to(u.uIntro, { value: 1, duration: 2.2, ease: 'power2.out', delay: 0.2 })
  }, [play])

  useEffect(() => {
    const u = mat.current?.uniforms
    if (focus && u) u.uFocus.value.set(focus[0], focus[1])
  }, [focus])

  useFrame((state, dt) => tick(mat.current, state.size, dt, mouse.current, 0.04))

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={fullscreenVertex}
        fragmentShader={smokeFragment}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  )
}

export function SmokeCanvas({ play, focus }) {
  const wrap = useRef(null)
  const inView = useInView(wrap)
  return (
    <div ref={wrap} className="hero__bg" aria-hidden="true">
      {/* Smoke is soft by nature, so it renders at reduced resolution. */}
      <Canvas {...CANVAS_PROPS} dpr={0.6} frameloop={inView ? 'always' : 'never'}>
        <Smoke play={play} focus={focus} />
      </Canvas>
    </div>
  )
}
