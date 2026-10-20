/** Route local images through the Netlify Image CDN in production (resized, WebP). */
export function cdnImage(src: string, width: number) {
  const onNetlify = typeof window !== 'undefined' && window.location.hostname.endsWith('.netlify.app')
  if (!import.meta.env.PROD || !onNetlify || !src.startsWith('/')) return src
  return `/.netlify/images?url=${encodeURIComponent(src)}&w=${width}&fm=webp`
}
