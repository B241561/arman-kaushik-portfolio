import { useEffect, useState } from 'react'
import { isPlaceholder } from '../../lib/placeholder'
import { useContent } from '../../lib/useContent'
import { LazyImage } from '../primitives/LazyImage'
import { Reveal } from '../primitives/Reveal'

/** Flat profile photo with a plain caption. Falls back to initials if no photo is set. */
export function ProfilePhoto() {
  const { person } = useContent()
  const [photoFailed, setPhotoFailed] = useState(false)
  useEffect(() => setPhotoFailed(false), [person.photo.src])

  const hasPhoto = !isPlaceholder(person.photo.src) && !photoFailed

  return (
    <Reveal delay={0.2}>
      <figure>
        <div className="bg-gray relative aspect-[4/5] w-full overflow-hidden rounded-xl">
          {hasPhoto ? (
            <LazyImage
              src={person.photo.src}
              alt={person.photo.alt}
              width={640}
              height={800}
              className="absolute inset-0 size-full rounded-xl object-cover object-top"
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            <div role="img" aria-label={person.photo.alt} className="text-fg absolute inset-0 grid place-items-center text-5xl font-bold">
              {person.initials}
            </div>
          )}
        </div>
        <figcaption className="mt-3">
          <p className="text-sm font-bold">{person.name}</p>
          <p className="text-subtle text-xs">{person.college}</p>
        </figcaption>
      </figure>
    </Reveal>
  )
}
