import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register as registerApi } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/ui/Spinner'

function Field({ label, field, type = 'text', placeholder, value, error, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(field, e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors
          ${error ? 'border-[#C0392B]' : 'border-gray-200 focus:border-[#C0392B]'}`}
      />
      {error && <p className="text-xs text-[#C0392B] mt-1">{error}</p>}
    </div>
  )
}

export default function Register() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [form, setForm]   = useState({ nombre: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }))
    setErrors(e => ({ ...e, [field]: '' }))
    setApiError('')
  }

  function validate() {
    const e = {}
    if (!form.nombre.trim())     e.nombre   = 'Requerido'
    if (!form.email.trim())      e.email    = 'Requerido'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Correo inválido'
    if (!form.password)          e.password  = 'Requerido'
    else if (form.password.length < 8) e.password = 'Mínimo 8 caracteres'
    if (form.password !== form.confirm) e.confirm = 'Las contraseñas no coinciden'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res  = await registerApi(form.nombre, form.email, form.password)
      const data = res.data
      login(data.token, { email: form.email, role: data.role ?? 'CLIENTE', nombre: form.nombre })
      navigate('/')
    } catch (err) {
      setApiError(err.response?.data?.message ?? 'Error al registrarse. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-xl font-bold text-[#1C1C1E] text-center mb-1">Crea tu cuenta</h1>
        <p className="text-gray-400 text-sm text-center mb-7">Regístrate para realizar pedidos</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nombre completo"      field="nombre"   placeholder="Juan Pérez"          value={form.nombre}   error={errors.nombre}   onChange={set} />
          <Field label="Correo electrónico"   field="email"    type="email" placeholder="correo@ejemplo.com" value={form.email}    error={errors.email}    onChange={set} />
          <Field label="Contraseña"           field="password" type="password" placeholder="Mínimo 8 caracteres" value={form.password} error={errors.password} onChange={set} />
          <Field label="Confirmar contraseña" field="confirm"  type="password" placeholder=""               value={form.confirm}  error={errors.confirm}  onChange={set} />

          {apiError && (
            <p className="text-sm text-[#C0392B] bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-center">
              {apiError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#C0392B] text-white font-semibold rounded-xl hover:bg-[#A93226] transition-colors active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <><Spinner size="sm" /> Registrando...</> : 'Registrarse'}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-[#C0392B] font-medium hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}
