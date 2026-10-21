import { Github, Instagram, Linkedin } from 'lucide-react'
import { useEffect, useState, type MouseEvent } from 'react'
import { useScrollTo } from '../../lib/lenis'
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

/** Split hero: profile on a white panel, a short "About Me" on a flat gray panel. */
export function Hero(_props: { ready: boolean }) {
  const { hero, person, ui } = useContent()
  const scrollTo = useScrollTo()
  const toast = useToast()
  const [photoFailed, setPhotoFailed] = useState(false)
  useEffect(() => setPhotoFailed(false), [person.photo.src])

  const resumeMissing = isPlaceholder(person.resumeUrl)
  const emailMissing = isPlaceholder(person.email)
  const socials = [
    { label: 'GitHub', href: person.socials.github, Icon: Github },
    { label: 'LinkedIn', href: person.socials.linkedin, Icon: Linkedin },
    { label: 'Instagram', href: person.socials.instagram, Icon: Instagram },
  ]

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

  const onEmail = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!emailMissing) return
    e.preventDefault()
    toast(ui.emailMissing)
  }

  return (
    <section id="home" className="grid border-b border-[var(--line)] md:min-h-[calc(100svh-57px)] md:grid-cols-2">
      <div className="bg-white px-6 py-14 sm:px-12 md:flex md:items-center md:py-20 lg:px-20">
        <div className="w-full max-w-md">
          <div className="bg-gray size-40 overflow-hidden sm:size-48">
            {isPlaceholder(person.photo.src) || photoFailed ? (
              <div role="img" aria-label={person.photo.alt} className="text-charcoal grid size-full place-items-center text-4xl font-bold">
                {person.initials}
              </div>
            ) : (
              <img
                src={person.photo.src}
                alt={person.photo.alt}
                width={192}
                height={192}
                loading="eager"
                {...{ fetchpriority: 'high' }}
                onError={() => setPhotoFailed(true)}
                className="size-full object-cover object-top"
              />
            )}
          </div>

          <h1 className="text-charcoal mt-8 text-3xl font-bold sm:text-4xl">{person.name}</h1>
          <p className="text-charcoal mt-2 text-lg font-light">{hero.role}</p>

          <a href={emailMissing ? '#' : `mailto:${person.email}`} onClick={onEmail} className="btn-solid mt-8">
            {hero.emailCta}
          </a>

          <ul aria-label={hero.socialsLabel} className="mt-8 flex items-center gap-5">
            {socials.map(({ label, href, Icon }) => (
              <li key={label}>
                {isPlaceholder(href) ? (
                  <span aria-label={`${label} (not added yet)`} className="text-charcoal block opacity-40">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                ) : (
                  <a href={href} target="_blank" rel="noreferrer" aria-label={label} className="text-charcoal hover:text-black block">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-gray px-6 py-14 sm:px-12 md:flex md:items-center md:py-20 lg:px-20">
        <div className="w-full max-w-md">
          <h2 className="text-charcoal text-3xl font-bold sm:text-4xl">{hero.aboutTitle}</h2>
          <p className="text-charcoal mt-5 text-base leading-relaxed">{person.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={resumeMissing ? '#' : resumeDownloadUrl(person.resumeUrl)}
              download={resumeMissing ? undefined : RESUME_FILENAME}
              onClick={onResume}
              aria-disabled={resumeMissing || undefined}
              className="btn-solid"
            >
              {hero.resumeCta}
            </a>
            <button type="button" onClick={() => scrollTo('#projects')} className="btn-solid">
              {hero.portfolioCta}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
