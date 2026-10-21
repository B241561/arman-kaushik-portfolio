import { ArrowUpRight } from 'lucide-react'
import { content as defaultContent } from '../../data/content'
import { useContent } from '../../lib/useContent'
import { Reveal } from '../primitives/Reveal'
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
    <section id="about" className="bg-[#0E0E0E] py-20 text-[#EDEDED] sm:py-28">
      <div className="container-x">
        <Reveal>
          <p className="font-mono text-[13px] leading-[1.7] text-[#BDBDBD]">{about.label}</p>
        </Reveal>

        <div className="mt-7 grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-12">
          <div>
            <Reveal>
              <h2 className="max-w-[18ch] font-sans text-[clamp(2.25rem,5vw,4rem)] leading-[1.08] font-medium tracking-[-0.02em]">
                {about.heading}
              </h2>
              <p className="mt-5 max-w-[62ch] font-mono text-[14px] leading-[1.7] text-[#BDBDBD]">
                {about.paragraph}
              </p>
              <p className="mt-5 flex items-center gap-2 font-mono text-[13px] leading-[1.7] text-[#EDEDED]">
                <span aria-hidden className="size-2 shrink-0 rounded-full bg-[#C6FF3D]" />
                {about.internshipStatus}
              </p>
            </Reveal>

            <Reveal delay={0.08} className="mt-8">
              <ProfilePhoto />
            </Reveal>
          </div>

          <div>
            <ul className="border-t border-white/20">
              {cards.map((card, index) => (
                <li key={card.title} className="border-b border-white/20">
                  <Reveal delay={index * 0.06}>
                    <article className="py-5">
                      <h3 className="font-sans text-xl font-medium tracking-[-0.02em] text-[#EDEDED]">
                        {card.title}
                      </h3>
                      {card.result && <p className="mt-2 font-mono text-[13px] leading-[1.7] text-[#BDBDBD]">{card.result}</p>}
                      {card.tags.length > 0 && (
                        <p className="mt-2 font-mono text-[13px] leading-[1.7] text-[#8F8F8F]">
                          {card.tags.join(' · ')}
                        </p>
                      )}
                      {card.href && card.linkLabel && (
                        <a
                          href={card.href}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-1 font-mono text-[13px] leading-[1.7] text-[#C6FF3D] underline decoration-transparent underline-offset-4 transition-colors hover:text-[#EDEDED] hover:decoration-current"
                        >
                          {card.linkLabel}
                          <ArrowUpRight aria-hidden className="size-3.5" />
                        </a>
                      )}
                    </article>
                  </Reveal>
                </li>
              ))}
            </ul>
            <p className="mt-4 font-mono text-[13px] leading-[1.7] text-[#8F8F8F]">
              {about.stats.find((stat) => stat.value === 224)?.value.toLocaleString() ?? '224'} GitHub contributions in the last year
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
