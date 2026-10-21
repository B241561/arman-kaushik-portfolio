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
    <section id="about" className="relative py-28 sm:py-40">
      <div className="container-x">
        <SectionHeading label={about.label} title={about.heading} />

        <div className="mt-8 grid gap-12 md:grid-cols-[1.15fr_0.85fr] md:gap-16">
          <div className="space-y-8">
            <Reveal>
              <p className="text-muted max-w-2xl text-lg leading-relaxed">{about.paragraph}</p>
              <p className="mt-5 flex items-center gap-3 text-sm font-medium">
                <span aria-hidden className="bg-accent size-2 shrink-0 rounded-full" />
                {about.internshipStatus}
              </p>
            </Reveal>
            <ProfilePhoto />
          </div>

          <div className="space-y-4">
            {cards.map((card, index) => (
              <Reveal key={card.title} delay={index * 0.08}>
                <GlassCard className="h-full">
                  <h3 className="text-xl font-semibold tracking-tight">{card.title}</h3>
                  {card.result && <p className="text-muted mt-3 leading-relaxed">{card.result}</p>}
                  {card.tags.length > 0 && (
                    <p className="text-subtle mt-3 text-sm">{card.tags.join(' · ')}</p>
                  )}
                  {card.href && card.linkLabel && (
                    <a
                      href={card.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-fg hover:text-accent mt-4 inline-flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                      {card.linkLabel}
                      <ArrowUpRight aria-hidden className="size-4" />
                    </a>
                  )}
                </GlassCard>
              </Reveal>
            ))}
            <p className="text-subtle pt-2 text-sm">
              {about.stats.find((stat) => stat.value === 224)?.value.toLocaleString() ?? '224'} GitHub contributions in the last year
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
