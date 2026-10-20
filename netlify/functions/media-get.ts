import { isAuthorized, jsonResponse } from './_admin-auth'
import { MEDIA_STORE_NAME, MEDIA_TYPES, mediaStore, mediaUrl, normalizeMediaKey, sniffMediaType } from './_media'

const assetHeaders = {
  'Cache-Control': 'public, max-age=31536000, immutable',
  'X-Content-Type-Options': 'nosniff',
}
// Misses and errors must never be cached, otherwise a just-uploaded file can stay "missing".
const uncachedHeaders = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
// ?download=1 forces a PDF to save instead of opening inline, which mobile browsers need because
// they ignore the <a download> attribute.
const DOWNLOAD_FILENAME = 'Arman-Kaushik-Resume.pdf'

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(null, { status: 405, headers: { ...uncachedHeaders, Allow: 'GET, HEAD' } })
  }

  try {
    const url = new URL(request.url)
    if (url.searchParams.get('list') === '1') {
      if (!isAuthorized(request)) return jsonResponse({ error: 'Unauthorized' }, 401)
      const store = mediaStore()
      const listing = await store.list()
      const files = await Promise.all(listing.blobs.map(async ({ key }) => {
        const result = await store.getMetadata(key)
        const metadata = result?.metadata ?? {}
        return {
          id: key,
          url: mediaUrl(key),
          name: typeof metadata.name === 'string' ? metadata.name : 'Media file',
          type: typeof metadata.type === 'string' ? metadata.type : '',
          size: typeof metadata.size === 'number' ? metadata.size : 0,
        }
      }))
      return jsonResponse(files)
    }

    const rawId = url.searchParams.get('id') ?? url.pathname
    const key = normalizeMediaKey(rawId)
    if (!key) {
      console.log(`[media-get] invalid id store=${MEDIA_STORE_NAME} requested=${JSON.stringify(rawId.slice(0, 80))}`)
      return new Response('Not found', { status: 404, headers: uncachedHeaders })
    }
    const stored = await mediaStore().getWithMetadata(key, { type: 'arrayBuffer' })
    if (!stored) {
      console.log(`[media-get] missing store=${MEDIA_STORE_NAME} key=${key}`)
      return new Response('Not found', { status: 404, headers: uncachedHeaders })
    }

    const download = url.searchParams.get('download') === '1'
    const bytes = new Uint8Array(stored.data)
    const metaType = typeof stored.metadata.type === 'string' ? stored.metadata.type.toLowerCase() : ''
    const type = MEDIA_TYPES.has(metaType) ? metaType : sniffMediaType(bytes) ?? 'application/octet-stream'
    console.log(`[media-get] served store=${MEDIA_STORE_NAME} key=${key} size=${bytes.length} type=${type}${type !== metaType ? ` (metadata type ${JSON.stringify(metaType)})` : ''}`)
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
  } catch (error) {
    console.error(`[media-get] failed store=${MEDIA_STORE_NAME}`, error instanceof Error ? error.message : error)
    return new Response('Media unavailable', { status: 500, headers: uncachedHeaders })
  }
}
