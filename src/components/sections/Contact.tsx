import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Check, Copy, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { isPlaceholder } from '../../lib/placeholder'
import { springSnappy } from '../../lib/motion'
import { useContent } from '../../lib/useContent'
import { Reveal } from '../primitives/Reveal'
import { SectionHeading } from '../primitives/SectionHeading'
import { useToast } from '../primitives/Toast'

const field =
  'w-full border border-[var(--line)] bg-surface px-4 py-3.5 text-[15px] text-fg placeholder:text-subtle outline-hidden focus:border-accent focus:ring-[3px] focus:ring-accent/25'

export function Contact() {
  const { contact, person, ui } = useContent()
  const toast = useToast()
  const [copied, setCopied] = useState(false)
  const emailMissing = isPlaceholder(person.email)

  const copyEmail = async () => {
    if (emailMissing) return toast(ui.emailMissing)
    try {
      await navigator.clipboard.writeText(person.email)
      setCopied(true)
      toast(contact.copiedToast)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast(contact.copyFailedToast)
    }
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (emailMissing) return toast(ui.emailMissing)
    const data = new FormData(e.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    const subject = String(data.get('subject') ?? '').trim() || contact.form.defaultSubject
    const message = String(data.get('message') ?? '').trim()
    const body = name ? `${message}\n\n— ${name}` : message
    toast(contact.form.openedToast)
    window.location.href = `mailto:${person.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <section id="contact" className="py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading label={contact.label} title={contact.title} subtitle={contact.subtitle} />

        <Reveal className="mt-12">
          <ul className="grid border-y border-line sm:grid-cols-3">
            <li className="flex min-w-0 items-start justify-between gap-3 border-b border-line py-5 sm:border-r sm:border-b-0 sm:pr-5">
              <div className="min-w-0">
                <p className="label-mono">{contact.emailLabel}</p>
                {emailMissing ? (
                  <p className="mt-2 break-all font-sans text-xl text-subtle">{person.email}</p>
                ) : (
                  <a href={`mailto:${person.email}`} className="link-underline mt-2 block break-all font-sans text-xl text-fg">
                    {person.email}
                  </a>
                )}
              </div>
              <button type="button" onClick={copyEmail} aria-label={copied ? contact.copied : contact.copy} className="mt-5 shrink-0 text-muted hover:text-accent">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={copied ? 'check' : 'copy'}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={springSnappy}
                    className="block"
                  >
                    {copied ? <Check aria-hidden className="size-5" /> : <Copy aria-hidden className="size-5" />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </li>

            {contact.socials.map((social) => {
              const missing = isPlaceholder(social.href)
              return (
                <li key={social.label} className="flex min-w-0 items-center justify-between gap-3 border-b border-line py-5 last:border-b-0 sm:border-r sm:border-b-0 sm:px-5 sm:last:border-r-0">
                  <div className="min-w-0">
                    <p className="label-mono">{social.label}</p>
                    {missing ? (
                      <p className="text-subtle mt-2 truncate font-sans text-xl">{social.href}</p>
                    ) : (
                      <a href={social.href} target="_blank" rel="noreferrer" className="link-underline mt-2 block truncate font-sans text-2xl text-fg">
                        {social.handle}
                      </a>
                    )}
                  </div>
                  {!missing && <ArrowUpRight aria-hidden className="size-5 shrink-0 text-accent" />}
                </li>
              )
            })}
          </ul>
        </Reveal>

        <Reveal delay={0.08} className="mt-12">
          <div className="border-b border-line pb-8">
            <h3 className="font-sans text-2xl font-normal">{contact.form.title}</h3>
            <form onSubmit={onSubmit} className="mt-6 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-muted text-sm font-medium">{contact.form.name}</span>
                  <input name="name" autoComplete="name" placeholder={contact.form.namePlaceholder} className={field} />
                </label>
                <label className="grid gap-2">
                  <span className="text-muted text-sm font-medium">{contact.form.subject}</span>
                  <input name="subject" placeholder={contact.form.subjectPlaceholder} className={field} />
                </label>
              </div>
              <label className="grid gap-2">
                <span className="text-muted text-sm font-medium">{contact.form.message}</span>
                <textarea
                  name="message"
                  required
                  rows={6}
                  placeholder={contact.form.messagePlaceholder}
                  className={`${field} resize-none`}
                />
              </label>
              <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-subtle text-sm">{contact.form.note}</p>
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center gap-2 self-start bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-colors hover:bg-accent"
                >
                  {contact.form.submit}
                  <Send aria-hidden className="size-4" />
                </button>
              </div>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
