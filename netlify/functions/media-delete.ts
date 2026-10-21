import { isAuthorized, jsonResponse, readJsonBody } from './_admin-auth'
import { normalizeMediaKey } from './_media'
import type { StorageAdapter } from '../../server/storage'
import { netlifyStorage } from './_storage'

export function createMediaDeleteHandler(storage: StorageAdapter) {
  return async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, { Allow: 'POST' })
  if (!isAuthorized(request)) return jsonResponse({ error: 'Unauthorized' }, 401)

  try {
    const body = await readJsonBody(request)
    const key = typeof body === 'object' && body !== null && 'id' in body && typeof body.id === 'string'
      ? normalizeMediaKey(body.id)
      : null
    if (!key) return jsonResponse({ error: 'A valid media id is required' }, 400)
    await storage.deleteMedia(key)
    return jsonResponse({ deleted: true })
  } catch {
    return jsonResponse({ error: 'Delete failed' }, 500)
  }
  }
}

export default createMediaDeleteHandler(netlifyStorage)
