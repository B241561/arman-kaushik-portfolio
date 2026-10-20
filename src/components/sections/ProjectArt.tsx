import { Activity, FileText, Plane } from 'lucide-react'
import type { Project } from '../../data/schema'
import { cn } from '../../lib/cn'
import { isPlaceholder } from '../../lib/placeholder'
import { LazyImage } from '../primitives/LazyImage'

const icons = { feynml: Activity, resume: FileText, tripcraft: Plane }

/** Per-project gradient position, all within the single blue→violet accent. */
const tints: Record<Project['icon'], string> = {
  feynml: 'from-accent/50 via-accent-2/25 to-transparent',
  resume: 'from-accent-2/50 via-accent/20 to-transparent',
  tripcraft: 'from-accent/40 via-accent-2/35 to-transparent',
}

/** Cover visual: the project's image when provided, otherwise abstract artwork. */
export function ProjectArt({ project, large = false }: { project: Project; large?: boolean }) {
  const Icon = icons[project.icon]

  if (!isPlaceholder(project.image)) {
    return (
      <div className="bg-surface absolute inset-0 overflow-hidden">
        <LazyImage
          src={project.image}
          alt={project.imageAlt ?? project.title}
          width={large ? 1200 : 720}
          height={large ? 675 : 405}
          className="absolute inset-0 size-full object-cover object-top"
        />
      </div>
    )
  }

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className={cn('absolute inset-0 bg-radial-[at_30%_20%]', tints[project.icon])} />
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] bg-[linear-gradient(to_right,var(--line)_1px,transparent_1px),linear-gradient(to_bottom,var(--line)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {[0, 1, 2].map((ring) => (
          <span
            key={ring}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--line)]"
            style={{ width: (large ? 180 : 130) + ring * (large ? 90 : 64), height: (large ? 180 : 130) + ring * (large ? 90 : 64) }}
          />
        ))}
        <span
          className={cn(
            'glass-strong relative grid place-items-center rounded-[22px]',
            large ? 'size-20' : 'size-16',
          )}
        >
          <Icon className={cn('text-fg', large ? 'size-9' : 'size-7')} strokeWidth={1.6} />
        </span>
      </div>
    </div>
  )
}
