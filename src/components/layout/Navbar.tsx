import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '../../lib/cn'
import { useActiveSection } from '../../lib/hooks'
import { useScrollLock, useScrollTo } from '../../lib/lenis'
import { spring } from '../../lib/motion'
import { useContent } from '../../lib/useContent'
import { ThemeToggle } from './ThemeToggle'

export function Navbar({ ready }: { ready: boolean }) {
  const { nav, person } = useContent()
  const sectionIds = ['home', ...nav.items.map((item) => item.id)]
  const active = useActiveSection(sectionIds)
  const scrollTo = useScrollTo()
  const [open, setOpen] = useState(false)
  useScrollLock(open)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (id: string) => {
    setOpen(false)
    window.setTimeout(() => scrollTo(`#${id}`), open ? 60 : 0)
  }

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={ready ? { y: 0, opacity: 1 } : undefined}
        transition={spring}
        className="pointer-events-none fixed inset-x-0 top-0 z-50"
      >
        <motion.nav aria-label="Primary" className="container-x pointer-events-auto flex min-h-16 items-center justify-between border-b border-line bg-bg">
          <button
            type="button"
            onClick={() => go('home')}
            aria-label={nav.homeLabel}
            className="font-sans text-xl font-medium tracking-tight text-fg"
          >
            {person.initials}
          </button>

          <ul className="hidden items-center gap-5 md:flex">
            {nav.items.map((item) => {
              const isActive = active === item.id
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => go(item.id)}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'relative py-2 text-sm transition-colors hover:text-fg',
                      isActive ? 'text-accent' : 'text-muted',
                    )}
                  >
                    {item.label}
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={nav.openMenu}
              aria-expanded={open}
              className="grid size-9 place-items-center text-fg hover:text-accent md:hidden"
            >
              <Menu className="size-[18px]" />
            </button>
          </div>
        </motion.nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              key="backdrop"
              type="button"
              aria-label={nav.closeMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[60] bg-[var(--scrim)] md:hidden"
            />
            <motion.div
              key="sheet"
              role="dialog"
              aria-modal="true"
              aria-label={nav.menuTitle}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={spring}
              className="fixed inset-x-0 top-0 z-[61] border-b border-line bg-bg p-5 md:hidden"
            >
              <div className="flex items-center justify-between border-b border-line pb-4">
                <span className="text-muted text-sm font-medium">{nav.menuTitle}</span>
                <button
                  type="button"
                  autoFocus
                  onClick={() => setOpen(false)}
                  aria-label={nav.closeMenu}
                  className="grid size-9 place-items-center text-fg hover:text-accent"
                >
                  <X className="size-[18px]" />
                </button>
              </div>
              <ul className="flex flex-col py-2">
                {nav.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => go(item.id)}
                      className={cn(
                        'flex w-full items-center justify-between border-b border-line py-3 text-left font-sans text-2xl',
                        active === item.id ? 'text-accent' : 'text-fg',
                      )}
                    >
                      {item.label}
                      {active === item.id && <span aria-hidden className="size-1.5 rounded-full bg-accent" />}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
