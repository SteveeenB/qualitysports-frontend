import { useEffect, useState } from 'react'
import { listarModelos, crearModelo, actualizarModelo, eliminarModelo } from '../../api/productos'
import Spinner from '../../components/ui/Spinner'

export default function AdminModelos() {
  const [modelos, setModelos]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [nombre, setNombre]     = useState('')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleteError, setDeleteError] = useState('')

  async function fetchModelos() {
    setLoading(true)
    try {
      const r = await listarModelos()
      setModelos(r.data)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchModelos() }, [])

  function openCreate() {
    setEditing(null)
    setNombre('')
    setError('')
    setModalOpen(true)
  }

  function openEdit(m) {
    setEditing(m)
    setNombre(m.nombre)
    setError('')
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = nombre.trim()
    if (!trimmed) return setError('El nombre es obligatorio.')
    setSaving(true)
    setError('')
    try {
      if (editing) await actualizarModelo(editing.id, trimmed)
      else await crearModelo(trimmed)
      setModalOpen(false)
      fetchModelos()
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete(id) {
    setDeleteError('')
    try {
      await eliminarModelo(id)
      setDeleteId(null)
      fetchModelos()
    } catch (err) {
      setDeleteError(err?.response?.data?.message ?? 'No se pudo eliminar.')
    }
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1C1C1E' }}>Modelos</h1>
          <p className="text-sm text-gray-400 mt-0.5">Agrupa los productos por modelo de zapato</p>
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
          Nuevo modelo
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : modelos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <p className="text-sm">No hay modelos registrados.</p>
            <button onClick={openCreate} className="mt-3 text-sm font-medium" style={{ color: '#C0392B' }}>
              Crear el primero
            </button>
          </div>
        ) : (
          <>
          {/* Desktop table */}
          <table className="hidden md:table w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['MODELO', 'FOTO REPRESENTATIVA', 'ACCIONES'].map(h => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modelos.map(m => (
                <tr key={m.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4"><span className="font-semibold text-gray-800">{m.nombre}</span></td>
                  <td className="px-6 py-4">
                    {m.imagenRepresentativa ? (
                      <img src={m.imagenRepresentativa} alt={m.nombre} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <span className="text-xs text-gray-400">Sin productos con foto</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(m)} className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Editar</button>
                      <button onClick={() => { setDeleteId(m.id); setDeleteError('') }} className="px-3 py-1.5 text-xs font-medium border border-red-100 text-red-500 rounded-lg hover:bg-red-50 transition-colors">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-50">
            {modelos.map(m => (
              <div key={m.id} className="p-4 flex items-center gap-4">
                {m.imagenRepresentativa ? (
                  <img src={m.imagenRepresentativa} alt={m.nombre} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{m.nombre}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(m)} className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Editar</button>
                  <button onClick={() => { setDeleteId(m.id); setDeleteError('') }} className="px-3 py-1.5 text-xs font-medium border border-red-100 text-red-500 rounded-lg hover:bg-red-50 transition-colors">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">{editing ? 'Editar modelo' : 'Nuevo modelo'}</h2>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre del modelo</label>
                <input
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Ej. Ring, Zoom, Air Force..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none"
                  onFocus={e => e.target.style.borderColor = '#C0392B'}
                  onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                  autoFocus
                />
              </div>
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
                  {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear modelo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h2 className="text-base font-bold text-gray-800 mb-2">¿Eliminar modelo?</h2>
            <p className="text-sm text-gray-500 mb-4">
              Esta acción no se puede deshacer. Solo puedes eliminar un modelo si no tiene productos asignados.
            </p>
            {deleteError && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2 mb-4">{deleteError}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => { setDeleteId(null); setDeleteError('') }}
                className="flex-1 py-2.5 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmDelete(deleteId)}
                className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl"
                style={{ backgroundColor: '#C0392B' }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
