import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Reveal } from './Reveal'

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('text-gradient text-sm font-semibold tracking-[0.18em] uppercase', className)}>{children}</p>
  )
}

export function SectionHeading({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <Reveal className="max-w-3xl">
      <Eyebrow>{label}</Eyebrow>
      <h2 className="mt-4 text-[clamp(2.4rem,7vw,4.75rem)] leading-[0.98] font-semibold tracking-[-0.045em]">{title}</h2>
      {subtitle && <p className="text-muted mt-5 max-w-xl text-lg leading-relaxed text-pretty">{subtitle}</p>}
    </Reveal>
  )
}
