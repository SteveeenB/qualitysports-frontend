import { useEffect, useRef, useState } from 'react'
import { buscarCiudad, cotizarEnvio, generarGuia, getDefaults } from '../../api/heka'

const COP = n => '$' + new Intl.NumberFormat('es-CO').format(n ?? 0)

const CARRIER_NAMES = {
  coordinadora:    'Coordinadora',
  servientrega:    'Servientrega',
  interrapidisimo: 'Interrapidísimo',
  envia:           'Envía',
  heka:            'Heka',
}

const CARRIER_COLORS = {
  coordinadora:    '#E30613',
  servientrega:    '#F7941D',
  interrapidisimo: '#00529B',
  envia:           '#00A651',
  heka:            '#F5A623',
}

function CarrierLogo({ distributorId }) {
  const color = CARRIER_COLORS[distributorId] ?? '#6B7280'
  const name  = CARRIER_NAMES[distributorId]  ?? distributorId

  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
      style={{ backgroundColor: color }}
      title={name}
    >
      {initials}
    </div>
  )
}

export default function CotizadorHeka({ pedido, onGuiaGenerada }) {
  const [defaults, setDefaults]       = useState({ weight: 1, height: 10, longDim: 10, width: 10 })
  const [cityQuery, setCityQuery]     = useState(pedido.municipio ?? '')
  const [citySuggestions, setSugg]   = useState([])
  const [selectedCity, setCity]       = useState(null)
  const [dims, setDims]               = useState(null)
  const [cotizaciones, setCotiz]      = useState([])
  const [loading, setLoading]         = useState({ defaults: true, city: false, quote: false, guide: false })
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')
  const [generando, setGenerando]     = useState(null)
  const debounceRef                   = useRef(null)

  useEffect(() => {
    getDefaults()
      .then(r => {
        setDefaults(r.data)
        setDims({
          weight:  r.data.weight,
          height:  r.data.height,
          longDim: r.data.longDim,
          width:   r.data.width,
          declaredValue: pedido.totalNeto,
          collectionValue: pedido.totalNeto,
        })
      })
      .catch(() => {
        setDims({
          weight: 1, height: 10, longDim: 10, width: 10,
          declaredValue: pedido.totalNeto,
          collectionValue: pedido.totalNeto,
        })
      })
      .finally(() => setLoading(l => ({ ...l, defaults: false })))
  }, [pedido.totalNeto])

  function onCityInput(val) {
    setCityQuery(val)
    setCity(null)
    setSugg([])
    clearTimeout(debounceRef.current)
    if (val.length < 3) return
    debounceRef.current = setTimeout(() => {
      setLoading(l => ({ ...l, city: true }))
      buscarCiudad(val.toUpperCase())
        .then(r => setSugg(r.data ?? []))
        .catch(() => setSugg([]))
        .finally(() => setLoading(l => ({ ...l, city: false })))
    }, 300)
  }

  async function handleCotizar() {
    if (!selectedCity) { setError('Selecciona la ciudad de destino primero.'); return }
    setError(''); setCotiz([])
    setLoading(l => ({ ...l, quote: true }))
    try {
      const payload = {
        cityOrigin:       null,
        cityDestination:  selectedCity.dane,
        typePayment:      1,
        declaredValue:    dims.declaredValue,
        weight:           dims.weight,
        height:           dims.height,
        longDim:          dims.longDim,
        width:            dims.width,
        withshippingCost: false,
        collectionValue:  dims.collectionValue,
      }
      const r = await cotizarEnvio(payload)
      if (!r.data || r.data.length === 0) {
        setError('No se encontraron cotizaciones para ese destino.')
      } else {
        setCotiz(r.data)
      }
    } catch (e) {
      setError('Error al cotizar. Verifica la ciudad de destino.')
    } finally {
      setLoading(l => ({ ...l, quote: false }))
    }
  }

  async function handleGenerarGuia(carrier) {
    setGenerando(carrier.distributorId)
    setError(''); setSuccess('')
    try {
      const payload = {
        distributorId:   carrier.distributorId,
        cityDestination: selectedCity.dane,
        declaredValue:   dims.declaredValue,
        total:           carrier.total,
        weight:          dims.weight,
        height:          dims.height,
        longDim:         dims.longDim,
        width:           dims.width,
        collectionValue: dims.collectionValue,
        note:            '',
      }
      const r = await generarGuia(pedido.id, payload)
      setSuccess(`Guía generada: ${r.data.guia} — ${CARRIER_NAMES[r.data.transportadora] ?? r.data.transportadora}`)
      setCotiz([])
      if (onGuiaGenerada) onGuiaGenerada(r.data)
    } catch (e) {
      const msg = e.response?.data?.message ?? e.response?.data ?? 'Error al generar la guía.'
      setError(typeof msg === 'string' ? msg : 'Error al generar la guía.')
    } finally {
      setGenerando(null)
    }
  }

  function setDim(key, val) {
    setDims(d => ({ ...d, [key]: val === '' ? '' : Number(val) }))
  }

  if (loading.defaults) return null

  if (pedido.guia) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Envío</p>
        <div className="flex items-center gap-3">
          <CarrierLogo distributorId={pedido.transportadora} />
          <div>
            <p className="text-sm font-semibold text-gray-800">{CARRIER_NAMES[pedido.transportadora] ?? pedido.transportadora}</p>
            <p className="text-xs text-gray-500">Guía: <span className="font-mono font-medium">{pedido.guia}</span></p>
            {pedido.costoEnvio && <p className="text-xs text-gray-400">Costo: {COP(pedido.costoEnvio)}</p>}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(pedido.guia)}
            className="ml-auto p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-400"
            title="Copiar número de guía"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Generar guía de envío</p>

      {/* Ciudad destino */}
      <div className="mb-4 relative">
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Ciudad de destino</label>
        <input
          type="text"
          value={cityQuery}
          onChange={e => onCityInput(e.target.value)}
          placeholder="Ej: BOGOTA, MEDELLIN..."
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none"
          onFocus={e => e.target.style.borderColor = '#C0392B'}
          onBlur={e => e.target.style.borderColor = '#E5E7EB'}
        />
        {loading.city && (
          <p className="text-xs text-gray-400 mt-1">Buscando...</p>
        )}
        {citySuggestions.length > 0 && !selectedCity && (
          <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {citySuggestions.slice(0, 6).map(c => (
              <button
                key={c.id ?? c.dane}
                onClick={() => { setCity(c); setCityQuery(c.label); setSugg([]) }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
              >
                <span className="font-medium text-gray-800">{c.label}</span>
                <span className="ml-2 text-xs text-gray-400">{c.dane}</span>
              </button>
            ))}
          </div>
        )}
        {selectedCity && (
          <p className="text-xs text-green-600 mt-1">✓ {selectedCity.label} ({selectedCity.dane})</p>
        )}
      </div>

      {/* Dimensiones */}
      {dims && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Dimensiones del paquete</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { key: 'weight',  label: 'Peso (kg)' },
              { key: 'height',  label: 'Alto (cm)' },
              { key: 'longDim', label: 'Largo (cm)' },
              { key: 'width',   label: 'Ancho (cm)' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs text-gray-400 mb-1">{label}</label>
                <input
                  type="number"
                  min="1"
                  value={dims[key]}
                  onChange={e => setDim(key, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none text-center"
                  onFocus={e => e.target.style.borderColor = '#C0392B'}
                  onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Valor declarado</label>
              <input
                type="number"
                min="0"
                value={dims.declaredValue}
                onChange={e => setDim('declaredValue', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none"
                onFocus={e => e.target.style.borderColor = '#C0392B'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Valor a recaudar</label>
              <input
                type="number"
                min="0"
                value={dims.collectionValue}
                onChange={e => setDim('collectionValue', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none"
                onFocus={e => e.target.style.borderColor = '#C0392B'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>
          </div>
        </div>
      )}

      {/* Botón cotizar */}
      <button
        onClick={handleCotizar}
        disabled={loading.quote || !selectedCity}
        className="w-full py-2.5 text-sm font-semibold text-white rounded-xl transition-colors mb-4 disabled:opacity-50"
        style={{ backgroundColor: '#C0392B' }}
        onMouseOver={e => !loading.quote && !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#A93226')}
        onMouseOut={e => e.currentTarget.style.backgroundColor = '#C0392B'}
      >
        {loading.quote ? 'Cotizando...' : 'Cotizar envíos'}
      </button>

      {/* Tarjetas de cotización */}
      {cotizaciones.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Opciones disponibles</p>
          {cotizaciones.map(c => (
            <div
              key={c.distributorId}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <CarrierLogo distributorId={c.distributorId} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{CARRIER_NAMES[c.distributorId] ?? c.distributorId}</p>
                <p className="text-xs text-gray-400">Entrega: {c.days ?? '—'} días hábiles</p>
              </div>
              <div className="text-right flex-shrink-0 mr-2">
                <p className="text-sm font-bold" style={{ color: '#C0392B' }}>{COP(c.total)}</p>
                {c.commission && <p className="text-xs text-gray-400">Com: {COP(c.commission)}</p>}
              </div>
              <button
                onClick={() => handleGenerarGuia(c)}
                disabled={generando !== null}
                className="px-3 py-2 text-xs font-semibold text-white rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                style={{ backgroundColor: '#1C1C1E' }}
              >
                {generando === c.distributorId ? '...' : 'Generar'}
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-2.5 rounded-xl mt-3">{error}</p>
      )}

      {success && (
        <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2.5 rounded-xl mt-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {success}
        </div>
      )}
    </div>
  )
}
