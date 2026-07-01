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
  const [loadError, setLoadError] = useState(false)
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
      .catch(() => setLoadError(true))
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

  if (loadError) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 text-sm mb-1">No pudimos cargar tu perfil.</p>
        <p className="text-gray-400 text-xs">Intenta recargar la página.</p>
      </div>
    )
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

        {/* Derechos sobre mis datos — Ley 1581 */}
        <div
          className="bg-white border rounded-2xl p-5 space-y-3"
          style={{ borderColor: '#FCA5A5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#B91C1C' }}>
            Mis datos personales
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Tienes derecho a acceder, corregir u oponerte al tratamiento de tus datos personales
            (Ley 1581 de 2012). Para solicitar la <strong>eliminación de tu cuenta y datos</strong>,
            envíanos un correo — respondemos dentro de los 15 días hábiles siguientes.
          </p>
          <a
            href={`mailto:qualitysports414@gmail.com?subject=${encodeURIComponent('Solicitud de eliminación de datos personales')}&body=${encodeURIComponent('Hola,\n\nSolicito la eliminación de mi cuenta y todos mis datos personales de la plataforma Quality Sports, de acuerdo con la Ley 1581 de 2012.\n\nCorreo de mi cuenta: [escribe tu correo aquí]\n\nGracias.')}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-colors"
            style={{ borderColor: '#FCA5A5', color: '#B91C1C', backgroundColor: '#FEF2F2' }}
            onMouseOver={e => { e.currentTarget.style.backgroundColor = '#FEE2E2' }}
            onMouseOut={e => { e.currentTarget.style.backgroundColor = '#FEF2F2' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            Solicitar eliminación de mi cuenta
          </a>
        </div>
      </div>
    </div>
  )
}
