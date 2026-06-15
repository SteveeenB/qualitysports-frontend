import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import EmptyState from '../../components/ui/EmptyState'

function formatCOP(n) {
  return new Intl.NumberFormat('es-CO').format(n)
}

export default function Carrito() {
  const { items, updateCantidad, removeItem, subtotal, totalItems } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold text-[#1C1C1E] mb-8">Carrito de compras</h1>
        <EmptyState
          icon="🛒"
          title="Carrito vacío"
          description="No tienes productos en tu carrito todavía."
          action={{ label: 'Explorar catálogo', onClick: () => navigate('/catalogo') }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-[#1C1C1E] mb-8">Carrito de compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.key} className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 items-start">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                {item.product.imagenUrl
                  ? <img src={item.product.imagenUrl} alt={item.product.nombre} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-3xl">👟</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#1C1C1E] text-sm">{item.product.nombre}</p>
                <p className="text-xs text-gray-400 mt-0.5">Talla {item.talla}</p>
                <p className="text-[#C0392B] font-bold mt-1">
                  ${formatCOP(item.product.precioBase * item.cantidad)} COP
                </p>
                <p className="text-xs text-gray-400">${formatCOP(item.product.precioBase)} × {item.cantidad}</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <button
                  onClick={() => removeItem(item.key)}
                  className="text-gray-300 hover:text-red-400 transition-colors text-xl font-light"
                >×</button>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => updateCantidad(item.key, item.cantidad - 1)} className="px-2.5 py-1.5 hover:bg-gray-50 text-sm font-bold text-gray-500">−</button>
                  <span className="px-3 py-1.5 text-sm font-medium text-[#1C1C1E]">{item.cantidad}</span>
                  <button onClick={() => updateCantidad(item.key, item.cantidad + 1)} className="px-2.5 py-1.5 hover:bg-gray-50 text-sm font-bold text-gray-500">+</button>
                </div>
              </div>
            </div>
          ))}

          <Link to="/catalogo" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#C0392B] transition-colors mt-2">
            ← Continuar comprando
          </Link>
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="bg-[#F5F5F5] rounded-2xl p-6 sticky top-20">
            <h2 className="font-bold text-[#1C1C1E] mb-5">Resumen del pedido</h2>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{totalItems} {totalItems === 1 ? 'par' : 'pares'}</span>
                <span className="font-medium">${formatCOP(subtotal)} COP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Descuento</span>
                <span className="text-[#C0392B] font-medium">Se calcula en checkout</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-5">
              <div className="flex justify-between">
                <span className="font-bold text-[#1C1C1E]">Subtotal</span>
                <span className="font-bold text-[#1C1C1E] text-lg">${formatCOP(subtotal)} COP</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-[#C0392B] text-white font-semibold rounded-xl hover:bg-[#A93226] transition-colors active:scale-[0.98]"
            >
              Proceder al Checkout →
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              Pago contraentrega — el asesor te confirma por WhatsApp
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
