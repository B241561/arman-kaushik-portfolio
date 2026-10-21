import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import { easeApple, spring } from '../../lib/motion'

type RevealProps = HTMLMotionProps<'div'> & {
  delay?: number
  /** Distance in px the element rises from. */
  y?: number
  once?: boolean
}

/** Fades and springs content up when it scrolls into view. */
export function Reveal({ delay = 0, y = 28, once = true, children, ...rest }: RevealProps) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once, margin: '0px 0px -10% 0px' }}
      transition={{
        ...spring,
        delay,
        opacity: { duration: 0.6, delay, ease: easeApple },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
