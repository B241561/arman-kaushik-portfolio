import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { isEditableContent, migrateLegacyAssetUrls, type EditableContent } from '../../data/schema'
import { content } from '../../data/content'
import { ErrorBoundary } from '../primitives/ErrorBoundary'
import { SafeImage } from '../primitives/SafeImage'

type Tab = 'person' | 'about' | 'skills' | 'projects' | 'timeline' | 'certificates' | 'resume' | 'media' | 'history'
type PathPart = string | number
type Version = { id: string; createdAt: string }
type MediaFile = { id: string; url: string; name: string; type: string; size: number }
type FieldProps = {
  label: string
  value: unknown
  path: PathPart[]
  update: (path: PathPart[], value: unknown) => void
  mediaFiles: MediaFile[]
  onUpload: (path: PathPart[], file: File) => Promise<void>
  onDeleteMedia: (file: MediaFile) => Promise<boolean>
  onSelectAsset: (path: PathPart[], url: string) => void
  onRemove?: () => void
}

/** Media id from a /media/<id> URL, lowercased so field values and library entries compare reliably. */
const mediaIdOf = (url: string) => /^\/media\/([a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12})$/i.exec(url.trim())?.[1].toLowerCase() ?? null

const persistedAssetUrl = (url: string) => url.startsWith('/') ? new URL(url, content.site.url).href : url

const tabs: { id: Tab; label: string }[] = [
  { id: 'person', label: 'Profile' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'timeline', label: 'Journey' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'resume', label: 'Resume' },
  { id: 'media', label: 'Media' },
  { id: 'history', label: 'History' },
]

const labels: Record<string, string> = {
  person: 'Profile',
  about: 'About',
  skills: 'Skills',
  projects: 'Projects',
  timeline: 'Journey',
  certificates: 'Certificates',
  resume: 'Resume',
  media: 'Media library',
  history: 'Version history',
  previous: 'Previous resumes',
  name: 'Name',
  tagline: 'Tagline',
  photo: 'Photo',
  src: 'Image URL',
  alt: 'Alt text',
  resumeUrl: 'Resume URL',
  label: 'Label',
  body: 'About text',
  heading: 'About heading',
  paragraph: 'About paragraph',
  internshipStatus: 'Internship status line',
  copyVersion: 'About copy version',
  highlights: 'Highlighted words',
  stats: 'Statistics',
  value: 'Value',
  status: 'Status',
  title: 'Title',
  lines: 'Lines',
  groups: 'Skill groups',
  icon: 'Icon',
  items: 'Items',
  id: 'ID',
  description: 'Description',
  problem: 'Problem',
  approach: 'Approach',
  stack: 'Stack',
  tags: 'Tags',
  screenshots: 'Screenshots',
  demoVideoUrl: 'Demo video URL',
  links: 'Links',
  kind: 'Link type',
  flowSteps: 'Flow steps',
  date: 'Date',
  kicker: 'Kicker',
  text: 'Text',
  issuer: 'Issuer',
  year: 'Year',
  type: 'Type',
  file: 'Certificate file URL',
  url: 'File URL',
}

const inputClass =
  'w-full rounded-xl border border-[var(--line)] bg-fg/[0.04] px-3 py-2.5 text-sm text-fg outline-none focus:border-accent focus:ring-2 focus:ring-accent/20'
const buttonClass =
  'rounded-[9px] border border-[var(--line)] px-4 py-2 text-sm font-medium transition-colors hover:bg-fg/[0.08] disabled:cursor-not-allowed disabled:opacity-50'
const primaryButtonClass =
  'rounded-[9px] bg-fg px-5 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'

