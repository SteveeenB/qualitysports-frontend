import api from './client'

// ── Rutas públicas ────────────────────────────────────────────────────────────
export const listarProductos  = (page = 0, size = 20) => api.get('/api/productos',        { params: { page, size } })
export const buscarProductos  = (q)                   => api.get('/api/productos/search',  { params: { q } })
export const obtenerProducto  = (id)                  => api.get(`/api/productos/${id}`)
export const listarCategorias = ()                    => api.get('/api/categorias')

// ── Rutas admin ───────────────────────────────────────────────────────────────
export const listarProductosAdmin  = (page = 0, size = 20) => api.get('/api/admin/productos',               { params: { page, size } })
export const crearProducto         = (data)                 => api.post('/api/admin/productos',               data)
export const actualizarProducto    = (id, data)             => api.put(`/api/admin/productos/${id}`,         data)
export const cambiarEstadoProducto = (id, activo)           => api.patch(`/api/admin/productos/${id}/estado`, { activo })
export const subirImagenProducto   = (id, file)             => {
  const form = new FormData()
  form.append('file', file)
  return api.post(`/api/admin/productos/${id}/imagen`, form)
}
