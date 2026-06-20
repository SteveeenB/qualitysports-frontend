import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Check } from '@phosphor-icons/react'
import { obtenerProducto } from '../../api/productos'
import { listarDescuentos } from '../../api/pedidos'
import { useCart } from '../../context/CartContext'
import SizeChips from '../../components/ui/SizeChips'
import Spinner from '../../components/ui/Spinner'

function formatCOP(n) {
  return new Intl.NumberFormat('es-CO').format(n)
}

export default function ProductoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()

  const [product, setProduct]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [talla, setTalla]       = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [added, setAdded]       = useState(false)
  const [error, setError]       = useState(false)
  const [reglas, setReglas]     = useState([])

  useEffect(() => {
    obtenerProducto(id)
      .then(r => setProduct(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))

    listarDescuentos()
      .then(r => setReglas(r.data ?? []))
      .catch(() => {})
  }, [id])

  function handleAdd() {
    if (!talla) return
    addItem(product, talla, cantidad)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  if (loading) return (
    <div className="flex justify-center py-24"><Spinner size="lg" /></div>
  )

  if (error || !product) return (
    <div className="text-center py-24 text-gray-500">
      Producto no encontrado.{' '}
      <Link to="/catalogo" className="text-[#C0392B] underline">Volver al catálogo</Link>
    </div>
  )

  const reglasOrdenadas = [...reglas].sort((a, b) => a.cantidadPares - b.cantidadPares)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-[#C0392B]">Inicio</Link>
        <span>/</span>
        <Link to="/catalogo" className="hover:text-[#C0392B]">Catálogo</Link>
        <span>/</span>
        <span className="text-[#1C1C1E] font-medium">{product.nombre}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Imagen */}
        <div className="rounded-2xl overflow-hidden bg-[#F5F5F5] aspect-square">
          {product.imagenUrl
            ? <img src={product.imagenUrl} alt={product.nombre} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-gray-300">
                <ShoppingCart size={64} weight="thin" />
              </div>
          }
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          {product.categoria && (
            <span className="inline-block text-xs font-semibold text-[#C0392B] tracking-wider uppercase">
              {product.categoria.nombreCategoria}
            </span>
          )}
          <h1 className="text-3xl font-bold text-[#1C1C1E]">{product.nombre}</h1>
          <p className="text-3xl font-bold text-[#C0392B]">
            ${formatCOP(product.precioBase)} <span className="text-base font-normal text-gray-400">COP</span>
          </p>

          {product.descripcion && (
            <p className="text-gray-500 leading-relaxed text-sm">{product.descripcion}</p>
          )}

          {/* Tallas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#1C1C1E]">Talla</h3>
              {talla && <span className="text-sm text-gray-400">Seleccionada: <strong className="text-[#1C1C1E]">{talla}</strong></span>}
            </div>
            <SizeChips tallas={product.tallasDisponibles} selected={talla} onSelect={setTalla} />
            {!talla && (
              <p className="text-xs text-amber-600 mt-2">Selecciona una talla para continuar</p>
            )}
          </div>

          {/* Cantidad */}
          <div>
            <h3 className="font-semibold text-[#1C1C1E] mb-3">Cantidad</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setCantidad(c => Math.max(1, c - 1))}
                  className="px-4 py-2 hover:bg-gray-50 text-gray-600 font-bold text-lg transition-colors"
                >-</button>
                <span className="px-4 py-2 font-semibold text-[#1C1C1E] min-w-[3rem] text-center">{cantidad}</span>
                <button
                  onClick={() => setCantidad(c => c + 1)}
                  className="px-4 py-2 hover:bg-gray-50 text-gray-600 font-bold text-lg transition-colors"
                >+</button>
              </div>
              <span className="text-sm text-gray-400">{cantidad} {cantidad === 1 ? 'par' : 'pares'}</span>
            </div>
          </div>

          {/* Precios de paquete — datos reales del backend */}
          {reglasOrdenadas.length > 0 && (
            <div className="border-l-4 border-[#C0392B] bg-[#FEF2F1] rounded-r-xl px-4 py-3">
              <p className="text-sm font-semibold text-[#C0392B] mb-2">Precios de paquete</p>
              <div className="space-y-1.5">
                {reglasOrdenadas.map(r => (
                  <div key={r.cantidadPares} className="flex justify-between text-xs">
                    <span className="text-gray-600">{r.cantidadPares} pares</span>
                    <span className="font-semibold text-[#C0392B]">
                      ${formatCOP(r.precioTotalPaquete)} COP
                      <span className="font-normal text-gray-400 ml-1">
                        (${formatCOP(Math.round(r.precioTotalPaquete / r.cantidadPares))}/par)
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleAdd}
            disabled={!talla}
            className="py-4 rounded-xl font-semibold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            style={{
              backgroundColor: added ? '#16a34a' : talla ? '#C0392B' : '#F5F5F5',
              color: talla || added ? '#FFFFFF' : '#9CA3AF',
              cursor: !talla ? 'not-allowed' : 'pointer',
            }}
          >
            {added ? (
              <><Check size={18} weight="bold" /> Agregado al carrito</>
            ) : talla ? (
              <><ShoppingCart size={18} weight="bold" /> Agregar al carrito</>
            ) : (
              'Selecciona una talla'
            )}
          </button>

          <button
            onClick={() => navigate('/carrito')}
            className="text-sm text-gray-400 hover:text-[#C0392B] transition-colors text-center"
          >
            Ver carrito
          </button>
        </div>
      </div>
    </div>
  )
}
