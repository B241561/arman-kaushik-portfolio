import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Download } from 'lucide-react'
import { Fragment, useEffect, useRef, useState, type MouseEvent } from 'react'
import { cn } from '../../lib/cn'
import { useScrollTo } from '../../lib/lenis'
import { spring, springSoft } from '../../lib/motion'
import { isPlaceholder } from '../../lib/placeholder'
import { isContentLoaded, loadContent, useContent } from '../../lib/useContent'
import { useToast } from '../primitives/Toast'

const RESUME_FILENAME = 'Armaan-Kaushik-Resume.pdf'

// Uploaded resumes live at /media/<id>; ?download=1 makes media-get send them as an attachment.
const resumeDownloadUrl = (url: string) => (url.startsWith('/media/') ? `${url}?download=1` : url)

function startDownload(url: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = RESUME_FILENAME
  document.body.append(link)
  link.click()
  link.remove()
}

export function Hero({ ready }: { ready: boolean }) {
  const { hero, person, ui } = useContent()
  const reduce = useReducedMotion()
  const scrollTo = useScrollTo()
  const toast = useToast()
  const ref = useRef<HTMLElement>(null)
  const [photoFailed, setPhotoFailed] = useState(false)
  useEffect(() => setPhotoFailed(false), [person.photo.src])
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 140])
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])

  const nameWords = person.name.split(' ')
  const valueWords = person.tagline.split(' ')
  const resumeMissing = isPlaceholder(person.resumeUrl)
  const photoProps = {
    src: person.photo.src,
    alt: person.photo.alt,
    width: 152,
    height: 152,
    loading: 'eager' as const,
    fetchpriority: 'high',
    onError: () => setPhotoFailed(true),
    className: 'size-full rounded-full border border-[var(--line)] object-cover',
  }

  const onResume = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!resumeMissing && isContentLoaded()) return
    e.preventDefault()
    if (resumeMissing && isContentLoaded()) {
      toast(ui.resumeMissing)
      return
    }
    // Saved content is still loading: wait for it so the uploaded resume wins over the bundled one.
    void loadContent().then((loaded) => {
      if (isPlaceholder(loaded.person.resumeUrl)) toast(ui.resumeMissing)
      else startDownload(resumeDownloadUrl(loaded.person.resumeUrl))
    })
  }

  return (
    <section id="home" ref={ref} className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-20 pb-20 sm:pt-28 sm:pb-28 [@media(max-height:700px)]:pt-16 [@media(max-height:700px)]:pb-28">
      <motion.div style={{ y, opacity }} className="container-x relative text-center">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={reduce ? undefined : ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ ...spring, delay: 0 }}
          className="mx-auto mb-6 flex justify-center sm:mb-8 [@media(max-height:700px)]:mb-3"
        >
          <div className="rounded-full border border-line p-1">
            <div className="bg-elevated rounded-full p-[2px]">
              <div className="relative size-[120px] overflow-hidden rounded-full min-[768px]:size-[152px] [@media(max-height:700px)]:!size-[96px]">
                {isPlaceholder(person.photo.src) || photoFailed ? (
                  <div
                    role="img"
                    aria-label={person.photo.alt}
                    className="bg-elevated text-fg grid size-full place-items-center rounded-full border border-[var(--line)] text-2xl font-bold sm:text-3xl"
                  >
                    {person.initials}
                  </div>
                ) : (
                  <img {...photoProps} />
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 14, scale: 0.96 }}
          animate={ready ? { opacity: 1, y: 0, scale: 1 } : undefined}
          transition={{ ...spring, delay: 0.15 }}
          className="bg-elevated text-muted mx-auto inline-flex max-w-full items-center gap-2 rounded-full border border-line px-4 py-1.5 text-xs font-medium sm:text-sm"
        >
          <span className="relative flex size-2 shrink-0">
            <span className="bg-accent relative inline-flex size-2 rounded-full" />
          </span>
          <span className="truncate">{hero.eyebrow}</span>
        </motion.p>

        <h1 className="mt-5 text-[clamp(2.75rem,13.5vw,10.5rem)] leading-[0.9] font-semibold tracking-[-0.055em] [@media(max-height:700px)]:mt-4">
          <span className="sr-only">{person.name}</span>
          <span aria-hidden>
            {nameWords.map((word, i) => (
              <Fragment key={word}>
                <span className="inline-block max-w-full overflow-hidden pb-[0.1em] break-words">
                  <motion.span
                    className={cn('inline-block', i === nameWords.length - 1 && 'text-accent')}
                    initial={reduce ? { opacity: 0 } : { y: '108%' }}
                    animate={ready ? { y: 0, opacity: 1 } : undefined}
                    transition={{ ...springSoft, delay: 0.2 + i * 0.1 }}
                  >
                    {word}
                  </motion.span>
                </span>
                {i < nameWords.length - 1 && ' '}
              </Fragment>
            ))}
          </span>
        </h1>

        <p className="text-muted mx-auto mt-6 max-w-2xl text-[clamp(1.05rem,2.4vw,1.4rem)] leading-snug tracking-[-0.01em] text-balance [@media(max-height:700px)]:mt-4">
          {valueWords.map((word, i) => (
            <Fragment key={i}>
              <motion.span
                className="inline-block"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={ready ? { opacity: 1, y: 0 } : undefined}
                transition={{ ...spring, delay: 0.45 + i * 0.035 }}
              >
                {word}
              </motion.span>
              {i < valueWords.length - 1 && ' '}
            </Fragment>
          ))}
        </p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ ...spring, delay: 0.7 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 [@media(max-height:700px)]:mt-5 [@media(max-height:700px)]:gap-2"
        >
          <button
            type="button"
            onClick={() => scrollTo('#projects')}
            className="group bg-fg text-bg inline-flex h-13 items-center gap-2 rounded-full px-7 text-[15px] font-medium transition-transform duration-300 active:scale-[0.97]"
          >
            {hero.primaryCta}
            <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
          </button>
          <a
            href={resumeMissing ? '#' : resumeDownloadUrl(person.resumeUrl)}
            download={resumeMissing ? undefined : RESUME_FILENAME}
            onClick={onResume}
            aria-disabled={resumeMissing || undefined}
            className="group bg-elevated inline-flex h-13 items-center gap-2 rounded-full border border-line px-7 text-[15px] font-medium transition-transform duration-300 active:scale-[0.97]"
          >
            <Download className="size-4 transition-transform duration-500 group-hover:translate-y-0.5" />
            {hero.secondaryCta}
          </a>
        </motion.div>
      </motion.div>

      <motion.button
        type="button"
        onClick={() => scrollTo('#about')}
        aria-label={hero.scrollCueLabel}
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : undefined}
        transition={{ delay: 1, duration: 0.6 }}
        className="text-subtle hover:text-fg absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[11px] font-medium tracking-[0.2em] uppercase transition-colors"
      >
        <span className="flex h-9 w-[22px] justify-center rounded-full border border-current pt-1.5">
          <motion.span
            className="block h-1.5 w-1 rounded-full bg-current"
            animate={reduce ? undefined : { y: [0, 12, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </span>
        {hero.scrollCue}
      </motion.button>
    </section>
  )
}
