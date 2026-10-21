export type ProjectLink = { label: string; href: string; kind: 'repo' | 'live' | 'demo' }
export type EditableProjectLink = { label: string; href: string; kind?: 'repo' | 'live' | 'demo' }

export type ProjectScreenshot = { src: string; alt: string }
export type ProjectFlowStep = { id: string; label: string; description: string }
export type Certificate = { id: string; title: string; issuer: string; year: string | number; type: 'image' | 'pdf' | 'link'; file: string }
export type JourneyItem = {
  id: string
  date?: string
  kicker: string
  title: string
  text: string
  type: 'education' | 'project' | 'next'
}

export type Project = {
  id: string
  index: string
  title: string
  tagline: string
  summary: string
  icon: 'feynml' | 'resume' | 'tripcraft'
  image: string
  imageAlt?: string
  screenshots: ProjectScreenshot[]
  tags: string[]
  flowSteps: ProjectFlowStep[]
  demoVideoUrl?: string
  problem: string
  approach: string[]
  stack: string[]
  links: ProjectLink[]
  featured?: boolean
}

export type EditablePerson = {
  name?: string
  tagline?: string
  photo?: { src?: string; alt?: string }
  resumeUrl?: string
}

export type EditableResume = {
  currentUrl?: string
  previous?: { id: string; url: string; uploadedAt: string }[]
}

export type EditableAbout = {
  label?: string
  copyVersion?: number
  heading?: string
  paragraph?: string
  internshipStatus?: string
  body?: string
  highlights?: string[]
  stats?: { value: number; label: string }[]
  status?: { title: string; lines: string[] }
}

export type EditableSkillGroup = {
  title: string
  icon: 'code' | 'brain' | 'chart' | 'globe'
  items: string[]
}

export type EditableProject = {
  id: string
  name?: string
  image?: string
  imageAlt?: string
  featured?: boolean
  tagline?: string
  description?: string
  problem?: string
  approach?: string[]
  stack?: string[]
  tags?: string[]
  screenshots?: ProjectScreenshot[]
  demoVideoUrl?: string
  links?: EditableProjectLink[]
  flowSteps?: ProjectFlowStep[]
}

export type EditableTimelineItem = {
  id: string
  date?: string
  type?: 'education' | 'project' | 'next'
  kicker: string
  title: string
  text: string
}

export type EditableCertificate = {
  id: string
  title: string
  issuer: string
  year?: string | number
  type: 'image' | 'pdf' | 'link'
  file?: string
}

export type EditableContent = {
  person?: EditablePerson
  resume?: EditableResume
  about?: EditableAbout
  skills?: { groups?: EditableSkillGroup[] }
  projects?: EditableProject[]
  timeline?: EditableTimelineItem[]
  certificates?: EditableCertificate[]
}

type UnknownRecord = Record<string, unknown>

export function getYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase()
    let id: string | null = null

    if (host === 'youtu.be') {
      id = parsed.pathname.split('/').filter(Boolean)[0] ?? null
    } else if (host === 'youtube.com') {
      id = parsed.pathname === '/watch'
        ? parsed.searchParams.get('v')
        : parsed.pathname.match(/^\/embed\/([^/]+)/)?.[1] ?? null
    }

    return id && /^[\w-]{11}$/.test(id) ? id : null
  } catch {
    return null
  }
}

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const hasOnlyKeys = (value: UnknownRecord, keys: readonly string[]) =>
  Object.keys(value).every((key) => keys.includes(key))

const isText = (value: unknown, maxLength: number) =>
  typeof value === 'string' && value.length <= maxLength
const isNonEmptyText = (value: unknown, maxLength: number) =>
  typeof value === 'string' && value.length <= maxLength && value.trim().length > 0

const isOptionalText = (value: UnknownRecord, key: string, maxLength: number) =>
  !(key in value) || isText(value[key], maxLength)

const isStringArray = (value: unknown, maxLength: number, maxItems: number) =>
  Array.isArray(value) && value.length <= maxItems && value.every((item) => isText(item, maxLength))

