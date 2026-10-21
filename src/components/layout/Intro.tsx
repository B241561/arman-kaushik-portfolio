import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { spring, springSnappy } from '../../lib/motion'
import { useContent } from '../../lib/useContent'

/** ~0.85s hold + 0.3s fade = under 1.2s. Click, any key, or "Skip" ends it early. */
export function Intro({ onFinish }: { onFinish: () => void }) {
  const content = useContent()

  useEffect(() => {
    const timer = window.setTimeout(onFinish, 850)
    window.addEventListener('keydown', onFinish)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', onFinish)
    }
  }, [onFinish])

  return (
    <motion.div
      role="status"
      aria-label={content.intro.label}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
      onClick={onFinish}
      className="bg-bg fixed inset-0 z-[200] grid place-items-center"
    >
      <div className="flex flex-col items-center gap-5">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={springSnappy}
          className="bg-fg text-bg grid size-16 place-items-center rounded-[22px] text-xl font-semibold tracking-tight"
        >
          {content.person.initials}
        </motion.div>
        <div className="overflow-hidden">
          <motion.p
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            className="text-lg font-medium tracking-tight"
          >
            {content.person.name}
          </motion.p>
        </div>
        <div className="h-px w-36 overflow-hidden rounded-full bg-[var(--line)]">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
            className="bg-accent h-full origin-left"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={onFinish}
        className="text-muted hover:text-fg absolute right-6 bottom-6 rounded-full px-4 py-2 text-sm font-medium transition-colors"
      >
        {content.intro.skip}
      </button>
    </motion.div>
  )
}
