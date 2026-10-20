import { getStore } from '@netlify/blobs'

/** Single source of truth for where uploaded media lives, shared by upload, get, list and delete. */
export const MEDIA_STORE_NAME = 'media'
export const MEDIA_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])

const MEDIA_KEY_PATTERN = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/

/** Strong consistency so a blob is readable immediately after the upload request returns. */
export const mediaStore = () => getStore({ name: MEDIA_STORE_NAME, consistency: 'strong' })

/** Keys are lowercase UUIDs; normalising here keeps the uploaded key and the requested key identical. */
export function normalizeMediaKey(value: string | null | undefined): string | null {
  if (!value) return null
  let key = value.trim()
  try {
    key = decodeURIComponent(key)
  } catch {
    return null
  }
  key = key.replace(/^\/?media\//, '').replace(/[/?#].*$/, '').toLowerCase()
  return MEDIA_KEY_PATTERN.test(key) ? key : null
}

export const mediaUrl = (key: string) => `/media/${key}`

/** Detects an allowed media type from the file's magic bytes, or null if none match. */
export function sniffMediaType(bytes: Uint8Array): string | null {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end))
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (bytes.length >= 8 && bytes.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10') return 'image/png'
  if (bytes.length >= 12 && ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp'
  if (bytes.length >= 5 && ascii(0, 5) === '%PDF-') return 'application/pdf'
  return null
}