export function isAllowedAssetUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0 || value.length > 2048 || /\s/.test(value)) return false
  if (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')) return true
  if (!value.startsWith('https://')) return false

  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

function isMediaAssetUrl(value: unknown) {
  if (typeof value !== 'string') return false
  if (/^\/media\/[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(value)) return true
  return value.startsWith('https://') && isAllowedAssetUrl(value)
}

export function migrateLegacyAssetUrls(value: unknown, siteUrl: string): unknown {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return value
  const migrated = JSON.parse(JSON.stringify(value)) as Record<string, unknown>
  const makeAbsolute = (record: Record<string, unknown>, key: string) => {
    const asset = record[key]
    if (typeof asset === 'string' && asset.startsWith('/') && !asset.startsWith('//') &&
      !asset.startsWith('/media/') && !asset.includes('\\') && !/\s/.test(asset)) {
      record[key] = new URL(asset, siteUrl).href
    }
  }

  if (typeof migrated.person === 'object' && migrated.person !== null && !Array.isArray(migrated.person)) {
    const person = migrated.person as Record<string, unknown>
    makeAbsolute(person, 'resumeUrl')
    if (typeof person.photo === 'object' && person.photo !== null && !Array.isArray(person.photo)) {
      makeAbsolute(person.photo as Record<string, unknown>, 'src')
    }
  }
  if (typeof migrated.resume === 'object' && migrated.resume !== null && !Array.isArray(migrated.resume)) {
    const resume = migrated.resume as Record<string, unknown>
    makeAbsolute(resume, 'currentUrl')
    if (Array.isArray(resume.previous)) {
      for (const item of resume.previous) {
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          makeAbsolute(item as Record<string, unknown>, 'url')
        }
      }
    }
  }
  if (Array.isArray(migrated.projects)) {
    for (const project of migrated.projects) {
      if (typeof project !== 'object' || project === null || Array.isArray(project)) continue
      const screenshots = (project as Record<string, unknown>).screenshots
      if (Array.isArray(screenshots)) {
        for (const screenshot of screenshots) {
          if (typeof screenshot === 'object' && screenshot !== null && !Array.isArray(screenshot)) {
            makeAbsolute(screenshot as Record<string, unknown>, 'src')
          }
        }
      }
    }
  }
  if (Array.isArray(migrated.certificates)) {
    for (const certificate of migrated.certificates) {
      if (typeof certificate === 'object' && certificate !== null && !Array.isArray(certificate)) {
        makeAbsolute(certificate as Record<string, unknown>, 'file')
      }
    }
  }
  return migrated
}

function isYouTubeUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try {
    const parsed = new URL(value)
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '')
    return ['youtu.be', 'youtube.com'].includes(host) && getYouTubeVideoId(value) !== null
  } catch {
    return false
  }
}

function hasRequiredText(value: UnknownRecord, key: string, maxLength: number) {
  return key in value && isText(value[key], maxLength)
}

function isScreenshot(value: unknown): value is { src: string; alt: string } {
  if (!isRecord(value) || !hasOnlyKeys(value, ['src', 'alt'])) return false
  return isMediaAssetUrl(value.src) && isNonEmptyText(value.alt, 120)
}

function isProjectLink(value: unknown): value is EditableProjectLink {
  if (!isRecord(value) || !hasOnlyKeys(value, ['label', 'href', 'kind'])) return false
  if (!isNonEmptyText(value.label, 120) || typeof value.href !== 'string' || !value.href.startsWith('https://') || !isAllowedAssetUrl(value.href)) return false
  if (!('kind' in value)) return true
  if (value.kind === 'demo') return isYouTubeUrl(value.href)
  return value.kind === 'repo' || value.kind === 'live'
}

function isFlowStep(value: unknown): value is ProjectFlowStep {
  if (!isRecord(value) || !hasOnlyKeys(value, ['id', 'label', 'description'])) return false
  return (
    isNonEmptyText(value.id, 80) &&
    isNonEmptyText(value.label, 120) &&
    isNonEmptyText(value.description, 1500)
  )
}

