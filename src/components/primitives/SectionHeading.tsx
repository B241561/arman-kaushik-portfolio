import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Reveal } from './Reveal'

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('text-fg text-sm font-bold tracking-[0.12em] uppercase', className)}>{children}</p>
  )
}

export function SectionHeading({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <Reveal className="max-w-3xl">
      <Eyebrow>{label}</Eyebrow>
      <h2 className="mt-3 text-[clamp(1.75rem,4vw,2.5rem)] leading-tight font-bold tracking-[-0.01em]">{title}</h2>
      {subtitle && <p className="text-muted mt-5 max-w-xl text-lg leading-relaxed text-pretty">{subtitle}</p>}
    </Reveal>
  )
}
