import { useToast } from '../../context/ToastContext'

const COLORS = {
  error:   { bg: '#FEF2F1', border: '#FECACA', icon: '#C0392B', text: '#991B1B' },
  success: { bg: '#F0FDF4', border: '#BBF7D0', icon: '#16A34A', text: '#166534' },
  info:    { bg: '#EFF6FF', border: '#BFDBFE', icon: '#2563EB', text: '#1E40AF' },
}

const ICONS = {
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
}

export default function ToastContainer() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => {
        const c = COLORS[t.type] ?? COLORS.error
        return (
          <div
            key={t.id}
            className="flex items-start gap-3 rounded-2xl px-4 py-3 border pointer-events-auto"
            style={{
              backgroundColor: c.bg,
              borderColor: c.border,
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            }}
          >
            <span style={{ color: c.icon, flexShrink: 0, marginTop: 1 }}>
              {ICONS[t.type] ?? ICONS.error}
            </span>
            <p className="flex-1 text-sm font-medium leading-snug" style={{ color: c.text }}>
              {t.message}
            </p>
            <button
              onClick={() => dismiss(t.id)}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: c.text }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}
