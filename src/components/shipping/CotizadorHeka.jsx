import { useEffect, useRef, useState } from 'react'
import { buscarCiudad, cotizarEnvio, generarGuia, getDefaults } from '../../api/heka'

const COP = n => '$' + new Intl.NumberFormat('es-CO').format(Math.round(n ?? 0))

const CARRIER_NAMES = {
  coordinadora:    'Coordinadora',
  servientrega:    'Servientrega',
  interrapidisimo: 'Interrapidísimo',
  envia:           'Envía',
  tcc:             'TCC',
  heka:            'Heka',
}

const CARRIER_COLORS = {
  coordinadora:    '#E30613',
  servientrega:    '#F7941D',
  interrapidisimo: '#00529B',
  envia:           '#00A651',
  tcc:             '#003DA5',
  heka:            '#F5A623',
}

function CarrierLogo({ distributorId }) {
  const color = CARRIER_COLORS[distributorId] ?? '#6B7280'
  const name  = CARRIER_NAMES[distributorId]  ?? distributorId ?? '?'
  const initials = (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
      style={{ backgroundColor: color }}
      title={name}
    >
      {initials}
    </div>
  )
}

function CarrierCard({ c, selectedCity, dims, onGuiaGenerada }) {
  const [expanded, setExpanded] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  async function handleGenerarGuia() {
    setLoading(true); setError(''); setSuccess('')
    try {
      const payload = {
        distributorId:   c.distributorId,
        cityDestination: selectedCity.dane,
        declaredValue:   dims.declaredValue,
        total:           c.total,
        weight:          dims.weight,
        height:          dims.height,
        longDim:         dims.longDim,
        width:           dims.width,
        collectionValue: dims.collectionValue,
        note:            '',
      }
      const r = await generarGuia(dims.pedidoId, payload)
      setSuccess(`Guía generada: ${r.data.guia}`)
      if (onGuiaGenerada) onGuiaGenerada(r.data)
    } catch (e) {
      const msg = e.response?.data?.message ?? e.response?.data ?? 'Error al generar la guía.'
      setError(typeof msg === 'string' ? msg : 'Error al generar la guía.')
    } finally {
      setLoading(false)
    }
  }

  const name  = CARRIER_NAMES[c.distributorId] ?? c.distributorId
  const color = CARRIER_COLORS[c.distributorId] ?? '#6B7280'

  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden transition-shadow hover:shadow-md"
         style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>

      {/* Header strip */}
      <div className="h-1 w-full" style={{ backgroundColor: color }} />

      <div className="p-4">
        {/* Row 1: logo + nombre + badges */}
        <div className="flex items-center gap-3 mb-3">
          <CarrierLogo distributorId={c.distributorId} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-gray-900">{name}</span>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                {c.days} día{c.days !== '1' ? 's' : ''} hábil{c.days !== '1' ? 'es' : ''}
              </span>
              {c.onlyToAddress && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                  Solo domicilio
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: métricas clave */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-green-50 rounded-xl p-3">
            <p className="text-xs text-green-700 font-medium mb-0.5">Te consignan</p>
            <p className="text-base font-bold text-green-800">{COP(c.valueDeposited)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 font-medium mb-0.5">Costo envío</p>
            <p className="text-base font-bold text-gray-800">{COP(c.total)}</p>
          </div>
        </div>

        {/* Annotations */}
        {c.annotations && (
          <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg mb-3 leading-relaxed">
            ℹ {c.annotations}
          </p>
        )}

        {/* Desglose expandible */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors mb-3"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
               className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          {expanded ? 'Ocultar desglose' : 'Ver desglose'}
        </button>

        {expanded && (
          <div className="bg-gray-50 rounded-xl p-3 mb-3 text-xs space-y-1.5">
            <DesgloseLine label="Flete base"              value={c.visualFlete} />
            <DesgloseLine label="Comisión transportadora" value={c.transportCommission} />
            <DesgloseLine label="Comisión Heka"           value={c.hekaCommission} />
            {c.assured > 0 && <DesgloseLine label="Seguro mercancía" value={c.assured} />}
            {c.gmf > 0     && <DesgloseLine label="GMF (4×1000)"     value={c.gmf} />}
            <div className="border-t border-gray-200 pt-1.5 mt-1.5 flex justify-between font-semibold text-gray-800">
              <span>Total envío</span>
              <span>{COP(c.total)}</span>
            </div>
          </div>
        )}

        {/* Acción */}
        {success ? (
          <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2.5 rounded-xl">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {success}
          </div>
        ) : (
          <button
            onClick={handleGenerarGuia}
            disabled={loading}
            className="w-full py-2.5 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-50"
            style={{ backgroundColor: color }}
            onMouseOver={e => !loading && (e.currentTarget.style.filter = 'brightness(0.88)')}
            onMouseOut={e => (e.currentTarget.style.filter = '')}
          >
            {loading ? 'Generando...' : `Generar guía — ${name}`}
          </button>
        )}

        {error && (
          <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl mt-2">{error}</p>
        )}
      </div>
    </div>
  )
}

function DesgloseLine({ label, value }) {
  return (
    <div className="flex justify-between text-gray-600">
      <span>{label}</span>
      <span className="font-medium text-gray-800">{COP(value)}</span>
    </div>
  )
}

export default function CotizadorHeka({ pedido, onGuiaGenerada }) {
  const [defaults, setDefaults]     = useState({ weight: 1, height: 10, longDim: 10, width: 10 })
  const [cityQuery, setCityQuery]   = useState(pedido.municipio ?? '')
  const [citySuggestions, setSugg]  = useState([])
  const [selectedCity, setCity]     = useState(null)
  const [dims, setDims]             = useState(null)
  const [cotizaciones, setCotiz]    = useState([])
  const [loading, setLoading]       = useState({ defaults: true, city: false, quote: false })
  const [error, setError]           = useState('')
  const debounceRef                 = useRef(null)

  useEffect(() => {
    if (pedido.cityDane) {
      setCity({ dane: pedido.cityDane, label: pedido.municipio ?? pedido.cityDane })
      setCityQuery(pedido.municipio ?? '')
    }
  }, [pedido.cityDane, pedido.municipio])

  useEffect(() => {
    getDefaults()
      .then(r => {
        setDefaults(r.data)
        setDims({
          pedidoId:       pedido.id,
          weight:         r.data.weight,
          height:         r.data.height,
          longDim:        r.data.longDim,
          width:          r.data.width,
          declaredValue:  pedido.totalNeto,
          collectionValue: pedido.totalNeto,
        })
      })
      .catch(() => setDims({
        pedidoId: pedido.id, weight: 1, height: 10, longDim: 10, width: 10,
        declaredValue: pedido.totalNeto, collectionValue: pedido.totalNeto,
      }))
      .finally(() => setLoading(l => ({ ...l, defaults: false })))
  }, [pedido.id, pedido.totalNeto])

  function onCityInput(val) {
    setCityQuery(val); setCity(null); setSugg([])
    clearTimeout(debounceRef.current)
    if (val.length < 3) return
    debounceRef.current = setTimeout(() => {
      setLoading(l => ({ ...l, city: true }))
      buscarCiudad(val.toUpperCase())
        .then(r => setSugg(r.data ?? []))
        .catch(() => { setSugg([]); setError('No se pudo conectar con HekaEntrega.') })
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
      if (!r.data?.length) {
        setError('No se encontraron cotizaciones para ese destino.')
      } else {
        // ordenar por lo que le llega al vendedor (mayor primero = mejor negocio)
        setCotiz([...r.data].sort((a, b) => (b.valueDeposited ?? 0) - (a.valueDeposited ?? 0)))
      }
    } catch {
      setError('Error al cotizar. Verifica la ciudad de destino.')
    } finally {
      setLoading(l => ({ ...l, quote: false }))
    }
  }

  function setDim(key, val) {
    setDims(d => ({ ...d, [key]: val === '' ? '' : Number(val) }))
  }

  if (loading.defaults) return null

  // Pedido ya tiene guía
  if (pedido.guia) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5"
           style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Envío</p>
        <div className="flex items-center gap-3">
          <CarrierLogo distributorId={pedido.transportadora} />
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {CARRIER_NAMES[pedido.transportadora] ?? pedido.transportadora}
            </p>
            <p className="text-xs text-gray-500">
              Guía: <span className="font-mono font-medium">{pedido.guia}</span>
            </p>
            {pedido.costoEnvio && (
              <p className="text-xs text-gray-400">Costo: {COP(pedido.costoEnvio)}</p>
            )}
            {pedido.hekaShipmentId && (
              <p className="text-xs text-gray-300 mt-0.5">
                ID Heka: <span className="font-mono">{pedido.hekaShipmentId}</span>
              </p>
            )}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(pedido.guia)}
            className="ml-auto p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-400"
            title="Copiar número de guía"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5"
         style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
        Generar guía de envío
      </p>

      {/* Ciudad destino */}
      <div className="mb-4 relative">
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Ciudad de destino</label>
        <input
          type="text"
          value={cityQuery}
          onChange={e => onCityInput(e.target.value)}
          placeholder="Ej: BOGOTA, MEDELLIN..."
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none"
          onFocus={e => (e.target.style.borderColor = '#C0392B')}
          onBlur={e =>  (e.target.style.borderColor = '#E5E7EB')}
        />
        {loading.city && <p className="text-xs text-gray-400 mt-1">Buscando...</p>}
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
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Paquete</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
            {[
              { key: 'weight',  label: 'Peso (kg)' },
              { key: 'height',  label: 'Alto (cm)' },
              { key: 'longDim', label: 'Largo (cm)' },
              { key: 'width',   label: 'Ancho (cm)' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs text-gray-400 mb-1">{label}</label>
                <input
                  type="number" min="1" value={dims[key]}
                  onChange={e => setDim(key, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none text-center"
                  onFocus={e => (e.target.style.borderColor = '#C0392B')}
                  onBlur={e =>  (e.target.style.borderColor = '#E5E7EB')}
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Valor declarado</label>
              <input
                type="number" min="0" value={dims.declaredValue}
                onChange={e => setDim('declaredValue', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none"
                onFocus={e => (e.target.style.borderColor = '#C0392B')}
                onBlur={e =>  (e.target.style.borderColor = '#E5E7EB')}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Valor a recaudar</label>
              <input
                type="number" min="0" value={dims.collectionValue}
                onChange={e => setDim('collectionValue', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none"
                onFocus={e => (e.target.style.borderColor = '#C0392B')}
                onBlur={e =>  (e.target.style.borderColor = '#E5E7EB')}
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
        onMouseOut={e => (e.currentTarget.style.backgroundColor = '#C0392B')}
      >
        {loading.quote ? 'Cotizando...' : 'Cotizar envíos'}
      </button>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-2.5 rounded-xl mb-3">{error}</p>
      )}

      {/* Tarjetas de cotización */}
      {cotizaciones.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            {cotizaciones.length} opción{cotizaciones.length !== 1 ? 'es' : ''} — ordenadas por mayor consignación
          </p>
          <div className="space-y-3">
            {cotizaciones.map(c => (
              <CarrierCard
                key={c.distributorId}
                c={c}
                selectedCity={selectedCity}
                dims={dims}
                onGuiaGenerada={onGuiaGenerada}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
