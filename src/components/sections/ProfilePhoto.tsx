import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { useRef, type PointerEvent } from 'react'
import { cn } from '../../lib/cn'
import { isPlaceholder } from '../../lib/placeholder'
import { useContent } from '../../lib/useContent'
import { LazyImage } from '../primitives/LazyImage'
import { Reveal } from '../primitives/Reveal'

const MAX_TILT = 6

/**
 * Large themed profile photo container with a glow, 3D tilt,
 * and a status badge. Falls back to abstract artwork if no photo is set.
 */
export function ProfilePhoto() {
  const content = useContent()
  const { person, about } = content
  const fine = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!fine || reduce) return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    rotateY.set((px - 0.5) * MAX_TILT * 2)
    rotateX.set((0.5 - py) * MAX_TILT * 2)
  }

  const onLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  const hasPhoto = !isPlaceholder(person.photo.src)

  return (
    <Reveal delay={0.2}>
      <div className="relative [perspective:1200px]">
        {/* Ambient Glow */}
        <div
          aria-hidden
          className="bg-accent-gradient absolute -inset-4 z-0 opacity-20 blur-3xl transition-opacity group-hover:opacity-30"
        />

        <motion.div
          ref={ref}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d', borderRadius: 28 }}
          className="bg-elevated border-line relative z-10 aspect-[4/5] w-full overflow-hidden border shadow-2xl"
        >
          {hasPhoto ? (
            <LazyImage
              src={person.photo.src}
              alt={person.photo.alt}
              width={640}
              height={800}
              className="absolute inset-0 size-full object-cover object-top"
            />
          ) : (
            <div className="absolute inset-0 overflow-hidden">
              <div aria-hidden className="from-accent/50 via-accent-2/25 absolute inset-0 bg-radial-[at_30%_20%] to-transparent" />
              <div
                aria-hidden
                className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] bg-[linear-gradient(to_right,var(--line)_1px,transparent_1px),linear-gradient(to_bottom,var(--line)_1px,transparent_1px)] bg-[size:32px_32px]"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                {[0, 1, 2].map((ring) => (
                  <span
                    key={ring}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--line)]"
                    style={{ width: 160 + ring * 80, height: 160 + ring * 80 }}
                  />
                ))}
                <span className="bg-accent-gradient relative grid size-32 place-items-center rounded-3xl text-4xl font-bold text-white shadow-2xl">
                  {person.initials}
                </span>
              </div>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute inset-x-4 bottom-4 z-20">
            <div className="glass-strong flex items-center gap-3 rounded-2xl p-3 shadow-lg">
              <span className="relative flex size-2.5 shrink-0">
                <span className="bg-accent absolute inline-flex size-full animate-ping rounded-full opacity-75" />
                <span className="bg-accent relative inline-flex size-2.5 rounded-full" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight">{person.name}</p>
                <p className="text-subtle truncate text-xs">{person.college}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Reveal>
  )
}
