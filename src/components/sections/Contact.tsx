import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Check, Copy, Github, Linkedin, Mail, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { isPlaceholder } from '../../lib/placeholder'
import { springSnappy } from '../../lib/motion'
import { useContent } from '../../lib/useContent'
import { GlassCard } from '../primitives/GlassCard'
import { Reveal } from '../primitives/Reveal'
import { SectionHeading } from '../primitives/SectionHeading'
import { useToast } from '../primitives/Toast'

const socialIcons = { github: Github, linkedin: Linkedin }

const field =
  'w-full rounded-[9px] border border-[var(--line)] bg-surface px-4 text-[15px] text-fg placeholder:text-subtle outline-none transition-colors duration-200 focus:border-accent'

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
    <section id="contact" className="relative py-10 sm:py-16">
      <div className="container-x">
        <SectionHeading
          label={contact.label}
          title={contact.title}
          subtitle={contact.subtitle}
          titleClassName="mt-3 text-[clamp(1.75rem,4vw,2.5rem)] leading-tight tracking-[-0.035em]"
        />

        <div className="mt-8 grid items-start gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-4">
            <Reveal>
              <GlassCard className="!p-4 sm:!p-5">
                <p className="text-subtle text-xs font-semibold tracking-[0.18em] uppercase">{contact.emailLabel}</p>
                <p className="mt-3 text-xl font-semibold tracking-tight break-all sm:text-2xl">{person.email}</p>
                <div className="mt-4 flex flex-wrap gap-2">
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
              <GlassCard className="!p-4">
                <p className="text-subtle pb-2 text-xs font-semibold tracking-[0.18em] uppercase">
                  {contact.elsewhere}
                </p>
                <ul>
                  {contact.socials.map((s) => {
                    const Icon = socialIcons[s.icon]
                    const missing = isPlaceholder(s.href)
                    const row = (
                      <>
                        <span className="bg-surface grid size-9 shrink-0 place-items-center rounded-[10px] border border-[var(--line)]">
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
                          <span className="flex items-center gap-3 rounded-[9px] px-2 py-1.5 opacity-70">{row}</span>
                        ) : (
                          <a
                            href={s.href}
                            target="_blank"
                            rel="noreferrer"
                            className="group hover:bg-fg/[0.05] flex items-center gap-3 rounded-[9px] px-2 py-1.5 transition-colors"
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

          <Reveal delay={0.1}>
            <GlassCard className="!p-5">
              <h3 className="text-2xl font-semibold tracking-tight">{contact.form.title}</h3>
              <form onSubmit={onSubmit} className="mt-6 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-muted text-sm font-medium">{contact.form.name}</span>
                    <input name="name" autoComplete="name" placeholder={contact.form.namePlaceholder} className={`${field} h-10 py-2`} />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-muted text-sm font-medium">{contact.form.subject}</span>
                    <input name="subject" placeholder={contact.form.subjectPlaceholder} className={`${field} h-10 py-2`} />
                  </label>
                </div>
                <label className="grid gap-2">
                  <span className="text-muted text-sm font-medium">{contact.form.message}</span>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    placeholder={contact.form.messagePlaceholder}
                    className={`${field} h-28 resize-y py-3`}
                  />
                </label>
                <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <p className="text-subtle text-sm sm:mr-auto">{contact.form.note}</p>
                    <button
                      type="submit"
                      className="bg-accent-gradient inline-flex h-10 w-auto shrink-0 items-center gap-2 self-end whitespace-nowrap rounded-[9px] px-4 py-2 text-[15px] font-medium transition-transform active:scale-[0.97] sm:self-auto"
                    >
                      Send
                      <Send className="size-4" />
                    </button>
                </div>
              </form>
            </GlassCard>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
