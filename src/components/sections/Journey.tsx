import { isPlaceholder } from '../../lib/placeholder'
import { useContent } from '../../lib/useContent'
import { Reveal } from '../primitives/Reveal'
import { SectionHeading } from '../primitives/SectionHeading'

export function Journey() {
  const { journey } = useContent()

  if (journey.items.length === 0) return null

  return (
    <section id="journey" className="py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading label={journey.label} title={journey.title} />

        <ol className="relative mt-12 max-w-4xl border-l border-line pl-7 sm:pl-10">
          {journey.items.map((item, index) => (
            <li key={item.id} className="relative pb-9 last:pb-0">
              <span aria-hidden className="absolute top-[0.6rem] -left-[calc(1.75rem+4px)] size-2 rounded-full bg-accent sm:-left-[calc(2.5rem+4px)]" />
              <Reveal delay={index * 0.04}>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  {item.date && !isPlaceholder(item.date) && (
                    <span className="label-mono text-fg">{item.date}</span>
                  )}
                  <span className="text-subtle text-sm">{item.kicker}</span>
                </div>
                <h3 className="mt-2 text-xl font-medium tracking-tight text-fg sm:text-2xl">{item.title}</h3>
                <p className="text-muted mt-2 max-w-2xl leading-relaxed">{item.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
