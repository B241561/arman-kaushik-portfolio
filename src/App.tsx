import { AnimatePresence, MotionConfig } from 'framer-motion'
import { useCallback, useState } from 'react'
import { Cursor } from './components/layout/Cursor'
import { Footer } from './components/layout/Footer'
import { Intro } from './components/layout/Intro'
import { Navbar } from './components/layout/Navbar'
import { ScrollProgress } from './components/layout/ScrollProgress'
import { About } from './components/sections/About'
import { Contact } from './components/sections/Contact'
import { GitHubStrip } from './components/sections/GitHubStrip'
import { Hero } from './components/sections/Hero'
import { Journey } from './components/sections/Journey'
import { Projects } from './components/sections/Projects'
import { Skills } from './components/sections/Skills'
import { content } from './data/content'
import { prefersReducedMotion } from './lib/hooks'

const INTRO_KEY = 'intro-seen'

/** Intro plays once per session and never for reduced-motion users. */
function shouldSkipIntro() {
  if (prefersReducedMotion()) return true
  try {
    return sessionStorage.getItem(INTRO_KEY) === '1'
  } catch {
    return false
  }
}

export default function App() {
  const [ready, setReady] = useState(shouldSkipIntro)

  const finishIntro = useCallback(() => {
    setReady(true)
    try {
      sessionStorage.setItem(INTRO_KEY, '1')
    } catch {
      /* storage unavailable */
    }
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="bg-fg text-bg sr-only z-[400] rounded-full px-4 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        {content.ui.skipToContent}
      </a>

      <AnimatePresence>{!ready && <Intro key="intro" onFinish={finishIntro} />}</AnimatePresence>

      <ScrollProgress />
      <Cursor />
      <Navbar ready={ready} />

      <main id="main">
        <Hero ready={ready} />
        <About />
        <Skills />
        <Projects />
        <Journey />
        <GitHubStrip />
        <Contact />
      </main>
      <Footer />
    </MotionConfig>
  )
}
