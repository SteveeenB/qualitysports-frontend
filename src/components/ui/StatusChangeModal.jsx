import Badge from './Badge'

export default function StatusChangeModal({ isOpen, onClose, onConfirm, estadoActual, estadoNuevo, pedidoId, clienteNombre, saving }) {
  if (!isOpen) return null

  const idStr = pedidoId ? `#QS-2026-${String(pedidoId).padStart(4, '0')}` : ''

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-md"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Ícono */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
        </div>

        {/* Título */}
        <h2 className="text-base font-bold text-center mb-1" style={{ color: '#1C1C1E' }}>
          ¿Confirmas el cambio de estado?
        </h2>
        <p className="text-sm text-gray-400 text-center mb-5">
          Esta acción quedará registrada en la trazabilidad del pedido.
        </p>

        {/* Transición de estados */}
        <div className="flex items-center justify-center gap-3 bg-gray-50 rounded-xl px-4 py-3 mb-3">
          <Badge estado={estadoActual} />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
          <Badge estado={estadoNuevo} />
        </div>

        {/* Info pedido */}
        <p className="text-xs text-gray-400 text-center mb-6">
          {idStr}{clienteNombre ? ` · Cliente: ${clienteNombre}` : ''}
        </p>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            style={{ color: '#1C1C1E' }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={saving}
            className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors"
            style={{ backgroundColor: saving ? '#E57373' : '#C0392B' }}
          >
            {saving ? 'Procesando...' : 'Confirmar cambio'}
          </button>
        </div>
      </div>
    </div>
  )
}
