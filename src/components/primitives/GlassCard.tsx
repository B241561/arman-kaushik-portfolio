import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  strong?: boolean
  padded?: boolean
  /** Shared lift + shadow on hover (static cards only — project cards have their own tilt). */
  hoverable?: boolean
}

/** Glass surface: translucent fill, specular sheen, 1px hairline, card radius. */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(function GlassCard(
  { strong = false, padded = true, hoverable = false, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-card relative',
        strong ? 'glass-strong' : 'glass',
        padded && 'p-6 sm:p-8',
        hoverable && 'card-hover',
        className,
      )}
      {...rest}
    />
  )
})
