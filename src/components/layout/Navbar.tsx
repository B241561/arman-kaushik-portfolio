import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '../../lib/cn'
import { useActiveSection } from '../../lib/hooks'
import { useScrollLock, useScrollTo } from '../../lib/lenis'
import { spring, springSnappy } from '../../lib/motion'
import { useContent } from '../../lib/useContent'
import { ThemeToggle } from './ThemeToggle'

export function Navbar({ ready }: { ready: boolean }) {
  const { nav, person } = useContent()
  const sectionIds = ['home', ...nav.items.map((i) => i.id)]
  const active = useActiveSection(sectionIds)
  const scrollTo = useScrollTo()
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 48))
  useScrollLock(open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (id: string) => {
    setOpen(false)
    // Let the sheet start closing (and scroll unlock) before scrolling.
    window.setTimeout(() => scrollTo(`#${id}`), open ? 60 : 0)
  }

  return (
    <>
      <motion.header
        initial={{ y: -90, opacity: 0 }}
        animate={ready ? { y: 0, opacity: 1 } : undefined}
        transition={{ ...spring, delay: 0.15 }}
        className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3"
      >
        <motion.nav
          aria-label="Primary"
          animate={{
            marginTop: scrolled ? 10 : 18,
            paddingTop: scrolled ? 5 : 7,
            paddingBottom: scrolled ? 5 : 7,
            paddingLeft: scrolled ? 5 : 7,
            paddingRight: scrolled ? 5 : 7,
          }}
          transition={spring}
          className="pointer-events-auto flex w-full max-w-max items-center gap-1 rounded-full border border-line bg-bg shadow-soft"
        >
          <button
            type="button"
            onClick={() => go('home')}
            aria-label={nav.homeLabel}
            className="bg-fg text-bg grid size-9 shrink-0 place-items-center rounded-full text-[13px] font-semibold tracking-tight"
          >
            {person.initials}
          </button>

          <ul className="mx-1 hidden items-center md:flex">
            {nav.items.map((item) => {
              const isActive = active === item.id
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => go(item.id)}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'relative rounded-full px-4 py-2 text-sm font-medium transition-colors',
                      isActive ? 'text-fg' : 'text-muted hover:text-fg',
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        transition={springSnappy}
                        className="bg-fg/10 absolute inset-0 rounded-full"
                      />
                    )}
                    <span className="relative">{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>

          <span className="mx-1 hidden h-5 w-px bg-[var(--line)] md:block" aria-hidden />
          <span className="flex-1 md:hidden" />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={nav.openMenu}
            aria-expanded={open}
            className="text-fg/80 hover:bg-fg/10 grid size-9 shrink-0 place-items-center rounded-full md:hidden"
          >
            <Menu className="size-[18px]" />
          </button>
        </motion.nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden"
            />
            <motion.div
              key="sheet"
              role="dialog"
              aria-modal="true"
              aria-label={nav.menuTitle}
              initial={{ opacity: 0, y: -24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={spring}
              className="rounded-card fixed inset-x-3 top-3 z-[61] origin-top border border-line bg-bg p-5 shadow-soft md:hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-muted text-sm font-medium">{nav.menuTitle}</span>
                <button
                  type="button"
                  autoFocus
                  onClick={() => setOpen(false)}
                  aria-label={nav.closeMenu}
                  className="hover:bg-fg/10 grid size-9 place-items-center rounded-full"
                >
                  <X className="size-[18px]" />
                </button>
              </div>
              <ul className="mt-4 flex flex-col">
                {nav.items.map((item, i) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: 0.04 + i * 0.04 }}
                  >
                    <button
                      type="button"
                      onClick={() => go(item.id)}
                      className={cn(
                        'rounded-tile flex w-full items-center justify-between px-3 py-3 text-left text-[28px] font-semibold tracking-[-0.03em]',
                        active === item.id ? 'text-fg' : 'text-muted',
                      )}
                    >
                      {item.label}
                      {active === item.id && <span className="bg-accent size-2 rounded-full" />}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
