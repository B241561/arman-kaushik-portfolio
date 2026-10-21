import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { quick } from '../../lib/motion'

const ToastContext = createContext<(message: string) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const show = useCallback((message: string) => {
    setToast({ id: Date.now(), message })
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(null), 2400)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[90] flex justify-center px-4">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={quick}
              className="surface shadow-soft flex items-center gap-2.5 rounded-card px-4 py-3 text-sm font-medium"
            >
              <Check aria-hidden className="text-accent size-4" strokeWidth={2.5} />
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
