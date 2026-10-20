import Lenis from 'lenis'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { prefersReducedMotion, useMediaQuery } from './hooks'

const LenisContext = createContext<Lenis | null>(null)

/** Smooth scrolling via Lenis. Disabled entirely when the user prefers reduced motion. */
export function LenisProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const reduce = useMediaQuery('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    if (reduce) return
    const instance = new Lenis({ lerp: 0.1, smoothWheel: true })
    let frame = 0
    const loop = (time: number) => {
      instance.raf(time)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    setLenis(instance)
    return () => {
      cancelAnimationFrame(frame)
      instance.destroy()
      setLenis(null)
    }
  }, [reduce])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}

export const useLenis = () => useContext(LenisContext)

/** Scroll to a selector ("#projects") or a pixel offset, smoothly when allowed. */
export function useScrollTo() {
  const lenis = useLenis()
  return useCallback(
    (target: string | number) => {
      if (lenis) {
        lenis.scrollTo(target, { duration: 1.2 })
        return
      }
      const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth'
      if (typeof target === 'number') window.scrollTo({ top: target, behavior })
      else document.querySelector(target)?.scrollIntoView({ behavior, block: 'start' })
    },
    [lenis],
  )
}

/** Pause page scrolling while an overlay (menu, modal) is open. */
export function useScrollLock(locked: boolean) {
  const lenis = useLenis()
  useEffect(() => {
    if (!locked) return
    lenis?.stop()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      lenis?.start()
      document.body.style.overflow = prev
    }
  }, [locked, lenis])
}
