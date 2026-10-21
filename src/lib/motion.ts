import type { Transition } from 'framer-motion'

/** One calm ease for everything: short, decelerating, no overshoot. */
export const easeOut = [0.22, 1, 0.36, 1] as const
export const fade: Transition = { duration: 0.5, ease: easeOut }
export const quick: Transition = { duration: 0.25, ease: easeOut }

// Calm tween presets kept under their previous names for existing call sites.
export const spring: Transition = fade
export const springSoft: Transition = fade
export const springSnappy: Transition = quick
export const springLayout: Transition = { duration: 0.4, ease: easeOut }
export const easeApple = easeOut
