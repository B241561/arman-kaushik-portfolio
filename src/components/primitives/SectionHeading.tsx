import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { useContent } from '../../lib/useContent'
import { Reveal } from './Reveal'

/** "03" for the third nav item, so section numbers always follow the nav order. */
export function useSectionNumber(id: string) {
  const { nav } = useContent()
  const index = nav.items.findIndex((item) => item.id === id)
  return index < 0 ? '' : String(index + 1).padStart(2, '0')
}

/** Mono section marker: "01 — About". */
export function SectionLabel({ id, label, className }: { id?: string; label: string; className?: string }) {
  const number = useSectionNumber(id ?? '')
  return (
    <p className={cn('label-mono flex items-center gap-2', className)}>
      {number && <span className="text-accent">{number}</span>}
      {number && <span aria-hidden>—</span>}
      <span>{label}</span>
    </p>
  )
}

const sizes = {
  lg: 'text-[clamp(2.5rem,6.5vw,4.5rem)] leading-[1] tracking-[-0.025em]',
  md: 'text-[clamp(2rem,4.5vw,3rem)] leading-[1.05] tracking-[-0.02em]',
  sm: 'text-[clamp(1.6rem,3.2vw,2.25rem)] leading-[1.1] tracking-[-0.015em]',
}

/**
 * Section opener: hairline rule, mono number in a narrow left column, serif title on the right.
 * Sizes differ per section so the page doesn't repeat one heading shape.
 */
export function SectionHeading({
  id,
  label,
  title,
  subtitle,
  size = 'md',
  aside,
}: {
  id?: string
  label: string
  title?: string
  subtitle?: string
  size?: keyof typeof sizes
  aside?: ReactNode
}) {
  return (
    <Reveal className="grid gap-4 border-t border-line pt-6 md:grid-cols-12 md:gap-8">
      <SectionLabel id={id} label={label} className="md:col-span-3 md:pt-2" />
      {(title || subtitle) && (
        <div className="md:col-span-9">
          {title && <h2 className={cn('font-sans font-medium tracking-[-0.02em]', sizes[size])}>{title}</h2>}
          {subtitle && <p className="text-muted mt-4 max-w-[52ch] text-lg leading-relaxed text-pretty">{subtitle}</p>}
          {aside}
        </div>
      )}
    </Reveal>
  )
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('label-mono', className)}>{children}</p>
}
