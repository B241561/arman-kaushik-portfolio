import { Activity, FileText, Plane } from 'lucide-react'
import type { Project } from '../../data/schema'
import { useEffect, useState } from 'react'
import { cn } from '../../lib/cn'
import { isPlaceholder } from '../../lib/placeholder'
import { LazyImage } from '../primitives/LazyImage'

const icons = { feynml: Activity, resume: FileText, tripcraft: Plane }

/** Cover visual: the project's image when provided, otherwise abstract artwork. */
export function ProjectArt({ project, large = false }: { project: Project; large?: boolean }) {
  const Icon = icons[project.icon]
  const [imageFailed, setImageFailed] = useState(false)
  useEffect(() => setImageFailed(false), [project.image])

  if (!isPlaceholder(project.image) && !imageFailed) {
    return (
      <div className="bg-surface absolute inset-0 overflow-hidden">
        <LazyImage
          src={project.image}
          alt={project.imageAlt ?? project.title}
          width={large ? 1200 : 720}
          height={large ? 675 : 405}
          onError={() => setImageFailed(true)}
          className="absolute inset-0 size-full object-cover object-top"
        />
      </div>
    )
  }

  return (
    <div aria-hidden className="bg-gray absolute inset-0 grid place-items-center overflow-hidden">
      <span className={cn('bg-charcoal grid place-items-center', large ? 'size-20' : 'size-16')}>
        <Icon className={cn('text-white', large ? 'size-9' : 'size-7')} strokeWidth={1.6} />
      </span>
    </div>
  )
}
