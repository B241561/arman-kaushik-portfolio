import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { ArrowUpRight, Play } from 'lucide-react'
import { useRef, type PointerEvent } from 'react'
import { getYouTubeVideoId, type Project } from '../../data/schema'
import { cn } from '../../lib/cn'
import { useFinePointer } from '../../lib/hooks'
import { springLayout } from '../../lib/motion'
import { useContent } from '../../lib/useContent'
import { ProjectArt } from './ProjectArt'

const MAX_TILT = 8

/** Bento tile: 3D tilt toward the cursor + spotlight. Shares a layoutId with the modal. */
export function ProjectCard({ project, onOpen, className }: { project: Project; onOpen: () => void; className?: string }) {
  const { ui } = useContent()
  const hasDemoVideo = project.links.some(
    (link) => link.kind === 'demo' && getYouTubeVideoId(link.href) !== null,
  )
  const fine = useFinePointer()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLButtonElement>(null)
  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })

  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    el.style.setProperty('--mx', `${px * 100}%`)
    el.style.setProperty('--my', `${py * 100}%`)
    if (!fine || reduce) return
    rotateY.set((px - 0.5) * MAX_TILT * 2)
    rotateX.set((0.5 - py) * MAX_TILT * 2)
  }
  const onLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.div
      layoutId={`project-${project.id}`}
      transition={springLayout}
      style={{ borderRadius: 28 }}
      className={cn('relative [perspective:1200px]', className)}
    >
      <motion.button
        ref={ref}
        type="button"
        onClick={onOpen}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        whileTap={{ scale: 0.98 }}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        aria-haspopup="dialog"
        aria-label={`${ui.openProject}: ${project.title}`}
        className="glass spotlight group flex h-full w-full flex-col overflow-hidden rounded-[28px] text-left"
      >
        <div className="relative aspect-video w-full shrink-0 overflow-hidden">
          <ProjectArt project={project} large={project.featured} />
          {hasDemoVideo && (
            <span className="glass-strong absolute top-3 left-3 z-[2] inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium">
              <Play aria-hidden className="size-3 fill-current" />
              Demo
            </span>
          )}
        </div>
        <div className="relative z-[2] flex flex-1 flex-col gap-3 p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-subtle text-xs font-semibold tracking-[0.18em] tabular-nums">{project.index}</p>
              <h3
                className={cn(
                  'mt-2 font-semibold tracking-[-0.035em]',
                  project.featured ? 'text-3xl sm:text-4xl' : 'text-2xl',
                )}
              >
                {project.title}
              </h3>
            </div>
            <span className="bg-fg/[0.06] grid size-10 shrink-0 place-items-center rounded-full border border-[var(--line)] transition-transform duration-500 ease-[var(--ease-apple)] group-hover:rotate-45">
              <ArrowUpRight className="size-[18px]" />
            </span>
          </div>
          <p className="text-muted text-[15px] leading-relaxed">{project.featured ? project.summary : project.tagline}</p>
          {project.tags.length > 0 && <ul className="mt-1 flex flex-wrap gap-1.5">
            {project.tags.slice(0, project.featured ? 4 : 3).map((tag, i) => (
              <li key={`${i}-${tag}`} className="bg-fg/[0.05] text-fg/80 rounded-full border border-[var(--line)] px-3 py-1 text-xs font-medium">
                {tag}
              </li>
            ))}
          </ul>}
        </div>
      </motion.button>
    </motion.div>
  )
}
