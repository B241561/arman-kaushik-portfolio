import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Download } from 'lucide-react'
import { useEffect, useState, type MouseEvent } from 'react'
import { useScrollTo } from '../../lib/lenis'
import { spring } from '../../lib/motion'
import { isPlaceholder } from '../../lib/placeholder'
import { isContentLoaded, loadContent, useContent } from '../../lib/useContent'
import { useToast } from '../primitives/Toast'

const RESUME_FILENAME = 'Armaan-Kaushik-Resume.pdf'

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
  const [photoFailed, setPhotoFailed] = useState(false)
  useEffect(() => setPhotoFailed(false), [person.photo.src])

  const resumeMissing = isPlaceholder(person.resumeUrl)
  const intro = hero.valueProp.includes(',')
    ? hero.valueProp.slice(hero.valueProp.indexOf(',') + 1).trim()
    : hero.valueProp

  const onResume = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!resumeMissing && isContentLoaded()) return
    e.preventDefault()
    if (resumeMissing && isContentLoaded()) {
      toast(ui.resumeMissing)
      return
    }
    void loadContent().then((loaded) => {
      if (isPlaceholder(loaded.person.resumeUrl)) toast(ui.resumeMissing)
      else startDownload(resumeDownloadUrl(loaded.person.resumeUrl))
    })
  }

  return (
    <section id="home" className="flex min-h-[100svh] items-center pt-24 pb-12 sm:pt-28 sm:pb-16">
      <div className="container-x grid items-center gap-12 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={spring}
          className="order-1"
        >
          <p className="label-mono mb-5 flex items-center gap-2">
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            {hero.eyebrow}
          </p>
          <h1 className="max-w-[12ch] text-[clamp(3.5rem,8.2vw,7.25rem)] leading-[0.91] font-semibold tracking-[-0.055em] text-fg">
            {person.name}
          </h1>
          <p className="mt-5 text-sm font-medium tracking-tight text-fg sm:text-base">
            {person.degree}
          </p>
          <p className="text-muted mt-4 max-w-xl text-lg leading-relaxed sm:text-xl">
            {intro}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <button
              type="button"
              onClick={() => scrollTo('#projects')}
              className="inline-flex min-h-11 items-center gap-2 bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-colors hover:bg-accent hover:text-bg"
            >
              {hero.primaryCta}
              <ArrowRight aria-hidden className="size-4" />
            </button>
            <a
              href={resumeMissing ? '#' : resumeDownloadUrl(person.resumeUrl)}
              download={resumeMissing ? undefined : RESUME_FILENAME}
              onClick={onResume}
              aria-disabled={resumeMissing || undefined}
              className="link-accent inline-flex min-h-11 items-center gap-2 text-sm font-medium"
            >
              <Download aria-hidden className="size-4" />
              {hero.secondaryCta}
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ ...spring, delay: 0.12 }}
          className="order-2 mx-auto w-full max-w-md md:max-w-none"
        >
          <div className="aspect-[4/5] overflow-hidden border border-line bg-surface">
            {!isPlaceholder(person.photo.src) && !photoFailed ? (
              <img
                src={person.photo.src}
                alt={person.photo.alt}
                width={640}
                height={800}
                loading="eager"
                onError={() => setPhotoFailed(true)}
                className="size-full object-cover object-top"
              />
            ) : (
              <div role="img" aria-label={person.photo.alt} className="grid size-full place-items-center">
                <span className="font-sans text-5xl tracking-tight text-fg">{person.initials}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
