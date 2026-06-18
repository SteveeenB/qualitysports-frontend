import { useEffect, useState } from 'react'
import { getPerfil, updatePerfil, changePassword } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/ui/Spinner'

function Field({ label, value, onChange, type = 'text', placeholder, required }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-[#C0392B] ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none"
        onFocus={e => e.target.style.borderColor = '#C0392B'}
        onBlur={e => e.target.style.borderColor = '#E5E7EB'}
      />
    </div>
  )
}

function Alert({ type, msg }) {
  if (!msg) return null
  const styles = type === 'success'
    ? 'bg-green-50 text-green-700 border-green-200'
    : 'bg-red-50 text-red-700 border-red-200'
  return (
    <div className={`text-sm px-4 py-3 rounded-xl border ${styles}`}>{msg}</div>
  )
}

export default function MiPerfil() {
  const { updateUser } = useAuth()

  const [loading, setLoading]     = useState(true)
  const [nombre, setNombre]       = useState('')
  const [telefono, setTelefono]   = useState('')
  const [direccion, setDireccion] = useState('')
  const [perfilMsg, setPerfilMsg] = useState({ type: '', text: '' })
  const [savingPerfil, setSavingPerfil] = useState(false)

  const [pwActual, setPwActual]   = useState('')
  const [pwNueva, setPwNueva]     = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwMsg, setPwMsg]         = useState({ type: '', text: '' })
  const [savingPw, setSavingPw]   = useState(false)

  useEffect(() => {
    getPerfil()
      .then(r => {
        setNombre(r.data.nombre ?? '')
        setTelefono(r.data.telefono ?? '')
        setDireccion(r.data.direccionEnvio ?? '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleGuardarPerfil(e) {
    e.preventDefault()
    setSavingPerfil(true)
    setPerfilMsg({ type: '', text: '' })
    try {
      const r = await updatePerfil({ nombre, telefono, direccionEnvio: direccion })
      updateUser({ nombre: r.data.nombre })
      setPerfilMsg({ type: 'success', text: 'Datos actualizados correctamente.' })
    } catch (err) {
      setPerfilMsg({ type: 'error', text: err?.response?.data?.message ?? 'Error al guardar los datos.' })
    } finally {
      setSavingPerfil(false)
    }
  }

  async function handleCambiarPassword(e) {
    e.preventDefault()
    setPwMsg({ type: '', text: '' })
    if (pwNueva !== pwConfirm) {
      setPwMsg({ type: 'error', text: 'Las contraseñas nuevas no coinciden.' })
      return
    }
    if (pwNueva.length < 8) {
      setPwMsg({ type: 'error', text: 'La nueva contraseña debe tener al menos 8 caracteres.' })
      return
    }
    setSavingPw(true)
    try {
      await changePassword({ passwordActual: pwActual, passwordNueva: pwNueva })
      setPwMsg({ type: 'success', text: 'Contraseña actualizada correctamente.' })
      setPwActual(''); setPwNueva(''); setPwConfirm('')
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.response?.data ?? 'Error al cambiar la contraseña.'
      setPwMsg({ type: 'error', text: typeof msg === 'string' ? msg : 'Error al cambiar la contraseña.' })
    } finally {
      setSavingPw(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-32"><Spinner size="lg" /></div>
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Mi perfil</h1>
        <p className="text-gray-400 text-sm mt-1">Actualiza tus datos personales y credenciales</p>
      </div>

      <div className="space-y-5">
        {/* Datos personales */}
        <form
          onSubmit={handleGuardarPerfil}
          className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Datos personales</p>

          <Field label="Nombre completo" value={nombre} onChange={setNombre} placeholder="Tu nombre" required />
          <Field label="Teléfono" value={telefono} onChange={setTelefono} placeholder="Ej: 3001234567" type="tel" />
          <Field label="Dirección de envío" value={direccion} onChange={setDireccion} placeholder="Calle, barrio, ciudad" />

          <Alert type={perfilMsg.type} msg={perfilMsg.text} />

          <button
            type="submit"
            disabled={savingPerfil || !nombre.trim()}
            className="w-full py-2.5 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-50"
            style={{ backgroundColor: savingPerfil ? '#E57373' : '#C0392B' }}
          >
            {savingPerfil ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>

        {/* Cambiar contraseña */}
        <form
          onSubmit={handleCambiarPassword}
          className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Cambiar contraseña</p>

          <Field label="Contraseña actual" value={pwActual} onChange={setPwActual} type="password" placeholder="••••••••" required />
          <Field label="Nueva contraseña" value={pwNueva} onChange={setPwNueva} type="password" placeholder="Mínimo 8 caracteres" required />
          <Field label="Confirmar nueva contraseña" value={pwConfirm} onChange={setPwConfirm} type="password" placeholder="Repite la nueva contraseña" required />

          <Alert type={pwMsg.type} msg={pwMsg.text} />

          <button
            type="submit"
            disabled={savingPw || !pwActual || !pwNueva || !pwConfirm}
            className="w-full py-2.5 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-50"
            style={{ backgroundColor: savingPw ? '#E57373' : '#1C1C1E' }}
          >
            {savingPw ? 'Actualizando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
