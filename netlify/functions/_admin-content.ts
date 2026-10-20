import { randomUUID } from 'node:crypto'
import { getStore } from '@netlify/blobs'

export type ContentVersion = {
  id: string
  createdAt: string
  data: unknown
}

const HISTORY_KEY = 'content-history'
const HISTORY_LIMIT = 10
// Strong consistency so a read right after a save sees the new document.
const siteStore = () => getStore({ name: 'site', consistency: 'strong' })

function isVersion(value: unknown): value is ContentVersion {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'createdAt' in value &&
    typeof value.createdAt === 'string' &&
    'data' in value
  )
}

export async function readVersions(): Promise<ContentVersion[]> {
  const stored = await siteStore().get(HISTORY_KEY, { type: 'json' })
  return Array.isArray(stored) ? stored.filter(isVersion) : []
}

export async function saveVersion(data: unknown) {
  const versions = await readVersions()
  versions.push({ id: randomUUID(), createdAt: new Date().toISOString(), data })
  await siteStore().set(HISTORY_KEY, JSON.stringify(versions.slice(-HISTORY_LIMIT)))
}

export async function readCurrentContent(): Promise<unknown | null> {
  return siteStore().get('content', { type: 'json' })
}

export async function writeCurrentContent(value: unknown) {
  await siteStore().set('content', JSON.stringify(value))
}

export async function deleteCurrentContent() {
  await siteStore().delete('content')
}
