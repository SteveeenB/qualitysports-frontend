import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Truck, Storefront, Info } from '@phosphor-icons/react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { crearPedido, listarDescuentos } from '../../api/pedidos'
import { getPerfil } from '../../api/auth'
import { departamentos, getMunicipios } from 'colombia-territorial'
import Spinner from '../../components/ui/Spinner'
import { pixelInitiateCheckout, getCookie } from '../../utils/metaPixel.js'

function formatCOP(n) {
  return new Intl.NumberFormat('es-CO').format(n)
}

// ── Combobox ─────────────────────────────────────────────────────────────────
function Combobox({ options, value, onChange, placeholder, disabled = false }) {
  const [query, setQuery]   = useState(value || '')
  const [open, setOpen]     = useState(false)
  const ref = useRef(null)

  useEffect(() => { setQuery(value || '') }, [value])

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()))

  function select(opt) {
    onChange(opt)
    setQuery(opt)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={query}
        disabled={disabled}
        onChange={e => { setQuery(e.target.value); onChange(''); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C0392B] disabled:bg-gray-100 disabled:text-gray-400"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {filtered.map(opt => (
            <li key={opt}
              onMouseDown={() => select(opt)}
              className="px-3.5 py-2 text-sm cursor-pointer hover:bg-[#FEF2F1] hover:text-[#C0392B]"
            >{opt}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({ label, placeholder, type = 'text', half = false, value, error, onChange, required = true }) {
  return (
    <div className={half ? 'col-span-1' : 'col-span-2'}>
      <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">
        {label}{required && <span className="text-[#C0392B]"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors
          ${error ? 'border-[#C0392B]' : 'border-gray-200 focus:border-[#C0392B]'}`}
      />
      {error && <p className="text-xs text-[#C0392B] mt-1">{error}</p>}
    </div>
  )
}

// ── Stepper ────────────────────────────────────────────────────────────────────
function Stepper() {
  const steps = ['Carrito', 'Datos', 'Confirmado']
  const active = 1

  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                backgroundColor: i <= active ? '#C0392B' : '#E5E5E5',
                color: i <= active ? '#FFFFFF' : '#9CA3AF',
              }}
            >
              {i + 1}
            </div>
            <span
              className="text-xs font-medium"
              style={{ color: i === active ? '#C0392B' : i < active ? '#1C1C1E' : '#9CA3AF' }}
            >
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className="w-8 h-px mx-2 flex-shrink-0"
              style={{ backgroundColor: i < active ? '#C0392B' : '#E5E5E5' }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Lógica de descuento ───────────────────────────────────────────────────────
function calcularDescuento(subtotal, totalPares, reglas) {
  if (!reglas || reglas.length === 0) return null
  const regla = [...reglas]
    .sort((a, b) => b.cantidadPares - a.cantidadPares)
    .find(r => r.cantidadPares <= totalPares)
  if (!regla) return null
  const precioPorPar = regla.precioTotalPaquete / regla.cantidadPares
  const totalNeto = precioPorPar * totalPares
  const ahorro = subtotal - totalNeto
  if (ahorro <= 0) return null
  return { totalNeto, ahorro }
}

// ── Datos DIVIPOLA ────────────────────────────────────────────────────────────
const DEPARTAMENTOS = departamentos.map(d => d.nombre).sort()

const INITIAL = {
  compradorNombre: '', compradorApellido: '', compradorCedula: '',
  compradorTelefono: '', compradorEmail: '',
  direccionEnvio: '', barrio: '', municipio: '', departamento: '',
  modalidadEntrega: 'DOMICILIO',
}

export default function Checkout() {
  const { items: cartItems, subtotal, clearCart } = useCart()
  const { user, role } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]         = useState(INITIAL)
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]     = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [reglas, setReglas]     = useState([])
  const [prefilled, setPrefilled] = useState(false)
  const [cityDane, setCityDane] = useState(null)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  useEffect(() => {
    if (cartItems.length > 0) {
      pixelInitiateCheckout({
        value:    subtotal,
        numItems: cartItems.reduce((s, i) => s + i.cantidad, 0),
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    listarDescuentos().then(r => setReglas(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (role !== 'CLIENTE') return
    const parts = (user?.nombre ?? '').trim().split(/\s+/)
    const nombre   = parts[0] ?? ''
    const apellido = parts.slice(1).join(' ')
    setForm(f => ({ ...f, compradorNombre: nombre, compradorApellido: apellido, compradorEmail: user?.email ?? '' }))
    getPerfil()
      .then(r => {
        const p = r.data
        setForm(f => ({
          ...f,
          compradorTelefono: p.telefono    || f.compradorTelefono,
          direccionEnvio:    p.direccionEnvio || f.direccionEnvio,
        }))
        setPrefilled(true)
      })
      .catch(() => { setPrefilled(true) })
  }, [])

  if (cartItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-500 mb-4">Tu carrito está vacío.</p>
        <Link to="/catalogo" className="text-[#C0392B] font-medium hover:underline">Ver catálogo</Link>
      </div>
    )
  }

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  function setDepartamento(dep) {
    setForm(f => ({ ...f, departamento: dep, municipio: '' }))
    setErrors(e => ({ ...e, departamento: '', municipio: '' }))
    setCityDane(null)
  }

  function setMunicipio(nombre) {
    setForm(f => ({ ...f, municipio: nombre }))
    setErrors(e => ({ ...e, municipio: '' }))
    if (!nombre) { setCityDane(null); return }
    const muni = getMunicipios(form.departamento).find(m => m.nombre === nombre)
    setCityDane(muni ? muni.codigo_dane + '000' : null)
  }

  function validate() {
    const e = {}
    if (!form.compradorNombre.trim())    e.compradorNombre    = 'Requerido'
    if (!form.compradorApellido.trim())  e.compradorApellido  = 'Requerido'
    if (!form.compradorCedula.trim())    e.compradorCedula    = 'Requerido'
    if (!form.compradorTelefono.trim())  e.compradorTelefono  = 'Requerido'
    if (!form.compradorEmail.trim())     e.compradorEmail     = 'Requerido'
    else if (!/\S+@\S+\.\S+/.test(form.compradorEmail)) e.compradorEmail = 'Correo inválido'
    if (!form.departamento.trim()) e.departamento = 'Requerido'
    if (!form.municipio.trim())    e.municipio    = 'Requerido'
    else if (!cityDane)            e.municipio    = 'Selecciona un municipio de la lista'
    if (form.modalidadEntrega === 'DOMICILIO') {
      if (!form.direccionEnvio.trim()) e.direccionEnvio = 'Requerido'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const items = cartItems.map(i => ({
        productoId: i.product.id,
        cantidad: i.cantidad,
        talla: Number(i.talla),
      }))
      const payload = {
        ...form,
        items,
        cityDane,
        fbp: getCookie('_fbp') ?? null,
        fbc: getCookie('_fbc') ?? null,
      }
      const res = await crearPedido(payload)
      clearCart()
      navigate(`/confirmacion/${res.data.pedidoId}`, { state: res.data })
    } catch (err) {
      setSubmitError(err.response?.data?.message ?? 'Error al crear el pedido. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const totalPares   = cartItems.reduce((s, i) => s + i.cantidad, 0)
  const descuento    = calcularDescuento(subtotal, totalPares, reglas)
  const totalMostrar = descuento ? Math.round(descuento.totalNeto) : subtotal

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Stepper />

      <h1 className="text-2xl font-bold text-[#1C1C1E] mb-8">Realizar pedido</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            {prefilled && (
              <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-medium">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                Prellenamos los datos de tu cuenta · puedes editarlos antes de continuar
              </div>
            )}
            <h2 className="font-semibold text-[#1C1C1E] mb-5">Datos personales</h2>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre" placeholder="Juan" half
                value={form.compradorNombre} error={errors.compradorNombre}
                onChange={e => set('compradorNombre', e.target.value)} />
              <Field label="Apellido" placeholder="Pérez" half
                value={form.compradorApellido} error={errors.compradorApellido}
                onChange={e => set('compradorApellido', e.target.value)} />
              <Field label="Cédula" placeholder="1234567890" half
                value={form.compradorCedula} error={errors.compradorCedula}
                onChange={e => set('compradorCedula', e.target.value)} />
              <Field label="Teléfono" placeholder="+57 300 000 0000" half
                value={form.compradorTelefono} error={errors.compradorTelefono}
                onChange={e => set('compradorTelefono', e.target.value)} />
              <Field label="Correo electrónico" placeholder="correo@ejemplo.com" type="email"
                value={form.compradorEmail} error={errors.compradorEmail}
                onChange={e => set('compradorEmail', e.target.value)} />
            </div>

            <h2 className="font-semibold text-[#1C1C1E] mt-6 mb-5">Datos de entrega</h2>

            {/* Modalidad */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1C1C1E] mb-2">Modalidad de entrega</label>
              <div className="flex gap-3">
                {[
                  { v: 'DOMICILIO', label: 'Domicilio', Icon: Truck },
                  { v: 'OFICINA',   label: 'Retiro en oficina', Icon: Storefront },
                ].map(opt => (
                  <button key={opt.v} type="button"
                    onClick={() => set('modalidadEntrega', opt.v)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: form.modalidadEntrega === opt.v ? '#C0392B' : '#FFFFFF',
                      color: form.modalidadEntrega === opt.v ? '#FFFFFF' : '#4B5563',
                      borderColor: form.modalidadEntrega === opt.v ? '#C0392B' : '#E5E7EB',
                    }}
                  >
                    <opt.Icon size={16} weight={form.modalidadEntrega === opt.v ? 'fill' : 'regular'} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">
                  Departamento <span className="text-[#C0392B]">*</span>
                </label>
                <Combobox
                  options={DEPARTAMENTOS}
                  value={form.departamento}
                  onChange={setDepartamento}
                  placeholder="Ej. Cundinamarca"
                />
                {errors.departamento && <p className="text-xs text-[#C0392B] mt-1">{errors.departamento}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">
                  Municipio <span className="text-[#C0392B]">*</span>
                </label>
                <Combobox
                  options={form.departamento
                    ? getMunicipios(form.departamento)
                        .sort((a, b) => a.nombre.localeCompare(b.nombre))
                        .map(m => m.nombre)
                    : []
                  }
                  value={form.municipio}
                  onChange={setMunicipio}
                  placeholder={form.departamento ? 'Buscar municipio...' : 'Selecciona un departamento primero'}
                  disabled={!form.departamento}
                />
                {errors.municipio && <p className="text-xs text-[#C0392B] mt-1">{errors.municipio}</p>}
              </div>

              {form.modalidadEntrega === 'DOMICILIO' && (
                <>
                  <Field label="Dirección exacta" placeholder="Calle 0 # 00-00"
                    value={form.direccionEnvio} error={errors.direccionEnvio}
                    onChange={e => set('direccionEnvio', e.target.value)} />
                  <Field label="Barrio" placeholder="Ej. La Merced" half required={false}
                    value={form.barrio} error={errors.barrio}
                    onChange={e => set('barrio', e.target.value)} />
                </>
              )}
            </div>

            {/* Info pago */}
            <div className="mt-5 flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <Info size={18} weight="fill" className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>Pago contraentrega.</strong> El asesor confirmará tu pedido vía WhatsApp antes del despacho.
              </p>
            </div>
          </div>
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="bg-[#F5F5F5] rounded-2xl p-5 sticky top-20">
            <h2 className="font-bold text-[#1C1C1E] mb-4">Resumen</h2>

            <div className="space-y-3 mb-4">
              {cartItems.map(item => (
                <div key={item.key} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex-shrink-0">
                    {item.product.imagenUrl
                      ? <img src={item.product.imagenUrl} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <span className="text-lg">👟</span>
                        </div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#1C1C1E] line-clamp-1">{item.product.nombre}</p>
                    <p className="text-xs text-gray-400">Talla {item.talla} · x{item.cantidad}</p>
                  </div>
                  <p className="text-xs font-bold text-[#1C1C1E] flex-shrink-0">
                    ${formatCOP(item.product.precioBase * item.cantidad)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal ({totalPares} pares)</span>
                <span className="font-medium">${formatCOP(subtotal)}</span>
              </div>
              {descuento ? (
                <div className="flex justify-between text-sm" style={{ color: '#C0392B' }}>
                  <span>Descuento</span>
                  <span className="font-medium">-${formatCOP(Math.round(descuento.ahorro))}</span>
                </div>
              ) : (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Descuento por volumen</span>
                  <span className="text-gray-400 text-xs">Sin descuento aún</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-[#1C1C1E] pt-1 border-t border-gray-200">
                <span>Total</span>
                <span style={{ color: descuento ? '#C0392B' : '#1C1C1E' }}>
                  ${formatCOP(totalMostrar)} COP
                </span>
              </div>
            </div>

            {descuento && (
              <div className="mb-4 rounded-xl px-4 py-3 text-sm font-semibold" style={{ backgroundColor: '#FEF2F1', color: '#C0392B' }}>
                Ahorrarás ${formatCOP(Math.round(descuento.ahorro))} COP con el precio de paquete
              </div>
            )}

            {submitError && (
              <p className="mb-3 text-sm text-[#C0392B] bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-center">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-white font-semibold rounded-xl transition-colors active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#C0392B' }}
              onMouseOver={e => !loading && (e.currentTarget.style.backgroundColor = '#A93226')}
              onMouseOut={e => (e.currentTarget.style.backgroundColor = '#C0392B')}
            >
              {loading ? <><Spinner size="sm" /> Procesando...</> : 'Confirmar Pedido'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
