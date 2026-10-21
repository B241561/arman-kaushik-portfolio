import { getStore } from '@netlify/blobs'
import type { HistoryVersion, LoginFailureState, MediaMetadata, MediaRecord, StorageAdapter } from '../../server/storage'
import { MEDIA_STORE_NAME } from './_media'

const siteStore = () => getStore({ name: 'site', consistency: 'strong' })
const mediaStore = () => getStore({ name: MEDIA_STORE_NAME, consistency: 'strong' })
const HISTORY_KEY = 'content-history'

function isLoginFailureState(value: unknown): value is LoginFailureState {
  return typeof value === 'object'
    && value !== null
    && 'count' in value
    && typeof value.count === 'number'
    && 'expiresAt' in value
    && typeof value.expiresAt === 'number'
}

export const netlifyStorage: StorageAdapter = {
  async healthCheck() {},
  async getContent() {
    return siteStore().get('content', { type: 'json' })
  },
  async setContent(value) {
    await siteStore().set('content', JSON.stringify(value))
  },
  async deleteContent() {
    await siteStore().delete('content')
  },
  async getHistory() {
    const value = await siteStore().get(HISTORY_KEY, { type: 'json' })
    return Array.isArray(value) ? value as HistoryVersion[] : []
  },
  async setHistory(versions) {
    await siteStore().set(HISTORY_KEY, JSON.stringify(versions.slice(-10)))
  },
  async isRateLimited(key, now, limit) {
    const value: unknown = await siteStore().get(key, { type: 'json' })
    return isLoginFailureState(value) && value.expiresAt > now && value.count >= limit
  },
  async recordLoginFailure(key, now, windowMs) {
    const value: unknown = await siteStore().get(key, { type: 'json' })
    const state = isLoginFailureState(value) ? value : null
    const next = state && state.expiresAt > now
      ? { count: state.count + 1, expiresAt: state.expiresAt }
      : { count: 1, expiresAt: now + windowMs }
    await siteStore().set(key, JSON.stringify(next))
    return next
  },
  async clearLoginFailures(key) {
    await siteStore().delete(key)
  },
  async getMedia(id) {
    const result = await mediaStore().getWithMetadata(id, { type: 'arrayBuffer' })
    if (!result) return null
    const metadata = result.metadata ?? {}
    return {
      id,
      data: new Uint8Array(result.data),
      name: typeof metadata.name === 'string' ? metadata.name : 'Media file',
      type: typeof metadata.type === 'string' ? metadata.type : '',
      size: typeof metadata.size === 'number' ? metadata.size : result.data.byteLength,
    }
  },
  async putMedia(media) {
    await mediaStore().set(media.id, media.data, {
      metadata: { name: media.name, type: media.type, size: media.size },
    })
  },
  async deleteMedia(id) {
    await mediaStore().delete(id)
  },
  async listMedia() {
    const store = mediaStore()
    const listing = await store.list()
    const files = await Promise.all(listing.blobs.map(async ({ key }) => {
      const result = await store.getMetadata(key)
      const metadata = result?.metadata ?? {}
      return {
        id: key,
        name: typeof metadata.name === 'string' ? metadata.name : 'Media file',
        type: typeof metadata.type === 'string' ? metadata.type : '',
        size: typeof metadata.size === 'number' ? metadata.size : 0,
      }
    }))
    return files as MediaMetadata[]
  },
}
