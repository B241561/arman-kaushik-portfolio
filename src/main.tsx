import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ToastProvider } from './components/primitives/Toast'
import { LenisProvider } from './lib/lenis'
import { ThemeProvider } from './lib/theme'
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
