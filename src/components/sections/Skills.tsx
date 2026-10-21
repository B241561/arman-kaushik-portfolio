import { Reveal } from '../primitives/Reveal'
import { SectionHeading } from '../primitives/SectionHeading'
import { useContent } from '../../lib/useContent'

export function Skills() {
  const { skills } = useContent()

  if (skills.groups.length === 0) return null

  return (
    <section id="skills" className="py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading label={skills.label} title={skills.title} subtitle={skills.subtitle} />

        <ul className="mt-12 grid gap-x-10 md:grid-cols-2">
          {skills.groups.map((group, index) => (
            <li key={`${group.title}-${index}`} className="border-t border-line py-5">
              <Reveal delay={index * 0.05}>
                <h3 className="font-sans text-xl font-medium text-fg">{group.title}</h3>
                <p className="text-muted mt-2 leading-relaxed">{group.items.join(' · ')}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
