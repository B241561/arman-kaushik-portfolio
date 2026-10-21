import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { useRef, type PointerEvent, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { useFinePointer } from '../../lib/hooks'

/** Pulls its child toward the cursor on desktop; inert on touch / reduced motion. */
export function Magnetic({ children, strength = 0.3, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const fine = useFinePointer()
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 })

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!fine || reduce || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div ref={ref} onPointerMove={onMove} onPointerLeave={reset} style={{ x: sx, y: sy }} className={cn('inline-flex', className)}>
      {children}
    </motion.div>
  )
}
