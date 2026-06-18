import { useEffect, useState } from 'react'
import { todosPedidos, cualquierPedido, avanzarEstadoAdmin, reasignarAsesor } from '../../api/pedidos'
import { listarAsesores } from '../../api/admin'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'

const COP = n => '$' + new Intl.NumberFormat('es-CO').format(n ?? 0)

function formatFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatHora(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

const ESTADOS_CADENA = ['Por confirmar', 'Confirmado', 'En despacho', 'Entregado']
const TERMINALES = ['Entregado', 'Devuelto']
const BLOQUEO_REASIGNAR = ['En despacho', 'Entregado', 'Devuelto']

function DetallePedidoModal({ pedido: initialPedido, asesores, onClose, onUpdated }) {
  const [pedido, setPedido] = useState(initialPedido)
  const [obs, setObs]       = useState('')
  const [asesorId, setAsesorId] = useState('')
  const [loading, setLoading]   = useState(false)
  const [msg, setMsg]           = useState('')

  const bloqueadoReasignar = BLOQUEO_REASIGNAR.includes(pedido.estadoActual)
  const esTerminal = TERMINALES.includes(pedido.estadoActual)
  const idxActual = ESTADOS_CADENA.indexOf(pedido.estadoActual)

  async function avanzar() {
    if (esTerminal) return
    setLoading(true); setMsg('')
    try {
      await avanzarEstadoAdmin(pedido.id, obs)
      const refreshed = await cualquierPedido(pedido.id)
      setPedido(refreshed.data)
      setObs('')
      setMsg('Estado actualizado.')
      onUpdated()
    } catch { setMsg('Error al avanzar el estado.') }
    finally { setLoading(false) }
  }

  async function handleReasignar() {
    if (!asesorId) return
    setLoading(true); setMsg('')
    try {
      await reasignarAsesor(pedido.id, Number(asesorId))
      const refreshed = await cualquierPedido(pedido.id)
      setPedido(refreshed.data)
      setAsesorId('')
      setMsg('Asesor reasignado.')
      onUpdated()
    } catch { setMsg('Error al reasignar.') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-800">
              Pedido #QS-2026-{String(pedido.id).padStart(4, '0')}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Creado el {formatFecha(pedido.fecha)} · {formatHora(pedido.fecha)}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="grid md:grid-cols-5 gap-0">
          {/* Panel izquierdo */}
          <div className="md:col-span-3 px-6 py-5 space-y-6">
            {/* Cliente */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Cliente</p>
              <p className="font-semibold text-gray-800">{pedido.compradorNombre} {pedido.compradorApellido}</p>
              <div className="mt-1.5 space-y-1 text-sm text-gray-500">
                <p>📞 {pedido.compradorTelefono}</p>
                {pedido.direccionEnvio && <p>📍 {pedido.direccionEnvio}, {pedido.municipio}, {pedido.departamento}</p>}
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
            <div>
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

              {/* Totales */}
              <div className="mt-3 space-y-1.5 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>{COP(pedido.subtotal)}</span>
                </div>
                {Number(pedido.descuentoAplicado) > 0 && (
                  <div className="flex justify-between text-sm" style={{ color: '#C0392B' }}>
                    <span>Descuento paquete</span>
                    <span>−{COP(pedido.descuentoAplicado)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-1">
                  <span style={{ color: '#1C1C1E' }}>Total</span>
                  <span style={{ color: '#C0392B' }}>{COP(pedido.totalNeto)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Panel derecho */}
          <div className="md:col-span-2 px-6 py-5 border-l border-gray-100 space-y-6">
            {/* Timeline de estado */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Estado del pedido</p>
              <div className="space-y-3">
                {ESTADOS_CADENA.map((estado, idx) => {
                  const pasado = idx < idxActual
                  const actual = idx === idxActual
                  return (
                    <div key={estado} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: actual ? '#C0392B' : pasado ? '#22C55E' : '#E5E7EB',
                        }}
                      />
                      <span className={`text-sm ${actual ? 'font-semibold' : 'text-gray-400'}`} style={{ color: actual ? '#1C1C1E' : undefined }}>
                        {estado}
                      </span>
                      {actual && <Badge estado={estado} />}
                    </div>
                  )
                })}
              </div>

              {!esTerminal && (
                <div className="mt-4 space-y-2">
                  <textarea
                    value={obs} onChange={e => setObs(e.target.value)}
                    placeholder="Observaciones (opcional)"
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none"
                    onFocus={e => e.target.style.borderColor = '#C0392B'}
                    onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                  />
                  <button
                    onClick={avanzar} disabled={loading}
                    className="w-full py-2.5 text-sm font-semibold text-white rounded-xl transition-colors"
                    style={{ backgroundColor: loading ? '#E57373' : '#C0392B' }}
                  >
                    {loading ? 'Procesando...' : `Avanzar a "${ESTADOS_CADENA[idxActual + 1]}"`}
                  </button>
                </div>
              )}
            </div>

            {/* Asesor */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Asesor asignado</p>
              <p className="text-sm font-medium text-gray-700 mb-3">{pedido.asesorNombre ?? '—'}</p>
              {!bloqueadoReasignar ? (
                <div className="space-y-2">
                  <select
                    value={asesorId} onChange={e => setAsesorId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none"
                    onFocus={e => e.target.style.borderColor = '#C0392B'}
                    onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                  >
                    <option value="">Seleccionar asesor...</option>
                    {asesores.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  </select>
                  <button
                    onClick={handleReasignar} disabled={!asesorId || loading}
                    className="w-full py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40"
                  >
                    Reasignar
                  </button>
                </div>
              ) : (
                <p className="text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
                  Reasignación bloqueada en estado "{pedido.estadoActual}".
                </p>
              )}
            </div>

            {msg && <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">{msg}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminPedidos() {
  const [pedidos, setPedidos]   = useState([])
  const [asesores, setAsesores] = useState([])
  const [loading, setLoading]   = useState(true)
  const [query, setQuery]       = useState('')
  const [selected, setSelected] = useState(null)

  async function cargar() {
    try {
      const [p, a] = await Promise.all([todosPedidos(), listarAsesores()])
      setPedidos([...p.data].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)))
      setAsesores(a.data)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [])

  const filtered = pedidos.filter(p => {
    const q = query.toLowerCase()
    return (
      String(p.id).includes(q) ||
      `${p.compradorNombre} ${p.compradorApellido}`.toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#1C1C1E' }}>Gestión de Pedidos</h1>
        <p className="text-sm text-gray-400 mt-0.5">Reasigna asesores y supervisa el estado</p>
      </div>

      {/* Buscador */}
      <div className="relative mb-5">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Buscar pedido o cliente..."
          className="w-full max-w-sm pl-10 pr-4 py-2.5 text-sm bg-white rounded-xl border border-gray-200 focus:outline-none"
          onFocus={e => e.target.style.borderColor = '#C0392B'}
          onBlur={e => e.target.style.borderColor = '#E5E7EB'}
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['ID', 'CLIENTE', 'PRODUCTOS', 'FECHA', 'ASESOR ASIGNADO', 'TOTAL', 'ESTADO', ''].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500">#QS-2026-{String(p.id).padStart(4,'0')}</td>
                      <td className="px-5 py-3.5 font-medium text-gray-800">{p.compradorNombre} {p.compradorApellido}</td>
                      <td className="px-5 py-3.5 text-gray-500">{p.detalles?.length ?? 0} items</td>
                      <td className="px-5 py-3.5 text-gray-500">{formatFecha(p.fecha)}</td>
                      <td className="px-5 py-3.5 text-gray-600">{p.asesorNombre ?? '—'}</td>
                      <td className="px-5 py-3.5 font-semibold text-gray-800">{COP(p.totalNeto)}</td>
                      <td className="px-5 py-3.5"><Badge estado={p.estadoActual} /></td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => setSelected(p)} className="text-gray-400 hover:text-gray-700 transition-colors" title="Ver detalle">
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-400">No hay pedidos</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-gray-400">No hay pedidos</p>
              ) : filtered.map(p => (
                <div key={p.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{p.compradorNombre} {p.compradorApellido}</p>
                      <p className="text-xs font-mono text-gray-400 mt-0.5">#QS-2026-{String(p.id).padStart(4,'0')}</p>
                    </div>
                    <Badge estado={p.estadoActual} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 text-xs">{formatFecha(p.fecha)}</span>
                    <span className="font-bold" style={{ color: '#C0392B' }}>{COP(p.totalNeto)}</span>
                  </div>
                  {p.asesorNombre && (
                    <p className="text-xs text-gray-400">Asesor: {p.asesorNombre}</p>
                  )}
                  <button
                    onClick={() => setSelected(p)}
                    className="w-full mt-1 py-2 text-xs font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Ver detalle
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
        <div className="px-5 py-3 border-t border-gray-50">
          <p className="text-xs text-gray-400">La reasignación de asesor está bloqueada cuando el pedido está "En despacho" o "Entregado".</p>
        </div>
      </div>

      {selected && (
        <DetallePedidoModal
          pedido={selected}
          asesores={asesores}
          onClose={() => setSelected(null)}
          onUpdated={cargar}
        />
      )}
    </div>
  )
}
