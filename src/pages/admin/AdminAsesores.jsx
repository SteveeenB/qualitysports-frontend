import { useEffect, useState } from 'react'
import { listarAsesores, crearAsesor, actualizarAsesor, desactivarAsesor } from '../../api/admin'
import Spinner from '../../components/ui/Spinner'

function StatusBadge({ activo }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: activo ? '#DCFCE7' : '#F3F4F6', color: activo ? '#16A34A' : '#6B7280' }}
    >
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  )
}

const EMPTY_FORM = { nombre: '', email: '', password: '', telefono: '', activo: true }

export default function AdminAsesores() {
  const [asesores, setAsesores]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [modalOpen, setModalOpen]     = useState(false)
  const [editing, setEditing]         = useState(null)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')
  const [deactivateId, setDeactivateId] = useState(null)
  const [deactivateError, setDeactivateError] = useState('')

  async function fetchAsesores() {
    setLoading(true)
    try {
      const r = await listarAsesores()
      setAsesores(r.data)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAsesores() }, [])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError('')
    setModalOpen(true)
  }

  function openEdit(a) {
    setEditing(a)
    setForm({ nombre: a.nombre, email: a.email, password: '', telefono: a.telefono ?? '', activo: a.activo })
    setError('')
    setModalOpen(true)
  }

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nombre.trim()) return setError('El nombre es obligatorio.')
    if (!form.email.trim())  return setError('El correo es obligatorio.')
    if (!editing && !form.password) return setError('La contraseña es obligatoria.')
    setSaving(true); setError('')
    try {
      if (editing) {
        await actualizarAsesor(editing.id, { nombre: form.nombre, email: form.email, telefono: form.telefono, activo: form.activo })
      } else {
        await crearAsesor({ nombre: form.nombre, email: form.email, password: form.password, telefono: form.telefono })
      }
      setModalOpen(false)
      fetchAsesores()
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDeactivate(id) {
    setDeactivateError('')
    try {
      await desactivarAsesor(id)
      setDeactivateId(null)
      fetchAsesores()
    } catch (err) {
      setDeactivateError(err?.response?.data?.message ?? 'No se pudo desactivar.')
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1C1C1E' }}>Asesores</h1>
          <p className="text-sm text-gray-400 mt-0.5">Gestiona los asesores de ventas</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors"
          style={{ backgroundColor: '#C0392B' }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#A93226'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = '#C0392B'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo asesor
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : asesores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <p className="text-sm">No hay asesores registrados.</p>
            <button onClick={openCreate} className="mt-3 text-sm font-medium" style={{ color: '#C0392B' }}>
              Crear el primero
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['NOMBRE', 'EMAIL', 'TELÉFONO', 'ESTADO', 'ACCIONES'].map(h => (
                    <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {asesores.map(a => (
                  <tr key={a.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">{a.nombre}</td>
                    <td className="px-6 py-4 text-gray-500">{a.email}</td>
                    <td className="px-6 py-4 text-gray-500">{a.telefono ?? '—'}</td>
                    <td className="px-6 py-4"><StatusBadge activo={a.activo} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(a)}
                          className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Editar
                        </button>
                        {a.activo && (
                          <button
                            onClick={() => { setDeactivateId(a.id); setDeactivateError('') }}
                            className="px-3 py-1.5 text-xs font-medium border border-red-100 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Desactivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">{editing ? 'Editar asesor' : 'Nuevo asesor'}</h2>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {[
                { label: 'Nombre completo',    field: 'nombre',   type: 'text',     placeholder: 'Juan Pérez' },
                { label: 'Correo electrónico', field: 'email',    type: 'email',    placeholder: 'asesor@correo.com' },
                { label: 'Teléfono',           field: 'telefono', type: 'text',     placeholder: '+57 300 000 0000' },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={form[field]}
                    onChange={e => set(field, e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none"
                    onFocus={e => e.target.style.borderColor = '#C0392B'}
                    onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                  />
                </div>
              ))}

              {!editing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña inicial</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none"
                    onFocus={e => e.target.style.borderColor = '#C0392B'}
                    onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                  />
                </div>
              )}

              {editing && (
                <div className="flex items-center gap-3 py-1">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.activo}
                      onChange={e => set('activo', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C0392B]" />
                  </label>
                  <span className="text-sm text-gray-700">{form.activo ? 'Activo' : 'Inactivo'}</span>
                </div>
              )}

              {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-70"
                  style={{ backgroundColor: '#C0392B' }}
                >
                  {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear asesor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate confirm modal */}
      {deactivateId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h2 className="text-base font-bold text-gray-800 mb-2">¿Desactivar asesor?</h2>
            <p className="text-sm text-gray-500 mb-4">
              El asesor no podrá iniciar sesión, pero sus pedidos históricos se conservan.
            </p>
            {deactivateError && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2 mb-4">{deactivateError}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => { setDeactivateId(null); setDeactivateError('') }}
                className="flex-1 py-2.5 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmDeactivate(deactivateId)}
                className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl"
                style={{ backgroundColor: '#C0392B' }}
              >
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
