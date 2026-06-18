import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { obtenerKpis } from '../../api/admin'
import { todosPedidos } from '../../api/pedidos'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'

const COP = n => '$' + new Intl.NumberFormat('es-CO').format(n ?? 0)

const ESTADO_COLORS = {
  'Por confirmar': '#9CA3AF',
  'Confirmado':    '#3B82F6',
  'En despacho':   '#F59E0B',
  'Entregado':     '#22C55E',
  'Devuelto':      '#EF4444',
}

function semanaLabel(fecha) {
  const d = new Date(fecha)
  const start = new Date(d)
  start.setDate(d.getDate() - d.getDay())
  return start.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
}

function buildWeeklyData(pedidos) {
  const map = {}
  const now = new Date()
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i * 7)
    d.setDate(d.getDate() - d.getDay())
    const key = d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
    map[key] = { semana: key, pedidos: 0 }
  }
  pedidos.forEach(p => {
    const key = semanaLabel(p.fecha)
    if (map[key]) map[key].pedidos++
  })
  return Object.values(map)
}

const KPI_ICONS = {
  pedidos: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  ventas: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  clientes: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  pendientes: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
}

function formatFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminDashboard() {
  const [kpis, setKpis]       = useState(null)
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([obtenerKpis(), todosPedidos()])
      .then(([k, p]) => {
        setKpis(k.data)
        setPedidos(p.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>

  const weeklyData   = buildWeeklyData(pedidos)
  const donutData    = kpis?.pedidosPorEstado
    ? Object.entries(kpis.pedidosPorEstado).map(([name, value]) => ({ name, value }))
    : []
  const recientes    = [...pedidos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5)

  const kpiCards = [
    { label: 'Total pedidos',       value: kpis?.totalPedidos ?? 0,          format: v => v, icon: KPI_ICONS.pedidos,   color: '#3B82F6' },
    { label: 'Ventas realizadas',   value: kpis?.ventasRealizadas ?? 0,      format: COP,    icon: KPI_ICONS.ventas,    color: '#22C55E' },
    { label: 'Clientes registrados',value: kpis?.clientesRegistrados ?? 0,   format: v => v, icon: KPI_ICONS.clientes,  color: '#8B5CF6' },
    { label: 'Pedidos pendientes',  value: kpis?.pedidosPendientes ?? 0,     format: v => v, icon: KPI_ICONS.pendientes, color: '#F59E0B', alert: true },
  ]

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1C1C1E' }}>Panel de analítica</h1>
        <p className="text-sm text-gray-400 mt-0.5">Resumen general del negocio</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpiCards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{card.label}</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: card.color + '15', color: card.color }}>
                {card.icon}
              </div>
            </div>
            <p className="text-2xl font-black" style={{ color: card.alert && card.value > 0 ? '#F59E0B' : '#1C1C1E' }}>
              {card.format(card.value)}
            </p>
            {card.alert && card.value > 0 && (
              <p className="text-xs font-medium mt-1" style={{ color: '#F59E0B' }}>Requieren atención</p>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* BarChart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <p className="text-sm font-semibold text-gray-700 mb-1">Pedidos por semana</p>
          <p className="text-xs text-gray-400 mb-5">Últimas 8 semanas</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData} barSize={20}>
              <XAxis dataKey="semana" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #F3F4F6', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }}
                cursor={{ fill: '#F9FAFB' }}
              />
              <Bar dataKey="pedidos" fill="#C0392B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <p className="text-sm font-semibold text-gray-700 mb-1">Por estado</p>
          <p className="text-xs text-gray-400 mb-2">Distribución actual</p>
          {donutData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="45%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {donutData.map(entry => (
                    <Cell key={entry.name} fill={ESTADO_COLORS[entry.name] ?? '#9CA3AF'} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value, entry) => (
                    <span style={{ fontSize: 11, color: '#6B7280' }}>{value} <strong style={{ color: '#1C1C1E' }}>{entry.payload.value}</strong></span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-300 text-sm">Sin datos</div>
          )}
        </div>
      </div>

      {/* Pedidos recientes */}
      <div className="bg-white rounded-2xl border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">Pedidos recientes</p>
          <Link to="/admin/pedidos" className="text-xs font-medium hover:opacity-80" style={{ color: '#C0392B' }}>
            Ver todos →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                {['ID', 'CLIENTE', 'FECHA', 'ASESOR', 'MONTO', 'ESTADO'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recientes.map(p => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3.5 font-mono text-xs text-gray-500">#QS-2026-{String(p.id).padStart(4, '0')}</td>
                  <td className="px-6 py-3.5 font-medium text-gray-800">{p.compradorNombre} {p.compradorApellido}</td>
                  <td className="px-6 py-3.5 text-gray-500">{formatFecha(p.fecha)}</td>
                  <td className="px-6 py-3.5 text-gray-500">{p.asesorNombre ?? '—'}</td>
                  <td className="px-6 py-3.5 font-semibold text-gray-800">{COP(p.totalNeto)}</td>
                  <td className="px-6 py-3.5"><Badge estado={p.estadoActual} /></td>
                </tr>
              ))}
              {recientes.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400 text-sm">No hay pedidos aún</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
