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