function createDefaultDocument(): EditableContent {
  return {
    person: {
      name: content.person.name,
      tagline: content.person.tagline,
      photo: { src: persistedAssetUrl(content.person.photo.src), alt: content.person.photo.alt },
    },
    resume: { currentUrl: persistedAssetUrl(content.person.resumeUrl), previous: [] },
    about: {
      label: content.about.label,
      copyVersion: content.about.copyVersion,
      heading: content.about.heading,
      paragraph: content.about.paragraph,
      internshipStatus: content.about.internshipStatus,
      body: content.about.body,
      highlights: [...content.about.highlights],
      stats: content.about.stats.map((stat) => ({ ...stat })),
      status: { title: content.about.status.title, lines: [...content.about.status.lines] },
    },
    skills: { groups: content.skills.groups.map((group) => ({ ...group, items: [...group.items] })) },
    projects: content.projects.items.map((project) => ({
      id: project.id,
      name: project.title,
      tagline: project.tagline,
      description: project.summary,
      problem: project.problem,
      approach: [...project.approach],
      stack: [...project.stack],
      tags: [...project.tags],
      screenshots: project.screenshots.map((screenshot) => ({ ...screenshot, src: persistedAssetUrl(screenshot.src) })),
      demoVideoUrl: project.demoVideoUrl,
      links: project.links.filter((link) => link.kind !== 'demo').map((link) => ({ ...link })),
      flowSteps: project.flowSteps.map((step) => ({ ...step })),
    })),
    timeline: content.journey.items.map((item) => ({
      id: item.id,
      ...(item.date !== undefined ? { date: item.date } : {}),
      kicker: item.kicker,
      title: item.title,
      text: item.text,
    })),
    certificates: content.certificates.map((certificate) => ({ ...certificate })),
  }
}

function mergeDocument(defaultValue: unknown, savedValue: unknown): unknown {
  if (Array.isArray(savedValue)) {
    const defaults = Array.isArray(defaultValue) ? defaultValue : []
    return savedValue.map((item, index) => {
      const id = typeof item === 'object' && item !== null && 'id' in item ? item.id : null
      const fallback = id === null
        ? defaults[index]
        : defaults.find((candidate) =>
            typeof candidate === 'object' && candidate !== null && 'id' in candidate && candidate.id === id,
          )
      return mergeDocument(fallback ?? {}, item)
    })
  }
  if (
    typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue) &&
    typeof savedValue === 'object' && savedValue !== null && !Array.isArray(savedValue)
  ) {
    const result: Record<string, unknown> = { ...defaultValue }
    for (const [key, value] of Object.entries(savedValue)) {
      result[key] = mergeDocument(result[key], value)
    }
    return result
  }
  return savedValue
}

function defaultRow(path: PathPart[]): unknown {
  const field = String(path[path.length - 1] ?? '')
  if (field === 'groups') return { title: '', icon: 'code', items: [] }
  if (field === 'projects') {
    return {
      id: `project-${crypto.randomUUID()}`,
      name: '',
      tagline: '',
      description: '',
      problem: '',
      demoVideoUrl: '',
      approach: [],
      stack: [],
      tags: [],
      screenshots: [],
      links: [],
      flowSteps: [],
    }
  }
  if (field === 'timeline') return { id: `timeline-${crypto.randomUUID()}`, kicker: '', title: '', text: '' }
  if (field === 'certificates') return { id: `certificate-${crypto.randomUUID()}`, title: '', issuer: '', year: '', type: 'image', file: '' }
  if (field === 'previous') return { id: `resume-${crypto.randomUUID()}`, url: '', uploadedAt: new Date().toISOString() }
  if (field === 'stats') return { value: 0, label: '' }
  if (field === 'screenshots') return { src: '', alt: '' }
  if (field === 'links') return { label: '', href: '', kind: 'live' }
  if (field === 'flowSteps') return { id: `step-${crypto.randomUUID()}`, label: '', description: '' }
  return ''
}

function setPath(root: unknown, path: PathPart[], value: unknown): unknown {
  if (path.length === 0) return value
  const [head, ...tail] = path

  if (Array.isArray(root) && typeof head === 'number') {
    return root.map((item, index) => index === head ? setPath(item, tail, value) : item)
  }
  if (typeof root === 'object' && root !== null && !Array.isArray(root) && typeof head === 'string') {
    const next: Record<string, unknown> = { ...root }
    if (tail.length === 0 && value === undefined) delete next[head]
    else next[head] = setPath(next[head], tail, value)
    return next
  }
  return root
}

function containsAsset(value: unknown, url: string): boolean {
  if (value === url) return true
  if (Array.isArray(value)) return value.some((item) => containsAsset(item, url))
  if (typeof value === 'object' && value !== null) {
    return Object.values(value).some((item) => containsAsset(item, url))
  }
  return false
}

