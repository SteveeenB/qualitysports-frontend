import { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(null)

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts(ts => ts.filter(t => t.id !== id))
  }, [])

  const show = useCallback((message, type = 'error') => {
    const id = ++toastId
    setToasts(ts => [...ts, { id, message, type }])
    setTimeout(() => dismiss(id), 4000)
  }, [dismiss])

  const showError   = useCallback((msg) => show(msg, 'error'),   [show])
  const showSuccess = useCallback((msg) => show(msg, 'success'), [show])
  const showInfo    = useCallback((msg) => show(msg, 'info'),    [show])

  return (
    <ToastContext.Provider value={{ toasts, showError, showSuccess, showInfo, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider')
  return ctx
}
