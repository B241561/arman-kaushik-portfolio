import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '../../lib/cn'
import { useActiveSection } from '../../lib/hooks'
import { useScrollTo } from '../../lib/lenis'
import { useContent } from '../../lib/useContent'
import { ThemeToggle } from './ThemeToggle'

/** Plain static top bar: name on the left, text links on the right, 1px bottom border. */
export function Navbar(_props: { ready: boolean }) {
  const { nav, person } = useContent()
  const sectionIds = ['home', ...nav.items.map((i) => i.id)]
  const active = useActiveSection(sectionIds)
  const scrollTo = useScrollTo()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (id: string) => {
    setOpen(false)
    scrollTo(`#${id}`)
  }

  return (
    <header className="bg-bg border-b border-[var(--line)]">
      <nav aria-label="Primary" className="container-x flex h-14 items-center gap-4">
        <button type="button" onClick={() => go('home')} aria-label={nav.homeLabel} className="text-fg shrink-0 text-[15px] font-bold">
          {person.name}
        </button>

        <ul className="ml-auto hidden items-center gap-7 md:flex">
          {nav.items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => go(item.id)}
                aria-current={active === item.id ? 'true' : undefined}
                className={cn(
                  'text-fg text-sm hover:underline hover:underline-offset-4',
                  active === item.id ? 'font-bold' : 'font-normal',
                )}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <ThemeToggle />

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? nav.closeMenu : nav.openMenu}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="text-fg grid size-9 place-items-center rounded-[9px] md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <ul id="mobile-nav" className="container-x border-t border-[var(--line)] py-2 md:hidden">
          {nav.items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => go(item.id)}
                className={cn('text-fg block w-full py-3 text-left text-base', active === item.id ? 'font-bold' : 'font-normal')}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}
