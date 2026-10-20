import { randomUUID } from 'node:crypto'
import { getStore } from '@netlify/blobs'
import { isAuthorized, jsonResponse } from './_admin-auth'

const MAX_SIZE = 4 * 1024 * 1024
const supportedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])

function matchesSignature(bytes: Uint8Array, type: string) {
  if (type === 'image/jpeg') return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  if (type === 'image/png') return bytes.length >= 8 && bytes.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10'
  if (type === 'image/webp') return bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  if (type === 'application/pdf') return String.fromCharCode(...bytes.slice(0, 5)) === '%PDF-'
  return false
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, { Allow: 'POST' })
  if (!isAuthorized(request)) return jsonResponse({ error: 'Unauthorized' }, 401)

  try {
    const type = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase() ?? ''
    let decodedName = request.headers.get('x-file-name') ?? 'upload'
    try {
      decodedName = decodeURIComponent(decodedName)
    } catch {
      return jsonResponse({ error: 'Invalid file name encoding' }, 400)
    }
    const name = decodedName.replace(/[\\/\r\n]/g, '_').slice(0, 120)
    if (!supportedTypes.has(type)) return jsonResponse({ error: 'Unsupported file type' }, 415)

    const contentLength = Number(request.headers.get('content-length'))
    if (Number.isFinite(contentLength) && contentLength > MAX_SIZE) {
      return jsonResponse({ error: 'File must be no larger than 4 MB' }, 413)
    }
    if (!request.body) return jsonResponse({ error: 'A file body is required' }, 400)
    const reader = request.body.getReader()
    const chunks: Uint8Array[] = []
    let total = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.length
      if (total > MAX_SIZE) {
        await reader.cancel()
        return jsonResponse({ error: 'File must be no larger than 4 MB' }, 413)
      }
      chunks.push(value)
    }
    if (total === 0) return jsonResponse({ error: 'File body is empty' }, 400)
    const bytes = new Uint8Array(total)
    let offset = 0
    for (const chunk of chunks) {
      bytes.set(chunk, offset)
      offset += chunk.length
    }
    if (!matchesSignature(bytes, type)) return jsonResponse({ error: 'File contents do not match the selected type' }, 400)

    const id = randomUUID()
    await getStore('media').set(id, bytes, { metadata: { name, type, size: bytes.length } })
    return jsonResponse({ id, url: `/media/${id}`, name, type, size: bytes.length })
  } catch {
    return jsonResponse({ error: 'Upload failed' }, 500)
  }
}
