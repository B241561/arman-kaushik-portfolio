import { AnimatePresence, LayoutGroup } from 'framer-motion'
import { useCallback, useState } from 'react'
import { content } from '../../data/content'
import { Reveal } from '../primitives/Reveal'
import { SectionHeading } from '../primitives/SectionHeading'
import { ProjectCard } from './ProjectCard'
import { ProjectModal } from './ProjectModal'

const { projects } = content

export function Projects() {
  const [openId, setOpenId] = useState<string | null>(null)
  const open = projects.items.find((p) => p.id === openId) ?? null
  const close = useCallback(() => setOpenId(null), [])

  return (
    <section id="projects" className="relative py-28 sm:py-40">
      <div className="container-x">
        <SectionHeading label={projects.label} title={projects.title} subtitle={projects.subtitle} />

        <LayoutGroup>
          <div className="mt-14 grid grid-cols-1 gap-4 md:auto-rows-[minmax(300px,auto)] md:grid-cols-6">
            {projects.items.map((project, i) => (
              <Reveal
                key={project.id}
                delay={i * 0.08}
                className={project.featured ? 'md:col-span-4 md:row-span-2' : 'md:col-span-2'}
              >
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
