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
    <div className="bg-surface relative aspect-square w-full overflow-hidden rounded-xl border border-line">
      {hasPhoto ? (
        <LazyImage
          src={person.photo.src}
          alt={person.photo.alt}
          width={640}
          height={800}
          className="size-full object-cover object-top"
          onError={() => setPhotoFailed(true)}
        />
      ) : (
        <div role="img" aria-label={person.photo.alt} className="text-muted grid size-full place-items-center text-4xl font-semibold">
          {person.initials}
        </div>
      )}
    </div>
  )
}
