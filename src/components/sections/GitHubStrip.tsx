import { ArrowUpRight, BookMarked, Github } from 'lucide-react'
import { isPlaceholder } from '../../lib/placeholder'
import { useContent } from '../../lib/useContent'
import { GlassCard } from '../primitives/GlassCard'
import { Reveal } from '../primitives/Reveal'

export function GitHubStrip() {
  const { github, person, ui } = useContent()
  const profile = person.socials.github
  const hasProfile = !isPlaceholder(profile)

  return (
    <section aria-labelledby="github-title" className="relative py-12 sm:py-20">
      <div className="container-x">
        <Reveal>
          <GlassCard className="overflow-hidden">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="bg-fg text-bg rounded-control grid size-12 shrink-0 place-items-center">
                  <Github className="size-6" />
                </span>
                <div className="min-w-0">
                  <h2 id="github-title" className="text-2xl font-semibold tracking-tight">
                    {github.title}
                  </h2>
                  <p className="text-muted truncate text-sm">
                    @{person.githubUsername} · <span className="text-fg/90">{github.stat}</span>
                  </p>
                </div>
              </div>
              {hasProfile ? (
                <a
                  href={profile}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-fg text-bg inline-flex h-11 items-center gap-2 self-start rounded-full px-5 text-sm font-medium transition-transform active:scale-[0.97] sm:self-auto"
                >
                  {github.cta}
                  <ArrowUpRight className="size-4" />
                </a>
              ) : (
                <span className="text-subtle inline-flex h-11 items-center self-start rounded-full border border-dashed border-[var(--line)] px-5 text-sm sm:self-auto">
                  {ui.notSetYet}
                </span>
              )}
            </div>

            {/* Swipeable on mobile, grid from sm up */}
            <ul
              className="-mx-6 mt-7 flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto px-6 pt-1 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0"
            >
              {github.pinned.map((repo) => {
                const linked = !isPlaceholder(repo.url)
                const body = (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-2 font-semibold">
                        <BookMarked className="text-accent size-4 shrink-0" />
                        <span className="truncate">{repo.name}</span>
                      </span>
                      <span className="text-subtle shrink-0 rounded-full border border-[var(--line)] px-2 py-0.5 text-[11px] font-medium">
                        {github.pinnedLabel}
                      </span>
                    </div>
                    <p className="text-muted mt-3 line-clamp-3 text-sm leading-relaxed">{repo.description}</p>
                    <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
                      {repo.tags.map((tag) => (
                        <li key={tag} className="text-subtle flex items-center gap-1.5 text-xs">
                          <span className="bg-accent-gradient size-2 rounded-full" />
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </>
                )
                const cls =
                  'bg-fg/[0.03] rounded-tile relative block h-full border border-[var(--line)] p-5'
                return (
                  <li key={repo.name} className="w-[85%] shrink-0 snap-start sm:w-auto">
                    {linked ? (
                      <a href={repo.url} target="_blank" rel="noreferrer" data-focus-inset className={`${cls} card-hover`}>
                        {body}
                      </a>
                    ) : (
                      <div className={cls}>{body}</div>
                    )}
                  </li>
                )
              })}
            </ul>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  )
}
