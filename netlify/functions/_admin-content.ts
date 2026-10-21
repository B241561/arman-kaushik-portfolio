import { randomUUID } from 'node:crypto'
import type { StorageAdapter } from '../../server/storage'
import { netlifyStorage } from './_storage'

const HISTORY_LIMIT = 10
export type ContentVersion = import('../../server/storage').HistoryVersion

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

export async function readVersions(storage: StorageAdapter = netlifyStorage): Promise<ContentVersion[]> {
  return (await storage.getHistory()).filter(isVersion)
}

export async function saveVersion(data: unknown, storage: StorageAdapter = netlifyStorage) {
  const versions = await readVersions(storage)
  versions.push({ id: randomUUID(), createdAt: new Date().toISOString(), data })
  await storage.setHistory(versions.slice(-HISTORY_LIMIT))
}

export async function readCurrentContent(storage: StorageAdapter = netlifyStorage): Promise<unknown | null> {
  return storage.getContent()
}

export async function writeCurrentContent(value: unknown, storage: StorageAdapter = netlifyStorage) {
  await storage.setContent(value)
}

export async function deleteCurrentContent(storage: StorageAdapter = netlifyStorage) {
  await storage.deleteContent()
}
