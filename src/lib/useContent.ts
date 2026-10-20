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

// A saved array replaces the default array outright: its length, order and members come from the
// saved document. Only an item whose id matches a default item borrows that item's missing fields;
// there is no positional fallback, so new items never inherit fields from an unrelated default.
function mergeValues(defaultValue: unknown, savedValue: unknown): unknown {
  if (Array.isArray(savedValue)) {
    const defaults = Array.isArray(defaultValue) ? defaultValue : []
    return savedValue.map((item) => {
      const itemId = isRecord(item) && typeof item.id === 'string' ? item.id : null
      const matchingDefault = itemId
        ? defaults.find((candidate) => isRecord(candidate) && candidate.id === itemId)
        : undefined
      return matchingDefault ? mergeValues(matchingDefault, item) : item
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

  // Fields still missing on a new project are filled in by normalizeProject after the merge.
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
  // The saved document stores projects as a bare array, but the site content keeps them under
  // projects.items next to the section's label/title/subtitle.
  if (saved.projects) patch.projects = { items: saved.projects.map(mapProject) }
  if (saved.timeline) patch.journey = { items: saved.timeline.map(mapTimelineItem) }
  if (saved.certificates) patch.certificates = saved.certificates.map((certificate): EditableCertificate => ({
    ...certificate,
    year: certificate.year ?? '',
    file: certificate.file ? restoreDefaultAssetPath(certificate.file) : '',
  }))

  return patch
}

const text = (value: unknown, fallback = ''): string => (typeof value === 'string' ? value : fallback)
const textList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
const records = (value: unknown): RecordValue[] => (Array.isArray(value) ? value.filter(isRecord) : [])
const oneOf = <T extends string>(value: unknown, options: readonly T[], fallback: T): T =>
  options.includes(value as T) ? (value as T) : fallback

const projectIcons = ['feynml', 'resume', 'tripcraft'] as const
const linkKinds = ['repo', 'live', 'demo'] as const
const skillIcons = ['code', 'brain', 'chart', 'globe'] as const
const journeyTypes = ['education', 'project', 'next'] as const
const certificateTypes = ['image', 'pdf', 'link'] as const

// Gives every project field a safe value (arrays [], strings ''), whatever the saved item contained.
function normalizeProject(value: RecordValue, index: number): Project {
  const screenshots = records(value.screenshots)
    .filter((screenshot) => typeof screenshot.src === 'string' && screenshot.src !== '')
    .map((screenshot) => ({ src: text(screenshot.src), alt: text(screenshot.alt) }))
  const project: Project = {
    id: text(value.id) || `project-${index + 1}`,
    index: text(value.index) || String(index + 1).padStart(2, '0'),
    title: text(value.title),
    tagline: text(value.tagline),
    summary: text(value.summary),
    icon: oneOf(value.icon, projectIcons, 'feynml'),
    image: text(value.image),
    screenshots,
    tags: textList(value.tags),
    flowSteps: records(value.flowSteps).map((step, stepIndex) => ({
      id: text(step.id) || `step-${stepIndex + 1}`,
      label: text(step.label),
      description: text(step.description),
    })),
    problem: text(value.problem),
    approach: textList(value.approach),
    stack: textList(value.stack),
    links: records(value.links)
      .filter((link) => typeof link.href === 'string' && link.href !== '')
      .map((link) => ({ label: text(link.label), href: text(link.href), kind: oneOf(link.kind, linkKinds, 'live') })),
    featured: value.featured === true,
  }
  if (typeof value.imageAlt === 'string') project.imageAlt = value.imageAlt
  if (typeof value.demoVideoUrl === 'string') project.demoVideoUrl = value.demoVideoUrl
  return project
}

// Runs on every read so sections never dereference a missing field, whichever section was saved.
function normalizeContent(value: SiteContent): SiteContent {
  const site = value as unknown as RecordValue
  const section = (key: string): RecordValue => (isRecord(site[key]) ? site[key] : {})
  const person = section('person')
  const photo = isRecord(person.photo) ? person.photo : {}
  const about = section('about')
  const status = isRecord(about.status) ? about.status : {}
  const skills = section('skills')
  const projects = section('projects')
  const journey = section('journey')

  return {
    ...value,
    person: {
      ...value.person,
      name: text(person.name),
      firstName: text(person.firstName),
      initials: text(person.initials),
      tagline: text(person.tagline),
      resumeUrl: text(person.resumeUrl),
      photo: { src: text(photo.src), alt: text(photo.alt) },
    },
    about: {
      ...value.about,
      label: text(about.label, content.about.label),
      body: text(about.body),
      highlights: textList(about.highlights),
      stats: records(about.stats)
        .filter((stat) => typeof stat.value === 'number' && Number.isFinite(stat.value))
        .map((stat) => ({ value: stat.value as number, label: text(stat.label) })),
      status: { title: text(status.title, content.about.status.title), lines: textList(status.lines) },
    },
    skills: {
      ...value.skills,
      label: text(skills.label, content.skills.label),
      title: text(skills.title, content.skills.title),
      subtitle: text(skills.subtitle, content.skills.subtitle),
      groups: records(skills.groups).map((group) => ({
        title: text(group.title),
        icon: oneOf(group.icon, skillIcons, 'code'),
        items: textList(group.items),
      })),
    },
    projects: {
      ...value.projects,
      label: text(projects.label, content.projects.label),
      title: text(projects.title, content.projects.title),
      subtitle: text(projects.subtitle, content.projects.subtitle),
      sections: { ...content.projects.sections, ...(isRecord(projects.sections) ? projects.sections : {}) },
      items: records(projects.items).map(normalizeProject),
    },
    journey: {
      ...value.journey,
      label: text(journey.label, content.journey.label),
      title: text(journey.title, content.journey.title),
      items: records(journey.items).map((item, index): JourneyItem => ({
        id: text(item.id) || `journey-${index + 1}`,
        ...(typeof item.date === 'string' ? { date: item.date } : {}),
        title: text(item.title),
        kicker: text(item.kicker),
        text: text(item.text),
        type: oneOf(item.type, journeyTypes, 'project'),
      })) as SiteContent['journey']['items'],
    },
    certificates: records(site.certificates).map((certificate, index) => ({
      id: text(certificate.id) || `certificate-${index + 1}`,
      title: text(certificate.title),
      issuer: text(certificate.issuer),
      year: typeof certificate.year === 'number' ? certificate.year : text(certificate.year),
      type: oneOf(certificate.type, certificateTypes, 'link'),
      file: text(certificate.file),
    })),
  }
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
    return normalizeContent(mergeValues(content, toContentPatch(value)) as SiteContent)
  } catch {
    return content
  }
}

let loadedContent: SiteContent | undefined

/** Resolves once the saved content has been fetched (or the defaults, if that fails). */
export function loadContent(): Promise<SiteContent> {
  contentRequest ??= fetchContent().then((value) => (loadedContent = value))
  return contentRequest
}

export const isContentLoaded = () => loadedContent !== undefined

export function useContent(): SiteContent {
  const [currentContent, setCurrentContent] = useState<SiteContent>(loadedContent ?? content)

  useEffect(() => {
    void loadContent().then(setCurrentContent)
  }, [])

  return currentContent
}
