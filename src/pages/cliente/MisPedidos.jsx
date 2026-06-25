import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { misPedidos } from '../../api/pedidos'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

function formatCOP(n) {
  return new Intl.NumberFormat('es-CO').format(n)
}

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  useEffect(() => {
    misPedidos()
      .then(r => setPedidos(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Mis Pedidos</h1>
        <p className="text-gray-400 text-sm mt-1">Consulta el estado de tus pedidos</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-sm mb-2">No pudimos cargar tus pedidos.</p>
          <p className="text-gray-400 text-xs">Intenta recargar la página.</p>
        </div>
      ) : pedidos.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Sin pedidos aún"
          description="Cuando realices un pedido aparecerá aquí."
          action={{ label: 'Ver catálogo', onClick: () => {} }}
        />
      ) : (
        <div className="space-y-4">
          {pedidos.map(p => (
            <div key={p.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[#1C1C1E] text-sm">#{p.id}</span>
                  <Badge estado={p.estadoActual} />
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(p.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#1C1C1E]">${formatCOP(p.totalNeto)} COP</p>
                <Link to={`/mis-pedidos/${p.id}`} className="text-xs text-[#C0392B] hover:underline">
                  Ver detalle →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
