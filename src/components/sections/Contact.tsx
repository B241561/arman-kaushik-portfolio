import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Check, Copy, Github, Linkedin, Mail, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { isPlaceholder } from '../../lib/placeholder'
import { springSnappy } from '../../lib/motion'
import { useContent } from '../../lib/useContent'
import { GlassCard } from '../primitives/GlassCard'
import { Magnetic } from '../primitives/Magnetic'
import { Reveal } from '../primitives/Reveal'
import { SectionHeading } from '../primitives/SectionHeading'
import { useToast } from '../primitives/Toast'

const socialIcons = { github: Github, linkedin: Linkedin }

const field =
  'rounded-control w-full border border-[var(--line)] bg-fg/[0.04] px-4 py-3.5 text-[15px] text-fg placeholder:text-subtle outline-hidden focus:border-accent focus:ring-[3px] focus:ring-accent/35'

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
    <section id="contact" className="relative py-28 sm:py-40">
      <div className="container-x">
        <SectionHeading label={contact.label} title={contact.title} subtitle={contact.subtitle} />

        <div className="mt-14 grid gap-4 lg:grid-cols-5">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Reveal>
              <GlassCard>
                <p className="text-subtle text-xs font-semibold tracking-[0.18em] uppercase">{contact.emailLabel}</p>
                <p className="mt-3 text-xl font-semibold tracking-tight break-all sm:text-2xl">{person.email}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={copyEmail}
                    className="bg-fg text-bg inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium transition-transform active:scale-[0.97]"
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={copied ? 'check' : 'copy'}
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.4, opacity: 0 }}
                        transition={springSnappy}
                      >
                        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                      </motion.span>
                    </AnimatePresence>
                    {copied ? contact.copied : contact.copy}
                  </button>
                  {!emailMissing && (
                    <a
                      href={`mailto:${person.email}`}
                      className="glass inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium"
                    >
                      <Mail className="size-4" />
                      {contact.emailLabel}
                    </a>
                  )}
                </div>
              </GlassCard>
            </Reveal>

            <Reveal delay={0.06}>
              <GlassCard className="!p-3">
                <p className="text-subtle px-3 pt-3 pb-2 text-xs font-semibold tracking-[0.18em] uppercase">
                  {contact.elsewhere}
                </p>
                <ul>
                  {contact.socials.map((s) => {
                    const Icon = socialIcons[s.icon]
                    const missing = isPlaceholder(s.href)
                    const row = (
                      <>
                        <span className="bg-fg/[0.06] rounded-control grid size-10 shrink-0 place-items-center">
                          <Icon className="size-[18px]" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium">{s.label}</span>
                          <span className="text-subtle block truncate text-sm">{missing ? s.href : s.handle}</span>
                        </span>
                        {!missing && (
                          <ArrowUpRight className="text-subtle group-hover:text-fg size-4 shrink-0 transition-all duration-500 ease-[var(--ease-apple)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        )}
                      </>
                    )
                    return (
                      <li key={s.label}>
                        {missing ? (
                          <span className="rounded-tile flex items-center gap-3 p-3 opacity-70">{row}</span>
                        ) : (
                          <a
                            href={s.href}
                            target="_blank"
                            rel="noreferrer"
                            className="group hover:bg-fg/[0.05] rounded-tile flex items-center gap-3 p-3 transition-colors"
                          >
                            {row}
                          </a>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </GlassCard>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="lg:col-span-3">
            <GlassCard className="h-full">
              <h3 className="text-2xl font-semibold tracking-tight">{contact.form.title}</h3>
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
                  <Magnetic className="self-start sm:self-auto">
                    <button
                      type="submit"
                      className="bg-accent-gradient group inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-medium text-white elevation-2 transition-transform active:scale-[0.97]"
                    >
                      {contact.form.submit}
                      <Send className="size-4 transition-transform duration-500 ease-[var(--ease-apple)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                  </Magnetic>
                </div>
              </form>
            </GlassCard>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
