import { AnimatePresence, MotionConfig } from 'framer-motion'
import { lazy, Suspense, useCallback, useState } from 'react'
import { ErrorBoundary } from './components/primitives/ErrorBoundary'
import { Cursor } from './components/layout/Cursor'
import { Footer } from './components/layout/Footer'
import { Intro } from './components/layout/Intro'
import { Navbar } from './components/layout/Navbar'
import { ScrollProgress } from './components/layout/ScrollProgress'
import { About } from './components/sections/About'
import { Contact } from './components/sections/Contact'
import { Certificates } from './components/sections/Certificates'
import { GitHubStrip } from './components/sections/GitHubStrip'
import { Hero } from './components/sections/Hero'
import { Journey } from './components/sections/Journey'
import { Projects } from './components/sections/Projects'
import { Skills } from './components/sections/Skills'
import { prefersReducedMotion } from './lib/hooks'
import { useContent } from './lib/useContent'

const INTRO_KEY = 'intro-seen'
const AdminPage = lazy(() => import('./components/admin/AdminPage'))

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
  if (window.location.pathname.replace(/\/+$/, '') === '/admin') {
    return (
      <Suspense fallback={<main className="bg-bg text-fg min-h-screen p-6">Loading editor…</main>}>
        <ErrorBoundary name="admin editor" fallback={<main role="alert" className="bg-bg text-fg min-h-screen p-6">The editor hit an error. Reload the page to continue.</main>}>
          <AdminPage />
        </ErrorBoundary>
      </Suspense>
    )
  }
  return <PublicApp />
}

function PublicApp() {
  const [ready, setReady] = useState(shouldSkipIntro)
  const content = useContent()

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
        <ErrorBoundary name="home"><Hero ready={ready} /></ErrorBoundary>
        <ErrorBoundary name="about"><About /></ErrorBoundary>
        <ErrorBoundary name="skills"><Skills /></ErrorBoundary>
        <ErrorBoundary name="projects"><Projects /></ErrorBoundary>
        <ErrorBoundary name="certificates"><Certificates /></ErrorBoundary>
        <ErrorBoundary name="journey"><Journey /></ErrorBoundary>
        <ErrorBoundary name="GitHub"><GitHubStrip /></ErrorBoundary>
        <ErrorBoundary name="contact"><Contact /></ErrorBoundary>
      </main>
      <ErrorBoundary name="footer"><Footer /></ErrorBoundary>
    </MotionConfig>
  )
}
