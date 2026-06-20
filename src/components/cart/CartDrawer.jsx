import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Trash, ShoppingCart } from '@phosphor-icons/react'
import { useCart } from '../../context/CartContext'
import { listarDescuentos } from '../../api/pedidos'

function formatCOP(n) {
  return new Intl.NumberFormat('es-CO').format(n)
}

function calcularDescuento(subtotal, totalPares, reglas) {
  if (!reglas || reglas.length === 0) return null
  const regla = [...reglas]
    .sort((a, b) => b.cantidadPares - a.cantidadPares)
    .find(r => r.cantidadPares <= totalPares)
  if (!regla) return null
  const precioPorPar = regla.precioTotalPaquete / regla.cantidadPares
  const totalNeto = precioPorPar * totalPares
  const ahorro = subtotal - totalNeto
  if (ahorro <= 0) return null
  return { totalNeto, ahorro, cantidadPares: regla.cantidadPares }
}

function proximoDescuento(totalPares, reglas) {
  if (!reglas || reglas.length === 0) return null
  const sorted = [...reglas].sort((a, b) => a.cantidadPares - b.cantidadPares)
  return sorted.find(r => r.cantidadPares > totalPares) ?? null
}

export default function CartDrawer() {
  const { items, drawerOpen, setDrawerOpen, updateCantidad, removeItem, totalItems, subtotal } = useCart()
  const navigate = useNavigate()
  const [reglas, setReglas] = useState([])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  useEffect(() => {
    if (drawerOpen && reglas.length === 0) {
      listarDescuentos().then(r => setReglas(r.data ?? [])).catch(() => {})
    }
  }, [drawerOpen])

  const totalPares = items.reduce((s, i) => s + i.cantidad, 0)
  const descuento  = calcularDescuento(subtotal, totalPares, reglas)
  const proximo    = !descuento ? proximoDescuento(totalPares, reglas) : null

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key="cart-overlay"
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setDrawerOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key="cart-panel"
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-lg text-[#1C1C1E]">
                Carrito <span className="text-sm font-normal text-gray-400">({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
              </h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Cerrar carrito"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4 px-5 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <ShoppingCart size={44} weight="thin" className="text-gray-300 mb-4" />
                  <p className="text-gray-500 text-sm font-medium">Tu carrito está vacío</p>
                  <button
                    onClick={() => { setDrawerOpen(false); navigate('/catalogo') }}
                    className="mt-4 text-sm font-semibold hover:underline"
                    style={{ color: '#C0392B' }}
                  >
                    Explorar catálogo
                  </button>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.key} className="flex gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                      {item.product.imagenUrl
                        ? <img src={item.product.imagenUrl} alt={item.product.nombre} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ShoppingCart size={22} weight="thin" />
                          </div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1C1C1E] line-clamp-1">{item.product.nombre}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Talla {item.talla}</p>
                      <p className="text-sm font-bold mt-1" style={{ color: '#C0392B' }}>${formatCOP(item.product.precioBase * item.cantidad)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => removeItem(item.key)}
                        className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                        aria-label="Eliminar producto"
                      >
                        <Trash size={15} />
                      </button>
                      <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2 py-0.5">
                        <button
                          onClick={() => updateCantidad(item.key, item.cantidad - 1)}
                          className="text-gray-500 hover:text-[#C0392B] font-bold text-sm w-4 text-center"
                        >-</button>
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
                  <span className="font-medium text-[#1C1C1E]">${formatCOP(subtotal)} COP</span>
                </div>

                {descuento && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium" style={{ color: '#16A34A' }}>
                      Descuento paquete ({totalPares} pares)
                    </span>
                    <span className="font-semibold" style={{ color: '#16A34A' }}>
                      -${formatCOP(descuento.ahorro)} COP
                    </span>
                  </div>
                )}

                {!descuento && proximo && (
                  <p className="text-xs px-3 py-2 rounded-lg bg-amber-50 text-amber-700">
                    Añade {proximo.cantidadPares - totalPares} par{proximo.cantidadPares - totalPares !== 1 ? 'es' : ''} más y obtén descuento de paquete
                  </p>
                )}

                <div className="flex justify-between items-center border-t border-gray-100 pt-2">
                  <span className="text-sm font-bold text-[#1C1C1E]">Total</span>
                  <span className="font-bold" style={{ color: '#C0392B' }}>
                    ${formatCOP(descuento ? descuento.totalNeto : subtotal)} COP
                  </span>
                </div>

                <button
                  onClick={() => { setDrawerOpen(false); navigate('/checkout') }}
                  className="w-full py-3 text-white font-semibold rounded-xl transition-colors active:scale-[0.98]"
                  style={{ backgroundColor: '#C0392B' }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = '#A93226'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = '#C0392B'}
                >
                  Proceder al Checkout
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
