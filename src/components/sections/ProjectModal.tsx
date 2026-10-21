import { motion } from 'framer-motion'
import { ArrowDown, ArrowRight, ArrowUpRight, Code, Globe, Play, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'
import { getYouTubeVideoId, type Project } from '../../data/schema'
import { useMediaQuery } from '../../lib/hooks'
import { useScrollLock } from '../../lib/lenis'
import { spring, springLayout } from '../../lib/motion'
import { isPlaceholder } from '../../lib/placeholder'
import { useContent } from '../../lib/useContent'
import { ProjectArt } from './ProjectArt'
import { LazyImage } from '../primitives/LazyImage'

/** Fullscreen sheet that grows out of the tapped card (shared layoutId), iOS app-open style. */
export function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const { projects, ui } = useContent()
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)
  const desktop = useMediaQuery('(min-width: 640px)')
  useScrollLock(true)

  const handleClose = useCallback(() => {
    setActiveVideoId(null)
    onClose()
  }, [onClose])

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleClose])

  const focusableElements = () =>
    Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    ).filter((element) => !element.hasAttribute('data-focus-sentinel'))

  const onDialogKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      handleClose()
      return
    }
    if (e.key !== 'Tab') return
    const focusable = focusableElements()
    if (focusable.length === 0) {
      e.preventDefault()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const onSentinelFocus = (e: FocusEvent<HTMLSpanElement>) => {
    const focusable = focusableElements()
    if (focusable.length === 0) return
    const destination = e.currentTarget.dataset.focusSentinel === 'start'
      ? focusable[focusable.length - 1]
      : focusable[0]
    destination.focus()
  }

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, transition: { duration: 0.12 } },
    transition: { ...spring, delay },
  })

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        onClick={handleClose}
        className="fixed inset-0 z-[80] bg-[var(--overlay)]"
      />
      <div className="pointer-events-none fixed inset-0 z-[81] flex justify-center sm:p-6 md:p-10">
        <motion.div
          layoutId={`project-${project.id}`}
          transition={springLayout}
          style={{ borderRadius: desktop ? 32 : 0 }}
          role="dialog"
          ref={dialogRef}
          onKeyDown={onDialogKeyDown}
          aria-modal="true"
          aria-labelledby={`project-title-${project.id}`}
          className="bg-elevated rounded-sheet pointer-events-auto relative max-h-full w-full max-w-5xl overflow-hidden border border-[var(--line)] shadow-[var(--shadow-card)]"
        >
          <span
            data-focus-sentinel="start"
            tabIndex={0}
            onFocus={onSentinelFocus}
            className="sr-only"
          />
          <div data-lenis-prevent className="h-full overflow-y-auto overscroll-contain">
            <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-[inherit]">
              <ProjectArt project={project} large />
            </div>

            {project.links.map((link) => {
              if (link.kind !== 'demo') return null
              const videoId = getYouTubeVideoId(link.href)
              return videoId ? (
                <DemoVideo
                  key={link.href}
                  project={project}
                  videoId={videoId}
                  href={link.href}
                  playing={activeVideoId === videoId}
                  onPlay={() => setActiveVideoId(videoId)}
                />
              ) : null
            })}

            {project.screenshots.slice(1).map((screenshot) => (
              <div key={screenshot.src} className="px-6 pt-5 sm:px-12">
                <LazyImage
                  src={screenshot.src}
                  alt={screenshot.alt}
                  width={1200}
                  height={675}
                  className="aspect-video w-full rounded-xl object-cover object-top"
                />
              </div>
            ))}

            <div className="px-6 pb-14 sm:px-12">
              <motion.div {...fadeUp(0.1)}>
                <p className="text-subtle text-xs font-semibold tracking-[0.18em] tabular-nums">{project.index}</p>
                <h2
                  id={`project-title-${project.id}`}
                  className="mt-2 text-[clamp(2.25rem,7vw,4rem)] leading-[1] font-semibold tracking-[-0.045em]"
                >
                  {project.title}
                </h2>
                <p className="text-accent mt-3 text-lg font-medium sm:text-xl">{project.tagline}</p>
              </motion.div>

              <div className="mt-10 grid gap-10 md:grid-cols-[1.4fr_1fr] md:gap-14">
                <div className="space-y-10">
                  {project.flowSteps.length > 0 && (
                    <section>
                      <ModalLabel>Project flow</ModalLabel>
                      <ol className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-stretch sm:gap-0">
                        {project.flowSteps.map((step, index) => (
                          <li key={step.id} className="flex min-w-0 flex-1 flex-col items-center gap-2 sm:flex-row">
                            <div className="glass w-full rounded-card p-3 sm:h-full">
                              <p className="font-semibold">{step.label}</p>
                              <p className="text-muted mt-1 text-sm leading-relaxed">{step.description}</p>
                            </div>
                            {index < project.flowSteps.length - 1 && (
                              <>
                                <ArrowDown aria-hidden className="text-accent size-4 shrink-0 sm:hidden" />
                                <ArrowRight aria-hidden className="text-accent hidden size-4 shrink-0 sm:block" />
                              </>
                            )}
                          </li>
                        ))}
                      </ol>
                    </section>
                  )}
                    {project.problem && <motion.section {...fadeUp(0.16)}>
                    <ModalLabel>{projects.sections.problem}</ModalLabel>
                    <p className="text-fg/90 mt-3 text-lg leading-relaxed text-pretty">{project.problem}</p>
                    </motion.section>}
                    {project.approach.length > 0 && <motion.section {...fadeUp(0.22)}>
                    <ModalLabel>{projects.sections.approach}</ModalLabel>
                    <ul className="mt-4 space-y-3">
                      {project.approach.map((step) => (
                        <li key={step} className="text-muted flex gap-3 text-[16px] leading-relaxed">
                          <span className="bg-accent mt-2.5 size-1.5 shrink-0 rounded-full" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </motion.section>}
                </div>

                <div className="space-y-10">
                  {project.stack.length > 0 && <motion.section {...fadeUp(0.26)}>
                    <ModalLabel>{projects.sections.stack}</ModalLabel>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {project.stack.map((tag) => (
                        <li key={tag} className="glass rounded-lg px-3.5 py-1.5 text-sm font-medium">
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </motion.section>}
                  {project.links.some((link) => link.kind !== 'demo') && <motion.section {...fadeUp(0.3)}>
                    <ModalLabel>{projects.sections.links}</ModalLabel>
                    <ul className="mt-4 space-y-2">
                      {project.links.filter((link) => link.kind !== 'demo').map((link) => {
                        const Icon = link.kind === 'repo' ? Code : Globe
                        const missing = isPlaceholder(link.href)
                        const inner = (
                          <>
                            <span className="bg-fg/[0.06] grid size-9 shrink-0 place-items-center rounded-xl">
                              <Icon className="size-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block font-medium">{link.label}</span>
                              <span className="text-subtle block truncate text-xs">
                                {missing ? `${ui.notSetYet} · ${link.href}` : link.href.replace(/^https?:\/\//, '')}
                              </span>
                            </span>
                            {!missing && <ArrowUpRight className="size-4 shrink-0" />}
                          </>
                        )
                        return (
                          <li key={link.label}>
                            {missing ? (
                              <span className="flex items-center gap-3 rounded-2xl border border-dashed border-[var(--line)] p-3 opacity-70">
                                {inner}
                              </span>
                            ) : (
                              <a
                                href={link.href}
                                target="_blank"
                                rel="noreferrer"
                                className="glass hover:bg-fg/[0.06] flex items-center gap-3 rounded-2xl p-3 transition-colors"
                              >
                                {inner}
                              </a>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </motion.section>}
                </div>
              </div>
            </div>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={handleClose}
            aria-label={ui.close}
            className="glass-strong absolute top-4 right-4 z-10 grid size-10 place-items-center rounded-[10px] transition-transform active:scale-90"
          >
            <X className="size-[18px]" />
          </button>
          <span
            data-focus-sentinel="end"
            tabIndex={0}
            onFocus={onSentinelFocus}
            className="sr-only"
          />
        </motion.div>
      </div>
    </>
  )
}

function DemoVideo({
  project,
  videoId,
  href,
  playing,
  onPlay,
}: {
  project: Project
  videoId: string
  href: string
  playing: boolean
  onPlay: () => void
}) {
  const [thumbnailFailed, setThumbnailFailed] = useState(false)

  return (
    <div className="px-6 pt-5 sm:px-12">
      <div className="bg-[var(--black)] relative aspect-video overflow-hidden rounded-xl">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            title={`${project.title} demo video`}
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={onPlay}
            aria-label={`Play ${project.title} demo video`}
            className="absolute inset-0 grid size-full place-items-center"
          >
            {!thumbnailFailed && (
              <img
                src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                alt=""
                onError={() => setThumbnailFailed(true)}
                className="absolute inset-0 size-full object-cover"
              />
            )}
            <span className="glass-strong relative grid size-16 place-items-center rounded-[10px]">
              <Play aria-hidden className="size-7 fill-current" />
            </span>
          </button>
        )}
      </div>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-subtle hover:text-fg mt-2 inline-flex items-center gap-1 text-xs transition-colors"
      >
        Watch on YouTube
        <ArrowUpRight aria-hidden className="size-3" />
      </a>
    </div>
  )
}

function ModalLabel({ children }: { children: string }) {
  return <h3 className="text-subtle text-xs font-semibold tracking-[0.18em] uppercase">{children}</h3>
}
