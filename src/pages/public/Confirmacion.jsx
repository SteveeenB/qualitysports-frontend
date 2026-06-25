import { useEffect, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { pixelPurchase } from '../../utils/metaPixel.js'

function formatCOP(n) {
  return new Intl.NumberFormat('es-CO').format(n ?? 0)
}

export default function Confirmacion() {
  const { id }       = useParams()
  const { state }    = useLocation()
  const [show, setShow] = useState(false)

  const data  = state ?? {}
  const items = data.items ?? []

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!id) return

    // Persistir metaEventId en sessionStorage para sobrevivir un refresh de página
    const ssKey         = `qs_meta_purchase_${id}`
    const storedEventId = sessionStorage.getItem(ssKey)

    if (data.metaEventId) {
      sessionStorage.setItem(ssKey, data.metaEventId)
    }

    const eventId   = data.metaEventId ?? storedEventId
    const totalNeto = data.totalNeto
    const firedKey  = `qs_purchase_fired_${id}`

    // Guard: disparar el evento una sola vez por pedido (evita double-fire en StrictMode / refresh)
    if (totalNeto != null && eventId && !sessionStorage.getItem(firedKey)) {
      pixelPurchase({ orderId: id, value: totalNeto, eventId })
      sessionStorage.setItem(firedKey, '1')
    }
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps
  const num   = String(id).padStart(4, '0')

  return (
    <div className="max-w-2xl mx-auto px-4 py-14">

      {/* ── Header animado ── */}
      <div className={`text-center mb-10 transition-all duration-500 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#1C1C1E] mb-1">¡Pedido registrado!</h1>
        <p className="text-gray-400 text-sm">
          Debes contactar a tu asesor por WhatsApp para completar el pedido
        </p>
        <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full bg-gray-100">
          <span className="text-xs text-gray-500">N° de pedido</span>
          <span className="text-sm font-bold text-[#1C1C1E]">#QS-{num}</span>
        </div>
      </div>

      {/* ── Productos ── */}
      {items.length > 0 && (
        <div className={`bg-white border border-gray-100 rounded-2xl overflow-hidden mb-5 transition-all duration-500 delay-100 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Productos del pedido</p>
          </div>
          <div className="divide-y divide-gray-50">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                {/* Foto */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 flex items-center justify-center">
                  {item.imagenUrl
                    ? <img src={item.imagenUrl} alt={item.nombreProducto} className="w-full h-full object-cover" />
                    : <span className="text-2xl">👟</span>
                  }
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1C1C1E] truncate">{item.nombreProducto}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Talla {item.talla} · ×{item.cantidad}</p>
                </div>
                {/* Precio */}
                <p className="text-sm font-bold text-[#1C1C1E] flex-shrink-0">
                  ${formatCOP(item.precioUnitario * item.cantidad)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Totales ── */}
      <div className={`bg-white border border-gray-100 rounded-2xl px-5 py-4 mb-5 transition-all duration-500 delay-150 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        {data.subtotal != null && (
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">Subtotal</span>
            <span className="text-sm font-medium">${formatCOP(data.subtotal)} COP</span>
          </div>
        )}
        {Number(data.descuentoAplicado) > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-sm" style={{ color: '#C0392B' }}>Descuento</span>
            <span className="text-sm font-medium" style={{ color: '#C0392B' }}>
              -${formatCOP(data.descuentoAplicado)} COP
            </span>
          </div>
        )}
        {data.totalNeto != null && (
          <div className="flex justify-between items-center pt-3">
            <span className="font-bold text-[#1C1C1E]">Total</span>
            <span className="text-lg font-bold" style={{ color: '#C0392B' }}>
              ${formatCOP(data.totalNeto)} COP
            </span>
          </div>
        )}
      </div>

      {/* ── WhatsApp CTA ── */}
      <div className={`transition-all duration-500 delay-200 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-start gap-3 mb-4">
          <span className="mt-0.5 text-green-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </span>
          <p className="text-sm text-green-800">
            <strong>⚠ Debes contactar a tu asesor por WhatsApp</strong> para confirmar el pedido y coordinar la entrega. Sin este contacto, <strong>el pedido no se procesará</strong>. El pago es <strong>contraentrega</strong>.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {data.whatsappUrl && (
            <a
              href={data.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2.5 transition-colors"
              style={{ backgroundColor: '#22C55E' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#16A34A'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = '#22C55E'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contactar a mi asesor por WhatsApp ahora
            </a>
          )}

          <div className="flex justify-center gap-6 mt-1">
            <Link to="/mis-pedidos" className="text-sm font-medium" style={{ color: '#C0392B' }}>
              Ver mis pedidos →
            </Link>
            <Link to="/catalogo" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
