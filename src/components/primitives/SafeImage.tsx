import { useEffect, useState, type ImgHTMLAttributes } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { cn } from '../../lib/cn'

type SafeImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: string | undefined
  fallbackLabel?: string
}

/** An <img> that swaps to a neutral placeholder when the source is missing, 404s or isn't an image. */
export function SafeImage({ src, className, fallbackLabel = 'Image unavailable', onError, ...rest }: SafeImageProps) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [src])

  if (!src || failed) {
    return (
      <div role="img" aria-label={rest.alt || fallbackLabel} className={cn('text-subtle grid min-h-24 place-items-center gap-1 border border-[var(--line)] p-4 text-center text-xs', className)}>
        <ImageIcon aria-hidden className="size-5" />
        <span>{fallbackLabel}</span>
      </div>
    )
  }
  return (
    <img
      {...rest}
      src={src}
      className={className}
      onError={(event) => {
        setFailed(true)
        try { onError?.(event) } catch { /* image failures must never throw */ }
      }}
    />
  )
}
