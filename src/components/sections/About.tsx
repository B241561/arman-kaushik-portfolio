import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { useEffect, useRef } from 'react'
import { cn } from '../../lib/cn'
import { isPlaceholder } from '../../lib/placeholder'
import { useContent } from '../../lib/useContent'
import { GlassCard } from '../primitives/GlassCard'
import { LazyImage } from '../primitives/LazyImage'
import { Reveal } from '../primitives/Reveal'
import { Eyebrow } from '../primitives/SectionHeading'
import { ProfilePhoto } from './ProfilePhoto'

const normalise = (w: string) => w.toLowerCase().replace(/[.,;:!?—’']+$/g, '')

export function About() {
  const { about, person } = useContent()
  const highlightSet = new Set(about.highlights.map((word) => word.toLowerCase()))

  return (
    <section id="about" className="relative py-28 sm:py-40">
      <div className="container-x">
        <Reveal>
          <Eyebrow>{about.label}</Eyebrow>
        </Reveal>

        <div className="mt-6 grid gap-16 md:grid-cols-[1.4fr_1fr]">
          <div>
            {about.body && (
              <HighlightText
                text={about.body}
                highlightSet={highlightSet}
                className="text-[clamp(1.6rem,4.6vw,3.25rem)] leading-[1.14] font-semibold tracking-[-0.035em]"
              />
            )}

            {(about.stats.length > 0 || about.status.lines.length > 0) && (
            <div className="mt-16 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {about.stats.map((stat, i) => (
                <Reveal key={`${stat.label}-${i}`} delay={i * 0.08}>
                  <GlassCard hoverable className="flex h-full flex-col justify-between gap-10">
                    <span className="text-gradient text-5xl font-semibold tracking-[-0.05em] tabular-nums sm:text-6xl">
                      <Counter value={stat.value} />
                    </span>
                    <p className="text-muted text-base">{stat.label}</p>
                  </GlassCard>
                </Reveal>
              ))}
              {about.status.lines.length > 0 && <Reveal delay={0.16}>
                <GlassCard hoverable className="flex h-full flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <div className="min-w-0">
                      <p className="text-subtle text-xs font-semibold tracking-[0.18em] uppercase">{about.status.title}</p>
                      <p className="truncate text-lg font-semibold tracking-tight">{person.name}</p>
                    </div>
                  </div>
                  <ul className="text-muted space-y-2 text-[15px]">
                    {about.status.lines.map((line, j) => (
                      <li key={`${line}-${j}`} className="flex gap-2.5">
                        <span className="bg-accent mt-2 size-1.5 shrink-0 rounded-full" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </Reveal>}
            </div>
            )}
          </div>

          <div className="relative">
            <ProfilePhoto />
          </div>
        </div>
      </div>
    </section>
  )
}

/** Words light up one by one as the paragraph scrolls through the viewport. */
function HighlightText({ text, highlightSet, className }: { text: string; highlightSet: Set<string>; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduce = !!useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] })
  const words = text.split(' ')
  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <Word
          key={i}
          progress={scrollYProgress}
          range={[i / words.length, (i + 1) / words.length]}
          reduce={reduce}
          accent={highlightSet.has(normalise(word))}
        >
          {word}
        </Word>
      ))}
    </p>
  )
}

function Word({
  children,
  progress,
  range,
  reduce,
  accent,
}: {
  children: string
  progress: MotionValue<number>
  range: [number, number]
  reduce: boolean
  accent: boolean
}) {
  const opacity = useTransform(progress, range, [0.16, 1])
  return (
    <>
      <motion.span style={{ opacity: reduce ? 1 : opacity }} className={cn('inline-block', accent && 'text-gradient')}>
        {children}
      </motion.span>{' '}
    </>
  )
}

/** Springs from 0 to the real value once visible (overdamped, so it never overshoots). */
function Counter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  const reduce = useReducedMotion()
  const mv = useMotionValue(0)
  const display = useTransform(mv, (v) => Math.round(v).toString())

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      mv.set(value)
      return
    }
    const controls = animate(mv, value, { type: 'spring', stiffness: 50, damping: 20, restDelta: 0.5 })
    return () => controls.stop()
  }, [inView, value, reduce, mv])

  return (
    <>
      <span className="sr-only">{value}</span>
      <motion.span ref={ref} aria-hidden>
        {display}
      </motion.span>
    </>
  )
}
