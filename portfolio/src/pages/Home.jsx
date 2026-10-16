import Hero from '../components/Hero/Hero'
import Skills from '../components/Skills/Skills'
import AvatarScene from '../components/Avatar/AvatarScene'
import Projects from '../components/Projects/Projects'
import About from '../components/About/About'
import Beyond from '../components/Beyond/Beyond'

// Home: hero → toolkit → avatar scene → selected work → about → beyond code.
// The footer (contact) is added for every page in App.jsx.
export default function Home({ play }) {
  return (
    <main>
      <Hero play={play} />
      <Skills />
      <AvatarScene />
      <Projects />
      <About />
      <Beyond />
    </main>
  )
}
