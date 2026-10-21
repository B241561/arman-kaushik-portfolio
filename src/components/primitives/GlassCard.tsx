import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  strong?: boolean
  padded?: boolean
}

/** Flat surface with a subtle border and consistent card spacing. */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(function GlassCard(
  { strong = false, padded = true, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('relative rounded-card shadow-[var(--shadow-card)]', strong ? 'glass-strong' : 'glass', padded && 'p-5 sm:p-6', className)}
      {...rest}
    />
  )
})
