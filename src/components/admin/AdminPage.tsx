import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { isEditableContent, type EditableContent } from '../../data/schema'
import { content } from '../../data/content'

type Tab = 'person' | 'about' | 'skills' | 'projects' | 'timeline' | 'certificates'
type PathPart = string | number
type Version = { id: string; createdAt: string }
type FieldProps = {
  label: string
  value: unknown
  path: PathPart[]
  update: (path: PathPart[], value: unknown) => void
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'person', label: 'Profile' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'timeline', label: 'Journey' },
  { id: 'certificates', label: 'Certificates' },
]

const labels: Record<string, string> = {
  person: 'Profile',
  about: 'About',
  skills: 'Skills',
  projects: 'Projects',
  timeline: 'Journey',
  certificates: 'Certificates',
  name: 'Name',
  tagline: 'Tagline',
  photo: 'Photo',
  src: 'Image URL',
  alt: 'Alt text',
  resumeUrl: 'Resume URL',
  label: 'Label',
  body: 'About text',
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
}

const inputClass =
  'w-full rounded-xl border border-[var(--line)] bg-fg/[0.04] px-3 py-2.5 text-sm text-fg outline-none focus:border-accent focus:ring-2 focus:ring-accent/20'
const buttonClass =
  'rounded-full border border-[var(--line)] px-4 py-2 text-sm font-medium transition-colors hover:bg-fg/[0.08] disabled:cursor-not-allowed disabled:opacity-50'
const primaryButtonClass =
  'rounded-full bg-accent-gradient px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'

function createDefaultDocument(): EditableContent {
  return {
    person: {
      name: content.person.name,
      tagline: content.person.tagline,
      photo: { src: content.person.photo.src, alt: content.person.photo.alt },
      resumeUrl: content.person.resumeUrl,
    },
    about: {
      label: content.about.label,
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
      screenshots: project.screenshots.map((screenshot) => ({ ...screenshot })),
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
      approach: [],
      stack: [],
      tags: [],
      screenshots: [],
      links: [],
      flowSteps: [],
    }
  }
  if (field === 'timeline') return { id: `timeline-${crypto.randomUUID()}`, kicker: '', title: '', text: '' }
  if (field === 'certificates') return { id: `certificate-${crypto.randomUUID()}`, title: '', issuer: '', year: '', type: '', file: '' }
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

function Field({ label, value, path, update }: FieldProps) {
  const key = String(path[path.length - 1] ?? '')
  const isLongText = ['body', 'description', 'problem', 'text'].includes(key)
  const maxLength = ['title', 'name', 'label'].includes(key) ? 120 : isLongText ? 1500 : undefined
  const stringValue = typeof value === 'string' || typeof value === 'number' ? String(value) : ''

  if (key === 'icon' || key === 'kind') {
    const options = key === 'icon' ? ['code', 'brain', 'chart', 'globe'] : ['repo', 'live', 'demo']
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
    } else if (!raw && ['src', 'resumeUrl', 'demoVideoUrl'].includes(key)) {
      update(path, undefined)
    } else {
      update(path, raw)
    }
  }

  return (
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
          type={typeof value === 'number' ? 'number' : key.toLowerCase().includes('url') || key === 'file' || key === 'src' ? 'url' : 'text'}
          value={stringValue}
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  )
}

function SchemaFields({
  value,
  path,
  update,
  onRemove,
  onMove,
}: {
  value: unknown
  path: PathPart[]
  update: (path: PathPart[], value: unknown) => void
  onRemove?: () => void
  onMove?: (delta: number) => void
}): ReactNode {
  if (Array.isArray(value)) {
    return (
      <div className="grid gap-3">
        {value.map((item, index) => (
          <div key={typeof item === 'object' && item !== null && 'id' in item ? String(item.id) : index} className="rounded-2xl border border-[var(--line)] bg-fg/[0.02] p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-subtle text-xs font-semibold uppercase">{labels[String(path[path.length - 1])] ?? 'Item'} {index + 1}</span>
              <div className="flex gap-1.5">
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
                <button type="button" className={buttonClass} onClick={() => update(path, value.filter((_, i) => i !== index))}>Remove</button>
              </div>
            </div>
            <SchemaFields value={item} path={[...path, index]} update={update} />
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
      <div className="grid gap-3 sm:grid-cols-2">
        {Object.entries(value).map(([key, child]) => (
          <div key={key} className={['body', 'description', 'problem', 'text', 'approach', 'lines', 'items', 'stack', 'tags', 'highlights'].includes(key) ? 'sm:col-span-2' : ''}>
            <SchemaFields value={child} path={[...path, key]} update={update} />
          </div>
        ))}
        {onRemove && <button type="button" className={buttonClass} onClick={onRemove}>Remove item</button>}
        {onMove && <button type="button" className={buttonClass} onClick={() => onMove(-1)}>Move item up</button>}
      </div>
    )
  }

  const key = String(path[path.length - 1] ?? '')
  const label = labels[key] ?? key
  return <Field label={label} value={value} path={path} update={update} />
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
  const valid = isEditableContent(draft)
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(savedDraft), [draft, savedDraft])

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
      const loaded = isEditableContent(saved) ? mergeDocument(createDefaultDocument(), saved) : createDefaultDocument()
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
      if (!isEditableContent(restored)) throw new Error('The restored version failed validation.')
      setDraft(restored)
      setSavedDraft(restored)
      try { localStorage.setItem('portfolio-content-v1', JSON.stringify(restored)) } catch { /* cache is optional */ }
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
        <div className="mx-auto max-w-md rounded-3xl border border-[var(--line)] bg-elevated p-6 sm:p-8">
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

  const activeValue = isEditableContent(draft) ? draft[tab] : undefined
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

        <section className="mt-5 rounded-3xl border border-[var(--line)] bg-elevated p-4 sm:p-6" role="tabpanel">
          <h2 className="mb-5 text-xl font-semibold">{labels[tab]}</h2>
          <fieldset disabled={loading || busy} className="grid gap-3 disabled:opacity-60">
            <SchemaFields value={activeValue} path={[tab]} update={update} />
          </fieldset>
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

        <section className="mt-10 rounded-3xl border border-[var(--line)] bg-elevated p-4 sm:p-6">
          <h2 className="text-xl font-semibold">Version history</h2>
          {versions.length === 0 ? (
            <p className="text-muted mt-3 text-sm">No previous saved versions yet.</p>
          ) : (
            <ul className="mt-4 grid gap-3">
              {versions.map((version) => (
                <li key={version.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] p-3">
                  <time className="text-sm" dateTime={version.createdAt}>{new Date(version.createdAt).toLocaleString()}</time>
                  <button type="button" className={buttonClass} disabled={busy || loading} onClick={() => void restore(version.id)}>Restore</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
