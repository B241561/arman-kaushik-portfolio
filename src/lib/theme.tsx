import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'dark' | 'light'
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'dark', toggle: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  // index.html sets data-theme before paint (dark by default) to avoid a flash.
  const [theme, setTheme] = useState<Theme>(() =>
    typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f6f3ee' : '#121110')
    try {
      localStorage.setItem('theme', theme)
    } catch {
      /* storage unavailable */
    }
  }, [theme])

  const toggle = useCallback(() => {
    const root = document.documentElement
    root.classList.add('theming')
    window.setTimeout(() => root.classList.remove('theming'), 350)
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
