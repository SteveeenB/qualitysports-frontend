import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { miPedido } from '../../api/pedidos'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'

function formatCOP(n) {
  return '$' + new Intl.NumberFormat('es-CO').format(n ?? 0)
}

function formatFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
}

const ESTADOS_CADENA = ['Por confirmar', 'Confirmado', 'En despacho', 'Entregado']

export default function MisPedidoDetalle() {
  const { id } = useParams()
  const [pedido, setPedido] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    miPedido(id)
      .then(r => setPedido(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !pedido) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-2xl mb-2">😕</p>
        <p className="font-semibold text-gray-700 mb-1">Pedido no encontrado</p>
        <p className="text-sm text-gray-400 mb-6">No tienes acceso a este pedido o no existe.</p>
        <Link to="/mis-pedidos" className="text-sm font-medium" style={{ color: '#C0392B' }}>
          ← Volver a mis pedidos
        </Link>
      </div>
    )
  }

  const idxActual = ESTADOS_CADENA.indexOf(pedido.estadoActual)
  const esDevuelto = pedido.estadoActual === 'Devuelto'

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      {/* Breadcrumb */}
      <Link
        to="/mis-pedidos"
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-6"
        style={{ color: '#C0392B' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Mis pedidos
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1C1C1E]">
            Pedido #QS-2026-{String(pedido.id).padStart(4, '0')}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{formatFecha(pedido.fecha)}</p>
        </div>
        <Badge estado={pedido.estadoActual} />
      </div>

      <div className="space-y-4">
        {/* Timeline de estado */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Estado del pedido</p>
          <div className="flex items-center gap-0">
            {ESTADOS_CADENA.map((estado, idx) => {
              const pasado = idx < idxActual
              const actual = idx === idxActual && !esDevuelto
              const futuro = idx > idxActual && !esDevuelto
              return (
                <div key={estado} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: actual ? '#C0392B' : pasado ? '#22C55E' : '#E5E7EB',
                        boxShadow: actual ? '0 0 0 3px rgba(192,57,43,0.2)' : 'none',
                      }}
                    />
                    <span
                      className="text-[10px] text-center leading-tight hidden sm:block"
                      style={{ color: actual ? '#1C1C1E' : pasado ? '#22C55E' : '#9CA3AF', fontWeight: actual ? 700 : 400 }}
                    >
                      {estado}
                    </span>
                  </div>
                  {idx < ESTADOS_CADENA.length - 1 && (
                    <div
                      className="h-px flex-1 mx-1"
                      style={{ backgroundColor: pasado ? '#22C55E' : '#E5E7EB' }}
                    />
                  )}
                </div>
              )
            })}
          </div>
          {/* Estado en móvil (texto debajo) */}
          <p className="sm:hidden text-sm font-semibold text-center mt-3" style={{ color: '#C0392B' }}>
            {esDevuelto ? 'Devuelto' : pedido.estadoActual}
          </p>
          {esDevuelto && (
            <p className="text-xs text-center text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mt-3">
              Este pedido fue marcado como devuelto.
            </p>
          )}
        </div>

        {/* Info de entrega */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Entrega</p>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-gray-400 min-w-[90px]">Modalidad</span>
              <span className="font-medium text-gray-800">
                {pedido.modalidadEntrega === 'DOMICILIO' ? '🚚 Domicilio' : '🏪 Recogida en oficina'}
              </span>
            </div>
            {pedido.modalidadEntrega === 'DOMICILIO' && pedido.direccionEnvio && (
              <div className="flex gap-2">
                <span className="text-gray-400 min-w-[90px]">Dirección</span>
                <span className="font-medium text-gray-800">
                  {pedido.direccionEnvio}{pedido.municipio ? `, ${pedido.municipio}` : ''}{pedido.departamento ? `, ${pedido.departamento}` : ''}
                </span>
              </div>
            )}
            {pedido.asesorNombre && (
              <div className="flex gap-2">
                <span className="text-gray-400 min-w-[90px]">Asesor</span>
                <span className="font-medium text-gray-800">{pedido.asesorNombre}</span>
              </div>
            )}
          </div>
        </div>

        {/* Productos */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Productos</p>
          <div className="space-y-3">
            {(pedido.detalles ?? []).map((d, i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-50 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{d.nombreProducto}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Talla {d.tallaSeleccionada} · ×{d.cantidad}</p>
                </div>
                <p className="text-sm font-semibold text-gray-700 flex-shrink-0">{formatCOP(d.subtotal)}</p>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{formatCOP(pedido.subtotal)}</span>
            </div>
            {Number(pedido.descuentoAplicado) > 0 && (
              <div className="flex justify-between text-sm font-medium" style={{ color: '#C0392B' }}>
                <span>Descuento paquete</span>
                <span>−{formatCOP(pedido.descuentoAplicado)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold pt-1 border-t border-gray-100">
              <span style={{ color: '#1C1C1E' }}>Total</span>
              <span style={{ color: '#C0392B' }}>{formatCOP(pedido.totalNeto)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
