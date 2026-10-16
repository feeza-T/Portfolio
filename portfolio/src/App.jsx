import { useCallback, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import Loader from './components/Loader/Loader'
import Navbar from './components/Navbar/Navbar'
import Cursor from './components/Cursor/Cursor'
import Footer from './components/Footer/Footer'
import Home from './pages/Home'
import ProjectsPage from './pages/ProjectsPage'
import { heroAssets } from './components/Hero/assets'
import { getLenis, lockScroll, scrollToTarget, ScrollTrigger } from './lib/scroll'

// On every page change: jump to the top, then to #section if the URL has one.
function useRouteScroll(play) {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    getLenis()?.scrollTo(0, { immediate: true, force: true })
    window.scrollTo(0, 0)
    const refresh = setTimeout(() => ScrollTrigger.refresh(), 120)
    let jump
    if (play && hash) jump = setTimeout(() => scrollToTarget(hash), 900)
    return () => {
      clearTimeout(refresh)
      clearTimeout(jump)
    }
  }, [pathname, hash, play])
}

export default function App() {
  // `play` flips when the loader starts wiping away — the hero animates in under it.
  const [play, setPlay] = useState(false)

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  }, [])
  useRouteScroll(play)

  const handleExitStart = useCallback(() => setPlay(true), [])
  const handleComplete = useCallback(() => {
    lockScroll(false)
    ScrollTrigger.refresh()
  }, [])

  return (
    <>
      <Loader assets={heroAssets} onExitStart={handleExitStart} onComplete={handleComplete} />
      <Navbar play={play} />
      <Routes>
        <Route path="/" element={<Home play={play} />} />
        <Route path="/projects" element={<ProjectsPage play={play} />} />
        <Route path="*" element={<Home play={play} />} />
      </Routes>
      <Footer />
      <Cursor />
      <div className="grain" aria-hidden="true" />
    </>
  )
}
