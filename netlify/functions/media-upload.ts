import { randomUUID } from 'node:crypto'
import { isAuthorized, jsonResponse } from './_admin-auth'
import { MEDIA_TYPES, mediaUrl, sniffMediaType } from './_media'
import type { StorageAdapter } from '../../server/storage'
import { netlifyStorage } from './_storage'

const MAX_SIZE = 4 * 1024 * 1024

export function createMediaUploadHandler(storage: StorageAdapter) {
  return async function handler(request: Request): Promise<Response> {
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
    if (!MEDIA_TYPES.has(type)) return jsonResponse({ error: 'Unsupported file type' }, 415)

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
    if (sniffMediaType(bytes) !== type) return jsonResponse({ error: 'File contents do not match the selected type' }, 400)

    const id = randomUUID().toLowerCase()
    await storage.putMedia({ id, data: bytes, name, type, size: bytes.length })
    return jsonResponse({ id, url: mediaUrl(id), name, type, size: bytes.length })
  } catch {
    console.error('[media-upload] failed')
    return jsonResponse({ error: 'Upload failed' }, 500)
  }
  }
}

export default createMediaUploadHandler(netlifyStorage)
