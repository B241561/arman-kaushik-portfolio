import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../lib/theme'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const nextTheme = theme === 'dark' ? 'light' : 'dark'
  const Icon = theme === 'dark' ? Sun : Moon

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      className="text-fg grid size-9 shrink-0 place-items-center rounded-[9px] border border-[var(--line)] transition-colors hover:bg-fg/[0.06]"
    >
      <Icon aria-hidden className="size-[18px]" />
    </button>
  )
}
