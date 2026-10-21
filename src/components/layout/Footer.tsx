import { ArrowUp } from 'lucide-react'
import { useScrollTo } from '../../lib/lenis'
import { useContent } from '../../lib/useContent'

export function Footer() {
  const { footer, person, nav } = useContent()
  const scrollTo = useScrollTo()
  return (
    <footer className="border-t border-line py-10 sm:py-14">
      <div className="container-x">
        <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-sans text-xl">{footer.tagline}</p>
            <ul className="text-muted mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {nav.items.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => scrollTo(`#${item.id}`)} className="hover:text-accent">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={() => scrollTo(0)}
            className="link-accent inline-flex items-center gap-2 self-start text-sm font-medium sm:self-auto"
          >
            {footer.backToTop}
            <ArrowUp aria-hidden className="size-4" />
          </button>
        </div>
        <p className="text-subtle mt-10 text-xs">© {new Date().getFullYear()} {person.name}</p>
      </div>
    </footer>
  )
}
