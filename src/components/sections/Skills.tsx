import { useReducedMotion } from 'framer-motion'
import { Brain, ChartColumn, Code, Globe } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useContent } from '../../lib/useContent'
import { GlassCard } from '../primitives/GlassCard'
import { Reveal } from '../primitives/Reveal'
import { SectionHeading } from '../primitives/SectionHeading'

const icons = { code: Code, brain: Brain, chart: ChartColumn, globe: Globe }

export function Skills() {
  const { skills } = useContent()
  const allSkills = skills.groups.flatMap((group) => group.items)
  const skillRows = [
    allSkills.filter((_, index) => index % 2 === 0),
    allSkills.filter((_, index) => index % 2 === 1),
  ]

  if (skills.groups.length === 0) return null

  return (
    <section id="skills" className="relative py-28 sm:py-40">
      <div className="container-x">
        <SectionHeading label={skills.label} title={skills.title} subtitle={skills.subtitle} />
      </div>

      {/* Hovering anywhere on the band pauses both rows */}
      {allSkills.length > 0 && (
        <Reveal className="group/marquee mt-14 flex flex-col gap-3">
        {skillRows.map((items, index) =>
          items.length > 0 && <Marquee key={index} items={items} reverse={index === 1} />,
        )}
        </Reveal>
      )}

      <div className="container-x mt-14 grid items-start gap-5 sm:grid-cols-2">
        {skills.groups.map((group, i) => {
          const Icon = icons[group.icon]
          return (
            <Reveal key={group.title} delay={i * 0.06}>
              <GlassCard className="h-full">
                <span className="bg-fg/[0.06] grid size-11 place-items-center rounded-[10px] border border-[var(--line)]">
                  <Icon className="text-accent size-5" />
                </span>
                <h3 className="mt-6 text-xl font-semibold tracking-tight">{group.title}</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="bg-surface text-fg/90 rounded-lg border border-[var(--line)] px-3.5 py-1.5 text-sm font-medium"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

function Chip({ label }: { label: string }) {
  return (
    <span className="glass flex items-center gap-2.5 rounded-lg px-5 py-2.5 text-base font-medium whitespace-nowrap sm:px-6 sm:py-3 sm:text-lg">
      <span className="bg-accent size-1.5 rounded-full" />
      {label}
    </span>
  )
}

function Marquee({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const reduce = useReducedMotion()

  if (reduce) {
    return (
      <ul className="container-x flex flex-wrap justify-center gap-3">
        {items.map((item) => (
          <li key={item}>
            <Chip label={item} />
          </li>
        ))}
      </ul>
    )
  }

  // Two copies + per-item right padding make translateX(-50%) loop seamlessly.
  return (
    <div className="relative overflow-hidden py-1">
      <div
        className={cn(
          'animate-marquee flex w-max group-hover/marquee:[animation-play-state:paused]',
          reverse && '[animation-direction:reverse]',
        )}
      >
        {[...items, ...items].map((item, i) => (
          <div key={i} className="pr-3" aria-hidden={i >= items.length || undefined}>
            <Chip label={item} />
          </div>
        ))}
      </div>
    </div>
  )
}
