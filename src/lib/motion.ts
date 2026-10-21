import type { Transition } from 'framer-motion'

/** Spring presets — everything on the site moves with physics, never linear tweens. */
export const spring: Transition = { type: 'spring', stiffness: 220, damping: 28, mass: 0.9 }
export const springSoft: Transition = { type: 'spring', stiffness: 120, damping: 22, mass: 1 }
export const springSnappy: Transition = { type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }
export const springLayout: Transition = { type: 'spring', stiffness: 320, damping: 34, mass: 0.9 }

export const easeApple = [0.22, 1, 0.36, 1] as const
