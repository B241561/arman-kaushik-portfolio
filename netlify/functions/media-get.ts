import { getStore } from '@netlify/blobs'
import { isAuthorized, jsonResponse } from './_admin-auth'

const mimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
const assetHeaders = {
  'Cache-Control': 'public, max-age=31536000, immutable',
  'X-Content-Type-Options': 'nosniff',
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(null, { status: 405, headers: { ...assetHeaders, 'Cache-Control': 'no-store', Allow: 'GET, HEAD' } })
  }

  let listingRequest = false
  try {
    const url = new URL(request.url)
    listingRequest = url.searchParams.get('list') === '1'
    if (listingRequest) {
      if (!isAuthorized(request)) return jsonResponse({ error: 'Unauthorized' }, 401)
      const store = getStore('media')
      const listing = await store.list()
      const files = await Promise.all(listing.blobs.map(async ({ key }) => {
        const result = await store.getMetadata(key)
        const metadata = result?.metadata ?? {}
        return {
          id: key,
          url: `/media/${key}`,
          name: typeof metadata.name === 'string' ? metadata.name : 'Media file',
          type: typeof metadata.type === 'string' ? metadata.type : '',
          size: typeof metadata.size === 'number' ? metadata.size : 0,
        }
      }))
      return jsonResponse(files)
    }

    const id = url.searchParams.get('id')
    if (!id || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id)) {
      return new Response('Not found', { status: 404, headers: assetHeaders })
    }
    const store = getStore('media')
    const stored = await store.getWithMetadata(id, { type: 'stream' })
    if (!stored || typeof stored.metadata.type !== 'string' || !mimeTypes.has(stored.metadata.type)) {
      return new Response('Not found', { status: 404, headers: assetHeaders })
    }
    return new Response(request.method === 'HEAD' ? null : stored.data, {
      status: 200,
      headers: {
        ...assetHeaders,
        'Content-Type': stored.metadata.type,
        ...(typeof stored.metadata.size === 'number' ? { 'Content-Length': String(stored.metadata.size) } : {}),
        'Content-Disposition': 'inline',
      },
    })
  } catch {
    return new Response('Media unavailable', {
      status: 500,
      headers: listingRequest ? { ...assetHeaders, 'Cache-Control': 'no-store' } : assetHeaders,
    })
  }
}
