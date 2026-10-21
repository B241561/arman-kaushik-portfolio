import { isEditableContent } from '../../src/data/schema'
import { isAuthorized, jsonResponse, readJsonBody } from './_admin-auth'
import { readCurrentContent, saveVersion, writeCurrentContent } from './_admin-content'
import type { StorageAdapter } from '../../server/storage'
import { netlifyStorage } from './_storage'

export function createContentSaveHandler(storage: StorageAdapter) {
  return async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, { Allow: 'POST' })
  }
  if (!isAuthorized(request)) return jsonResponse({ error: 'Unauthorized' }, 401)

  try {
    const body = await readJsonBody(request)
    if (!isEditableContent(body)) return jsonResponse({ error: 'Invalid content document' }, 400)

    const previous = await readCurrentContent(storage)
    if (previous !== null) await saveVersion(previous, storage)
    await writeCurrentContent(body, storage)
    return jsonResponse({ saved: true })
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
  }
}

export default createContentSaveHandler(netlifyStorage)
