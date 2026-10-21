import { ArrowUpRight } from 'lucide-react'
import { isPlaceholder } from '../../lib/placeholder'
import { useContent } from '../../lib/useContent'
import { Reveal } from '../primitives/Reveal'

export function GitHubStrip() {
  const { github, person, ui } = useContent()
  const profile = person.socials.github
  const hasProfile = !isPlaceholder(profile)

  return (
    <section aria-labelledby="github-title" className="py-14 sm:py-20">
      <div className="container-x">
        <Reveal>
          <div className="border-y border-line py-7 sm:py-9">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="label-mono">{github.title}</p>
                <h2 id="github-title" className="mt-2 font-sans text-3xl font-normal tracking-tight sm:text-4xl">
                  @{person.githubUsername}
                </h2>
                <p className="text-muted mt-2 text-sm">{github.stat}</p>
              </div>
              {hasProfile ? (
                <a
                  href={profile}
                  target="_blank"
                  rel="noreferrer"
                  className="link-accent inline-flex items-center gap-2 self-start text-xl font-medium sm:self-auto sm:text-2xl"
                >
                  {github.cta}
                  <ArrowUpRight aria-hidden className="size-5" />
                </a>
              ) : (
                <span className="text-subtle text-sm">{ui.notSetYet}</span>
              )}
            </div>

            {github.pinned.length > 0 && (
              <ul className="mt-8 grid gap-x-8 sm:grid-cols-3">
                {github.pinned.map((repo) => {
                  const linked = !isPlaceholder(repo.url)
                  return (
                    <li key={repo.name} className="border-t border-line py-4">
                      {linked ? (
                        <a href={repo.url} target="_blank" rel="noreferrer" className="group">
                          <span className="link-underline font-medium text-fg">{repo.name}</span>
                          <p className="text-muted mt-2 text-sm leading-relaxed">{repo.description}</p>
                        </a>
                      ) : (
                        <>
                          <span className="font-medium text-fg">{repo.name}</span>
                          <p className="text-muted mt-2 text-sm leading-relaxed">{repo.description}</p>
                        </>
                      )}
                      {repo.tags.length > 0 && <p className="text-subtle mt-2 text-xs">{repo.tags.join(' · ')}</p>}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
