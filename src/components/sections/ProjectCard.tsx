import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import type { Project } from '../../data/schema'
import { cn } from '../../lib/cn'
import { isPlaceholder } from '../../lib/placeholder'
import { springLayout } from '../../lib/motion'
import { useContent } from '../../lib/useContent'
import { ProjectArt } from './ProjectArt'

export function ProjectCard({
  project,
  onOpen,
  className,
  reverse = false,
}: {
  project: Project
  onOpen: () => void
  className?: string
  reverse?: boolean
}) {
  const { ui } = useContent()

  return (
    <motion.article
      layoutId={`project-${project.id}`}
      transition={springLayout}
      className={cn('grid gap-6 border-t border-line py-7 md:grid-cols-12 md:items-center md:gap-10 md:py-10', className)}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-label={`${ui.openProject}: ${project.title}`}
        className={cn(
          'group relative block aspect-video w-full overflow-hidden border border-line bg-surface md:col-span-7',
          reverse && 'md:col-start-6 md:row-start-1',
        )}
      >
        <ProjectArt project={project} large />
        <span className="absolute right-3 bottom-3 border border-line bg-elevated px-3 py-1 text-xs font-medium text-fg transition-colors group-hover:border-accent">
          {ui.openProject}
        </span>
      </button>

      <div className={cn('flex min-w-0 flex-col items-start md:col-span-5', reverse && 'md:col-start-1 md:row-start-1')}>
        <p className="label-mono">{project.index}</p>
        <h3 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
          <button type="button" onClick={onOpen} aria-haspopup="dialog" className="text-left transition-colors hover:text-accent">
            {project.title}
          </button>
        </h3>
        <p className="text-muted mt-3 line-clamp-1 leading-relaxed">{project.summary}</p>
        {project.stack.length > 0 && (
          <p className="text-subtle mt-5 text-sm leading-relaxed">{project.stack.join(' · ')}</p>
        )}

        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
          {project.links.map((link, index) => (
            <li key={`${index}-${link.label}`}>
              {isPlaceholder(link.href) ? (
                <span className="text-subtle text-sm">{link.label} · {ui.notSetYet}</span>
              ) : (
                <a href={link.href} target="_blank" rel="noreferrer" className="link-accent inline-flex items-center gap-1 text-sm">
                  {link.label}
                  <ArrowUpRight aria-hidden className="size-3.5" />
                </a>
              )}
            </li>
          ))}
        </ul>
        <button type="button" onClick={onOpen} className="mt-5 text-sm font-medium text-fg underline decoration-[var(--line-strong)] underline-offset-4 hover:decoration-accent">
          Project details
        </button>
      </div>
    </motion.article>
  )
}