function hasUniqueIds(items: unknown[]) {
  if (!items.every(isRecord)) return false
  const ids = items.map((item) => item.id)
  if (!ids.every((id) => typeof id === 'string')) return false
  return new Set(ids).size === ids.length
}

function isProject(value: unknown): value is EditableProject {
  if (!isRecord(value) || !hasOnlyKeys(value, [
    'id', 'name', 'image', 'imageAlt', 'featured', 'tagline', 'description', 'problem', 'approach', 'stack', 'tags',
    'screenshots', 'demoVideoUrl', 'links', 'flowSteps',
  ])) return false

  return (
    isNonEmptyText(value.id, 80) &&
    (!('name' in value) || isNonEmptyText(value.name, 120)) &&
    (!('image' in value) || value.image === '' || isMediaAssetUrl(value.image)) &&
    isOptionalText(value, 'imageAlt', 120) &&
    (!('featured' in value) || typeof value.featured === 'boolean') &&
    (!('tagline' in value) || isNonEmptyText(value.tagline, 120)) &&
    isOptionalText(value, 'description', 1500) &&
    isOptionalText(value, 'problem', 1500) &&
    (!('approach' in value) || isStringArray(value.approach, 1500, 30)) &&
    (!('stack' in value) || isStringArray(value.stack, 120, 40)) &&
    (!('tags' in value) || isStringArray(value.tags, 120, 40)) &&
    (!('screenshots' in value) ||
      (Array.isArray(value.screenshots) && value.screenshots.length <= 12 && value.screenshots.every(isScreenshot))) &&
    (!('demoVideoUrl' in value) || value.demoVideoUrl === '' || isYouTubeUrl(value.demoVideoUrl)) &&
    (!('links' in value) ||
      (Array.isArray(value.links) && value.links.length <= 20 && value.links.every(isProjectLink))) &&
    (!('flowSteps' in value) ||
      (Array.isArray(value.flowSteps) &&
        value.flowSteps.length <= 30 &&
        value.flowSteps.every(isFlowStep) &&
        hasUniqueIds(value.flowSteps)))
  )
}

function isPerson(value: unknown): value is EditablePerson {
  if (!isRecord(value) || !hasOnlyKeys(value, ['name', 'tagline', 'photo', 'resumeUrl'])) return false
  if (
    !isOptionalText(value, 'name', 120) ||
    !isOptionalText(value, 'tagline', 1500) ||
    ('resumeUrl' in value && !isMediaAssetUrl(value.resumeUrl))
  ) return false
  if (!('photo' in value)) return true
  return (
    isRecord(value.photo) &&
    hasOnlyKeys(value.photo, ['src', 'alt']) &&
    (!('src' in value.photo) || value.photo.src === '' || isMediaAssetUrl(value.photo.src)) &&
    isOptionalText(value.photo, 'alt', 120)
  )
}

function isAbout(value: unknown): value is EditableAbout {
  if (!isRecord(value) || !hasOnlyKeys(value, ['label', 'copyVersion', 'heading', 'paragraph', 'internshipStatus', 'body', 'highlights', 'stats', 'status'])) return false
  if (
    !isOptionalText(value, 'label', 120) ||
    ('copyVersion' in value && value.copyVersion !== 2) ||
    !isOptionalText(value, 'heading', 240) ||
    !isOptionalText(value, 'paragraph', 1500) ||
    !isOptionalText(value, 'internshipStatus', 120) ||
    !isOptionalText(value, 'body', 1500) ||
    ('highlights' in value && !isStringArray(value.highlights, 120, 40))
  ) return false
  if ('stats' in value) {
    if (!Array.isArray(value.stats) || value.stats.length > 20) return false
    if (!value.stats.every((stat) =>
      isRecord(stat) &&
      hasOnlyKeys(stat, ['value', 'label']) &&
      typeof stat.value === 'number' &&
      Number.isFinite(stat.value) &&
      hasRequiredText(stat, 'label', 120))) return false
  }
  if ('status' in value) {
    const status = value.status
    if (
      !isRecord(status) ||
      !hasOnlyKeys(status, ['title', 'lines']) ||
      !hasRequiredText(status, 'title', 120) ||
      !isStringArray(status.lines, 120, 20)
    ) return false
  }
  return true
}

