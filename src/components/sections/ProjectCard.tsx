import { motion } from 'framer-motion'
import { ArrowUpRight, Play } from 'lucide-react'
import { getYouTubeVideoId, type Project } from '../../data/schema'
import { cn } from '../../lib/cn'
import { springLayout } from '../../lib/motion'
import { useContent } from '../../lib/useContent'
import { ProjectArt } from './ProjectArt'

/** Project card shares a layoutId with the modal. */
export function ProjectCard({ project, onOpen, className }: { project: Project; onOpen: () => void; className?: string }) {
  const { ui } = useContent()
  const hasDemoVideo = project.links.some(
    (link) => link.kind === 'demo' && getYouTubeVideoId(link.href) !== null,
  )
  return (
    <motion.div
      layoutId={`project-${project.id}`}
      transition={springLayout}
      style={{ borderRadius: 14 }}
      className={cn('relative', className)}
    >
      <motion.button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-label={`${ui.openProject}: ${project.title}`}
        className="glass shadow-[var(--shadow-card)] group flex h-full w-full flex-col overflow-hidden rounded-card text-left"
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
            <span className="bg-surface grid size-10 shrink-0 place-items-center rounded-[10px] border border-[var(--line)]">
              <ArrowUpRight className="size-[18px]" />
            </span>
          </div>
          <p className="text-muted text-[15px] leading-relaxed">{project.featured ? project.summary : project.tagline}</p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {project.tags.slice(0, project.featured ? 4 : 3).map((tag) => (
              <li key={tag} className="bg-surface text-fg rounded-[8px] border border-[var(--line)] px-3 py-1 text-xs font-medium">
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </motion.button>
    </motion.div>
  )
}
