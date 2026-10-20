import { useEffect, useState } from 'react'
import { content } from '../data/content'
import {
  isEditableContent,
  migrateLegacyAssetUrls,
  type EditableContent,
  type EditableProject,
  type EditableCertificate,
  type EditableTimelineItem,
  type JourneyItem,
  type Project,
  type ProjectLink,
} from '../data/schema'

// Bump the suffix whenever the saved-content schema changes incompatibly.
const CACHE_KEY = 'portfolio-content-v1'
type SiteContent = typeof content
type RecordValue = Record<string, unknown>

let contentRequest: Promise<SiteContent> | undefined
const defaultAssetPaths = new Set([
  '/img/profile.jpg',
  '/img/feynml.png',
  '/img/resume-analyzer.png',
  '/img/tripcraft.png',
  '/img/tripcraft.webp',
  '/Arman_kaushik_resume.pdf',
])

function restoreDefaultAssetPath(value: string): string {
  try {
    const parsed = new URL(value)
    const defaultOrigin = new URL(content.site.url).origin
    return parsed.origin === defaultOrigin && defaultAssetPaths.has(parsed.pathname)
      ? parsed.pathname
      : value
  } catch {
    return value
  }
}

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function mergeValues(defaultValue: unknown, savedValue: unknown): unknown {
  if (Array.isArray(savedValue)) {
    const defaults = Array.isArray(defaultValue) ? defaultValue : []
    return savedValue.map((item, index) => {
      const itemId = isRecord(item) && typeof item.id === 'string' ? item.id : null
      const matchingDefault = itemId
        ? defaults.find((candidate) => isRecord(candidate) && candidate.id === itemId)
        : undefined
      return mergeValues(matchingDefault ?? defaults[index] ?? {}, item)
    })
  }

  if (isRecord(savedValue)) {
    const defaults = isRecord(defaultValue) ? defaultValue : {}
    const merged: RecordValue = { ...defaults }
    for (const [key, value] of Object.entries(savedValue)) {
      if (value !== undefined) merged[key] = mergeValues(defaults[key], value)
    }
    return merged
  }

  return savedValue
}

function mapProject(project: EditableProject, index: number): Partial<Project> & Pick<Project, 'id' | 'index' | 'icon'> {
  const defaultProject = content.projects.items.find((item) => item.id === project.id)
  const mapped: Partial<Project> & Pick<Project, 'id' | 'index' | 'icon'> = {
    id: project.id,
    index: defaultProject?.index ?? String(index + 1).padStart(2, '0'),
    icon: defaultProject?.icon ?? 'feynml',
  }

  if (project.name !== undefined) mapped.title = project.name
  if (project.tagline !== undefined) mapped.tagline = project.tagline
  if (project.description !== undefined) mapped.summary = project.description
  if (project.problem !== undefined) mapped.problem = project.problem
  if (project.stack !== undefined) mapped.stack = project.stack
  if (project.tags !== undefined) mapped.tags = project.tags
  if (project.flowSteps !== undefined) {
    mapped.flowSteps = project.flowSteps
  }
  if (project.approach !== undefined) mapped.approach = project.approach
  if (project.screenshots !== undefined) {
    mapped.screenshots = project.screenshots.filter((screenshot) => screenshot.src !== '').map((screenshot) => ({
      ...screenshot,
      src: restoreDefaultAssetPath(screenshot.src),
    }))
    mapped.image = mapped.screenshots[0]?.src ?? ''
    mapped.imageAlt = mapped.screenshots[0]?.alt
  }

  let links: ProjectLink[] | undefined
  if (project.links !== undefined) {
    links = project.links.map((link) => ({ ...link, kind: link.kind ?? 'live' }))
  }
  if (project.demoVideoUrl) {
    links ??= defaultProject?.links ?? []
    links = links.filter((link) => link.kind !== 'demo')
    links.push({ label: 'Demo video', href: project.demoVideoUrl, kind: 'demo' })
    mapped.demoVideoUrl = project.demoVideoUrl
  } else if (links !== undefined) {
    const savedDemo = links.find((link) => link.kind === 'demo')
    links = links.filter((link) => link.kind !== 'demo')
    if (project.demoVideoUrl === undefined && savedDemo) {
      mapped.demoVideoUrl = savedDemo.href
      links.push(savedDemo)
    }
  }
  if (project.demoVideoUrl === '') mapped.demoVideoUrl = ''
  if (links !== undefined) mapped.links = links

  if (!defaultProject) {
    mapped.title ??= project.name ?? ''
    mapped.tagline ??= project.tagline ?? ''
    mapped.summary ??= project.description ?? ''
    mapped.problem ??= project.problem ?? ''
    mapped.approach ??= []
    mapped.stack ??= []
    mapped.tags ??= []
    mapped.screenshots ??= []
    mapped.links ??= []
    mapped.image ??= ''
    mapped.flowSteps ??= []
  }

  return mapped
}

