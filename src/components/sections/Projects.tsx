import { AnimatePresence, LayoutGroup } from 'framer-motion'
import { useCallback, useState } from 'react'
import { Reveal } from '../primitives/Reveal'
import { SectionHeading } from '../primitives/SectionHeading'
import { useContent } from '../../lib/useContent'
import { ProjectCard } from './ProjectCard'
import { ProjectModal } from './ProjectModal'

export function Projects() {
  const { projects } = useContent()
  const [openId, setOpenId] = useState<string | null>(null)
  const open = projects.items.find((p) => p.id === openId) ?? null
  const close = useCallback(() => setOpenId(null), [])

  if (projects.items.length === 0) return null

  return (
    <section id="projects" className="relative py-10 sm:py-16">
      <div className="container-x">
        <SectionHeading label={projects.label} title={projects.title} subtitle={projects.subtitle} />

        <LayoutGroup>
          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {projects.items.map((project, i) => (
              <Reveal key={project.id} delay={i * 0.08}>
                <ProjectCard project={project} onOpen={() => setOpenId(project.id)} className="h-full" />
              </Reveal>
            ))}
          </div>

          <AnimatePresence>{open && <ProjectModal key={open.id} project={open} onClose={close} />}</AnimatePresence>
        </LayoutGroup>
      </div>
    </section>
  )
}
