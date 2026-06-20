import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { pedidosAsesor, avanzarEstadoAsesor } from '../../api/pedidos'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import StatusChangeModal from '../../components/ui/StatusChangeModal'

function formatFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

const ESTADOS = ['Por confirmar', 'Confirmado', 'En despacho', 'Entregado', 'Devuelto']
const CADENA  = ['Por confirmar', 'Confirmado', 'En despacho', 'Entregado']
const TERMINALES = ['Entregado', 'Devuelto']

function siguienteEstado(actual) {
  const idx = CADENA.indexOf(actual)
  if (idx === -1 || idx === CADENA.length - 1) return null
  return CADENA[idx + 1]
}

function ProductoThumbs({ detalles = [] }) {
  const items = detalles.slice(0, 3)
  return (
    <div className="flex items-center gap-1">
      {items.map((d, i) =>
        d.imagenUrl ? (
          <img
            key={i}
            src={d.imagenUrl}
            alt={d.productoNombre}
            className="w-8 h-8 rounded-lg object-cover ring-1 ring-gray-200 flex-shrink-0"
          />
        ) : (
          <div
            key={i}
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ring-1 ring-gray-100"
            style={{ backgroundColor: '#F5F5F5' }}
            title={d.productoNombre}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4"/>
            </svg>
          </div>
        )
      )}
    </div>
  )
}

function KpiCard({ icon, label, value, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: accent + '18' }}
      >
        {icon(accent)}
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-2xl font-bold" style={{ color: '#1C1C1E' }}>{value}</p>
      </div>
    </div>
  )
}

