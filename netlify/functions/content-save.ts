import { isEditableContent } from '../../src/data/schema'
import { isAuthorized, jsonResponse, readJsonBody } from './_admin-auth'
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
    const envelope = typeof body === 'object' && body !== null && 'content' in body
      ? body as { content: unknown; version?: unknown }
      : { content: body, version: undefined }
    if (!isEditableContent(envelope.content)) return jsonResponse({ error: 'Invalid content document' }, 400)

    const expectedVersion = envelope.version
    if (typeof expectedVersion !== 'number' || !Number.isSafeInteger(expectedVersion) || expectedVersion < 0) {
      return jsonResponse({ error: 'Invalid content version' }, 400)
    }

    const result = await storage.commitContent(envelope.content, expectedVersion)
    if (result.status === 409) return jsonResponse({ error: 'Content changed elsewhere, reload' }, 409)
    return jsonResponse({ saved: true, content: result.content, version: result.version })
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
  }
}

export default createContentSaveHandler(netlifyStorage)
