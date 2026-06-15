import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { crearPedido } from '../../api/pedidos'
import Spinner from '../../components/ui/Spinner'

function formatCOP(n) {
  return new Intl.NumberFormat('es-CO').format(n)
}

const INITIAL = {
  compradorNombre: '', compradorApellido: '', compradorCedula: '',
  compradorTelefono: '', compradorEmail: '',
  direccionEnvio: '', municipio: '', departamento: '',
  modalidadEntrega: 'DOMICILIO',
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [form, setForm]     = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-500 mb-4">Tu carrito está vacío.</p>
        <Link to="/catalogo" className="text-[#C0392B] font-medium hover:underline">Ver catálogo →</Link>
      </div>
    )
  }

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.compradorNombre.trim())    e.compradorNombre    = 'Requerido'
    if (!form.compradorApellido.trim())  e.compradorApellido  = 'Requerido'
    if (!form.compradorCedula.trim())    e.compradorCedula    = 'Requerido'
    if (!form.compradorTelefono.trim())  e.compradorTelefono  = 'Requerido'
    if (!form.compradorEmail.trim())     e.compradorEmail     = 'Requerido'
    else if (!/\S+@\S+\.\S+/.test(form.compradorEmail)) e.compradorEmail = 'Correo inválido'
    if (form.modalidadEntrega === 'DOMICILIO') {
      if (!form.direccionEnvio.trim()) e.direccionEnvio = 'Requerido'
      if (!form.municipio.trim())      e.municipio      = 'Requerido'
      if (!form.departamento.trim())   e.departamento   = 'Requerido'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const detalles = items.map(i => ({
        productoId: i.product.id,
        cantidad: i.cantidad,
        tallaSeleccionada: i.talla,
      }))
      const payload = { ...form, detalles }
      const res = await crearPedido(payload)
      clearCart()
      navigate(`/confirmacion/${res.data.pedidoId}`, { state: res.data })
    } catch (err) {
      alert('Error al crear el pedido. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const totalPares = items.reduce((s, i) => s + i.cantidad, 0)

  function Field({ label, field, placeholder, type = 'text', half = false }) {
    return (
      <div className={half ? 'col-span-1' : 'col-span-2'}>
        <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">
          {label} <span className="text-[#C0392B]">*</span>
        </label>
        <input
          type={type}
          value={form[field]}
          onChange={e => set(field, e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors
            ${errors[field] ? 'border-[#C0392B] focus:border-[#C0392B]' : 'border-gray-200 focus:border-[#C0392B]'}`}
        />
        {errors[field] && <p className="text-xs text-[#C0392B] mt-1">{errors[field]}</p>}
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Stepper */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
        <Link to="/carrito" className="hover:text-[#C0392B]">Carrito</Link>
        <span className="text-gray-300">→</span>
        <span className="text-[#C0392B] font-medium">Datos</span>
        <span className="text-gray-300">→</span>
        <span>Confirmado</span>
      </div>

      <h1 className="text-2xl font-bold text-[#1C1C1E] mb-8">Realizar pedido</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-semibold text-[#1C1C1E] mb-5">Datos para la entrega</h2>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre completo" field="compradorNombre" placeholder="Juan" half />
              <Field label="Apellido" field="compradorApellido" placeholder="Pérez" half />
              <Field label="Cédula" field="compradorCedula" placeholder="1234567890" half />
              <Field label="Teléfono" field="compradorTelefono" placeholder="+57 300 000 0000" half />
              <Field label="Correo electrónico" field="compradorEmail" placeholder="correo@ejemplo.com" type="email" />

              {/* Modalidad */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-[#1C1C1E] mb-2">Modalidad de entrega</label>
                <div className="flex gap-3">
                  {[{ v: 'DOMICILIO', label: '🚚 Domicilio' }, { v: 'OFICINA', label: '🏪 Retiro en oficina' }].map(opt => (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => set('modalidadEntrega', opt.v)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all
                        ${form.modalidadEntrega === opt.v ? 'bg-[#C0392B] text-white border-[#C0392B]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#C0392B]'}`}
                    >{opt.label}</button>
                  ))}
                </div>
              </div>

              {form.modalidadEntrega === 'DOMICILIO' && (
                <>
                  <Field label="Dirección de entrega" field="direccionEnvio" placeholder="Calle 0 # 00-00, Barrio..." />
                  <Field label="Municipio" field="municipio" placeholder="Cúcuta" half />
                  <Field label="Departamento" field="departamento" placeholder="Norte de Santander" half />
                </>
              )}
            </div>

            {/* Info pago */}
            <div className="mt-5 flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <span className="text-amber-500 mt-0.5">ℹ️</span>
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
              {items.map(item => (
                <div key={item.key} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex-shrink-0">
                    {item.product.imagenUrl
                      ? <img src={item.product.imagenUrl} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-lg">👟</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#1C1C1E] line-clamp-1">{item.product.nombre}</p>
                    <p className="text-xs text-gray-400">Talla {item.talla} · ×{item.cantidad}</p>
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
              <div className="flex justify-between text-sm">
                <span className="text-[#C0392B]">Descuento por volumen</span>
                <span className="text-[#C0392B] font-medium">Se calcula automáticamente</span>
              </div>
              <div className="flex justify-between font-bold text-[#1C1C1E] pt-1">
                <span>Total aprox.</span>
                <span>${formatCOP(subtotal)} COP</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#C0392B] text-white font-semibold rounded-xl hover:bg-[#A93226] transition-colors active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? <><Spinner size="sm" /> Procesando...</> : 'Confirmar Pedido'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
