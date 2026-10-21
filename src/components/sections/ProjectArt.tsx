import { useEffect, useState } from 'react'
import type { Project } from '../../data/schema'
import { isPlaceholder } from '../../lib/placeholder'
import { LazyImage } from '../primitives/LazyImage'

/** Uses the supplied project screenshot, with a quiet paper-and-ink fallback. */
export function ProjectArt({ project, large = false }: { project: Project; large?: boolean }) {
  const [imageFailed, setImageFailed] = useState(false)
  useEffect(() => setImageFailed(false), [project.image])

  if (!isPlaceholder(project.image) && !imageFailed) {
    return (
      <div className="absolute inset-0 overflow-hidden bg-surface">
        <LazyImage
          src={project.image}
          alt={project.imageAlt ?? project.title}
          width={large ? 1200 : 720}
          height={large ? 675 : 405}
          onError={() => setImageFailed(true)}
          className="size-full object-cover object-top"
        />
      </div>
    )
  }

  return (
    <div aria-hidden className="absolute inset-0 grid place-items-center overflow-hidden bg-surface">
      <span className="absolute inset-x-0 top-0 h-px bg-accent" />
      <div className="text-center">
        <p className="label-mono text-accent">{project.index}</p>
        <p className="mt-2 font-sans text-5xl tracking-tight text-fg sm:text-7xl">{project.title}</p>
      </div>
    </div>
  )
}
