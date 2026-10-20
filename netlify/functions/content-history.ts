import { isAuthorized, jsonResponse } from './_admin-auth'
import { readVersions } from './_admin-content'

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405, { Allow: 'GET' })
  }
  if (!isAuthorized(request)) return jsonResponse({ error: 'Unauthorized' }, 401)

  try {
    const versions = await readVersions()
    return jsonResponse(versions.map(({ id, createdAt }) => ({ id, createdAt })).reverse())
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
}
