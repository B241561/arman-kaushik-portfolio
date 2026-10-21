import { useEffect, useState } from 'react'
import { isPlaceholder } from '../../lib/placeholder'
import { useContent } from '../../lib/useContent'
import { LazyImage } from '../primitives/LazyImage'

export function ProfilePhoto() {
  const { person } = useContent()
  const [photoFailed, setPhotoFailed] = useState(false)
  useEffect(() => setPhotoFailed(false), [person.photo.src])

  const hasPhoto = !isPlaceholder(person.photo.src) && !photoFailed

  return (
    <div className="aspect-[16/9] w-full overflow-hidden border border-line bg-surface">
      {hasPhoto ? (
        <LazyImage
          src={person.photo.src}
          alt={person.photo.alt}
          width={1200}
          height={675}
          className="size-full object-cover object-center"
          onError={() => setPhotoFailed(true)}
        />
      ) : (
        <div
          role="img"
          aria-label="Photo or FeynML screenshot placeholder"
          className="grid size-full place-items-center font-mono text-[13px] leading-[1.7] text-subtle"
        >
          Photo or FeynML screenshot
        </div>
      )}
    </div>
  )
}