function isRecordValue(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isResumeVersion(value: unknown): value is { id: string; url: string; uploadedAt: string } {
  return isRecordValue(value) &&
    typeof value.id === 'string' &&
    typeof value.url === 'string' &&
    typeof value.uploadedAt === 'string'
}

function Field({ label, value, path, update, mediaFiles, onUpload, onDeleteMedia, onSelectAsset, onRemove }: FieldProps) {
  const key = String(path[path.length - 1] ?? '')
  const isScreenshotSource = path[0] === 'projects' && path.includes('screenshots') && key === 'src'
  const clearAsset = () => {
    if (isScreenshotSource) {
      if (window.confirm('Remove this screenshot?')) onRemove?.()
      return
    }
    update(path, path[0] === 'person' && key === 'src' ? '' : undefined)
  }
  const isLongText = ['body', 'description', 'paragraph', 'problem', 'text'].includes(key)
  const maxLength = ['title', 'name', 'label', 'internshipStatus'].includes(key)
    ? 120
    : key === 'heading' ? 240 : isLongText ? 1500 : undefined
  const stringValue = typeof value === 'string' || typeof value === 'number' ? String(value) : ''

  if (key === 'icon' || key === 'kind' || key === 'type') {
    const options = key === 'icon'
      ? ['code', 'brain', 'chart', 'globe']
      : key === 'kind'
        ? ['repo', 'live', 'demo']
        : ['image', 'pdf', 'link']
    return (
      <label className="grid min-w-0 gap-1.5 text-sm">
        <span className="font-medium">{label}</span>
        <select className={inputClass} value={stringValue} onChange={(event) => update(path, event.target.value)}>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </label>
    )
  }

  const onChange = (raw: string) => {
    if (typeof value === 'number') {
      update(path, raw === '' ? 0 : Number(raw))
    } else if (!raw && ['src', 'resumeUrl', 'currentUrl', 'file', 'demoVideoUrl', 'url'].includes(key)) {
      clearAsset()
    } else {
      update(path, raw)
    }
  }

  const assetField = ['src', 'resumeUrl', 'currentUrl', 'file', 'url'].includes(key)
  const fieldMediaId = mediaIdOf(stringValue)
  const selectedMedia = fieldMediaId ? mediaFiles.find((file) => file.id.toLowerCase() === fieldMediaId) : undefined
  // Preview always follows the field value, never the dropdown's matched item.
  const previewHref = fieldMediaId ? `/media/${fieldMediaId}` : stringValue
  const isImageAsset = key === 'src' || selectedMedia?.type.startsWith('image/') === true
  return (
    <>
    <label className="grid min-w-0 gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {isLongText ? (
        <textarea
          className={`${inputClass} min-h-24 resize-y`}
          value={stringValue}
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          className={inputClass}
          type={typeof value === 'number' ? 'number' : key.toLowerCase().includes('url') || key === 'file' || key === 'src' || key === 'url' ? 'url' : 'text'}
          value={stringValue}
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
    {assetField && (
      <div className="grid min-w-0 gap-2 sm:col-span-2">
        <div className="flex flex-wrap items-center gap-2">
          <label className={buttonClass}>
            Upload file
            <input
              type="file"
              accept={['currentUrl', 'resumeUrl'].includes(key) || path[0] === 'resume' ? 'application/pdf' : key === 'src' ? 'image/jpeg,image/png,image/webp' : 'image/jpeg,image/png,image/webp,application/pdf'}
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void onUpload(path, file)
                event.currentTarget.value = ''
              }}
            />
          </label>
          <select
            aria-label={`Choose existing ${label.toLowerCase()}`}
            className={`${inputClass} max-w-full sm:max-w-sm`}
            value={selectedMedia?.url ?? ''}
            onChange={(event) => event.target.value ? onSelectAsset(path, event.target.value) : clearAsset()}
          >
            <option value="">Choose existing media…</option>
            {mediaFiles.filter((file) => key === 'src'
              ? file.type.startsWith('image/')
              : ['currentUrl', 'resumeUrl', 'url'].includes(key) || path[0] === 'resume'
                ? file.type === 'application/pdf'
                : true).map((file) => <option key={file.id} value={file.url}>{file.name} ({Math.ceil(file.size / 1024)} KB)</option>)}
          </select>
          {typeof value === 'string' && value.length > 0 && (
            <>
              <a href={previewHref} target="_blank" rel="noreferrer" className="text-sm underline">Preview</a>
              {selectedMedia && (
                <button type="button" className={buttonClass} onClick={clearAsset}>Remove file</button>
              )}
            </>
          )}
        </div>
        {typeof value === 'string' && value.length > 0 && isImageAsset && (
          <SafeImage key={previewHref} src={previewHref} alt="" fallbackLabel="Preview unavailable" className="max-h-40 w-fit rounded-xl border border-[var(--line)] object-contain" />
        )}
        {typeof value === 'string' && (selectedMedia?.size ?? 0) > 500 * 1024 && (
          <p className="text-xs text-amber-300">This image is over 500 KB. Consider converting it to WebP.</p>
        )}
        {typeof value === 'string' && value.length > 0 && !value.startsWith('/media/') && (
          <button type="button" className={`${buttonClass} justify-self-start`} onClick={clearAsset}>Clear asset</button>
        )}
      </div>
    )}
    </>
  )
}

