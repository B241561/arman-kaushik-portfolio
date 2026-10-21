import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { Code, GraduationCap, Rocket } from 'lucide-react'
import { useRef } from 'react'
import { cn } from '../../lib/cn'
import { isPlaceholder } from '../../lib/placeholder'
import { springSnappy } from '../../lib/motion'
import { useContent } from '../../lib/useContent'
import { GlassCard } from '../primitives/GlassCard'
import { Reveal } from '../primitives/Reveal'
import { SectionHeading } from '../primitives/SectionHeading'

const icons = { education: GraduationCap, project: Code, next: Rocket }

export function Journey() {
  const { journey } = useContent()
  const ref = useRef<HTMLOListElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.75', 'end 0.6'] })
  const scaleY = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1]), { stiffness: 120, damping: 26, restDelta: 0.001 })

  if (journey.items.length === 0) return null

  return (
    <section id="journey" className="relative py-28 sm:py-40">
      <div className="container-x">
        <SectionHeading label={journey.label} title={journey.title} />

        <ol ref={ref} className="relative mt-16 max-w-3xl space-y-5 pl-12 sm:pl-16">
          {/* Track + line that draws itself on scroll */}
          <span aria-hidden className="absolute top-2 bottom-2 left-[15px] w-px bg-[var(--line)] sm:left-[23px]" />
          <motion.span
            aria-hidden
            style={{ scaleY: reduce ? 1 : scaleY }}
            className="bg-charcoal absolute top-2 bottom-2 left-[15px] w-px origin-top sm:left-[23px]"
          />

          {journey.items.map((item, i) => {
            const Icon = icons[item.type]
            return (
              <li key={`${item.title}-${i}`} className="relative">
                <motion.span
                  aria-hidden
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: '0px 0px -20% 0px' }}
                  transition={springSnappy}
                  className={cn(
                    'bg-elevated absolute top-6 -left-12 grid size-8 place-items-center rounded-full border border-[var(--line)] sm:-left-16 sm:size-12',
                    item.type === 'next' && 'bg-button-bg border-transparent text-button-fg',
                  )}
                >
                  <Icon className="size-3.5 sm:size-5" />
                </motion.span>
                <Reveal delay={0.05}>
                  <GlassCard>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      {item.date && !isPlaceholder(item.date) && (
                        <>
                          <span className="text-accent text-sm font-semibold tabular-nums">{item.date}</span>
                          <span className="text-subtle text-xs">·</span>
                        </>
                      )}
                      <span className="text-subtle text-sm">{item.kicker}</span>
                    </div>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">{item.title}</h3>
                    <p className="text-muted mt-2 leading-relaxed">{item.text}</p>
                  </GlassCard>
                </Reveal>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
