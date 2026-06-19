import { useEffect, useState } from 'react'
import { useCart } from '../../context/CartContext'

export default function CartToast() {
  const { toast, dismissToast, setDrawerOpen } = useCart()
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setEntered(true), 10)
      return () => clearTimeout(t)
    } else {
      setEntered(false)
    }
  }, [toast])

  if (!toast) return null

  function handleVerCarrito() {
    dismissToast()
    setDrawerOpen(true)
  }

  return (
    <div
      className="fixed bottom-4 right-4 md:top-20 md:bottom-auto z-[9999]"
      style={{
        transition: 'opacity 0.22s ease, transform 0.22s ease',
        opacity: entered ? 1 : 0,
        transform: entered ? 'translateX(0)' : 'translateX(80px)',
      }}
    >
      <div
        className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 w-96"
        style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
      >
        {toast.product.imagenUrl ? (
          <img
            src={toast.product.imagenUrl}
            alt={toast.product.nombre}
            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold mb-1" style={{ color: '#16A34A' }}>
            ✓ Añadido al carrito
          </p>
          <p className="text-base font-semibold text-gray-800 truncate">{toast.product.nombre}</p>
          <p className="text-sm text-gray-400 mt-0.5">Talla {toast.talla}</p>
        </div>

        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <button
            onClick={dismissToast}
            className="w-6 h-6 flex items-center justify-center rounded-full text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <button
            onClick={handleVerCarrito}
            className="text-xs font-semibold whitespace-nowrap"
            style={{ color: '#C0392B' }}
          >
            Ver carrito
          </button>
        </div>
      </div>
    </div>
  )
}
