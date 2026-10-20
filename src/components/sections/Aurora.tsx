import { useInView } from 'framer-motion'
import { useRef, type CSSProperties } from 'react'

/** Slow-drifting blue→violet light behind the hero. Pure CSS; paused off-screen, frozen under reduced motion. */
export function Aurora() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const play: CSSProperties = { animationPlayState: inView ? 'running' : 'paused' }

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0" style={{ opacity: 'var(--aurora-opacity)' }}>
        <div style={play} className="animate-aurora-a absolute top-[-25%] left-[5%] h-[70vmax] w-[70vmax] rounded-full bg-[radial-gradient(circle,var(--accent)_0%,transparent_62%)] blur-3xl" />
        <div style={play} className="animate-aurora-b absolute top-[-10%] right-[-15%] h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(circle,var(--accent-2)_0%,transparent_60%)] blur-3xl" />
        <div style={play} className="animate-aurora-c absolute bottom-[-35%] left-[25%] h-[55vmax] w-[55vmax] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--accent)_50%,var(--accent-2))_0%,transparent_60%)] blur-3xl" />
      </div>
      {/* Fine grid, masked toward the centre */}
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)] bg-[linear-gradient(to_right,var(--line)_1px,transparent_1px),linear-gradient(to_bottom,var(--line)_1px,transparent_1px)] bg-[size:64px_64px] opacity-40" />
      <div className="to-bg absolute inset-x-0 bottom-0 h-48 bg-linear-to-b from-transparent" />
    </div>
  )
}