function SchemaFields({
  value,
  path,
  update,
  mediaFiles,
  onUpload,
  onDeleteMedia,
  onSelectAsset,
  onRemove,
}: {
  value: unknown
  path: PathPart[]
  update: (path: PathPart[], value: unknown) => void
  mediaFiles: MediaFile[]
  onUpload: (path: PathPart[], file: File) => Promise<void>
  onDeleteMedia: (file: MediaFile) => Promise<boolean>
  onSelectAsset: (path: PathPart[], url: string) => void
  onRemove?: () => void
}): ReactNode {
  if (Array.isArray(value)) {
    return (
      <div className="grid min-w-0 gap-3">
        {value.map((item, index) => (
          <div key={typeof item === 'object' && item !== null && 'id' in item ? String(item.id) : index} className="min-w-0 rounded-card border border-[var(--line)] bg-fg/[0.02] p-3 sm:p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-subtle text-xs font-semibold uppercase">{labels[String(path[path.length - 1])] ?? 'Item'} {index + 1}</span>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" className={buttonClass} aria-label={`Move item ${index + 1} up`} disabled={index === 0} onClick={() => {
                  const next = [...value]
                  ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
                  update(path, next)
                }}>↑</button>
                <button type="button" className={buttonClass} aria-label={`Move item ${index + 1} down`} disabled={index === value.length - 1} onClick={() => {
                  const next = [...value]
                  ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
                  update(path, next)
                }}>↓</button>
                <button type="button" className={buttonClass} onClick={() => {
                  if (window.confirm('Remove this item?')) update(path, value.filter((_, i) => i !== index))
                }}>Remove</button>
              </div>
            </div>
            <SchemaFields
              value={item}
              path={[...path, index]}
              update={update}
              mediaFiles={mediaFiles}
              onUpload={onUpload}
              onDeleteMedia={onDeleteMedia}
              onSelectAsset={onSelectAsset}
              onRemove={() => update(path, value.filter((_, itemIndex) => itemIndex !== index))}
            />
          </div>
        ))}
        <button type="button" className={`${buttonClass} justify-self-start`} onClick={() => update(path, [...value, defaultRow(path)])}>
          Add {labels[String(path[path.length - 1])] ?? 'item'}
        </button>
      </div>
    )
  }

  if (typeof value === 'object' && value !== null) {
    return (
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
        {Object.entries(value)
          .filter(([key]) => !(path[0] === 'about' && ['body', 'status', 'copyVersion'].includes(key)))
          .map(([key, child]) => (
          <div key={key} className={`min-w-0 ${['body', 'description', 'problem', 'text', 'approach', 'lines', 'items', 'stack', 'tags', 'highlights'].includes(key) ? 'sm:col-span-2' : ''}`}>
            <SchemaFields value={child} path={[...path, key]} update={update} mediaFiles={mediaFiles} onUpload={onUpload} onDeleteMedia={onDeleteMedia} onSelectAsset={onSelectAsset} onRemove={onRemove} />
          </div>
        ))}
      </div>
    )
  }

  const key = String(path[path.length - 1] ?? '')
  const label = labels[key] ?? key
  return <Field label={label} value={value} path={path} update={update} mediaFiles={mediaFiles} onUpload={onUpload} onDeleteMedia={onDeleteMedia} onSelectAsset={onSelectAsset} onRemove={onRemove} />
}

