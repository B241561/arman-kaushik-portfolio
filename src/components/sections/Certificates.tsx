import { useEffect, useState } from 'react'
import { ArrowUpRight, FileText, Image as ImageIcon, X } from 'lucide-react'
import { useContent } from '../../lib/useContent'
import { GlassCard } from '../primitives/GlassCard'
import { SafeImage } from '../primitives/SafeImage'
import { Reveal } from '../primitives/Reveal'
import { SectionHeading } from '../primitives/SectionHeading'

type Certificate = ReturnType<typeof useContent>['certificates'][number]

export function Certificates() {
  const { certificates } = useContent()
  const [selected, setSelected] = useState<Certificate | null>(null)

  useEffect(() => {
    if (!selected) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [selected])

  if (certificates.length === 0) return null

  return (
    <section id="certificates" className="relative py-28 sm:py-40">
      <div className="container-x">
        <SectionHeading label="Certificates" title="Learning in practice." />
        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate, index) => {
            const Icon = certificate.type === 'image' ? ImageIcon : FileText
            return (
              <li key={certificate.id}>
                <Reveal delay={index * 0.06}>
                  <GlassCard className="h-full">
                    {certificate.type === 'image' && certificate.file && (
                      <button type="button" onClick={() => setSelected(certificate)} aria-label={`Open ${certificate.title} certificate`} className="mb-5 block w-full overflow-hidden rounded-2xl border border-[var(--line)]">
                        <SafeImage key={certificate.file} src={certificate.file} alt={`${certificate.title} certificate`} loading="lazy" fallbackLabel="Certificate image unavailable" className="aspect-[4/3] w-full rounded-2xl object-cover" />
                      </button>
                    )}
                    <span className="bg-fg/[0.06] grid size-11 place-items-center rounded-2xl border border-[var(--line)]">
                      <Icon className="text-accent size-5" />
                    </span>
                    <h3 className="mt-5 text-xl font-semibold tracking-tight">{certificate.title}</h3>
                    <p className="text-muted mt-2">{certificate.issuer}</p>
                    {certificate.year && <p className="text-subtle mt-1 text-sm">{certificate.year}</p>}
                    {certificate.file ? (
                      certificate.type === 'link' ? (
                        <a href={certificate.file} target="_blank" rel="noreferrer" className="text-fg mt-5 inline-flex items-center gap-2 text-sm font-medium">
                          View certificate <ArrowUpRight aria-hidden className="size-4" />
                        </a>
                      ) : (
                        <button type="button" onClick={() => setSelected(certificate)} className="text-fg mt-5 inline-flex items-center gap-2 text-sm font-medium">
                          View certificate <ArrowUpRight aria-hidden className="size-4" />
                        </button>
                      )
                    ) : (
                      <p className="text-subtle mt-5 text-sm">Certificate file not uploaded yet.</p>
                    )}
                  </GlassCard>
                </Reveal>
              </li>
            )
          })}
        </ul>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/75 p-3 backdrop-blur-md sm:p-8" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelected(null)
        }}>
          <section role="dialog" aria-modal="true" aria-label={`${selected.title} certificate`} className="bg-elevated relative max-h-full w-full max-w-5xl overflow-auto rounded-3xl border border-[var(--line)] p-4 sm:p-6">
            <button type="button" aria-label="Close certificate" onClick={() => setSelected(null)} className="glass-strong absolute top-3 right-3 z-10 grid size-10 place-items-center rounded-full">
              <X aria-hidden className="size-5" />
            </button>
            {selected.type === 'image' ? (
              <SafeImage key={selected.file} src={selected.file} alt={`${selected.title} certificate`} fallbackLabel="Certificate image unavailable" className="mx-auto max-h-[75vh] w-full rounded-2xl object-contain" />
            ) : (
              <iframe title={`${selected.title} certificate PDF`} src={selected.file} className="h-[70vh] w-full rounded-2xl border border-[var(--line)]" />
            )}
            {selected.type === 'pdf' && (
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <a href={selected.file} target="_blank" rel="noreferrer" className="glass rounded-full px-4 py-2 text-sm font-medium">Open PDF</a>
                <a href={selected.file} download className="glass rounded-full px-4 py-2 text-sm font-medium">Download PDF</a>
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  )
}