function mapTimelineItem(item: EditableTimelineItem): JourneyItem {
  const defaultItem = content.journey.items.find((candidate) => candidate.id === item.id)
  return {
    id: item.id,
    ...(item.date !== undefined ? { date: item.date } : {}),
    title: item.title,
    kicker: item.kicker,
    text: item.text,
    type: defaultItem?.type ?? 'project',
  }
}

function toContentPatch(saved: EditableContent): RecordValue {
  const patch: RecordValue = {}

  if (saved.person) {
    const person: RecordValue = { ...saved.person }
    if (typeof person.resumeUrl === 'string') person.resumeUrl = restoreDefaultAssetPath(person.resumeUrl)
    if (isRecord(person.photo) && typeof person.photo.src === 'string') {
      person.photo = { ...person.photo, src: restoreDefaultAssetPath(person.photo.src) }
    }
    if (saved.person.name !== undefined) {
      person.firstName = saved.person.name.trim().split(/\s+/)[0] ?? ''
      person.initials = saved.person.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0] ?? '')
        .join('')
    }
    patch.person = person
  }
  if (saved.resume?.currentUrl) {
    patch.person = {
      ...(isRecord(patch.person) ? patch.person : {}),
      resumeUrl: restoreDefaultAssetPath(saved.resume.currentUrl),
    }
  }
  if (saved.about) patch.about = saved.about
  if (saved.skills) patch.skills = saved.skills
  if (saved.projects) patch.projects = saved.projects.map(mapProject)
  if (saved.timeline) patch.journey = { items: saved.timeline.map(mapTimelineItem) }
  if (saved.certificates) patch.certificates = saved.certificates.map((certificate): EditableCertificate => ({
    ...certificate,
    year: certificate.year ?? '',
    file: certificate.file ? restoreDefaultAssetPath(certificate.file) : '',
  }))

  return patch
}

function cacheContent(saved: EditableContent) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(saved))
  } catch {
    // Storage can be unavailable; the network response remains usable.
  }
}

async function fetchContent(): Promise<SiteContent> {
  try {
    const response = await fetch('/.netlify/functions/content-get', { cache: 'no-store' })
    if (!response.ok) return content
    const value: unknown = migrateLegacyAssetUrls(await response.json(), content.site.url)
    if (!isEditableContent(value)) return content

    if (Object.keys(value).length === 0) {
      try { localStorage.removeItem(CACHE_KEY) } catch { /* storage can be unavailable */ }
      return content
    }

    cacheContent(value)
    return mergeValues(content, toContentPatch(value)) as SiteContent
  } catch {
    return content
  }
}

export function useContent(): SiteContent {
  const [currentContent, setCurrentContent] = useState<SiteContent>(content)

  useEffect(() => {
    contentRequest ??= fetchContent()
    void contentRequest.then(setCurrentContent)
  }, [])

  return currentContent
}
