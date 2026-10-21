import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ToastProvider } from './components/primitives/Toast'
import { LenisProvider } from './lib/lenis'
import { ThemeProvider } from './lib/theme'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/newsreader/latin-400.css'
import '@fontsource/newsreader/latin-400-italic.css'
import '@fontsource/newsreader/latin-500.css'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LenisProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </LenisProvider>
    </ThemeProvider>
  </StrictMode>,
)
