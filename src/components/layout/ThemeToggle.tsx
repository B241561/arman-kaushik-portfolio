import { AnimatePresence, motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { springSnappy } from '../../lib/motion'
import { useTheme } from '../../lib/theme'
import { useContent } from '../../lib/useContent'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const { nav } = useContent()
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? nav.themeToLight : nav.themeToDark}
      className="text-fg/80 hover:text-fg hover:bg-fg/10 relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full transition-colors"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
          transition={springSnappy}
          className="grid place-items-center"
        >
          {theme === 'dark' ? <Moon className="size-[18px]" /> : <Sun className="size-[18px]" />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
