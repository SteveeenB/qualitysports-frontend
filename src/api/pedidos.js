import api from './client'

// ── Público (sin token) ───────────────────────────────────────────────────────
export const crearPedido = (data) => api.post('/api/pedidos', data)

// ── Cliente autenticado ───────────────────────────────────────────────────────
export const misPedidos = ()   => api.get('/api/pedidos/mis-pedidos')
export const miPedido   = (id) => api.get(`/api/pedidos/${id}`)

// ── Asesor ────────────────────────────────────────────────────────────────────
export const pedidosAsesor       = ()        => api.get('/api/asesor/pedidos')
export const pedidoAsesor        = (id)      => api.get(`/api/asesor/pedidos/${id}`)
export const avanzarEstadoAsesor = (id, obs) => api.patch(`/api/asesor/pedidos/${id}/estado`, { observaciones: obs })

// ── Admin ─────────────────────────────────────────────────────────────────────
export const todosPedidos       = ()             => api.get('/api/admin/pedidos')
export const cualquierPedido    = (id)           => api.get(`/api/admin/pedidos/${id}`)
export const avanzarEstadoAdmin = (id, obs)      => api.patch(`/api/admin/pedidos/${id}/estado`, { observaciones: obs })
export const reasignarAsesor    = (id, asesorId) => api.patch(`/api/admin/pedidos/${id}/asesor`, { asesorId })
