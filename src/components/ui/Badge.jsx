const ESTADO_STYLES = {
  'Por confirmar': 'bg-gray-100 text-gray-600',
  'Confirmado':    'bg-blue-50 text-blue-700',
  'En despacho':   'bg-amber-50 text-amber-700',
  'Entregado':     'bg-green-50 text-green-700',
  'Devuelto':      'bg-red-50 text-red-700',
  'Activo':        'bg-green-50 text-green-700',
  'Inactivo':      'bg-gray-100 text-gray-500',
}

const DOT_COLORS = {
  'Por confirmar': 'bg-gray-400',
  'Confirmado':    'bg-blue-500',
  'En despacho':   'bg-amber-500',
  'Entregado':     'bg-green-500',
  'Devuelto':      'bg-red-500',
  'Activo':        'bg-green-500',
  'Inactivo':      'bg-gray-400',
}

export default function Badge({ estado }) {
  const style  = ESTADO_STYLES[estado] ?? 'bg-gray-100 text-gray-600'
  const dot    = DOT_COLORS[estado]    ?? 'bg-gray-400'

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {estado}
    </span>
  )
}
