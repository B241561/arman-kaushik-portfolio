import { isAuthorized, jsonResponse } from './_admin-auth'
import { deleteCurrentContent, readCurrentContent, saveVersion } from './_admin-content'

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, { Allow: 'POST' })
  }
  if (!isAuthorized(request)) return jsonResponse({ error: 'Unauthorized' }, 401)

  try {
    const previous = await readCurrentContent()
    if (previous !== null) await saveVersion(previous)
    await deleteCurrentContent()
    return jsonResponse({ reset: true })
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
}
