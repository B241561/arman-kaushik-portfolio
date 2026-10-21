import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import { easeOut } from '../../lib/motion'

type RevealProps = HTMLMotionProps<'div'> & {
  delay?: number
  /** Distance in px the element rises from. */
  y?: number
}

/** A one-time fade and short rise when content first scrolls into view. */
export function Reveal({ delay = 0, y = 12, children, ...rest }: RevealProps) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.6, delay, ease: easeOut }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
