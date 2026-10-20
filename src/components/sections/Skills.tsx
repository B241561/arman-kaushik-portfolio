import { useReducedMotion } from 'framer-motion'
import { Brain, ChartColumn, Code, Globe } from 'lucide-react'
import { content } from '../../data/content'
import { cn } from '../../lib/cn'
import { GlassCard } from '../primitives/GlassCard'
import { Reveal } from '../primitives/Reveal'
import { SectionHeading } from '../primitives/SectionHeading'

const { skills } = content
const icons = { code: Code, brain: Brain, chart: ChartColumn, globe: Globe }
const allSkills = skills.groups.flatMap((g) => g.items)

export function Skills() {
  return (
    <section id="skills" className="relative py-28 sm:py-40">
      <div className="container-x">
        <SectionHeading label={skills.label} title={skills.title} subtitle={skills.subtitle} />
      </div>

      {/* Hovering anywhere on the band pauses both rows */}
      <Reveal className="group/marquee mt-14 flex flex-col gap-3">
        <Marquee items={allSkills} />
        <Marquee items={[...allSkills].reverse()} reverse />
      </Reveal>

      <div className="container-x mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {skills.groups.map((group, i) => {
          const Icon = icons[group.icon]
          return (
            <Reveal key={group.title} delay={i * 0.06}>
              <GlassCard className="h-full">
                <span className="bg-fg/[0.06] grid size-11 place-items-center rounded-2xl border border-[var(--line)]">
                  <Icon className="text-accent size-5" />
                </span>
                <h3 className="mt-6 text-xl font-semibold tracking-tight">{group.title}</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="bg-fg/[0.05] text-fg/90 rounded-full border border-[var(--line)] px-3.5 py-1.5 text-sm font-medium"
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
    <span className="glass flex items-center gap-2.5 rounded-full px-5 py-2.5 text-base font-medium whitespace-nowrap sm:px-6 sm:py-3 sm:text-lg">
      <span className="bg-accent-gradient size-1.5 rounded-full" />
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
    <div className="relative overflow-hidden py-1 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
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
