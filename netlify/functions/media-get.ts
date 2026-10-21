import { isAuthorized, jsonResponse } from './_admin-auth'
import { MEDIA_TYPES, mediaUrl, normalizeMediaKey, sniffMediaType } from './_media'
import type { StorageAdapter } from '../../server/storage'
import { netlifyStorage } from './_storage'

const assetHeaders = {
  'Cache-Control': 'public, max-age=31536000, immutable',
  'X-Content-Type-Options': 'nosniff',
}
// Misses and errors must never be cached, otherwise a just-uploaded file can stay "missing".
const uncachedHeaders = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
// ?download=1 forces a PDF to save instead of opening inline, which mobile browsers need because
// they ignore the <a download> attribute.
const DOWNLOAD_FILENAME = 'Arman-Kaushik-Resume.pdf'

export function createMediaGetHandler(storage: StorageAdapter) {
  return async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(null, { status: 405, headers: { ...uncachedHeaders, Allow: 'GET, HEAD' } })
  }

  try {
    const url = new URL(request.url)
    if (url.searchParams.get('list') === '1') {
      if (!isAuthorized(request)) return jsonResponse({ error: 'Unauthorized' }, 401)
      const files = (await storage.listMedia()).map((file) => ({ ...file, url: mediaUrl(file.id) }))
      return jsonResponse(files)
    }

    const rawId = url.searchParams.get('id') ?? url.pathname
    const key = normalizeMediaKey(rawId)
    if (!key) {
      return new Response('Not found', { status: 404, headers: uncachedHeaders })
    }
    const stored = await storage.getMedia(key)
    if (!stored) {
      return new Response('Not found', { status: 404, headers: uncachedHeaders })
    }

    const download = url.searchParams.get('download') === '1'
    const bytes = stored.data
    const metaType = stored.type.toLowerCase()
    const type = MEDIA_TYPES.has(metaType) ? metaType : sniffMediaType(bytes) ?? 'application/octet-stream'
    return new Response(request.method === 'HEAD' ? null : bytes, {
      status: 200,
      headers: {
        ...assetHeaders,
        'Content-Type': type,
        'Content-Length': String(bytes.length),
        'Content-Disposition': type === 'application/pdf' && download
          ? `attachment; filename="${DOWNLOAD_FILENAME}"`
          : type === 'application/octet-stream' ? 'attachment' : 'inline',
      },
    })
  } catch {
    console.error('[media-get] failed')
    return new Response('Media unavailable', { status: 500, headers: uncachedHeaders })
  }
  }
}

export default createMediaGetHandler(netlifyStorage)
