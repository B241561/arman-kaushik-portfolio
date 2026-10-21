import { ArrowUpRight } from 'lucide-react'
import { content as defaultContent } from '../../data/content'
import { useContent } from '../../lib/useContent'
import { GlassCard } from '../primitives/GlassCard'
import { Reveal } from '../primitives/Reveal'
import { SectionHeading } from '../primitives/SectionHeading'
import { ProfilePhoto } from './ProfilePhoto'

const projectCopy: Record<string, { title: string; result?: string; href?: string; linkLabel?: string }> = {
  feynml: {
    title: 'FeynML',
    result: 'ML auditing and failure investigation platform.',
    href: 'https://feynml-1.onrender.com',
    linkLabel: 'Visit FeynML',
  },
  'resume-analyzer': {
    title: 'AI Resume Analyzer',
    result: 'Desktop app with deterministic ATS scoring, TF-IDF job matching and optional AI feedback.',
    linkLabel: 'Watch demo',
  },
  tripcraft: {
    title: 'AI Travel Planner',
  },
}

export function About() {
  const { about, projects } = useContent()
  // TODO: Add projectCopy.tripcraft.result after the user supplies its one-line description.
  const cards = Object.entries(projectCopy).map(([id, copy]) => {
    const defaultProject = defaultContent.projects.items.find((project) => project.id === id)
    const project = projects.items.find((item) => item.id === id) ?? defaultProject
    const href = copy.href
      ?? project?.links.find((link) => link.kind === 'demo')?.href
      ?? defaultProject?.links.find((link) => link.kind === 'demo')?.href
      ?? ''
    return { ...copy, tags: project?.tags ?? defaultProject?.tags ?? [], href }
  })

  return (
    <section id="about" className="relative py-10 sm:py-16">
      <div className="container-x">
        <div className="grid items-start gap-6 sm:grid-cols-[minmax(0,1fr)_280px] sm:gap-8">
          <div className="min-w-0">
            <SectionHeading label={about.label} title={about.heading} />
            <Reveal>
              <p className="text-muted mt-4 max-w-2xl text-lg leading-relaxed">{about.paragraph}</p>
              <p className="mt-3 flex items-center gap-2 text-sm">
                <span aria-hidden className="bg-accent size-2 shrink-0 rounded-full" />
                {about.internshipStatus}
              </p>
            </Reveal>
          </div>
          <div className="w-full max-w-[280px] justify-self-center sm:justify-self-end">
            <ProfilePhoto />
          </div>
        </div>

        <div className="mt-6 grid items-start gap-4 sm:grid-cols-2">
          {cards.map((card, index) => (
            <Reveal key={card.title} delay={index * 0.08}>
              <GlassCard className="!p-4 sm:!p-5">
                <h3 className="text-xl font-semibold tracking-tight">{card.title}</h3>
                {card.result && <p className="text-muted mt-2 leading-relaxed">{card.result}</p>}
                {card.tags.length > 0 && (
                  <p className="text-subtle mt-2 text-sm">{card.tags.join(' · ')}</p>
                )}
                {card.href && card.linkLabel && (
                  <a
                    href={card.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-fg hover:text-accent mt-3 inline-flex items-center gap-2 text-sm font-medium transition-colors"
                  >
                    {card.linkLabel}
                    <ArrowUpRight aria-hidden className="size-4" />
                  </a>
                )}
              </GlassCard>
            </Reveal>
          ))}
          <GlassCard className="flex h-14 items-center !p-4 text-subtle text-sm">
            {about.stats.find((stat) => stat.value === 224)?.value.toLocaleString() ?? '224'} GitHub contributions in the last year
          </GlassCard>
        </div>
      </div>
    </section>
  )
}
