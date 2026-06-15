import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Acceso403() {
  const { user } = useAuth()
  const navigate = useNavigate()

  function goToPanel() {
    if (!user) return navigate('/login')
    if (user.role === 'ADMINISTRADOR') navigate('/admin')
    else if (user.role === 'ASESOR_VENTAS') navigate('/asesor')
    else navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-[#C0392B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-10a4 4 0 014 4v1a4 4 0 01-8 0V9a4 4 0 014-4z" />
          </svg>
        </div>
        <h1 className="text-6xl font-black text-[#1C1C1E] mb-3">403</h1>
        <h2 className="text-lg font-semibold text-[#1C1C1E] mb-2">No tienes permiso para ver esta página</h2>
        <p className="text-gray-400 text-sm mb-8">
          Tu rol no tiene acceso a esta sección. Te redirigiremos al panel correspondiente.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 border border-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            ← Volver atrás
          </button>
          <button
            onClick={goToPanel}
            className="px-5 py-2.5 bg-[#C0392B] text-white text-sm font-semibold rounded-xl hover:bg-[#A93226] transition-colors"
          >
            Ir a mi panel
          </button>
        </div>
        <div className="flex items-center gap-2 justify-center mt-10">
          <div className="w-6 h-6 bg-[#C0392B] rounded-md flex items-center justify-center">
            <span className="text-white text-[9px] font-bold">QS</span>
          </div>
          <span className="font-bold text-xs text-[#1C1C1E] tracking-wide">QUALITY <span className="text-[#C0392B]">SPORTS</span></span>
        </div>
      </div>
    </div>
  )
}
