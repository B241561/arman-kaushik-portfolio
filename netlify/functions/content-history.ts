import { isAuthorized, jsonResponse } from './_admin-auth'
import { readVersions } from './_admin-content'
import type { StorageAdapter } from '../../server/storage'
import { netlifyStorage } from './_storage'

export function createContentHistoryHandler(storage: StorageAdapter) {
  return async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405, { Allow: 'GET' })
  }
  if (!isAuthorized(request)) return jsonResponse({ error: 'Unauthorized' }, 401)

  try {
    const versions = await readVersions(storage)
    return jsonResponse(versions.map(({ id, createdAt }) => ({ id, createdAt })).reverse())
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
  }
}

export default createContentHistoryHandler(netlifyStorage)
