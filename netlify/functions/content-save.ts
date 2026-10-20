import { isEditableContent } from '../../src/data/schema'
import { isAuthorized, jsonResponse, readJsonBody } from './_admin-auth'
import { readCurrentContent, saveVersion, writeCurrentContent } from './_admin-content'

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, { Allow: 'POST' })
  }
  if (!isAuthorized(request)) return jsonResponse({ error: 'Unauthorized' }, 401)

  try {
    const body = await readJsonBody(request)
    if (!isEditableContent(body)) return jsonResponse({ error: 'Invalid content document' }, 400)

    const previous = await readCurrentContent()
    if (previous !== null) await saveVersion(previous)
    await writeCurrentContent(body)
    return jsonResponse({ saved: true })
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
}
