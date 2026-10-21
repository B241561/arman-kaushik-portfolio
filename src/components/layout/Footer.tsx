import { ArrowUp } from 'lucide-react'
import { useScrollTo } from '../../lib/lenis'
import { useContent } from '../../lib/useContent'

export function Footer() {
  const { footer, person, nav } = useContent()
  const scrollTo = useScrollTo()
  return (
    <footer className="relative overflow-hidden border-t border-[var(--line)] pt-20 pb-10">
      <div className="container-x">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-lg font-medium tracking-tight">{footer.tagline}</p>
            <ul className="text-muted mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {nav.items.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => scrollTo(`#${item.id}`)} className="hover:text-fg transition-colors">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={() => scrollTo(0)}
            className="group inline-flex items-center gap-3 rounded-full border border-line py-2 pr-5 pl-2 text-sm font-medium"
          >
              <span className="bg-fg text-bg grid size-9 place-items-center rounded-full transition-transform duration-500 ease-[var(--ease-apple)] group-hover:-translate-y-0.5">
                <ArrowUp className="size-4" />
              </span>
              {footer.backToTop}
          </button>
        </div>

        <p
          aria-hidden
          className="text-fg/[0.07] mt-20 text-center text-[clamp(2.5rem,11.5vw,11rem)] leading-[0.9] font-semibold tracking-[-0.06em] select-none"
        >
          {person.name}
        </p>

        <div className="text-subtle mt-10 flex flex-col gap-2 text-xs sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {person.name}
          </p>
        </div>
      </div>
    </footer>
  )
}
