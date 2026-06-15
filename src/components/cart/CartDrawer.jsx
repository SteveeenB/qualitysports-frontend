import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

function formatCOP(n) {
  return new Intl.NumberFormat('es-CO').format(n)
}

export default function CartDrawer() {
  const { items, drawerOpen, setDrawerOpen, updateCantidad, removeItem, totalItems, subtotal } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  if (!drawerOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-lg text-[#1C1C1E]">
            Carrito <span className="text-sm font-normal text-gray-400">({totalItems} items)</span>
          </h2>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors text-xl"
          >
            ×
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 px-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <span className="text-5xl mb-4">🛒</span>
              <p className="text-gray-500 text-sm">Tu carrito está vacío</p>
              <button
                onClick={() => { setDrawerOpen(false); navigate('/catalogo') }}
                className="mt-4 text-sm text-[#C0392B] font-medium hover:underline"
              >
                Explorar catálogo →
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.key} className="flex gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                  {item.product.imagenUrl
                    ? <img src={item.product.imagenUrl} alt={item.product.nombre} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">👟</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1C1C1E] line-clamp-1">{item.product.nombre}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Talla {item.talla}</p>
                  <p className="text-sm font-bold text-[#C0392B] mt-1">${formatCOP(item.product.precioBase * item.cantidad)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => removeItem(item.key)}
                    className="text-gray-300 hover:text-red-400 text-lg transition-colors"
                  >
                    ×
                  </button>
                  <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2 py-0.5">
                    <button
                      onClick={() => updateCantidad(item.key, item.cantidad - 1)}
                      className="text-gray-500 hover:text-[#C0392B] font-bold text-sm w-4 text-center"
                    >−</button>
                    <span className="text-sm font-medium w-4 text-center">{item.cantidad}</span>
                    <button
                      onClick={() => updateCantidad(item.key, item.cantidad + 1)}
                      className="text-gray-500 hover:text-[#C0392B] font-bold text-sm w-4 text-center"
                    >+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Subtotal</span>
              <span className="font-bold text-[#1C1C1E]">${formatCOP(subtotal)} COP</span>
            </div>
            <p className="text-xs text-gray-400">Descuentos por volumen se aplican en checkout</p>
            <button
              onClick={() => { setDrawerOpen(false); navigate('/checkout') }}
              className="w-full py-3 bg-[#C0392B] text-white font-semibold rounded-xl hover:bg-[#A93226] transition-colors active:scale-[0.98]"
            >
              Proceder al Checkout →
            </button>
            <Link
              to="/carrito"
              onClick={() => setDrawerOpen(false)}
              className="block text-center text-sm text-gray-500 hover:text-[#C0392B] transition-colors"
            >
              Ver carrito completo
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
