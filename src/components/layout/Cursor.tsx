import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useFinePointer } from '../../lib/hooks'

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, [data-cursor]'

/** Dot + trailing ring. Desktop (fine pointer) only, and off for reduced motion. */
export function Cursor() {
  const fine = useFinePointer()
  const reduce = useReducedMotion()
  const enabled = fine && !reduce

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const ringX = useSpring(x, { stiffness: 260, damping: 26, mass: 0.5 })
  const ringY = useSpring(y, { stiffness: 260, damping: 26, mass: 0.5 })
  const [hovering, setHovering] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const root = document.documentElement
    root.classList.add('has-cursor')

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
      const target = e.target instanceof Element ? e.target : null
      setHovering(!!target?.closest(INTERACTIVE))
    }
    const onDown = () => setPressed(true)
    const onUp = () => setPressed(false)
    const onLeave = (e: MouseEvent) => {
      if (!e.relatedTarget) setVisible(false)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.addEventListener('mouseout', onLeave)
    return () => {
      root.classList.remove('has-cursor')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('mouseout', onLeave)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[300]">
      <motion.div
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: hovering ? 52 : 32,
          height: hovering ? 52 : 32,
          opacity: visible ? 1 : 0,
          scale: pressed ? 0.85 : 1,
        }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className={`absolute top-0 left-0 rounded-full border transition-colors duration-300 ${
          hovering ? 'border-transparent bg-fg/10' : 'border-fg/35'
        }`}
      />
      <motion.div
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
        animate={{ opacity: visible && !hovering ? 1 : 0, scale: pressed ? 0.6 : 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="bg-fg absolute top-0 left-0 size-1.5 rounded-full"
      />
    </div>
  )
}
