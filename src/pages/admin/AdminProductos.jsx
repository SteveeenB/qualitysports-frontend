import { useEffect, useState, useCallback, useRef } from 'react'
import Cropper from 'react-easy-crop'
import {
  listarProductosAdmin, listarModelos,
  crearProducto, actualizarProducto, cambiarEstadoProducto,
  subirImagenProducto,
} from '../../api/productos'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'

const COP = n => '$' + new Intl.NumberFormat('es-CO').format(n ?? 0)
const TALLAS = [34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45]
const DEFAULT_TALLAS = [34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44]
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

const EMPTY_FORM = { nombre: '', descripcion: '', precioBase: '', imagenUrl: '', modeloId: '', tallas: DEFAULT_TALLAS }

// ── Dropdown de modelo con imagen ─────────────────────────────────────────────

function ModeloSelect({ modelos, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = modelos.find(m => String(m.id) === String(value))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl bg-white text-sm hover:border-gray-300 transition-colors whitespace-nowrap"
        style={{ minWidth: '160px' }}
      >
        {selected ? (
          <>
            {selected.imagenRepresentativa
              ? <img src={selected.imagenRepresentativa} alt={selected.nombre} className="w-6 h-6 rounded object-cover flex-shrink-0" />
              : <span className="w-6 h-6 rounded bg-gray-200 flex-shrink-0" />
            }
            <span className="flex-1 text-left text-gray-800 truncate">{selected.nombre}</span>
          </>
        ) : (
          <span className="flex-1 text-left text-gray-500">Todos los modelos</span>
        )}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1" style={{ minWidth: '200px', maxHeight: '300px', overflowY: 'auto' }}>
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false) }}
            className="w-full px-3 py-2 text-sm text-left flex items-center gap-2.5 hover:bg-gray-50 transition-colors"
          >
            <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs flex-shrink-0">—</span>
            <span className="text-gray-600">Todos los modelos</span>
            {!value && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-auto flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </button>
          {modelos.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => { onChange(String(m.id)); setOpen(false) }}
              className="w-full px-3 py-2 text-sm text-left flex items-center gap-2.5 hover:bg-gray-50 transition-colors"
            >
              {m.imagenRepresentativa
                ? <img src={m.imagenRepresentativa} alt={m.nombre} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                : <span className="w-8 h-8 rounded-lg bg-gray-200 flex-shrink-0" />
              }
              <span className="text-gray-800 truncate">{m.nombre}</span>
              {String(value) === String(m.id) && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-auto flex-shrink-0">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Modal de crear / editar producto ─────────────────────────────────────────

function ProductoModal({ open, onClose, editing, modelos, onSaved }) {
  const [form, setForm]             = useState(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl]     = useState(null)
  const [dragOver, setDragOver]         = useState(false)
  const [cropSrc, setCropSrc]           = useState(null)
  const [crop, setCrop]                 = useState({ x: 0, y: 0 })
  const [zoom, setZoom]                 = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [showCropper, setShowCropper]   = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (editing) {
      setForm({
        nombre:      editing.nombre ?? '',
        descripcion: editing.descripcion ?? '',
        precioBase:  editing.precioBase ?? '',
        imagenUrl:   editing.imagenUrl ?? '',
        modeloId:    editing.modelo?.id ?? '',
        tallas:      [...(editing.tallasDisponibles ?? [])],
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setError('')
    setSelectedFile(null)
    setPreviewUrl(null)
    setDragOver(false)
    setCropSrc(null)
    setShowCropper(false)
  }, [editing, open])

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      setCropSrc(reader.result)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setShowCropper(true)
    }
    reader.readAsDataURL(file)
  }

  async function applyCrop() {
    const image = new Image()
    image.src = cropSrc
    await new Promise(r => { image.onload = r })
    const canvas = document.createElement('canvas')
    const SIZE = 800
    canvas.width = SIZE
    canvas.height = SIZE
    const ctx = canvas.getContext('2d')
    const { x, y, width, height } = croppedAreaPixels
    ctx.drawImage(image, x, y, width, height, 0, 0, SIZE, SIZE)
    canvas.toBlob(blob => {
      const file = new File([blob], 'producto.jpg', { type: 'image/jpeg' })
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setShowCropper(false)
      setCropSrc(null)
    }, 'image/jpeg', 0.9)
  }

  function clearFile(e) {
    e.stopPropagation()
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function toggleTalla(t) {
    setForm(f => ({
      ...f,
      tallas: f.tallas.includes(t) ? f.tallas.filter(x => x !== t) : [...f.tallas, t],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nombre.trim()) return setError('El nombre es obligatorio.')
    if (!form.precioBase || Number(form.precioBase) <= 0) return setError('El precio debe ser mayor a 0.')
    setSaving(true)
    setError('')
    const payload = {
      nombre:            form.nombre.trim(),
      descripcion:       form.descripcion.trim() || null,
      precioBase:        Number(form.precioBase),
      imagenUrl:         selectedFile ? null : (form.imagenUrl.trim() || null),
      modeloId:          form.modeloId ? Number(form.modeloId) : null,
      tallasDisponibles: form.tallas,
    }
    try {
      let productoId
      if (editing) {
        await actualizarProducto(editing.id, payload)
        productoId = editing.id
      } else {
        const res = await crearProducto(payload)
        productoId = res.data.id
      }
      if (selectedFile) await subirImagenProducto(productoId, selectedFile)
      onSaved()
    } catch {
      setError('Error al guardar. Verifica los datos.')
    } finally {
      setSaving(false)
    }
  }

  if (showCropper) return (
    <div className="fixed inset-0 z-[60] flex flex-col" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Recortar imagen</h3>
          <p className="text-xs text-gray-400 mt-0.5">Arrastra para encuadrar · usa el slider para hacer zoom</p>
        </div>
        <button
          onClick={() => { setShowCropper(false); setCropSrc(null) }}
          className="text-xs text-gray-500 hover:text-gray-800 px-3 py-1.5 border border-gray-200 rounded-lg transition-colors"
        >
          Cancelar
        </button>
      </div>

      <div className="relative flex-1">
        <Cropper
          image={cropSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
        />
      </div>

      <div className="flex items-center gap-4 px-6 py-4 bg-white border-t border-gray-100">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="range" min={1} max={3} step={0.01}
          value={zoom} onChange={e => setZoom(Number(e.target.value))}
          className="flex-1" style={{ accentColor: '#C0392B' }}
        />
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
        <button
          onClick={applyCrop}
          className="ml-2 px-5 py-2 rounded-xl text-sm font-semibold text-white flex-shrink-0"
          style={{ backgroundColor: '#C0392B' }}
        >
          Aplicar recorte
        </button>
      </div>
    </div>
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-800">{editing ? 'Editar producto' : 'Registrar nuevo producto'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Completa los datos del producto</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre del producto *</label>
            <input
              value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              placeholder="Ej. Runner Pro X1"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none"
              style={{ transition: 'border-color 0.15s' }}
              onFocus={e => e.target.style.borderColor = '#C0392B'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          {/* Modelo + Precio */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Modelo</label>
              <select
                value={form.modeloId} onChange={e => setForm(f => ({ ...f, modeloId: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none bg-white"
                onFocus={e => e.target.style.borderColor = '#C0392B'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              >
                <option value="">Sin modelo</option>
                {modelos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Precio por par (COP) *</label>
              <input
                type="number" min="1" value={form.precioBase}
                onChange={e => setForm(f => ({ ...f, precioBase: e.target.value }))}
                placeholder="$0"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none"
                onFocus={e => e.target.style.borderColor = '#C0392B'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
            <textarea
              value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              placeholder="Detalles del producto..."
              rows={3}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none resize-none"
              onFocus={e => e.target.style.borderColor = '#C0392B'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          {/* Tallas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Tallas disponibles</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, tallas: [...TALLAS] }))}
                  className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-600 transition-all"
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, tallas: [] }))}
                  className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-600 transition-all"
                >
                  Ninguna
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {TALLAS.map(t => (
                <button
                  key={t} type="button" onClick={() => toggleTalla(t)}
                  className="w-10 h-10 rounded-xl text-sm font-medium transition-all"
                  style={{
                    backgroundColor: form.tallas.includes(t) ? '#C0392B' : '#F9FAFB',
                    color: form.tallas.includes(t) ? '#FFFFFF' : '#374151',
                    border: form.tallas.includes(t) ? '1px solid #C0392B' : '1px solid #E5E7EB',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Imagen — drag & drop */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Imagen del producto</label>
            {(() => {
              const display = previewUrl ?? (editing?.imagenUrl || null)
              return (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]) }}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  className="relative w-full rounded-xl overflow-hidden cursor-pointer transition-all"
                  style={{
                    height: display ? '200px' : '120px',
                    border: dragOver ? '2px dashed #C0392B' : '2px dashed #E5E7EB',
                    backgroundColor: dragOver ? '#FFF5F5' : '#FAFAFA',
                  }}
                >
                  {display ? (
                    <>
                      <img src={display} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button" onClick={clearFile}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md"
                        style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                      {selectedFile && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg text-xs text-white truncate max-w-[80%]" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
                          {selectedFile.name}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 pointer-events-none select-none">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={dragOver ? '#C0392B' : '#9CA3AF'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 16 12 12 8 16"/>
                        <line x1="12" y1="12" x2="12" y2="21"/>
                        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                      </svg>
                      <p className="text-sm" style={{ color: dragOver ? '#C0392B' : '#9CA3AF' }}>
                        Arrastra una imagen o{' '}
                        <span style={{ color: '#C0392B', fontWeight: 600 }}>haz clic para seleccionar</span>
                      </p>
                      <p className="text-xs text-gray-400">JPG, PNG, WEBP</p>
                    </div>
                  )}
                </div>
              )
            })()}
            <input
              ref={fileInputRef}
              type="file" accept="image/*"
              className="hidden"
              onChange={e => handleFile(e.target.files?.[0])}
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button
              type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: saving ? '#E57373' : '#C0392B' }}
            >
              {saving ? 'Guardando...' : 'Guardar producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function AdminProductos() {
  const [productos, setProductos]       = useState([])
  const [modelos, setModelos]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [query, setQuery]               = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [modeloFiltro, setModeloFiltro] = useState('')
  const [pageSize, setPageSize]         = useState(15)
  const [page, setPage]                 = useState(0)
  const [totalPages, setTotalPages]     = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [modalOpen, setModalOpen]       = useState(false)
  const [editing, setEditing]           = useState(null)

  // Debounce: 400ms después de que el usuario para de escribir
  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedQuery(query); setPage(0) }, 400)
    return () => clearTimeout(timer)
  }, [query])

  const fetchProductos = useCallback(async (p = 0) => {
    setLoading(true)
    try {
      const res = await listarProductosAdmin(p, pageSize, debouncedQuery || null, modeloFiltro || null)
      setProductos(res.data.content ?? [])
      setTotalPages(res.data.totalPages ?? 1)
      setTotalElements(res.data.totalElements ?? 0)
    } catch {}
    finally { setLoading(false) }
  }, [pageSize, debouncedQuery, modeloFiltro])

  // Cargar modelos una sola vez
  useEffect(() => {
    listarModelos().then(r => setModelos(r.data)).catch(() => {})
  }, [])

  // Disparar fetch cuando cambia la página o los filtros (fetchProductos cambia cuando cambian sus deps)
  useEffect(() => {
    fetchProductos(page)
  }, [page, fetchProductos])

  function openCreate() { setEditing(null); setModalOpen(true) }
  function openEdit(p)  { setEditing(p);    setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditing(null) }
  function onSaved()    { closeModal(); fetchProductos(page) }

  async function toggleEstado(p) {
    setProductos(prev => prev.map(x => x.id === p.id ? { ...x, activo: !x.activo } : x))
    try { await cambiarEstadoProducto(p.id, !p.activo) }
    catch { setProductos(prev => prev.map(x => x.id === p.id ? { ...x, activo: p.activo } : x)) }
  }

  // Rango visible para mostrar en paginación
  const rangoDesde = totalElements === 0 ? 0 : page * pageSize + 1
  const rangoHasta = Math.min((page + 1) * pageSize, totalElements)

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1C1C1E' }}>Gestión de Productos</h1>
          <p className="text-sm text-gray-400 mt-0.5">Administra el catálogo</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors active:scale-[0.98]"
          style={{ backgroundColor: '#C0392B' }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#A93226'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = '#C0392B'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Registrar nuevo producto
        </button>
      </div>

      {/* Barra de filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Buscador */}
        <div className="relative flex-1" style={{ minWidth: '200px', maxWidth: '340px' }}>
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white rounded-xl border border-gray-200 focus:outline-none"
            onFocus={e => e.target.style.borderColor = '#C0392B'}
            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
          />
        </div>

        {/* Filtro por modelo con imagen */}
        <ModeloSelect
          modelos={modelos}
          value={modeloFiltro}
          onChange={v => { setModeloFiltro(v); setPage(0) }}
        />

        {/* Productos por página */}
        <select
          value={pageSize}
          onChange={e => { setPageSize(Number(e.target.value)); setPage(0) }}
          className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none hover:border-gray-300 transition-colors"
          onFocus={e => e.target.style.borderColor = '#C0392B'}
          onBlur={e => e.target.style.borderColor = '#E5E7EB'}
        >
          {PAGE_SIZE_OPTIONS.map(n => (
            <option key={n} value={n}>{n} por página</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['PRODUCTO', 'PRECIO', 'TALLAS DISPONIBLES', 'ESTADO', 'ACCIONES'].map(h => (
                      <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {productos.map(p => (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                            {p.imagenUrl
                              ? <img src={p.imagenUrl} alt={p.nombre} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">👟</div>
                            }
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{p.nombre}</p>
                            <p className="text-xs text-gray-400">SKU: QS-{p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-gray-800">{COP(p.precioBase)}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {[...(p.tallasDisponibles ?? [])].sort((a, b) => a - b).slice(0, 6).map(t => (
                            <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">{t}</span>
                          ))}
                          {(p.tallasDisponibles?.length ?? 0) > 6 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-xs rounded-md">+{p.tallasDisponibles.length - 6}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3.5"><Badge estado={p.activo ? 'Activo' : 'Inactivo'} /></td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-gray-700 transition-colors" title="Editar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => toggleEstado(p)}
                            className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
                            style={{ backgroundColor: p.activo ? '#C0392B' : '#D1D5DB' }}
                            title={p.activo ? 'Desactivar' : 'Activar'}
                          >
                            <span
                              className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform"
                              style={{ transform: p.activo ? 'translateX(22px)' : 'translateX(2px)' }}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {productos.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No hay productos</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {productos.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-gray-400">No hay productos</p>
              ) : productos.map(p => (
                <div key={p.id} className="p-4 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    {p.imagenUrl
                      ? <img src={p.imagenUrl} alt={p.nombre} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">👟</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{p.nombre}</p>
                    <p className="text-sm font-bold mt-0.5" style={{ color: '#C0392B' }}>{COP(p.precioBase)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.tallasDisponibles?.length ?? 0} tallas</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <Badge estado={p.activo ? 'Activo' : 'Inactivo'} />
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="px-2.5 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Editar</button>
                      <button
                        onClick={() => toggleEstado(p)}
                        className="relative w-9 h-5 rounded-full transition-colors flex-shrink-0"
                        style={{ backgroundColor: p.activo ? '#C0392B' : '#D1D5DB' }}
                        title={p.activo ? 'Desactivar' : 'Activar'}
                      >
                        <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform" style={{ transform: p.activo ? 'translateX(18px)' : 'translateX(2px)' }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                {totalElements === 0
                  ? 'Sin resultados'
                  : `Mostrando ${rangoDesde}–${rangoHasta} de ${totalElements} productos`
                }
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Anterior
                </button>
                <span className="px-3 py-1.5 text-xs text-gray-500">
                  {page + 1} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <ProductoModal
        open={modalOpen}
        onClose={closeModal}
        editing={editing}
        modelos={modelos}
        onSaved={onSaved}
      />
    </div>
  )
}
