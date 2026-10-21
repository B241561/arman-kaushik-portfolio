import { useEffect, useState } from 'react'
import { ArrowUpRight, X } from 'lucide-react'
import { useContent } from '../../lib/useContent'
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
    <section id="certificates" className="py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading label="Certificates" title="Learning in practice." />
        <ul className="mt-12 grid gap-x-10 md:grid-cols-2">
          {certificates.map((certificate, index) => (
            <li key={certificate.id}>
              <Reveal delay={index * 0.04} className="grid grid-cols-[6rem_minmax(0,1fr)] gap-4 border-t border-line py-5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6">
                {certificate.type === 'image' && certificate.file ? (
                  <button
                    type="button"
                    onClick={() => setSelected(certificate)}
                    aria-label={`Open ${certificate.title} certificate`}
                    className="h-fit overflow-hidden border border-line bg-surface"
                  >
                    <SafeImage
                      key={certificate.file}
                      src={certificate.file}
                      alt={`${certificate.title} certificate`}
                      loading="lazy"
                      fallbackLabel="Certificate image unavailable"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </button>
                ) : (
                  <div aria-hidden className="aspect-[4/3] border border-line bg-surface" />
                )}
                <div className="min-w-0">
                  <h3 className="font-medium leading-snug text-fg">{certificate.title}</h3>
                  <p className="text-muted mt-1 text-sm">{certificate.issuer}</p>
                  {certificate.year && <p className="text-subtle mt-1 text-sm">{certificate.year}</p>}
                  {certificate.file && (
                    certificate.type === 'link' ? (
                      <a href={certificate.file} target="_blank" rel="noreferrer" className="link-accent mt-3 inline-flex items-center gap-1 text-sm">
                        View certificate <ArrowUpRight aria-hidden className="size-4" />
                      </a>
                    ) : (
                      <button type="button" onClick={() => setSelected(certificate)} className="link-accent mt-3 inline-flex items-center gap-1 text-sm">
                        View certificate <ArrowUpRight aria-hidden className="size-4" />
                      </button>
                    )
                  )}
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-[var(--scrim)] p-3 sm:p-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={`${selected.title} certificate`}
            className="relative max-h-full w-full max-w-5xl overflow-auto border border-line bg-elevated p-4 sm:p-6"
          >
            <button
              type="button"
              aria-label="Close certificate"
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 z-10 grid size-10 place-items-center border border-line bg-elevated"
            >
              <X aria-hidden className="size-5" />
            </button>
            {selected.type === 'image' ? (
              <SafeImage
                key={selected.file}
                src={selected.file}
                alt={`${selected.title} certificate`}
                fallbackLabel="Certificate image unavailable"
                className="mx-auto max-h-[75vh] w-full object-contain"
              />
            ) : (
              <iframe title={`${selected.title} certificate PDF`} src={selected.file} className="h-[70vh] w-full border border-line" />
            )}
            {selected.type === 'pdf' && (
              <div className="mt-4 flex flex-wrap justify-center gap-5">
                <a href={selected.file} target="_blank" rel="noreferrer" className="link-accent text-sm">Open PDF</a>
                <a href={selected.file} download className="link-accent text-sm">Download PDF</a>
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  )
}