async function requestJson(path: string, token: string, method = 'GET', body?: unknown) {
  const response = await fetch(`/.netlify/functions/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const result: unknown = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = typeof result === 'object' && result !== null && 'error' in result
      ? String(result.error)
      : `Request failed (${response.status})`
    throw new Error(message)
  }
  return result
}

function parseVersions(value: unknown): Version[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is Version =>
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    typeof item.id === 'string' &&
    'createdAt' in item &&
    typeof item.createdAt === 'string',
  )
}

export default function AdminPage() {
  const [token, setToken] = useState(() => {
    try { return sessionStorage.getItem('portfolio-admin-token') ?? '' } catch { return '' }
  })
  const [password, setPassword] = useState('')
  const [draft, setDraft] = useState<unknown>(createDefaultDocument)
  const [savedDraft, setSavedDraft] = useState<unknown>(createDefaultDocument)
  const [tab, setTab] = useState<Tab>('person')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [versions, setVersions] = useState<Version[]>([])
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const valid = isEditableContent(draft)
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(savedDraft), [draft, savedDraft])

  const loadMedia = async (authToken = token) => {
    if (!authToken) return
    const result = await requestJson('media-get?list=1', authToken)
    if (!Array.isArray(result)) throw new Error('Media library response was invalid.')
    setMediaFiles(result.filter((file): file is MediaFile =>
      typeof file === 'object' && file !== null &&
      'id' in file && typeof file.id === 'string' &&
      'url' in file && typeof file.url === 'string' &&
      'name' in file && typeof file.name === 'string' &&
      'type' in file && typeof file.type === 'string' &&
      'size' in file && typeof file.size === 'number',
    ))
  }

  const selectAsset = (path: PathPart[], url: string) => {
    if (path[0] === 'certificates' && path[path.length - 1] === 'file' && isEditableContent(draft)) {
      const certificate = draft.certificates?.[Number(path[1])]
      const media = mediaFiles.find((item) => item.url === url)
      if (media && (
        (certificate?.type === 'image' && !media.type.startsWith('image/')) ||
        (certificate?.type === 'pdf' && media.type !== 'application/pdf')
      )) {
        setMessage(certificate.type === 'image' ? 'Choose an image file for this certificate.' : 'Choose a PDF file for this certificate.')
        return
      }
    }
    if (path[0] === 'resume' && path[path.length - 1] === 'currentUrl') {
      setDraft((current: unknown) => {
        if (!isRecordValue(current)) return current
        const resume = isRecordValue(current.resume) ? current.resume : {}
        if (resume.currentUrl === url) return current
        const previous = Array.isArray(resume.previous) ? resume.previous.filter(isResumeVersion) : []
        const history = typeof resume.currentUrl === 'string' && resume.currentUrl
          ? [{ id: `resume-${crypto.randomUUID()}`, url: resume.currentUrl, uploadedAt: new Date().toISOString() }, ...previous].slice(0, 3)
          : previous
        return { ...current, resume: { ...resume, currentUrl: url, previous: history } }
      })
      setMessage('')
      return
    }
    update(path, url)
  }

  const uploadAsset = async (path: PathPart[] | null, file: File) => {
    const assetField = String(path?.[path.length - 1] ?? '')
    if ((['currentUrl', 'resumeUrl'].includes(assetField) || path?.[0] === 'resume') && file.type !== 'application/pdf') {
      setMessage('Resume uploads must be PDF files.')
      return
    }
    if (assetField === 'src' && !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setMessage('Image fields require JPEG, PNG, or WebP files.')
      return
    }
    if (assetField === 'file' && path?.[0] === 'certificates' && isEditableContent(draft)) {
      const certificateType = draft.certificates?.[Number(path[1])]?.type
      if (certificateType === 'image' && !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setMessage('Image certificates require JPEG, PNG, or WebP files.')
        return
      }
      if (certificateType === 'pdf' && file.type !== 'application/pdf') {
        setMessage('PDF certificates require PDF files.')
        return
      }
    }
    if (file.size > 4 * 1024 * 1024) {
      setMessage('Files must be no larger than 4 MB.')
      return
    }
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch('/.netlify/functions/media-upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': file.type,
          'X-File-Name': encodeURIComponent(file.name),
        },
        body: file,
      })
      const result: unknown = await response.json().catch(() => ({}))
      if (!response.ok || typeof result !== 'object' || result === null || !('url' in result) || typeof result.url !== 'string') {
        throw new Error(typeof result === 'object' && result !== null && 'error' in result ? String(result.error) : `Upload failed (${response.status})`)
      }
      const uploadedUrl = result.url
      if (!mediaIdOf(uploadedUrl)) throw new Error('Upload response did not include a valid media URL.')
      if (path && assetField === 'currentUrl') {
        setDraft((current: unknown) => {
          if (!isRecordValue(current)) return current
          const resume = isRecordValue(current.resume) ? current.resume : {}
          const previous = Array.isArray(resume.previous) ? resume.previous.filter(isResumeVersion) : []
          const history = typeof resume.currentUrl === 'string' && resume.currentUrl
            ? [{ id: `resume-${crypto.randomUUID()}`, url: resume.currentUrl, uploadedAt: new Date().toISOString() }, ...previous].slice(0, 3)
            : previous
          return { ...current, resume: { ...resume, currentUrl: uploadedUrl, previous: history } }
        })
      } else if (path) {
        update(path, uploadedUrl)
      }
      try {
        await loadMedia()
      } catch (error) {
        const detail = error instanceof Error ? error.message : 'unknown error'
        setMessage(`Upload succeeded, but the media library could not refresh: ${detail}`)
        return
      }
      setMessage(file.size > 500 * 1024 && file.type.startsWith('image/')
        ? 'Upload complete. This image is over 500 KB; consider WebP.'
        : 'Upload complete.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed.')
    } finally {
      setBusy(false)
    }
  }

  const deleteMedia = async (file: MediaFile) => {
    if (!window.confirm(`Permanently delete ${file.name}? Existing pages using it will lose the asset.`)) return false
    if (containsAsset(draft, file.url) || containsAsset(savedDraft, file.url)) {
      setMessage('Remove this media from the content fields and save before deleting it from the library.')
      return false
    }
    setBusy(true)
    setMessage('')
    try {
      await requestJson('media-delete', token, 'POST', { id: file.id })
      setMediaFiles((current) => current.filter((item) => item.id !== file.id))
      setMessage('Media deleted.')
      return true
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not delete media.')
      return false
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    const previous = document.querySelector('meta[name="robots"]')?.getAttribute('content')
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (!robots) {
      robots = document.createElement('meta')
      robots.name = 'robots'
      document.head.append(robots)
    }
    robots.content = 'noindex, nofollow'
    return () => {
      if (!robots) return
      if (previous === null || previous === undefined) robots.remove()
      else robots.content = previous
    }
  }, [])

  useEffect(() => {
    if (!token) return
    let active = true
    setLoading(true)
    void Promise.all([
      requestJson('content-history', token),
      loadMedia(token).catch((error: unknown) => {
        if (active) setMessage(`Could not load media library: ${error instanceof Error ? error.message : 'unknown error'}`)
      }),
      fetch('/.netlify/functions/content-get', {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token}` },
      }).then(async (response) => {
        if (!response.ok) throw new Error(`Could not load saved content (${response.status})`)
        return response.json()
      }),
    ]).then(([history, saved]) => {
      if (!active) return
      setVersions(parseVersions(history))
      const normalized = migrateLegacyAssetUrls(saved, content.site.url)
      const loaded = isEditableContent(normalized) ? mergeDocument(createDefaultDocument(), normalized) : createDefaultDocument()
      setDraft(loaded)
      setSavedDraft(JSON.parse(JSON.stringify(loaded)) as EditableContent)
    }).catch((error: Error) => {
      if (active) setMessage(error.message)
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [token])

  const update = (path: PathPart[], value: unknown) => {
    setDraft((current: unknown) => setPath(current, path, value))
    setMessage('')
  }

  const login = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch('/.netlify/functions/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const result: unknown = await response.json()
      if (!response.ok || typeof result !== 'object' || result === null || !('token' in result) || typeof result.token !== 'string') {
        throw new Error(typeof result === 'object' && result !== null && 'error' in result ? String(result.error) : 'Login failed')
      }
      try { sessionStorage.setItem('portfolio-admin-token', result.token) } catch { /* the token remains in memory */ }
      setToken(result.token)
      setPassword('')
      setMessage('Signed in.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  const save = async () => {
    if (!token || !valid) return
    setBusy(true)
    setMessage('')
    try {
      await requestJson('content-save', token, 'POST', draft)
      setSavedDraft(draft)
      try { localStorage.setItem('portfolio-content-v1', JSON.stringify(draft)) } catch { /* cache is optional */ }
      setMessage('Changes saved.')
      setVersions(parseVersions(await requestJson('content-history', token)))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save changes.')
    } finally {
      setBusy(false)
    }
  }

  const reset = async () => {
    if (!token || !window.confirm('Reset the site to its built-in defaults?')) return
    setBusy(true)
    setMessage('')
    try {
      await requestJson('content-reset', token, 'POST', {})
      const defaults = createDefaultDocument()
      setDraft(defaults)
      setSavedDraft(defaults)
      try { localStorage.removeItem('portfolio-content-v1') } catch { /* cache is optional */ }
      setMessage('Content reset to defaults.')
      setVersions(parseVersions(await requestJson('content-history', token)))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not reset content.')
    } finally {
      setBusy(false)
    }
  }

  const restore = async (id: string) => {
    if (!token || !window.confirm('Restore this saved version?')) return
    setBusy(true)
    setMessage('')
    try {
      await requestJson('content-restore', token, 'POST', { id })
      const restored = await fetch('/.netlify/functions/content-get', { cache: 'no-store' }).then((response) => response.json())
      const normalized = migrateLegacyAssetUrls(restored, content.site.url)
      if (!isEditableContent(normalized)) throw new Error('The restored version failed validation.')
      setDraft(normalized)
      setSavedDraft(normalized)
      try { localStorage.setItem('portfolio-content-v1', JSON.stringify(normalized)) } catch { /* cache is optional */ }
      setMessage('Version restored.')
      setVersions(parseVersions(await requestJson('content-history', token)))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not restore version.')
    } finally {
      setBusy(false)
    }
  }

  const logout = () => {
    try { sessionStorage.removeItem('portfolio-admin-token') } catch { /* storage is optional */ }
    setToken('')
    setVersions([])
    setMessage('Signed out.')
  }

  if (!token) {
    return (
      <main className="bg-bg text-fg min-h-screen px-4 py-10">
        <div className="mx-auto max-w-md rounded-sheet border border-[var(--line)] bg-elevated p-6 sm:p-8">
          <h1 className="text-3xl font-semibold tracking-tight">Owner sign in</h1>
          <form onSubmit={login} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              Admin password
              <input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} />
            </label>
            <button type="submit" disabled={busy} className={primaryButtonClass}>{busy ? 'Signing in…' : 'Sign in'}</button>
          </form>
          {message && <p role="status" className="mt-4 text-sm">{message}</p>}
        </div>
      </main>
    )
  }

  const activeValue = isRecordValue(draft) && tab !== 'media' && tab !== 'history' ? draft[tab] : undefined
  const resumeDraft = isRecordValue(draft) && isRecordValue(draft.resume) ? draft.resume : {}
  const currentResume = typeof resumeDraft.currentUrl === 'string' ? resumeDraft.currentUrl : undefined
  const previousResumes = Array.isArray(resumeDraft.previous) ? resumeDraft.previous.filter(isResumeVersion) : []
  const mediaTab = tab === 'media'
  const historyTab = tab === 'history'
  return (
    <main className="bg-bg text-fg min-h-screen px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Content editor</h1>
            <p className="text-muted mt-1 text-sm">Changes affect the public site after save.</p>
          </div>
          <button type="button" className={buttonClass} onClick={logout}>Sign out</button>
        </header>

        <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Content sections">
          {tabs.map((item) => (
            <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} className={tab === item.id ? primaryButtonClass : buttonClass} onClick={() => setTab(item.id)}>
              {item.label}
            </button>
          ))}
        </div>

        <section className="mt-5 rounded-sheet border border-[var(--line)] bg-elevated p-4 sm:p-6" role="tabpanel">
          <h2 className="mb-5 text-xl font-semibold">{labels[tab]}</h2>
          <ErrorBoundary key={tab} name="editor" fallback={<p role="alert" className="text-sm text-red-400">This editor tab couldn't be displayed. Your draft is kept; switch tabs or reload the page.</p>}>
          {mediaTab ? (
            <div className="grid gap-4">
              <label className={buttonClass}>
                Upload media
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="sr-only"
                  disabled={loading || busy}
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void uploadAsset(null, file)
                    event.currentTarget.value = ''
                  }}
                />
              </label>
              {mediaFiles.length === 0 ? (
                <p className="text-muted text-sm">No uploaded media yet.</p>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {mediaFiles.map((file) => (
                    <li key={file.id} className="surface min-w-0 rounded-card p-3">
                      {file.type.startsWith('image/') ? (
                        <SafeImage src={file.url} alt="" fallbackLabel="Preview unavailable" className="mb-3 h-36 w-full rounded-xl object-cover" />
                      ) : (
                        <div className="mb-3 grid h-36 place-items-center rounded-xl border border-[var(--line)] text-sm">PDF</div>
                      )}
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <p className="text-subtle mt-1 text-xs">{Math.ceil(file.size / 1024)} KB · {file.type}</p>
                      {file.type.startsWith('image/') && file.size > 500 * 1024 && (
                        <p className="mt-2 text-xs text-amber-300">Over 500 KB; consider WebP.</p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a href={file.url} target="_blank" rel="noreferrer" className={buttonClass}>Open</a>
                        <button type="button" disabled={busy} className={buttonClass} onClick={() => void deleteMedia(file)}>Delete</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : historyTab ? (
            versions.length === 0 ? (
              <p className="text-muted text-sm">No previous saved versions yet.</p>
            ) : (
              <ul className="grid gap-3">
                {versions.map((version) => (
                  <li key={version.id} className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-[var(--line)] p-3">
                    <time className="text-sm" dateTime={version.createdAt}>{new Date(version.createdAt).toLocaleString()}</time>
                    <button type="button" className={buttonClass} disabled={busy || loading} onClick={() => void restore(version.id)}>Restore</button>
                  </li>
                ))}
              </ul>
            )
          ) : tab === 'resume' ? (
            <div className="grid gap-5">
              <fieldset disabled={loading || busy} className="grid min-w-0 gap-3 disabled:opacity-60">
                <SchemaFields value={activeValue} path={['resume']} update={update} mediaFiles={mediaFiles} onUpload={uploadAsset} onDeleteMedia={deleteMedia} onSelectAsset={selectAsset} />
              </fieldset>
              {currentResume && <a href={currentResume} target="_blank" rel="noreferrer" className="text-sm underline">Preview current resume</a>}
              <div>
                <h3 className="mb-3 font-semibold">Previous three resumes</h3>
                {previousResumes.length === 0 ? <p className="text-muted text-sm">No previous resumes.</p> : (
                  <ul className="grid gap-3">
                    {previousResumes.map((resume) => (
                      <li key={resume.id} className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-[var(--line)] p-3">
                        <span className="min-w-0 text-sm">{resume.uploadedAt}</span>
                        <div className="flex gap-2">
                          <a href={resume.url} target="_blank" rel="noreferrer" className={buttonClass}>Open</a>
                          <button type="button" className={buttonClass} onClick={() => {
                            if (!isRecordValue(draft)) return
                            const currentResumeState = isRecordValue(draft.resume) ? draft.resume : {}
                            const oldUrl = typeof currentResumeState.currentUrl === 'string' ? currentResumeState.currentUrl : undefined
                            const remaining = previousResumes.filter((item) => item.id !== resume.id)
                            const nextPrevious = oldUrl
                              ? [{ id: `resume-${crypto.randomUUID()}`, url: oldUrl, uploadedAt: new Date().toISOString() }, ...remaining].slice(0, 3)
                              : remaining
                            setDraft({ ...draft, resume: { ...currentResumeState, currentUrl: resume.url, previous: nextPrevious } })
                          }}>Make current</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <fieldset disabled={loading || busy} className="grid min-w-0 gap-3 disabled:opacity-60">
              <SchemaFields value={activeValue} path={[tab]} update={update} mediaFiles={mediaFiles} onUpload={uploadAsset} onDeleteMedia={deleteMedia} onSelectAsset={selectAsset} />
            </fieldset>
          )}
          </ErrorBoundary>
        </section>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <p aria-live="polite" className="mr-auto text-sm">
            {loading ? 'Loading saved content…' : dirty ? 'Unsaved changes' : 'All changes saved'}
          </p>
          <button type="button" className={buttonClass} disabled={busy || loading} onClick={reset}>Reset to defaults</button>
          <button type="button" className={primaryButtonClass} disabled={busy || loading || !dirty || !valid} onClick={save}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
        {!valid && <p className="mt-3 text-sm text-red-400">Some fields are invalid. Check required fields, URLs, text lengths, and duplicate IDs.</p>}
        {message && <p role="status" className="mt-3 text-sm">{message}</p>}

      </div>
    </main>
  )
}
