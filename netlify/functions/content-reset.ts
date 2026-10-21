import { isAuthorized, jsonResponse } from './_admin-auth'
import { deleteCurrentContent, readCurrentContent, saveVersion } from './_admin-content'
import type { StorageAdapter } from '../../server/storage'
import { netlifyStorage } from './_storage'

export function createContentResetHandler(storage: StorageAdapter) {
  return async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, { Allow: 'POST' })
  }
  if (!isAuthorized(request)) return jsonResponse({ error: 'Unauthorized' }, 401)

  try {
    const previous = await readCurrentContent(storage)
    if (previous !== null) await saveVersion(previous, storage)
    await deleteCurrentContent(storage)
    return jsonResponse({ reset: true })
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
  }
}

export default createContentResetHandler(netlifyStorage)
