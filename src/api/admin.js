import api from './client'

export const listarClientes      = ()         => api.get('/api/admin/clientes')
export const historialCliente    = (id)       => api.get(`/api/admin/clientes/${id}/historial`)
export const listarAsesores      = ()         => api.get('/api/admin/asesores')
export const obtenerKpis         = ()         => api.get('/api/admin/kpis')

export const listarDescuentos    = ()         => api.get('/api/admin/descuentos')
export const crearDescuento      = (data)     => api.post('/api/admin/descuentos',      data)
export const actualizarDescuento = (id, data) => api.put(`/api/admin/descuentos/${id}`, data)
export const eliminarDescuento   = (id)       => api.delete(`/api/admin/descuentos/${id}`)
