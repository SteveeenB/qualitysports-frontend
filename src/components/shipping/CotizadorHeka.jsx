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

function CarrierLogo({ distributorId, size = 'md' }) {
  const color = CARRIER_COLORS[distributorId] ?? '#6B7280'
  const name  = CARRIER_NAMES[distributorId]  ?? distributorId ?? '?'
  const initials = (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const sz = size === 'lg' ? 'w-14 h-14 text-sm' : 'w-11 h-11 text-xs'
  return (
    <div
      className={`${sz} rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{ backgroundColor: color }}
      title={name}
    >
      {initials}
    </div>
  )
}

// ── Formulario de creación de guía ───────────────────────────────────────────

function FormularioGuia({ carrier, selectedCity, pedido, dims, onVolver, onGuiaGenerada }) {
  const color   = CARRIER_COLORS[carrier.distributorId] ?? '#6B7280'
  const nombre  = CARRIER_NAMES[carrier.distributorId]  ?? carrier.distributorId

  const productoInicial = pedido.detalles
    ?.map(d => d.nombre).filter(Boolean).slice(0, 3).join(', ') || 'Calzado deportivo'

  const [form, setForm] = useState({
    declaredValue:   pedido.totalNeto,
    collectionValue: pedido.totalNeto,
    weight:          dims.weight,
    height:          dims.height,
    longDim:         dims.longDim,
    width:           dims.width,
    product:         productoInicial,
    note:            '',
    nombre:          `${pedido.compradorNombre ?? ''} ${pedido.compradorApellido ?? ''}`.trim(),
    documento:       pedido.compradorCedula ?? '',
    tipoDoc:         'CC',
    telefono:        pedido.compradorTelefono ?? '',
    direccion:       pedido.direccionEnvio ?? '',
    barrio:          pedido.barrio ?? '',
    email:           pedido.compradorEmail ?? '',
    obsAdicionales:  '',
  })

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')

  function setF(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleCrearGuia() {
    setLoading(true); setError(''); setSuccess('')
    try {
      const payload = {
        distributorId:   carrier.distributorId,
        cityDestination: selectedCity.dane,
        declaredValue:   Number(form.declaredValue),
        total:           carrier.total,
        weight:          Number(form.weight),
        height:          Number(form.height),
        longDim:         Number(form.longDim),
        width:           Number(form.width),
        collectionValue: Number(form.collectionValue),
        product:         form.product,
        note:            form.note,
      }
      const r = await generarGuia(pedido.id, payload)
      const guia = r.data?.guia ?? r.data?.hekaShipmentId ?? '(procesando)'
      setSuccess(`Guía creada: ${guia}`)
      if (onGuiaGenerada) onGuiaGenerada(r.data)
    } catch (e) {
      const msg = e.response?.data?.message ?? e.response?.data ?? 'Error al generar la guía.'
      setError(typeof msg === 'string' ? msg : 'Error al generar la guía.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6"
           style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="h-1 w-full rounded-t-2xl -mt-6 -mx-6 mb-6 w-[calc(100%+48px)]"
             style={{ backgroundColor: color }} />
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a"
                 strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p className="text-lg font-bold text-gray-900">{success}</p>
          <p className="text-sm text-gray-500">Transportadora: {nombre}</p>
          <p className="text-sm text-gray-400">El pedido pasó a estado <strong>En despacho</strong></p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
         style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

      {/* Header */}
      <div className="h-1 w-full" style={{ backgroundColor: color }} />
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
        <button
          onClick={onVolver}
          className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-600"
          title="Volver a cotizaciones"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <CarrierLogo distributorId={carrier.distributorId} />
        <div>
          <p className="text-sm font-bold text-gray-900">{nombre}</p>
          <p className="text-xs text-gray-400">{selectedCity.label} · {carrier.days} día{carrier.days !== '1' ? 's' : ''} hábil{carrier.days !== '1' ? 'es' : ''}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-gray-400">Costo envío</p>
          <p className="text-sm font-bold text-gray-800">{COP(carrier.total)}</p>
        </div>
      </div>

      <div className="p-5 space-y-5">

        {/* Datos del envío */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Datos del envío
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <ReadField label="Ciudad de origen" value="Cúcuta, Norte de Santander" />
            <ReadField label="Ciudad de destino" value={selectedCity.label} />
            <EditField label="Valor declarado ($)" type="number"
              value={form.declaredValue} onChange={v => setF('declaredValue', v)} />
            <EditField label="Valor a recaudar ($)" type="number"
              value={form.collectionValue} onChange={v => setF('collectionValue', v)} />
          </div>
        </section>

        {/* Datos del producto */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Datos del producto
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <EditField label="Peso (kg)"  type="number" value={form.weight}  onChange={v => setF('weight', v)} />
            <EditField label="Alto (cm)"  type="number" value={form.height}  onChange={v => setF('height', v)} />
            <EditField label="Largo (cm)" type="number" value={form.longDim} onChange={v => setF('longDim', v)} />
            <EditField label="Ancho (cm)" type="number" value={form.width}   onChange={v => setF('width', v)} />
          </div>
          <div className="space-y-3">
            <EditField label="Descripción del producto" value={form.product}
              onChange={v => setF('product', v)} />
            <EditField label="Nota / instrucciones (opcional)" value={form.note}
              onChange={v => setF('note', v)} placeholder="Ej: Manejar con cuidado" />
          </div>
        </section>

        {/* Datos del destinatario */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Datos del destinatario
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <EditField label="Nombre completo" value={form.nombre}
                onChange={v => setF('nombre', v)} colSpan />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <EditField label="Documento" value={form.documento}
                onChange={v => setF('documento', v)} />
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tipo documento</label>
                <select
                  value={form.tipoDoc}
                  onChange={e => setF('tipoDoc', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white"
                  onFocus={e => (e.target.style.borderColor = '#C0392B')}
                  onBlur={e =>  (e.target.style.borderColor = '#E5E7EB')}
                >
                  {['CC','CE','NIT','PA'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <EditField label="Teléfono" value={form.telefono}
                onChange={v => setF('telefono', v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <EditField label="Dirección" value={form.direccion}
                onChange={v => setF('direccion', v)} />
              <EditField label="Barrio" value={form.barrio}
                onChange={v => setF('barrio', v)} placeholder="Barrio (opcional)" />
            </div>
            <EditField label="Email (opcional)" value={form.email}
              onChange={v => setF('email', v)} placeholder="email@ejemplo.com" />
            <EditField label="Observaciones adicionales (opcional)" value={form.obsAdicionales}
              onChange={v => setF('obsAdicionales', v)} placeholder="Información adicional a la dirección" />
          </div>
        </section>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 px-3 py-2.5 rounded-xl">{error}</p>
        )}

        <button
          onClick={handleCrearGuia}
          disabled={loading}
          className="w-full py-3 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-50"
          style={{ backgroundColor: color }}
          onMouseOver={e => !loading && (e.currentTarget.style.filter = 'brightness(0.88)')}
          onMouseOut={e => (e.currentTarget.style.filter = '')}
        >
          {loading ? 'Creando guía...' : `Crear guía — ${nombre}`}
        </button>
      </div>
    </div>
  )
}

function ReadField({ label, value }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <div className="px-3 py-2 text-sm bg-gray-50 rounded-xl text-gray-600 border border-gray-100">
        {value || '—'}
      </div>
    </div>
  )
}

function EditField({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none"
        onFocus={e => (e.target.style.borderColor = '#C0392B')}
        onBlur={e =>  (e.target.style.borderColor = '#E5E7EB')}
      />
    </div>
  )
}

// ── Tarjeta de cotización ────────────────────────────────────────────────────

function CarrierCard({ c, onSeleccionar }) {
  const [expanded, setExpanded] = useState(false)
  const name  = CARRIER_NAMES[c.distributorId] ?? c.distributorId
  const color = CARRIER_COLORS[c.distributorId] ?? '#6B7280'

  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden transition-shadow hover:shadow-md"
         style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="h-1 w-full" style={{ backgroundColor: color }} />
      <div className="p-4">
        {/* Fila logo + nombre + badge días */}
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

        {/* Métricas */}
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
        <button
          onClick={() => onSeleccionar(c)}
          className="w-full py-2.5 text-sm font-semibold text-white rounded-xl transition-colors"
          style={{ backgroundColor: color }}
          onMouseOver={e => (e.currentTarget.style.filter = 'brightness(0.88)')}
          onMouseOut={e =>  (e.currentTarget.style.filter = '')}
        >
          Generar guía — {name}
        </button>
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

// ── Componente principal ─────────────────────────────────────────────────────

export default function CotizadorHeka({ pedido, onGuiaGenerada }) {
  const [defaults, setDefaults]    = useState({ weight: 1, height: 10, longDim: 10, width: 10 })
  const [cityQuery, setCityQuery]  = useState(pedido.municipio ?? '')
  const [citySugg, setSugg]        = useState([])
  const [selectedCity, setCity]    = useState(null)
  const [dims, setDims]            = useState(null)
  const [cotizaciones, setCotiz]   = useState([])
  const [tipoEntrega, setTipo]     = useState('domicilio')
  const [loading, setLoading]      = useState({ defaults: true, city: false, quote: false })
  const [error, setError]          = useState('')

  // Vista activa: 'cotizar' | 'formulario'
  const [vista, setVista]          = useState('cotizar')
  const [carrierSel, setCarrierSel] = useState(null)

  const debounceRef = useRef(null)

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
          weight: r.data.weight, height: r.data.height,
          longDim: r.data.longDim, width: r.data.width,
        })
      })
      .catch(() => setDims({ weight: 1, height: 10, longDim: 10, width: 10 }))
      .finally(() => setLoading(l => ({ ...l, defaults: false })))
  }, [])

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
        declaredValue:    pedido.totalNeto,
        weight:           dims.weight,
        height:           dims.height,
        longDim:          dims.longDim,
        width:            dims.width,
        withshippingCost: false,
        collectionValue:  pedido.totalNeto,
      }
      const r = await cotizarEnvio(payload)
      if (!r.data?.length) {
        setError('No se encontraron cotizaciones para ese destino.')
      } else {
        setCotiz([...r.data].sort((a, b) => (b.valueDeposited ?? 0) - (a.valueDeposited ?? 0)))
      }
    } catch {
      setError('Error al cotizar. Verifica la ciudad de destino.')
    } finally {
      setLoading(l => ({ ...l, quote: false }))
    }
  }

  function abrirFormulario(carrier) {
    setCarrierSel(carrier)
    setVista('formulario')
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
              <p className="text-xs text-gray-300 mt-0.5 font-mono">{pedido.hekaShipmentId}</p>
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

  // Vista formulario de creación de guía
  if (vista === 'formulario' && carrierSel && dims) {
    return (
      <FormularioGuia
        carrier={carrierSel}
        selectedCity={selectedCity}
        pedido={pedido}
        dims={dims}
        onVolver={() => setVista('cotizar')}
        onGuiaGenerada={onGuiaGenerada}
      />
    )
  }

  // Vista cotizador
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
        {citySugg.length > 0 && !selectedCity && (
          <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {citySugg.slice(0, 6).map(c => (
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

      {/* Toggle domicilio / oficina */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Tipo de entrega al cliente</label>
        <div className="flex rounded-xl border border-gray-200 overflow-hidden text-sm font-medium">
          {[
            { key: 'domicilio', label: '🏠 A domicilio' },
            { key: 'oficina',   label: '🏪 En oficina' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setTipo(key); setCotiz([]) }}
              className="flex-1 py-2 transition-colors"
              style={{
                backgroundColor: tipoEntrega === key ? '#C0392B' : 'transparent',
                color: tipoEntrega === key ? '#fff' : '#6B7280',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {tipoEntrega === 'oficina' && (
          <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg mt-2">
            Solo se muestran transportadoras que permiten retiro en sucursal.
          </p>
        )}
      </div>

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
      {cotizaciones.length > 0 && (() => {
        const visibles = tipoEntrega === 'oficina'
          ? cotizaciones.filter(c => !c.onlyToAddress)
          : cotizaciones
        return (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              {visibles.length} opción{visibles.length !== 1 ? 'es' : ''} — ordenadas por mayor consignación
            </p>
            {visibles.length === 0 ? (
              <p className="text-xs text-gray-500 bg-gray-50 px-3 py-3 rounded-xl text-center">
                Ninguna transportadora disponible para retiro en oficina en este destino.
              </p>
            ) : (
              <div className="space-y-3">
                {visibles.map(c => (
                  <CarrierCard
                    key={c.distributorId}
                    c={c}
                    onSeleccionar={abrirFormulario}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })()}
    </div>
  )
}
