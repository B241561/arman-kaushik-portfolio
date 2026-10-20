import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  strong?: boolean
  padded?: boolean
}

/** Frosted surface: backdrop blur, 1px hairline border, 28px radius. */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(function GlassCard(
  { strong = false, padded = true, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('relative rounded-[28px]', strong ? 'glass-strong' : 'glass', padded && 'p-6 sm:p-8', className)}
      {...rest}
    />
  )
})
