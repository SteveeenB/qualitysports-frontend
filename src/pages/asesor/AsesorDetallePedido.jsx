import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { pedidoAsesor, avanzarEstadoAsesor } from '../../api/pedidos'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'

const COP = n => '$' + new Intl.NumberFormat('es-CO').format(n ?? 0)

function formatFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatHora(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

const ESTADOS_CADENA = ['Por confirmar', 'Confirmado', 'En despacho', 'Entregado']
const TERMINALES = ['Entregado', 'Devuelto']

export default function AsesorDetallePedido() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [pedido, setPedido]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)
  const [obs, setObs]         = useState('')
  const [saving, setSaving]   = useState(false)
  const [msg, setMsg]         = useState('')

  useEffect(() => {
    pedidoAsesor(id)
      .then(r => setPedido(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  async function avanzar() {
    if (!pedido) return
    setSaving(true); setMsg('')
    try {
      await avanzarEstadoAsesor(pedido.id, obs)
      const refreshed = await pedidoAsesor(pedido.id)
      setPedido(refreshed.data)
      setObs('')
      setMsg('Estado actualizado correctamente.')
    } catch { setMsg('Error al avanzar el estado.') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex justify-center items-center"><Spinner size="lg" /></div>

  if (error || !pedido) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center gap-3 px-4 text-center">
        <p className="text-2xl">😕</p>
        <p className="font-semibold text-gray-700">Pedido no encontrado o sin acceso</p>
        <button onClick={() => navigate('/asesor')} className="text-sm font-medium" style={{ color: '#C0392B' }}>
          ← Volver al panel
        </button>
      </div>
    )
  }

  const esTerminal = TERMINALES.includes(pedido.estadoActual)
  const idxActual  = ESTADOS_CADENA.indexOf(pedido.estadoActual)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/asesor')}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-400"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-800">
              Pedido #QS-2026-{String(pedido.id).padStart(4, '0')}
            </h1>
            <p className="text-xs text-gray-400">{formatFecha(pedido.fecha)} · {formatHora(pedido.fecha)}</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-4">
        {/* Cliente */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Cliente</p>
          <p className="font-semibold text-gray-800">{pedido.compradorNombre} {pedido.compradorApellido}</p>
          <div className="mt-2 space-y-1 text-sm text-gray-500">
            <p>📞 {pedido.compradorTelefono}</p>
            {pedido.direccionEnvio && (
              <p>📍 {pedido.direccionEnvio}{pedido.municipio ? `, ${pedido.municipio}` : ''}{pedido.departamento ? `, ${pedido.departamento}` : ''}</p>
            )}
          </div>
          <a
            href={`https://wa.me/57${pedido.compradorTelefono?.replace(/\D/g,'')}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: '#22C55E' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Contactar por WhatsApp
          </a>
        </div>

        {/* Productos */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Productos</p>
          <div className="space-y-2">
            {(pedido.detalles ?? []).map((d, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{d.nombreProducto}</p>
                  <p className="text-xs text-gray-400">Talla {d.tallaSeleccionada} · ×{d.cantidad}</p>
                </div>
                <p className="text-sm font-semibold text-gray-700">{COP(d.subtotal)}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span><span>{COP(pedido.subtotal)}</span>
            </div>
            {Number(pedido.descuentoAplicado) > 0 && (
              <div className="flex justify-between text-sm font-medium" style={{ color: '#C0392B' }}>
                <span>Descuento paquete</span><span>−{COP(pedido.descuentoAplicado)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold pt-1 border-t border-gray-100">
              <span style={{ color: '#1C1C1E' }}>Total</span>
              <span style={{ color: '#C0392B' }}>{COP(pedido.totalNeto)}</span>
            </div>
          </div>
        </div>

        {/* Estado del pedido */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Estado del pedido</p>
            <Badge estado={pedido.estadoActual} />
          </div>

          <div className="space-y-3 mb-5">
            {ESTADOS_CADENA.map((estado, idx) => {
              const pasado = idx < idxActual
              const actual = idx === idxActual && !esTerminal
              return (
                <div key={estado} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: actual ? '#C0392B' : pasado ? '#22C55E' : '#E5E7EB' }}
                  />
                  <span className="text-sm" style={{ color: actual ? '#1C1C1E' : '#9CA3AF', fontWeight: actual ? 700 : 400 }}>
                    {estado}
                  </span>
                </div>
              )
            })}
          </div>

          {!esTerminal && (
            <div className="space-y-3">
              <textarea
                value={obs}
                onChange={e => setObs(e.target.value)}
                placeholder="Observaciones (opcional)"
                rows={2}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none"
                onFocus={e => e.target.style.borderColor = '#C0392B'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />
              <button
                onClick={avanzar}
                disabled={saving}
                className="w-full py-3 text-sm font-semibold text-white rounded-xl transition-colors"
                style={{ backgroundColor: saving ? '#E57373' : '#C0392B' }}
              >
                {saving ? 'Procesando...' : `Avanzar a "${ESTADOS_CADENA[idxActual + 1]}"`}
              </button>
            </div>
          )}

          {msg && (
            <p className={`text-xs px-3 py-2 rounded-lg mt-3 ${msg.startsWith('Error') ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
              {msg}
            </p>
          )}

          {esTerminal && (
            <p className="text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-lg mt-2 text-center">
              Este pedido está en estado terminal: <strong>{pedido.estadoActual}</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
