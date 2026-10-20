export type ProjectLink = { label: string; href: string; kind: 'repo' | 'live' | 'demo' }
export type EditableProjectLink = { label: string; href: string; kind?: 'repo' | 'live' | 'demo' }

export type ProjectScreenshot = { src: string; alt: string }
export type ProjectFlowStep = { id: string; label: string; description: string }
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

export type EditableAbout = {
  label?: string
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
  kicker: string
  title: string
  text: string
}

export type EditableCertificate = {
  id: string
  title: string
  issuer: string
  year: string | number
  type: string
  file: string
}

export type EditableContent = {
  person?: EditablePerson
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

function isOptionalUrl(value: UnknownRecord, key: string) {
  return !(key in value) || isAllowedAssetUrl(value[key])
}

function hasRequiredText(value: UnknownRecord, key: string, maxLength: number) {
  return key in value && isText(value[key], maxLength)
}

function isScreenshot(value: unknown): value is { src: string; alt: string } {
  if (!isRecord(value) || !hasOnlyKeys(value, ['src', 'alt'])) return false
  return isAllowedAssetUrl(value.src) && hasRequiredText(value, 'alt', 120)
}

function isProjectLink(value: unknown): value is EditableProjectLink {
  if (!isRecord(value) || !hasOnlyKeys(value, ['label', 'href', 'kind'])) return false
  if (!hasRequiredText(value, 'label', 120) || !isAllowedAssetUrl(value.href)) return false
  return !('kind' in value) || value.kind === 'repo' || value.kind === 'live' || value.kind === 'demo'
}

function isFlowStep(value: unknown): value is ProjectFlowStep {
  if (!isRecord(value) || !hasOnlyKeys(value, ['id', 'label', 'description'])) return false
  return (
    hasRequiredText(value, 'id', 80) &&
    hasRequiredText(value, 'label', 120) &&
    hasRequiredText(value, 'description', 1500)
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
    'id', 'name', 'tagline', 'description', 'problem', 'approach', 'stack', 'tags',
    'screenshots', 'demoVideoUrl', 'links', 'flowSteps',
  ])) return false

  return (
    hasRequiredText(value, 'id', 80) &&
    isOptionalText(value, 'name', 120) &&
    isOptionalText(value, 'tagline', 120) &&
    isOptionalText(value, 'description', 1500) &&
    isOptionalText(value, 'problem', 1500) &&
    (!('approach' in value) || isStringArray(value.approach, 1500, 30)) &&
    (!('stack' in value) || isStringArray(value.stack, 120, 40)) &&
    (!('tags' in value) || isStringArray(value.tags, 120, 40)) &&
    (!('screenshots' in value) ||
      (Array.isArray(value.screenshots) && value.screenshots.length <= 12 && value.screenshots.every(isScreenshot))) &&
    isOptionalUrl(value, 'demoVideoUrl') &&
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
    !isOptionalUrl(value, 'resumeUrl')
  ) return false
  if (!('photo' in value)) return true
  return (
    isRecord(value.photo) &&
    hasOnlyKeys(value.photo, ['src', 'alt']) &&
    isOptionalUrl(value.photo, 'src') &&
    isOptionalText(value.photo, 'alt', 120)
  )
}

function isAbout(value: unknown): value is EditableAbout {
  if (!isRecord(value) || !hasOnlyKeys(value, ['label', 'body', 'highlights', 'stats', 'status'])) return false
  if (
    !isOptionalText(value, 'label', 120) ||
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
      hasRequiredText(group, 'title', 120) &&
      ['code', 'brain', 'chart', 'globe'].includes(String(group.icon)) &&
      isStringArray(group.items, 120, 40))
  )
}

function isTimelineItem(value: unknown): value is EditableTimelineItem {
  if (!isRecord(value) || !hasOnlyKeys(value, ['id', 'date', 'kicker', 'title', 'text'])) return false
  return (
    hasRequiredText(value, 'id', 80) &&
    isOptionalText(value, 'date', 120) &&
    hasRequiredText(value, 'kicker', 120) &&
    hasRequiredText(value, 'title', 120) &&
    hasRequiredText(value, 'text', 1500)
  )
}

function isCertificate(value: unknown): value is EditableCertificate {
  if (!isRecord(value) || !hasOnlyKeys(value, ['id', 'title', 'issuer', 'year', 'type', 'file'])) return false
  return (
    hasRequiredText(value, 'id', 80) &&
    hasRequiredText(value, 'title', 120) &&
    hasRequiredText(value, 'issuer', 120) &&
    (hasRequiredText(value, 'year', 40) ||
      (typeof value.year === 'number' && Number.isFinite(value.year))) &&
    hasRequiredText(value, 'type', 80) &&
    'file' in value &&
    isAllowedAssetUrl(value.file)
  )
}

export function isEditableContent(value: unknown): value is EditableContent {
  if (!isRecord(value) || !hasOnlyKeys(value, ['person', 'about', 'skills', 'projects', 'timeline', 'certificates'])) {
    return false
  }

  if ('person' in value && !isPerson(value.person)) return false
  if ('about' in value && !isAbout(value.about)) return false
  if ('skills' in value && !isSkills(value.skills)) return false
  if ('projects' in value) {
    if (
      !Array.isArray(value.projects) ||
      value.projects.length > 20 ||
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
