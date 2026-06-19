import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { pedidosAsesor } from '../../api/pedidos'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'

const COP = n => '$' + new Intl.NumberFormat('es-CO').format(n ?? 0)

function formatFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

const ESTADOS = ['Por confirmar', 'Confirmado', 'En despacho', 'Entregado', 'Devuelto']

export default function AsesorDashboard() {
  const navigate = useNavigate()
  const [pedidos, setPedidos]   = useState([])
  const [loading, setLoading]   = useState(true)

  const [busqueda, setBusqueda]       = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [fechaDesde, setFechaDesde]   = useState('')
  const [fechaHasta, setFechaHasta]   = useState('')

  async function cargar() {
    try {
      const r = await pedidosAsesor()
      setPedidos([...r.data].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)))
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [])

  const pendientes = pedidos.filter(p => p.estadoActual === 'Por confirmar').length

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

  const inputClass = "px-3.5 py-2.5 text-sm bg-white rounded-xl border border-gray-200 focus:outline-none"
  const focusRed   = e => { e.target.style.borderColor = '#C0392B' }
  const blurGray   = e => { e.target.style.borderColor = '#E5E7EB' }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1C1C1E' }}>Mis pedidos</h1>
          <p className="text-sm text-gray-400 mt-0.5">Pedidos asignados a tu cuenta</p>
        </div>
        {pendientes > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl flex-shrink-0" style={{ backgroundColor: '#FEF2F1' }}>
            <div className="w-2 h-2 rounded-full bg-[#C0392B]" />
            <span className="text-sm font-semibold" style={{ color: '#C0392B' }}>{pendientes} por confirmar</span>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[180px]">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por cliente..."
            className={`w-full pl-10 pr-4 ${inputClass}`}
            onFocus={focusRed} onBlur={blurGray}
          />
        </div>
        <select
          value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)}
          className={inputClass}
          onFocus={focusRed} onBlur={blurGray}
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)}
          className={inputClass} onFocus={focusRed} onBlur={blurGray}
          title="Desde"
        />
        <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)}
          className={inputClass} onFocus={focusRed} onBlur={blurGray}
          title="Hasta"
        />
      </div>

      {hayFiltros && !loading && (
        <p className="text-sm text-gray-400 mb-3">
          Mostrando <span className="font-semibold text-gray-700">{filtrados.length}</span> de {pedidos.length} pedidos
        </p>
      )}

      {/* Tabla / Cards */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <p className="text-sm">{pedidos.length === 0 ? 'No tienes pedidos asignados aún.' : 'No hay pedidos que coincidan con los filtros.'}</p>
            {hayFiltros && (
              <button
                onClick={() => { setBusqueda(''); setEstadoFiltro(''); setFechaDesde(''); setFechaHasta('') }}
                className="mt-2 text-sm font-medium"
                style={{ color: '#C0392B' }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['#', 'CLIENTE', 'FECHA', 'MONTO', 'ESTADO', ''].map(h => (
                      <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(p => (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5 font-mono text-xs text-gray-500">#QS-2026-{String(p.id).padStart(4,'0')}</td>
                      <td className="px-6 py-3.5 font-medium text-gray-800">{p.compradorNombre} {p.compradorApellido}</td>
                      <td className="px-6 py-3.5 text-gray-500">{formatFecha(p.fecha)}</td>
                      <td className="px-6 py-3.5 font-semibold text-gray-800">{COP(p.totalNeto)}</td>
                      <td className="px-6 py-3.5"><Badge estado={p.estadoActual} /></td>
                      <td className="px-6 py-3.5">
                        <button
                          onClick={() => navigate(`/asesor/pedido/${p.id}`)}
                          className="px-3.5 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {filtrados.map(p => (
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
                  <button
                    onClick={() => navigate(`/asesor/pedido/${p.id}`)}
                    className="w-full mt-1 py-2 text-xs font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Ver detalle
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
