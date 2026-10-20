import { getStore } from '@netlify/blobs'

const headers = {
  // Never cache: the CDN would otherwise serve the pre-save document to the site and the admin.
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(null, {
      status: 405,
      headers: { ...headers, Allow: 'GET, HEAD' },
    })
  }

  const content = await getStore({ name: 'site', consistency: 'strong' }).get('content', { type: 'json' })
  return new Response(request.method === 'HEAD' ? null : JSON.stringify(content ?? {}), {
    status: 200,
    headers,
  })
}
