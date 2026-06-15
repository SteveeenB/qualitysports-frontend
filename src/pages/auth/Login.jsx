import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as loginApi } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/ui/Spinner'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res  = await loginApi(email, password)
      const data = res.data
      login(data.token, { email, role: data.role, nombre: data.nombre })
      if (data.role === 'ADMINISTRADOR') navigate('/admin')
      else if (data.role === 'ASESOR_VENTAS') navigate('/asesor')
      else navigate('/')
    } catch {
      setError('Correo o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-7">
          <div className="w-9 h-9 bg-[#C0392B] rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">QS</span>
          </div>
          <div className="leading-none">
            <span className="font-bold text-sm text-[#1C1C1E] tracking-wide">QUALITY</span>
            <span className="block text-[9px] text-[#C0392B] tracking-widest font-semibold">SPORTS</span>
          </div>
        </div>

        <h1 className="text-xl font-bold text-[#1C1C1E] text-center mb-1">Bienvenido de nuevo</h1>
        <p className="text-gray-400 text-sm text-center mb-7">Inicia sesión para continuar</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              placeholder="correo@ejemplo.com"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C0392B]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C0392B]"
              required
            />
            <div className="text-right mt-1">
              <span className="text-xs text-[#C0392B] cursor-pointer hover:underline">Olvidé mi contraseña</span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-[#C0392B] bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#C0392B] text-white font-semibold rounded-xl hover:bg-[#A93226] transition-colors active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <><Spinner size="sm" /> Ingresando...</> : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-[#C0392B] font-medium hover:underline">Regístrate</Link>
        </p>
      </div>
    </div>
  )
}
