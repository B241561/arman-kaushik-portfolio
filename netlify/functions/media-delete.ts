import { getStore } from '@netlify/blobs'
import { isAuthorized, jsonResponse, readJsonBody } from './_admin-auth'

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, { Allow: 'POST' })
  if (!isAuthorized(request)) return jsonResponse({ error: 'Unauthorized' }, 401)

  try {
    const body = await readJsonBody(request)
    if (typeof body !== 'object' || body === null || !('id' in body) || typeof body.id !== 'string' ||
      !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(body.id)) {
      return jsonResponse({ error: 'A valid media id is required' }, 400)
    }
    await getStore('media').delete(body.id)
    return jsonResponse({ deleted: true })
  } catch {
    return jsonResponse({ error: 'Delete failed' }, 500)
  }
}
