import { useEffect, useState } from 'react'
import { listarDescuentos, crearDescuento, actualizarDescuento, eliminarDescuento } from '../../api/admin'
import Spinner from '../../components/ui/Spinner'

const COP = n => '$' + new Intl.NumberFormat('es-CO').format(n ?? 0)

const EMPTY_FORM = { cantidadPares: '', precioTotalPaquete: '' }

function DescuentoModal({ open, onClose, editing, onSaved }) {
  const [form, setForm]   = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    if (editing) {
      setForm({ cantidadPares: editing.cantidadPares, precioTotalPaquete: editing.precioTotalPaquete })
    } else {
      setForm(EMPTY_FORM)
    }
    setError('')
  }, [editing, open])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.cantidadPares || Number(form.cantidadPares) < 1) return setError('La cantidad de pares debe ser al menos 1.')
    if (!form.precioTotalPaquete || Number(form.precioTotalPaquete) <= 0) return setError('El precio debe ser mayor a 0.')
    setSaving(true); setError('')
    const payload = {
      cantidadPares:      Number(form.cantidadPares),
      precioTotalPaquete: Number(form.precioTotalPaquete),
    }
    try {
      if (editing) await actualizarDescuento(editing.id, { ...payload, id: editing.id })
      else await crearDescuento(payload)
      onSaved()
    } catch {
      setError('Error al guardar. Verifica que no exista ya una regla con esa cantidad de pares.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">{editing ? 'Editar regla' : 'Nueva regla de paquete'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Cantidad de pares *</label>
            <input
              type="number" min="1" value={form.cantidadPares}
              onChange={e => setForm(f => ({ ...f, cantidadPares: e.target.value }))}
              placeholder="Ej. 6"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none"
              onFocus={e => e.target.style.borderColor = '#C0392B'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Precio total del paquete (COP) *</label>
            <input
              type="number" min="1" value={form.precioTotalPaquete}
              onChange={e => setForm(f => ({ ...f, precioTotalPaquete: e.target.value }))}
              placeholder="Ej. 540000"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none"
              onFocus={e => e.target.style.borderColor = '#C0392B'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button
              type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: saving ? '#E57373' : '#C0392B' }}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminDescuentos() {
  const [reglas, setReglas]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState(null)

  async function cargar() {
    try {
      const r = await listarDescuentos()
      setReglas([...r.data].sort((a, b) => a.cantidadPares - b.cantidadPares))
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [])

  function openCreate() { setEditing(null); setModalOpen(true) }
  function openEdit(r)  { setEditing(r);    setModalOpen(true) }
  function onSaved()    { setModalOpen(false); setEditing(null); cargar() }

  async function handleEliminar(id) {
    if (!window.confirm('¿Eliminar esta regla de paquete?')) return
    try {
      await eliminarDescuento(id)
      setReglas(prev => prev.filter(r => r.id !== id))
    } catch {}
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1C1C1E' }}>Configuración</h1>
          <p className="text-sm text-gray-400 mt-0.5">Reglas de precio por paquete de pares</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors"
          style={{ backgroundColor: '#C0392B' }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#A93226'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = '#C0392B'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nueva regla
        </button>
      </div>

      {/* Explicación */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5 text-sm text-blue-700">
        Cuando el total de pares de un pedido coincide exactamente con una regla, se aplica ese precio fijo al total del pedido. Puedes mezclar modelos y tallas libremente.
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <>
          {/* Desktop table */}
          <table className="hidden md:table w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['PARES', 'PRECIO TOTAL DEL PAQUETE', 'PRECIO POR PAR (APROX)', ''].map(h => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reglas.map(r => (
                <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl text-sm font-black text-white" style={{ backgroundColor: '#C0392B' }}>{r.cantidadPares}</span>
                  </td>
                  <td className="px-6 py-4 text-lg font-bold" style={{ color: '#1C1C1E' }}>{COP(r.precioTotalPaquete)}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{COP(Math.round(r.precioTotalPaquete / r.cantidadPares))} / par</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 justify-end">
                      <button onClick={() => openEdit(r)} className="text-gray-400 hover:text-gray-700 transition-colors" title="Editar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => handleEliminar(r.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Eliminar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reglas.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">No hay reglas configuradas</td></tr>
              )}
            </tbody>
          </table>
          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-50">
            {reglas.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-gray-400">No hay reglas configuradas</p>
            ) : reglas.map(r => (
              <div key={r.id} className="p-4 flex items-center gap-4">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-base font-black text-white flex-shrink-0" style={{ backgroundColor: '#C0392B' }}>{r.cantidadPares}</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{COP(r.precioTotalPaquete)}</p>
                  <p className="text-xs text-gray-400">{COP(Math.round(r.precioTotalPaquete / r.cantidadPares))} / par</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => openEdit(r)} className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Editar</button>
                  <button onClick={() => handleEliminar(r.id)} className="px-3 py-1.5 text-xs font-medium border border-red-100 text-red-500 rounded-lg hover:bg-red-50 transition-colors">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </div>

      <DescuentoModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} onSaved={onSaved} />
    </div>
  )
}
