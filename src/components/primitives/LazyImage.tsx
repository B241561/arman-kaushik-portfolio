import { useState } from 'react'
import { cn } from '../../lib/cn'
import { cdnImage } from '../../lib/image'

type LazyImageProps = {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  onError?: () => void
}

/** Native lazy-loading + async decoding, served via the Image CDN, with a soft fade-in. */
export function LazyImage({ src, alt, width, height, className, onError }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false)
  return (
    <img
      src={src.startsWith('/media/') ? src : cdnImage(src, width * 2)}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={onError}
      className={cn(
        'transition-[opacity,filter] duration-700 ease-[var(--ease-apple)]',
        loaded ? 'opacity-100 blur-none' : 'opacity-0 blur-md',
        className,
      )}
    />
  )
}
