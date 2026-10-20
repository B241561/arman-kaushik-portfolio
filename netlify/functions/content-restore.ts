import { content } from '../../src/data/content'
import { isEditableContent, migrateLegacyAssetUrls } from '../../src/data/schema'
import { isAuthorized, jsonResponse, readJsonBody } from './_admin-auth'
import { readCurrentContent, readVersions, saveVersion, writeCurrentContent } from './_admin-content'

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, { Allow: 'POST' })
  }
  if (!isAuthorized(request)) return jsonResponse({ error: 'Unauthorized' }, 401)

  try {
    const body = await readJsonBody(request)
    if (typeof body !== 'object' || body === null || !('id' in body) || typeof body.id !== 'string') {
      return jsonResponse({ error: 'A version id is required' }, 400)
    }

    const version = (await readVersions()).find((candidate) => candidate.id === body.id)
    if (!version) return jsonResponse({ error: 'Version not found or invalid' }, 404)
    const restored = migrateLegacyAssetUrls(version.data, content.site.url)
    if (!isEditableContent(restored)) return jsonResponse({ error: 'Version not found or invalid' }, 404)

    const previous = await readCurrentContent()
    if (previous !== null) await saveVersion(previous)
    await writeCurrentContent(restored)
    return jsonResponse({ restored: true })
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
}