export default function AsesorDashboard() {
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalData, setModalData] = useState(null)
  const [saving, setSaving]       = useState(false)

  const [busqueda, setBusqueda]         = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [fechaDesde, setFechaDesde]     = useState('')
  const [fechaHasta, setFechaHasta]     = useState('')

  async function cargar() {
    try {
      const r = await pedidosAsesor()
      setPedidos([...r.data].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)))
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [])

  const ahora = new Date()
  const porConfirmarCount   = pedidos.filter(p => p.estadoActual === 'Por confirmar').length
  const enProcesoCount      = pedidos.filter(p => ['Confirmado', 'En despacho'].includes(p.estadoActual)).length
  const entregadosMesCount  = pedidos.filter(p =>
    p.estadoActual === 'Entregado' &&
    new Date(p.fecha).getMonth()   === ahora.getMonth() &&
    new Date(p.fecha).getFullYear() === ahora.getFullYear()
  ).length

  const hayFiltros = busqueda || estadoFiltro || fechaDesde || fechaHasta

  const filtrados = pedidos.filter(p => {
    const matchCliente = !busqueda ||
      `${p.compradorNombre} ${p.compradorApellido}`.toLowerCase().includes(busqueda.toLowerCase())
    const matchEstado = !estadoFiltro || p.estadoActual === estadoFiltro
    const fecha = new Date(p.fecha)
    const matchDesde = !fechaDesde || fecha >= new Date(fechaDesde)
    const matchHasta = !fechaHasta || fecha <= new Date(fechaHasta + 'T23:59:59')
    return matchCliente && matchEstado && matchDesde && matchHasta
  })

  async function confirmarCambio() {
    if (!modalData) return
    setSaving(true)
    try {
      await avanzarEstadoAsesor(modalData.pedido.id, '')
      setModalData(null)
      await cargar()
    } catch {}
    finally { setSaving(false) }
  }

  const inputClass = "px-3.5 py-2.5 text-sm bg-white rounded-xl border border-gray-200 focus:outline-none"
  const focusRed   = e => { e.target.style.borderColor = '#C0392B' }
  const blurGray   = e => { e.target.style.borderColor = '#E5E7EB' }

  return (
    <div className="p-4 md:p-8 space-y-5">

      {/* Banner info */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm"
        style={{ backgroundColor: '#FEF2F1', borderColor: '#FECACA', color: '#991B1B' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Mostrando únicamente los pedidos asignados a ti.
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Por confirmar"
          value={porConfirmarCount}
          accent="#D97706"
          icon={c => (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          )}
        />
        <KpiCard
          label="En proceso"
          value={enProcesoCount}
          accent="#3B82F6"
          icon={c => (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          )}
        />
        <KpiCard
          label="Entregados este mes"
          value={entregadosMesCount}
          accent="#22C55E"
          icon={c => (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          )}
        />
      </div>

      {/* Tabla card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

        {/* Header tabla */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-50">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-bold" style={{ color: '#1C1C1E' }}>Pedidos asignados</h2>
              <p className="text-xs text-gray-400 mt-0.5">Solo se muestran tus pedidos</p>
            </div>
            {hayFiltros && !loading && (
              <span className="text-xs text-gray-400 mt-1 flex-shrink-0">
                <span className="font-semibold text-gray-700">{filtrados.length}</span> de {pedidos.length}
              </span>
            )}
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[160px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar por cliente..."
                className={`w-full pl-9 pr-3 ${inputClass}`}
                onFocus={focusRed} onBlur={blurGray}
              />
            </div>
            <select
              value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)}
              className={inputClass} onFocus={focusRed} onBlur={blurGray}
            >
              <option value="">Todos los estados</option>
              {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)}
              className={inputClass} onFocus={focusRed} onBlur={blurGray} title="Desde"
            />
            <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)}
              className={inputClass} onFocus={focusRed} onBlur={blurGray} title="Hasta"
            />
            {hayFiltros && (
              <button
                onClick={() => { setBusqueda(''); setEstadoFiltro(''); setFechaDesde(''); setFechaHasta('') }}
                className="px-3 py-2 text-xs font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                style={{ color: '#C0392B' }}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <p className="text-sm">{pedidos.length === 0 ? 'No tienes pedidos asignados aún.' : 'No hay pedidos que coincidan con los filtros.'}</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['ID', 'CLIENTE', 'PRODUCTOS', 'FECHA', 'ESTADO', 'CAMBIAR A', 'ACCIONES'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(p => {
                    const siguiente = siguienteEstado(p.estadoActual)
                    const esTerminal = TERMINALES.includes(p.estadoActual)
                    const waUrl = `https://wa.me/57${(p.compradorTelefono ?? '').replace(/\D/g, '')}`
                    return (
                      <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">
                          #QS-2026-{String(p.id).padStart(4, '0')}
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-gray-800 text-sm">{p.compradorNombre} {p.compradorApellido}</p>
                          {p.compradorTelefono && (
                            <p className="text-xs text-gray-400 mt-0.5">+57 {p.compradorTelefono}</p>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <ProductoThumbs detalles={p.detalles ?? []} />
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-sm whitespace-nowrap">{formatFecha(p.fecha)}</td>
                        <td className="px-5 py-3"><Badge estado={p.estadoActual} /></td>
                        <td className="px-5 py-3">
                          {!esTerminal && siguiente ? (
                            <button
                              onClick={() => setModalData({ pedido: p, estadoNuevo: siguiente })}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors whitespace-nowrap"
                              style={{ color: '#1C1C1E' }}
                            >
                              → {siguiente}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <a
                              href={waUrl}
                              target="_blank" rel="noopener noreferrer"
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-white transition-colors flex-shrink-0"
                              style={{ backgroundColor: '#22C55E' }}
                              title="Contactar por WhatsApp"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                            </a>
                            <button
                              onClick={() => navigate(`/asesor/pedido/${p.id}`)}
                              className="w-8 h-8 rounded-xl flex items-center justify-center border border-gray-200 hover:bg-gray-100 transition-colors text-gray-500 flex-shrink-0"
                              title="Ver detalle"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {filtrados.map(p => {
                const siguiente = siguienteEstado(p.estadoActual)
                const esTerminal = TERMINALES.includes(p.estadoActual)
                const waUrl = `https://wa.me/57${(p.compradorTelefono ?? '').replace(/\D/g, '')}`
                return (
                  <div key={p.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{p.compradorNombre} {p.compradorApellido}</p>
                        <p className="text-xs font-mono text-gray-400 mt-0.5">#QS-2026-{String(p.id).padStart(4, '0')}</p>
                        {p.compradorTelefono && (
                          <p className="text-xs text-gray-400">+57 {p.compradorTelefono}</p>
                        )}
                      </div>
                      <Badge estado={p.estadoActual} />
                    </div>

                    <div className="flex items-center justify-between">
                      <ProductoThumbs detalles={p.detalles ?? []} />
                      <span className="text-xs text-gray-400">{formatFecha(p.fecha)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!esTerminal && siguiente && (
                        <button
                          onClick={() => setModalData({ pedido: p, estadoNuevo: siguiente })}
                          className="flex-1 py-2 text-xs font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                          style={{ color: '#1C1C1E' }}
                        >
                          → {siguiente}
                        </button>
                      )}
                      <a
                        href={waUrl}
                        target="_blank" rel="noopener noreferrer"
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                        style={{ backgroundColor: '#22C55E' }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </a>
                      <button
                        onClick={() => navigate(`/asesor/pedido/${p.id}`)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200 hover:bg-gray-100 transition-colors text-gray-500 flex-shrink-0"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal de confirmación */}
      <StatusChangeModal
        isOpen={!!modalData}
        onClose={() => !saving && setModalData(null)}
        onConfirm={confirmarCambio}
        estadoActual={modalData?.pedido?.estadoActual}
        estadoNuevo={modalData?.estadoNuevo}
        pedidoId={modalData?.pedido?.id}
        clienteNombre={modalData ? `${modalData.pedido.compradorNombre} ${modalData.pedido.compradorApellido}` : ''}
        saving={saving}
      />
    </div>
  )
}