function isSkills(value: unknown): value is { groups?: EditableSkillGroup[] } {
  if (!isRecord(value) || !hasOnlyKeys(value, ['groups'])) return false
  if (!('groups' in value)) return true
  return (
    Array.isArray(value.groups) &&
    value.groups.length <= 12 &&
    value.groups.every((group) =>
      isRecord(group) &&
      hasOnlyKeys(group, ['title', 'icon', 'items']) &&
      isNonEmptyText(group.title, 120) &&
      ['code', 'brain', 'chart', 'globe'].includes(String(group.icon)) &&
      isStringArray(group.items, 120, 40))
  )
}

function isTimelineItem(value: unknown): value is EditableTimelineItem {
  if (!isRecord(value) || !hasOnlyKeys(value, ['id', 'date', 'type', 'kicker', 'title', 'text'])) return false
  return (
    isNonEmptyText(value.id, 80) &&
    isOptionalText(value, 'date', 120) &&
    (!('type' in value) || ['education', 'project', 'next'].includes(String(value.type))) &&
    isNonEmptyText(value.kicker, 120) &&
    isNonEmptyText(value.title, 120) &&
    isNonEmptyText(value.text, 1500)
  )
}

function isCertificate(value: unknown): value is EditableCertificate {
  if (!isRecord(value) || !hasOnlyKeys(value, ['id', 'title', 'issuer', 'year', 'type', 'file'])) return false
  return (
    isNonEmptyText(value.id, 80) &&
    isNonEmptyText(value.title, 120) &&
    isNonEmptyText(value.issuer, 120) &&
    (!('year' in value) || hasRequiredText(value, 'year', 40) ||
      (typeof value.year === 'number' && Number.isFinite(value.year))) &&
    ['image', 'pdf', 'link'].includes(String(value.type)) &&
    (!('file' in value) || value.file === '' || isMediaAssetUrl(value.file))
  )
}

function isResume(value: unknown): value is EditableResume {
  if (!isRecord(value) || !hasOnlyKeys(value, ['currentUrl', 'previous'])) return false
  if ('currentUrl' in value && !isMediaAssetUrl(value.currentUrl)) return false
  if (!('previous' in value)) return true
  return Array.isArray(value.previous) && value.previous.length <= 3 &&
    value.previous.every((item) =>
      isRecord(item) &&
      hasOnlyKeys(item, ['id', 'url', 'uploadedAt']) &&
      hasRequiredText(item, 'id', 80) &&
      isMediaAssetUrl(item.url) &&
      hasRequiredText(item, 'uploadedAt', 80)) &&
    hasUniqueIds(value.previous)
}

export function isEditableContent(value: unknown): value is EditableContent {
  if (!isRecord(value) || !hasOnlyKeys(value, ['person', 'resume', 'about', 'skills', 'projects', 'timeline', 'certificates'])) {
    return false
  }

  if ('person' in value && !isPerson(value.person)) return false
  if ('resume' in value && !isResume(value.resume)) return false
  if ('about' in value && !isAbout(value.about)) return false
  if ('skills' in value && !isSkills(value.skills)) return false
  if ('projects' in value) {
    if (
      !Array.isArray(value.projects) ||
      value.projects.length > 12 ||
      !value.projects.every(isProject) ||
      !hasUniqueIds(value.projects)
    ) return false
  }
  if ('timeline' in value) {
    if (
      !Array.isArray(value.timeline) ||
      value.timeline.length > 40 ||
      !value.timeline.every(isTimelineItem) ||
      !hasUniqueIds(value.timeline)
    ) return false
  }
  if ('certificates' in value) {
    if (
      !Array.isArray(value.certificates) ||
      value.certificates.length > 40 ||
      !value.certificates.every(isCertificate) ||
      !hasUniqueIds(value.certificates)
    ) return false
  }
  return true
}
